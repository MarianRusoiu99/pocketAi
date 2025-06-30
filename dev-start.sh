#!/bin/bash
# Start both backend and frontend concurrently

echo "🚀 Starting development servers..."

# Function to handle cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting Go PocketBase backend..."
./start-go-pocketbase.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in background  
echo "⚛️ Starting React frontend..."
cd client && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers started!"
echo "  Backend:  http://localhost:8090"
echo "  Frontend: http://localhost:5173"
echo "  Admin:    http://localhost:8090/_/"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
