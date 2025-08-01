#!/bin/bash
APP_DIR="/var/www/truebread-backend"

echo "=== Fixing Database Connection Issue ==="
echo "App directory: $APP_DIR"

# Navigate to app directory
echo "Navigating to app directory..."
cd $APP_DIR
echo "Current directory: $(pwd)"

# Fix the DB_HOST in .env file
echo "Fixing DB_HOST in .env file..."
if [ -f ".env" ]; then
    # Replace DB_HOST=localhost with DB_HOST=127.0.0.1
    sed -i 's/DB_HOST=localhost/DB_HOST=127.0.0.1/g' .env
    echo "DB_HOST updated to 127.0.0.1"
    
    # Show the updated DB_HOST value
    echo "Current DB_HOST value:"
    grep DB_HOST .env
else
    echo "ERROR: .env file not found"
    exit 1
fi

# Restart application to apply changes
echo "Restarting application with PM2..."
pm2 restart true-bread-backend

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to restart application with PM2"
    exit 1
fi

echo "Application restarted successfully"

# Wait a bit for the application to fully start
echo "Waiting 5 seconds for application to fully start..."
sleep 5

# Check health
echo "Checking health after fixing DB connection..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
echo "Health check HTTP status code: $HEALTH_CHECK"

if [ $HEALTH_CHECK -eq 200 ]; then
    echo "✅ Health check passed! Database connection issue fixed."
else
    echo "❌ Health check failed with status code: $HEALTH_CHECK"
    echo "Getting detailed PM2 logs:"
    pm2 logs true-bread-backend --lines 20
fi
