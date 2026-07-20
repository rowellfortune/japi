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
const GATE_RE = /\bgate\s*#?\s*([A-Za-z]?\d{1,3})\b/i;
const TAG_RE = /\btag\s*#?\s*([A-Za-z0-9-]{3,20})\b/i;
const BAGGAGE_KEYWORDS_RE = /\b(bag|bags|baggage|luggage|suitcase)\b/i;
const LIST_INTENT_RE = /\b(all|list|every|entire)\b/i;
const MAX_LIST_ITEMS = 30;

export class ChatGPTService {
  // Detect which of the three entities (flight, gate, baggage) the message refers to,
  // then follow their relationships (flight<->gate, baggage->flight->gate) so the model
  // gets the full picture instead of just the entity that was literally mentioned.
  // Also records lookup misses explicitly, so the model states "not found" instead of
  // inventing an answer when a mentioned identifier doesn't resolve to anything.
  async getContext(message: string): Promise<string> {
    const sections: string[] = [];
    const notes: string[] = [];

    const tagMatch = message.match(TAG_RE);
    const gateMatch = message.match(GATE_RE);
    const exclude = new Set(
      [tagMatch?.[1], gateMatch?.[1]].filter((v): v is string => !!v).map((v) => v.toUpperCase())
    );

    const flightCandidates = (message.match(FLIGHT_TOKEN_RE) ?? [])
      .map((t) => t.toUpperCase())
      .filter((t) => /[A-Z]/.test(t) && /\d/.test(t) && !exclude.has(t));

    let flight = null;
    for (const candidate of flightCandidates) {
      flight = await flightService.getByFlightNumber(candidate);
      if (flight) break;
    }
    if (flight) {
      // Populates gateId, so this also answers "what gate is my flight at".
      sections.push(`Flight Data: ${JSON.stringify(flight)}`);
    } else if (flightCandidates.length) {
      notes.push(`No flight found matching "${flightCandidates[0]}".`);
    } else if (LIST_INTENT_RE.test(message) && /\bflights?\b/i.test(message)) {
      // No specific flight number mentioned, but the passenger wants the whole list
      // (e.g. "list all flights") — public schedule info, safe to enumerate.
      const flights = await flightService.list({});
      const summary = flights.slice(0, MAX_LIST_ITEMS).map((f) => ({
        flightNumber: f.flightNumber,
        airline: f.airline,
        destination: f.destination,
        departureTime: f.departureTime,
        status: f.status,
        gate: (f.gateId as any)?.gateNumber ?? null,
      }));
      sections.push(
        `All Flights (${flights.length} total${flights.length > MAX_LIST_ITEMS ? `, showing first ${MAX_LIST_ITEMS}` : ''}): ${JSON.stringify(summary)}`
      );
    }

    if (tagMatch?.[1]) {
      const baggage = await baggageService.getByTagId(tagMatch[1].toUpperCase());
      if (baggage) {
        sections.push(`Baggage Data: ${JSON.stringify(baggage)}`);
        if (!flight) {
          const relatedFlight = await flightService.getByFlightNumber(baggage.flightNumber);
          if (relatedFlight) sections.push(`Flight Data: ${JSON.stringify(relatedFlight)}`);
        }
      } else {
        notes.push(`No baggage found for tag "${tagMatch[1]}".`);
      }
    } else if (BAGGAGE_KEYWORDS_RE.test(message) && flight) {
      const baggage = await baggageService.getByFlightNumber(flight.flightNumber);
      if (baggage.length) {
        sections.push(`Baggage Data (flight ${flight.flightNumber}): ${JSON.stringify(baggage)}`);
      }
    } else if (BAGGAGE_KEYWORDS_RE.test(message) && LIST_INTENT_RE.test(message)) {
      // Unlike flights/gates, baggage records carry passenger names/emails — don't dump
      // every passenger's bag data for an unauthenticated "list all baggage" request.
      notes.push(
        `The passenger asked to list all baggage — this isn't available for privacy reasons. Ask for their tag ID or flight number instead.`
      );
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

    return sections.join('\n\n');
  }

  // Call ChatGPT with context and get response
  async chat(message: string, conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []): Promise<string> {
    try {
      const context = await this.getContext(message);

      const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT + '\n\nCurrent Data:\n' + context },
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

      return assistantMessage;
    } catch (error) {
      logger.error('ChatGPT error:', error);
      throw error;
    }
  }
}

export const chatGPTService = new ChatGPTService();
