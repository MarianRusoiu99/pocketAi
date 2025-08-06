#!/bin/bash

echo "=== Testing Complete PocketBase + Rivet Integration ==="
echo ""

# Test the /generate-story endpoint
echo "Testing /generate-story endpoint..."
echo "Making request to PocketBase which will forward to Rivet..."
echo ""

curl -X POST http://localhost:8090/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "n_chapters": 1,
    "story_instructions": "A story about collecting depts",
    "primary_characters": "vali (dommer), Mitsubishi (fierce mountain lion)",
    "secondary_characters": "Datoria, Necazu, Foamea",
    "l_chapter": 100
  }' | jq '.' 2>/dev/null || cat

echo ""
echo ""
echo "=== Integration Test Complete ==="
