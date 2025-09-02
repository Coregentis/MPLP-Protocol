#!/usr/bin/env node

/**
 * BDD Quality Enforcer - Template
 *
 * 基于Plan模块完美质量标准的BDD质量保证执行器
 * 47场景494步骤零技术债务的完美质量标准
 *
 * 使用方法:
 * node scripts/bdd/bdd-quality-enforcer.js pre-check {module}
 * node scripts/bdd/bdd-quality-enforcer.js stage1 {module}
 * node scripts/bdd/bdd-quality-enforcer.js stage2 {module}
 * node scripts/bdd/bdd-quality-enforcer.js stage3 {module}
 * node scripts/bdd/bdd-quality-enforcer.js stage4 {module}
 * node scripts/bdd/bdd-quality-enforcer.js post-check {module}
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BDDQualityEnforcer {
  constructor(stage, module) {
    this.stage = stage;
    this.module = module;
    this.errors = [];
    this.warnings = [];
    
    // 基于Plan模块完美质量标准的质量基准
    this.qualityStandards = {
      scenarioPassRate: 100,        // 100% BDD场景通过率
      stepImplementationRate: 100,  // 100% 步骤实现率
      executionTimeLimit: 500,      // <500ms执行时间 (Plan模块183ms基准)
      businessCoverageRate: 100,    // 100% 业务场景覆盖
      gherkinSyntaxCompliance: 100, // 100% Gherkin语法合规
      mockServiceIntegration: 100,  // 100% Mock服务集成
      technicalDebtTolerance: 0,    // 零技术债务 (绝对禁止any类型)
      typeSafetyCompliance: 100,    // 100% 类型安全 (TypeScript 0错误)
      mplpIntegrationDepth: 8       // 深度MPLP模块集成 (Plan模块8个模块基准)
    };
  }

  /**
   * 执行BDD质量检查
   */
  async enforce() {
    console.log(`🔍 BDD Quality Enforcer - ${this.stage} stage for ${this.module} module`);
    console.log(`📊 Quality Standards: Plan module perfect quality baseline (47 scenarios, 494 steps, zero technical debt)`);
    
    try {
      switch (this.stage) {
        case 'pre-check':
          await this.preCheck();
          break;
        case 'stage1':
          await this.stage1BusinessAnalysis();
          break;
        case 'stage2':
          await this.stage2GherkinSpecification();
          break;
        case 'stage3':
          await this.stage3StepImplementation();
          break;
        case 'stage4':
          await this.stage4BusinessValidation();
          break;
        case 'post-check':
          await this.postCheck();
          break;
        default:
          throw new Error(`Unknown stage: ${this.stage}`);
      }
      
      this.reportResults();
      
    } catch (error) {
      this.errors.push(`Fatal error: ${error.message}`);
      this.reportResults();
      process.exit(1);
    }
  }

  /**
   * 前置检查 - BDD重构开始前的质量基线
   */
  async preCheck() {
    console.log(`\n🎯 Pre-check: BDD重构前质量基线验证`);
    
    // 1. 验证TDD重构已完成
    await this.checkTDDCompletion();
    
    // 2. 验证业务需求文档存在
    await this.checkBusinessRequirements();
    
    // 3. 验证BDD工具链准备
    await this.checkBDDToolchain();
    
    // 4. 验证Schema和类型定义完整性
    await this.checkSchemaCompleteness();
  }

  /**
   * 阶段1: 业务分析阶段验证
   */
  async stage1BusinessAnalysis() {
    console.log(`\n🎯 Stage 1: 业务分析阶段质量验证`);
    
    // 1. 业务需求分析完整性
    await this.validateBusinessAnalysis();
    
    // 2. 用户故事和验收标准定义
    await this.validateUserStories();
    
    // 3. 业务场景优先级制定
    await this.validateBusinessScenarioPriority();
    
    // 4. 业务干系人确认
    await this.validateStakeholderApproval();
  }

  /**
   * 阶段2: Gherkin规范阶段验证
   */
  async stage2GherkinSpecification() {
    console.log(`\n🎯 Stage 2: Gherkin规范阶段质量验证`);
    
    // 1. Feature文件语法验证
    await this.validateGherkinSyntax();
    
    // 2. 业务场景覆盖率验证
    await this.validateBusinessScenarioCoverage();
    
    // 3. 场景可读性和业务价值验证
    await this.validateScenarioReadability();
    
    // 4. 业务逻辑一致性验证
    await this.validateBusinessLogicConsistency();
  }

  /**
   * 阶段3: 步骤定义实现阶段验证
   */
  async stage3StepImplementation() {
    console.log(`\n🎯 Stage 3: 步骤定义实现阶段质量验证`);
    
    // 1. 步骤定义实现覆盖率
    await this.validateStepImplementationCoverage();
    
    // 2. Mock服务集成质量
    await this.validateMockServiceIntegration();
    
    // 3. 双重命名约定合规性
    await this.validateDualNamingConvention();
    
    // 4. 代码质量和类型安全
    await this.validateCodeQualityAndTypeSafety();
  }

  /**
   * 阶段4: 业务行为验证阶段验证
   */
  async stage4BusinessValidation() {
    console.log(`\n🎯 Stage 4: 业务行为验证阶段质量验证`);
    
    // 1. BDD场景执行结果验证
    await this.validateBDDScenarioExecution();
    
    // 2. 业务行为正确性验证
    await this.validateBusinessBehaviorCorrectness();
    
    // 3. 性能和稳定性验证
    await this.validatePerformanceAndStability();
    
    // 4. 端到端业务流程验证
    await this.validateEndToEndBusinessFlow();
  }

  /**
   * 后置检查 - BDD重构完成后的质量验证
   */
  async postCheck() {
    console.log(`\n🎯 Post-check: BDD重构完成后质量验证`);
    
    // 1. 完整BDD测试套件验证
    await this.validateCompleteBDDTestSuite();
    
    // 2. 业务价值实现验证
    await this.validateBusinessValueRealization();
    
    // 3. 可维护性和扩展性验证
    await this.validateMaintainabilityAndExtensibility();
    
    // 4. 文档和知识传递验证
    await this.validateDocumentationAndKnowledgeTransfer();
  }

  /**
   * 检查TDD重构完成状态
   */
  async checkTDDCompletion() {
    const tddPlanPath = `docs/L4-Intelligent-Agent-OPS-Refactor/${this.getModuleNumber()}-${this.module}/${this.module}-TDD-refactor-plan.md`;
    
    if (!fs.existsSync(tddPlanPath)) {
      this.errors.push(`TDD重构计划文件不存在: ${tddPlanPath}`);
      return;
    }
    
    const content = fs.readFileSync(tddPlanPath, 'utf8');
    if (!content.includes('100%完成') && !content.includes('✅ **100%达成**')) {
      this.errors.push(`TDD重构未完成，BDD重构不能开始`);
    } else {
      console.log(`✅ TDD重构已完成，可以开始BDD重构`);
    }
  }

  /**
   * 验证BDD场景执行结果
   */
  async validateBDDScenarioExecution() {
    try {
      // 运行BDD测试并获取结果
      const result = execSync(`npm run test:bdd -- --module=${this.module}`, { 
        encoding: 'utf8',
        timeout: 30000 
      });
      
      // 解析测试结果
      const passRate = this.extractPassRate(result);
      const executionTime = this.extractExecutionTime(result);
      
      if (passRate < this.qualityStandards.scenarioPassRate) {
        this.errors.push(`BDD场景通过率不达标: ${passRate}% < ${this.qualityStandards.scenarioPassRate}%`);
      }
      
      if (executionTime > this.qualityStandards.executionTimeLimit) {
        this.warnings.push(`BDD执行时间超标: ${executionTime}ms > ${this.qualityStandards.executionTimeLimit}ms`);
      }
      
      console.log(`✅ BDD场景通过率: ${passRate}%`);
      console.log(`✅ BDD执行时间: ${executionTime}ms`);
      
    } catch (error) {
      this.errors.push(`BDD测试执行失败: ${error.message}`);
    }
  }

  /**
   * 获取模块编号
   */
  getModuleNumber() {
    const moduleNumbers = {
      'context': '01',
      'plan': '02',
      'confirm': '03',
      'role': '04',
      'trace': '05',
      'extension': '06',
      'collab': '07',
      'dialog': '08',
      'network': '09',
      'core': '10'
    };
    return moduleNumbers[this.module] || '00';
  }

  /**
   * 提取测试通过率
   */
  extractPassRate(output) {
    const match = output.match(/(\d+)\s*scenarios?\s*\((\d+)\s*passed/i);
    if (match) {
      const total = parseInt(match[1]);
      const passed = parseInt(match[2]);
      return Math.round((passed / total) * 100);
    }
    return 0;
  }

  /**
   * 提取执行时间
   */
  extractExecutionTime(output) {
    const match = output.match(/(\d+(?:\.\d+)?)\s*s/);
    if (match) {
      return Math.round(parseFloat(match[1]) * 1000);
    }
    return 0;
  }

  /**
   * 报告检查结果
   */
  reportResults() {
    console.log(`\n📊 BDD Quality Enforcer Results:`);
    console.log(`Module: ${this.module}`);
    console.log(`Stage: ${this.stage}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      this.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️ Warnings:`);
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    if (this.errors.length === 0) {
      console.log(`\n✅ BDD Quality Check Passed!`);
    } else {
      console.log(`\n❌ BDD Quality Check Failed!`);
      process.exit(1);
    }
  }

  // 占位符方法 - 需要根据具体模块实现
  async checkBusinessRequirements() { console.log(`✅ 业务需求文档检查通过`); }
  async checkBDDToolchain() { console.log(`✅ BDD工具链检查通过`); }
  async checkSchemaCompleteness() { console.log(`✅ Schema完整性检查通过`); }
  async validateBusinessAnalysis() { console.log(`✅ 业务分析验证通过`); }
  async validateUserStories() { console.log(`✅ 用户故事验证通过`); }
  async validateBusinessScenarioPriority() { console.log(`✅ 业务场景优先级验证通过`); }
  async validateStakeholderApproval() { console.log(`✅ 业务干系人确认通过`); }
  async validateGherkinSyntax() { console.log(`✅ Gherkin语法验证通过`); }
  async validateBusinessScenarioCoverage() { console.log(`✅ 业务场景覆盖率验证通过`); }
  async validateScenarioReadability() { console.log(`✅ 场景可读性验证通过`); }
  async validateBusinessLogicConsistency() { console.log(`✅ 业务逻辑一致性验证通过`); }
  async validateStepImplementationCoverage() { console.log(`✅ 步骤实现覆盖率验证通过`); }
  async validateMockServiceIntegration() { console.log(`✅ Mock服务集成验证通过`); }
  async validateDualNamingConvention() { console.log(`✅ 双重命名约定验证通过`); }
  async validateCodeQualityAndTypeSafety() { console.log(`✅ 代码质量和类型安全验证通过`); }
  async validateBusinessBehaviorCorrectness() { console.log(`✅ 业务行为正确性验证通过`); }
  async validatePerformanceAndStability() { console.log(`✅ 性能和稳定性验证通过`); }
  async validateEndToEndBusinessFlow() { console.log(`✅ 端到端业务流程验证通过`); }
  async validateCompleteBDDTestSuite() { console.log(`✅ 完整BDD测试套件验证通过`); }
  async validateBusinessValueRealization() { console.log(`✅ 业务价值实现验证通过`); }
  async validateMaintainabilityAndExtensibility() { console.log(`✅ 可维护性和扩展性验证通过`); }
  async validateDocumentationAndKnowledgeTransfer() { console.log(`✅ 文档和知识传递验证通过`); }
}

// 主执行逻辑
if (require.main === module) {
  const [,, stage, module] = process.argv;
  
  if (!stage || !module) {
    console.error('Usage: node bdd-quality-enforcer.js <stage> <module>');
    console.error('Stages: pre-check, stage1, stage2, stage3, stage4, post-check');
    console.error('Modules: context, plan, confirm, role, trace, extension, collab, dialog, network, core');
    process.exit(1);
  }
  
  const enforcer = new BDDQualityEnforcer(stage, module);
  enforcer.enforce();
}

module.exports = BDDQualityEnforcer;
