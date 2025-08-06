# Scripts Directory

This directory contains all the build, development, and utility scripts for the PocketBase Go extension and frontend.

## 🚀 Available Scripts

### Development
- **`./scripts/dev.sh [pocketbase|frontend|both]`** - Start development servers
- **`./scripts/setup.sh`** - Setup development environment

### Production
- **`./scripts/build.sh [frontend|all]`** - Build applications
- **`./scripts/start.sh [pocketbase]`** - Start production server

### Utilities
- **`./scripts/clean.sh [build|deps|all]`** - Clean build artifacts
- **`./scripts/setup-env.sh`** - Setup centralized environment management

## 📋 Script Details

### `dev.sh`
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
