#!/bin/bash

# PocketBase download script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 PocketBase Download Script${NC}"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names
case $ARCH in
    x86_64) ARCH="amd64" ;;
    aarch64) ARCH="arm64" ;;
    arm64) ARCH="arm64" ;;
    *) 
        echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"
        exit 1
        ;;
esac

# Map OS names
case $OS in
    linux) OS="linux" ;;
    darwin) OS="darwin" ;;
    *) 
        echo -e "${RED}❌ Unsupported OS: $OS${NC}"
        exit 1
        ;;
esac

# Get latest version from GitHub API
echo -e "${YELLOW}🔍 Fetching latest PocketBase version...${NC}"
LATEST_VERSION=$(curl -s https://api.github.com/repos/pocketbase/pocketbase/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' | sed 's/v//')

if [ -z "$LATEST_VERSION" ]; then
    echo -e "${RED}❌ Failed to fetch latest version${NC}"
    exit 1
fi

echo -e "${GREEN}📋 Latest version: ${LATEST_VERSION}${NC}"
echo -e "${GREEN}🎯 Target: ${OS}_${ARCH}${NC}"

# Download URL
DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${LATEST_VERSION}/pocketbase_${LATEST_VERSION}_${OS}_${ARCH}.zip"

echo -e "${YELLOW}⬇️  Downloading PocketBase...${NC}"
echo -e "${BLUE}URL: ${DOWNLOAD_URL}${NC}"

# Download the zip file
curl -L -o pocketbase.zip "$DOWNLOAD_URL"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Download failed${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Extracting PocketBase...${NC}"

# Extract the binary
unzip -o pocketbase.zip pocketbase

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Extraction failed${NC}"
    rm -f pocketbase.zip
    exit 1
fi

# Make it executable
chmod +x pocketbase

# Clean up
rm -f pocketbase.zip

echo -e "${GREEN}✅ PocketBase ${LATEST_VERSION} installed successfully!${NC}"
echo -e "${GREEN}🚀 Run './start-pocketbase.sh' to start the server${NC}"
echo -e "${GREEN}📚 Visit https://pocketbase.io/docs/ for documentation${NC}"
