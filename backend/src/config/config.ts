import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Configuration schema validation
const configSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  // Server
  PORT: Joi.number().default(5000),
  HOST: Joi.string().default('localhost'),
  API_PREFIX: Joi.string().default('/api'),

  // Database
  DATABASE_URL: Joi.string().required(),
  DATABASE_POOL_SIZE: Joi.number().default(20),
  DATABASE_TIMEOUT: Joi.number().default(30000),

  // Redis
  REDIS_URL: Joi.string().required(),
  REDIS_SESSION_PREFIX: Joi.string().default('stockfilter:session:'),
  REDIS_CACHE_PREFIX: Joi.string().default('stockfilter:cache:'),
  REDIS_CACHE_TTL: Joi.number().default(3600),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Encryption
  ENCRYPTION_KEY: Joi.string().length(32).required(),

  // Email
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().email().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM: Joi.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // File Upload
  UPLOAD_MAX_SIZE: Joi.number().default(10485760), // 10MB
  UPLOAD_ALLOWED_TYPES: Joi.string().default('csv,xlsx,xls'),

  // External APIs
  NSE_API_URL: Joi.string().uri().optional(),
  BSE_API_URL: Joi.string().uri().optional(),
  STOCK_DATA_API_KEY: Joi.string().optional(),

  // Cron Jobs
  ENABLE_CRON_JOBS: Joi.boolean().default(true),
  MARKET_DATA_UPDATE_CRON: Joi.string().default('0 */15 * * * *'),
  FINANCIAL_DATA_UPDATE_CRON: Joi.string().default('0 0 2 * * 0'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
  LOG_FILE_PATH: Joi.string().default('./logs/app.log'),
  ENABLE_REQUEST_LOGGING: Joi.boolean().default(true),

  // Security
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  SESSION_SECRET: Joi.string().min(32).required(),
  BCRYPT_ROUNDS: Joi.number().min(10).max(15).default(12),

  // Feature Flags
  ENABLE_WEBSOCKETS: Joi.boolean().default(true),
  ENABLE_ELASTICSEARCH: Joi.boolean().default(false),
  ENABLE_EMAIL_VERIFICATION: Joi.boolean().default(true),
  ENABLE_TWO_FACTOR_AUTH: Joi.boolean().default(false),

  // Development
  SWAGGER_ENABLED: Joi.boolean().default(true),
  DEBUG_MODE: Joi.boolean().default(false),
}).unknown();

