#!/bin/bash

# Run tests for the Go-only PocketBase application
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Running tests for Go-only PocketBase application...${NC}"

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go is not installed!${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Running Go tests...${NC}"

# Run tests with coverage
if go test -v -cover ./...; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi

# Run linting if golangci-lint is available
if command -v golangci-lint &> /dev/null; then
    echo -e "${BLUE}🔍 Running linting...${NC}"
    if golangci-lint run; then
        echo -e "${GREEN}✅ Linting passed!${NC}"
    else
        echo -e "${YELLOW}⚠️ Linting issues found${NC}"
    fi
else
    echo -e "${YELLOW}💡 Install golangci-lint for code linting: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest${NC}"
fi

# Run frontend tests if available
if [ -f "client/package.json" ]; then
    echo -e "${BLUE}🔍 Running frontend tests...${NC}"
    cd client
    if npm test 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend tests passed!${NC}"
    else
        echo -e "${YELLOW}⚠️ Frontend tests skipped or failed${NC}"
    fi
    cd ..
fi

echo -e "${GREEN}🎉 Test run completed!${NC}"
