#!/bin/bash
FRONTEND_DIR="/var/www/truebread-frontend"
BACKUP_DIR="$HOME/app-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=== True Bread Frontend Deployment Script ==="
echo "Starting frontend deployment at: $(date)"
echo "Frontend directory: $FRONTEND_DIR"
echo "Backup directory: $BACKUP_DIR"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup of frontend
echo "Creating backup of frontend..."
cp -r $FRONTEND_DIR $BACKUP_DIR/frontend_backup_$DATE
echo "Backup created at: $BACKUP_DIR/frontend_backup_$DATE"

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

# Test frontend access
echo "Testing frontend access..."
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
echo "Frontend HTTP status code: $FRONTEND_CHECK"

if [ $FRONTEND_CHECK -eq 200 ]; then
    echo "✅ Frontend access test passed!"
    echo "Frontend deployment successful!"
else
    echo "❌ Frontend access test failed with status code: $FRONTEND_CHECK"
    
    # Restore from backup
    echo "Restoring frontend from backup..."
    rm -rf $FRONTEND_DIR/*
    cp -r $BACKUP_DIR/frontend_backup_$DATE/* $FRONTEND_DIR/
    sudo chown -R www-data:www-data $FRONTEND_DIR
    sudo chmod -R 755 $FRONTEND_DIR/
    
    echo "Frontend rollback completed."
fi

exit 0
