import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserOrders,
} from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes are protected and admin-only
router.use(authMiddleware, adminMiddleware);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/:id/orders', getUserOrders);

export default router;
