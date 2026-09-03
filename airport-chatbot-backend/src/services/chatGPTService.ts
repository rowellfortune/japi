import { openai, SYSTEM_PROMPT } from '../config/openai';
import { flightService } from './flightService';
import { gateService } from './gateService';
import { baggageService } from './baggageService';
import { logger } from '../utils/logger';

// Flight numbers aren't restricted to the classic "2-3 letters + digits" IATA shape in this
// system (admin can create e.g. "PBM-FL234-001"), so we can't rely on one fixed pattern.
// Instead, pull out any word-like token that mixes letters and digits and try each against
// the database directly, rather than guessing a format up front.
const FLIGHT_TOKEN_RE = /[A-Za-z0-9-]{4,}/g;
// Passengers commonly type the IATA-style airline code and number with a space ("CM 319",
// "DL 7844") even though it's stored as one token ("CM319") — FLIGHT_TOKEN_RE alone misses that
// because a space breaks it into "CM" (too short/no digit) and "319" (no letter), so neither
// passes the mixed letter+digit filter below. Catch that shape separately and re-join it.
const SPACED_FLIGHT_RE = /\b([A-Za-z]{2,3})[ ](\d{1,4}[A-Za-z]?)\b/g;
const GATE_RE = /\bgate\s*#?\s*([A-Za-z]?\d{1,3})\b/i;
const TAG_RE = /\btag\s*#?\s*([A-Za-z0-9-]{3,20})\b/i;
const BAGGAGE_KEYWORDS_RE = /\b(bag|bags|baggage|luggage|suitcase)\b/i;
const LIST_INTENT_RE = /\b(all|list|every|entire)\b/i;
const DEPARTURES_RE = /\bdepart(?:ing|ures?)?\b/i;
const ARRIVALS_RE = /\barriv(?:ing|als?)?\b/i;
const MAX_LIST_ITEMS = 30;
const HOME_AIRPORT = 'PBM';

// The shape handed to the frontend for a "list all flights" request, so it can render a visual
// card list instead of relying on the model to format a table (see SYSTEM_PROMPT).
export interface ChatFlightSummary {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  status: string;
  gate: string | null;
  terminal: string | null;
}

// The shape handed to the frontend when the passenger asked about one specific flight (by
// number, or via their gate/baggage), so it can render a rich single-flight card instead of
// relying on the model's plain-text summary of it.
export interface ChatFlightDetail {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  scheduledDepartureTime: Date | null;
  scheduledArrivalTime: Date | null;
  status: string;
  gate: string | null;
  terminal: string | null;
  updatedAt: Date;
}

interface ChatContext {
  text: string;
  flights?: ChatFlightSummary[];
  flight?: ChatFlightDetail;
}

