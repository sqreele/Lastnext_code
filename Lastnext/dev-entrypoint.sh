#!/bin/sh
set -e

echo "Starting Next.js application..."

# Ensure we're running as the correct user
echo "Running as user: $(id)"

# Create .next directory structure with proper permissions
echo "Creating .next directory structure..."
mkdir -p /app/.next/cache
mkdir -p /app/.next/types
mkdir -p /app/.next/server
mkdir -p /app/.next/static
mkdir -p /app/.next/server/app

# Set proper permissions
chmod -R 755 /app/.next
chown -R nextjs:nodejs /app/.next 2>/dev/null || true

# Check if we can write to the directory
if [ -w /app/.next ]; then
    echo "✅ .next directory is writable"
else
    echo "❌ .next directory is not writable"
    ls -la /app/.next
fi

# Start the application
echo "Starting Next.js development server..."
exec "$@"