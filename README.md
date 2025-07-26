# StockFilter Pro MVP

![StockFilter Pro](https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png)

A comprehensive stock screening platform designed to democratize stock analysis for retail investors in India. Built with React, Node.js, PostgreSQL, and Redis.

## 🚀 Features

- **Advanced Stock Screening**: Filter stocks using 25+ fundamental metrics
- **Company Profiles**: Comprehensive financial analysis and historical data
- **Portfolio Management**: Track investments and performance analytics
- **Watchlist Management**: Create and manage custom stock watchlists
- **Data Export**: Export screening results and financial data
- **Real-time Updates**: Live stock prices and market data

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React + TS    │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   Redux Toolkit │    │   Express       │    │   Redis Cache   │
│   Tailwind CSS  │    │   JWT Auth      │    │   Elasticsearch │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Router** for navigation
- **Chart.js** for data visualization

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **JWT** authentication
- **Prisma** ORM for database
- **Redis** for caching
- **Bull** for job queues

### Database
- **PostgreSQL** for primary data
- **Redis** for caching and sessions
- **Elasticsearch** for search functionality

### DevOps
- **Docker** containers
- **GitHub Actions** CI/CD
- **AWS/GCP** deployment ready

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 14+
- Redis 6+
- Git

## 🚦 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stockfilter-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Setup database**
   ```bash
   npm run db:setup
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 🔧 Development

### Project Structure
```
stockfilter-pro/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── routes/         # API routes
│   ├── prisma/             # Database schema & migrations
│   └── package.json
├── docs/                   # Documentation
└── docker-compose.yml      # Local development setup
```

### Available Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend        # Start only frontend
npm run dev:backend         # Start only backend

# Building
npm run build              # Build both applications
npm run build:frontend     # Build frontend only
npm run build:backend      # Build backend only

# Database
npm run db:setup           # Initialize database
npm run db:migrate         # Run migrations
npm run db:seed            # Seed with sample data
npm run db:reset           # Reset database

# Testing
npm run test               # Run all tests
npm run test:frontend      # Test frontend
npm run test:backend       # Test backend
npm run test:e2e           # End-to-end tests

# Linting & Formatting
npm run lint               # Lint all code
npm run format             # Format all code
```

## 🔐 Authentication

The application uses JWT-based authentication with the following features:
- Email/password registration and login
- Password reset functionality
- Protected routes and API endpoints
- Role-based access control (Free, Premium, Admin)

## 📊 API Documentation

API documentation is available at `/api-docs` when running the backend server. The API follows RESTful conventions and includes:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Companies**: `/api/companies/*`
- **Screening**: `/api/screening/*`
- **Portfolios**: `/api/portfolios/*`
- **Watchlists**: `/api/watchlists/*`

## 🔍 Database Schema

Key entities:
- **Users**: User accounts and preferences
- **Companies**: Stock master data
- **Financial Statements**: Income, balance sheet, cash flow
- **Financial Ratios**: Pre-calculated metrics
- **Portfolios**: User portfolio tracking
- **Watchlists**: Custom stock lists
- **Stock Prices**: Historical price data

## 🚀 Deployment

### Using Docker
```bash
docker-compose up -d
```

### Manual Deployment
1. Build applications: `npm run build`
2. Setup production database
3. Set environment variables
4. Start services: `npm start`

## 🧪 Testing

The project includes comprehensive testing:
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Supertest for API
- **E2E Tests**: Playwright
- **Performance Tests**: Lighthouse CI

## 📈 Performance

- **Target**: <2s page load, <3s screening results
- **Caching**: Redis for API responses and user sessions
- **Database**: Optimized indexes and query patterns
- **CDN**: Static asset delivery optimization

## 🔒 Security

- JWT authentication with refresh tokens
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- Documentation: [docs/](docs/)
- Issues: GitHub Issues
- Email: support@stockfilterpro.com

## 🗺️ Roadmap

- [ ] MVP Features (Month 1-3)
- [ ] Premium Features (Month 4-6)
- [ ] Mobile App (Month 7-9)
- [ ] AI Integration (Month 10-12)

---

**Built with ❤️ for Indian retail investors**