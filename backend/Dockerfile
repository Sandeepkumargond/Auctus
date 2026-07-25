# ──────────────────────────────────────────────
# Stage 1: Install dependencies
# ──────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first for better layer caching
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# ──────────────────────────────────────────────
# Stage 2: Production image
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner

# Create a non-root user for security
RUN addgroup -S auctus && adduser -S auctus -G auctus

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY --chown=auctus:auctus . .

# Switch to non-root user
USER auctus

EXPOSE 8000

ENV NODE_ENV=production \
    PORT=8000

# Use node directly (not npm) for clean signal handling
CMD ["node", "index.js"]
