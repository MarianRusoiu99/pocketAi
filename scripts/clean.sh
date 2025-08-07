#!/bin/bash

<<<<<<< HEAD
# Clean script - removes build artifacts and optionally dependencies
set -e

# Get to project root
cd "$(dirname "$0")/.."

# Load utilities
source "scripts/utils/common.sh"

MODE=${1:-"build"}

log_section "Clean Mode - $MODE"

case $MODE in
    "build")
        log_progress "Cleaning build artifacts"
        
        if [ -f "pocketbase/pocketbase-app" ]; then
            rm -f pocketbase/pocketbase-app
            log_success "Removed pocketbase/pocketbase-app"
        fi
        
        if [ -d "client/dist" ]; then
            rm -rf client/dist
            log_success "Removed client/dist"
        fi
        ;;
        
    "deps")
        log_progress "Cleaning dependencies"
        
        if [ -d "client/node_modules" ]; then
            rm -rf client/node_modules
            log_success "Removed client/node_modules"
        fi
        
        # Clean Go mod cache (optional)
        if [ -f "pocketbase/go.sum" ]; then
            cd pocketbase && go clean -modcache && cd ..
            log_success "Cleaned Go module cache"
        fi
        ;;
        
    "all")
        log_progress "Cleaning everything"
        
        # Clean build artifacts
        [ -f "pocketbase/pocketbase-app" ] && rm -f pocketbase/pocketbase-app
        [ -d "client/dist" ] && rm -rf client/dist
        
        # Clean dependencies
        [ -d "client/node_modules" ] && rm -rf client/node_modules
        
        # Clean environment symlinks
        [ -L "pocketbase/.env.local" ] && rm -f pocketbase/.env.local
        [ -L "client/.env.local" ] && rm -f client/.env.local
        
        # Clean Go cache (optional)
        if [ -f "pocketbase/go.sum" ]; then
            cd pocketbase && go clean -modcache && cd ..
        fi
        
        log_success "All artifacts cleaned"
        ;;
        
    *)
        log_error "Usage: $0 [build|deps|all]"
        log_info "  build - Clean build artifacts only"
        log_info "  deps  - Clean node_modules and Go cache"
        log_info "  all   - Clean everything"
        exit 1
        ;;
esac

log_success "Clean complete!"
=======
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
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9
