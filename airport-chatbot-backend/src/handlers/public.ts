import { db } from '../lib/db';
import { handler, json, queryParam, type ApiEvent } from '../lib/http';
import { flightService } from '../services/flightService';
import { gateService } from '../services/gateService';

// This airport's IATA code — classifies a flight as an arrival (destination === here) or
// departure (origin === here) for the public board. Same constant as publicController.
const HOME_AIRPORT = 'PBM';

// Public flight board: same info as the physical departure/arrival boards, no PII, no auth.
export const listFlights = handler(async (event: ApiEvent) => {
  await db();
  const direction = queryParam(event, 'direction')?.toLowerCase();
  const limit = Math.min(parseInt(queryParam(event, 'limit') || '20', 10) || 20, 50);

  const flights = await flightService.list({});

  const filtered = flights.filter((f) => {
    if (direction === 'arrivals') return f.destination === HOME_AIRPORT;
    if (direction === 'departures') return f.origin === HOME_AIRPORT;
    return true;
  });

  const board = filtered.slice(0, limit).map((f) => ({
    flightNumber: f.flightNumber,
    airline: f.airline,
    origin: f.origin,
    destination: f.destination,
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    status: f.status,
    aircraft: f.aircraft,
    gateNumber:
      f.gateId && typeof f.gateId === 'object' && 'gateNumber' in f.gateId
        ? (f.gateId as unknown as { gateNumber: string }).gateNumber
        : null,
  }));

  return json(200, { flights: board, total: filtered.length });
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
