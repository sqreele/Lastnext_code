#!/bin/bash
set -e

echo "🚀 Starting development environment..."

# Stop any existing containers
docker compose -f docker-compose.dev.yml down

# Build and start the development container
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up

echo "✅ Development environment started!"
echo "📱 Frontend available at: http://localhost:3000"