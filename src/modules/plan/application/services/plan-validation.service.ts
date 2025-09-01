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

// ===== 验证相关接口定义 =====
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
  checkPlanQuality(result: PlanResultData): Promise<{ score: number; issues: string[] }>;
  checkDataIntegrity(data: Record<string, unknown>): Promise<{ isValid: boolean; issues: string[] }>;
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
export class PlanValidationService {
  
  constructor(
    private readonly validationRules: IValidationRules,
    private readonly qualityChecker: IQualityChecker,
    private readonly logger: ILogger
  ) {}

  // ===== 规划请求验证 =====

  /**
   * 验证规划请求
   * 基于重构指南的请求验证逻辑
   */
  async validatePlanRequest(request: PlanRequestData): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Validating plan request', { 
        planType: request.planType,
        hasParameters: !!request.parameters,
        hasConstraints: !!request.constraints 
      });

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // 1. 基本数据验证
      const basicValidation = this.validateBasicData(request);
      errors.push(...basicValidation.errors);
      warnings.push(...basicValidation.warnings);

      // 2. 业务规则验证
      const businessValidation = await this.validateBusinessRules(request);
      errors.push(...businessValidation.errors);
      warnings.push(...businessValidation.warnings);

      // 3. 约束条件验证
      const constraintValidation = await this.validateConstraints(request);
      errors.push(...constraintValidation.errors);
      warnings.push(...constraintValidation.warnings);

      // 4. 参数完整性验证
      const parameterValidation = this.validateParameters(request);
      errors.push(...parameterValidation.errors);
      warnings.push(...parameterValidation.warnings);

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        recommendations: this.generateRequestRecommendations(errors, warnings)
      };

      this.logger.info('Plan request validation completed', { 
        isValid: result.isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        validationTime: Date.now() - startTime 
      });

      return result;
    } catch (error) {
      this.logger.error('Plan request validation failed', error instanceof Error ? error : new Error(String(error)), { 
        planType: request.planType 
      });

      return {
        isValid: false,
        errors: [{ field: 'validation', message: 'Validation process failed', severity: 'error' }],
        warnings: [],
        recommendations: ['Check validation service configuration', 'Retry validation']
      };
    }
  }

  // ===== 规划结果验证 =====

  /**
   * 验证规划结果
   * 基于重构指南的结果验证逻辑
   */
  async validatePlanResult(result: PlanResultData): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Validating plan result', { 
        hasData: !!result.planData,
        confidence: result.confidence,
        status: result.status 
      });

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // 1. 结果完整性验证
      const completenessValidation = this.validateResultCompleteness(result);
      errors.push(...completenessValidation.errors);
      warnings.push(...completenessValidation.warnings);

      // 2. 质量检查
      const qualityCheck = await this.qualityChecker.checkPlanQuality(result);
      if (qualityCheck.score < 0.7) {
        warnings.push({ 
          field: 'quality', 
          message: `Plan quality score ${qualityCheck.score} is below threshold (0.7)`,
          recommendation: 'Consider regenerating plan with different parameters'
        });
      }

      // 3. 一致性验证
      const consistencyCheck = await this.validateConsistency(result);
      errors.push(...consistencyCheck.errors);
      warnings.push(...consistencyCheck.warnings);

      // 4. 数据完整性验证
      const integrityCheck = await this.qualityChecker.checkDataIntegrity(result.planData);
      if (!integrityCheck.isValid) {
        errors.push({ 
          field: 'planData', 
          message: 'Plan data integrity check failed',
          severity: 'error' 
        });
      }

      const validationResult: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        score: qualityCheck.score,
        recommendations: this.generateResultRecommendations(errors, warnings, qualityCheck)
      };

      this.logger.info('Plan result validation completed', { 
        isValid: validationResult.isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        qualityScore: qualityCheck.score,
        validationTime: Date.now() - startTime 
      });

      return validationResult;
    } catch (error) {
      this.logger.error('Plan result validation failed', error instanceof Error ? error : new Error(String(error)), { 
        status: result.status 
      });

      return {
        isValid: false,
        errors: [{ field: 'validation', message: 'Result validation process failed', severity: 'error' }],
        warnings: [],
        recommendations: ['Check validation service configuration', 'Verify result data format']
      };
    }
  }

  // ===== AI服务响应验证 =====

  /**
   * 验证AI服务响应
   * 基于重构指南的AI服务响应验证逻辑
   */
  async validateAIServiceResponse(response: AIServiceResponse): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Validating AI service response', { 
        hasData: !!response.planData,
        confidence: response.confidence,
        status: response.status 
      });

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // 1. 响应格式验证
      if (!response.planData) {
        errors.push({ field: 'planData', message: 'AI service must return plan data', severity: 'error' });
      }

      if (typeof response.confidence !== 'number') {
        errors.push({ field: 'confidence', message: 'AI service must return confidence score', severity: 'error' });
      } else if (response.confidence < 0 || response.confidence > 1) {
        errors.push({ field: 'confidence', message: 'Confidence must be between 0 and 1', severity: 'error' });
      }

      // 2. 数据类型验证
      if (response.planData && typeof response.planData !== 'object') {
        errors.push({ field: 'planData', message: 'Plan data must be an object', severity: 'error' });
      }

      // 3. 元数据验证
      if (!response.metadata || typeof response.metadata.processingTime !== 'number') {
        warnings.push({ 
          field: 'metadata', 
          message: 'Processing time metadata is missing or invalid',
          recommendation: 'Ensure AI service provides processing time information'
        });
      }

      // 4. 状态验证
      const validStatuses = ['completed', 'failed', 'partial'];
      if (!validStatuses.includes(response.status)) {
        errors.push({ 
          field: 'status', 
          message: `Invalid status: ${response.status}. Valid statuses: ${validStatuses.join(', ')}`,
          severity: 'error' 
        });
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        recommendations: this.generateAIResponseRecommendations(errors, warnings)
      };

      this.logger.info('AI service response validation completed', { 
        isValid: result.isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        validationTime: Date.now() - startTime 
      });

      return result;
    } catch (error) {
      this.logger.error('AI service response validation failed', error instanceof Error ? error : new Error(String(error)));

      return {
        isValid: false,
        errors: [{ field: 'validation', message: 'AI response validation process failed', severity: 'error' }],
        warnings: [],
        recommendations: ['Check AI service response format', 'Verify service integration']
      };
    }
  }

  // ===== 私有验证方法 =====

  /**
   * 验证基本数据
   */
  private validateBasicData(request: PlanRequestData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!request.planType) {
      errors.push({ field: 'planType', message: 'Plan type is required', severity: 'error' });
    }

    if (!request.parameters) {
      errors.push({ field: 'parameters', message: 'Plan parameters are required', severity: 'error' });
    } else if (Object.keys(request.parameters).length === 0) {
      warnings.push({ 
        field: 'parameters', 
        message: 'Plan parameters are empty',
        recommendation: 'Provide meaningful parameters for better planning results'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证业务规则
   */
  private async validateBusinessRules(request: PlanRequestData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 验证计划类型
    if (request.planType && !this.validationRules.validatePlanType(request.planType)) {
      errors.push({ 
        field: 'planType', 
        message: `Invalid plan type: ${request.planType}`,
        severity: 'error' 
      });
    }

    // 验证参数
    if (request.parameters) {
      const paramValidation = this.validationRules.validateParameters(request.parameters);
      errors.push(...paramValidation.errors);
      warnings.push(...paramValidation.warnings);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证约束条件
   */
  private async validateConstraints(request: PlanRequestData): Promise<ValidationResult> {
    if (!request.constraints) {
      return { isValid: true, errors: [], warnings: [] };
    }

    return this.validationRules.validateConstraints(request.constraints);
  }

  /**
   * 验证参数
   */
  private validateParameters(request: PlanRequestData): ValidationResult {
    if (!request.parameters) {
      return { isValid: false, errors: [{ field: 'parameters', message: 'Parameters are required' }], warnings: [] };
    }

    return this.validationRules.validateParameters(request.parameters);
  }

  /**
   * 验证结果完整性
   */
  private validateResultCompleteness(result: PlanResultData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!result.planData) {
      errors.push({ field: 'planData', message: 'Plan data is required', severity: 'error' });
    }

    if (result.confidence < 0 || result.confidence > 1) {
      errors.push({ field: 'confidence', message: 'Confidence must be between 0 and 1', severity: 'error' });
    } else if (result.confidence < 0.5) {
      warnings.push({ 
        field: 'confidence', 
        message: 'Low confidence score',
        recommendation: 'Consider regenerating plan or adjusting parameters'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证一致性
   */
  private async validateConsistency(_result: PlanResultData): Promise<ValidationResult> {
    // 一致性验证逻辑 - 简化实现
    return { isValid: true, errors: [], warnings: [] };
  }

  /**
   * 生成请求建议
   */
  private generateRequestRecommendations(errors: ValidationError[], warnings: ValidationWarning[]): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push('Fix validation errors before submitting request');
    }

    if (warnings.length > 0) {
      recommendations.push('Review warnings to improve request quality');
    }

    if (errors.length === 0 && warnings.length === 0) {
      recommendations.push('Request validation passed successfully');
    }

    return recommendations;
  }

  /**
   * 生成结果建议
   */
  private generateResultRecommendations(
    errors: ValidationError[], 
    warnings: ValidationWarning[], 
    qualityCheck: { score: number; issues: string[] }
  ): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push('Address validation errors in plan result');
    }

    if (qualityCheck.score < 0.7) {
      recommendations.push('Consider regenerating plan to improve quality score');
    }

    if (qualityCheck.issues.length > 0) {
      recommendations.push('Review quality issues and adjust planning parameters');
    }

    if (warnings.length > 0) {
      recommendations.push('Review warnings to optimize plan result');
    }

    return recommendations;
  }

  /**
   * 生成AI响应建议
   */
  private generateAIResponseRecommendations(errors: ValidationError[], warnings: ValidationWarning[]): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push('Fix AI service response format issues');
      recommendations.push('Verify AI service integration configuration');
    }

    if (warnings.length > 0) {
      recommendations.push('Improve AI service response metadata');
    }

    if (errors.length === 0 && warnings.length === 0) {
      recommendations.push('AI service response validation passed successfully');
    }

    return recommendations;
  }
}
