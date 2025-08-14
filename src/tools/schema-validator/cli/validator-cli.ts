#!/usr/bin/env node
/**
 * MPLP Schema Validator CLI
 * 
 * @description 协议验证工具命令行接口
 * @version 1.0.0
 * @standardized MPLP协议验证工具标准化规范 v1.0.0
 */

import * as fs from 'fs/promises';
import { program } from 'commander';
import {
  DataValidationRequest,
  ValidationResult,
  ReportGenerator
} from '../types';
import { getValidatorFactory } from '../core/validator-factory';

/**
 * CLI选项接口
 */
interface CheckSyntaxOptions {
  path: string;
  output?: string;
  format: string;
  verbose: boolean;
  strict: boolean;
}

interface CheckCompatibilityOptions {
  path: string;
  source?: string;
  target?: string;
  output?: string;
  format: string;
  verbose: boolean;
}

interface ValidateDataOptions {
  schema: string;
  data: string;
  output?: string;
  format: string;
  strict: boolean;
  allowAdditional: boolean;
}

interface GenerateDocsOptions {
  path: string;
  output: string;
  format: string;
}

/**
 * CLI日志工具类
 */
class CliLogger {
  static info(message: string): void {
    // eslint-disable-next-line no-console
    console.log(message);
  }

  static error(message: string): void {
    // eslint-disable-next-line no-console
    console.error(message);
  }

  static success(message: string): void {
    // eslint-disable-next-line no-console
    console.log(message);
  }
}

/**
 * CLI主类
 */
class ValidatorCli {
  private readonly version = '1.0.0';

  /**
   * 初始化CLI
   */
  async initialize(): Promise<void> {
    program
      .name('mplp-validator')
      .description('MPLP Schema Validation Tool')
      .version(this.version);

    // 语法检查命令
    program
      .command('check-syntax')
      .description('Check schema syntax and structure')
      .option('-p, --path <path>', 'Schema file or directory path', 'src/schemas')
      .option('-o, --output <file>', 'Output file path')
      .option('-f, --format <format>', 'Output format (json|text|html|junit)', 'text')
      .option('-v, --verbose', 'Verbose output', false)
      .option('-s, --strict', 'Strict validation mode', false)
      .action(async (options) => {
        await this.handleCheckSyntax(options);
      });

    // 兼容性检查命令
    program
      .command('check-compatibility')
      .description('Check schema compatibility')
      .option('-p, --path <path>', 'Schema directory path', 'src/schemas')
      .option('-s, --source <schema>', 'Source schema name')
      .option('-t, --target <schema>', 'Target schema name')
      .option('-o, --output <file>', 'Output file path')
      .option('-f, --format <format>', 'Output format (json|text|html)', 'text')
      .option('-v, --verbose', 'Verbose output', false)
      .action(async (options) => {
        await this.handleCheckCompatibility(options);
      });

    // 数据验证命令
    program
      .command('validate')
      .description('Validate data against schema')
      .option('-s, --schema <name>', 'Schema name to validate against')
      .option('-d, --data <file>', 'Data file to validate')
      .option('-o, --output <file>', 'Output file path')
      .option('-f, --format <format>', 'Output format (json|text)', 'text')
      .option('--strict', 'Strict validation mode', false)
      .option('--allow-additional', 'Allow additional properties', false)
      .action(async (options) => {
        await this.handleValidateData(options);
      });

    // 生成文档命令
    program
      .command('generate-docs')
      .description('Generate schema documentation')
      .option('-p, --path <path>', 'Schema directory path', 'src/schemas')
      .option('-o, --output <file>', 'Output file path', 'schema-docs.html')
      .option('-f, --format <format>', 'Output format (html|markdown)', 'html')
      .action(async (options) => {
        await this.handleGenerateDocs(options);
      });

    // 解析命令行参数
    await program.parseAsync();
  }

