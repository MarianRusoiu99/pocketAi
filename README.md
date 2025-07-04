# PocketBase Go-Only Application

A modern full-stack application with **React (TypeScript + Vite) frontend** and **Go-only PocketBase backend**.

## 🚀 Quick Start

```bash
# Setup the development environment
./scripts/setup.sh

# Start development mode with hot reload
./scripts/dev.sh

# Or build and start production mode
./scripts/build.sh
./scripts/start.sh
```

## ✨ Key Features

### 🎯 **Go-Only Backend Architecture**
- **No JavaScript** in backend code - pure Go implementation
- **Modular structure** with clean separation of concerns
- **PocketBase v0.28.4** with native Go extensions
- **Type-safe** services and handlers
- **Built-in migrations** and admin UI support

### 🖥️ **Frontend (React + TypeScript + Vite)**
- ⚡ **Vite** - Lightning fast build tool
- 🎨 **Tailwind CSS** - Utility-first CSS framework  
- 🌐 **i18n** - Multi-language support (11 languages)
- 🧭 **React Router** - Client-side routing
- 🔍 **TypeScript** - Type safety
- 🎯 **ESLint + Prettier** - Code formatting and linting
- 🪝 **Husky** - Git hooks for code quality

### 🔧 **Backend (Go-Only PocketBase)**
- 🗄️ **SQLite Database** - Built-in database with migrations
- 🔐 **Authentication** - Built-in user management
- 📡 **REST API** - Auto-generated REST API
- 🪝 **Go Hooks** - Custom Go event handlers (no JavaScript)
- 📊 **Admin UI** - Built-in admin interface
- 🔄 **Real-time** - WebSocket support
- 🏗️ **Modular Architecture** - Clean separation of concerns
- 🎯 **Type Safety** - Full Go type safety throughout

## 🏗️ Architecture

### Project Structure
```
pocket/
├── cmd/server/         # Main application entry point
├── internal/           # Private application code
│   ├── config/        # Configuration management
│   ├── services/      # Business logic layer
│   ├── handlers/      # Event hooks and HTTP handlers
│   └── collections/   # Database collections setup
├── pkg/               # Public reusable packages
│   ├── logger/        # Custom logging utility
│   └── response/      # HTTP response utilities
├── client/            # React frontend application
├── scripts/           # Build and development scripts
├── docs/              # Documentation
└── pb_data/           # PocketBase data directory
```

## 🛠️ Development

### Prerequisites
- **Go 1.21+** - Backend runtime
- **Node.js 18+** - Frontend development
- **npm 8+** - Package manager

### Setup & Run

```bash
# Initial setup
./scripts/setup.sh

# Development (with hot reload)
./scripts/dev.sh

# Build and run production
./scripts/build.sh
./scripts/start.sh
```

### Available Scripts
```bash
# Development
./scripts/dev.sh        # Start development server with hot reload
./scripts/start.sh      # Build and start production server
./scripts/build.sh      # Build the Go application
./scripts/test.sh       # Run tests and linting
./scripts/clean.sh      # Clean build artifacts
./scripts/setup.sh      # Setup development environment

# Frontend only
cd client && npm run dev    # Start React dev server
cd client && npm run build  # Build frontend for production
```
## 🌐 Access Points

- **Frontend**: http://localhost:5173 (development)
- **PocketBase API**: http://localhost:8090/api/
- **PocketBase Admin**: http://localhost:8090/_/

## 🎨 Features

### Frontend Features
- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - Theme switching
- **Multi-language** - Support for 11 languages
- **Modern UI** - Built with Tailwind CSS and Radix UI
- **Type Safety** - Full TypeScript support
- **Hot Reload** - Instant development feedback

### Backend Features
- **Go-Only Architecture** - No JavaScript in backend
- **Auto-generated API** - REST API for all collections
- **Type-Safe Services** - Business logic layer in Go
- **Event Hooks** - Custom Go event handlers
- **Built-in Auth** - User authentication and authorization
- **Admin Interface** - Web-based database management
- **Real-time Support** - WebSocket subscriptions
- **File Storage** - Built-in file upload and storage
- **Database Migrations** - Version-controlled schema changes

## 🔧 Development Workflow

### Adding New Features
1. **Backend**: Add services in `internal/services/`
2. **Database**: Create collections via admin UI or migrations
3. **Hooks**: Add event handlers in `internal/handlers/`
4. **Frontend**: Add components in `client/src/`

### Code Quality
- **Go**: Uses `golangci-lint` for code quality
- **Frontend**: Uses ESLint + Prettier
- **Git Hooks**: Automated code formatting on commit
- **TypeScript**: Strict type checking
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
The app includes these collections:
- **chat_sessions** - Chat session management
- **chat_messages** - Chat messages with user/AI distinction

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
- **Go** - Backend programming language (Go-only architecture)
- **SQLite** - Database
- **Modular Architecture** - Clean separation of concerns
- **Type-Safe Services** - Business logic layer

### DevOps & Tools
- **Air** - Hot reload for Go development
- **golangci-lint** - Go code linting
- **ESLint** - Frontend linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message standards

## 📚 Documentation

- **[Go Architecture Guide](./docs/GO_ARCHITECTURE.md)** - Detailed backend architecture
- **[Implementation Complete](./docs/GO_IMPLEMENTATION_COMPLETE.md)** - Implementation summary
- **[API Documentation](http://localhost:8090/_/)** - PocketBase admin interface

## 🚀 Deployment

For production deployment:

1. **Build the application**:
   ```bash
   ./scripts/build.sh
   cd client && npm run build
   ```

2. **Deploy the binary**: Copy `pocket-app` and `client/dist/` to your server

3. **Run in production**:
   ```bash
   ./pocket-app serve --http="0.0.0.0:8090" --dir="./pb_data"
   ```

## 🤝 Contributing

### Code Quality
- **Go**: Uses `golangci-lint` for linting and `go fmt` for formatting
- **Frontend**: Uses ESLint + Prettier for code quality
- **Git Hooks**: Pre-commit hooks enforce code standards
- **TypeScript**: Strict type checking enabled

### Development Best Practices
- Follow Go best practices and idioms
- Use meaningful commit messages (conventional commits)
- Write tests for new features
- Update documentation when needed
- Keep dependencies up to date

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using Go, PocketBase, React, and TypeScript**
