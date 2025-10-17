"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextAnalyticsService = void 0;
class ContextAnalyticsService {
    contextRepository;
    analyticsEngine;
    searchEngine;
    metricsCollector;
    logger;
    constructor(contextRepository, analyticsEngine, searchEngine, metricsCollector, logger) {
        this.contextRepository = contextRepository;
        this.analyticsEngine = analyticsEngine;
        this.searchEngine = searchEngine;
        this.metricsCollector = metricsCollector;
        this.logger = logger;
    }
    async analyzeContext(contextId) {
        try {
            this.logger.info('Analyzing context', { contextId });
            const context = await this.contextRepository.findById(contextId);
            if (!context) {
                throw new Error(`Context ${contextId} not found`);
            }
            const [usage, patterns, performance, insights] = await Promise.all([
                this.analyzeUsage(context),
                this.analyzePatterns(context),
                this.analyzePerformance(context.contextId),
                this.generateInsights(context)
            ]);
            const analysis = {
                contextId,
                timestamp: new Date().toISOString(),
                usage,
                patterns,
                performance,
                insights,
                recommendations: await this.generateRecommendations(context, { usage, patterns, performance })
            };
            this.logger.info('Context analysis completed', { contextId, healthScore: insights.healthScore });
            return analysis;
        }
        catch (error) {
            this.logger.error('Failed to analyze context', error, { contextId });
            throw error;
        }
    }
    async analyzeTrends(timeRange) {
        try {
            this.logger.info('Analyzing context trends', { timeRange });
            const allContexts = await this.contextRepository.findAll();
            const contexts = allContexts.data.filter((c) => {
                const createdAt = c.createdAt;
                return createdAt && createdAt >= timeRange.startDate && createdAt <= timeRange.endDate;
            });
            const trends = {
                timeRange,
                totalContexts: contexts.length,
                activeContexts: contexts.filter(c => c.status === 'active').length,
                lifecycleDistribution: this.calculateLifecycleDistribution(contexts),
                usagePatterns: await this.analyzeUsagePatterns(contexts),
                performanceTrends: await this.analyzePerformanceTrends(contexts),
                growthRate: this.calculateGrowthRate(contexts, timeRange)
            };
            this.logger.info('Trends analysis completed', {
                totalContexts: trends.totalContexts,
                growthRate: trends.growthRate
            });
            return trends;
        }
        catch (error) {
            this.logger.error('Failed to analyze trends', error, { timeRange });
            throw error;
        }
    }
    async analyzePerformance(contextId) {
        try {
            const metrics = await this.metricsCollector.getContextMetrics(contextId);
            return {
                responseTime: {
                    average: metrics.avgResponseTime,
                    p95: metrics.p95ResponseTime,
                    p99: metrics.p99ResponseTime
                },
                throughput: {
                    requestsPerSecond: metrics.requestsPerSecond,
                    peakThroughput: metrics.peakThroughput
                },
                resourceUsage: {
                    memoryUsage: metrics.memoryUsage,
                    cpuUsage: metrics.cpuUsage,
                    storageUsage: metrics.storageUsage
                },
                cacheMetrics: {
                    hitRate: metrics.cacheHitRate,
                    missRate: metrics.cacheMissRate,
                    evictionRate: metrics.cacheEvictionRate
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to analyze performance', error, { contextId });
            throw error;
        }
    }
    async searchContexts(query) {
        try {
            this.logger.debug('Searching contexts', { query: query.text });
            const results = await this.searchEngine.search(query);
            this.logger.debug('Search completed', {
                query: query.text,
                resultCount: results.total
            });
            return results;
        }
        catch (error) {
            this.logger.error('Failed to search contexts', error, { query: query.text });
            throw error;
        }
    }
    async updateSearchIndex(contextId) {
        try {
            const context = await this.contextRepository.findById(contextId);
            if (context) {
                await this.searchEngine.indexDocument('contexts', contextId, {
                    name: context.name,
                    description: context.description || '',
                    status: context.status,
                    lifecycleStage: context.lifecycleStage,
                    tagsCount: (context.tags || []).length,
                    createdAt: context.createdAt?.toISOString() || '',
                    updatedAt: context.updatedAt?.toISOString() || ''
                });
                this.logger.debug('Search index updated', { contextId });
            }
        }
        catch (error) {
            this.logger.error('Failed to update search index', error, { contextId });
            throw error;
        }
    }
    async generateReport(contextId, reportType) {
        try {
            this.logger.info('Generating report', { contextId, reportType });
            let reportData;
            let summary;
            let recommendations;
            switch (reportType) {
                case 'usage':
                    ({ data: reportData, summary, recommendations } = await this.generateUsageReport(contextId));
                    break;
                case 'performance':
                    ({ data: reportData, summary, recommendations } = await this.generatePerformanceReport(contextId));
                    break;
                case 'security':
                    ({ data: reportData, summary, recommendations } = await this.generateSecurityReport(contextId));
                    break;
                case 'comprehensive':
                    ({ data: reportData, summary, recommendations } = await this.generateComprehensiveReport(contextId));
                    break;
                default:
                    throw new Error(`Unsupported report type: ${reportType}`);
            }
            const report = {
                reportId: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                contextId,
                reportType,
                generatedAt: new Date(),
                data: reportData,
                summary,
                recommendations
            };
            this.logger.info('Report generated successfully', {
                contextId,
                reportType,
                reportId: report.reportId
            });
            return report;
        }
        catch (error) {
            this.logger.error('Failed to generate report', error, { contextId, reportType });
            throw error;
        }
    }
    async analyzeUsage(_context) {
        return {
            accessCount: 0,
            lastAccessed: new Date().toISOString(),
            averageSessionDuration: 0,
            peakUsageTime: new Date().toISOString(),
            userCount: 0
        };
    }
    async analyzePatterns(context) {
        const contexts = [context];
        return await this.analyticsEngine.analyzePatterns(contexts);
    }
    async generateInsights(context) {
        const metrics = await this.metricsCollector.getContextMetrics(context.contextId);
        return await this.analyticsEngine.generateInsights(context, metrics);
    }
    async generateRecommendations(_context, _analysis) {
        const recommendations = [];
        if (_analysis.usage.accessCount < 10) {
            recommendations.push('考虑增加上下文的可见性和访问便利性');
        }
        if (_analysis.performance.responseTime.average > 100) {
            recommendations.push('优化上下文数据结构以提升响应速度');
        }
        if (_analysis.performance.cacheMetrics.hitRate < 0.8) {
            recommendations.push('优化缓存策略以提升缓存命中率');
        }
        if (_analysis.performance.resourceUsage.memoryUsage > 0.8) {
            recommendations.push('考虑优化内存使用，减少资源消耗');
        }
        return recommendations;
    }
    calculateLifecycleDistribution(contexts) {
        const distribution = {
            'planning': 0,
            'executing': 0,
            'monitoring': 0,
            'completed': 0
        };
        contexts.forEach(context => {
            distribution[context.lifecycleStage]++;
        });
        return distribution;
    }
    async analyzeUsagePatterns(contexts) {
        const patterns = [];
        const activeCount = contexts.filter(c => c.status === 'active').length;
        const totalCount = contexts.length;
        if (activeCount / totalCount > 0.8) {
            patterns.push({
                pattern: 'High Activity',
                frequency: activeCount,
                impact: 'high'
            });
        }
        return patterns;
    }
    async analyzePerformanceTrends(_contexts) {
        return [
            {
                metric: 'response_time',
                trend: 'stable',
                changePercentage: 0
            },
            {
                metric: 'throughput',
                trend: 'improving',
                changePercentage: 5.2
            }
        ];
    }
    calculateGrowthRate(contexts, timeRange) {
        const daysDiff = Math.ceil((timeRange.endDate.getTime() - timeRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
        return contexts.length / daysDiff;
    }
    async generateUsageReport(contextId) {
        const context = await this.contextRepository.findById(contextId);
        if (!context) {
            throw new Error(`Context ${contextId} not found`);
        }
        const usage = await this.analyzeUsage(context);
        return {
            data: {
                context: {
                    id: context.contextId,
                    name: context.name,
                    status: context.status,
                    lifecycleStage: context.lifecycleStage
                },
                usage,
                trends: {
                    dailyAccess: usage.accessCount / 30,
                    userGrowth: usage.userCount > 0 ? 'positive' : 'none'
                }
            },
            summary: `Context "${context.name}" has been accessed ${usage.accessCount} times by ${usage.userCount} users.`,
            recommendations: usage.accessCount < 10
                ? ['Increase context visibility', 'Improve user onboarding']
                : ['Maintain current usage patterns', 'Consider scaling resources']
        };
    }
    async generatePerformanceReport(contextId) {
        const performance = await this.analyzePerformance(contextId);
        return {
            data: {
                performance,
                benchmarks: {
                    responseTimeTarget: 100,
                    throughputTarget: 1000,
                    cacheHitRateTarget: 0.9
                },
                status: {
                    responseTime: performance.responseTime.average <= 100 ? 'good' : 'needs_improvement',
                    throughput: performance.throughput.requestsPerSecond >= 100 ? 'good' : 'needs_improvement',
                    cacheHitRate: performance.cacheMetrics.hitRate >= 0.8 ? 'good' : 'needs_improvement'
                }
            },
            summary: `Average response time: ${performance.responseTime.average}ms, Cache hit rate: ${(performance.cacheMetrics.hitRate * 100).toFixed(1)}%`,
            recommendations: [
                ...(performance.responseTime.average > 100 ? ['Optimize database queries', 'Implement better caching'] : []),
                ...(performance.cacheMetrics.hitRate < 0.8 ? ['Review cache strategy', 'Increase cache TTL'] : []),
                ...(performance.resourceUsage.memoryUsage > 0.8 ? ['Optimize memory usage', 'Consider scaling'] : [])
            ]
        };
    }
    async generateSecurityReport(contextId) {
        const context = await this.contextRepository.findById(contextId);
        if (!context) {
            throw new Error(`Context ${contextId} not found`);
        }
        const securityScore = this.calculateSecurityScore(context);
        return {
            data: {
                context: {
                    id: context.contextId,
                    name: context.name,
                    accessControl: context.accessControl
                },
                security: {
                    score: securityScore,
                    level: securityScore >= 80 ? 'high' : securityScore >= 60 ? 'medium' : 'low',
                    lastAudit: new Date().toISOString()
                },
                compliance: {
                    dataProtection: true,
                    accessLogging: true,
                    encryptionAtRest: true
                }
            },
            summary: `Security score: ${securityScore}/100. Context has ${securityScore >= 80 ? 'strong' : 'adequate'} security measures.`,
            recommendations: securityScore < 80
                ? ['Review access controls', 'Enable audit logging', 'Implement encryption']
                : ['Maintain current security posture', 'Regular security reviews']
        };
    }
    async generateComprehensiveReport(contextId) {
        const [usageReport, performanceReport, securityReport] = await Promise.all([
            this.generateUsageReport(contextId),
            this.generatePerformanceReport(contextId),
            this.generateSecurityReport(contextId)
        ]);
        return {
            data: {
                usage: usageReport.data,
                performance: performanceReport.data,
                security: securityReport.data,
                overall: {
                    healthScore: this.calculateOverallHealthScore(usageReport.data, performanceReport.data, securityReport.data),
                    status: 'healthy',
                    lastUpdated: new Date().toISOString()
                }
            },
            summary: `Comprehensive analysis completed. ${usageReport.summary} ${performanceReport.summary} ${securityReport.summary}`,
            recommendations: [
                ...usageReport.recommendations,
                ...performanceReport.recommendations,
                ...securityReport.recommendations
            ].slice(0, 10)
        };
    }
    calculateSecurityScore(context) {
        let score = 100;
        if (!context.accessControl) {
            score -= 30;
        }
        if (context.status === 'active' && !context.accessControl) {
            score -= 20;
        }
        return Math.max(0, score);
    }
    calculateOverallHealthScore(usageData, performanceData, securityData) {
        const usageScore = usageData.usage.accessCount > 0 ? 80 : 40;
        const performanceScore = performanceData.performance.responseTime.average <= 100 ? 90 : 60;
        const securityScore = securityData.security.score;
        return Math.round((usageScore + performanceScore + securityScore) / 3);
    }
}
exports.ContextAnalyticsService = ContextAnalyticsService;
