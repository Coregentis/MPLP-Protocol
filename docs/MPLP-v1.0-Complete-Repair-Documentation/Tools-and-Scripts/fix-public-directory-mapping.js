#!/usr/bin/env node

/**
 * Public目录Schema-Application映射修复工具
 * 
 * 专门修复src/public目录下所有文件的Schema-Application映射问题
 * 确保共享组件、工具类、核心模块的类型定义符合双重命名约定
 * 
 * @version 1.0.0
 * @created 2025-08-06
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class PublicDirectoryMappingFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      fieldsFixed: 0,
      anyTypesFixed: 0,
      interfacesFixed: 0,
      errorsFound: 0
    };
    
    // 标准字段映射 (Schema snake_case → Application camelCase)
    this.fieldMappings = {
      // 基础ID字段
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
      'related_trace_id': 'relatedTraceId',
      'source_context_id': 'sourceContextId',
      'target_context_id': 'targetContextId',
      
      // 时间字段
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'started_at': 'startedAt',
      'completed_at': 'completedAt',
      'deleted_at': 'deletedAt',
      'executed_at': 'executedAt',
      'scheduled_at': 'scheduledAt',
      'expired_at': 'expiredAt',
      'last_accessed_at': 'lastAccessedAt',
      'last_modified_at': 'lastModifiedAt',
      
      // 状态和类型字段
      'execution_status': 'executionStatus',
      'lifecycle_stage': 'lifecycleStage',
      'confirmation_type': 'confirmationType',
      'trace_type': 'traceType',
      'role_type': 'roleType',
      'extension_type': 'extensionType',
      'dialog_type': 'dialogType',
      'network_type': 'networkType',
      'task_type': 'taskType',
      'workflow_type': 'workflowType',
      'execution_mode': 'executionMode',
      'coordination_strategy': 'coordinationStrategy',
      'approval_workflow': 'approvalWorkflow',
      'escalation_rules': 'escalationRules',
      
      // 配置和参数字段
      'max_concurrent_executions': 'maxConcurrentExecutions',
      'module_timeout_ms': 'moduleTimeoutMs',
      'retry_policy': 'retryPolicy',
      'performance_metrics': 'performanceMetrics',
      'error_information': 'errorInformation',
      'notification_settings': 'notificationSettings',
      'validation_rules': 'validationRules',
      'access_control': 'accessControl',
      'security_policy': 'securityPolicy',
      'resource_limits': 'resourceLimits',
      'cache_settings': 'cacheSettings',
      'logging_config': 'loggingConfig',
      
      // 业务逻辑字段
      'shared_state': 'sharedState',
      'execution_context': 'executionContext',
      'workflow_config': 'workflowConfig',
      'module_config': 'moduleConfig',
      'adapter_config': 'adapterConfig',
      'coordination_config': 'coordinationConfig',
      'collaboration_config': 'collaborationConfig',
      'dialog_config': 'dialogConfig',
      'network_config': 'networkConfig',
      'extension_config': 'extensionConfig',
      'context_config': 'contextConfig',
      
      // 特殊字段
      'custom_fields': 'customFields',
      'metadata': 'metadata',
      'variables': 'variables',
      'details': 'details',
      'result': 'result',
      'config': 'config',
      'data': 'data'
    };
    
    // any类型替换映射
    this.anyTypeReplacements = {
      'Record<string, any>': 'Record<string, unknown>',
      'any[]': 'unknown[]',
      'any;': 'unknown;',
      'any)': 'unknown)',
      'any,': 'unknown,',
      'any>': 'unknown>',
      'any |': 'unknown |',
      '| any': '| unknown',
      'T = any': 'T = unknown',
      'data?: any': 'data?: unknown',
      'error?: any': 'error?: unknown',
      'details?: any': 'details?: unknown',
      'metadata?: any': 'metadata?: Record<string, unknown>',
      'variables?: any': 'variables?: Record<string, unknown>',
      'config?: any': 'config?: Record<string, unknown>',
      'result?: any': 'result?: unknown'
    };
  }

  /**
   * 运行修复流程
   */
  async run() {
    console.log('🔧 开始修复Public目录的Schema-Application映射...\n');
    
    try {
      // 获取所有需要修复的文件
      const files = await this.getPublicFiles();
      
      console.log(`📁 发现 ${files.length} 个文件需要处理\n`);
      
      // 修复每个文件
      for (const file of files) {
        await this.fixPublicFile(file);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ 修复过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 获取Public目录下所有需要修复的文件
   */
  async getPublicFiles() {
    const patterns = [
      'src/public/**/*.ts',
      'src/public/**/*.js',
      '!src/public/**/*.test.ts',
      '!src/public/**/*.spec.ts',
      '!src/public/**/node_modules/**'
    ];
    
    const files = [];
    for (const pattern of patterns) {
      const matches = glob.sync(pattern);
      files.push(...matches);
    }
    
    // 去重并排序
    return [...new Set(files)].sort();
  }

  /**
   * 修复单个Public文件
   */
  async fixPublicFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return;
    }

    console.log(`📄 处理文件: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;

    // 1. 修复any类型
    for (const [anyPattern, replacement] of Object.entries(this.anyTypeReplacements)) {
      const regex = new RegExp(anyPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      
      if (matches && matches.length > 0) {
        content = content.replace(regex, replacement);
        modified = true;
        fixCount += matches.length;
        this.stats.anyTypesFixed += matches.length;
        console.log(`  ✅ 修复any类型: ${anyPattern} → ${replacement} (${matches.length}处)`);
      }
    }

    // 2. 修复字段名映射
    for (const [snakeCase, camelCase] of Object.entries(this.fieldMappings)) {
      const patterns = [
        // 接口定义中的字段: field_name: Type
        new RegExp(`(^\\s*|,\\s*|\\{\\s*)${snakeCase}(\\s*:\\s*)`, 'gm'),
        // 可选字段: field_name?: Type
        new RegExp(`(^\\s*|,\\s*|\\{\\s*)${snakeCase}(\\?\\s*:\\s*)`, 'gm'),
        // 对象字面量: { field_name: value }
        new RegExp(`(\\{[^}]*\\s*)${snakeCase}(\\s*:)`, 'g'),
        // 属性访问: obj.field_name
        new RegExp(`(\\w+\\.)${snakeCase}(\\b)`, 'g'),
        // 解构赋值: { field_name }
        new RegExp(`(\\{[^}]*\\s*)${snakeCase}(\\s*[,}])`, 'g'),
        // 函数参数: function(field_name: Type)
        new RegExp(`(\\([^)]*\\s*)${snakeCase}(\\s*:\\s*)`, 'g')
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

    // 3. 修复特定的Public目录问题
    if (filePath.includes('shared/types')) {
      // 修复共享类型文件的特殊问题
      content = this.fixSharedTypesSpecific(content);
    } else if (filePath.includes('utils')) {
      // 修复工具文件的特殊问题
      content = this.fixUtilsSpecific(content);
    } else if (filePath.includes('modules/core')) {
      // 修复核心模块的特殊问题
      content = this.fixCoreModuleSpecific(content);
    }

    if (modified || fixCount > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ 修复完成，共修复 ${fixCount} 处问题`);
      this.stats.filesProcessed++;
      this.stats.fieldsFixed += fixCount;
    } else {
      console.log(`  ℹ️  无需修复`);
    }
  }

  /**
   * 修复共享类型文件的特殊问题
   */
  fixSharedTypesSpecific(content) {
    // 确保OperationResult使用unknown而不是any
    content = content.replace(
      /export interface OperationResult<T = any>/g,
      'export interface OperationResult<T = unknown>'
    );
    
    // 修复ContextOperationResult
    content = content.replace(
      /export interface ContextOperationResult<T = any>/g,
      'export interface ContextOperationResult<T = unknown>'
    );
    
    return content;
  }

  /**
   * 修复工具文件的特殊问题
   */
  fixUtilsSpecific(content) {
    // 修复schema-validator中的snake_case引用
    content = content.replace(
      /protocol_version/g,
      'protocolVersion'
    );
    
    return content;
  }

  /**
   * 修复核心模块的特殊问题
   */
  fixCoreModuleSpecific(content) {
    // 修复core.types.ts中的配置字段
    content = content.replace(
      /integration_points/g,
      'integrationPoints'
    );
    
    content = content.replace(
      /cross_session/g,
      'crossSession'
    );
    
    content = content.replace(
      /cross_application/g,
      'crossApplication'
    );
    
    content = content.replace(
      /sharing_rules/g,
      'sharingRules'
    );
    
    content = content.replace(
      /storage_backend/g,
      'storageBackend'
    );
    
    content = content.replace(
      /retention_policy/g,
      'retentionPolicy'
    );
    
    return content;
  }

  /**
   * 打印修复总结
   */
  printSummary() {
    console.log('\n📊 Public目录Schema-Application映射修复总结:');
    console.log('================================');
    console.log(`处理的文件数: ${this.stats.filesProcessed}`);
    console.log(`修复的字段数: ${this.stats.fieldsFixed}`);
    console.log(`修复的any类型: ${this.stats.anyTypesFixed}`);
    console.log(`修复的接口数: ${this.stats.interfacesFixed}`);
    console.log(`发现的错误数: ${this.stats.errorsFound}`);
    
    if (this.stats.filesProcessed > 0) {
      console.log('\n✅ Public目录Schema-Application映射修复完成！');
      console.log('📋 修复内容:');
      console.log('   - 所有snake_case字段转换为camelCase');
      console.log('   - 所有any类型替换为unknown或具体类型');
      console.log('   - 共享类型接口标准化');
      console.log('   - 工具类函数参数标准化');
      console.log('   - 核心模块配置字段标准化');
    } else {
      console.log('\n✅ Public目录已经符合Schema-Application映射要求！');
    }
    
    console.log('\n🎯 下一步建议:');
    console.log('1. 验证TypeScript编译: npx tsc --noEmit');
    console.log('2. 验证ESLint检查: npx eslint src/public/**/*.ts');
    console.log('3. 运行测试验证: npm test');
    console.log('4. 继续修复全局类型定义');
  }
}

// 运行修复器
if (require.main === module) {
  const fixer = new PublicDirectoryMappingFixer();
  fixer.run().catch(console.error);
}

module.exports = PublicDirectoryMappingFixer;
