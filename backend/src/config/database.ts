import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { logger } from '../utils/logger';

declare global {
  var __db__: PrismaClient | undefined;
}

// Create Prisma client with configuration
export const prisma = 
  global.__db__ || 
  new PrismaClient({
    log: config.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });

// In development, store the client on global to prevent multiple instances
if (config.isDevelopment) {
  global.__db__ = prisma;
}

// Connection function
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database health check passed');
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Graceful disconnect
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Database disconnect failed:', error);
    throw error;
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

export default prisma;