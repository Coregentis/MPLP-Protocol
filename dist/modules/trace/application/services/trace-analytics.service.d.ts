import { TracePerformanceAnalysis, TraceTrends, TraceAnomaly, AnalysisReport, AnalysisReportType, ReportParams, RealtimeMetrics, TimeRange, TraceFilters } from '../../types';
import { TraceEntity } from '../../domain/entities/trace.entity';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
export interface IAnalyticsEngine {
    analyzePerformance(traces: TraceEntity[]): Promise<TracePerformanceAnalysis>;
    analyzeTrends(traces: TraceEntity[]): Promise<TraceTrends>;
}
export interface IAnomalyDetector {
    detectPerformanceAnomalies(traces: TraceEntity[]): Promise<TraceAnomaly[]>;
    detectErrorAnomalies(traces: TraceEntity[]): Promise<TraceAnomaly[]>;
    detectVolumeAnomalies(traces: TraceEntity[]): Promise<TraceAnomaly[]>;
}
export declare class TraceAnalyticsService {
    private readonly traceRepository;
    private readonly _analyticsEngine?;
    private readonly _anomalyDetector?;
    constructor(traceRepository: ITraceRepository, _analyticsEngine?: IAnalyticsEngine | undefined, _anomalyDetector?: IAnomalyDetector | undefined);
    analyzeTracePerformance(traceId: string): Promise<TracePerformanceAnalysis>;
    analyzeTraceTrends(timeRange: TimeRange, filters?: TraceFilters): Promise<TraceTrends>;
    detectAnomalies(timeRange: TimeRange): Promise<TraceAnomaly[]>;
    generateAnalysisReport(reportType: AnalysisReportType, params: ReportParams): Promise<AnalysisReport>;
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