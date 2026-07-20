import express from 'express';
import { listPublicFlights, listPublicGates } from '../controllers/publicController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.get('/flights', rateLimiter, listPublicFlights);
router.get('/gates', rateLimiter, listPublicGates);

export default router;
