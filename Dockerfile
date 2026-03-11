# ── Stage 1: build React SPA ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install frontend dependencies before copying source (layer cache)
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci

# Copy source and build.
# REACT_APP_API_URL must be empty so the SPA uses same-origin requests.
# .dockerignore excludes frontend/.env to prevent localhost:2000 being baked in.
COPY frontend/ frontend/
ENV REACT_APP_API_URL=
RUN cd frontend && npm run build

# ── Stage 2: production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Install backend production dependencies only
COPY backend/package*.json backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source
COPY backend/ backend/

# Copy compiled React SPA from stage 1 into the path Express expects:
# path.join(__dirname, '../frontend/build') where __dirname = /app/backend
COPY --from=builder /app/frontend/build frontend/build

# Create uploads directory; in production this path is bind-mounted as a volume
RUN mkdir -p backend/uploads

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "backend/app.js"]
