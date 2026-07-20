import { Request, Response } from 'express';
import { baggageService } from '../services/baggageService';
import { isAdminRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

// The public route is meant for a passenger who already holds the physical tag (i.e. knows
// the exact tagId) to check their own bag's status - it must not hand back other passengers'
// PII. Admins searching the same endpoint from the admin panel still get the full record.
const toPublicView = (baggage: any) => ({
  tagId: baggage.tagId,
  flightNumber: baggage.flightNumber,
  destination: baggage.destination,
  status: baggage.status,
});

export const getBaggage = async (req: Request, res: Response) => {
  try {
    const baggage = await baggageService.getByTagId(req.params.tagId);
    if (!baggage) return res.status(404).json({ error: 'Baggage not found' });
    res.json({ baggage: isAdminRequest(req) ? baggage : toPublicView(baggage) });
  } catch (error) {
    logger.error('Get baggage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBaggageByFlight = async (req: Request, res: Response) => {
  try {
    const baggage = await baggageService.getByFlightNumber(req.params.flightNumber);
    res.json({ baggage });
  } catch (error) {
    logger.error('Get baggage by flight error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBaggage = async (req: Request, res: Response) => {
  try {
    const baggage = await baggageService.create(req.body);
    res.status(201).json({ baggage });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Tag ID already exists' });
    }
    logger.error('Create baggage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBaggage = async (req: Request, res: Response) => {
  try {
    const baggage = await baggageService.update(req.params.tagId, req.body);
    if (!baggage) return res.status(404).json({ error: 'Baggage not found' });
    res.json({ baggage });
  } catch (error) {
    logger.error('Update baggage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBaggage = async (req: Request, res: Response) => {
  try {
    const deleted = await baggageService.remove(req.params.tagId);
    if (!deleted) return res.status(404).json({ error: 'Baggage not found' });
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete baggage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
