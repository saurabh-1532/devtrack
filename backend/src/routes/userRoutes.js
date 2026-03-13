import { deleteAccount, getUserStats } from '../controllers/userController.js';
import { Router } from 'express';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.delete('/account', protect, deleteAccount);
router.get('/stats', protect, getUserStats);

export default router;