import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All routes are protected
router.get('/', authMiddleware, getCart);
router.post('/items', authMiddleware, addToCart);
router.put('/items/:productId', authMiddleware, updateCartItem);
router.delete('/items/:productId', authMiddleware, removeFromCart);
router.delete('/', authMiddleware, clearCart);

export default router;
