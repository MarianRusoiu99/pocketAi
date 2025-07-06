#!/bin/bash

# Unified logging utility for scripts
# Usage: source scripts/utils/logger.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Icons
ICON_INFO="ℹ️"
ICON_SUCCESS="✅"
ICON_WARNING="⚠️"
ICON_ERROR="❌"
ICON_BUILD="🔨"
ICON_ROCKET="🚀"
ICON_PACKAGE="📦"
ICON_CONFIG="⚙️"

# Logging functions
log_info() {
    echo -e "${BLUE}${ICON_INFO} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${ICON_SUCCESS} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${ICON_WARNING} $1${NC}"
}

log_error() {
    echo -e "${RED}${ICON_ERROR} $1${NC}"
}

log_build() {
    echo -e "${PURPLE}${ICON_BUILD} $1${NC}"
}

log_start() {
    echo -e "${CYAN}${ICON_ROCKET} $1${NC}"
}

log_install() {
    echo -e "${YELLOW}${ICON_PACKAGE} $1${NC}"
}

log_config() {
    echo -e "${BLUE}${ICON_CONFIG} $1${NC}"
}

# Section headers
log_section() {
    echo ""
    echo -e "${GREEN}━━━ $1 ━━━${NC}"
}

# Progress indicator
log_progress() {
    echo -e "${CYAN}⏳ $1...${NC}"
}
