#!/bin/bash

# Start Xvfb (Virtual Display) di background
echo "Starting Xvfb virtual display..."
Xvfb :99 -screen 0 1280x900x24 -ac &

# Tunggu Xvfb siap
sleep 2

echo "Xvfb started. DISPLAY=$DISPLAY"

# Start aplikasi
echo "Starting Node.js application..."
exec node server/index.js
