import express from 'express';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
} from '../controllers/category.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createCategory);
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;
