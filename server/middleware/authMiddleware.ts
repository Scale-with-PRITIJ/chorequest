import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../utils/firebaseAdmin';
import logger from '../utils/logger';

// Extend Express Request to include our custom user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Unauthorized request: No Bearer token provided');
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // This cryptographically verifies the token was signed by Google
    // and hasn't expired. A hacker cannot forge this.
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Attach the securely verified UID to the request
    req.user = { uid: decodedToken.uid };
    
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
