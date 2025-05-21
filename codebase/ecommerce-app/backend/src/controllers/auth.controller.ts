import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, avatar, address, phone } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (avatar) user.avatar = avatar;
    if (address) user.address = address;
    if (phone) user.phone = phone;

    // Save user
    await user.save();

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).slice(2, 10);
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = resetToken;
    
    // Set expire
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.save();

    // In a real app, send email with reset token
    // For this example, we'll just return the token
    res.status(200).json({
      message: 'Password reset email sent',
      resetToken, // In a real app, don't return this
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find user by reset token and check if it's expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired token',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    // Generate new token
    const newToken = generateToken(user._id.toString());

    res.status(200).json({
      message: 'Password reset successful',
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};
