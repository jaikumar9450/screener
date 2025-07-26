import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { AuthenticationError, AuthorizationError } from './errorHandler';
import { redis } from '../config/redis';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        subscriptionTier: string;
      };
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader || '');

    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    // Verify JWT token
    const payload = verifyAccessToken(token);

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    // Check if session exists in Redis (optional extra security)
    const sessionExists = await redis.exists(`user_session:${user.id}:${token.slice(-20)}`);
    if (!sessionExists) {
      // Could be a revoked session, but we'll allow it for now
      // In production, you might want to be stricter
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.subscriptionTier,
      subscriptionTier: user.subscriptionTier,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader || '');

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            subscriptionTier: true,
            isActive: true,
          },
        });

        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email,
            role: user.subscriptionTier,
            subscriptionTier: user.subscriptionTier,
          };
        }
      } catch (error) {
        // Ignore token errors in optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware - checks user roles/subscriptions
 */
export const authorize = (allowedRoles: string[] = [], requireVerified = true) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Check if email verification is required
      if (requireVerified) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { isVerified: true },
        });

        if (!user?.isVerified) {
          throw new AuthorizationError('Email verification required');
        }
      }

      // Check role authorization
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.subscriptionTier)) {
        throw new AuthorizationError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Subscription tier middleware
 */
export const requireSubscription = (requiredTier: 'free' | 'premium' | 'professional') => {
  const tierHierarchy = {
    free: 0,
    premium: 1,
    professional: 2,
  };

  return authorize([], true);
};

/**
 * Admin only middleware
 */
export const requireAdmin = authorize(['admin'], true);

/**
 * Premium or higher middleware
 */
export const requirePremium = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  const tierHierarchy = {
    free: 0,
    premium: 1,
    professional: 2,
    admin: 3,
  };

  const userTier = tierHierarchy[req.user.subscriptionTier as keyof typeof tierHierarchy] || 0;
  const requiredTier = tierHierarchy.premium;

  if (userTier < requiredTier) {
    return next(new AuthorizationError('Premium subscription required'));
  }

  next();
};

/**
 * Email verified middleware
 */
export const requireEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isVerified: true },
    });

    if (!user?.isVerified) {
      throw new AuthorizationError('Email verification required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Rate limit by user ID middleware
 */
export const rateLimitByUser = (
  maxRequests: number,
  windowMs: number,
  message = 'Too many requests'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next();
      }

      const key = `rate_limit:user:${req.user.id}`;
      const current = await redis.get(key);
      
      if (current && parseInt(current) >= maxRequests) {
        throw new AuthorizationError(message);
      }

      await redis.set(key, (parseInt(current || '0') + 1).toString(), Math.floor(windowMs / 1000));
      next();
    } catch (error) {
      next(error);
    }
  };
};