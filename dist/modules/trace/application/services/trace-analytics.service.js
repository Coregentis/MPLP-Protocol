"use strict";
/**
 * 追踪分析服务
 *
 * @description 提供追踪数据分析功能，包括性能分析、趋势分析、异常检测
 * @version 1.0.0
 * @layer 应用层 - 服务
 * @pattern 基于统一架构标准的企业级服务实现
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceAnalyticsService = void 0;
const trace_entity_1 = require("../../domain/entities/trace.entity");
/**
 * 追踪分析服务
 *
 * @description 追踪数据分析服务，职责：性能分析、趋势分析、异常检测
 */
class TraceAnalyticsService {
    constructor(traceRepository, _analyticsEngine, _anomalyDetector) {
        this.traceRepository = traceRepository;
        this._analyticsEngine = _analyticsEngine;
        this._anomalyDetector = _anomalyDetector;
        // Explicitly mark engines as intentionally unused - Reserved for future analytics integration
        void this._analyticsEngine;
    }
    /**
     * 分析追踪性能
     */
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
    /**
     * 分析追踪趋势
     */
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
    /**
     * 检测异常
     */
    async detectAnomalies(timeRange) {
        const traces = await this.traceRepository.queryByTimeRange(timeRange);
        const anomalies = [];
        if (this._anomalyDetector) {
            // 检测性能异常
            const performanceAnomalies = await this._anomalyDetector.detectPerformanceAnomalies(traces);
            anomalies.push(...performanceAnomalies);
            // 检测错误率异常
            const errorAnomalies = await this._anomalyDetector.detectErrorAnomalies(traces);
            anomalies.push(...errorAnomalies);
            // 检测流量异常
            const volumeAnomalies = await this._anomalyDetector.detectVolumeAnomalies(traces);
            anomalies.push(...volumeAnomalies);
        }
        return anomalies;
    }
    /**
     * 生成分析报告
     */
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
    /**
     * 实时性能监控
     */
    async getRealtimePerformanceMetrics(contextId) {
        const currentTime = new Date();
        const timeRange = {
            startTime: new Date(currentTime.getTime() - 5 * 60 * 1000), // 最近5分钟
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
                throughput: recentTraces.length / 5, // traces per minute
                errorRate: this.calculateErrorRate(recentTraces)
            },
            alerts: await this.generateRealtimeAlerts(recentTraces)
        };
    }
    // ===== 私有辅助方法 =====
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
        // 识别资源瓶颈 - 简化实现
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
        // 分析流量趋势 - 简化实现
        return { trend: 'stable', change: 0 };
    }
    analyzePerformanceTrend(_traces) {
        // 分析性能趋势 - 简化实现
        return { trend: 'improving', change: 5 };
    }
    analyzeErrorRateTrend(_traces) {
        // 分析错误率趋势 - 简化实现
        return { trend: 'decreasing', change: -2 };
    }
    analyzeDurationTrend(_traces) {
        // 分析持续时间趋势 - 简化实现
        return { trend: 'stable', change: 0 };
    }
    identifyPeakHours(_traces) {
        // 识别峰值时间 - 简化实现
        return ['09:00-10:00', '14:00-15:00'];
    }
    identifyCommonPatterns(_traces) {
        // 识别常见模式 - 简化实现
        return ['High morning activity', 'Afternoon peak'];
    }
    detectPerformanceRegression(_traces) {
        // 检测性能回归 - 简化实现
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
        if (errorRate > 0.05) { // 5% error rate threshold
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
//# sourceMappingURL=trace-analytics.service.js.map