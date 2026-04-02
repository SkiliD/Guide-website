import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload, Role } from '../types/domain';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

export function createAccessToken(payload: AuthPayload) {
  const expiresIn = (process.env.JWT_EXPIRY || '7d') as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.authUser = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expire' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return res.status(401).json({ message: 'Utilisateur non authentifie' });
    }

    if (!roles.includes(req.authUser.role)) {
      return res.status(403).json({ message: 'Permissions insuffisantes' });
    }

    return next();
  };
}
