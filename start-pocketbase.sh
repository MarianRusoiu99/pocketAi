#!/bin/bash

# PocketBase startup script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting PocketBase...${NC}"

# Check if pocketbase binary exists
if [ ! -f "./pocketbase" ]; then
    echo -e "${RED}❌ PocketBase binary not found!${NC}"
    echo -e "${YELLOW}Please download PocketBase from: https://pocketbase.io/docs/${NC}"
    echo -e "${YELLOW}Or run: ./download-pocketbase.sh${NC}"
    exit 1
fi

# Make sure pocketbase is executable
chmod +x ./pocketbase

# Set default port if not specified
PORT=${PORT:-8090}
HOST=${HOST:-0.0.0.0}

echo -e "${GREEN}📡 Starting PocketBase on http://${HOST}:${PORT}${NC}"
echo -e "${GREEN}📊 Admin UI will be available at http://${HOST}:${PORT}/_/admin${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop${NC}"

# Start PocketBase with hooks and migrations
./pocketbase serve \
    --http="${HOST}:${PORT}" \
    --dir="./pb_data" \
    --hooksDir="./pb_hooks" \
    --migrationsDir="./pb_migrations"
