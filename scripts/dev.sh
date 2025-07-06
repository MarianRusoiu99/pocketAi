#!/bin/bash

# Development script - Start components in development mode
set -e

# Get to project root
cd "$(dirname "$0")/.."

# Load utilities
source "scripts/utils/common.sh"

COMPONENT=${1:-"backend"}

log_section "Starting Development Server - $COMPONENT"

ensure_project_root
setup_env

case $COMPONENT in
    "backend")
        # Setup backend
        if [ ! -d "backend/node_modules" ]; then
            install_deps "backend"
        fi

        # Download PocketBase if needed
        if [ ! -f "backend/pocketbase" ]; then
            download_pocketbase
        fi

        log_section "Starting Backend Server"
        log_info "Backend: http://localhost:8090"
        log_info "Admin UI: http://localhost:8090/_/"
        log_info "Health check: http://localhost:8090/api/health"
        echo ""

        # Build and start backend
        build_component "backend"
        cd backend && npm run serve
        ;;
        
    "frontend")
        # Setup frontend
        if [ ! -d "client/node_modules" ]; then
            install_deps "client"
        fi

        log_section "Starting Frontend Server"
        log_info "Frontend: http://localhost:5173"
        echo ""

        cd client && npm run dev
        ;;
        
    "both")
        log_info "Start backend and frontend in separate terminals:"
        log_info "  Terminal 1: ./scripts/dev.sh backend"
        log_info "  Terminal 2: ./scripts/dev.sh frontend"
        ;;
        
    *)
        log_error "Usage: $0 [backend|frontend|both]"
        log_info "  backend   - Start backend server (default)"
        log_info "  frontend  - Start frontend dev server"
        log_info "  both      - Show instructions for both"
        exit 1
        ;;
esac
