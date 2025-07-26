import { createClient, RedisClientType } from 'redis';
import { config, CONSTANTS } from './config';
import { logger } from '../utils/logger';

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis: Too many reconnection attempts, giving up');
            return new Error('Too many reconnection attempts');
          }
          return Math.min(retries * 50, 2000);
        },
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('🔗 Redis: Connecting...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('✅ Redis: Connected and ready');
    });

    this.client.on('error', (error) => {
      logger.error('❌ Redis error:', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('🔌 Redis: Connection ended');
    });

    this.client.on('reconnecting', () => {
      logger.info('🔄 Redis: Reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      logger.info('✅ Redis connected successfully');
    } catch (error) {
      logger.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      logger.info('✅ Redis disconnected successfully');
    } catch (error) {
      logger.error('❌ Redis disconnect failed:', error);
      throw error;
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected;
  }

  // Cache methods
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      
      if (ttl) {
        await this.client.setEx(cacheKey, ttl, serializedValue);
      } else {
        await this.client.set(cacheKey, serializedValue);
      }
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      const value = await this.client.get(cacheKey);
      
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      await this.client.del(cacheKey);
    } catch (error) {
      logger.error('Redis del error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      const result = await this.client.exists(cacheKey);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      await this.client.expire(cacheKey, ttl);
    } catch (error) {
      logger.error('Redis expire error:', error);
      throw error;
    }
  }

  // Session methods
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    try {
      const sessionKey = `${config.redis.sessionPrefix}${sessionId}`;
      const serializedData = JSON.stringify(data);
      await this.client.setEx(sessionKey, ttl, serializedData);
    } catch (error) {
      logger.error('Redis setSession error:', error);
      throw error;
    }
  }

  async getSession<T = any>(sessionId: string): Promise<T | null> {
    try {
      const sessionKey = `${config.redis.sessionPrefix}${sessionId}`;
      const data = await this.client.get(sessionKey);
      
      if (!data) return null;
      
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error('Redis getSession error:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessionKey = `${config.redis.sessionPrefix}${sessionId}`;
      await this.client.del(sessionKey);
    } catch (error) {
      logger.error('Redis deleteSession error:', error);
      throw error;
    }
  }

  // Pattern-based operations
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      await this.client.del(keys);
      return keys.length;
    } catch (error) {
      logger.error('Redis deletePattern error:', error);
      throw error;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      return await this.client.lPush(cacheKey, values);
    } catch (error) {
      logger.error('Redis lpush error:', error);
      throw error;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      return await this.client.rPop(cacheKey);
    } catch (error) {
      logger.error('Redis rpop error:', error);
      return null;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      return await this.client.sAdd(cacheKey, members);
    } catch (error) {
      logger.error('Redis sadd error:', error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      return await this.client.sMembers(cacheKey);
    } catch (error) {
      logger.error('Redis smembers error:', error);
      return [];
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      return await this.client.hSet(cacheKey, field, value);
    } catch (error) {
      logger.error('Redis hset error:', error);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | undefined> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      return await this.client.hGet(cacheKey, field);
    } catch (error) {
      logger.error('Redis hget error:', error);
      return undefined;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      const cacheKey = `${config.redis.cachePrefix}${key}`;
      return await this.client.hGetAll(cacheKey);
    } catch (error) {
      logger.error('Redis hgetall error:', error);
      return {};
    }
  }

  // Health check
  async ping(): Promise<string> {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error('Redis ping error:', error);
      throw error;
    }
  }

  // Flush operations (use with caution)
  async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
      logger.warn('⚠️ Redis: All data flushed');
    } catch (error) {
      logger.error('Redis flushAll error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

// Export connection function
export async function connectRedis(): Promise<void> {
  await redisClient.connect();
}

// Export disconnect function
export async function disconnectRedis(): Promise<void> {
  await redisClient.disconnect();
}

// Export client instance
export const redis = redisClient;

// Cache utility functions
export const cache = {
  // Company cache
  companies: {
    set: (data: any, ttl = CONSTANTS.CACHE_TTL.DAILY) => 
      redis.set(CONSTANTS.CACHE_KEYS.COMPANIES, data, ttl),
    get: () => redis.get(CONSTANTS.CACHE_KEYS.COMPANIES),
    del: () => redis.del(CONSTANTS.CACHE_KEYS.COMPANIES),
  },

  // Stock prices cache
  stockPrices: {
    set: (symbol: string, data: any, ttl = CONSTANTS.CACHE_TTL.SHORT) => 
      redis.set(`${CONSTANTS.CACHE_KEYS.STOCK_PRICES}:${symbol}`, data, ttl),
    get: (symbol: string) => 
      redis.get(`${CONSTANTS.CACHE_KEYS.STOCK_PRICES}:${symbol}`),
    del: (symbol: string) => 
      redis.del(`${CONSTANTS.CACHE_KEYS.STOCK_PRICES}:${symbol}`),
  },

  // Financial ratios cache
  ratios: {
    set: (companyId: string, data: any, ttl = CONSTANTS.CACHE_TTL.DAILY) => 
      redis.set(`${CONSTANTS.CACHE_KEYS.FINANCIAL_RATIOS}:${companyId}`, data, ttl),
    get: (companyId: string) => 
      redis.get(`${CONSTANTS.CACHE_KEYS.FINANCIAL_RATIOS}:${companyId}`),
    del: (companyId: string) => 
      redis.del(`${CONSTANTS.CACHE_KEYS.FINANCIAL_RATIOS}:${companyId}`),
  },

  // Screening results cache
  screening: {
    set: (filterHash: string, data: any, ttl = CONSTANTS.CACHE_TTL.MEDIUM) => 
      redis.set(`${CONSTANTS.CACHE_KEYS.SCREENING_RESULTS}:${filterHash}`, data, ttl),
    get: (filterHash: string) => 
      redis.get(`${CONSTANTS.CACHE_KEYS.SCREENING_RESULTS}:${filterHash}`),
    del: (filterHash: string) => 
      redis.del(`${CONSTANTS.CACHE_KEYS.SCREENING_RESULTS}:${filterHash}`),
  },
};

export default redis;