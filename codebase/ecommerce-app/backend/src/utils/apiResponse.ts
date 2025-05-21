import { Response } from 'express';

/**
 * Standard API response format
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    [key: string]: any;
  };
}

/**
 * Send a success response
 * @param res Express response object
 * @param data Response data
 * @param message Success message
 * @param statusCode HTTP status code
 * @param meta Additional metadata
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  meta?: any
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

/**
 * Send an error response
 * @param res Express response object
 * @param message Error message
 * @param statusCode HTTP status code
 * @param errors Array of specific errors
 */
export const sendError = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 400,
  errors?: any[]
): Response<ApiResponse<null>> => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Send a paginated response
 * @param res Express response object
 * @param data Response data
 * @param page Current page
 * @param limit Items per page
 * @param total Total number of items
 * @param message Success message
 * @param statusCode HTTP status code
 * @param additionalMeta Additional metadata
 */
export const sendPaginated = <T>(
  res: Response,
  data: T,
  page: number,
  limit: number,
  total: number,
  message: string = 'Success',
  statusCode: number = 200,
  additionalMeta?: any
): Response<ApiResponse<T>> => {
  const pages = Math.ceil(total / limit);
  
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      ...additionalMeta,
    },
  });
};
