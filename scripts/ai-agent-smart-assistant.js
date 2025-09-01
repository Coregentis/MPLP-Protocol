#!/usr/bin/env node

/**
 * AI Agent智能助手系统
 * 
 * 目的：为AI Agent提供智能的约束提醒和执行指导
 * 功能：基于当前操作上下文，智能提醒相关约束条件
 * 
 * 解决：AI Agent长上下文记忆局限问题
 */

const fs = require('fs');
const path = require('path');

class AIAgentSmartAssistant {
  constructor() {
    this.constraintDatabase = this.loadConstraintDatabase();
    this.currentContext = {
      phase: 'unknown',
      module: 'unknown',
      operation: 'unknown',
      files: []
    };
  }

  /**
   * 加载约束条件数据库
   */
  loadConstraintDatabase() {
    return {
      // 架构约束
      architecture: {
        ddd_structure: {
          description: '必须遵循DDD分层架构',
          applies_to: ['all_modules'],
          critical: true,
          check_command: 'node scripts/check-ddd-structure.js',
          violation_message: '模块缺少必需的DDD目录结构'
        },
        l3_manager_injection: {
          description: '必须注入9个L3管理器',
          applies_to: ['protocol_classes'],
          critical: true,
          check_command: 'grep -r "L3.*Manager" src/',
          violation_message: '协议类未正确注入L3管理器'
        },
        reserved_interfaces: {
          description: '必须实现MPLP预留接口',
          applies_to: ['management_services'],
          critical: true,
          check_command: 'bash quality/scripts/shared/architecture-integrity-check.sh',
          violation_message: '缺少必需的MPLP预留接口实现'
        }
      },
      
      // 代码质量约束
      code_quality: {
        no_any_type: {
          description: '绝对禁止使用any类型',
          applies_to: ['all_typescript'],
          critical: true,
          check_command: 'grep -r ": any" src/ --include="*.ts"',
          violation_message: '发现any类型使用，违反零技术债务政策'
        },
        typescript_errors: {
          description: 'TypeScript编译必须0错误',
          applies_to: ['all_typescript'],
          critical: true,
          check_command: 'npx tsc --noEmit',
          violation_message: 'TypeScript编译存在错误'
        },
        eslint_warnings: {
          description: 'ESLint检查必须0警告',
          applies_to: ['all_typescript'],
          critical: true,
          check_command: 'npx eslint src/ --format json',
          violation_message: 'ESLint检查发现错误或警告'
        }
      },
      
      // 命名约定
      naming_convention: {
        dual_naming: {
          description: 'Schema用snake_case，TypeScript用camelCase',
          applies_to: ['schema_files', 'mapper_classes'],
          critical: true,
          check_command: 'node scripts/check-naming-convention.js',
          violation_message: '违反双重命名约定'
        },
        mapper_implementation: {
          description: '必须实现完整的Mapper类',
          applies_to: ['mapper_classes'],
          critical: true,
          check_command: 'grep -r "toSchema\\|fromSchema" src/',
          violation_message: 'Mapper类缺少必需的转换方法'
        }
      },
      
      // Schema合规性
      schema_compliance: {
        schema_validation: {
          description: '必须通过Schema验证',
          applies_to: ['schema_files'],
          critical: true,
          check_command: 'npm run validate:schemas',
          violation_message: 'Schema验证失败'
        },
        field_mapping: {
          description: '字段映射必须100%一致',
          applies_to: ['mapper_classes'],
          critical: true,
          check_command: 'npm run validate:mapping',
          violation_message: 'Schema-TypeScript字段映射不一致'
        }
      },
      
      // 测试要求
      testing_requirements: {
        test_coverage: {
          description: '测试覆盖率必须≥90%',
          applies_to: ['all_modules'],
          critical: false,
          check_command: 'npm run test:coverage',
          violation_message: '测试覆盖率不达标'
        },
        test_pass_rate: {
          description: '测试通过率必须100%',
          applies_to: ['all_modules'],
          critical: true,
          check_command: 'npm test',
          violation_message: '存在失败的测试用例'
        }
      }
    };
  }

  /**
   * 设置当前执行上下文
   */
  setContext(phase, module, operation, files = []) {
    this.currentContext = { phase, module, operation, files };
    console.log(`🎯 设置执行上下文: ${phase} -> ${module} -> ${operation}`);
  }

  /**
   * 获取当前上下文相关的约束条件
   */
  getRelevantConstraints() {
    const relevant = [];
    
    for (const [category, constraints] of Object.entries(this.constraintDatabase)) {
      for (const [key, constraint] of Object.entries(constraints)) {
        if (this.isConstraintRelevant(constraint)) {
          relevant.push({
            category,
            key,
            ...constraint
          });
        }
      }
    }
    
    return relevant.sort((a, b) => {
      // 关键约束优先
      if (a.critical && !b.critical) return -1;
      if (!a.critical && b.critical) return 1;
      return 0;
    });
  }

