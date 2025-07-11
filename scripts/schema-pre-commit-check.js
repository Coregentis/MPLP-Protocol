#!/usr/bin/env node

/**
 * MPLP Schema Pre-commit检查脚本
 * 
 * 在代码提交前自动验证Schema版本一致性和冻结状态
 * 防止意外的Schema变更破坏开发基线
 * 
 * @version v1.0.1
 * @created 2025-07-10T15:45:00+08:00
 * @compliance 严格遵循Schema驱动开发规则
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SchemaPreCommitChecker {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.schemasDir = path.join(this.projectRoot, 'src/schemas');
    this.lockFile = path.join(this.projectRoot, 'src/config/schema-versions.lock');
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 执行完整的pre-commit检查
   */
  async check() {
    console.log('🔍 开始Schema Pre-commit检查...\n');
    
    try {
      // 1. 检查Git staged files中是否包含Schema文件
      const stagedSchemaFiles = this.getStagedSchemaFiles();
      
      if (stagedSchemaFiles.length === 0) {
        console.log('✅ 未发现Schema文件变更，跳过检查');
        return { success: true, message: 'No schema changes detected' };
      }
      
      console.log(`📋 检测到Schema文件变更: ${stagedSchemaFiles.join(', ')}`);
      
      // 2. 验证版本冻结状态
      this.checkVersionFreeze(stagedSchemaFiles);
      
      // 3. 验证协议版本一致性
      this.checkProtocolVersionConsistency();
      
      // 4. 验证Schema语法正确性
      this.validateSchemasSyntax(stagedSchemaFiles);
      
      // 5. 检查破坏性变更
      this.checkBreakingChanges(stagedSchemaFiles);
      
      // 6. 生成检查报告
      return this.generateReport();
      
    } catch (error) {
      this.errors.push(`Pre-commit检查过程出错: ${error.message}`);
      return this.generateReport();
    }
  }

  /**
   * 获取Git staged files中的Schema文件
   */
  getStagedSchemaFiles() {
    try {
      const result = execSync('git diff --cached --name-only', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
      
      const stagedFiles = result.trim().split('\n').filter(Boolean);
      return stagedFiles.filter(file => 
        file.includes('/schemas/') && file.endsWith('.json')
      );
    } catch (error) {
      this.warnings.push(`无法获取Git staged files: ${error.message}`);
      return [];
    }
  }

  /**
   * 检查版本冻结状态
   */
  checkVersionFreeze(stagedFiles) {
    console.log('🔒 检查版本冻结状态...');
    
    // 检查是否存在版本锁定文件
    if (!fs.existsSync(this.lockFile)) {
      this.warnings.push('版本锁定文件不存在，建议初始化Schema版本管理');
      return;
    }
    
    try {
      const lockContent = fs.readFileSync(this.lockFile, 'utf8');
      const lockData = JSON.parse(lockContent);
      
      // 检查冻结基线
      const frozenBaseline = lockData.frozenBaseline;
      if (!frozenBaseline || frozenBaseline.protocolVersion !== '1.0.1') {
        this.errors.push('Schema版本基线未正确冻结或版本不匹配');
      }
      
      // 检查每个变更的Schema文件
      for (const file of stagedFiles) {
        const moduleName = this.extractModuleName(file);
        const versionInfo = lockData.versions?.[moduleName];
        
        if (versionInfo && versionInfo.status === 'FROZEN') {
          this.errors.push(
            `❌ 禁止修改冻结的Schema文件: ${file}\n` +
            `   模块: ${moduleName}\n` +
            `   状态: ${versionInfo.status}\n` +
            `   冻结原因: ${versionInfo.lockReason || 'Development baseline freeze'}\n` +
            `   冻结时间: ${versionInfo.lockTimestamp}`
          );
        }
      }
      
      console.log(`✅ 版本冻结状态检查完成`);
    } catch (error) {
      this.errors.push(`版本冻结状态检查失败: ${error.message}`);
    }
  }

  /**
   * 提取模块名称
   */
  extractModuleName(filePath) {
    const fileName = path.basename(filePath);
    return fileName.replace('.json', '');
  }

  /**
   * 检查协议版本一致性
   */
  checkProtocolVersionConsistency() {
    console.log('📋 检查协议版本一致性...');
    
    try {
      const schemaFiles = [
        'context-protocol.json',
        'plan-protocol.json',
        'confirm-protocol.json',
        'trace-protocol.json',
        'role-protocol.json',
        'extension-protocol.json'
      ];
      
      const protocolVersions = new Set();
      
      for (const file of schemaFiles) {
        const filePath = path.join(this.schemasDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const schema = JSON.parse(content);
          
          const protocolVersion = schema.properties?.protocol_version?.const;
          if (protocolVersion) {
            protocolVersions.add(protocolVersion);
          }
        }
      }
      
      if (protocolVersions.size > 1) {
        this.errors.push(
          `❌ 协议版本不一致: ${Array.from(protocolVersions).join(', ')}\n` +
          `   要求: 所有Schema必须使用统一的协议版本 1.0.1`
        );
      } else if (protocolVersions.size === 1 && !protocolVersions.has('1.0.1')) {
        this.errors.push(
          `❌ 协议版本不符合要求: ${Array.from(protocolVersions)[0]}\n` +
          `   要求: 必须使用协议版本 1.0.1`
        );
      }
      
      console.log(`✅ 协议版本一致性检查完成`);
    } catch (error) {
      this.errors.push(`协议版本一致性检查失败: ${error.message}`);
    }
  }

  /**
   * 验证Schema语法正确性
   */
  validateSchemasSyntax(stagedFiles) {
    console.log('🔍 验证Schema语法...');
    
    for (const file of stagedFiles) {
      try {
        const filePath = path.join(this.projectRoot, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // JSON语法检查
        const schema = JSON.parse(content);
        
        // 基础Schema结构检查
        if (!schema.$schema) {
          this.warnings.push(`${file}: 缺少$schema字段`);
        }
        
        if (!schema.$id) {
          this.warnings.push(`${file}: 缺少$id字段`);
        }
        
        if (!schema.title) {
          this.warnings.push(`${file}: 缺少title字段`);
        }
        
        if (!schema.properties) {
          this.errors.push(`${file}: 缺少properties字段`);
        }
        
        // 协议版本字段检查
        if (!schema.properties?.protocol_version) {
          this.errors.push(`${file}: 缺少protocol_version字段定义`);
        }
        
        console.log(`✅ ${file} 语法检查通过`);
      } catch (error) {
        this.errors.push(`${file}: JSON语法错误 - ${error.message}`);
      }
    }
  }

  /**
   * 检查破坏性变更
   */
  checkBreakingChanges(stagedFiles) {
    console.log('⚠️  检查破坏性变更...');
    
    for (const file of stagedFiles) {
      try {
        // 获取当前文件内容
        const currentPath = path.join(this.projectRoot, file);
        const currentContent = fs.readFileSync(currentPath, 'utf8');
        const currentSchema = JSON.parse(currentContent);
        
        // 获取HEAD版本内容进行对比
        try {
          const headContent = execSync(`git show HEAD:${file}`, { 
            encoding: 'utf8',
            cwd: this.projectRoot 
          });
          const headSchema = JSON.parse(headContent);
          
          // 检查破坏性变更
          const breakingChanges = this.detectBreakingChanges(headSchema, currentSchema);
          
          if (breakingChanges.length > 0) {
            this.errors.push(
              `❌ ${file} 包含破坏性变更:\n` +
              breakingChanges.map(change => `   - ${change}`).join('\n')
            );
          }
          
        } catch (gitError) {
          // 新文件或HEAD中不存在，跳过对比
          this.warnings.push(`${file}: 无法获取HEAD版本进行对比 (可能是新文件)`);
        }
        
      } catch (error) {
        this.warnings.push(`${file}: 破坏性变更检查失败 - ${error.message}`);
      }
    }
  }

  /**
   * 检测破坏性变更
   */
  detectBreakingChanges(oldSchema, newSchema) {
    const changes = [];
    
    // 检查必需字段是否被删除
    const oldRequired = oldSchema.required || [];
    const newRequired = newSchema.required || [];
    
    for (const field of oldRequired) {
      if (!newRequired.includes(field)) {
        changes.push(`删除了必需字段: ${field}`);
      }
    }
    
    // 检查字段类型是否改变
    const oldProps = oldSchema.properties || {};
    const newProps = newSchema.properties || {};
    
    for (const [field, oldDef] of Object.entries(oldProps)) {
      if (newProps[field]) {
        if (oldDef.type !== newProps[field].type) {
          changes.push(`字段 ${field} 类型改变: ${oldDef.type} -> ${newProps[field].type}`);
        }
        
        // 检查枚举值是否减少
        if (oldDef.enum && newProps[field].enum) {
          for (const enumValue of oldDef.enum) {
            if (!newProps[field].enum.includes(enumValue)) {
              changes.push(`字段 ${field} 删除了枚举值: ${enumValue}`);
            }
          }
        }
      } else {
        changes.push(`删除了字段: ${field}`);
      }
    }
    
    return changes;
  }

  /**
   * 生成检查报告
   */
  generateReport() {
    const success = this.errors.length === 0;
    
    console.log('\n📊 Schema Pre-commit检查报告');
    console.log('='.repeat(60));
    
    if (success) {
      console.log('✅ 所有检查通过 - 可以提交');
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️  警告信息:');
        this.warnings.forEach((warning, i) => {
          console.log(`${i + 1}. ${warning}`);
        });
      }
    } else {
      console.log('❌ 检查失败 - 禁止提交');
      
      console.log('\n🚫 错误信息:');
      this.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️  警告信息:');
        this.warnings.forEach((warning, i) => {
          console.log(`${i + 1}. ${warning}`);
        });
      }
      
      console.log('\n💡 建议:');
      console.log('1. 如需修改Schema，请先申请版本解冻');
      console.log('2. 确保所有Schema使用统一的协议版本 1.0.1');
      console.log('3. 避免破坏性变更，考虑向后兼容的修改方式');
      console.log('4. 联系架构团队审查Schema变更');
    }
    
    console.log('='.repeat(60));
    
    return {
      success,
      errors: this.errors,
      warnings: this.warnings,
      message: success ? 'Schema检查通过' : 'Schema检查失败'
    };
  }
}

// 执行检查
if (require.main === module) {
  const checker = new SchemaPreCommitChecker();
  checker.check()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Schema Pre-commit检查完成!');
        process.exit(0);
      } else {
        console.log('\n🛑 Schema Pre-commit检查失败!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Pre-commit检查过程出错:', error);
      process.exit(1);
    });
}

module.exports = SchemaPreCommitChecker; 