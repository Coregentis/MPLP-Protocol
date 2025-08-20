#!/usr/bin/env node

/**
 * TDD质量强制执行器
 * 功能：在TDD重构过程中强制执行质量标准
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TDDQualityEnforcer {
  constructor() {
    this.currentModule = null;
    this.violations = [];
    this.checkpoints = [];
  }

  /**
   * TDD重构前检查
   */
  async preRefactorCheck(moduleName) {
    console.log(`🔍 TDD重构前检查: ${moduleName}模块`);
    this.currentModule = moduleName;
    
    // 1. 检查Schema存在性
    await this.checkSchemaExists();
    
    // 2. 检查现有代码质量
    await this.checkExistingCodeQuality();
    
    // 3. 创建质量基线
    await this.createQualityBaseline();
    
    if (this.violations.length > 0) {
      console.error('❌ TDD重构前检查失败:');
      this.violations.forEach(v => console.error(`  - ${v}`));
      throw new Error('必须修复所有问题后才能开始TDD重构');
    }
    
    console.log('✅ TDD重构前检查通过，可以开始重构');
  }

  /**
   * TDD阶段1检查：Schema-TypeScript映射层
   */
  async checkStage1_SchemaMapping() {
    console.log('🔍 TDD阶段1检查: Schema-TypeScript映射层');
    
    const mapperPath = `src/modules/${this.currentModule}/api/mappers/${this.currentModule}.mapper.ts`;
    
    // 检查Mapper文件存在
    if (!fs.existsSync(mapperPath)) {
      this.violations.push(`缺少Mapper文件: ${mapperPath}`);
      return false;
    }
    
    const mapperContent = fs.readFileSync(mapperPath, 'utf8');
    
    // 检查必需方法
    const requiredMethods = ['toSchema', 'fromSchema', 'validateSchema', 'toSchemaArray', 'fromSchemaArray'];
    requiredMethods.forEach(method => {
      if (!mapperContent.includes(`${method}(`)) {
        this.violations.push(`Mapper缺少必需方法: ${method}`);
      }
    });
    
    // 检查双重命名约定
    await this.validateDualNamingInMapper(mapperContent);
    
    // 运行Mapper测试
    try {
      execSync(`npm run test -- --testPathPattern=${this.currentModule}.mapper.test.ts`, { stdio: 'pipe' });
      console.log('✅ Mapper测试通过');
    } catch (error) {
      this.violations.push('Mapper测试失败');
    }
    
    return this.violations.length === 0;
  }

  /**
   * TDD阶段2检查：DTO层实现
   */
  async checkStage2_DTOLayer() {
    console.log('🔍 TDD阶段2检查: DTO层实现');
    
    const dtoPath = `src/modules/${this.currentModule}/api/dto/${this.currentModule}.dto.ts`;
    
    if (!fs.existsSync(dtoPath)) {
      this.violations.push(`缺少DTO文件: ${dtoPath}`);
      return false;
    }
    
    const dtoContent = fs.readFileSync(dtoPath, 'utf8');
    
    // 检查禁止使用any类型
    if (dtoContent.includes(': any') || dtoContent.includes('<any>')) {
      this.violations.push('DTO中禁止使用any类型');
    }
    
    // 检查camelCase命名
    await this.validateCamelCaseInDTO(dtoContent);
    
    // 运行DTO测试
    try {
      execSync(`npm run test -- --testPathPattern=${this.currentModule}.dto.test.ts`, { stdio: 'pipe' });
      console.log('✅ DTO测试通过');
    } catch (error) {
      this.violations.push('DTO测试失败');
    }
    
    return this.violations.length === 0;
  }

  /**
   * TDD阶段3检查：Repository接口层
   */
  async checkStage3_RepositoryLayer() {
    console.log('🔍 TDD阶段3检查: Repository接口层');
    
    const repoInterfacePath = `src/modules/${this.currentModule}/domain/repositories/${this.currentModule}-repository.interface.ts`;
    const repoImplPath = `src/modules/${this.currentModule}/infrastructure/repositories/${this.currentModule}.repository.ts`;
    
    // 检查接口文件
    if (!fs.existsExists(repoInterfacePath)) {
      this.violations.push(`缺少Repository接口: ${repoInterfacePath}`);
    }
    
    // 检查实现文件
    if (!fs.existsSync(repoImplPath)) {
      this.violations.push(`缺少Repository实现: ${repoImplPath}`);
    }
    
    // 检查厂商中立性
    await this.validateVendorNeutrality();
    
    return this.violations.length === 0;
  }

  /**
   * TDD阶段4检查：核心业务逻辑
   */
  async checkStage4_BusinessLogic() {
    console.log('🔍 TDD阶段4检查: 核心业务逻辑');
    
    const servicePath = `src/modules/${this.currentModule}/application/services/${this.currentModule}-management.service.ts`;
    
    if (!fs.existsSync(servicePath)) {
      this.violations.push(`缺少管理服务: ${servicePath}`);
      return false;
    }
    
    // 检查业务逻辑完整性
    await this.validateBusinessLogicCompleteness();
    
    // 运行业务逻辑测试
    try {
      execSync(`npm run test -- --testPathPattern=${this.currentModule}-management.service.test.ts`, { stdio: 'pipe' });
      console.log('✅ 业务逻辑测试通过');
    } catch (error) {
      this.violations.push('业务逻辑测试失败');
    }
    
    return this.violations.length === 0;
  }

  /**
   * TDD完成后检查
   */
  async postTDDCheck() {
    console.log('🔍 TDD完成后检查');
    
    // 1. 运行完整测试套件
    try {
      execSync(`npm run test -- --testPathPattern=${this.currentModule}`, { stdio: 'pipe' });
      console.log('✅ 完整测试套件通过');
    } catch (error) {
      this.violations.push('完整测试套件失败');
    }
    
    // 2. 检查测试覆盖率
    await this.checkTestCoverage();
    
    // 3. 检查TypeScript编译
    try {
      execSync('npm run typecheck', { stdio: 'pipe' });
      console.log('✅ TypeScript编译通过');
    } catch (error) {
      this.violations.push('TypeScript编译失败');
    }
    
    // 4. 检查ESLint
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('✅ ESLint检查通过');
    } catch (error) {
      this.violations.push('ESLint检查失败');
    }
    
    // 5. 生成质量报告
    await this.generateTDDQualityReport();
    
    return this.violations.length === 0;
  }

  /**
   * 检查Schema存在性
   */
  async checkSchemaExists() {
    const schemaPath = `src/schemas/mplp-${this.currentModule}.json`;
    
    if (!fs.existsSync(schemaPath)) {
      this.violations.push(`缺少Schema文件: ${schemaPath}`);
      return;
    }
    
    // 验证Schema格式
    try {
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      
      // 检查必需字段
      const required = ['$schema', '$id', 'title', 'description', 'type'];
      required.forEach(field => {
        if (!schema[field]) {
          this.violations.push(`Schema缺少必需字段: ${field}`);
        }
      });
      
    } catch (error) {
      this.violations.push(`Schema格式错误: ${error.message}`);
    }
  }

  /**
   * 检查现有代码质量
   */
  async checkExistingCodeQuality() {
    const moduleDir = `src/modules/${this.currentModule}`;
    
    if (!fs.existsSync(moduleDir)) {
      console.log(`模块目录不存在，将创建新模块: ${moduleDir}`);
      return;
    }
    
    // 检查现有文件的质量
    const tsFiles = this.findFiles(moduleDir, '**/*.ts');
    
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // 检查any类型使用
      if (content.includes(': any') || content.includes('<any>')) {
        this.violations.push(`${file}: 存在any类型使用`);
      }
    }
  }

  /**
   * 创建质量基线
   */
  async createQualityBaseline() {
    const baseline = {
      module: this.currentModule,
      timestamp: new Date().toISOString(),
      preRefactorState: {
        filesCount: this.countModuleFiles(),
        testCoverage: await this.getCurrentTestCoverage(),
        typeScriptErrors: await this.getTypeScriptErrorCount(),
        eslintIssues: await this.getESLintIssueCount()
      }
    };
    
    fs.writeFileSync(
      `quality-baseline-${this.currentModule}.json`,
      JSON.stringify(baseline, null, 2)
    );
    
    console.log(`✅ 质量基线已创建: quality-baseline-${this.currentModule}.json`);
  }

  /**
   * 验证双重命名约定
   */
  async validateDualNamingInMapper(content) {
    const conversions = [
      { snake: 'context_id', camel: 'contextId' },
      { snake: 'created_at', camel: 'createdAt' },
      { snake: 'protocol_version', camel: 'protocolVersion' }
    ];
    
    conversions.forEach(({ snake, camel }) => {
      if (content.includes(snake) && content.includes(camel)) {
        // 检查转换方向
        const hasToSchema = content.includes(`${camel}`) && content.includes(`${snake}`);
        if (!hasToSchema) {
          this.violations.push(`Mapper中${snake} ↔ ${camel}转换可能不正确`);
        }
      }
    });
  }

  /**
   * 验证DTO中的camelCase
   */
  async validateCamelCaseInDTO(content) {
    const fieldMatches = content.match(/^\s*(\w+):\s*\w+/gm);
    if (fieldMatches) {
      fieldMatches.forEach(match => {
        const fieldName = match.split(':')[0].trim();
        if (!this.isCamelCase(fieldName) && !this.isAllowedException(fieldName)) {
          this.violations.push(`DTO字段"${fieldName}"违反camelCase命名约定`);
        }
      });
    }
  }

  /**
   * 验证厂商中立性
   */
  async validateVendorNeutrality() {
    const repoPath = `src/modules/${this.currentModule}/infrastructure/repositories/${this.currentModule}.repository.ts`;
    
    if (fs.existsSync(repoPath)) {
      const content = fs.readFileSync(repoPath, 'utf8');
      
      // 检查是否硬编码了特定厂商
      const vendorSpecific = ['mongodb://', 'mysql://', 'postgresql://', 'redis://'];
      vendorSpecific.forEach(vendor => {
        if (content.includes(vendor)) {
          this.violations.push(`Repository中发现厂商特定代码: ${vendor}`);
        }
      });
    }
  }

  /**
   * 验证业务逻辑完整性
   */
  async validateBusinessLogicCompleteness() {
    const servicePath = `src/modules/${this.currentModule}/application/services/${this.currentModule}-management.service.ts`;
    
    if (fs.existsSync(servicePath)) {
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // 检查基本CRUD方法
      const requiredMethods = ['create', 'findById', 'update', 'delete'];
      requiredMethods.forEach(method => {
        if (!content.includes(`${method}(`)) {
          this.violations.push(`管理服务缺少基本方法: ${method}`);
        }
      });
    }
  }

  /**
   * 检查测试覆盖率
   */
  async checkTestCoverage() {
    try {
      const result = execSync(`npm run test:coverage -- --testPathPattern=${this.currentModule}`, { encoding: 'utf8' });
      
      const coverageMatch = result.match(/All files\s+\|\s+(\d+\.?\d*)/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage < 90) {
          this.violations.push(`测试覆盖率不足: ${coverage}% (要求: ≥90%)`);
        } else {
          console.log(`✅ 测试覆盖率: ${coverage}%`);
        }
      }
    } catch (error) {
      this.violations.push('测试覆盖率检查失败');
    }
  }

  /**
   * 生成TDD质量报告
   */
  async generateTDDQualityReport() {
    const report = {
      module: this.currentModule,
      timestamp: new Date().toISOString(),
      tddStages: this.checkpoints,
      finalState: {
        violations: this.violations,
        testCoverage: await this.getCurrentTestCoverage(),
        typeScriptErrors: await this.getTypeScriptErrorCount(),
        eslintIssues: await this.getESLintIssueCount()
      },
      qualityScore: this.calculateQualityScore()
    };
    
    fs.writeFileSync(
      `tdd-quality-report-${this.currentModule}.json`,
      JSON.stringify(report, null, 2)
    );
    
    console.log(`📊 TDD质量报告已生成: tdd-quality-report-${this.currentModule}.json`);
  }

  // 辅助方法
  findFiles(dir, pattern) {
    const glob = require('glob');
    return glob.sync(path.join(dir, pattern));
  }

  countModuleFiles() {
    const moduleDir = `src/modules/${this.currentModule}`;
    if (!fs.existsSync(moduleDir)) return 0;
    return this.findFiles(moduleDir, '**/*.ts').length;
  }

  async getCurrentTestCoverage() {
    try {
      const result = execSync('npm run test:coverage', { encoding: 'utf8' });
      const match = result.match(/All files\s+\|\s+(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : 0;
    } catch {
      return 0;
    }
  }

  async getTypeScriptErrorCount() {
    try {
      execSync('npm run typecheck', { stdio: 'pipe' });
      return 0;
    } catch (error) {
      return (error.stdout.toString().match(/error TS/g) || []).length;
    }
  }

  async getESLintIssueCount() {
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      return 0;
    } catch (error) {
      return (error.stdout.toString().match(/✖/g) || []).length;
    }
  }

  calculateQualityScore() {
    const maxScore = 100;
    const deductions = this.violations.length * 10; // 每个违规扣10分
    return Math.max(0, maxScore - deductions);
  }

  isCamelCase(str) {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  isAllowedException(str) {
    const exceptions = ['readonly', 'static', 'private', 'public', 'protected'];
    return exceptions.includes(str);
  }
}

// 命令行使用
if (require.main === module) {
  const enforcer = new TDDQualityEnforcer();
  const command = process.argv[2];
  const moduleName = process.argv[3];
  
  if (!command || !moduleName) {
    console.error('用法: node tdd-quality-enforcer.js <command> <module-name>');
    console.error('命令: pre-check, stage1, stage2, stage3, stage4, post-check');
    process.exit(1);
  }
  
  const commands = {
    'pre-check': () => enforcer.preRefactorCheck(moduleName),
    'stage1': () => enforcer.checkStage1_SchemaMapping(),
    'stage2': () => enforcer.checkStage2_DTOLayer(),
    'stage3': () => enforcer.checkStage3_RepositoryLayer(),
    'stage4': () => enforcer.checkStage4_BusinessLogic(),
    'post-check': () => enforcer.postTDDCheck()
  };
  
  if (commands[command]) {
    commands[command]()
      .then(success => {
        process.exit(success ? 0 : 1);
      })
      .catch(error => {
        console.error('执行失败:', error.message);
        process.exit(1);
      });
  } else {
    console.error('未知命令:', command);
    process.exit(1);
  }
}

module.exports = TDDQualityEnforcer;
