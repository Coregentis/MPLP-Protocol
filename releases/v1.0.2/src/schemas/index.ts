/**
 * MPLP Schema Module - 统一Schema验证
 * 
 * @version v1.0.0
 * @created 2025-01-09T25:10:00+08:00
 * @description 为所有MPLP协议提供统一的JSON Schema验证功能
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from '../utils/logger';

// 创建日志记录器实例
const logger = new Logger('SchemaValidator');

// Schema文件路径 - 6个核心模块 (使用require避免编译问题)
const contextProtocolSchema = require('./context-protocol.json');
const planProtocolSchema = require('./plan-protocol.json');
const confirmProtocolSchema = require('./confirm-protocol.json');
const traceProtocolSchema = require('./trace-protocol.json');
const roleProtocolSchema = require('./role-protocol.json');
const extensionProtocolSchema = require('./extension-protocol.json');

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  details?: any;
}

/**
 * MPLP Schema验证器
 */
export class MPLPSchemaValidator {
  private ajv: Ajv;
  private schemas: Map<string, any> = new Map();

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      loadSchema: this.loadSchema.bind(this)
    });
    
    // 添加格式支持
    addFormats(this.ajv);
    
    // 注册所有Schema
    this.registerSchemas();
  }

  /**
   * 注册所有Schema - 6个核心模块
   */
  private registerSchemas(): void {
    const schemas = [
      { name: 'context-protocol', schema: contextProtocolSchema },
      { name: 'plan-protocol', schema: planProtocolSchema },
      { name: 'confirm-protocol', schema: confirmProtocolSchema },
      { name: 'trace-protocol', schema: traceProtocolSchema },
      { name: 'role-protocol', schema: roleProtocolSchema },
      { name: 'extension-protocol', schema: extensionProtocolSchema }
    ];

    for (const { name, schema } of schemas) {
      try {
        this.ajv.addSchema(schema, name);
        this.schemas.set(name, schema);
        logger.info(`Schema注册成功: ${name}`);
      } catch (error) {
        logger.error(`Schema注册失败: ${name}`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * 动态加载Schema
   */
  private async loadSchema(uri: string): Promise<any> {
    // 这里可以实现动态加载远程Schema的逻辑
    return this.schemas.get(uri);
  }

  /**
   * 验证Context Protocol数据
   */
  validateContextProtocol(data: any): ValidationResult {
    return this.validate('context-protocol', data);
  }

  /**
   * 验证Plan Protocol数据
   */
  validatePlanProtocol(data: any): ValidationResult {
    return this.validate('plan-protocol', data);
  }

  /**
   * 验证Confirm Protocol数据
   */
  validateConfirmProtocol(data: any): ValidationResult {
    return this.validate('confirm-protocol', data);
  }

  /**
   * 验证Trace Protocol数据
   */
  validateTraceProtocol(data: any): ValidationResult {
    return this.validate('trace-protocol', data);
  }

  /**
   * 验证Role Protocol数据
   */
  validateRoleProtocol(data: any): ValidationResult {
    return this.validate('role-protocol', data);
  }

  /**
   * 验证Extension Protocol数据
   */
  validateExtensionProtocol(data: any): ValidationResult {
    return this.validate('extension-protocol', data);
  }

  /**
   * 通用验证方法
   */
  private validate(schemaName: string, data: any): ValidationResult {
    try {
      const validate = this.ajv.getSchema(schemaName);
      if (!validate) {
        return {
          valid: false,
          errors: [`Schema not found: ${schemaName}`]
        };
      }

      const valid = validate(data);
      
      if (!valid) {
        const errors = validate.errors?.map(error => {
          return `${error.instancePath} ${error.message}`;
        }) || ['Unknown validation error'];

        return {
          valid: false,
          errors,
          details: validate.errors
        };
      }

      return { valid: true };
    } catch (error) {
      logger.error(`Schema验证错误: ${schemaName}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        data: JSON.stringify(data, null, 2)
      });

      return {
        valid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * 批量验证
   */
  validateBatch(validations: Array<{ schema: string; data: any }>): ValidationResult[] {
    return validations.map(({ schema, data }) => {
      return {
        ...this.validate(schema, data),
        schema,
        data
      };
    });
  }

  /**
   * 获取Schema定义
   */
  getSchema(schemaName: string): any {
    return this.schemas.get(schemaName);
  }

  /**
   * 列出所有可用的Schema
   */
  getAvailableSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }
}

// 单例实例
export const schemaValidator = new MPLPSchemaValidator();

// 便捷验证函数 - 6个核心模块
export const validateContextProtocol = (data: any) => schemaValidator.validateContextProtocol(data);
export const validatePlanProtocol = (data: any) => schemaValidator.validatePlanProtocol(data);
export const validateConfirmProtocol = (data: any) => schemaValidator.validateConfirmProtocol(data);
export const validateTraceProtocol = (data: any) => schemaValidator.validateTraceProtocol(data);
export const validateRoleProtocol = (data: any) => schemaValidator.validateRoleProtocol(data);
export const validateExtensionProtocol = (data: any) => schemaValidator.validateExtensionProtocol(data);

export default schemaValidator; 