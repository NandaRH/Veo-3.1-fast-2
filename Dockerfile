# Dockerfile untuk Railway dengan Xvfb + noVNC (Virtual Display + Web Access)
# Ini memungkinkan browser "visible" dan bisa diakses via web

FROM node:20-slim

# Install dependencies untuk Chromium + Xvfb + VNC
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    # Xvfb untuk virtual display
    xvfb \
    # VNC untuk remote access
    x11vnc \
    # noVNC untuk web-based VNC
    novnc \
    websockify \
    # Window manager sederhana
    fluxbox \
    # Tambahan untuk stealth
    libx11-xcb1 \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (termasuk devDependencies untuk build)
RUN npm ci

# Install Playwright browsers
RUN npx playwright install chromium

# Copy source code
COPY . .

# Build arguments untuk NEXT_PUBLIC variables (dibutuhkan saat build)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set sebagai environment variables untuk build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build Next.js dengan environment variables
RUN npm run build || true

# Create browser-data directory
RUN mkdir -p browser-data

# Expose ports: App + noVNC
EXPOSE 8790 6080

# Environment variables (runtime)
ENV NODE_ENV=production
ENV PORT=8790
# Virtual display untuk Xvfb
ENV DISPLAY=:99
# VNC password (optional, bisa diset via env var)
ENV VNC_PASSWORD=veo123

# Script untuk jalankan Xvfb + VNC + app
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
