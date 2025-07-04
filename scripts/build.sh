#!/bin/bash

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
