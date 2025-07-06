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
        
        if [ -f "backend/main.pb.js" ]; then
            rm -f backend/main.pb.js
            log_success "Removed backend/main.pb.js"
        fi
        
        if [ -d "client/dist" ]; then
            rm -rf client/dist
            log_success "Removed client/dist"
        fi
        ;;
        
    "deps")
        log_progress "Cleaning dependencies"
        
        if [ -d "backend/node_modules" ]; then
            rm -rf backend/node_modules
            log_success "Removed backend/node_modules"
        fi
        
        if [ -d "client/node_modules" ]; then
            rm -rf client/node_modules
            log_success "Removed client/node_modules"
        fi
        ;;
        
    "all")
        log_progress "Cleaning everything"
        
        # Clean build artifacts
        [ -f "backend/main.pb.js" ] && rm -f backend/main.pb.js
        [ -d "client/dist" ] && rm -rf client/dist
        
        # Clean dependencies
        [ -d "backend/node_modules" ] && rm -rf backend/node_modules
        [ -d "client/node_modules" ] && rm -rf client/node_modules
        
        # Clean environment symlinks
        [ -L "backend/.env.local" ] && rm -f backend/.env.local
        [ -L "client/.env.local" ] && rm -f client/.env.local
        
        log_success "All artifacts cleaned"
        ;;
        
    *)
        log_error "Usage: $0 [build|deps|all]"
        log_info "  build - Clean build artifacts only"
        log_info "  deps  - Clean node_modules only"
        log_info "  all   - Clean everything"
        exit 1
        ;;
esac

log_success "Clean complete!"
