/**
 * AI服务适配器 - AI算法外置实现
 * 
 * @description 基于SCTM+GLFB+ITCM方法论，将AI规划算法从L1-L3协议层外置到L4应用层
 * 实现协议边界清晰化，符合MPLP"协议框架"定位
 * @version 2.0.0
 * @layer 基础设施层 - AI服务适配器
 * @refactor AI算法外置，协议边界清晰化
 */

import { UUID } from '../../../../shared/types';

// ===== AI服务接口定义 =====
export interface AIServiceRequest {
  requestId: string;
  planType: 'task_planning' | 'resource_planning' | 'timeline_planning' | 'optimization';
  parameters: {
    contextId: UUID;
    objectives?: string[];
    constraints?: Record<string, unknown>;
    preferences?: Record<string, unknown>;
  };
  constraints?: {
    maxDuration?: number;
    maxCost?: number;
    minQuality?: number;
    resourceLimits?: Record<string, number>;
  };
}

export interface AIServiceResponse {
  requestId: string;
  planData: {
    tasks?: Array<{
      taskId: string;
      name: string;
      description?: string;
      type: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      estimatedDuration?: number;
      dependencies?: string[];
    }>;
    timeline?: {
      startDate: string;
      endDate: string;
      milestones?: Array<{
        name: string;
        date: string;
        description?: string;
      }>;
    };
    resources?: {
      required?: Record<string, number>;
      allocated?: Record<string, number>;
    };
  };
  confidence: number; // 0-1
  metadata: {
    algorithm?: string;
    processingTime: number;
    iterations?: number;
    optimizationScore?: number;
  };
  status: 'completed' | 'failed' | 'partial';
  error?: string;
}

export interface AIServiceInfo {
  name: string;
  version: string;
  capabilities: string[];
  supportedAlgorithms: string[];
  maxRequestSize: number;
  averageResponseTime: number;
}

export interface AIServiceConfig {
  endpoint: string;
  apiKey: string;
  timeout?: number;
  retryAttempts?: number;
  fallbackService?: string;
}

export interface IHttpClient {
  post(url: string, data: unknown, config?: Record<string, unknown>): Promise<{ data: unknown }>;
  get(url: string, config?: Record<string, unknown>): Promise<{ data: unknown }>;
}

/**
 * AI服务适配器接口
 * 支持多种AI服务的统一接口
 */
export interface IAIServiceAdapter {
  executePlanning(request: AIServiceRequest): Promise<AIServiceResponse>;
  optimizePlan(request: AIServiceRequest): Promise<AIServiceResponse>;
  validatePlan(request: AIServiceRequest): Promise<{
    isValid: boolean;
    violations: string[];
    recommendations: string[];
  }>;
  getServiceInfo(): AIServiceInfo;
  healthCheck(): Promise<boolean>;
}

/**
 * AI服务适配器实现
 * 
 * @description 实现AI算法外置，将所有AI决策逻辑移至外部AI服务
 * 协议层只负责请求转发和响应标准化，不包含任何AI算法实现
 */
export class AIServiceAdapter implements IAIServiceAdapter {
  
  constructor(
    private readonly serviceConfig: AIServiceConfig,
    private readonly httpClient: IHttpClient
  ) {}

  /**
   * 执行规划 - AI算法外置
   * 将规划请求转发给外部AI服务
   */
  async executePlanning(request: AIServiceRequest): Promise<AIServiceResponse> {
    try {
      // 1. 准备AI服务请求
      const aiRequest = this.prepareAIRequest(request);
      
      // 2. 调用外部AI服务
      const response = await this.callAIService('/planning/execute', aiRequest);
      
      // 3. 标准化响应
      return this.standardizeResponse(response.data, request.requestId);
    } catch (error) {
      return this.createErrorResponse(request.requestId, error);
    }
  }

