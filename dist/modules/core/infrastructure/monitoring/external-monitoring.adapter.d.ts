import { UUID, Timestamp } from '../../types';
export interface ExternalMonitoringConfig {
    provider: MonitoringProvider;
    connectionString: string;
    options: MonitoringProviderOptions;
    exportFormats: ExportFormat[];
    retryPolicy: MonitoringRetryPolicy;
    authentication: MonitoringAuthentication;
    dataRetention: DataRetentionPolicy;
    alerting: AlertingConfig;
}
export type MonitoringProvider = 'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom';
export type ExportFormat = 'prometheus' | 'opentelemetry' | 'json' | 'influxdb' | 'custom';
export interface MonitoringProviderOptions {
    prometheus?: PrometheusOptions;
    grafana?: GrafanaOptions;
    datadog?: DataDogOptions;
    newRelic?: NewRelicOptions;
    elasticAPM?: ElasticAPMOptions;
    custom?: CustomOptions;
}
export interface PrometheusOptions {
    pushGateway: string;
    jobName: string;
    instance: string;
    scrapeInterval: number;
    metricsPath: string;
    basicAuth?: {
        username: string;
        password: string;
    };
    labels?: Record<string, string>;
}
export interface GrafanaOptions {
    apiUrl: string;
    orgId: number;
    dashboardId?: string;
    folderId?: number;
    datasourceUid: string;
    alertRuleGroups?: string[];
}
export interface DataDogOptions {
    apiKey: string;
    appKey: string;
    site: string;
    service: string;
    env: string;
    version: string;
    tags?: string[];
}
export interface NewRelicOptions {
    licenseKey: string;
    accountId: string;
    applicationId: string;
    region: 'US' | 'EU';
    customAttributes?: Record<string, string>;
}
export interface ElasticAPMOptions {
    serverUrl: string;
    serviceName: string;
    serviceVersion: string;
    environment: string;
    secretToken?: string;
    apiKey?: string;
}
export interface CustomOptions {
    endpoint: string;
    headers?: Record<string, string>;
    format: string;
    batchSize: number;
    flushInterval: number;
}
export interface MonitoringRetryPolicy {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
}
export interface MonitoringAuthentication {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
    credentials?: Record<string, string>;
}
export interface DataRetentionPolicy {
    metricsRetentionDays: number;
    logsRetentionDays: number;
    tracesRetentionDays: number;
    alertsRetentionDays: number;
}
export interface AlertingConfig {
    enabled: boolean;
    channels: AlertChannel[];
    rules: AlertRule[];
    escalationPolicy?: EscalationPolicy;
}
export interface AlertChannel {
    type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'custom';
    config: Record<string, unknown>;
    enabled: boolean;
}
export interface AlertRule {
    name: string;
    condition: string;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
}
export interface EscalationPolicy {
    levels: EscalationLevel[];
    timeout: number;
}
export interface EscalationLevel {
    level: number;
    channels: string[];
    delay: number;
}
export interface MonitoringMetric {
    name: string;
    value: number;
    timestamp: Timestamp;
    labels?: Record<string, string>;
    type: MetricType;
    unit?: string;
    description?: string;
}
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';
export interface MonitoringLog {
    level: LogLevel;
    message: string;
    timestamp: Timestamp;
    source: string;
    labels?: Record<string, string>;
    fields?: Record<string, unknown>;
    traceId?: string;
    spanId?: string;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface MonitoringTrace {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: Timestamp;
    endTime?: Timestamp;
    duration?: number;
    tags?: Record<string, string>;
    logs?: TraceLog[];
    status: TraceStatus;
}
export interface TraceLog {
    timestamp: Timestamp;
    fields: Record<string, unknown>;
}
export type TraceStatus = 'ok' | 'error' | 'timeout' | 'cancelled';
export interface MonitoringAlert {
    id: UUID;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: AlertStatus;
    condition: string;
    threshold: number;
    currentValue: number;
    timestamp: Timestamp;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
}
export type AlertStatus = 'firing' | 'resolved' | 'pending' | 'silenced';
export interface MonitoringStatistics {
    metricsCount: number;
    logsCount: number;
    tracesCount: number;
    alertsCount: number;
    activeAlerts: number;
    dataPoints: number;
    exportedMetrics: number;
    exportErrors: number;
    lastExportTime: Timestamp;
    connectionStatus: MonitoringConnectionStatus;
    averageLatency: number;
    errorRate: number;
}
export type MonitoringConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';
export declare class ExternalMonitoringAdapter {
    private config;
    private provider;
    private connection;
    private statistics;
    private metricsBuffer;
    private logsBuffer;
    private tracesBuffer;
    private alertsBuffer;
    private flushTimer;
    private reconnectTimer;
    constructor(config: ExternalMonitoringConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendMetric(metric: MonitoringMetric): Promise<void>;
    sendLog(log: MonitoringLog): Promise<void>;
    sendTrace(trace: MonitoringTrace): Promise<void>;
    sendAlert(alert: MonitoringAlert): Promise<void>;
    getStatistics(): MonitoringStatistics;
    private connectPrometheus;
    private connectGrafana;
    private connectDataDog;
    private connectNewRelic;
    private connectElasticAPM;
    private connectCustom;
    private flushBuffers;
    private flushMetrics;
    private flushLogs;
    private flushTraces;
    private flushAlerts;
    private exportMetricsToPrometheus;
    private exportAlertsToPrometheus;
    private exportMetricsToGrafana;
    private exportAlertsToGrafana;
    private exportMetricsToDataDog;
    private exportLogsToDataDog;
    private exportTracesToDataDog;
    private exportAlertsToDataDog;
    private exportMetricsToNewRelic;
    private exportLogsToNewRelic;
    private exportTracesToNewRelic;
    private exportAlertsToNewRelic;
    private exportMetricsToElasticAPM;
    private exportLogsToElasticAPM;
    private exportTracesToElasticAPM;
    private exportAlertsToElasticAPM;
    private exportMetricsToCustom;
    private exportLogsToCustom;
    private exportTracesToCustom;
    private exportAlertsToCustom;
    private startFlushTimer;
    private getFlushInterval;
    private getBatchSize;
    private updateLatency;
    private simulateConnection;
    private simulateNetworkCall;
    private disconnectProvider;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: Record<string, unknown>;
    }>;
    reconnect(): Promise<void>;
}
//# sourceMappingURL=external-monitoring.adapter.d.ts.map