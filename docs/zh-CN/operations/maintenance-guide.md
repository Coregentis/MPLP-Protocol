# MPLP 维护指南

> **🌐 语言导航**: [English](../../en/operations/maintenance-guide.md) | [中文](maintenance-guide.md)



**多智能体协议生命周期平台 - 生产维护指南 v1.0.0-alpha**

[![维护](https://img.shields.io/badge/maintenance-零停机-brightgreen.svg)](./README.md)
[![正常运行时间](https://img.shields.io/badge/uptime-99.9%25%20目标-brightgreen.svg)](./monitoring-guide.md)
[![可靠性](https://img.shields.io/badge/reliability-企业级-brightgreen.svg)](./scaling-guide.md)
[![质量](https://img.shields.io/badge/tests-2902%2F2902%20通过-brightgreen.svg)](./deployment-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/operations/maintenance-guide.md)

---

## 🎯 维护概述

本指南为MPLP v1.0 Alpha生产环境提供全面的维护程序。基于**完全完成**的平台，具有零技术债务和企业级可靠性，本指南涵盖日常维护、更新、备份程序和维护99.9%正常运行时间的运维最佳实践。

### **维护能力**
- ✅ **零停机更新**: 无服务中断的滚动更新
- ✅ **自动化备份**: 完整的备份和恢复程序
- ✅ **健康监控**: 主动健康检查和维护告警
- ✅ **性能优化**: 持续性能调优
- ✅ **安全维护**: 定期安全更新和补丁

## 🔧 **日常维护**

### **每日维护任务**

```bash
#!/bin/bash
# daily-maintenance.sh

echo "🔍 开始MPLP每日维护..."

# 1. 健康检查
echo "执行健康检查..."
kubectl get pods -n mplp-production -o wide
kubectl get services -n mplp-production
curl -f https://api.mplp.example.com/health

# 2. 资源使用检查
echo "检查资源使用情况..."
kubectl top nodes
kubectl top pods -n mplp-production

# 3. 日志分析
echo "分析错误日志..."
kubectl logs -n mplp-production -l app=mplp-core --since=24h | grep -i error | wc -l

# 4. 数据库健康
echo "检查数据库健康..."
kubectl exec -n mplp-production postgresql-0 -- psql -U mplp -d mplp_production -c "SELECT version();"
kubectl exec -n mplp-production redis-0 -- redis-cli ping

# 5. 备份验证
echo "验证备份状态..."
kubectl get cronjobs -n mplp-production
kubectl get jobs -n mplp-production --sort-by=.metadata.creationTimestamp

# 6. 证书过期检查
echo "检查SSL证书过期..."
echo | openssl s_client -servername api.mplp.example.com -connect api.mplp.example.com:443 2>/dev/null | openssl x509 -noout -dates

# 7. 性能指标
echo "收集性能指标..."
curl -s "http://prometheus:9090/api/v1/query?query=up{job=\"mplp-modules\"}" | jq '.data.result[].value[1]'

echo "✅ 每日维护完成！"
```

### **每周维护任务**

```bash
#!/bin/bash
# weekly-maintenance.sh

echo "🔧 开始MPLP每周维护..."

# 1. 安全更新
echo "检查安全更新..."
kubectl get vulnerabilityreports -A

# 2. 性能分析
echo "分析每周性能趋势..."
# 生成性能报告
curl -G "http://prometheus:9090/api/v1/query_range" \
  --data-urlencode "query=rate(mplp_http_requests_total[5m])" \
  --data-urlencode "start=$(date -d '7 days ago' +%s)" \
  --data-urlencode "end=$(date +%s)" \
  --data-urlencode "step=3600" > weekly_performance.json

# 3. 数据库维护
echo "执行数据库维护..."
kubectl exec -n mplp-production postgresql-0 -- psql -U mplp -d mplp_production -c "VACUUM ANALYZE;"
kubectl exec -n mplp-production postgresql-0 -- psql -U mplp -d mplp_production -c "REINDEX DATABASE mplp_production;"

# 4. 缓存优化
echo "优化Redis缓存..."
kubectl exec -n mplp-production redis-0 -- redis-cli MEMORY USAGE
kubectl exec -n mplp-production redis-0 -- redis-cli INFO memory

# 5. 日志轮转
echo "轮转日志..."
kubectl delete pods -n mplp-production -l app=fluentd

# 6. 备份清理
echo "清理旧备份..."
# 保留最近30天的备份
find /backups -name "mplp-backup-*" -mtime +30 -delete

echo "✅ 每周维护完成！"
```

### **每月维护任务**

```bash
#!/bin/bash
# monthly-maintenance.sh

echo "📅 开始MPLP每月维护..."

# 1. 全面安全审计
echo "执行安全审计..."
kubectl run security-scan --rm -i --restart=Never \
  --image=aquasec/trivy:latest \
  -- image mplp/core:1.0.0-alpha

# 2. 性能基准测试
echo "运行性能基准测试..."
kubectl run benchmark --rm -i --restart=Never \
  --image=mplp/benchmark:1.0.0-alpha \
  -- npm run benchmark

# 3. 灾难恢复测试
echo "测试灾难恢复程序..."
# 创建测试备份
kubectl create job --from=cronjob/mplp-backup mplp-backup-test -n mplp-production

# 4. 容量规划
echo "分析容量趋势..."
# 生成容量报告
curl -G "http://prometheus:9090/api/v1/query_range" \
  --data-urlencode "query=container_memory_usage_bytes{pod=~\"mplp-.*\"}" \
  --data-urlencode "start=$(date -d '30 days ago' +%s)" \
  --data-urlencode "end=$(date +%s)" \
  --data-urlencode "step=86400" > monthly_capacity.json

# 5. 文档更新
echo "检查文档时效性..."
# 验证运维手册是否最新
git log --since="30 days ago" --oneline docs/operations/

echo "✅ 每月维护完成！"
```

## 🔄 **零停机更新**

### **滚动更新策略**

```yaml
# rolling-update.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mplp-core
  namespace: mplp-production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    spec:
      containers:
      - name: mplp-core
        image: mplp/core:1.0.0-alpha
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
```

### **蓝绿部署**

```bash
#!/bin/bash
# blue-green-deployment.sh

NAMESPACE="mplp-production"
NEW_VERSION="1.0.1-alpha"
CURRENT_VERSION="1.0.0-alpha"

echo "🔄 开始蓝绿部署..."

# 1. 部署绿色环境
echo "部署绿色环境..."
helm upgrade mplp-green mplp/mplp \
  --namespace ${NAMESPACE} \
  --set image.tag=${NEW_VERSION} \
  --set nameOverride=mplp-green \
  --wait

# 2. 在绿色环境运行冒烟测试
echo "在绿色环境运行冒烟测试..."
kubectl run smoke-test-green --rm -i --restart=Never \
  --image=mplp/smoke-test:latest \
  -- npm run smoke-test -- --target=mplp-green-service

# 3. 切换流量到绿色
echo "切换流量到绿色..."
kubectl patch service mplp-core-service -p '{"spec":{"selector":{"app":"mplp-green"}}}'

# 4. 监控5分钟
echo "监控绿色环境..."
sleep 300

# 5. 检查健康状态
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://api.mplp.example.com/health)
if [ "$HEALTH_CHECK" = "200" ]; then
  echo "✅ 绿色部署成功，移除蓝色..."
  helm uninstall mplp-blue -n ${NAMESPACE}
else
  echo "❌ 绿色部署失败，回滚到蓝色..."
  kubectl patch service mplp-core-service -p '{"spec":{"selector":{"app":"mplp-core"}}}'
  helm uninstall mplp-green -n ${NAMESPACE}
  exit 1
fi

echo "✅ 蓝绿部署完成！"
```

## 💾 **备份和恢复**

### **自动化备份配置**

```yaml
# backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mplp-backup
  namespace: mplp-production
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mplp/backup:1.0.0-alpha
            env:
            - name: POSTGRES_HOST
              value: "postgresql"
            - name: POSTGRES_DB
              value: "mplp_production"
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: postgresql-credentials
                  key: username
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgresql-credentials
                  key: password
            - name: S3_BUCKET
              value: "mplp-backups"
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: backup-credentials
                  key: access-key-id
            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: backup-credentials
                  key: secret-access-key
            command:
            - /bin/bash
            - -c
            - |
              set -e
              TIMESTAMP=$(date +%Y%m%d_%H%M%S)
              
              # 数据库备份
              echo "创建数据库备份..."
              pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > /tmp/mplp-db-${TIMESTAMP}.sql
              
              # 压缩备份
              gzip /tmp/mplp-db-${TIMESTAMP}.sql
              
              # 上传到S3
              aws s3 cp /tmp/mplp-db-${TIMESTAMP}.sql.gz s3://${S3_BUCKET}/database/
              
              # Redis备份
              echo "创建Redis备份..."
              kubectl exec redis-0 -- redis-cli BGSAVE
              kubectl cp redis-0:/data/dump.rdb /tmp/redis-${TIMESTAMP}.rdb
              gzip /tmp/redis-${TIMESTAMP}.rdb
              aws s3 cp /tmp/redis-${TIMESTAMP}.rdb.gz s3://${S3_BUCKET}/redis/
              
              # 配置备份
              echo "备份配置..."
              kubectl get configmaps -n mplp-production -o yaml > /tmp/configmaps-${TIMESTAMP}.yaml
              kubectl get secrets -n mplp-production -o yaml > /tmp/secrets-${TIMESTAMP}.yaml
              tar -czf /tmp/configs-${TIMESTAMP}.tar.gz /tmp/configmaps-${TIMESTAMP}.yaml /tmp/secrets-${TIMESTAMP}.yaml
              aws s3 cp /tmp/configs-${TIMESTAMP}.tar.gz s3://${S3_BUCKET}/configs/
              
              echo "备份成功完成！"
            volumeMounts:
            - name: backup-storage
              mountPath: /tmp
          volumes:
          - name: backup-storage
            emptyDir: {}
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 7
  failedJobsHistoryLimit: 3
```

### **灾难恢复程序**

```bash
#!/bin/bash
# disaster-recovery.sh

BACKUP_DATE=${1:-$(date +%Y%m%d)}
S3_BUCKET="mplp-backups"
NAMESPACE="mplp-production"

echo "🚨 开始MPLP灾难恢复，备份日期: $BACKUP_DATE"

# 1. 创建恢复命名空间
kubectl create namespace mplp-recovery || true

# 2. 恢复数据库
echo "恢复数据库..."
aws s3 cp s3://${S3_BUCKET}/database/mplp-db-${BACKUP_DATE}_*.sql.gz /tmp/
gunzip /tmp/mplp-db-${BACKUP_DATE}_*.sql.gz

# 部署临时PostgreSQL用于恢复
helm install postgresql-recovery bitnami/postgresql \
  --namespace mplp-recovery \
  --set auth.postgresPassword=recovery-password \
  --wait

# 恢复数据
kubectl exec -n mplp-recovery postgresql-recovery-0 -- psql -U postgres -c "CREATE DATABASE mplp_production;"
kubectl cp /tmp/mplp-db-${BACKUP_DATE}_*.sql postgresql-recovery-0:/tmp/restore.sql -n mplp-recovery
kubectl exec -n mplp-recovery postgresql-recovery-0 -- psql -U postgres -d mplp_production -f /tmp/restore.sql

# 3. 恢复Redis
echo "恢复Redis..."
aws s3 cp s3://${S3_BUCKET}/redis/redis-${BACKUP_DATE}_*.rdb.gz /tmp/
gunzip /tmp/redis-${BACKUP_DATE}_*.rdb.gz

helm install redis-recovery bitnami/redis \
  --namespace mplp-recovery \
  --set auth.password=recovery-password \
  --wait

kubectl cp /tmp/redis-${BACKUP_DATE}_*.rdb redis-recovery-master-0:/data/dump.rdb -n mplp-recovery
kubectl exec -n mplp-recovery redis-recovery-master-0 -- redis-cli DEBUG RELOAD

# 4. 恢复配置
echo "恢复配置..."
aws s3 cp s3://${S3_BUCKET}/configs/configs-${BACKUP_DATE}_*.tar.gz /tmp/
tar -xzf /tmp/configs-${BACKUP_DATE}_*.tar.gz -C /tmp/
kubectl apply -f /tmp/configmaps-${BACKUP_DATE}.yaml -n mplp-recovery
kubectl apply -f /tmp/secrets-${BACKUP_DATE}.yaml -n mplp-recovery

# 5. 使用恢复的数据部署MPLP
echo "使用恢复的数据部署MPLP..."
helm install mplp-recovery mplp/mplp \
  --namespace mplp-recovery \
  --set postgresql.enabled=false \
  --set redis.enabled=false \
  --set externalDatabase.host=postgresql-recovery \
  --set externalRedis.host=redis-recovery-master \
  --wait

# 6. 验证恢复
echo "验证恢复..."
kubectl port-forward -n mplp-recovery service/mplp-recovery-service 8080:80 &
sleep 10
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
kill %1

if [ "$HEALTH_CHECK" = "200" ]; then
  echo "✅ 灾难恢复成功完成！"
  echo "恢复环境可在命名空间中使用: mplp-recovery"
else
  echo "❌ 灾难恢复失败！"
  exit 1
fi
```

## 🔍 **健康监控**

### **全面健康检查**

```bash
#!/bin/bash
# health-check.sh

echo "🏥 执行全面MPLP健康检查..."

# 1. Kubernetes资源
echo "检查Kubernetes资源..."
kubectl get pods -n mplp-production --no-headers | awk '{print $1, $3}' | while read pod status; do
  if [ "$status" != "Running" ]; then
    echo "⚠️  Pod $pod 未运行: $status"
  fi
done

# 2. 应用健康端点
echo "检查应用健康端点..."
for module in context plan role confirm trace extension dialog collab core network; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.mplp.example.com/api/v1/$module/health")
  if [ "$response" != "200" ]; then
    echo "⚠️  模块 $module 健康检查失败: HTTP $response"
  else
    echo "✅ 模块 $module 健康"
  fi
done

# 3. 数据库连接
echo "检查数据库连接..."
kubectl exec -n mplp-production postgresql-0 -- pg_isready -U mplp -d mplp_production
if [ $? -eq 0 ]; then
  echo "✅ 数据库可访问"
else
  echo "❌ 数据库连接失败"
fi

# 4. 缓存连接
echo "检查Redis连接..."
kubectl exec -n mplp-production redis-0 -- redis-cli ping
if [ $? -eq 0 ]; then
  echo "✅ Redis可访问"
else
  echo "❌ Redis连接失败"
fi

# 5. 性能指标
echo "检查性能指标..."
response_time=$(curl -s "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,%20rate(mplp_http_request_duration_seconds_bucket[5m]))" | jq -r '.data.result[0].value[1]')
if (( $(echo "$response_time > 1" | bc -l) )); then
  echo "⚠️  响应时间过高: ${response_time}秒"
else
  echo "✅ 响应时间可接受: ${response_time}秒"
fi

# 6. 错误率
echo "检查错误率..."
error_rate=$(curl -s "http://prometheus:9090/api/v1/query?query=rate(mplp_http_requests_total{status=~\"5..\"}[5m])" | jq -r '.data.result[0].value[1]')
if (( $(echo "$error_rate > 0.01" | bc -l) )); then
  echo "⚠️  错误率过高: ${error_rate}"
else
  echo "✅ 错误率可接受: ${error_rate}"
fi

echo "🏥 健康检查完成！"
```

---

**总结**: 本维护指南为MPLP v1.0 Alpha在生产环境中的维护提供全面程序，通过主动维护、零停机更新和强大的备份恢复程序确保99.9%正常运行时间。
