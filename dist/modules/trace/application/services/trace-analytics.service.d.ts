/**
 * 追踪分析服务
 *
 * @description 提供追踪数据分析功能，包括性能分析、趋势分析、异常检测
 * @version 1.0.0
 * @layer 应用层 - 服务
 * @pattern 基于统一架构标准的企业级服务实现
 */
import { TracePerformanceAnalysis, TraceTrends, TraceAnomaly, AnalysisReport, AnalysisReportType, ReportParams, RealtimeMetrics, TimeRange, TraceFilters } from '../../types';
import { TraceEntity } from '../../domain/entities/trace.entity';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
/**
 * 分析引擎接口
 */
export interface IAnalyticsEngine {
    analyzePerformance(traces: TraceEntity[]): Promise<TracePerformanceAnalysis>;
    analyzeTrends(traces: TraceEntity[]): Promise<TraceTrends>;
}
/**
 * 异常检测器接口
 */
export interface IAnomalyDetector {
    detectPerformanceAnomalies(traces: TraceEntity[]): Promise<TraceAnomaly[]>;
    detectErrorAnomalies(traces: TraceEntity[]): Promise<TraceAnomaly[]>;
    detectVolumeAnomalies(traces: TraceEntity[]): Promise<TraceAnomaly[]>;
}
/**
 * 追踪分析服务
 *
 * @description 追踪数据分析服务，职责：性能分析、趋势分析、异常检测
 */
export declare class TraceAnalyticsService {
    private readonly traceRepository;
    private readonly _analyticsEngine?;
    private readonly _anomalyDetector?;
    constructor(traceRepository: ITraceRepository, _analyticsEngine?: IAnalyticsEngine, _anomalyDetector?: IAnomalyDetector);
    /**
     * 分析追踪性能
     */
    analyzeTracePerformance(traceId: string): Promise<TracePerformanceAnalysis>;
    /**
     * 分析追踪趋势
     */
    analyzeTraceTrends(timeRange: TimeRange, filters?: TraceFilters): Promise<TraceTrends>;
    /**
     * 检测异常
     */
    detectAnomalies(timeRange: TimeRange): Promise<TraceAnomaly[]>;
    /**
     * 生成分析报告
     */
    generateAnalysisReport(reportType: AnalysisReportType, params: ReportParams): Promise<AnalysisReport>;
    /**
     * 实时性能监控
     */
    getRealtimePerformanceMetrics(contextId?: string): Promise<RealtimeMetrics>;
    private calculateAverageSpanDuration;
    private findSlowestOperations;
    private findFastestOperations;
    private calculateCriticalPath;
    private identifyPerformanceBottlenecks;
    private identifyResourceBottlenecks;
    private generatePerformanceRecommendations;
    private analyzeVolumeTrend;
    private analyzePerformanceTrend;
    private analyzeErrorRateTrend;
    private analyzeDurationTrend;
    private identifyPeakHours;
    private identifyCommonPatterns;
    private detectPerformanceRegression;
    private calculateAverageResponseTime;
    private calculateErrorRate;
    private generateRealtimeAlerts;
    private generatePerformanceReport;
    private generateAvailabilityReport;
    private generateErrorAnalysisReport;
    private generateCapacityPlanningReport;
}
//# sourceMappingURL=trace-analytics.service.d.ts.map