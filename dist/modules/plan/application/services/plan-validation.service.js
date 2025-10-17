"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanValidationService = void 0;
class PlanValidationService {
    validationRules;
    qualityChecker;
    logger;
    constructor(validationRules, qualityChecker, logger) {
        this.validationRules = validationRules;
        this.qualityChecker = qualityChecker;
        this.logger = logger;
    }
    async validatePlanRequest(request) {
        const startTime = Date.now();
        try {
            this.logger.info('Validating plan request', {
                planType: request.planType,
                hasParameters: !!request.parameters,
                hasConstraints: !!request.constraints
            });
            const errors = [];
            const warnings = [];
            const basicValidation = this.validateBasicData(request);
            errors.push(...basicValidation.errors);
            warnings.push(...basicValidation.warnings);
            const businessValidation = await this.validateBusinessRules(request);
            errors.push(...businessValidation.errors);
            warnings.push(...businessValidation.warnings);
            const constraintValidation = await this.validateConstraints(request);
            errors.push(...constraintValidation.errors);
            warnings.push(...constraintValidation.warnings);
            const parameterValidation = this.validateParameters(request);
            errors.push(...parameterValidation.errors);
            warnings.push(...parameterValidation.warnings);
            const result = {
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
        }
        catch (error) {
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
    async validatePlanResult(result) {
        const startTime = Date.now();
        try {
            this.logger.info('Validating plan result', {
                hasData: !!result.planData,
                confidence: result.confidence,
                status: result.status
            });
            const errors = [];
            const warnings = [];
            const completenessValidation = this.validateResultCompleteness(result);
            errors.push(...completenessValidation.errors);
            warnings.push(...completenessValidation.warnings);
            const qualityCheck = await this.qualityChecker.checkPlanQuality(result);
            if (qualityCheck.score < 0.7) {
                warnings.push({
                    field: 'quality',
                    message: `Plan quality score ${qualityCheck.score} is below threshold (0.7)`,
                    recommendation: 'Consider regenerating plan with different parameters'
                });
            }
            const consistencyCheck = await this.validateConsistency(result);
            errors.push(...consistencyCheck.errors);
            warnings.push(...consistencyCheck.warnings);
            const integrityCheck = await this.qualityChecker.checkDataIntegrity(result.planData);
            if (!integrityCheck.isValid) {
                errors.push({
                    field: 'planData',
                    message: 'Plan data integrity check failed',
                    severity: 'error'
                });
            }
            const validationResult = {
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
        }
        catch (error) {
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
    async validateAIServiceResponse(response) {
        const startTime = Date.now();
        try {
            this.logger.info('Validating AI service response', {
                hasData: !!response.planData,
                confidence: response.confidence,
                status: response.status
            });
            const errors = [];
            const warnings = [];
            if (!response.planData) {
                errors.push({ field: 'planData', message: 'AI service must return plan data', severity: 'error' });
            }
            if (typeof response.confidence !== 'number') {
                errors.push({ field: 'confidence', message: 'AI service must return confidence score', severity: 'error' });
            }
            else if (response.confidence < 0 || response.confidence > 1) {
                errors.push({ field: 'confidence', message: 'Confidence must be between 0 and 1', severity: 'error' });
            }
            if (response.planData && typeof response.planData !== 'object') {
                errors.push({ field: 'planData', message: 'Plan data must be an object', severity: 'error' });
            }
            if (!response.metadata || typeof response.metadata.processingTime !== 'number') {
                warnings.push({
                    field: 'metadata',
                    message: 'Processing time metadata is missing or invalid',
                    recommendation: 'Ensure AI service provides processing time information'
                });
            }
            const validStatuses = ['completed', 'failed', 'partial'];
            if (!validStatuses.includes(response.status)) {
                errors.push({
                    field: 'status',
                    message: `Invalid status: ${response.status}. Valid statuses: ${validStatuses.join(', ')}`,
                    severity: 'error'
                });
            }
            const result = {
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
        }
        catch (error) {
            this.logger.error('AI service response validation failed', error instanceof Error ? error : new Error(String(error)));
            return {
                isValid: false,
                errors: [{ field: 'validation', message: 'AI response validation process failed', severity: 'error' }],
                warnings: [],
                recommendations: ['Check AI service response format', 'Verify service integration']
            };
        }
    }
    validateBasicData(request) {
        const errors = [];
        const warnings = [];
        if (!request.planType) {
            errors.push({ field: 'planType', message: 'Plan type is required', severity: 'error' });
        }
        if (!request.parameters) {
            errors.push({ field: 'parameters', message: 'Plan parameters are required', severity: 'error' });
        }
        else if (Object.keys(request.parameters).length === 0) {
            warnings.push({
                field: 'parameters',
                message: 'Plan parameters are empty',
                recommendation: 'Provide meaningful parameters for better planning results'
            });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    async validateBusinessRules(request) {
        const errors = [];
        const warnings = [];
        if (request.planType && !this.validationRules.validatePlanType(request.planType)) {
            errors.push({
                field: 'planType',
                message: `Invalid plan type: ${request.planType}`,
                severity: 'error'
            });
        }
        if (request.parameters) {
            const paramValidation = this.validationRules.validateParameters(request.parameters);
            errors.push(...paramValidation.errors);
            warnings.push(...paramValidation.warnings);
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    async validateConstraints(request) {
        if (!request.constraints) {
            return { isValid: true, errors: [], warnings: [] };
        }
        return this.validationRules.validateConstraints(request.constraints);
    }
    validateParameters(request) {
        if (!request.parameters) {
            return { isValid: false, errors: [{ field: 'parameters', message: 'Parameters are required' }], warnings: [] };
        }
        return this.validationRules.validateParameters(request.parameters);
    }
    validateResultCompleteness(result) {
        const errors = [];
        const warnings = [];
        if (!result.planData) {
            errors.push({ field: 'planData', message: 'Plan data is required', severity: 'error' });
        }
        if (result.confidence < 0 || result.confidence > 1) {
            errors.push({ field: 'confidence', message: 'Confidence must be between 0 and 1', severity: 'error' });
        }
        else if (result.confidence < 0.5) {
            warnings.push({
                field: 'confidence',
                message: 'Low confidence score',
                recommendation: 'Consider regenerating plan or adjusting parameters'
            });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    async validateConsistency(_result) {
        return { isValid: true, errors: [], warnings: [] };
    }
    generateRequestRecommendations(errors, warnings) {
        const recommendations = [];
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
    generateResultRecommendations(errors, warnings, qualityCheck) {
        const recommendations = [];
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
    generateAIResponseRecommendations(errors, warnings) {
        const recommendations = [];
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
exports.PlanValidationService = PlanValidationService;
