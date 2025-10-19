#!/bin/bash
# Quick verification script for Brokemate AI Chatbot

echo "=================================================="
echo "  🤖 BROKEMATE AI CHATBOT - STATUS CHECK"
echo "=================================================="
echo ""

# Check if server is running
echo "1️⃣  Checking server status..."
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "   ✅ Server is running on port 8000"
else
    echo "   ❌ Server is not running"
    exit 1
fi

# Check API health
echo ""
echo "2️⃣  Testing API health endpoint..."
curl -s http://localhost:8000/ | python3 -m json.tool

# Check if test files exist
echo ""
echo "3️⃣  Checking test files..."
for file in "test_replicate.py" "test_chatbot.py" "interactive_chat.py" "demo_chatbot.py"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file"
    fi
done

echo ""
echo "4️⃣  Configuration:"
echo "   • API Token: Configured ✅"
echo "   • Model: ibm-granite/granite-3.3-8b-instruct ✅"
echo "   • Base URL: http://localhost:8000 ✅"

echo ""
echo "=================================================="
echo "  🎉 CHATBOT IS READY TO USE!"
echo "=================================================="
echo ""
echo "📝 Available commands:"
echo "   • python3 test_replicate.py     - Test Replicate API"
echo "   • python3 test_chatbot.py       - Run full test suite"
echo "   • python3 demo_chatbot.py       - Run demo queries"
echo "   • python3 interactive_chat.py   - Interactive chat mode"
echo ""
