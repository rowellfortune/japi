import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: 'passenger' | 'admin' };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Best-effort decode for routes that are usable both anonymously and by admins,
// where an admin caller should see more than an anonymous one. Never rejects the request.
export const isAdminRequest = (req: Request): boolean => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthRequest['user'];
    return decoded?.role === 'admin';
  } catch {
    return false;
  }
};
