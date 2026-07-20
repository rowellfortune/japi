import { Request, Response } from 'express';
import { flightService } from '../services/flightService';
import { logger } from '../utils/logger';

export const listFlights = async (req: Request, res: Response) => {
  try {
    const { status, airline, destination } = req.query as Record<string, string>;
    const flights = await flightService.list({ status, airline, destination });
    res.json({ flights });
  } catch (error) {
    logger.error('List flights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFlight = async (req: Request, res: Response) => {
  try {
    const flight = await flightService.getByFlightNumber(req.params.flightNumber);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    res.json({ flight });
  } catch (error) {
    logger.error('Get flight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createFlight = async (req: Request, res: Response) => {
  try {
    const flight = await flightService.create(req.body);
    res.status(201).json({ flight });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Flight number already exists' });
    }
    logger.error('Create flight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateFlight = async (req: Request, res: Response) => {
  try {
    const flight = await flightService.update(req.params.flightNumber, req.body);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    res.json({ flight });
  } catch (error) {
    logger.error('Update flight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFlight = async (req: Request, res: Response) => {
  try {
    const deleted = await flightService.remove(req.params.flightNumber);
    if (!deleted) return res.status(404).json({ error: 'Flight not found' });
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete flight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
