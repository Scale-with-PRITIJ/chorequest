import { Router } from 'express';
import { revokeSession } from '../controllers/authController';

const router = Router();

router.post('/logout', revokeSession);

export default router;
