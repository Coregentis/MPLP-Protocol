#!/usr/bin/env node

/**
 * Schema与实体一致性检查脚本
 * @description 检查Schema定义与TypeScript实体定义的一致性
 * @author MPLP Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class SchemaEntityConsistencyChecker {
  constructor() {
    this.stats = {
      modulesChecked: 0,
      inconsistencies: 0,
      warnings: 0
    };
    
    this.modules = [
      { name: 'context', entityPath: 'src/modules/context/domain/entities/context.entity.ts' },
      { name: 'plan', entityPath: 'src/modules/plan/domain/entities/plan.entity.ts' },
      { name: 'confirm', entityPath: 'src/modules/confirm/domain/entities/confirm.entity.ts' },
      { name: 'trace', entityPath: 'src/modules/trace/domain/entities/trace.entity.ts' },
      { name: 'role', entityPath: 'src/modules/role/domain/entities/role.entity.ts' },
      { name: 'extension', entityPath: 'src/modules/extension/domain/entities/extension.entity.ts' },
      { name: 'collab', entityPath: 'src/modules/collab/domain/entities/collab.entity.ts' },
      { name: 'dialog', entityPath: 'src/modules/dialog/domain/entities/dialog.entity.ts' },
      { name: 'network', entityPath: 'src/modules/network/domain/entities/network.entity.ts' }
    ];
  }

  /**
   * 主要检查流程
   */
  async run() {
    console.log('🔍 开始Schema与实体一致性检查...\n');
    
    try {
      for (const module of this.modules) {
        await this.checkModule(module);
      }
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 检查过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查单个模块
   */
  async checkModule(module) {
    console.log(`🔍 检查 ${module.name} 模块...`);
    
    try {
      // 读取Schema
      const schemaPath = `src/schemas/mplp-${module.name}.json`;
      if (!fs.existsSync(schemaPath)) {
        console.warn(`⚠️ Schema文件不存在: ${schemaPath}`);
        this.stats.warnings++;
        return;
      }
      
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      // 读取实体文件
      if (!fs.existsSync(module.entityPath)) {
        console.warn(`⚠️ 实体文件不存在: ${module.entityPath}`);
        this.stats.warnings++;
        return;
      }
      
      const entityContent = fs.readFileSync(module.entityPath, 'utf8');
      
      // 检查一致性
      await this.checkConsistency(module.name, schema, entityContent);
      
      this.stats.modulesChecked++;
      
    } catch (error) {
      console.error(`❌ 检查 ${module.name} 模块时出错:`, error.message);
      this.stats.warnings++;
    }
  }

  /**
   * 检查一致性
   */
  async checkConsistency(moduleName, schema, entityContent) {
    const issues = [];
    
    // 获取Schema属性
    const schemaProperties = schema.properties || {};
    
    // 检查命名约定
    const schemaFields = Object.keys(schemaProperties);
    const snakeCaseFields = schemaFields.filter(field => field.includes('_'));
    const camelCaseFields = this.extractCamelCaseFields(entityContent);
    
    if (snakeCaseFields.length > 0 && camelCaseFields.length > 0) {
      issues.push({
        type: 'naming_convention',
        message: `命名约定不一致: Schema使用snake_case (${snakeCaseFields.slice(0, 3).join(', ')})，实体使用camelCase (${camelCaseFields.slice(0, 3).join(', ')})`
      });
    }
    
    // 检查必需字段
    const requiredFields = schema.required || [];
    const missingInEntity = requiredFields.filter(field => {
      const camelCaseField = this.snakeToCamel(field);
      return !entityContent.includes(camelCaseField) && !entityContent.includes(field);
    });
    
    if (missingInEntity.length > 0) {
      issues.push({
        type: 'missing_fields',
        message: `实体中缺少必需字段: ${missingInEntity.join(', ')}`
      });
    }
    
    // 检查类型定义
    await this.checkTypeDefinitions(moduleName, schemaProperties, entityContent, issues);
    
    // 报告问题
    if (issues.length > 0) {
      console.log(`❌ ${moduleName} 模块发现 ${issues.length} 个一致性问题:`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.type}] ${issue.message}`);
      });
      this.stats.inconsistencies += issues.length;
    } else {
      console.log(`✅ ${moduleName} 模块一致性检查通过`);
    }
  }

  /**
   * 检查类型定义
   */
  async checkTypeDefinitions(moduleName, schemaProperties, entityContent, issues) {
    // 检查常见的类型不匹配
    const typeChecks = [
      {
        schemaField: 'context_id',
        entityField: 'contextId',
        expectedType: 'UUID'
      },
      {
        schemaField: 'plan_id',
        entityField: 'planId',
        expectedType: 'UUID'
      },
      {
        schemaField: 'created_at',
        entityField: 'createdAt',
        expectedType: 'Date'
      },
      {
        schemaField: 'updated_at',
        entityField: 'updatedAt',
        expectedType: 'Date'
      }
    ];
    
    for (const check of typeChecks) {
      if (schemaProperties[check.schemaField]) {
        const hasEntityField = entityContent.includes(check.entityField);
        const hasCorrectType = entityContent.includes(`${check.entityField}: ${check.expectedType}`) ||
                              entityContent.includes(`${check.entityField}: Date`) ||
                              entityContent.includes(`readonly ${check.entityField}: ${check.expectedType}`);
        
        if (hasEntityField && !hasCorrectType) {
          issues.push({
            type: 'type_mismatch',
            message: `字段 ${check.entityField} 类型可能不匹配，期望: ${check.expectedType}`
          });
        }
      }
    }
  }

  /**
   * 提取camelCase字段
   */
  extractCamelCaseFields(content) {
    const matches = content.match(/(?:public|private|readonly)\s+(\w+):/g);
    if (!matches) return [];
    
    return matches
      .map(match => match.match(/(\w+):/)[1])
      .filter(field => /^[a-z][a-zA-Z]*$/.test(field))
      .slice(0, 10); // 限制数量
  }

  /**
   * snake_case转camelCase
   */
  snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * 生成检查报告
   */
  generateReport() {
    console.log('\n📊 Schema与实体一致性检查报告:');
    console.log('================================');
    console.log(`检查模块数量: ${this.stats.modulesChecked}`);
    console.log(`发现不一致: ${this.stats.inconsistencies}`);
    console.log(`警告信息: ${this.stats.warnings}`);
    console.log('================================');
    
    if (this.stats.inconsistencies === 0 && this.stats.warnings === 0) {
      console.log('🎉 所有模块一致性检查通过！');
    } else {
      console.log(`⚠️ 发现 ${this.stats.inconsistencies} 个不一致问题和 ${this.stats.warnings} 个警告`);
      
      console.log('\n💡 建议修复措施:');
      console.log('1. 统一命名约定: 建议Schema使用camelCase与TypeScript保持一致');
      console.log('2. 同步字段定义: 确保Schema required字段在实体中存在');
      console.log('3. 统一类型定义: 确保Schema类型与TypeScript类型匹配');
    }
  }
}

// 运行检查器
if (require.main === module) {
  const checker = new SchemaEntityConsistencyChecker();
  checker.run().catch(console.error);
}

module.exports = SchemaEntityConsistencyChecker;
