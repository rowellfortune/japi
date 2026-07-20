import express from 'express';
import {
  listFlights,
  getFlight,
  createFlight,
  updateFlight,
  deleteFlight,
} from '../controllers/flightController';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get('/', listFlights);
router.get('/:flightNumber', getFlight);
router.post('/', createFlight);
router.patch('/:flightNumber', updateFlight);
router.delete('/:flightNumber', deleteFlight);

export default router;
