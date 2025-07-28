#!/bin/bash

# True Bread Backend - Production Setup Script
# This script helps set up the production environment

echo "🚀 True Bread Backend - Production Setup"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
print_status "Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found!"
    print_status "Creating .env.production from template..."
    
    if [ -f ".env.production.template" ]; then
        cp .env.production.template .env.production
        print_status "Please edit .env.production with your actual values"
    else
        print_error "No .env.production.template found. Please create .env.production manually."
        exit 1
    fi
fi

# Install dependencies
print_status "Installing production dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p public/files
mkdir -p public/images

# Build the application
print_status "Building the application..."
npm run build:prod

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

# Test database connection (if test script exists)
if [ -f "test-mysql-connection.ts" ]; then
    print_status "Testing database connection..."
    npm run test:connection
    
    if [ $? -ne 0 ]; then
        print_warning "Database connection test failed. Please check your database configuration."
    else
        print_status "Database connection successful!"
    fi
fi

# Check if PM2 is installed globally
if command -v pm2 &> /dev/null; then
    print_status "PM2 is available. You can use PM2 commands for process management."
    print_status "To start with PM2: npm run pm2:start"
else
    print_warning "PM2 is not installed globally. Install with: npm install -g pm2"
    print_status "You can still start with: npm run start:prod"
fi

print_status "Setup completed successfully! 🎉"
echo ""
echo "Next steps:"
echo "1. Edit .env.production with your actual configuration values"
echo "2. Set up your database and import schema"
echo "3. Configure your email settings"
echo "4. Start the application:"
echo "   - With PM2: npm run pm2:start"
echo "   - Direct: npm run start:prod"
echo ""
echo "Health check will be available at: /api/health"
echo "Documentation: See PRODUCTION_DEPLOYMENT.md for detailed instructions"
