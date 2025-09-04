# MPLP Installation Guide

**Multi-Agent Protocol Lifecycle Platform - Installation Guide v1.0.0-alpha**

[![Installation](https://img.shields.io/badge/installation-production%20ready-brightgreen.svg)](./README.md)
[![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20Linux%20%7C%20macOS-blue.svg)](../en/testing/interoperability-testing.md)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://docker.com/)

---

## 🎯 Installation Overview

MPLP supports multiple installation methods to fit different development and deployment scenarios. Choose the method that best suits your needs.

### **System Requirements**
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **TypeScript**: 5.0.0 or higher (for development)
- **Memory**: 512MB minimum, 2GB recommended
- **Disk Space**: 100MB for core installation

### **Supported Platforms**
- ✅ Windows 10/11 (x64)
- ✅ Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)
- ✅ macOS 12.0+ (Intel and Apple Silicon)
- ✅ Docker containers
- ✅ Kubernetes clusters

---

## 📦 Method 1: NPM Installation (Recommended)

### **Global Installation**
```bash
# Install MPLP CLI globally
npm install -g @mplp/cli

# Verify installation
mplp --version
# Expected output: @mplp/cli v1.0.0-alpha

# Check system compatibility
mplp doctor
```

### **Project Installation**
```bash
# Create new project directory
mkdir my-mplp-project
cd my-mplp-project

# Initialize npm project
npm init -y

# Install MPLP core packages
npm install @mplp/core @mplp/context @mplp/plan @mplp/role

# Install development dependencies
npm install --save-dev @mplp/testing @types/node typescript

# Verify installation
npx mplp --version
```

### **Full Installation (All Modules)**
```bash
# Install all MPLP modules
npm install @mplp/core \
  @mplp/context \
  @mplp/plan \
  @mplp/role \
  @mplp/confirm \
  @mplp/trace \
  @mplp/extension \
  @mplp/dialog \
  @mplp/collab \
  @mplp/network

# Or use the meta-package
npm install @mplp/all
```

---

## 🐳 Method 2: Docker Installation

### **Quick Start with Docker**
```bash
# Pull the official MPLP image
docker pull mplp/mplp:1.0.0-alpha

# Run MPLP container
docker run -d \
  --name mplp-server \
  -p 8080:8080 \
  -p 8081:8081 \
  mplp/mplp:1.0.0-alpha

# Verify container is running
docker ps
docker logs mplp-server
```

### **Docker Compose Setup**
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mplp-core:
    image: mplp/mplp:1.0.0-alpha
    container_name: mplp-core
    ports:
      - "8080:8080"
      - "8081:8081"
    environment:
      - MPLP_LOG_LEVEL=info
      - MPLP_ENABLE_METRICS=true
      - MPLP_ENABLE_TRACING=true
    volumes:
      - mplp-data:/app/data
      - ./config:/app/config
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mplp-redis:
    image: redis:7-alpine
    container_name: mplp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  mplp-data:
  redis-data:
```

Run with Docker Compose:
```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f mplp-core
```

---

## ☸️ Method 3: Kubernetes Installation

### **Helm Chart Installation**
```bash
# Add MPLP Helm repository
helm repo add mplp https://charts.mplp.dev
helm repo update

# Install MPLP with default values
helm install mplp mplp/mplp \
  --namespace mplp-system \
  --create-namespace

# Or with custom values
helm install mplp mplp/mplp \
  --namespace mplp-system \
  --create-namespace \
  --values custom-values.yaml
```

### **Manual Kubernetes Deployment**
Create `mplp-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mplp-core
  namespace: mplp-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mplp-core
  template:
    metadata:
      labels:
        app: mplp-core
    spec:
      containers:
      - name: mplp-core
        image: mplp/mplp:1.0.0-alpha
        ports:
        - containerPort: 8080
        - containerPort: 8081
        env:
        - name: MPLP_LOG_LEVEL
          value: "info"
        - name: MPLP_CLUSTER_MODE
          value: "true"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: mplp-core-service
  namespace: mplp-system
spec:
  selector:
    app: mplp-core
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: metrics
    port: 8081
    targetPort: 8081
  type: ClusterIP
```

Deploy to Kubernetes:
```bash
# Create namespace
kubectl create namespace mplp-system

# Apply deployment
kubectl apply -f mplp-deployment.yaml

# Check deployment status
kubectl get pods -n mplp-system
kubectl get services -n mplp-system
```

---

## 🔧 Method 4: Source Installation

### **Development Setup**
```bash
# Clone the repository
git clone https://github.com/mplp-org/mplp.git
cd mplp

# Install dependencies
npm install

# Build the project
npm run build

# Run tests to verify build
npm test

# Start development server
npm run dev
```

### **Production Build**
```bash
# Build for production
npm run build:prod

# Run production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
```

---

## ✅ Installation Verification

### **Basic Health Check**
```bash
# Check MPLP service health
curl http://localhost:8080/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0-alpha",
  "modules": {
    "context": "ready",
    "plan": "ready",
    "role": "ready",
    "confirm": "ready",
    "trace": "ready",
    "extension": "ready",
    "dialog": "ready",
    "collab": "ready",
    "core": "ready",
    "network": "ready"
  },
  "uptime": "00:05:23",
  "timestamp": "2025-09-04T10:30:00.000Z"
}
```

### **Module Verification**
```javascript
// Create test script: verify-installation.js
const { MPLPClient } = require('@mplp/core');

