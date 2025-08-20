#!/usr/bin/env node

/**
 * 统一验证执行器 - 基于validation-config.json的强制质量约束
 * 功能：执行TDD+BDD重构过程中的所有质量约束检查
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UnifiedValidator {
  constructor() {
    this.config = this.loadConfig();
    this.violations = [];
    this.warnings = [];
    this.executionLog = [];
  }

  /**
   * 加载验证配置
   */
  loadConfig() {
    const configPath = path.join(__dirname, 'validation-config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('验证配置文件不存在: validation-config.json');
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * 执行TDD重构前检查
   */
  async executeTDDPreChecks(moduleName) {
    console.log(`🔍 执行TDD重构前检查: ${moduleName}模块`);
    
    const checks = this.config.tdd_constraints.pre_refactor_checks;
    return await this.executeChecks(checks, moduleName, 'TDD重构前检查');
  }

  /**
   * 执行TDD阶段验证
   */
  async executeTDDStageValidation(stage, moduleName) {
    console.log(`🔍 执行TDD阶段${stage}验证: ${moduleName}模块`);
    
    const stageKey = `stage${stage}_${this.getStageKey(stage)}`;
    const checks = this.config.tdd_constraints.stage_validations[stageKey];
    
    if (!checks) {
      throw new Error(`未找到TDD阶段${stage}的验证配置`);
    }
    
    return await this.executeChecks(checks, moduleName, `TDD阶段${stage}验证`);
  }

  /**
   * 执行TDD完成后检查
   */
  async executeTDDPostChecks(moduleName) {
    console.log(`🔍 执行TDD完成后检查: ${moduleName}模块`);
    
    const checks = this.config.tdd_constraints.post_tdd_checks;
    return await this.executeChecks(checks, moduleName, 'TDD完成后检查');
  }

  /**
   * 执行BDD重构前检查
   */
  async executeBDDPreChecks(moduleName) {
    console.log(`🔍 执行BDD重构前检查: ${moduleName}模块`);
    
    const checks = this.config.bdd_constraints.pre_bdd_checks;
    return await this.executeChecks(checks, moduleName, 'BDD重构前检查');
  }

  /**
   * 执行BDD场景验证
   */
  async executeBDDScenarioValidation(scenarioType, moduleName) {
    console.log(`🔍 执行BDD场景验证: ${scenarioType} - ${moduleName}模块`);
    
    const checks = this.config.bdd_constraints.scenario_validations[scenarioType];
    
    if (!checks) {
      throw new Error(`未找到BDD场景${scenarioType}的验证配置`);
    }
    
    return await this.executeChecks(checks, moduleName, `BDD场景验证: ${scenarioType}`);
  }

  /**
   * 执行BDD完成后检查
   */
  async executeBDDPostChecks(moduleName) {
    console.log(`🔍 执行BDD完成后检查: ${moduleName}模块`);
    
    const checks = this.config.bdd_constraints.post_bdd_checks;
    return await this.executeChecks(checks, moduleName, 'BDD完成后检查');
  }

  /**
   * 执行检查列表
   */
  async executeChecks(checks, moduleName, checkType) {
    let allPassed = true;
    const results = [];

    for (const check of checks) {
      const result = await this.executeCheck(check, moduleName);
      results.push(result);
      
      if (!result.success) {
        allPassed = false;
        
        // 根据强制级别处理失败
        if (check.enforcement === 'zero_tolerance') {
          console.error(`❌ 零容忍检查失败: ${check.name}`);
          throw new Error(`零容忍检查失败，流程被阻断: ${check.name}`);
        } else if (check.enforcement === 'mandatory') {
          this.violations.push(`${checkType}: ${check.name} - ${result.error}`);
        } else if (check.enforcement === 'advisory') {
          this.warnings.push(`${checkType}: ${check.name} - ${result.error}`);
        }
      }
    }

    // 输出检查结果
    this.outputCheckResults(checkType, results);
    
    return allPassed;
  }

  /**
   * 执行单个检查
   */
  async executeCheck(check, moduleName) {
    const startTime = Date.now();
    const command = check.command.replace(/{module}/g, moduleName);
    
    console.log(`  🔍 ${check.name}...`);
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        timeout: (check.timeout || 300) * 1000,
        stdio: 'pipe'
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`  ✅ ${check.name} 通过 (${duration}ms)`);
      
      this.executionLog.push({
        check: check.name,
        command: command,
        status: 'success',
        duration: duration,
        output: output.substring(0, 500) // 限制输出长度
      });
      
      return { success: true, duration: duration };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error(`  ❌ ${check.name} 失败 (${duration}ms)`);
      console.error(`     错误: ${error.message}`);
      
      this.executionLog.push({
        check: check.name,
        command: command,
        status: 'failed',
        duration: duration,
        error: error.message,
        output: error.stdout ? error.stdout.substring(0, 500) : ''
      });
      
      return { success: false, duration: duration, error: error.message };
    }
  }

  /**
   * 输出检查结果
   */
  outputCheckResults(checkType, results) {
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`\n📊 ${checkType}结果:`);
    console.log(`  通过: ${passed}/${total}`);
    console.log(`  总耗时: ${totalTime}ms`);
    
    if (passed === total) {
      console.log(`  ✅ ${checkType}全部通过\n`);
    } else {
      console.log(`  ❌ ${checkType}存在失败项\n`);
    }
  }

  /**
   * 生成验证报告
   */
  generateValidationReport(moduleName, validationType) {
    const report = {
      module: moduleName,
      validation_type: validationType,
      timestamp: new Date().toISOString(),
      config_version: this.config.validation_config.version,
      execution_log: this.executionLog,
      violations: this.violations,
      warnings: this.warnings,
      summary: {
        total_checks: this.executionLog.length,
        passed_checks: this.executionLog.filter(log => log.status === 'success').length,
        failed_checks: this.executionLog.filter(log => log.status === 'failed').length,
        total_duration: this.executionLog.reduce((sum, log) => sum + log.duration, 0),
        quality_score: this.calculateQualityScore()
      }
    };

    const reportFile = `validation-report-${moduleName}-${validationType}-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📄 验证报告已生成: ${reportFile}`);
    
    return report;
  }

  /**
   * 计算质量评分
   */
  calculateQualityScore() {
    const totalChecks = this.executionLog.length;
    const passedChecks = this.executionLog.filter(log => log.status === 'success').length;
    const violationPenalty = this.violations.length * 10;
    const warningPenalty = this.warnings.length * 5;
    
    const baseScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
    const finalScore = Math.max(0, baseScore - violationPenalty - warningPenalty);
    
    return Math.round(finalScore);
  }

  /**
   * 获取阶段键名
   */
  getStageKey(stage) {
    const stageKeys = {
      1: 'schema_mapping',
      2: 'dto_layer', 
      3: 'repository_layer',
      4: 'business_logic'
    };
    return stageKeys[stage] || 'unknown';
  }

  /**
   * 输出最终结果
   */
  outputFinalResults() {
    console.log('\n========================================');
    console.log('📊 验证结果汇总');
    console.log('========================================');
    
    const qualityScore = this.calculateQualityScore();
    
    console.log(`质量评分: ${qualityScore}/100`);
    console.log(`违规数量: ${this.violations.length}`);
    console.log(`警告数量: ${this.warnings.length}`);
    
    if (this.violations.length > 0) {
      console.log('\n❌ 发现的违规:');
      this.violations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 发现的警告:');
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    if (this.violations.length === 0) {
      console.log('\n🎉 所有强制性验证通过！');
      return true;
    } else {
      console.log('\n💥 验证失败，请修复所有违规后重试');
      return false;
    }
  }
}

