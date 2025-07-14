#!/usr/bin/env node
/**
 * MPLP Schema验证器命令行工具
 *
 * 提供命令行接口，用于验证代码是否符合Schema规范。
 *
 * @version v1.0.0
 * @created 2025-07-19T20:00:00+08:00
 */

import { createDefaultValidator, createVendorNeutralValidator, createNamingConventionValidator, SchemaValidationReport, SchemaViolationSeverity } from '../core/schema';
import { join, resolve } from 'path';
import { promises as fs } from 'fs';
import { createInterface } from 'readline';

// 命令行参数
interface CliOptions {
  mode: 'default' | 'vendor-neutral' | 'naming';
  target: string;
  recursive: boolean;
  format: 'text' | 'json' | 'markdown' | 'html';
  output?: string;
  minSeverity: SchemaViolationSeverity;
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
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--mode':
      case '-m':
        const mode = args[++i];
        if (mode === 'default' || mode === 'vendor-neutral' || mode === 'naming') {
          options.mode = mode;
        } else {
          console.error(`❌ 无效的模式: ${mode}`);
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
          console.error(`❌ 无效的格式: ${format}`);
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
          console.error(`❌ 无效的严重级别: ${severity}`);
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
        console.error(`❌ 无效的参数: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }
  
  return options;
}

/**
 * 打印帮助信息
 */
function printHelp(): void {
  console.log(`
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
 */
async function runValidation(options: CliOptions): Promise<void> {
  console.log('🔍 MPLP Schema验证器');
  console.log('===========================');
  
  // 解析目标路径
  const targetPath = resolve(options.target);
  console.log(`📂 验证目标: ${targetPath}`);
  console.log(`🔧 验证模式: ${options.mode}`);
  console.log(`🔍 递归验证: ${options.recursive ? '是' : '否'}`);
  console.log(`🚨 最小严重级别: ${options.minSeverity}`);
  
  // 创建验证器
  let validator;
  switch (options.mode) {
    case 'vendor-neutral':
      validator = createVendorNeutralValidator();
      break;
    case 'naming':
      validator = createNamingConventionValidator();
      break;
    default:
      validator = createDefaultValidator();
      break;
  }
  
  // 运行验证
  console.log('\n🔍 开始验证...');
  let report: SchemaValidationReport;
  
  try {
    // 检查目标是文件还是目录
    const stats = await fs.stat(targetPath);
    
    if (stats.isFile()) {
      // 验证单个文件
      const violations = await validator.validateFile(targetPath);
      report = new SchemaValidationReport();
      report.addViolations(violations);
    } else if (stats.isDirectory()) {
      // 验证目录
      const validationReport = await validator.validateDirectory(targetPath, options.recursive);
      
      // 确保返回的是SchemaValidationReport类型
      if (validationReport instanceof SchemaValidationReport) {
        report = validationReport;
      } else {
        // 如果不是，创建一个新的报告并复制数据
        report = new SchemaValidationReport();
        report.addViolations(validationReport.getAllViolations());
      }
    } else {
      console.error(`❌ 无效的目标: ${targetPath}`);
      process.exit(1);
      return;
    }
  } catch (error) {
    console.error(`❌ 验证失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
    return;
  }
  
  // 输出验证结果
  outputResults(report, options);
}

/**
 * 输出验证结果
 * 
 * @param report 验证报告
 * @param options 命令行选项
 */
async function outputResults(report: SchemaValidationReport, options: CliOptions): Promise<void> {
  // 输出摘要
  console.log(`\n📊 验证结果摘要:`);
  console.log(`- 验证文件数: ${report.getFileCount()}`);
  console.log(`- 问题总数: ${report.getViolationCount()}`);
  console.log(`- 按严重级别统计:`);
  const severityCounts = report.getViolationCountBySeverity();
  Object.entries(severityCounts).forEach(([severity, count]) => {
    console.log(`  - ${severity}: ${count}`);
  });
  
  // 根据格式输出结果
  let output: string;
  switch (options.format) {
    case 'json':
      output = report.toJSON();
      break;
    case 'markdown':
      output = report.toMarkdown();
      break;
    case 'html':
      output = report.toHTML();
      break;
    default:
      // 文本格式，直接输出到控制台
      if (report.getViolationCount() > 0) {
        console.log('\n🔍 问题详情:');
        const violations = report.getAllViolations();
        violations.forEach((violation, index) => {
          console.log(`\n${index + 1}. ${violation.message}`);
          console.log(`   文件: ${violation.location.filePath}`);
          console.log(`   位置: 第${violation.location.startLine || '?'}行`);
          console.log(`   规则类型: ${violation.ruleType}`);
          console.log(`   严重级别: ${violation.severity}`);
          if (violation.fix && options.verbose) {
            console.log(`   修复建议: ${violation.fix}`);
          }
        });
      }
      return;
  }
  
  // 保存到文件
  if (options.output) {
    try {
      await fs.writeFile(options.output, output);
      console.log(`\n💾 报告已保存到: ${options.output}`);
    } catch (error) {
      console.error(`❌ 保存报告失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // 输出到控制台
    console.log('\n📄 报告内容:');
    console.log(output);
  }
  
  // 根据验证结果设置退出码
  if (report.getViolationCount() > 0) {
    const errorCount = report.getViolationsBySeverity(SchemaViolationSeverity.ERROR).length +
                      report.getViolationsBySeverity(SchemaViolationSeverity.FATAL).length;
    
    if (errorCount > 0) {
      process.exitCode = 1;
    }
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    const options = parseArgs();
    await runValidation(options);
  } catch (error) {
    console.error(`❌ 运行失败: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// 运行主函数
main(); 