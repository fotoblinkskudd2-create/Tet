#!/bin/bash

# Gonzo Story Generator Launcher
# This script starts both the backend Flask server and can guide you to start the frontend

echo "🔥 GONZO STORY GENERATOR - LAUNCHER 🔥"
echo "======================================"
echo ""

# Check if ANTHROPIC_API_KEY is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  WARNING: ANTHROPIC_API_KEY is not set!"
    echo "Please set it with: export ANTHROPIC_API_KEY='your-api-key'"
    echo ""
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if requirements are installed
echo "📦 Checking Python dependencies..."
if ! python3 -c "import flask, anthropic, reportlab" 2>/dev/null; then
    echo "⚠️  Some dependencies are missing!"
    echo "Installing from requirements-gonzo.txt..."
    pip install -r requirements-gonzo.txt
fi

echo ""
echo "🚀 Starting Gonzo Backend Server..."
echo "Backend will run on http://localhost:5000"
echo ""
echo "To start the frontend:"
echo "  1. Open a new terminal"
echo "  2. cd frontend"
echo "  3. npm install (if not done)"
echo "  4. npm run dev"
echo "  5. Open http://localhost:3000/gonzo"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================"
echo ""

# Start the Flask backend
python3 gonzo_app.py
