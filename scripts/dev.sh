#!/bin/bash

# Development script for TypeScript-only PocketBase with Rivet integration
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔥 Starting PocketBase with TypeScript hooks and Rivet integration...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from: https://nodejs.org/${NC}"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Set default port if not provided
PORT=${1:-8090}

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

# Build TypeScript hooks
echo -e "${BLUE}🔧 Building TypeScript hooks...${NC}"
cd backend && npm run build && cd ..

# Check if PocketBase binary exists
if [ ! -f "pocketbase" ]; then
    echo -e "${YELLOW}⚠️ PocketBase binary not found. Downloading...${NC}"
    
    # Detect OS and architecture
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    
    case $ARCH in
        x86_64) ARCH="amd64" ;;
        arm64) ARCH="arm64" ;;
        aarch64) ARCH="arm64" ;;
        *) echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"; exit 1 ;;
    esac
    
    # Download PocketBase
    VERSION="0.22.20"
    FILENAME="pocketbase_${VERSION}_${OS}_${ARCH}.zip"
    URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/${FILENAME}"
    
    echo -e "${BLUE}📥 Downloading PocketBase v${VERSION} for ${OS}_${ARCH}...${NC}"
    curl -L -o "$FILENAME" "$URL"
    unzip "$FILENAME"
    rm "$FILENAME"
    chmod +x pocketbase
    
    echo -e "${GREEN}✅ PocketBase downloaded successfully${NC}"
fi

# Create necessary directories
mkdir -p pb_data
mkdir -p pb_data/storage
mkdir -p rivet

# Create sample Rivet project if it doesn't exist
if [ ! -f "rivet/project.rivet" ]; then
    echo -e "${YELLOW}📝 Creating sample Rivet project...${NC}"
    mkdir -p rivet
    cat > rivet/project.rivet << 'EOF'
{
  "metadata": {
    "id": "sample-project",
    "title": "Sample Rivet Project",
    "description": "Sample project for PocketBase integration"
  },
  "graphs": {
    "content-processor": {
      "metadata": {
        "name": "Content Processor",
        "description": "Processes content and generates metadata"
      },
      "nodes": []
    },
    "user-analyzer": {
      "metadata": {
        "name": "User Analyzer", 
        "description": "Analyzes user behavior and preferences"
      },
      "nodes": []
    }
  }
}
EOF
    echo -e "${GREEN}✅ Sample Rivet project created at rivet/project.rivet${NC}"
fi

# Start PocketBase with TypeScript hooks
echo -e "${GREEN}🌟 Starting PocketBase server on port ${PORT}...${NC}"
echo -e "${BLUE}📱 Admin UI: http://localhost:${PORT}/_/${NC}"
echo -e "${BLUE}🔗 API: http://localhost:${PORT}/api/${NC}"
echo -e "${BLUE}🤖 Rivet integration: ENABLED${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Run PocketBase with TypeScript hooks
exec ./pocketbase serve \
  --http="0.0.0.0:${PORT}" \
  --dir="./pb_data" \
  --hooksDir="./backend" \
  --hooksWatch=true \
  --publicDir="./client/dist" \
  --indexFallback=true
