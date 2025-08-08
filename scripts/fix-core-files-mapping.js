#!/usr/bin/env node

/**
 * 修复所有模块核心文件的Schema-Application映射关系
 * 
 * 专注于确保index.ts, module.ts, types.ts文件正确实现:
 * - Schema层: snake_case (JSON/API标准)
 * - Application层: camelCase (JavaScript标准)
 * 
 * @version 1.0.0
 * @created 2025-08-06
 */

const fs = require('fs');
const path = require('path');

class CoreFilesMappingFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      interfacesFixed: 0,
      fieldsFixed: 0,
      errorsFound: 0
    };
    
    // 10个模块列表
    this.modules = [
      'core', 'context', 'plan', 'confirm', 'trace', 
      'role', 'extension', 'collab', 'dialog', 'network'
    ];
    
    // 标准字段映射 (Schema snake_case → Application camelCase)
    this.fieldMappings = {
      // 基础字段
      'context_id': 'contextId',
      'session_id': 'sessionId',
      'agent_id': 'agentId',
      'user_id': 'userId',
      'plan_id': 'planId',
      'trace_id': 'traceId',
      'role_id': 'roleId',
      'extension_id': 'extensionId',
      'dialog_id': 'dialogId',
      'network_id': 'networkId',
      'confirm_id': 'confirmId',
      'collaboration_id': 'collaborationId',
      'workflow_id': 'workflowId',
      'orchestrator_id': 'orchestratorId',
      
      // 时间字段
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'started_at': 'startedAt',
      'completed_at': 'completedAt',
      'deleted_at': 'deletedAt',
      
      // 状态字段
      'lifecycle_stage': 'lifecycleStage',
      'execution_status': 'executionStatus',
      'approval_status': 'approvalStatus',
      'confirmation_type': 'confirmationType',
      'trace_type': 'traceType',
      'role_type': 'roleType',
      'node_type': 'nodeType',
      
      // 配置字段
      'protocol_version': 'protocolVersion',
      'timeout_ms': 'timeoutMs',
      'retry_count': 'retryCount',
      'max_attempts': 'maxAttempts',
      'delay_ms': 'delayMs',
      'backoff_factor': 'backoffFactor',
      
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
      'coordination_strategy': 'coordinationStrategy'
    };
  }

  /**
   * 运行修复流程
   */
  async run() {
    console.log('🔧 开始修复所有模块核心文件的Schema-Application映射关系...\n');
    
    try {
      // 修复每个模块的核心文件
      for (const module of this.modules) {
        await this.fixModuleCoreFiles(module);
      }
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ 修复过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 修复单个模块的核心文件
   */
  async fixModuleCoreFiles(moduleName) {
    console.log(`📁 处理模块: ${moduleName}`);
    
    const moduleDir = path.join('src/modules', moduleName);
    if (!fs.existsSync(moduleDir)) {
      console.log(`⚠️  模块目录不存在: ${moduleDir}`);
      return;
    }

    // 修复 types.ts
    await this.fixTypesFile(moduleName, moduleDir);
    
    // 修复 index.ts
    await this.fixIndexFile(moduleName, moduleDir);
    
    // 修复 module.ts (如果存在)
    await this.fixModuleFile(moduleName, moduleDir);
    
    console.log(`✅ 模块 ${moduleName} 核心文件修复完成\n`);
  }

  /**
   * 修复types.ts文件
   */
  async fixTypesFile(moduleName, moduleDir) {
    const typesPath = path.join(moduleDir, 'types.ts');
    
    if (!fs.existsSync(typesPath)) {
      console.log(`  ⚠️  types.ts 文件不存在: ${typesPath}`);
      return;
    }

    let content = fs.readFileSync(typesPath, 'utf8');
    let modified = false;

    // 修复接口定义中的字段名
    for (const [snakeCase, camelCase] of Object.entries(this.fieldMappings)) {
      // 修复接口属性定义
      const interfacePropertyPattern = new RegExp(`^(\\s+)${snakeCase}(\\??\\s*:\\s*)`, 'gm');
      if (interfacePropertyPattern.test(content)) {
        content = content.replace(interfacePropertyPattern, `$1${camelCase}$2`);
        modified = true;
        this.stats.fieldsFixed++;
      }
    }

    // 确保协议接口使用camelCase
    const protocolInterfacePattern = new RegExp(`export interface ${this.capitalize(moduleName)}Protocol\\s*{[^}]+}`, 's');
    const protocolMatch = content.match(protocolInterfacePattern);
    
    if (protocolMatch) {
      let protocolInterface = protocolMatch[0];
      let protocolModified = false;
      
      for (const [snakeCase, camelCase] of Object.entries(this.fieldMappings)) {
        const fieldPattern = new RegExp(`(\\s+)${snakeCase}(\\??\\s*:\\s*)`, 'g');
        if (fieldPattern.test(protocolInterface)) {
          protocolInterface = protocolInterface.replace(fieldPattern, `$1${camelCase}$2`);
          protocolModified = true;
        }
      }
      
      if (protocolModified) {
        content = content.replace(protocolInterfacePattern, protocolInterface);
        modified = true;
        this.stats.interfacesFixed++;
      }
    }

    if (modified) {
      fs.writeFileSync(typesPath, content, 'utf8');
      console.log(`  ✅ 修复了 types.ts`);
      this.stats.filesProcessed++;
    } else {
      console.log(`  ℹ️  types.ts 无需修复`);
    }
  }

  /**
   * 修复index.ts文件
   */
  async fixIndexFile(moduleName, moduleDir) {
    const indexPath = path.join(moduleDir, 'index.ts');
    
    if (!fs.existsSync(indexPath)) {
      console.log(`  ⚠️  index.ts 文件不存在: ${indexPath}`);
      return;
    }

    let content = fs.readFileSync(indexPath, 'utf8');
    let modified = false;

    // 检查是否有需要修复的导出或接口定义
    for (const [snakeCase, camelCase] of Object.entries(this.fieldMappings)) {
      // 修复接口定义中的字段名
      const interfacePattern = new RegExp(`(\\s+)${snakeCase}(\\??\\s*:\\s*)`, 'g');
      if (interfacePattern.test(content)) {
        content = content.replace(interfacePattern, `$1${camelCase}$2`);
        modified = true;
        this.stats.fieldsFixed++;
      }
    }

    if (modified) {
      fs.writeFileSync(indexPath, content, 'utf8');
      console.log(`  ✅ 修复了 index.ts`);
      this.stats.filesProcessed++;
    } else {
      console.log(`  ℹ️  index.ts 无需修复`);
    }
  }

  /**
   * 修复module.ts文件
   */
  async fixModuleFile(moduleName, moduleDir) {
    const modulePath = path.join(moduleDir, 'module.ts');
    
    if (!fs.existsSync(modulePath)) {
      console.log(`  ℹ️  module.ts 文件不存在 (可选)`);
      return;
    }

    let content = fs.readFileSync(modulePath, 'utf8');
    let modified = false;

    // 修复模块文件中的字段名
    for (const [snakeCase, camelCase] of Object.entries(this.fieldMappings)) {
      const fieldPattern = new RegExp(`(\\s+)${snakeCase}(\\??\\s*:\\s*)`, 'g');
      if (fieldPattern.test(content)) {
        content = content.replace(fieldPattern, `$1${camelCase}$2`);
        modified = true;
        this.stats.fieldsFixed++;
      }
    }

    if (modified) {
      fs.writeFileSync(modulePath, content, 'utf8');
      console.log(`  ✅ 修复了 module.ts`);
      this.stats.filesProcessed++;
    } else {
      console.log(`  ℹ️  module.ts 无需修复`);
    }
  }

  /**
   * 首字母大写
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 打印修复总结
   */
  printSummary() {
    console.log('\n📊 核心文件映射修复总结:');
    console.log('================================');
    console.log(`处理的文件数: ${this.stats.filesProcessed}`);
    console.log(`修复的接口数: ${this.stats.interfacesFixed}`);
    console.log(`修复的字段数: ${this.stats.fieldsFixed}`);
    console.log(`发现的错误数: ${this.stats.errorsFound}`);
    
    if (this.stats.fieldsFixed > 0) {
      console.log('\n✅ Schema-Application映射关系修复完成！');
      console.log('📋 修复内容:');
      console.log('   - Schema层: snake_case (JSON/API标准)');
      console.log('   - Application层: camelCase (JavaScript标准)');
      console.log('   - 映射机制: 自动转换 (序列化/反序列化时处理)');
    } else {
      console.log('\n✅ 所有核心文件的映射关系已经正确！');
    }
  }
}

// 运行修复器
if (require.main === module) {
  const fixer = new CoreFilesMappingFixer();
  fixer.run().catch(console.error);
}

module.exports = CoreFilesMappingFixer;
