#!/bin/bash

echo "=== Testing PocketBase Story Generation with JSON Parsing ==="
echo ""

# Test the /generate-story endpoint
echo "Testing /generate-story endpoint with automatic JSON parsing..."
echo "The nested JSON in data.output.value will be automatically parsed"
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
echo "=== JSON Parsing Test Complete ==="
echo "Check the response - the 'story' field should contain parsed JSON with:"
echo "- Title"
echo "- Summary" 
echo "- Chapters (array)"
echo "- ThemesOrLessons (array)"
