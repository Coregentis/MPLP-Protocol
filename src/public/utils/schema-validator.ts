/**
 * MPLP Schema验证工具 - 厂商中立设计
 * 
 * 用于验证Schema结构符合MPLP标准，确保所有模块的Schema定义一致性。
 * 遵循厂商中立原则，不依赖特定Schema验证服务。
 * 
 * @version v1.0.0
 * @created 2025-07-31T10:00:00+08:00
 * @updated 2025-08-14T17:00:00+08:00
 * @compliance .cursor/rules/schema-standards.mdc - Schema设计标准
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from './logger';

/**
 * Schema验证结果接口
 */
export interface SchemaValidationResult {
  /**
   * 是否验证通过
   */
  valid: boolean;
  
  /**
   * 错误信息（如果验证失败）
   */
  errors?: unknown[];
  
  /**
   * 警告信息（不影响验证结果）
   */
  warnings?: string[];
  
  /**
   * 附加信息
   */
  info?: Record<string, unknown>;
}

/**
 * Schema统计信息接口
 */
export interface SchemaStats {
  /**
   * 属性数量
   */
  properties: number;
  
  /**
   * 必填字段数量
   */
  requiredFields: number;
  
  /**
   * 定义数量
   */
  definitions: number;
  
  /**
   * 示例数量
   */
  examples: number;
  
  /**
   * 枚举值数量
   */
  enumValues: number;
}

/**
 * Schema验证工具类
 */
export class SchemaValidator {
  private ajv: Ajv;
  private logger: Logger;
  
