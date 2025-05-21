import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getRelatedProducts,
} from '../controllers/product.controller';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', optionalAuthMiddleware, getProducts);
router.get('/top', getTopProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

// Protected routes
router.post('/:id/reviews', authMiddleware, createProductReview);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
