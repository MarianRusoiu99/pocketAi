#!/bin/bash

# Environment setup script - creates symlinks for centralized env management
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Setting up centralized environment management...${NC}"

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}📝 Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
fi

# Create symlink in pocketbase if it doesn't exist
if [ ! -f "pocketbase/.env.local" ]; then
    echo -e "${YELLOW}🔗 Creating symlink: pocketbase/.env.local -> ../.env.local${NC}"
    cd pocketbase && ln -s ../.env.local .env.local && cd ..
fi

# Create symlink in client if it doesn't exist
if [ ! -f "client/.env.local" ]; then
    echo -e "${YELLOW}🔗 Creating symlink: client/.env.local -> ../.env.local${NC}"
    cd client && ln -s ../.env.local .env.local && cd ..
fi

echo -e "${GREEN}✅ Centralized environment setup complete!${NC}"
echo -e "${GREEN}📝 Edit .env.local to configure PocketBase and frontend${NC}"
