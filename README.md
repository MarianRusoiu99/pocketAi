# PocketBase + Rivet Workflow Engine (Refactored)

A modern, modular application combining PocketBase as the backend database/API with Rivet for intelligent AI workflow automation. **Now with improved architecture and easier Rivet flow execution!**

## 🎯 What This Project Does

This application provides:
- **PocketBase Backend**: Database, authentication, real-time API, and admin interface
- **Rivet Integration**: Visual workflow automation for AI-powered story generation
- **Modular JavaScript Architecture**: Clean, maintainable code structure within PocketBase constraints
- **React Frontend**: Modern user interface for story generation and management

> **🏗️ New Architecture**: This project has been refactored to use a modular JavaScript-only structure that makes Rivet workflows easier to execute and maintain while respecting PocketBase's execution constraints.

### Key Features
- 🤖 **AI-Powered Story Generation**: Automatic story creation with customizable parameters
- 📚 **Story Management**: Database storage and retrieval of generated stories
- 🔄 **Automated Processing**: Stories are automatically processed with Rivet on creation
- 📊 **Real-time Monitoring**: Health checks and execution metrics
- 🛡️ **Error Handling**: Comprehensive error handling with detailed logging
- 🎨 **Modern UI**: Clean React interface for story generation

## 🏗️ Refactored Project Structure

```
pocket/
├── backend/
│   ├── pb_hooks/                    # PocketBase JavaScript hooks
│   │   ├── main.pb.js              # Main entry point (routes & hooks)
│   │   └── lib/                    # Modular business logic
│   │       ├── rivet-core.js       # Core Rivet workflow execution
│   │       ├── api-routes.js       # API route definitions
│   │       ├── response-helpers.js # Standardized API responses
│   │       └── db-helpers.js       # Database operation utilities
│   ├── pb_data/                    # Database and storage
│   ├── package.json                # Dependencies (@ironclad/rivet-cli)
│   └── pocketbase                  # PocketBase binary
├── client/                         # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── story-generator/    # Story generation UI component
│   │   └── pages/
│   │       └── stories/            # Stories page
│   └── package.json                # Frontend dependencies
├── rivet/
│   └── ai.rivet-project           # Rivet workflow definitions
├── docs/                          # Documentation
│   ├── REFACTORED_STRUCTURE.md   # Detailed architecture guide
│   └── COLLECTION_SETUP.md       # PocketBase collection setup
└── scripts/                       # Build and development scripts
```

## 🚀 Quick Start

### 1. First Time Setup
```bash
# Clone and setup the project
git clone <your-repo>
cd pocket
./scripts/setup.sh
```

### 2. Create PocketBase Collections
Before running the application, you need to create the required database collections:

1. **Start PocketBase**: `cd backend && npm run serve:dev`
2. **Open Admin Interface**: http://localhost:8090/_/
3. **Follow Collection Setup**: See [docs/COLLECTION_SETUP.md](./docs/COLLECTION_SETUP.md)

### 3. Development
```bash
# Start both backend and frontend in development mode
./scripts/dev.sh both

# Or start them separately:
./scripts/dev.sh backend    # Terminal 1: Backend only
./scripts/dev.sh frontend   # Terminal 2: Frontend only
```

## � Access Points

- **Story Generator**: http://localhost:5173/#/stories
- **PocketBase Admin**: http://localhost:8090/_/
- **API Health Check**: http://localhost:8090/api/health  
- **Frontend Home**: http://localhost:5173

## 📋 New API Endpoints

### Story Generation
- `POST /api/stories/generate` - Generate single story with Rivet
- `POST /api/stories/generate/batch` - Generate multiple stories (max 10)

### Health & Monitoring  
- `GET /api/health` - System health check
- `GET /api/rivet/health` - Rivet service health check
- `GET /api/config` - Configuration information

### Development & Testing
- `GET /api/test` - Basic functionality test
- `POST /api/rivet/test` - Rivet workflow test execution

## 🎨 Story Generation Example

### Using the Web Interface
1. Navigate to http://localhost:5173/#/stories
2. Fill in the story parameters:
   - **Story Instructions**: "Write a heartwarming story about friendship"
   - **Primary Characters**: "Emma, a curious 7-year-old girl"
   - **Secondary Characters**: "Max, her loyal golden retriever"
   - **Number of Chapters**: 3
   - **Words per Chapter**: 200
3. Click "Generate Story with Rivet"
4. Watch the real-time processing and view the generated story

### Using the API
```bash
curl -X POST http://localhost:8090/api/stories/generate \
  -H "Content-Type: application/json" \
  -d '{
    "story_instructions": "Write a fun adventure story for children",
    "primary_characters": "Alex the brave explorer and Luna the wise owl",
    "secondary_characters": "The friendly forest creatures",
    "n_chapters": 3,
    "l_chapter": 200
  }'
```

## 🛠️ Development Workflow

### Backend Development
```bash
cd backend
npm run serve:dev    # Start with detailed logging
```

### Frontend Development  
```bash
cd client
npm run dev          # Start React dev server
```

### Testing the Integration
```bash
# Test system health
curl http://localhost:8090/api/health

# Test Rivet integration
curl http://localhost:8090/api/rivet/health

# Test story generation
curl -X POST http://localhost:8090/api/stories/generate \
  -H "Content-Type: application/json" \
  -d '{"story_instructions": "Test story", "primary_characters": "Test character", "n_chapters": 1, "l_chapter": 100}'
```

