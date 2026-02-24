#!/bin/bash
set -e

echo "=== LeanLife Local Setup ==="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required. Install from https://docker.com"; exit 1; }

echo "1. Starting PostgreSQL and Redis via Docker..."
docker-compose -f infra/docker-compose.yml up -d postgres redis

echo "2. Waiting for services to be ready..."
sleep 3

echo "3. Installing backend dependencies..."
cd backend
npm install

echo "4. Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   Created .env from .env.example"
fi

echo "5. Running database migrations..."
npx prisma generate
npx prisma migrate dev --name init 2>/dev/null || npx prisma db push

echo "6. Seeding database..."
npx tsx prisma/seed.ts

echo "7. Installing frontend dependencies..."
cd ../frontend-web
npm install

echo ""
echo "=== Setup complete! ==="
echo ""
echo "To start the backend:  cd backend && npm run dev"
echo "To start the frontend: cd frontend-web && npm run dev"
echo ""
echo "Demo user: marie@example.com / demo1234"
echo ""
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"
