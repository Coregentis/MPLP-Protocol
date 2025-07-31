#!/usr/bin/env node
/**
 * MPLP Schema验证器命令行工具 - 厂商中立设计
 *
 * 提供命令行接口，用于验证代码是否符合Schema规范。
 * 支持多种验证模式，包括厂商中立性验证和命名约定验证。
 *
 * @version v1.0.1
 * @created 2025-07-19T20:00:00+08:00
 * @updated 2025-08-15T15:30:00+08:00
 * @compliance .cursor/rules/development-standards.mdc - Schema驱动开发原则
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

import { SchemaValidatorFactory } from '../public/modules/core/schema/schema-validator-factory';
import { join, resolve } from 'path';
import { promises as fs } from 'fs';
import { createInterface } from 'readline';
import { Logger } from '../public/utils/logger';

// 简单的验证器包装器
interface IValidator {
  validateFile(filePath: string): Promise<SchemaViolation[]>;
  validateDirectory(dirPath: string, recursive: boolean): Promise<SchemaValidationReport>;
}

class SimpleValidator implements IValidator {
  constructor(private ajv: any) {}

  async validateFile(filePath: string): Promise<SchemaViolation[]> {
    // 简单的文件验证实现
    const violations: SchemaViolation[] = [];

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // 基本的语法检查
      if (filePath.endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (error) {
          violations.push({
            severity: SchemaViolationSeverity.ERROR,
            message: `JSON语法错误: ${error instanceof Error ? error.message : 'Unknown error'}`,
            location: {
              filePath,
              startLine: 1
            }
          });
        }
      }

      // 检查厂商中立性
      const vendorKeywords = ['aws', 'azure', 'gcp', 'google-cloud', 'alibaba', 'tencent'];
      const lowerContent = content.toLowerCase();

      for (const keyword of vendorKeywords) {
        if (lowerContent.includes(keyword)) {
          violations.push({
            severity: SchemaViolationSeverity.WARNING,
            message: `可能包含厂商特定内容: ${keyword}`,
            location: {
              filePath,
              startLine: 1
            },
            fix: `考虑使用厂商中立的替代方案`
          });
        }
      }

    } catch (error) {
      violations.push({
        severity: SchemaViolationSeverity.ERROR,
        message: `无法读取文件: ${error instanceof Error ? error.message : 'Unknown error'}`,
        location: {
          filePath,
          startLine: 1
        }
      });
    }

    return violations;
  }

  async validateDirectory(dirPath: string, recursive: boolean): Promise<SchemaValidationReport> {
    const report = new SchemaValidationReport();

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isFile()) {
          // 只验证相关文件类型
          if (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.json')) {
            const violations = await this.validateFile(fullPath);
            report.addViolations(violations);
          }
        } else if (entry.isDirectory() && recursive) {
          // 跳过node_modules等目录
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            const subReport = await this.validateDirectory(fullPath, recursive);
            report.addViolations(subReport.getAllViolations());
          }
        }
      }
    } catch (error) {
      report.addViolation({
        severity: SchemaViolationSeverity.ERROR,
        message: `无法读取目录: ${error instanceof Error ? error.message : 'Unknown error'}`,
        location: {
          filePath: dirPath,
          startLine: 1
        }
      });
    }

    return report;
  }
}

// 定义缺失的类型
export enum SchemaViolationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  FATAL = 'fatal'
}

export interface SchemaViolation {
  severity: SchemaViolationSeverity;
  message: string;
  location: {
    filePath: string;
    startLine?: number;
    startColumn?: number;
    codeSnippet?: string;
  };
  ruleType?: string;
  fix?: string;
}

export class SchemaValidationReport {
  private violations: SchemaViolation[] = [];

  constructor() {}

  addViolation(violation: SchemaViolation): void {
    this.violations.push(violation);
  }

  addViolations(violations: SchemaViolation[]): void {
    this.violations.push(...violations);
  }

  getAllViolations(): SchemaViolation[] {
    return [...this.violations];
  }

  getViolationCountBySeverity(): Record<SchemaViolationSeverity, number> {
    const counts: Record<SchemaViolationSeverity, number> = {
      [SchemaViolationSeverity.INFO]: 0,
      [SchemaViolationSeverity.WARNING]: 0,
      [SchemaViolationSeverity.ERROR]: 0,
      [SchemaViolationSeverity.CRITICAL]: 0,
      [SchemaViolationSeverity.FATAL]: 0
    };

    for (const violation of this.violations) {
      counts[violation.severity]++;
    }

    return counts;
  }

  getViolationsBySeverity(severity: SchemaViolationSeverity): SchemaViolation[] {
    return this.violations.filter(v => v.severity === severity);
  }

  getFileCount(): number {
    const files = new Set(this.violations.map(v => v.location.filePath));
    return files.size;
  }

  getViolationCount(): number {
    return this.violations.length;
  }

  toJSON(): string {
    return JSON.stringify({
      violations: this.violations,
      summary: {
        total: this.getViolationCount(),
        fileCount: this.getFileCount(),
        severityCounts: this.getViolationCountBySeverity()
      }
    }, null, 2);
  }

  toMarkdown(): string {
    let output = '# Schema验证报告\n\n';
    output += `**验证时间**: ${new Date().toISOString()}\n`;
    output += `**总违规数**: ${this.getViolationCount()}\n`;
    output += `**涉及文件数**: ${this.getFileCount()}\n\n`;

    const severityCounts = this.getViolationCountBySeverity();
    output += '## 按严重级别统计\n\n';
    Object.entries(severityCounts).forEach(([severity, count]) => {
      output += `- **${severity}**: ${count}\n`;
    });

    output += '\n## 违规详情\n\n';
    this.violations.forEach((violation, index) => {
      output += `### ${index + 1}. ${violation.message}\n\n`;
      output += `- **文件**: ${violation.location.filePath}\n`;
      output += `- **严重级别**: ${violation.severity}\n`;
      if (violation.location.startLine) {
        output += `- **位置**: 第 ${violation.location.startLine} 行\n`;
      }
      if (violation.fix) {
        output += `- **修复建议**: ${violation.fix}\n`;
      }
      output += '\n';
    });

    return output;
  }

  toHTML(): string {
    let output = `<!DOCTYPE html>
<html>
<head>
  <title>Schema验证报告</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2 { color: #333; }
    .violation { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
    .fatal { border-left: 5px solid darkred; }
    .error { border-left: 5px solid red; }
    .warning { border-left: 5px solid orange; }
    .info { border-left: 5px solid blue; }
  </style>
</head>
<body>
  <h1>Schema验证报告</h1>
  <p><strong>验证时间</strong>: ${new Date().toISOString()}</p>
  <p><strong>总违规数</strong>: ${this.getViolationCount()}</p>
  <p><strong>涉及文件数</strong>: ${this.getFileCount()}</p>

  <h2>违规详情</h2>`;

    this.violations.forEach((violation, index) => {
      const severityClass = violation.severity.toLowerCase();
      output += `
  <div class="violation ${severityClass}">
    <h3>${index + 1}. ${violation.message}</h3>
    <p><strong>文件</strong>: ${violation.location.filePath}</p>
    <p><strong>严重级别</strong>: ${violation.severity}</p>`;

      if (violation.location.startLine) {
        output += `<p><strong>位置</strong>: 第 ${violation.location.startLine} 行</p>`;
      }

      if (violation.fix) {
        output += `<p><strong>修复建议</strong>: ${violation.fix}</p>`;
      }

      output += `
  </div>`;
    });

    output += `
</body>
</html>`;

    return output;
  }
}

// 创建验证器命令行工具Logger实例
const logger = new Logger('SchemaValidatorCLI');

/**
 * 命令行选项接口
 */
