#!/usr/bin/env node

/**
 * MPLP Schema修复工具集统一入口
 * 
 * 提供一键修复所有Schema质量问题的能力
 * 
 * @version 1.0.0
 * @author MPLP Project Team
 * @since 2025-08-14
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 导入修复工具
const { fixSchemaFile } = require('./fix-naming-conventions');
const { fixSchemaHeaders } = require('./fix-schema-headers');
const { fixEnterpriseIssues } = require('./fix-all-enterprise-issues');
const { addSpecializationToSchema, allSpecializationFields } = require('./add-all-specialization-fields');

// 命令行参数解析
const args = process.argv.slice(2);
const options = {
  fixAll: args.includes('--fix-all') || args.includes('-a'),
  fixNaming: args.includes('--fix-naming') || args.includes('-n'),
  fixHeaders: args.includes('--fix-headers') || args.includes('-h'),
  fixEnterprise: args.includes('--fix-enterprise') || args.includes('-e'),
  fixSpecialization: args.includes('--fix-specialization') || args.includes('-s'),
  validate: args.includes('--validate') || args.includes('-v'),
  help: args.includes('--help') || args.includes('-h')
};

// 显示帮助信息
function showHelp() {
  console.log(`
🛠️  MPLP Schema修复工具集

用法: node index.js [选项]

选项:
  -a, --fix-all           执行所有修复操作
  -n, --fix-naming        修复命名约定问题
  -h, --fix-headers       修复Schema头部格式
  -e, --fix-enterprise    修复企业级功能问题
  -s, --fix-specialization 添加专业化字段
  -v, --validate          运行验证检查
  --help                  显示此帮助信息

示例:
  node index.js --fix-all              # 执行所有修复
  node index.js --fix-naming --validate # 修复命名约定并验证
  node index.js -a -v                  # 执行所有修复并验证

修复顺序:
  1. Schema头部格式修复
  2. 命名约定修复
  3. 企业级功能修复
  4. 专业化字段添加
  5. 最终验证
`);
}

// 运行验证
function runValidation() {
  console.log('\n🔍 运行Schema验证...');
  try {
    const result = execSync('npm run validate:schemas', { 
      cwd: path.join(__dirname, '../../..'),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(result);
    return true;
  } catch (error) {
    console.error('❌ 验证失败:', error.stdout || error.message);
    return false;
  }
}

// 创建备份
function createBackup() {
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  const backupDir = path.join(__dirname, 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `schemas-backup-${timestamp}`);
  
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.mkdirSync(backupPath, { recursive: true });
    
    const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      fs.copyFileSync(
        path.join(schemasDir, file),
        path.join(backupPath, file)
      );
    }
    
    console.log(`✅ 备份创建成功: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ 备份创建失败:', error.message);
    return null;
  }
}

// 执行修复步骤
async function executeRepairStep(stepName, repairFunction) {
  console.log(`\n🔧 执行: ${stepName}`);
  console.log('='.repeat(50));
  
  try {
    await repairFunction();
    console.log(`✅ ${stepName} 完成`);
    return true;
  } catch (error) {
    console.error(`❌ ${stepName} 失败:`, error.message);
    return false;
  }
}

// 修复命名约定
function fixNamingConventions() {
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  const schemaFiles = fs.readdirSync(schemasDir).filter(f => f.startsWith('mplp-') && f.endsWith('.json'));
  
  for (const file of schemaFiles) {
    fixSchemaFile(path.join(schemasDir, file));
  }
}

// 修复Schema头部
function fixHeaders() {
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  const schemaFiles = fs.readdirSync(schemasDir).filter(f => f.startsWith('mplp-') && f.endsWith('.json'));
  
  for (const file of schemaFiles) {
    fixSchemaHeaders(path.join(schemasDir, file));
  }
}

// 修复企业级问题
function fixEnterprise() {
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  const schemaFiles = fs.readdirSync(schemasDir).filter(f => f.startsWith('mplp-') && f.endsWith('.json'));
  
  for (const file of schemaFiles) {
    fixEnterpriseIssues(path.join(schemasDir, file));
  }
}

// 添加专业化字段
function addSpecializationFields() {
  const schemasDir = path.join(__dirname, '../../../src/schemas');
  
  for (const [fileName, fields] of Object.entries(allSpecializationFields)) {
    const filePath = path.join(schemasDir, fileName);
    if (fs.existsSync(filePath)) {
      addSpecializationToSchema(filePath, fields);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 MPLP Schema修复工具集');
  console.log('='.repeat(50));
  
  if (options.help) {
    showHelp();
    return;
  }
  
  // 创建备份
  const backupPath = createBackup();
  if (!backupPath) {
    console.error('❌ 无法创建备份，修复中止');
    return;
  }
  
  let success = true;
  
  // 执行修复步骤
  if (options.fixAll || options.fixHeaders) {
    success = await executeRepairStep('Schema头部格式修复', fixHeaders) && success;
  }
  
  if (options.fixAll || options.fixNaming) {
    success = await executeRepairStep('命名约定修复', fixNamingConventions) && success;
  }
  
  if (options.fixAll || options.fixEnterprise) {
    success = await executeRepairStep('企业级功能修复', fixEnterprise) && success;
  }
  
  if (options.fixAll || options.fixSpecialization) {
    success = await executeRepairStep('专业化字段添加', addSpecializationFields) && success;
  }
  
  // 运行验证
  if (options.fixAll || options.validate) {
    console.log('\n🔍 最终验证');
    console.log('='.repeat(50));
    const validationSuccess = runValidation();
    success = success && validationSuccess;
  }
  
  // 显示结果
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 所有修复操作成功完成！');
    console.log(`📁 备份位置: ${backupPath}`);
  } else {
    console.log('⚠️  部分修复操作失败，请检查错误信息');
    console.log(`📁 可从备份恢复: ${backupPath}`);
  }
  console.log('='.repeat(50));
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = {
  fixNamingConventions,
  fixHeaders,
  fixEnterprise,
  addSpecializationFields,
  runValidation,
  createBackup
};
