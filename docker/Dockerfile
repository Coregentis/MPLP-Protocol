# MPLP v1.0 Alpha - Multi-Agent Protocol Lifecycle Platform
# Production-ready Docker image for MPLP protocol stack

# Use official Node.js LTS image as base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S mplp && \
    adduser -S mplp -u 1001 -G mplp

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose development port
EXPOSE 3000

# Set user
USER mplp

# Start development server
CMD ["dumb-init", "npm", "run", "dev"]

# Production stage
FROM base AS production

# Copy built application from development stage
COPY --from=development --chown=mplp:mplp /app/dist ./dist
COPY --from=development --chown=mplp:mplp /app/src/schemas ./src/schemas

# Copy necessary files
COPY --chown=mplp:mplp package*.json ./
COPY --chown=mplp:mplp README.md ./
COPY --chown=mplp:mplp LICENSE ./
COPY --chown=mplp:mplp ALPHA-RELEASE-NOTES.md ./

# Create necessary directories
RUN mkdir -p /app/logs /app/data && \
    chown -R mplp:mplp /app/logs /app/data

# Set environment variables
ENV NODE_ENV=production
ENV MPLP_VERSION=1.0.0-alpha
ENV MPLP_LOG_LEVEL=info
ENV MPLP_PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${MPLP_PORT}/health || exit 1

# Expose port
EXPOSE 3000

# Set user
USER mplp

# Start the application
CMD ["dumb-init", "node", "dist/index.js"]

# Testing stage
FROM development AS testing

# Copy test files
COPY tests/ ./tests/

# Run tests
RUN npm test

# Lint and type check
RUN npm run lint && npm run typecheck

# Validate schemas
RUN npm run validate:schemas

# Check naming conventions
RUN npm run check:naming

# Validate mapping consistency
RUN npm run validate:mapping

# Alpha stage - for Alpha release testing
FROM production AS alpha

# Set Alpha-specific environment variables
ENV NODE_ENV=alpha
ENV MPLP_ENABLE_DEBUG=true
ENV MPLP_ENABLE_METRICS=true
ENV MPLP_ENABLE_TRACING=true

# Add Alpha warning label
LABEL version="1.0.0-alpha" \
      description="MPLP v1.0 Alpha - Multi-Agent Protocol Lifecycle Platform" \
      maintainer="MPLP Team" \
      alpha.warning="This is an Alpha release. APIs may change before stable release." \
      alpha.suitable-for="development,testing" \
      alpha.not-recommended-for="production"

# Add Alpha startup message
RUN echo '#!/bin/sh\necho "⚠️  MPLP v1.0 Alpha - APIs may change before stable release"\necho "✅ Suitable for development and testing environments"\necho "📚 Documentation: https://github.com/your-org/mplp/blob/main/docs/"\nexec "$@"' > /app/alpha-entrypoint.sh && \
    chmod +x /app/alpha-entrypoint.sh && \
    chown mplp:mplp /app/alpha-entrypoint.sh

# Use Alpha entrypoint
ENTRYPOINT ["/app/alpha-entrypoint.sh"]
CMD ["dumb-init", "node", "dist/index.js"]
