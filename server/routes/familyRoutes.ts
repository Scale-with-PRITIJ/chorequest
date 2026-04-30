import { Router } from 'express';
import * as familyController from '../controllers/familyController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', familyController.getUsers);
router.post('/', familyController.addUser);
router.get('/:id', familyController.getUserById);
router.put('/:id', familyController.updateUser); // Changed patch to put to match frontend

export default router;
