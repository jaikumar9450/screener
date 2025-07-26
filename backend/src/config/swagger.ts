import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StockFilter Pro API',
      version: '1.0.0',
      description: 'Advanced Stock Screening Platform API for Indian Markets',
      contact: {
        name: 'StockFilter Pro Team',
        email: 'support@stockfilterpro.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: config.isDevelopment 
          ? `http://localhost:${config.port}` 
          : 'https://api.stockfilterpro.com',
        description: config.isDevelopment ? 'Development server' : 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for API authentication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                },
                code: {
                  type: 'string',
                },
                statusCode: {
                  type: 'integer',
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
        PaginatedResponse: {
          allOf: [
            { $ref: '#/components/schemas/SuccessResponse' },
            {
              type: 'object',
              properties: {
                pagination: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'integer',
                      example: 1,
                    },
                    limit: {
                      type: 'integer',
                      example: 50,
                    },
                    total: {
                      type: 'integer',
                      example: 1000,
                    },
                    totalPages: {
                      type: 'integer',
                      example: 20,
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User management operations',
      },
      {
        name: 'Companies',
        description: 'Stock company data and information',
      },
      {
        name: 'Screening',
        description: 'Stock screening and filtering operations',
      },
      {
        name: 'Portfolios',
        description: 'Portfolio management and tracking',
      },
      {
        name: 'Watchlists',
        description: 'Watchlist creation and management',
      },
      {
        name: 'Export',
        description: 'Data export operations',
      },
      {
        name: 'System',
        description: 'System information and health checks',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;