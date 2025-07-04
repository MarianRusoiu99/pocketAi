#!/bin/bash

# Clean build artifacts and temporary files
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧹 Cleaning build artifacts and temporary files...${NC}"

# Navigate to project root
cd "$(dirname "$0")/.."

# Remove Go binary
if [ -f "pocket-app" ]; then
    echo -e "${BLUE}🗑️  Removing Go binary...${NC}"
    rm -f pocket-app
fi

# Remove tmp directory (air hot reload)
if [ -d "tmp" ]; then
    echo -e "${BLUE}🗑️  Removing tmp directory...${NC}"
    rm -rf tmp
fi

# Remove build logs
if [ -f "build-errors.log" ]; then
    echo -e "${BLUE}🗑️  Removing build logs...${NC}"
    rm -f build-errors.log
fi

# Clean Go module cache (optional)
echo -e "${BLUE}🧹 Cleaning Go module cache...${NC}"
go clean -modcache 2>/dev/null || echo -e "${YELLOW}⚠️ Could not clean Go module cache${NC}"

# Clean frontend build artifacts
if [ -d "client/dist" ]; then
    echo -e "${BLUE}🗑️  Removing frontend build...${NC}"
    rm -rf client/dist
fi

if [ -d "client/node_modules/.cache" ]; then
    echo -e "${BLUE}🗑️  Removing frontend cache...${NC}"
    rm -rf client/node_modules/.cache
fi

# Clean logs directory but keep the directory
if [ -d "logs" ]; then
    echo -e "${BLUE}🗑️  Cleaning logs...${NC}"
    rm -f logs/*.log
fi

echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo -e "${BLUE}💡 Run ./scripts/build.sh to rebuild the application${NC}"
