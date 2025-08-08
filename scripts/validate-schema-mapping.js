#!/usr/bin/env node

/**
 * Schema-TypeScript映射验证脚本
 * @description 验证Schema(snake_case)与TypeScript(camelCase)之间的正确映射
 * @author MPLP Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class SchemaMappingValidator {
  constructor() {
    this.stats = {
      modulesChecked: 0,
      mappingIssues: 0,
      missingMappings: 0,
      correctMappings: 0
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
    
    // 标准字段映射表
    this.standardMappings = {
      'context_id': 'contextId',
      'plan_id': 'planId',
      'trace_id': 'traceId',
      'role_id': 'roleId',
      'extension_id': 'extensionId',
      'collab_id': 'collabId',
      'dialog_id': 'dialogId',
      'network_id': 'networkId',
      'session_id': 'sessionId',
      'agent_id': 'agentId',
      'user_id': 'userId',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'lifecycle_stage': 'lifecycleStage',
      'execution_status': 'executionStatus',
      'protocol_version': 'protocolVersion',
      'access_control': 'accessControl',
      'shared_state': 'sharedState',
      'task_dependencies': 'taskDependencies',
      'approval_criteria': 'approvalCriteria',
      'required_approvals': 'requiredApprovals',
      'timeout_ms': 'timeoutMs',
      'performance_metrics': 'performanceMetrics',
      'error_information': 'errorInformation',
      'trace_type': 'traceType',
      'event_source': 'eventSource',
      'decision_mechanism': 'decisionMechanism',
      'participant_votes': 'participantVotes',
      'consensus_reached': 'consensusReached',
      'message_history': 'messageHistory',
      'dialog_state': 'dialogState',
      'network_topology': 'networkTopology',
      'node_connections': 'nodeConnections'
    };
  }

  /**
   * 主要验证流程
   */
  async run() {
    console.log('🔍 开始Schema-TypeScript映射验证...\n');
    
    try {
      for (const module of this.modules) {
        await this.validateModule(module);
      }
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 验证过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 验证单个模块
   */
  async validateModule(module) {
    console.log(`🔍 验证 ${module.name} 模块映射...`);
    
    try {
      // 读取Schema
      const schemaPath = `src/schemas/mplp-${module.name}.json`;
      if (!fs.existsSync(schemaPath)) {
        console.warn(`⚠️ Schema文件不存在: ${schemaPath}`);
        return;
      }
      
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      const schemaProperties = schema.properties || {};
      
      // 读取实体文件
      if (!fs.existsSync(module.entityPath)) {
        console.warn(`⚠️ 实体文件不存在: ${module.entityPath}`);
        return;
      }
      
      const entityContent = fs.readFileSync(module.entityPath, 'utf8');
      
      // 验证映射
      await this.validateMappings(module.name, schemaProperties, entityContent);
      
      this.stats.modulesChecked++;
      
    } catch (error) {
      console.error(`❌ 验证 ${module.name} 模块时出错:`, error.message);
    }
  }

  /**
   * 验证映射关系
   */
  async validateMappings(moduleName, schemaProperties, entityContent) {
    const issues = [];
    const correctMappings = [];
    
    // 检查每个Schema字段的映射
    for (const [schemaField, schemaDefinition] of Object.entries(schemaProperties)) {
      // 跳过协议级别的字段
      if (['protocol_version', 'timestamp'].includes(schemaField)) {
        continue;
      }
      
      // 获取期望的TypeScript字段名
      const expectedTsField = this.standardMappings[schemaField] || this.snakeToCamel(schemaField);
      
      // 检查TypeScript实体中是否存在对应字段
      const hasField = this.checkFieldInEntity(entityContent, expectedTsField);
      
      if (hasField) {
        correctMappings.push(`${schemaField} → ${expectedTsField}`);
        this.stats.correctMappings++;
      } else {
        // 检查是否使用了错误的命名
        const hasSnakeCase = this.checkFieldInEntity(entityContent, schemaField);
        if (hasSnakeCase) {
          issues.push({
            type: 'wrong_naming',
            message: `字段 ${schemaField} 在实体中使用了snake_case，应该使用camelCase: ${expectedTsField}`
          });
          this.stats.mappingIssues++;
        } else {
          issues.push({
            type: 'missing_field',
            message: `Schema字段 ${schemaField} 在实体中缺少对应的 ${expectedTsField} 字段`
          });
          this.stats.missingMappings++;
        }
      }
    }
    
    // 报告结果
    if (issues.length > 0) {
      console.log(`❌ ${moduleName} 模块发现 ${issues.length} 个映射问题:`);
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.type}] ${issue.message}`);
      });
    } else {
      console.log(`✅ ${moduleName} 模块映射验证通过`);
    }
    
    if (correctMappings.length > 0) {
      console.log(`   正确映射 ${correctMappings.length} 个字段: ${correctMappings.slice(0, 3).join(', ')}${correctMappings.length > 3 ? '...' : ''}`);
    }
  }

  /**
   * 检查字段是否在实体中存在
   */
  checkFieldInEntity(entityContent, fieldName) {
    // 检查多种可能的字段定义模式
    const patterns = [
      new RegExp(`\\b${fieldName}:\\s*\\w+`),                    // fieldName: Type
      new RegExp(`\\bpublic\\s+${fieldName}:\\s*\\w+`),          // public fieldName: Type
      new RegExp(`\\bprivate\\s+${fieldName}:\\s*\\w+`),         // private fieldName: Type
      new RegExp(`\\breadonly\\s+${fieldName}:\\s*\\w+`),        // readonly fieldName: Type
      new RegExp(`\\bpublic\\s+readonly\\s+${fieldName}:\\s*\\w+`), // public readonly fieldName: Type
      new RegExp(`\\b${fieldName}\\?:\\s*\\w+`),                 // fieldName?: Type
      new RegExp(`\\bget\\s+${fieldName}\\(\\)`),                // get fieldName()
      new RegExp(`\\bset\\s+${fieldName}\\(`),                   // set fieldName(
      new RegExp(`\\bthis\\.${fieldName}\\b`)                    // this.fieldName
    ];
    
    return patterns.some(pattern => pattern.test(entityContent));
  }

  /**
   * snake_case转camelCase
   */
  snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log('\n📊 Schema-TypeScript映射验证报告:');
    console.log('================================');
    console.log(`验证模块数量: ${this.stats.modulesChecked}`);
    console.log(`正确映射: ${this.stats.correctMappings}`);
    console.log(`映射问题: ${this.stats.mappingIssues}`);
    console.log(`缺失映射: ${this.stats.missingMappings}`);
    console.log('================================');
    
    const totalIssues = this.stats.mappingIssues + this.stats.missingMappings;
    
    if (totalIssues === 0) {
      console.log('🎉 所有Schema-TypeScript映射验证通过！');
    } else {
      console.log(`⚠️ 发现 ${totalIssues} 个映射问题需要修复`);
      
      console.log('\n💡 MPLP设计原则说明:');
      console.log('✅ Schema使用snake_case (符合JSON/API标准)');
      console.log('✅ TypeScript使用camelCase (符合JavaScript标准)');
      console.log('✅ 需要在序列化/反序列化时进行字段名映射');
      console.log('');
      console.log('🔧 建议修复措施:');
      console.log('1. 在实体中使用正确的camelCase字段名');
      console.log('2. 实现Schema-Entity映射层处理字段名转换');
      console.log('3. 确保所有Schema必需字段在实体中都有对应');
    }
  }
}

// 运行验证器
if (require.main === module) {
  const validator = new SchemaMappingValidator();
  validator.run().catch(console.error);
}

module.exports = SchemaMappingValidator;
