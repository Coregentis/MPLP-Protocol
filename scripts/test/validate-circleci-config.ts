/**
 * CircleCI配置验证脚本
 * 验证CircleCI配置文件的正确性和完整性
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Logger } from '../src/public/utils/logger';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class CircleCIConfigValidator {
  private logger: Logger;
  private configPath: string;

  constructor(configPath: string = '.circleci/config.yml') {
    this.logger = new Logger('CircleCIConfigValidator');
    this.configPath = path.resolve(configPath);
  }

  /**
   * 验证CircleCI配置
   */
  async validateConfig(): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      this.logger.info('🔍 验证CircleCI配置...');

      // 1. 检查文件存在
      if (!await fs.pathExists(this.configPath)) {
        result.errors.push('CircleCI配置文件不存在: .circleci/config.yml');
        result.valid = false;
        return result;
      }

      // 2. 解析YAML
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      let config: any;
      
      try {
        config = yaml.load(configContent);
      } catch (error) {
        result.errors.push(`YAML解析错误: ${error}`);
        result.valid = false;
        return result;
      }

      // 3. 验证基本结构
      this.validateBasicStructure(config, result);

      // 4. 验证工作流
      this.validateWorkflows(config, result);

      // 5. 验证任务
      this.validateJobs(config, result);

      // 6. 验证orbs
      this.validateOrbs(config, result);

      // 7. 检查最佳实践
      this.checkBestPractices(config, result);

      // 8. 验证MPLP特定配置
      this.validateMPLPSpecific(config, result);

      if (result.errors.length > 0) {
        result.valid = false;
      }

      this.logResults(result);
      return result;

    } catch (error) {
      result.errors.push(`验证过程中发生错误: ${error}`);
      result.valid = false;
      return result;
    }
  }

  /**
   * 验证基本结构
   */
  private validateBasicStructure(config: any, result: ValidationResult): void {
    // 检查版本
    if (!config.version) {
      result.errors.push('缺少version字段');
    } else if (config.version !== 2.1) {
      result.warnings.push('建议使用version 2.1');
    }

    // 检查必需的顶级字段
    const requiredFields = ['workflows', 'jobs'];
    for (const field of requiredFields) {
      if (!config[field]) {
        result.errors.push(`缺少必需字段: ${field}`);
      }
    }
  }

  /**
   * 验证工作流
   */
  private validateWorkflows(config: any, result: ValidationResult): void {
    if (!config.workflows) return;

    const workflows = config.workflows;
    
    // 检查是否有开发工作流
    if (!workflows.development) {
      result.warnings.push('建议添加development工作流');
    }

    // 检查是否有发布工作流
    if (!workflows.release) {
      result.warnings.push('建议添加release工作流');
    }

    // 检查定时工作流
    if (!workflows.nightly && !workflows.weekly) {
      result.suggestions.push('考虑添加定时工作流进行定期检查');
    }

    // 验证每个工作流
    for (const [workflowName, workflow] of Object.entries(workflows)) {
      if (workflowName === 'version') continue;
      
      this.validateWorkflow(workflowName, workflow as any, result);
    }
  }

  /**
   * 验证单个工作流
   */
  private validateWorkflow(name: string, workflow: any, result: ValidationResult): void {
    if (!workflow.jobs) {
      result.errors.push(`工作流 ${name} 缺少jobs字段`);
      return;
    }

    // 检查任务依赖
    const jobs = Array.isArray(workflow.jobs) ? workflow.jobs : Object.keys(workflow.jobs);
    for (const job of jobs) {
      const jobName = typeof job === 'string' ? job : Object.keys(job)[0];
      // 这里可以添加更多的任务依赖验证
    }
  }

  /**
   * 验证任务
   */
  private validateJobs(config: any, result: ValidationResult): void {
    if (!config.jobs) return;

    const jobs = config.jobs;
    
    // 检查必需的任务
    const requiredJobs = ['test-unit', 'build-and-validate'];
    for (const jobName of requiredJobs) {
      if (!jobs[jobName]) {
        result.warnings.push(`建议添加 ${jobName} 任务`);
      }
    }

    // 验证每个任务
    for (const [jobName, job] of Object.entries(jobs)) {
      this.validateJob(jobName, job as any, result);
    }
  }

  /**
   * 验证单个任务
   */
  private validateJob(name: string, job: any, result: ValidationResult): void {
    // 检查执行环境
    if (!job.docker && !job.machine && !job.macos) {
      result.errors.push(`任务 ${name} 缺少执行环境 (docker/machine/macos)`);
    }

    // 检查步骤
    if (!job.steps) {
      result.errors.push(`任务 ${name} 缺少steps字段`);
      return;
    }

    // 检查checkout步骤
    const hasCheckout = job.steps.some((step: any) => 
      step === 'checkout' || (typeof step === 'object' && step.checkout)
    );
    if (!hasCheckout) {
      result.warnings.push(`任务 ${name} 建议添加checkout步骤`);
    }

    // 检查Node.js相关任务的包安装
    if (name.includes('test') || name.includes('build')) {
      const hasInstall = job.steps.some((step: any) => 
        (typeof step === 'object' && step['node/install-packages']) ||
        (typeof step === 'object' && step.run && step.run.command && step.run.command.includes('npm install'))
      );
      if (!hasInstall) {
        result.warnings.push(`任务 ${name} 建议添加依赖安装步骤`);
      }
    }
  }

  /**
   * 验证orbs
   */
  private validateOrbs(config: any, result: ValidationResult): void {
    if (!config.orbs) {
      result.suggestions.push('考虑使用orbs简化配置');
      return;
    }

    const orbs = config.orbs;
    
    // 检查推荐的orbs
    if (!orbs.node) {
      result.suggestions.push('建议使用node orb简化Node.js配置');
    }

    // 检查orb版本
    for (const [orbName, orbVersion] of Object.entries(orbs)) {
      if (typeof orbVersion === 'string' && !orbVersion.includes('@')) {
        result.warnings.push(`Orb ${orbName} 建议指定版本号`);
      }
    }
  }

  /**
   * 检查最佳实践
   */
  private checkBestPractices(config: any, result: ValidationResult): void {
    // 检查缓存使用
    const hasCache = this.checkForCaching(config);
    if (!hasCache) {
      result.suggestions.push('考虑使用缓存提高构建速度');
    }

    // 检查并行化
    const hasParallelism = this.checkForParallelism(config);
    if (!hasParallelism) {
      result.suggestions.push('考虑并行化测试提高效率');
    }

    // 检查工件存储
    const hasArtifacts = this.checkForArtifacts(config);
    if (!hasArtifacts) {
      result.suggestions.push('考虑存储重要的构建工件');
    }

    // 检查测试结果存储
    const hasTestResults = this.checkForTestResults(config);
    if (!hasTestResults) {
      result.suggestions.push('考虑存储测试结果以便分析');
    }
  }

  /**
   * 验证MPLP特定配置
   */
  private validateMPLPSpecific(config: any, result: ValidationResult): void {
    const jobs = config.jobs || {};

    // 检查备份相关任务
    if (!jobs['backup-check'] && !jobs['scheduled-backup']) {
      result.warnings.push('建议添加备份相关任务');
    }

    // 检查性能测试
    if (!jobs['test-performance']) {
      result.warnings.push('建议添加性能测试任务');
    }

    // 检查安全审计
    if (!jobs['security-audit']) {
      result.warnings.push('建议添加安全审计任务');
    }

    // 检查开源发布
    if (!jobs['build-public-release']) {
      result.warnings.push('建议添加开源发布构建任务');
    }

    // 检查不稳定测试检测
    if (!jobs['flaky-test-detection']) {
      result.suggestions.push('考虑添加不稳定测试检测');
    }
  }

  /**
   * 检查缓存使用
   */
  private checkForCaching(config: any): boolean {
    const jobs = config.jobs || {};
    return Object.values(jobs).some((job: any) => 
      job.steps && job.steps.some((step: any) => 
        typeof step === 'object' && (step.restore_cache || step.save_cache)
      )
    );
  }

  /**
   * 检查并行化
   */
  private checkForParallelism(config: any): boolean {
    const jobs = config.jobs || {};
    return Object.values(jobs).some((job: any) => job.parallelism);
  }

  /**
   * 检查工件存储
   */
  private checkForArtifacts(config: any): boolean {
    const jobs = config.jobs || {};
    return Object.values(jobs).some((job: any) => 
      job.steps && job.steps.some((step: any) => 
        typeof step === 'object' && step.store_artifacts
      )
    );
  }

  /**
   * 检查测试结果存储
   */
  private checkForTestResults(config: any): boolean {
    const jobs = config.jobs || {};
    return Object.values(jobs).some((job: any) => 
      job.steps && job.steps.some((step: any) => 
        typeof step === 'object' && step.store_test_results
      )
    );
  }

  /**
   * 记录验证结果
   */
  private logResults(result: ValidationResult): void {
    this.logger.info('\n📊 CircleCI配置验证结果:');
    
    if (result.valid) {
      this.logger.info('✅ 配置验证通过');
    } else {
      this.logger.error('❌ 配置验证失败');
    }

    if (result.errors.length > 0) {
      this.logger.error('\n🚨 错误:');
      result.errors.forEach(error => this.logger.error(`  • ${error}`));
    }

    if (result.warnings.length > 0) {
      this.logger.warn('\n⚠️ 警告:');
      result.warnings.forEach(warning => this.logger.warn(`  • ${warning}`));
    }

    if (result.suggestions.length > 0) {
      this.logger.info('\n💡 建议:');
      result.suggestions.forEach(suggestion => this.logger.info(`  • ${suggestion}`));
    }
  }
}

// 导出便捷函数
export async function validateCircleCIConfig(configPath?: string): Promise<boolean> {
  const validator = new CircleCIConfigValidator(configPath);
  const result = await validator.validateConfig();
  return result.valid;
}

// CLI支持
if (require.main === module) {
  const configPath = process.argv[2];
  validateCircleCIConfig(configPath)
    .then(valid => process.exit(valid ? 0 : 1))
    .catch(error => {
      console.error('验证过程中发生错误:', error);
      process.exit(1);
    });
}
