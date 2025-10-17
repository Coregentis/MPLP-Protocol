"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkMonitoringService = void 0;
class NetworkMonitoringService {
    networkRepository;
    monitoringIntervals = new Map();
    metricsHistory = new Map();
    activeAlerts = new Map();
    constructor(networkRepository) {
        this.networkRepository = networkRepository;
    }
    async startMonitoring(networkId, intervalMs = 30000) {
        await this.stopMonitoring(networkId);
        const interval = setInterval(async () => {
            try {
                await this.collectMetrics(networkId);
            }
            catch (error) {
            }
        }, intervalMs);
        this.monitoringIntervals.set(networkId, interval);
        await this.collectMetrics(networkId);
    }
    async stopMonitoring(networkId) {
        const interval = this.monitoringIntervals.get(networkId);
        if (interval) {
            clearInterval(interval);
            this.monitoringIntervals.delete(networkId);
        }
    }
    async getRealtimeMetrics(networkId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            throw new Error(`Network ${networkId} not found`);
        }
        return await this.collectMetrics(networkId);
    }
    async getDashboard(networkId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            throw new Error(`Network ${networkId} not found`);
        }
        const metrics = await this.getRealtimeMetrics(networkId);
        const alerts = this.getActiveAlerts(networkId);
        const history = this.getMetricsHistory(networkId, 24);
        return {
            networkId,
            lastUpdated: new Date().toISOString(),
            overview: this.buildOverview(network, metrics),
            performance: this.buildPerformanceMetrics(metrics, history),
            capacity: this.buildCapacityMetrics(network, metrics),
            recentAlerts: alerts.slice(0, 10),
            topIssues: this.identifyTopIssues(alerts, metrics)
        };
    }
    getMetricsHistory(networkId, hours = 24) {
        const history = this.metricsHistory.get(networkId) || [];
        const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
        return history.filter(metric => new Date(metric.timestamp).getTime() > cutoffTime);
    }
    getActiveAlerts(networkId) {
        return this.activeAlerts.get(networkId) || [];
    }
    async acknowledgeAlert(networkId, alertId) {
        const alerts = this.activeAlerts.get(networkId) || [];
        const alert = alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.metadata.acknowledgedAt = new Date().toISOString();
        }
    }
    async resolveAlert(networkId, alertId) {
        const alerts = this.activeAlerts.get(networkId) || [];
        const alertIndex = alerts.findIndex(a => a.id === alertId);
        if (alertIndex >= 0) {
            alerts[alertIndex].resolvedAt = new Date().toISOString();
            alerts.splice(alertIndex, 1);
        }
    }
    async collectMetrics(networkId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            throw new Error(`Network ${networkId} not found`);
        }
        const timestamp = new Date().toISOString();
        const realTime = await this.collectRealtimeMetrics(network);
        const performance = await this.collectPerformanceMetrics(network);
        const alerts = await this.detectAlerts(network, realTime, performance);
        const trends = this.analyzeTrends(networkId, realTime);
        const metrics = {
            networkId,
            timestamp,
            realTime,
            performance,
            alerts,
            trends
        };
        this.storeMetricsHistory(networkId, metrics);
        this.updateActiveAlerts(networkId, alerts);
        return metrics;
    }
    async collectRealtimeMetrics(network) {
        const _activeNodes = network.nodes.filter(n => n.status === 'online').length;
        const activeConnections = network.edges.filter(e => e.status === 'active').length;
        return {
            activeConnections,
            messagesThroughput: this.calculateMessagesThroughput(network),
            averageLatency: this.calculateCurrentLatency(network),
            errorRate: this.calculateErrorRate(network),
            cpuUsage: this.simulateCpuUsage(),
            memoryUsage: this.simulateMemoryUsage()
        };
    }
    async collectPerformanceMetrics(network) {
        const history = this.getMetricsHistory(network.networkId, 1);
        return {
            responseTime: this.buildPerformanceMetric('responseTime', network, history),
            throughput: this.buildPerformanceMetric('throughput', network, history),
            errorRate: this.buildPerformanceMetric('errorRate', network, history),
            availability: this.buildPerformanceMetric('availability', network, history)
        };
    }
    async detectAlerts(network, realTime, _performance) {
        const alerts = [];
        if (realTime.averageLatency > 200) {
            alerts.push(this.createAlert(network.networkId, 'performance', 'warning', 'High Latency Detected', `Average latency is ${realTime.averageLatency}ms, exceeding threshold of 200ms`, { latency: realTime.averageLatency }));
        }
        if (realTime.errorRate > 0.05) {
            alerts.push(this.createAlert(network.networkId, 'performance', 'error', 'High Error Rate', `Error rate is ${(realTime.errorRate * 100).toFixed(2)}%, exceeding threshold of 5%`, { errorRate: realTime.errorRate }));
        }
        if (realTime.activeConnections === 0 && network.nodes.length > 1) {
            alerts.push(this.createAlert(network.networkId, 'connectivity', 'critical', 'No Active Connections', 'Network has no active connections despite having multiple nodes', { nodeCount: network.nodes.length }));
        }
        if (realTime.cpuUsage > 90) {
            alerts.push(this.createAlert(network.networkId, 'capacity', 'warning', 'High CPU Usage', `CPU usage is ${realTime.cpuUsage}%, approaching capacity limit`, { cpuUsage: realTime.cpuUsage }));
        }
        return alerts;
    }
    analyzeTrends(networkId, realTime) {
        const history = this.getMetricsHistory(networkId, 1);
        const trends = [];
        if (history.length > 1) {
            const previous = history[history.length - 2];
            const latencyTrend = this.calculateTrend(previous.realTime.averageLatency, realTime.averageLatency, 200);
            trends.push(latencyTrend);
            const throughputTrend = this.calculateTrend(previous.realTime.messagesThroughput, realTime.messagesThroughput, 1000);
            trends.push(throughputTrend);
        }
        return trends;
    }
    calculateMessagesThroughput(network) {
        const activeConnections = network.edges.filter(e => e.status === 'active').length;
        const baseRate = 100;
        const connectionMultiplier = activeConnections * 50;
        return baseRate + connectionMultiplier + Math.random() * 100;
    }
    calculateCurrentLatency(network) {
        const baseLatency = 50;
        const nodeLatency = network.nodes.length * 2;
        const loadFactor = 1 + Math.random() * 0.5;
        return Math.round((baseLatency + nodeLatency) * loadFactor);
    }
    calculateErrorRate(network) {
        const baseErrorRate = 0.01;
        const complexityFactor = network.nodes.length > 10 ? 0.02 : 0;
        return baseErrorRate + complexityFactor + Math.random() * 0.02;
    }
    simulateCpuUsage() {
        return Math.round(30 + Math.random() * 40);
    }
    simulateMemoryUsage() {
        return Math.round(40 + Math.random() * 30);
    }
    buildPerformanceMetric(type, network, history) {
        let current;
        let threshold;
        switch (type) {
            case 'responseTime':
                current = this.calculateCurrentLatency(network);
                threshold = 200;
                break;
            case 'throughput':
                current = this.calculateMessagesThroughput(network);
                threshold = 500;
                break;
            case 'errorRate':
                current = this.calculateErrorRate(network);
                threshold = 0.05;
                break;
            case 'availability':
                current = network.nodes.filter(n => n.status === 'online').length / network.nodes.length;
                threshold = 0.95;
                break;
            default:
                current = 0;
                threshold = 0;
        }
        const values = history.map(h => {
            switch (type) {
                case 'responseTime': return h.realTime.averageLatency;
                case 'throughput': return h.realTime.messagesThroughput;
                case 'errorRate': return h.realTime.errorRate;
                case 'availability': return 1 - h.realTime.errorRate;
                default: return 0;
            }
        });
        const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : current;
        const min = values.length > 0 ? Math.min(...values) : current;
        const max = values.length > 0 ? Math.max(...values) : current;
        let status = 'normal';
        if (type === 'errorRate' || type === 'responseTime') {
            if (current > threshold * 1.5)
                status = 'critical';
            else if (current > threshold)
                status = 'warning';
        }
        else {
            if (current < threshold * 0.5)
                status = 'critical';
            else if (current < threshold)
                status = 'warning';
        }
        return {
            current,
            average,
            min,
            max,
            threshold,
            status
        };
    }
    createAlert(networkId, type, severity, title, description, metadata) {
        return {
            id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            networkId,
            type,
            severity,
            title,
            description,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            metadata
        };
    }
    calculateTrend(previous, current, threshold) {
        const changePercent = ((current - previous) / previous) * 100;
        const direction = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable';
        return {
            metric: 'latency',
            direction,
            changePercent,
            timeframe: '1h',
            prediction: {
                nextValue: current + (current - previous),
                confidence: 0.7,
                timeToThreshold: direction === 'up' && current < threshold ?
                    Math.round((threshold - current) / (current - previous)) : undefined
            }
        };
    }
    storeMetricsHistory(networkId, metrics) {
        const history = this.metricsHistory.get(networkId) || [];
        history.push(metrics);
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
        const filteredHistory = history.filter(m => new Date(m.timestamp).getTime() > cutoffTime);
        this.metricsHistory.set(networkId, filteredHistory);
    }
    updateActiveAlerts(networkId, newAlerts) {
        const existingAlerts = this.activeAlerts.get(networkId) || [];
        const allAlerts = [...existingAlerts];
        newAlerts.forEach(newAlert => {
            const exists = existingAlerts.some(existing => existing.type === newAlert.type &&
                existing.title === newAlert.title &&
                !existing.resolvedAt);
            if (!exists) {
                allAlerts.push(newAlert);
            }
        });
        this.activeAlerts.set(networkId, allAlerts);
    }
    buildOverview(network, metrics) {
        const activeNodes = network.nodes.filter(n => n.status === 'online').length;
        const status = metrics.alerts.some(a => a.severity === 'critical') ? 'critical' :
            metrics.alerts.some(a => a.severity === 'error') ? 'degraded' : 'healthy';
        return {
            status,
            uptime: 0.99,
            totalNodes: network.nodes.length,
            activeNodes,
            totalConnections: network.edges.length,
            activeConnections: metrics.realTime.activeConnections
        };
    }
    buildPerformanceMetrics(metrics, history) {
        const sparklineData = history.slice(-20).map(h => h.realTime.averageLatency);
        return {
            latency: {
                value: metrics.realTime.averageLatency,
                unit: 'ms',
                trend: 'stable',
                status: metrics.realTime.averageLatency > 200 ? 'critical' :
                    metrics.realTime.averageLatency > 100 ? 'warning' : 'good',
                sparkline: sparklineData
            },
            throughput: {
                value: metrics.realTime.messagesThroughput,
                unit: 'msg/s',
                trend: 'up',
                status: 'good',
                sparkline: history.slice(-20).map(h => h.realTime.messagesThroughput)
            },
            errorRate: {
                value: metrics.realTime.errorRate * 100,
                unit: '%',
                trend: 'stable',
                status: metrics.realTime.errorRate > 0.05 ? 'critical' : 'good',
                sparkline: history.slice(-20).map(h => h.realTime.errorRate * 100)
            },
            availability: {
                value: 99.5,
                unit: '%',
                trend: 'stable',
                status: 'good',
                sparkline: Array(20).fill(99.5)
            }
        };
    }
    buildCapacityMetrics(network, metrics) {
        return {
            nodeUtilization: (network.nodes.filter(n => n.status === 'online').length / network.nodes.length) * 100,
            connectionUtilization: (metrics.realTime.activeConnections / network.edges.length) * 100,
            bandwidthUtilization: 65,
            storageUtilization: 45
        };
    }
    identifyTopIssues(alerts, metrics) {
        const issues = [];
        if (metrics.realTime.averageLatency > 200) {
            issues.push('High network latency affecting performance');
        }
        if (metrics.realTime.errorRate > 0.05) {
            issues.push('Elevated error rate detected');
        }
        if (alerts.some(a => a.type === 'connectivity')) {
            issues.push('Network connectivity issues');
        }
        return issues.slice(0, 5);
    }
}
exports.NetworkMonitoringService = NetworkMonitoringService;
