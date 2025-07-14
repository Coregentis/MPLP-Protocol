#!/usr/bin/env node
/**
 * MPLP Schema验证命令行工具
 *
 * 提供命令行接口运行Schema验证器，验证代码是否符合架构设计规范。
 *
 * @version v1.0.0
 * @created 2025-07-20T11:00:00+08:00
 */

import { SchemaValidatorFactory } from '../core/schema/validator-factory';
import { SchemaViolationSeverity } from '../core/schema/interfaces';
import { join, resolve } from 'path';
import { writeFileSync } from 'fs';

// 解析命令行参数
interface CommandLineArgs {
  path: string;
  output?: string;
  format?: 'json' | 'markdown' | 'html';
  mode?: 'default' | 'vendor-neutral' | 'naming';
  minSeverity?: SchemaViolationSeverity;
  verbose?: boolean;
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
        console.error(`错误: 不支持的输出格式 "${format}"`);
        process.exit(1);
      }
    } else if (arg === '--mode' || arg === '-m') {
      const mode = process.argv[++i];
      if (['default', 'vendor-neutral', 'naming'].includes(mode)) {
        args.mode = mode as 'default' | 'vendor-neutral' | 'naming';
      } else {
        console.error(`错误: 不支持的验证模式 "${mode}"`);
        process.exit(1);
      }
    } else if (arg === '--severity' || arg === '-s') {
      const severity = process.argv[++i];
      if (Object.values(SchemaViolationSeverity).includes(severity as SchemaViolationSeverity)) {
        args.minSeverity = severity as SchemaViolationSeverity;
      } else {
        console.error(`错误: 不支持的严重级别 "${severity}"`);
        process.exit(1);
      }
    } else if (arg.startsWith('-')) {
      console.error(`错误: 未知选项 "${arg}"`);
      process.exit(1);
    } else {
      args.path = arg;
    }
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
  // 解析命令行参数
  const args = parseArgs();
  
  // 显示帮助信息
  if (args.help) {
    showHelp();
    return;
  }
  
  // 创建验证器工厂
  const factory = new SchemaValidatorFactory();
  
  // 根据模式创建验证器
  let validator;
  switch (args.mode) {
    case 'vendor-neutral':
      console.log('使用厂商中立验证器...');
      validator = factory.createVendorNeutralValidator();
      break;
    case 'naming':
      console.log('使用命名约定验证器...');
      validator = factory.createNamingConventionValidator();
      break;
    default:
      console.log('使用默认验证器...');
      validator = factory.createDefaultValidator();
      break;
  }
  
  // 解析路径
  const targetPath = resolve(args.path);
  console.log(`验证目标: ${targetPath}`);
  
  // 开始验证
  console.log('开始验证...');
  const startTime = Date.now();
  
  // 根据路径类型选择验证方法
  const report = await validator.validateProject(targetPath);
  
  // 计算耗时
  const duration = Date.now() - startTime;
  
  // 输出结果摘要
  console.log(`\n验证完成，耗时 ${duration}ms`);
  console.log(`验证文件数: ${report.getFileCount()}`);
  console.log(`问题总数: ${report.getViolationCount()}`);
  
  // 按严重级别输出统计
  const severityCounts = report.getViolationCountBySeverity();
  console.log('\n按严重级别统计:');
  Object.entries(severityCounts).forEach(([severity, count]) => {
    console.log(`- ${severity}: ${count}`);
  });
  
  // 输出严重问题
  const errorViolations = report.getViolationsBySeverity(SchemaViolationSeverity.ERROR);
  const fatalViolations = report.getViolationsBySeverity(SchemaViolationSeverity.FATAL);
  
  if (errorViolations.length > 0 || fatalViolations.length > 0) {
    console.log(`\n发现 ${errorViolations.length + fatalViolations.length} 个严重问题:`);
    
    [...fatalViolations, ...errorViolations].slice(0, 10).forEach(violation => {
      console.log(`- [${violation.severity}] ${violation.message}`);
      console.log(`  文件: ${violation.location.filePath}`);
      if (violation.location.startLine) {
        console.log(`  位置: 第 ${violation.location.startLine} 行`);
      }
    });
    
    if (errorViolations.length + fatalViolations.length > 10) {
      console.log(`... 还有 ${errorViolations.length + fatalViolations.length - 10} 个问题未显示`);
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
      default:
        reportContent = report.toMarkdown();
        break;
    }
    
    try {
      writeFileSync(args.output, reportContent);
      console.log(`\n报告已保存到: ${args.output}`);
    } catch (error) {
      console.error(`\n保存报告失败:`, error);
    }
  }
  
  // 根据严重问题数量设置退出码
  if (fatalViolations.length > 0) {
    process.exit(2);
  } else if (errorViolations.length > 0) {
    process.exit(1);
  }
}

// 运行验证
runValidation().catch(error => {
  console.error('验证过程中发生错误:', error);
  process.exit(1);
}); 