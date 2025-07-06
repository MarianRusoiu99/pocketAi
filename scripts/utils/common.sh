#!/bin/bash

# Common utilities for scripts
# Usage: source scripts/utils/common.sh

# Get the directory of the script that sourced this file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/logger.sh"

# Check if directory is project root
ensure_project_root() {
    if [ ! -d "$ROOT_DIR/backend" ] || [ ! -d "$ROOT_DIR/client" ] || [ ! -d "$ROOT_DIR/scripts" ]; then
        log_error "Not in project root directory"
        exit 1
    fi
    cd "$ROOT_DIR"
}

# Setup environment symlinks
setup_env() {
    log_config "Setting up centralized environment"
    
    if [ ! -f ".env.local" ]; then
        log_info "Creating .env.local from .env.example"
        cp .env.example .env.local
    fi

    # Backend symlink
    if [ ! -f "backend/.env.local" ]; then
        log_info "Linking backend/.env.local -> ../.env.local"
        cd backend && ln -sf ../.env.local .env.local && cd ..
    fi

    # Client symlink
    if [ ! -f "client/.env.local" ]; then
        log_info "Linking client/.env.local -> ../.env.local"
        cd client && ln -sf ../.env.local .env.local && cd ..
    fi
    
    log_success "Environment setup complete"
}

# Install dependencies for a component
install_deps() {
    local component=$1
    log_install "Installing $component dependencies"
    cd "$component" && npm install && cd ..
}

# Build a component
build_component() {
    local component=$1
    log_build "Building $component"
    cd "$component" && npm run build && cd ..
}

# Start a component in development mode
dev_component() {
    local component=$1
    log_start "Starting $component in development mode"
    cd "$component" && npm run dev
}

# Download PocketBase binary
download_pocketbase() {
    if [ ! -f "backend/pocketbase" ]; then
        log_install "Downloading PocketBase binary"
        cd backend
        POCKETBASE_VERSION="0.22.21"
        curl -sL "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip" -o pocketbase.zip
        unzip -q pocketbase.zip && rm pocketbase.zip && chmod +x pocketbase
        cd ..
        log_success "PocketBase downloaded"
    else
        log_info "PocketBase binary already exists"
    fi
}
