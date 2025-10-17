"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogAnalyticsService = void 0;
const analytics_engine_1 = require("../../infrastructure/engines/analytics.engine");
const nlp_processor_1 = require("../../infrastructure/processors/nlp.processor");
class DialogAnalyticsService {
    dialogRepository;
    analyticsEngine;
    nlpProcessor;
    constructor(dialogRepository, analyticsEngine, nlpProcessor) {
        this.dialogRepository = dialogRepository;
        this.analyticsEngine = analyticsEngine || new analytics_engine_1.AnalyticsEngine();
        this.nlpProcessor = nlpProcessor || new nlp_processor_1.NLPProcessor();
    }
    async generateAnalyticsReport(request) {
        let dialogIds = request.dialogIds;
        if (!dialogIds) {
            const allDialogs = await this.dialogRepository.findActiveDialogs();
            dialogIds = allDialogs.map((dialog) => dialog.dialogId);
        }
        if (!dialogIds || dialogIds.length === 0) {
            dialogIds = [];
        }
        let usageAnalysis;
        let performanceAnalysis;
        let healthAnalysis;
        if (request.reportType === 'usage' || request.reportType === 'comprehensive') {
            usageAnalysis = await this.analyzeUsagePatterns(dialogIds);
        }
        if (request.reportType === 'performance' || request.reportType === 'comprehensive') {
            performanceAnalysis = await this.analyzePerformanceTrends(dialogIds);
        }
        if (request.reportType === 'health' || request.reportType === 'comprehensive') {
            healthAnalysis = await this.analyzeDialogHealth(dialogIds);
        }
        const summary = await this.generateSummary(dialogIds, usageAnalysis, performanceAnalysis, healthAnalysis);
        const recommendations = request.includeRecommendations
            ? await this.generateRecommendations(usageAnalysis, performanceAnalysis, healthAnalysis)
            : undefined;
        return {
            reportId: this.generateReportId(),
            reportType: request.reportType,
            generatedAt: new Date().toISOString(),
            dialogIds,
            summary,
            usageAnalysis,
            performanceAnalysis,
            healthAnalysis,
            recommendations,
            trends: await this.analyzeTrends(dialogIds)
        };
    }
    async analyzeDialogUsage(request) {
        return await this.analyzeUsagePatterns(request.dialogIds);
    }
    async analyzeDialogPerformance(request) {
        return await this.analyzePerformanceTrends(request.dialogIds);
    }
    async getDialogRankings(dialogIds) {
        const usageAnalysis = await this.analyzeUsagePatterns(dialogIds);
        const performanceAnalysis = await this.analyzePerformanceTrends(dialogIds);
        return await this.generateDialogRankings(dialogIds, usageAnalysis, performanceAnalysis);
    }
    async performNLPAnalysis(_dialogIds) {
        return {
            sentimentAnalysis: {
                overall: 'positive',
                score: 0.75,
                distribution: {
                    positive: 0.6,
                    neutral: 0.3,
                    negative: 0.1
                }
            },
            topicModeling: {
                topics: [
                    {
                        id: 'topic-1',
                        name: 'Customer Support',
                        keywords: ['help', 'support', 'issue', 'problem'],
                        weight: 0.4
                    },
                    {
                        id: 'topic-2',
                        name: 'Product Information',
                        keywords: ['product', 'feature', 'specification', 'details'],
                        weight: 0.35
                    }
                ],
                topicDistribution: {
                    'Customer Support': 0.4,
                    'Product Information': 0.35,
                    'General Inquiry': 0.25
                }
            },
            languageDetection: {
                primaryLanguage: 'en',
                confidence: 0.95,
                languageDistribution: {
                    'en': 0.85,
                    'zh': 0.10,
                    'es': 0.05
                }
            },
            keywordExtraction: {
                keywords: [
                    { term: 'support', frequency: 45, relevance: 0.9 },
                    { term: 'product', frequency: 38, relevance: 0.85 },
                    { term: 'help', frequency: 32, relevance: 0.8 }
                ],
                phrases: [
                    { phrase: 'customer support', frequency: 15, context: ['help', 'assistance', 'service'] },
                    { phrase: 'product information', frequency: 12, context: ['details', 'specifications', 'features'] }
                ]
            }
        };
    }
    async identifyDialogPatterns(_dialogIds) {
        return {
            conversationPatterns: [
                {
                    patternId: 'pattern-1',
                    name: 'Problem-Solution Flow',
                    description: 'User presents problem, agent provides solution, user confirms',
                    frequency: 0.65,
                    examples: ['Issue description → Solution steps → Confirmation'],
                    effectiveness: 0.85
                },
                {
                    patternId: 'pattern-2',
                    name: 'Information Request',
                    description: 'User requests information, agent provides details',
                    frequency: 0.25,
                    examples: ['Product inquiry → Feature explanation'],
                    effectiveness: 0.90
                }
            ],
            userBehaviorPatterns: [
                {
                    behaviorId: 'behavior-1',
                    type: 'engagement',
                    pattern: 'High initial engagement, gradual decline',
                    frequency: 0.4,
                    impact: 'neutral'
                },
                {
                    behaviorId: 'behavior-2',
                    type: 'response_time',
                    pattern: 'Quick responses in first 5 minutes, slower afterwards',
                    frequency: 0.7,
                    impact: 'positive'
                }
            ],
            temporalPatterns: [
                {
                    timePattern: 'Business Hours Peak',
                    description: 'Higher activity during business hours',
                    peakHours: [9, 10, 14, 15, 16],
                    seasonality: {
                        'Monday': 1.2,
                        'Tuesday': 1.1,
                        'Wednesday': 1.0,
                        'Thursday': 1.1,
                        'Friday': 0.9
                    }
                }
            ]
        };
    }
    async generatePredictiveAnalysis(dialogIds, predictionType) {
        const predictions = [];
        const now = new Date();
        for (let i = 1; i <= 7; i++) {
            const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
            predictions.push({
                timestamp: futureDate.toISOString(),
                predictedValue: this.generatePredictedValue(predictionType, i),
                confidence: 0.85 - (i * 0.05),
                factors: this.getPredictionFactors(predictionType)
            });
        }
        return {
            predictions,
            accuracy: {
                historicalAccuracy: 0.82,
                confidenceInterval: [0.75, 0.89],
                modelVersion: 'v1.2.0'
            },
            recommendations: this.generatePredictionRecommendations(predictionType)
        };
    }
    async analyzeUsagePatterns(dialogIds) {
        const dialogs = await Promise.all(dialogIds.map(id => this.dialogRepository.findById(id)));
        const validDialogs = dialogs.filter((dialog) => dialog !== null && dialog !== undefined && Boolean(dialog.dialogId));
        if (validDialogs.length === 0) {
            return {
                totalInteractions: 0,
                averageSessionDuration: 0,
                mostUsedCapabilities: [],
                participantEngagement: { 'high': 0, 'medium': 0, 'low': 0 },
                peakUsageHours: []
            };
        }
        const dialogData = validDialogs.map(dialog => ({
            id: dialog.dialogId || 'unknown',
            participants: dialog.participants?.length || 0,
            capabilities: Object.keys(dialog.capabilities || {}).length,
            timestamp: dialog.timestamp || new Date().toISOString(),
            status: dialog.dialogOperation || 'unknown'
        }));
        const _patterns = await this.analyticsEngine.analyzePatterns(dialogData);
        const insights = await this.analyticsEngine.generateInsights(dialogData);
        const totalInteractions = validDialogs.length * 50;
        const averageSessionDuration = 1800;
        const engagementBoost = insights.filter(i => i.type === 'trend').length * 0.1;
        return {
            totalInteractions,
            averageSessionDuration,
            mostUsedCapabilities: ['basic', 'intelligentControl', 'contextAwareness'],
            participantEngagement: {
                'high': Math.round(dialogIds.length * (0.3 + engagementBoost)),
                'medium': Math.round(dialogIds.length * 0.5),
                'low': Math.round(dialogIds.length * (0.2 - engagementBoost))
            },
            peakUsageHours: [9, 10, 14, 15, 16]
        };
    }
    async analyzePerformanceTrends(dialogIds) {
        return {
            averageResponseTime: 85,
            throughput: dialogIds.length * 10,
            errorRate: 0.02,
            resourceUtilization: {
                memory: 65,
                cpu: 45,
                network: 30
            },
            performanceTrends: this.generatePerformanceTrends()
        };
    }
    async analyzeDialogHealth(_dialogIds) {
        return {
            overallScore: 85,
            healthMetrics: {
                availability: 99.5,
                reliability: 98.2,
                responsiveness: 95.8,
                scalability: 88.5
            },
            issues: [
                {
                    severity: 'medium',
                    category: 'performance',
                    description: '部分对话响应时间超过100ms',
                    recommendation: '优化对话处理逻辑，启用缓存机制'
                }
            ]
        };
    }
    generatePerformanceTrends() {
        const trends = [];
        const now = new Date();
        for (let i = 0; i < 24; i++) {
            const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
            trends.push({
                timestamp: timestamp.toISOString(),
                responseTime: 80 + Math.random() * 40,
                throughput: 50 + Math.random() * 30,
                errorRate: Math.random() * 0.05
            });
        }
        return trends.reverse();
    }
    async generateSummary(dialogIds, _usageAnalysis, performanceAnalysis, healthAnalysis) {
        const activeDialogs = await this.dialogRepository.findActiveDialogs();
        return {
            totalDialogs: dialogIds.length,
            activeDialogs: activeDialogs.length,
            averagePerformance: performanceAnalysis?.averageResponseTime || 0,
            overallHealth: this.calculateOverallHealth(healthAnalysis),
            criticalIssues: healthAnalysis?.issues.filter(issue => issue.severity === 'critical').length || 0
        };
    }
    calculateOverallHealth(healthAnalysis) {
        if (!healthAnalysis)
            return 'good';
        const score = healthAnalysis.overallScore;
        if (score >= 90)
            return 'excellent';
        if (score >= 75)
            return 'good';
        if (score >= 60)
            return 'fair';
        return 'poor';
    }
    async generateRecommendations(_usageAnalysis, performanceAnalysis, healthAnalysis) {
        const recommendations = [];
        if (performanceAnalysis && performanceAnalysis.averageResponseTime > 100) {
            recommendations.push('考虑优化对话处理逻辑以提高响应速度');
        }
        if (healthAnalysis && healthAnalysis.overallScore < 80) {
            recommendations.push('建议进行系统健康检查和性能调优');
        }
        return recommendations;
    }
    async analyzeTrends(dialogIds) {
        return [
            {
                metric: 'usage',
                trend: 'increasing',
                changeRate: 0.15,
                prediction: dialogIds.length * 1.15
            },
            {
                metric: 'performance',
                trend: 'stable',
                changeRate: 0.02,
                prediction: 85
            }
        ];
    }
    async generateDialogRankings(dialogIds, _usageAnalysis, _performanceAnalysis) {
        return dialogIds.map((dialogId, index) => ({
            dialogId,
            name: `Dialog ${index + 1}`,
            score: 90 - index * 2,
            rank: index + 1,
            metrics: {
                usage: 85 + Math.random() * 15,
                performance: 80 + Math.random() * 20,
                health: 75 + Math.random() * 25
            }
        }));
    }
    generateReportId() {
        return `report-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generatePredictedValue(predictionType, dayOffset) {
        const baseValues = {
            'volume': 100,
            'satisfaction': 0.85,
            'resolution_time': 300,
            'churn': 0.05
        };
        const baseValue = baseValues[predictionType] || 100;
        const randomVariation = (Math.random() - 0.5) * 0.2;
        const trendFactor = 1 + (dayOffset * 0.02);
        return baseValue * trendFactor * (1 + randomVariation);
    }
    getPredictionFactors(predictionType) {
        const factors = {
            'volume': ['Historical trends', 'Seasonal patterns', 'Marketing campaigns', 'Product launches'],
            'satisfaction': ['Response time', 'Resolution rate', 'Agent training', 'System performance'],
            'resolution_time': ['Issue complexity', 'Agent experience', 'System load', 'Knowledge base quality'],
            'churn': ['Satisfaction scores', 'Response time', 'Issue resolution', 'Competitor activity']
        };
        return factors[predictionType] || ['General trends', 'Historical data'];
    }
    generatePredictionRecommendations(predictionType) {
        const recommendations = {
            'volume': [
                '准备增加客服人员以应对预期的对话量增长',
                '优化自动化流程以提高处理效率',
                '考虑实施预防性措施减少问题发生'
            ],
            'satisfaction': [
                '加强客服培训以提高服务质量',
                '优化响应时间和解决流程',
                '收集更多用户反馈以改进服务'
            ],
            'resolution_time': [
                '更新知识库以加快问题解决',
                '实施更智能的问题路由系统',
                '提供更好的工具支持客服人员'
            ],
            'churn': [
                '主动联系高风险客户',
                '改进客户体验和满意度',
                '分析流失原因并制定针对性策略'
            ]
        };
        return recommendations[predictionType] || ['持续监控和优化服务质量'];
    }
}
exports.DialogAnalyticsService = DialogAnalyticsService;
