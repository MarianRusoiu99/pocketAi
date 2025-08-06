#!/bin/bash

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
