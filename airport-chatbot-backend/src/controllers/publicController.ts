import { Request, Response } from 'express';
import { flightService } from '../services/flightService';
import { gateService } from '../services/gateService';
import { Airport } from '../models/Airport';
import { logger } from '../utils/logger';
import { HOME_AIRPORTS } from '../config/fr24';

// Used to classify a flight as an arrival (destination is a Suriname airport) or departure
// (origin is a Suriname airport) for the public flight board.
const isHomeAirport = (iata: string) => (HOME_AIRPORTS as readonly string[]).includes(iata);

// True when `iso` falls on the same calendar day (UTC) as `dateStr` (YYYY-MM-DD).
const isOnDate = (iso: Date | string | null | undefined, dateStr: string): boolean =>
  !!iso && new Date(iso).toISOString().slice(0, 10) === dateStr;

// Looks up the full airport name(s) FR24 has resolved for us so far (see models/Airport.ts).
// Best-effort — an airport we haven't synced a flight through yet just won't have a name, and
// the caller falls back to showing the IATA code alone.
async function resolveAirportNames(iatas: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(iatas));
  const airports = await Airport.find({ iata: { $in: unique } });
  return Object.fromEntries(airports.map((a) => [a.iata, a.name]));
}

// Public flight board data (schedule, status, gate) is the same information shown on the
// physical departure/arrival boards in the terminal — no auth required, no passenger PII.
export const listPublicFlights = async (req: Request, res: Response) => {
  try {
    const direction = (req.query.direction as string | undefined)?.toLowerCase();
    const date = req.query.date as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10) || 20, 50);

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

    res.json({ flights: board, total: filtered.length });
  } catch (error) {
    logger.error('List public flights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Single-flight detail — same fields as the board plus terminal and resolved airport names, for
// the flight details page. No auth required, same public data as the board.
export const getPublicFlight = async (req: Request, res: Response) => {
  try {
    const flight = await flightService.getByFlightNumber(req.params.flightNumber);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });

    const gate =
      flight.gateId && typeof flight.gateId === 'object' && 'gateNumber' in flight.gateId
        ? (flight.gateId as unknown as { gateNumber: string; terminal: string })
        : null;

    const airportNames = await resolveAirportNames([flight.origin, flight.destination]);

    res.json({
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
  } catch (error) {
    logger.error('Get public flight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Gate occupancy board — status + which flight number holds it, no internal ids.
export const listPublicGates = async (req: Request, res: Response) => {
  try {
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

    res.json({ gates: board });
  } catch (error) {
    logger.error('List public gates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
