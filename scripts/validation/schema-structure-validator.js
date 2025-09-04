#!/usr/bin/env node

/**
 * MPLP Schema Structure Validator
 * 
 * 验证Schema文件的结构和完整性：
 * 1. 检查所有必需的Schema文件是否存在
 * 2. 验证Schema文件的JSON格式
 * 3. 检查Schema版本和结构
 * 4. 验证snake_case命名约定
 */

const fs = require('fs');
const path = require('path');

class SchemaStructureValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checkedSchemas = 0;
    this.validSchemas = 0;
  }

  /**
   * 运行完整的Schema结构验证
   */
  runValidation() {
    console.log('🔍 开始Schema结构验证...\n');

    try {
      // 1. 扫描Schema文件
      const schemaFiles = this.scanSchemaFiles();
      console.log(`📁 找到 ${schemaFiles.length} 个Schema文件`);

      // 2. 验证每个Schema文件
      for (const schemaFile of schemaFiles) {
        this.validateSchemaFile(schemaFile);
      }

      // 3. 检查必需的Schema文件
      this.checkRequiredSchemas(schemaFiles);

      // 4. 输出结果
      this.outputResults();

    } catch (error) {
      console.error('❌ Schema结构验证失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 扫描Schema文件
   */
  scanSchemaFiles() {
    const schemaFiles = [];
    const schemaDir = 'src/schemas';

    if (!fs.existsSync(schemaDir)) {
      this.errors.push('src/schemas目录不存在');
      return schemaFiles;
    }

    this.scanDirectoryForSchemas(schemaDir, schemaFiles);
    return schemaFiles;
  }

  /**
   * 递归扫描目录查找Schema文件
   */
  scanDirectoryForSchemas(dir, schemaFiles) {
    if (!fs.existsSync(dir)) {
      return;
    }

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            this.scanDirectoryForSchemas(fullPath, schemaFiles);
          } else if (stat.isFile() && item.endsWith('.json')) {
            // 只处理mplp-*.json文件
            if (item.startsWith('mplp-') && item.endsWith('.json')) {
              schemaFiles.push(fullPath);
            }
          }
        } catch (statError) {
          // 忽略无法访问的文件
          continue;
        }
      }
    } catch (readError) {
      this.warnings.push(`无法读取目录 ${dir}: ${readError.message}`);
    }
  }

  /**
   * 验证单个Schema文件
   */
  validateSchemaFile(schemaFile) {
    try {
      console.log(`🔍 验证 ${schemaFile}...`);

      const content = fs.readFileSync(schemaFile, 'utf8');
      this.checkedSchemas++;

      // 1. 验证JSON格式
      let schema;
      try {
        schema = JSON.parse(content);
      } catch (parseError) {
        this.errors.push(`${schemaFile}: JSON格式错误 - ${parseError.message}`);
        return;
      }

      // 2. 验证Schema基本结构
      this.validateSchemaStructure(schemaFile, schema);

      // 3. 验证命名约定
      this.validateNamingConventions(schemaFile, schema);

      // 4. 验证字段类型
      this.validateFieldTypes(schemaFile, schema);

      this.validSchemas++;
      console.log(`✅ ${schemaFile} 验证通过`);

    } catch (error) {
      this.errors.push(`读取Schema文件失败 ${schemaFile}: ${error.message}`);
    }
  }

  /**
   * 验证Schema基本结构
   */
  validateSchemaStructure(schemaFile, schema) {
    // 检查必需的顶级字段
    const requiredFields = ['$schema', 'type', 'properties'];
    
    for (const field of requiredFields) {
      if (!schema.hasOwnProperty(field)) {
        this.errors.push(`${schemaFile}: 缺少必需字段 '${field}'`);
      }
    }

    // 检查Schema版本
    if (schema.$schema) {
      if (!schema.$schema.includes('draft-07')) {
        this.warnings.push(`${schemaFile}: 建议使用JSON Schema draft-07`);
      }
    }

    // 检查类型
    if (schema.type && schema.type !== 'object') {
      this.warnings.push(`${schemaFile}: 顶级类型应该是 'object'`);
    }

    // 检查properties
    if (schema.properties && typeof schema.properties !== 'object') {
      this.errors.push(`${schemaFile}: 'properties' 应该是对象`);
    }
  }

  /**
   * 验证命名约定（snake_case）
   */
  validateNamingConventions(schemaFile, schema) {
    if (!schema.properties) {
      return;
    }

    const properties = Object.keys(schema.properties);
    let snakeCaseCount = 0;
    let camelCaseCount = 0;
    
    for (const prop of properties) {
      if (this.isSnakeCase(prop)) {
        snakeCaseCount++;
      } else if (this.isCamelCase(prop)) {
        camelCaseCount++;
        this.warnings.push(`${schemaFile}: 字段 '${prop}' 使用camelCase，建议使用snake_case`);
      }
    }

    if (snakeCaseCount > 0) {
      console.log(`  ✅ 发现 ${snakeCaseCount} 个snake_case字段`);
    }
    
    if (camelCaseCount > 0) {
      console.log(`  ⚠️ 发现 ${camelCaseCount} 个camelCase字段`);
    }
  }

  /**
   * 验证字段类型
   */
  validateFieldTypes(schemaFile, schema) {
    if (!schema.properties) {
      return;
    }

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      if (typeof fieldSchema !== 'object') {
        this.errors.push(`${schemaFile}: 字段 '${fieldName}' 的Schema定义无效`);
        continue;
      }

      // 检查类型定义
      if (!fieldSchema.type && !fieldSchema.$ref && !fieldSchema.anyOf && !fieldSchema.oneOf) {
        this.warnings.push(`${schemaFile}: 字段 '${fieldName}' 缺少类型定义`);
      }

      // 检查常见的字段模式
      if (fieldName.endsWith('_id') && fieldSchema.type !== 'string') {
        this.warnings.push(`${schemaFile}: ID字段 '${fieldName}' 建议使用string类型`);
      }

      if (fieldName.endsWith('_at') && fieldSchema.type !== 'string') {
        this.warnings.push(`${schemaFile}: 时间字段 '${fieldName}' 建议使用string类型（ISO 8601）`);
      }
    }
  }

  /**
   * 检查是否为snake_case
   */
  isSnakeCase(str) {
    return /^[a-z]+(_[a-z]+)*$/.test(str);
  }

  /**
   * 检查是否为camelCase
   */
  isCamelCase(str) {
    return /^[a-z]+[A-Z][a-zA-Z]*$/.test(str);
  }

  /**
   * 检查必需的Schema文件
   */
  checkRequiredSchemas(schemaFiles) {
    const requiredSchemas = [
      'mplp-context.json',
      'mplp-plan.json',
      'mplp-role.json',
      'mplp-confirm.json',
      'mplp-trace.json',
      'mplp-extension.json',
      'mplp-dialog.json',
      'mplp-collab.json',
      'mplp-core.json',
      'mplp-network.json'
    ];

    const foundSchemas = schemaFiles.map(file => path.basename(file));
    
    for (const requiredSchema of requiredSchemas) {
      if (!foundSchemas.includes(requiredSchema)) {
        this.warnings.push(`缺少核心Schema文件: ${requiredSchema}`);
      }
    }

    console.log(`\n📋 核心Schema文件检查: ${foundSchemas.filter(f => requiredSchemas.includes(f)).length}/${requiredSchemas.length} 找到`);
  }

  /**
   * 输出验证结果
   */
  outputResults() {
    console.log('\n📊 Schema结构验证结果:');
    console.log(`检查的Schema文件: ${this.checkedSchemas}`);
    console.log(`有效的Schema文件: ${this.validSchemas}`);
    console.log(`错误: ${this.errors.length}`);
    console.log(`警告: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ 错误:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ 所有Schema结构验证通过！');
    }
    
    // 如果有错误，退出码为1
    if (this.errors.length > 0) {
      console.log('\n❌ Schema结构验证失败');
      process.exit(1);
    } else {
      console.log('\n✅ Schema结构验证成功');
      process.exit(0);
    }
  }
}

// 运行验证
if (require.main === module) {
  const validator = new SchemaStructureValidator();
  try {
    validator.runValidation();
  } catch (error) {
    console.error('Schema结构验证失败:', error);
    process.exit(1);
  }
}

module.exports = SchemaStructureValidator;
