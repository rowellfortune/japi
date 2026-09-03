import { db } from '../lib/db';
import { handler, json, queryParam, pathParam, type ApiEvent } from '../lib/http';
import { flightService } from '../services/flightService';
import { gateService } from '../services/gateService';
import { Airport } from '../models/Airport';
import { HOME_AIRPORTS } from '../config/fr24';

// Classifies a flight as an arrival (destination is a Suriname airport) or departure (origin is
// a Suriname airport) for the public board. Same constant as publicController.
const isHomeAirport = (iata: string) => (HOME_AIRPORTS as readonly string[]).includes(iata);

// True when `iso` falls on the same calendar day (UTC) as `dateStr` (YYYY-MM-DD). Mirrors
// publicController.isOnDate.
const isOnDate = (iso: Date | string | null | undefined, dateStr: string): boolean =>
  !!iso && new Date(iso).toISOString().slice(0, 10) === dateStr;

// Mirrors publicController.resolveAirportNames.
async function resolveAirportNames(iatas: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(iatas));
  const airports = await Airport.find({ iata: { $in: unique } });
  return Object.fromEntries(airports.map((a) => [a.iata, a.name]));
}

// Public flight board: same info as the physical departure/arrival boards, no PII, no auth.
export const listFlights = handler(async (event: ApiEvent) => {
  await db();
  const direction = queryParam(event, 'direction')?.toLowerCase();
  const date = queryParam(event, 'date');
  const limit = Math.min(parseInt(queryParam(event, 'limit') || '20', 10) || 20, 50);

  const flights = await flightService.list({});

  const filtered = flights.filter((f) => {
    if (direction === 'arrivals' && !isHomeAirport(f.destination)) return false;
    if (direction === 'departures' && !isHomeAirport(f.origin)) return false;
    if (date) {
      const relevantTime = direction === 'arrivals' ? f.arrivalTime : f.departureTime;
      if (!isOnDate(relevantTime, date)) return false;
    }
    return true;
  });

  const board = filtered.slice(0, limit).map((f) => ({
    flightNumber: f.flightNumber,
    airline: f.airline,
    origin: f.origin,
    destination: f.destination,
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    scheduledDepartureTime: f.scheduledDepartureTime,
    scheduledArrivalTime: f.scheduledArrivalTime,
    status: f.status,
    aircraft: f.aircraft,
    gateNumber:
      f.gateId && typeof f.gateId === 'object' && 'gateNumber' in f.gateId
        ? (f.gateId as unknown as { gateNumber: string }).gateNumber
        : null,
  }));

  return json(200, { flights: board, total: filtered.length });
});

// Mirrors publicController.getPublicFlight.
export const getFlight = handler(async (event: ApiEvent) => {
  await db();
  const flightNumber = pathParam(event, 'flightNumber');
  const flight = await flightService.getByFlightNumber(flightNumber);
  if (!flight) return json(404, { error: 'Flight not found' });

  const gate =
    flight.gateId && typeof flight.gateId === 'object' && 'gateNumber' in flight.gateId
      ? (flight.gateId as unknown as { gateNumber: string; terminal: string })
      : null;

  const airportNames = await resolveAirportNames([flight.origin, flight.destination]);

  return json(200, {
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    origin: flight.origin,
    originName: airportNames[flight.origin] ?? null,
    destination: flight.destination,
    destinationName: airportNames[flight.destination] ?? null,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    scheduledDepartureTime: flight.scheduledDepartureTime,
    scheduledArrivalTime: flight.scheduledArrivalTime,
    status: flight.status,
    aircraft: flight.aircraft,
    gateNumber: gate?.gateNumber ?? null,
    terminal: gate?.terminal ?? null,
    fr24: flight.fr24 ?? null,
    updatedAt: flight.updatedAt,
  });
});

// Gate occupancy board — status + which flight number holds it, no internal ids.
export const listGates = handler(async () => {
  await db();
  const gates = await gateService.list();

  const board = gates.map((g) => ({
    gateNumber: g.gateNumber,
    terminal: g.terminal,
    status: g.status,
    currentFlightNumber:
      g.currentFlightId && typeof g.currentFlightId === 'object' && 'flightNumber' in g.currentFlightId
        ? (g.currentFlightId as unknown as { flightNumber: string }).flightNumber
        : null,
  }));

  return json(200, { gates: board });
});
