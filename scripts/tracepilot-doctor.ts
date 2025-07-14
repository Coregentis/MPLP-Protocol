#!/usr/bin/env tsx

/**
 * TracePilot Doctor - 开发问题诊断和自动修复工具
 * 
 * @version v1.0.0
 * @created 2025-01-09T25:10:00+08:00
 * @description 智能诊断MPLP项目问题并提供自动修复方案
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { EnhancedTracePilotAdapter, DevelopmentIssue, TracePilotSuggestion, TracePilotConfig } from '../src/mcp/enhanced-tracepilot-adapter';
import { logger } from '../src/utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * TracePilot Doctor CLI
 */
class TracePilotDoctor {
  private tracePilot: EnhancedTracePilotAdapter;
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    // 创建适配器配置
    const config: TracePilotConfig = {
      project_root: projectRoot,
      enhanced_features: {
        intelligent_diagnostics: true,
        auto_fix: true,
        suggestion_generation: true,
        development_metrics: true
      }
    };
    this.tracePilot = new EnhancedTracePilotAdapter(config);
  }

  /**
   * 执行完整诊断
   */
  async diagnose(): Promise<void> {
    console.log(chalk.cyan.bold('\n🔍 TracePilot Doctor - MPLP项目诊断\n'));
    
    const spinner = ora('正在检测项目问题...').start();
    
    try {
      // 检测开发问题
      const issuesResult = await this.tracePilot.detectDevelopmentIssues();
      const issues = issuesResult.issues; // 从结果对象中提取issues数组
      
      spinner.succeed(`检测完成！发现 ${issues.length} 个问题`);
      
      if (issues.length === 0) {
        console.log(chalk.green('🎉 恭喜！项目状态良好，未发现问题。'));
        return;
      }
      
      // 显示问题报告
      this.displayIssueReport(issues);
      
      // 生成修复建议
      const spinner2 = ora('生成智能修复建议...').start();
      const suggestions = await this.tracePilot.generateSuggestions();
      spinner2.succeed(`生成了 ${suggestions.length} 个修复建议`);
      
      // 显示修复建议
      this.displaySuggestions(suggestions);
      
      // 询问是否执行自动修复
      await this.promptAutoFix(suggestions);
      
    } catch (error) {
      spinner.fail('诊断过程中发生错误');
      console.error(chalk.red('错误详情:'), error);
    }
  }

  /**
   * 显示问题报告
   */
  private displayIssueReport(issues: DevelopmentIssue[]): void {
    console.log(chalk.yellow.bold('\n📋 问题报告\n'));
    
    // 按严重程度分组
    const grouped = issues.reduce((acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    }, {} as Record<string, DevelopmentIssue[]>);
    
    const severityColors = {
      critical: chalk.red.bold,
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.gray
    };
    
    const severityEmojis = {
      critical: '🚨',
      high: '❗',
      medium: '⚠️',
      low: 'ℹ️'
    };
    
    for (const [severity, severityIssues] of Object.entries(grouped)) {
      const color = severityColors[severity as keyof typeof severityColors] || chalk.white;
      const emoji = severityEmojis[severity as keyof typeof severityEmojis] || '•';
      
      console.log(color(`${emoji} ${severity.toUpperCase()} (${severityIssues.length})`));
      
      for (const issue of severityIssues) {
        console.log(`  ${chalk.cyan('•')} ${issue.title}`);
        if (issue.file_path) {
          console.log(`    ${chalk.gray('文件:')} ${issue.file_path}`);
        }
        if (issue.description) {
          console.log(`    ${chalk.gray('描述:')} ${issue.description}`);
        }
        if (issue.auto_fixable) {
          console.log(`    ${chalk.green('✓ 可自动修复')}`);
        } else {
          console.log(`    ${chalk.yellow('⚠ 需要手动修复')}`);
        }
        console.log();
      }
    }
  }

  /**
   * 显示修复建议
   */
  private displaySuggestions(suggestions: TracePilotSuggestion[]): void {
    if (suggestions.length === 0) return;
    
    console.log(chalk.blue.bold('\n💡 智能修复建议\n'));
    
    suggestions.forEach((suggestion, index) => {
      const priorityColor = {
        critical: chalk.red.bold,
        high: chalk.red,
        medium: chalk.yellow,
        low: chalk.gray
      }[suggestion.priority] || chalk.white;
      
      console.log(`${index + 1}. ${priorityColor(suggestion.title)}`);
      console.log(`   ${chalk.gray('类型:')} ${suggestion.type}`);
      console.log(`   ${chalk.gray('优先级:')} ${priorityColor(suggestion.priority)}`);
      console.log(`   ${chalk.gray('预计耗时:')} ${suggestion.estimated_time_minutes} 分钟`);
      console.log(`   ${chalk.gray('描述:')} ${suggestion.description}`);
      
      if (suggestion.implementation_steps.length > 0) {
        console.log(`   ${chalk.gray('实施步骤:')}`);
        suggestion.implementation_steps.forEach((step, stepIndex) => {
          console.log(`     ${chalk.cyan(stepIndex + 1 + '.')} ${step}`);
        });
      }
      console.log();
    });
  }

  /**
   * 提示自动修复
   */
  private async promptAutoFix(suggestions: TracePilotSuggestion[]): Promise<void> {
    if (suggestions.length === 0) return;
    
    const autoFixableSuggestions = suggestions.filter(s => 
      s.type === 'fix' && s.priority !== 'low'
    );
    
    if (autoFixableSuggestions.length === 0) {
      console.log(chalk.yellow('没有可自动修复的建议。'));
      return;
    }
    
    const { shouldAutoFix } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldAutoFix',
        message: `发现 ${autoFixableSuggestions.length} 个可自动修复的问题，是否立即执行修复？`,
        default: true
      }
    ]);
    
    if (!shouldAutoFix) {
      console.log(chalk.yellow('跳过自动修复。您可以稍后手动运行修复。'));
      return;
    }
    
    // 执行自动修复
    for (const suggestion of autoFixableSuggestions) {
      const spinner = ora(`正在修复: ${suggestion.title}`).start();
      
      try {
        const success = await this.tracePilot.autoFix(suggestion.suggestion_id);
        if (success) {
          spinner.succeed(`✅ 修复完成: ${suggestion.title}`);
        } else {
          spinner.fail(`❌ 修复失败: ${suggestion.title}`);
        }
      } catch (error) {
        spinner.fail(`❌ 修复失败: ${suggestion.title}`);
        console.error(chalk.red('错误详情:'), error);
      }
    }
    
    console.log(chalk.green.bold('\n🎉 自动修复完成！'));
  }

  /**
   * 快速检查
   */
  async quickCheck(): Promise<void> {
    console.log(chalk.cyan.bold('\n⚡ TracePilot 快速检查\n'));
    
    const checks = [
      { name: '检查Schema目录', fn: () => this.checkSchemasDirectory() },
      { name: '检查TypeScript配置', fn: () => this.checkTypeScriptConfig() },
      { name: '检查Jest配置', fn: () => this.checkJestConfig() },
      { name: '检查模块完整性', fn: () => this.checkModulesIntegrity() }
    ];
    
    for (const check of checks) {
      const spinner = ora(check.name).start();
      try {
        const result = await check.fn();
        if (result.success) {
          spinner.succeed(`${check.name} ✓`);
        } else {
          spinner.fail(`${check.name} ✗`);
          console.log(chalk.red(`  问题: ${result.issue}`));
          if (result.suggestion) {
            console.log(chalk.yellow(`  建议: ${result.suggestion}`));
          }
        }
      } catch (error) {
        spinner.fail(`${check.name} ✗`);
        console.error(chalk.red(`  错误: ${error}`));
      }
    }
  }

  /**
   * 检查Schema目录
   */
  private async checkSchemasDirectory(): Promise<{ success: boolean; issue?: string; suggestion?: string }> {
    const schemasDir = path.join(this.projectRoot, 'src/schemas');
    
    try {
      await fs.access(schemasDir);
      
      const requiredFiles = [
        'context-protocol.json',
        'plan-protocol.json',
        'confirm-protocol.json',
        'trace-protocol.json',
        'role-protocol.json',
        'extension-protocol.json'
      ];
      
      for (const file of requiredFiles) {
        const filePath = path.join(schemasDir, file);
        try {
          await fs.access(filePath);
        } catch {
          return {
            success: false,
            issue: `缺失Schema文件: ${file}`,
            suggestion: '运行 TracePilot Doctor 进行自动修复'
          };
        }
      }
      
      return { success: true };
    } catch {
      return {
        success: false,
        issue: 'schemas目录不存在',
        suggestion: '运行 TracePilot Doctor 进行自动修复'
      };
    }
  }

  /**
   * 检查TypeScript配置
   */
  private async checkTypeScriptConfig(): Promise<{ success: boolean; issue?: string; suggestion?: string }> {
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    
    try {
      const content = await fs.readFile(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);
      
      if (!config.compilerOptions?.paths) {
        return {
          success: false,
          issue: 'TypeScript路径映射未配置',
          suggestion: '在tsconfig.json中添加路径映射配置'
        };
      }
      
      return { success: true };
    } catch {
      return {
        success: false,
        issue: 'tsconfig.json文件无法读取或解析',
        suggestion: '检查TypeScript配置文件语法'
      };
    }
  }

  /**
   * 检查Jest配置
   */
  private async checkJestConfig(): Promise<{ success: boolean; issue?: string; suggestion?: string }> {
    const jestConfigPath = path.join(this.projectRoot, 'jest.config.js');
    
    try {
      const content = await fs.readFile(jestConfigPath, 'utf-8');
      
      if (content.includes('moduleNameMapping')) {
        return {
          success: false,
          issue: 'Jest配置中存在拼写错误：moduleNameMapping应为moduleNameMapper',
          suggestion: '修正Jest配置中的属性名'
        };
      }
      
      return { success: true };
    } catch {
      return {
        success: false,
        issue: 'jest.config.js文件无法读取',
        suggestion: '检查Jest配置文件是否存在'
      };
    }
  }

  /**
   * 检查模块完整性
   */
  private async checkModulesIntegrity(): Promise<{ success: boolean; issue?: string; suggestion?: string }> {
    const modules = ['context', 'plan', 'trace'];
    
    for (const moduleName of modules) {
      const moduleDir = path.join(this.projectRoot, 'src/modules', moduleName);
      const requiredFiles = ['index.ts', 'types.ts', `${moduleName}-manager.ts`];
      
      for (const file of requiredFiles) {
        const filePath = path.join(moduleDir, file);
        try {
          await fs.access(filePath);
        } catch {
          return {
            success: false,
            issue: `${moduleName}模块缺失文件: ${file}`,
            suggestion: '运行完整诊断进行修复'
          };
        }
      }
    }
    
    return { success: true };
  }

  /**
   * 生成诊断报告
   */
  async generateReport(): Promise<void> {
    console.log(chalk.cyan.bold('\n📊 生成诊断报告\n'));
    
    const spinner = ora('收集诊断数据...').start();
    
    try {
      const issuesResult = await this.tracePilot.detectDevelopmentIssues();
      const issues = issuesResult.issues;
      const suggestions = await this.tracePilot.generateSuggestions();
      const report = this.tracePilot.getIssueReport();
      
      const reportData = {
        timestamp: new Date().toISOString(),
        project_root: this.projectRoot,
        summary: report,
        issues: issues,
        suggestions: suggestions,
        confidence: issuesResult.confidence
      };
      
      const reportPath = path.join(this.projectRoot, 'trace/tracepilot-diagnostic-report.json');
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
      
      spinner.succeed(`诊断报告已生成: ${reportPath}`);
      
      console.log(chalk.green('\n📋 报告摘要:'));
      console.log(`  总问题数: ${report.total_issues}`);
      console.log(`  关键问题: ${report.by_severity.critical}`);
      console.log(`  高优先级: ${report.by_severity.high}`);
      console.log(`  修复建议: ${suggestions.length}`);
      
    } catch (error) {
      spinner.fail('生成诊断报告失败');
      console.error(chalk.red('错误详情:'), error);
    }
  }
}

// CLI程序
async function main() {
  const program = new Command();
  
  program
    .name('tracepilot-doctor')
    .description('TracePilot Doctor - MPLP项目诊断和自动修复工具')
    .version('1.0.0');
  
  program
    .command('diagnose')
    .description('执行完整的项目诊断')
    .action(async () => {
      const doctor = new TracePilotDoctor();
      await doctor.diagnose();
    });
  
  program
    .command('check')
    .description('快速检查项目状态')
    .action(async () => {
      const doctor = new TracePilotDoctor();
      await doctor.quickCheck();
    });
  
  program
    .command('report')
    .description('生成详细诊断报告')
    .action(async () => {
      const doctor = new TracePilotDoctor();
      await doctor.generateReport();
    });
  
  await program.parseAsync();
}

if (require.main === module) {
  main().catch(console.error);
}

export { TracePilotDoctor }; 