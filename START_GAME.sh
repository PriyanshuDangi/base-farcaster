#!/bin/bash

# Shoot It - Game Startup Script
# This script starts both the game server and frontend

echo "🎮 Starting Shoot It Game..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backend/.env exists, if not create from example
if [ ! -f backend/.env ]; then
    echo "${BLUE}Creating backend/.env from example...${NC}"
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        echo "${GREEN}✓ Created backend/.env${NC}"
    else
        echo "${RED}✗ backend/.env.example not found${NC}"
    fi
fi

# Check if .env.local exists, if not create from example
if [ ! -f .env.local ]; then
    echo "${BLUE}Creating .env.local from example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "${GREEN}✓ Created .env.local${NC}"
    else
        echo "${RED}✗ .env.example not found${NC}"
    fi
fi

echo ""
echo "${BLUE}Installing dependencies...${NC}"

# Install backend dependencies
echo "${BLUE}Installing backend dependencies...${NC}"
cd backend
pnpm install --silent
cd ..
echo "${GREEN}✓ Backend dependencies installed${NC}"

# Install frontend dependencies
echo "${BLUE}Installing frontend dependencies...${NC}"
pnpm install --silent
echo "${GREEN}✓ Frontend dependencies installed${NC}"

echo ""
echo "${GREEN}Starting services...${NC}"
echo ""
echo "${BLUE}Backend will run on: ${NC}http://localhost:3001"
echo "${BLUE}Frontend will run on: ${NC}http://localhost:3000"
echo "${BLUE}Game route: ${NC}http://localhost:3000/game"
echo ""
echo "${RED}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "${BLUE}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend server in background
echo "${GREEN}[1/2] Starting game server...${NC}"
cd backend
pnpm start &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend in background
echo "${GREEN}[2/2] Starting frontend...${NC}"
pnpm dev &
FRONTEND_PID=$!

# Wait for both processes
wait

