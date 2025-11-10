# MPLP Operations Guide

> **🌐 Language Navigation**: [English](README.md) | [中文](../../zh-CN/operations/README.md)



**Multi-Agent Protocol Lifecycle Platform - Comprehensive Operations and Deployment Guide v1.0.0-alpha**

[![Operations](https://img.shields.io/badge/operations-100%25%20Complete-brightgreen.svg)](./deployment-guide.md)
[![Monitoring](https://img.shields.io/badge/monitoring-Enterprise%20Ready-brightgreen.svg)](./monitoring-guide.md)
[![Scalability](https://img.shields.io/badge/scalability-Production%20Validated-brightgreen.svg)](./scaling-guide.md)
[![Quality](https://img.shields.io/badge/tests-2902%2F2902%20Pass-brightgreen.svg)](./maintenance-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/operations/README.md)

---

## 🎯 Overview

This comprehensive operations guide provides everything needed to successfully deploy, monitor, and maintain MPLP v1.0 Alpha systems in production environments. Based on the **fully completed** platform with all 10 enterprise-grade modules, 2,902/2,902 tests passing, and 100% performance score, this guide covers proven deployment strategies, monitoring solutions, and operational best practices for production-ready multi-agent systems.

### **Enterprise Operations Scope**
- **Production Deployment**: Validated deployment strategies for all 10 MPLP modules
- **Enterprise Monitoring**: Complete observability with Trace module integration
- **Auto-Scaling**: Proven horizontal and vertical scaling with Network module coordination
- **Security Operations**: Enterprise RBAC and security monitoring with Role module
- **Maintenance Procedures**: Zero-downtime maintenance for 99.9% uptime
- **Disaster Recovery**: High-availability backup and recovery with distributed capabilities

### **Target Audience**
- **DevOps Engineers**: Deploying and managing enterprise MPLP infrastructure
- **Site Reliability Engineers**: Ensuring 99.9% uptime and performance optimization
- **System Administrators**: Managing production MPLP systems and operations
- **Security Engineers**: Implementing enterprise security and compliance measures
- **Platform Engineers**: Building and maintaining scalable MPLP platforms

---

## 🏗️ Production Architecture

### **MPLP Production Stack**

```
┌─────────────────────────────────────────────────────────────┐
│                MPLP Production Architecture                 │
├─────────────────────────────────────────────────────────────┤
│  Load Balancer Layer                                       │
│  ├── Global Load Balancer (AWS ALB, Cloudflare)            │
│  ├── Regional Load Balancers (NGINX, HAProxy)              │
│  ├── SSL Termination (Let's Encrypt, AWS ACM)              │
│  └── DDoS Protection (Cloudflare, AWS Shield)              │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                         │
│  ├── MPLP Core Services (Kubernetes Pods)                  │
│  ├── API Gateway (Kong, Ambassador, Istio)                 │
│  ├── Service Mesh (Istio, Linkerd, Consul Connect)         │
│  └── Auto-scaling (HPA, VPA, Cluster Autoscaler)          │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                               │
│  ├── Primary Database (PostgreSQL Cluster)                 │
│  ├── Cache Layer (Redis Cluster)                           │
│  ├── Message Queue (Apache Kafka, RabbitMQ)               │
│  └── Object Storage (AWS S3, MinIO)                        │
├─────────────────────────────────────────────────────────────┤
│  Monitoring Layer                                         │
│  ├── Metrics (Prometheus, Grafana)                         │
│  ├── Logging (ELK Stack, Fluentd)                          │
│  ├── Tracing (Jaeger, Zipkin)                              │
│  └── Alerting (AlertManager, PagerDuty)                    │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                      │
│  ├── Container Runtime (Docker, containerd)                │
│  ├── Orchestration (Kubernetes, Docker Swarm)             │
│  ├── Service Discovery (Consul, etcd)                      │
│  └── Secret Management (Vault, Kubernetes Secrets)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Strategies

### **1. Kubernetes Deployment**

#### **MPLP Kubernetes Manifests**
```yaml
# mplp-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mplp-production
  labels:
    name: mplp-production
    environment: production

---
# mplp-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mplp-config
  namespace: mplp-production
data:
  mplp.yaml: |
    project:
      name: "mplp-production"
      version: "1.0.0-alpha"
    
    modules:
      context:
        enabled: true
        config:
          persistence: "postgresql"
          caching: "redis"
          maxContexts: 10000
      plan:
        enabled: true
        config:
          scheduler: "advanced"
          maxConcurrentPlans: 1000
      role:
        enabled: true
        config:
          rbacEnabled: true
          permissionCaching: true
    
    database:
      host: "postgresql-cluster.mplp-production.svc.cluster.local"
      port: 5432
      database: "mplp_production"
      ssl: true
      poolSize: 20
    
    cache:
      host: "redis-cluster.mplp-production.svc.cluster.local"
      port: 6379
      cluster: true
      maxConnections: 100
    
    monitoring:
      enabled: true
      metricsPort: 9090
      healthCheckPort: 8080

---
# mplp-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mplp-core
  namespace: mplp-production
  labels:
    app: mplp-core
    version: 1.0.0-alpha
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: mplp-core
  template:
    metadata:
      labels:
        app: mplp-core
        version: 1.0.0-alpha
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: mplp-service-account
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: mplp-core
        image: mplp/core:1.0.0-alpha
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
          protocol: TCP
        - containerPort: 9090
          name: metrics
          protocol: TCP
        - containerPort: 8080
          name: health
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: MPLP_CONFIG_PATH
          value: "/etc/mplp/mplp.yaml"
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mplp-secrets
              key: database-password
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mplp-secrets
              key: redis-password
        volumeMounts:
        - name: config-volume
          mountPath: /etc/mplp
          readOnly: true
        - name: logs-volume
          mountPath: /var/log/mplp
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
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
      volumes:
      - name: config-volume
        configMap:
          name: mplp-config
      - name: logs-volume
        emptyDir: {}
      nodeSelector:
        kubernetes.io/os: linux
      tolerations:
      - key: "node.kubernetes.io/not-ready"
        operator: "Exists"
        effect: "NoExecute"
        tolerationSeconds: 300
      - key: "node.kubernetes.io/unreachable"
        operator: "Exists"
        effect: "NoExecute"
        tolerationSeconds: 300

---
# mplp-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: mplp-core-service
  namespace: mplp-production
  labels:
    app: mplp-core
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  - port: 9090
    targetPort: 9090
    protocol: TCP
    name: metrics
  selector:
    app: mplp-core

---
# mplp-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mplp-core-hpa
  namespace: mplp-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mplp-core
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
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
```

#### **Database Setup**
```yaml
# postgresql-cluster.yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgresql-cluster
  namespace: mplp-production
spec:
  instances: 3
  
  postgresql:
    parameters:
      max_connections: "200"
      shared_buffers: "256MB"
      effective_cache_size: "1GB"
      maintenance_work_mem: "64MB"
      checkpoint_completion_target: "0.9"
      wal_buffers: "16MB"
      default_statistics_target: "100"
      random_page_cost: "1.1"
      effective_io_concurrency: "200"
      work_mem: "4MB"
      min_wal_size: "1GB"
      max_wal_size: "4GB"
  
  bootstrap:
    initdb:
      database: mplp_production
      owner: mplp_user
      secret:
        name: postgresql-credentials
  
  storage:
    size: 100Gi
    storageClass: fast-ssd
  
  monitoring:
    enabled: true
    
  backup:
    retentionPolicy: "30d"
    barmanObjectStore:
      destinationPath: "s3://mplp-backups/postgresql"
      s3Credentials:
        accessKeyId:
          name: backup-credentials
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: backup-credentials
          key: SECRET_ACCESS_KEY
      wal:
        retention: "7d"
      data:
        retention: "30d"

---
# redis-cluster.yaml
apiVersion: redis.redis.opstreelabs.in/v1beta1
kind: RedisCluster
metadata:
  name: redis-cluster
  namespace: mplp-production
spec:
  clusterSize: 6
  clusterVersion: v7
  persistenceEnabled: true
  redisExporter:
    enabled: true
    image: oliver006/redis_exporter:latest
  redisConfig:
    additionalRedisConfig: |
      maxmemory-policy allkeys-lru
      timeout 300
      tcp-keepalive 60
  storage:
    volumeClaimTemplate:
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
        storageClassName: fast-ssd
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "1000m"
```

### **2. Docker Compose Deployment**

#### **Production Docker Compose**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # MPLP Core Services
  mplp-core:
    image: mplp/core:1.0.0-alpha
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.25'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://mplp_user:${DB_PASSWORD}@postgres:5432/mplp_production
      - REDIS_URL=redis://redis-cluster:6379
      - LOG_LEVEL=info
    volumes:
      - ./config/mplp.yaml:/etc/mplp/mplp.yaml:ro
      - mplp-logs:/var/log/mplp
    networks:
      - mplp-network
    depends_on:
      - postgres
      - redis-cluster
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx-logs:/var/log/nginx
    networks:
      - mplp-network
    depends_on:
      - mplp-core
    deploy:
      restart_policy:
        condition: on-failure

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mplp_production
      - POSTGRES_USER=mplp_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
    networks:
      - mplp-network
    deploy:
      restart_policy:
        condition: on-failure
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mplp_user -d mplp_production"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cluster
  redis-cluster:
    image: redis:7-alpine
    command: redis-server --appendonly yes --cluster-enabled yes
    volumes:
      - redis-data:/data
    networks:
      - mplp-network
    deploy:
      restart_policy:
        condition: on-failure
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    networks:
      - mplp-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    networks:
      - mplp-network
    depends_on:
      - prometheus

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local
  mplp-logs:
    driver: local
  nginx-logs:
    driver: local

networks:
  mplp-network:
    driver: overlay
    attachable: true
```

---

## 📊 Monitoring and Observability

### **1. Prometheus Configuration**

#### **Prometheus Metrics Collection**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "mplp_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # MPLP Core Services
  - job_name: 'mplp-core'
    static_configs:
      - targets: ['mplp-core:9090']
    metrics_path: /metrics
    scrape_interval: 10s
    scrape_timeout: 5s

  # PostgreSQL
  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Kubernetes Metrics (if using Kubernetes)
  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
    - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
    - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
      action: keep
      regex: default;kubernetes;https

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
    - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
    relabel_configs:
    - action: labelmap
      regex: __meta_kubernetes_node_label_(.+)

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
      action: replace
      target_label: __metrics_path__
      regex: (.+)
    - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
      action: replace
      regex: ([^:]+)(?::\d+)?;(\d+)
      replacement: $1:$2
      target_label: __address__
    - action: labelmap
      regex: __meta_kubernetes_pod_label_(.+)
    - source_labels: [__meta_kubernetes_namespace]
      action: replace
      target_label: kubernetes_namespace
    - source_labels: [__meta_kubernetes_pod_name]
      action: replace
      target_label: kubernetes_pod_name
```

#### **MPLP Alert Rules**
```yaml
# monitoring/mplp_rules.yml
groups:
- name: mplp.rules
  rules:
  # High Error Rate
  - alert: MPLPHighErrorRate
    expr: rate(mplp_http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "MPLP high error rate detected"
      description: "MPLP error rate is {{ $value }} errors per second"

  # High Response Time
  - alert: MPLPHighResponseTime
    expr: histogram_quantile(0.95, rate(mplp_http_request_duration_seconds_bucket[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "MPLP high response time"
      description: "95th percentile response time is {{ $value }}s"

  # Context Creation Failures
  - alert: MPLPContextCreationFailures
    expr: rate(mplp_context_creation_failures_total[5m]) > 0.05
    for: 3m
    labels:
      severity: warning
    annotations:
      summary: "High context creation failure rate"
      description: "Context creation failure rate is {{ $value }} per second"

  # Plan Execution Failures
  - alert: MPLPPlanExecutionFailures
    expr: rate(mplp_plan_execution_failures_total[5m]) > 0.02
    for: 3m
    labels:
      severity: critical
    annotations:
      summary: "High plan execution failure rate"
      description: "Plan execution failure rate is {{ $value }} per second"

  # Database Connection Issues
  - alert: MPLPDatabaseConnectionIssues
    expr: mplp_database_connections_active / mplp_database_connections_max > 0.8
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "Database connection pool nearly exhausted"
      description: "Database connection usage is {{ $value | humanizePercentage }}"

  # Memory Usage
  - alert: MPLPHighMemoryUsage
    expr: (process_resident_memory_bytes / 1024 / 1024) > 1500
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "MPLP high memory usage"
      description: "Memory usage is {{ $value }}MB"

  # Service Down
  - alert: MPLPServiceDown
    expr: up{job="mplp-core"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "MPLP service is down"
      description: "MPLP service {{ $labels.instance }} is down"
```

### **2. Grafana Dashboards**

#### **MPLP Overview Dashboard**
```json
{
  "dashboard": {
    "id": null,
    "title": "MPLP Overview",
    "tags": ["mplp", "overview"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(mplp_http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ]
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(mplp_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          },
          {
            "expr": "histogram_quantile(0.95, rate(mplp_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.99, rate(mplp_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "99th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds"
          }
        ]
      },
      {
        "id": 3,
        "title": "Active Contexts",
        "type": "singlestat",
        "targets": [
          {
            "expr": "mplp_contexts_active_total"
          }
        ]
      },
      {
        "id": 4,
        "title": "Running Plans",
        "type": "singlestat",
        "targets": [
          {
            "expr": "mplp_plans_running_total"
          }
        ]
      },
      {
        "id": 5,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(mplp_http_requests_total{status=~\"4..|5..\"}[5m])",
            "legendFormat": "Error Rate"
          }
        ],
        "yAxes": [
          {
            "label": "Errors/sec"
          }
        ]
      },
      {
        "id": 6,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "process_resident_memory_bytes / 1024 / 1024",
            "legendFormat": "Memory (MB)"
          }
        ],
        "yAxes": [
          {
            "label": "MB"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
```

---

## 🔒 Security Hardening

### **1. Production Security Configuration**

#### **Security Best Practices**
```yaml
# security/security-policies.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-config
  namespace: mplp-production
data:
  security.yaml: |
    # Authentication & Authorization
    authentication:
      jwt:
        algorithm: "RS256"
        keyRotationInterval: "24h"
        tokenExpiry: "1h"
        refreshTokenExpiry: "7d"
      
      oauth2:
        enabled: true
        providers:
          - name: "corporate-sso"
            clientId: "${OAUTH_CLIENT_ID}"
            issuer: "https://sso.company.com"
    
    authorization:
      rbac:
        enabled: true
        strictMode: true
        defaultRole: "viewer"
      
      permissions:
        cacheEnabled: true
        cacheTTL: "5m"
    
    # Network Security
    network:
      tls:
        minVersion: "1.2"
        cipherSuites:
          - "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
          - "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
      
      cors:
        enabled: true
        allowedOrigins:
          - "https://app.company.com"
          - "https://admin.company.com"
        allowedMethods: ["GET", "POST", "PUT", "DELETE"]
        allowedHeaders: ["Authorization", "Content-Type"]
      
      rateLimiting:
        enabled: true
        windowMs: 900000  # 15 minutes
        maxRequests: 1000
        skipSuccessfulRequests: false
    
    # Data Protection
    encryption:
      atRest:
        enabled: true
        algorithm: "AES-256-GCM"
        keyRotationInterval: "30d"
      
      inTransit:
        enforceHTTPS: true
        hsts:
          enabled: true
          maxAge: 31536000
          includeSubDomains: true
    
    # Audit & Compliance
    audit:
      enabled: true
      logLevel: "info"
      retentionDays: 90
      sensitiveDataMasking: true
    
    compliance:
      gdpr:
        enabled: true
        dataRetentionDays: 365
        rightToErasure: true
      
      soc2:
        enabled: true
        accessLogging: true
        changeTracking: true

---
# Network Policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: mplp-network-policy
  namespace: mplp-production
spec:
  podSelector:
    matchLabels:
      app: mplp-core
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - podSelector:
        matchLabels:
          app: nginx
    ports:
    - protocol: TCP
      port: 3000
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 9090
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

---

## 🔗 Related Documentation

- [Deployment Guide](./deployment-guide.md) - Detailed deployment instructions
- [Monitoring Guide](./monitoring-guide.md) - Comprehensive monitoring setup
- [Scaling Guide](./scaling-guide.md) - Scaling strategies and techniques
- [Security Guide](./security-guide.md) - Security hardening and compliance
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
- [Backup and Recovery](./backup-recovery.md) - Disaster recovery procedures

---

**Operations Guide Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Production Ready**: Yes  

**⚠️ Alpha Notice**: This operations guide is production-ready and comprehensive in Alpha release. Additional operational patterns and tools will be added based on operational feedback in Beta release.
