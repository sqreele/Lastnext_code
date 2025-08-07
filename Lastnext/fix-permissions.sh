#!/bin/bash

echo "🔧 Fixing Next.js permission issues..."

# Function to check if container exists
check_container() {
    if docker ps -a --format "table {{.Names}}" | grep -q "frontend-2"; then
        return 0
    else
        return 1
    fi
}

# Option 1: Quick fix for existing container
if check_container; then
    echo "📦 Found existing frontend-2 container"
    echo "🛠️  Applying quick permission fix..."
    
    # Stop the container if running
    docker stop frontend-2 2>/dev/null || true
    
    # Start container temporarily to fix permissions
    docker start frontend-2 2>/dev/null || true
    sleep 2
    
    # Fix permissions as root user
    docker exec -u root frontend-2 sh -c "
        echo 'Creating .next directory structure...'
        mkdir -p /app/.next/cache /app/.next/types /app/.next/server /app/.next/static /app/.next/server/app
        echo 'Setting ownership to nextjs:nodejs...'
        chown -R nextjs:nodejs /app/.next
        echo 'Setting permissions to 755...'
        chmod -R 755 /app/.next
        echo 'Permissions fixed successfully!'
    " 2>/dev/null || {
        echo "❌ Could not fix permissions in existing container"
        echo "   The container might not be accessible or might be using a different name"
    }
    
    # Restart the container
    echo "🔄 Restarting container..."
    docker restart frontend-2 2>/dev/null || true
    
    echo "✅ Quick fix applied. Container should start properly now."
    
else
    echo "📦 Container 'frontend-2' not found. Building new container..."
    
    # Option 2: Rebuild with updated Dockerfile
    echo "🏗️  Building new container with fixed permissions..."
    
    # Build the image
    docker build -t frontend-fixed .
    
    # Run the new container
    docker run -d --name frontend-fixed -p 3000:3000 frontend-fixed
    
    echo "✅ New container 'frontend-fixed' created and started."
fi

echo ""
echo "🎯 Next steps:"
echo "   1. Check container logs: docker logs frontend-2 (or frontend-fixed)"
echo "   2. Access the app: http://localhost:3000"
echo "   3. For development, consider using: docker-compose -f docker-compose.dev.yml up -d --build"
echo ""
echo "📝 If issues persist, check the quick-fix.md file for additional options."