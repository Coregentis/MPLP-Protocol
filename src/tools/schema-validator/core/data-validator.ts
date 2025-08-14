/**
 * MPLP Schema Data Validator
 * 
 * @description 基于Schema的数据验证器实现
 * @version 1.0.0
 * @standardized MPLP协议验证工具标准化规范 v1.0.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  DataValidator, 
  DataValidationRequest, 
  DataValidationResult, 
  DataValidationError, 
  DataValidationWarning,
  DataValidationMetadata,
  DataValidationOptions 
} from '../types';

export class MplpDataValidator implements DataValidator {
  private readonly ajv: Ajv;
  private readonly schemasPath: string;
  private readonly validatorCache: Map<string, ValidateFunction> = new Map();
  private readonly schemaCache: Map<string, Record<string, unknown>> = new Map();

  constructor(schemasPath: string = 'src/schemas') {
    this.schemasPath = schemasPath;
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: false, // 允许额外属性以提高兼容性
      validateFormats: true,
      removeAdditional: false // 保留额外属性
    });
    addFormats(this.ajv);
    
    // 添加自定义格式
    this.addCustomFormats();
  }

  /**
   * 验证单个数据对象
   */
  async validateData(request: DataValidationRequest): Promise<DataValidationResult> {
    const startTime = Date.now();
    const errors: DataValidationError[] = [];
    const warnings: DataValidationWarning[] = [];

    try {
      // 获取验证器
      const validator = await this.getValidator(request.schemaName);
      
      if (!validator) {
        errors.push({
          errorPath: '',
          errorMessage: `Schema '${request.schemaName}' not found`,
          expectedType: 'schema',
          actualType: 'undefined',
          value: null,
          constraint: 'schema-exists'
        });
        
        return this.createDataValidationResult(
          false, 
          request.data, 
          errors, 
          warnings, 
          request.schemaName, 
          startTime
        );
      }

      // 执行验证
      const isValid = validator(request.data);
      
      if (!isValid && validator.errors) {
        // 转换AJV错误为我们的格式
        for (const ajvError of validator.errors) {
          errors.push(this.convertAjvError(ajvError));
        }
      }

      // 执行自定义验证
      if (request.validationOptions.customValidators) {
        const customErrors = await this.runCustomValidators(
          request.data, 
          request.validationOptions.customValidators
        );
        errors.push(...customErrors);
      }

      // 检查最佳实践
      if (request.validationOptions.strictMode) {
        const practiceWarnings = this.checkBestPractices(request.data, request.schemaName);
        warnings.push(...practiceWarnings);
      }

      // 处理验证后的数据
      let validatedData = request.data;
      if (isValid && !request.validationOptions.allowAdditionalProperties) {
        validatedData = this.removeAdditionalProperties(request.data, request.schemaName);
      }

      return this.createDataValidationResult(
        errors.length === 0, 
        validatedData, 
        errors, 
        warnings, 
        request.schemaName, 
        startTime
      );

    } catch (error) {
      errors.push({
        errorPath: '',
        errorMessage: `Validation failed: ${(error as Error).message}`,
        expectedType: 'valid-data',
        actualType: 'error',
        value: request.data,
        constraint: 'validation-process'
      });

      return this.createDataValidationResult(
        false, 
        request.data, 
        errors, 
        warnings, 
        request.schemaName, 
        startTime
      );
    }
  }

  /**
   * 批量验证数据
   */
  async validateBatch(requests: DataValidationRequest[]): Promise<DataValidationResult[]> {
    const results: DataValidationResult[] = [];
    
    // 并行验证以提高性能
    const validationPromises = requests.map(request => this.validateData(request));
    const batchResults = await Promise.allSettled(validationPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        // 创建错误结果
        results.push({
          isValid: false,
          validatedData: null,
          errors: [{
            errorPath: '',
            errorMessage: `Batch validation failed: ${result.reason}`,
            expectedType: 'valid-data',
            actualType: 'error',
            value: null,
            constraint: 'batch-validation'
          }],
          warnings: [],
          metadata: {
            schemaUsed: 'unknown',
            validationRules: 0,
            validationTimeMs: 0,
            dataSize: 0
          }
        });
      }
    }
    
    return results;
  }

  /**
   * 创建特定Schema的验证器函数
   */
  createValidator(schemaName: string): (data: unknown) => DataValidationResult {
    return (data: unknown) => {
      const request: DataValidationRequest = {
        schemaName,
        data,
        validationOptions: {
          strictMode: true,
          allowAdditionalProperties: false,
          validateReferences: true,
          customValidators: {}
        }
      };
      
      // 注意：这里返回Promise，但接口定义为同步
      // 在实际使用中，可能需要调整接口设计
      return this.validateData(request) as unknown as DataValidationResult;
    };
  }

  /**
   * 获取验证器
   */
  private async getValidator(schemaName: string): Promise<ValidateFunction | null> {
    // 检查缓存
    if (this.validatorCache.has(schemaName)) {
      return this.validatorCache.get(schemaName)!;
    }

    try {
      // 加载Schema
      const schema = await this.loadSchema(schemaName);
      
      // 编译验证器
      const validator = this.ajv.compile(schema);
      
      // 缓存验证器
      this.validatorCache.set(schemaName, validator);
      
      return validator;
    } catch (error) {
      console.error(`Failed to create validator for ${schemaName}:`, error);
      return null;
    }
  }

  /**
   * 加载Schema
   */
  private async loadSchema(schemaName: string): Promise<Record<string, unknown>> {
    // 检查缓存
    if (this.schemaCache.has(schemaName)) {
      return this.schemaCache.get(schemaName)!;
    }

    const schemaPath = path.join(this.schemasPath, `${schemaName}.json`);
    const content = await fs.readFile(schemaPath, 'utf-8');
    const schema = JSON.parse(content) as Record<string, unknown>;
    
    // 缓存Schema
    this.schemaCache.set(schemaName, schema);
    
    return schema;
  }

  /**
   * 添加自定义格式
   */
  private addCustomFormats(): void {
    // UUID格式
    this.ajv.addFormat('uuid', {
      type: 'string',
      validate: (data: string) => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data);
      }
    });

    // MPLP模块类型格式
    this.ajv.addFormat('mplp-module', {
      type: 'string',
      validate: (data: string) => {
        const validModules = [
          'core', 'context', 'plan', 'confirm', 'trace', 'role',
          'extension', 'collab', 'dialog', 'network',
          'coordination', 'orchestration', 'transaction',
          'eventBus', 'stateSync', 'protocolVersion',
          'errorHandling', 'security', 'performance'
        ];
        return validModules.includes(data);
      }
    });

    // 错误代码格式
    this.ajv.addFormat('error-code', {
      type: 'string',
      validate: (data: string) => {
        return /^[A-Z]{4}[0-9]{4}$/.test(data);
      }
    });
  }

  /**
   * 转换AJV错误
   */
  private convertAjvError(ajvError: any): DataValidationError {
    return {
      errorPath: ajvError.instancePath || ajvError.dataPath || '',
      errorMessage: ajvError.message || 'Validation error',
      expectedType: this.getExpectedType(ajvError),
      actualType: typeof ajvError.data,
      value: ajvError.data,
      constraint: ajvError.keyword || 'unknown'
    };
  }

  /**
   * 获取期望类型
   */
  private getExpectedType(ajvError: any): string {
    if (ajvError.schema && typeof ajvError.schema === 'object') {
      if (ajvError.schema.type) {
        return ajvError.schema.type;
      }
      if (ajvError.schema.enum) {
        return `enum: ${ajvError.schema.enum.join('|')}`;
      }
    }
    return ajvError.keyword || 'unknown';
  }

  /**
   * 运行自定义验证器
   */
  private async runCustomValidators(
    data: unknown, 
    customValidators: Record<string, (value: unknown) => boolean>
  ): Promise<DataValidationError[]> {
    const errors: DataValidationError[] = [];

    for (const [validatorName, validatorFn] of Object.entries(customValidators)) {
      try {
        const isValid = validatorFn(data);
        if (!isValid) {
          errors.push({
            errorPath: '',
            errorMessage: `Custom validator '${validatorName}' failed`,
            expectedType: 'valid-data',
            actualType: typeof data,
            value: data,
            constraint: `custom-${validatorName}`
          });
        }
      } catch (error) {
        errors.push({
          errorPath: '',
          errorMessage: `Custom validator '${validatorName}' threw error: ${(error as Error).message}`,
          expectedType: 'valid-data',
          actualType: 'error',
          value: data,
          constraint: `custom-${validatorName}-error`
        });
      }
    }

    return errors;
  }

  /**
   * 检查最佳实践
   */
  private checkBestPractices(data: unknown, schemaName: string): DataValidationWarning[] {
    const warnings: DataValidationWarning[] = [];

    if (typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;

      // 检查是否有ID字段
      const hasId = Object.keys(dataObj).some(key => 
        key.endsWith('_id') || key === 'id'
      );
      
      if (!hasId) {
        warnings.push({
          warningPath: '',
          warningMessage: 'Object should have an identifier field',
          suggestion: 'Add an ID field following MPLP naming convention (e.g., context_id)'
        });
      }

      // 检查时间戳字段
      const hasTimestamp = Object.keys(dataObj).some(key => 
        key.includes('_at') || key.includes('timestamp')
      );
      
      if (!hasTimestamp) {
        warnings.push({
          warningPath: '',
          warningMessage: 'Object should have timestamp fields',
          suggestion: 'Add timestamp fields like created_at, updated_at'
        });
      }

      // 检查字段命名约定
      for (const key of Object.keys(dataObj)) {
        if (this.isCamelCase(key)) {
          warnings.push({
            warningPath: key,
            warningMessage: `Field '${key}' uses camelCase, should use snake_case`,
            suggestion: `Rename '${key}' to follow snake_case convention`
          });
        }
      }
    }

    return warnings;
  }

  /**
   * 检查是否为camelCase
   */
  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str) && /[A-Z]/.test(str);
  }

  /**
   * 移除额外属性
   */
  private removeAdditionalProperties(data: unknown, schemaName: string): unknown {
    // 这里应该基于Schema定义来移除额外属性
    // 简化实现，直接返回原数据
    return data;
  }

  /**
   * 创建数据验证结果
   */
  private createDataValidationResult(
    isValid: boolean,
    validatedData: unknown,
    errors: DataValidationError[],
    warnings: DataValidationWarning[],
    schemaName: string,
    startTime: number
  ): DataValidationResult {
    const metadata: DataValidationMetadata = {
      schemaUsed: schemaName,
      validationRules: errors.length + warnings.length,
      validationTimeMs: Date.now() - startTime,
      dataSize: this.calculateDataSize(validatedData)
    };

    return {
      isValid,
      validatedData,
      errors,
      warnings,
      metadata
    };
  }

  /**
   * 计算数据大小
   */
  private calculateDataSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}
