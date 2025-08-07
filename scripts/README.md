# Scripts Directory

<<<<<<< HEAD
This directory contains all the build, development, and utility scripts for the PocketBase Go extension and frontend.
=======
This directory contains all the build, development, and utility scripts for the Go-only PocketBase application.
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9

## 🚀 Available Scripts

### Development
<<<<<<< HEAD
- **`./scripts/dev.sh [pocketbase|frontend|both]`** - Start development servers
- **`./scripts/setup.sh`** - Setup development environment

### Production
- **`./scripts/build.sh [frontend|all]`** - Build applications
- **`./scripts/start.sh [pocketbase]`** - Start production server

### Utilities
- **`./scripts/clean.sh [build|deps|all]`** - Clean build artifacts
- **`./scripts/setup-env.sh`** - Setup centralized environment management
=======
- **`./scripts/dev.sh`** - Start development server with hot reload
- **`./scripts/setup.sh`** - Setup development environment

### Production
- **`./scripts/build.sh`** - Build the Go application
- **`./scripts/start.sh`** - Build and start production server

### Utilities
- **`./scripts/test.sh`** - Run tests and linting
- **`./scripts/clean.sh`** - Clean build artifacts
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9

## 📋 Script Details

### `dev.sh`
<<<<<<< HEAD
- **`pocketbase`** (default) - Starts PocketBase Go extension with hot reload
- **`frontend`** - Starts frontend development server (Vite)
- **`both`** - Starts both servers concurrently with log prefixes

### `setup.sh`
- Initializes Go module for PocketBase extension
- Downloads Go dependencies with `go mod tidy`
- Installs frontend Node.js dependencies
- Sets up centralized environment configuration

### `build.sh`
- **No args/`all`** - Builds PocketBase Go extension and frontend
- **`frontend`** - Builds only the frontend
- Creates optimized production builds

### `start.sh`
- **`pocketbase`** (default) - Starts built PocketBase extension
- Requires running `build.sh` first

### `clean.sh`
- **`build`** (default) - Removes build artifacts only
- **`deps`** - Cleans node_modules and Go cache
- **`all`** - Cleans everything including symlinks

### `setup-env.sh`
- Creates centralized `.env.local` file
- Sets up symlinks for both PocketBase and frontend
- Manages environment configuration across components

## 🔧 Environment Setup

The project uses centralized environment management:
- Main config: `.env.local` (root level)
- PocketBase: `pocketbase/.env.local` → `../.env.local` (symlink)
- Frontend: `client/.env.local` → `../.env.local` (symlink)

## 🏗️ Architecture

- **PocketBase Extension**: Go-based server with custom `/test` endpoint
- **Frontend**: Vite + React/Vue application
- **Development**: Concurrent servers with log separation
- **Production**: Built binaries and optimized assets
=======
- Starts the application in development mode
- Uses `air` for hot reload if available
- Falls back to `go run` if `air` is not installed
- Configures PocketBase with development settings

### `setup.sh`
- Installs all dependencies (Go and Node.js)
- Sets up development tools (`air`, `golangci-lint`)
- Creates necessary directories
- Configures `.air.toml` for hot reload

### `build.sh`
- Builds the Go application binary
- Updates dependencies with `go mod tidy`
- Creates optimized production build

### `start.sh`
- Builds and starts the production server
- Configures PocketBase for production use
- Includes all necessary flags and settings

### `test.sh`
- Runs Go tests with coverage
- Runs linting if `golangci-lint` is available
- Runs frontend tests if available

### `clean.sh`
- Removes build artifacts
- Cleans temporary files
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9
- Resets development environment

## 🔧 Usage

All scripts should be run from the project root:

```bash
# Development
./scripts/setup.sh  # First time setup
./scripts/dev.sh    # Start development

# Production
./scripts/build.sh  # Build application
./scripts/start.sh  # Start production server

# Utilities
./scripts/test.sh   # Run tests
./scripts/clean.sh  # Clean artifacts
```

## 📝 Notes

- All scripts are designed to be run from the project root directory
- Scripts use colored output for better visibility
- Error handling is included to fail fast on issues
- Scripts are compatible with both development and CI/CD environments
