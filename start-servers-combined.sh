#!/bin/bash

# AI Career Navigator - Start Both Servers (Combined Terminal View)
# Run this if you prefer seeing both servers in the same terminal

PROJECT_PATH="/Users/pramukh/Downloads/AI-Career-Navigator-main"

echo "🚀 Starting AI Career Navigator..."
echo ""

# Check MongoDB
if ! pgrep -x "mongod" > /dev/null; then
    echo "📦 Starting MongoDB..."
    brew services start mongodb-community 2>/dev/null || true
    sleep 2
fi

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill %1 %2 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Start Node.js server in background
echo "🟢 Starting Node.js Server (Port 8080)..."
cd "$PROJECT_PATH/Login"
npm install > /dev/null 2>&1
npm run dev &
NODE_PID=$!
sleep 2

# Start Python server in background
echo "🐍 Starting Python Server (Port 5000)..."
cd "$PROJECT_PATH/recommandation"
pip install -r requirements.txt > /dev/null 2>&1
python app.py &
PYTHON_PID=$!
sleep 2

echo ""
echo "✅ Both servers are running!"
echo ""
echo "📱 Access the application at:"
echo "   🔗 http://localhost:8080/dashboard"
echo ""
echo "📊 Server Ports:"
echo "   Node.js: http://localhost:8080"
echo "   Python:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait $NODE_PID $PYTHON_PID 2>/dev/null || true
