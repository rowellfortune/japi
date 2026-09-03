/// <reference path="../types/fr24sdk.d.ts" />
import type { Fr24FlightSummary } from '@flightradar24/fr24sdk';
import { getFr24Client, HOME_AIRPORTS } from '../config/fr24';
import { logger } from '../utils/logger';

// Raw FR24 enrichment data carried alongside the normalized board fields, straight from the
// flight-summary/full response — see models/Flight.ts (IFlightFr24Data), which this maps onto.
export interface LiveBoardFr24Data {
  fr24Id: string;
  callsign: string | null;
  registration: string | null;
  destIcaoActual: string | null;
  destIataActual: string | null;
  runwayTakeoff: string | null;
  runwayLanded: string | null;
  flightTimeSeconds: number | null;
  actualDistanceKm: number | null;
  circleDistanceKm: number | null;
  category: string | null;
  hex: string | null;
  firstSeen: Date | null;
  lastSeen: Date | null;
  flightEnded: boolean;
  liveLatitude: number | null;
  liveLongitude: number | null;
  liveAltitudeFt: number | null;
  liveGroundSpeedKts: number | null;
  liveVerticalSpeedFpm: number | null;
  liveTrackDeg: number | null;
  liveEta: Date | null;
  livePositionUpdatedAt: Date | null;
}

export interface LiveBoardFlight {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  status: 'Departed' | 'Arrived';
  aircraft: string;
  fr24: LiveBoardFr24Data;
}

// FR24's airport lookup (name/iata/icao) resolved for one end of a route. Handed back from
// fetchLiveBoard so the caller (jobs/fr24Sync.ts) can persist it — this service only fetches
// and normalizes, it doesn't touch the database itself.
export interface ResolvedAirport {
  iata: string;
  icao: string;
  name: string;
}

export interface LiveBoardResult {
  board: LiveBoardFlight[];
  airports: ResolvedAirport[];
}

const SYNC_WINDOW_HOURS = 12;
// Fallback when a flight is still airborne and no other flight on the same route landed within
// this batch to average a block time from (e.g. the only movement on a thin interior route).
const DEFAULT_BLOCK_TIME_MS = 3 * 60 * 60 * 1000;

// In-memory, per-container caches for ICAO->airport and ICAO->airline-name lookups. The same
// handful of airport/airline codes repeat every sync cycle, so caching avoids re-hitting FR24's
// static endpoints (and their separate rate limit) on every run.
const airportInfoCache = new Map<string, ResolvedAirport | null>();
const airlineNameCache = new Map<string, string>();

async function resolveAirport(icao: string | null | undefined): Promise<ResolvedAirport | null> {
  if (!icao) return null;
  if (airportInfoCache.has(icao)) return airportInfoCache.get(icao)!;
  try {
    const info = await getFr24Client().airports.getLight(icao);
    if (!info.iata) {
      airportInfoCache.set(icao, null); // unresolvable to an IATA code — caller skips the flight
      return null;
    }
    const resolved: ResolvedAirport = { iata: info.iata, icao, name: info.name };
    airportInfoCache.set(icao, resolved);
    return resolved;
  } catch (err) {
    // A transient FR24 failure here (rate limit, timeout) silently drops every flight touching
    // this airport from the board with no other signal — log it so that's diagnosable instead of
    // looking identical to "no flights right now".
    logger.error(`FR24 airport lookup failed for ${icao}:`, err instanceof Error ? err.message : err);
    airportInfoCache.set(icao, null);
    return null;
  }
}

async function resolveAirlineName(icao: string | null | undefined): Promise<string> {
  if (!icao) return 'Unknown';
  if (airlineNameCache.has(icao)) return airlineNameCache.get(icao)!;
  try {
    const info = await getFr24Client().airlines.getLight(icao);
    airlineNameCache.set(icao, info.name);
    return info.name;
  } catch (err) {
    logger.error(`FR24 airline lookup failed for ${icao}:`, err instanceof Error ? err.message : err);
    return icao; // fall back to the raw ICAO code rather than dropping the flight
  }
}

type CompletedSummary = Fr24FlightSummary & { flight: string; datetime_takeoff: string; datetime_landed: string };
type WithFlightNumber = Fr24FlightSummary & { flight: string; datetime_takeoff: string };

// Real-time ADS-B telemetry for whatever's currently airborne to/from our airports, keyed by
// flight number — merged onto matching board entries below. Best-effort: an aircraft that has
// already landed (or isn't transmitting) just won't have an entry, which is expected, not an
// error, so a lookup miss is silently skipped rather than logged.
type LivePositionFields = Pick<
  LiveBoardFr24Data,
  'liveLatitude' | 'liveLongitude' | 'liveAltitudeFt' | 'liveGroundSpeedKts' | 'liveVerticalSpeedFpm' | 'liveTrackDeg' | 'liveEta' | 'livePositionUpdatedAt'
>;

async function fetchLivePositionsByFlightNumber(): Promise<Map<string, LivePositionFields>> {
  const positions = new Map<string, LivePositionFields>();
  try {
    const live = await getFr24Client().live.getFull({ airports: HOME_AIRPORTS.join(',') });
    for (const p of live) {
      if (!p.flight) continue;
      positions.set(p.flight.toUpperCase(), mapLivePosition(p));
    }
  } catch (err) {
    // Supplementary data — a failure here shouldn't take down the whole sync, just leave every
    // flight without a live position this cycle (they'll get one on the next successful poll).
    logger.error('FR24 live position lookup failed:', err instanceof Error ? err.message : err);
  }
  return positions;
}

