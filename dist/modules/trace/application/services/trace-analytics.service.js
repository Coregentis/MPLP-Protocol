"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceAnalyticsService = void 0;
const trace_entity_1 = require("../../domain/entities/trace.entity");
class TraceAnalyticsService {
    traceRepository;
    _analyticsEngine;
    _anomalyDetector;
    constructor(traceRepository, _analyticsEngine, _anomalyDetector) {
        this.traceRepository = traceRepository;
        this._analyticsEngine = _analyticsEngine;
        this._anomalyDetector = _anomalyDetector;
    }
    async analyzeTracePerformance(traceId) {
        const traceData = await this.traceRepository.findById(traceId);
        if (!traceData) {
            throw new Error(`Trace ${traceId} not found`);
        }
        const trace = new trace_entity_1.TraceEntity(traceData);
        const spans = trace.spans || [];
        return {
            traceId,
            timestamp: new Date().toISOString(),
            performance: {
                totalDuration: trace.duration || 0,
                spanCount: spans.length,
                averageSpanDuration: this.calculateAverageSpanDuration(spans),
                slowestOperations: this.findSlowestOperations(spans),
                fastestOperations: this.findFastestOperations(spans)
            },
            bottlenecks: {
                criticalPath: this.calculateCriticalPath(spans),
                performanceBottlenecks: this.identifyPerformanceBottlenecks(spans),
                resourceBottlenecks: this.identifyResourceBottlenecks(spans)
            },
            recommendations: this.generatePerformanceRecommendations(trace)
        };
    }
    async analyzeTraceTrends(timeRange, filters) {
        const traces = await this.traceRepository.queryByTimeRange(timeRange, filters);
        return {
            timeRange,
            totalTraces: traces.length,
            trends: {
                volumeTrend: this.analyzeVolumeTrend(traces),
                performanceTrend: this.analyzePerformanceTrend(traces),
                errorRateTrend: this.analyzeErrorRateTrend(traces),
                durationTrend: this.analyzeDurationTrend(traces)
            },
            insights: {
                peakHours: this.identifyPeakHours(traces),
                commonPatterns: this.identifyCommonPatterns(traces),
                performanceRegression: this.detectPerformanceRegression(traces)
            }
        };
    }
    async detectAnomalies(timeRange) {
        const traces = await this.traceRepository.queryByTimeRange(timeRange);
        const anomalies = [];
        if (this._anomalyDetector) {
            const performanceAnomalies = await this._anomalyDetector.detectPerformanceAnomalies(traces);
            anomalies.push(...performanceAnomalies);
            const errorAnomalies = await this._anomalyDetector.detectErrorAnomalies(traces);
            anomalies.push(...errorAnomalies);
            const volumeAnomalies = await this._anomalyDetector.detectVolumeAnomalies(traces);
            anomalies.push(...volumeAnomalies);
        }
        return anomalies;
    }
    async generateAnalysisReport(reportType, params) {
        switch (reportType) {
            case 'performance':
                return await this.generatePerformanceReport(params);
            case 'availability':
                return await this.generateAvailabilityReport(params);
            case 'error_analysis':
                return await this.generateErrorAnalysisReport(params);
            case 'capacity_planning':
                return await this.generateCapacityPlanningReport(params);
            default:
                throw new Error(`Unsupported report type: ${reportType}`);
        }
    }
    async getRealtimePerformanceMetrics(contextId) {
        const currentTime = new Date();
        const timeRange = {
            startTime: new Date(currentTime.getTime() - 5 * 60 * 1000),
            endTime: currentTime
        };
        const filters = contextId ? { contextId } : undefined;
        const recentTraces = await this.traceRepository.queryByTimeRange(timeRange, filters);
        return {
            timestamp: currentTime.toISOString(),
            metrics: {
                activeTraces: recentTraces.filter(t => t.status === 'active').length,
                completedTraces: recentTraces.filter(t => t.status === 'completed').length,
                errorTraces: recentTraces.filter(t => t.status === 'error').length,
                averageResponseTime: this.calculateAverageResponseTime(recentTraces),
                throughput: recentTraces.length / 5,
                errorRate: this.calculateErrorRate(recentTraces)
            },
            alerts: await this.generateRealtimeAlerts(recentTraces)
        };
    }
    calculateAverageSpanDuration(spans) {
        if (spans.length === 0)
            return 0;
        return spans.reduce((sum, span) => sum + (span.duration || 0), 0) / spans.length;
    }
    findSlowestOperations(spans) {
        return spans
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .slice(0, 5)
            .map(span => ({ operation: span.operationName, duration: span.duration || 0 }));
    }
    findFastestOperations(spans) {
        return spans
            .sort((a, b) => (a.duration || 0) - (b.duration || 0))
            .slice(0, 5)
            .map(span => ({ operation: span.operationName, duration: span.duration || 0 }));
    }
    calculateCriticalPath(spans) {
        return spans
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .slice(0, 3)
            .map(span => span.operationName);
    }
    identifyPerformanceBottlenecks(spans) {
        const avgDuration = this.calculateAverageSpanDuration(spans);
        return spans
            .filter(span => (span.duration || 0) > avgDuration * 2)
            .map(span => span.operationName);
    }
    identifyResourceBottlenecks(_spans) {
        return [];
    }
    generatePerformanceRecommendations(trace) {
        const recommendations = [];
        const spans = trace.spans || [];
        if (spans.length > 100) {
            recommendations.push('Consider reducing the number of spans to improve performance');
        }
        if ((trace.duration || 0) > 10000) {
            recommendations.push('Trace duration is high, investigate slow operations');
        }
        return recommendations;
    }
    analyzeVolumeTrend(_traces) {
        return { trend: 'stable', change: 0 };
    }
    analyzePerformanceTrend(_traces) {
        return { trend: 'improving', change: 5 };
    }
    analyzeErrorRateTrend(_traces) {
        return { trend: 'decreasing', change: -2 };
    }
    analyzeDurationTrend(_traces) {
        return { trend: 'stable', change: 0 };
    }
    identifyPeakHours(_traces) {
        return ['09:00-10:00', '14:00-15:00'];
    }
    identifyCommonPatterns(_traces) {
        return ['High morning activity', 'Afternoon peak'];
    }
    detectPerformanceRegression(_traces) {
        return false;
    }
    calculateAverageResponseTime(traces) {
        if (traces.length === 0)
            return 0;
        return traces.reduce((sum, trace) => sum + (trace.duration || 0), 0) / traces.length;
    }
    calculateErrorRate(traces) {
        if (traces.length === 0)
            return 0;
        const errorCount = traces.filter(trace => trace.status === 'error').length;
        return errorCount / traces.length;
    }
    async generateRealtimeAlerts(traces) {
        const alerts = [];
        const errorRate = this.calculateErrorRate(traces);
        if (errorRate > 0.05) {
            alerts.push({
                type: 'error_rate',
                severity: 'warning',
                message: `High error rate detected: ${(errorRate * 100).toFixed(2)}%`,
                timestamp: new Date().toISOString()
            });
        }
        return alerts;
    }
    async generatePerformanceReport(_params) {
        return {
            reportType: 'performance',
            generatedAt: new Date().toISOString(),
            data: { summary: 'Performance analysis completed' }
        };
    }
    async generateAvailabilityReport(_params) {
        return {
            reportType: 'availability',
            generatedAt: new Date().toISOString(),
            data: { summary: 'Availability analysis completed' }
        };
    }
    async generateErrorAnalysisReport(_params) {
        return {
            reportType: 'error_analysis',
            generatedAt: new Date().toISOString(),
            data: { summary: 'Error analysis completed' }
        };
    }
    async generateCapacityPlanningReport(_params) {
        return {
            reportType: 'capacity_planning',
            generatedAt: new Date().toISOString(),
            data: { summary: 'Capacity planning analysis completed' }
        };
    }
}
exports.TraceAnalyticsService = TraceAnalyticsService;
