#!/usr/bin/env node

/**
 * MPLP 质量门禁检查脚本
 * 
 * 根据 docs/Development-Standards.md 中定义的标准进行检查
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 质量标准配置
const QUALITY_STANDARDS = {
  TEST_COVERAGE_THRESHOLD: 90,
  MAX_TYPESCRIPT_ERRORS: 0,
  MAX_LINT_ERRORS: 0,
  REQUIRED_FILES: [
    'docs/Development-Standards.md',
    'tsconfig.json',
    'jest.config.js',
    '.eslintrc.js'
  ]
};

class QualityGate {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = true;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addError(message) {
    this.errors.push(message);
    this.passed = false;
    this.log(message, 'error');
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  addSuccess(message) {
    this.log(message, 'success');
  }

  // 检查必需文件是否存在
  checkRequiredFiles() {
    this.log('检查必需文件...');
    
    for (const file of QUALITY_STANDARDS.REQUIRED_FILES) {
      if (!fs.existsSync(file)) {
        this.addError(`必需文件缺失: ${file}`);
      } else {
        this.addSuccess(`必需文件存在: ${file}`);
      }
    }
  }

  // 检查TypeScript编译
  checkTypeScript() {
    this.log('检查TypeScript编译...');
    
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.addSuccess('TypeScript编译通过');
    } catch (error) {
      this.addError(`TypeScript编译失败: ${error.message}`);
    }
  }

  // 检查ESLint
  checkLinting() {
    this.log('检查代码风格...');
    
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      this.addSuccess('ESLint检查通过');
    } catch (error) {
      this.addError(`ESLint检查失败: ${error.message}`);
    }
  }

  // 检查测试覆盖率
  checkTestCoverage() {
    this.log('检查测试覆盖率...');
    
    try {
      const result = execSync('npm run test:coverage -- --silent', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // 解析覆盖率报告
      const coverageMatch = result.match(/All files\s+\|\s+([\d.]+)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage >= QUALITY_STANDARDS.TEST_COVERAGE_THRESHOLD) {
          this.addSuccess(`测试覆盖率: ${coverage}% (>= ${QUALITY_STANDARDS.TEST_COVERAGE_THRESHOLD}%)`);
        } else {
          this.addError(`测试覆盖率不足: ${coverage}% (需要 >= ${QUALITY_STANDARDS.TEST_COVERAGE_THRESHOLD}%)`);
        }
      } else {
        this.addWarning('无法解析测试覆盖率报告');
      }
    } catch (error) {
      this.addError(`测试覆盖率检查失败: ${error.message}`);
    }
  }

  // 检查Schema文件
  checkSchemaFiles() {
    this.log('检查Schema文件...');
    
    const schemaFiles = [
      'src/protocols/core/mplp-context.json',
      'src/protocols/core/mplp-plan.json',
      'src/protocols/core/mplp-role.json',
      'src/protocols/core/mplp-confirm.json',
      'src/protocols/core/mplp-trace.json',
      'src/protocols/core/mplp-extension.json',
      'src/protocols/collab/mplp-collab.json',
      'src/protocols/collab/mplp-network.json',
      'src/protocols/collab/mplp-dialog.json'
    ];

    for (const schemaFile of schemaFiles) {
      if (!fs.existsSync(schemaFile)) {
        this.addError(`Schema文件缺失: ${schemaFile}`);
        continue;
      }

      try {
        const content = fs.readFileSync(schemaFile, 'utf8');
        const schema = JSON.parse(content);
        
        // 检查是否包含非标准字段
        if (schema.version) {
          this.addError(`Schema文件包含非标准字段 'version': ${schemaFile}`);
        }
        
        // 检查必需字段
        if (!schema.$schema || !schema.$id || !schema.title) {
          this.addError(`Schema文件缺少必需字段: ${schemaFile}`);
        } else {
          this.addSuccess(`Schema文件格式正确: ${schemaFile}`);
        }
      } catch (error) {
        this.addError(`Schema文件格式错误 ${schemaFile}: ${error.message}`);
      }
    }
  }

  // 检查开发标准文档
  checkDevelopmentStandards() {
    this.log('检查开发标准文档...');
    
    const standardsFile = 'docs/Development-Standards.md';
    if (!fs.existsSync(standardsFile)) {
      this.addError('开发标准文档缺失: docs/Development-Standards.md');
      return;
    }

    const content = fs.readFileSync(standardsFile, 'utf8');
    
    // 检查关键章节
    const requiredSections = [
      '核心原则',
      '技术标准',
      'Schema驱动开发',
      'TypeScript严格模式',
      '质量门禁',
      '严格禁止的做法'
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        this.addError(`开发标准文档缺少章节: ${section}`);
      } else {
        this.addSuccess(`开发标准文档包含章节: ${section}`);
      }
    }
  }

  // 运行所有检查
  async runAll() {
    this.log('🚀 开始质量门禁检查...');
    this.log('📋 基于 docs/Development-Standards.md 标准');
    
    this.checkRequiredFiles();
    this.checkDevelopmentStandards();
    this.checkTypeScript();
    this.checkLinting();
    this.checkTestCoverage();
    this.checkSchemaFiles();
    
    // 输出结果
    this.log('\n📊 质量门禁检查结果:');
    this.log(`✅ 成功检查项: ${this.getSuccessCount()}`);
    this.log(`⚠️  警告: ${this.warnings.length}`);
    this.log(`❌ 错误: ${this.errors.length}`);
    
    if (this.warnings.length > 0) {
      this.log('\n⚠️  警告详情:');
      this.warnings.forEach(warning => this.log(`   ${warning}`));
    }
    
    if (this.errors.length > 0) {
      this.log('\n❌ 错误详情:');
      this.errors.forEach(error => this.log(`   ${error}`));
    }
    
    if (this.passed) {
      this.log('\n🎉 质量门禁检查通过！');
      process.exit(0);
    } else {
      this.log('\n💥 质量门禁检查失败！');
      this.log('请修复所有错误后重新运行检查。');
      process.exit(1);
    }
  }

  getSuccessCount() {
    // 计算成功的检查项数量
    const totalChecks = QUALITY_STANDARDS.REQUIRED_FILES.length + 10; // 估算
    return totalChecks - this.errors.length;
  }
}

// 运行质量门禁检查
if (require.main === module) {
  const gate = new QualityGate();
  gate.runAll().catch(error => {
    console.error('❌ 质量门禁检查异常:', error);
    process.exit(1);
  });
}

module.exports = QualityGate;
