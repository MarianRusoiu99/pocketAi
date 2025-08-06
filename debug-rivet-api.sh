#!/bin/bash

echo "=== Testing Rivet API directly ==="
echo "1. Testing root endpoint with minimal data..."
curl -i -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' || echo "Failed"

echo -e "\n\n2. Testing with story data..."
curl -i -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{
    "n_chapters": 1,
    "story_instructions": "A story about collecting depts",
    "primary_characters": "vali (dommer), Mitsubishi (fierce mountain lion)",
    "secondary_characters": "Datoria, Necazu, Foamea",
    "l_chapter": 100
  }' || echo "Failed"

echo -e "\n\n3. Testing different endpoint paths..."
for path in "/api" "/run" "/generate" "/story" "/execute"; do
    echo "Testing path: $path"
    curl -i -X POST "http://localhost:3000$path" \
      -H "Content-Type: application/json" \
      -d '{"test": "data"}' 2>/dev/null | head -1 || echo "Failed to connect"
done

echo -e "\n\nDone testing!"