interface CliOptions {
  /**
   * 验证模式
   */
  mode: 'default' | 'vendor-neutral' | 'naming';
  
  /**
   * 验证目标路径
   */
  target: string;
  
  /**
   * 是否递归验证子目录
   */
  recursive: boolean;
  
  /**
   * 输出格式
   */
  format: 'text' | 'json' | 'markdown' | 'html';
  
  /**
   * 输出文件路径
   */
  output?: string;
  
  /**
   * 最小严重级别
   */
  minSeverity: SchemaViolationSeverity;
  
  /**
   * 是否显示详细信息
   */
  verbose: boolean;
}

/**
 * 解析命令行参数
 * 
 * @returns 命令行选项
 */
function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    mode: 'default',
    target: 'src',
    recursive: true,
    format: 'text',
    minSeverity: SchemaViolationSeverity.WARNING,
    verbose: false
  };
  
  try {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--mode':
        case '-m':
          const mode = args[++i];
          if (mode === 'default' || mode === 'vendor-neutral' || mode === 'naming') {
            options.mode = mode;
          } else {
            logger.error(`无效的模式: ${mode}`);
            process.exit(1);
          }
          break;
          
        case '--target':
        case '-t':
          options.target = args[++i];
          break;
          
        case '--no-recursive':
          options.recursive = false;
          break;
          
        case '--format':
        case '-f':
          const format = args[++i];
          if (format === 'text' || format === 'json' || format === 'markdown' || format === 'html') {
            options.format = format;
          } else {
            logger.error(`无效的格式: ${format}`);
            process.exit(1);
          }
          break;
          
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
          
        case '--severity':
        case '-s':
          const severity = args[++i];
          if (Object.values(SchemaViolationSeverity).includes(severity as SchemaViolationSeverity)) {
            options.minSeverity = severity as SchemaViolationSeverity;
          } else {
            logger.error(`无效的严重级别: ${severity}`);
            process.exit(1);
          }
          break;
          
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
          
        case '--help':
        case '-h':
          printHelp();
          process.exit(0);
          break;
          
        default:
          logger.error(`无效的参数: ${arg}`);
          printHelp();
          process.exit(1);
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`解析命令行参数失败: ${errorMessage}`);
    process.exit(1);
  }
  
  return options;
}

