#!/bin/bash

# Simple Extension Test Script
# This script tests the custom endpoints to verify extensions are working

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8091"

echo -e "${GREEN}🧪 Testing PocketBase Go Extensions${NC}"
echo "=================================="

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local expected_status=$3
    local description=$4
    local data=${5:-""}
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "  $method $url"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
                   -H "Content-Type: application/json" \
                   -d "$data" \
                   "$BASE_URL$url" || echo -e "\n000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
                   "$BASE_URL$url" || echo -e "\n000")
    fi
    
    # Split response and status code
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ Status: $status (Expected: $expected_status)${NC}"
        # Pretty print JSON if it's valid JSON
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "  Response:"
            echo "$body" | jq . | sed 's/^/    /'
        else
            echo "  Response: $body"
        fi
    else
        echo -e "  ${RED}❌ Status: $status (Expected: $expected_status)${NC}"
        echo "  Response: $body"
    fi
    echo ""
}

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
for i in {1..10}; do
    if curl -s "$BASE_URL/api/v1/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Server failed to start within 10 seconds${NC}"
        exit 1
    fi
    sleep 1
done

echo ""

# Test Core Extension Endpoints
echo -e "${GREEN}🔧 Testing Core Extension${NC}"
echo "-------------------------"
test_endpoint "GET" "/api/v1/health" "200" "Health check"
test_endpoint "GET" "/api/v1/health/live" "200" "Liveness check"
test_endpoint "GET" "/api/v1/health/ready" "200" "Readiness check"
test_endpoint "GET" "/api/v1/info" "200" "System info"
test_endpoint "GET" "/api/v1/version" "200" "Version info"

# Test Auth Extension
echo -e "${GREEN}🔐 Testing Auth Extension${NC}"
echo "-------------------------"
test_endpoint "GET" "/api/v1/auth/test" "200" "Auth extension test endpoint"
test_endpoint "POST" "/api/v1/auth/check-email" "200" "Email availability check" '{"email":"test@example.com"}'
test_endpoint "POST" "/api/v1/auth/password-strength" "200" "Password strength analysis" '{"password":"TestPassword123!"}'

# Test API Extension
echo -e "${GREEN}📡 Testing API Extension${NC}"
echo "------------------------"
test_endpoint "GET" "/api/v1/examples/hello" "200" "Hello endpoint"
test_endpoint "GET" "/api/v1/examples/hello/World" "200" "Hello with name"
test_endpoint "POST" "/api/v1/examples/hello" "200" "Hello POST endpoint" '{"name":"TestUser","message":"Hello from test"}'
test_endpoint "POST" "/api/v1/examples/echo" "200" "Echo endpoint" '{"message":"Test message"}'

# Test Utility Endpoints
echo -e "${GREEN}🛠️  Testing Utility Endpoints${NC}"
echo "-----------------------------"
test_endpoint "GET" "/api/v1/utils/time" "200" "Current time"
test_endpoint "GET" "/api/v1/utils/time/unix" "200" "Unix timestamp"
test_endpoint "POST" "/api/v1/utils/validate/email" "200" "Email validation" '{"email":"test@example.com"}'
test_endpoint "POST" "/api/v1/utils/validate/password" "200" "Password validation" '{"password":"TestPassword123!"}'

echo -e "${GREEN}🎉 Extension testing completed!${NC}"
echo ""
echo "✅ If you see mostly green checkmarks above, your Go extensions are working perfectly!"
echo "📖 Check EXTENSIONS_GUIDE.md for more information about the extension system."
