#!/usr/bin/env node

/**
 * Schema批量修复脚本
 * @description 批量修复所有Schema文件的标准化问题
 * @author MPLP Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class SchemaFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      issuesFixed: 0
    };
    
    this.expectedModules = [
      'context', 'plan', 'confirm', 'trace', 'role', 'extension',
      'collab', 'dialog', 'network', 'core'
    ];
  }

  /**
   * 主要修复流程
   */
  async run() {
    console.log('🔧 开始Schema批量修复...\n');
    
    try {
      // 1. 修复Schema文件
      await this.fixSchemaFiles();
      
      // 2. 修复Schema索引
      await this.fixSchemaIndex();
      
      // 3. 生成报告
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 修复过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复Schema文件
   */
  async fixSchemaFiles() {
    console.log('🔧 修复Schema文件...');
    
    const schemaDir = 'src/schemas';
    
    for (const module of this.expectedModules) {
      const schemaFile = path.join(schemaDir, `mplp-${module}.json`);
      
      if (fs.existsSync(schemaFile)) {
        try {
          const content = fs.readFileSync(schemaFile, 'utf8');
          const schema = JSON.parse(content);
          let modified = false;
          
          // 修复$schema字段
          if (schema.$schema && schema.$schema.includes('2020-12')) {
            schema.$schema = 'http://json-schema.org/draft-07/schema#';
            modified = true;
            this.stats.issuesFixed++;
          }
          
          // 移除非标准字段
          const nonStandardFields = ['version', 'lastUpdated'];
          for (const field of nonStandardFields) {
            if (schema[field]) {
              delete schema[field];
              modified = true;
              this.stats.issuesFixed++;
            }
          }
          
          // 确保必需字段存在
          if (!schema.type) {
            schema.type = 'object';
            modified = true;
            this.stats.issuesFixed++;
          }
          
          // 如果有修改，写回文件
          if (modified) {
            const updatedContent = JSON.stringify(schema, null, 2);
            fs.writeFileSync(schemaFile, updatedContent, 'utf8');
            console.log(`✅ 修复 ${module} Schema`);
            this.stats.filesProcessed++;
          } else {
            console.log(`✅ ${module} Schema无需修复`);
          }
          
        } catch (error) {
          console.error(`❌ 修复 ${module} Schema时出错:`, error.message);
        }
      }
    }
  }

  /**
   * 修复Schema索引
   */
  async fixSchemaIndex() {
    console.log('🔧 修复Schema索引...');
    
    const indexFile = 'src/schemas/index.ts';
    
    // 生成正确的索引内容
    const indexContent = `/**
 * MPLP Schema索引
 * @description 导出所有MPLP协议Schema定义
 * @version 1.0.0
 */

// 核心协议模块Schema
export { default as ContextSchema } from './mplp-context.json';
export { default as PlanSchema } from './mplp-plan.json';
export { default as ConfirmSchema } from './mplp-confirm.json';
export { default as TraceSchema } from './mplp-trace.json';
export { default as RoleSchema } from './mplp-role.json';
export { default as ExtensionSchema } from './mplp-extension.json';

// L4智能模块Schema
export { default as CollabSchema } from './mplp-collab.json';
export { default as DialogSchema } from './mplp-dialog.json';
export { default as NetworkSchema } from './mplp-network.json';

// 核心调度模块Schema
export { default as CoreSchema } from './mplp-core.json';

// Schema映射表
export const SchemaMap = {
  context: ContextSchema,
  plan: PlanSchema,
  confirm: ConfirmSchema,
  trace: TraceSchema,
  role: RoleSchema,
  extension: ExtensionSchema,
  collab: CollabSchema,
  dialog: DialogSchema,
  network: NetworkSchema,
  core: CoreSchema
} as const;

// Schema列表
export const AllSchemas = Object.values(SchemaMap);

// 模块名称列表
export const ModuleNames = Object.keys(SchemaMap) as Array<keyof typeof SchemaMap>;
`;

    try {
      fs.writeFileSync(indexFile, indexContent, 'utf8');
      console.log('✅ Schema索引修复完成');
      this.stats.issuesFixed++;
    } catch (error) {
      console.error('❌ 修复Schema索引时出错:', error.message);
    }
  }

  /**
   * 生成修复报告
   */
  generateReport() {
    console.log('\n📊 Schema修复报告:');
    console.log('================================');
    console.log(`处理文件数量: ${this.stats.filesProcessed}`);
    console.log(`修复问题数量: ${this.stats.issuesFixed}`);
    console.log('================================');
    
    if (this.stats.issuesFixed > 0) {
      console.log('🎉 Schema修复完成！');
    } else {
      console.log('✅ 所有Schema文件已是最新状态');
    }
  }
}

// 运行修复器
if (require.main === module) {
  const fixer = new SchemaFixer();
  fixer.run().catch(console.error);
}

module.exports = SchemaFixer;
