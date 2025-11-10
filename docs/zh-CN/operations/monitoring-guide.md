# MPLP 监控指南

> **🌐 语言导航**: [English](../../en/operations/monitoring-guide.md) | [中文](monitoring-guide.md)



**多智能体协议生命周期平台 - 生产监控指南 v1.0.0-alpha**

[![监控](https://img.shields.io/badge/monitoring-企业级就绪-brightgreen.svg)](./README.md)
[![可观测性](https://img.shields.io/badge/observability-完整-brightgreen.svg)](./deployment-guide.md)
[![告警](https://img.shields.io/badge/alerting-24%2F7-brightgreen.svg)](./maintenance-guide.md)
[![性能](https://img.shields.io/badge/performance-100%25%20得分-brightgreen.svg)](./scaling-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/operations/monitoring-guide.md)

---

## 🎯 监控概述

本指南为MPLP v1.0 Alpha生产环境提供全面的监控和可观测性解决方案。基于**完全完成**的平台，集成Trace模块和企业级监控能力，本指南涵盖所有10个MPLP模块的指标收集、告警、仪表板和运维洞察。

### **监控能力**
- ✅ **集成Trace模块**: 内置监控和审计能力
- ✅ **实时指标**: 100%性能得分监控
- ✅ **完整可观测性**: 所有10个模块的全面指标
- ✅ **企业级告警**: 主动告警和事件响应
- ✅ **安全监控**: RBAC和安全事件跟踪

## 📊 **MPLP监控技术栈**

### **监控架构**

```
┌─────────────────────────────────────────────────────────────┐
│                MPLP监控架构                                 │
├─────────────────────────────────────────────────────────────┤
│  可视化层                                                   │
│  ├── Grafana仪表板 (业务和技术指标)                         │
│  ├── MPLP管理控制台 (模块特定视图)                          │
│  ├── 自定义仪表板 (每模块分析)                              │
│  └── 移动仪表板 (值班监控)                                  │
├─────────────────────────────────────────────────────────────┤
│  告警和通知层                                               │
│  ├── AlertManager (Prometheus告警)                         │
│  ├── PagerDuty集成 (事件管理)                               │
│  ├── Slack/Teams通知 (团队告警)                             │
│  └── 邮件/短信告警 (关键事件)                               │
├─────────────────────────────────────────────────────────────┤
│  指标收集层                                                 │
│  ├── Prometheus (指标存储和查询)                            │
│  ├── MPLP Trace模块 (内置监控)                             │
│  ├── Node Exporter (基础设施指标)                          │
│  ├── Postgres Exporter (数据库指标)                        │
│  ├── Redis Exporter (缓存指标)                             │
│  └── 自定义Exporter (MPLP特定指标)                         │
├─────────────────────────────────────────────────────────────┤
│  日志和链路追踪层                                           │
│  ├── ELK堆栈 (Elasticsearch, Logstash, Kibana)             │
│  ├── Fluentd/Fluent Bit (日志收集)                         │
│  ├── Jaeger (分布式链路追踪)                                │
│  └── MPLP审计日志 (安全和合规)                              │
├─────────────────────────────────────────────────────────────┤
│  MPLP应用层 (所有10个模块)                                  │
│  ├── Context模块指标                                        │
│  ├── Plan模块指标                                           │
│  ├── Role模块指标 (安全事件)                                │
│  ├── Confirm模块指标                                        │
│  ├── Trace模块 (自监控)                                     │
│  ├── Extension模块指标                                      │
│  ├── Dialog模块指标                                         │
│  ├── Collab模块指标                                         │
│  ├── Core模块指标 (编排)                                    │
│  └── Network模块指标 (分布式通信)                           │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **监控设置**

### **1. 安装监控技术栈**

```bash
# 安装Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values prometheus-values.yaml

# 安装MPLP监控组件
helm install mplp-monitoring mplp/monitoring \
  --namespace mplp-production \
  --values mplp-monitoring-values.yaml
```

### **2. Prometheus配置**

```yaml
# prometheus-values.yaml
prometheus:
  prometheusSpec:
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: fast-ssd
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 100Gi
    
    # MPLP特定抓取配置
    additionalScrapeConfigs:
      - job_name: 'mplp-modules'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names:
                - mplp-production
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)

grafana:
  adminPassword: "secure-grafana-password"
  persistence:
    enabled: true
    size: 10Gi
  
  # MPLP仪表板
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'mplp-dashboards'
        orgId: 1
        folder: 'MPLP'
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards/mplp

alertmanager:
  config:
    global:
      smtp_smarthost: 'smtp.example.com:587'
      smtp_from: 'alerts@mplp.example.com'
    
    route:
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
      receiver: 'web.hook'
      routes:
      - match:
          severity: critical
        receiver: 'pagerduty'
      - match:
          severity: warning
        receiver: 'slack'
    
    receivers:
    - name: 'web.hook'
      webhook_configs:
      - url: 'http://mplp-alerting-service/webhook'
    
    - name: 'pagerduty'
      pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
        description: 'MPLP关键告警: {{ .GroupLabels.alertname }}'
    
    - name: 'slack'
      slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#mplp-alerts'
        title: 'MPLP告警: {{ .GroupLabels.alertname }}'
```

### **3. MPLP模块指标**

```yaml
# mplp-monitoring-values.yaml
monitoring:
  enabled: true
  
  # 模块特定监控
  modules:
    context:
      metrics:
        - context_creation_total
        - context_active_count
        - context_operation_duration
        - context_error_rate
    
    plan:
      metrics:
        - plan_creation_total
        - plan_execution_duration
        - plan_success_rate
        - plan_task_count
    
    role:
      metrics:
        - auth_attempts_total
        - auth_success_rate
        - permission_checks_total
        - rbac_violations_total
    
    trace:
      metrics:
        - trace_events_total
        - trace_storage_usage
        - audit_log_entries
        - monitoring_latency
    
    network:
      metrics:
        - network_connections_active
        - network_message_throughput
        - network_latency_p95
        - network_error_rate

  # 自定义仪表板
  dashboards:
    - name: mplp-overview
      title: "MPLP系统概览"
      panels:
        - title: "系统健康"
          type: stat
          targets:
            - expr: up{job="mplp-modules"}
        - title: "请求速率"
          type: graph
          targets:
            - expr: rate(http_requests_total[5m])
    
    - name: mplp-performance
      title: "MPLP性能指标"
      panels:
        - title: "响应时间P95"
          type: graph
          targets:
            - expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
        - title: "错误率"
          type: graph
          targets:
            - expr: rate(http_requests_total{status=~"5.."}[5m])
```

## 📈 **关键指标和KPI**

### **系统级指标**

```promql
# 系统健康
up{job="mplp-modules"}

# 整体请求速率
rate(mplp_http_requests_total[5m])

# 响应时间百分位数
histogram_quantile(0.95, rate(mplp_http_request_duration_seconds_bucket[5m]))
histogram_quantile(0.99, rate(mplp_http_request_duration_seconds_bucket[5m]))

# 错误率
rate(mplp_http_requests_total{status=~"5.."}[5m]) / rate(mplp_http_requests_total[5m])

# 资源利用率
rate(container_cpu_usage_seconds_total{pod=~"mplp-.*"}[5m])
container_memory_usage_bytes{pod=~"mplp-.*"} / container_spec_memory_limit_bytes{pod=~"mplp-.*"}
```

### **模块特定指标**

```promql
# Context模块
mplp_context_active_total
rate(mplp_context_operations_total[5m])
mplp_context_operation_duration_seconds

# Plan模块
mplp_plan_executions_total
mplp_plan_success_rate
mplp_plan_task_completion_time

# Role模块 (安全)
rate(mplp_auth_attempts_total[5m])
mplp_auth_success_rate
rate(mplp_rbac_violations_total[5m])

# Trace模块 (自监控)
mplp_trace_events_per_second
mplp_audit_log_size_bytes
mplp_monitoring_collection_latency

# Network模块
mplp_network_connections_active
mplp_network_message_throughput
mplp_network_latency_seconds
```

### **业务指标**

```promql
# 多智能体协调
mplp_agent_collaborations_total
mplp_coordination_success_rate
mplp_agent_response_time

# 工作流效率
mplp_workflow_completion_rate
mplp_approval_processing_time
mplp_task_automation_ratio

# 系统利用率
mplp_concurrent_users
mplp_api_usage_by_module
mplp_feature_adoption_rate
```

## 🚨 **告警规则**

### **关键告警**

```yaml
# mplp-alerts.yaml
groups:
- name: mplp.critical
  rules:
  - alert: MPLP服务宕机
    expr: up{job="mplp-modules"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "MPLP服务 {{ $labels.instance }} 已宕机"
      description: "MPLP服务已宕机超过1分钟"

  - alert: MPLP高错误率
    expr: rate(mplp_http_requests_total{status=~"5.."}[5m]) / rate(mplp_http_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "MPLP高错误率"
      description: "错误率为 {{ $value | humanizePercentage }}"

  - alert: MPLP高延迟
    expr: histogram_quantile(0.95, rate(mplp_http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "MPLP高延迟"
      description: "95百分位延迟为 {{ $value }}秒"

- name: mplp.warning
  rules:
  - alert: MPLP高内存使用
    expr: container_memory_usage_bytes{pod=~"mplp-.*"} / container_spec_memory_limit_bytes{pod=~"mplp-.*"} > 0.8
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "{{ $labels.pod }} 高内存使用"
      description: "内存使用率为 {{ $value | humanizePercentage }}"

  - alert: MPLP数据库连接
    expr: mplp_database_connections_active / mplp_database_connections_max > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "数据库连接使用率过高"
      description: "数据库连接使用率为 {{ $value | humanizePercentage }}"
```

### **安全告警**

```yaml
- name: mplp.security
  rules:
  - alert: MPLP认证失败
    expr: rate(mplp_auth_failures_total[5m]) > 10
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "认证失败率过高"
      description: "每秒 {{ $value }} 次认证失败"

  - alert: MPLP_RBAC违规
    expr: rate(mplp_rbac_violations_total[5m]) > 1
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "检测到RBAC违规"
      description: "每秒 {{ $value }} 次RBAC违规"

  - alert: MPLP未授权访问
    expr: rate(mplp_http_requests_total{status="403"}[5m]) > 5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "未授权访问尝试率过高"
      description: "每秒 {{ $value }} 次未授权请求"
```

## 📊 **Grafana仪表板**

### **MPLP系统概览仪表板**

```json
{
  "dashboard": {
    "title": "MPLP系统概览",
    "panels": [
      {
        "title": "系统健康",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"mplp-modules\"}",
            "legendFormat": "{{ instance }}"
          }
        ]
      },
      {
        "title": "请求速率",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(mplp_http_requests_total[5m])",
            "legendFormat": "{{ method }} {{ handler }}"
          }
        ]
      },
      {
        "title": "响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(mplp_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95百分位"
          },
          {
            "expr": "histogram_quantile(0.50, rate(mplp_http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50百分位"
          }
        ]
      },
      {
        "title": "错误率",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(mplp_http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx错误"
          }
        ]
      }
    ]
  }
}
```

### **模块特定仪表板**

```bash
# 生成模块仪表板
for module in context plan role confirm trace extension dialog collab core network; do
  cat > "mplp-${module}-dashboard.json" << EOF
{
  "dashboard": {
    "title": "MPLP ${module^} 模块",
    "panels": [
      {
        "title": "${module^} 操作",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(mplp_${module}_operations_total[5m])",
            "legendFormat": "{{ operation }}"
          }
        ]
      },
      {
        "title": "${module^} 响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "mplp_${module}_operation_duration_seconds",
            "legendFormat": "{{ operation }}"
          }
        ]
      }
    ]
  }
}
EOF
done
```

---

**总结**: 本监控指南为MPLP v1.0 Alpha提供全面的可观测性解决方案，利用内置的Trace模块和企业级监控技术栈为生产环境提供支持。
