# PocketBase + Rivet Workflow Engine

A modern TypeScript-based application combining PocketBase as the backend database/API with Rivet for intelligent workflow automation.

## 🎯 What This Project Does

This application provides:
- **PocketBase Backend**: Database, authentication, real-time API, and admin interface
- **Rivet Integration**: Visual workflow automation for content processing, user analysis, and AI-powered features
- **TypeScript Hooks**: Event-driven business logic that triggers Rivet workflows
- **React Frontend**: Modern user interface for the application

> **🎯 Architecture Note**: This project uses a **no root package.json** architecture. All dependencies and management are handled by modular shell scripts that orchestrate the backend and frontend independently. No root-level npm commands are used.

### Key Features
- 🤖 **AI-Powered Content Processing**: Automatic content enhancement, SEO optimization, and tagging
- 👥 **User Behavior Analysis**: Intelligent user profiling and recommendation systems
- 🛡️ **Content Moderation**: Automated safety and compliance checks
- 📊 **Real-time Analytics**: Live data processing and insights
- 🔄 **Event-Driven Architecture**: Automatic workflow triggers on data changes

## 🏗️ Project Structure

```
pocket/
├── backend/                    # Complete PocketBase + TypeScript setup
│   ├── hooks/
│   │   └── main.pb.ts         # Main TypeScript entry point
│   ├── src/
│   │   ├── services/          # Business logic services
│   │   │   ├── rivet-service.ts      # Rivet workflow integration
│   │   │   ├── user-service.ts       # User management
│   │   │   └── post-service.ts       # Content management
│   │   ├── config/           # Configuration management
│   │   │   └── config.ts            # Environment-based config
│   │   ├── utils/            # Utilities
│   │   │   └── logger.ts            # Structured logging
│   │   └── types/            # TypeScript definitions
│   │       └── pocketbase.d.ts      # PocketBase type definitions
│   ├── pocketbase            # PocketBase binary
│   ├── pb_data/              # Database and storage
│   ├── main.pb.js            # Compiled JavaScript (PocketBase loads this)
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript configuration
├── client/                   # React frontend application
│   ├── src/                  # Frontend source code
│   ├── package.json          # Frontend dependencies
│   └── node_modules/         # Frontend dependencies
├── rivet/                    # Rivet workflow files
│   └── project.rivet        # Workflow definitions
├── scripts/                  # Build and development scripts
│   ├── dev.sh               # Development server
│   ├── build.sh             # Build components
│   ├── start.sh             # Production server
│   ├── setup.sh             # Project setup
│   ├── clean.sh             # Clean build artifacts
│   └── utils/               # Modular script utilities
│       ├── common.sh        # Common functions
│       └── logger.sh        # Logging utilities
└── .env.example             # Environment configuration (for both frontend & backend)
```

## � Quick Start

## 🛠️ Development

### Available Scripts

```bash
# Setup and Management
./scripts/setup.sh         # Initial project setup (run once)
./scripts/clean.sh          # Clean build artifacts and dependencies

# Development
./scripts/dev.sh backend    # Start backend development server
./scripts/dev.sh frontend   # Start frontend development server
./scripts/dev.sh both       # Start both servers concurrently

# Production
./scripts/build.sh          # Build backend (and optionally frontend)
./scripts/build.sh frontend # Build frontend only
./scripts/start.sh backend  # Start production backend server
./scripts/start.sh frontend # Start frontend preview
./scripts/start.sh both     # Start both servers concurrently
```

### Development Workflow

```bash
# First time setup
./scripts/setup.sh

# Daily development
./scripts/dev.sh both        # Start both backend + frontend
# OR separately:
./scripts/dev.sh backend     # Terminal 1: Backend only
./scripts/dev.sh frontend    # Terminal 2: Frontend only
```

### Backend Development

```bash
# Build TypeScript hooks
cd backend && npm run build

# Watch mode for development
cd backend && npm run build:watch

# Type checking only
cd backend && npm run typecheck

# Start PocketBase server
cd backend && npm run serve
```

### Frontend Development

```bash
# Start React dev server
cd client && npm run dev

# Build frontend for production
cd client && npm run build

# Preview production build
cd client && npm run preview
```
## 🌐 Access Points

- **PocketBase Admin**: http://localhost:8090/_/
- **API Health Check**: http://localhost:8090/api/health  
- **PocketBase API**: http://localhost:8090/api/
- **Frontend**: http://localhost:5173 (development)

## 🎨 Features

### Frontend Features
- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - Theme switching
- **Multi-language** - Support for 11 languages
- **Modern UI** - Built with Tailwind CSS and Radix UI
- **Type Safety** - Full TypeScript support
- **Hot Reload** - Instant development feedback

