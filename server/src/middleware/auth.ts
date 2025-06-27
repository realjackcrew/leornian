import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
    const authReq = req as AuthenticatedRequest;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
  
    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err || typeof payload !== 'object' || !('userId' in payload)) {
        res.status(403).json({ error: 'Invalid token' });
        return;
      }
  
      authReq.userId = payload.userId as string;
      next();
    });
  }