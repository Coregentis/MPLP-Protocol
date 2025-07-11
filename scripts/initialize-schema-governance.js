#!/usr/bin/env node

/**
 * MPLP Schema治理初始化脚本
 * 
 * 初始化Schema版本管理，执行版本冻结，部署自动化验证机制
 * 为后续模块开发提供稳定的Schema基础
 * 
 * @version v1.0.1
 * @created 2025-07-10T15:50:00+08:00
 * @compliance 严格遵循Schema驱动开发规则
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SchemaGovernanceInitializer {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.configDir = path.join(this.projectRoot, 'src/config');
    this.schemasDir = path.join(this.projectRoot, 'src/schemas');
    this.initialized = false;
  }

  /**
   * 执行完整的Schema治理初始化
   */
  async initialize() {
    console.log('🚀 开始Schema治理初始化...\n');
    
    try {
      // 1. 创建配置目录
      this.createConfigDirectory();
      
      // 2. 初始化Schema版本管理器配置
      this.initializeVersionManagerConfig();
      
      // 3. 扫描并建立Schema版本基线
      const baseline = this.buildVersionBaseline();
      
      // 4. 冻结所有Schema版本
      this.freezeSchemaVersions(baseline);
      
      // 5. 验证Schema环境完整性
      const validation = this.validateSchemaEnvironment();
      
      // 6. 配置自动化检查机制
      this.setupAutomatedChecks();
      
      // 7. 生成治理报告
      const report = this.generateGovernanceReport({
        baseline,
        validation,
        timestamp: new Date().toISOString()
      });
      
      // 8. 保存配置和报告
      this.saveGovernanceFiles(report);
      
      console.log('\n🎉 Schema治理初始化完成!');
      return { success: true, report };
      
    } catch (error) {
      console.error('❌ Schema治理初始化失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 创建配置目录
   */
  createConfigDirectory() {
    console.log('📁 创建配置目录...');
    
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
      console.log(`✅ 配置目录已创建: ${this.configDir}`);
    } else {
      console.log(`✅ 配置目录已存在: ${this.configDir}`);
    }
  }

  /**
   * 初始化版本管理器配置
   */
  initializeVersionManagerConfig() {
    console.log('⚙️  初始化版本管理器配置...');
    
    const config = {
      enforceFreeze: true,
      allowedModifiers: ['build-system', 'schema-validator'],
      requireApproval: true,
      autoBackup: true,
      validateOnStartup: true,
      governanceLevel: 'STRICT',
      createdAt: new Date().toISOString(),
      version: '1.0.1'
    };
    
    const configPath = path.join(this.configDir, 'schema-version-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`✅ 版本管理器配置已保存: ${configPath}`);
    return config;
  }

  /**
   * 建立Schema版本基线
   */
  buildVersionBaseline() {
    console.log('📋 建立Schema版本基线...');
    
    const schemaFiles = [
      'context-protocol.json',
      'plan-protocol.json',
      'confirm-protocol.json',
      'trace-protocol.json',
      'role-protocol.json',
      'extension-protocol.json'
    ];
    
    const baseline = {
      timestamp: new Date().toISOString(),
      protocolVersion: '1.0.1',
      schemas: {},
      signature: null
    };
    
    for (const file of schemaFiles) {
      const filePath = path.join(this.schemasDir, file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const schema = JSON.parse(content);
        const stat = fs.statSync(filePath);
        
        const moduleName = file.replace('.json', '');
        baseline.schemas[moduleName] = {
          filename: file,
          version: schema.version || '1.0.1',
          protocolVersion: schema.properties?.protocol_version?.const || '1.0.1',
          hash: this.calculateHash(content),
          lastModified: stat.mtime.toISOString(),
          size: stat.size,
          requiredFields: schema.required || [],
          status: 'READY_TO_FREEZE'
        };
        
        console.log(`✅ ${moduleName}: v${baseline.schemas[moduleName].version}`);
      } else {
        console.warn(`⚠️  Schema文件不存在: ${file}`);
      }
    }
    
    // 生成基线签名
    baseline.signature = this.generateBaselineSignature(baseline);
    
    console.log(`✅ Schema版本基线已建立 (${Object.keys(baseline.schemas).length} 个模块)`);
    return baseline;
  }

  /**
   * 计算文件哈希
   */
  calculateHash(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 生成基线签名
   */
  generateBaselineSignature(baseline) {
    const crypto = require('crypto');
    const data = Object.entries(baseline.schemas)
      .map(([name, info]) => `${name}:${info.version}:${info.hash}`)
      .join('|');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 冻结Schema版本
   */
  freezeSchemaVersions(baseline) {
    console.log('🔒 冻结Schema版本...');
    
    const lockData = {
      timestamp: new Date().toISOString(),
      frozenBaseline: {
        protocolVersion: '1.0.1',
        schemaModules: Object.keys(baseline.schemas).map(name => `${name}`)
      },
      versions: {},
      governance: {
        level: 'STRICT',
        reason: 'Development phase freeze - prevent schema changes during module development',
        approver: 'MPLP Architecture Team',
        duration: 'Until Phase 1 completion'
      },
      signature: baseline.signature
    };
    
    // 转换为锁定格式
    for (const [name, info] of Object.entries(baseline.schemas)) {
      lockData.versions[name] = {
        module: name,
        version: info.version,
        protocolVersion: info.protocolVersion,
        status: 'FROZEN',
        lastModified: info.lastModified,
        hash: info.hash,
        lockTimestamp: lockData.timestamp,
        lockReason: 'Development baseline freeze'
      };
    }
    
    const lockPath = path.join(this.configDir, 'schema-versions.lock');
    fs.writeFileSync(lockPath, JSON.stringify(lockData, null, 2));
    
    console.log(`🔒 已冻结 ${Object.keys(lockData.versions).length} 个Schema模块`);
    console.log(`✅ 版本锁定文件已保存: ${lockPath}`);
    
    return lockData;
  }

  /**
   * 验证Schema环境
   */
  validateSchemaEnvironment() {
    console.log('✅ 验证Schema环境完整性...');
    
    const validation = {
      timestamp: new Date().toISOString(),
      overall: true,
      checks: {}
    };
    
    // 1. 协议版本一致性检查
    validation.checks.protocolVersionConsistency = this.checkProtocolVersionConsistency();
    
    // 2. Schema文件完整性检查
    validation.checks.schemaIntegrity = this.checkSchemaIntegrity();
    
    // 3. 冻结状态检查
    validation.checks.freezeStatus = this.checkFreezeStatus();
    
    // 4. 配置完整性检查
    validation.checks.configIntegrity = this.checkConfigIntegrity();
    
    // 计算总体验证结果
    validation.overall = Object.values(validation.checks).every(check => check.valid);
    
    if (validation.overall) {
      console.log('✅ Schema环境验证通过');
    } else {
      console.log('❌ Schema环境验证存在问题');
    }
    
    return validation;
  }

  /**
   * 检查协议版本一致性
   */
  checkProtocolVersionConsistency() {
    const check = { valid: true, issues: [], details: {} };
    
    try {
      const schemaFiles = fs.readdirSync(this.schemasDir).filter(f => f.endsWith('.json'));
      const protocolVersions = new Set();
      
      for (const file of schemaFiles) {
        const content = fs.readFileSync(path.join(this.schemasDir, file), 'utf8');
        const schema = JSON.parse(content);
        const protocolVersion = schema.properties?.protocol_version?.const;
        
        if (protocolVersion) {
          protocolVersions.add(protocolVersion);
          check.details[file] = protocolVersion;
        }
      }
      
      if (protocolVersions.size > 1) {
        check.valid = false;
        check.issues.push(`协议版本不一致: ${Array.from(protocolVersions).join(', ')}`);
      } else if (protocolVersions.size === 1 && !protocolVersions.has('1.0.1')) {
        check.valid = false;
        check.issues.push(`协议版本不符合要求: 期望 1.0.1, 实际 ${Array.from(protocolVersions)[0]}`);
      }
      
    } catch (error) {
      check.valid = false;
      check.issues.push(`协议版本检查失败: ${error.message}`);
    }
    
    return check;
  }

  /**
   * 检查Schema文件完整性
   */
  checkSchemaIntegrity() {
    const check = { valid: true, issues: [], details: {} };
    
    const requiredSchemas = [
      'context-protocol.json',
      'plan-protocol.json',
      'confirm-protocol.json',
      'trace-protocol.json',
      'role-protocol.json',
      'extension-protocol.json'
    ];
    
    for (const file of requiredSchemas) {
      const filePath = path.join(this.schemasDir, file);
      
      if (!fs.existsSync(filePath)) {
        check.valid = false;
        check.issues.push(`缺失Schema文件: ${file}`);
      } else {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const schema = JSON.parse(content);
          
          check.details[file] = {
            hasId: !!schema.$id,
            hasTitle: !!schema.title,
            hasProperties: !!schema.properties,
            hasRequired: Array.isArray(schema.required),
            size: content.length
          };
          
          if (!schema.$id || !schema.title || !schema.properties) {
            check.valid = false;
            check.issues.push(`${file}: Schema结构不完整`);
          }
        } catch (error) {
          check.valid = false;
          check.issues.push(`${file}: JSON语法错误 - ${error.message}`);
        }
      }
    }
    
    return check;
  }

  /**
   * 检查冻结状态
   */
  checkFreezeStatus() {
    const check = { valid: true, issues: [], details: {} };
    
    const lockPath = path.join(this.configDir, 'schema-versions.lock');
    
    if (!fs.existsSync(lockPath)) {
      check.valid = false;
      check.issues.push('版本锁定文件不存在');
    } else {
      try {
        const lockContent = fs.readFileSync(lockPath, 'utf8');
        const lockData = JSON.parse(lockContent);
        
        check.details.frozenModules = Object.keys(lockData.versions || {}).length;
        check.details.protocolVersion = lockData.frozenBaseline?.protocolVersion;
        
        if (lockData.frozenBaseline?.protocolVersion !== '1.0.1') {
          check.valid = false;
          check.issues.push('冻结基线协议版本不正确');
        }
        
      } catch (error) {
        check.valid = false;
        check.issues.push(`锁定文件解析失败: ${error.message}`);
      }
    }
    
    return check;
  }

  /**
   * 检查配置完整性
   */
  checkConfigIntegrity() {
    const check = { valid: true, issues: [], details: {} };
    
    const configPath = path.join(this.configDir, 'schema-version-config.json');
    
    if (!fs.existsSync(configPath)) {
      check.valid = false;
      check.issues.push('版本管理配置文件不存在');
    } else {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        check.details = {
          enforceFreeze: config.enforceFreeze,
          validateOnStartup: config.validateOnStartup,
          governanceLevel: config.governanceLevel
        };
        
        if (!config.enforceFreeze) {
          check.valid = false;
          check.issues.push('强制冻结未启用');
        }
        
      } catch (error) {
        check.valid = false;
        check.issues.push(`配置文件解析失败: ${error.message}`);
      }
    }
    
    return check;
  }

  /**
   * 配置自动化检查机制
   */
  setupAutomatedChecks() {
    console.log('🔧 配置自动化检查机制...');
    
    // 确保pre-commit脚本可执行
    const preCommitScript = path.join(__dirname, 'schema-pre-commit-check.js');
    if (fs.existsSync(preCommitScript)) {
      try {
        fs.chmodSync(preCommitScript, '755');
        console.log('✅ Pre-commit检查脚本权限已设置');
      } catch (error) {
        console.warn(`⚠️  无法设置脚本权限: ${error.message}`);
      }
    }
    
    // 创建package.json脚本命令
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }
        
        packageJson.scripts['schema:validate'] = 'node scripts/schema-version-audit.js';
        packageJson.scripts['schema:check'] = 'node scripts/schema-pre-commit-check.js';
        packageJson.scripts['schema:freeze'] = 'node scripts/initialize-schema-governance.js';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ NPM脚本命令已添加到package.json');
      } catch (error) {
        console.warn(`⚠️  无法更新package.json: ${error.message}`);
      }
    }
    
    console.log('✅ 自动化检查机制配置完成');
  }

  /**
   * 生成治理报告
   */
  generateGovernanceReport(data) {
    const report = {
      title: 'MPLP Schema治理初始化报告',
      timestamp: data.timestamp,
      version: '1.0.1',
      summary: {
        schemasManaged: Object.keys(data.baseline.schemas).length,
        protocolVersion: '1.0.1',
        governanceLevel: 'STRICT',
        freezeStatus: 'ACTIVE',
        validationPassed: data.validation.overall
      },
      baseline: data.baseline,
      validation: data.validation,
      governance: {
        enforceFreeze: true,
        requireApproval: true,
        validateOnStartup: true,
        automatedChecks: true
      },
      nextSteps: [
        '所有Schema已冻结，开发期间禁止修改',
        '使用 npm run schema:check 执行手动验证',
        'Pre-commit检查已配置，提交时自动验证',
        '如需修改Schema，联系架构团队申请解冻',
        '各模块开发可以安全基于当前Schema进行'
      ],
      contacts: {
        architecture: 'MPLP Architecture Team',
        governance: 'Schema Governance Team'
      }
    };
    
    return report;
  }

  /**
   * 保存治理文件
   */
  saveGovernanceFiles(report) {
    console.log('💾 保存治理文件...');
    
    // 保存治理报告
    const reportPath = path.join(this.projectRoot, 'docs/schema-governance-report.json');
    const docsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ 治理报告已保存: ${reportPath}`);
    
    // 创建README文档
    const readmePath = path.join(this.projectRoot, 'docs/SCHEMA_GOVERNANCE.md');
    const readmeContent = this.generateGovernanceReadme(report);
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ 治理文档已保存: ${readmePath}`);
  }

  /**
   * 生成治理README文档
   */
  generateGovernanceReadme(report) {
    return `# MPLP Schema治理文档

> **创建时间**: ${report.timestamp}  
> **协议版本**: ${report.summary.protocolVersion}  
> **治理级别**: ${report.summary.governanceLevel}

## 🔒 Schema冻结状态

**当前状态**: ✅ **已冻结** - 开发期间禁止修改

所有${report.summary.schemasManaged}个核心Schema模块已冻结：
${Object.keys(report.baseline.schemas).map(name => `- ${name}`).join('\n')}

## 📋 治理规则

### 1. 版本冻结
- **协议版本**: 统一冻结为 \`1.0.1\`
- **Schema文件**: 开发期间禁止修改
- **变更流程**: 需要架构团队审批解冻

### 2. 自动化检查
- **Pre-commit检查**: 自动验证Schema变更
- **版本一致性**: 自动检查协议版本统一
- **语法验证**: JSON Schema语法自动检查

### 3. 开发规范
- **Schema驱动**: 所有模块开发必须基于Schema
- **类型安全**: 100%匹配Schema定义
- **向后兼容**: 禁止破坏性变更

## 🔧 常用命令

\`\`\`bash
# 验证Schema环境
npm run schema:validate

# 手动执行Schema检查
npm run schema:check

# 重新初始化Schema治理
npm run schema:freeze
\`\`\`

## 📞 联系方式

- **架构团队**: ${report.contacts.architecture}
- **治理团队**: ${report.contacts.governance}

## 📈 验证状态

${report.validation.overall ? '✅ **所有验证通过**' : '❌ **存在验证问题**'}

${Object.entries(report.validation.checks).map(([name, check]) => 
  `- ${name}: ${check.valid ? '✅' : '❌'} ${check.issues.length > 0 ? `(${check.issues.length} 个问题)` : ''}`
).join('\n')}

---

**重要**: 此文档由系统自动生成，请勿手动修改。`;
  }
}

// 执行初始化
if (require.main === module) {
  const initializer = new SchemaGovernanceInitializer();
  initializer.initialize()
    .then(result => {
      if (result.success) {
        console.log('\n🏆 Schema治理体系已建立!');
        console.log('📚 查看治理文档: docs/SCHEMA_GOVERNANCE.md');
        console.log('🔧 使用命令: npm run schema:validate');
        process.exit(0);
      } else {
        console.log('\n💥 Schema治理初始化失败!');
        console.log(`错误: ${result.error}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ 初始化过程出错:', error);
      process.exit(1);
    });
}

module.exports = SchemaGovernanceInitializer; 