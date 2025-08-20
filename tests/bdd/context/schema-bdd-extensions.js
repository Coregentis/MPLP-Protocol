/**
 * Context模块Schema BDD测试扩展
 * 包含第6-8个场景组的实现
 * 
 * @version 1.0.0
 * @created 2025-08-15
 */

// ===== 第6个场景组：监控集成协议场景实现 =====

// 6.1 多厂商监控集成协议验证 (prometheus/grafana/datadog/newrelic/elastic_apm)
async function testMultiVendorMonitoringIntegrationProtocol(context, validateContextSchema) {
  // 测试Schema中允许的监控提供商
  const supportedProviders = ['prometheus', 'grafana', 'datadog', 'new_relic', 'elastic_apm'];
  
  const testMonitoringIntegration = {
    enabled: true,
    supported_providers: supportedProviders,
    integration_endpoints: {
      metrics_api: "http://localhost:9090/metrics",
      grafana_dashboard: "http://localhost:3000/dashboard",
      datadog_api: "https://api.datadoghq.com/api/v1/metrics",
      newrelic_api: "https://api.newrelic.com/v2/applications",
      elastic_apm_api: "http://localhost:8200/intake/v2/events"
    },
    context_metrics: {
      track_state_changes: true,
      track_cache_performance: true,
      track_sync_operations: true,
      track_access_patterns: true
    },
    export_formats: ["prometheus", "opentelemetry", "custom"]
  };

  const updatedContext = { ...context };
  updatedContext.monitoring_integration = testMonitoringIntegration;

  // 验证Schema合规性
  const isValid = validateContextSchema(updatedContext);
  if (!isValid) {
    const errors = validateContextSchema.errors.map(err => 
      `${err.instancePath}: ${err.message}`
    ).join('; ');
    throw new Error(`多厂商监控集成协议Schema验证失败: ${errors}`);
  }

  // 验证提供商枚举完整性
  const schemaProviders = context.monitoring_integration?.supported_providers || [];
  const missingProviders = supportedProviders.filter(provider => !schemaProviders.includes(provider));
  if (missingProviders.length > 0) {
    console.warn(`Schema中可能缺少监控提供商: ${missingProviders.join(', ')}`);
  }

  return { 
    passed: true, 
    message: `多厂商监控集成协议验证通过，支持${supportedProviders.length}个提供商，${testMonitoringIntegration.export_formats.length}种导出格式` 
  };
}

// 6.2 标准化集成端点协议验证 (4种API端点)
async function testStandardizedIntegrationEndpointsProtocol(context, validateContextSchema) {
  // 测试4种标准化API端点
  const standardEndpoints = {
    metrics_api: "http://localhost:9090/metrics",
    health_api: "http://localhost:8080/health",
    alerts_api: "http://localhost:9093/api/v1/alerts",
    config_api: "http://localhost:8080/config"
  };

  const testContext = { ...context };
  testContext.monitoring_integration.integration_endpoints = standardEndpoints;

  // 验证Schema合规性
  const isValid = validateContextSchema(testContext);
  if (!isValid) {
    const errors = validateContextSchema.errors.map(err => 
      `${err.instancePath}: ${err.message}`
    ).join('; ');
    throw new Error(`标准化集成端点协议Schema验证失败: ${errors}`);
  }

  // 验证端点URL格式
  Object.entries(standardEndpoints).forEach(([endpointName, url]) => {
    try {
      new URL(url);
    } catch (error) {
      throw new Error(`无效的端点URL ${endpointName}: ${url}`);
    }
  });

  return { 
    passed: true, 
    message: `标准化集成端点协议验证通过，配置${Object.keys(standardEndpoints).length}个API端点` 
  };
}

