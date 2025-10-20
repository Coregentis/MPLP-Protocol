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
    confidence: number;
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
    post(url: string, data: unknown, config?: Record<string, unknown>): Promise<{
        data: unknown;
    }>;
    get(url: string, config?: Record<string, unknown>): Promise<{
        data: unknown;
    }>;
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
export declare class AIServiceAdapter implements IAIServiceAdapter {
    private readonly serviceConfig;
    private readonly httpClient;
    constructor(serviceConfig: AIServiceConfig, httpClient: IHttpClient);
    /**
     * 执行规划 - AI算法外置
     * 将规划请求转发给外部AI服务
     */
    executePlanning(request: AIServiceRequest): Promise<AIServiceResponse>;
    /**
     * 优化计划 - AI算法外置
     * 将优化请求转发给外部AI服务
     */
    optimizePlan(request: AIServiceRequest): Promise<AIServiceResponse>;
    /**
     * 验证计划 - AI算法外置
     * 将验证请求转发给外部AI服务
     */
    validatePlan(request: AIServiceRequest): Promise<{
        isValid: boolean;
        violations: string[];
        recommendations: string[];
    }>;
    /**
     * 获取AI服务信息
     */
    getServiceInfo(): AIServiceInfo;
    /**
     * AI服务健康检查
     */
    healthCheck(): Promise<boolean>;
    /**
     * 准备AI服务请求
     */
    private prepareAIRequest;
    /**
     * 调用AI服务
     */
    private callAIService;
    /**
     * 标准化AI服务响应
     */
    private standardizeResponse;
    /**
     * 创建错误响应
     */
    private createErrorResponse;
}
/**
 * AI服务适配器工厂
 * 支持多种AI服务提供商
 */
export declare class AIServiceAdapterFactory {
    static create(provider: 'openai' | 'anthropic' | 'custom', config: AIServiceConfig, httpClient: IHttpClient): IAIServiceAdapter;
}
//# sourceMappingURL=ai-service.adapter.d.ts.map