#!/bin/bash

echo "🚀 Starting TrackerSpend on Railway..."

# Verifica che il frontend sia buildato
if [ ! -d "frontend/dist" ]; then
    echo "📦 Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Avvia il backend
echo "🐍 Starting Python backend..."
python3 backend_python/app.py
