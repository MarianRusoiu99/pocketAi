#!/bin/bash

echo "Testing the /generate-story endpoint..."
echo "======================================="

curl --request POST \
  --url http://localhost:8090/generate-story \
  --header 'Content-Type: application/json' \
  --data '{
    "n_chapters": 1,
    "story_instructions": "A story about collecting depts",
    "primary_characters": "vali (dommer), Mitsubishi (fierce mountain lion)",
    "secondary_characters": "Datoria, Necazu, Foamea",
    "l_chapter": 100
  }' | jq '.' 2>/dev/null || cat

echo -e "\n\nTest completed!"
