/**
 * MPLP Schema Compatibility Validator
 * 
 * @description Schema兼容性验证器实现
 * @version 1.0.0
 * @standardized MPLP协议验证工具标准化规范 v1.0.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  CompatibilityValidator, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  CompatibilityReport,
  CompatibilityDetail,
  SchemaCompatibilityMatrix,
  CompatibilityRule,
  ValidationMetadata 
} from '../types';

export class MplpCompatibilityValidator implements CompatibilityValidator {
  private readonly schemasPath: string;
  private readonly validatorVersion = '1.0.0';
  private compatibilityMatrix: SchemaCompatibilityMatrix | null = null;

  constructor(schemasPath: string = 'src/schemas') {
    this.schemasPath = schemasPath;
  }

  /**
   * 检查两个Schema的兼容性
   */
  async checkCompatibility(sourceSchema: string, targetSchema: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // 加载Schema文件
      const sourceContent = await this.loadSchema(sourceSchema);
      const targetContent = await this.loadSchema(targetSchema);

      // 执行兼容性检查
      const compatibilityIssues = await this.performCompatibilityCheck(
        sourceContent, 
        targetContent, 
        sourceSchema, 
        targetSchema
      );

      errors.push(...compatibilityIssues.errors);
      warnings.push(...compatibilityIssues.warnings);

    } catch (error) {
      errors.push(this.createCompatibilityError(
        sourceSchema,
        targetSchema,
        'SCHEMA_LOAD_ERROR',
        'Failed to load schemas for compatibility check',
        (error as Error).message
      ));
    }

    const metadata: ValidationMetadata = {
      validatorVersion: this.validatorVersion,
      validationTimestamp: new Date().toISOString(),
      totalSchemasChecked: 2,
      validationDurationMs: Date.now() - startTime,
      rulesApplied: ['compatibility-check', 'version-check', 'field-compatibility']
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  /**
   * 验证兼容性矩阵
   */
  async validateCompatibilityMatrix(): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // 加载兼容性矩阵
      await this.loadCompatibilityMatrix();

      if (!this.compatibilityMatrix) {
        errors.push(this.createMatrixError(
          'MATRIX_NOT_FOUND',
          'Compatibility matrix not found',
          'No compatibility matrix configuration found'
        ));
        return this.createValidationResult(false, errors, warnings, startTime);
      }

      // 验证矩阵中的每个规则
      for (const rule of this.compatibilityMatrix.compatibilityRules) {
        const ruleValidation = await this.validateCompatibilityRule(rule);
        errors.push(...ruleValidation.errors);
        warnings.push(...ruleValidation.warnings);
      }

    } catch (error) {
      errors.push(this.createMatrixError(
        'MATRIX_VALIDATION_ERROR',
        'Failed to validate compatibility matrix',
        (error as Error).message
      ));
    }

    return this.createValidationResult(
      errors.length === 0, 
      errors, 
      warnings, 
      startTime
    );
  }

  /**
   * 生成兼容性报告
   */
  async generateCompatibilityReport(): Promise<CompatibilityReport> {
    const reportId = `compat_report_${Date.now()}`;
    const generatedAt = new Date().toISOString();
    const details: CompatibilityDetail[] = [];

    try {
      // 获取所有Schema文件
      const schemaFiles = await this.getSchemaFiles();
      let totalChecks = 0;
      let compatiblePairs = 0;
      let incompatiblePairs = 0;
      let deprecatedPairs = 0;

      // 检查每对Schema的兼容性
      for (let i = 0; i < schemaFiles.length; i++) {
        for (let j = i + 1; j < schemaFiles.length; j++) {
          const sourceSchema = path.basename(schemaFiles[i], '.json');
          const targetSchema = path.basename(schemaFiles[j], '.json');

          totalChecks++;
          const compatibilityResult = await this.checkCompatibility(sourceSchema, targetSchema);
          
          let status: 'compatible' | 'incompatible' | 'deprecated' | 'unknown' = 'unknown';
          const issues: string[] = [];
          const recommendations: string[] = [];

          if (compatibilityResult.isValid) {
            if (compatibilityResult.warnings.some(w => w.warningType === 'deprecation')) {
              status = 'deprecated';
              deprecatedPairs++;
            } else {
              status = 'compatible';
              compatiblePairs++;
            }
          } else {
            status = 'incompatible';
            incompatiblePairs++;
            issues.push(...compatibilityResult.errors.map(e => e.message));
          }

          // 添加建议
          if (status === 'incompatible') {
            recommendations.push('Review breaking changes between schemas');
            recommendations.push('Consider version migration strategy');
          } else if (status === 'deprecated') {
            recommendations.push('Plan migration to newer version');
            recommendations.push('Update deprecated field usage');
          }

          details.push({
            sourceSchema,
            targetSchema,
            status,
            issues,
            recommendations
          });
        }
      }

      return {
        reportId,
        generatedAt,
        totalCompatibilityChecks: totalChecks,
        compatiblePairs,
        incompatiblePairs,
        deprecatedPairs,
        details
      };

    } catch (error) {
      // 返回错误报告
      return {
        reportId,
        generatedAt,
        totalCompatibilityChecks: 0,
        compatiblePairs: 0,
        incompatiblePairs: 0,
        deprecatedPairs: 0,
        details: [{
          sourceSchema: 'unknown',
          targetSchema: 'unknown',
          status: 'unknown',
          issues: [`Failed to generate compatibility report: ${(error as Error).message}`],
          recommendations: ['Check schema files and try again']
        }]
      };
    }
  }

  /**
   * 加载Schema文件
   */
  private async loadSchema(schemaName: string): Promise<Record<string, unknown>> {
    const schemaPath = path.join(this.schemasPath, `${schemaName}.json`);
    const content = await fs.readFile(schemaPath, 'utf-8');
    return JSON.parse(content) as Record<string, unknown>;
  }

  /**
   * 执行兼容性检查
   */
  private async performCompatibilityCheck(
    sourceSchema: Record<string, unknown>,
    targetSchema: Record<string, unknown>,
    sourceName: string,
    targetName: string
  ): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. 版本兼容性检查
    const versionCheck = this.checkVersionCompatibility(sourceSchema, targetSchema, sourceName, targetName);
    errors.push(...versionCheck.errors);
    warnings.push(...versionCheck.warnings);

    // 2. 字段兼容性检查
    const fieldCheck = this.checkFieldCompatibility(sourceSchema, targetSchema, sourceName, targetName);
    errors.push(...fieldCheck.errors);
    warnings.push(...fieldCheck.warnings);

    // 3. 类型兼容性检查
    const typeCheck = this.checkTypeCompatibility(sourceSchema, targetSchema, sourceName, targetName);
    errors.push(...typeCheck.errors);
    warnings.push(...typeCheck.warnings);

    // 4. 约束兼容性检查
    const constraintCheck = this.checkConstraintCompatibility(sourceSchema, targetSchema, sourceName, targetName);
    errors.push(...constraintCheck.errors);
    warnings.push(...constraintCheck.warnings);

    return { errors, warnings };
  }

  /**
   * 检查版本兼容性
   */
  private checkVersionCompatibility(
    sourceSchema: Record<string, unknown>,
    targetSchema: Record<string, unknown>,
    sourceName: string,
    targetName: string
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const sourceVersion = sourceSchema.version as string;
    const targetVersion = targetSchema.version as string;

    if (sourceVersion && targetVersion) {
      // 简单的版本比较（实际项目中应使用semver库）
      if (this.compareVersions(sourceVersion, targetVersion) > 0) {
        warnings.push(this.createCompatibilityWarning(
          sourceName,
          targetName,
          'VERSION_MISMATCH',
          'Source schema has newer version than target',
          `Source: ${sourceVersion}, Target: ${targetVersion}`
        ));
      }
    }

    return { errors, warnings };
  }

  /**
   * 检查字段兼容性
   */
  private checkFieldCompatibility(
    sourceSchema: Record<string, unknown>,
    targetSchema: Record<string, unknown>,
    sourceName: string,
    targetName: string
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 检查$defs中的字段定义
    const sourceDefs = sourceSchema.$defs as Record<string, unknown> || {};
    const targetDefs = targetSchema.$defs as Record<string, unknown> || {};

    // 检查缺失的定义
    for (const defName of Object.keys(sourceDefs)) {
      if (!(defName in targetDefs)) {
        errors.push(this.createCompatibilityError(
          sourceName,
          targetName,
          'MISSING_DEFINITION',
          `Definition '${defName}' exists in source but not in target`,
          `Target schema is missing definition: ${defName}`
        ));
      }
    }

    return { errors, warnings };
  }

  /**
   * 检查类型兼容性
   */
  private checkTypeCompatibility(
    sourceSchema: Record<string, unknown>,
    targetSchema: Record<string, unknown>,
    sourceName: string,
    targetName: string
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 检查根类型
    if (sourceSchema.type !== targetSchema.type) {
      errors.push(this.createCompatibilityError(
        sourceName,
        targetName,
        'TYPE_MISMATCH',
        'Root type mismatch between schemas',
        `Source type: ${sourceSchema.type}, Target type: ${targetSchema.type}`
      ));
    }

    return { errors, warnings };
  }

  /**
   * 检查约束兼容性
   */
  private checkConstraintCompatibility(
    _sourceSchema: Record<string, unknown>,
    _targetSchema: Record<string, unknown>,
    _sourceName: string,
    _targetName: string
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 这里可以添加更多约束检查逻辑
    // 例如：required字段、枚举值、格式约束等

    return { errors, warnings };
  }

  /**
   * 验证兼容性规则
   */
  private async validateCompatibilityRule(rule: CompatibilityRule): Promise<{ errors: ValidationError[]; warnings: ValidationWarning[] }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // 检查规则中引用的Schema是否存在
      const sourceExists = await this.schemaExists(rule.sourceSchema);
      const targetExists = await this.schemaExists(rule.targetSchema);

      if (!sourceExists) {
        errors.push(this.createRuleError(
          rule.sourceSchema,
          'SCHEMA_NOT_FOUND',
          `Source schema '${rule.sourceSchema}' not found`,
          'Referenced schema file does not exist'
        ));
      }

      if (!targetExists) {
        errors.push(this.createRuleError(
          rule.targetSchema,
          'SCHEMA_NOT_FOUND',
          `Target schema '${rule.targetSchema}' not found`,
          'Referenced schema file does not exist'
        ));
      }

      // 检查版本格式
      if (rule.requiredVersion && !this.isValidVersion(rule.requiredVersion)) {
        warnings.push(this.createRuleWarning(
          rule.sourceSchema,
          'INVALID_VERSION_FORMAT',
          `Invalid version format: ${rule.requiredVersion}`,
          'Version should follow semantic versioning'
        ));
      }

    } catch (error) {
      errors.push(this.createRuleError(
        rule.sourceSchema,
        'RULE_VALIDATION_ERROR',
        'Failed to validate compatibility rule',
        (error as Error).message
      ));
    }

    return { errors, warnings };
  }

  /**
   * 加载兼容性矩阵
   */
  private async loadCompatibilityMatrix(): Promise<void> {
    try {
      const matrixPath = path.join(this.schemasPath, 'compatibility-matrix.json');
      const content = await fs.readFile(matrixPath, 'utf-8');
      this.compatibilityMatrix = JSON.parse(content) as SchemaCompatibilityMatrix;
    } catch (error) {
      // 如果没有兼容性矩阵文件，创建默认的
      this.compatibilityMatrix = {
        matrixVersion: '1.0.0',
        compatibilityRules: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 获取所有Schema文件
   */
  private async getSchemaFiles(): Promise<string[]> {
    const files = await fs.readdir(this.schemasPath);
    return files
      .filter(file => file.endsWith('.json') && file.startsWith('mplp-'))
      .map(file => path.join(this.schemasPath, file));
  }

  /**
   * 检查Schema是否存在
   */
  private async schemaExists(schemaName: string): Promise<boolean> {
    try {
      const schemaPath = path.join(this.schemasPath, `${schemaName}.json`);
      await fs.access(schemaPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 版本比较
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    
    return 0;
  }

  /**
   * 验证版本格式
   */
  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  // ===== 错误和警告创建方法 =====

  private createCompatibilityError(
    sourceSchema: string,
    targetSchema: string,
    errorCode: string,
    message: string,
    details: string
  ): ValidationError {
    return {
      errorId: this.generateId(),
      errorCode,
      errorType: 'compatibility',
      message,
      details,
      location: {
        schemaFile: `${sourceSchema} -> ${targetSchema}`,
        jsonPath: '',
        context: 'Compatibility check'
      },
      severity: 'error',
      suggestions: [
        'Review schema changes for breaking modifications',
        'Check field additions and removals',
        'Validate type changes'
      ]
    };
  }

  private createCompatibilityWarning(
    sourceSchema: string,
    targetSchema: string,
    warningCode: string,
    message: string,
    details: string
  ): ValidationWarning {
    return {
      warningId: this.generateId(),
      warningCode,
      warningType: 'deprecation',
      message,
      details,
      location: {
        schemaFile: `${sourceSchema} -> ${targetSchema}`,
        jsonPath: '',
        context: 'Compatibility check'
      },
      severity: 'warning',
      suggestions: [
        'Consider version migration strategy',
        'Update deprecated field usage',
        'Plan for future compatibility'
      ]
    };
  }

  private createMatrixError(errorCode: string, message: string, details: string): ValidationError {
    return {
      errorId: this.generateId(),
      errorCode,
      errorType: 'compatibility',
      message,
      details,
      location: {
        schemaFile: 'compatibility-matrix.json',
        jsonPath: '',
        context: 'Matrix validation'
      },
      severity: 'error',
      suggestions: [
        'Create compatibility matrix configuration',
        'Check matrix file format',
        'Validate matrix rules'
      ]
    };
  }

  private createRuleError(schemaName: string, errorCode: string, message: string, details: string): ValidationError {
    return {
      errorId: this.generateId(),
      errorCode,
      errorType: 'reference',
      message,
      details,
      location: {
        schemaFile: schemaName,
        jsonPath: '',
        context: 'Rule validation'
      },
      severity: 'error',
      suggestions: [
        'Check referenced schema files exist',
        'Validate rule configuration',
        'Update compatibility rules'
      ]
    };
  }

  private createRuleWarning(schemaName: string, warningCode: string, message: string, details: string): ValidationWarning {
    return {
      warningId: this.generateId(),
      warningCode,
      warningType: 'best_practice',
      message,
      details,
      location: {
        schemaFile: schemaName,
        jsonPath: '',
        context: 'Rule validation'
      },
      severity: 'warning',
      suggestions: [
        'Follow semantic versioning',
        'Update version format',
        'Check rule configuration'
      ]
    };
  }

  private createValidationResult(
    isValid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    startTime: number
  ): ValidationResult {
    const metadata: ValidationMetadata = {
      validatorVersion: this.validatorVersion,
      validationTimestamp: new Date().toISOString(),
      totalSchemasChecked: 1,
      validationDurationMs: Date.now() - startTime,
      rulesApplied: ['compatibility-matrix-validation']
    };

    return {
      isValid,
      errors,
      warnings,
      metadata
    };
  }

  private generateId(): string {
    return `compat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