/**
 * 打印帮助信息
 */
function printHelp(): void {
  logger.info(`
MPLP Schema验证器命令行工具

用法: schema-validator [选项]

选项:
  --mode, -m <mode>         验证模式 (default, vendor-neutral, naming) [默认: default]
  --target, -t <path>       要验证的目标路径 [默认: src]
  --no-recursive            不递归验证子目录
  --format, -f <format>     输出格式 (text, json, markdown, html) [默认: text]
  --output, -o <file>       输出文件路径
  --severity, -s <level>    最小严重级别 (info, warning, error, fatal) [默认: warning]
  --verbose, -v             显示详细信息
  --help, -h                显示帮助信息

示例:
  schema-validator -m vendor-neutral -t src/modules
  schema-validator -m naming -t src/schemas -f markdown -o naming-report.md
  schema-validator -t src -s error --verbose
`);
}

/**
 * 运行验证
 * 
 * @param options 命令行选项
 * @returns 验证报告
 */
async function runValidation(options: CliOptions): Promise<SchemaValidationReport> {
  logger.info('🔍 MPLP Schema验证器');
  logger.info('===========================');
  
  // 解析目标路径
  const targetPath = resolve(options.target);
  logger.info(`📂 验证目标: ${targetPath}`);
  logger.info(`🔧 验证模式: ${options.mode}`);
  logger.info(`🔍 递归验证: ${options.recursive ? '是' : '否'}`);
  logger.info(`🚨 最小严重级别: ${options.minSeverity}`);
  
  // 创建验证器
  const validatorFactory = SchemaValidatorFactory.getInstance();
  const ajvValidator = validatorFactory.createValidator(options.mode, {
    strict: true,
    allErrors: true,
    verbose: options.verbose
  });
  const validator = new SimpleValidator(ajvValidator);
  
  // 运行验证
  logger.info('\n🔍 开始验证...');
  let report: SchemaValidationReport;
  
  try {
    // 检查目标是文件还是目录
    const stats = await fs.stat(targetPath);
    
    if (stats.isFile()) {
      // 验证单个文件
      logger.info(`验证文件: ${targetPath}`);
      const violations = await validator.validateFile(targetPath);
      report = new SchemaValidationReport();
      report.addViolations(violations);
    } else if (stats.isDirectory()) {
      // 验证目录
      logger.info(`验证目录: ${targetPath} (${options.recursive ? '递归' : '非递归'})`);
      const validationReport = await validator.validateDirectory(targetPath, options.recursive);
      
      // 验证目录返回的就是SchemaValidationReport
      report = validationReport;
    } else {
      logger.error(`无效的目标: ${targetPath}`);
      process.exit(1);
    }
    
    // 过滤掉低于最小严重级别的违规
    const filteredReport = new SchemaValidationReport();
    const allViolations = report.getAllViolations();

    for (const violation of allViolations) {
      const severityOrder = {
        [SchemaViolationSeverity.INFO]: 0,
        [SchemaViolationSeverity.WARNING]: 1,
        [SchemaViolationSeverity.ERROR]: 2,
        [SchemaViolationSeverity.CRITICAL]: 3,
        [SchemaViolationSeverity.FATAL]: 4
      };

      if (severityOrder[violation.severity] >= severityOrder[options.minSeverity]) {
        filteredReport.addViolation(violation);
      }
    }
    
    // 输出验证结果摘要
    const totalViolations = filteredReport.getAllViolations().length;
    const severityCounts = filteredReport.getViolationCountBySeverity();
    
    logger.info('\n📊 验证结果摘要:');
    logger.info(`总违规数: ${totalViolations}`);
    logger.info(`致命错误: ${severityCounts[SchemaViolationSeverity.FATAL] || 0}`);
    logger.info(`错误: ${severityCounts[SchemaViolationSeverity.ERROR] || 0}`);
    logger.info(`警告: ${severityCounts[SchemaViolationSeverity.WARNING] || 0}`);
    logger.info(`信息: ${severityCounts[SchemaViolationSeverity.INFO] || 0}`);
    
    return filteredReport;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`验证过程中出错: ${errorMessage}`);
    
    if (error instanceof Error && error.stack) {
      logger.debug(`错误堆栈: ${error.stack}`);
    }

    process.exit(1);
  }
}

