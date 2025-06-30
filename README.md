# Full-Stack Application

A modern full-stack application built with React (TypeScript + Vite) frontend and PocketBase backend.

## 🚀 Quick Start

```bash
# One-command setup and start
./dev-setup.sh
```

This will:
- Install all dependencies
- Set up Go module and dependencies
- Set up environment files
- Start both frontend and backend
- Open the application in your browser

## 📋 What's Included

### Frontend (React + TypeScript + Vite)
- ⚡ **Vite** - Lightning fast build tool
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🌐 **i18n** - Multi-language support (11 languages)
- 🧭 **React Router** - Client-side routing
- 🔍 **TypeScript** - Type safety
- 🎯 **ESLint + Prettier** - Code formatting and linting
- 🪝 **Husky** - Git hooks for code quality

### Backend (PocketBase)
- 🗄️ **SQLite Database** - Built-in database
- 🔐 **Authentication** - Built-in user management
- 📡 **REST API** - Auto-generated REST API
- 🪝 **Hooks** - Custom JavaScript hooks
- 📊 **Admin UI** - Built-in admin interface
- 🔄 **Real-time** - WebSocket support
- 🐹 **Go Extension** - Extend with Go for performance-critical features

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm 8+
- Git
- Go 1.23+

### Manual Setup

```bash
# Install dependencies
npm install

# Initialize Go module (if not exists)
go mod init pocket-app && go mod tidy

# Start development servers
npm run dev
```

### Available Scripts
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only React dev server (port 5000)
npm run dev:backend      # Start only Go-based PocketBase (port 8090)

# Building
npm run build            # Build frontend for production
npm run build:go         # Build Go-based PocketBase binary
npm run typecheck        # Run TypeScript type checking

# Code Quality
npm run lint             # Run linting
npm run lint:fix         # Fix linting issues
```

## 🌐 URLs

- **Frontend**: http://localhost:5000
- **PocketBase API**: http://localhost:8090/api
- **PocketBase Admin**: http://localhost:8090/_/admin

## 📁 Project Structure

```
/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # Internationalization
│   │   ├── lib/             # Utilities and constants
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── pb_hooks/                 # PocketBase JavaScript hooks
│   ├── main.pb.js           # Main application hooks
│   └── trump_chat.pb.js     # Chat feature hooks
├── pb_migrations/           # Database migrations
├── pb_data/                 # PocketBase data (auto-created)
├── main.go                  # Go-based PocketBase entry point
├── go.mod                   # Go module dependencies
├── pocket-app              # Built Go binary (auto-created)
├── package.json            # Root monorepo configuration
├── dev-setup.sh            # Development setup script
├── start-go-pocketbase.sh  # PocketBase startup script
└── DEPLOYMENT.md           # Deployment guide
```

## 🎨 Features

### Frontend Features
- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - Theme switching
- **Multi-language** - Support for 11 languages
- **Modern UI** - Built with Tailwind CSS and Radix UI
- **Type Safety** - Full TypeScript support
- **Hot Reload** - Instant development feedback

### Backend Features
- **Auto-generated API** - REST API for all collections
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
- **PocketBase** - Backend-as-a-Service
- **SQLite** - Database
- **JavaScript** - Custom hooks
- **Go** - High-performance extensions and custom logic
- **Go** - PocketBase core (binary)

### DevOps
- **Husky** - Git hooks
- **ESLint** - Linting
- **Prettier** - Formatting
- **Commitlint** - Commit message linting
- **Concurrently** - Run multiple commands

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for deployment help
- Review PocketBase documentation: https://pocketbase.io/docs/
- Check React/Vite documentation for frontend questions

## 🎯 Next Steps

- [ ] Add authentication to frontend
- [ ] Implement real-time features
- [ ] Add more comprehensive error handling
- [ ] Set up CI/CD pipeline
- [ ] Add tests (Jest/Vitest)
- [ ] Add Storybook for component documentation
- [ ] Implement PWA features
