"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextServicesCoordinator = void 0;
class ContextServicesCoordinator {
    managementService;
    analyticsService;
    securityService;
    logger;
    constructor(managementService, analyticsService, securityService, logger) {
        this.managementService = managementService;
        this.analyticsService = analyticsService;
        this.securityService = securityService;
        this.logger = logger;
    }
    async createContextWithFullCoordination(data, userId) {
        const startTime = Date.now();
        const operation = 'create_context_coordinated';
        const servicesInvolved = [];
        const errors = [];
        const warnings = [];
        try {
            this.logger.info('Starting coordinated context creation', {
                name: data.name,
                userId
            });
            servicesInvolved.push('ContextSecurityService');
            const canCreate = await this.securityService.validateAccess('system', userId, 'create');
            if (!canCreate) {
                errors.push('User does not have permission to create contexts');
                return this.createErrorResult(operation, errors, servicesInvolved, startTime);
            }
            servicesInvolved.push('ContextManagementService');
            const context = await this.managementService.createContext(data);
            servicesInvolved.push('ContextAnalyticsService');
            try {
                await this.analyticsService.updateSearchIndex(context.contextId);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                warnings.push(`Failed to initialize search index: ${errorMessage}`);
                this.logger.warn('Search index initialization failed', {
                    contextId: context.contextId,
                    error: errorMessage
                });
            }
            try {
                await this.securityService.applySecurityPolicy(context.contextId, {
                    id: 'default-policy',
                    type: 'access_control',
                    name: 'Default Access Control',
                    rules: [
                        { condition: 'user.authenticated', action: 'allow' },
                        { condition: 'user.role.admin', action: 'allow' }
                    ],
                    enabled: true
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                warnings.push(`Failed to apply default security policy: ${errorMessage}`);
                this.logger.warn('Default security policy application failed', {
                    contextId: context.contextId,
                    error: errorMessage
                });
            }
            const duration = Date.now() - startTime;
            this.logger.info('Coordinated context creation completed', {
                contextId: context.contextId,
                duration,
                servicesInvolved: servicesInvolved.length,
                warnings: warnings.length
            });
            return {
                success: true,
                contextId: context.contextId,
                operation,
                timestamp: new Date(),
                data: context,
                warnings: warnings.length > 0 ? warnings : undefined,
                performance: {
                    duration,
                    servicesInvolved
                }
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(errorMessage);
            this.logger.error('Coordinated context creation failed', error, {
                name: data.name,
                userId,
                servicesInvolved
            });
            return this.createErrorResult(operation, errors, servicesInvolved, startTime);
        }
    }
    async performHealthCheck(contextId) {
        try {
            this.logger.info('Performing context health check', { contextId });
            const [managementHealth, analyticsHealth, securityHealth] = await Promise.allSettled([
                this.checkManagementHealth(contextId),
                this.checkAnalyticsHealth(contextId),
                this.checkSecurityHealth(contextId)
            ]);
            const mgmtStatus = managementHealth.status === 'fulfilled' ?
                managementHealth.value : 'critical';
            const analyticsStatus = analyticsHealth.status === 'fulfilled' ?
                analyticsHealth.value : 'critical';
            const securityStatus = securityHealth.status === 'fulfilled' ?
                securityHealth.value : 'critical';
            const overallHealth = this.calculateOverallHealth(mgmtStatus, analyticsStatus, securityStatus);
            const recommendations = this.generateHealthRecommendations(mgmtStatus, analyticsStatus, securityStatus);
            const healthCheck = {
                contextId,
                overallHealth,
                managementHealth: mgmtStatus,
                analyticsHealth: analyticsStatus,
                securityHealth: securityStatus,
                recommendations,
                lastChecked: new Date()
            };
            this.logger.info('Context health check completed', {
                contextId,
                overallHealth,
                recommendationsCount: recommendations.length
            });
            return healthCheck;
        }
        catch (error) {
            this.logger.error('Context health check failed', error, { contextId });
            return {
                contextId,
                overallHealth: 'critical',
                managementHealth: 'critical',
                analyticsHealth: 'critical',
                securityHealth: 'critical',
                recommendations: ['System health check failed - investigate immediately'],
                lastChecked: new Date()
            };
        }
    }
    async generateOptimizationRecommendations(contextId) {
        try {
            this.logger.info('Generating optimization recommendations', { contextId });
            const [analysis, securityAudit] = await Promise.all([
                this.analyticsService.analyzeContext(contextId),
                this.securityService.performSecurityAudit(contextId)
            ]);
            const recommendations = [];
            if (analysis.performance.responseTime.average > 100) {
                recommendations.push({
                    category: 'performance',
                    priority: 'high',
                    description: 'Response time exceeds target (100ms)',
                    action: 'Optimize database queries and implement better caching',
                    estimatedImpact: 'Reduce response time by 30-50%'
                });
            }
            if (analysis.performance.cacheMetrics.hitRate < 0.8) {
                recommendations.push({
                    category: 'performance',
                    priority: 'medium',
                    description: 'Cache hit rate below optimal threshold (80%)',
                    action: 'Review cache strategy and increase TTL for stable data',
                    estimatedImpact: 'Improve cache hit rate to 85%+'
                });
            }
            if (securityAudit.securityScore < 80) {
                recommendations.push({
                    category: 'security',
                    priority: 'high',
                    description: `Security score below target (${securityAudit.securityScore}/100)`,
                    action: 'Review access controls and implement additional security measures',
                    estimatedImpact: 'Improve security score to 85%+'
                });
            }
            if (analysis.usage.accessCount < 10) {
                recommendations.push({
                    category: 'usage',
                    priority: 'low',
                    description: 'Low usage detected - context may be underutilized',
                    action: 'Review context visibility and user onboarding process',
                    estimatedImpact: 'Increase user engagement by 20%+'
                });
            }
            const context = await this.managementService.getContext(contextId);
            if (context && this.isMaintenanceNeeded(context)) {
                recommendations.push({
                    category: 'maintenance',
                    priority: 'medium',
                    description: 'Context requires routine maintenance',
                    action: 'Schedule maintenance window for optimization and cleanup',
                    estimatedImpact: 'Improve overall system stability'
                });
            }
            this.logger.info('Optimization recommendations generated', {
                contextId,
                recommendationsCount: recommendations.length
            });
            return {
                contextId,
                recommendations,
                generatedAt: new Date()
            };
        }
        catch (error) {
            this.logger.error('Failed to generate optimization recommendations', error, { contextId });
            throw error;
        }
    }
    async checkManagementHealth(contextId) {
        try {
            const context = await this.managementService.getContext(contextId);
            return context ? 'healthy' : 'critical';
        }
        catch {
            return 'critical';
        }
    }
    async checkAnalyticsHealth(contextId) {
        try {
            const performance = await this.analyticsService.analyzePerformance(contextId);
            return performance.responseTime.average < 200 ? 'healthy' : 'warning';
        }
        catch {
            return 'critical';
        }
    }
    async checkSecurityHealth(contextId) {
        try {
            const audit = await this.securityService.performSecurityAudit(contextId);
            if (audit.securityScore >= 80)
                return 'healthy';
            if (audit.securityScore >= 60)
                return 'warning';
            return 'critical';
        }
        catch {
            return 'critical';
        }
    }
    calculateOverallHealth(mgmt, analytics, security) {
        const scores = { healthy: 3, warning: 2, critical: 1 };
        const totalScore = scores[mgmt] + scores[analytics] + scores[security];
        if (totalScore >= 8)
            return 'healthy';
        if (totalScore >= 6)
            return 'warning';
        return 'critical';
    }
    generateHealthRecommendations(mgmt, analytics, security) {
        const recommendations = [];
        if (mgmt === 'critical')
            recommendations.push('Investigate context management service issues');
        if (analytics === 'critical')
            recommendations.push('Review analytics service configuration');
        if (security === 'critical')
            recommendations.push('Address security vulnerabilities immediately');
        if (mgmt === 'warning')
            recommendations.push('Monitor context management performance');
        if (analytics === 'warning')
            recommendations.push('Optimize analytics queries and caching');
        if (security === 'warning')
            recommendations.push('Review and update security policies');
        return recommendations;
    }
    isMaintenanceNeeded(context) {
        if (!context.updatedAt)
            return false;
        const daysSinceUpdate = Math.floor((Date.now() - context.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceUpdate > 30;
    }
    createErrorResult(operation, errors, servicesInvolved, startTime) {
        return {
            success: false,
            contextId: 'unknown',
            operation,
            timestamp: new Date(),
            errors,
            performance: {
                duration: Date.now() - startTime,
                servicesInvolved
            }
        };
    }
}
exports.ContextServicesCoordinator = ContextServicesCoordinator;
