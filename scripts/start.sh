#!/bin/bash

# Start script - Start built applications in production mode
set -e

# Get to project root
cd "$(dirname "$0")/.."

# Load utilities
source "scripts/utils/common.sh"

COMPONENT=${1:-"pocketbase"}

log_section "Starting Production Server - $COMPONENT"

ensure_project_root

case $COMPONENT in
    "pocketbase")
        if [ ! -f "pocketbase/pocketbase-app" ]; then
            log_error "PocketBase extension not built. Run './scripts/build.sh' first."
            exit 1
        fi

        log_section "Starting PocketBase Go Extension (Production)"
        log_info "PocketBase: http://localhost:8090"
        log_info "Admin UI: http://localhost:8090/_/"
        log_info "Test endpoint: http://localhost:8090/test"
        echo ""
        
        log_info "Starting PocketBase production server..."
        log_info "Press Ctrl+C to stop the server"
        echo ""

        # Start built PocketBase application
        cd pocketbase && ./pocketbase-app serve
        ;;
        
    *)
        log_error "Usage: $0 [pocketbase]"
        log_info "  pocketbase - Start PocketBase production server (default)"
        exit 1
        ;;
esac