# StockFilter Pro - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Git

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd stockfilter-pro

# Run setup script
./scripts/setup.sh

# Start database services with Docker
docker-compose up -d postgres redis

# Setup database
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs
- **Prisma Studio**: http://localhost:5555 (run `npm run db:studio`)

## 📁 Project Structure

```
stockfilter-pro/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # Database, Redis, app configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utility functions
│   │   ├── websocket/        # WebSocket handlers
│   │   └── server.ts         # Main server file
│   ├── prisma/               # Database schema & migrations
│   └── package.json
├── frontend/                  # React + TypeScript
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── main.tsx         # App entry point
│   └── package.json
├── scripts/                  # Development scripts
├── docker-compose.yml        # Local development services
└── package.json             # Root package.json
```

## 🛠 Development Workflow

### Backend Development

1. **Database Changes**
   ```bash
   # Edit prisma/schema.prisma
   npm run db:migrate    # Create migration
   npm run db:generate   # Update Prisma client
   ```

2. **Adding New API Endpoints**
   ```bash
   # 1. Create route in src/routes/
   # 2. Create controller in src/controllers/
   # 3. Add business logic in src/services/
   # 4. Test with Postman or API client
   ```

3. **Testing**
   ```bash
   npm run test          # Run tests
   npm run test:watch    # Watch mode
   npm run test:coverage # Coverage report
   ```

### Frontend Development

1. **Component Development**
   ```bash
   # Create components in src/components/
   # Use TypeScript for type safety
   # Follow naming conventions: PascalCase
   ```

2. **State Management**
   ```bash
   # Redux slices in src/store/slices/
   # React Query for server state
   # Local state with useState/useReducer
   ```

3. **Styling**
   ```bash
   # Tailwind CSS utility classes
   # Custom components in tailwind.config.js
   # Responsive design first
   ```

## 🗄 Database

### Schema Overview
- **Users**: Authentication and user management
- **Companies**: Stock master data
- **Financial Data**: Statements, ratios, market metrics
- **User Activity**: Portfolios, watchlists, screens

### Key Models
```prisma
// User management
model User {
  id               String @id @default(cuid())
  email            String @unique
  // ... other fields
}

// Stock data
model Company {
  id          String @id @default(cuid())
  symbol      String @unique
  companyName String
  // ... other fields
}

// Financial metrics
model FinancialRatio {
  id        String @id @default(cuid())
  companyId String
  peRatio   Decimal?
  pbRatio   Decimal?
  // ... other ratios
}
```

### Migrations
```bash
npm run db:migrate     # Create and apply migration
npm run db:reset       # Reset database
npm run db:seed        # Seed with sample data
npm run db:studio      # Open Prisma Studio
```

## 🔧 Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/stockfilter_db"
REDIS_URL="redis://:redis123@localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_NODE_ENV=development
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Jest for individual functions
- **Integration Tests**: API endpoint testing
- **Database Tests**: In-memory database

### Frontend Testing
- **Unit Tests**: React Testing Library
- **Component Tests**: Storybook (future)
- **E2E Tests**: Playwright (future)

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
GET  /api/auth/me          - Get current user
```

### Core Endpoints
```
GET  /api/companies        - List companies
GET  /api/companies/:id    - Get company details
POST /api/screening        - Execute stock screen
GET  /api/portfolios       - User portfolios
POST /api/watchlists       - Create watchlist
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": { ... }  // For paginated results
}
```

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Brand blue, success green, error red
- **Typography**: Inter font family
- **Spacing**: 4px base unit (Tailwind spacing)
- **Components**: Headless UI for accessibility

### Component Library
```tsx
// Button variations
<Button variant="primary" size="lg">Primary</Button>
<Button variant="secondary" size="md">Secondary</Button>

// Input components
<Input label="Email" type="email" required />
<Select options={options} placeholder="Select..." />

