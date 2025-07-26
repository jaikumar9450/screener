import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config/config';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error class
export class ValidationError extends AppError {
  public details?: any;

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// Authentication error class
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// Authorization error class
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

// Conflict error class
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

// Rate limit error class
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

// Handle Prisma errors
const handlePrismaError = (error: any): AppError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[];
        const fieldName = field ? field[0] : 'field';
        return new ConflictError(`${fieldName} already exists`);
      
      case 'P2025':
        // Record not found
        return new NotFoundError('Record');
      
      case 'P2003':
        // Foreign key constraint violation
        return new ValidationError('Invalid reference provided');
      
      case 'P2014':
        // Invalid ID
        return new ValidationError('Invalid ID provided');
      
      default:
        logger.error('Prisma error:', error);
        return new AppError('Database error occurred', 500, 'DATABASE_ERROR');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data provided');
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    logger.error('Unknown Prisma error:', error);
    return new AppError('Database error occurred', 500, 'DATABASE_ERROR');
  }

  return new AppError('Database error occurred', 500, 'DATABASE_ERROR');
};

// Handle JWT errors
const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token has expired');
  }
  
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Token not active');
  }

  return new AuthenticationError('Token verification failed');
};

// Handle validation errors
const handleValidationError = (error: any): AppError => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  return new ValidationError('Validation failed');
};

// Format error response
const formatErrorResponse = (error: AppError, req: Request) => {
  const response: any = {
    success: false,
    error: {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      statusCode: error.statusCode,
    },
  };

  // Add error details in development
  if (config.isDevelopment) {
    response.error.stack = error.stack;
    response.error.details = (error as any).details;
  }

  // Add request ID if available
  if (req.id) {
    response.requestId = req.id;
  }

  return response;
};

// Global error handler middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Handle different error types
  if (error instanceof AppError) {
    appError = error;
  } else if (error.name?.startsWith('Prisma')) {
    appError = handlePrismaError(error);
  } else if (error.name?.includes('JWT') || error.name?.includes('Token')) {
    appError = handleJWTError(error);
  } else if (error.name === 'ValidationError') {
    appError = handleValidationError(error);
  } else if (error.name === 'CastError') {
    appError = new ValidationError('Invalid data format');
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    appError = new ValidationError('File size too large');
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    appError = new ValidationError('Invalid file format');
  } else {
    // Generic server error
    appError = new AppError(
      config.isProduction ? 'Something went wrong' : error.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  // Log error
  const logLevel = appError.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('Error handled:', {
    message: appError.message,
    statusCode: appError.statusCode,
    code: appError.code,
    stack: config.isDevelopment ? appError.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Send error response
  const response = formatErrorResponse(appError, req);
  res.status(appError.statusCode).json(response);
};

// 404 handler middleware
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error response helper
export const sendError = (
  res: Response,
  error: AppError | string,
  statusCode?: number
): void => {
  if (typeof error === 'string') {
    error = new AppError(error, statusCode || 500);
  }

  const response = {
    success: false,
    error: {
      message: error.message,
      code: error.code || 'ERROR',
      statusCode: error.statusCode,
    },
  };

  res.status(error.statusCode).json(response);
};

// Success response helper
export const sendSuccess = (
  res: Response,
  data?: any,
  message?: string,
  statusCode: number = 200
): void => {
  const response: any = {
    success: true,
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

// Paginated response helper
export const sendPaginatedSuccess = (
  res: Response,
  data: any[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
): void => {
  const response: any = {
    success: true,
    data,
    pagination,
  };

  if (message) {
    response.message = message;
  }

  res.json(response);
};

export {
  AppError as default,
  AppError,
};