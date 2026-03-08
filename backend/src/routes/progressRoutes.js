import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { getProgress } from "../controllers/progressController.js";


const router = Router();

router.get('/',protect,getProgress);

export default router;