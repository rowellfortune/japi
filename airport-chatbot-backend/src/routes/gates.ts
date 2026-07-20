import express from 'express';
import { listGates, getGate, createGate, updateGate, deleteGate } from '../controllers/gateController';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get('/', listGates);
router.get('/:gateNumber', getGate);
router.post('/', createGate);
router.patch('/:gateNumber', updateGate);
router.delete('/:gateNumber', deleteGate);

export default router;
