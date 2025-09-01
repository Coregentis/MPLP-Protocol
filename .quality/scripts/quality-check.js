#!/usr/bin/env node

/**
 * MPLP质量检查脚本
 * 基于GLFB方法论的自动化质量监控
 * 
 * @version 1.0.0
 * @date 2025-08-20
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 质量检查配置
const QUALITY_CONFIG = {
  // TypeScript编译检查
  typescript: {
    enabled: true,
    command: 'npx tsc --noEmit',
    errorThreshold: 0,
    warningThreshold: 0
  },
  
  // ESLint代码质量检查
  eslint: {
    enabled: true,
    command: 'npx eslint src/ --format json',
    errorThreshold: 0,
    warningThreshold: 0
  },
  
  // 测试覆盖率检查
  testCoverage: {
    enabled: true,
    command: 'npm run test:coverage',
    functionalThreshold: 90,
    unitThreshold: 90,
    branchThreshold: 85,
    statementThreshold: 95
  },
  
  // Schema映射一致性检查
  schemaMapping: {
    enabled: true,
    command: 'npm run validate:mapping',
    consistencyThreshold: 100
  },
  
  // 命名约定检查
  namingConvention: {
    enabled: true,
    command: 'npm run check:naming',
    complianceThreshold: 100
  },
  
  // 文档同步检查
  documentSync: {
    enabled: true,
    syncThreshold: 100
  }
};

// 质量指标
class QualityMetrics {
  constructor() {
    this.metrics = {
      typescript: { errors: 0, warnings: 0, passed: false },
      eslint: { errors: 0, warnings: 0, passed: false },
      testCoverage: { functional: 0, unit: 0, branch: 0, statement: 0, passed: false },
      schemaMapping: { consistency: 0, passed: false },
      namingConvention: { compliance: 0, passed: false },
      documentSync: { syncRate: 0, passed: false },
      overall: { score: 0, passed: false }
    };
  }

  // 执行TypeScript检查
  async checkTypeScript() {
    if (!QUALITY_CONFIG.typescript.enabled) return;
    
    console.log('🔍 检查TypeScript编译...');
    try {
      execSync(QUALITY_CONFIG.typescript.command, { stdio: 'pipe' });
      this.metrics.typescript.errors = 0;
      this.metrics.typescript.warnings = 0;
      this.metrics.typescript.passed = true;
      console.log('✅ TypeScript编译检查通过');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errors = (output.match(/error TS/g) || []).length;
      const warnings = (output.match(/warning TS/g) || []).length;
      
      this.metrics.typescript.errors = errors;
      this.metrics.typescript.warnings = warnings;
      this.metrics.typescript.passed = errors === 0 && warnings === 0;
      
      if (!this.metrics.typescript.passed) {
        console.log(`❌ TypeScript检查失败: ${errors}个错误, ${warnings}个警告`);
        console.log(output);
      }
    }
  }

  // 执行ESLint检查
  async checkESLint() {
    if (!QUALITY_CONFIG.eslint.enabled) return;
    
    console.log('🔍 检查ESLint代码质量...');
    try {
      const output = execSync(QUALITY_CONFIG.eslint.command, { stdio: 'pipe' }).toString();
      const results = JSON.parse(output);
      
      let totalErrors = 0;
      let totalWarnings = 0;
      
      results.forEach(file => {
        totalErrors += file.errorCount;
        totalWarnings += file.warningCount;
      });
      
      this.metrics.eslint.errors = totalErrors;
      this.metrics.eslint.warnings = totalWarnings;
      this.metrics.eslint.passed = totalErrors === 0 && totalWarnings === 0;
      
      if (this.metrics.eslint.passed) {
        console.log('✅ ESLint检查通过');
      } else {
        console.log(`❌ ESLint检查失败: ${totalErrors}个错误, ${totalWarnings}个警告`);
      }
    } catch (error) {
      console.log('❌ ESLint检查执行失败');
      this.metrics.eslint.passed = false;
    }
  }

  // 执行测试覆盖率检查
  async checkTestCoverage() {
    if (!QUALITY_CONFIG.testCoverage.enabled) return;
    
    console.log('🔍 检查测试覆盖率...');
    try {
      const output = execSync(QUALITY_CONFIG.testCoverage.command, { stdio: 'pipe' }).toString();
      
      // 解析覆盖率报告
      const functionalMatch = output.match(/Functional coverage:\s*(\d+\.?\d*)%/);
      const unitMatch = output.match(/Unit coverage:\s*(\d+\.?\d*)%/);
      const branchMatch = output.match(/Branch coverage:\s*(\d+\.?\d*)%/);
      const statementMatch = output.match(/Statement coverage:\s*(\d+\.?\d*)%/);
      
      this.metrics.testCoverage.functional = functionalMatch ? parseFloat(functionalMatch[1]) : 0;
      this.metrics.testCoverage.unit = unitMatch ? parseFloat(unitMatch[1]) : 0;
      this.metrics.testCoverage.branch = branchMatch ? parseFloat(branchMatch[1]) : 0;
      this.metrics.testCoverage.statement = statementMatch ? parseFloat(statementMatch[1]) : 0;
      
      const functionalPassed = this.metrics.testCoverage.functional >= QUALITY_CONFIG.testCoverage.functionalThreshold;
      const unitPassed = this.metrics.testCoverage.unit >= QUALITY_CONFIG.testCoverage.unitThreshold;
      const branchPassed = this.metrics.testCoverage.branch >= QUALITY_CONFIG.testCoverage.branchThreshold;
      const statementPassed = this.metrics.testCoverage.statement >= QUALITY_CONFIG.testCoverage.statementThreshold;
      
      this.metrics.testCoverage.passed = functionalPassed && unitPassed && branchPassed && statementPassed;
      
      if (this.metrics.testCoverage.passed) {
        console.log('✅ 测试覆盖率检查通过');
      } else {
        console.log('❌ 测试覆盖率检查失败:');
        if (!functionalPassed) console.log(`  功能测试覆盖率: ${this.metrics.testCoverage.functional}% (要求: ${QUALITY_CONFIG.testCoverage.functionalThreshold}%)`);
        if (!unitPassed) console.log(`  单元测试覆盖率: ${this.metrics.testCoverage.unit}% (要求: ${QUALITY_CONFIG.testCoverage.unitThreshold}%)`);
        if (!branchPassed) console.log(`  分支覆盖率: ${this.metrics.testCoverage.branch}% (要求: ${QUALITY_CONFIG.testCoverage.branchThreshold}%)`);
        if (!statementPassed) console.log(`  语句覆盖率: ${this.metrics.testCoverage.statement}% (要求: ${QUALITY_CONFIG.testCoverage.statementThreshold}%)`);
      }
    } catch (error) {
      console.log('❌ 测试覆盖率检查执行失败');
      this.metrics.testCoverage.passed = false;
    }
  }

  // 执行Schema映射检查
  async checkSchemaMapping() {
    if (!QUALITY_CONFIG.schemaMapping.enabled) return;
    
    console.log('🔍 检查Schema映射一致性...');
    try {
      const output = execSync(QUALITY_CONFIG.schemaMapping.command, { stdio: 'pipe' }).toString();
      
      const consistencyMatch = output.match(/Mapping consistency:\s*(\d+\.?\d*)%/);
      this.metrics.schemaMapping.consistency = consistencyMatch ? parseFloat(consistencyMatch[1]) : 0;
      this.metrics.schemaMapping.passed = this.metrics.schemaMapping.consistency >= QUALITY_CONFIG.schemaMapping.consistencyThreshold;
      
      if (this.metrics.schemaMapping.passed) {
        console.log('✅ Schema映射一致性检查通过');
      } else {
        console.log(`❌ Schema映射一致性检查失败: ${this.metrics.schemaMapping.consistency}% (要求: ${QUALITY_CONFIG.schemaMapping.consistencyThreshold}%)`);
      }
    } catch (error) {
      console.log('❌ Schema映射检查执行失败');
      this.metrics.schemaMapping.passed = false;
    }
  }

  // 执行命名约定检查
  async checkNamingConvention() {
    if (!QUALITY_CONFIG.namingConvention.enabled) return;
    
    console.log('🔍 检查命名约定合规性...');
    try {
      const output = execSync(QUALITY_CONFIG.namingConvention.command, { stdio: 'pipe' }).toString();
      
      const complianceMatch = output.match(/Naming compliance:\s*(\d+\.?\d*)%/);
      this.metrics.namingConvention.compliance = complianceMatch ? parseFloat(complianceMatch[1]) : 0;
      this.metrics.namingConvention.passed = this.metrics.namingConvention.compliance >= QUALITY_CONFIG.namingConvention.complianceThreshold;
      
      if (this.metrics.namingConvention.passed) {
        console.log('✅ 命名约定检查通过');
      } else {
        console.log(`❌ 命名约定检查失败: ${this.metrics.namingConvention.compliance}% (要求: ${QUALITY_CONFIG.namingConvention.complianceThreshold}%)`);
      }
    } catch (error) {
      console.log('❌ 命名约定检查执行失败');
      this.metrics.namingConvention.passed = false;
    }
  }

  // 执行文档同步检查
  async checkDocumentSync() {
    if (!QUALITY_CONFIG.documentSync.enabled) return;
    
    console.log('🔍 检查文档同步状态...');
    
    // 简化的文档同步检查逻辑
    // 实际实现中应该检查代码与文档的同步状态
    const srcFiles = this.getFileCount('src/', ['.ts', '.js']);
    const docFiles = this.getFileCount('docs/', ['.md']);
    
    // 简单的同步率计算（实际应该更复杂）
    const syncRate = Math.min(100, (docFiles / srcFiles) * 100);
    
    this.metrics.documentSync.syncRate = syncRate;
    this.metrics.documentSync.passed = syncRate >= QUALITY_CONFIG.documentSync.syncThreshold;
    
    if (this.metrics.documentSync.passed) {
      console.log('✅ 文档同步检查通过');
    } else {
      console.log(`❌ 文档同步检查失败: ${syncRate.toFixed(1)}% (要求: ${QUALITY_CONFIG.documentSync.syncThreshold}%)`);
    }
  }

  // 计算总体质量分数
  calculateOverallScore() {
    const weights = {
      typescript: 20,
      eslint: 20,
      testCoverage: 25,
      schemaMapping: 15,
      namingConvention: 10,
      documentSync: 10
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.keys(weights).forEach(key => {
      if (QUALITY_CONFIG[key]?.enabled) {
        totalScore += this.metrics[key].passed ? weights[key] : 0;
        totalWeight += weights[key];
      }
    });
    
    this.metrics.overall.score = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
    this.metrics.overall.passed = this.metrics.overall.score >= 90; // 90%为通过标准
  }

  // 生成质量报告
  generateReport() {
    console.log('\n📊 质量检查报告');
    console.log('='.repeat(50));
    
    console.log(`TypeScript编译: ${this.metrics.typescript.passed ? '✅' : '❌'} (${this.metrics.typescript.errors}错误, ${this.metrics.typescript.warnings}警告)`);
    console.log(`ESLint检查: ${this.metrics.eslint.passed ? '✅' : '❌'} (${this.metrics.eslint.errors}错误, ${this.metrics.eslint.warnings}警告)`);
    console.log(`测试覆盖率: ${this.metrics.testCoverage.passed ? '✅' : '❌'} (功能:${this.metrics.testCoverage.functional}%, 单元:${this.metrics.testCoverage.unit}%)`);
    console.log(`Schema映射: ${this.metrics.schemaMapping.passed ? '✅' : '❌'} (一致性:${this.metrics.schemaMapping.consistency}%)`);
    console.log(`命名约定: ${this.metrics.namingConvention.passed ? '✅' : '❌'} (合规性:${this.metrics.namingConvention.compliance}%)`);
    console.log(`文档同步: ${this.metrics.documentSync.passed ? '✅' : '❌'} (同步率:${this.metrics.documentSync.syncRate.toFixed(1)}%)`);
    
    console.log('='.repeat(50));
    console.log(`总体质量分数: ${this.metrics.overall.score.toFixed(1)}% ${this.metrics.overall.passed ? '✅ 通过' : '❌ 不通过'}`);
    
    return this.metrics.overall.passed;
  }

  // 保存质量报告
  saveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      config: QUALITY_CONFIG
    };
    
    const reportDir = '.quality/reports';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportFile = path.join(reportDir, `quality-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
    
    console.log(`\n📄 质量报告已保存: ${reportFile}`);
  }

  // 辅助方法：获取文件数量
  getFileCount(dir, extensions) {
    if (!fs.existsSync(dir)) return 0;
    
    let count = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isDirectory()) {
        count += this.getFileCount(path.join(dir, file.name), extensions);
      } else if (extensions.some(ext => file.name.endsWith(ext))) {
        count++;
      }
    });
    
    return count;
  }
}

// 主执行函数
async function main() {
  console.log('🚀 开始MPLP质量检查...\n');
  
  const metrics = new QualityMetrics();
  
  try {
    await metrics.checkTypeScript();
    await metrics.checkESLint();
    await metrics.checkTestCoverage();
    await metrics.checkSchemaMapping();
    await metrics.checkNamingConvention();
    await metrics.checkDocumentSync();
    
    metrics.calculateOverallScore();
    const passed = metrics.generateReport();
    metrics.saveReport();
    
    if (passed) {
      console.log('\n🎉 质量检查全部通过！');
      process.exit(0);
    } else {
      console.log('\n⚠️  质量检查未通过，请修复问题后重试。');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ 质量检查执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { QualityMetrics, QUALITY_CONFIG };
