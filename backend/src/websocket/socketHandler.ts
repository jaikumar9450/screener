import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { verifyJWT } from '../utils/jwt';
import { prisma } from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export function initializeWebSockets(io: SocketIOServer): void {
  // Authentication middleware for WebSocket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyJWT(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return next(new Error('Invalid user'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info('WebSocket client connected:', {
      socketId: socket.id,
      userId: socket.userId,
      userAgent: socket.handshake.headers['user-agent'],
    });

    // Join user-specific room for notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle stock price subscriptions
    socket.on('subscribe:stock:prices', (symbols: string[]) => {
      if (!Array.isArray(symbols) || symbols.length === 0) {
        socket.emit('error', { message: 'Invalid symbols provided' });
        return;
      }

      symbols.forEach(symbol => {
        socket.join(`stock:${symbol}`);
      });

      logger.debug('User subscribed to stock prices:', {
        userId: socket.userId,
        symbols,
      });

      socket.emit('subscription:confirmed', { type: 'stock:prices', symbols });
    });

    // Handle stock price unsubscriptions
    socket.on('unsubscribe:stock:prices', (symbols: string[]) => {
      if (!Array.isArray(symbols)) {
        socket.emit('error', { message: 'Invalid symbols provided' });
        return;
      }

      symbols.forEach(symbol => {
        socket.leave(`stock:${symbol}`);
      });

      socket.emit('unsubscription:confirmed', { type: 'stock:prices', symbols });
    });

    // Handle portfolio updates subscription
    socket.on('subscribe:portfolio:updates', () => {
      if (socket.userId) {
        socket.join(`portfolio:${socket.userId}`);
        socket.emit('subscription:confirmed', { type: 'portfolio:updates' });
      }
    });

    // Handle market alerts subscription
    socket.on('subscribe:market:alerts', () => {
      socket.join('market:alerts');
      socket.emit('subscription:confirmed', { type: 'market:alerts' });
    });

    // Handle screening updates
    socket.on('subscribe:screening:updates', (screenId: string) => {
      if (screenId) {
        socket.join(`screening:${screenId}`);
        socket.emit('subscription:confirmed', { type: 'screening:updates', screenId });
      }
    });

    // Handle ping for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected:', {
        socketId: socket.id,
        userId: socket.userId,
        reason,
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('WebSocket error:', {
        socketId: socket.id,
        userId: socket.userId,
        error: error.message,
      });
    });
  });

  // Utility functions for broadcasting
  const broadcastStockPriceUpdate = (symbol: string, priceData: any) => {
    io.to(`stock:${symbol}`).emit('stock:price:update', {
      symbol,
      ...priceData,
      timestamp: Date.now(),
    });
  };

  const broadcastMarketAlert = (alert: any) => {
    io.to('market:alerts').emit('market:alert', {
      ...alert,
      timestamp: Date.now(),
    });
  };

  const sendUserNotification = (userId: string, notification: any) => {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: Date.now(),
    });
  };

  const broadcastPortfolioUpdate = (userId: string, update: any) => {
    io.to(`portfolio:${userId}`).emit('portfolio:update', {
      ...update,
      timestamp: Date.now(),
    });
  };

  const broadcastScreeningUpdate = (screenId: string, update: any) => {
    io.to(`screening:${screenId}`).emit('screening:update', {
      ...update,
      timestamp: Date.now(),
    });
  };

  // Export broadcast functions
  (global as any).webSocketBroadcast = {
    stockPriceUpdate: broadcastStockPriceUpdate,
    marketAlert: broadcastMarketAlert,
    userNotification: sendUserNotification,
    portfolioUpdate: broadcastPortfolioUpdate,
    screeningUpdate: broadcastScreeningUpdate,
  };

  logger.info('WebSocket server initialized successfully');
}

// Helper function to verify JWT token
function verifyJWT(token: string): { userId: string } {
  // This should use your JWT verification utility
  // For now, return a mock implementation
  return { userId: 'mock-user-id' };
}