# Next.js Docker Permission Fix

## Problem
The Next.js container was failing with permission errors:
```
[Error: EACCES: permission denied, mkdir '/app/.next/types']
Error: EACCES: permission denied, open '/app/.next/trace'
```

## Root Cause
The container was running as a non-root user (`nextjs`) but the `/app` directory and its subdirectories didn't have proper ownership and permissions.

## Solutions

### Solution 1: Use Development Dockerfile (Recommended for Development)

1. **Build and run using the development setup:**
   ```bash
   cd Lastnext
   ./scripts/dev.sh
   ```

   This uses `Dockerfile.dev` which:
   - Sets proper ownership (`chown -R nextjs:nodejs /app`)
   - Sets proper permissions (`chmod -R 755 /app`)
   - Creates necessary directories with correct permissions
   - Uses `docker-compose.dev.yml` with proper volume mounts

### Solution 2: Fix Existing Container (Quick Fix)

If you want to continue using your existing setup:

1. **Stop the current containers:**
   ```bash
   docker compose down
   ```

2. **Rebuild with the updated Dockerfile:**
   ```bash
   docker compose build --no-cache
   docker compose up
   ```

### Solution 3: Manual Permission Fix (Emergency)

If you need to fix permissions on a running container:

```bash
# Enter the container as root
docker exec -it --user root <container_name> sh

# Fix permissions
chown -R nextjs:nodejs /app
chmod -R 755 /app
mkdir -p /app/.next/types /app/.next/trace
chown -R nextjs:nodejs /app/.next
chmod -R 755 /app/.next

# Exit and restart the container
exit
docker restart <container_name>
```

## Key Changes Made

### Dockerfile.dev
- Creates non-root user `nextjs` (UID: 1001, GID: 1001)
- Sets proper ownership: `chown -R nextjs:nodejs /app`
- Sets proper permissions: `chmod -R 755 /app`
- Creates necessary directories: `/app/.next/types`, `/app/.next/trace`
- Runs as non-root user for security

### docker-compose.dev.yml
- Uses `Dockerfile.dev`
- Mounts source code for hot reloading
- Excludes `node_modules` and `.next` to avoid conflicts
- Sets user to `1001:1001` (nextjs user)
- Includes health checks

### Updated Dockerfile
- Added proper ownership setting in builder stage
- Added creation of `/app/.next/types` directory
- Added proper permissions (`chmod -R 755 /app`)

## Security Notes
- The container runs as non-root user `nextjs` (UID: 1001)
- All files are owned by `nextjs:nodejs`
- Proper file permissions (755) are set
- This maintains security while fixing the permission issues

## Troubleshooting

If you still encounter permission issues:

1. **Check container user:**
   ```bash
   docker exec -it <container_name> whoami
   ```

2. **Check file ownership:**
   ```bash
   docker exec -it <container_name> ls -la /app
   ```

3. **Check .next directory:**
   ```bash
   docker exec -it <container_name> ls -la /app/.next
   ```

4. **Rebuild from scratch:**
   ```bash
   docker compose down
   docker system prune -f
   docker compose build --no-cache
   docker compose up
   ```