import { Request, Response, NextFunction } from 'express';
import { Product, IProduct } from '../models/product.model';
import { User } from '../models/user.model';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      category, 
      brand, 
      search, 
      sort, 
      min, 
      max, 
      page = 1, 
      limit = 10,
      featured,
      isNew,
      onSale
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (brand) {
      filter.brand = brand;
    }
    
    if (search) {
      filter.$text = { $search: search as string };
    }
    
    if (min || max) {
      filter.price = {};
      if (min) filter.price.$gte = Number(min);
      if (max) filter.price.$lte = Number(max);
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (isNew === 'true') {
      filter.isNew = true;
    }

    if (onSale === 'true') {
      filter.onSale = true;
    }

    // Build sort object
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
        case 'name-desc':
          sortOption = { name: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 };
    }

    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (
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

    const {
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      images,
      category,
      brand,
      stock,
      sku,
      featured,
      isNew,
      onSale,
      tags,
      attributes,
    } = req.body;

    // Check if product with same SKU exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        message: 'Product with this SKU already exists',
      });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      shortDescription,
      price,
      originalPrice,
      images,
      category,
      brand,
      stock,
      sku,
      featured: featured || false,
      isNew: isNew || false,
      onSale: onSale || false,
      tags: tags || [],
      attributes: attributes || {},
      rating: 0,
      numReviews: 0,
      reviews: [],
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Update product fields
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (
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

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: 'Product already reviewed',
      });
    }

    // Create review
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      date: new Date(),
    };

    // Add review to product
    product.reviews.push(review);
    
    // Update product rating
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit) || 5;
    
    const products = await Product.find({})
      .sort({ rating: -1 })
      .limit(limit);

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const limit = Number(req.query.limit) || 4;

    // Find products in the same category, excluding the current product
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
    })
      .limit(limit);

    res.status(200).json(relatedProducts);
  } catch (error) {
    next(error);
  }
};
