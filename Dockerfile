# ── Stage 1: build React SPA ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install frontend dependencies first (layer-cached separately from source)
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci

# Copy source and build
COPY frontend/ frontend/
RUN cd frontend && npm run build

# ── Stage 2: production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install backend production dependencies only
COPY backend/package*.json backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/ backend/

# Copy the compiled React SPA from stage 1 into the path Express expects
COPY --from=builder /app/frontend/build frontend/build

# Create the uploads directory so the Fly Volume mount point exists at startup
RUN mkdir -p backend/uploads

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "backend/app.js"]
