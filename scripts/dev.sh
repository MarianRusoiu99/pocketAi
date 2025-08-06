#!/bin/bash

# Development script - Start components in development mode
set -e

# Get to project root
cd "$(dirname "$0")/.."

# Load utilities
source "scripts/utils/common.sh"

COMPONENT=${1:-"pocketbase"}

log_section "Starting Development Server - $COMPONENT"

ensure_project_root
setup_env

case $COMPONENT in
    "pocketbase")
        # Setup pocketbase Go extension
        if [ ! -f "pocketbase/go.mod" ]; then
            log_info "Initializing PocketBase Go extension..."
            cd pocketbase && go mod init pocketbase-extension && cd ..
        fi

        # Download dependencies
        cd pocketbase
        if [ ! -f "go.sum" ]; then
            log_info "Downloading Go dependencies..."
            go mod tidy
        fi
        cd ..

        log_section "Starting PocketBase Go Extension"
        log_info "PocketBase: http://localhost:8090"
        log_info "Admin UI: http://localhost:8090/_/"
        log_info "Test endpoint: http://localhost:8090/test"
        echo ""
        
        log_info "Starting PocketBase with Go extension..."
        log_info "Press Ctrl+C to stop the server"
        echo ""

        # Start PocketBase in development mode
        cd pocketbase && go run . serve
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
        log_section "Starting PocketBase and Frontend"
        
        # Setup pocketbase Go extension
        if [ ! -f "pocketbase/go.mod" ]; then
            log_info "Initializing PocketBase Go extension..."
            cd pocketbase && go mod init pocketbase-extension && cd ..
        fi

        # Download dependencies
        cd pocketbase
        if [ ! -f "go.sum" ]; then
            log_info "Downloading Go dependencies..."
            go mod tidy
        fi
        cd ..

        # Setup frontend
        if [ ! -d "client/node_modules" ]; then
            install_deps "client"
        fi

        log_info "PocketBase: http://localhost:8090"
        log_info "Admin UI: http://localhost:8090/_/"
        log_info "Test endpoint: http://localhost:8090/test"
        log_info "Frontend: http://localhost:5173"
        echo ""
        
        log_info "Starting all servers concurrently..."
        log_info "Press Ctrl+C to stop all servers"
        echo ""

        # Create temporary log files
        POCKETBASE_LOG="/tmp/pocket_pocketbase_$$.log"
        FRONTEND_LOG="/tmp/pocket_frontend_$$.log"
        
        # Cleanup function
        cleanup() {
            echo ""
            log_info "Stopping servers..."
            kill $POCKETBASE_PID $FRONTEND_PID 2>/dev/null || true
            kill $POCKETBASE_TAIL_PID $FRONTEND_TAIL_PID 2>/dev/null || true
            rm -f "$POCKETBASE_LOG" "$FRONTEND_LOG" 2>/dev/null || true
            exit 0
        }
        
        # Set up signal handlers
        trap cleanup INT TERM EXIT
        
        # Start PocketBase with output to log file
        (cd pocketbase && go run . serve > "$POCKETBASE_LOG" 2>&1) &
        POCKETBASE_PID=$!
        
        # Start frontend with output to log file
        (cd client && npm run dev > "$FRONTEND_LOG" 2>&1) &
        FRONTEND_PID=$!
        
        # Start log tailing with prefixes
        tail -f "$POCKETBASE_LOG" | sed 's/^/[POCKETBASE] /' &
        POCKETBASE_TAIL_PID=$!
        
        tail -f "$FRONTEND_LOG" | sed 's/^/[FRONTEND]  /' &
        FRONTEND_TAIL_PID=$!
        
        # Wait for all processes
        wait $POCKETBASE_PID $FRONTEND_PID
        ;;
        
    *)
        log_error "Usage: $0 [pocketbase|frontend|both]"
        log_info "  pocketbase - Start PocketBase Go extension server (default)"
        log_info "  frontend   - Start frontend dev server"
        log_info "  both       - Start all servers concurrently"
        exit 1
        ;;
esac
