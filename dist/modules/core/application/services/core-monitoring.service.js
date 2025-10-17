"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreMonitoringService = void 0;
class CoreMonitoringService {
    coreRepository;
    alerts = new Map();
    healthHistory = [];
    constructor(coreRepository) {
        this.coreRepository = coreRepository;
    }
    async performHealthCheck() {
        const moduleHealth = await this.checkAllModulesHealth();
        const resourceHealth = await this.checkSystemResources();
        const networkHealth = await this.checkNetworkConnectivity();
        const overallHealth = this.calculateOverallHealth(moduleHealth, resourceHealth, networkHealth);
        const healthStatus = {
            overall: overallHealth,
            modules: moduleHealth,
            resources: resourceHealth,
            network: networkHealth,
            timestamp: new Date().toISOString()
        };
        this.healthHistory.push(healthStatus);
        if (this.healthHistory.length > 100) {
            this.healthHistory.splice(0, this.healthHistory.length - 100);
        }
        return healthStatus;
    }
    async manageAlerts(alertData) {
        await this.validateAlertData(alertData);
        const severity = await this.assessAlertSeverity(alertData);
        const alertId = alertData.alertId || `alert-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const processedAlert = {
            ...alertData,
            alertId,
            severity,
            timestamp: alertData.timestamp || new Date().toISOString()
        };
        this.alerts.set(alertId, processedAlert);
        const result = await this.processAlert(processedAlert);
        return result;
    }
    async generateMonitoringReport(reportType, customPeriod) {
        const period = customPeriod || this.getReportPeriod(reportType);
        const monitoringData = await this.collectMonitoringData(period);
        const trends = await this.analyzeMonitoringTrends(monitoringData);
        const report = await this.createMonitoringReport(monitoringData, trends, reportType, period);
        return report;
    }
    getAlertHistory(hours = 24) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return Array.from(this.alerts.values()).filter(alert => alert.timestamp && new Date(alert.timestamp) >= cutoffTime);
    }
    getHealthHistory(hours = 24) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.healthHistory.filter(health => new Date(health.timestamp) >= cutoffTime);
    }
    async getSystemStatistics() {
        const alerts = Array.from(this.alerts.values());
        const criticalAlerts = alerts.filter(a => a.severity === 'critical');
        const recentHealth = this.healthHistory.slice(-10);
        const averageResponseTime = recentHealth.length > 0
            ? recentHealth.reduce((sum, health) => {
                const moduleResponseTimes = health.modules.map(m => m.responseTime);
                const avgModuleTime = moduleResponseTimes.reduce((s, t) => s + t, 0) / moduleResponseTimes.length;
                return sum + avgModuleTime;
            }, 0) / recentHealth.length
            : 0;
        const systemUptime = 99.9;
        const latestHealth = this.healthHistory[this.healthHistory.length - 1];
        const healthScore = latestHealth ? this.calculateHealthScore(latestHealth) : 100;
        return {
            totalAlerts: alerts.length,
            criticalAlerts: criticalAlerts.length,
            averageResponseTime,
            systemUptime,
            healthScore
        };
    }
    async checkAllModulesHealth() {
        const modules = [
            'context', 'plan', 'role', 'confirm', 'trace',
            'extension', 'dialog', 'collab', 'network'
        ];
        const moduleHealthPromises = modules.map(async (moduleId) => {
            const checks = await this.performModuleHealthChecks(moduleId);
            const status = this.determineModuleHealth(checks);
            return {
                moduleId,
                moduleName: this.getModuleName(moduleId),
                status,
                lastCheck: new Date().toISOString(),
                responseTime: Math.random() * 100 + 10,
                errorCount: Math.floor(Math.random() * 5),
                checks
            };
        });
        return Promise.all(moduleHealthPromises);
    }
    async performModuleHealthChecks(_moduleId) {
        const checks = [
            'connectivity',
            'response_time',
            'error_rate',
            'resource_usage'
        ];
        return checks.map(checkName => ({
            checkName,
            status: Math.random() > 0.1 ? 'pass' : 'fail',
            message: Math.random() > 0.1 ? 'Check passed' : 'Check failed',
            durationMs: Math.random() * 50 + 5,
            timestamp: new Date().toISOString()
        }));
    }
    determineModuleHealth(checks) {
        const failedChecks = checks.filter(c => c.status === 'fail');
        if (failedChecks.length === 0) {
            return 'healthy';
        }
        else if (failedChecks.length <= 1) {
            return 'degraded';
        }
        else if (failedChecks.length <= 2) {
            return 'unhealthy';
        }
        else {
            return 'critical';
        }
    }
    getModuleName(moduleId) {
        const moduleNames = {
            'context': 'Context Management',
            'plan': 'Planning & Orchestration',
            'role': 'Role & Security',
            'confirm': 'Confirmation & Approval',
            'trace': 'Tracing & Monitoring',
            'extension': 'Extension Management',
            'dialog': 'Dialog Management',
            'collab': 'Collaboration',
            'network': 'Network Communication'
        };
        return moduleNames[moduleId] || moduleId;
    }
    async checkSystemResources() {
        return {
            cpu: {
                usage: Math.random() * 80 + 10,
                status: Math.random() > 0.2 ? 'healthy' : 'degraded'
            },
            memory: {
                usage: Math.random() * 70 + 15,
                status: Math.random() > 0.15 ? 'healthy' : 'degraded'
            },
            disk: {
                usage: Math.random() * 60 + 20,
                status: Math.random() > 0.1 ? 'healthy' : 'degraded'
            },
            network: {
                usage: Math.random() * 50 + 10,
                status: Math.random() > 0.05 ? 'healthy' : 'degraded'
            }
        };
    }
    async checkNetworkConnectivity() {
        return {
            connectivity: Math.random() > 0.05 ? 'healthy' : 'unhealthy',
            latency: Math.random() * 100 + 10,
            throughput: Math.random() * 1000 + 100,
            errorRate: Math.random() * 2,
            activeConnections: Math.floor(Math.random() * 100 + 10)
        };
    }
    calculateOverallHealth(moduleHealth, resourceHealth, networkHealth) {
        const healthyModules = moduleHealth.filter(m => m.status === 'healthy').length;
        const totalModules = moduleHealth.length;
        const moduleHealthRatio = healthyModules / totalModules;
        const resourceStatuses = [
            resourceHealth.cpu.status,
            resourceHealth.memory.status,
            resourceHealth.disk.status,
            resourceHealth.network.status
        ];
        const healthyResources = resourceStatuses.filter(s => s === 'healthy').length;
        const resourceHealthRatio = healthyResources / resourceStatuses.length;
        const networkHealthScore = networkHealth.connectivity === 'healthy' ? 1 : 0;
        const overallScore = (moduleHealthRatio * 0.5) + (resourceHealthRatio * 0.3) + (networkHealthScore * 0.2);
        if (overallScore >= 0.9)
            return 'healthy';
        if (overallScore >= 0.7)
            return 'degraded';
        if (overallScore >= 0.5)
            return 'unhealthy';
        return 'critical';
    }
    async validateAlertData(alertData) {
        if (!alertData.title || !alertData.description) {
            throw new Error('Alert title and description are required');
        }
        if (!alertData.source) {
            throw new Error('Alert source is required');
        }
        const validTypes = ['performance', 'error', 'security', 'resource', 'system'];
        if (!validTypes.includes(alertData.alertType)) {
            throw new Error(`Invalid alert type: ${alertData.alertType}`);
        }
    }
    async assessAlertSeverity(alertData) {
        if (alertData.severity) {
            return alertData.severity;
        }
        if (alertData.alertType === 'security') {
            return 'critical';
        }
        if (alertData.alertType === 'system' && alertData.description.includes('down')) {
            return 'critical';
        }
        if (alertData.alertType === 'performance' && alertData.description.includes('timeout')) {
            return 'high';
        }
        return 'medium';
    }
    async processAlert(alertData) {
        const actions = [];
        const notifications = [];
        let escalated = false;
        switch (alertData.severity) {
            case 'critical':
                actions.push('immediate_response', 'escalate_to_admin');
                notifications.push('email', 'sms', 'slack');
                escalated = true;
                break;
            case 'high':
                actions.push('investigate', 'notify_team');
                notifications.push('email', 'slack');
                break;
            case 'medium':
                actions.push('log', 'monitor');
                notifications.push('email');
                break;
            case 'low':
                actions.push('log');
                break;
        }
        return {
            alertId: alertData.alertId,
            processed: true,
            actions,
            notifications,
            escalated,
            resolvedAt: alertData.severity === 'low' ? new Date().toISOString() : undefined
        };
    }
    getReportPeriod(reportType) {
        const now = new Date();
        const endDate = now.toISOString();
        let startDate;
        switch (reportType) {
            case 'daily':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case 'monthly':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
                break;
            default:
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        }
        return { startDate, endDate };
    }
    async collectMonitoringData(_period) {
        const totalWorkflows = await this.coreRepository.count();
        return {
            totalWorkflows,
            successfulWorkflows: Math.floor(totalWorkflows * 0.95),
            failedWorkflows: Math.floor(totalWorkflows * 0.05),
            averageResponseTime: Math.random() * 500 + 100,
            systemUptime: 99.9,
            errorRate: Math.random() * 2
        };
    }
    async analyzeMonitoringTrends(_data) {
        return {
            performanceTrend: 'stable',
            errorTrend: 'stable',
            resourceTrend: 'stable'
        };
    }
    async createMonitoringReport(data, trends, reportType, period) {
        const reportId = `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        return {
            reportId,
            reportType,
            generatedAt: new Date().toISOString(),
            period,
            summary: data,
            trends: trends,
            recommendations: [
                'Consider optimizing resource allocation',
                'Monitor error rates closely',
                'Review performance bottlenecks'
            ],
            alerts: Array.from(this.alerts.values()).slice(-10)
        };
    }
    calculateHealthScore(health) {
        let score = 100;
        const unhealthyModules = health.modules.filter(m => m.status !== 'healthy').length;
        score -= unhealthyModules * 10;
        const resourceStatuses = [
            health.resources.cpu.status,
            health.resources.memory.status,
            health.resources.disk.status,
            health.resources.network.status
        ];
        const unhealthyResources = resourceStatuses.filter(s => s !== 'healthy').length;
        score -= unhealthyResources * 5;
        if (health.network.connectivity !== 'healthy') {
            score -= 15;
        }
        return Math.max(0, score);
    }
}
exports.CoreMonitoringService = CoreMonitoringService;
