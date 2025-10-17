import { IAnalyticsEngine, PredictionResult, PatternAnalysisResult, AnalyticsInsight, MetricsResult } from '../../types';
export declare class AnalyticsEngine implements IAnalyticsEngine {
    private models;
    private patterns;
    constructor();
    predict(features: Record<string, unknown>, modelType: string): Promise<PredictionResult>;
    analyzePatterns(data: unknown[]): Promise<PatternAnalysisResult>;
    generateInsights(data: unknown[]): Promise<AnalyticsInsight[]>;
    calculateMetrics(data: unknown[]): Promise<MetricsResult>;
    private initializeModels;
    private initializePatterns;
    private preprocessFeatures;
    private executePrediction;
    private executeClassification;
    private executeRegression;
    private calculateConfidence;
    private identifyFactors;
    private analyzeFrequencyPatterns;
    private analyzeTimePatterns;
    private analyzeCorrelationPatterns;
    private generateTrendInsights;
    private generateAnomalyInsights;
    private generatePerformanceInsights;
    private generateRecommendationInsights;
    private extractNumericValues;
    private calculateMedian;
    private calculateStandardDeviation;
    private analyzeDataTypes;
    private calculateDistribution;
}
//# sourceMappingURL=analytics.engine.d.ts.map