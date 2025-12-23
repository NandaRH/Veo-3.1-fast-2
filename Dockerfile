# Dockerfile untuk Railway dengan Xvfb (Virtual Display)
# Ini memungkinkan browser "visible" tanpa monitor fisik

FROM node:20-slim

# Install dependencies untuk Chromium + Xvfb
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

# Expose port
EXPOSE 8790

# Environment variables (runtime)
ENV NODE_ENV=production
ENV PORT=8790
# Virtual display untuk Xvfb
ENV DISPLAY=:99

# Script untuk jalankan Xvfb + app
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
