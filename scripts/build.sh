#!/bin/bash

<<<<<<< HEAD
# Build script - Build frontend and PocketBase Go extension
set -e

# Get to project root
cd "$(dirname "$0")/.."

# Load utilities
source "scripts/utils/common.sh"

log_section "Building Project"

ensure_project_root
setup_env

# Build PocketBase Go extension
log_build "Building PocketBase Go extension"
cd pocketbase
if [ ! -f "go.mod" ]; then
    log_info "Initializing Go module..."
    go mod init pocketbase-extension
fi
if [ ! -f "go.sum" ]; then
    log_info "Downloading Go dependencies..."
    go mod tidy
fi
go build -o pocketbase-app .
cd ..
log_success "PocketBase extension built: pocketbase/pocketbase-app"

# Build frontend if requested or if no specific component is requested
if [ "$1" = "frontend" ] || [ "$1" = "all" ] || [ -z "$1" ]; then
    if [ -d "client" ]; then
        if [ ! -d "client/node_modules" ]; then
            install_deps "client"
        fi
        build_component "client"
        log_success "Frontend built: client/dist/"
    fi
fi

log_section "Build Complete"
=======
# Build the Go-only PocketBase application
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔨 Building Go-only PocketBase application...${NC}"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed!${NC}"
    echo -e "${YELLOW}Please install Go 1.21+ from: https://go.dev/doc/install${NC}"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Clean previous build
if [ -f "pocket-app" ]; then
    echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
    rm -f pocket-app
fi

# Update dependencies
echo -e "${BLUE}📦 Updating Go dependencies...${NC}"
go mod tidy

# Build the application
echo -e "${BLUE}🔨 Building Go application...${NC}"
if ! go build -o pocket-app ./cmd/server; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful! Binary created: pocket-app${NC}"
echo -e "${BLUE}💡 Run with: ./pocket-app serve${NC}"
echo -e "${BLUE}💡 Or use: ./scripts/start.sh${NC}"
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9
