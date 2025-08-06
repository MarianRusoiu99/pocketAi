#!/bin/bash

# Setup script - initializes the entire project
set -e

# Get to project root
cd "$(dirname "$0")/.."

# Load utilities
source "scripts/utils/common.sh"

log_section "Project Setup"

ensure_project_root
setup_env

log_progress "Installing frontend dependencies"
install_deps "client"

log_progress "Setting up PocketBase Go extension"
if [ ! -f "pocketbase/go.mod" ]; then
    log_info "Initializing PocketBase Go module..."
    cd pocketbase && go mod init pocketbase-extension && cd ..
fi

cd pocketbase
if [ ! -f "go.sum" ]; then
    log_info "Downloading Go dependencies..."
    go mod tidy
fi
cd ..

log_success "Project setup complete!"
log_info "To start development:"
log_info "  ./scripts/dev.sh pocketbase  # Start PocketBase server"
log_info "  ./scripts/dev.sh frontend    # Start frontend dev server"
log_info "  ./scripts/dev.sh both        # Start both servers concurrently"
log_info "  ./scripts/dev.sh             # Start PocketBase (default)"
