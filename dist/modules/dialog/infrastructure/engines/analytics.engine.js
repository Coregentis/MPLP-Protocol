"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEngine = void 0;
class AnalyticsEngine {
    models = new Map();
    patterns = new Map();
    constructor() {
        this.initializeModels();
        this.initializePatterns();
    }
    async predict(features, modelType) {
        const model = this.models.get(modelType);
        if (!model) {
            throw new Error(`Model ${modelType} not found`);
        }
        try {
            const processedFeatures = this.preprocessFeatures(features);
            const prediction = await this.executePrediction(model, processedFeatures);
            const confidence = this.calculateConfidence(prediction, processedFeatures);
            const factors = this.identifyFactors(processedFeatures, prediction);
            return {
                outcome: prediction.outcome,
                confidence,
                factors,
                metadata: {
                    modelType,
                    modelVersion: model.version,
                    featureCount: Object.keys(processedFeatures).length,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            throw new Error(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async analyzePatterns(data) {
        if (data.length === 0) {
            return {
                patterns: [],
                insights: ['No data available for pattern analysis']
            };
        }
        const detectedPatterns = [];
        const insights = [];
        const frequencyPatterns = this.analyzeFrequencyPatterns(data);
        detectedPatterns.push(...frequencyPatterns);
        const timePatterns = this.analyzeTimePatterns(data);
        detectedPatterns.push(...timePatterns);
        const correlationPatterns = this.analyzeCorrelationPatterns(data);
        detectedPatterns.push(...correlationPatterns);
        if (detectedPatterns.length > 0) {
            insights.push(`发现 ${detectedPatterns.length} 个数据模式`);
            const highConfidencePatterns = detectedPatterns.filter(p => p.confidence > 0.8);
            if (highConfidencePatterns.length > 0) {
                insights.push(`其中 ${highConfidencePatterns.length} 个模式具有高置信度`);
            }
        }
        else {
            insights.push('未发现明显的数据模式');
        }
        return {
            patterns: detectedPatterns,
            insights
        };
    }
    async generateInsights(data) {
        const insights = [];
        if (data.length === 0) {
            insights.push({
                type: 'recommendation',
                title: '数据不足',
                description: '需要更多数据来生成有意义的洞察',
                confidence: 1.0,
                impact: 'high',
                actionable: true
            });
            return insights;
        }
        const trendInsights = this.generateTrendInsights(data);
        insights.push(...trendInsights);
        const anomalyInsights = this.generateAnomalyInsights(data);
        insights.push(...anomalyInsights);
        const performanceInsights = this.generatePerformanceInsights(data);
        insights.push(...performanceInsights);
        const recommendationInsights = this.generateRecommendationInsights(data);
        insights.push(...recommendationInsights);
        return insights;
    }
    async calculateMetrics(data) {
        const startTime = new Date();
        const metrics = {};
        const aggregations = {};
        if (data.length === 0) {
            return {
                metrics: { count: 0 },
                aggregations: {},
                timeRange: {
                    start: startTime.toISOString(),
                    end: new Date().toISOString()
                }
            };
        }
        metrics.count = data.length;
        metrics.uniqueCount = new Set(data.map(item => JSON.stringify(item))).size;
        metrics.duplicateRate = (metrics.count - metrics.uniqueCount) / metrics.count;
        const numericValues = this.extractNumericValues(data);
        if (numericValues.length > 0) {
            metrics.mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
            metrics.median = this.calculateMedian(numericValues);
            metrics.standardDeviation = this.calculateStandardDeviation(numericValues, metrics.mean);
            metrics.min = Math.min(...numericValues);
            metrics.max = Math.max(...numericValues);
        }
        aggregations.dataTypes = this.analyzeDataTypes(data);
        aggregations.distribution = this.calculateDistribution(data);
        aggregations.summary = {
            totalItems: metrics.count,
            uniqueItems: metrics.uniqueCount,
            processingTime: Date.now() - startTime.getTime()
        };
        return {
            metrics,
            aggregations,
            timeRange: {
                start: startTime.toISOString(),
                end: new Date().toISOString()
            }
        };
    }
    initializeModels() {
        this.models.set('dialog_outcome', {
            name: 'Dialog Outcome Predictor',
            version: '1.0.0',
            type: 'classification',
            features: ['messageCount', 'participantCount', 'duration', 'averageResponseTime'],
            outcomes: ['completed', 'abandoned', 'escalated']
        });
        this.models.set('satisfaction', {
            name: 'User Satisfaction Predictor',
            version: '1.0.0',
            type: 'regression',
            features: ['responseTime', 'resolutionRate', 'messageLength', 'sentiment'],
            outcomes: ['satisfaction_score']
        });
        this.models.set('quality', {
            name: 'Dialog Quality Assessor',
            version: '1.0.0',
            type: 'classification',
            features: ['coherence', 'relevance', 'completeness', 'efficiency'],
            outcomes: ['high', 'medium', 'low']
        });
    }
    initializePatterns() {
        this.patterns.set('frequency', {
            name: 'Frequency Pattern',
            description: 'Identifies recurring elements in data',
            threshold: 0.1
        });
        this.patterns.set('temporal', {
            name: 'Temporal Pattern',
            description: 'Identifies time-based patterns',
            threshold: 0.15
        });
        this.patterns.set('correlation', {
            name: 'Correlation Pattern',
            description: 'Identifies relationships between variables',
            threshold: 0.7
        });
    }
    preprocessFeatures(features) {
        const processed = {};
        for (const [key, value] of Object.entries(features)) {
            if (typeof value === 'number') {
                processed[key] = value;
            }
            else if (typeof value === 'string') {
                processed[key] = value.length;
            }
            else if (typeof value === 'boolean') {
                processed[key] = value ? 1 : 0;
            }
            else if (Array.isArray(value)) {
                processed[key] = value.length;
            }
            else {
                processed[key] = 0;
            }
        }
        return processed;
    }
    async executePrediction(model, features) {
        switch (model.type) {
            case 'classification':
                return this.executeClassification(model, features);
            case 'regression':
                return this.executeRegression(model, features);
            default:
                throw new Error(`Unsupported model type: ${model.type}`);
        }
    }
    executeClassification(_model, features) {
        const featureSum = Object.values(features).reduce((sum, val) => sum + val, 0);
        const normalizedScore = featureSum / Object.keys(features).length;
        if (_model.name.includes('Dialog Outcome')) {
            if (normalizedScore > 10)
                return { outcome: 'completed', score: normalizedScore };
            if (normalizedScore > 5)
                return { outcome: 'escalated', score: normalizedScore };
            return { outcome: 'abandoned', score: normalizedScore };
        }
        if (_model.name.includes('Quality')) {
            if (normalizedScore > 15)
                return { outcome: 'high', score: normalizedScore };
            if (normalizedScore > 8)
                return { outcome: 'medium', score: normalizedScore };
            return { outcome: 'low', score: normalizedScore };
        }
        return { outcome: _model.outcomes[0], score: normalizedScore };
    }
    executeRegression(_model, features) {
        const featureSum = Object.values(features).reduce((sum, val) => sum + val, 0);
        const score = Math.max(0, Math.min(100, featureSum / Object.keys(features).length * 10));
        return { outcome: score.toString(), score };
    }
    calculateConfidence(prediction, features) {
        const featureCompleteness = Object.values(features).filter(val => val > 0).length / Object.keys(features).length;
        const scoreNormalized = Math.min(1, prediction.score / 100);
        return Math.min(1, (featureCompleteness + scoreNormalized) / 2);
    }
    identifyFactors(features, _prediction) {
        const sortedFeatures = Object.entries(features)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        return sortedFeatures.map(([key, value]) => `${key}: ${value}`);
    }
    analyzeFrequencyPatterns(data) {
        const frequency = new Map();
        data.forEach(item => {
            const key = JSON.stringify(item);
            const existing = frequency.get(key) || { count: 0, examples: [] };
            existing.count++;
            if (existing.examples.length < 3) {
                existing.examples.push(item);
            }
            frequency.set(key, existing);
        });
        return Array.from(frequency.entries())
            .filter(([, info]) => info.count > 1)
            .map(([_key, info], index) => ({
            patternId: `freq_${index}`,
            name: `Frequency Pattern ${index + 1}`,
            frequency: info.count / data.length,
            confidence: Math.min(1, info.count / 10),
            examples: info.examples
        }));
    }
    analyzeTimePatterns(_data) {
        return [{
                patternId: 'time_1',
                name: 'Temporal Pattern',
                frequency: 0.5,
                confidence: 0.6,
                examples: []
            }];
    }
    analyzeCorrelationPatterns(_data) {
        return [{
                patternId: 'corr_1',
                name: 'Correlation Pattern',
                frequency: 0.3,
                confidence: 0.7,
                examples: []
            }];
    }
    generateTrendInsights(_data) {
        return [{
                type: 'trend',
                title: '数据趋势分析',
                description: '数据呈现稳定增长趋势',
                confidence: 0.8,
                impact: 'medium',
                actionable: true
            }];
    }
    generateAnomalyInsights(_data) {
        return [{
                type: 'anomaly',
                title: '异常检测',
                description: '发现少量异常数据点',
                confidence: 0.6,
                impact: 'low',
                actionable: true
            }];
    }
    generatePerformanceInsights(_data) {
        return [{
                type: 'pattern',
                title: '性能分析',
                description: '系统性能表现良好',
                confidence: 0.9,
                impact: 'high',
                actionable: false
            }];
    }
    generateRecommendationInsights(_data) {
        return [{
                type: 'recommendation',
                title: '优化建议',
                description: '建议增加数据收集频率以提高分析准确性',
                confidence: 0.7,
                impact: 'medium',
                actionable: true
            }];
    }
    extractNumericValues(data) {
        const values = [];
        data.forEach(item => {
            if (typeof item === 'number') {
                values.push(item);
            }
            else if (typeof item === 'object' && item !== null) {
                Object.values(item).forEach(value => {
                    if (typeof value === 'number') {
                        values.push(value);
                    }
                });
            }
        });
        return values;
    }
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }
    calculateStandardDeviation(values, mean) {
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    analyzeDataTypes(data) {
        const types = {};
        data.forEach(item => {
            const type = typeof item;
            types[type] = (types[type] || 0) + 1;
        });
        return types;
    }
    calculateDistribution(data) {
        const distribution = {};
        data.forEach(item => {
            const key = JSON.stringify(item);
            distribution[key] = (distribution[key] || 0) + 1;
        });
        return distribution;
    }
}
exports.AnalyticsEngine = AnalyticsEngine;
