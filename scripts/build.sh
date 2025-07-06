#!/bin/bash

# Build script - Build both frontend and backend
set -e

# Get to project root
cd "$(dirname "$0")/.."

# Load utilities
source "scripts/utils/common.sh"

log_section "Building Project"

ensure_project_root
setup_env

# Build backend
if [ ! -d "backend/node_modules" ]; then
    install_deps "backend"
fi
build_component "backend"

# Build frontend if requested or if no specific component is requested
if [ "$1" = "frontend" ] || [ "$1" = "all" ] || [ -z "$1" ]; then
    if [ -d "client" ]; then
        if [ ! -d "client/node_modules" ]; then
            install_deps "client"
        fi
        build_component "client"
        log_success "Frontend built: client/dist/"
    fi
fi

log_section "Build Complete"
log_success "Backend built: backend/main.pb.js"
