import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { createGoal, deleteGoal, getGoals, getGoal, deleteAllGoals } from "../controllers/goalController.js";

const router = Router();

router.get('/', protect, getGoals);
router.post('/', protect, createGoal);
router.get('/:id', protect, getGoal);
router.delete('/:id', protect, deleteGoal);
router.delete('/all', protect, deleteAllGoals);

export default router;