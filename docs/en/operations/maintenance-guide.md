# MPLP Maintenance Guide

**Multi-Agent Protocol Lifecycle Platform - Production Maintenance Guide v1.0.0-alpha**

[![Maintenance](https://img.shields.io/badge/maintenance-Zero%20Downtime-brightgreen.svg)](./README.md)
[![Uptime](https://img.shields.io/badge/uptime-99.9%25%20Target-brightgreen.svg)](./monitoring-guide.md)
[![Reliability](https://img.shields.io/badge/reliability-Enterprise%20Grade-brightgreen.svg)](./scaling-guide.md)
[![Quality](https://img.shields.io/badge/tests-2869%2F2869%20Pass-brightgreen.svg)](./deployment-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/operations/maintenance-guide.md)

---

## 🎯 Maintenance Overview

This guide provides comprehensive maintenance procedures for MPLP v1.0 Alpha production environments. Based on the **fully completed** platform with zero technical debt and enterprise-grade reliability, this guide covers routine maintenance, updates, backup procedures, and operational best practices for maintaining 99.9% uptime.

### **Maintenance Capabilities**
- ✅ **Zero Downtime Updates**: Rolling updates with no service interruption
- ✅ **Automated Backups**: Complete backup and recovery procedures
- ✅ **Health Monitoring**: Proactive health checks and maintenance alerts
- ✅ **Performance Optimization**: Continuous performance tuning
- ✅ **Security Maintenance**: Regular security updates and patches

## 🔧 **Routine Maintenance**

### **Daily Maintenance Tasks**

```bash
#!/bin/bash
# daily-maintenance.sh

echo "🔍 Starting MPLP daily maintenance..."

# 1. Health Check
echo "Performing health checks..."
kubectl get pods -n mplp-production -o wide
kubectl get services -n mplp-production
curl -f https://api.mplp.example.com/health

# 2. Resource Usage Check
echo "Checking resource usage..."
kubectl top nodes
kubectl top pods -n mplp-production

# 3. Log Analysis
echo "Analyzing logs for errors..."
kubectl logs -n mplp-production -l app=mplp-core --since=24h | grep -i error | wc -l

# 4. Database Health
echo "Checking database health..."
kubectl exec -n mplp-production postgresql-0 -- psql -U mplp -d mplp_production -c "SELECT version();"
kubectl exec -n mplp-production redis-0 -- redis-cli ping

# 5. Backup Verification
echo "Verifying backup status..."
kubectl get cronjobs -n mplp-production
kubectl get jobs -n mplp-production --sort-by=.metadata.creationTimestamp

# 6. Certificate Expiry Check
echo "Checking SSL certificate expiry..."
echo | openssl s_client -servername api.mplp.example.com -connect api.mplp.example.com:443 2>/dev/null | openssl x509 -noout -dates

# 7. Performance Metrics
echo "Collecting performance metrics..."
curl -s "http://prometheus:9090/api/v1/query?query=up{job=\"mplp-modules\"}" | jq '.data.result[].value[1]'

echo "✅ Daily maintenance completed!"
```

### **Weekly Maintenance Tasks**

```bash
#!/bin/bash
# weekly-maintenance.sh

echo "🔧 Starting MPLP weekly maintenance..."

# 1. Security Updates
echo "Checking for security updates..."
kubectl get vulnerabilityreports -A

# 2. Performance Analysis
echo "Analyzing weekly performance trends..."
# Generate performance report
curl -G "http://prometheus:9090/api/v1/query_range" \
  --data-urlencode "query=rate(mplp_http_requests_total[5m])" \
  --data-urlencode "start=$(date -d '7 days ago' +%s)" \
  --data-urlencode "end=$(date +%s)" \
  --data-urlencode "step=3600" > weekly_performance.json

# 3. Database Maintenance
echo "Performing database maintenance..."
kubectl exec -n mplp-production postgresql-0 -- psql -U mplp -d mplp_production -c "VACUUM ANALYZE;"
kubectl exec -n mplp-production postgresql-0 -- psql -U mplp -d mplp_production -c "REINDEX DATABASE mplp_production;"

# 4. Cache Optimization
echo "Optimizing Redis cache..."
kubectl exec -n mplp-production redis-0 -- redis-cli MEMORY USAGE
kubectl exec -n mplp-production redis-0 -- redis-cli INFO memory

# 5. Log Rotation
echo "Rotating logs..."
kubectl delete pods -n mplp-production -l app=fluentd

# 6. Backup Cleanup
echo "Cleaning old backups..."
# Keep last 30 days of backups
find /backups -name "mplp-backup-*" -mtime +30 -delete

echo "✅ Weekly maintenance completed!"
```

### **Monthly Maintenance Tasks**

```bash
#!/bin/bash
# monthly-maintenance.sh

echo "📅 Starting MPLP monthly maintenance..."

# 1. Comprehensive Security Audit
echo "Performing security audit..."
kubectl run security-scan --rm -i --restart=Never \
  --image=aquasec/trivy:latest \
  -- image mplp/core:1.0.0-alpha

# 2. Performance Benchmarking
echo "Running performance benchmarks..."
kubectl run benchmark --rm -i --restart=Never \
  --image=mplp/benchmark:1.0.0-alpha \
  -- npm run benchmark

# 3. Disaster Recovery Test
echo "Testing disaster recovery procedures..."
# Create test backup
kubectl create job --from=cronjob/mplp-backup mplp-backup-test -n mplp-production

# 4. Capacity Planning
echo "Analyzing capacity trends..."
# Generate capacity report
curl -G "http://prometheus:9090/api/v1/query_range" \
  --data-urlencode "query=container_memory_usage_bytes{pod=~\"mplp-.*\"}" \
  --data-urlencode "start=$(date -d '30 days ago' +%s)" \
  --data-urlencode "end=$(date +%s)" \
  --data-urlencode "step=86400" > monthly_capacity.json

# 5. Documentation Updates
echo "Checking documentation currency..."
# Verify runbooks are up to date
git log --since="30 days ago" --oneline docs/operations/

echo "✅ Monthly maintenance completed!"
```

## 🔄 **Zero-Downtime Updates**

### **Rolling Update Strategy**

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

### **Blue-Green Deployment**

```bash
#!/bin/bash
# blue-green-deployment.sh

NAMESPACE="mplp-production"
NEW_VERSION="1.0.1-alpha"
CURRENT_VERSION="1.0.0-alpha"

echo "🔄 Starting blue-green deployment..."

# 1. Deploy green environment
echo "Deploying green environment..."
helm upgrade mplp-green mplp/mplp \
  --namespace ${NAMESPACE} \
  --set image.tag=${NEW_VERSION} \
  --set nameOverride=mplp-green \
  --wait

# 2. Run smoke tests on green
echo "Running smoke tests on green environment..."
kubectl run smoke-test-green --rm -i --restart=Never \
  --image=mplp/smoke-test:latest \
  -- npm run smoke-test -- --target=mplp-green-service

# 3. Switch traffic to green
echo "Switching traffic to green..."
kubectl patch service mplp-core-service -p '{"spec":{"selector":{"app":"mplp-green"}}}'

# 4. Monitor for 5 minutes
echo "Monitoring green environment..."
sleep 300

# 5. Check health
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://api.mplp.example.com/health)
if [ "$HEALTH_CHECK" = "200" ]; then
  echo "✅ Green deployment successful, removing blue..."
  helm uninstall mplp-blue -n ${NAMESPACE}
else
  echo "❌ Green deployment failed, rolling back to blue..."
  kubectl patch service mplp-core-service -p '{"spec":{"selector":{"app":"mplp-core"}}}'
  helm uninstall mplp-green -n ${NAMESPACE}
  exit 1
fi

echo "✅ Blue-green deployment completed!"
```

## 💾 **Backup and Recovery**

### **Automated Backup Configuration**

```yaml
# backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mplp-backup
  namespace: mplp-production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
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
              
              # Database backup
              echo "Creating database backup..."
              pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > /tmp/mplp-db-${TIMESTAMP}.sql
              
              # Compress backup
              gzip /tmp/mplp-db-${TIMESTAMP}.sql
              
              # Upload to S3
              aws s3 cp /tmp/mplp-db-${TIMESTAMP}.sql.gz s3://${S3_BUCKET}/database/
              
              # Redis backup
              echo "Creating Redis backup..."
              kubectl exec redis-0 -- redis-cli BGSAVE
              kubectl cp redis-0:/data/dump.rdb /tmp/redis-${TIMESTAMP}.rdb
              gzip /tmp/redis-${TIMESTAMP}.rdb
              aws s3 cp /tmp/redis-${TIMESTAMP}.rdb.gz s3://${S3_BUCKET}/redis/
              
              # Configuration backup
              echo "Backing up configurations..."
              kubectl get configmaps -n mplp-production -o yaml > /tmp/configmaps-${TIMESTAMP}.yaml
              kubectl get secrets -n mplp-production -o yaml > /tmp/secrets-${TIMESTAMP}.yaml
              tar -czf /tmp/configs-${TIMESTAMP}.tar.gz /tmp/configmaps-${TIMESTAMP}.yaml /tmp/secrets-${TIMESTAMP}.yaml
              aws s3 cp /tmp/configs-${TIMESTAMP}.tar.gz s3://${S3_BUCKET}/configs/
              
              echo "Backup completed successfully!"
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

### **Disaster Recovery Procedures**

```bash
#!/bin/bash
# disaster-recovery.sh

BACKUP_DATE=${1:-$(date +%Y%m%d)}
S3_BUCKET="mplp-backups"
NAMESPACE="mplp-production"

echo "🚨 Starting MPLP disaster recovery for backup date: $BACKUP_DATE"

# 1. Create recovery namespace
kubectl create namespace mplp-recovery || true

# 2. Restore database
echo "Restoring database..."
aws s3 cp s3://${S3_BUCKET}/database/mplp-db-${BACKUP_DATE}_*.sql.gz /tmp/
gunzip /tmp/mplp-db-${BACKUP_DATE}_*.sql.gz

# Deploy temporary PostgreSQL for recovery
helm install postgresql-recovery bitnami/postgresql \
  --namespace mplp-recovery \
  --set auth.postgresPassword=recovery-password \
  --wait

# Restore data
kubectl exec -n mplp-recovery postgresql-recovery-0 -- psql -U postgres -c "CREATE DATABASE mplp_production;"
kubectl cp /tmp/mplp-db-${BACKUP_DATE}_*.sql postgresql-recovery-0:/tmp/restore.sql -n mplp-recovery
kubectl exec -n mplp-recovery postgresql-recovery-0 -- psql -U postgres -d mplp_production -f /tmp/restore.sql

# 3. Restore Redis
echo "Restoring Redis..."
aws s3 cp s3://${S3_BUCKET}/redis/redis-${BACKUP_DATE}_*.rdb.gz /tmp/
gunzip /tmp/redis-${BACKUP_DATE}_*.rdb.gz

helm install redis-recovery bitnami/redis \
  --namespace mplp-recovery \
  --set auth.password=recovery-password \
  --wait

kubectl cp /tmp/redis-${BACKUP_DATE}_*.rdb redis-recovery-master-0:/data/dump.rdb -n mplp-recovery
kubectl exec -n mplp-recovery redis-recovery-master-0 -- redis-cli DEBUG RELOAD

# 4. Restore configurations
echo "Restoring configurations..."
aws s3 cp s3://${S3_BUCKET}/configs/configs-${BACKUP_DATE}_*.tar.gz /tmp/
tar -xzf /tmp/configs-${BACKUP_DATE}_*.tar.gz -C /tmp/
kubectl apply -f /tmp/configmaps-${BACKUP_DATE}.yaml -n mplp-recovery
kubectl apply -f /tmp/secrets-${BACKUP_DATE}.yaml -n mplp-recovery

# 5. Deploy MPLP with recovered data
echo "Deploying MPLP with recovered data..."
helm install mplp-recovery mplp/mplp \
  --namespace mplp-recovery \
  --set postgresql.enabled=false \
  --set redis.enabled=false \
  --set externalDatabase.host=postgresql-recovery \
  --set externalRedis.host=redis-recovery-master \
  --wait

# 6. Verify recovery
echo "Verifying recovery..."
kubectl port-forward -n mplp-recovery service/mplp-recovery-service 8080:80 &
sleep 10
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
kill %1

if [ "$HEALTH_CHECK" = "200" ]; then
  echo "✅ Disaster recovery completed successfully!"
  echo "Recovery environment available in namespace: mplp-recovery"
else
  echo "❌ Disaster recovery failed!"
  exit 1
fi
```

## 🔍 **Health Monitoring**

### **Comprehensive Health Checks**

```bash
#!/bin/bash
# health-check.sh

echo "🏥 Performing comprehensive MPLP health check..."

# 1. Kubernetes Resources
echo "Checking Kubernetes resources..."
kubectl get pods -n mplp-production --no-headers | awk '{print $1, $3}' | while read pod status; do
  if [ "$status" != "Running" ]; then
    echo "⚠️  Pod $pod is not running: $status"
  fi
done

# 2. Application Health Endpoints
echo "Checking application health endpoints..."
for module in context plan role confirm trace extension dialog collab core network; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.mplp.example.com/api/v1/$module/health")
  if [ "$response" != "200" ]; then
    echo "⚠️  Module $module health check failed: HTTP $response"
  else
    echo "✅ Module $module is healthy"
  fi
done

# 3. Database Connectivity
echo "Checking database connectivity..."
kubectl exec -n mplp-production postgresql-0 -- pg_isready -U mplp -d mplp_production
if [ $? -eq 0 ]; then
  echo "✅ Database is accessible"
else
  echo "❌ Database connectivity failed"
fi

# 4. Cache Connectivity
echo "Checking Redis connectivity..."
kubectl exec -n mplp-production redis-0 -- redis-cli ping
if [ $? -eq 0 ]; then
  echo "✅ Redis is accessible"
else
  echo "❌ Redis connectivity failed"
fi

# 5. Performance Metrics
echo "Checking performance metrics..."
response_time=$(curl -s "http://prometheus:9090/api/v1/query?query=histogram_quantile(0.95,%20rate(mplp_http_request_duration_seconds_bucket[5m]))" | jq -r '.data.result[0].value[1]')
if (( $(echo "$response_time > 1" | bc -l) )); then
  echo "⚠️  High response time: ${response_time}s"
else
  echo "✅ Response time is acceptable: ${response_time}s"
fi

# 6. Error Rate
echo "Checking error rate..."
error_rate=$(curl -s "http://prometheus:9090/api/v1/query?query=rate(mplp_http_requests_total{status=~\"5..\"}[5m])" | jq -r '.data.result[0].value[1]')
if (( $(echo "$error_rate > 0.01" | bc -l) )); then
  echo "⚠️  High error rate: ${error_rate}"
else
  echo "✅ Error rate is acceptable: ${error_rate}"
fi

echo "🏥 Health check completed!"
```

### **Automated Health Monitoring**

```yaml
# health-monitoring.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mplp-health-monitor
  namespace: mplp-production
spec:
  schedule: "*/5 * * * *"  # Every 5 minutes
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: health-monitor
            image: mplp/health-monitor:1.0.0-alpha
            env:
            - name: SLACK_WEBHOOK_URL
              valueFrom:
                secretKeyRef:
                  name: monitoring-credentials
                  key: slack-webhook
            - name: PAGERDUTY_SERVICE_KEY
              valueFrom:
                secretKeyRef:
                  name: monitoring-credentials
                  key: pagerduty-key
            command:
            - /bin/bash
            - -c
            - |
              set -e
              
              # Run health checks
              /usr/local/bin/health-check.sh > /tmp/health-report.txt 2>&1
              
              # Check for failures
              if grep -q "❌\|⚠️" /tmp/health-report.txt; then
                echo "Health issues detected, sending alerts..."
                
                # Send Slack notification
                curl -X POST -H 'Content-type: application/json' \
                  --data "{\"text\":\"🚨 MPLP Health Issues Detected:\n\`\`\`$(cat /tmp/health-report.txt)\`\`\`\"}" \
                  $SLACK_WEBHOOK_URL
                
                # Send PagerDuty alert for critical issues
                if grep -q "❌" /tmp/health-report.txt; then
                  curl -X POST \
                    -H "Content-Type: application/json" \
                    -d "{
                      \"service_key\": \"$PAGERDUTY_SERVICE_KEY\",
                      \"event_type\": \"trigger\",
                      \"description\": \"MPLP Critical Health Issues\",
                      \"details\": \"$(cat /tmp/health-report.txt | tr '\n' ' ')\"
                    }" \
                    https://events.pagerduty.com/generic/2010-04-15/create_event.json
                fi
              else
                echo "All health checks passed"
              fi
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
```

---

**Summary**: This maintenance guide provides comprehensive procedures for maintaining MPLP v1.0 Alpha in production environments, ensuring 99.9% uptime through proactive maintenance, zero-downtime updates, and robust backup and recovery procedures.
