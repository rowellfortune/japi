import { Request, Response } from 'express';
import { flightService } from '../services/flightService';
import { gateService } from '../services/gateService';
import { logger } from '../utils/logger';

// This airport's IATA code — used to classify a flight as an arrival (destination === here)
// or departure (origin === here) for the public flight board.
const HOME_AIRPORT = 'PBM';

// Public flight board data (schedule, status, gate) is the same information shown on the
// physical departure/arrival boards in the terminal — no auth required, no passenger PII.
export const listPublicFlights = async (req: Request, res: Response) => {
  try {
    const direction = (req.query.direction as string | undefined)?.toLowerCase();
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10) || 20, 50);

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

    res.json({ flights: board, total: filtered.length });
  } catch (error) {
    logger.error('List public flights error:', error);
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