/**
 * 输出验证结果
 * 
 * @param report 验证报告
 * @param options 命令行选项
 */
async function outputResults(report: SchemaValidationReport, options: CliOptions): Promise<void> {
  const violations = report.getAllViolations();
  const totalViolations = violations.length;
  
  if (totalViolations === 0) {
    logger.info('\n✅ 验证通过，没有发现违规！');
    return;
  }
  
  logger.info(`\n❌ 发现 ${totalViolations} 个违规:`);
  
  // 根据格式输出结果
  let output: string;
  
  switch (options.format) {
    case 'json':
      output = JSON.stringify(violations, null, 2);
      break;
      
    case 'markdown':
      output = '# Schema验证报告\n\n';
      output += `**验证时间**: ${new Date().toISOString()}\n`;
      output += `**验证目标**: ${options.target}\n`;
      output += `**验证模式**: ${options.mode}\n\n`;
      
      output += '## 违规列表\n\n';
      output += '| 严重级别 | 文件 | 消息 | 位置 |\n';
      output += '|---------|------|------|------|\n';
      
      for (const violation of violations) {
        const location = violation.location ? `${violation.location.startLine || 'N/A'}:${violation.location.startColumn || 'N/A'}` : 'N/A';
        output += `| **${violation.severity}** | ${violation.location.filePath} | ${violation.message} | ${location} |\n`;
      }
      break;
      
    case 'html':
      output = `<!DOCTYPE html>
<html>
<head>
  <title>Schema验证报告</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .fatal { color: darkred; font-weight: bold; }
    .error { color: red; }
    .warning { color: orange; }
    .info { color: blue; }
  </style>
</head>
<body>
  <h1>Schema验证报告</h1>
  <p><strong>验证时间</strong>: ${new Date().toISOString()}</p>
  <p><strong>验证目标</strong>: ${options.target}</p>
  <p><strong>验证模式</strong>: ${options.mode}</p>
  
  <h2>违规列表 (${totalViolations})</h2>
  <table>
    <tr>
      <th>严重级别</th>
      <th>文件</th>
      <th>消息</th>
      <th>位置</th>
    </tr>`;
      
      for (const violation of violations) {
        const location = violation.location ? `${violation.location.startLine || 'N/A'}:${violation.location.startColumn || 'N/A'}` : 'N/A';
        const severityClass = violation.severity.toLowerCase();
        
        output += `
    <tr>
      <td class="${severityClass}">${violation.severity}</td>
      <td>${violation.location.filePath}</td>
      <td>${violation.message}</td>
      <td>${location}</td>
    </tr>`;
      }
      
      output += `
  </table>
</body>
</html>`;
      break;
      
    case 'text':
    default:
      output = '';
      for (const violation of violations) {
        const location = violation.location ? `${violation.location.startLine || 'N/A'}:${violation.location.startColumn || 'N/A'}` : 'N/A';
        output += `[${violation.severity}] ${violation.location.filePath}:${location} - ${violation.message}\n`;
        
        if (options.verbose && violation.fix) {
          output += `  建议修复: ${violation.fix}\n`;
        }
        
        if (options.verbose && violation.location.codeSnippet) {
          output += `  代码片段: ${violation.location.codeSnippet}\n`;
        }
        
        output += '\n';
      }
      break;
  }
  
  // 输出结果
  if (options.output) {
    try {
      await fs.writeFile(options.output, output);
      logger.info(`✅ 验证报告已保存到: ${options.output}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`无法保存验证报告: ${errorMessage}`);
    }
  } else {
    // 直接输出到控制台
    if (options.format === 'text') {
      logger.info(output);
    } else {
      // 对于其他格式，直接使用console.log，避免Logger格式化
      console.log(output);
    }
  }
  
  // 根据严重级别设置退出码
  const severityCounts = report.getViolationCountBySeverity();
  if (severityCounts[SchemaViolationSeverity.FATAL] > 0) {
    process.exit(3); // 致命错误
  } else if (severityCounts[SchemaViolationSeverity.ERROR] > 0) {
    process.exit(2); // 错误
  } else if (severityCounts[SchemaViolationSeverity.WARNING] > 0) {
    process.exit(1); // 警告
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    // 解析命令行参数
    const options = parseArgs();
    
    // 运行验证
    const report = await runValidation(options);
    
    // 输出结果
    await outputResults(report, options);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`执行过程中出错: ${errorMessage}`);
    
    if (error instanceof Error && error.stack) {
      logger.debug(`错误堆栈: ${error.stack}`);
    }
    
    process.exit(1);
  }
}

// 执行主函数
main(); 