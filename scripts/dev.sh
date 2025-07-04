#!/bin/bash

# Development script for Go-only PocketBase with hot reload
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔥 Starting Go-only PocketBase in development mode...${NC}"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed!${NC}"
    echo -e "${YELLOW}Please install Go 1.21+ from: https://go.dev/doc/install${NC}"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Set default port if not provided
PORT=${1:-8090}

# Check if air is installed for hot reload
if command -v air &> /dev/null; then
    echo -e "${BLUE}🌪️ Using air for hot reload...${NC}"
    echo -e "${GREEN}🌟 Starting PocketBase server on port ${PORT}...${NC}"
    echo -e "${BLUE}📱 Admin UI: http://localhost:${PORT}/_/${NC}"
    echo -e "${BLUE}🔗 API: http://localhost:${PORT}/api/${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    # Use air for hot reload
    exec air -c .air.toml -- serve \
      --http="0.0.0.0:${PORT}" \
      --dir="./pb_data" \
      --migrationsDir="./migrations" \
      --publicDir="./client/dist" \
      --automigrate=true \
      --indexFallback=true
else
    echo -e "${YELLOW}⚠️ air not found, running without hot reload${NC}"
    echo -e "${BLUE}💡 Install air for hot reload: go install github.com/cosmtrek/air@latest${NC}"
    echo -e "${GREEN}🌟 Starting PocketBase server on port ${PORT}...${NC}"
    echo -e "${BLUE}📱 Admin UI: http://localhost:${PORT}/_/${NC}"
    echo -e "${BLUE}🔗 API: http://localhost:${PORT}/api/${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    # Run directly with go run
    exec go run ./cmd/server serve \
      --http="0.0.0.0:${PORT}" \
      --dir="./pb_data" \
      --migrationsDir="./migrations" \
      --publicDir="./client/dist" \
      --automigrate=true \
      --indexFallback=true
fi