// 命令行使用
if (require.main === module) {
  const validator = new UnifiedValidator();
  const command = process.argv[2];
  const moduleName = process.argv[3];
  const stage = process.argv[4];
  
  if (!command || !moduleName) {
    console.error('用法: node unified-validator.js <command> <module-name> [stage/scenario]');
    console.error('命令:');
    console.error('  tdd-pre-check <module>');
    console.error('  tdd-stage <module> <1-4>');
    console.error('  tdd-post-check <module>');
    console.error('  bdd-pre-check <module>');
    console.error('  bdd-scenario <module> <scenario-type>');
    console.error('  bdd-post-check <module>');
    process.exit(1);
  }
  
  const commands = {
    'tdd-pre-check': () => validator.executeTDDPreChecks(moduleName),
    'tdd-stage': () => validator.executeTDDStageValidation(parseInt(stage), moduleName),
    'tdd-post-check': () => validator.executeTDDPostChecks(moduleName),
    'bdd-pre-check': () => validator.executeBDDPreChecks(moduleName),
    'bdd-scenario': () => validator.executeBDDScenarioValidation(stage, moduleName),
    'bdd-post-check': () => validator.executeBDDPostChecks(moduleName)
  };
  
  if (commands[command]) {
    commands[command]()
      .then(() => {
        const report = validator.generateValidationReport(moduleName, command);
        const success = validator.outputFinalResults();
        process.exit(success ? 0 : 1);
      })
      .catch(error => {
        console.error('验证执行失败:', error.message);
        validator.generateValidationReport(moduleName, command);
        validator.outputFinalResults();
        process.exit(1);
      });
  } else {
    console.error('未知命令:', command);
    process.exit(1);
  }
}

module.exports = UnifiedValidator;
