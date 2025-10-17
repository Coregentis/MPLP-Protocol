"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIServiceAdapterFactory = exports.AIServiceAdapter = void 0;
class AIServiceAdapter {
    serviceConfig;
    httpClient;
    constructor(serviceConfig, httpClient) {
        this.serviceConfig = serviceConfig;
        this.httpClient = httpClient;
    }
    async executePlanning(request) {
        try {
            const aiRequest = this.prepareAIRequest(request);
            const response = await this.callAIService('/planning/execute', aiRequest);
            return this.standardizeResponse(response.data, request.requestId);
        }
        catch (error) {
            return this.createErrorResponse(request.requestId, error);
        }
    }
    async optimizePlan(request) {
        try {
            const optimizationRequest = {
                ...this.prepareAIRequest(request),
                optimizationType: 'multi_objective',
                algorithms: ['genetic', 'simulated_annealing', 'particle_swarm']
            };
            const response = await this.callAIService('/planning/optimize', optimizationRequest);
            return this.standardizeResponse(response.data, request.requestId);
        }
        catch (error) {
            return this.createErrorResponse(request.requestId, error);
        }
    }
    async validatePlan(request) {
        try {
            const validationRequest = this.prepareAIRequest(request);
            const response = await this.callAIService('/planning/validate', validationRequest);
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
            maxRequestSize: 10 * 1024 * 1024,
            averageResponseTime: 2000
        };
    }
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
class OpenAIServiceAdapter extends AIServiceAdapter {
}
class AnthropicServiceAdapter extends AIServiceAdapter {
}
