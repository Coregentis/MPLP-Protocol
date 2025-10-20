"use strict";
/**
 * AI服务适配器 - AI算法外置实现
 *
 * @description 基于SCTM+GLFB+ITCM方法论，将AI规划算法从L1-L3协议层外置到L4应用层
 * 实现协议边界清晰化，符合MPLP"协议框架"定位
 * @version 2.0.0
 * @layer 基础设施层 - AI服务适配器
 * @refactor AI算法外置，协议边界清晰化
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIServiceAdapterFactory = exports.AIServiceAdapter = void 0;
/**
 * AI服务适配器实现
 *
 * @description 实现AI算法外置，将所有AI决策逻辑移至外部AI服务
 * 协议层只负责请求转发和响应标准化，不包含任何AI算法实现
 */
class AIServiceAdapter {
    constructor(serviceConfig, httpClient) {
        this.serviceConfig = serviceConfig;
        this.httpClient = httpClient;
    }
    /**
     * 执行规划 - AI算法外置
     * 将规划请求转发给外部AI服务
     */
    async executePlanning(request) {
        try {
            // 1. 准备AI服务请求
            const aiRequest = this.prepareAIRequest(request);
            // 2. 调用外部AI服务
            const response = await this.callAIService('/planning/execute', aiRequest);
            // 3. 标准化响应
            return this.standardizeResponse(response.data, request.requestId);
        }
        catch (error) {
            return this.createErrorResponse(request.requestId, error);
        }
    }
    /**
     * 优化计划 - AI算法外置
     * 将优化请求转发给外部AI服务
     */
    async optimizePlan(request) {
        try {
            // 1. 准备优化请求
            const optimizationRequest = {
                ...this.prepareAIRequest(request),
                optimizationType: 'multi_objective',
                algorithms: ['genetic', 'simulated_annealing', 'particle_swarm']
            };
            // 2. 调用外部AI优化服务
            const response = await this.callAIService('/planning/optimize', optimizationRequest);
            // 3. 标准化优化响应
            return this.standardizeResponse(response.data, request.requestId);
        }
        catch (error) {
            return this.createErrorResponse(request.requestId, error);
        }
    }
    /**
     * 验证计划 - AI算法外置
     * 将验证请求转发给外部AI服务
     */
    async validatePlan(request) {
        try {
            // 1. 准备验证请求
            const validationRequest = this.prepareAIRequest(request);
            // 2. 调用外部AI验证服务
            const response = await this.callAIService('/planning/validate', validationRequest);
            // 3. 返回验证结果
            const data = response.data;
            return {
                isValid: data.isValid || false,
                violations: data.violations || [],
                recommendations: data.recommendations || []
            };
        }
        catch (error) {
            return {
                isValid: false,
                violations: [`Validation service error: ${error instanceof Error ? error.message : 'Unknown error'}`],
                recommendations: ['Check AI service connectivity and retry']
            };
        }
    }
    /**
     * 获取AI服务信息
     */
    getServiceInfo() {
        return {
            name: 'MPLP AI Planning Service',
            version: '2.0.0',
            capabilities: [
                'task_planning',
                'resource_planning',
                'timeline_planning',
                'multi_objective_optimization',
                'plan_validation'
            ],
            supportedAlgorithms: [
                'genetic_algorithm',
                'simulated_annealing',
                'particle_swarm_optimization',
                'greedy_heuristic',
                'constraint_satisfaction'
            ],
            maxRequestSize: 10 * 1024 * 1024, // 10MB
            averageResponseTime: 2000 // 2 seconds
        };
    }
    /**
     * AI服务健康检查
     */
    async healthCheck() {
        try {
            const response = await this.callAIService('/health', {});
            const data = response.data;
            return data.status === 'healthy';
        }
        catch {
            return false;
        }
    }
    // ===== 私有辅助方法 =====
    /**
     * 准备AI服务请求
     */
    prepareAIRequest(request) {
        return {
            request_id: request.requestId,
            plan_type: request.planType,
            parameters: {
                context_id: request.parameters.contextId,
                objectives: request.parameters.objectives || [],
                constraints: request.parameters.constraints || {},
                preferences: request.parameters.preferences || {}
            },
            constraints: {
                max_duration: request.constraints?.maxDuration,
                max_cost: request.constraints?.maxCost,
                min_quality: request.constraints?.minQuality,
                resource_limits: request.constraints?.resourceLimits || {}
            },
            timestamp: new Date().toISOString()
        };
    }
    /**
     * 调用AI服务
     */
    async callAIService(endpoint, data) {
        const url = `${this.serviceConfig.endpoint}${endpoint}`;
        return await this.httpClient.post(url, data, {
            headers: {
                'Authorization': `Bearer ${this.serviceConfig.apiKey}`,
                'Content-Type': 'application/json',
                'X-MPLP-Version': '2.0.0'
            },
            timeout: this.serviceConfig.timeout || 30000
        });
    }
    /**
     * 标准化AI服务响应
     */
    standardizeResponse(data, requestId) {
        const responseData = data;
        const metadata = responseData.metadata || {};
        return {
            requestId,
            planData: {
                tasks: Array.isArray(responseData.tasks) ? responseData.tasks.map((task) => ({
                    taskId: String(task.taskId || task.task_id || `task-${Date.now()}`),
                    name: String(task.name || 'Unnamed Task'),
                    description: task.description ? String(task.description) : undefined,
                    type: String(task.type || 'atomic'),
                    priority: task.priority || 'medium',
                    estimatedDuration: typeof (task.estimatedDuration || task.estimated_duration) === 'number' ? Number(task.estimatedDuration || task.estimated_duration) : undefined,
                    dependencies: Array.isArray(task.dependencies) ? task.dependencies.map(String) : []
                })) : [],
                timeline: (() => {
                    const timeline = responseData.timeline;
                    if (typeof timeline === 'object' && timeline) {
                        return {
                            startDate: timeline.startDate || timeline.start_date || new Date().toISOString(),
                            endDate: timeline.endDate || timeline.end_date || new Date().toISOString(),
                            milestones: Array.isArray(timeline.milestones) ? timeline.milestones : []
                        };
                    }
                    return {
                        startDate: new Date().toISOString(),
                        endDate: new Date().toISOString(),
                        milestones: []
                    };
                })(),
                resources: (() => {
                    const resources = responseData.resources;
                    if (typeof resources === 'object' && resources) {
                        return {
                            required: resources.required || {},
                            allocated: resources.allocated || {}
                        };
                    }
                    return {
                        required: {},
                        allocated: {}
                    };
                })()
            },
            confidence: responseData.confidence || 0.8,
            metadata: {
                algorithm: metadata.algorithm || 'unknown',
                processingTime: metadata.processing_time || 0,
                iterations: metadata.iterations,
                optimizationScore: metadata.optimization_score
            },
            status: responseData.status || 'completed',
            error: responseData.error
        };
    }
    /**
     * 创建错误响应
     */
    createErrorResponse(requestId, error) {
        return {
            requestId,
            planData: { tasks: [] },
            confidence: 0,
            metadata: {
                algorithm: 'none',
                processingTime: 0
            },
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown AI service error'
        };
    }
}
exports.AIServiceAdapter = AIServiceAdapter;
/**
 * AI服务适配器工厂
 * 支持多种AI服务提供商
 */
class AIServiceAdapterFactory {
    static create(provider, config, httpClient) {
        switch (provider) {
            case 'openai':
                return new OpenAIServiceAdapter(config, httpClient);
            case 'anthropic':
                return new AnthropicServiceAdapter(config, httpClient);
            case 'custom':
            default:
                return new AIServiceAdapter(config, httpClient);
        }
    }
}
exports.AIServiceAdapterFactory = AIServiceAdapterFactory;
/**
 * OpenAI服务适配器
 */
class OpenAIServiceAdapter extends AIServiceAdapter {
}
/**
 * Anthropic服务适配器
 */
class AnthropicServiceAdapter extends AIServiceAdapter {
}
//# sourceMappingURL=ai-service.adapter.js.map