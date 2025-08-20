#!/usr/bin/env node

/**
 * 命名约定验证器 - 简化版本用于TDD重构
 * 功能：验证双重命名约定的基本合规性
 */

const fs = require('fs');
const path = require('path');

class NamingConventionValidator {
  constructor() {
    this.violations = [];
    this.warnings = [];
  }

  /**
   * 验证命名约定
   */
  async validateNamingConvention() {
    console.log('🔍 验证双重命名约定...');
    
    try {
      // 1. 验证Schema文件命名约定
      await this.validateSchemaFiles();
      
      // 2. 验证TypeScript文件命名约定
      await this.validateTypeScriptFiles();
      
      // 3. 输出结果
      this.outputResults();
      
      return this.violations.length === 0;
      
    } catch (error) {
      console.error('❌ 命名约定验证失败:', error.message);
      return false;
    }
  }

  /**
   * 验证Schema文件
   */
  async validateSchemaFiles() {
    const schemaDir = 'src/schemas';
    
    if (!fs.existsSync(schemaDir)) {
      this.violations.push('Schema目录不存在: src/schemas');
      return;
    }
    
    const schemaFiles = fs.readdirSync(schemaDir)
      .filter(file => file.endsWith('.json'));
    
    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      
      try {
        const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.validateSchemaFieldNaming(schema, filePath);
      } catch (error) {
        this.violations.push(`${filePath}: JSON格式错误 - ${error.message}`);
      }
    }
  }

  /**
   * 验证Schema字段命名
   */
  validateSchemaFieldNaming(obj, filePath, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
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
        this.validateSchemaFieldNaming(value, filePath, `${path}.${key}`);
      }
    }
  }

  /**
   * 验证TypeScript文件
   */
  async validateTypeScriptFiles() {
    const contextDir = 'src/modules/context';
    
    if (!fs.existsSync(contextDir)) {
      this.warnings.push('Context模块目录不存在');
      return;
    }
    
    // 检查Mapper文件
    const mapperFile = path.join(contextDir, 'api/mappers/context.mapper.ts');
    if (fs.existsSync(mapperFile)) {
      this.validateMapperFile(mapperFile);
    }
    
    // 检查DTO文件
    const dtoFiles = this.findFiles(contextDir, '**/*.dto.ts');
    for (const file of dtoFiles) {
      this.validateDTOFile(file);
    }
  }

  /**
   * 验证Mapper文件
   */
  validateMapperFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查必需方法
    const requiredMethods = ['toSchema', 'fromSchema', 'validateSchema'];
    requiredMethods.forEach(method => {
      if (!content.includes(`${method}(`)) {
        this.violations.push(`${filePath}: 缺少必需方法 ${method}`);
      }
    });
    
    // 检查常见的命名转换
    const conversions = [
      { snake: 'context_id', camel: 'contextId' },
      { snake: 'created_at', camel: 'createdAt' }
    ];
    
    conversions.forEach(({ snake, camel }) => {
      if (content.includes(snake) && !content.includes(camel)) {
        this.warnings.push(`${filePath}: 可能缺少${snake} → ${camel}的转换`);
      }
    });
  }

  /**
   * 验证DTO文件
   */
  validateDTOFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否使用了any类型
    if (content.includes(': any') || content.includes('<any>')) {
      this.violations.push(`${filePath}: 禁止使用any类型`);
    }
    
    // 检查camelCase命名
    const fieldMatches = content.match(/^\s*(\w+):\s*\w+/gm);
    if (fieldMatches) {
      fieldMatches.forEach(match => {
        const fieldName = match.split(':')[0].trim();
        if (!this.isCamelCase(fieldName) && !this.isAllowedException(fieldName)) {
          this.violations.push(`${filePath}: 字段"${fieldName}"违反camelCase命名约定`);
        }
      });
    }
  }

  /**
   * 查找文件
   */
  findFiles(dir, pattern) {
    const results = [];
    
    const search = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          search(fullPath);
        } else if (item.endsWith('.dto.ts')) {
          results.push(fullPath);
        }
      }
    };
    
    if (fs.existsSync(dir)) {
      search(dir);
    }
    
    return results;
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
      // JSON Schema标准字段
      '$schema', '$id', '$defs', '$ref',
      'additionalProperties', 'enum', 'const',
      'minLength', 'maxLength', 'minimum', 'maximum',
      'minItems', 'maxItems', 'uniqueItems',
      'oneOf', 'anyOf', 'allOf', 'not',
      'entityStatus', 'patternProperties',
      'exclusiveMinimum', 'exclusiveMaximum',
      'multipleOf', 'format', 'pattern',
      'contentEncoding', 'contentMediaType',
      'if', 'then', 'else',
      // TypeScript关键字
      'readonly', 'static', 'private', 'public', 'protected'
    ];
    return exceptions.includes(str);
  }

  /**
   * 输出结果
   */
  outputResults() {
    console.log('\n========================================');
    console.log('📊 命名约定验证结果');
    console.log('========================================');
    
    console.log(`❌ 违规数量: ${this.violations.length}`);
    console.log(`⚠️ 警告数量: ${this.warnings.length}`);
    
    if (this.violations.length > 0) {
      console.log('\n❌ 发现的违规:');
      this.violations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 发现的警告:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    if (this.violations.length === 0) {
      console.log('\n✅ 命名约定验证通过！');
    } else {
      console.log('\n💥 命名约定验证失败，请修复所有违规');
    }
    
    console.log('========================================\n');
  }
}

// 命令行使用
if (require.main === module) {
  const validator = new NamingConventionValidator();
  
  validator.validateNamingConvention()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('验证失败:', error.message);
      process.exit(1);
    });
}

module.exports = NamingConventionValidator;
