#!/bin/bash

echo "🚀 Starting Harvest Hub Application..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   On Windows: mongod"
    echo "   On macOS/Linux: sudo systemctl start mongod"
    echo ""
    read -p "Press Enter to continue anyway..."
fi

# Check ports
echo "🔍 Checking ports..."
check_port 5000 || exit 1
check_port 5173 || exit 1

# Create .env files if they don't exist
echo "📝 Setting up environment files..."

# Backend .env
if [ ! -f "harvesthub-backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > harvesthub-backend/.env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/harvesthub

# JWT Configuration
JWT_SECRET=harvest_hub_jwt_secret_key_2024
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads
EOF
    echo "✅ Backend .env created"
else
    echo "✅ Backend .env already exists"
fi

# Frontend .env
if [ ! -f "harvest-hub-bloom/.env" ]; then
    echo "Creating frontend .env file..."
    cat > harvest-hub-bloom/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
EOF
    echo "✅ Frontend .env created"
else
    echo "✅ Frontend .env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."

echo "Installing backend dependencies..."
cd harvesthub-backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd harvest-hub-bloom
npm install
cd ..

# Start both servers
echo "🚀 Starting servers..."

# Start backend in background
echo "Starting backend server..."
cd harvesthub-backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
cd harvest-hub-bloom
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Harvest Hub is starting up!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo "📊 MongoDB:  mongodb://localhost:27017/harvesthub"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 