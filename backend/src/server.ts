import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import configuration and utilities
import { config } from './config/config';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import companyRoutes from './routes/companies';
import screeningRoutes from './routes/screening';
import portfolioRoutes from './routes/portfolios';
import watchlistRoutes from './routes/watchlists';
import exportRoutes from './routes/export';
import systemRoutes from './routes/system';

// Import WebSocket handlers
import { initializeWebSockets } from './websocket/socketHandler';

// Load environment variables
dotenv.config();

class StockFilterServer {
  public app: express.Application;
  public httpServer: any;
  public io: SocketIOServer;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: config.corsOrigin,
        credentials: true,
      },
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeWebSockets();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
      optionsSuccessStatus: 200,
    }));

    // Compression and logging
    this.app.use(compression());
    this.app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use(rateLimiter);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: '1.0.0',
      });
    });

    // API documentation
    if (config.swaggerEnabled) {
      const swaggerUi = require('swagger-ui-express');
      const swaggerSpec = require('./config/swagger');
      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }
  }

  private initializeRoutes(): void {
    const apiPrefix = config.apiPrefix;

    // API Routes
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/companies`, companyRoutes);
    this.app.use(`${apiPrefix}/screening`, screeningRoutes);
    this.app.use(`${apiPrefix}/portfolios`, portfolioRoutes);
    this.app.use(`${apiPrefix}/watchlists`, watchlistRoutes);
    this.app.use(`${apiPrefix}/export`, exportRoutes);
    this.app.use(`${apiPrefix}/system`, systemRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'StockFilter Pro API',
        version: '1.0.0',
        environment: config.nodeEnv,
        documentation: config.swaggerEnabled ? '/api-docs' : 'Swagger disabled',
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeWebSockets(): void {
    initializeWebSockets(this.io);
    logger.info('WebSocket server initialized');
  }

  public async start(): Promise<void> {
    try {
      // Connect to databases
      await connectDatabase();
      await connectRedis();

      // Start server
      this.httpServer.listen(this.port, () => {
        logger.info(`🚀 StockFilter Pro server running on port ${this.port}`);
        logger.info(`📊 Environment: ${config.nodeEnv}`);
        logger.info(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
        logger.info(`💖 Health Check: http://localhost:${this.port}/health`);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      this.httpServer.close(() => {
        logger.info('HTTP server closed');
        
        // Close WebSocket connections
        this.io.close(() => {
          logger.info('WebSocket server closed');
          process.exit(0);
        });
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

// Create and start server
const server = new StockFilterServer();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default server;