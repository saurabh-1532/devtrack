import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { register,login,getMe } from "../controllers/authController.js";


const router = Router();

router.post('/register',register);
router.post('/login',login);
router.get('/me',protect,getMe);

export default router;