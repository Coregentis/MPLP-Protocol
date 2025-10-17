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
export declare class PlanValidationService {
    private readonly validationRules;
    private readonly qualityChecker;
    private readonly logger;
    constructor(validationRules: IValidationRules, qualityChecker: IQualityChecker, logger: ILogger);
    validatePlanRequest(request: PlanRequestData): Promise<ValidationResult>;
    validatePlanResult(result: PlanResultData): Promise<ValidationResult>;
    validateAIServiceResponse(response: AIServiceResponse): Promise<ValidationResult>;
    private validateBasicData;
    private validateBusinessRules;
    private validateConstraints;
    private validateParameters;
    private validateResultCompleteness;
    private validateConsistency;
    private generateRequestRecommendations;
    private generateResultRecommendations;
    private generateAIResponseRecommendations;
}
//# sourceMappingURL=plan-validation.service.d.ts.map