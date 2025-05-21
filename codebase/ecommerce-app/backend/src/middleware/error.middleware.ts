import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  errors?: any[];
  code?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values((err as any).errors).map((error: any) => ({
      field: error.path,
      message: error.message,
    }));
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    
    const field = Object.keys((err as any).keyValue)[0];
    errors = [{ field, message: `${field} already exists` }];
  }

  // Handle mongoose cast errors
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errors = [{ field: (err as any).path, message: 'Invalid format' }];
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
