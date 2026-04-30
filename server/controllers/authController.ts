import { Request, Response } from 'express';
import { adminAuth } from '../utils/firebaseAdmin';
import logger from '../utils/logger';

export const revokeSession = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Revoke all refresh tokens for this user
    await adminAuth.revokeRefreshTokens(uid);
    logger.info(`Tokens revoked for user: ${uid}. Session terminated on all devices.`);

    res.json({ message: 'Session successfully revoked on all devices' });
  } catch (err) {
    logger.error('Error revoking session:', err);
    res.status(500).json({ message: 'Failed to revoke session' });
  }
};
