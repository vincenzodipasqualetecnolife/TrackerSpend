#!/bin/bash

echo "🚀 Starting Railway deployment..."

# Installa le dipendenze del backend
echo "📦 Installing backend dependencies..."
cd backend_python
pip install -r requirements.txt

# Installa le dipendenze del frontend
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Build del frontend
echo "🔨 Building frontend..."
npm run build

# Torna alla root
cd ..

echo "✅ Build completed!"