export class ChatGPTService {
  // Detect which of the three entities (flight, gate, baggage) the message refers to,
  // then follow their relationships (flight<->gate, baggage->flight->gate) so the model
  // gets the full picture instead of just the entity that was literally mentioned.
  // Also records lookup misses explicitly, so the model states "not found" instead of
  // inventing an answer when a mentioned identifier doesn't resolve to anything.
  async getContext(message: string): Promise<ChatContext> {
    const sections: string[] = [
      `Today's date: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Paramaribo',
      })} (America/Paramaribo time).`,
    ];
    const notes: string[] = [];

    const tagMatch = message.match(TAG_RE);
    const gateMatch = message.match(GATE_RE);
    const exclude = new Set(
      [gateMatch?.[1]].filter((v): v is string => !!v).map((v) => v.toUpperCase())
    );

    // A mentioned identifier (letters+digits, e.g. "KL713" or "PBM-BG1002") could be EITHER a
    // flight number OR a baggage tag — the system allows free-form ids for both, and passengers
    // rarely label which is which ("my bag PBM-BG1002", or just "PBM-BG1002"). So we collect all
    // id-like tokens and try each as a flight first, then as a baggage tag, instead of assuming
    // any id is only ever a flight (which made every "bag <id>" / bare-id lookup fail).
    const spacedCandidates = Array.from(message.matchAll(SPACED_FLIGHT_RE), (m) => `${m[1]}${m[2]}`.toUpperCase()).filter(
      (t) => !exclude.has(t)
    );
    const contiguousCandidates = (message.match(FLIGHT_TOKEN_RE) ?? [])
      .map((t) => t.toUpperCase())
      .filter((t) => /[A-Z]/.test(t) && /\d/.test(t) && !exclude.has(t));
    // Spaced-format matches first — they're the more deliberate signal ("CM 319" is unambiguously
    // meant as one flight number) — followed by contiguous tokens, deduped since the same flight
    // can otherwise show up from both (e.g. a message that also has "CM319" elsewhere).
    const idCandidates = Array.from(new Set([...spacedCandidates, ...contiguousCandidates]));

    // An explicit "tag <id>" is the strongest baggage signal, so search it first for baggage.
    const explicitTag = tagMatch?.[1]?.toUpperCase();
    const tagSearchOrder = [explicitTag, ...idCandidates].filter((v): v is string => !!v);

    // Resolve a flight from the candidates.
    let flight = null;
    let matchedFlightId: string | null = null;
    for (const candidate of idCandidates) {
      const f = await flightService.getByFlightNumber(candidate);
      if (f) {
        flight = f;
        matchedFlightId = candidate;
        break;
      }
    }

    // Resolve a baggage item: explicit tag first, then any candidate that isn't the flight we
    // just matched (so "flight KL713" isn't also probed as a tag needlessly).
    let baggage = null;
    for (const candidate of tagSearchOrder) {
      if (candidate === matchedFlightId) continue;
      const b = await baggageService.getByTagId(candidate);
      if (b) {
        baggage = b;
        break;
      }
    }

    let flightDetail: ChatFlightDetail | undefined;
    if (flight) {
      // Populates gateId, so this also answers "what gate is my flight at".
      sections.push(`Flight Data: ${JSON.stringify(flight)}`);

      const gate =
        flight.gateId && typeof flight.gateId === 'object' && 'gateNumber' in flight.gateId
          ? (flight.gateId as unknown as { gateNumber: string; terminal: string })
          : null;
      flightDetail = {
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        scheduledDepartureTime: flight.scheduledDepartureTime,
        scheduledArrivalTime: flight.scheduledArrivalTime,
        status: flight.status,
        gate: gate?.gateNumber ?? null,
        terminal: gate?.terminal ?? null,
        updatedAt: flight.updatedAt,
      };
    }

    if (baggage) {
      sections.push(`Baggage Data: ${JSON.stringify(baggage)}`);
      // Follow baggage -> flight so we can also answer "which gate for my bag". Only fetch if we
      // don't already have that same flight in context.
      if (!flight || flight.flightNumber.toUpperCase() !== String(baggage.flightNumber).toUpperCase()) {
        const relatedFlight = await flightService.getByFlightNumber(baggage.flightNumber);
        if (relatedFlight) {
          sections.push(`Flight Data (bag's flight): ${JSON.stringify(relatedFlight)}`);
          if (!flight) flight = relatedFlight;
        }
      }
    } else if (BAGGAGE_KEYWORDS_RE.test(message) && flight) {
      // "where's the baggage on flight X" — list bags for that flight.
      const bags = await baggageService.getByFlightNumber(flight.flightNumber);
      if (bags.length) {
        sections.push(`Baggage Data (flight ${flight.flightNumber}): ${JSON.stringify(bags)}`);
      }
    } else if (BAGGAGE_KEYWORDS_RE.test(message) && LIST_INTENT_RE.test(message)) {
      // Unlike flights/gates, baggage records carry passenger names/emails — don't dump
      // every passenger's bag data for an unauthenticated "list all baggage" request.
      notes.push(
        `The passenger asked to list all baggage — this isn't available for privacy reasons. Ask for their tag ID or flight number instead.`
      );
    }

    // A flight-listing request — either explicit ("list all flights") or direction-specific
    // ("departures today", "arrivals"). Direction isn't a stored field: a departure is a flight
    // whose origin is this airport, an arrival is one whose destination is. When the passenger
    // says which they want, filter to it; otherwise return everything and let the model (per
    // SYSTEM_PROMPT) ask which they meant rather than guess.
    const wantsDepartures = DEPARTURES_RE.test(message);
    const wantsArrivals = ARRIVALS_RE.test(message);
    const mentionsFlights = /\bflights?\b/i.test(message);
    const isListRequest = (LIST_INTENT_RE.test(message) && mentionsFlights) || wantsDepartures || wantsArrivals;

    let listedFlights: ChatFlightSummary[] | undefined;
    if (!flight && !baggage && !idCandidates.length && isListRequest) {
      const allFlights = await flightService.list({});
      const direction = wantsDepartures && !wantsArrivals ? 'departures' : wantsArrivals && !wantsDepartures ? 'arrivals' : null;
      const filtered =
        direction === 'departures'
          ? allFlights.filter((f) => f.origin === HOME_AIRPORT)
          : direction === 'arrivals'
          ? allFlights.filter((f) => f.destination === HOME_AIRPORT)
          : allFlights;

      const summary: ChatFlightSummary[] = filtered.slice(0, MAX_LIST_ITEMS).map((f) => ({
        flightNumber: f.flightNumber,
        airline: f.airline,
        origin: f.origin,
        destination: f.destination,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        status: f.status,
        gate: (f.gateId as any)?.gateNumber ?? null,
        terminal: (f.gateId as any)?.terminal ?? null,
      }));
      listedFlights = summary;
      const label = direction === 'departures' ? `Departures from ${HOME_AIRPORT}` : direction === 'arrivals' ? `Arrivals into ${HOME_AIRPORT}` : 'All Flights';
      sections.push(
        `${label} (${filtered.length} total${filtered.length > MAX_LIST_ITEMS ? `, showing first ${MAX_LIST_ITEMS}` : ''}): ${JSON.stringify(summary)}`
      );
    }

    // One "not found" note when the passenger clearly named an id that resolved to nothing.
    if (!flight && !baggage) {
      if (explicitTag) {
        notes.push(`No baggage found for tag "${tagMatch?.[1]}".`);
      } else if (idCandidates.length) {
        notes.push(`No flight or baggage found matching "${idCandidates[0]}".`);
      }
    }

    if (gateMatch?.[1]) {
      // Populates currentFlightId, so this also answers "what flight is at gate A3".
      const gate = await gateService.getByGateNumber(gateMatch[1].toUpperCase());
      if (gate) {
        sections.push(`Gate Data: ${JSON.stringify(gate)}`);
      } else {
        notes.push(`No gate found matching "${gateMatch[1]}".`);
      }
    } else if (LIST_INTENT_RE.test(message) && /\bgates?\b/i.test(message)) {
      const gates = await gateService.list();
      const summary = gates.slice(0, MAX_LIST_ITEMS).map((g) => ({
        gateNumber: g.gateNumber,
        terminal: g.terminal,
        status: g.status,
        currentFlight: (g.currentFlightId as any)?.flightNumber ?? null,
      }));
      sections.push(
        `All Gates (${gates.length} total${gates.length > MAX_LIST_ITEMS ? `, showing first ${MAX_LIST_ITEMS}` : ''}): ${JSON.stringify(summary)}`
      );
    }

    if (notes.length) {
      sections.push(`Lookup Notes (these were searched for and NOT found — tell the passenger so, do not invent details):\n${notes.join('\n')}`);
    }

    return { text: sections.join('\n\n'), flights: listedFlights, flight: flightDetail };
  }

  // Call ChatGPT with context and get response. When the passenger asked to list all flights,
  // also hands back the raw flights so the frontend can render them as cards (see SYSTEM_PROMPT
  // — the model is told not to enumerate them itself, to avoid a duplicate listing). Likewise,
  // when they asked about one specific flight, hand back its detail so the frontend can render a
  // single-flight card instead of relying on the model's plain-text summary of it.
  async chat(
    message: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<{ content: string; flights?: ChatFlightSummary[]; flight?: ChatFlightDetail }> {
    try {
      const { text, flights, flight } = await this.getContext(message);

      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT + '\n\nCurrent Data:\n' + text },
        ...conversationHistory,
        { role: 'user' as const, content: message },
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage = response.choices[0].message.content;
      if (!assistantMessage) throw new Error('No response from OpenAI');

      return { content: assistantMessage, flights, flight };
    } catch (error) {
      logger.error('ChatGPT error:', error);
      throw error;
    }
  }
}

export const chatGPTService = new ChatGPTService();
