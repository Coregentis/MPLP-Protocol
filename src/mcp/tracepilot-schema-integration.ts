/**
 * TracePilot Schema Integration Adapter v1.0
 * 集成TracePilot智能检测与MPLP Schema验证系统
 */

import { MPLPSchemaValidator, ValidationResult } from '../core/schema-validator';
import { MPLPSchemaManager } from '../core/schema-manager';
import { Logger } from '../utils/logger';
import { Performance } from '../utils/performance';

// TracePilot智能检测结果接口
export interface TracePilotDetectionResult {
  detection_id: string;
  detection_type: 'schema_violation' | 'performance_issue' | 'security_risk' | 'compliance_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affected_schema: string;
  affected_field?: string;
  suggested_fix?: string;
  auto_fixable: boolean;
  confidence_score: number;
  timestamp: string;
}

// 自动修复结果接口
export interface AutoFixResult {
  fix_id: string;
  detection_id: string;
  applied: boolean;
  fix_type: 'data_correction' | 'schema_update' | 'configuration_change';
  original_value: unknown;
  corrected_value: unknown;
  validation_result: ValidationResult;
  performance_impact: number;
  timestamp: string;
}

// Schema监控配置
export interface SchemaMonitoringConfig {
  enabled: boolean;
  real_time_validation: boolean;
  auto_fix_enabled: boolean;
  performance_threshold_ms: number;
  notification_channels: string[];
  severity_filters: Array<'low' | 'medium' | 'high' | 'critical'>;
}

/**
 * TracePilot Schema Integration Adapter
 * 提供TracePilot智能检测与MPLP Schema验证的深度集成
 */
export class TracePilotSchemaIntegration {
  private schemaValidator: MPLPSchemaValidator;
  private schemaManager: MPLPSchemaManager;
  private logger: Logger;
  private performance: Performance;
  private config: SchemaMonitoringConfig;
  private detectionHistory: Map<string, TracePilotDetectionResult[]> = new Map();
  private autoFixHistory: Map<string, AutoFixResult[]> = new Map();

  constructor(
    schemaValidator: MPLPSchemaValidator,
    schemaManager: MPLPSchemaManager,
    config: SchemaMonitoringConfig
  ) {
    this.schemaValidator = schemaValidator;
    this.schemaManager = schemaManager;
    this.config = config;
    this.logger = new Logger('TracePilotSchemaIntegration');
    this.performance = new Performance();

    this.logger.info('TracePilot Schema Integration initialized', { config });
  }

  /**
   * 智能Schema验证与检测
   * 结合TracePilot检测能力和MPLP验证器
   */
  async intelligentValidation(
    schemaId: string, 
    data: unknown, 
    correlationId?: string
  ): Promise<{
    validation: ValidationResult;
    detections: TracePilotDetectionResult[];
    autoFixes: AutoFixResult[];
  }> {
    const startTime = this.performance.now();

    try {
      // 1. 执行标准Schema验证
      const validationResult = await this.schemaManager.validate(schemaId, data);

      // 2. 运行TracePilot智能检测
      const detections = await this.runIntelligentDetection(
        schemaId, 
        data, 
        validationResult,
        correlationId
      );

      // 3. 尝试自动修复（如果启用）
      const autoFixes: AutoFixResult[] = [];
      if (this.config.auto_fix_enabled) {
        for (const detection of detections) {
          if (detection.auto_fixable && detection.severity !== 'low') {
            const fixResult = await this.attemptAutoFix(detection, data, schemaId);
            if (fixResult) {
              autoFixes.push(fixResult);
            }
          }
        }
      }

      // 4. 记录检测历史
      this.recordDetectionHistory(schemaId, detections);

      // 5. 性能监控
      const duration = this.performance.since(startTime);
      if (duration > this.config.performance_threshold_ms) {
        this.logger.warn('Intelligent validation exceeded threshold', {
          schemaId,
          duration,
          threshold: this.config.performance_threshold_ms
        });
      }

      return {
        validation: validationResult,
        detections,
        autoFixes
      };

    } catch (error) {
      this.logger.error('Intelligent validation failed', { schemaId, error });
      throw error;
    }
  }

