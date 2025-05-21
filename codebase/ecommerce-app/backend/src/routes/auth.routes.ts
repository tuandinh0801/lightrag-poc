import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);

export default router;
