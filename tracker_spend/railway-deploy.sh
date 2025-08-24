#!/bin/bash

echo "🚀 Railway Deployment Script"
echo "============================"

# Verifica prerequisiti
echo "📋 Checking prerequisites..."

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

# Verifica npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

# Verifica Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found"
    exit 1
fi

echo "✅ Prerequisites OK"

# Installa dipendenze
echo "📦 Installing dependencies..."

# Root dependencies
echo "Installing root dependencies..."
npm install

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Backend dependencies
echo "Installing backend dependencies..."
cd backend_python
pip install -r requirements.txt
cd ..

echo "✅ Dependencies installed"

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Frontend built"

# Test build
echo "🧪 Testing build..."
cd backend_python
python -c "import app; print('✅ Backend imports OK')"
cd ..

echo "✅ Build test passed"

echo "🎉 Deployment ready!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub"
echo "2. Connect to Railway"
echo "3. Add MySQL database"
echo "4. Configure environment variables"
echo "5. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
