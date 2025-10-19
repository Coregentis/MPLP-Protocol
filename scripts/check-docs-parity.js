#!/usr/bin/env node

/**
 * 文档对等性检查脚本
 * Documentation Parity Check Script
 * 
 * 功能：检查docs/en/和docs/zh-CN/文档的对等性
 * 确保两个语言版本的文档结构和文件完全一致
 * 
 * 使用方法：
 * node scripts/check-docs-parity.js
 * 或
 * npm run docs:check-parity
 */

const fs = require('fs');
const path = require('path');

// 简单的颜色输出函数（不依赖chalk）
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

const chalk = {
  red: colors.red,
  green: colors.green,
  yellow: colors.yellow,
  blue: colors.blue,
  gray: colors.gray
};

// 配置
const CONFIG = {
  docsRoot: path.join(__dirname, '..', 'docs'),
  languages: ['en', 'zh-CN'],
  ignoreFiles: ['.DS_Store', 'Thumbs.db', '.gitkeep'],
  ignoreDirs: ['node_modules', '.git']
};

// 结果统计
const stats = {
  totalFiles: 0,
  matchedFiles: 0,
  missingFiles: [],
  extraFiles: [],
  errors: []
};

/**
 * 获取目录下的所有文件（递归）
 */
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    // 跳过忽略的文件和目录
    if (CONFIG.ignoreFiles.includes(item) || CONFIG.ignoreDirs.includes(item)) {
      continue;
    }

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      // 获取相对路径
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * 检查文档对等性
 */
function checkDocsParity() {
  console.log(chalk.blue('🔍 开始检查文档对等性...\n'));

  // 获取所有语言的文档文件
  const filesByLang = {};
  
  for (const lang of CONFIG.languages) {
    const langDir = path.join(CONFIG.docsRoot, lang);
    filesByLang[lang] = getAllFiles(langDir);
    console.log(chalk.gray(`  ${lang}: ${filesByLang[lang].length} 个文件`));
  }

  console.log('');

  // 检查对等性
  const [primaryLang, secondaryLang] = CONFIG.languages;
  const primaryFiles = new Set(filesByLang[primaryLang]);
  const secondaryFiles = new Set(filesByLang[secondaryLang]);

  stats.totalFiles = Math.max(primaryFiles.size, secondaryFiles.size);

  // 检查缺失的文件
  for (const file of primaryFiles) {
    if (!secondaryFiles.has(file)) {
      stats.missingFiles.push({
        file,
        missingIn: secondaryLang,
        existsIn: primaryLang
      });
    } else {
      stats.matchedFiles++;
    }
  }

  // 检查额外的文件
  for (const file of secondaryFiles) {
    if (!primaryFiles.has(file)) {
      stats.extraFiles.push({
        file,
        extraIn: secondaryLang,
        notIn: primaryLang
      });
    }
  }

  return stats.missingFiles.length === 0 && stats.extraFiles.length === 0;
}

/**
 * 打印检查结果
 */
function printResults() {
  console.log(chalk.blue('📊 检查结果：\n'));

  // 总体统计
  console.log(chalk.gray('总体统计：'));
  console.log(chalk.gray(`  总文件数: ${stats.totalFiles}`));
  console.log(chalk.gray(`  匹配文件数: ${stats.matchedFiles}`));
  console.log(chalk.gray(`  缺失文件数: ${stats.missingFiles.length}`));
  console.log(chalk.gray(`  额外文件数: ${stats.extraFiles.length}`));
  console.log('');

  // 缺失的文件
  if (stats.missingFiles.length > 0) {
    console.log(chalk.red('❌ 缺失的文件：'));
    for (const item of stats.missingFiles) {
      console.log(chalk.red(`  - ${item.file}`));
      console.log(chalk.gray(`    存在于: docs/${item.existsIn}/`));
      console.log(chalk.gray(`    缺失于: docs/${item.missingIn}/`));
    }
    console.log('');
  }

  // 额外的文件
  if (stats.extraFiles.length > 0) {
    console.log(chalk.yellow('⚠️  额外的文件：'));
    for (const item of stats.extraFiles) {
      console.log(chalk.yellow(`  - ${item.file}`));
      console.log(chalk.gray(`    存在于: docs/${item.extraIn}/`));
      console.log(chalk.gray(`    不存在于: docs/${item.notIn}/`));
    }
    console.log('');
  }

  // 最终结果
  if (stats.missingFiles.length === 0 && stats.extraFiles.length === 0) {
    console.log(chalk.green('✅ 文档对等性检查通过！'));
    console.log(chalk.green(`   所有 ${stats.matchedFiles} 个文件在两个语言版本中都存在。\n`));
    return true;
  } else {
    console.log(chalk.red('❌ 文档对等性检查失败！'));
    console.log(chalk.red('   请确保docs/en/和docs/zh-CN/中的文件完全一致。\n'));
    
    // 提供修复建议
    console.log(chalk.blue('💡 修复建议：'));
    if (stats.missingFiles.length > 0) {
      console.log(chalk.gray('   1. 为缺失的文件创建对应的翻译版本'));
    }
    if (stats.extraFiles.length > 0) {
      console.log(chalk.gray('   2. 删除额外的文件，或在另一个语言版本中创建对应文件'));
    }
    console.log('');
    
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  try {
    // 检查docs目录是否存在
    if (!fs.existsSync(CONFIG.docsRoot)) {
      console.log(chalk.yellow('⚠️  docs目录不存在，跳过文档对等性检查'));
      process.exit(0);
    }

    // 检查语言目录是否存在
    let allLangsExist = true;
    for (const lang of CONFIG.languages) {
      const langDir = path.join(CONFIG.docsRoot, lang);
      if (!fs.existsSync(langDir)) {
        console.log(chalk.yellow(`⚠️  docs/${lang}/目录不存在`));
        allLangsExist = false;
      }
    }

    if (!allLangsExist) {
      console.log(chalk.yellow('⚠️  部分语言目录不存在，跳过文档对等性检查'));
      process.exit(0);
    }

    // 执行检查
    const isPassed = checkDocsParity();
    
    // 打印结果
    const success = printResults();

    // 退出
    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error(chalk.red('❌ 检查过程中发生错误：'));
    console.error(chalk.red(error.message));
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行
main();

