# Multi-stage build for Express with Bun
FROM oven/bun:1.1.13-alpine AS dependencies

# Security: Update packages and add security tools
RUN apk update && apk upgrade && \
    apk add --no-cache curl dumb-init tini && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json bun.lockb* ./

# Install dependencies including dev dependencies for TypeScript compilation
RUN bun install --frozen-lockfile && \
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

# Compile TypeScript to JavaScript
RUN bun run build && \
    # Verify build output exists
    ls -la dist/

# Production stage
FROM oven/bun:1.1.13-alpine AS production

# Security updates and essential tools
RUN apk update && apk upgrade && \
    apk add --no-cache curl dumb-init tini && \
    rm -rf /var/cache/apk/*

# Create non-root user with specific UID/GID for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S express -u 1001 -G nodejs

# Install production dependencies only
WORKDIR /app

# Copy package files and install production dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production && \
    # Clean package manager cache
    bun pm cache clear

# Copy built application with proper ownership
COPY --from=builder --chown=express:nodejs /app/dist ./dist

# Security: Remove unnecessary files and set proper permissions
RUN find /app -type f -name "*.md" -delete && \
    find /app -type f -name "*.txt" -delete 2>/dev/null || true && \
    chown -R express:nodejs /app

# Switch to non-root user
USER express

# Expose port (non-privileged)
EXPOSE 5000

# Enhanced health check with proper error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["bun", "run", "dist/server.js"]

# Development stage
FROM dependencies AS development

WORKDIR /app

# Copy source code
COPY . .

# Install curl for health checks and development tools
RUN apk add --no-cache curl

# Create non-root user for development
USER express

# Expose port
EXPOSE 5000

# Enhanced health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Set development environment
ENV NODE_ENV=development

# Start development server with hot reload
CMD ["bun", "run", "dev"]
