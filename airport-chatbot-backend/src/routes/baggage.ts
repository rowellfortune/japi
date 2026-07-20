import express from 'express';
import {
  getBaggage,
  getBaggageByFlight,
  createBaggage,
  updateBaggage,
  deleteBaggage,
} from '../controllers/baggageController';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Public read: a passenger who holds the physical tag can check their own bag's status.
// Rate-limited and PII-redacted (see controller) so knowing/guessing a tagId can't be used
// to scrape passenger data.
router.get('/:tagId', rateLimiter, getBaggage);

// Looking up by flight number returns every passenger's baggage on that flight, which is too
// broad a surface to expose anonymously (flight numbers are public), so this is admin-only.
router.get('/flight/:flightNumber', authMiddleware, requireAdmin, getBaggageByFlight);

// Admin-only writes
router.post('/', authMiddleware, requireAdmin, createBaggage);
router.patch('/:tagId', authMiddleware, requireAdmin, updateBaggage);
router.delete('/:tagId', authMiddleware, requireAdmin, deleteBaggage);

export default router;
