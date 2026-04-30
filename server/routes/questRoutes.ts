import { Router } from 'express';
import * as questController from '../controllers/questController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', questController.getQuests);
router.post('/', questController.addQuest);
router.put('/:id', questController.updateQuest);
router.delete('/:id', questController.deleteQuest);
router.post('/:id/complete', questController.completeQuest);
router.get('/rewards', questController.getRewards);
router.post('/rewards', questController.addReward);
router.post('/claim-reward', questController.claimReward);

export default router;
