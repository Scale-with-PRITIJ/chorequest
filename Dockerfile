# ─── Stage 1: Build the Vite frontend ────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Vite will automatically find the .env file in the root directory
RUN npm run build

# ─── Stage 2: Production runtime ──────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server source and compiled frontend
COPY server.ts ./
COPY server/ ./server/
COPY tsconfig.json ./
COPY --from=builder /app/dist ./dist

# tsx is needed to run TypeScript directly in production
# (no compile step required — Cloud Run has enough CPU headroom)
RUN npm install --save-dev tsx typescript

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Cloud Run sets PORT automatically; server.ts reads it
CMD ["node", "--import", "tsx/esm", "server.ts"]
