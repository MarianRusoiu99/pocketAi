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
            log_info "PocketBase binary not found. Downloading..."
            cd backend && npm run download && cd ..
        fi

        log_section "Starting PocketBase Backend with Rivet Integration"
        log_info "Backend: http://localhost:8090"
        log_info "Admin UI: http://localhost:8090/_/"
        log_info "Health check: http://localhost:8090/api/health"
        log_info "Stories API: http://localhost:8090/api/stories"
        log_info "Rivet integration: Built-in via Stories API"
        echo ""
        
        log_info "Starting PocketBase with JavaScript hooks..."
        log_info "Press Ctrl+C to stop the server"
        echo ""

        # Start PocketBase in development mode
        cd backend && npm run serve:dev
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
        log_section "Starting Backend, Rivet, and Frontend"
        
        # Setup backend
        if [ ! -d "backend/node_modules" ]; then
            install_deps "backend"
        fi

        # Download PocketBase if needed
        if [ ! -f "backend/pocketbase" ]; then
            download_pocketbase
        fi

        # Setup frontend
        if [ ! -d "client/node_modules" ]; then
            install_deps "client"
        fi

        log_info "Backend: http://localhost:8090"
        log_info "Admin UI: http://localhost:8090/_/"
        log_info "Health check: http://localhost:8090/api/health"
        log_info "Rivet server: http://localhost:3010"
        log_info "Frontend: http://localhost:5173"
        echo ""

        # # Build backend first
        # build_component "backend"
        
        log_info "Starting all servers concurrently..."
        log_info "Press Ctrl+C to stop all servers"
        echo ""

        # Create temporary log files
        BACKEND_LOG="/tmp/pocket_backend_$$.log"
        RIVET_LOG="/tmp/pocket_rivet_$$.log"
        FRONTEND_LOG="/tmp/pocket_frontend_$$.log"
        
        # Cleanup function
        cleanup() {
            echo ""
            log_info "Stopping servers..."
            kill $BACKEND_PID $RIVET_PID $FRONTEND_PID 2>/dev/null || true
            kill $BACKEND_TAIL_PID $RIVET_TAIL_PID $FRONTEND_TAIL_PID 2>/dev/null || true
            rm -f "$BACKEND_LOG" "$RIVET_LOG" "$FRONTEND_LOG" 2>/dev/null || true
            exit 0
        }
        
        # Set up signal handlers
        trap cleanup INT TERM EXIT
        
        # Start Rivet server first
        (cd backend && npm run rivet:serve > "$RIVET_LOG" 2>&1) &
        RIVET_PID=$!
        
        # Wait a moment for Rivet to start
        sleep 2
        
        # Start backend with output to log file
        (cd backend && npm run serve > "$BACKEND_LOG" 2>&1) &
        BACKEND_PID=$!
        
        # Start frontend with output to log file
        (cd client && npm run dev > "$FRONTEND_LOG" 2>&1) &
        FRONTEND_PID=$!
        
        # Start log tailing with prefixes
        tail -f "$RIVET_LOG" | sed 's/^/[RIVET]    /' &
        RIVET_TAIL_PID=$!
        
        tail -f "$BACKEND_LOG" | sed 's/^/[BACKEND]  /' &
        BACKEND_TAIL_PID=$!
        
        tail -f "$FRONTEND_LOG" | sed 's/^/[FRONTEND] /' &
        FRONTEND_TAIL_PID=$!
        
        # Wait for all processes
        wait $BACKEND_PID $RIVET_PID $FRONTEND_PID
        ;;
        
    *)
        log_error "Usage: $0 [backend|frontend|both]"
        log_info "  backend   - Start backend + Rivet servers (default)"
        log_info "  frontend  - Start frontend dev server"
        log_info "  both      - Start all servers concurrently"
        exit 1
        ;;
esac
