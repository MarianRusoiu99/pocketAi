#!/bin/bash

<<<<<<< HEAD
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
        
    "rivet")
        log_section "Starting Rivet Server"
        
        # Check if rivet project exists
        if [ ! -f "rivet/ai.rivet-project" ]; then
            log_error "Rivet project not found at rivet/ai.rivet-project"
            exit 1
        fi
        
        # Load environment variables
        source .env.local 2>/dev/null || true
        
        # Set defaults if not in environment
        RIVET_PORT=${RIVET_PORT:-3000}
        OPENAI_API_KEY=${OPENAI_API_KEY:-$OPEN_AI_KEY}
        
        if [ -z "$OPENAI_API_KEY" ]; then
            log_error "OPENAI_API_KEY not found in .env.local"
            log_info "Please set OPENAI_API_KEY in .env.local"
            exit 1
        fi
        
        log_info "Rivet API: http://localhost:$RIVET_PORT"
        log_info "Project: rivet/ai.rivet-project"
        echo ""
        
        log_info "Starting Rivet server..."
        log_info "Press Ctrl+C to stop the server"
        echo ""
        
        # Start Rivet server in development mode
        cd rivet && npx @ironclad/rivet-cli serve ai.rivet-project --port "$RIVET_PORT" --openai-api-key "$OPENAI_API_KEY" --dev
        ;;
        
    "both")
        log_section "Starting PocketBase, Frontend, and Rivet"
        
        # Check if rivet project exists
        if [ ! -f "rivet/ai.rivet-project" ]; then
            log_error "Rivet project not found at rivet/ai.rivet-project"
            exit 1
        fi
        
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

        # Load environment variables for Rivet
        source .env.local 2>/dev/null || true
        RIVET_PORT=${RIVET_PORT:-3000}
        OPENAI_API_KEY=${OPENAI_API_KEY:-$OPEN_AI_KEY}
        
        if [ -z "$OPENAI_API_KEY" ]; then
            log_error "OPENAI_API_KEY not found in .env.local"
            log_info "Please set OPENAI_API_KEY in .env.local"
            exit 1
        fi

        log_info "PocketBase: http://localhost:8090"
        log_info "Admin UI: http://localhost:8090/_/"
        log_info "Test endpoint: http://localhost:8090/test"
        log_info "Frontend: http://localhost:5173"
        log_info "Rivet API: http://localhost:$RIVET_PORT"
        echo ""
        
        log_info "Starting all servers concurrently..."
        log_info "Press Ctrl+C to stop all servers"
        echo ""

        # Create temporary log files
        POCKETBASE_LOG="/tmp/pocket_pocketbase_$$.log"
        FRONTEND_LOG="/tmp/pocket_frontend_$$.log"
        RIVET_LOG="/tmp/pocket_rivet_$$.log"
        
        # Cleanup function
        cleanup() {
            echo ""
            log_info "Stopping servers..."
            kill $POCKETBASE_PID $FRONTEND_PID $RIVET_PID 2>/dev/null || true
            kill $POCKETBASE_TAIL_PID $FRONTEND_TAIL_PID $RIVET_TAIL_PID 2>/dev/null || true
            rm -f "$POCKETBASE_LOG" "$FRONTEND_LOG" "$RIVET_LOG" 2>/dev/null || true
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
        
        # Start Rivet with output to log file
        (cd rivet && npx @ironclad/rivet-cli serve ai.rivet-project --port "$RIVET_PORT" --openai-api-key "$OPENAI_API_KEY" --dev > "$RIVET_LOG" 2>&1) &
        RIVET_PID=$!
        
        # Start log tailing with prefixes
        tail -f "$POCKETBASE_LOG" | sed 's/^/[POCKETBASE] /' &
        POCKETBASE_TAIL_PID=$!
        
        tail -f "$FRONTEND_LOG" | sed 's/^/[FRONTEND]  /' &
        FRONTEND_TAIL_PID=$!
        
        tail -f "$RIVET_LOG" | sed 's/^/[RIVET]     /' &
        RIVET_TAIL_PID=$!
        
        # Wait for all processes
        wait $POCKETBASE_PID $FRONTEND_PID $RIVET_PID
        ;;
        
    *)
        log_error "Usage: $0 [pocketbase|frontend|rivet|both]"
        log_info "  pocketbase - Start PocketBase Go extension server (default)"
        log_info "  frontend   - Start frontend dev server"
        log_info "  rivet      - Start Rivet AI server"
        log_info "  both       - Start all servers concurrently"
        exit 1
        ;;
esac
=======
# Development script for Go-only PocketBase with hot reload
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔥 Starting Go-only PocketBase in development mode...${NC}"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed!${NC}"
    echo -e "${YELLOW}Please install Go 1.21+ from: https://go.dev/doc/install${NC}"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Set default port if not provided
PORT=${1:-8090}

# Check if air is installed for hot reload
if command -v air &> /dev/null; then
    echo -e "${BLUE}🌪️ Using air for hot reload...${NC}"
    echo -e "${GREEN}🌟 Starting PocketBase server on port ${PORT}...${NC}"
    echo -e "${BLUE}📱 Admin UI: http://localhost:${PORT}/_/${NC}"
    echo -e "${BLUE}🔗 API: http://localhost:${PORT}/api/${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    # Use air for hot reload
    exec air -c .air.toml -- serve \
      --http="0.0.0.0:${PORT}" \
      --dir="./pb_data" \
      --migrationsDir="./migrations" \
      --publicDir="./client/dist" \
      --automigrate=true \
      --indexFallback=true
else
    echo -e "${YELLOW}⚠️ air not found, running without hot reload${NC}"
    echo -e "${BLUE}💡 Install air for hot reload: go install github.com/cosmtrek/air@latest${NC}"
    echo -e "${GREEN}🌟 Starting PocketBase server on port ${PORT}...${NC}"
    echo -e "${BLUE}📱 Admin UI: http://localhost:${PORT}/_/${NC}"
    echo -e "${BLUE}🔗 API: http://localhost:${PORT}/api/${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    # Run directly with go run
    exec go run ./cmd/server serve \
      --http="0.0.0.0:${PORT}" \
      --dir="./pb_data" \
      --migrationsDir="./migrations" \
      --publicDir="./client/dist" \
      --automigrate=true \
      --indexFallback=true
fi
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9
