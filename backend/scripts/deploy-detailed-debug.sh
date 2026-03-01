#!/bin/bash
APP_DIR="/var/www/truebread-backend"
BACKUP_DIR="$HOME/app-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== True Bread Deployment Script (Detailed Debug Version) ==="
echo "Starting deployment at: $(date)"
echo "App directory: $APP_DIR"
echo "Backup directory: $BACKUP_DIR"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup..."
cp -r $APP_DIR $BACKUP_DIR/backup_$DATE
echo "Backup created at: $BACKUP_DIR/backup_$DATE"

# Ensure Node.js >= 20 is available (required by Angular 20 / Angular CLI)
echo "Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null)
echo "Current Node.js version: $NODE_VERSION"

export NVM_DIR="$HOME/.nvm"

if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "NVM found, loading..."
    source "$NVM_DIR/nvm.sh"
else
    echo "NVM not found. Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    source "$NVM_DIR/nvm.sh"
fi

echo "Installing Node.js v20 LTS..."
nvm install 20
nvm use 20
nvm alias default 20

echo "Node.js version after switch: $(node -v)"
echo "npm version: $(npm -v)"

# Navigate to app directory
echo "Navigating to app directory..."
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
echo "Copying files..."
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

# Install dependencies (including devDependencies needed for build)
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

# Rebuild sharp for the current Node.js version and Linux platform
# (sharp is a native module that must be compiled per Node.js version)
echo "Rebuilding sharp for linux-x64..."
npm install --platform=linux --arch=x64 sharp

if [ $? -ne 0 ]; then
    echo "WARNING: Failed to rebuild sharp, attempting npm rebuild..."
    npm rebuild sharp
fi

echo "Dependencies installed successfully"

# Build application
echo "Building application..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build application"
    exit 1
fi

echo "Application built successfully"

# Restart application
echo "Restarting application with PM2..."
pm2 restart true-bread-backend

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to restart application with PM2"
    exit 1
fi

echo "Application restarted successfully"

# Wait a bit longer for the application to fully start
echo "Waiting 10 seconds for application to fully start..."
sleep 10

# Check health with detailed output
echo "Checking health with detailed output..."

# First, check if the process is running
echo "Checking PM2 process status:"
pm2 status true-bread-backend

# Check if port 3000 is listening
echo "Checking if port 3000 is listening:"
netstat -tlnp | grep :3000 || echo "Port 3000 is not listening"

# Check localhost health endpoint with verbose output
echo "Checking localhost health endpoint:"
curl -v http://localhost:3000/api/health 2>&1 || echo "Local health check failed"

# Check the actual health check that the script uses
echo "Checking health check that script uses:"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
echo "Health check HTTP status code: $HEALTH_CHECK"

if [ $HEALTH_CHECK -eq 200 ]; then
    echo "Health check passed! Backend deployment successful."
else
    echo "Health check failed with status code: $HEALTH_CHECK"
    
    # Get detailed logs
    echo "Getting detailed PM2 logs:"
    pm2 logs true-bread-backend --lines 20
    
    echo "Backend deployment failed! Rolling back..."
    
    # Stop the application
    pm2 stop true-bread-backend
    
    # Restore from backup
    echo "Restoring from backup..."
    rm -rf $APP_DIR/*
    rm -rf $APP_DIR/.*
    cp -r $BACKUP_DIR/backup_$DATE/* $APP_DIR/
    cp -r $BACKUP_DIR/backup_$DATE/.* $APP_DIR/ 2>/dev/null || true
    
    # Restart with the old version
    cd $APP_DIR
    pm2 start true-bread-backend
    
    echo "Backend rollback completed."
    exit 1
fi

# ============================================================
# FRONTEND DEPLOYMENT
# ============================================================
FRONTEND_DIR="/var/www/truebread-frontend"
echo ""
echo "=== Starting Frontend Deployment ==="

# Create frontend backup
echo "Creating frontend backup..."
cp -r $FRONTEND_DIR $BACKUP_DIR/frontend_backup_$DATE
echo "Frontend backup created at: $BACKUP_DIR/frontend_backup_$DATE"

# Clone repo for frontend build
echo "Cloning repository for frontend build..."
cd /tmp
git clone https://github.com/anishmohandas/true-bread.git temp-frontend-update

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to clone repository for frontend"
    exit 1
fi

cd temp-frontend-update

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    rm -rf /tmp/temp-frontend-update
    exit 1
fi

echo "Frontend dependencies installed successfully"

# Build frontend for production
# Angular 20 (application builder) outputs to dist/true-bread/browser/
echo "Building frontend for production..."
npm run build --configuration production

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build frontend"
    rm -rf /tmp/temp-frontend-update
    
    # Restore frontend from backup
    echo "Restoring frontend from backup..."
    sudo rm -rf $FRONTEND_DIR/*
    sudo cp -r $BACKUP_DIR/frontend_backup_$DATE/* $FRONTEND_DIR/
    sudo chown -R www-data:www-data $FRONTEND_DIR
    sudo chmod -R 755 $FRONTEND_DIR/
    echo "Frontend rollback completed."
    exit 1
fi

echo "Frontend built successfully"

# Deploy frontend files (copy from browser/ subdirectory)
echo "Deploying frontend files..."
sudo rm -rf $FRONTEND_DIR/*
sudo cp -r dist/true-bread/browser/* $FRONTEND_DIR/

# Set permissions
echo "Setting frontend permissions..."
sudo chown -R www-data:www-data $FRONTEND_DIR
sudo chmod -R 755 $FRONTEND_DIR

# Clean up
echo "Cleaning up temporary frontend files..."
cd /
rm -rf /tmp/temp-frontend-update

echo "Frontend deployment completed!"

# Test frontend access
echo "Testing frontend access..."
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
echo "Frontend HTTP status code: $FRONTEND_CHECK"

if [ $FRONTEND_CHECK -eq 200 ]; then
    echo "✅ Frontend access test passed!"
    echo ""
    echo "=== Full Deployment Successful! ==="
    exit 0
else
    echo "❌ Frontend access test failed with status code: $FRONTEND_CHECK"
    
    # Restore frontend from backup
    echo "Restoring frontend from backup..."
    sudo rm -rf $FRONTEND_DIR/*
    sudo cp -r $BACKUP_DIR/frontend_backup_$DATE/* $FRONTEND_DIR/
    sudo chown -R www-data:www-data $FRONTEND_DIR
    sudo chmod -R 755 $FRONTEND_DIR/
    
    echo "Frontend rollback completed."
    exit 1
fi
