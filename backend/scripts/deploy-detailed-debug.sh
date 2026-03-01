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
    echo "Health check passed! Deployment successful."
    exit 0
else
    echo "Health check failed with status code: $HEALTH_CHECK"
    
    # Get detailed logs
    echo "Getting detailed PM2 logs:"
    pm2 logs true-bread-backend --lines 20
    
    echo "Deployment failed! Rolling back..."
    
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
    
    echo "Rollback completed."
    exit 1
fi
