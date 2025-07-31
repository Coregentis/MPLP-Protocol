/**
 * Schema验证器
 * @description 提供统一的Schema验证功能，支持多种验证模式
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../../public/utils/logger';
import { createAjv, validateData, ValidationResult, AjvConfig } from './ajv-config';
import Ajv from 'ajv';

export interface SchemaValidatorConfig {
  mode: 'strict' | 'loose' | 'development';
  enableCaching: boolean;
  cacheSize: number;
  enableMetrics: boolean;
  customFormats?: Record<string, any>;
  customKeywords?: Record<string, any>;
}

export interface ValidationMetrics {
  total_validations: number;
  successful_validations: number;
  failed_validations: number;
  cache_hits: number;
  cache_misses: number;
  average_validation_time: number;
}

/**
 * Schema验证器类
 */
export class SchemaValidator {
  private ajv: Ajv;
  private schemaCache = new Map<string, any>();
  private validatorCache = new Map<string, Function>();
  private metrics: ValidationMetrics;
  private logger: Logger;

  constructor(private config: SchemaValidatorConfig) {
    this.logger = new Logger('SchemaValidator');
    this.metrics = {
      total_validations: 0,
      successful_validations: 0,
      failed_validations: 0,
      cache_hits: 0,
      cache_misses: 0,
      average_validation_time: 0
    };

    this.ajv = this.createAjvInstance();
    this.logger.info('Schema validator initialized', { config });
  }

  /**
   * 验证数据
   */
  async validate<T = any>(schema: object, data: unknown, schemaId?: string): Promise<ValidationResult> {
    const startTime = Date.now();
    this.metrics.total_validations++;

    try {
      let validator: Function;

      if (schemaId && this.config.enableCaching) {
        validator = this.getValidatorFromCache(schemaId, schema);
      } else {
        validator = this.ajv.compile(schema);
      }

      const valid = validator(data);
      const errors = (validator as any).errors || [];

      const result: ValidationResult = {
        valid,
        errors: errors.map((error: any) => ({
          instancePath: error.instancePath,
          schemaPath: error.schemaPath,
          keyword: error.keyword,
          params: error.params || {},
          message: error.message,
          data: error.data,
          schema: error.schema
        })),
        data: valid ? data : undefined
      };

      if (valid) {
        this.metrics.successful_validations++;
      } else {
        this.metrics.failed_validations++;
        this.logger.debug('Validation failed', { errors: result.errors });
      }

      this.updateMetrics(startTime);
      return result;

    } catch (error) {
      this.metrics.failed_validations++;
      this.logger.error('Validation error', { error });
      
      return {
        valid: false,
        errors: [{
          instancePath: '',
          schemaPath: '',
          keyword: 'validation',
          params: {},
          message: error instanceof Error ? error.message : 'Unknown validation error'
        }]
      };
    }
  }

  /**
   * 批量验证
   */
  async validateBatch(validations: Array<{ schema: object; data: unknown; id?: string }>): Promise<ValidationResult[]> {
    const results = await Promise.all(
      validations.map(({ schema, data, id }) => this.validate(schema, data, id))
    );

    return results;
  }

