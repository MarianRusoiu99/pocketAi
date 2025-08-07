#!/bin/bash

<<<<<<< HEAD
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
=======
# Setup script for Go-only PocketBase development environment
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🛠️ Setting up Go-only PocketBase development environment...${NC}"

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed!${NC}"
    echo -e "${YELLOW}Please install Go 1.21+ from: https://go.dev/doc/install${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Go is installed: $(go version)${NC}"

# Check if Node.js is installed for frontend
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from: https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed: $(node --version)${NC}"

# Initialize Go module if needed
if [ ! -f "go.mod" ]; then
    echo -e "${BLUE}📦 Initializing Go module...${NC}"
    go mod init pocket-app
fi

# Download Go dependencies
echo -e "${BLUE}📦 Installing Go dependencies...${NC}"
go mod tidy

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd client
npm install
cd ..

# Make scripts executable
echo -e "${BLUE}🔧 Making scripts executable...${NC}"
chmod +x scripts/*.sh

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p pb_data migrations logs client/dist

# Optional: Install development tools
echo -e "${BLUE}🛠️ Installing optional development tools...${NC}"

# Air for hot reload
if ! command -v air &> /dev/null; then
    echo -e "${YELLOW}📦 Installing air for hot reload...${NC}"
    if ! go install github.com/cosmtrek/air@latest; then
        echo -e "${YELLOW}⚠️ Failed to install air, skipping...${NC}"
    fi
fi

# golangci-lint for linting
if ! command -v golangci-lint &> /dev/null; then
    echo -e "${YELLOW}📦 Installing golangci-lint for code linting...${NC}"
    if ! go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; then
        echo -e "${YELLOW}⚠️ Failed to install golangci-lint, skipping...${NC}"
    fi
fi

# Create .air.toml for hot reload if it doesn't exist
if [ ! -f ".air.toml" ]; then
    echo -e "${BLUE}📝 Creating .air.toml for hot reload...${NC}"
    cat > .air.toml << 'EOF'
root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  args_bin = []
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ./cmd/server"
  delay = 1000
  exclude_dir = ["assets", "tmp", "vendor", "testdata", "client", "pb_data", "logs"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  include_file = []
  kill_delay = "0s"
  log = "build-errors.log"
  poll = false
  poll_interval = 0
  rerun = false
  rerun_delay = 500
  send_interrupt = false
  stop_on_root = false

[color]
  app = ""
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  main_only = false
  time = false

[misc]
  clean_on_exit = false

[screen]
  clear_on_rebuild = false
  keep_scroll = true
EOF
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Available commands:${NC}"
echo -e "  ${YELLOW}./scripts/dev.sh${NC}        - Start development server with hot reload"
echo -e "  ${YELLOW}./scripts/start.sh${NC}      - Build and start production server"
echo -e "  ${YELLOW}./scripts/build.sh${NC}      - Build the application"
echo -e "  ${YELLOW}./scripts/test.sh${NC}       - Run tests"
echo -e "  ${YELLOW}./scripts/clean.sh${NC}      - Clean build artifacts"
echo ""
echo -e "${BLUE}🚀 Quick start:${NC}"
echo -e "  ${GREEN}./scripts/dev.sh${NC}        - Start development mode"
echo ""
>>>>>>> d636ce03a53456eaef001ada76af30b2d6174ea9
