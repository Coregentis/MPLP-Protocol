/**
 * MPLP Schema验证器示例
 *
 * 展示如何使用Schema验证器验证代码是否符合架构设计规范。
 *
 * @version v1.0.0
 * @created 2025-07-20T10:00:00+08:00
 */

import { SchemaValidatorFactory } from '../core/schema/validator-factory';
import { SchemaViolationSeverity } from '../core/schema/interfaces';
import { join } from 'path';

/**
 * 运行Schema验证器示例
 */
async function runSchemaValidatorExample(): Promise<void> {
  console.log('开始运行Schema验证器示例...');

  // 创建验证器工厂
  const factory = new SchemaValidatorFactory();
  
  // 创建默认验证器
  console.log('创建默认验证器...');
  const defaultValidator = factory.createDefaultValidator();
  
  // 验证单个文件
  console.log('\n验证单个文件...');
  const filePath = join(__dirname, '../modules/context/context-service.ts');
  const fileViolations = await defaultValidator.validateFile(filePath);
  console.log(`文件 ${filePath} 验证结果: ${fileViolations.length} 个问题`);
  fileViolations.forEach(violation => {
    console.log(`- [${violation.severity}] ${violation.message}`);
  });
  
  // 验证目录
  console.log('\n验证目录...');
  const dirPath = join(__dirname, '../modules/context');
  const dirReport = await defaultValidator.validateDirectory(dirPath);
  console.log(`目录 ${dirPath} 验证结果: ${dirReport.getViolationCount()} 个问题`);
  console.log('按严重级别统计:');
  console.log(dirReport.getViolationCountBySeverity());
  
  // 创建厂商中立验证器
  console.log('\n创建厂商中立验证器...');
  const vendorNeutralValidator = factory.createVendorNeutralValidator();
  
  // 验证项目
  console.log('\n验证项目厂商中立性...');
  const projectRoot = join(__dirname, '../..');
  const projectReport = await vendorNeutralValidator.validateProject(projectRoot);
  console.log(`项目验证结果: ${projectReport.getViolationCount()} 个问题`);
  
  // 输出严重问题
  console.log('\n严重问题:');
  const fatalViolations = projectReport.getViolationsBySeverity(SchemaViolationSeverity.FATAL);
  const errorViolations = projectReport.getViolationsBySeverity(SchemaViolationSeverity.ERROR);
  
  [...fatalViolations, ...errorViolations].forEach(violation => {
    console.log(`- [${violation.severity}] ${violation.message}`);
    console.log(`  文件: ${violation.location.filePath}`);
    if (violation.location.startLine) {
      console.log(`  位置: 第 ${violation.location.startLine} 行`);
    }
    if (violation.location.codeSnippet) {
      console.log(`  代码: ${violation.location.codeSnippet.slice(0, 100)}...`);
    }
    if (violation.fix) {
      console.log(`  修复建议: ${violation.fix}`);
    }
    console.log();
  });
  
  // 导出报告
  console.log('\n导出报告...');
  const jsonReport = projectReport.toJSON();
  const markdownReport = projectReport.toMarkdown();
  
  console.log('JSON报告示例:');
  console.log(jsonReport.slice(0, 300) + '...');
  
  console.log('\nMarkdown报告示例:');
  console.log(markdownReport.slice(0, 300) + '...');
  
  console.log('\nSchema验证器示例运行完成');
}

// 运行示例
runSchemaValidatorExample().catch(error => {
  console.error('运行示例时发生错误:', error);
}); 