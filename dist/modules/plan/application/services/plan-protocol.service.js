"use strict";
/**
 * Plan协议服务 - 规划协议管理 (重构版本)
 *
 * @description 基于Plan模块重构指南的规划协议路由和管理服务
 * 整合PlanManagementService功能，实现标准3个企业级服务架构
 * 职责：协议路由、请求验证、响应标准化、AI算法外置调用、计划CRUD操作
 * @version 3.0.0 - 服务整合版本
 * @layer 应用层 - 协议管理服务
 * @standard 统一企业级质量标准
 * @refactor 整合管理服务功能，AI算法外置，协议边界清晰化
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanProtocolService = void 0;
/**
 * Plan协议服务 - 规划协议路由和管理服务 (重构整合版本)
 *
 * @description 基于Plan模块重构指南的协议管理服务
 * 整合原PlanManagementService功能，实现统一的协议管理
 * 职责：协议路由、请求验证、响应标准化、AI算法外置调用、计划CRUD操作
 * @standard 统一企业级质量标准
 */
class PlanProtocolService {
    constructor(planRepository, aiServiceAdapter, logger) {
        this.planRepository = planRepository;
        this.aiServiceAdapter = aiServiceAdapter;
        this.logger = logger;
    }
    // ===== 规划协议管理核心方法 (基于重构指南) =====
    /**
     * 创建规划请求
     * 基于重构指南的规划请求创建逻辑
     */
    async createPlanRequest(data) {
        try {
            this.logger.info('Creating plan request', { planType: data.planType });
            // 1. 验证请求数据
            const validatedData = await this.validatePlanRequest(data);
            // 2. 创建规划请求实体
            const planRequest = {
                requestId: this.generateRequestId(),
                planType: validatedData.planType,
                parameters: validatedData.parameters,
                constraints: validatedData.constraints,
                status: 'pending',
                createdAt: new Date()
            };
            // 3. 持久化请求
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
    /**
     * 执行规划请求 - AI算法外置调用
     * 基于重构指南的AI服务调用逻辑
     */
    async executePlanRequest(requestId) {
        try {
            this.logger.info('Executing plan', { requestId });
            // 1. 获取规划请求
            const planRequest = await this.planRepository.findPlanRequest(requestId);
            if (!planRequest) {
                throw new Error(`Plan request ${requestId} not found`);
            }
            // 2. 更新请求状态为处理中
            await this.planRepository.updatePlanRequestStatus(requestId, 'processing');
            // 3. 调用AI服务执行规划 (AI算法外置)
            const aiResult = await this.aiServiceAdapter.executePlanning({
                requestId: planRequest.requestId,
                planType: planRequest.planType,
                parameters: {
                    contextId: 'default-context',
                    objectives: [],
                    constraints: planRequest.constraints || {}
                }
            });
            // 4. 标准化AI服务响应
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
            // 5. 持久化结果
            const savedResult = await this.planRepository.savePlanResult(planResult);
            // 6. 更新请求状态
            await this.planRepository.updatePlanRequestStatus(requestId, 'completed');
            this.logger.info('Plan executed successfully', {
                requestId,
                resultId: savedResult.resultId,
                confidence: savedResult.confidence
            });
            return savedResult;
        }
        catch (error) {
            // 更新请求状态为失败
            await this.planRepository.updatePlanRequestStatus(requestId, 'failed');
            this.logger.error('Failed to execute plan', error instanceof Error ? error : new Error(String(error)), {
                requestId
            });
            throw error;
        }
    }
    /**
     * 获取规划结果
     * 基于重构指南的结果查询逻辑
     */
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
    // ===== 计划管理方法 (整合自PlanManagementService) =====
    /**
     * 创建计划
     * 整合自PlanManagementService的计划创建功能
     */
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
    /**
     * 获取计划
     * 整合自PlanManagementService的计划查询功能
     */
    async getPlan(planId) {
        try {
            this.logger.debug('Getting plan', { planId });
            // TODO: 实现实际的数据库查询
            // 临时实现：返回模拟数据
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
    /**
     * 执行计划
     * 整合自PlanManagementService的计划执行功能
     */
    async executePlan(planId, options) {
        try {
            this.logger.info('Executing plan', {
                planId,
                strategy: options?.strategy,
                dryRun: options?.dryRun
            });
            // 获取计划数据
            const planData = await this.getPlan(planId);
            if (!planData) {
                throw new Error(`Plan not found: ${planId}`);
            }
            // 验证依赖关系
            if (options?.validateDependencies) {
                this.logger.debug('Validating plan dependencies', { planId });
                // TODO: 实现依赖验证逻辑
            }
            // 如果是试运行，不实际执行
            if (options?.dryRun) {
                this.logger.info('Dry run completed', { planId });
                return { ...planData, status: 'active' };
            }
            // 更新计划状态为执行中
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
    /**
     * 优化计划
     * 整合自PlanManagementService的计划优化功能
     */
    async optimizePlan(planId, params) {
        try {
            this.logger.info('Optimizing plan', {
                planId,
                constraints: params?.constraints,
                objectives: params?.objectives
            });
            // 获取计划数据
            const planData = await this.getPlan(planId);
            if (!planData) {
                throw new Error(`Plan not found: ${planId}`);
            }
            // TODO: 调用AI服务适配器进行优化
            // const optimizationRequest = {
            //   planId,
            //   currentPlan: planData,
            //   constraints: params?.constraints || {},
            //   objectives: params?.objectives || ['time_optimal']
            // };
            // const optimizedResult = await this.aiServiceAdapter.optimizePlan(optimizationRequest);
            // 临时实现：返回优化后的计划
            const optimizedPlan = {
                ...planData,
                timestamp: new Date(),
                // 模拟优化结果
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
    // ===== 私有辅助方法 =====
    /**
     * 验证规划请求
     * 基于重构指南的请求验证逻辑
     */
    async validatePlanRequest(data) {
        // 验证请求数据的完整性和正确性
        if (!data.planType) {
            throw new Error('Plan type is required');
        }
        if (!data.parameters || Object.keys(data.parameters).length === 0) {
            throw new Error('Plan parameters are required');
        }
        // 验证计划类型
        const validPlanTypes = ['task_planning', 'resource_planning', 'timeline_planning', 'optimization'];
        if (!validPlanTypes.includes(data.planType)) {
            throw new Error(`Invalid plan type: ${data.planType}. Valid types: ${validPlanTypes.join(', ')}`);
        }
        return data;
    }
    /**
     * 生成请求ID
     */
    generateRequestId() {
        return `plan-req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * 生成结果ID
     */
    generateResultId() {
        return `plan-res-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
exports.PlanProtocolService = PlanProtocolService;
//# sourceMappingURL=plan-protocol.service.js.map