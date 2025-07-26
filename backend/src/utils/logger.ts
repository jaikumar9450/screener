import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from '../config/config';

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.filePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}] ${message}`;
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport (always enabled in development)
if (config.isDevelopment || config.logging.level === 'debug') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level,
    })
  );
}

// File transport for all levels
transports.push(
  new winston.transports.File({
    filename: config.logging.filePath,
    format: logFormat,
    level: config.logging.level,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  })
);

// Error file transport
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    format: logFormat,
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true,
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'stockfilter-api',
    environment: config.nodeEnv,
  },
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Handle uncaught exceptions and unhandled rejections
if (config.isProduction) {
  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    })
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat,
    })
  );
}

// Add stream interface for Morgan
logger.stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
} as any;

// Enhanced logging methods
export const log = {
  // Standard logging methods
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  
  // Request logging
  request: (req: any, res: any, responseTime?: number) => {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  },

  // Database logging
  db: {
    query: (query: string, duration?: number) => {
      logger.debug('Database Query', {
        query: query.substring(0, 500), // Limit query length
        duration: duration ? `${duration}ms` : undefined,
      });
    },
    
    error: (error: any, query?: string) => {
      logger.error('Database Error', {
        error: error.message,
        stack: error.stack,
        query: query?.substring(0, 500),
      });
    },
  },

  // Authentication logging
  auth: {
    login: (userId: string, ip: string, userAgent: string) => {
      logger.info('User Login', { userId, ip, userAgent });
    },
    
    loginFailed: (email: string, ip: string, reason: string) => {
      logger.warn('Login Failed', { email, ip, reason });
    },
    
    logout: (userId: string) => {
      logger.info('User Logout', { userId });
    },
    
    register: (userId: string, email: string) => {
      logger.info('User Registration', { userId, email });
    },
  },

  // Business logic logging
  business: {
    screening: (userId: string, filters: any, resultsCount: number, duration: number) => {
      logger.info('Stock Screening', {
        userId,
        filters: JSON.stringify(filters),
        resultsCount,
        duration: `${duration}ms`,
      });
    },
    
    export: (userId: string, type: string, format: string, rowCount: number) => {
      logger.info('Data Export', { userId, type, format, rowCount });
    },
    
    portfolio: (userId: string, action: string, details: any) => {
      logger.info('Portfolio Action', { userId, action, details });
    },
  },

  // Security logging
  security: {
    suspiciousActivity: (ip: string, userAgent: string, details: any) => {
      logger.warn('Suspicious Activity', { ip, userAgent, details });
    },
    
    rateLimitExceeded: (ip: string, endpoint: string) => {
      logger.warn('Rate Limit Exceeded', { ip, endpoint });
    },
    
    unauthorizedAccess: (ip: string, endpoint: string, userId?: string) => {
      logger.warn('Unauthorized Access', { ip, endpoint, userId });
    },
  },

  // Performance logging
  performance: {
    slow: (operation: string, duration: number, details?: any) => {
      logger.warn('Slow Operation', { operation, duration: `${duration}ms`, details });
    },
    
    cache: (operation: string, key: string, hit: boolean) => {
      logger.debug('Cache Operation', { operation, key, hit });
    },
  },
};

// Export default logger
export default logger;