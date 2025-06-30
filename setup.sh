#!/bin/bash
# Simple development setup for Go + React monorepo

echo "🚀 Setting up development environment..."

# Install frontend dependencies and setup git hooks
echo "📦 Installing frontend dependencies..."
cd client && npm install

echo "🎣 Setting up git hooks..."
npm run prepare

cd ..

echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  Backend (Go):   ./start-go-pocketbase.sh"  
echo "  Frontend:       cd client && npm run dev"
