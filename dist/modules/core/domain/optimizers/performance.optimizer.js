"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizer = void 0;
class PerformanceOptimizer {
    resourceService;
    monitoringService;
    analysisHistory = [];
    optimizationHistory = [];
    constructor(resourceService, monitoringService) {
        this.resourceService = resourceService;
        this.monitoringService = monitoringService;
    }
    async analyzePerformance() {
        const analysisId = this.generateAnalysisId();
        const timestamp = new Date().toISOString();
        const metrics = await this.collectPerformanceMetrics();
        const bottlenecks = await this.identifyBottlenecks(metrics);
        const recommendations = await this.generateRecommendations(metrics, bottlenecks);
        const overallScore = this.calculateOverallPerformanceScore(metrics, bottlenecks);
        const analysisResult = {
            analysisId,
            timestamp,
            overallScore,
            bottlenecks,
            recommendations,
            metrics
        };
        this.analysisHistory.push(analysisResult);
        if (this.analysisHistory.length > 100) {
            this.analysisHistory.splice(0, this.analysisHistory.length - 100);
        }
        return analysisResult;
    }
    async createOptimizationPlan(analysisResult) {
        const planId = this.generatePlanId();
        const sortedRecommendations = analysisResult.recommendations
            .sort((a, b) => {
            const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        const estimatedTotalImprovement = sortedRecommendations
            .reduce((sum, rec) => sum + rec.expectedImprovement, 0) / sortedRecommendations.length;
        const estimatedImplementationTime = sortedRecommendations
            .reduce((sum, rec) => sum + rec.estimatedImplementationTime, 0);
        const implementationOrder = this.determineImplementationOrder(sortedRecommendations);
        const riskAssessment = this.assessImplementationRisks(sortedRecommendations);
        return {
            planId,
            createdAt: new Date().toISOString(),
            recommendations: sortedRecommendations,
            estimatedTotalImprovement,
            estimatedImplementationTime,
            implementationOrder,
            riskAssessment
        };
    }
    async executeAutoOptimization(plan) {
        const optimizationId = this.generateOptimizationId();
        const startTime = Date.now();
        const beforeMetrics = await this.collectPerformanceMetrics();
        const implementedRecommendations = [];
        const errors = [];
        try {
            const autoRecommendations = plan.recommendations.filter(rec => rec.autoImplementable);
            for (const recommendation of autoRecommendations) {
                try {
                    await this.implementRecommendation(recommendation);
                    implementedRecommendations.push(recommendation.recommendationId);
                }
                catch (error) {
                    errors.push(`Failed to implement ${recommendation.recommendationId}: ${error.message}`);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
            const afterMetrics = await this.collectPerformanceMetrics();
            const actualImprovement = this.calculateActualImprovement(beforeMetrics, afterMetrics);
            const implementationTime = Date.now() - startTime;
            const result = {
                optimizationId,
                planId: plan.planId,
                implementedRecommendations,
                actualImprovement,
                implementationTime,
                success: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined,
                performanceComparison: {
                    before: beforeMetrics,
                    after: afterMetrics,
                    improvement: this.calculateImprovementDetails(beforeMetrics, afterMetrics)
                }
            };
            this.optimizationHistory.push(result);
            return result;
        }
        catch (error) {
            const implementationTime = Date.now() - startTime;
            return {
                optimizationId,
                planId: plan.planId,
                implementedRecommendations,
                actualImprovement: 0,
                implementationTime,
                success: false,
                errors: [error],
                performanceComparison: {
                    before: beforeMetrics,
                    after: beforeMetrics,
                    improvement: {}
                }
            };
        }
    }
    getPerformanceTrends(hours = 24) {
        const recentAnalyses = this.analysisHistory
            .filter(analysis => {
            const analysisTime = new Date(analysis.timestamp);
            const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
            return analysisTime >= cutoffTime;
        })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        if (recentAnalyses.length < 2) {
            return {
                trend: 'stable',
                trendScore: 0,
                keyMetrics: {
                    cpu: { current: 0, trend: 0 },
                    memory: { current: 0, trend: 0 },
                    workflow: { current: 0, trend: 0 }
                }
            };
        }
        const latest = recentAnalyses[recentAnalyses.length - 1];
        const earliest = recentAnalyses[0];
        const scoreTrend = latest.overallScore - earliest.overallScore;
        const cpuTrend = earliest.metrics.cpu.efficiency - latest.metrics.cpu.efficiency;
        const memoryTrend = earliest.metrics.memory.efficiency - latest.metrics.memory.efficiency;
        const workflowTrend = latest.metrics.workflow.efficiency - earliest.metrics.workflow.efficiency;
        const avgTrend = (scoreTrend + cpuTrend + memoryTrend + workflowTrend) / 4;
        let trend;
        if (avgTrend > 5) {
            trend = 'improving';
        }
        else if (avgTrend < -5) {
            trend = 'degrading';
        }
        else {
            trend = 'stable';
        }
        return {
            trend,
            trendScore: avgTrend,
            keyMetrics: {
                cpu: { current: latest.metrics.cpu.efficiency, trend: cpuTrend },
                memory: { current: latest.metrics.memory.efficiency, trend: memoryTrend },
                workflow: { current: latest.metrics.workflow.efficiency, trend: workflowTrend }
            }
        };
    }
    getOptimizationHistory() {
        return [...this.optimizationHistory];
    }
    getAnalysisHistory() {
        return [...this.analysisHistory];
    }
    async collectPerformanceMetrics() {
        const systemPerformance = await this.resourceService.monitorSystemPerformance();
        const _resourceStats = await this.resourceService.getResourceUsageStatistics();
        const modules = ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'network'];
        const moduleMetrics = {};
        modules.forEach(module => {
            moduleMetrics[module] = {
                responseTime: Math.random() * 100 + 10,
                throughput: Math.random() * 100 + 50,
                errorRate: Math.random() * 2,
                efficiency: Math.random() * 30 + 70
            };
        });
        return {
            cpu: {
                usage: systemPerformance.cpuUsagePercent,
                efficiency: Math.max(0, 100 - systemPerformance.cpuUsagePercent),
                bottleneckScore: systemPerformance.cpuUsagePercent > 80 ? 80 : 20
            },
            memory: {
                usage: systemPerformance.memoryUsagePercent,
                efficiency: Math.max(0, 100 - systemPerformance.memoryUsagePercent),
                bottleneckScore: systemPerformance.memoryUsagePercent > 80 ? 80 : 20
            },
            disk: {
                usage: systemPerformance.diskUsagePercent,
                efficiency: Math.max(0, 100 - systemPerformance.diskUsagePercent),
                bottleneckScore: systemPerformance.diskUsagePercent > 80 ? 80 : 20
            },
            network: {
                usage: systemPerformance.networkUsagePercent,
                efficiency: Math.max(0, 100 - systemPerformance.networkUsagePercent),
                bottleneckScore: systemPerformance.networkUsagePercent > 80 ? 80 : 20
            },
            workflow: {
                averageExecutionTime: systemPerformance.averageResponseTimeMs,
                throughput: systemPerformance.throughputPerSecond,
                errorRate: systemPerformance.errorRate,
                efficiency: Math.max(0, 100 - systemPerformance.errorRate * 10)
            },
            modules: moduleMetrics
        };
    }
    async identifyBottlenecks(metrics) {
        const bottlenecks = [];
        if (metrics.cpu.usage > 80) {
            bottlenecks.push({
                type: 'cpu',
                severity: metrics.cpu.usage > 95 ? 'critical' : 'high',
                description: `CPU usage is ${metrics.cpu.usage.toFixed(1)}%`,
                impact: metrics.cpu.usage,
                affectedComponents: ['system', 'all_modules'],
                detectedAt: new Date().toISOString()
            });
        }
        if (metrics.memory.usage > 80) {
            bottlenecks.push({
                type: 'memory',
                severity: metrics.memory.usage > 95 ? 'critical' : 'high',
                description: `Memory usage is ${metrics.memory.usage.toFixed(1)}%`,
                impact: metrics.memory.usage,
                affectedComponents: ['system', 'all_modules'],
                detectedAt: new Date().toISOString()
            });
        }
        if (metrics.workflow.errorRate > 5) {
            bottlenecks.push({
                type: 'workflow',
                severity: metrics.workflow.errorRate > 10 ? 'critical' : 'medium',
                description: `Workflow error rate is ${metrics.workflow.errorRate.toFixed(1)}%`,
                impact: metrics.workflow.errorRate * 10,
                affectedComponents: ['workflow_engine'],
                detectedAt: new Date().toISOString()
            });
        }
        Object.entries(metrics.modules).forEach(([moduleName, moduleMetrics]) => {
            if (moduleMetrics.responseTime > 200) {
                bottlenecks.push({
                    type: 'module',
                    severity: moduleMetrics.responseTime > 500 ? 'high' : 'medium',
                    description: `${moduleName} module response time is ${moduleMetrics.responseTime.toFixed(1)}ms`,
                    impact: Math.min(100, moduleMetrics.responseTime / 5),
                    affectedComponents: [moduleName],
                    detectedAt: new Date().toISOString()
                });
            }
        });
        return bottlenecks;
    }
    async generateRecommendations(metrics, bottlenecks) {
        const recommendations = [];
        bottlenecks.forEach(bottleneck => {
            switch (bottleneck.type) {
                case 'cpu':
                    recommendations.push({
                        recommendationId: this.generateRecommendationId(),
                        type: 'resource_allocation',
                        priority: bottleneck.severity === 'critical' ? 'critical' : 'high',
                        title: 'Optimize CPU Usage',
                        description: 'Reduce CPU-intensive operations and optimize algorithms',
                        expectedImprovement: Math.min(50, bottleneck.impact * 0.6),
                        implementationComplexity: 'medium',
                        estimatedImplementationTime: 30,
                        autoImplementable: true
                    });
                    break;
                case 'memory':
                    recommendations.push({
                        recommendationId: this.generateRecommendationId(),
                        type: 'resource_allocation',
                        priority: bottleneck.severity === 'critical' ? 'critical' : 'high',
                        title: 'Optimize Memory Usage',
                        description: 'Implement memory pooling and garbage collection optimization',
                        expectedImprovement: Math.min(40, bottleneck.impact * 0.5),
                        implementationComplexity: 'medium',
                        estimatedImplementationTime: 25,
                        autoImplementable: true
                    });
                    break;
                case 'workflow':
                    recommendations.push({
                        recommendationId: this.generateRecommendationId(),
                        type: 'workflow_optimization',
                        priority: 'high',
                        title: 'Optimize Workflow Execution',
                        description: 'Implement workflow caching and parallel execution',
                        expectedImprovement: Math.min(60, bottleneck.impact * 0.8),
                        implementationComplexity: 'high',
                        estimatedImplementationTime: 60,
                        autoImplementable: false
                    });
                    break;
                case 'module':
                    recommendations.push({
                        recommendationId: this.generateRecommendationId(),
                        type: 'module_tuning',
                        priority: 'medium',
                        title: `Optimize ${bottleneck.affectedComponents[0]} Module`,
                        description: 'Tune module configuration and implement caching',
                        expectedImprovement: Math.min(30, bottleneck.impact * 0.4),
                        implementationComplexity: 'low',
                        estimatedImplementationTime: 15,
                        autoImplementable: true
                    });
                    break;
            }
        });
        if (metrics.workflow.averageExecutionTime > 1000) {
            recommendations.push({
                recommendationId: this.generateRecommendationId(),
                type: 'system_configuration',
                priority: 'medium',
                title: 'Enable Response Caching',
                description: 'Implement intelligent caching to reduce response times',
                expectedImprovement: 25,
                implementationComplexity: 'low',
                estimatedImplementationTime: 10,
                autoImplementable: true
            });
        }
        return recommendations;
    }
    calculateOverallPerformanceScore(metrics, bottlenecks) {
        let score = 100;
        score -= Math.max(0, metrics.cpu.usage - 70) * 0.5;
        score -= Math.max(0, metrics.memory.usage - 70) * 0.5;
        score -= Math.max(0, metrics.disk.usage - 80) * 0.3;
        score -= Math.max(0, metrics.network.usage - 80) * 0.3;
        score -= metrics.workflow.errorRate * 5;
        score -= Math.max(0, (metrics.workflow.averageExecutionTime - 500) / 50);
        bottlenecks.forEach(bottleneck => {
            const severityPenalty = {
                'low': 2,
                'medium': 5,
                'high': 10,
                'critical': 20
            };
            score -= severityPenalty[bottleneck.severity];
        });
        return Math.max(0, Math.min(100, score));
    }
    determineImplementationOrder(recommendations) {
        return recommendations
            .sort((a, b) => {
            const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            const complexityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            return complexityOrder[a.implementationComplexity] - complexityOrder[b.implementationComplexity];
        })
            .map(rec => rec.recommendationId);
    }
    assessImplementationRisks(recommendations) {
        const highComplexityCount = recommendations.filter(r => r.implementationComplexity === 'high').length;
        const criticalPriorityCount = recommendations.filter(r => r.priority === 'critical').length;
        let overallRisk = 'low';
        const risks = [];
        const mitigations = [];
        if (highComplexityCount > 2) {
            overallRisk = 'high';
            risks.push('Multiple high-complexity optimizations may cause system instability');
            mitigations.push('Implement optimizations in phases with thorough testing');
        }
        else if (highComplexityCount > 0 || criticalPriorityCount > 1) {
            overallRisk = 'medium';
            risks.push('Some optimizations may temporarily impact system performance');
            mitigations.push('Monitor system closely during implementation');
        }
        if (recommendations.some(r => !r.autoImplementable)) {
            risks.push('Manual implementation required for some optimizations');
            mitigations.push('Ensure proper documentation and rollback procedures');
        }
        return { overallRisk, risks, mitigations };
    }
    async implementRecommendation(recommendation) {
        await new Promise(resolve => setTimeout(resolve, recommendation.estimatedImplementationTime * 10));
        switch (recommendation.type) {
            case 'resource_allocation':
                break;
            case 'system_configuration':
                break;
            case 'module_tuning':
                break;
            default:
                throw new Error(`Unsupported recommendation type: ${recommendation.type}`);
        }
    }
    calculateActualImprovement(before, after) {
        const cpuImprovement = before.cpu.usage - after.cpu.usage;
        const memoryImprovement = before.memory.usage - after.memory.usage;
        const workflowImprovement = before.workflow.errorRate - after.workflow.errorRate;
        return (cpuImprovement + memoryImprovement + workflowImprovement * 10) / 3;
    }
    calculateImprovementDetails(before, after) {
        return {
            cpu_usage: before.cpu.usage - after.cpu.usage,
            memory_usage: before.memory.usage - after.memory.usage,
            workflow_error_rate: before.workflow.errorRate - after.workflow.errorRate,
            workflow_response_time: before.workflow.averageExecutionTime - after.workflow.averageExecutionTime
        };
    }
    generateAnalysisId() {
        return `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generatePlanId() {
        return `plan-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateOptimizationId() {
        return `optimization-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateRecommendationId() {
        return `recommendation-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
exports.PerformanceOptimizer = PerformanceOptimizer;
