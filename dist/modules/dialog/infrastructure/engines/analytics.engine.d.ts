/**
 * Analytics Engine Implementation
 * @description 分析引擎实现 - 按指南第430行要求
 * @version 1.0.0
 */
import { IAnalyticsEngine, PredictionResult, PatternAnalysisResult, AnalyticsInsight, MetricsResult } from '../../types';
/**
 * 分析引擎实现
 * 职责：数据分析、模式识别、预测分析、指标计算
 */
export declare class AnalyticsEngine implements IAnalyticsEngine {
    private models;
    private patterns;
    constructor();
    /**
     * 执行预测
     * @param features 特征数据
     * @param modelType 模型类型
     * @returns 预测结果
     */
    predict(features: Record<string, unknown>, modelType: string): Promise<PredictionResult>;
    /**
     * 分析模式
     * @param data 数据数组
     * @returns 模式分析结果
     */
    analyzePatterns(data: unknown[]): Promise<PatternAnalysisResult>;
    /**
     * 生成洞察
     * @param data 数据数组
     * @returns 分析洞察
     */
    generateInsights(data: unknown[]): Promise<AnalyticsInsight[]>;
    /**
     * 计算指标
     * @param data 数据数组
     * @returns 指标结果
     */
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