#!/bin/bash
# Bridge caller script for PocketBase
# Usage: ./bridge-call.sh <payload>

PAYLOAD="$1"
curl -X POST http://localhost:3001/execute \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  --connect-timeout 10 \
  --max-time 60 \
  --silent \
  --show-error