  /**
   * 运行TracePilot智能检测
   */
  private async runIntelligentDetection(
    schemaId: string,
    data: unknown,
    validationResult: ValidationResult,
    correlationId?: string
  ): Promise<TracePilotDetectionResult[]> {
    const detections: TracePilotDetectionResult[] = [];

    // 1. Schema违规检测
    if (!validationResult.valid) {
      for (const error of validationResult.errors) {
        detections.push({
          detection_id: `schema_violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          detection_type: 'schema_violation',
          severity: this.mapErrorSeverity(error.severity),
          message: `Schema validation failed: ${error.message}`,
          affected_schema: schemaId,
          affected_field: error.field,
          suggested_fix: error.suggestion,
          auto_fixable: this.isErrorAutoFixable(error),
          confidence_score: 0.95,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 2. 性能问题检测
    if (validationResult.performance.duration_ms > 10) {
      detections.push({
        detection_id: `performance_issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        detection_type: 'performance_issue',
        severity: validationResult.performance.duration_ms > 50 ? 'high' : 'medium',
        message: `Validation performance degraded: ${validationResult.performance.duration_ms}ms`,
        affected_schema: schemaId,
        suggested_fix: 'Consider schema optimization or data restructuring',
        auto_fixable: false,
        confidence_score: 0.85,
        timestamp: new Date().toISOString()
      });
    }

    // 3. 数据质量检测
    const qualityIssues = await this.detectDataQualityIssues(data, schemaId);
    detections.push(...qualityIssues);

    // 4. 安全风险检测
    const securityRisks = await this.detectSecurityRisks(data, schemaId);
    detections.push(...securityRisks);

    // 5. 合规性检测
    const complianceIssues = await this.detectComplianceIssues(data, schemaId);
    detections.push(...complianceIssues);

    return detections.filter(d => this.config.severity_filters.includes(d.severity));
  }

  /**
   * 尝试自动修复检测到的问题
   */
  private async attemptAutoFix(
    detection: TracePilotDetectionResult,
    data: unknown,
    schemaId: string
  ): Promise<AutoFixResult | null> {
    const fixId = `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      let fixedData = data;
      let fixType: 'data_correction' | 'schema_update' | 'configuration_change' = 'data_correction';

      switch (detection.detection_type) {
        case 'schema_violation':
          fixedData = await this.fixSchemaViolation(data, detection);
          break;
        
        case 'performance_issue':
          // Performance fixes typically require schema or configuration changes
          fixType = 'configuration_change';
          fixedData = data; // No data changes for performance fixes
          break;

        default:
          this.logger.warn('Auto-fix not supported for detection type', { 
            type: detection.detection_type 
          });
          return null;
      }

      // 验证修复后的数据
      const validationResult = await this.schemaManager.validate(schemaId, fixedData);

      const result: AutoFixResult = {
        fix_id: fixId,
        detection_id: detection.detection_id,
        applied: validationResult.valid,
        fix_type: fixType,
        original_value: data,
        corrected_value: fixedData,
        validation_result: validationResult,
        performance_impact: validationResult.performance.duration_ms,
        timestamp: new Date().toISOString()
      };

      // 记录修复历史
      if (!this.autoFixHistory.has(schemaId)) {
        this.autoFixHistory.set(schemaId, []);
      }
      this.autoFixHistory.get(schemaId)!.push(result);

      this.logger.info('Auto-fix attempted', {
        detectionId: detection.detection_id,
        fixId,
        success: result.applied
      });

      return result;

    } catch (error) {
      this.logger.error('Auto-fix failed', {
        detectionId: detection.detection_id,
        fixId,
        error
      });
      return null;
    }
  }

  /**
   * 修复Schema违规
   */
  private async fixSchemaViolation(data: any, detection: TracePilotDetectionResult): Promise<any> {
    const fixedData = JSON.parse(JSON.stringify(data)); // Deep clone

    if (detection.affected_field) {
      const fieldPath = detection.affected_field.split('/').filter(p => p);
      
      // 尝试常见的自动修复策略
      if (detection.message.includes('required')) {
        // 添加缺失的必需字段
        this.setNestedProperty(fixedData, fieldPath, this.getDefaultValue(fieldPath));
      } else if (detection.message.includes('type')) {
        // 修复类型错误
        const currentValue = this.getNestedProperty(fixedData, fieldPath);
        const correctedValue = this.correctDataType(currentValue, detection.message);
        this.setNestedProperty(fixedData, fieldPath, correctedValue);
      } else if (detection.message.includes('format')) {
        // 修复格式错误
        const currentValue = this.getNestedProperty(fixedData, fieldPath);
        const correctedValue = this.correctFormat(currentValue, detection.message);
        this.setNestedProperty(fixedData, fieldPath, correctedValue);
      }
    }

    return fixedData;
  }

  /**
   * 检测数据质量问题
   */
  private async detectDataQualityIssues(
    data: unknown, 
    schemaId: string
  ): Promise<TracePilotDetectionResult[]> {
    const issues: TracePilotDetectionResult[] = [];

    // 检测空值和默认值
    const emptyFields = this.findEmptyFields(data);
    for (const field of emptyFields) {
      issues.push({
        detection_id: `quality_empty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        detection_type: 'schema_violation',
        severity: 'medium',
        message: `Field contains empty or default value: ${field}`,
        affected_schema: schemaId,
        affected_field: field,
        suggested_fix: 'Provide meaningful value for the field',
        auto_fixable: false,
        confidence_score: 0.75,
        timestamp: new Date().toISOString()
      });
    }

    return issues;
  }

  /**
   * 检测安全风险
   */
  private async detectSecurityRisks(
    data: unknown, 
    schemaId: string
  ): Promise<TracePilotDetectionResult[]> {
    const risks: TracePilotDetectionResult[] = [];

    // 检测敏感信息泄露
    const sensitiveFields = this.findSensitiveData(data);
    for (const field of sensitiveFields) {
      risks.push({
        detection_id: `security_leak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        detection_type: 'security_risk',
        severity: 'critical',
        message: `Potential sensitive data exposure in field: ${field}`,
        affected_schema: schemaId,
        affected_field: field,
        suggested_fix: 'Remove or encrypt sensitive data',
        auto_fixable: true,
        confidence_score: 0.90,
        timestamp: new Date().toISOString()
      });
    }

    return risks;
  }

  /**
   * 检测合规性问题
   */
  private async detectComplianceIssues(
    data: unknown, 
    schemaId: string
  ): Promise<TracePilotDetectionResult[]> {
    const issues: TracePilotDetectionResult[] = [];

    // GDPR合规性检查
    if (this.containsPersonalData(data)) {
      issues.push({
        detection_id: `compliance_gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        detection_type: 'compliance_issue',
        severity: 'high',
        message: 'Personal data detected without proper consent tracking',
        affected_schema: schemaId,
        suggested_fix: 'Add consent tracking and data processing justification',
        auto_fixable: false,
        confidence_score: 0.80,
        timestamp: new Date().toISOString()
      });
    }

    return issues;
  }

  // Utility methods
  private mapErrorSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'error': return 'critical';
      case 'warning': return 'medium';
      case 'info': return 'low';
      default: return 'medium';
    }
  }

  private isErrorAutoFixable(error: any): boolean {
    const fixableTypes = ['required', 'type', 'format'];
    return fixableTypes.includes(error.code);
  }

  private recordDetectionHistory(schemaId: string, detections: TracePilotDetectionResult[]): void {
    if (!this.detectionHistory.has(schemaId)) {
      this.detectionHistory.set(schemaId, []);
    }
    this.detectionHistory.get(schemaId)!.push(...detections);
  }

  private getNestedProperty(obj: any, path: string[]): any {
    return path.reduce((current, key) => current?.[key], obj);
  }

  private setNestedProperty(obj: any, path: string[], value: any): void {
    const lastKey = path.pop()!;
    const target = path.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private getDefaultValue(fieldPath: string[]): any {
    // Return appropriate default based on field name/path
    const fieldName = fieldPath[fieldPath.length - 1];
    if (fieldName.includes('id')) return `default_${Date.now()}`;
    if (fieldName.includes('timestamp')) return new Date().toISOString();
    if (fieldName.includes('status')) return 'pending';
    return '';
  }

  private correctDataType(value: any, message: string): any {
    if (message.includes('string')) return String(value || '');
    if (message.includes('number')) return Number(value) || 0;
    if (message.includes('boolean')) return Boolean(value);
    return value;
  }

  private correctFormat(value: any, message: string): any {
    if (message.includes('uuid')) {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    if (message.includes('date-time')) {
      return new Date().toISOString();
    }
    return value;
  }

  private findEmptyFields(data: any, path: string = ''): string[] {
    const emptyFields: string[] = [];
    
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        const currentPath = path ? `${path}/${key}` : key;
        
        if (value === '' || value === null || value === undefined) {
          emptyFields.push(currentPath);
        } else if (typeof value === 'object') {
          emptyFields.push(...this.findEmptyFields(value, currentPath));
        }
      }
    }
    
    return emptyFields;
  }

  private findSensitiveData(data: any, path: string = ''): string[] {
    const sensitiveFields: string[] = [];
    const sensitivePatterns = [
      /password/i, /secret/i, /token/i, /key/i, /credit_card/i, 
      /ssn/i, /social_security/i, /email/i, /phone/i
    ];
    
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        const currentPath = path ? `${path}/${key}` : key;
        
        if (sensitivePatterns.some(pattern => pattern.test(key))) {
          sensitiveFields.push(currentPath);
        } else if (typeof value === 'object') {
          sensitiveFields.push(...this.findSensitiveData(value, currentPath));
        }
      }
    }
    
    return sensitiveFields;
  }

  private containsPersonalData(data: any): boolean {
    const personalDataFields = ['name', 'email', 'phone', 'address', 'birth_date', 'ssn'];
    const dataString = JSON.stringify(data).toLowerCase();
    return personalDataFields.some(field => dataString.includes(field));
  }

  /**
   * 获取检测统计信息
   */
  getDetectionStats(): {
    totalDetections: number;
    detectionsByType: Record<string, number>;
    detectionsBySeverity: Record<string, number>;
    autoFixSuccessRate: number;
  } {
    let totalDetections = 0;
    const detectionsByType: Record<string, number> = {};
    const detectionsBySeverity: Record<string, number> = {};
    
    for (const detections of this.detectionHistory.values()) {
      totalDetections += detections.length;
      
      for (const detection of detections) {
        detectionsByType[detection.detection_type] = (detectionsByType[detection.detection_type] || 0) + 1;
        detectionsBySeverity[detection.severity] = (detectionsBySeverity[detection.severity] || 0) + 1;
      }
    }

    // Calculate auto-fix success rate
    let totalFixes = 0;
    let successfulFixes = 0;
    
    for (const fixes of this.autoFixHistory.values()) {
      totalFixes += fixes.length;
      successfulFixes += fixes.filter(f => f.applied).length;
    }

    const autoFixSuccessRate = totalFixes > 0 ? (successfulFixes / totalFixes) * 100 : 0;

    return {
      totalDetections,
      detectionsByType,
      detectionsBySeverity,
      autoFixSuccessRate: Math.round(autoFixSuccessRate * 100) / 100
    };
  }
}

export default TracePilotSchemaIntegration; 