  /**
   * 判断约束是否与当前上下文相关
   */
  isConstraintRelevant(constraint) {
    const { phase, module, operation, files } = this.currentContext;
    
    // 检查适用范围
    for (const scope of constraint.applies_to) {
      if (scope === 'all_modules' || scope === 'all_typescript') {
        return true;
      }
      
      if (scope === 'protocol_classes' && operation.includes('protocol')) {
        return true;
      }
      
      if (scope === 'management_services' && operation.includes('service')) {
        return true;
      }
      
      if (scope === 'schema_files' && files.some(f => f.includes('schema'))) {
        return true;
      }
      
      if (scope === 'mapper_classes' && files.some(f => f.includes('mapper'))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 显示相关约束提醒
   */
  showConstraintReminders() {
    const relevant = this.getRelevantConstraints();
    
    if (relevant.length === 0) {
      console.log('✅ 当前操作无特殊约束要求');
      return;
    }
    
    console.log('\n🚨 相关约束条件提醒:');
    console.log('='.repeat(50));
    
    const critical = relevant.filter(c => c.critical);
    const normal = relevant.filter(c => !c.critical);
    
    if (critical.length > 0) {
      console.log('\n🔴 关键约束 (必须遵循):');
      critical.forEach((constraint, index) => {
        console.log(`${index + 1}. ${constraint.description}`);
        console.log(`   检查命令: ${constraint.check_command}`);
      });
    }
    
    if (normal.length > 0) {
      console.log('\n🟡 一般约束 (建议遵循):');
      normal.forEach((constraint, index) => {
        console.log(`${index + 1}. ${constraint.description}`);
        console.log(`   检查命令: ${constraint.check_command}`);
      });
    }
    
    console.log('\n💡 建议: 在继续操作前，请确认理解并遵循上述约束条件');
  }

  /**
   * 执行相关约束检查
   */
  async runRelevantChecks() {
    const relevant = this.getRelevantConstraints();
    const critical = relevant.filter(c => c.critical);
    
    console.log('\n🔍 执行相关约束检查...');
    
    let allPassed = true;
    const violations = [];
    
    for (const constraint of critical) {
      try {
        console.log(`\n检查: ${constraint.description}`);
        
        const { execSync } = require('child_process');
        execSync(constraint.check_command, { stdio: 'pipe' });
        
        console.log('✅ 通过');
      } catch (error) {
        console.log('❌ 失败');
        console.log(`   ${constraint.violation_message}`);
        
        allPassed = false;
        violations.push({
          constraint: constraint.description,
          message: constraint.violation_message,
          command: constraint.check_command
        });
      }
    }
    
    if (!allPassed) {
      console.log('\n🚨 发现约束违规！');
      console.log('请修复以下问题后继续:');
      violations.forEach((v, index) => {
        console.log(`${index + 1}. ${v.constraint}`);
        console.log(`   问题: ${v.message}`);
        console.log(`   检查: ${v.command}`);
      });
      return false;
    }
    
    console.log('\n✅ 所有关键约束检查通过！');
    return true;
  }

  /**
   * 生成操作前检查清单
   */
  generatePreOperationChecklist() {
    const relevant = this.getRelevantConstraints();
    
    console.log('\n📋 操作前检查清单:');
    console.log('='.repeat(30));
    
    relevant.forEach((constraint, index) => {
      const priority = constraint.critical ? '🔴' : '🟡';
      console.log(`${priority} ${index + 1}. ${constraint.description}`);
    });
    
    console.log('\n💡 请在开始操作前确认理解并准备遵循上述约束');
  }

  /**
   * 生成操作后验证清单
   */
  generatePostOperationChecklist() {
    const relevant = this.getRelevantConstraints();
    
    console.log('\n✅ 操作后验证清单:');
    console.log('='.repeat(30));
    
    relevant.forEach((constraint, index) => {
      console.log(`□ ${constraint.description}`);
      console.log(`  检查: ${constraint.check_command}`);
    });
    
    console.log('\n💡 请在完成操作后运行上述检查命令验证合规性');
  }
}

// 预定义的常用操作上下文
const COMMON_CONTEXTS = {
  'create-module': {
    phase: 'development',
    operation: 'create_module',
    description: '创建新模块'
  },
  'implement-service': {
    phase: 'development', 
    operation: 'implement_service',
    description: '实现服务类'
  },
  'create-mapper': {
    phase: 'development',
    operation: 'create_mapper', 
    description: '创建Mapper类'
  },
  'implement-protocol': {
    phase: 'development',
    operation: 'implement_protocol',
    description: '实现协议类'
  },
  'write-tests': {
    phase: 'testing',
    operation: 'write_tests',
    description: '编写测试'
  }
};

// 主执行函数
async function main() {
  const assistant = new AIAgentSmartAssistant();
  
  const command = process.argv[2];
  const contextKey = process.argv[3];
  const module = process.argv[4] || 'unknown';
  
  if (command === 'remind' && contextKey && COMMON_CONTEXTS[contextKey]) {
    const context = COMMON_CONTEXTS[contextKey];
    assistant.setContext(context.phase, module, context.operation);
    assistant.showConstraintReminders();
    assistant.generatePreOperationChecklist();
  } else if (command === 'check' && contextKey && COMMON_CONTEXTS[contextKey]) {
    const context = COMMON_CONTEXTS[contextKey];
    assistant.setContext(context.phase, module, context.operation);
    const passed = await assistant.runRelevantChecks();
    process.exit(passed ? 0 : 1);
  } else if (command === 'verify' && contextKey && COMMON_CONTEXTS[contextKey]) {
    const context = COMMON_CONTEXTS[contextKey];
    assistant.setContext(context.phase, module, context.operation);
    assistant.generatePostOperationChecklist();
  } else {
    console.log('AI Agent智能助手系统');
    console.log('');
    console.log('用法:');
    console.log('  node scripts/ai-agent-smart-assistant.js remind <context> <module>');
    console.log('  node scripts/ai-agent-smart-assistant.js check <context> <module>');
    console.log('  node scripts/ai-agent-smart-assistant.js verify <context> <module>');
    console.log('');
    console.log('可用上下文:');
    Object.entries(COMMON_CONTEXTS).forEach(([key, context]) => {
      console.log(`  ${key}: ${context.description}`);
    });
    console.log('');
    console.log('示例:');
    console.log('  node scripts/ai-agent-smart-assistant.js remind create-module context');
    console.log('  node scripts/ai-agent-smart-assistant.js check implement-service plan');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { AIAgentSmartAssistant };
