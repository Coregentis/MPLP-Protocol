/**
 * Schema验证器工厂
 * 
 * 创建和管理Schema验证器实例
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from '../../../utils/logger';

export interface SchemaValidatorConfig {
  strict?: boolean;
  allErrors?: boolean;
  verbose?: boolean;
  formats?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  data?: unknown;
}

/**
 * Schema验证器工厂类
 */
export class SchemaValidatorFactory {
  private static instance: SchemaValidatorFactory;
  private logger: Logger;
  private validators: Map<string, Ajv>;

  private constructor() {
    this.logger = new Logger('SchemaValidatorFactory');
    this.validators = new Map();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): SchemaValidatorFactory {
    if (!SchemaValidatorFactory.instance) {
      SchemaValidatorFactory.instance = new SchemaValidatorFactory();
    }
    return SchemaValidatorFactory.instance;
  }

  /**
   * 创建验证器
   */
  createValidator(name: string, config: SchemaValidatorConfig = {}): Ajv {
    const defaultConfig: SchemaValidatorConfig = {
      strict: true,
      allErrors: true,
      verbose: false,
      formats: true
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    const ajv = new Ajv({
      strict: finalConfig.strict,
      allErrors: finalConfig.allErrors,
      verbose: finalConfig.verbose
    });

    if (finalConfig.formats) {
      addFormats(ajv);
    }

    this.validators.set(name, ajv);
    
    this.logger.debug('创建Schema验证器', {
      name,
      config: finalConfig
    });

    return ajv;
  }

  /**
   * 获取验证器
   */
  getValidator(name: string): Ajv | undefined {
    return this.validators.get(name);
  }

  /**
   * 验证数据
   */
  validate(validatorName: string, schema: unknown, data: unknown): ValidationResult {
    const validator = this.getValidator(validatorName);
    
    if (!validator) {
      return {
        valid: false,
        errors: [`验证器 ${validatorName} 不存在`]
      };
    }

    try {
      const validate = validator.compile(schema);
      const valid = validate(data);

      if (valid) {
        return {
          valid: true,
          data
        };
      } else {
        const errors = validate.errors?.map(error => {
          return `${error.instancePath || 'root'}: ${error.message}`;
        }) || ['未知验证错误'];

        return {
          valid: false,
          errors
        };
      }
    } catch (error) {
      this.logger.error('Schema验证失败', {
        validatorName,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        valid: false,
        errors: [error instanceof Error ? error.message : '验证过程中发生错误']
      };
    }
  }

  /**
   * 移除验证器
   */
  removeValidator(name: string): boolean {
    const removed = this.validators.delete(name);
    
    if (removed) {
      this.logger.debug('移除Schema验证器', { name });
    }
    
    return removed;
  }

  /**
   * 清理所有验证器
   */
  clear(): void {
    this.validators.clear();
    this.logger.info('清理所有Schema验证器');
  }

  /**
   * 获取所有验证器名称
   */
  getValidatorNames(): string[] {
    return Array.from(this.validators.keys());
  }
}
