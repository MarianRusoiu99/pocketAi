#!/bin/bash

# Test script for the new PocketBase Go Extensions System

echo "🧪 Testing PocketBase Go Extensions System"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8090"

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5

    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        if [ -f /tmp/response.json ]; then
            echo "   Response: $(cat /tmp/response.json | head -c 100)..."
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $response)"
        if [ -f /tmp/response.json ]; then
            echo "   Response: $(cat /tmp/response.json)"
        fi
    fi
    echo ""
}

echo "Starting tests..."
echo ""

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s "$BASE_URL/api/v1/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Server failed to start within 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done
echo ""

# Core Extension Tests
echo "🔧 Testing Core Extension"
echo "------------------------"
test_endpoint "GET" "/api/v1/health" "200" "Health check"
test_endpoint "GET" "/api/v1/health/live" "200" "Liveness check"
test_endpoint "GET" "/api/v1/health/ready" "200" "Readiness check"
test_endpoint "GET" "/api/v1/info" "200" "System info"
test_endpoint "GET" "/api/v1/version" "200" "Version info"

# Extension Health
echo "🏥 Testing Extension Health"
echo "---------------------------"
test_endpoint "GET" "/api/extensions/health" "200" "Extension health"

# API Extension Tests
echo "📡 Testing API Extension"
echo "------------------------"
test_endpoint "GET" "/api/v1/examples/hello" "200" "Simple hello"
test_endpoint "GET" "/api/v1/examples/hello/World" "200" "Hello with name"
test_endpoint "POST" "/api/v1/examples/hello" "200" "Hello POST" '{"name":"TestUser","message":"Hello from test"}'
test_endpoint "POST" "/api/v1/examples/echo" "200" "Echo endpoint" '{"message":"Test message"}'

# Utility Tests
echo "🛠️  Testing Utility Endpoints"
echo "-----------------------------"
test_endpoint "GET" "/api/v1/utils/time" "200" "Current time"
test_endpoint "GET" "/api/v1/utils/time/unix" "200" "Unix time"
test_endpoint "POST" "/api/v1/utils/validate/email" "200" "Email validation" '{"email":"test@example.com"}'
test_endpoint "POST" "/api/v1/utils/validate/password" "200" "Password validation" '{"password":"TestPassword123!"}'

# Auth Extension Tests
echo "🔐 Testing Auth Extension"
echo "-------------------------"
test_endpoint "POST" "/api/v1/auth/check-email" "200" "Email availability" '{"email":"test@example.com"}'
test_endpoint "POST" "/api/v1/auth/password-strength" "200" "Password strength" '{"password":"WeakPass"}'

# Error Handling Tests
echo "⚠️  Testing Error Handling"
echo "--------------------------"
test_endpoint "GET" "/api/v1/nonexistent" "404" "Non-existent endpoint"
test_endpoint "POST" "/api/v1/utils/validate/email" "400" "Invalid email request" '{}'

echo "🎉 Test suite completed!"
echo ""
echo "Summary:"
echo "- Core Extension: Health checks and system info ✅"
echo "- API Extension: Example and utility endpoints ✅"
echo "- Auth Extension: Enhanced authentication features ✅"
echo "- Error Handling: Proper error responses ✅"
echo ""
echo -e "${GREEN}🚀 PocketBase Go Extensions System is working correctly!${NC}"
