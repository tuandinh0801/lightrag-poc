import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/user.model';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (
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
      page = 1, 
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search
    } = req.query;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort
    const sortOption: any = {};
    sortOption[sort as string] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get users
    const users = await User.find(filter)
      .select('-password')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (
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

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const { name, email, role, isVerified } = req.body;

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;

    const updatedUser = await user.save();

    res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Cannot delete your own account',
      });
    }

    await user.deleteOne();

    res.status(200).json({ message: 'User removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/users/:id/orders
// @access  Private/Admin
export const getUserOrders = async (
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // This would typically use a model import, but for simplicity we'll use a direct import
    const Order = require('../models/order.model').Order;
    
    const orders = await Order.find({ user: req.params.id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};
