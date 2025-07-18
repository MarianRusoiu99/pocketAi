#!/bin/bash

# Simple test script for Rivet integration
cd "$(dirname "$0")/.."

echo "🧪 Testing Rivet Integration"
echo "==============================================="

# Start Rivet server in background
echo "1. Starting Rivet server..."
cd backend
npm run rivet:serve > /tmp/rivet_test.log 2>&1 &
RIVET_PID=$!
cd ..

# Wait for Rivet to start
echo "2. Waiting for Rivet server to start..."
sleep 5

# Test Rivet server directly
echo "3. Testing Rivet server (port 3002)..."
if curl -s -X POST http://localhost:3002 \
  -H "Content-Type: application/json" \
  -d '{}' > /tmp/rivet_response.log 2>&1; then
  echo "✅ Rivet server is responding"
  echo "Response preview:"
  head -3 /tmp/rivet_response.log
else
  echo "❌ Rivet server test failed"
  echo "Rivet server logs:"
  tail -10 /tmp/rivet_test.log
fi

# Start PocketBase
echo "4. Starting PocketBase..."
cd backend
npm run build > /dev/null 2>&1
./pocketbase serve --http=127.0.0.1:8090 --dir=./pb_data --hooksDir=. --dev > /tmp/pocketbase_test.log 2>&1 &
POCKETBASE_PID=$!
cd ..

# Wait for PocketBase
echo "5. Waiting for PocketBase to start..."
sleep 3

# Test PocketBase health
echo "6. Testing PocketBase health endpoint..."
if curl -s http://localhost:8090/api/health > /tmp/health_response.log 2>&1; then
  echo "✅ PocketBase is responding"
  echo "Health response:"
  cat /tmp/health_response.log | head -3
else
  echo "❌ PocketBase health test failed"
  echo "PocketBase logs:"
  tail -10 /tmp/pocketbase_test.log
fi

# Test Rivet integration endpoint
echo "7. Testing Rivet integration endpoint..."
if curl -s -X POST http://localhost:8090/api/rivet/demo > /tmp/integration_response.log 2>&1; then
  echo "✅ Rivet integration endpoint is responding"
  echo "Integration response:"
  cat /tmp/integration_response.log | head -5
else
  echo "❌ Rivet integration test failed"
  echo "Response:"
  cat /tmp/integration_response.log
fi

# Cleanup
echo "8. Cleaning up..."
kill $RIVET_PID $POCKETBASE_PID 2>/dev/null || true
sleep 2

echo "==============================================="
echo "🧪 Test completed"
echo ""
echo "Log files created:"
echo "  - /tmp/rivet_test.log"
echo "  - /tmp/pocketbase_test.log"
echo "  - /tmp/rivet_response.log"
echo "  - /tmp/health_response.log"
echo "  - /tmp/integration_response.log"
