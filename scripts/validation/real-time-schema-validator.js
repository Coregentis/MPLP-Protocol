#!/usr/bin/env node

/**
 * 实时Schema验证器 - IDE集成
 * 功能：保存时自动验证Schema合规性和命名约定
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class RealTimeSchemaValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.violations = [];
  }

  /**
   * 验证文件保存时的Schema合规性
   */
  async validateOnSave(filePath) {
    console.log(`🔍 实时验证: ${filePath}`);
    
    try {
      // 1. 检查文件类型
      if (filePath.endsWith('.json') && filePath.includes('mplp-')) {
        await this.validateSchemaFile(filePath);
      }
      
      if (filePath.endsWith('.ts') && filePath.includes('mapper')) {
        await this.validateMapperFile(filePath);
      }
      
      if (filePath.endsWith('.ts') && filePath.includes('.dto.')) {
        await this.validateDTOFile(filePath);
      }

      // 2. 输出验证结果
      if (this.violations.length === 0) {
        console.log('✅ 实时验证通过');
        return true;
      } else {
        console.error('❌ 实时验证失败:');
        this.violations.forEach(v => console.error(`  - ${v}`));
        
        // 阻断保存（如果配置为强制模式）
        if (process.env.STRICT_VALIDATION === 'true') {
          throw new Error('验证失败，保存被阻断');
        }
        return false;
      }
    } catch (error) {
      console.error('❌ 验证过程出错:', error.message);
      return false;
    }
  }

  /**
   * 验证Schema文件的命名约定
   */
  async validateSchemaFile(filePath) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 检查根级字段命名（必须是snake_case）
    this.checkSnakeCaseNaming(content, filePath);
    
    // 检查Schema结构完整性
    this.checkSchemaStructure(content, filePath);
    
    // 检查企业级功能字段
    this.checkEnterpriseFeatures(content, filePath);
  }

  /**
   * 验证Mapper文件的双重命名约定
   */
  async validateMapperFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查toSchema方法（camelCase → snake_case）
    if (!content.includes('toSchema(') || !content.includes('fromSchema(')) {
      this.violations.push(`${filePath}: 缺少必需的toSchema/fromSchema方法`);
    }
    
    // 检查命名转换的正确性
    this.checkNamingConversion(content, filePath);
  }

  /**
   * 验证DTO文件的类型安全性
   */
  async validateDTOFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否使用了any类型（零容忍）
    if (content.includes(': any') || content.includes('<any>')) {
      this.violations.push(`${filePath}: 禁止使用any类型`);
    }
    
    // 检查camelCase命名
    this.checkCamelCaseNaming(content, filePath);
  }

  /**
   * 检查snake_case命名约定
   */
  checkSnakeCaseNaming(obj, filePath, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof key === 'string') {
        // 检查字段名是否为snake_case
        if (!this.isSnakeCase(key) && !this.isAllowedException(key)) {
          this.violations.push(
            `${filePath}${path}: 字段"${key}"违反snake_case命名约定`
          );
        }
      }
      
      // 递归检查嵌套对象
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.checkSnakeCaseNaming(value, filePath, `${path}.${key}`);
      }
    }
  }

  /**
   * 检查camelCase命名约定
   */
  checkCamelCaseNaming(content, filePath) {
    // 提取接口和类型定义中的字段名
    const fieldMatches = content.match(/^\s*(\w+):\s*\w+/gm);
    if (fieldMatches) {
      fieldMatches.forEach(match => {
        const fieldName = match.split(':')[0].trim();
        if (!this.isCamelCase(fieldName) && !this.isAllowedException(fieldName)) {
          this.violations.push(
            `${filePath}: 字段"${fieldName}"违反camelCase命名约定`
          );
        }
      });
    }
  }

  /**
   * 检查Schema结构完整性
   */
  checkSchemaStructure(schema, filePath) {
    const requiredFields = ['$schema', '$id', 'title', 'description', 'type'];
    
    requiredFields.forEach(field => {
      if (!schema[field]) {
        this.violations.push(`${filePath}: 缺少必需字段"${field}"`);
      }
    });
    
    // 检查协议版本
    if (schema.properties && schema.properties.protocol_version) {
      const version = schema.properties.protocol_version.const;
      if (version !== '1.0.0') {
        this.violations.push(`${filePath}: 协议版本必须为"1.0.0"`);
      }
    }
  }

  /**
   * 检查企业级功能字段
   */
  checkEnterpriseFeatures(schema, filePath) {
    const enterpriseFeatures = [
      'audit_trail',
      'monitoring_integration', 
      'performance_metrics',
      'access_control',
      'error_handling'
    ];
    
    if (schema.properties) {
      enterpriseFeatures.forEach(feature => {
        if (!schema.properties[feature]) {
          this.violations.push(
            `${filePath}: 缺少企业级功能"${feature}"`
          );
        }
      });
    }
  }

  /**
   * 检查命名转换的正确性
   */
  checkNamingConversion(content, filePath) {
    // 检查常见的转换模式
    const conversions = [
      { snake: 'context_id', camel: 'contextId' },
      { snake: 'created_at', camel: 'createdAt' },
      { snake: 'protocol_version', camel: 'protocolVersion' },
      { snake: 'audit_trail', camel: 'auditTrail' }
    ];
    
    conversions.forEach(({ snake, camel }) => {
      if (content.includes(snake) && content.includes(camel)) {
        // 检查转换方向是否正确
        const toSchemaPattern = new RegExp(`${camel}.*${snake}`);
        const fromSchemaPattern = new RegExp(`${snake}.*${camel}`);
        
        if (!toSchemaPattern.test(content) || !fromSchemaPattern.test(content)) {
          this.violations.push(
            `${filePath}: ${snake} ↔ ${camel} 转换可能不正确`
          );
        }
      }
    });
  }

  /**
   * 判断是否为snake_case
   */
  isSnakeCase(str) {
    return /^[a-z][a-z0-9_]*$/.test(str);
  }

  /**
   * 判断是否为camelCase
   */
  isCamelCase(str) {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  /**
   * 判断是否为允许的例外
   */
  isAllowedException(str) {
    const exceptions = [
      '$schema', '$id', '$defs', '$ref',
      'additionalProperties', 'enum', 'const',
      'minLength', 'maxLength', 'minimum', 'maximum'
    ];
    return exceptions.includes(str);
  }
}

// 命令行使用
if (require.main === module) {
  const validator = new RealTimeSchemaValidator();
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('用法: node real-time-schema-validator.js <file-path>');
    process.exit(1);
  }
  
  validator.validateOnSave(filePath)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('验证失败:', error.message);
      process.exit(1);
    });
}

module.exports = RealTimeSchemaValidator;
