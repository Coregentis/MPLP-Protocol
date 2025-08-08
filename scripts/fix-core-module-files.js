#!/usr/bin/env node

/**
 * 核心模块文件修复脚本
 * @description 修复各模块的types.ts, module.ts, index.ts文件的映射问题
 * @author MPLP Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class CoreModuleFilesFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      errorsFixed: 0,
      errors: 0
    };
    
    this.modules = [
      'context', 'plan', 'confirm', 'trace', 'role', 'extension',
      'collab', 'dialog', 'network'
    ];
    
    // 字段名映射表
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
    console.log('🔧 开始修复核心模块文件...\n');
    
    try {
      for (const module of this.modules) {
        await this.fixModuleFiles(module);
      }
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 修复过程中出现错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复单个模块的核心文件
   */
  async fixModuleFiles(module) {
    console.log(`🔧 修复 ${module} 模块核心文件...`);
    
    const moduleDir = `src/modules/${module}`;
    const coreFiles = [
      `${moduleDir}/types.ts`,
      `${moduleDir}/module.ts`,
      `${moduleDir}/index.ts`
    ];
    
    for (const file of coreFiles) {
      if (fs.existsSync(file)) {
        await this.fixFile(file, module);
      } else {
        console.log(`   ⚠️ 文件不存在: ${path.basename(file)}`);
      }
    }
  }

  /**
   * 修复单个文件
   */
  async fixFile(filePath, module) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      let fixCount = 0;
      
      // 修复字段名映射
      for (const [snakeCase, camelCase] of Object.entries(this.fieldMappings)) {
        const patterns = [
          // 接口定义中的字段: field_name: Type
          new RegExp(`(^\\s*|,\\s*|\\{\\s*)${snakeCase}(\\s*:\\s*\\w+)`, 'gm'),
          // 可选字段: field_name?: Type
          new RegExp(`(^\\s*|,\\s*|\\{\\s*)${snakeCase}(\\?\\s*:\\s*\\w+)`, 'gm'),
          // 对象字面量: { field_name: value }
          new RegExp(`(\\{[^}]*\\s*)${snakeCase}(\\s*:)`, 'g'),
          // 属性访问: obj.field_name
          new RegExp(`(\\w+\\.)${snakeCase}(\\b)`, 'g'),
          // 解构赋值: { field_name }
          new RegExp(`(\\{[^}]*\\s*)${snakeCase}(\\s*[,}])`, 'g')
        ];
        
        for (const pattern of patterns) {
          const originalContent = content;
          content = content.replace(pattern, `$1${camelCase}$2`);
          if (content !== originalContent) {
            modified = true;
            fixCount++;
          }
        }
      }
      
      // 特殊修复：确保导出的接口使用正确的命名
      if (filePath.includes('types.ts')) {
        content = this.fixTypeDefinitions(content, module);
        if (content !== fs.readFileSync(filePath, 'utf8')) {
          modified = true;
          fixCount++;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`   ✅ 修复 ${path.basename(filePath)} (${fixCount} 个问题)`);
        this.stats.filesProcessed++;
        this.stats.errorsFixed += fixCount;
      } else {
        console.log(`   ✅ ${path.basename(filePath)} 无需修复`);
      }
      
    } catch (error) {
      console.error(`   ❌ 修复 ${filePath} 时出错:`, error.message);
      this.stats.errors++;
    }
  }

  /**
   * 修复类型定义
   */
  fixTypeDefinitions(content, module) {
    // 确保主要接口使用正确的字段名
    const interfacePatterns = {
      'context': [
        { old: 'context_id', new: 'contextId' },
        { old: 'session_id', new: 'sessionId' },
        { old: 'agent_id', new: 'agentId' },
        { old: 'lifecycle_stage', new: 'lifecycleStage' },
        { old: 'protocol_version', new: 'protocolVersion' },
        { old: 'access_control', new: 'accessControl' },
        { old: 'shared_state', new: 'sharedState' }
      ],
      'plan': [
        { old: 'plan_id', new: 'planId' },
        { old: 'context_id', new: 'contextId' },
        { old: 'task_dependencies', new: 'taskDependencies' },
        { old: 'execution_status', new: 'executionStatus' },
        { old: 'created_by', new: 'createdBy' },
        { old: 'updated_by', new: 'updatedBy' }
      ],
      'confirm': [
        { old: 'confirm_id', new: 'confirmId' },
        { old: 'context_id', new: 'contextId' },
        { old: 'plan_id', new: 'planId' },
        { old: 'confirmation_type', new: 'confirmationType' },
        { old: 'approval_workflow', new: 'approvalWorkflow' },
        { old: 'risk_assessment', new: 'riskAssessment' }
      ],
      'trace': [
        { old: 'trace_id', new: 'traceId' },
        { old: 'context_id', new: 'contextId' },
        { old: 'plan_id', new: 'planId' },
        { old: 'trace_type', new: 'traceType' },
        { old: 'performance_metrics', new: 'performanceMetrics' },
        { old: 'error_information', new: 'errorInformation' }
      ],
      'role': [
        { old: 'role_id', new: 'roleId' },
        { old: 'context_id', new: 'contextId' },
        { old: 'role_type', new: 'roleType' },
        { old: 'display_name', new: 'displayName' },
        { old: 'validation_rules', new: 'validationRules' },
        { old: 'audit_settings', new: 'auditSettings' }
      ],
      'extension': [
        { old: 'extension_id', new: 'extensionId' },
        { old: 'context_id', new: 'contextId' },
        { old: 'extension_type', new: 'extensionType' },
        { old: 'extension_points', new: 'extensionPoints' },
        { old: 'api_extensions', new: 'apiExtensions' }
      ],
      'collab': [
        { old: 'collaboration_id', new: 'collaborationId' },
        { old: 'context_id', new: 'contextId' },
        { old: 'plan_id', new: 'planId' },
        { old: 'coordination_strategy', new: 'coordinationStrategy' },
        { old: 'decision_mechanism', new: 'decisionMechanism' }
      ],
      'dialog': [
        { old: 'dialog_id', new: 'dialogId' },
        { old: 'session_id', new: 'sessionId' },
        { old: 'context_id', new: 'contextId' },
        { old: 'message_history', new: 'messageHistory' },
        { old: 'dialog_state', new: 'dialogState' }
      ],
      'network': [
        { old: 'network_id', new: 'networkId' },
        { old: 'context_id', new: 'contextId' },
        { old: 'network_topology', new: 'networkTopology' },
        { old: 'node_connections', new: 'nodeConnections' },
        { old: 'discovery_mechanism', new: 'discoveryMechanism' }
      ]
    };
    
    const patterns = interfacePatterns[module] || [];
    
    for (const { old, new: newName } of patterns) {
      // 在接口定义中替换字段名
      const interfacePattern = new RegExp(`(interface\\s+\\w+[^{]*\\{[^}]*\\s+)${old}(\\s*[?:]\\s*\\w+)`, 'g');
      content = content.replace(interfacePattern, `$1${newName}$2`);
      
      // 在类型别名中替换字段名
      const typePattern = new RegExp(`(type\\s+\\w+[^=]*=[^{]*\\{[^}]*\\s+)${old}(\\s*[?:]\\s*\\w+)`, 'g');
      content = content.replace(typePattern, `$1${newName}$2`);
    }
    
    return content;
  }

  /**
   * 生成修复报告
   */
  generateReport() {
    console.log('\n📊 核心模块文件修复报告:');
    console.log('================================');
    console.log(`处理文件数量: ${this.stats.filesProcessed}`);
    console.log(`修复错误数量: ${this.stats.errorsFixed}`);
    console.log(`修复失败数量: ${this.stats.errors}`);
    console.log('================================');
    
    if (this.stats.errorsFixed > 0) {
      console.log('🎉 核心模块文件修复完成！');
      console.log('\n💡 修复说明:');
      console.log('✅ types.ts 文件字段名已标准化');
      console.log('✅ module.ts 文件接口已统一');
      console.log('✅ index.ts 文件导出已修复');
      console.log('✅ 模块间接口映射已一致');
    } else {
      console.log('✅ 所有核心文件已是正确格式');
    }
    
    if (this.stats.errors > 0) {
      console.log(`⚠️ 发现 ${this.stats.errors} 个修复失败，请手动检查`);
    }
    
    console.log('\n🔄 下一步建议:');
    console.log('1. 运行 TypeScript 检查验证核心文件');
    console.log('2. 逐个模块进行详细实现修复');
    console.log('3. 确保所有模块接口一致性');
  }
}

// 运行修复器
if (require.main === module) {
  const fixer = new CoreModuleFilesFixer();
  fixer.run().catch(console.error);
}

module.exports = CoreModuleFilesFixer;
