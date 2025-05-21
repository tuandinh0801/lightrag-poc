import { Request, Response, NextFunction } from 'express';
import { Order, IOrder } from '../models/order.model';
import { Product } from '../models/product.model';
import { Cart } from '../models/cart.model';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        message: 'No order items',
      });
    }

    // Verify all products exist and have sufficient stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`,
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
        });
      }
    }

    // Calculate prices
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    
    // Apply tax (example: 10%)
    const taxRate = 0.1;
    const taxPrice = itemsPrice * taxRate;
    
    // Calculate shipping (example: free shipping over $100, otherwise $10)
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    
    // Total price
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], totalPrice: 0 } }
    );

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Check if the order belongs to the user or if the user is an admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'Not authorized to access this order',
      });
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Update order
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'processing';
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (
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

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Update order
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = 'delivered';
    order.trackingNumber = req.body.trackingNumber || order.trackingNumber;

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (
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

    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Update order status
    order.status = status;
    
    // If status is shipped, update tracking number
    if (status === 'shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    // If status is delivered, update delivered status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (
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
      status, 
      page = 1, 
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sortOption: any = {};
    sortOption[sort as string] = order === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get orders
    const orders = await Order.find(filter)
      .populate('user', 'id name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Order.countDocuments(filter);

    res.status(200).json({
      orders,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    // Check if the order belongs to the user or if the user is an admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'Not authorized to cancel this order',
      });
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'shipped') {
      return res.status(400).json({
        message: 'Cannot cancel an order that has been shipped or delivered',
      });
    }

    // Update order status
    order.status = 'cancelled';

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};
