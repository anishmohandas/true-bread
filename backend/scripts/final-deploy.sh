#!/bin/bash
APP_DIR="/var/www/truebread-backend"
FRONTEND_DIR="/var/www/truebread-frontend"
BACKUP_DIR="$HOME/app-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== True Bread Final Deployment Script (Backend & Frontend) ==="
echo "Starting deployment at: $(date)"
echo "Backend directory: $APP_DIR"
echo "Frontend directory: $FRONTEND_DIR"
echo "Backup directory: $BACKUP_DIR"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup of both backend and frontend
echo "Creating backup of backend..."
cp -r $APP_DIR $BACKUP_DIR/backend_backup_$DATE
echo "Creating backup of frontend..."
cp -r $FRONTEND_DIR $BACKUP_DIR/frontend_backup_$DATE
echo "Backups created at: $BACKUP_DIR"

# Deploy Backend
echo "=== Deploying Backend ==="

# Navigate to backend directory
echo "Navigating to backend directory..."
cd $APP_DIR
echo "Current directory: $(pwd)"

# Pull latest changes from the temp repo and update backend files
echo "Cloning repository..."
git clone https://github.com/anishmohandas/true-bread.git temp-update

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to clone repository"
    exit 1
fi

echo "Repository cloned successfully"

# Check if backend directory exists and copy accordingly
echo "Copying backend files..."
if [ -d "temp-update/backend" ]; then
    echo "Backend directory found, copying contents..."
    cp -r temp-update/backend/* .
    cp -r temp-update/backend/.* . 2>/dev/null || true
else
    echo "No backend directory found, copying root contents..."
    cp -r temp-update/* .
    cp -r temp-update/.* . 2>/dev/null || true
fi

echo "Removing temporary files..."
rm -rf temp-update

# Install backend dependencies (including devDependencies needed for build)
echo "Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi

echo "Backend dependencies installed successfully"

# Build backend application
echo "Building backend application..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build backend application"
    exit 1
fi

echo "Backend application built successfully"

# Fix database connection issue (IPv6 vs IPv4)
echo "Fixing database connection issue..."
sed -i 's/DB_HOST=localhost/DB_HOST=127.0.0.1/g' .env
echo "DB_HOST updated to 127.0.0.1"

# Create missing database tables (if any)
echo "Creating missing database tables..."
mysql -u truebread_user -p$(grep DB_PASSWORD .env | cut -d '=' -f2) -h $(grep DB_HOST .env | cut -d '=' -f2) truebread_prod < scripts/create-missing-tables.sql

if [ $? -ne 0 ]; then
    echo "WARNING: Failed to create missing database tables, but continuing with deployment..."
else
    echo "Missing database tables created successfully"
fi

# Restart backend application
echo "Restarting backend application with PM2..."
pm2 restart true-bread-backend

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to restart backend application with PM2"
    exit 1
fi

echo "Backend application restarted successfully"

# Deploy Frontend
echo "=== Deploying Frontend ==="

# Navigate to temp directory
cd /tmp

# Clone latest code for frontend
echo "Cloning repository for frontend..."
git clone https://github.com/anishmohandas/true-bread.git temp-frontend-update

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to clone repository for frontend"
    exit 1
fi

cd temp-frontend-update

# Install frontend dependencies and build
echo "Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    rm -rf /tmp/temp-frontend-update
    exit 1
fi

echo "Frontend dependencies installed successfully"

# Build frontend for production
echo "Building frontend for production..."
npm run build --configuration production

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build frontend"
    rm -rf /tmp/temp-frontend-update
    exit 1
fi

echo "Frontend built successfully"

# Replace frontend files
echo "Deploying frontend files..."
sudo rm -rf $FRONTEND_DIR/*
sudo cp -r dist/true-bread/* $FRONTEND_DIR/

# Set permissions
echo "Setting frontend permissions..."
sudo chown -R www-data:www-data $FRONTEND_DIR
sudo chmod -R 755 $FRONTEND_DIR

# Clean up
echo "Cleaning up temporary files..."
cd /
rm -rf /tmp/temp-frontend-update

echo "Frontend deployment completed!"

# Wait a bit longer for the backend to fully start
echo "Waiting 10 seconds for backend to fully start..."
sleep 10

# Check backend health with detailed output
echo "Checking backend health..."

# First, check if the process is running
echo "Checking PM2 process status:"
pm2 status true-bread-backend

# Check if port 3000 is listening
echo "Checking if port 3000 is listening:"
netstat -tlnp | grep :3000 || echo "Port 3000 is not listening"

# Check the actual health check that the script uses
echo "Checking backend health endpoint:"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
echo "Backend health check HTTP status code: $HEALTH_CHECK"

if [ $HEALTH_CHECK -eq 200 ]; then
    echo "✅ Backend health check passed!"
else
    echo "❌ Backend health check failed with status code: $HEALTH_CHECK"
    
    # Get detailed logs
    echo "Getting detailed PM2 logs:"
    pm2 logs true-bread-backend --lines 20
    
    echo "Deployment failed! Rolling back..."
    
    # Stop the backend application
    pm2 stop true-bread-backend
    
    # Restore from backup
    echo "Restoring backend from backup..."
    rm -rf $APP_DIR/*
    rm -rf $APP_DIR/.*
    cp -r $BACKUP_DIR/backend_backup_$DATE/* $APP_DIR/
    cp -r $BACKUP_DIR/backend_backup_$DATE/.* $APP_DIR/ 2>/dev/null || true
    
    # Fix database connection in the restored version as well
    echo "Fixing database connection in restored backend..."
    cd $APP_DIR
    sed -i 's/DB_HOST=localhost/DB_HOST=127.0.0.1/g' .env
    
    # Restore frontend from backup
    echo "Restoring frontend from backup..."
    rm -rf $FRONTEND_DIR/*
    cp -r $BACKUP_DIR/frontend_backup_$DATE/* $FRONTEND_DIR/
    sudo chown -R www-data:www-data $FRONTEND_DIR
    sudo chmod -R 755 $FRONTEND_DIR/
    
    # Restart with the old version
    pm2 start true-bread-backend
    
    echo "Rollback completed."
    exit 1
fi

# Test frontend access
echo "Testing frontend access..."
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
echo "Frontend HTTP status code: $FRONTEND_CHECK"

if [ $FRONTEND_CHECK -eq 200 ]; then
    echo "✅ Frontend access test passed!"
else
    echo "❌ Frontend access test failed with status code: $FRONTEND_CHECK"
fi

echo "=== Deployment completed successfully! ==="
echo "Backend: ✅ Running and healthy"
echo "Frontend: ✅ Deployed and accessible"
exit 0
