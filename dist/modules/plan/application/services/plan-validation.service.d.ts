/**
 * Plan验证服务 - 规划请求和结果验证服务 (Context模块A+标准)
 *
 * @description 基于Plan模块重构指南的验证服务
 * 职责：数据验证、结果校验、质量保证、AI服务响应验证
 * @version 2.0.0 - AI算法外置版本
 * @layer 应用层 - 验证服务
 * @standard Context模块A+企业级质量标准
 * @refactor AI算法外置，协议边界清晰化
 */
export interface PlanRequestData {
    planType: string;
    parameters: Record<string, unknown>;
    constraints?: Record<string, unknown>;
    metadata?: {
        userId?: string;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        description?: string;
    };
}
export interface PlanResultData {
    planData: Record<string, unknown>;
    confidence: number;
    metadata: {
        processingTime: number;
        algorithm?: string;
        iterations?: number;
    };
    status: 'completed' | 'failed' | 'partial';
}
export interface AIServiceResponse {
    planData: Record<string, unknown>;
    confidence: number;
    metadata: {
        processingTime: number;
        algorithm?: string;
        iterations?: number;
    };
    status: 'completed' | 'failed' | 'partial';
}
export interface ValidationError {
    field: string;
    message: string;
    code?: string;
    severity?: 'error' | 'warning';
}
export interface ValidationWarning {
    field: string;
    message: string;
    code?: string;
    recommendation?: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    score?: number;
    recommendations?: string[];
}
export interface IValidationRules {
    validatePlanType(planType: string): boolean;
    validateParameters(parameters: Record<string, unknown>): ValidationResult;
    validateConstraints(constraints: Record<string, unknown>): ValidationResult;
}
export interface IQualityChecker {
    checkPlanQuality(result: PlanResultData): Promise<{
        score: number;
        issues: string[];
    }>;
    checkDataIntegrity(data: Record<string, unknown>): Promise<{
        isValid: boolean;
        issues: string[];
    }>;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
/**
 * Plan验证服务 - 规划请求和结果验证服务
 *
 * @description 基于Plan模块重构指南的验证管理服务
 * 职责：数据验证、结果校验、质量保证、AI服务响应验证
 * @standard Context模块A+企业级质量标准
 */
export declare class PlanValidationService {
    private readonly validationRules;
    private readonly qualityChecker;
    private readonly logger;
    constructor(validationRules: IValidationRules, qualityChecker: IQualityChecker, logger: ILogger);
    /**
     * 验证规划请求
     * 基于重构指南的请求验证逻辑
     */
    validatePlanRequest(request: PlanRequestData): Promise<ValidationResult>;
    /**
     * 验证规划结果
     * 基于重构指南的结果验证逻辑
     */
    validatePlanResult(result: PlanResultData): Promise<ValidationResult>;
    /**
     * 验证AI服务响应
     * 基于重构指南的AI服务响应验证逻辑
     */
    validateAIServiceResponse(response: AIServiceResponse): Promise<ValidationResult>;
    /**
     * 验证基本数据
     */
    private validateBasicData;
    /**
     * 验证业务规则
     */
    private validateBusinessRules;
    /**
     * 验证约束条件
     */
    private validateConstraints;
    /**
     * 验证参数
     */
    private validateParameters;
    /**
     * 验证结果完整性
     */
    private validateResultCompleteness;
    /**
     * 验证一致性
     */
    private validateConsistency;
    /**
     * 生成请求建议
     */
    private generateRequestRecommendations;
    /**
     * 生成结果建议
     */
    private generateResultRecommendations;
    /**
     * 生成AI响应建议
     */
    private generateAIResponseRecommendations;
}
//# sourceMappingURL=plan-validation.service.d.ts.map