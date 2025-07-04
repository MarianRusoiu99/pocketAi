#!/bin/bash

# Go-based PocketBase startup script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Go-based PocketBase...${NC}"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed!${NC}"
    echo -e "${YELLOW}Please install Go 1.23+ from: https://go.dev/doc/install${NC}"
    exit 1
fi

# Check if go.mod exists
if [ ! -f "go.mod" ]; then
    echo -e "${YELLOW}📦 Initializing Go module...${NC}"
    go mod init pocket-app
fi

# Download dependencies
echo -e "${YELLOW}📦 Downloading Go dependencies...${NC}"
go mod tidy

# Set default values
PORT=${PORT:-8092}
HOST=${HOST:-0.0.0.0}

echo -e "${GREEN}📡 Starting Go-based PocketBase on http://${HOST}:${PORT}${NC}"
echo -e "${GREEN}📊 Admin UI will be available at http://${HOST}:${PORT}/_/admin${NC}"
echo -e "${GREEN}📡 API will be available at http://${HOST}:${PORT}/api${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop${NC}"

# Start the Go application
go run main.go serve \
    --http="${HOST}:${PORT}" \
    --hooksDir="./pb_hooks" \
    --migrationsDir="./pb_migrations" \
    --publicDir="./client/dist"
