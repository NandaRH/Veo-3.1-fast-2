#!/bin/bash

# Start Xvfb (Virtual Display) di background
echo "Starting Xvfb virtual display..."
Xvfb :99 -screen 0 1280x900x24 -ac &

# Tunggu Xvfb siap
sleep 2

echo "Xvfb started. DISPLAY=$DISPLAY"

# Start Fluxbox window manager (optional, membantu tampilan)
echo "Starting Fluxbox window manager..."
fluxbox &

sleep 1

# Start x11vnc untuk VNC access
echo "Starting x11vnc..."
x11vnc -display :99 -forever -shared -nopw -rfbport 5900 &

sleep 1

# Start noVNC (web-based VNC client)
echo "Starting noVNC on port 6080..."
/usr/share/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &

sleep 1

echo "============================================"
echo "VNC Ready! Access via:"
echo "  Web VNC: http://localhost:6080/vnc.html"
echo "  (Di Railway: https://your-domain:6080/vnc.html)"
echo "============================================"

# Start aplikasi
echo "Starting Node.js application..."
exec node server/index.js