// Data display
<Table data={data} columns={columns} />
<Chart type="line" data={chartData} />
```

### Responsive Design
- **Mobile First**: Design for mobile, enhance for desktop
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Targets**: Minimum 44px for interactive elements

## 🚀 Performance Optimization

### Backend
- **Database Indexing**: Optimized for screening queries
- **Redis Caching**: API responses and user sessions
- **Rate Limiting**: Prevent abuse and ensure stability
- **Compression**: Gzip compression for responses

### Frontend
- **Code Splitting**: Lazy loading for routes and components
- **Bundle Optimization**: Tree shaking and chunk splitting
- **Image Optimization**: WebP format, lazy loading
- **Caching**: Service worker for offline functionality

## 🔐 Security Measures

### Authentication
- **JWT Tokens**: Access (15min) + Refresh (7days)
- **Password Hashing**: bcrypt with 12 rounds
- **Session Management**: Redis-based sessions

### API Security
- **Rate Limiting**: Per-user and per-IP limits
- **Input Validation**: Joi schemas for all inputs
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers

### Database Security
- **SQL Injection**: Prisma ORM prevents injection
- **Data Encryption**: Sensitive data encrypted at rest
- **Access Control**: Role-based permissions

## 📈 Monitoring & Logging

### Logging
- **Winston**: Structured logging with levels
- **Request Logging**: All API requests logged
- **Error Tracking**: Detailed error information
- **Performance**: Slow query detection

### Health Checks
```bash
GET /health              # Application health
GET /api/health/db      # Database connectivity
GET /api/health/redis   # Redis connectivity
```

## 🐳 Docker Development

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis

# View logs
docker-compose logs -f postgres

# Stop services
docker-compose down
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d stockfilter_db

# Connect to Redis
docker-compose exec redis redis-cli
```

## 🔄 Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature development
- **hotfix/***: Critical fixes

### Commit Convention
```
feat: add user authentication
fix: resolve portfolio calculation bug
docs: update API documentation
style: format code with prettier
refactor: restructure screening service
test: add unit tests for auth service
```

### Pull Request Process
1. Create feature branch from develop
2. Implement feature with tests
3. Update documentation
4. Create pull request
5. Code review and merge

## 📝 Code Style Guidelines

### TypeScript
- **Strict Mode**: All TypeScript strict options enabled
- **Interfaces**: Prefer interfaces over types
- **Naming**: PascalCase for components, camelCase for functions
- **Exports**: Named exports preferred

### React
- **Functional Components**: Use hooks instead of classes
- **Custom Hooks**: Extract reusable logic
- **Props Typing**: Always type component props
- **Error Boundaries**: Wrap components appropriately

### Database
- **Naming**: camelCase for fields, PascalCase for models
- **Indexes**: Add indexes for frequently queried fields
- **Relations**: Use appropriate cascade options
- **Migrations**: Never edit existing migrations

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check connection string in .env
   DATABASE_URL="postgresql://..."
   ```

2. **Redis Connection Error**
   ```bash
   # Check if Redis is running
   docker-compose ps redis
   
   # Test Redis connection
   redis-cli ping
   ```

3. **Frontend Build Error**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **API 404 Errors**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/health
   
   # Check proxy configuration in vite.config.ts
   ```

### Debug Mode
```bash
# Backend debug
DEBUG=* npm run dev

# Frontend debug
VITE_DEBUG_MODE=true npm run dev
```

## 📚 Additional Resources

### Documentation
- [Prisma Docs](https://www.prisma.io/docs/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Express.js Docs](https://expressjs.com/)

### Tools
- **Prisma Studio**: Database GUI
- **Redux DevTools**: State debugging
- **React DevTools**: Component debugging
- **Postman**: API testing

### Learning Resources
- TypeScript Handbook
- React Best Practices
- Node.js Security Checklist
- Database Design Principles

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy Development! 🎉**

For questions or support, please check the [main README](README.md) or open an issue.