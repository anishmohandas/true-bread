#!/bin/bash
APP_DIR="/var/www/truebread-backend"
BACKUP_DIR="$HOME/app-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting deployment..."

# Create backup
mkdir -p $BACKUP_DIR
cp -r $APP_DIR $BACKUP_DIR/backup_$DATE

# Navigate to app directory
cd $APP_DIR

# Pull latest changes from the temp repo and update backend files
git clone https://github.com/anishmohandas/true-bread.git temp-update

# Check if backend directory exists and copy accordingly
if [ -d "temp-update/backend" ]; then
    cp -r temp-update/backend/* .
    cp -r temp-update/backend/.* . 2>/dev/null || true
else
    cp -r temp-update/* .
    cp -r temp-update/.* . 2>/dev/null || true
fi

rm -rf temp-update

# Install dependencies (including devDependencies needed for build)
npm install

# Build application
npm run build:prod

# Restart application
pm2 restart true-bread-backend

# Check health
sleep 5
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://thetruebread.com/api/health)

if [ $HEALTH_CHECK -eq 200 ]; then
    echo "Deployment successful! Health check passed."
else
    echo "Deployment failed! Rolling back..."
    pm2 stop true-bread-backend
    rm -rf $APP_DIR/*
    rm -rf $APP_DIR/.*
    cp -r $BACKUP_DIR/backup_$DATE/* $APP_DIR/
    cp -r $BACKUP_DIR/backup_$DATE/.* $APP_DIR/ 2>/dev/null || true
    cd $APP_DIR
    pm2 start true-bread-backend
    echo "Rollback completed."
fi
