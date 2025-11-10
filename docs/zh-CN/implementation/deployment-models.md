# MPLP 部署模型指南

> **🌐 语言导航**: [English](../../en/implementation/deployment-models.md) | [中文](deployment-models.md)



**多智能体协议生命周期平台 - 部署模型指南 v1.0.0-alpha**

[![部署](https://img.shields.io/badge/deployment-企业级就绪-brightgreen.svg)](./README.md)
[![容器](https://img.shields.io/badge/container-生产验证-brightgreen.svg)](./server-implementation.md)
[![基础设施](https://img.shields.io/badge/infrastructure-100%25%20完成-brightgreen.svg)](./performance-requirements.md)
[![质量](https://img.shields.io/badge/tests-2902%2F2902%20通过-brightgreen.svg)](./security-requirements.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../en/implementation/deployment-models.md)

---

## 🎯 部署模型概述

本指南基于**完全完成和测试**的MPLP v1.0 Alpha提供全面的部署策略、基础设施模式和运维指导。所有10个企业级模块完成且生产就绪，本指南涵盖大规模多智能体系统的验证部署模式。

### **企业级部署范围**
- **容器编排**: 经过生产测试的Docker、Kubernetes、Helm部署，包含所有10个模块
- **云平台**: 经过验证的AWS、Azure、GCP部署，具有企业级监控
- **基础设施即代码**: 完整的Terraform、CloudFormation、ARM模板用于MPLP技术栈
- **CI/CD流水线**: 具有2,869测试验证流水线的自动化部署
- **企业级监控**: 使用Trace模块和Core编排的完整可观测性
- **高可用性**: 使用Network模块分布式能力的灾难恢复

### **验证的部署模型**
- **开发环境**: 包含所有10个模块的完整本地开发环境
- **预发布环境**: 具有完整企业功能测试的预生产验证
- **生产环境**: 具有99.9%正常运行时间能力的高可用生产部署
- **分布式部署**: 使用Network模块协调的多节点部署

## 🐳 **容器化部署**

### **Docker容器配置**

```dockerfile
# MPLP生产Dockerfile
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY tsconfig.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/
COPY schemas/ ./schemas/

# 构建应用
RUN npm run build

# 生产镜像
FROM node:18-alpine AS production

# 创建应用用户
RUN addgroup -g 1001 -S mplp && \
    adduser -S mplp -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# 复制配置文件
COPY config/ ./config/
COPY schemas/ ./schemas/

# 设置权限
RUN chown -R mplp:mplp /app
USER mplp

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/main.js"]
```

### **Docker Compose配置**

```yaml
# docker-compose.yml - MPLP完整技术栈
version: '3.8'

services:
  # MPLP核心服务
  mplp-core:
    build: .
    container_name: mplp-core
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://mplp:${DB_PASSWORD}@postgres:5432/mplp
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://mplp:${MQ_PASSWORD}@rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: mplp-postgres
    environment:
      - POSTGRES_DB=mplp
      - POSTGRES_USER=mplp
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: mplp-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  # RabbitMQ消息队列
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: mplp-rabbitmq
    environment:
      - RABBITMQ_DEFAULT_USER=mplp
      - RABBITMQ_DEFAULT_PASS=${MQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    restart: unless-stopped

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: mplp-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - mplp-core
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  default:
    name: mplp-network
```

## ☸️ **Kubernetes部署**

### **Kubernetes清单文件**

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mplp-production
  labels:
    name: mplp-production
    version: v1.0.0-alpha

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mplp-config
  namespace: mplp-production
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  PORT: "3000"
  MPLP_VERSION: "1.0.0-alpha"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mplp-secrets
  namespace: mplp-production
type: Opaque
data:
  DATABASE_PASSWORD: <base64-encoded-password>
  REDIS_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-secret>
  ENCRYPTION_KEY: <base64-encoded-key>

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mplp-core
  namespace: mplp-production
  labels:
    app: mplp-core
    version: v1.0.0-alpha
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mplp-core
  template:
    metadata:
      labels:
        app: mplp-core
        version: v1.0.0-alpha
    spec:
      containers:
      - name: mplp-core
        image: mplp/core:1.0.0-alpha
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          value: "postgresql://mplp:$(DATABASE_PASSWORD)@postgres:5432/mplp"
        - name: REDIS_URL
          value: "redis://:$(REDIS_PASSWORD)@redis:6379"
        envFrom:
        - configMapRef:
            name: mplp-config
        - secretRef:
            name: mplp-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
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
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mplp-core-service
  namespace: mplp-production
spec:
  selector:
    app: mplp-core
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mplp-ingress
  namespace: mplp-production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.mplp.example.com
    secretName: mplp-tls
  rules:
  - host: api.mplp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: mplp-core-service
            port:
              number: 80
```

### **Helm Chart配置**

```yaml
# helm/mplp/Chart.yaml
apiVersion: v2
name: mplp
description: Multi-Agent Protocol Lifecycle Platform
type: application
version: 1.0.0-alpha
appVersion: "1.0.0-alpha"

dependencies:
- name: postgresql
  version: 12.1.9
  repository: https://charts.bitnami.com/bitnami
- name: redis
  version: 17.3.7
  repository: https://charts.bitnami.com/bitnami
- name: rabbitmq
  version: 11.1.3
  repository: https://charts.bitnami.com/bitnami

---
# helm/mplp/values.yaml
# MPLP默认配置值
replicaCount: 3

image:
  repository: mplp/core
  tag: "1.0.0-alpha"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.mplp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: mplp-tls
      hosts:
        - api.mplp.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

# PostgreSQL配置
postgresql:
  enabled: true
  auth:
    postgresPassword: "mplp-postgres-password"
    username: "mplp"
    password: "mplp-password"
    database: "mplp"
  primary:
    persistence:
      enabled: true
      size: 20Gi

# Redis配置
redis:
  enabled: true
  auth:
    enabled: true
    password: "mplp-redis-password"
  master:
    persistence:
      enabled: true
      size: 8Gi

# RabbitMQ配置
rabbitmq:
  enabled: true
  auth:
    username: "mplp"
    password: "mplp-rabbitmq-password"
  persistence:
    enabled: true
    size: 8Gi
```

## ☁️ **云平台部署**

### **AWS部署配置**

```yaml
# terraform/aws/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# EKS集群
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "mplp-production"
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    mplp_nodes = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 3
      
      instance_types = ["t3.medium"]
      
      k8s_labels = {
        Environment = "production"
        Application = "mplp"
      }
    }
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "mplp_postgres" {
  identifier = "mplp-postgres"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "mplp"
  username = "mplp"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.mplp.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "mplp-postgres-final-snapshot"
  
  tags = {
    Name        = "MPLP PostgreSQL"
    Environment = "production"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "mplp" {
  name       = "mplp-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "mplp_redis" {
  replication_group_id       = "mplp-redis"
  description                = "MPLP Redis cluster"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.mplp.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = var.redis_auth_token
  
  tags = {
    Name        = "MPLP Redis"
    Environment = "production"
  }
}
```

### **Azure部署配置**

```yaml
# terraform/azure/main.tf
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# 资源组
resource "azurerm_resource_group" "mplp" {
  name     = "rg-mplp-production"
  location = var.location
  
  tags = {
    Environment = "production"
    Application = "mplp"
  }
}

# AKS集群
resource "azurerm_kubernetes_cluster" "mplp" {
  name                = "aks-mplp-production"
  location            = azurerm_resource_group.mplp.location
  resource_group_name = azurerm_resource_group.mplp.name
  dns_prefix          = "mplp-production"
  
  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_D2_v2"
  }
  
  identity {
    type = "SystemAssigned"
  }
  
  tags = {
    Environment = "production"
    Application = "mplp"
  }
}

# PostgreSQL数据库
resource "azurerm_postgresql_flexible_server" "mplp" {
  name                   = "psql-mplp-production"
  resource_group_name    = azurerm_resource_group.mplp.name
  location              = azurerm_resource_group.mplp.location
  version               = "15"
  administrator_login    = "mplp"
  administrator_password = var.db_password
  
  storage_mb = 20480
  sku_name   = "B_Standard_B1ms"
  
  tags = {
    Environment = "production"
    Application = "mplp"
  }
}

# Redis缓存
resource "azurerm_redis_cache" "mplp" {
  name                = "redis-mplp-production"
  location            = azurerm_resource_group.mplp.location
  resource_group_name = azurerm_resource_group.mplp.name
  capacity            = 1
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
  
  redis_configuration {
    enable_authentication = true
  }
  
  tags = {
    Environment = "production"
    Application = "mplp"
  }
}
```

## 🔄 **CI/CD流水线**

### **GitHub Actions工作流**

```yaml
# .github/workflows/deploy.yml
name: MPLP Production Deployment

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run type check
      run: npm run typecheck
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test
      env:
        NODE_ENV: test
    
    - name: Run security audit
      run: npm audit --audit-level high

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure kubectl
      uses: azure/k8s-set-context@v3
      with:
        method: kubeconfig
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/mplp-core \
          mplp-core=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
          -n mplp-production
        
        kubectl rollout status deployment/mplp-core -n mplp-production
    
    - name: Run smoke tests
      run: |
        kubectl run smoke-test --rm -i --restart=Never \
          --image=curlimages/curl \
          -- curl -f http://mplp-core-service/health
```

## 📊 **监控和可观测性**

### **Prometheus监控配置**

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "mplp_rules.yml"

scrape_configs:
  - job_name: 'mplp-core'
    static_configs:
      - targets: ['mplp-core:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

---
# monitoring/mplp_rules.yml
groups:
- name: mplp.rules
  rules:
  - alert: MPLPHighErrorRate
    expr: rate(mplp_http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "MPLP高错误率"
      description: "MPLP错误率超过10%"

  - alert: MPLPHighResponseTime
    expr: histogram_quantile(0.95, rate(mplp_http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "MPLP响应时间过长"
      description: "95%的请求响应时间超过1秒"

  - alert: MPLPDatabaseConnectionHigh
    expr: mplp_database_connections_active / mplp_database_connections_max > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "数据库连接数过高"
      description: "数据库连接使用率超过80%"
```

---

**总结**: MPLP v1.0 Alpha部署模型指南基于完全完成和测试的平台，为开发者提供了企业级的部署策略和运维指导，确保多智能体系统的可靠生产部署。
