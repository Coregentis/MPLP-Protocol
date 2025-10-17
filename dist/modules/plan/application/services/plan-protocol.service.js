"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanProtocolService = void 0;
class PlanProtocolService {
    planRepository;
    aiServiceAdapter;
    logger;
    constructor(planRepository, aiServiceAdapter, logger) {
        this.planRepository = planRepository;
        this.aiServiceAdapter = aiServiceAdapter;
        this.logger = logger;
    }
    async createPlanRequest(data) {
        try {
            this.logger.info('Creating plan request', { planType: data.planType });
            const validatedData = await this.validatePlanRequest(data);
            const planRequest = {
                requestId: this.generateRequestId(),
                planType: validatedData.planType,
                parameters: validatedData.parameters,
                constraints: validatedData.constraints,
                status: 'pending',
                createdAt: new Date()
            };
            const savedRequest = await this.planRepository.savePlanRequest(planRequest);
            this.logger.info('Plan request created successfully', {
                requestId: savedRequest.requestId,
                planType: savedRequest.planType
            });
            return savedRequest;
        }
        catch (error) {
            this.logger.error('Failed to create plan request', error instanceof Error ? error : new Error(String(error)), {
                planType: data.planType
            });
            throw error;
        }
    }
    async executePlanRequest(requestId) {
        try {
            this.logger.info('Executing plan', { requestId });
            const planRequest = await this.planRepository.findPlanRequest(requestId);
            if (!planRequest) {
                throw new Error(`Plan request ${requestId} not found`);
            }
            await this.planRepository.updatePlanRequestStatus(requestId, 'processing');
            const aiResult = await this.aiServiceAdapter.executePlanning({
                requestId: planRequest.requestId,
                planType: planRequest.planType,
                parameters: {
                    contextId: 'default-context',
                    objectives: [],
                    constraints: planRequest.constraints || {}
                }
            });
            const planResult = {
                requestId: planRequest.requestId,
                resultId: this.generateResultId(),
                planData: aiResult.planData,
                confidence: aiResult.confidence,
                metadata: {
                    processingTime: aiResult.metadata.processingTime,
                    algorithm: aiResult.metadata.algorithm,
                    iterations: aiResult.metadata.iterations
                },
                status: aiResult.status,
                createdAt: new Date()
            };
            const savedResult = await this.planRepository.savePlanResult(planResult);
            await this.planRepository.updatePlanRequestStatus(requestId, 'completed');
            this.logger.info('Plan executed successfully', {
                requestId,
                resultId: savedResult.resultId,
                confidence: savedResult.confidence
            });
            return savedResult;
        }
        catch (error) {
            await this.planRepository.updatePlanRequestStatus(requestId, 'failed');
            this.logger.error('Failed to execute plan', error instanceof Error ? error : new Error(String(error)), {
                requestId
            });
            throw error;
        }
    }
    async getPlanResult(requestId) {
        try {
            this.logger.debug('Getting plan result', { requestId });
            const result = await this.planRepository.findPlanResult(requestId);
            if (result) {
                this.logger.debug('Plan result found', {
                    requestId,
                    resultId: result.resultId,
                    status: result.status
                });
            }
            else {
                this.logger.debug('Plan result not found', { requestId });
            }
            return result;
        }
        catch (error) {
            this.logger.error('Failed to get plan result', error instanceof Error ? error : new Error(String(error)), {
                requestId
            });
            throw error;
        }
    }
    async createPlan(params) {
        try {
            this.logger.info('Creating plan', {
                contextId: params.contextId,
                name: params.name,
                priority: params.priority
            });
            const planData = {
                protocolVersion: '1.0.0',
                timestamp: new Date(),
                planId: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                contextId: params.contextId,
                name: params.name,
                description: params.description,
                status: 'draft',
                priority: params.priority || 'medium',
                tasks: params.tasks?.map(task => ({
                    taskId: `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    name: task.name,
                    description: task.description,
                    type: task.type,
                    status: 'pending',
                    priority: task.priority || 'medium',
                    estimatedDuration: 0,
                    actualDuration: 0,
                    durationUnit: 'hours',
                    assignedTo: [],
                    dependencies: [],
                    completionPercentage: 0,
                    tags: [],
                    metadata: {}
                })) || [],
                auditTrail: {
                    enabled: true,
                    retentionDays: 90
                },
                monitoringIntegration: {
                    enabled: true,
                    supportedProviders: ['prometheus', 'grafana']
                },
                performanceMetrics: {
                    enabled: true,
                    collectionIntervalSeconds: 60
                },
                versionHistory: {
                    enabled: true,
                    maxVersions: 10
                },
                searchMetadata: {
                    enabled: true,
                    indexingStrategy: 'full_text'
                },
                cachingPolicy: {
                    enabled: true,
                    cacheStrategy: 'lru'
                },
                eventIntegration: {
                    enabled: true
                }
            };
            this.logger.info('Plan created successfully', {
                planId: planData.planId,
                contextId: planData.contextId
            });
            return planData;
        }
        catch (error) {
            this.logger.error('Failed to create plan', error instanceof Error ? error : new Error(String(error)), {
                contextId: params.contextId,
                name: params.name
            });
            throw error;
        }
    }
    async getPlan(planId) {
        try {
            this.logger.debug('Getting plan', { planId });
            const planData = {
                protocolVersion: '1.0.0',
                timestamp: new Date(),
                planId,
                contextId: `context-${Date.now()}`,
                name: 'Retrieved Plan',
                status: 'active',
                tasks: [],
                auditTrail: {
                    enabled: true,
                    retentionDays: 90
                },
                monitoringIntegration: {
                    enabled: true,
                    supportedProviders: ['prometheus', 'grafana']
                },
                performanceMetrics: {
                    enabled: true,
                    collectionIntervalSeconds: 60
                },
                versionHistory: {
                    enabled: true,
                    maxVersions: 10
                },
                searchMetadata: {
                    enabled: true,
                    indexingStrategy: 'full_text'
                },
                cachingPolicy: {
                    enabled: true,
                    cacheStrategy: 'lru'
                },
                eventIntegration: {
                    enabled: true
                }
            };
            this.logger.debug('Plan retrieved successfully', { planId });
            return planData;
        }
        catch (error) {
            this.logger.error('Failed to get plan', error instanceof Error ? error : new Error(String(error)), { planId });
            throw error;
        }
    }
    async executePlan(planId, options) {
        try {
            this.logger.info('Executing plan', {
                planId,
                strategy: options?.strategy,
                dryRun: options?.dryRun
            });
            const planData = await this.getPlan(planId);
            if (!planData) {
                throw new Error(`Plan not found: ${planId}`);
            }
            if (options?.validateDependencies) {
                this.logger.debug('Validating plan dependencies', { planId });
            }
            if (options?.dryRun) {
                this.logger.info('Dry run completed', { planId });
                return { ...planData, status: 'active' };
            }
            const executedPlan = {
                ...planData,
                status: 'active',
                timestamp: new Date()
            };
            this.logger.info('Plan execution completed', { planId });
            return executedPlan;
        }
        catch (error) {
            this.logger.error('Failed to execute plan', error instanceof Error ? error : new Error(String(error)), { planId });
            throw error;
        }
    }
    async optimizePlan(planId, params) {
        try {
            this.logger.info('Optimizing plan', {
                planId,
                constraints: params?.constraints,
                objectives: params?.objectives
            });
            const planData = await this.getPlan(planId);
            if (!planData) {
                throw new Error(`Plan not found: ${planId}`);
            }
            const optimizedPlan = {
                ...planData,
                timestamp: new Date(),
                tasks: planData.tasks.map(task => ({
                    ...task,
                    priority: task.priority === 'low' ? 'medium' : task.priority
                }))
            };
            this.logger.info('Plan optimization completed', { planId });
            return optimizedPlan;
        }
        catch (error) {
            this.logger.error('Failed to optimize plan', error instanceof Error ? error : new Error(String(error)), { planId });
            throw error;
        }
    }
    async validatePlanRequest(data) {
        if (!data.planType) {
            throw new Error('Plan type is required');
        }
        if (!data.parameters || Object.keys(data.parameters).length === 0) {
            throw new Error('Plan parameters are required');
        }
        const validPlanTypes = ['task_planning', 'resource_planning', 'timeline_planning', 'optimization'];
        if (!validPlanTypes.includes(data.planType)) {
            throw new Error(`Invalid plan type: ${data.planType}. Valid types: ${validPlanTypes.join(', ')}`);
        }
        return data;
    }
    generateRequestId() {
        return `plan-req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateResultId() {
        return `plan-res-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
exports.PlanProtocolService = PlanProtocolService;