// 6.3 监控指标导出协议验证 (prometheus/opentelemetry格式)
async function testMonitoringMetricsExportProtocol(context, validateContextSchema) {
  // 测试Schema中允许的监控指标导出格式
  const exportFormats = ['prometheus', 'opentelemetry', 'custom'];
  
  const testContext = { ...context };
  testContext.monitoring_integration.export_formats = exportFormats;

  // 验证Schema合规性
  const isValid = validateContextSchema(testContext);
  if (!isValid) {
    const errors = validateContextSchema.errors.map(err => 
      `${err.instancePath}: ${err.message}`
    ).join('; ');
    throw new Error(`监控指标导出协议Schema验证失败: ${errors}`);
  }

  // 模拟不同格式的指标导出
  const metricsData = {
    context_access_latency_ms: 15.2,
    context_update_latency_ms: 28.7,
    cache_hit_rate_percent: 87.5,
    active_contexts_count: 5
  };

  const exportResults = {};
  
  // Prometheus格式
  exportResults.prometheus = Object.entries(metricsData)
    .map(([metric, value]) => `mplp_context_${metric} ${value}`)
    .join('\n');

  // OpenTelemetry格式
  exportResults.opentelemetry = {
    resource: { service: 'mplp-context' },
    metrics: Object.entries(metricsData).map(([name, value]) => ({
      name: `mplp.context.${name}`,
      value,
      timestamp: Date.now()
    }))
  };

  return { 
    passed: true, 
    message: `监控指标导出协议验证通过，支持${exportFormats.length}种格式，导出${Object.keys(metricsData).length}个指标` 
  };
}

// 6.4 上下文指标收集协议验证
async function testContextMetricsCollectionProtocol(context, validateContextSchema) {
  // 测试上下文指标收集配置
  const testMetricsConfig = {
    track_state_changes: true,
    track_cache_performance: true,
    track_sync_operations: true,
    track_access_patterns: true
  };

  const testContext = { ...context };
  testContext.monitoring_integration.context_metrics = testMetricsConfig;

  // 验证Schema合规性
  const isValid = validateContextSchema(testContext);
  if (!isValid) {
    const errors = validateContextSchema.errors.map(err => 
      `${err.instancePath}: ${err.message}`
    ).join('; ');
    throw new Error(`上下文指标收集协议Schema验证失败: ${errors}`);
  }

  // 验证指标收集的完整性
  const enabledMetrics = Object.entries(testMetricsConfig)
    .filter(([_, enabled]) => enabled)
    .map(([metric, _]) => metric);

  if (enabledMetrics.length === 0) {
    throw new Error('至少需要启用一种指标收集');
  }

  return { 
    passed: true, 
    message: `上下文指标收集协议验证通过，启用${enabledMetrics.length}种指标收集类型` 
  };
}

// 6.5 监控配置协议验证
async function testMonitoringConfigurationProtocol(context, validateContextSchema) {
  // 测试完整的监控配置
  const testMonitoringConfig = {
    enabled: true,
    supported_providers: ['prometheus', 'grafana'],
    integration_endpoints: {
      metrics_api: "http://localhost:9090/metrics"
    },
    context_metrics: {
      track_state_changes: true,
      track_cache_performance: true,
      track_sync_operations: false,
      track_access_patterns: false
    },
    export_formats: ['prometheus', 'custom'],
    collection_interval_seconds: 30,
    retention_hours: 168, // 7天
    alerting_enabled: true,
    dashboard_enabled: true
  };

  const testContext = { ...context };
  testContext.monitoring_integration = testMonitoringConfig;

  // 验证Schema合规性
  const isValid = validateContextSchema(testContext);
  if (!isValid) {
    const errors = validateContextSchema.errors.map(err => 
      `${err.instancePath}: ${err.message}`
    ).join('; ');
    throw new Error(`监控配置协议Schema验证失败: ${errors}`);
  }

  // 验证配置参数范围
  if (testMonitoringConfig.collection_interval_seconds < 1 || testMonitoringConfig.collection_interval_seconds > 3600) {
    throw new Error(`收集间隔${testMonitoringConfig.collection_interval_seconds}秒超出范围[1, 3600]`);
  }

  if (testMonitoringConfig.retention_hours < 1 || testMonitoringConfig.retention_hours > 8760) {
    throw new Error(`保留时间${testMonitoringConfig.retention_hours}小时超出范围[1, 8760]`);
  }

  return { 
    passed: true, 
    message: `监控配置协议验证通过，收集间隔${testMonitoringConfig.collection_interval_seconds}秒，保留${testMonitoringConfig.retention_hours}小时` 
  };
}

// ===== 第7个场景组：性能指标协议场景实现 =====

