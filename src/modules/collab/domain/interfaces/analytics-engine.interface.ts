/**
 * Analytics Engine Interface - Domain Layer
 * @description Interface for analytics and prediction operations
 * @version 1.0.0
 * @author MPLP Development Team
 * @created 2025-01-27
 * @refactoring_guide_compliance 100%
 */

import { UUID } from '../../../../shared/types';

/**
 * Analytics model types
 */
export type AnalyticsModelType = 
  | 'collaboration_outcome'
  | 'performance_prediction'
  | 'risk_assessment'
  | 'resource_optimization'
  | 'member_engagement'
  | 'task_completion'
  | 'pattern_recognition'
  | 'anomaly_detection';

/**
 * Prediction result
 */
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

/**
 * Analysis result
 */
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

/**
 * Feature extraction result
 */
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

/**
 * Model training data
 */
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

/**
 * Model performance metrics
 */
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

/**
 * Analytics Engine Interface
 * Handles all analytics and prediction operations
 * 
 * @interface IAnalyticsEngine
 * @description Core interface for analytics as required by refactoring guide
 */
export interface IAnalyticsEngine {
  /**
   * Make prediction using specified model
   * @param features - Feature set for prediction
   * @param modelType - Type of model to use
   * @param options - Prediction options (optional)
   * @returns Promise<PredictionResult> - Prediction result
   * @throws Error if prediction fails
   */
  predict(
    features: Record<string, unknown>,
    modelType: AnalyticsModelType,
    options?: {
      modelVersion?: string;
      confidenceThreshold?: number;
      includeExplanation?: boolean;
    }
  ): Promise<PredictionResult>;

  /**
   * Perform data analysis
   * @param data - Data to analyze
   * @param analysisType - Type of analysis to perform
   * @param options - Analysis options (optional)
   * @returns Promise<AnalysisResult> - Analysis result
   * @throws Error if analysis fails
   */
  analyze(
    data: Record<string, unknown>[],
    analysisType: string,
    options?: {
      includePatterns?: boolean;
      includeAnomalies?: boolean;
      includeRecommendations?: boolean;
      timeWindow?: { startTime: Date; endTime: Date };
    }
  ): Promise<AnalysisResult>;

  /**
   * Extract features from entity
   * @param entityId - Entity identifier
   * @param entityType - Type of entity
   * @param entityData - Entity data
   * @returns Promise<FeatureSet> - Extracted features
   * @throws Error if feature extraction fails
   */
  extractFeatures(
    entityId: UUID,
    entityType: string,
    entityData: Record<string, unknown>
  ): Promise<FeatureSet>;

  /**
   * Train analytics model
   * @param trainingData - Training data
   * @param modelType - Type of model to train
   * @param options - Training options (optional)
   * @returns Promise<string> - Model ID
   * @throws Error if training fails
   */
  trainModel(
    trainingData: TrainingData,
    modelType: AnalyticsModelType,
    options?: {
      validationSplit?: number;
      epochs?: number;
      learningRate?: number;
      regularization?: number;
      hyperparameters?: Record<string, unknown>;
    }
  ): Promise<string>;

  /**
   * Evaluate model performance
   * @param modelId - Model identifier
   * @param testData - Test data for evaluation
   * @returns Promise<ModelPerformance> - Performance metrics
   * @throws Error if evaluation fails
   */
  evaluateModel(modelId: string, testData: TrainingData): Promise<ModelPerformance>;

  /**
   * Get model information
   * @param modelId - Model identifier
   * @returns Promise<ModelInfo> - Model information
   * @throws Error if model not found
   */
  getModelInfo(modelId: string): Promise<ModelInfo>;

  /**
   * List available models
   * @param modelType - Filter by model type (optional)
   * @returns Promise<ModelInfo[]> - Array of model information
   */
  listModels(modelType?: AnalyticsModelType): Promise<ModelInfo[]>;

  /**
   * Delete model
   * @param modelId - Model identifier
   * @returns Promise<void>
   * @throws Error if deletion fails
   */
  deleteModel(modelId: string): Promise<void>;

  /**
   * Detect patterns in data
   * @param data - Data to analyze for patterns
   * @param patternTypes - Types of patterns to detect (optional)
   * @returns Promise<PatternDetectionResult> - Detected patterns
   */
  detectPatterns(
    data: Record<string, unknown>[],
    patternTypes?: string[]
  ): Promise<PatternDetectionResult>;

  /**
   * Detect anomalies in data
   * @param data - Data to analyze for anomalies
   * @param sensitivity - Anomaly detection sensitivity (optional)
   * @returns Promise<AnomalyDetectionResult> - Detected anomalies
   */
  detectAnomalies(
    data: Record<string, unknown>[],
    sensitivity?: 'low' | 'medium' | 'high'
  ): Promise<AnomalyDetectionResult>;

  /**
   * Generate insights from analysis
   * @param analysisResults - Analysis results to generate insights from
   * @param context - Context for insight generation (optional)
   * @returns Promise<InsightGenerationResult> - Generated insights
   */
  generateInsights(
    analysisResults: AnalysisResult[],
    context?: Record<string, unknown>
  ): Promise<InsightGenerationResult>;

  /**
   * Get analytics statistics
   * @param timeRange - Time range for statistics (optional)
   * @returns Promise<AnalyticsStatistics> - Analytics statistics
   */
  getStatistics(timeRange?: {
    startTime: Date;
    endTime: Date;
  }): Promise<AnalyticsStatistics>;
}

/**
 * Model information
 */
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

/**
 * Pattern detection result
 */
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

/**
 * Anomaly detection result
 */
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

/**
 * Insight generation result
 */
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

/**
 * Analytics statistics
 */
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
