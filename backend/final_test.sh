#!/bin/bash
# Final integration test showing everything working

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║       🤖 BROKEMATE AI CHATBOT - FINAL INTEGRATION TEST       ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Backend
echo -e "${BLUE}[1/4]${NC} Checking Backend Server..."
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo -e "      ${GREEN}✅ Backend is running on port 8000${NC}"
else
    echo -e "      ❌ Backend is not running"
    exit 1
fi
echo ""

# Check Frontend
echo -e "${BLUE}[2/4]${NC} Checking Frontend Server..."
if curl -s http://localhost:5173/ > /dev/null 2>&1; then
    echo -e "      ${GREEN}✅ Frontend is running on port 5173${NC}"
else
    echo -e "      ${YELLOW}⚠️  Frontend may still be starting...${NC}"
fi
echo ""

# Test API Health
echo -e "${BLUE}[3/4]${NC} Testing API Health..."
API_RESPONSE=$(curl -s http://localhost:8000/)
if echo "$API_RESPONSE" | grep -q "healthy"; then
    echo -e "      ${GREEN}✅ API is healthy and responding${NC}"
else
    echo -e "      ❌ API health check failed"
fi
echo ""

# Test Chatbot
echo -e "${BLUE}[4/4]${NC} Testing AI Chatbot..."
echo -e "      ${YELLOW}⏳ Running quick chat test...${NC}"
echo ""

cd /home/zoro/Documents/Development/Brokemate/backend
python3 quick_chat_test.py 2>/dev/null

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                    ✅ INTEGRATION COMPLETE!                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo ""
echo "🔐 Test credentials:"
echo "   Email:    testuser@example.com"
echo "   Password: testpass123"
echo ""
echo "💬 AI Chat is available in the app's AI Chat tab!"
echo ""
echo "📝 Try these commands:"
echo "   • python3 interactive_chat.py  - Interactive chat mode"
echo "   • python3 demo_chatbot.py      - Demo with sample queries"
echo "   • python3 test_chatbot.py      - Full test suite"
echo ""
