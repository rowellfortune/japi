import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { isAdminRequest } from '../middleware/auth';
import { isValidEmail, isNonEmptyString } from '../utils/validators';
import { logger } from '../utils/logger';

const signToken = (user: { id: string; email: string; role: string }) =>
  jwt.sign(user, env.jwtSecret, { expiresIn: '7d' });

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: 'Valid email and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    // Only an already-authenticated admin may mint another admin account; anonymous
    // callers always get 'passenger', closing the self-registration privilege escalation.
    // The first admin must be created directly in the database.
    const grantAdmin = role === 'admin' && isAdminRequest(req);
    const user = await User.create({ email, passwordHash, role: grantAdmin ? 'admin' : 'passenger' });

    const token = signToken({ id: String(user._id), email: user.email, role: user.role });
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ error: 'Valid email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: String(user._id), email: user.email, role: user.role });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
