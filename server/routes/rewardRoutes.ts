import { Router } from 'express';
import * as questController from '../controllers/questController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', questController.getRewards);
router.post('/', questController.addReward);
router.put('/:id', questController.updateReward);
router.delete('/:id', questController.deleteReward);
router.post('/claim', questController.claimReward);

export default router;
