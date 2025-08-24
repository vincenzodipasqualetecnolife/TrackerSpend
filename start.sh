#!/bin/bash

echo "🚀 Avvio TrackerSpend - App di Gestione Budget"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker non è installato. Installa Docker prima di continuare."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose non è disponibile. Verifica l'installazione di Docker."
    exit 1
fi

# Ensure Docker context is 'default'
current_ctx=$(docker context show 2>/dev/null)
if [ "$current_ctx" != "default" ]; then
    echo "🔁 Imposto il contesto Docker su 'default' (era: $current_ctx)"
    docker context use default >/dev/null 2>&1 || {
        echo "❌ Impossibile selezionare il contesto 'default'"; exit 1; }
fi

echo "📦 Costruzione e avvio dei container..."
docker compose up --build

echo "✅ Applicazione avviata!"
echo "🌐 Frontend React: http://localhost:5173"
echo "🔧 Backend Flutter API: http://localhost:3001"
echo "📱 Flutter Web UI: http://localhost:8080"
echo ""
echo "Per fermare l'applicazione, premi Ctrl+C"
