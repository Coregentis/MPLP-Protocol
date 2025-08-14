/**
 * MPLP Schema Syntax Validator
 *
 * @description Schema语法验证器实现
 * @version 1.1.0
 * @standardized MPLP协议验证工具标准化规范 v1.1.0
 * @updated 2025-08-14 - 添加企业级功能和命名约定验证支持
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {
  SyntaxValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ErrorLocation,
  ValidationMetadata,
  SchemaInfo,
  ModuleType,
  EnterpriseFeatureValidationResult,
  NamingConventionValidationResult
} from '../types';
import { EnterpriseFeatureValidator } from './enterprise-validator';
import { NamingConventionValidator } from './naming-validator';

export class MplpSyntaxValidator implements SyntaxValidator {
  private readonly ajv: Ajv;
  private readonly schemasPath: string;
  private readonly validatorVersion = '1.1.0';
  private readonly enterpriseValidator: EnterpriseFeatureValidator;
  private readonly namingValidator: NamingConventionValidator;

  constructor(schemasPath: string = 'src/schemas') {
    this.schemasPath = schemasPath;
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false, // 放宽严格模式以提高兼容性
      validateFormats: true
    });
    addFormats(this.ajv);
    this.enterpriseValidator = new EnterpriseFeatureValidator();
    this.namingValidator = new NamingConventionValidator();
  }

  /**
   * 验证单个Schema文件
   */
  async validateSchema(schemaPath: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // 读取Schema文件
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      const schemaName = path.basename(schemaPath, '.json');
      
      return await this.validateSchemaContent(schemaContent, schemaName);
    } catch (error) {
      errors.push(this.createFileError(schemaPath, error as Error));
    }

    const metadata: ValidationMetadata = {
      validatorVersion: this.validatorVersion,
      validationTimestamp: new Date().toISOString(),
      totalSchemasChecked: 1,
      validationDurationMs: Date.now() - startTime,
      rulesApplied: ['file-access', 'json-parse']
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata
    };
  }

  /**
   * 验证Schema内容
   */
  async validateSchemaContent(content: string, schemaName: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const rulesApplied: string[] = [];

    try {
      // 1. JSON语法验证
      rulesApplied.push('json-syntax');
      let schemaObject: unknown;
      try {
        schemaObject = JSON.parse(content);
      } catch (parseError) {
        errors.push(this.createJsonSyntaxError(schemaName, parseError as Error));
        return this.createValidationResult(false, errors, warnings, startTime, rulesApplied);
      }

      // 2. Schema结构验证
      rulesApplied.push('schema-structure');
      const structureErrors = this.validateSchemaStructure(schemaObject, schemaName);
      errors.push(...structureErrors);

      // 3. MPLP命名约定验证
      rulesApplied.push('naming-convention');
      const namingWarnings = this.validateNamingConvention(schemaObject, schemaName);
      warnings.push(...namingWarnings);

      // 4. Schema Draft-07验证
      rulesApplied.push('draft-07-compliance');
      const draftErrors = this.validateDraft07Compliance(schemaObject, schemaName);
      errors.push(...draftErrors);

      // 5. MPLP特定规则验证
      rulesApplied.push('mplp-specific-rules');
      const mplpErrors = this.validateMplpSpecificRules(schemaObject, schemaName);
      errors.push(...mplpErrors);

      // 6. 企业级功能验证
      rulesApplied.push('enterprise-features');
      try {
        const schemaPath = path.join(this.schemasPath, `${schemaName}.json`);
        const enterpriseResult = await this.enterpriseValidator.validateEnterpriseFeatures(schemaPath);

        // 将企业级功能问题转换为验证错误和警告
        for (const missingFeature of enterpriseResult.missingFeatures) {
          errors.push({
            errorId: `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            errorCode: 'MISSING_ENTERPRISE_FEATURE',
            errorType: 'enterprise',
            message: `Missing required enterprise feature: ${missingFeature}`,
            details: `Schema must include '${missingFeature}' for enterprise compliance`,
            location: {
              schemaFile: schemaName,
              jsonPath: `properties.${missingFeature}`,
              context: 'Enterprise feature validation'
            },
            severity: 'error',
            suggestions: [`Add '${missingFeature}' enterprise feature to the schema`]
          });
        }

        for (const incompleteFeature of enterpriseResult.incompleteFeatures) {
          if (incompleteFeature.severity === 'error') {
            errors.push({
              errorId: `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              errorCode: 'INCOMPLETE_ENTERPRISE_FEATURE',
              errorType: 'enterprise',
              message: `Incomplete enterprise feature: ${incompleteFeature.featureName}`,
              details: incompleteFeature.suggestion,
              location: {
                schemaFile: schemaName,
                jsonPath: incompleteFeature.fieldPath,
                context: 'Enterprise feature validation'
              },
              severity: 'error',
              suggestions: [incompleteFeature.suggestion]
            });
          } else {
            warnings.push({
              warningId: `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              warningCode: 'INCOMPLETE_ENTERPRISE_FEATURE',
              warningType: 'enterprise',
              message: `Incomplete enterprise feature: ${incompleteFeature.featureName}`,
              details: incompleteFeature.suggestion,
              location: {
                schemaFile: schemaName,
                jsonPath: incompleteFeature.fieldPath,
                context: 'Enterprise feature validation'
              },
              severity: 'warning',
              suggestions: [incompleteFeature.suggestion]
            });
          }
        }

        for (const specializationIssue of enterpriseResult.specializationIssues) {
          warnings.push({
            warningId: `SPEC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            warningCode: 'MISSING_SPECIALIZATION',
            warningType: 'specialization',
            message: `Missing specialization for ${specializationIssue.moduleName}: ${specializationIssue.description}`,
            details: `Expected: ${specializationIssue.expectedPattern}, Actual: ${specializationIssue.actualPattern}`,
            location: {
              schemaFile: schemaName,
              jsonPath: 'properties',
              context: 'Specialization validation'
            },
            severity: 'warning',
            suggestions: specializationIssue.suggestions
          });
        }
      } catch (enterpriseError) {
        warnings.push({
          warningId: `ENT-ERR-${Date.now()}`,
          warningCode: 'ENTERPRISE_VALIDATION_ERROR',
          warningType: 'enterprise',
          message: 'Failed to validate enterprise features',
          details: (enterpriseError as Error).message,
          location: {
            schemaFile: schemaName,
            jsonPath: '',
            context: 'Enterprise feature validation'
          },
          severity: 'warning',
          suggestions: ['Check enterprise feature validator configuration']
        });
      }

      // 7. 命名约定验证
      rulesApplied.push('naming-convention-detailed');
      try {
        const schemaPath = path.join(this.schemasPath, `${schemaName}.json`);
        const namingResult = await this.namingValidator.validateNamingConvention(schemaPath);

        for (const violation of namingResult.violations) {
          if (violation.severity === 'error') {
            errors.push({
              errorId: `NAMING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              errorCode: 'NAMING_CONVENTION_VIOLATION',
              errorType: 'naming',
              message: `Naming convention violation: ${violation.violationType}`,
              details: `Field '${violation.fieldName}' should be '${violation.expectedNaming}'`,
              location: {
                schemaFile: schemaName,
                jsonPath: violation.fieldPath,
                context: 'Naming convention validation'
              },
              severity: 'error',
              suggestions: [violation.suggestion]
            });
          } else {
            warnings.push({
              warningId: `NAMING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              warningCode: 'NAMING_CONVENTION_VIOLATION',
              warningType: 'enterprise',
              message: `Naming convention violation: ${violation.violationType}`,
              details: `Field '${violation.fieldName}' should be '${violation.expectedNaming}'`,
              location: {
                schemaFile: schemaName,
                jsonPath: violation.fieldPath,
                context: 'Naming convention validation'
              },
              severity: 'warning',
              suggestions: [violation.suggestion]
            });
          }
        }
      } catch (namingError) {
        warnings.push({
          warningId: `NAMING-ERR-${Date.now()}`,
          warningCode: 'NAMING_VALIDATION_ERROR',
          warningType: 'enterprise',
          message: 'Failed to validate naming convention',
          details: (namingError as Error).message,
          location: {
            schemaFile: schemaName,
            jsonPath: '',
            context: 'Naming convention validation'
          },
          severity: 'warning',
          suggestions: ['Check naming convention validator configuration']
        });
      }

      // 8. 性能和最佳实践检查
      rulesApplied.push('best-practices');
      const practiceWarnings = this.validateBestPractices(schemaObject, schemaName);
      warnings.push(...practiceWarnings);

    } catch (error) {
      errors.push(this.createUnexpectedError(schemaName, error as Error));
    }

    return this.createValidationResult(
      errors.length === 0, 
      errors, 
      warnings, 
      startTime, 
      rulesApplied
    );
  }

  /**
   * 验证所有Schema文件
   */
  async validateAllSchemas(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const schemaFiles = await this.getSchemaFiles();

      for (const schemaFile of schemaFiles) {
        const result = await this.validateSchema(schemaFile);
        results.push(result);
      }

      // 如果没有找到Schema文件，返回空数组而不是错误
      return results;
    } catch (error) {
      // 如果无法读取Schema目录，创建一个错误结果
      const errorResult: ValidationResult = {
        isValid: false,
        errors: [this.createDirectoryError(this.schemasPath, error as Error)],
        warnings: [],
        metadata: {
          validatorVersion: this.validatorVersion,
          validationTimestamp: new Date().toISOString(),
          totalSchemasChecked: 0,
          validationDurationMs: 0,
          rulesApplied: ['directory-access']
        }
      };
      return [errorResult];
    }
  }

  /**
   * 获取所有Schema文件路径
   */
  private async getSchemaFiles(): Promise<string[]> {
    const files = await fs.readdir(this.schemasPath);
    const schemaFiles = files
      .filter(file => file.endsWith('.json') && file.startsWith('mplp-'))
      .map(file => path.join(this.schemasPath, file));

    return schemaFiles;
  }

  /**
   * 验证Schema结构
   */
  private validateSchemaStructure(schema: unknown, schemaName: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (typeof schema !== 'object' || schema === null) {
      errors.push(this.createStructureError(
        schemaName,
        'root',
        'Schema must be an object',
        'Schema根节点必须是对象类型'
      ));
      return errors;
    }

    const schemaObj = schema as Record<string, unknown>;

    // 检查必需字段
    const requiredFields = ['$schema', '$id', 'title', 'description', 'type'];
    for (const field of requiredFields) {
      if (!(field in schemaObj)) {
        errors.push(this.createStructureError(
          schemaName,
          field,
          `Missing required field: ${field}`,
          `缺少必需字段: ${field}`
        ));
      }
    }

    // 检查protocol_version字段（在properties中）
    if (schemaObj.properties && typeof schemaObj.properties === 'object') {
      const properties = schemaObj.properties as Record<string, unknown>;
      if (!('protocol_version' in properties)) {
        errors.push(this.createStructureError(
          schemaName,
          'properties.protocol_version',
          'Missing required field: protocol_version in properties',
          '缺少必需字段: properties中的protocol_version'
        ));
      }
    } else {
      errors.push(this.createStructureError(
        schemaName,
        'properties',
        'Missing properties section',
        '缺少properties部分'
      ));
    }

    // 验证$schema字段
    if (schemaObj.$schema !== 'http://json-schema.org/draft-07/schema#') {
      errors.push(this.createStructureError(
        schemaName,
        '$schema',
        'Must use JSON Schema Draft-07',
        '必须使用JSON Schema Draft-07标准'
      ));
    }

    // 验证$id字段格式
    if (typeof schemaObj.$id === 'string') {
      if (!schemaObj.$id.startsWith('https://mplp.dev/schemas/v1.0/')) {
        errors.push(this.createStructureError(
          schemaName,
          '$id',
          'Schema ID must follow MPLP convention',
          'Schema ID必须遵循MPLP约定格式'
        ));
      }
    }

    return errors;
  }

  /**
   * 验证命名约定
   */
  private validateNamingConvention(schema: unknown, schemaName: string): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    if (typeof schema !== 'object' || schema === null) {
      return warnings;
    }

    const schemaObj = schema as Record<string, unknown>;

    // 检查文件名约定
    if (!schemaName.startsWith('mplp-')) {
      warnings.push(this.createNamingWarning(
        schemaName,
        'filename',
        'Schema filename should start with "mplp-"',
        'Schema文件名应以"mplp-"开头'
      ));
    }

    // 检查字段命名约定（应使用snake_case）
    this.checkFieldNaming(schemaObj, schemaName, '', warnings);

    return warnings;
  }

  /**
   * 递归检查字段命名
   */
  private checkFieldNaming(
    obj: Record<string, unknown>, 
    schemaName: string, 
    path: string, 
    warnings: ValidationWarning[]
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // 跳过特殊字段和JSON Schema元字段
      if (key.startsWith('$') || key === 'enum' || key === 'const' || this.isJsonSchemaMetaField(key)) {
        continue;
      }

      // 检查snake_case命名
      if (key.includes('_') || key === key.toLowerCase()) {
        // 正确的snake_case或全小写
      } else if (this.isCamelCase(key)) {
        warnings.push(this.createNamingWarning(
          schemaName,
          currentPath,
          `Field "${key}" should use snake_case instead of camelCase`,
          `字段"${key}"应使用snake_case而不是camelCase`
        ));
      }

      // 递归检查嵌套对象
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.checkFieldNaming(value as Record<string, unknown>, schemaName, currentPath, warnings);
      }
    }
  }

  /**
   * 检查是否为camelCase
   */
  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str) && /[A-Z]/.test(str);
  }

  /**
   * 检查是否为JSON Schema元字段
   */
  private isJsonSchemaMetaField(key: string): boolean {
    const jsonSchemaMetaFields = [
      // 字符串约束
      'minLength', 'maxLength', 'pattern',
      // 数字约束
      'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
      // 数组约束
      'minItems', 'maxItems', 'uniqueItems',
      // 对象约束
      'minProperties', 'maxProperties', 'additionalProperties', 'patternProperties',
      // 通用约束
      'allOf', 'anyOf', 'oneOf', 'not', 'if', 'then', 'else',
      // 格式和内容
      'format', 'contentEncoding', 'contentMediaType',
      // 其他元字段
      'default', 'examples', 'readOnly', 'writeOnly'
    ];

    return jsonSchemaMetaFields.includes(key);
  }

  /**
   * 验证Draft-07合规性
   */
  private validateDraft07Compliance(schema: unknown, schemaName: string): ValidationError[] {
    const errors: ValidationError[] = [];

    try {
      // 类型断言为AJV可接受的schema类型
      this.ajv.compile(schema as Record<string, unknown>);
    } catch (error) {
      errors.push(this.createComplianceError(
        schemaName,
        'draft-07',
        'Schema is not valid JSON Schema Draft-07',
        (error as Error).message
      ));
    }

    return errors;
  }

  /**
   * 验证MPLP特定规则
   */
  private validateMplpSpecificRules(schema: unknown, schemaName: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (typeof schema !== 'object' || schema === null) {
      return errors;
    }

    const schemaObj = schema as Record<string, unknown>;

    // 检查是否有$defs定义
    if (!('$defs' in schemaObj)) {
      errors.push(this.createMplpRuleError(
        schemaName,
        '$defs',
        'MPLP schemas should use $defs for reusable definitions',
        'MPLP Schema应使用$defs定义可重用组件'
      ));
    }

    // 检查UUID定义
    if (schemaObj.$defs && typeof schemaObj.$defs === 'object') {
      const defs = schemaObj.$defs as Record<string, unknown>;
      if (!('uuid' in defs)) {
        errors.push(this.createMplpRuleError(
          schemaName,
          '$defs.uuid',
          'MPLP schemas should define uuid type in $defs',
          'MPLP Schema应在$defs中定义uuid类型'
        ));
      }
    }

    return errors;
  }

  /**
   * 验证最佳实践
   */
  private validateBestPractices(schema: unknown, schemaName: string): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    if (typeof schema !== 'object' || schema === null) {
      return warnings;
    }

    const schemaObj = schema as Record<string, unknown>;

    // 检查描述字段
    if (!schemaObj.description || typeof schemaObj.description !== 'string') {
      warnings.push(this.createBestPracticeWarning(
        schemaName,
        'description',
        'Schema should have a meaningful description',
        'Schema应包含有意义的描述'
      ));
    }

    // 检查protocol_version字段（在properties中）
    if (schemaObj.properties && typeof schemaObj.properties === 'object') {
      const properties = schemaObj.properties as Record<string, unknown>;
      if (!('protocol_version' in properties)) {
        warnings.push(this.createBestPracticeWarning(
          schemaName,
          'properties.protocol_version',
          'Schema should include protocol_version in properties',
          'Schema应在properties中包含protocol_version字段'
        ));
      }
    }

    return warnings;
  }

  // ===== 错误创建辅助方法 =====

  private createFileError(filePath: string, error: Error): ValidationError {
    return {
      errorId: this.generateErrorId(),
      errorCode: 'FILE_ACCESS_ERROR',
      errorType: 'syntax',
      message: `Cannot access schema file: ${filePath}`,
      details: error.message,
      location: {
        schemaFile: filePath,
        jsonPath: '',
        context: 'File system access'
      },
      severity: 'critical',
      suggestions: [
        'Check if the file exists',
        'Verify file permissions',
        'Ensure the path is correct'
      ]
    };
  }

  private createJsonSyntaxError(schemaName: string, error: Error): ValidationError {
    return {
      errorId: this.generateErrorId(),
      errorCode: 'JSON_SYNTAX_ERROR',
      errorType: 'syntax',
      message: 'Invalid JSON syntax',
      details: error.message,
      location: {
        schemaFile: schemaName,
        jsonPath: '',
        context: 'JSON parsing'
      },
      severity: 'error',
      suggestions: [
        'Check for missing commas or brackets',
        'Validate JSON syntax using a JSON validator',
        'Ensure proper escaping of special characters'
      ]
    };
  }

  private createStructureError(
    schemaName: string, 
    field: string, 
    message: string, 
    details: string
  ): ValidationError {
    return {
      errorId: this.generateErrorId(),
      errorCode: 'SCHEMA_STRUCTURE_ERROR',
      errorType: 'semantic',
      message,
      details,
      location: {
        schemaFile: schemaName,
        jsonPath: field,
        context: 'Schema structure validation'
      },
      severity: 'error',
      suggestions: [
        'Add the missing required field',
        'Check MPLP schema documentation',
        'Follow the standard schema template'
      ]
    };
  }

  private createNamingWarning(
    schemaName: string, 
    field: string, 
    message: string, 
    details: string
  ): ValidationWarning {
    return {
      warningId: this.generateErrorId(),
      warningCode: 'NAMING_CONVENTION_WARNING',
      warningType: 'style',
      message,
      details,
      location: {
        schemaFile: schemaName,
        jsonPath: field,
        context: 'Naming convention check'
      },
      severity: 'warning',
      suggestions: [
        'Use snake_case for field names',
        'Follow MPLP naming conventions',
        'Update field names to match standards'
      ]
    };
  }

  private createComplianceError(
    schemaName: string, 
    field: string, 
    message: string, 
    details: string
  ): ValidationError {
    return {
      errorId: this.generateErrorId(),
      errorCode: 'DRAFT07_COMPLIANCE_ERROR',
      errorType: 'semantic',
      message,
      details,
      location: {
        schemaFile: schemaName,
        jsonPath: field,
        context: 'JSON Schema Draft-07 compliance'
      },
      severity: 'error',
      suggestions: [
        'Fix JSON Schema syntax errors',
        'Check against JSON Schema Draft-07 specification',
        'Use a JSON Schema validator'
      ]
    };
  }

  private createMplpRuleError(
    schemaName: string, 
    field: string, 
    message: string, 
    details: string
  ): ValidationError {
    return {
      errorId: this.generateErrorId(),
      errorCode: 'MPLP_RULE_ERROR',
      errorType: 'semantic',
      message,
      details,
      location: {
        schemaFile: schemaName,
        jsonPath: field,
        context: 'MPLP specific rules'
      },
      severity: 'error',
      suggestions: [
        'Follow MPLP schema conventions',
        'Add required MPLP-specific fields',
        'Check MPLP documentation'
      ]
    };
  }

  private createBestPracticeWarning(
    schemaName: string, 
    field: string, 
    message: string, 
    details: string
  ): ValidationWarning {
    return {
      warningId: this.generateErrorId(),
      warningCode: 'BEST_PRACTICE_WARNING',
      warningType: 'best_practice',
      message,
      details,
      location: {
        schemaFile: schemaName,
        jsonPath: field,
        context: 'Best practices check'
      },
      severity: 'info',
      suggestions: [
        'Add meaningful descriptions',
        'Include version information',
        'Follow schema documentation best practices'
      ]
    };
  }

  private createUnexpectedError(schemaName: string, error: Error): ValidationError {
    return {
      errorId: this.generateErrorId(),
      errorCode: 'UNEXPECTED_ERROR',
      errorType: 'syntax',
      message: 'Unexpected error during validation',
      details: error.message,
      location: {
        schemaFile: schemaName,
        jsonPath: '',
        context: 'Validation process'
      },
      severity: 'critical',
      suggestions: [
        'Check the schema file format',
        'Report this issue to the development team',
        'Try validating with a different tool'
      ]
    };
  }

  private createDirectoryError(dirPath: string, error: Error): ValidationError {
    return {
      errorId: this.generateErrorId(),
      errorCode: 'DIRECTORY_ACCESS_ERROR',
      errorType: 'syntax',
      message: `Cannot access schemas directory: ${dirPath}`,
      details: error.message,
      location: {
        schemaFile: dirPath,
        jsonPath: '',
        context: 'Directory access'
      },
      severity: 'critical',
      suggestions: [
        'Check if the directory exists',
        'Verify directory permissions',
        'Ensure the path is correct'
      ]
    };
  }

  private createValidationResult(
    isValid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    startTime: number,
    rulesApplied: string[]
  ): ValidationResult {
    const metadata: ValidationMetadata = {
      validatorVersion: this.validatorVersion,
      validationTimestamp: new Date().toISOString(),
      totalSchemasChecked: 1,
      validationDurationMs: Date.now() - startTime,
      rulesApplied
    };

    return {
      isValid,
      errors,
      warnings,
      metadata
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
