#!/usr/bin/env node

/**
 * Schema完整性验证和修复脚本
 * @description 系统性检查和修复MPLP v1.0所有Schema文件
 * @author MPLP Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    
    this.stats = {
      filesChecked: 0,
      structureErrors: 0,
      contentErrors: 0,
      validationErrors: 0,
      fixedIssues: 0
    };
    
    this.expectedModules = [
      'context', 'plan', 'confirm', 'trace', 'role', 'extension',
      'collab', 'dialog', 'network', 'core'
    ];
  }

  /**
   * 主要验证流程
   */
  async run() {
    console.log('🔍 开始Schema完整性验证...\n');
    
    try {
      // 1. 检查Schema文件存在性
      await this.checkSchemaFiles();
      
      // 2. 验证Schema文件结构
      await this.validateSchemaStructure();
      
      // 3. 修复非标准字段
      await this.fixNonStandardFields();
      
      // 4. 验证Schema内容
      await this.validateSchemaContent();
      
      // 5. 检查Schema索引
      await this.validateSchemaIndex();
      
      // 6. 生成报告
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 验证过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查Schema文件存在性
   */
  async checkSchemaFiles() {
    console.log('📁 检查Schema文件存在性...');
    
    const schemaDir = 'src/schemas';
    const missingFiles = [];
    
    for (const module of this.expectedModules) {
      const schemaFile = path.join(schemaDir, `mplp-${module}.json`);
      if (!fs.existsSync(schemaFile)) {
        missingFiles.push(schemaFile);
      }
    }
    
    if (missingFiles.length > 0) {
      console.error('❌ 缺失Schema文件:', missingFiles);
      this.stats.structureErrors += missingFiles.length;
    } else {
      console.log('✅ 所有Schema文件存在');
    }
  }

  /**
   * 验证Schema文件结构
   */
  async validateSchemaStructure() {
    console.log('🔍 验证Schema文件结构...');
    
    const schemaDir = 'src/schemas';
    const requiredFields = ['$schema', '$id', 'title', 'description', 'type'];
    
    for (const module of this.expectedModules) {
      const schemaFile = path.join(schemaDir, `mplp-${module}.json`);
      
      if (fs.existsSync(schemaFile)) {
        try {
          const schema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
          this.stats.filesChecked++;
          
          // 检查必需字段
          const missingFields = requiredFields.filter(field => !schema[field]);
          if (missingFields.length > 0) {
            console.warn(`⚠️ ${module} Schema缺少字段:`, missingFields);
            this.stats.structureErrors++;
          }
          
          // 检查$schema格式
          if (schema.$schema && !schema.$schema.includes('json-schema.org')) {
            console.warn(`⚠️ ${module} Schema $schema字段格式不正确`);
            this.stats.structureErrors++;
          }
          
          // 检查$id格式
          if (schema.$id && !schema.$id.startsWith('https://mplp.dev/schemas/')) {
            console.warn(`⚠️ ${module} Schema $id字段格式不正确`);
            this.stats.structureErrors++;
          }
          
        } catch (error) {
          console.error(`❌ ${module} Schema JSON格式错误:`, error.message);
          this.stats.structureErrors++;
        }
      }
    }
    
    console.log(`✅ Schema结构检查完成 (${this.stats.filesChecked}个文件)`);
  }

  /**
   * 修复非标准字段
   */
  async fixNonStandardFields() {
    console.log('🔧 修复非标准字段...');
    
    const schemaDir = 'src/schemas';
    const nonStandardFields = ['version', 'lastUpdated'];
    
    for (const module of this.expectedModules) {
      const schemaFile = path.join(schemaDir, `mplp-${module}.json`);
      
      if (fs.existsSync(schemaFile)) {
        try {
          const content = fs.readFileSync(schemaFile, 'utf8');
          const schema = JSON.parse(content);
          let modified = false;
          
          // 移除非标准字段
          for (const field of nonStandardFields) {
            if (schema[field]) {
              delete schema[field];
              modified = true;
              this.stats.fixedIssues++;
            }
          }
          
          // 如果有修改，写回文件
          if (modified) {
            const updatedContent = JSON.stringify(schema, null, 2);
            fs.writeFileSync(schemaFile, updatedContent, 'utf8');
            console.log(`✅ 修复 ${module} Schema非标准字段`);
          }
          
        } catch (error) {
          console.error(`❌ 修复 ${module} Schema时出错:`, error.message);
        }
      }
    }
  }

  /**
   * 验证Schema内容
   */
  async validateSchemaContent() {
    console.log('🔍 验证Schema内容...');
    
    const schemaDir = 'src/schemas';
    
    for (const module of this.expectedModules) {
      const schemaFile = path.join(schemaDir, `mplp-${module}.json`);
      
      if (fs.existsSync(schemaFile)) {
        try {
          const schema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
          
          // 使用AJV验证Schema本身
          const isValid = this.ajv.validateSchema(schema);
          if (!isValid) {
            console.warn(`⚠️ ${module} Schema验证失败:`, this.ajv.errors);
            this.stats.validationErrors++;
          } else {
            console.log(`✅ ${module} Schema验证通过`);
          }
          
        } catch (error) {
          console.error(`❌ 验证 ${module} Schema内容时出错:`, error.message);
          this.stats.contentErrors++;
        }
      }
    }
  }

  /**
   * 验证Schema索引
   */
  async validateSchemaIndex() {
    console.log('🔍 验证Schema索引...');
    
    const indexFile = 'src/schemas/index.ts';
    
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf8');
      
      // 检查是否导出了所有Schema
      const missingExports = this.expectedModules.filter(module => 
        !content.includes(`mplp-${module}.json`)
      );
      
      if (missingExports.length > 0) {
        console.warn('⚠️ Schema索引缺少导出:', missingExports);
        this.stats.structureErrors++;
      } else {
        console.log('✅ Schema索引完整');
      }
    } else {
      console.error('❌ Schema索引文件不存在');
      this.stats.structureErrors++;
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log('\n📊 Schema验证报告:');
    console.log('================================');
    console.log(`检查文件数量: ${this.stats.filesChecked}`);
    console.log(`结构错误: ${this.stats.structureErrors}`);
    console.log(`内容错误: ${this.stats.contentErrors}`);
    console.log(`验证错误: ${this.stats.validationErrors}`);
    console.log(`修复问题: ${this.stats.fixedIssues}`);
    console.log('================================');
    
    const totalErrors = this.stats.structureErrors + this.stats.contentErrors + this.stats.validationErrors;
    
    if (totalErrors === 0) {
      console.log('🎉 所有Schema验证通过！');
      process.exit(0);
    } else {
      console.log(`⚠️ 发现 ${totalErrors} 个问题需要修复`);
      process.exit(1);
    }
  }
}

// 运行验证器
if (require.main === module) {
  const validator = new SchemaValidator();
  validator.run().catch(console.error);
}

module.exports = SchemaValidator;
