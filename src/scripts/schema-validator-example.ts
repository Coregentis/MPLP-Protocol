/**
 * MPLP Schema验证器示例
 *
 * 演示如何使用Schema验证器验证代码是否符合规范。
 *
 * @version v1.0.0
 * @created 2025-07-19T19:30:00+08:00
 */

import { createDefaultValidator, createVendorNeutralValidator, createNamingConventionValidator } from '../core/schema';
import { join } from 'path';

/**
 * 运行Schema验证示例
 */
async function runSchemaValidationExample(): Promise<void> {
  console.log('🔍 MPLP Schema验证器示例');
  console.log('===========================');
  
  // 获取项目根目录
  const projectRoot = process.cwd();
  console.log(`📂 项目根目录: ${projectRoot}`);
  
  // 创建默认验证器
  console.log('\n🛠️ 使用默认验证器验证项目');
  const defaultValidator = createDefaultValidator();
  const defaultReport = await defaultValidator.validateDirectory(join(projectRoot, 'src/modules'), true);
  
  // 输出验证结果摘要
  console.log(`\n📊 验证结果摘要:`);
  console.log(`- 验证文件数: ${defaultReport.getFileCount()}`);
  console.log(`- 问题总数: ${defaultReport.getViolationCount()}`);
  console.log(`- 按严重级别统计:`);
  const severityCounts = defaultReport.getViolationCountBySeverity();
  Object.entries(severityCounts).forEach(([severity, count]) => {
    console.log(`  - ${severity}: ${count}`);
  });
  
  // 输出验证结果详情
  if (defaultReport.getViolationCount() > 0) {
    console.log('\n🔍 前5个问题详情:');
    const violations = defaultReport.getAllViolations().slice(0, 5);
    violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.message}`);
      console.log(`   文件: ${violation.location.filePath}`);
      console.log(`   位置: 第${violation.location.startLine || '?'}行`);
      console.log(`   规则类型: ${violation.ruleType}`);
      console.log(`   严重级别: ${violation.severity}`);
      if (violation.fix) {
        console.log(`   修复建议: ${violation.fix}`);
      }
    });
  }
  
  // 创建厂商中立验证器
  console.log('\n🔍 使用厂商中立验证器验证项目');
  const vendorNeutralValidator = createVendorNeutralValidator();
  const vendorNeutralReport = await vendorNeutralValidator.validateDirectory(join(projectRoot, 'src/modules'), true);
  
  // 输出验证结果摘要
  console.log(`\n📊 厂商中立验证结果摘要:`);
  console.log(`- 验证文件数: ${vendorNeutralReport.getFileCount()}`);
  console.log(`- 问题总数: ${vendorNeutralReport.getViolationCount()}`);
  
  // 输出验证结果详情
  if (vendorNeutralReport.getViolationCount() > 0) {
    console.log('\n🔍 前5个厂商中立问题详情:');
    const violations = vendorNeutralReport.getAllViolations().slice(0, 5);
    violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.message}`);
      console.log(`   文件: ${violation.location.filePath}`);
      console.log(`   位置: 第${violation.location.startLine || '?'}行`);
      if (violation.fix) {
        console.log(`   修复建议: ${violation.fix}`);
      }
    });
  }
  
  // 创建命名约定验证器
  console.log('\n🔍 使用命名约定验证器验证项目');
  const namingValidator = createNamingConventionValidator();
  const namingReport = await namingValidator.validateDirectory(join(projectRoot, 'src/schemas'), true);
  
  // 输出验证结果摘要
  console.log(`\n📊 命名约定验证结果摘要:`);
  console.log(`- 验证文件数: ${namingReport.getFileCount()}`);
  console.log(`- 问题总数: ${namingReport.getViolationCount()}`);
  
  // 输出验证结果详情
  if (namingReport.getViolationCount() > 0) {
    console.log('\n🔍 前5个命名约定问题详情:');
    const violations = namingReport.getAllViolations().slice(0, 5);
    violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.message}`);
      console.log(`   文件: ${violation.location.filePath}`);
      console.log(`   位置: 第${violation.location.startLine || '?'}行`);
      if (violation.fix) {
        console.log(`   修复建议: ${violation.fix}`);
      }
    });
  }
  
  // 保存报告到文件
  console.log('\n💾 保存报告到文件');
  
  // 保存为Markdown
  const markdownReport = defaultReport.toMarkdown();
  console.log('- 保存为Markdown格式');
  
  // 保存为HTML
  const htmlReport = defaultReport.toHTML();
  console.log('- 保存为HTML格式');
  
  // 保存为JSON
  const jsonReport = defaultReport.toJSON();
  console.log('- 保存为JSON格式');
  
  console.log('\n✅ Schema验证示例完成');
}

// 运行示例
runSchemaValidationExample().catch(error => {
  console.error('❌ 示例运行失败:', error);
  process.exit(1);
}); 