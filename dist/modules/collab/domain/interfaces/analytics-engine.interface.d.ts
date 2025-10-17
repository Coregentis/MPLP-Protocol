import { UUID } from '../../../../shared/types';
export type AnalyticsModelType = 'collaboration_outcome' | 'performance_prediction' | 'risk_assessment' | 'resource_optimization' | 'member_engagement' | 'task_completion' | 'pattern_recognition' | 'anomaly_detection';
export interface PredictionResult {
    modelType: AnalyticsModelType;
    predictionId: UUID;
    timestamp: Date;
    confidence: number;
    successProbability?: number;
    expectedDuration?: number;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    positiveFactors: string[];
    negativeFactors: string[];
    criticalFactors: string[];
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface AnalysisResult {
    analysisId: UUID;
    analysisType: string;
    timestamp: Date;
    dataPoints: number;
    insights: Array<{
        category: string;
        insight: string;
        confidence: number;
        impact: 'low' | 'medium' | 'high';
        actionable: boolean;
    }>;
    patterns: Array<{
        patternId: UUID;
        patternType: string;
        description: string;
        frequency: number;
        significance: number;
    }>;
    anomalies: Array<{
        anomalyId: UUID;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        detectedAt: Date;
        affectedEntities: UUID[];
    }>;
    metrics: Record<string, number>;
    recommendations: string[];
    metadata: Record<string, unknown>;
}
export interface FeatureSet {
    featureSetId: UUID;
    entityId: UUID;
    entityType: string;
    extractedAt: Date;
    features: Record<string, number | string | boolean>;
    featureMetadata: Record<string, {
        type: 'numerical' | 'categorical' | 'boolean' | 'text';
        importance: number;
        description: string;
    }>;
    qualityScore: number;
    completeness: number;
}
export interface TrainingData {
    datasetId: UUID;
    modelType: AnalyticsModelType;
    features: FeatureSet[];
    labels: Array<{
        entityId: UUID;
        label: string | number | boolean;
        confidence: number;
    }>;
    metadata: {
        datasetSize: number;
        featureCount: number;
        labelDistribution: Record<string, number>;
        qualityMetrics: Record<string, number>;
    };
}
export interface ModelPerformance {
    modelId: UUID;
    modelType: AnalyticsModelType;
    version: string;
    evaluatedAt: Date;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc?: number;
    confusionMatrix?: number[][];
    featureImportance: Record<string, number>;
    crossValidationScores: number[];
    testSetPerformance: {
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
    };
    metadata: Record<string, unknown>;
}
export interface IAnalyticsEngine {
    predict(features: Record<string, unknown>, modelType: AnalyticsModelType, options?: {
        modelVersion?: string;
        confidenceThreshold?: number;
        includeExplanation?: boolean;
    }): Promise<PredictionResult>;
    analyze(data: Record<string, unknown>[], analysisType: string, options?: {
        includePatterns?: boolean;
        includeAnomalies?: boolean;
        includeRecommendations?: boolean;
        timeWindow?: {
            startTime: Date;
            endTime: Date;
        };
    }): Promise<AnalysisResult>;
    extractFeatures(entityId: UUID, entityType: string, entityData: Record<string, unknown>): Promise<FeatureSet>;
    trainModel(trainingData: TrainingData, modelType: AnalyticsModelType, options?: {
        validationSplit?: number;
        epochs?: number;
        learningRate?: number;
        regularization?: number;
        hyperparameters?: Record<string, unknown>;
    }): Promise<string>;
    evaluateModel(modelId: string, testData: TrainingData): Promise<ModelPerformance>;
    getModelInfo(modelId: string): Promise<ModelInfo>;
    listModels(modelType?: AnalyticsModelType): Promise<ModelInfo[]>;
    deleteModel(modelId: string): Promise<void>;
    detectPatterns(data: Record<string, unknown>[], patternTypes?: string[]): Promise<PatternDetectionResult>;
    detectAnomalies(data: Record<string, unknown>[], sensitivity?: 'low' | 'medium' | 'high'): Promise<AnomalyDetectionResult>;
    generateInsights(analysisResults: AnalysisResult[], context?: Record<string, unknown>): Promise<InsightGenerationResult>;
    getStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<AnalyticsStatistics>;
}
export interface ModelInfo {
    modelId: string;
    modelType: AnalyticsModelType;
    version: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    status: 'training' | 'ready' | 'deprecated' | 'failed';
    performance: ModelPerformance;
    trainingDataSize: number;
    featureCount: number;
    metadata: Record<string, unknown>;
}
export interface PatternDetectionResult {
    detectionId: UUID;
    timestamp: Date;
    patternsFound: number;
    patterns: Array<{
        patternId: UUID;
        patternType: string;
        description: string;
        frequency: number;
        significance: number;
        examples: Record<string, unknown>[];
    }>;
    metadata: Record<string, unknown>;
}
export interface AnomalyDetectionResult {
    detectionId: UUID;
    timestamp: Date;
    anomaliesFound: number;
    anomalies: Array<{
        anomalyId: UUID;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        confidence: number;
        affectedData: Record<string, unknown>;
        possibleCauses: string[];
    }>;
    metadata: Record<string, unknown>;
}
export interface InsightGenerationResult {
    generationId: UUID;
    timestamp: Date;
    insightsGenerated: number;
    insights: Array<{
        insightId: UUID;
        category: string;
        insight: string;
        confidence: number;
        impact: 'low' | 'medium' | 'high';
        actionable: boolean;
        recommendations: string[];
    }>;
    metadata: Record<string, unknown>;
}
export interface AnalyticsStatistics {
    totalPredictions: number;
    totalAnalyses: number;
    totalModels: number;
    averagePredictionAccuracy: number;
    averageAnalysisTime: number;
    modelPerformanceDistribution: Record<string, number>;
    usageByModelType: Record<AnalyticsModelType, number>;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    metadata: Record<string, unknown>;
}
//# sourceMappingURL=analytics-engine.interface.d.ts.map