async function verifyInstallation() {
  try {
    const client = new MPLPClient({
      version: '1.0.0-alpha',
      modules: ['context', 'plan', 'core']
    });

    await client.initialize();
    console.log('✅ MPLP Client initialized successfully');

    // Test context creation
    const context = await client.context.createContext({
      contextId: 'test-context-001',
      contextType: 'verification_test',
      contextData: { test: true },
      createdBy: 'installation-verification'
    });
    console.log('✅ Context module working:', context.contextId);

    // Test plan creation
    const plan = await client.plan.createPlan({
      planId: 'test-plan-001',
      contextId: context.contextId,
      planType: 'sequential',
      planSteps: [{
        stepId: 'test-step',
        operation: 'verify',
        parameters: { test: true }
      }]
    });
    console.log('✅ Plan module working:', plan.planId);

    await client.shutdown();
    console.log('✅ Installation verification complete!');
  } catch (error) {
    console.error('❌ Installation verification failed:', error.message);
    process.exit(1);
  }
}

verifyInstallation();
```

Run verification:
```bash
node verify-installation.js
```

### **Performance Test**
```bash
# Run performance benchmark
npx @mplp/testing benchmark --duration 60s --concurrent 10

# Expected output:
# ✅ Performance Test Results:
# - Average Response Time: 45ms
# - Throughput: 1,250 requests/second
# - Success Rate: 100%
# - Memory Usage: 128MB
```

---

## 🔧 Configuration

### **Environment Variables**
```bash
# Core configuration
export MPLP_LOG_LEVEL=info
export MPLP_PORT=8080
export MPLP_METRICS_PORT=8081

# Database configuration
export MPLP_DB_HOST=localhost
export MPLP_DB_PORT=5432
export MPLP_DB_NAME=mplp

# Redis configuration
export MPLP_REDIS_HOST=localhost
export MPLP_REDIS_PORT=6379

# Security configuration
export MPLP_JWT_SECRET=your-secret-key
export MPLP_ENABLE_AUTH=true
```

### **Configuration File**
Create `mplp.config.js`:
```javascript
module.exports = {
  server: {
    port: 8080,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true
    }
  },
  modules: {
    context: { enabled: true },
    plan: { enabled: true },
    role: { enabled: true },
    confirm: { enabled: true },
    trace: { enabled: true },
    extension: { enabled: true },
    dialog: { enabled: true },
    collab: { enabled: true },
    core: { enabled: true },
    network: { enabled: true }
  },
  logging: {
    level: 'info',
    format: 'json',
    file: './logs/mplp.log'
  },
  performance: {
    maxConcurrentRequests: 1000,
    requestTimeout: 30000,
    enableMetrics: true
  }
};
```

---

## 🆘 Troubleshooting

### **Common Installation Issues**

#### **Node.js Version Issues**
```bash
# Check Node.js version
node --version

# Install Node.js 18+ using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### **Permission Issues**
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use npm prefix
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### **Port Conflicts**
```bash
# Check if ports are in use
lsof -i :8080
lsof -i :8081

# Kill processes using the ports
sudo kill -9 $(lsof -t -i:8080)

# Or use different ports
export MPLP_PORT=9080
export MPLP_METRICS_PORT=9081
```

### **Getting Help**
- 📖 [Troubleshooting Guide](../implementation/troubleshooting.md)
- 💬 [GitHub Discussions](https://github.com/mplp-org/mplp/discussions)
- 📧 [Support Email](mailto:support@mplp.dev)
- 🐛 [Issue Tracker](https://github.com/mplp-org/mplp/issues)

---

**Installation Guide Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025

**🎉 Installation complete! Ready to build amazing multi-agent systems with MPLP!**
