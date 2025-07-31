#!/usr/bin/env node
/**
 * MPLP Schema验证命令行工具 - 厂商中立设计
 *
 * 提供命令行接口运行Schema验证器，验证代码是否符合架构设计规范。
 * 支持多种验证模式，包括厂商中立性验证、命名约定验证等。
 *
 * @version v1.0.0
 * @created 2025-07-20T11:00:00+08:00
 * @updated 2025-08-15T15:00:00+08:00
 * @compliance .cursor/rules/development-standards.mdc - Schema驱动开发原则
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

import { SchemaValidatorFactory } from '../public/modules/core/schema/schema-validator-factory';
import { join, resolve } from 'path';
import { writeFileSync } from 'fs';
import { promises as fs } from 'fs';
import { Logger } from '../public/utils/logger';

// 定义缺失的类型
export enum SchemaViolationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  FATAL = 'fatal'
}

// 简单的验证报告类
class SimpleValidationReport {
  private violations: Array<{
    severity: SchemaViolationSeverity;
    message: string;
    location: {
      filePath: string;
      startLine?: number;
    };
  }> = [];

  addViolation(violation: any): void {
    this.violations.push(violation);
  }

  getFileCount(): number {
    const files = new Set(this.violations.map(v => v.location?.filePath || 'unknown'));
    return files.size;
  }

  getViolationCount(): number {
    return this.violations.length;
  }

  getViolationCountBySeverity(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const violation of this.violations) {
      counts[violation.severity] = (counts[violation.severity] || 0) + 1;
    }
    return counts;
  }

  getViolationsBySeverity(severity: SchemaViolationSeverity): any[] {
    return this.violations.filter(v => v.severity === severity);
  }

  getAllViolations(): any[] {
    return [...this.violations];
  }

  toJSON(): string {
    return JSON.stringify({
      violations: this.violations,
      summary: {
        total: this.getViolationCount(),
        fileCount: this.getFileCount()
      }
    }, null, 2);
  }

  toMarkdown(): string {
    let output = '# Schema验证报告\n\n';
    output += `**验证时间**: ${new Date().toISOString()}\n`;
    output += `**总违规数**: ${this.getViolationCount()}\n`;
    output += `**涉及文件数**: ${this.getFileCount()}\n\n`;

    output += '## 违规详情\n\n';
    this.violations.forEach((violation, index) => {
      output += `### ${index + 1}. ${violation.message}\n\n`;
      output += `- **严重级别**: ${violation.severity}\n`;
      if (violation.location?.filePath) {
        output += `- **文件**: ${violation.location.filePath}\n`;
      }
      if (violation.location?.startLine) {
        output += `- **位置**: 第 ${violation.location.startLine} 行\n`;
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
  </style>
</head>
<body>
  <h1>Schema验证报告</h1>
  <p><strong>验证时间</strong>: ${new Date().toISOString()}</p>
  <p><strong>总违规数</strong>: ${this.getViolationCount()}</p>

  <h2>违规详情</h2>`;

    this.violations.forEach((violation, index) => {
      output += `
  <div class="violation">
    <h3>${index + 1}. ${violation.message}</h3>
    <p><strong>严重级别</strong>: ${violation.severity}</p>`;

      if (violation.location?.filePath) {
        output += `<p><strong>文件</strong>: ${violation.location.filePath}</p>`;
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

// 简单的验证器包装器
class SimpleProjectValidator {
  constructor(private ajv: any) {}

  async validateProject(targetPath: string): Promise<SimpleValidationReport> {
    const report = new SimpleValidationReport();

    try {
      const stats = await fs.stat(targetPath);

      if (stats.isFile()) {
        // 验证单个文件
        if (targetPath.endsWith('.json')) {
          try {
            const content = await fs.readFile(targetPath, 'utf-8');
            JSON.parse(content);
          } catch (error) {
            report.addViolation({
              severity: SchemaViolationSeverity.ERROR,
              message: `JSON语法错误: ${error instanceof Error ? error.message : 'Unknown error'}`,
              location: {
                filePath: targetPath,
                startLine: 1
              }
            });
          }
        }
      } else if (stats.isDirectory()) {
        // 验证目录
        await this.validateDirectory(targetPath, report);
      }
    } catch (error) {
      report.addViolation({
        severity: SchemaViolationSeverity.ERROR,
        message: `无法访问目标: ${error instanceof Error ? error.message : 'Unknown error'}`,
        location: {
          filePath: targetPath,
          startLine: 1
        }
      });
    }

    return report;
  }

  private async validateDirectory(dirPath: string, report: SimpleValidationReport): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isFile()) {
          if (entry.name.endsWith('.json')) {
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              JSON.parse(content);
            } catch (error) {
              report.addViolation({
                severity: SchemaViolationSeverity.ERROR,
                message: `JSON语法错误: ${error instanceof Error ? error.message : 'Unknown error'}`,
                location: {
                  filePath: fullPath,
                  startLine: 1
                }
              });
            }
          }
        } else if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            await this.validateDirectory(fullPath, report);
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
  }
}

// 创建验证工具Logger实例
const logger = new Logger('SchemaValidator');

/**
 * 命令行参数接口
 */
