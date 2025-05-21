import { Request, Response, NextFunction } from 'express';
import { Cart, ICart } from '../models/cart.model';
import { Product } from '../models/product.model';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create empty cart if none exists
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Not enough stock. Available: ${product.stock}`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: product._id,
        name: product.name,
        quantity,
        price: product.price,
        image: product.images[0],
      });
    }

    // Calculate total price
    cart.totalPrice = cart.calculateTotalPrice();

    // Save cart
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be at least 1',
      });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Not enough stock. Available: ${product.stock}`,
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: 'Item not found in cart',
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Calculate total price
    cart.totalPrice = cart.calculateTotalPrice();

    // Save cart
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    // Calculate total price
    cart.totalPrice = cart.calculateTotalPrice();

    // Save cart
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found',
      });
    }

    // Clear cart
    cart.items = [];
    cart.totalPrice = 0;

    // Save cart
    await cart.save();

    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