  /**
   * 优化计划 - AI算法外置
   * 将优化请求转发给外部AI服务
   */
  async optimizePlan(request: AIServiceRequest): Promise<AIServiceResponse> {
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
    } catch (error) {
      return this.createErrorResponse(request.requestId, error);
    }
  }

  /**
   * 验证计划 - AI算法外置
   * 将验证请求转发给外部AI服务
   */
  async validatePlan(request: AIServiceRequest): Promise<{
    isValid: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    try {
      // 1. 准备验证请求
      const validationRequest = this.prepareAIRequest(request);
      
      // 2. 调用外部AI验证服务
      const response = await this.callAIService('/planning/validate', validationRequest);
      
      // 3. 返回验证结果
      const data = response.data as Record<string, unknown>;
      return {
        isValid: (data.isValid as boolean) || false,
        violations: (data.violations as string[]) || [],
        recommendations: (data.recommendations as string[]) || []
      };
    } catch (error) {
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
  getServiceInfo(): AIServiceInfo {
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
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.callAIService('/health', {});
      const data = response.data as Record<string, unknown>;
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 准备AI服务请求
   */
  private prepareAIRequest(request: AIServiceRequest): Record<string, unknown> {
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
  private async callAIService(endpoint: string, data: unknown): Promise<{ data: unknown }> {
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
  private standardizeResponse(data: unknown, requestId: string): AIServiceResponse {
    const responseData = data as Record<string, unknown>;
    const metadata = responseData.metadata as Record<string, unknown> || {};

    return {
      requestId,
      planData: {
        tasks: Array.isArray(responseData.tasks) ? responseData.tasks.map((task: Record<string, unknown>) => ({
          taskId: String(task.taskId || task.task_id || `task-${Date.now()}`),
          name: String(task.name || 'Unnamed Task'),
          description: task.description ? String(task.description) : undefined,
          type: String(task.type || 'atomic'),
          priority: (task.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
          estimatedDuration: typeof (task.estimatedDuration || task.estimated_duration) === 'number' ? Number(task.estimatedDuration || task.estimated_duration) : undefined,
          dependencies: Array.isArray(task.dependencies) ? task.dependencies.map(String) : []
        })) : [],
        timeline: (() => {
          const timeline = responseData.timeline as Record<string, unknown>;
          if (typeof timeline === 'object' && timeline) {
            return {
              startDate: (timeline.startDate as string) || (timeline.start_date as string) || new Date().toISOString(),
              endDate: (timeline.endDate as string) || (timeline.end_date as string) || new Date().toISOString(),
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
          const resources = responseData.resources as Record<string, unknown>;
          if (typeof resources === 'object' && resources) {
            return {
              required: (resources.required as Record<string, number>) || {},
              allocated: (resources.allocated as Record<string, number>) || {}
            };
          }
          return {
            required: {},
            allocated: {}
          };
        })()
      },
      confidence: (responseData.confidence as number) || 0.8,
      metadata: {
        algorithm: (metadata.algorithm as string) || 'unknown',
        processingTime: (metadata.processing_time as number) || 0,
        iterations: metadata.iterations as number,
        optimizationScore: metadata.optimization_score as number
      },
      status: (responseData.status as 'completed' | 'failed') || 'completed',
      error: responseData.error as string
    };
  }

  /**
   * 创建错误响应
   */
  private createErrorResponse(requestId: string, error: unknown): AIServiceResponse {
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

/**
 * AI服务适配器工厂
 * 支持多种AI服务提供商
 */
export class AIServiceAdapterFactory {
  
  static create(
    provider: 'openai' | 'anthropic' | 'custom',
    config: AIServiceConfig,
    httpClient: IHttpClient
  ): IAIServiceAdapter {
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

/**
 * OpenAI服务适配器
 */
class OpenAIServiceAdapter extends AIServiceAdapter {
  // OpenAI特定的实现
}

/**
 * Anthropic服务适配器
 */
class AnthropicServiceAdapter extends AIServiceAdapter {
  // Anthropic特定的实现
}
