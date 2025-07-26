import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config, CONSTANTS } from '../config/config';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { RateLimitError } from './errorHandler';

// Custom Redis store for rate limiting
class RedisStore {
  private prefix: string;
  private redis: any;

  constructor(prefix: string = 'rl:') {
    this.prefix = prefix;
    this.redis = redis;
  }

  async increment(key: string): Promise<{ totalHits: number; timeToExpire?: number }> {
    const redisKey = `${this.prefix}${key}`;
    
    try {
      const multi = this.redis.getClient().multi();
      multi.incr(redisKey);
      multi.ttl(redisKey);
      
      const results = await multi.exec();
      const totalHits = results[0][1];
      const ttl = results[1][1];
      
      // Set expiration if this is the first hit
      if (totalHits === 1) {
        await this.redis.getClient().expire(redisKey, 900); // 15 minutes
      }
      
      return {
        totalHits,
        timeToExpire: ttl > 0 ? ttl * 1000 : undefined,
      };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      // Fallback to allowing the request if Redis fails
      return { totalHits: 1 };
    }
  }

  async decrement(key: string): Promise<void> {
    const redisKey = `${this.prefix}${key}`;
    
    try {
      await this.redis.getClient().decr(redisKey);
    } catch (error) {
      logger.error('Redis rate limit decrement error:', error);
    }
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = `${this.prefix}${key}`;
    
    try {
      await this.redis.getClient().del(redisKey);
    } catch (error) {
      logger.error('Redis rate limit reset error:', error);
    }
  }
}

// Create Redis store instance
const redisStore = new RedisStore();

// Rate limit message generator
const rateLimitMessage = (req: Request): string => {
  return `Too many requests from ${req.ip}. Please try again later.`;
};

// Rate limit handler
const rateLimitHandler = (req: Request, res: Response): void => {
  const error = new RateLimitError(rateLimitMessage(req));
  
  // Log rate limit exceeded
  logger.warn('Rate limit exceeded:', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    endpoint: req.originalUrl,
    method: req.method,
    userId: (req as any).user?.id,
  });

  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
  });
};

// Key generator for rate limiting
const keyGenerator = (req: Request): string => {
  const userId = (req as any).user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Use user ID if authenticated, otherwise use IP
  return userId ? `user:${userId}` : `ip:${ip}`;
};

// Skip rate limiting for certain conditions
const skipSuccessfulRequests = (req: Request, res: Response): boolean => {
  // Skip rate limiting for successful requests in development
  return config.isDevelopment && res.statusCode < 400;
};

const skipFailedRequests = (req: Request, res: Response): boolean => {
  // Don't skip failed requests (count them towards the limit)
  return false;
};

// Standard rate limiter
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore as any,
  keyGenerator,
  handler: rateLimitHandler,
  skipSuccessfulRequests,
  skipFailedRequests,
});

// Authentication rate limiter (stricter for login attempts)
export const authRateLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMITS.AUTH.WINDOW_MS,
  max: CONSTANTS.RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: 'Too many authentication attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('auth:') as any,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const email = req.body?.email || 'unknown';
    return `${ip}:${email}`;
  },
  handler: rateLimitHandler,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
});

// Export rate limiter (stricter for file exports)
export const exportRateLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMITS.EXPORT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMITS.EXPORT.MAX_REQUESTS,
  message: 'Too many export requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('export:') as any,
  keyGenerator,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// API rate limiter for general API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMITS.API.WINDOW_MS,
  max: CONSTANTS.RATE_LIMITS.API.MAX_REQUESTS,
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('api:') as any,
  keyGenerator,
  handler: rateLimitHandler,
  skipSuccessfulRequests,
  skipFailedRequests,
});

// Create custom rate limiter
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  prefix?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || rateLimitMessage,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore(options.prefix) as any,
    keyGenerator: options.keyGenerator || keyGenerator,
    handler: rateLimitHandler,
    skipSuccessfulRequests,
    skipFailedRequests,
  });
};

// Rate limiter for specific endpoints
export const screeningRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 10, // 10 screening requests per minute
  message: 'Too many screening requests. Please wait before trying again.',
  prefix: 'screening:',
});

export const searchRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 30, // 30 search requests per minute
  message: 'Too many search requests. Please wait before trying again.',
  prefix: 'search:',
});

export const dataUpdateRateLimiter = createRateLimiter({
  windowMs: 300000, // 5 minutes
  max: 5, // 5 data update requests per 5 minutes
  message: 'Too many data update requests. Please wait before trying again.',
  prefix: 'update:',
});

// Rate limiter for password reset
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 3600000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts. Please try again later.',
  prefix: 'reset:',
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    return `email:${email}`;
  },
});

// Rate limiter for email verification
export const emailVerificationRateLimiter = createRateLimiter({
  windowMs: 300000, // 5 minutes
  max: 3, // 3 email verification requests per 5 minutes
  message: 'Too many email verification requests. Please wait before trying again.',
  prefix: 'verify:',
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.id || 'unknown';
    return `user:${userId}`;
  },
});

export default rateLimiter;