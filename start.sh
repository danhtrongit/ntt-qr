#!/bin/bash

# QR Promotion System Startup Script
# This script helps start the application in production mode

echo "🚀 Starting QR Promotion System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Set production environment
export NODE_ENV=production
export PORT=3008

echo "📦 Installing dependencies..."
npm ci --only=production

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🔧 Starting application with PM2..."
npm run pm2:start

echo "✅ Application started successfully!"
echo "📱 Access the application at: http://localhost:3008"
echo "👤 Login credentials: admin / Thien.28"
echo ""
echo "📊 Useful commands:"
echo "  npm run pm2:status  - Check application status"
echo "  npm run pm2:logs    - View application logs"
echo "  npm run pm2:monit   - Open PM2 monitoring dashboard"
echo "  npm run pm2:stop    - Stop the application"
echo ""
echo "🎉 QR Promotion System is now running!"
