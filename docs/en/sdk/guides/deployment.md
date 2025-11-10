# MPLP Deployment Guide

> **🎯 Goal**: Master production deployment of MPLP applications  
> **📚 Audience**: DevOps Engineers, System Administrators  
> **🌐 Language**: English | [中文](../../docs-sdk/guides/deployment.md)

---

## 📋 **Table of Contents**

1. [Environment Setup](#environment-setup)
2. [Configuration Management](#configuration-management)
3. [Deployment Strategies](#deployment-strategies)
4. [Monitoring and Logging](#monitoring-and-logging)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 **Environment Setup**

### **1.1 System Requirements**

**Minimum Requirements**:
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0 or yarn ≥ 1.22.0
- Memory ≥ 512MB
- Disk Space ≥ 1GB

**Recommended Configuration**:
- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- Memory ≥ 2GB
- Disk Space ≥ 5GB
- CPU ≥ 2 cores

### **1.2 Dependency Installation**

```bash
# Production installation
npm install --production

# Or using yarn
yarn install --production

# Verify installation
npm list mplp
```

---

## ⚙️ **Configuration Management**

### **2.1 Environment Variables**

**Create .env file**:
```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=warn
MPLP_MODULES=context,plan,role,core

# Performance configuration
MAX_CONCURRENT_TASKS=10
TASK_TIMEOUT=30000

# Monitoring configuration
ENABLE_METRICS=true
METRICS_PORT=9090
```

### **2.2 Configuration Files**

**config/production.ts**:
```typescript
import { MPLPConfig } from 'mplp';

export const productionConfig: MPLPConfig = {
  protocolVersion: '1.1.0-beta',
  environment: 'production',
  logLevel: 'warn',
  modules: ['context', 'plan', 'role', 'core'],
  customConfig: {
    maxConcurrentTasks: 10,
    taskTimeout: 30000,
    retryAttempts: 3,
    enableMetrics: true
  }
};
```

### **2.3 Configuration Loading**

```typescript
import * as dotenv from 'dotenv';
import { productionConfig } from './config/production';

// Load environment variables
dotenv.config({ path: '.env.production' });

// Create MPLP instance
const mplp = await createMPLP(productionConfig);
```

---

## 🚀 **Deployment Strategies**

### **3.1 Docker Deployment**

**Dockerfile**:
```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --production

# Copy application code
COPY dist/ ./dist/
COPY config/ ./config/

# Expose ports
EXPOSE 3000 9090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "dist/index.js"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  mplp-agent:
    build: .
    ports:
      - "3000:3000"
      - "9090:9090"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=warn
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

**Build and Run**:
```bash
# Build image
docker build -t mplp-agent:1.1.0-beta .

# Run container
docker run -d \
  --name mplp-agent \
  -p 3000:3000 \
  -p 9090:9090 \
  -e NODE_ENV=production \
  mplp-agent:1.1.0-beta

# Using docker-compose
docker-compose up -d
```

### **3.2 PM2 Deployment**

**ecosystem.config.js**:
```javascript
module.exports = {
  apps: [{
    name: 'mplp-agent',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'warn'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

**Deployment Commands**:
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs mplp-agent

# Restart application
pm2 restart mplp-agent

# Stop application
pm2 stop mplp-agent

# Setup startup script
pm2 startup
pm2 save
```

### **3.3 Kubernetes Deployment**

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mplp-agent
  labels:
    app: mplp-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mplp-agent
  template:
    metadata:
      labels:
        app: mplp-agent
    spec:
      containers:
      - name: mplp-agent
        image: mplp-agent:1.1.0-beta
        ports:
        - containerPort: 3000
        - containerPort: 9090
        env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "warn"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mplp-agent-service
spec:
  selector:
    app: mplp-agent
  ports:
  - name: http
    port: 80
    targetPort: 3000
  - name: metrics
    port: 9090
    targetPort: 9090
  type: LoadBalancer
```

**Deployment Commands**:
```bash
# Apply configuration
kubectl apply -f deployment.yaml

# View deployment status
kubectl get deployments
kubectl get pods

# View logs
kubectl logs -f deployment/mplp-agent

# Scale
kubectl scale deployment mplp-agent --replicas=5

# Update image
kubectl set image deployment/mplp-agent mplp-agent=mplp-agent:1.2.0
```

---

## 📊 **Monitoring and Logging**

### **4.1 Health Checks**

**healthcheck.js**:
```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.end();
```

### **4.2 Logging Configuration**

**Using Winston**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### **4.3 Performance Monitoring**

**Using Prometheus**:
```typescript
import promClient from 'prom-client';

// Create metrics
const taskCounter = new promClient.Counter({
  name: 'mplp_tasks_total',
  help: 'Total number of tasks executed'
});

const taskDuration = new promClient.Histogram({
  name: 'mplp_task_duration_seconds',
  help: 'Task execution duration'
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

## 🔍 **Troubleshooting**

### **5.1 Common Issues**

**Issue 1: Memory Leaks**
```bash
# Check memory usage
node --inspect dist/index.js

# Using heapdump
npm install heapdump
node --require heapdump dist/index.js
```

**Issue 2: Performance Problems**
```bash
# Using clinic.js
npm install -g clinic
clinic doctor -- node dist/index.js
```

**Issue 3: Connection Timeouts**
```typescript
// Increase timeout
const config = {
  customConfig: {
    taskTimeout: 60000,  // 60 seconds
    connectionTimeout: 30000
  }
};
```

### **5.2 Log Analysis**

```bash
# View error logs
tail -f logs/error.log

# Search for specific errors
grep "ERROR" logs/combined.log

# Count errors
grep -c "ERROR" logs/combined.log
```

---

## 📚 **Summary**

Following this guide will help you:
- ✅ Properly configure production environment
- ✅ Choose appropriate deployment strategy
- ✅ Implement effective monitoring
- ✅ Quickly troubleshoot and resolve issues

## 🔗 **Related Resources**

- [Best Practices](best-practices.md)
- [Architecture Guide](architecture.md)
- [Testing Guide](testing.md)

---

**Version**: v1.1.0-beta  
**Last Updated**: 2025-10-22  
**Maintainer**: MPLP Team

