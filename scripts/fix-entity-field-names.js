#!/usr/bin/env node

/**
 * TypeScript实体字段名修复脚本
 * @description 将实体中的snake_case字段名改为camelCase，符合TypeScript标准
 * @author MPLP Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class EntityFieldNameFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      fieldsFixed: 0,
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
    
    // 字段名映射表 - snake_case到camelCase
    this.fieldMappings = {
      'plan_id': 'planId',
      'context_id': 'contextId',
      'trace_id': 'traceId',
      'role_id': 'roleId',
      'extension_id': 'extensionId',
      'collab_id': 'collabId',
      'collaboration_id': 'collaborationId',
      'dialog_id': 'dialogId',
      'network_id': 'networkId',
      'confirm_id': 'confirmId',
      'session_id': 'sessionId',
      'agent_id': 'agentId',
      'user_id': 'userId',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'created_by': 'createdBy',
      'updated_by': 'updatedBy',
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
      'node_connections': 'nodeConnections',
      'display_name': 'displayName',
      'role_type': 'roleType',
      'validation_rules': 'validationRules',
      'audit_settings': 'auditSettings',
      'confirmation_type': 'confirmationType',
      'approval_workflow': 'approvalWorkflow',
      'risk_assessment': 'riskAssessment',
      'notification_settings': 'notificationSettings',
      'audit_trail': 'auditTrail',
      'task_id': 'taskId',
      'context_snapshot': 'contextSnapshot',
      'decision_log': 'decisionLog',
      'agent_management': 'agentManagement',
      'team_configuration': 'teamConfiguration',
      'extension_type': 'extensionType',
      'extension_points': 'extensionPoints',
      'api_extensions': 'apiExtensions',
      'event_subscriptions': 'eventSubscriptions',
      'coordination_strategy': 'coordinationStrategy',
      'decision_making': 'decisionMaking',
      'council_configuration': 'councilConfiguration',
      'discovery_mechanism': 'discoveryMechanism',
      'routing_strategy': 'routingStrategy'
    };
  }

  /**
   * 主要修复流程
   */
  async run() {
    console.log('🔧 开始TypeScript实体字段名修复...\n');
    
    try {
      for (const module of this.modules) {
        await this.fixModule(module);
      }
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 修复过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复单个模块
   */
  async fixModule(module) {
    console.log(`🔧 修复 ${module.name} 模块字段名...`);
    
    try {
      if (!fs.existsSync(module.entityPath)) {
        console.warn(`⚠️ 实体文件不存在: ${module.entityPath}`);
        return;
      }
      
      let content = fs.readFileSync(module.entityPath, 'utf8');
      let modified = false;
      let moduleFieldsFixed = 0;
      
      // 修复字段定义
      for (const [snakeCase, camelCase] of Object.entries(this.fieldMappings)) {
        // 修复各种字段定义模式
        const patterns = [
          // public field_name: Type
          {
            pattern: new RegExp(`(\\bpublic\\s+)${snakeCase}(\\s*:\\s*\\w+)`, 'g'),
            replacement: `$1${camelCase}$2`
          },
          // private field_name: Type
          {
            pattern: new RegExp(`(\\bprivate\\s+)${snakeCase}(\\s*:\\s*\\w+)`, 'g'),
            replacement: `$1${camelCase}$2`
          },
          // readonly field_name: Type
          {
            pattern: new RegExp(`(\\breadonly\\s+)${snakeCase}(\\s*:\\s*\\w+)`, 'g'),
            replacement: `$1${camelCase}$2`
          },
          // public readonly field_name: Type
          {
            pattern: new RegExp(`(\\bpublic\\s+readonly\\s+)${snakeCase}(\\s*:\\s*\\w+)`, 'g'),
            replacement: `$1${camelCase}$2`
          },
          // field_name: Type (简单字段定义)
          {
            pattern: new RegExp(`(^\\s*|,\\s*)${snakeCase}(\\s*:\\s*\\w+)`, 'gm'),
            replacement: `$1${camelCase}$2`
          },
          // field_name?: Type (可选字段)
          {
            pattern: new RegExp(`(\\b)${snakeCase}(\\?\\s*:\\s*\\w+)`, 'g'),
            replacement: `$1${camelCase}$2`
          },
          // this.field_name
          {
            pattern: new RegExp(`(\\bthis\\.)${snakeCase}(\\b)`, 'g'),
            replacement: `$1${camelCase}$2`
          },
          // get field_name()
          {
            pattern: new RegExp(`(\\bget\\s+)${snakeCase}(\\s*\\()`, 'g'),
            replacement: `$1${camelCase}$2`
          },
          // set field_name(
          {
            pattern: new RegExp(`(\\bset\\s+)${snakeCase}(\\s*\\()`, 'g'),
            replacement: `$1${camelCase}$2`
          }
        ];
        
        for (const { pattern, replacement } of patterns) {
          const originalContent = content;
          content = content.replace(pattern, replacement);
          if (content !== originalContent) {
            modified = true;
            moduleFieldsFixed++;
          }
        }
      }
      
      // 如果有修改，写回文件
      if (modified) {
        fs.writeFileSync(module.entityPath, content, 'utf8');
        console.log(`✅ ${module.name} 模块修复完成，修复 ${moduleFieldsFixed} 个字段`);
        this.stats.filesProcessed++;
        this.stats.fieldsFixed += moduleFieldsFixed;
      } else {
        console.log(`✅ ${module.name} 模块无需修复`);
      }
      
    } catch (error) {
      console.error(`❌ 修复 ${module.name} 模块时出错:`, error.message);
      this.stats.errors++;
    }
  }

  /**
   * 生成修复报告
   */
  generateReport() {
    console.log('\n📊 字段名修复报告:');
    console.log('================================');
    console.log(`处理文件数量: ${this.stats.filesProcessed}`);
    console.log(`修复字段数量: ${this.stats.fieldsFixed}`);
    console.log(`错误数量: ${this.stats.errors}`);
    console.log('================================');
    
    if (this.stats.fieldsFixed > 0) {
      console.log('🎉 字段名修复完成！');
      console.log('\n💡 修复说明:');
      console.log('✅ 所有snake_case字段名已改为camelCase');
      console.log('✅ 符合TypeScript命名约定');
      console.log('✅ 保持了MPLP的Schema-TypeScript映射设计');
    } else {
      console.log('✅ 所有字段名已是正确格式');
    }
    
    if (this.stats.errors > 0) {
      console.log(`⚠️ 发现 ${this.stats.errors} 个错误，请检查日志`);
    }
  }
}

// 运行修复器
if (require.main === module) {
  const fixer = new EntityFieldNameFixer();
  fixer.run().catch(console.error);
}

module.exports = EntityFieldNameFixer;
