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

log_progress "Installing all dependencies"
install_deps "backend"
install_deps "client"

log_progress "Downloading PocketBase"
download_pocketbase

log_progress "Building backend"
build_component "backend"

log_success "Project setup complete!"
log_info "To start development:"
log_info "  ./scripts/dev.sh backend    # Start backend server"
log_info "  ./scripts/dev.sh frontend   # Start frontend dev server"
log_info "  ./scripts/dev.sh            # Start backend (default)"
