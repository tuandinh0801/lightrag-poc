import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  cancelOrder,
} from '../controllers/order.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, createOrder);
router.get('/myorders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/pay', authMiddleware, updateOrderToPaid);
router.put('/:id/cancel', authMiddleware, cancelOrder);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getOrders);
router.put('/:id/deliver', authMiddleware, adminMiddleware, updateOrderToDelivered);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
