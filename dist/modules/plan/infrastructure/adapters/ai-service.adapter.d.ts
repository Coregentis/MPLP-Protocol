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
export declare class AIServiceAdapter implements IAIServiceAdapter {
    private readonly serviceConfig;
    private readonly httpClient;
    constructor(serviceConfig: AIServiceConfig, httpClient: IHttpClient);
    executePlanning(request: AIServiceRequest): Promise<AIServiceResponse>;
    optimizePlan(request: AIServiceRequest): Promise<AIServiceResponse>;
    validatePlan(request: AIServiceRequest): Promise<{
        isValid: boolean;
        violations: string[];
        recommendations: string[];
    }>;
    getServiceInfo(): AIServiceInfo;
    healthCheck(): Promise<boolean>;
    private prepareAIRequest;
    private callAIService;
    private standardizeResponse;
    private createErrorResponse;
}
export declare class AIServiceAdapterFactory {
    static create(provider: 'openai' | 'anthropic' | 'custom', config: AIServiceConfig, httpClient: IHttpClient): IAIServiceAdapter;
}
//# sourceMappingURL=ai-service.adapter.d.ts.map