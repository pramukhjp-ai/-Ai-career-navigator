#!/bin/bash

# AI Career Navigator - Start Both Servers
# This script starts the Node.js and Python servers in separate terminal windows

set -e

PROJECT_PATH="/Users/pramukh/Downloads/AI-Career-Navigator-main"

echo "🚀 Starting AI Career Navigator..."
echo ""

# Check if MongoDB is running
echo "📦 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB not running. Starting..."
    brew services start mongodb-community 2>/dev/null || true
    sleep 2
fi

# Start Node.js Server in a new terminal
echo "🟢 Starting Node.js Server (Port 8080)..."
open -a Terminal "cd '$PROJECT_PATH/Login' && npm install > /dev/null 2>&1 && npm run dev"

sleep 3

# Start Python Server in a new terminal
echo "🐍 Starting Python Server (Port 5000)..."
open -a Terminal "cd '$PROJECT_PATH/recommandation' && pip install -r requirements.txt > /dev/null 2>&1 && python app.py"

sleep 2

echo ""
echo "✅ Both servers starting..."
echo ""
echo "📱 Access the application at:"
echo "   🔗 http://localhost:8080/dashboard"
echo ""
echo "⏳ Give servers 3-5 seconds to fully start before opening the browser."
