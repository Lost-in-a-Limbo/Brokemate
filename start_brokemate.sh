#!/bin/bash

# Brokemate Startup Script
# This script starts both the backend and frontend servers

echo "================================================"
echo "🚀 Starting Brokemate Application"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down Brokemate...${NC}"
    
    # Kill backend
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${BLUE}Stopping backend server (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    # Kill frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${BLUE}Stopping frontend server (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Kill any remaining processes
    pkill -f "uvicorn main:app" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    
    echo -e "${GREEN}✅ Brokemate shut down successfully${NC}"
    exit 0
}

# Trap CTRL+C and other termination signals
trap cleanup SIGINT SIGTERM

# Check Python installation
echo -e "${BLUE}📦 Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3 found: $(python3 --version)${NC}"
echo ""

# Check Node.js installation
echo -e "${BLUE}📦 Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
echo ""

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd "$SCRIPT_DIR/backend"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd "$SCRIPT_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Kill any existing processes on ports 8000 and 3000
echo -e "${BLUE}🔍 Checking for processes on ports 8000 and 3000...${NC}"
if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${YELLOW}Killing existing process on port 8000...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}Killing existing process on port 3000...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
fi
sleep 2
echo -e "${GREEN}✅ Ports cleared${NC}"
echo ""

# Start backend server
echo -e "${BLUE}🚀 Starting backend server on http://127.0.0.1:8000...${NC}"
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to be ready
echo -e "${BLUE}⏳ Waiting for backend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start. Check backend.log for details.${NC}"
        cat "$SCRIPT_DIR/backend/backend.log"
        cleanup
        exit 1
    fi
    sleep 1
done
echo ""

# Start frontend server
echo -e "${BLUE}🚀 Starting frontend server on http://localhost:3000...${NC}"
cd "$SCRIPT_DIR"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""

# Wait for frontend to be ready
echo -e "${BLUE}⏳ Waiting for frontend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Frontend failed to start. Check frontend.log for details.${NC}"
        cat "$SCRIPT_DIR/frontend.log"
        cleanup
        exit 1
    fi
    sleep 1
done
echo ""

# Display status
echo "================================================"
echo -e "${GREEN}✅ Brokemate is now running!${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Backend API:${NC}  http://127.0.0.1:8000"
echo -e "${BLUE}API Docs:${NC}     http://127.0.0.1:8000/docs"
echo -e "${BLUE}Frontend:${NC}     http://localhost:3000"
echo ""
echo -e "${YELLOW}Default login credentials:${NC}"
echo "  Username: user@example.com"
echo "  Password: password123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Monitor logs
echo "================================================"
echo "📋 Server Logs"
echo "================================================"
echo ""

# Tail logs from both servers
tail -f "$SCRIPT_DIR/backend/backend.log" "$SCRIPT_DIR/frontend.log" &
TAIL_PID=$!

# Wait forever (until Ctrl+C)
wait