function mapLivePosition(p: { lat: number; lon: number; alt: number; gspeed: number; vspeed: number; track: number; eta?: string | null; timestamp: string }): LivePositionFields {
  return {
    liveLatitude: p.lat,
    liveLongitude: p.lon,
    liveAltitudeFt: p.alt,
    liveGroundSpeedKts: p.gspeed,
    liveVerticalSpeedFpm: p.vspeed,
    liveTrackDeg: p.track,
    liveEta: p.eta ? new Date(p.eta) : null,
    livePositionUpdatedAt: new Date(p.timestamp),
  };
}

// Fetches every actual takeoff/landing FR24 has recorded for PBM or ORG in the last
// SYNC_WINDOW_HOURS and normalizes it into board-ready flight records. Meant to be re-run on an
// interval (see src/jobs/fr24Sync.ts) so the result reflects whatever FR24 has logged as of now.
// FR24 rejects the millisecond/`Z` suffix `Date#toISOString()` produces — it wants a bare
// 'YYYY-MM-DDTHH:MM:SS' (UTC, no offset marker).
function toFr24DateTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '');
}

export async function fetchLiveBoard(): Promise<LiveBoardResult> {
  const client = getFr24Client();
  const now = new Date();
  const from = new Date(now.getTime() - SYNC_WINDOW_HOURS * 60 * 60 * 1000);

  const { data } = await client.flightSummary.getFull({
    airports: HOME_AIRPORTS.join(','),
    flight_datetime_from: toFr24DateTime(from),
    flight_datetime_to: toFr24DateTime(now),
    limit: 200,
  });

  // Anonymous/unidentified traffic (no flight number, e.g. some GA or military movements) can't
  // be placed on a numbered flight board.
  const withNumbers = data.filter((f): f is WithFlightNumber => Boolean(f.flight && f.datetime_takeoff));

  // One shared lookup for the whole batch — only flights genuinely still airborne right now will
  // have an entry.
  const livePositions = await fetchLivePositionsByFlightNumber();

  // Same-route average block time within this batch, used to estimate arrival for flights
  // still airborne (FR24 hasn't published a landing time for them yet).
  const blockTimesByRoute = new Map<string, number[]>();
  for (const f of withNumbers) {
    if (!f.datetime_landed) continue;
    const completed = f as CompletedSummary;
    const routeKey = `${completed.orig_icao}-${completed.dest_icao}`;
    const ms = new Date(completed.datetime_landed).getTime() - new Date(completed.datetime_takeoff).getTime();
    if (!blockTimesByRoute.has(routeKey)) blockTimesByRoute.set(routeKey, []);
    blockTimesByRoute.get(routeKey)!.push(ms);
  }

  const board: LiveBoardFlight[] = [];
  const touchedAirports = new Map<string, ResolvedAirport>();

  for (const f of withNumbers) {
    const [origin, destination] = await Promise.all([
      resolveAirport(f.orig_icao),
      resolveAirport(f.dest_icao),
    ]);
    // Can't place it on the board without both ends resolved to an IATA code.
    if (!origin || !destination) continue;
    touchedAirports.set(origin.iata, origin);
    touchedAirports.set(destination.iata, destination);

    const airline = await resolveAirlineName(f.operating_as ?? f.painted_as);
    const departureTime = new Date(f.datetime_takeoff);

    let arrivalTime: Date;
    let status: LiveBoardFlight['status'];
    if (f.datetime_landed) {
      arrivalTime = new Date(f.datetime_landed);
      status = 'Arrived';
    } else {
      const routeKey = `${f.orig_icao}-${f.dest_icao}`;
      const samples = blockTimesByRoute.get(routeKey);
      const avgBlockMs = samples?.length ? samples.reduce((a, b) => a + b, 0) / samples.length : DEFAULT_BLOCK_TIME_MS;
      arrivalTime = new Date(departureTime.getTime() + avgBlockMs);
      status = 'Departed';
    }

    const livePosition = livePositions.get(f.flight.toUpperCase());

    board.push({
      flightNumber: f.flight.toUpperCase(),
      airline,
      origin: origin.iata,
      destination: destination.iata,
      departureTime,
      arrivalTime,
      status,
      aircraft: f.type || 'Unknown',
      fr24: {
        fr24Id: f.fr24_id,
        callsign: f.callsign ?? null,
        registration: f.reg ?? null,
        destIcaoActual: f.dest_icao_actual ?? null,
        destIataActual: f.dest_iata_actual ?? null,
        runwayTakeoff: f.runway_takeoff ?? null,
        runwayLanded: f.runway_landed ?? null,
        flightTimeSeconds: f.flight_time ?? null,
        actualDistanceKm: f.actual_distance ?? null,
        circleDistanceKm: f.circle_distance ?? null,
        category: f.category ?? null,
        hex: f.hex ?? null,
        firstSeen: f.first_seen ? new Date(f.first_seen) : null,
        lastSeen: f.last_seen ? new Date(f.last_seen) : null,
        flightEnded: f.flight_ended,
        liveLatitude: livePosition?.liveLatitude ?? null,
        liveLongitude: livePosition?.liveLongitude ?? null,
        liveAltitudeFt: livePosition?.liveAltitudeFt ?? null,
        liveGroundSpeedKts: livePosition?.liveGroundSpeedKts ?? null,
        liveVerticalSpeedFpm: livePosition?.liveVerticalSpeedFpm ?? null,
        liveTrackDeg: livePosition?.liveTrackDeg ?? null,
        liveEta: livePosition?.liveEta ?? null,
        livePositionUpdatedAt: livePosition?.livePositionUpdatedAt ?? null,
      },
    });
  }

  return { board, airports: Array.from(touchedAirports.values()) };
}
