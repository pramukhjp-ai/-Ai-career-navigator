#!/bin/bash

# Complete Setup & Run Script
# This script installs all dependencies and starts both servers

PROJECT_PATH="/Users/pramukh/Downloads/AI-Career-Navigator-main"

echo "🚀 AI Career Navigator - Complete Setup"
echo "======================================="
echo ""

# Step 1: Check/Start MongoDB
echo "Step 1️⃣  : Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "  ⚠️  MongoDB not running. Starting..."
    brew services start mongodb-community 2>/dev/null || {
        echo "  ❌ Failed to start MongoDB. Please install: brew install mongodb-community"
        exit 1
    }
    sleep 2
else
    echo "  ✅ MongoDB is running"
fi

# Step 2: Install Node dependencies
echo ""
echo "Step 2️⃣  : Installing Node.js dependencies..."
cd "$PROJECT_PATH/Login"
if npm install > /tmp/npm-install.log 2>&1; then
    echo "  ✅ Node dependencies installed"
else
    echo "  ❌ Failed to install Node dependencies"
    cat /tmp/npm-install.log
    exit 1
fi

# Step 3: Install Python dependencies
echo ""
echo "Step 3️⃣  : Installing Python dependencies..."
cd "$PROJECT_PATH/recommandation"
if pip install -r requirements.txt > /tmp/pip-install.log 2>&1; then
    echo "  ✅ Python dependencies installed"
else
    echo "  ❌ Failed to install Python dependencies"
    cat /tmp/pip-install.log
    exit 1
fi

# Step 4: Show instructions
echo ""
echo "======================================="
echo "✅ Setup Complete!"
echo "======================================="
echo ""
echo "🚀 To start the servers, choose one:"
echo ""
echo "Option A: Separate Terminal Windows"
echo "  bash start-servers.sh"
echo ""
echo "Option B: Combined Terminal"
echo "  bash start-servers-combined.sh"
echo ""
echo "📱 Then open: http://localhost:8080/dashboard"
echo ""