// Validate configuration
const { error, value: envVars } = configSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Type-safe configuration object
export const config = {
  // Environment
  nodeEnv: envVars.NODE_ENV as 'development' | 'test' | 'production',
  isDevelopment: envVars.NODE_ENV === 'development',
  isProduction: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test',

  // Server
  port: envVars.PORT as number,
  host: envVars.HOST as string,
  apiPrefix: envVars.API_PREFIX as string,

  // Database
  database: {
    url: envVars.DATABASE_URL as string,
    poolSize: envVars.DATABASE_POOL_SIZE as number,
    timeout: envVars.DATABASE_TIMEOUT as number,
  },

  // Redis
  redis: {
    url: envVars.REDIS_URL as string,
    sessionPrefix: envVars.REDIS_SESSION_PREFIX as string,
    cachePrefix: envVars.REDIS_CACHE_PREFIX as string,
    cacheTtl: envVars.REDIS_CACHE_TTL as number,
  },

  // JWT
  jwt: {
    secret: envVars.JWT_SECRET as string,
    refreshSecret: envVars.JWT_REFRESH_SECRET as string,
    expiresIn: envVars.JWT_EXPIRES_IN as string,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN as string,
  },

  // Encryption
  encryption: {
    key: envVars.ENCRYPTION_KEY as string,
  },

  // Email
  email: {
    host: envVars.SMTP_HOST as string,
    port: envVars.SMTP_PORT as number,
    user: envVars.SMTP_USER as string,
    pass: envVars.SMTP_PASS as string,
    from: envVars.SMTP_FROM as string,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS as number,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS as number,
  },

  // File Upload
  upload: {
    maxSize: envVars.UPLOAD_MAX_SIZE as number,
    allowedTypes: (envVars.UPLOAD_ALLOWED_TYPES as string).split(','),
  },

  // External APIs
  externalApis: {
    nseUrl: envVars.NSE_API_URL as string,
    bseUrl: envVars.BSE_API_URL as string,
    stockDataApiKey: envVars.STOCK_DATA_API_KEY as string,
  },

  // Cron Jobs
  cron: {
    enabled: envVars.ENABLE_CRON_JOBS as boolean,
    marketDataUpdate: envVars.MARKET_DATA_UPDATE_CRON as string,
    financialDataUpdate: envVars.FINANCIAL_DATA_UPDATE_CRON as string,
  },

  // Logging
  logging: {
    level: envVars.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug',
    filePath: envVars.LOG_FILE_PATH as string,
    enableRequestLogging: envVars.ENABLE_REQUEST_LOGGING as boolean,
  },

  // Security
  security: {
    corsOrigin: envVars.CORS_ORIGIN as string,
    sessionSecret: envVars.SESSION_SECRET as string,
    bcryptRounds: envVars.BCRYPT_ROUNDS as number,
  },

  // Feature Flags
  features: {
    websockets: envVars.ENABLE_WEBSOCKETS as boolean,
    elasticsearch: envVars.ENABLE_ELASTICSEARCH as boolean,
    emailVerification: envVars.ENABLE_EMAIL_VERIFICATION as boolean,
    twoFactorAuth: envVars.ENABLE_TWO_FACTOR_AUTH as boolean,
  },

  // Development
  development: {
    swaggerEnabled: envVars.SWAGGER_ENABLED as boolean,
    debugMode: envVars.DEBUG_MODE as boolean,
  },

  // Convenience getters
  get corsOrigin() {
    return this.security.corsOrigin;
  },

  get swaggerEnabled() {
    return this.development.swaggerEnabled && this.isDevelopment;
  },
} as const;

// Configuration constants
export const CONSTANTS = {
  // User roles
  USER_ROLES: {
    FREE: 'free',
    PREMIUM: 'premium',
    ADMIN: 'admin',
  },

  // Subscription tiers
  SUBSCRIPTION_TIERS: {
    FREE: 'free',
    PREMIUM: 'premium',
    PROFESSIONAL: 'professional',
  },

  // Portfolio types
  PORTFOLIO_TYPES: {
    EQUITY: 'equity',
    DEMO: 'demo',
    MUTUAL_FUND: 'mutual_fund',
  },

  // Transaction types
  TRANSACTION_TYPES: {
    BUY: 'buy',
    SELL: 'sell',
    DIVIDEND: 'dividend',
    BONUS: 'bonus',
    SPLIT: 'split',
  },

  // Notification types
  NOTIFICATION_TYPES: {
    PRICE_ALERT: 'price_alert',
    NEWS: 'news',
    SYSTEM: 'system',
    PORTFOLIO: 'portfolio',
  },

  // Export formats
  EXPORT_FORMATS: {
    CSV: 'csv',
    EXCEL: 'excel',
    PDF: 'pdf',
  },

  // Cache keys
  CACHE_KEYS: {
    COMPANIES: 'companies',
    STOCK_PRICES: 'stock_prices',
    FINANCIAL_RATIOS: 'financial_ratios',
    MARKET_METRICS: 'market_metrics',
    USER_SESSION: 'user_session',
    SCREENING_RESULTS: 'screening_results',
  },

  // Cache TTL (in seconds)
  CACHE_TTL: {
    SHORT: 300,    // 5 minutes
    MEDIUM: 1800,  // 30 minutes
    LONG: 3600,    // 1 hour
    DAILY: 86400,  // 24 hours
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 1000,
  },

  // File upload limits
  FILE_LIMITS: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['csv', 'xlsx', 'xls'],
  },

  // Rate limiting
  RATE_LIMITS: {
    AUTH: {
      WINDOW_MS: 900000, // 15 minutes
      MAX_REQUESTS: 5,   // 5 attempts
    },
    API: {
      WINDOW_MS: 900000, // 15 minutes
      MAX_REQUESTS: 100, // 100 requests
    },
    EXPORT: {
      WINDOW_MS: 3600000, // 1 hour
      MAX_REQUESTS: 10,   // 10 exports
    },
  },
} as const;

export default config;