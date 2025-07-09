# MPLP v1.0 Production Dockerfile
# Multi-stage build for optimized production image

# ===================================
# Stage 1: Build Stage
# ===================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ===================================
# Stage 2: Production Stage
# ===================================
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S mplp && \
    adduser -S mplp -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=mplp:mplp /app/dist ./dist

# Copy necessary files
COPY --chown=mplp:mplp requirements-docs ./requirements-docs
COPY --chown=mplp:mplp ProjectRules ./ProjectRules

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R mplp:mplp logs uploads

# Switch to non-root user
USER mplp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"] 