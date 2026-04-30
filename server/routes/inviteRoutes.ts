import { Router } from 'express';
import * as inviteController from '../controllers/inviteController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/check', inviteController.checkInvite);
router.post('/', inviteController.createInvite);

export default router;