### Backend Features
- **TypeScript-Only Architecture** - Clean, modern backend code
- **Rivet Integration** - Visual workflow automation
- **Auto-generated API** - REST API for all collections  
- **Type-Safe Services** - Business logic layer in TypeScript
- **Event Hooks** - Custom TypeScript event handlers
- **Built-in Auth** - User authentication and authorization
- **Admin Interface** - Web-based database management
- **Real-time Support** - WebSocket subscriptions
- **File Storage** - Built-in file upload and storage
- **Database Migrations** - Version-controlled schema changes
- **Health Monitoring** - Built-in health check endpoint

## 🔧 Development Workflow

### Adding New Features
1. **Backend**: Add services in `backend/src/services/`
2. **Database**: Create collections via PocketBase Admin UI (http://localhost:8090/_/)
3. **Hooks**: Add event handlers in `backend/src/hooks/`
4. **Frontend**: Add components in `client/src/`
5. **Rivet**: Create workflows in `rivet/project.rivet`

### Code Quality
- **TypeScript**: Strict type checking for backend and frontend
- **ESLint**: Code linting and style enforcement
- **Prettier**: Automatic code formatting
- **Git Hooks**: Automated quality checks on commit
- **Rivet**: Visual workflow validation and testing
- **Real-time Updates** - WebSocket support
- **File Storage** - Built-in file upload/storage
- **Custom Hooks** - JavaScript hooks for business logic
- **Go Extensions** - Performance-critical features in Go
- **Admin Interface** - Web-based admin panel
- **Database Migrations** - Version-controlled schema changes

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# PocketBase Configuration
POCKETBASE_PORT=8090
POCKETBASE_HOST=0.0.0.0

# Frontend Configuration  
FRONTEND_PORT=5000
FRONTEND_HOST=localhost

# Development vs Production
NODE_ENV=development
```

### PocketBase Collections
Collections should be created and managed through the PocketBase Admin UI at http://localhost:8090/_/

Example collections you might create:
- **chat_sessions** - Chat session management
- **chat_messages** - Chat messages with user/AI distinction

When you create or modify collections through the admin interface, PocketBase automatically generates migration files that can be applied on deployment.

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Traditional VPS deployment
- Docker deployment
- Platform-as-a-Service (PaaS) options
- Environment configuration
- Security considerations

## 🤝 Development Workflow

### Code Quality
- **Husky** - Pre-commit hooks run linting and type checking
- **Commitlint** - Enforces conventional commit messages
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Stylelint** - CSS/LESS linting

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit with conventional commits
git commit -m "feat: add new component"

# Pre-commit hooks will run automatically
# Push and create PR
git push origin feature/your-feature
```

## 📚 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Query** - Data fetching
- **i18next** - Internationalization
- **Radix UI** - Accessible components

### Backend
- **PocketBase v0.28.4** - Backend-as-a-Service
- **TypeScript** - Backend programming language  
- **Rivet** - Visual workflow automation
- **SQLite** - Database
- **Modular Architecture** - Clean separation of concerns
- **Type-Safe Services** - Business logic layer

### DevOps & Tools
- **esbuild** - Fast TypeScript compilation
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message standards
- **Rivet** - Visual workflow development

## 📚 Documentation

- **[Project Status](./PROJECT_STATUS.md)** - Current implementation status
- **[API Health Check](http://localhost:8090/api/health)** - Server health endpoint
- **[PocketBase Admin](http://localhost:8090/_/)** - Database administration interface
- **[Rivet Workflows](./rivet/)** - Visual workflow definitions

## 🚀 Deployment

For production deployment:

1. **Build the TypeScript backend**:
   ```bash
   cd backend && npm run build
   ```

2. **Build the frontend**:
   ```bash
   cd client && npm run build
   ```

3. **Deploy to server**: Copy `backend/main.pb.js`, `client/dist/`, and PocketBase binary

4. **Run in production**:
   ```bash
   ./pocketbase serve --http="0.0.0.0:8090" --hooksDir="./backend"
   ```

## 🤝 Contributing

### Code Quality
- **TypeScript**: Strict type checking for backend and frontend
- **ESLint**: Code linting and style enforcement  
- **Prettier**: Automatic code formatting
- **Git Hooks**: Pre-commit hooks enforce code standards
- **Rivet**: Visual workflow validation

### Development Best Practices
- Follow TypeScript best practices and patterns
- Use meaningful commit messages (conventional commits)
- Write tests for new features
- Update documentation when needed
- Keep dependencies up to date
- Design reusable Rivet workflows

---

**Built with ❤️ using TypeScript, PocketBase, React, and Rivet**