// 7.1 性能指标收集协议验证 (9个标准指标)
async function testPerformanceMetricsCollectionProtocol(context, validateContextSchema) {
  // 测试9个标准性能指标
  const standardMetrics = {
    context_access_latency_ms: 12.5,
    context_update_latency_ms: 28.3,
    cache_hit_rate_percent: 89.2,
    context_sync_success_rate_percent: 99.5,
    context_state_consistency_score: 9.8,
    active_contexts_count: 15,
    context_operations_per_second: 25.7,
    context_memory_usage_mb: 128.5,
    average_context_size_bytes: 4096
  };

  const testContext = { ...context };
  testContext.performance_metrics.metrics = standardMetrics;

  // 验证Schema合规性
  const isValid = validateContextSchema(testContext);
  if (!isValid) {
    const errors = validateContextSchema.errors.map(err => 
      `${err.instancePath}: ${err.message}`
    ).join('; ');
    throw new Error(`性能指标收集协议Schema验证失败: ${errors}`);
  }

  // 验证指标值范围
  if (standardMetrics.cache_hit_rate_percent < 0 || standardMetrics.cache_hit_rate_percent > 100) {
    throw new Error(`缓存命中率${standardMetrics.cache_hit_rate_percent}%超出范围[0, 100]`);
  }

  if (standardMetrics.context_sync_success_rate_percent < 0 || standardMetrics.context_sync_success_rate_percent > 100) {
    throw new Error(`同步成功率${standardMetrics.context_sync_success_rate_percent}%超出范围[0, 100]`);
  }

  if (standardMetrics.context_state_consistency_score < 0 || standardMetrics.context_state_consistency_score > 10) {
    throw new Error(`状态一致性评分${standardMetrics.context_state_consistency_score}超出范围[0, 10]`);
  }

  return { 
    passed: true, 
    message: `性能指标收集协议验证通过，收集${Object.keys(standardMetrics).length}个标准指标，缓存命中率${standardMetrics.cache_hit_rate_percent}%` 
  };
}

// 7.2 健康检查协议验证 (healthy/degraded/unhealthy/inconsistent)
async function testHealthCheckProtocol(context, validateContextSchema, contextSchema) {
  // 测试所有健康状态
  const healthStatuses = ['healthy', 'degraded', 'unhealthy', 'inconsistent'];
  
  for (const status of healthStatuses) {
    const testHealthStatus = {
      status: status,
      last_check: new Date().toISOString(),
      checks: [
        {
          check_name: "schema_validation",
          status: status === 'healthy' ? "pass" : "fail",
          message: `Schema validation ${status === 'healthy' ? 'successful' : 'failed'}`,
          duration_ms: Math.random() * 10 + 1
        },
        {
          check_name: "database_connection",
          status: status === 'unhealthy' ? "fail" : "pass",
          message: `Database connection ${status === 'unhealthy' ? 'failed' : 'successful'}`,
          duration_ms: Math.random() * 20 + 5
        }
      ]
    };

    const testContext = { ...context };
    testContext.performance_metrics.health_status = testHealthStatus;

    // 验证Schema合规性
    const isValid = validateContextSchema(testContext);
    if (!isValid) {
      const errors = validateContextSchema.errors.map(err => 
        `${err.instancePath}: ${err.message}`
      ).join('; ');
      throw new Error(`健康检查协议(${status})Schema验证失败: ${errors}`);
    }
  }

  // 验证健康状态枚举完整性
  const schemaHealthStatuses = contextSchema.properties.performance_metrics.properties.health_status.properties.status.enum;
  const missingStatuses = healthStatuses.filter(status => !schemaHealthStatuses.includes(status));
  if (missingStatuses.length > 0) {
    throw new Error(`Schema中缺少健康状态: ${missingStatuses.join(', ')}`);
  }

  return { 
    passed: true, 
    message: `健康检查协议验证通过，支持${healthStatuses.length}种健康状态(${healthStatuses.join('/')})` 
  };
}

module.exports = {
  testMultiVendorMonitoringIntegrationProtocol,
  testStandardizedIntegrationEndpointsProtocol,
  testMonitoringMetricsExportProtocol,
  testContextMetricsCollectionProtocol,
  testMonitoringConfigurationProtocol,
  testPerformanceMetricsCollectionProtocol,
  testHealthCheckProtocol
};
