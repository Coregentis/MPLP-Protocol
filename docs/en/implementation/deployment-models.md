# MPLP Deployment Models Guide

> **🌐 Language Navigation**: [English](deployment-models.md) | [中文](../../zh-CN/implementation/deployment-models.md)



**Multi-Agent Protocol Lifecycle Platform - Deployment Models Guide v1.0.0-alpha**

[![Deployment](https://img.shields.io/badge/deployment-Enterprise%20Ready-brightgreen.svg)](./README.md)
[![Container](https://img.shields.io/badge/container-Production%20Validated-brightgreen.svg)](./server-implementation.md)
[![Infrastructure](https://img.shields.io/badge/infrastructure-100%25%20Complete-brightgreen.svg)](./performance-requirements.md)
[![Quality](https://img.shields.io/badge/tests-2869%2F2869%20Pass-brightgreen.svg)](./security-requirements.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../zh-CN/implementation/deployment-models.md)

---

## 🎯 Deployment Models Overview

This guide provides comprehensive deployment strategies, infrastructure patterns, and operational guidelines for MPLP based on the **fully completed and tested** MPLP v1.0 Alpha. With all 10 enterprise-grade modules complete and production-ready, this guide covers validated deployment patterns for multi-agent systems at scale.

### **Enterprise Deployment Scope**
- **Container Orchestration**: Production-tested Docker, Kubernetes, Helm deployments with all 10 modules
- **Cloud Platforms**: Validated AWS, Azure, GCP deployments with enterprise monitoring
- **Infrastructure as Code**: Complete Terraform, CloudFormation, ARM templates for MPLP stack
- **CI/CD Pipelines**: Automated deployment with 2,869 test validation pipeline
- **Enterprise Monitoring**: Complete observability with Trace module and Core orchestration
- **High Availability**: Disaster recovery with Network module distributed capabilities

### **Validated Deployment Models**
- **Development**: Complete local development environment with all 10 modules
- **Staging**: Pre-production validation with full enterprise feature testing
- **Production**: High-availability production deployments with 99.9% uptime capability
- **Distributed**: Multi-node deployments with Network module coordination

---

## 🐳 Container Deployment

### **Docker Configuration**

#### **Multi-Stage Dockerfile**
```dockerfile
# Multi-stage Dockerfile for MPLP application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S mplp && \
    adduser -S mplp -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=mplp:mplp /app/dist ./dist
COPY --from=builder --chown=mplp:mplp /app/node_modules ./node_modules
COPY --from=builder --chown=mplp:mplp /app/package.json ./

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Switch to non-root user
USER mplp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node dist/health-check.js

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

#### **Docker Compose for Development**
```yaml
# docker-compose.yml for local development
version: '3.8'

services:
  mplp-app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - LOG_LEVEL=debug
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
    depends_on:
      - postgres
      - redis
    networks:
      - mplp-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mplp_dev
      - POSTGRES_USER=mplp
      - POSTGRES_PASSWORD=mplp_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - mplp-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - mplp-network

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - mplp-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - mplp-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  mplp-network:
    driver: bridge
```

### **Kubernetes Deployment**

#### **Helm Chart Structure**
```yaml
# Chart.yaml
apiVersion: v2
name: mplp-platform
description: Multi-Agent Protocol Lifecycle Platform Helm Chart
type: application
version: 1.0.0-alpha
appVersion: "1.0.0-alpha"
keywords:
  - mplp
  - multi-agent
  - protocol
  - platform
home: https://github.com/mplp/mplp-platform
sources:
  - https://github.com/mplp/mplp-platform
maintainers:
  - name: MPLP Team
    email: team@mplp.dev
```

#### **Kubernetes Deployment Manifest**
```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mplp.fullname" . }}
  labels:
    {{- include "mplp.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "mplp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
      labels:
        {{- include "mplp.selectorLabels" . | nindent 8 }}
    spec:
      serviceAccountName: {{ include "mplp.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 3000
              protocol: TCP
            - name: metrics
              containerPort: 9090
              protocol: TCP
          env:
            - name: NODE_ENV
              value: {{ .Values.environment }}
            - name: DB_HOST
              value: {{ .Values.database.host }}
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: {{ include "mplp.fullname" . }}-secrets
                  key: database-password
            - name: REDIS_HOST
              value: {{ .Values.redis.host }}
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: {{ include "mplp.fullname" . }}-secrets
                  key: jwt-secret
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
            - name: logs
              mountPath: /app/logs
      volumes:
        - name: config
          configMap:
            name: {{ include "mplp.fullname" . }}-config
        - name: logs
          emptyDir: {}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

#### **Horizontal Pod Autoscaler**
```yaml
# templates/hpa.yaml
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "mplp.fullname" . }}
  labels:
    {{- include "mplp.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "mplp.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    {{- if .Values.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
    {{- end }}
    {{- if .Values.autoscaling.targetMemoryUtilizationPercentage }}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetMemoryUtilizationPercentage }}
    {{- end }}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Max
{{- end }}
```

---

## ☁️ Cloud Platform Deployments

### **AWS Deployment**

#### **Terraform Infrastructure**
```hcl
# main.tf - AWS infrastructure
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

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr
  
  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true
  
  tags = var.common_tags
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "${var.project_name}-cluster"
  cluster_version = var.kubernetes_version
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  # Managed Node Groups
  eks_managed_node_groups = {
    main = {
      min_size     = var.node_group_min_size
      max_size     = var.node_group_max_size
      desired_size = var.node_group_desired_size
      
      instance_types = var.node_instance_types
      capacity_type  = "ON_DEMAND"
      
      k8s_labels = {
        Environment = var.environment
        Application = var.project_name
      }
      
      tags = var.common_tags
    }
  }
  
  # Cluster access
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true
  cluster_endpoint_public_access_cidrs = var.allowed_cidr_blocks
  
  tags = var.common_tags
}

# RDS Database
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"
  
  engine         = "postgres"
  engine_version = var.postgres_version
  instance_class = var.db_instance_class
  
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = var.database_name
  username = var.database_username
  password = var.database_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.backup_retention_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.project_name}-db-final-snapshot"
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn        = aws_iam_role.rds_monitoring.arn
  
  tags = var.common_tags
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-redis"
  description                = "Redis cluster for ${var.project_name}"
  
  node_type                  = var.redis_node_type
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = var.redis_num_nodes
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = var.redis_auth_token
  
  tags = var.common_tags
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = module.vpc.public_subnets
  
  enable_deletion_protection = var.environment == "production"
  
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }
  
  tags = var.common_tags
}

# Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "mplp-platform"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "MPLP Platform"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
```

### **Azure Deployment**

#### **ARM Template**
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "projectName": {
      "type": "string",
      "defaultValue": "mplp-platform",
      "metadata": {
        "description": "Name of the project"
      }
    },
    "environment": {
      "type": "string",
      "defaultValue": "production",
      "allowedValues": ["development", "staging", "production"],
      "metadata": {
        "description": "Environment name"
      }
    },
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]",
      "metadata": {
        "description": "Location for all resources"
      }
    }
  },
  "variables": {
    "aksClusterName": "[concat(parameters('projectName'), '-aks')]",
    "postgresServerName": "[concat(parameters('projectName'), '-postgres')]",
    "redisName": "[concat(parameters('projectName'), '-redis')]",
    "vnetName": "[concat(parameters('projectName'), '-vnet')]"
  },
  "resources": [
    {
      "type": "Microsoft.Network/virtualNetworks",
      "apiVersion": "2021-02-01",
      "name": "[variables('vnetName')]",
      "location": "[parameters('location')]",
      "properties": {
        "addressSpace": {
          "addressPrefixes": ["10.0.0.0/16"]
        },
        "subnets": [
          {
            "name": "aks-subnet",
            "properties": {
              "addressPrefix": "10.0.1.0/24"
            }
          },
          {
            "name": "database-subnet",
            "properties": {
              "addressPrefix": "10.0.2.0/24",
              "delegations": [
                {
                  "name": "Microsoft.DBforPostgreSQL/flexibleServers",
                  "properties": {
                    "serviceName": "Microsoft.DBforPostgreSQL/flexibleServers"
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      "type": "Microsoft.ContainerService/managedClusters",
      "apiVersion": "2021-05-01",
      "name": "[variables('aksClusterName')]",
      "location": "[parameters('location')]",
      "dependsOn": [
        "[resourceId('Microsoft.Network/virtualNetworks', variables('vnetName'))]"
      ],
      "properties": {
        "dnsPrefix": "[variables('aksClusterName')]",
        "agentPoolProfiles": [
          {
            "name": "nodepool1",
            "count": 3,
            "vmSize": "Standard_D4s_v3",
            "osType": "Linux",
            "mode": "System",
            "vnetSubnetID": "[resourceId('Microsoft.Network/virtualNetworks/subnets', variables('vnetName'), 'aks-subnet')]"
          }
        ],
        "servicePrincipalProfile": {
          "clientId": "msi"
        },
        "networkProfile": {
          "networkPlugin": "azure",
          "serviceCidr": "10.1.0.0/16",
          "dnsServiceIP": "10.1.0.10"
        }
      },
      "identity": {
        "type": "SystemAssigned"
      }
    }
  ]
}
```

---

## 🚀 CI/CD Pipeline

### **GitHub Actions Workflow**

#### **Production Deployment Pipeline**
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

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
      
      - name: Run tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e
      
      - name: Run security audit
        run: npm audit --audit-level high
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image: ${{ steps.image.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
      
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
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Output image
        id: image
        run: |
          echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}" >> $GITHUB_OUTPUT

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Kubernetes
        uses: azure/setup-kubectl@v3
        with:
          version: 'v1.28.0'
      
      - name: Setup Helm
        uses: azure/setup-helm@v3
        with:
          version: '3.12.0'
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region us-east-1 --name mplp-platform-cluster
      
      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install mplp-platform ./helm/mplp-platform \
            --namespace mplp-production \
            --create-namespace \
            --set image.repository=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }} \
            --set image.tag=${{ needs.build.outputs.digest }} \
            --set environment=production \
            --values ./helm/values-production.yaml \
            --wait --timeout=10m
      
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/mplp-platform -n mplp-production
          kubectl get pods -n mplp-production
      
      - name: Run smoke tests
        run: |
          kubectl run smoke-test --image=curlimages/curl:latest --rm -i --restart=Never -- \
            curl -f http://mplp-platform.mplp-production.svc.cluster.local:3000/health
```

---

## 🔗 Related Documentation

- [Implementation Overview](./README.md) - Implementation guide overview
- [Client Implementation](./client-implementation.md) - Frontend implementation
- [Server Implementation](./server-implementation.md) - Backend implementation
- [Multi-Language Support](./multi-language-support.md) - Cross-language implementation
- [Performance Requirements](./performance-requirements.md) - Performance standards
- [Security Requirements](./security-requirements.md) - Security implementation

---

**Deployment Models Guide Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025  
**Status**: Production Ready  

**⚠️ Alpha Notice**: This deployment models guide provides production-ready infrastructure patterns for MPLP v1.0 Alpha across multiple cloud platforms. Additional deployment strategies and advanced orchestration features will be added in Beta release based on operational feedback and platform evolution.
