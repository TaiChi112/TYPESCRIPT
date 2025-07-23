# Multi-stage build for Next.js with Bun
FROM oven/bun:1.1.13-alpine as dependencies

# Security: Update packages and add security tools
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json bun.lockb* ./

# Install dependencies with security audit
RUN bun install --frozen-lockfile --production=false && \
    bun audit --audit-level high

# Build stage
FROM oven/bun:1.1.13-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code (excluding what's in .dockerignore)
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with optimizations
RUN bun run build && \
    # Remove dev dependencies to reduce size
    rm -rf node_modules && \
    bun install --frozen-lockfile --production=true

# Production stage
FROM oven/bun:1.1.13-alpine AS production

# Security updates and essential tools
RUN apk update && apk upgrade && \
    apk add --no-cache curl dumb-init tini && \
    rm -rf /var/cache/apk/*

# Create non-root user with specific UID/GID for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

WORKDIR /app

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Copy built application with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Security: Remove unnecessary files and set read-only filesystem
RUN find /app -type f -name "*.md" -delete && \
    find /app -type f -name "*.txt" -delete 2>/dev/null || true

# Switch to non-root user
USER nextjs

# Expose port (non-privileged)
EXPOSE 3000

# Enhanced health check with timeout and proper error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || curl -f http://localhost:3000 || exit 1

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]

# Development stage
FROM dependencies AS development

WORKDIR /app

# Copy source code
COPY . .

# Install curl for health checks and development tools
RUN apk add --no-cache curl

# Create non-root user for development
USER nextjs

# Expose port
EXPOSE 3000

# Enhanced health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Set development environment
ENV NODE_ENV=development

# Start development server with hot reload
CMD ["bun", "run", "dev"]
