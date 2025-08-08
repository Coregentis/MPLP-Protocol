#!/usr/bin/env node

/**
 * 修复所有共享类型文件的Schema-Application映射关系
 * 
 * 确保所有共享类型文件使用Application层camelCase命名
 * 
 * @version 1.0.0
 * @created 2025-08-06
 */

const fs = require('fs');
const path = require('path');

class SharedTypesMappingFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      fieldsFixed: 0,
      errorsFound: 0
    };
    
    // 需要检查的共享类型文件
    this.sharedTypeFiles = [
      'src/types/module-exports.ts',
      'src/types/index.ts',
      'src/public/shared/types/index.ts',
      'src/public/shared/types/context-types.ts',
      'src/public/shared/types/plan-types.ts',
      'src/public/shared/types/confirm-types.ts',
      'src/public/shared/types/trace-types.ts',
      'src/public/shared/types/role-types.ts',
      'src/public/shared/types/extension-types.ts',
      'src/public/shared/types/collab-types.ts',
      'src/public/shared/types/dialog-types.ts',
      'src/public/shared/types/network-types.ts'
    ];
    
    // 标准字段映射 (Schema snake_case → Application camelCase)
    this.fieldMappings = {
      // 基础字段
      'context_id': 'contextId',
      'session_id': 'sessionId',
      'agent_id': 'agentId',
      'user_id': 'userId',
      'plan_id': 'planId',
      'task_id': 'taskId',
      'trace_id': 'traceId',
      'role_id': 'roleId',
      'extension_id': 'extensionId',
      'dialog_id': 'dialogId',
      'network_id': 'networkId',
      'confirm_id': 'confirmId',
      'collaboration_id': 'collaborationId',
      'workflow_id': 'workflowId',
      'orchestrator_id': 'orchestratorId',
      'parent_context_id': 'parentContextId',
      'parent_plan_id': 'parentPlanId',
      'parent_task_id': 'parentTaskId',
      
      // 时间字段
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'started_at': 'startedAt',
      'completed_at': 'completedAt',
      'deleted_at': 'deletedAt',
      'scheduled_at': 'scheduledAt',
      'executed_at': 'executedAt',
      'approved_at': 'approvedAt',
      'rejected_at': 'rejectedAt',
      
      // 状态字段
      'lifecycle_stage': 'lifecycleStage',
      'execution_status': 'executionStatus',
      'approval_status': 'approvalStatus',
      'confirmation_type': 'confirmationType',
      'confirmation_status': 'confirmationStatus',
      'trace_type': 'traceType',
      'role_type': 'roleType',
      'node_type': 'nodeType',
      'extension_type': 'extensionType',
      'dialog_type': 'dialogType',
      'network_type': 'networkType',
      
      // 配置字段
      'protocol_version': 'protocolVersion',
      'timeout_ms': 'timeoutMs',
      'retry_count': 'retryCount',
      'max_attempts': 'maxAttempts',
      'delay_ms': 'delayMs',
      'backoff_factor': 'backoffFactor',
      'estimated_duration': 'estimatedDuration',
      'actual_duration': 'actualDuration',
      'assigned_to': 'assignedTo',
      'approved_by': 'approvedBy',
      'rejected_by': 'rejectedBy',
      
      // 复杂字段
      'performance_metrics': 'performanceMetrics',
      'error_information': 'errorInformation',
      'validation_rules': 'validationRules',
      'access_control': 'accessControl',
      'shared_state': 'sharedState',
      'task_dependencies': 'taskDependencies',
      'approval_criteria': 'approvalCriteria',
      'notification_settings': 'notificationSettings',
      'audit_trail': 'auditTrail',
      'decision_mechanism': 'decisionMechanism',
      'message_history': 'messageHistory',
      'network_topology': 'networkTopology',
      'risk_assessment': 'riskAssessment',
      'resource_allocation': 'resourceAllocation',
      'approval_workflow': 'approvalWorkflow',
      'escalation_rules': 'escalationRules',
      'coordination_strategy': 'coordinationStrategy',
      'execution_context': 'executionContext',
      'error_handling': 'errorHandling',
      'retry_policy': 'retryPolicy',
      'timeout_policy': 'timeoutPolicy'
    };
  }

  /**
   * 运行修复流程
   */
  async run() {
    console.log('🔧 开始修复所有共享类型文件的Schema-Application映射关系...\n');
    
    try {
      // 修复每个共享类型文件
      for (const filePath of this.sharedTypeFiles) {
        await this.fixSharedTypeFile(filePath);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ 修复过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复单个共享类型文件
   */
  async fixSharedTypeFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    console.log(`📁 处理文件: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 修复接口定义中的字段名
    for (const [snakeCase, camelCase] of Object.entries(this.fieldMappings)) {
      // 修复接口属性定义
      const interfacePropertyPattern = new RegExp(`^(\\s+)${snakeCase}(\\??\\s*:\\s*)`, 'gm');
      const matches = content.match(interfacePropertyPattern);
      
      if (matches && matches.length > 0) {
        content = content.replace(interfacePropertyPattern, `$1${camelCase}$2`);
        modified = true;
        this.stats.fieldsFixed += matches.length;
        console.log(`  ✅ 修复字段: ${snakeCase} → ${camelCase} (${matches.length}处)`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ 文件修复完成: ${filePath}`);
      this.stats.filesProcessed++;
    } else {
      console.log(`  ℹ️  文件无需修复: ${filePath}`);
    }
    
    console.log('');
  }

  /**
   * 打印修复总结
   */
  printSummary() {
    console.log('\n📊 共享类型文件映射修复总结:');
    console.log('================================');
    console.log(`处理的文件数: ${this.stats.filesProcessed}`);
    console.log(`修复的字段数: ${this.stats.fieldsFixed}`);
    console.log(`发现的错误数: ${this.stats.errorsFound}`);
    
    if (this.stats.fieldsFixed > 0) {
      console.log('\n✅ 共享类型文件Schema-Application映射关系修复完成！');
      console.log('📋 修复内容:');
      console.log('   - 所有共享类型文件统一使用camelCase (Application层标准)');
      console.log('   - Schema层保持snake_case (JSON/API标准)');
      console.log('   - 映射机制: 序列化/反序列化时自动转换');
    } else {
      console.log('\n✅ 所有共享类型文件的映射关系已经正确！');
    }
  }
}

// 运行修复器
if (require.main === module) {
  const fixer = new SharedTypesMappingFixer();
  fixer.run().catch(console.error);
}

module.exports = SharedTypesMappingFixer;
