import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from './apiResponse';

/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors for response
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    // Send error response
    return sendError(
      res,
      'Validation Error',
      400,
      formattedErrors
    );
  };
};

/**
 * Helper function to check if a string is a valid MongoDB ObjectId
 * @param id String to validate
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Helper function to validate email format
 * @param email Email to validate
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Helper function to validate password strength
 * @param password Password to validate
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Helper function to validate phone number format
 * @param phone Phone number to validate
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Helper function to sanitize a string for use in a query
 * @param str String to sanitize
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
