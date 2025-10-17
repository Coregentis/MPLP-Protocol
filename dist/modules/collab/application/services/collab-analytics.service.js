"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabAnalyticsService = void 0;
class CollabAnalyticsService {
    collabRepository;
    analyticsEngine;
    performanceAnalyzer;
    constructor(collabRepository, analyticsEngine, performanceAnalyzer) {
        this.collabRepository = collabRepository;
        this.analyticsEngine = analyticsEngine;
        this.performanceAnalyzer = performanceAnalyzer;
    }
    async generatePerformanceReport(collaborationId) {
        const collaboration = await this.collabRepository.findById(collaborationId);
        if (!collaboration) {
            throw new Error('Collaboration not found');
        }
        const metrics = await this.calculatePerformanceMetrics(collaboration);
        const trends = await this.analyzeTrends(collaboration);
        const recommendations = await this.generateRecommendations(collaboration, metrics);
        return {
            collaborationId,
            reportGeneratedAt: new Date(),
            metrics,
            trends,
            recommendations,
            healthScore: this.calculateOverallHealthScore(metrics),
            riskAssessment: this.assessRisks(collaboration, metrics)
        };
    }
    async calculatePerformanceMetrics(collaboration) {
        const activeParticipants = collaboration.getActiveParticipants();
        const totalParticipants = collaboration.participants.length;
        return {
            coordinationMetrics: {
                coordinationLatency: this.estimateCoordinationLatency(collaboration),
                coordinationEfficiency: this.calculateCoordinationEfficiency(collaboration),
                coordinationErrors: this.estimateCoordinationErrors(collaboration)
            },
            participantMetrics: {
                totalParticipants,
                activeParticipants: activeParticipants.length,
                averageResponseTime: this.estimateAverageResponseTime(collaboration),
                participantUtilization: activeParticipants.length / totalParticipants,
                utilizationRate: activeParticipants.length / totalParticipants,
                participantSatisfaction: this.estimateParticipantSatisfaction(collaboration)
            },
            taskMetrics: {
                taskCompletionRate: this.calculateTaskCompletionRate(collaboration),
                averageTaskDuration: this.estimateAverageTaskDuration(collaboration),
                taskQualityScore: this.calculateQualityScore(collaboration)
            },
            resourceMetrics: {
                resourceUtilization: this.calculateResourceUtilization(collaboration),
                resourceEfficiency: this.calculateResourceEfficiency(collaboration),
                resourceCost: this.estimateResourceCost(collaboration)
            },
            performanceMetrics: {
                taskCompletionRate: this.calculateTaskCompletionRate(collaboration),
                successRate: this.calculateSuccessRate(collaboration),
                throughput: this.calculateThroughput(collaboration),
                errorRate: this.calculateErrorRate(collaboration)
            }
        };
    }
    async generateRecommendations(_collaboration, metrics) {
        const recommendations = [];
        if (metrics.participantMetrics.participantUtilization < 0.8) {
            recommendations.push({
                category: 'participants',
                priority: 'high',
                title: 'Improve Participant Utilization',
                description: 'Low participant utilization detected. Consider reactivating inactive participants or removing them.',
                actionItems: [
                    'Review inactive participant status',
                    'Conduct participant engagement survey',
                    'Implement participant reactivation strategy'
                ],
                expectedImpact: 'Increase utilization rate by 15-25%',
                estimatedEffort: 'medium'
            });
        }
        return recommendations;
    }
    calculateOverallHealthScore(metrics) {
        const weights = {
            participation: 0.25,
            coordination: 0.25,
            performance: 0.30,
            resource: 0.20
        };
        const participationScore = metrics.participantMetrics.participantUtilization * 100;
        const coordinationScore = metrics.coordinationMetrics.coordinationEfficiency * 100;
        const performanceScore = metrics.performanceMetrics.taskCompletionRate * 100;
        const resourceScore = metrics.resourceMetrics.resourceUtilization * 100;
        return Math.round(participationScore * weights.participation +
            coordinationScore * weights.coordination +
            performanceScore * weights.performance +
            resourceScore * weights.resource);
    }
    assessRisks(_collaboration, metrics) {
        const risks = [];
        if (metrics.participantMetrics.participantUtilization < 0.5) {
            risks.push({
                type: 'participant',
                level: 'high',
                description: 'Very low participant utilization may lead to collaboration failure',
                probability: 0.8,
                impact: 'high',
                mitigation: 'Immediate participant engagement intervention required'
            });
        }
        return {
            overallRiskLevel: this.calculateOverallRiskLevel(risks),
            risks,
            riskScore: this.calculateRiskScore(risks),
            mitigationPriority: this.prioritizeMitigation(risks)
        };
    }
    calculateCoordinationEfficiency(collaboration) {
        const strategy = collaboration.coordinationStrategy;
        const participantCount = collaboration.participants.length;
        let efficiency = 1.0;
        if (strategy.type === 'peer_to_peer' && participantCount > 5) {
            efficiency *= 0.7;
        }
        if (strategy.type === 'centralized' && !strategy.coordinatorId) {
            efficiency *= 0.4;
        }
        return Math.max(0, Math.min(1, efficiency));
    }
    estimateCoordinationLatency(collaboration) {
        const baseLatency = 100;
        const participantCount = collaboration.participants.length;
        const strategy = collaboration.coordinationStrategy;
        let multiplier = 1;
        if (strategy.type === 'centralized')
            multiplier = 1.2;
        else if (strategy.type === 'distributed')
            multiplier = 1.5;
        else if (strategy.type === 'peer_to_peer')
            multiplier = 2.0;
        return baseLatency * multiplier * Math.log(participantCount + 1);
    }
    estimateCoordinationErrors(collaboration) {
        const participantCount = collaboration.participants.length;
        const strategy = collaboration.coordinationStrategy;
        let errorRate = 0.05;
        if (strategy.type === 'peer_to_peer' && participantCount > 10) {
            errorRate += 0.1;
        }
        if (strategy.decisionMaking === 'consensus' && participantCount > 5) {
            errorRate += 0.05;
        }
        return Math.min(1.0, errorRate);
    }
    estimateAverageResponseTime(collaboration) {
        const baseTime = 1000;
        const participantCount = collaboration.participants.length;
        const strategy = collaboration.coordinationStrategy;
        let multiplier = 1;
        if (strategy.type === 'centralized')
            multiplier = 1.2;
        else if (strategy.type === 'distributed')
            multiplier = 1.5;
        else if (strategy.type === 'peer_to_peer')
            multiplier = 2.0;
        return baseTime * multiplier * Math.log(participantCount + 1);
    }
    estimateParticipantSatisfaction(collaboration) {
        const activeParticipants = collaboration.getActiveParticipants();
        const totalParticipants = collaboration.participants.length;
        const utilizationRate = activeParticipants.length / totalParticipants;
        const diversityScore = this.calculateCapabilityDiversity(collaboration);
        return Math.min(10, (utilizationRate * 6) + (diversityScore * 4));
    }
    calculateTaskCompletionRate(collaboration) {
        const strategy = collaboration.coordinationStrategy;
        let completionRate = 0.85;
        if (strategy.type === 'hierarchical')
            completionRate += 0.1;
        if (strategy.decisionMaking === 'coordinator')
            completionRate += 0.05;
        return Math.min(1.0, completionRate);
    }
    estimateAverageTaskDuration(collaboration) {
        const strategy = collaboration.coordinationStrategy;
        const participantCount = collaboration.participants.length;
        let baseDuration = 8;
        if (strategy.type === 'peer_to_peer')
            baseDuration *= 1.5;
        if (strategy.decisionMaking === 'consensus')
            baseDuration *= 1.3;
        if (participantCount > 10)
            baseDuration *= 1.2;
        return baseDuration;
    }
    calculateQualityScore(collaboration) {
        const strategy = collaboration.coordinationStrategy;
        let qualityScore = 7;
        if (strategy.decisionMaking === 'consensus')
            qualityScore += 1.5;
        else if (strategy.decisionMaking === 'majority')
            qualityScore += 1;
        else if (strategy.decisionMaking === 'weighted')
            qualityScore += 1.2;
        if (strategy.type === 'hierarchical')
            qualityScore += 0.5;
        return Math.min(10, qualityScore);
    }
    calculateResourceUtilization(collaboration) {
        const activeParticipants = collaboration.getActiveParticipants();
        const totalParticipants = collaboration.participants.length;
        const utilizationRate = activeParticipants.length / totalParticipants;
        const coordinationEfficiency = this.calculateCoordinationEfficiency(collaboration);
        return (utilizationRate * 0.7) + (coordinationEfficiency * 0.3);
    }
    calculateResourceEfficiency(collaboration) {
        const activeParticipants = collaboration.getActiveParticipants();
        const totalParticipants = collaboration.participants.length;
        const utilizationRate = activeParticipants.length / totalParticipants;
        const coordinationEfficiency = this.calculateCoordinationEfficiency(collaboration);
        return (utilizationRate * 0.6) + (coordinationEfficiency * 0.4);
    }
    estimateResourceCost(collaboration) {
        const participantCount = collaboration.participants.length;
        const baseCostPerParticipant = 100;
        let totalCost = participantCount * baseCostPerParticipant;
        if (collaboration.coordinationStrategy.type === 'peer_to_peer') {
            totalCost *= 1.3;
        }
        return totalCost;
    }
    calculateSuccessRate(collaboration) {
        const coordinationEfficiency = this.calculateCoordinationEfficiency(collaboration);
        const taskCompletionRate = this.calculateTaskCompletionRate(collaboration);
        return (coordinationEfficiency * 0.4) + (taskCompletionRate * 0.6);
    }
    calculateThroughput(collaboration) {
        const activeParticipants = collaboration.getActiveParticipants();
        const baseThroughput = 2;
        return activeParticipants.length * baseThroughput;
    }
    calculateErrorRate(collaboration) {
        const coordinationErrors = this.estimateCoordinationErrors(collaboration);
        const participantCount = collaboration.participants.length;
        let errorRate = coordinationErrors;
        if (participantCount > 20)
            errorRate += 0.05;
        if (participantCount > 50)
            errorRate += 0.1;
        return Math.min(1.0, errorRate);
    }
    calculateCapabilityDiversity(collaboration) {
        const allCapabilities = collaboration.participants.flatMap(p => p.capabilities || []);
        const uniqueCapabilities = new Set(allCapabilities);
        return uniqueCapabilities.size / Math.max(1, allCapabilities.length);
    }
    async analyzeTrends(collaboration) {
        return {
            participantTrends: {
                joinRate: this.calculateJoinRate(collaboration),
                leaveRate: this.calculateLeaveRate(collaboration),
                engagementTrend: this.calculateEngagementTrend(collaboration)
            },
            performanceTrends: {
                productivityTrend: this.calculateProductivityTrend(collaboration),
                qualityTrend: this.calculateQualityTrend(collaboration),
                efficiencyTrend: this.calculateEfficiencyTrend(collaboration)
            },
            coordinationTrends: {
                decisionMakingSpeedTrend: this.calculateDecisionSpeedTrend(collaboration),
                conflictFrequencyTrend: this.calculateConflictTrend(collaboration),
                coordinationEffectivenessTrend: this.calculateCoordinationTrend(collaboration)
            }
        };
    }
    calculateJoinRate(_collaboration) {
        return 0.1;
    }
    calculateLeaveRate(_collaboration) {
        return 0.05;
    }
    calculateEngagementTrend(collaboration) {
        const activeParticipants = collaboration.getActiveParticipants();
        const totalParticipants = collaboration.participants.length;
        const utilizationRate = activeParticipants.length / totalParticipants;
        if (utilizationRate > 0.8)
            return 'increasing';
        if (utilizationRate < 0.6)
            return 'decreasing';
        return 'stable';
    }
    calculateProductivityTrend(_collaboration) {
        return 'increasing';
    }
    calculateQualityTrend(_collaboration) {
        return 'stable';
    }
    calculateEfficiencyTrend(_collaboration) {
        return 'increasing';
    }
    calculateDecisionSpeedTrend(_collaboration) {
        return 'stable';
    }
    calculateConflictTrend(_collaboration) {
        return 'decreasing';
    }
    calculateCoordinationTrend(_collaboration) {
        return 'increasing';
    }
    calculateOverallRiskLevel(risks) {
        const highRisks = risks.filter(r => r.level === 'high').length;
        const mediumRisks = risks.filter(r => r.level === 'medium').length;
        if (highRisks > 0)
            return 'high';
        if (mediumRisks > 1)
            return 'medium';
        return 'low';
    }
    calculateRiskScore(risks) {
        if (risks.length === 0)
            return 0;
        const totalScore = risks.reduce((sum, risk) => {
            let score = 0;
            switch (risk.level) {
                case 'high':
                    score = 8;
                    break;
                case 'medium':
                    score = 5;
                    break;
                case 'low':
                    score = 2;
                    break;
            }
            return sum + (score * risk.probability);
        }, 0);
        return Math.min(10, totalScore / risks.length);
    }
    prioritizeMitigation(risks) {
        const sortedRisks = risks.sort((a, b) => {
            const scoreA = this.getRiskPriorityScore(a);
            const scoreB = this.getRiskPriorityScore(b);
            return scoreB - scoreA;
        });
        return sortedRisks.slice(0, 3).map(risk => risk.mitigation);
    }
    getRiskPriorityScore(risk) {
        let levelScore = 0;
        switch (risk.level) {
            case 'high':
                levelScore = 3;
                break;
            case 'medium':
                levelScore = 2;
                break;
            case 'low':
                levelScore = 1;
                break;
        }
        let impactScore = 0;
        switch (risk.impact) {
            case 'high':
                impactScore = 3;
                break;
            case 'medium':
                impactScore = 2;
                break;
            case 'low':
                impactScore = 1;
                break;
        }
        return (levelScore * 0.4) + (impactScore * 0.3) + (risk.probability * 0.3);
    }
    async analyzeCollaborationEffectiveness(collabId) {
        if (!collabId) {
            throw new Error('Collaboration ID is required');
        }
        const collaboration = await this.collabRepository.findById(collabId);
        if (!collaboration) {
            throw new Error(`Collaboration ${collabId} not found`);
        }
        const overview = await this.analyzeOverviewDimension(collaboration);
        const performance = await this.analyzePerformanceDimension(collaboration);
        const collaborationDimension = await this.analyzeCollaborationDimension(collaboration);
        const insights = await this.analyzeInsightsDimension(collaboration, performance);
        const analysis = {
            collaborationId: collabId,
            analyzedAt: new Date(),
            overview,
            performance,
            collaboration: collaborationDimension,
            insights
        };
        if (this.analyticsEngine && typeof this.analyticsEngine.predict === 'function') {
            try {
                await this.analyticsEngine.predict({
                    type: 'effectiveness_analysis',
                    collaborationId: collabId,
                    overallScore: overview.completionRate,
                    performanceScore: performance.productivity,
                    collaborationScore: collaborationDimension.memberEngagement
                }, 'collaboration_outcome');
            }
            catch (error) {
            }
        }
        return analysis;
    }
    async analyzeOverviewDimension(collaboration) {
        const participants = collaboration.participants || [];
        const collabWithTasks = collaboration;
        const totalTasks = collabWithTasks.tasks?.length || 0;
        const completedTasks = collabWithTasks.tasks?.filter(t => t.status === 'completed').length || 0;
        const durationDays = 1;
        return {
            duration: `${durationDays} days`,
            memberCount: participants.length,
            taskCount: totalTasks,
            completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            status: collaboration.status || 'active'
        };
    }
    async analyzePerformanceDimension(collaboration) {
        let productivity = 0;
        let efficiency = 0;
        let resourceUtilization = 0;
        let timeToCompletion = 0;
        if (this.performanceAnalyzer && typeof this.performanceAnalyzer.analyzePerformance === 'function') {
            try {
                const analysisResult = await this.performanceAnalyzer.analyzePerformance(collaboration);
                productivity = analysisResult.overallScore || 0;
                efficiency = analysisResult.recommendations?.length ? 80 : 60;
                resourceUtilization = analysisResult.overallScore || 0;
                timeToCompletion = analysisResult.recommendations?.length || 1;
            }
            catch (error) {
                productivity = 0;
                efficiency = 0;
                resourceUtilization = 0;
                timeToCompletion = 0;
            }
        }
        else {
            const participants = collaboration.participants || [];
            const collabWithTasks = collaboration;
            const totalTasks = collabWithTasks.tasks?.length || 0;
            const completedTasks = collabWithTasks.tasks?.filter(t => t.status === 'completed').length || 0;
            productivity = participants.length > 0 ? (completedTasks / participants.length) * 10 : 0;
            efficiency = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            resourceUtilization = participants.length > 0 ? Math.min(participants.length * 20, 100) : 0;
            timeToCompletion = totalTasks > 0 ? totalTasks * 2 : 0;
        }
        return {
            productivity: Math.round(productivity * 100) / 100,
            efficiency: Math.round(efficiency * 100) / 100,
            resourceUtilization: Math.round(resourceUtilization * 100) / 100,
            timeToCompletion: Math.round(timeToCompletion * 100) / 100
        };
    }
    async analyzeCollaborationDimension(collaboration) {
        const participants = collaboration.participants || [];
        const activeParticipants = participants.filter(p => p.status === 'active').length;
        const memberEngagement = participants.length > 0 ? (activeParticipants / participants.length) * 100 : 0;
        const communicationEffectiveness = participants.length > 1 ?
            Math.min(participants.length * 15, 100) : 0;
        const conflictResolution = collaboration.status === 'active' ? 85 :
            collaboration.status === 'completed' ? 95 : 60;
        return {
            memberEngagement: Math.round(memberEngagement * 100) / 100,
            communicationEffectiveness: Math.round(communicationEffectiveness * 100) / 100,
            conflictResolution: Math.round(conflictResolution * 100) / 100
        };
    }
    async analyzeInsightsDimension(collaboration, performance) {
        const participants = collaboration.participants || [];
        const collabWithTasks = collaboration;
        const totalTasks = collabWithTasks.tasks?.length || 0;
        const completedTasks = collabWithTasks.tasks?.filter(t => t.status === 'completed').length || 0;
        const strengths = [];
        if (performance.efficiency > 80)
            strengths.push('High task completion efficiency');
        if (participants.length >= 3)
            strengths.push('Good team size for collaboration');
        if (performance.productivity > 5)
            strengths.push('Strong productivity metrics');
        if (collaboration.status === 'active')
            strengths.push('Active collaboration status');
        const weaknesses = [];
        if (performance.efficiency < 50)
            weaknesses.push('Low task completion rate');
        if (participants.length < 2)
            weaknesses.push('Insufficient team members');
        if (performance.resourceUtilization < 60)
            weaknesses.push('Underutilized resources');
        if (totalTasks === 0)
            weaknesses.push('No tasks assigned');
        const recommendations = [];
        if (performance.efficiency < 70)
            recommendations.push('Improve task management and tracking');
        if (participants.length < 3)
            recommendations.push('Consider adding more team members');
        if (performance.resourceUtilization < 80)
            recommendations.push('Optimize resource allocation');
        if (completedTasks === 0 && totalTasks > 0)
            recommendations.push('Focus on completing pending tasks');
        const riskFactors = [];
        if (performance.efficiency < 30)
            riskFactors.push('Very low completion rate - project at risk');
        if (participants.length === 1)
            riskFactors.push('Single point of failure - no redundancy');
        if (collaboration.status === 'inactive')
            riskFactors.push('Inactive collaboration status');
        return {
            strengths,
            weaknesses,
            recommendations,
            riskFactors
        };
    }
    async analyzeCollaborationPatterns(collabId) {
        if (!collabId) {
            throw new Error('Collaboration ID is required');
        }
        const collaboration = await this.collabRepository.findById(collabId);
        if (!collaboration) {
            throw new Error(`Collaboration ${collabId} not found`);
        }
        const participants = collaboration.participants || [];
        const communicationPatterns = {
            frequency: participants.length > 3 ? 'high' : participants.length > 1 ? 'medium' : 'low',
            channels: ['direct', 'group'],
            peakTimes: ['09:00-12:00', '14:00-17:00'],
            responseTime: participants.length > 5 ? 'fast' : 'normal'
        };
        const collaborationPatterns = {
            workStyle: collaboration.mode === 'parallel' ? 'real-time' : 'asynchronous',
            decisionMaking: 'consensus',
            taskDistribution: 'balanced',
            knowledgeSharing: participants.length > 2 ? 'active' : 'limited'
        };
        const performancePatterns = {
            productivity: 'steady',
            quality: 'consistent',
            efficiency: 'improving',
            bottlenecks: participants.length < 2 ? ['resource_constraint'] : []
        };
        return {
            collaborationId: collabId,
            analyzedAt: new Date(),
            communicationPatterns,
            collaborationPatterns,
            performancePatterns,
            recommendations: [
                'Maintain current communication frequency',
                'Consider adding more collaboration channels',
                'Monitor performance trends regularly'
            ]
        };
    }
    async optimizeCollaborationConfiguration(collabId) {
        if (!collabId) {
            throw new Error('Collaboration ID is required');
        }
        const collaboration = await this.collabRepository.findById(collabId);
        if (!collaboration) {
            throw new Error(`Collaboration ${collabId} not found`);
        }
        const participants = collaboration.participants || [];
        const currentConfig = {
            teamSize: participants.length,
            mode: collaboration.mode,
            coordinationStrategy: collaboration.coordinationStrategy?.type || 'default'
        };
        const optimizations = [];
        if (participants.length < 2) {
            optimizations.push({
                category: 'team_composition',
                current: `${participants.length} members`,
                recommended: '3-5 members',
                impact: 'high',
                reason: 'Insufficient team members for effective collaboration'
            });
        }
        if (collaboration.mode === 'sequential' && participants.length > 5) {
            optimizations.push({
                category: 'collaboration_mode',
                current: 'sequential',
                recommended: 'hybrid',
                impact: 'medium',
                reason: 'Large teams benefit from mixed parallel/sequential approach'
            });
        }
        optimizations.push({
            category: 'coordination',
            current: currentConfig.coordinationStrategy,
            recommended: 'adaptive',
            impact: 'medium',
            reason: 'Adaptive coordination improves flexibility'
        });
        return {
            collaborationId: collabId,
            optimizedAt: new Date(),
            currentConfiguration: currentConfig,
            optimizations,
            expectedImprovements: {
                productivity: optimizations.length > 0 ? 15 : 5,
                efficiency: optimizations.length > 0 ? 20 : 5,
                satisfaction: optimizations.length > 0 ? 10 : 2
            },
            implementationPriority: optimizations.length > 2 ? 'high' : 'medium'
        };
    }
    async predictCollaborationOutcome(collabId) {
        if (!collabId) {
            throw new Error('Collaboration ID is required');
        }
        const collaboration = await this.collabRepository.findById(collabId);
        if (!collaboration) {
            throw new Error(`Collaboration ${collabId} not found`);
        }
        let prediction = null;
        if (this.analyticsEngine && typeof this.analyticsEngine.predict === 'function') {
            try {
                const features = {
                    teamSize: collaboration.participants?.length || 0,
                    mode: collaboration.mode,
                    status: collaboration.status,
                    coordinationStrategy: collaboration.coordinationStrategy?.type || 'default'
                };
                prediction = await this.analyticsEngine.predict(features, 'collaboration_outcome');
            }
            catch (error) {
                prediction = null;
            }
        }
        const participants = collaboration.participants || [];
        const successProbability = prediction?.successProbability ||
            (participants.length >= 2 && collaboration.status === 'active' ? 0.75 : 0.45);
        const expectedDuration = prediction?.expectedDuration ||
            Math.max(participants.length * 2, 5);
        const riskLevel = prediction?.riskLevel ||
            (participants.length < 2 ? 'high' : successProbability > 0.7 ? 'low' : 'medium');
        return {
            collaborationId: collabId,
            predictedAt: new Date(),
            successProbability,
            expectedDuration,
            riskLevel,
            confidenceLevel: prediction?.confidence || 0.7,
            keyFactors: {
                positive: prediction?.positiveFactors || [
                    'Active collaboration status',
                    'Adequate team size',
                    'Clear coordination strategy'
                ],
                negative: prediction?.negativeFactors || [
                    participants.length < 2 ? 'Insufficient team members' : null,
                    collaboration.status !== 'active' ? 'Inactive status' : null
                ].filter((item) => Boolean(item)),
                critical: prediction?.criticalFactors || []
            },
            recommendations: prediction?.recommendations || [
                'Monitor team engagement regularly',
                'Ensure clear communication channels',
                'Track progress against milestones'
            ],
            nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
    }
}
exports.CollabAnalyticsService = CollabAnalyticsService;
