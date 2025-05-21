import { Request, Response, NextFunction } from 'express';
import { Category, ICategory } from '../models/category.model';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { parent, level } = req.query;
    
    // Build filter
    const filter: any = {};
    if (parent) {
      filter.parent = parent;
    } else if (parent === 'null') {
      filter.parent = null;
    }
    
    if (level) {
      filter.level = Number(level);
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
      });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
      });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized, admin only',
      });
    }

    const { name, description, image, parent } = req.body;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        message: 'Category with this name already exists',
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      image,
      parent,
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized, admin only',
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
      });
    }

    const { name, description, image, parent, isActive } = req.body;

    // If name is changed, check if it already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          message: 'Category with this name already exists',
        });
      }
    }

    // Update category fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parent !== undefined) category.parent = parent;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not authorized, admin only',
      });
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: 'Category not found',
      });
    }

    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parent: category._id });
    if (hasSubcategories) {
      return res.status(400).json({
        message: 'Cannot delete category with subcategories',
      });
    }

    // Check if category has products
    const Product = require('../models/product.model').Product;
    const hasProducts = await Product.exists({ category: category.name });
    if (hasProducts) {
      return res.status(400).json({
        message: 'Cannot delete category with products',
      });
    }

    await category.deleteOne();

    res.status(200).json({ message: 'Category removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all parent categories
    const parentCategories = await Category.find({ parent: null }).sort({ name: 1 });
    
    // For each parent category, get its subcategories
    const categoryTree = await Promise.all(
      parentCategories.map(async (parent) => {
        const subcategories = await Category.find({ parent: parent._id }).sort({ name: 1 });
        
        return {
          _id: parent._id,
          name: parent.name,
          slug: parent.slug,
          description: parent.description,
          image: parent.image,
          level: parent.level,
          isActive: parent.isActive,
          subcategories: subcategories.map((sub) => ({
            _id: sub._id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            image: sub.image,
            level: sub.level,
            isActive: sub.isActive,
          })),
        };
      })
    );
    
    res.status(200).json(categoryTree);
  } catch (error) {
    next(error);
  }
};
