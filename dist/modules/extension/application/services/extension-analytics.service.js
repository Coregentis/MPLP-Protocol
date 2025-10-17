"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionAnalyticsService = void 0;
class ExtensionAnalyticsService {
    extensionRepository;
    metricsCollector;
    analyticsEngine;
    constructor(extensionRepository, metricsCollector, analyticsEngine) {
        this.extensionRepository = extensionRepository;
        this.metricsCollector = metricsCollector;
        this.analyticsEngine = analyticsEngine;
    }
    async collectUsageMetrics(extensionId) {
        const extension = await this.extensionRepository.findById(extensionId);
        if (!extension) {
            throw new Error(`Extension ${extensionId} not found`);
        }
        return await this.metricsCollector.collectUsageMetrics(extensionId);
    }
    async collectPerformanceMetrics(extensionId) {
        const extension = await this.extensionRepository.findById(extensionId);
        if (!extension) {
            throw new Error(`Extension ${extensionId} not found`);
        }
        return await this.metricsCollector.collectPerformanceMetrics(extensionId);
    }
    async collectHealthMetrics(extensionId) {
        const extension = await this.extensionRepository.findById(extensionId);
        if (!extension) {
            throw new Error(`Extension ${extensionId} not found`);
        }
        return await this.metricsCollector.collectHealthMetrics(extensionId);
    }
    async analyzeUsagePatterns(extensionIds) {
        const usageMetrics = [];
        for (const extensionId of extensionIds) {
            try {
                const metrics = await this.collectUsageMetrics(extensionId);
                usageMetrics.push(metrics);
            }
            catch (error) {
                console.warn(`Failed to collect usage metrics for extension ${extensionId}:`, error);
            }
        }
        return await this.analyticsEngine.analyzeUsagePatterns(usageMetrics);
    }
    async analyzePerformanceTrends(extensionIds) {
        const performanceMetrics = [];
        for (const extensionId of extensionIds) {
            try {
                const metrics = await this.collectPerformanceMetrics(extensionId);
                performanceMetrics.push(metrics);
            }
            catch (error) {
                console.warn(`Failed to collect performance metrics for extension ${extensionId}:`, error);
            }
        }
        return await this.analyticsEngine.analyzePerformanceTrends(performanceMetrics);
    }
    async detectAnomalies(extensionIds) {
        const healthMetrics = [];
        for (const extensionId of extensionIds) {
            try {
                const metrics = await this.collectHealthMetrics(extensionId);
                healthMetrics.push(metrics);
            }
            catch (error) {
                console.warn(`Failed to collect health metrics for extension ${extensionId}:`, error);
            }
        }
        return await this.analyticsEngine.detectAnomalies(healthMetrics);
    }
    async generateReport(request) {
        const reportId = this.generateReportId();
        const generatedAt = new Date().toISOString();
        let extensionIds = request.extensionIds;
        if (!extensionIds) {
            const allExtensions = await this.extensionRepository.findByFilter({
                status: ['active']
            });
            extensionIds = allExtensions.extensions.map((ext) => ext.extensionId);
        }
        if (!extensionIds || extensionIds.length === 0) {
            extensionIds = [];
        }
        let usageAnalysis;
        let performanceAnalysis;
        let anomalyDetection;
        if (request.reportType === 'usage' || request.reportType === 'comprehensive') {
            usageAnalysis = await this.analyzeUsagePatterns(extensionIds);
        }
        if (request.reportType === 'performance' || request.reportType === 'comprehensive') {
            performanceAnalysis = await this.analyzePerformanceTrends(extensionIds);
        }
        if (request.reportType === 'health' || request.reportType === 'comprehensive') {
            anomalyDetection = await this.detectAnomalies(extensionIds);
        }
        const summary = await this.generateSummary(extensionIds, usageAnalysis, performanceAnalysis, anomalyDetection);
        const extensionRankings = await this.generateExtensionRankings(extensionIds, usageAnalysis, performanceAnalysis);
        return {
            reportId,
            reportType: request.reportType,
            generatedAt,
            timeRange: request.timeRange,
            summary,
            details: {
                usageAnalysis: usageAnalysis || {},
                performanceAnalysis: performanceAnalysis || {},
                anomalyDetection: anomalyDetection || {},
                extensionRankings
            },
            recommendations: await this.generateRecommendations(usageAnalysis, performanceAnalysis, anomalyDetection)
        };
    }
    generateReportId() {
        return `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    async generateSummary(extensionIds, _usageAnalysis, performanceAnalysis, anomalyDetection) {
        const activeExtensions = await this.extensionRepository.findByFilter({
            status: ['active']
        });
        return {
            totalExtensions: extensionIds.length,
            activeExtensions: activeExtensions.extensions.length,
            averagePerformance: performanceAnalysis?.averageResponseTime || 0,
            overallHealth: this.calculateOverallHealth(anomalyDetection),
            criticalIssues: anomalyDetection?.anomalies.filter(a => a.severity === 'critical').length || 0
        };
    }
    async generateExtensionRankings(extensionIds, _usageAnalysis, _performanceAnalysis) {
        const rankings = [];
        for (let i = 0; i < extensionIds.length; i++) {
            const extensionId = extensionIds[i];
            const extension = await this.extensionRepository.findById(extensionId);
            if (extension) {
                rankings.push({
                    extensionId,
                    name: extension.name,
                    rank: i + 1,
                    score: Math.random() * 100,
                    category: 'performance'
                });
            }
        }
        return rankings.sort((a, b) => b.score - a.score);
    }
    async generateRecommendations(usageAnalysis, performanceAnalysis, anomalyDetection) {
        const recommendations = [];
        if (performanceAnalysis && performanceAnalysis.errorRate > 0.05) {
            recommendations.push('考虑优化扩展性能以降低错误率');
        }
        if (anomalyDetection && anomalyDetection.riskLevel === 'high') {
            recommendations.push('发现高风险异常，建议立即检查相关扩展');
        }
        if (usageAnalysis && usageAnalysis.userEngagement < 0.3) {
            recommendations.push('用户参与度较低，建议改进扩展用户体验');
        }
        return recommendations;
    }
    calculateOverallHealth(anomalyDetection) {
        if (!anomalyDetection)
            return 100;
        const criticalCount = anomalyDetection.anomalies.filter(a => a.severity === 'critical').length;
        const highCount = anomalyDetection.anomalies.filter(a => a.severity === 'high').length;
        const mediumCount = anomalyDetection.anomalies.filter(a => a.severity === 'medium').length;
        const healthScore = 100 - (criticalCount * 30 + highCount * 20 + mediumCount * 10);
        return Math.max(0, healthScore);
    }
}
exports.ExtensionAnalyticsService = ExtensionAnalyticsService;
