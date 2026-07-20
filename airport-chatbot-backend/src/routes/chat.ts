import express from 'express';
import { postMessage, getHistory } from '../controllers/chatController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/message', rateLimiter, postMessage);
router.get('/history/:sessionId', getHistory);

export default router;
