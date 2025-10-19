#!/bin/bash

# Simple Brokemate Startup Script
# Runs both backend and frontend in the same terminal

set -e  # Exit on error

echo "🚀 Starting Brokemate Application"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    pkill -f "uvicorn main:app" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    jobs -p | xargs -r kill 2>/dev/null || true
    echo -e "${GREEN}Stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Clear ports
echo -e "${BLUE}Clearing ports...${NC}"
lsof -ti:8000 | xargs -r kill -9 2>/dev/null || true
lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
sleep 1

# Install backend dependencies
echo -e "${BLUE}Setting up backend...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✅ Backend ready${NC}"

# Install frontend dependencies
echo -e "${BLUE}Setting up frontend...${NC}"
cd "$SCRIPT_DIR"
if [ ! -d "node_modules" ]; then
    npm install
fi
echo -e "${GREEN}✅ Frontend ready${NC}"
echo ""

# Start backend
echo -e "${BLUE}Starting backend on http://127.0.0.1:8000...${NC}"
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Start frontend
echo -e "${BLUE}Starting frontend on http://localhost:3000...${NC}"
cd "$SCRIPT_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend
sleep 3

echo ""
echo "=================================="
echo -e "${GREEN}✅ Brokemate is running!${NC}"
echo "=================================="
echo ""
echo "Backend:  http://127.0.0.1:8000"
echo "Docs:     http://127.0.0.1:8000/docs"
echo "Frontend: http://localhost:3000"
echo ""
echo "Login: user@example.com / password123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Wait
wait
