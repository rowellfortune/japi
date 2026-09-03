import express from 'express';
import { listPublicFlights, getPublicFlight, listPublicGates } from '../controllers/publicController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.get('/flights', rateLimiter, listPublicFlights);
router.get('/flights/:flightNumber', rateLimiter, getPublicFlight);
router.get('/gates', rateLimiter, listPublicGates);

export default router;
