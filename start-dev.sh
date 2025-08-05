#!/bin/bash

# Start development servers with proper ports

echo "🚀 Starting LULO development servers..."

# Kill any existing processes on our ports
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend on port 3001
echo "📦 Starting backend server on port 3001..."
PORT=3001 NODE_ENV=development npm run dev &

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server on port 5173..."
cd client && npx vite &

echo "✅ Servers starting..."
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
wait