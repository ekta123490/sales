import { Router } from 'express';



import {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

import authenticateToken from '../middleware/authMiddleware.js';
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authenticateToken, me);

export default router;