## 🔧 Configuration

### Rivet Configuration
The Rivet integration is configured in `backend/pb_hooks/lib/rivet-core.js`:

```javascript
config: {
    projectPath: '../rivet/ai.rivet-project',
    defaultTimeout: 30000,
    maxRetries: 3,
    graphs: {
        storyGeneration: 'uLDGWIiCbhJiXnUV_JLQf'  // Your main graph ID
    }
}
```

### Environment Variables
Copy `.env.example` to `.env.local` and configure as needed:

```bash
# PocketBase Configuration
POCKETBASE_PORT=8090
POCKETBASE_HOST=0.0.0.0

# Frontend Configuration  
FRONTEND_PORT=5173
FRONTEND_HOST=localhost
VITE_API_URL=http://localhost:8090

# Rivet Integration
RIVET_PROJECT_PATH=./rivet/ai.rivet-project
RIVET_TIMEOUT=30000
```

## 🤖 Rivet Workflow Details

Your Rivet project (`rivet/ai.rivet-project`) contains:
- **Main Graph ID**: `uLDGWIiCbhJiXnUV_JLQf`
- **Input Parameters**: `story_instructions`, `primary_characters`, `secondary_characters`, `n_chapters`, `l_chapter`
- **Output**: JSON formatted story with title, summary, chapters, and themes

The workflow generates structured children's stories with:
- Creative titles and summaries
- Multiple chapters with subtitles
- Image prompts for illustrations
- Positive themes and lessons

## 📊 Features

### Automated Story Processing
- Stories are automatically processed with Rivet when created
- Results are stored in the database with execution metadata
- Processing never blocks story creation (graceful degradation)

### Error Handling & Monitoring
- Comprehensive error logging with structured prefixes
- Health checks for system and Rivet service status  
- Execution time tracking and performance monitoring
- Automatic cleanup of old records

### Frontend Features
- **Interactive Forms**: Easy parameter input with validation
- **Real-time Feedback**: Loading states and progress indicators
- **Error Display**: Clear error messages and troubleshooting
- **Health Monitoring**: Built-in service health checks
- **Responsive Design**: Works on desktop and mobile devices

## � Documentation

- **[Refactored Structure Guide](./docs/REFACTORED_STRUCTURE.md)** - Detailed architecture overview
- **[Collection Setup Guide](./docs/COLLECTION_SETUP.md)** - PocketBase database setup
- **[Original README](./README_ORIGINAL.md)** - Previous version documentation

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client && npm run build

# Install backend dependencies  
cd backend && npm install --production

# Run in production
cd backend && npm run serve:prod
```

### Production Checklist
- [ ] Create PocketBase collections (see docs/COLLECTION_SETUP.md)
- [ ] Install `@ironclad/rivet-cli` globally or locally
- [ ] Configure proper firewall rules for port 8090
- [ ] Set up SSL certificates and reverse proxy
- [ ] Configure log rotation and monitoring
- [ ] Test Rivet CLI in production environment

## 🐛 Troubleshooting

### Common Issues

**Rivet CLI Not Found**
```bash
npm install -g @ironclad/rivet-cli
# or locally: cd backend && npm install @ironclad/rivet-cli
```

**Collection Not Found**
- Ensure you've created the `stories` collection (see docs/COLLECTION_SETUP.md)
- Check collection name is exactly `stories` (case-sensitive)

**Module Loading Errors**
- Verify all files in `backend/pb_hooks/lib/` have proper `module.exports`
- Check file paths in `require()` statements use `${__hooks}` prefix

**Story Generation Fails**
- Check `/api/rivet/health` endpoint
- Verify Rivet project file exists at `../rivet/ai.rivet-project`
- Test with `/api/rivet/test` endpoint

### Debug Mode
```bash
cd backend && npm run serve:dev  # Enables detailed logging
```

## 🔮 Future Improvements

- **WebSocket Integration**: Real-time story generation progress
- **User Authentication**: Multi-user story management
- **Template System**: Pre-defined story templates  
- **Export Options**: PDF, EPUB, and other format exports
- **Analytics Dashboard**: Story generation metrics
- **Batch Processing**: Queue system for large story batches

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the modular architecture patterns in `backend/pb_hooks/lib/`
4. Test your changes with both API and frontend
5. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
6. Push and create a Pull Request

## 📚 Tech Stack

### Backend
- **PocketBase v0.28.4** - Backend-as-a-Service
- **JavaScript (ES5)** - PocketBase-compatible scripting  
- **Rivet CLI** - AI workflow execution
- **SQLite** - Database

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing

---

**Built with ❤️ using PocketBase, Rivet, React, and modern JavaScript patterns**

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
./scripts/dev.sh both       # Start both servers concurrently (aggregated output)

# Production
./scripts/build.sh          # Build backend (and optionally frontend)
./scripts/build.sh frontend # Build frontend only
./scripts/start.sh backend  # Start production backend server
./scripts/start.sh frontend # Start frontend preview
./scripts/start.sh both     # Start both servers concurrently (aggregated output)
```

### Development Workflow

```bash
# First time setup
./scripts/setup.sh

# Daily development (choose one):
./scripts/dev.sh both        # Start both backend + frontend (aggregated output)
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
