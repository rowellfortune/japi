import express from 'express';
import { register, login } from '../controllers/authController';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

export default router;
