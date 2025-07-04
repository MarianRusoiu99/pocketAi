# Scripts Directory

This directory contains all the build, development, and utility scripts for the Go-only PocketBase application.

## 🚀 Available Scripts

### Development
- **`./scripts/dev.sh`** - Start development server with hot reload
- **`./scripts/setup.sh`** - Setup development environment

### Production
- **`./scripts/build.sh`** - Build the Go application
- **`./scripts/start.sh`** - Build and start production server

### Utilities
- **`./scripts/test.sh`** - Run tests and linting
- **`./scripts/clean.sh`** - Clean build artifacts

## 📋 Script Details

### `dev.sh`
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
