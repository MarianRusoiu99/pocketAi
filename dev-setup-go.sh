#!/bin/bash

# Go-based full-stack development startup script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print styled headers
print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_header "🚀 Go-based Full-Stack Development Setup"

# Check if package.json exists in root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Root package.json not found!${NC}"
    echo -e "${YELLOW}Please run this script from the project root directory.${NC}"
    exit 1
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed!${NC}"
    echo -e "${YELLOW}Please install Go 1.23+ from: https://go.dev/doc/install${NC}"
    exit 1
fi

print_header "🔧 Go Setup"

# Initialize Go module if needed
if [ ! -f "go.mod" ]; then
    echo -e "${YELLOW}📦 Initializing Go module...${NC}"
    go mod init pocket-app
fi

# Download Go dependencies
echo -e "${YELLOW}📦 Downloading Go dependencies...${NC}"
go mod tidy

# Install root dependencies
print_header "📦 Installing Root Dependencies"
npm install

# Install client dependencies
print_header "📦 Installing Client Dependencies"
cd client && npm install && cd ..

# Copy environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}📋 Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local - please configure it for your environment${NC}"
fi

# Setup Husky hooks
print_header "🪝 Setting up Git Hooks"
npx husky install

# Run type checking
print_header "🔍 Running Type Check"
npm run typecheck

# Build the frontend first for Go to serve
print_header "🏗️ Building Frontend"
npm run build:frontend

# Start the Go-based development environment
print_header "🎬 Starting Go-based Development Environment"
echo -e "${GREEN}🎯 Starting both Go-based backend and frontend...${NC}"
echo -e "${YELLOW}💡 Frontend will be available at: http://localhost:5000${NC}"
echo -e "${YELLOW}💡 PocketBase Admin will be available at: http://localhost:8090/_/admin${NC}"
echo -e "${YELLOW}💡 PocketBase API will be available at: http://localhost:8090/api${NC}"
echo -e "${YELLOW}💡 Health check: http://localhost:8090/api/health${NC}"
echo -e "${PURPLE}🛑 Press Ctrl+C to stop all services${NC}\n"

# Start both services concurrently with Go-based backend
npm run dev:go
