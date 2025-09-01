# MPLP v1.0 Deployment Guide

## 📋 Overview

This guide covers deploying MPLP v1.0 in various environments, from development to production, including containerized deployments and cloud platforms.

## 🚀 Quick Deployment

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-org/mplp.git
cd mplp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mplp -u 1001

# Copy built application
COPY --from=builder --chown=mplp:nodejs /app/dist ./dist
COPY --from=builder --chown=mplp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mplp:nodejs /app/package.json ./package.json

# Switch to non-root user
USER mplp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  mplp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MPLP_DB_HOST=postgres
      - MPLP_DB_PORT=5432
      - MPLP_DB_NAME=mplp
      - MPLP_DB_USER=mplp_user
      - MPLP_DB_PASSWORD=secure_password
      - MPLP_REDIS_HOST=redis
      - MPLP_REDIS_PORT=6379
      - MPLP_JWT_SECRET=your_jwt_secret_here
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mplp
      - POSTGRES_USER=mplp_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - mplp
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f mplp

# Scale the application
docker-compose up -d --scale mplp=3

# Stop all services
docker-compose down
```

## ☁️ Cloud Deployment

### AWS ECS Deployment

#### Task Definition

```json
{
  "family": "mplp-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "mplp",
      "image": "your-account.dkr.ecr.region.amazonaws.com/mplp:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MPLP_DB_HOST",
          "value": "your-rds-endpoint"
        }
      ],
      "secrets": [
        {
          "name": "MPLP_DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:mplp-db-password"
        },
        {
          "name": "MPLP_JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:mplp-jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mplp",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### Service Definition

```json
{
  "serviceName": "mplp-service",
  "cluster": "mplp-cluster",
  "taskDefinition": "mplp-task",
  "desiredCount": 2,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-12345678",
        "subnet-87654321"
      ],
      "securityGroups": [
        "sg-12345678"
      ],
      "assignPublicIp": "ENABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/mplp-tg",
      "containerName": "mplp",
      "containerPort": 3000
    }
  ]
}
```

### Google Cloud Run

#### Deploy Script

```bash
#!/bin/bash

# Build and push to Google Container Registry
docker build -t gcr.io/your-project/mplp:latest .
docker push gcr.io/your-project/mplp:latest

# Deploy to Cloud Run
gcloud run deploy mplp \
  --image gcr.io/your-project/mplp:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars MPLP_DB_HOST=your-cloud-sql-ip \
  --set-secrets MPLP_DB_PASSWORD=mplp-db-password:latest \
  --set-secrets MPLP_JWT_SECRET=mplp-jwt-secret:latest
```

## 🔧 Production Configuration

### Environment Variables

```bash
# Production environment variables
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
MPLP_DB_HOST=your-db-host
MPLP_DB_PORT=5432
MPLP_DB_NAME=mplp_prod
MPLP_DB_USER=mplp_user
MPLP_DB_PASSWORD=secure_production_password
MPLP_DB_SSL=true
MPLP_DB_POOL_SIZE=20

# Redis
MPLP_REDIS_HOST=your-redis-host
MPLP_REDIS_PORT=6379
MPLP_REDIS_PASSWORD=secure_redis_password
MPLP_REDIS_TLS=true

# Security
MPLP_JWT_SECRET=your_very_secure_jwt_secret_key_here
MPLP_ENCRYPTION_KEY=your_encryption_key_here

# Monitoring
MPLP_LOG_LEVEL=info
MPLP_ENABLE_METRICS=true
MPLP_METRICS_PORT=9090

# Performance
MPLP_ENABLE_COMPRESSION=true
MPLP_ENABLE_CACHING=true
MPLP_MAX_CONCURRENT_EXECUTIONS=50
```

### Nginx Configuration

```nginx
upstream mplp_backend {
    least_conn;
    server mplp:3000 max_fails=3 fail_timeout=30s;
    # Add more servers for load balancing
    # server mplp2:3000 max_fails=3 fail_timeout=30s;
    # server mplp3:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://mplp_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://mplp_backend/health;
        access_log off;
    }

    # Metrics endpoint (restrict access)
    location /metrics {
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        deny all;
        proxy_pass http://mplp_backend:9090/metrics;
    }
}
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```typescript
// Health check implementation
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await dataSource.query('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    // Check module health
    const moduleHealth = core.moduleCoordinator.getModuleHealthStatus();
    const allHealthy = Array.from(moduleHealth.values()).every(status => status);
    
    if (allHealthy) {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        modules: Object.fromEntries(moduleHealth)
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        modules: Object.fromEntries(moduleHealth)
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### Readiness Probe

```typescript
app.get('/ready', async (req, res) => {
  try {
    // Check if all modules are initialized
    const depCheck = core.moduleCoordinator.checkModuleDependencies();
    
    if (depCheck.satisfied) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        missing_dependencies: depCheck.missing,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy MPLP

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: mplp
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster mplp-cluster \
            --service mplp-service \
            --force-new-deployment
```

---

This deployment guide provides comprehensive instructions for deploying MPLP v1.0 in various environments with proper security, monitoring, and scalability considerations.
