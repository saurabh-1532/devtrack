import { Router } from 'express';
import { fetchUrl } from '../controllers/utilityController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.post('/fetch-url', protect, fetchUrl);

export default router;