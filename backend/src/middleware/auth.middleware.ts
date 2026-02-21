import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminRequest extends Request {
  admin?: { username: string };
}

export const authenticateAdmin = (req: AdminRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'truebread-admin-secret-key';

  try {
    const decoded = jwt.verify(token, jwtSecret) as { username: string };
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