  /**
   * 处理语法检查命令
   */
  private async handleCheckSyntax(options: CheckSyntaxOptions): Promise<void> {
    try {
      CliLogger.info('🔍 MPLP Schema Syntax Validation');
      CliLogger.info('================================');

      const factory = getValidatorFactory(options.path);
      const syntaxValidator = factory.createSyntaxValidator();
      const reportGenerator = factory.createReportGenerator();

      let results: ValidationResult[];
      const stats = await fs.stat(options.path);

      if (stats.isFile()) {
        CliLogger.info(`Validating file: ${options.path}`);
        results = [await syntaxValidator.validateSchema(options.path)];
      } else {
        CliLogger.info(`Validating directory: ${options.path}`);
        results = await syntaxValidator.validateAllSchemas();
      }

      // 生成报告
      const report = this.generateReport(results, options.format, reportGenerator);

      // 输出结果
      if (options.output) {
        await fs.writeFile(options.output, report);
        CliLogger.success(`✅ Report saved to: ${options.output}`);
      } else {
        CliLogger.info('\n' + report);
      }

      // 设置退出码
      const hasErrors = results.some((r: { isValid: boolean }) => !r.isValid);
      process.exit(hasErrors ? 1 : 0);

    } catch (error) {
      CliLogger.error('❌ Syntax validation failed: ' + (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * 处理兼容性检查命令
   */
  private async handleCheckCompatibility(options: CheckCompatibilityOptions): Promise<void> {
    try {
      CliLogger.info('🔄 MPLP Schema Compatibility Check');
      CliLogger.info('==================================');

      const factory = getValidatorFactory(options.path);
      const compatibilityValidator = factory.createCompatibilityValidator();
      const reportGenerator = factory.createReportGenerator();

      let results: ValidationResult[];

      if (options.source && options.target) {
        CliLogger.info(`Checking compatibility: ${options.source} -> ${options.target}`);
        results = [await compatibilityValidator.checkCompatibility(options.source, options.target)];
      } else {
        CliLogger.info('Validating compatibility matrix...');
        results = [await compatibilityValidator.validateCompatibilityMatrix()];
      }

      // 生成报告
      const report = this.generateReport(results, options.format, reportGenerator);

      // 输出结果
      if (options.output) {
        await fs.writeFile(options.output, report);
        CliLogger.success(`✅ Report saved to: ${options.output}`);
      } else {
        CliLogger.info('\n' + report);
      }

      // 生成兼容性报告
      if (!options.source && !options.target) {
        const compatibilityReport = await compatibilityValidator.generateCompatibilityReport();
        CliLogger.info('\n📊 Compatibility Summary:');
        CliLogger.info(`Total checks: ${compatibilityReport.totalCompatibilityChecks}`);
        CliLogger.info(`Compatible pairs: ${compatibilityReport.compatiblePairs}`);
        CliLogger.info(`Incompatible pairs: ${compatibilityReport.incompatiblePairs}`);
        CliLogger.info(`Deprecated pairs: ${compatibilityReport.deprecatedPairs}`);
      }

      // 设置退出码
      const hasErrors = results.some((r: { isValid: boolean }) => !r.isValid);
      process.exit(hasErrors ? 1 : 0);

    } catch (error) {
      CliLogger.error('❌ Compatibility check failed: ' + (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * 处理数据验证命令
   */
  private async handleValidateData(options: ValidateDataOptions): Promise<void> {
    try {
      CliLogger.info('📋 MPLP Data Validation');
      CliLogger.info('=======================');

      if (!options.schema || !options.data) {
        CliLogger.error('❌ Both --schema and --data options are required');
        process.exit(1);
      }

      const factory = getValidatorFactory();
      const dataValidator = factory.createDataValidator();

      // 读取数据文件
      CliLogger.info(`Loading data from: ${options.data}`);
      const dataContent = await fs.readFile(options.data, 'utf-8');
      const data = JSON.parse(dataContent);

      // 创建验证请求
      const request: DataValidationRequest = {
        schemaName: options.schema,
        data,
        validationOptions: {
          strictMode: options.strict || false,
          allowAdditionalProperties: options.allowAdditional || false,
          validateReferences: true,
          customValidators: {}
        }
      };

      // 执行验证
      CliLogger.info(`Validating against schema: ${options.schema}`);
      const result = await dataValidator.validateData(request);

      // 生成报告
      let report: string;
      if (options.format === 'json') {
        report = JSON.stringify({
          isValid: result.isValid,
          errors: result.errors,
          warnings: result.warnings,
          metadata: result.metadata
        }, null, 2);
      } else {
        report = this.generateDataValidationTextReport(result);
      }

      // 输出结果
      if (options.output) {
        await fs.writeFile(options.output, report);
        CliLogger.success(`✅ Report saved to: ${options.output}`);
      } else {
        CliLogger.info('\n' + report);
      }

      // 设置退出码
      process.exit(result.isValid ? 0 : 1);

    } catch (error) {
      CliLogger.error('❌ Data validation failed: ' + (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * 处理文档生成命令
   */
  private async handleGenerateDocs(_options: GenerateDocsOptions): Promise<void> {
    try {
      CliLogger.info('📚 MPLP Schema Documentation Generation');
      CliLogger.info('=======================================');

      // 这里可以实现文档生成逻辑
      CliLogger.info('Documentation generation is not yet implemented');
      CliLogger.info('This feature will be available in a future version');

    } catch (error) {
      CliLogger.error('❌ Documentation generation failed: ' + (error as Error).message);
      process.exit(1);
    }
  }

  /**
   * 生成报告
   */
  private generateReport(results: ValidationResult[], format: string, reportGenerator: ReportGenerator): string {
    switch (format) {
      case 'json':
        return reportGenerator.generateJsonReport(results);
      case 'html':
        return reportGenerator.generateHtmlReport(results);
      case 'junit':
        return reportGenerator.generateJunitReport(results);
      case 'text':
      default:
        return reportGenerator.generateTextReport(results);
    }
  }

  /**
   * 生成数据验证文本报告
   */
  private generateDataValidationTextReport(result: {
    isValid: boolean;
    errors: Array<{
      errorMessage: string;
      errorPath?: string;
      expectedType: string;
      actualType: string;
    }>;
    warnings: Array<{
      warningMessage: string;
      warningPath?: string;
      suggestion: string;
    }>;
    metadata: {
      schemaUsed: string;
      validationTimeMs: number;
      dataSize: number;
    };
  }): string {
    const lines: string[] = [];
    
    lines.push('DATA VALIDATION RESULT');
    lines.push('='.repeat(40));
    lines.push(`Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
    lines.push(`Schema: ${result.metadata.schemaUsed}`);
    lines.push(`Validation Time: ${result.metadata.validationTimeMs}ms`);
    lines.push(`Data Size: ${result.metadata.dataSize} bytes`);
    lines.push('');

    if (result.errors.length > 0) {
      lines.push('ERRORS:');
      lines.push('-'.repeat(20));
      for (const error of result.errors) {
        lines.push(`• ${error.errorMessage}`);
        lines.push(`  Path: ${error.errorPath || 'root'}`);
        lines.push(`  Expected: ${error.expectedType}`);
        lines.push(`  Actual: ${error.actualType}`);
        lines.push('');
      }
    }

    if (result.warnings.length > 0) {
      lines.push('WARNINGS:');
      lines.push('-'.repeat(20));
      for (const warning of result.warnings) {
        lines.push(`• ${warning.warningMessage}`);
        lines.push(`  Path: ${warning.warningPath || 'root'}`);
        lines.push(`  Suggestion: ${warning.suggestion}`);
        lines.push('');
      }
    }

    if (result.isValid) {
      lines.push('✅ Data validation passed successfully!');
    }

    return lines.join('\n');
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const cli = new ValidatorCli();
  await cli.initialize();
}

// 运行CLI
if (require.main === module) {
  main().catch((error) => {
    CliLogger.error('❌ CLI execution failed: ' + error.message);
    process.exit(1);
  });
}

export { ValidatorCli };