  /**
   * 验证Schema本身
   */
  validateSchema(schema: object): ValidationResult {
    try {
      this.ajv.compile(schema);
      return {
        valid: true,
        errors: []
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          instancePath: '',
          schemaPath: '',
          keyword: 'schema',
          params: {},
          message: error instanceof Error ? error.message : 'Invalid schema'
        }]
      };
    }
  }

  /**
   * 添加Schema到缓存
   */
  addSchema(id: string, schema: object): void {
    if (this.config.enableCaching) {
      this.schemaCache.set(id, schema);
      this.ajv.addSchema(schema, id);
      this.logger.debug('Schema added to cache', { id });
    }
  }

  /**
   * 移除Schema缓存
   */
  removeSchema(id: string): boolean {
    if (this.config.enableCaching) {
      const removed = this.schemaCache.delete(id) && this.validatorCache.delete(id);
      this.ajv.removeSchema(id);
      this.logger.debug('Schema removed from cache', { id });
      return removed;
    }
    return false;
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.schemaCache.clear();
    this.validatorCache.clear();
    this.logger.debug('Schema cache cleared');
  }

  /**
   * 获取验证指标
   */
  getMetrics(): ValidationMetrics {
    return { ...this.metrics };
  }

  /**
   * 重置指标
   */
  resetMetrics(): void {
    this.metrics = {
      total_validations: 0,
      successful_validations: 0,
      failed_validations: 0,
      cache_hits: 0,
      cache_misses: 0,
      average_validation_time: 0
    };
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    schema_count: number;
    validator_count: number;
    cache_size: number;
    hit_rate: number;
  } {
    const totalRequests = this.metrics.cache_hits + this.metrics.cache_misses;
    const hitRate = totalRequests > 0 ? this.metrics.cache_hits / totalRequests : 0;

    return {
      schema_count: this.schemaCache.size,
      validator_count: this.validatorCache.size,
      cache_size: this.config.cacheSize,
      hit_rate: hitRate
    };
  }

  /**
   * 创建AJV实例
   */
  private createAjvInstance(): Ajv {
    const ajvConfig: Partial<AjvConfig> = {
      strict: this.config.mode === 'strict',
      allErrors: true,
      verbose: this.config.mode === 'development',
      validateFormats: true,
      removeAdditional: this.config.mode === 'strict' ? 'failing' as const : false,
      useDefaults: true,
      coerceTypes: this.config.mode === 'loose'
    };

    const ajv = createAjv(ajvConfig);

    // 添加自定义格式
    if (this.config.customFormats) {
      Object.entries(this.config.customFormats).forEach(([name, format]) => {
        ajv.addFormat(name, format);
      });
    }

    // 添加自定义关键字
    if (this.config.customKeywords) {
      Object.entries(this.config.customKeywords).forEach(([name, keyword]) => {
        ajv.addKeyword(keyword);
      });
    }

    return ajv;
  }

  /**
   * 从缓存获取验证器
   */
  private getValidatorFromCache(schemaId: string, schema: object): Function {
    let validator = this.validatorCache.get(schemaId);

    if (validator) {
      this.metrics.cache_hits++;
      return validator;
    }

    this.metrics.cache_misses++;
    validator = this.ajv.compile(schema);

    // 检查缓存大小限制
    if (this.validatorCache.size >= this.config.cacheSize) {
      // 简单的LRU：删除第一个条目
      const firstKey = this.validatorCache.keys().next().value;
      if (firstKey) {
        this.validatorCache.delete(firstKey);
      }
    }

    this.validatorCache.set(schemaId, validator);
    return validator;
  }

  /**
   * 更新指标
   */
  private updateMetrics(startTime: number): void {
    const duration = Date.now() - startTime;
    const totalTime = this.metrics.average_validation_time * (this.metrics.total_validations - 1) + duration;
    this.metrics.average_validation_time = totalTime / this.metrics.total_validations;
  }
}

/**
 * 创建默认Schema验证器
 */
export function createSchemaValidator(config: Partial<SchemaValidatorConfig> = {}): SchemaValidator {
  const defaultConfig: SchemaValidatorConfig = {
    mode: 'strict',
    enableCaching: true,
    cacheSize: 100,
    enableMetrics: true
  };

  return new SchemaValidator({ ...defaultConfig, ...config });
}

/**
 * 创建开发模式验证器
 */
export function createDevelopmentValidator(): SchemaValidator {
  return createSchemaValidator({
    mode: 'development',
    enableCaching: false,
    enableMetrics: true
  });
}

/**
 * 创建生产模式验证器
 */
export function createProductionValidator(): SchemaValidator {
  return createSchemaValidator({
    mode: 'strict',
    enableCaching: true,
    cacheSize: 500,
    enableMetrics: false
  });
}
