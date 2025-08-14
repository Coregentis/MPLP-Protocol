#!/usr/bin/env node

/**
 * MPLP Schema命名约定批量修复脚本
 * 
 * 修复所有Schema中的camelCase enum值为snake_case
 * 
 * @version 1.0.0
 * @author MPLP Project Team
 * @since 2025-08-14
 */

const fs = require('fs');
const path = require('path');

// camelCase到snake_case的转换函数
function camelToSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

// 需要修复的Schema文件列表
const schemaFiles = [
  'mplp-collab.json',
  'mplp-confirm.json', 
  'mplp-context.json',
  'mplp-coordination.json',
  'mplp-core.json',
  'mplp-dialog.json',
  'mplp-error-handling.json',
  'mplp-event-bus.json',
  'mplp-extension.json',
  'mplp-network.json',
  'mplp-orchestration.json',
  'mplp-performance.json',
  'mplp-plan.json',
  'mplp-protocol-version.json',
  'mplp-role.json',
  'mplp-security.json',
  'mplp-state-sync.json',
  'mplp-trace.json',
  'mplp-transaction.json'
];

// 常见的camelCase事件名称映射
const eventNameMappings = {
  // Context events
  'contextCreated': 'context_created',
  'contextUpdated': 'context_updated',
  'contextActivated': 'context_activated',
  'contextDeactivated': 'context_deactivated',
  'contextSwitched': 'context_switched',
  'contextMerged': 'context_merged',
  'contextSplit': 'context_split',
  'contextArchived': 'context_archived',
  
  // Plan events
  'planCreated': 'plan_created',
  'planUpdated': 'plan_updated',
  'planExecuted': 'plan_executed',
  'planCompleted': 'plan_completed',
  'planFailed': 'plan_failed',
  'planCancelled': 'plan_cancelled',
  'planOptimized': 'plan_optimized',
  'planValidated': 'plan_validated',
  'planApproved': 'plan_approved',
  'planRejected': 'plan_rejected',
  'planArchived': 'plan_archived',
  
  // Confirm events
  'confirmCreated': 'confirm_created',
  'confirmUpdated': 'confirm_updated',
  'confirmApproved': 'confirm_approved',
  'confirmRejected': 'confirm_rejected',
  'confirmPending': 'confirm_pending',
  'confirmCancelled': 'confirm_cancelled',
  'confirmExpired': 'confirm_expired',
  'confirmEscalated': 'confirm_escalated',
  'confirmDelegated': 'confirm_delegated',
  
  // Trace events
  'traceCreated': 'trace_created',
  'traceUpdated': 'trace_updated',
  'traceCompleted': 'trace_completed',
  'traceAnalyzed': 'trace_analyzed',
  'traceArchived': 'trace_archived',
  
  // Role events
  'roleCreated': 'role_created',
  'roleUpdated': 'role_updated',
  'roleAssigned': 'role_assigned',
  'roleRevoked': 'role_revoked',
  'roleActivated': 'role_activated',
  'roleDeactivated': 'role_deactivated',
  'roleDeleted': 'role_deleted',
  
  // Extension events
  'extensionInstalled': 'extension_installed',
  'extensionActivated': 'extension_activated',
  'extensionDeactivated': 'extension_deactivated',
  'extensionUpdated': 'extension_updated',
  'extensionUninstalled': 'extension_uninstalled',
  'extensionConfigured': 'extension_configured',
  'extensionError': 'extension_error',
  'extensionLoaded': 'extension_loaded',
  
  // Dialog events
  'dialogStarted': 'dialog_started',
  'dialogEnded': 'dialog_ended',
  'dialogUpdated': 'dialog_updated',
  'dialogPaused': 'dialog_paused',
  'dialogResumed': 'dialog_resumed',
  'dialogCancelled': 'dialog_cancelled',
  'dialogCompleted': 'dialog_completed',
  'dialogError': 'dialog_error',
  
  // Core events
  'workflowStarted': 'workflow_started',
  'workflowCompleted': 'workflow_completed',
  'workflowFailed': 'workflow_failed',
  'workflowPaused': 'workflow_paused',
  'workflowResumed': 'workflow_resumed',
  'workflowCancelled': 'workflow_cancelled',
  'orchestrationUpdated': 'orchestration_updated',
  'systemStarted': 'system_started',
  'systemStopped': 'system_stopped',
  'systemError': 'system_error',
  'systemHealthCheck': 'system_health_check',
  
  // HTTP methods
  'GET': 'get',
  'POST': 'post', 
  'PUT': 'put',
  'DELETE': 'delete',
  'PATCH': 'patch',
  'OPTIONS': 'options',
  'HEAD': 'head',
  
  // Module types
  'errorHandling': 'error_handling',
  'eventBus': 'event_bus',
  'stateSync': 'state_sync',
  
  // Comparison operators
  'greaterThan': 'greater_than',
  'lessThan': 'less_than',
  'greaterThanOrEqual': 'greater_than_or_equal',
  'lessThanOrEqual': 'less_than_or_equal',
  'equalTo': 'equal_to',
  'notEqualTo': 'not_equal_to'
};

function fixSchemaFile(filePath) {
  console.log(`修复文件: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // 替换所有已知的camelCase事件名称
    for (const [camelCase, snakeCase] of Object.entries(eventNameMappings)) {
      const regex = new RegExp(`"${camelCase}"`, 'g');
      updatedContent = updatedContent.replace(regex, `"${snakeCase}"`);
    }
    
    // 修复点分隔的事件名称为下划线分隔，但保护$schema和$id中的URL
    updatedContent = updatedContent.replace(/"([a-z]+)\.([a-z]+)"/g, '"$1_$2"');
    
    // 检查是否有变化
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ 已修复: ${filePath}`);
    } else {
      console.log(`⏭️  无需修复: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}:`, error.message);
  }
}

// 主函数
function main() {
  console.log('🔧 开始批量修复Schema命名约定...\n');
  
  // 修正路径：从工具目录到schemas目录
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  
  for (const fileName of schemaFiles) {
    const filePath = path.join(schemasDir, fileName);
    if (fs.existsSync(filePath)) {
      fixSchemaFile(filePath);
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  }
  
  console.log('\n🎉 批量修复完成！');
  console.log('请运行 npm run validate:schemas 验证修复结果');
}

if (require.main === module) {
  main();
}

module.exports = { fixSchemaFile, eventNameMappings };
