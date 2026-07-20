import { Request, Response } from 'express';
import { gateService } from '../services/gateService';
import { logger } from '../utils/logger';

export const listGates = async (req: Request, res: Response) => {
  try {
    const gates = await gateService.list();
    res.json({ gates });
  } catch (error) {
    logger.error('List gates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGate = async (req: Request, res: Response) => {
  try {
    const gate = await gateService.getByGateNumber(req.params.gateNumber);
    if (!gate) return res.status(404).json({ error: 'Gate not found' });
    res.json({ gate });
  } catch (error) {
    logger.error('Get gate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createGate = async (req: Request, res: Response) => {
  try {
    const gate = await gateService.create(req.body);
    res.status(201).json({ gate });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Gate number already exists' });
    }
    logger.error('Create gate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateGate = async (req: Request, res: Response) => {
  try {
    const gate = await gateService.update(req.params.gateNumber, req.body);
    if (!gate) return res.status(404).json({ error: 'Gate not found' });
    res.json({ gate });
  } catch (error) {
    logger.error('Update gate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteGate = async (req: Request, res: Response) => {
  try {
    const deleted = await gateService.remove(req.params.gateNumber);
    if (!deleted) return res.status(404).json({ error: 'Gate not found' });
    res.json({ success: true });
  } catch (error) {
    logger.error('Delete gate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
