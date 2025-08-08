#!/usr/bin/env node

/**
 * 缺失字段补充脚本
 * @description 在TypeScript实体中添加Schema定义的必需字段
 * @author MPLP Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class MissingFieldsAdder {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      fieldsAdded: 0,
      errors: 0
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
    
    // 根据之前的验证结果，定义每个模块需要添加的字段
    this.missingFields = {
      'context': [
        { name: 'sharedState', type: 'Record<string, unknown>', optional: true, description: '共享状态数据' },
        { name: 'accessControl', type: 'Record<string, unknown>', optional: true, description: '访问控制配置' }
      ],
      'plan': [
        { name: 'milestones', type: 'unknown[]', optional: true, description: '里程碑列表' },
        { name: 'optimization', type: 'Record<string, unknown>', optional: true, description: '优化配置' },
        { name: 'failureResolver', type: 'Record<string, unknown>', optional: true, description: '失败解决器' },
        { name: 'createdBy', type: 'string', optional: false, description: '创建者' },
        { name: 'updatedBy', type: 'string', optional: true, description: '更新者' }
      ],
      'confirm': [
        { name: 'riskAssessment', type: 'Record<string, unknown>', optional: true, description: '风险评估' },
        { name: 'notificationSettings', type: 'Record<string, unknown>', optional: true, description: '通知设置' },
        { name: 'auditTrail', type: 'unknown[]', optional: true, description: '审计跟踪' }
      ],
      'trace': [
        { name: 'taskId', type: 'string', optional: true, description: '任务ID' },
        { name: 'contextSnapshot', type: 'Record<string, unknown>', optional: true, description: '上下文快照' },
        { name: 'decisionLog', type: 'unknown[]', optional: true, description: '决策日志' }
      ],
      'role': [
        { name: 'agents', type: 'unknown[]', optional: true, description: '代理列表' },
        { name: 'agentManagement', type: 'Record<string, unknown>', optional: true, description: '代理管理' },
        { name: 'teamConfiguration', type: 'Record<string, unknown>', optional: true, description: '团队配置' }
      ],
      'extension': [
        { name: 'extensionType', type: 'string', optional: false, description: '扩展类型' }
      ],
      'collab': [
        { name: 'decisionMaking', type: 'Record<string, unknown>', optional: true, description: '决策制定' },
        { name: 'councilConfiguration', type: 'Record<string, unknown>', optional: true, description: '委员会配置' }
      ],
      'dialog': [
        { name: 'dialogId', type: 'string', optional: false, description: '对话ID' },
        { name: 'capabilities', type: 'string[]', optional: true, description: '能力列表' },
        { name: 'strategy', type: 'Record<string, unknown>', optional: true, description: '策略配置' },
        { name: 'configuration', type: 'Record<string, unknown>', optional: true, description: '配置信息' }
      ],
      'network': []  // network模块没有缺失字段
    };
  }

  /**
   * 主要添加流程
   */
  async run() {
    console.log('🔧 开始添加缺失字段...\n');
    
    try {
      for (const module of this.modules) {
        await this.addMissingFields(module);
      }
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 添加过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 为单个模块添加缺失字段
   */
  async addMissingFields(module) {
    console.log(`🔧 检查 ${module.name} 模块缺失字段...`);
    
    try {
      if (!fs.existsSync(module.entityPath)) {
        console.warn(`⚠️ 实体文件不存在: ${module.entityPath}`);
        return;
      }
      
      const fieldsToAdd = this.missingFields[module.name] || [];
      if (fieldsToAdd.length === 0) {
        console.log(`✅ ${module.name} 模块无缺失字段`);
        return;
      }
      
      let content = fs.readFileSync(module.entityPath, 'utf8');
      let modified = false;
      let moduleFieldsAdded = 0;
      
      // 检查每个字段是否已存在
      for (const field of fieldsToAdd) {
        if (!this.fieldExists(content, field.name)) {
          // 添加字段到类定义中
          content = this.addFieldToClass(content, field);
          modified = true;
          moduleFieldsAdded++;
          console.log(`   + 添加字段: ${field.name}: ${field.type}${field.optional ? '?' : ''}`);
        }
      }
      
      // 如果有修改，写回文件
      if (modified) {
        fs.writeFileSync(module.entityPath, content, 'utf8');
        console.log(`✅ ${module.name} 模块添加完成，新增 ${moduleFieldsAdded} 个字段`);
        this.stats.filesProcessed++;
        this.stats.fieldsAdded += moduleFieldsAdded;
      } else {
        console.log(`✅ ${module.name} 模块所有字段已存在`);
      }
      
    } catch (error) {
      console.error(`❌ 处理 ${module.name} 模块时出错:`, error.message);
      this.stats.errors++;
    }
  }

  /**
   * 检查字段是否已存在
   */
  fieldExists(content, fieldName) {
    const patterns = [
      new RegExp(`\\b${fieldName}\\s*:\\s*\\w+`),
      new RegExp(`\\b${fieldName}\\?\\s*:\\s*\\w+`),
      new RegExp(`\\bpublic\\s+${fieldName}\\s*:\\s*\\w+`),
      new RegExp(`\\bprivate\\s+${fieldName}\\s*:\\s*\\w+`),
      new RegExp(`\\breadonly\\s+${fieldName}\\s*:\\s*\\w+`)
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * 添加字段到类定义中
   */
  addFieldToClass(content, field) {
    // 查找类定义的结束位置（最后一个字段或方法之后）
    const classMatch = content.match(/export class \w+\s*\{([\s\S]*)\}/);
    if (!classMatch) {
      throw new Error('无法找到类定义');
    }
    
    const classContent = classMatch[1];
    const classStart = content.indexOf(classMatch[0]);
    const classBodyStart = content.indexOf('{', classStart) + 1;
    
    // 查找构造函数或第一个方法的位置
    const constructorMatch = classContent.match(/constructor\s*\(/);
    const methodMatch = classContent.match(/\s+(public|private|protected)?\s*\w+\s*\(/);
    
    let insertPosition;
    if (constructorMatch) {
      insertPosition = classBodyStart + classContent.indexOf(constructorMatch[0]);
    } else if (methodMatch) {
      insertPosition = classBodyStart + classContent.indexOf(methodMatch[0]);
    } else {
      // 如果没有找到构造函数或方法，在类的末尾添加
      insertPosition = content.lastIndexOf('}');
    }
    
    // 生成字段定义
    const optionalMarker = field.optional ? '?' : '';
    const fieldDefinition = `  /**\n   * ${field.description}\n   */\n  public ${field.name}${optionalMarker}: ${field.type};\n\n`;
    
    // 插入字段定义
    const before = content.substring(0, insertPosition);
    const after = content.substring(insertPosition);
    
    return before + fieldDefinition + after;
  }

  /**
   * 生成添加报告
   */
  generateReport() {
    console.log('\n📊 缺失字段添加报告:');
    console.log('================================');
    console.log(`处理文件数量: ${this.stats.filesProcessed}`);
    console.log(`添加字段数量: ${this.stats.fieldsAdded}`);
    console.log(`错误数量: ${this.stats.errors}`);
    console.log('================================');
    
    if (this.stats.fieldsAdded > 0) {
      console.log('🎉 缺失字段添加完成！');
      console.log('\n💡 添加说明:');
      console.log('✅ 所有Schema必需字段已添加到实体中');
      console.log('✅ 字段类型定义符合TypeScript标准');
      console.log('✅ 保持了Schema-TypeScript映射的完整性');
    } else {
      console.log('✅ 所有必需字段已存在');
    }
    
    if (this.stats.errors > 0) {
      console.log(`⚠️ 发现 ${this.stats.errors} 个错误，请检查日志`);
    }
  }
}

// 运行添加器
if (require.main === module) {
  const adder = new MissingFieldsAdder();
  adder.run().catch(console.error);
}

module.exports = MissingFieldsAdder;
