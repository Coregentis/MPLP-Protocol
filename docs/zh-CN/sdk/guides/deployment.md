# MPLP部署指南

> **🎯 目标**: 掌握MPLP应用的生产环境部署  
> **📚 适用对象**: DevOps工程师、系统管理员  
> **🌐 语言**: [English](../../docs-sdk-en/guides/deployment.md) | 中文

---

## 📋 **目录**

1. [环境准备](#环境准备)
2. [配置管理](#配置管理)
3. [部署策略](#部署策略)
4. [监控和日志](#监控和日志)
5. [故障排查](#故障排查)

---

## 🔧 **环境准备**

### **1.1 系统要求**

**最低要求**:
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0 或 yarn ≥ 1.22.0
- 内存 ≥ 512MB
- 磁盘空间 ≥ 1GB

**推荐配置**:
- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- 内存 ≥ 2GB
- 磁盘空间 ≥ 5GB
- CPU ≥ 2核

### **1.2 依赖安装**

```bash
# 生产环境安装
npm install --production

# 或使用yarn
yarn install --production

# 验证安装
npm list mplp
```

---

## ⚙️ **配置管理**

### **2.1 环境变量**

**创建.env文件**:
```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=warn
MPLP_MODULES=context,plan,role,core

# 性能配置
MAX_CONCURRENT_TASKS=10
TASK_TIMEOUT=30000

# 监控配置
ENABLE_METRICS=true
METRICS_PORT=9090
```

### **2.2 配置文件**

**config/production.ts**:
```typescript
import { MPLPConfig } from 'mplp';

export const productionConfig: MPLPConfig = {
  protocolVersion: '1.1.0',
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

### **2.3 配置加载**

```typescript
import * as dotenv from 'dotenv';
import { productionConfig } from './config/production';

// 加载环境变量
dotenv.config({ path: '.env.production' });

// 创建MPLP实例
const mplp = await createMPLP(productionConfig);
```

---

## 🚀 **部署策略**

### **3.1 Docker部署**

**Dockerfile**:
```dockerfile
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --production

# 复制应用代码
COPY dist/ ./dist/
COPY config/ ./config/

# 暴露端口
EXPOSE 3000 9090

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# 启动应用
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

**构建和运行**:
```bash
# 构建镜像
docker build -t mplp-agent:1.1.0 .

# 运行容器
docker run -d \
  --name mplp-agent \
  -p 3000:3000 \
  -p 9090:9090 \
  -e NODE_ENV=production \
  mplp-agent:1.1.0

# 使用docker-compose
docker-compose up -d
```

### **3.2 PM2部署**

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

**部署命令**:
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs mplp-agent

# 重启应用
pm2 restart mplp-agent

# 停止应用
pm2 stop mplp-agent

# 设置开机自启
pm2 startup
pm2 save
```

### **3.3 Kubernetes部署**

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
        image: mplp-agent:1.1.0
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

**部署命令**:
```bash
# 应用配置
kubectl apply -f deployment.yaml

# 查看部署状态
kubectl get deployments
kubectl get pods

# 查看日志
kubectl logs -f deployment/mplp-agent

# 扩容
kubectl scale deployment mplp-agent --replicas=5

# 更新镜像
kubectl set image deployment/mplp-agent mplp-agent=mplp-agent:1.2.0
```

---

## 📊 **监控和日志**

### **4.1 健康检查**

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

### **4.2 日志配置**

**使用Winston**:
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

### **4.3 性能监控**

**使用Prometheus**:
```typescript
import promClient from 'prom-client';

// 创建指标
const taskCounter = new promClient.Counter({
  name: 'mplp_tasks_total',
  help: 'Total number of tasks executed'
});

const taskDuration = new promClient.Histogram({
  name: 'mplp_task_duration_seconds',
  help: 'Task execution duration'
});

// 暴露指标端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

---

## 🔍 **故障排查**

### **5.1 常见问题**

**问题1: 内存泄漏**
```bash
# 检查内存使用
node --inspect dist/index.js

# 使用heapdump
npm install heapdump
node --require heapdump dist/index.js
```

**问题2: 性能问题**
```bash
# 使用clinic.js
npm install -g clinic
clinic doctor -- node dist/index.js
```

**问题3: 连接超时**
```typescript
// 增加超时时间
const config = {
  customConfig: {
    taskTimeout: 60000,  // 60秒
    connectionTimeout: 30000
  }
};
```

### **5.2 日志分析**

```bash
# 查看错误日志
tail -f logs/error.log

# 搜索特定错误
grep "ERROR" logs/combined.log

# 统计错误数量
grep -c "ERROR" logs/combined.log
```

---

## 📚 **总结**

遵循本指南可以：
- ✅ 正确配置生产环境
- ✅ 选择合适的部署策略
- ✅ 实施有效的监控
- ✅ 快速排查和解决问题

## 🔗 **相关资源**

- [最佳实践](best-practices.md)
- [架构指南](architecture.md)
- [测试指南](testing.md)

---

**版本**: v1.1.0  
**更新时间**: 2025-10-22  
**维护者**: MPLP Team