  /**
   * 构造函数
   */
  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strictSchema: true,
      validateFormats: true
    });
    addFormats(this.ajv);
    this.logger = new Logger('SchemaValidator');
  }
  
  /**
   * 验证Schema文件符合MPLP标准
   * 
   * @param schemaFilePath Schema文件路径
   * @returns 验证结果
   */
  public validateSchemaFile(schemaFilePath: string): SchemaValidationResult {
    try {
      // 读取Schema文件
      const schemaContent = fs.readFileSync(schemaFilePath, 'utf-8');
      const schema = JSON.parse(schemaContent);
      
      // 验证基本结构
      return this.validateSchemaStructure(schema, path.basename(schemaFilePath));
    } catch (error: unknown) {
      this.logger.error(`Schema文件验证失败: ${error instanceof Error ? error.message : String(error)}`);
      return {
        valid: false,
        errors: [{ message: `无法解析Schema文件: ${error instanceof Error ? error.message : String(error)}` }]
      };
    }
  }
  
  /**
   * 验证Schema基本结构
   * 
   * @param schema Schema对象
   * @param schemaName Schema名称
   * @returns 验证结果
   */
  public validateSchemaStructure(schema: unknown, schemaName: string): SchemaValidationResult {
    const errors = [];
    const warnings = [];
    
    // 检查必需的顶层字段
    const requiredTopFields = ['$schema', '$id', 'title', 'description', 'type', 'properties', 'required'];
    for (const field of requiredTopFields) {
      if (!schema[field]) {
        errors.push({
          message: `缺少必需的顶层字段: "${field}"`,
          field
        });
      }
    }
    
    // 检查$schema版本
    if (schema.$schema && !schema.$schema.includes('2020-12')) {
      warnings.push(`$schema应使用2020-12版本，当前值: "${schema.$schema}"`);
    }
    
    // 检查$id格式
    if (schema.$id && !schema.$id.startsWith('https://mplp.dev/schemas/')) {
      warnings.push(`$id应以"https://mplp.dev/schemas/"开头，当前值: "${schema.$id}"`);
    }
    
    // 检查type
    if (schema.type !== 'object') {
      errors.push({
        message: `顶层type应为"object"，当前值: "${schema.type}"`,
        field: 'type'
      });
    }
    
    // 检查additionalProperties
    if (schema.additionalProperties !== false) {
      warnings.push('推荐设置additionalProperties为false以确保数据严格符合Schema');
    }
    
    // 检查protocolVersion
    if (schema.properties && !schema.properties.protocolVersion) {
      errors.push({
        message: '缺少protocolVersion字段定义',
        field: 'properties.protocolVersion'
      });
    }
    
    // 检查必需字段是否包含protocolVersion、timestamp
    const requiredFields = schema.required || [];
    if (!requiredFields.includes('protocolVersion')) {
      errors.push({
        message: 'protocolVersion应为必填字段',
        field: 'required'
      });
    }
    if (!requiredFields.includes('timestamp')) {
      errors.push({
        message: 'timestamp应为必填字段',
        field: 'required'
      });
    }
    
    // 验证字段命名风格 (snake_case)
    if (schema.properties) {
      this.validateFieldNamingStyle(schema.properties, errors, '');
    }
    
    // 检查厂商中立性
    this.validateVendorNeutrality(schema, warnings);
    
    // 统计Schema信息
    const stats = this.getSchemaStats(schema);
    
    this.logger.debug(`Schema验证完成: ${schemaName}`, {
      valid: errors.length === 0,
      errors_count: errors.length,
      warnings_count: warnings.length,
      stats
    });
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      info: {
        name: schemaName,
        stats
      }
    };
  }
  
  /**
   * 验证字段命名风格 (snake_case)
   * 
   * @param properties 属性对象
   * @param errors 错误数组
   * @param path 当前路径
   */
  private validateFieldNamingStyle(properties: unknown, errors: unknown[], path: string): void {
    const snakeCasePattern = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
    
    for (const key of Object.keys(properties)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // 检查是否符合snake_case
      if (!snakeCasePattern.test(key)) {
        errors.push({
          message: `字段命名应使用snake_case风格: "${key}"`,
          field: currentPath
        });
      }
      
      // 递归检查嵌套属性
      if (properties[key] && 
          properties[key].properties && 
          typeof properties[key].properties === 'object') {
        this.validateFieldNamingStyle(properties[key].properties, errors, currentPath);
      }
    }
  }
  
  /**
   * 验证厂商中立性
   * 
   * @param schema Schema对象
   * @param warnings 警告数组
   */
  private validateVendorNeutrality(schema: unknown, warnings: string[]): void {
    // 厂商特定关键词列表
    const vendorKeywords = [
      'aws', 'amazon', 'azure', 'microsoft', 'gcp', 'google', 'alibaba', 
      'tencent', 'baidu', 'huawei', 'ibm', 'oracle'
    ];
    
    // 将Schema转换为字符串以便于搜索
    const schemaStr = JSON.stringify(schema).toLowerCase();
    
    // 检查是否包含厂商特定关键词
    for (const keyword of vendorKeywords) {
      if (schemaStr.includes(keyword)) {
        warnings.push(`Schema可能包含厂商特定内容: "${keyword}"`);
      }
    }
  }
  
  /**
   * 获取Schema统计信息
   * 
   * @param schema Schema对象
   * @returns 统计信息
   */
  private getSchemaStats(schema: unknown): SchemaStats {
    let propCount = 0;
    let enumCount = 0;
    
    // 递归计算属性数
    const countProps = (obj: unknown) => {
      if (!obj || typeof obj !== 'object') return;
      
      // 计数属性
      if (obj.properties) {
        propCount += Object.keys(obj.properties).length;
        
        // 递归计算子属性
        for (const prop of Object.values(obj.properties)) {
          countProps(prop);
        }
      }
      
      // 计数枚举值
      if (obj.enum && Array.isArray(obj.enum)) {
        enumCount += obj.enum.length;
      }
    };
    
    countProps(schema);
    
    // 定义数量
    const defCount = schema.$defs ? Object.keys(schema.$defs).length : 0;
    
    // 示例数量
    const exampleCount = schema.examples ? schema.examples.length : 0;
    
    return {
      properties: propCount,
      requiredFields: schema.required ? schema.required.length : 0,
      definitions: defCount,
      examples: exampleCount,
      enumValues: enumCount
    };
  }
  
  /**
   * 验证所有模块Schema
   * 
   * @returns 所有模块的验证结果
   */
  public validateAllSchemas(): Record<string, SchemaValidationResult> {
    const results: Record<string, SchemaValidationResult> = {};
    const schemaDir = path.join(process.cwd(), 'src', 'schemas');
    
    try {
      // 核心模块Schema文件名
      const coreSchemaFiles = [
        'context-protocol.json',
        'plan-protocol.json',
        'confirm-protocol.json',
        'trace-protocol.json',
        'role-protocol.json',
        'extension-protocol.json'
      ];
      
      // 验证每个模块Schema
      for (const fileName of coreSchemaFiles) {
        const filePath = path.join(schemaDir, fileName);
        if (fs.existsSync(filePath)) {
          const moduleName = fileName.split('-')[0];
          results[moduleName] = this.validateSchemaFile(filePath);
        } else {
          this.logger.warn(`缺少核心模块Schema文件: ${fileName}`);
          results[fileName.split('-')[0]] = {
            valid: false,
            errors: [{ message: `Schema文件不存在: ${fileName}` }]
          };
        }
      }
      
      // 检查其他Schema文件
      try {
        const files = fs.readdirSync(schemaDir);
        for (const file of files) {
          if (file.endsWith('.json') && !coreSchemaFiles.includes(file)) {
            const moduleName = file.split('.')[0];
            results[moduleName] = this.validateSchemaFile(path.join(schemaDir, file));
          }
        }
      } catch (error: unknown) {
        this.logger.error(`读取Schema目录失败: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      return results;
    } catch (error: unknown) {
      this.logger.error(`验证所有Schema失败: ${error instanceof Error ? error.message : String(error)}`);
      return {
        'error': {
          valid: false,
          errors: [{ message: `验证过程中发生错误: ${error instanceof Error ? error.message : String(error)}` }]
        }
      };
    }
  }
  
  /**
   * 生成Schema验证报告
   * 
   * @returns 验证报告
   */
  public generateValidationReport(): {
    totalSchemas: number;
    validSchemas: number;
    invalidSchemas: number;
    warningSchemas: number;
    results: Record<string, SchemaValidationResult>;
    summary: string;
  } {
    const results = this.validateAllSchemas();
    const schemaNames = Object.keys(results);
    
    let validCount = 0;
    let invalidCount = 0;
    let warningCount = 0;
    
    for (const result of Object.values(results)) {
      if (result.valid) {
        validCount++;
        if (result.warnings && result.warnings.length > 0) {
          warningCount++;
        }
      } else {
        invalidCount++;
      }
    }
    
    // 生成摘要
    const summary = `Schema验证完成: 共${schemaNames.length}个Schema, ${validCount}个有效, ${invalidCount}个无效, ${warningCount}个有警告`;
    
    this.logger.info(summary);
    
    return {
      totalSchemas: schemaNames.length,
      validSchemas: validCount,
      invalidSchemas: invalidCount,
      warningSchemas: warningCount,
      results,
      summary
    };
  }
} 