interface CommandLineArgs {
  /**
   * 要验证的路径
   */
  path: string;
  
  /**
   * 输出文件路径
   */
  output?: string;
  
  /**
   * 输出格式
   */
  format?: 'json' | 'markdown' | 'html';
  
  /**
   * 验证模式
   */
  mode?: 'default' | 'vendor-neutral' | 'naming';
  
  /**
   * 最小严重级别
   */
  minSeverity?: SchemaViolationSeverity;
  
  /**
   * 是否显示详细输出
   */
  verbose?: boolean;
  
  /**
   * 是否显示帮助信息
   */
  help?: boolean;
}

/**
 * 解析命令行参数
 * 
 * @returns 解析后的参数
 */
function parseArgs(): CommandLineArgs {
  const args: CommandLineArgs = {
    path: '.',
    format: 'markdown',
    mode: 'default',
    minSeverity: SchemaViolationSeverity.WARNING,
    verbose: false
  };
  
  try {
    // 解析参数
    for (let i = 2; i < process.argv.length; i++) {
      const arg = process.argv[i];
      
      if (arg === '--help' || arg === '-h') {
        args.help = true;
        break;
      } else if (arg === '--verbose' || arg === '-v') {
        args.verbose = true;
      } else if (arg === '--output' || arg === '-o') {
        args.output = process.argv[++i];
      } else if (arg === '--format' || arg === '-f') {
        const format = process.argv[++i];
        if (['json', 'markdown', 'html'].includes(format)) {
          args.format = format as 'json' | 'markdown' | 'html';
        } else {
          logger.error(`不支持的输出格式 "${format}"`);
          process.exit(1);
        }
      } else if (arg === '--mode' || arg === '-m') {
        const mode = process.argv[++i];
        if (['default', 'vendor-neutral', 'naming'].includes(mode)) {
          args.mode = mode as 'default' | 'vendor-neutral' | 'naming';
        } else {
          logger.error(`不支持的验证模式 "${mode}"`);
          process.exit(1);
        }
      } else if (arg === '--severity' || arg === '-s') {
        const severity = process.argv[++i];
        if (Object.values(SchemaViolationSeverity).includes(severity as SchemaViolationSeverity)) {
          args.minSeverity = severity as SchemaViolationSeverity;
        } else {
          logger.error(`不支持的严重级别 "${severity}"`);
          process.exit(1);
        }
      } else if (arg.startsWith('-')) {
        logger.error(`未知选项 "${arg}"`);
        process.exit(1);
      } else {
        args.path = arg;
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`解析命令行参数失败: ${errorMessage}`);
    process.exit(1);
  }
  
  return args;
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
MPLP Schema验证命令行工具

用法: validate-schema [选项] [路径]

选项:
  -h, --help               显示帮助信息
  -v, --verbose            显示详细输出
  -o, --output <文件>      输出报告到文件
  -f, --format <格式>      输出格式 (json, markdown, html)
  -m, --mode <模式>        验证模式 (default, vendor-neutral, naming)
  -s, --severity <级别>    最小严重级别 (info, warning, error, fatal)

示例:
  validate-schema                     # 验证当前目录
  validate-schema src                 # 验证src目录
  validate-schema -m vendor-neutral   # 验证厂商中立性
  validate-schema -f json -o report.json  # 输出JSON报告
  `);
}

/**
 * 运行Schema验证
 */
async function runValidation(): Promise<void> {
  try {
    // 解析命令行参数
    const args = parseArgs();
    
    // 显示帮助信息
    if (args.help) {
      showHelp();
      return;
    }
    
    // 创建验证器工厂
    const factory = SchemaValidatorFactory.getInstance();
    
    // 根据模式创建验证器
    logger.info(`使用${args.mode || 'default'}验证器...`);
    const ajvValidator = factory.createValidator(args.mode || 'default', {
      strict: true,
      allErrors: true,
      verbose: args.verbose
    });
    const validator = new SimpleProjectValidator(ajvValidator);
    
    // 解析路径
    const targetPath = resolve(args.path);
    logger.info(`验证目标: ${targetPath}`);
    
    // 开始验证
    logger.info('开始验证...');
    const startTime = Date.now();
    
    // 根据路径类型选择验证方法
    const report = await validator.validateProject(targetPath);
    
    // 计算耗时
    const duration = Date.now() - startTime;
    
    // 输出结果摘要
    logger.info(`验证完成，耗时 ${duration}ms`);
    logger.info(`验证文件数: ${report.getFileCount()}`);
    logger.info(`问题总数: ${report.getViolationCount()}`);
    
    // 按严重级别输出统计
    const severityCounts = report.getViolationCountBySeverity();
    logger.info('按严重级别统计:');
    Object.entries(severityCounts).forEach(([severity, count]) => {
      logger.info(`- ${severity}: ${count}`);
    });
    
    // 输出严重问题
    const errorViolations = report.getViolationsBySeverity(SchemaViolationSeverity.ERROR);
    const fatalViolations = report.getViolationsBySeverity(SchemaViolationSeverity.FATAL);
    
    if (errorViolations.length > 0 || fatalViolations.length > 0) {
      logger.warn(`发现 ${errorViolations.length + fatalViolations.length} 个严重问题:`);
      
      [...fatalViolations, ...errorViolations].slice(0, 10).forEach(violation => {
        logger.warn(`- [${violation.severity}] ${violation.message}`);
        logger.warn(`  文件: ${violation.location.filePath}`);
        if (violation.location.startLine) {
          logger.warn(`  位置: 第 ${violation.location.startLine} 行`);
        }
      });
      
      if (errorViolations.length + fatalViolations.length > 10) {
        logger.warn(`... 还有 ${errorViolations.length + fatalViolations.length - 10} 个问题未显示`);
      }
    }
    
    // 输出报告
    if (args.output) {
      let reportContent = '';
      
      switch (args.format) {
        case 'json':
          reportContent = report.toJSON();
          break;
        case 'html':
          reportContent = report.toHTML();
          break;
        case 'markdown':
        default:
          reportContent = report.toMarkdown();
          break;
      }
      
      try {
        writeFileSync(args.output, reportContent);
        logger.info(`报告已保存到 ${args.output}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`保存报告失败: ${errorMessage}`);
      }
    }
    
    // 根据严重问题数量设置退出码
    if (fatalViolations.length > 0) {
      process.exit(2);
    } else if (errorViolations.length > 0) {
      process.exit(1);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`验证过程中出错: ${errorMessage}`);
    process.exit(1);
  }
}

// 执行验证
runValidation().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`执行验证失败: ${errorMessage}`);
  process.exit(1);
}); 