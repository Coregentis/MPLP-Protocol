"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabMonitoringService = void 0;
class CollabMonitoringService {
    collabRepository;
    alertThresholds;
    monitoringMetrics = new Map();
    constructor(collabRepository, alertThresholds) {
        this.collabRepository = collabRepository;
        this.alertThresholds = {
            participantUtilizationMin: 0.7,
            coordinationEfficiencyMin: 0.6,
            decisionMakingSpeedMin: 0.5,
            taskCompletionRateMin: 0.8,
            qualityScoreMin: 0.75,
            responseTimeMax: 5000,
            errorRateMax: 0.05,
            ...alertThresholds
        };
    }
    async startMonitoring(collaborationId) {
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        const metrics = {
            collaborationId,
            startTime: new Date(),
            lastUpdate: new Date(),
            status: 'active',
            alerts: [],
            performanceMetrics: {
                participantUtilization: 0,
                coordinationEfficiency: 0,
                decisionMakingSpeed: 0,
                taskCompletionRate: 0,
                qualityScore: 0,
                responseTime: 0,
                errorRate: 0,
                throughput: 0
            },
            healthChecks: {
                participantHealth: 'healthy',
                coordinationHealth: 'healthy',
                performanceHealth: 'healthy',
                systemHealth: 'healthy'
            }
        };
        this.monitoringMetrics.set(collaborationId, metrics);
        this.schedulePeriodicCheck(collaborationId);
    }
    async stopMonitoring(collaborationId) {
        const metrics = this.monitoringMetrics.get(collaborationId);
        if (metrics) {
            metrics.status = 'stopped';
            metrics.lastUpdate = new Date();
        }
    }
    async getMonitoringStatus(collaborationId) {
        const metrics = this.monitoringMetrics.get(collaborationId);
        if (!metrics) {
            throw new Error('Collaboration is not being monitored');
        }
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        await this.updateMetrics(collaboration, metrics);
        return {
            collaborationId,
            monitoringStatus: metrics.status,
            lastUpdate: metrics.lastUpdate,
            overallHealth: this.calculateOverallHealth(metrics),
            activeAlerts: metrics.alerts.filter(alert => alert.status === 'active'),
            performanceMetrics: metrics.performanceMetrics,
            healthChecks: metrics.healthChecks,
            uptime: this.calculateUptime(metrics),
            recommendations: this.generateMonitoringRecommendations(metrics)
        };
    }
    async getActiveAlerts(collaborationId) {
        if (collaborationId) {
            const metrics = this.monitoringMetrics.get(collaborationId);
            return metrics?.alerts.filter(alert => alert.status === 'active') || [];
        }
        const allAlerts = [];
        for (const metrics of this.monitoringMetrics.values()) {
            allAlerts.push(...metrics.alerts.filter(alert => alert.status === 'active'));
        }
        return allAlerts;
    }
    async acknowledgeAlert(collaborationId, alertId, acknowledgedBy) {
        const metrics = this.monitoringMetrics.get(collaborationId);
        if (!metrics) {
            throw new Error('Collaboration is not being monitored');
        }
        const alert = metrics.alerts.find(a => a.id === alertId);
        if (!alert) {
            throw new Error('Alert not found');
        }
        alert.status = 'acknowledged';
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date();
    }
    async resolveAlert(collaborationId, alertId, resolvedBy, resolution) {
        const metrics = this.monitoringMetrics.get(collaborationId);
        if (!metrics) {
            throw new Error('Collaboration is not being monitored');
        }
        const alert = metrics.alerts.find(a => a.id === alertId);
        if (!alert) {
            throw new Error('Alert not found');
        }
        alert.status = 'resolved';
        alert.resolvedBy = resolvedBy;
        alert.resolvedAt = new Date();
        alert.resolution = resolution;
    }
    async generateDashboard() {
        const allMetrics = Array.from(this.monitoringMetrics.values());
        const activeCollaborations = allMetrics.filter(m => m.status === 'active');
        return {
            summary: {
                totalCollaborations: allMetrics.length,
                activeCollaborations: activeCollaborations.length,
                totalAlerts: allMetrics.reduce((sum, m) => sum + m.alerts.length, 0),
                activeAlerts: allMetrics.reduce((sum, m) => sum + m.alerts.filter(a => a.status === 'active').length, 0),
                averageHealth: this.calculateAverageHealth(activeCollaborations)
            },
            healthOverview: {
                healthy: activeCollaborations.filter(m => this.calculateOverallHealth(m) === 'healthy').length,
                warning: activeCollaborations.filter(m => this.calculateOverallHealth(m) === 'warning').length,
                critical: activeCollaborations.filter(m => this.calculateOverallHealth(m) === 'critical').length
            },
            performanceOverview: {
                averageParticipantUtilization: this.calculateAverageMetric(activeCollaborations, 'participantUtilization'),
                averageCoordinationEfficiency: this.calculateAverageMetric(activeCollaborations, 'coordinationEfficiency'),
                averageResponseTime: this.calculateAverageMetric(activeCollaborations, 'responseTime'),
                averageErrorRate: this.calculateAverageMetric(activeCollaborations, 'errorRate')
            },
            recentAlerts: this.getRecentAlerts(allMetrics, 10),
            topIssues: this.identifyTopIssues(allMetrics)
        };
    }
    async updateMetrics(collaboration, metrics) {
        metrics.performanceMetrics.participantUtilization =
            collaboration.getActiveParticipants().length / collaboration.participants.length;
        metrics.performanceMetrics.coordinationEfficiency = this.calculateCoordinationEfficiency(collaboration);
        metrics.performanceMetrics.decisionMakingSpeed = this.estimateDecisionMakingSpeed(collaboration);
        metrics.performanceMetrics.taskCompletionRate = 0.85;
        metrics.performanceMetrics.qualityScore = 0.88;
        metrics.performanceMetrics.responseTime = Math.random() * 3000;
        metrics.performanceMetrics.errorRate = Math.random() * 0.02;
        metrics.performanceMetrics.throughput = Math.random() * 100;
        metrics.healthChecks.participantHealth =
            metrics.performanceMetrics.participantUtilization >= this.alertThresholds.participantUtilizationMin ? 'healthy' : 'warning';
        metrics.healthChecks.coordinationHealth =
            metrics.performanceMetrics.coordinationEfficiency >= this.alertThresholds.coordinationEfficiencyMin ? 'healthy' : 'warning';
        metrics.healthChecks.performanceHealth =
            metrics.performanceMetrics.responseTime <= this.alertThresholds.responseTimeMax ? 'healthy' : 'warning';
        metrics.healthChecks.systemHealth =
            metrics.performanceMetrics.errorRate <= this.alertThresholds.errorRateMax ? 'healthy' : 'critical';
        await this.checkAlertConditions(collaboration, metrics);
        metrics.lastUpdate = new Date();
    }
    async checkAlertConditions(collaboration, metrics) {
        const now = new Date();
        if (metrics.performanceMetrics.participantUtilization < this.alertThresholds.participantUtilizationMin) {
            this.createAlert(metrics, {
                type: 'participant_utilization',
                severity: 'warning',
                title: 'Low Participant Utilization',
                description: `Participant utilization (${(metrics.performanceMetrics.participantUtilization * 100).toFixed(1)}%) is below threshold`,
                threshold: this.alertThresholds.participantUtilizationMin,
                currentValue: metrics.performanceMetrics.participantUtilization,
                createdAt: now
            });
        }
        if (metrics.performanceMetrics.coordinationEfficiency < this.alertThresholds.coordinationEfficiencyMin) {
            this.createAlert(metrics, {
                type: 'coordination_efficiency',
                severity: 'warning',
                title: 'Low Coordination Efficiency',
                description: `Coordination efficiency (${(metrics.performanceMetrics.coordinationEfficiency * 100).toFixed(1)}%) is below threshold`,
                threshold: this.alertThresholds.coordinationEfficiencyMin,
                currentValue: metrics.performanceMetrics.coordinationEfficiency,
                createdAt: now
            });
        }
        if (metrics.performanceMetrics.responseTime > this.alertThresholds.responseTimeMax) {
            this.createAlert(metrics, {
                type: 'response_time',
                severity: 'critical',
                title: 'High Response Time',
                description: `Response time (${metrics.performanceMetrics.responseTime.toFixed(0)}ms) exceeds threshold`,
                threshold: this.alertThresholds.responseTimeMax,
                currentValue: metrics.performanceMetrics.responseTime,
                createdAt: now
            });
        }
        if (metrics.performanceMetrics.errorRate > this.alertThresholds.errorRateMax) {
            this.createAlert(metrics, {
                type: 'error_rate',
                severity: 'critical',
                title: 'High Error Rate',
                description: `Error rate (${(metrics.performanceMetrics.errorRate * 100).toFixed(2)}%) exceeds threshold`,
                threshold: this.alertThresholds.errorRateMax,
                currentValue: metrics.performanceMetrics.errorRate,
                createdAt: now
            });
        }
    }
    createAlert(metrics, alertData) {
        const existingAlert = metrics.alerts.find(alert => alert.type === alertData.type && alert.status === 'active');
        if (existingAlert) {
            existingAlert.currentValue = alertData.currentValue;
            existingAlert.lastOccurrence = new Date();
            existingAlert.occurrenceCount = (existingAlert.occurrenceCount || 1) + 1;
        }
        else {
            const newAlert = {
                id: this.generateAlertId(),
                collaborationId: metrics.collaborationId,
                type: alertData.type || 'unknown',
                severity: alertData.severity || 'warning',
                status: 'active',
                title: alertData.title || 'Alert',
                description: alertData.description || '',
                threshold: alertData.threshold,
                currentValue: alertData.currentValue,
                createdAt: alertData.createdAt || new Date(),
                lastOccurrence: new Date(),
                occurrenceCount: 1
            };
            metrics.alerts.push(newAlert);
        }
    }
    schedulePeriodicCheck(_collaborationId) {
    }
    calculateOverallHealth(metrics) {
        const healthChecks = Object.values(metrics.healthChecks);
        if (healthChecks.includes('critical'))
            return 'critical';
        if (healthChecks.includes('warning'))
            return 'warning';
        return 'healthy';
    }
    calculateUptime(metrics) {
        const now = new Date();
        const startTime = metrics.startTime;
        return now.getTime() - startTime.getTime();
    }
    generateMonitoringRecommendations(metrics) {
        const recommendations = [];
        if (metrics.performanceMetrics.participantUtilization < 0.7) {
            recommendations.push('Consider reviewing participant engagement strategies');
        }
        if (metrics.performanceMetrics.responseTime > 3000) {
            recommendations.push('Investigate performance bottlenecks');
        }
        if (metrics.alerts.filter(a => a.status === 'active').length > 5) {
            recommendations.push('Review and resolve active alerts to improve system health');
        }
        return recommendations;
    }
    calculateCoordinationEfficiency(collaboration) {
        const strategy = collaboration.coordinationStrategy;
        const participantCount = collaboration.participants.length;
        let efficiency = 1.0;
        if (strategy.type === 'peer_to_peer' && participantCount > 5) {
            efficiency *= 0.7;
        }
        if (strategy.type === 'centralized' && !strategy.coordinatorId) {
            efficiency *= 0.4;
        }
        return Math.max(0, Math.min(1, efficiency));
    }
    estimateDecisionMakingSpeed(collaboration) {
        const strategy = collaboration.coordinationStrategy;
        const participantCount = collaboration.participants.length;
        let speed = 1.0;
        if (strategy.decisionMaking === 'consensus' && participantCount > 5) {
            speed *= 0.6;
        }
        else if (strategy.decisionMaking === 'coordinator') {
            speed *= 1.2;
        }
        return Math.max(0, Math.min(1, speed));
    }
    calculateAverageHealth(metrics) {
        if (metrics.length === 0)
            return 0;
        const healthScores = metrics.map(m => {
            const health = this.calculateOverallHealth(m);
            switch (health) {
                case 'healthy': return 100;
                case 'warning': return 60;
                case 'critical': return 20;
                default: return 0;
            }
        });
        return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
    }
    calculateAverageMetric(metrics, metricName) {
        if (metrics.length === 0)
            return 0;
        const values = metrics.map(m => m.performanceMetrics[metricName]);
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    getRecentAlerts(metrics, limit) {
        const allAlerts = metrics.flatMap(m => m.alerts);
        return allAlerts
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }
    identifyTopIssues(metrics) {
        const issueCount = new Map();
        metrics.forEach(m => {
            m.alerts.forEach(alert => {
                const count = issueCount.get(alert.type) || 0;
                issueCount.set(alert.type, count + 1);
            });
        });
        return Array.from(issueCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type]) => type);
    }
    generateAlertId() {
        return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.CollabMonitoringService = CollabMonitoringService;
