#!/bin/bash

echo "🚀 Starting Brokemate Backend Setup..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete!"
echo ""
echo "🎯 To start the backend server:"
echo "   1. cd backend"
echo "   2. source venv/bin/activate"
echo "   3. python main.py"
echo ""
echo "🌐 The backend will be available at: http://localhost:8000"