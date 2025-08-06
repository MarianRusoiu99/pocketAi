#!/bin/bash

# Build script - Build frontend and PocketBase Go extension
set -e

# Get to project root
cd "$(dirname "$0")/.."

# Load utilities
source "scripts/utils/common.sh"

log_section "Building Project"

ensure_project_root
setup_env

# Build PocketBase Go extension
log_build "Building PocketBase Go extension"
cd pocketbase
if [ ! -f "go.mod" ]; then
    log_info "Initializing Go module..."
    go mod init pocketbase-extension
fi
if [ ! -f "go.sum" ]; then
    log_info "Downloading Go dependencies..."
    go mod tidy
fi
go build -o pocketbase-app .
cd ..
log_success "PocketBase extension built: pocketbase/pocketbase-app"

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
