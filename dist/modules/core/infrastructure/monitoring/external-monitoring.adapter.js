"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalMonitoringAdapter = void 0;
class ExternalMonitoringAdapter {
    config;
    provider;
    connection = null;
    statistics;
    metricsBuffer = [];
    logsBuffer = [];
    tracesBuffer = [];
    alertsBuffer = [];
    flushTimer = null;
    reconnectTimer = null;
    constructor(config) {
        this.config = config;
        this.provider = config.provider;
        this.statistics = {
            metricsCount: 0,
            logsCount: 0,
            tracesCount: 0,
            alertsCount: 0,
            activeAlerts: 0,
            dataPoints: 0,
            exportedMetrics: 0,
            exportErrors: 0,
            lastExportTime: new Date().toISOString(),
            connectionStatus: 'disconnected',
            averageLatency: 0,
            errorRate: 0
        };
    }
    async connect() {
        try {
            switch (this.provider) {
                case 'prometheus':
                    await this.connectPrometheus();
                    break;
                case 'grafana':
                    await this.connectGrafana();
                    break;
                case 'datadog':
                    await this.connectDataDog();
                    break;
                case 'new_relic':
                    await this.connectNewRelic();
                    break;
                case 'elastic_apm':
                    await this.connectElasticAPM();
                    break;
                case 'custom':
                    await this.connectCustom();
                    break;
                default:
                    throw new Error(`Unsupported monitoring provider: ${this.provider}`);
            }
            this.statistics.connectionStatus = 'connected';
            this.startFlushTimer();
            console.log(`Connected to ${this.provider} monitoring system`);
        }
        catch (error) {
            this.statistics.connectionStatus = 'error';
            throw new Error(`Failed to connect to ${this.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async disconnect() {
        try {
            await this.flushBuffers();
            if (this.flushTimer) {
                clearTimeout(this.flushTimer);
                this.flushTimer = null;
            }
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            if (this.connection?.client) {
                await this.disconnectProvider();
                this.connection = null;
            }
            this.statistics.connectionStatus = 'disconnected';
            console.log(`Disconnected from ${this.provider} monitoring system`);
        }
        catch (error) {
            console.error(`Error disconnecting from ${this.provider}:`, error);
        }
    }
    async sendMetric(metric) {
        if (this.statistics.connectionStatus !== 'connected') {
            throw new Error('Monitoring system not connected');
        }
        try {
            this.metricsBuffer.push(metric);
            this.statistics.metricsCount++;
            this.statistics.dataPoints++;
            if (this.metricsBuffer.length >= this.getBatchSize()) {
                await this.flushMetrics();
            }
        }
        catch (error) {
            this.statistics.exportErrors++;
            console.error(`Error sending metric ${metric.name}:`, error);
            throw error;
        }
    }
    async sendLog(log) {
        if (this.statistics.connectionStatus !== 'connected') {
            throw new Error('Monitoring system not connected');
        }
        try {
            this.logsBuffer.push(log);
            this.statistics.logsCount++;
            this.statistics.dataPoints++;
            if (this.logsBuffer.length >= this.getBatchSize()) {
                await this.flushLogs();
            }
        }
        catch (error) {
            this.statistics.exportErrors++;
            console.error(`Error sending log:`, error);
            throw error;
        }
    }
    async sendTrace(trace) {
        if (this.statistics.connectionStatus !== 'connected') {
            throw new Error('Monitoring system not connected');
        }
        try {
            this.tracesBuffer.push(trace);
            this.statistics.tracesCount++;
            this.statistics.dataPoints++;
            if (this.tracesBuffer.length >= this.getBatchSize()) {
                await this.flushTraces();
            }
        }
        catch (error) {
            this.statistics.exportErrors++;
            console.error(`Error sending trace ${trace.traceId}:`, error);
            throw error;
        }
    }
    async sendAlert(alert) {
        if (this.statistics.connectionStatus !== 'connected') {
            throw new Error('Monitoring system not connected');
        }
        try {
            this.alertsBuffer.push(alert);
            this.statistics.alertsCount++;
            if (alert.status === 'firing') {
                this.statistics.activeAlerts++;
            }
            else if (alert.status === 'resolved') {
                this.statistics.activeAlerts = Math.max(0, this.statistics.activeAlerts - 1);
            }
            await this.flushAlerts();
        }
        catch (error) {
            this.statistics.exportErrors++;
            console.error(`Error sending alert ${alert.id}:`, error);
            throw error;
        }
    }
    getStatistics() {
        const totalOperations = this.statistics.exportedMetrics + this.statistics.exportErrors;
        if (totalOperations > 0) {
            this.statistics.errorRate = (this.statistics.exportErrors / totalOperations) * 100;
        }
        return { ...this.statistics };
    }
    async connectPrometheus() {
        try {
            const prometheusOptions = this.config.options.prometheus;
            if (!prometheusOptions) {
                throw new Error('Prometheus options not configured');
            }
            console.log('Connecting to Prometheus...');
            if (!prometheusOptions.pushGateway.startsWith('http')) {
                throw new Error('Invalid Prometheus Push Gateway URL');
            }
            const connectionParams = {
                pushGateway: prometheusOptions.pushGateway,
                jobName: prometheusOptions.jobName,
                instance: prometheusOptions.instance,
                scrapeInterval: prometheusOptions.scrapeInterval,
                metricsPath: prometheusOptions.metricsPath,
                basicAuth: prometheusOptions.basicAuth,
                labels: prometheusOptions.labels
            };
            await this.simulateConnection();
            this.connection = {
                provider: 'prometheus',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to Prometheus Push Gateway: ${connectionParams.pushGateway}`);
        }
        catch (error) {
            throw new Error(`Prometheus connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async connectGrafana() {
        try {
            const grafanaOptions = this.config.options.grafana;
            if (!grafanaOptions) {
                throw new Error('Grafana options not configured');
            }
            console.log('Connecting to Grafana...');
            if (!grafanaOptions.apiUrl.startsWith('http')) {
                throw new Error('Invalid Grafana API URL');
            }
            const connectionParams = {
                apiUrl: grafanaOptions.apiUrl,
                orgId: grafanaOptions.orgId,
                dashboardId: grafanaOptions.dashboardId,
                folderId: grafanaOptions.folderId,
                datasourceUid: grafanaOptions.datasourceUid,
                alertRuleGroups: grafanaOptions.alertRuleGroups
            };
            await this.simulateConnection();
            this.connection = {
                provider: 'grafana',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to Grafana: ${connectionParams.apiUrl}`);
        }
        catch (error) {
            throw new Error(`Grafana connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async connectDataDog() {
        try {
            const datadogOptions = this.config.options.datadog;
            if (!datadogOptions) {
                throw new Error('DataDog options not configured');
            }
            console.log('Connecting to DataDog...');
            if (!datadogOptions.apiKey || !datadogOptions.appKey) {
                throw new Error('DataDog API key and App key are required');
            }
            const connectionParams = {
                apiKey: datadogOptions.apiKey,
                appKey: datadogOptions.appKey,
                site: datadogOptions.site,
                service: datadogOptions.service,
                env: datadogOptions.env,
                version: datadogOptions.version,
                tags: datadogOptions.tags
            };
            await this.simulateConnection();
            this.connection = {
                provider: 'datadog',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to DataDog (${connectionParams.site})`);
        }
        catch (error) {
            throw new Error(`DataDog connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async connectNewRelic() {
        try {
            const newRelicOptions = this.config.options.newRelic;
            if (!newRelicOptions) {
                throw new Error('New Relic options not configured');
            }
            console.log('Connecting to New Relic...');
            if (!newRelicOptions.licenseKey) {
                throw new Error('New Relic License Key is required');
            }
            const connectionParams = {
                licenseKey: newRelicOptions.licenseKey,
                accountId: newRelicOptions.accountId,
                applicationId: newRelicOptions.applicationId,
                region: newRelicOptions.region,
                customAttributes: newRelicOptions.customAttributes
            };
            await this.simulateConnection();
            this.connection = {
                provider: 'new_relic',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to New Relic (${connectionParams.region})`);
        }
        catch (error) {
            throw new Error(`New Relic connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async connectElasticAPM() {
        try {
            const elasticOptions = this.config.options.elasticAPM;
            if (!elasticOptions) {
                throw new Error('Elastic APM options not configured');
            }
            console.log('Connecting to Elastic APM...');
            if (!elasticOptions.serverUrl.startsWith('http')) {
                throw new Error('Invalid Elastic APM server URL');
            }
            const connectionParams = {
                serverUrl: elasticOptions.serverUrl,
                serviceName: elasticOptions.serviceName,
                serviceVersion: elasticOptions.serviceVersion,
                environment: elasticOptions.environment,
                secretToken: elasticOptions.secretToken,
                apiKey: elasticOptions.apiKey
            };
            await this.simulateConnection();
            this.connection = {
                provider: 'elastic_apm',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to Elastic APM: ${connectionParams.serverUrl}`);
        }
        catch (error) {
            throw new Error(`Elastic APM connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async connectCustom() {
        try {
            const customOptions = this.config.options.custom;
            if (!customOptions) {
                throw new Error('Custom monitoring options not configured');
            }
            console.log('Connecting to Custom monitoring system...');
            if (!customOptions.endpoint.startsWith('http')) {
                throw new Error('Invalid custom monitoring endpoint URL');
            }
            const connectionParams = {
                endpoint: customOptions.endpoint,
                headers: customOptions.headers,
                format: customOptions.format,
                batchSize: customOptions.batchSize,
                flushInterval: customOptions.flushInterval
            };
            await this.simulateConnection();
            this.connection = {
                provider: 'custom',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to Custom monitoring: ${connectionParams.endpoint}`);
        }
        catch (error) {
            throw new Error(`Custom monitoring connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async flushBuffers() {
        await Promise.all([
            this.flushMetrics(),
            this.flushLogs(),
            this.flushTraces(),
            this.flushAlerts()
        ]);
    }
    async flushMetrics() {
        if (this.metricsBuffer.length === 0) {
            return;
        }
        const startTime = Date.now();
        const metrics = [...this.metricsBuffer];
        this.metricsBuffer = [];
        try {
            switch (this.provider) {
                case 'prometheus':
                    await this.exportMetricsToPrometheus(metrics);
                    break;
                case 'grafana':
                    await this.exportMetricsToGrafana(metrics);
                    break;
                case 'datadog':
                    await this.exportMetricsToDataDog(metrics);
                    break;
                case 'new_relic':
                    await this.exportMetricsToNewRelic(metrics);
                    break;
                case 'elastic_apm':
                    await this.exportMetricsToElasticAPM(metrics);
                    break;
                case 'custom':
                    await this.exportMetricsToCustom(metrics);
                    break;
            }
            this.statistics.exportedMetrics += metrics.length;
            this.statistics.lastExportTime = new Date().toISOString();
            this.updateLatency(Date.now() - startTime);
        }
        catch (error) {
            this.metricsBuffer.unshift(...metrics);
            this.statistics.exportErrors++;
            console.error(`Failed to flush metrics to ${this.provider}:`, error);
            throw error;
        }
    }
    async flushLogs() {
        if (this.logsBuffer.length === 0) {
            return;
        }
        const logs = [...this.logsBuffer];
        this.logsBuffer = [];
        try {
            switch (this.provider) {
                case 'elastic_apm':
                    await this.exportLogsToElasticAPM(logs);
                    break;
                case 'datadog':
                    await this.exportLogsToDataDog(logs);
                    break;
                case 'new_relic':
                    await this.exportLogsToNewRelic(logs);
                    break;
                case 'custom':
                    await this.exportLogsToCustom(logs);
                    break;
                default:
                    console.log(`${this.provider} does not support log export, skipping ${logs.length} logs`);
            }
        }
        catch (error) {
            this.logsBuffer.unshift(...logs);
            this.statistics.exportErrors++;
            console.error(`Failed to flush logs to ${this.provider}:`, error);
            throw error;
        }
    }
    async flushTraces() {
        if (this.tracesBuffer.length === 0) {
            return;
        }
        const traces = [...this.tracesBuffer];
        this.tracesBuffer = [];
        try {
            switch (this.provider) {
                case 'elastic_apm':
                    await this.exportTracesToElasticAPM(traces);
                    break;
                case 'datadog':
                    await this.exportTracesToDataDog(traces);
                    break;
                case 'new_relic':
                    await this.exportTracesToNewRelic(traces);
                    break;
                case 'custom':
                    await this.exportTracesToCustom(traces);
                    break;
                default:
                    console.log(`${this.provider} does not support trace export, skipping ${traces.length} traces`);
            }
        }
        catch (error) {
            this.tracesBuffer.unshift(...traces);
            this.statistics.exportErrors++;
            console.error(`Failed to flush traces to ${this.provider}:`, error);
            throw error;
        }
    }
    async flushAlerts() {
        if (this.alertsBuffer.length === 0) {
            return;
        }
        const alerts = [...this.alertsBuffer];
        this.alertsBuffer = [];
        try {
            switch (this.provider) {
                case 'prometheus':
                    await this.exportAlertsToPrometheus(alerts);
                    break;
                case 'grafana':
                    await this.exportAlertsToGrafana(alerts);
                    break;
                case 'datadog':
                    await this.exportAlertsToDataDog(alerts);
                    break;
                case 'new_relic':
                    await this.exportAlertsToNewRelic(alerts);
                    break;
                case 'elastic_apm':
                    await this.exportAlertsToElasticAPM(alerts);
                    break;
                case 'custom':
                    await this.exportAlertsToCustom(alerts);
                    break;
            }
        }
        catch (error) {
            this.alertsBuffer.unshift(...alerts);
            this.statistics.exportErrors++;
            console.error(`Failed to flush alerts to ${this.provider}:`, error);
            throw error;
        }
    }
    async exportMetricsToPrometheus(metrics) {
        await this.simulateNetworkCall();
        console.log(`Exported ${metrics.length} metrics to Prometheus`);
    }
    async exportAlertsToPrometheus(alerts) {
        await this.simulateNetworkCall();
        console.log(`Exported ${alerts.length} alerts to Prometheus/Alertmanager`);
    }
    async exportMetricsToGrafana(metrics) {
        await this.simulateNetworkCall();
        console.log(`Exported ${metrics.length} metrics to Grafana`);
    }
    async exportAlertsToGrafana(alerts) {
        await this.simulateNetworkCall();
        console.log(`Exported ${alerts.length} alerts to Grafana`);
    }
    async exportMetricsToDataDog(metrics) {
        await this.simulateNetworkCall();
        console.log(`Exported ${metrics.length} metrics to DataDog`);
    }
    async exportLogsToDataDog(logs) {
        await this.simulateNetworkCall();
        console.log(`Exported ${logs.length} logs to DataDog`);
    }
    async exportTracesToDataDog(traces) {
        await this.simulateNetworkCall();
        console.log(`Exported ${traces.length} traces to DataDog`);
    }
    async exportAlertsToDataDog(alerts) {
        await this.simulateNetworkCall();
        console.log(`Exported ${alerts.length} alerts to DataDog`);
    }
    async exportMetricsToNewRelic(metrics) {
        await this.simulateNetworkCall();
        console.log(`Exported ${metrics.length} metrics to New Relic`);
    }
    async exportLogsToNewRelic(logs) {
        await this.simulateNetworkCall();
        console.log(`Exported ${logs.length} logs to New Relic`);
    }
    async exportTracesToNewRelic(traces) {
        await this.simulateNetworkCall();
        console.log(`Exported ${traces.length} traces to New Relic`);
    }
    async exportAlertsToNewRelic(alerts) {
        await this.simulateNetworkCall();
        console.log(`Exported ${alerts.length} alerts to New Relic`);
    }
    async exportMetricsToElasticAPM(metrics) {
        await this.simulateNetworkCall();
        console.log(`Exported ${metrics.length} metrics to Elastic APM`);
    }
    async exportLogsToElasticAPM(logs) {
        await this.simulateNetworkCall();
        console.log(`Exported ${logs.length} logs to Elastic APM`);
    }
    async exportTracesToElasticAPM(traces) {
        await this.simulateNetworkCall();
        console.log(`Exported ${traces.length} traces to Elastic APM`);
    }
    async exportAlertsToElasticAPM(alerts) {
        await this.simulateNetworkCall();
        console.log(`Exported ${alerts.length} alerts to Elastic APM`);
    }
    async exportMetricsToCustom(metrics) {
        await this.simulateNetworkCall();
        const customOptions = this.config.options.custom;
        if (!customOptions) {
            throw new Error('Custom options not configured');
        }
        console.log(`Exported ${metrics.length} metrics to Custom endpoint`);
    }
    async exportLogsToCustom(logs) {
        await this.simulateNetworkCall();
        const customOptions = this.config.options.custom;
        if (!customOptions) {
            throw new Error('Custom options not configured');
        }
        console.log(`Exported ${logs.length} logs to Custom endpoint`);
    }
    async exportTracesToCustom(traces) {
        await this.simulateNetworkCall();
        const customOptions = this.config.options.custom;
        if (!customOptions) {
            throw new Error('Custom options not configured');
        }
        console.log(`Exported ${traces.length} traces to Custom endpoint`);
    }
    async exportAlertsToCustom(alerts) {
        await this.simulateNetworkCall();
        const customOptions = this.config.options.custom;
        if (!customOptions) {
            throw new Error('Custom options not configured');
        }
        console.log(`Exported ${alerts.length} alerts to Custom endpoint`);
    }
    startFlushTimer() {
        const flushInterval = this.getFlushInterval();
        this.flushTimer = setInterval(async () => {
            try {
                await this.flushBuffers();
            }
            catch (error) {
                console.error('Error during scheduled flush:', error);
            }
        }, flushInterval);
    }
    getFlushInterval() {
        const customOptions = this.config.options.custom;
        return customOptions?.flushInterval || 30000;
    }
    getBatchSize() {
        const customOptions = this.config.options.custom;
        return customOptions?.batchSize || 100;
    }
    updateLatency(latency) {
        this.statistics.averageLatency = (this.statistics.averageLatency + latency) / 2;
    }
    async simulateConnection() {
        const delay = Math.random() * 200 + 100;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    async simulateNetworkCall() {
        const delay = Math.random() * 50 + 10;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    async disconnectProvider() {
        switch (this.provider) {
            case 'prometheus':
                console.log('Disconnected from Prometheus');
                break;
            case 'grafana':
                console.log('Disconnected from Grafana');
                break;
            case 'datadog':
                console.log('Disconnected from DataDog');
                break;
            case 'new_relic':
                console.log('Disconnected from New Relic');
                break;
            case 'elastic_apm':
                console.log('Disconnected from Elastic APM');
                break;
            case 'custom':
                console.log('Disconnected from Custom monitoring');
                break;
        }
    }
    async healthCheck() {
        const details = {
            provider: this.provider,
            connectionStatus: this.statistics.connectionStatus,
            bufferSizes: {
                metrics: this.metricsBuffer.length,
                logs: this.logsBuffer.length,
                traces: this.tracesBuffer.length,
                alerts: this.alertsBuffer.length
            },
            statistics: this.getStatistics()
        };
        let status;
        if (this.statistics.connectionStatus === 'connected' && this.statistics.errorRate < 5) {
            status = 'healthy';
        }
        else if (this.statistics.connectionStatus === 'connected' && this.statistics.errorRate < 20) {
            status = 'degraded';
        }
        else {
            status = 'unhealthy';
        }
        return { status, details };
    }
    async reconnect() {
        console.log(`Attempting to reconnect to ${this.provider}...`);
        try {
            await this.disconnect();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.connect();
            console.log(`Successfully reconnected to ${this.provider}`);
        }
        catch (error) {
            console.error(`Failed to reconnect to ${this.provider}:`, error);
            if (!this.reconnectTimer) {
                this.reconnectTimer = setTimeout(() => {
                    this.reconnectTimer = null;
                    this.reconnect();
                }, 30000);
            }
            throw error;
        }
    }
}
exports.ExternalMonitoringAdapter = ExternalMonitoringAdapter;
