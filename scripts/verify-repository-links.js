#!/usr/bin/env node

/**
 * GitHub仓库链接验证脚本
 * Repository Links Verification Script
 * 
 * 功能：验证所有文档中的GitHub仓库链接是否一致
 * 检测是否存在混合使用Dev和Public仓库链接的情况
 * 
 * 使用方法：
 * node scripts/verify-repository-links.js
 * 或
 * npm run links:verify
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 仓库URL模式
const REPO_PATTERNS = {
  dev: /https:\/\/github\.com\/Coregentis\/MPLP-Protocol-Dev/g,
  public: /https:\/\/github\.com\/Coregentis\/MPLP-Protocol(?!-Dev)/g
};

// 配置
const CONFIG = {
  filePatterns: [
    '**/*.md',
    'package.json',
    '**/*.yml',
    '**/*.yaml'
  ],
  ignoreDirs: [
    'node_modules/**',
    'dist/**',
    'coverage/**',
    '.git/**',
    'sdk/node_modules/**',
    'sdk/dist/**',
    'sdk/packages/*/node_modules/**',
    'sdk/packages/*/dist/**'
  ],
  ignoreFiles: [
    'package-lock.json',
    'npm-shrinkwrap.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ]
};

// 统计信息
const stats = {
  totalFiles: 0,
  filesWithLinks: 0,
  devLinks: [],
  publicLinks: [],
  mixedFiles: []
};

/**
 * 获取所有需要检查的文件
 */
function getAllFiles() {
  const files = new Set();

  for (const pattern of CONFIG.filePatterns) {
    const matchedFiles = glob.sync(pattern, {
      ignore: [...CONFIG.ignoreDirs, ...CONFIG.ignoreFiles],
      nodir: true,
      absolute: false
    });

    matchedFiles.forEach(file => files.add(file));
  }

  return Array.from(files);
}

/**
 * 检查文件中的仓库链接
 */
function checkFileLinks(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    const devMatches = content.match(REPO_PATTERNS.dev) || [];
    const publicMatches = content.match(REPO_PATTERNS.public) || [];

    if (devMatches.length > 0 || publicMatches.length > 0) {
      stats.filesWithLinks++;

      if (devMatches.length > 0) {
        stats.devLinks.push({
          file: filePath,
          count: devMatches.length
        });
      }

      if (publicMatches.length > 0) {
        stats.publicLinks.push({
          file: filePath,
          count: publicMatches.length
        });
      }

      // 检测混合使用
      if (devMatches.length > 0 && publicMatches.length > 0) {
        stats.mixedFiles.push({
          file: filePath,
          devCount: devMatches.length,
          publicCount: publicMatches.length
        });
      }
    }

  } catch (error) {
    console.error(`❌ 读取文件失败: ${filePath}: ${error.message}`);
  }
}

/**
 * 打印结果
 */
function printResults() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 仓库链接验证结果');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // 总体统计
  console.log('总体统计：');
  console.log(`  总文件数: ${stats.totalFiles}`);
  console.log(`  包含链接的文件数: ${stats.filesWithLinks}`);
  console.log(`  Dev仓库链接数: ${stats.devLinks.reduce((sum, item) => sum + item.count, 0)}`);
  console.log(`  Public仓库链接数: ${stats.publicLinks.reduce((sum, item) => sum + item.count, 0)}`);
  console.log('');

  // 检测混合使用
  if (stats.mixedFiles.length > 0) {
    console.log('❌ 发现混合使用Dev和Public仓库链接的文件：');
    for (const item of stats.mixedFiles) {
      console.log(`  - ${item.file}`);
      console.log(`    Dev链接: ${item.devCount} 个`);
      console.log(`    Public链接: ${item.publicCount} 个`);
    }
    console.log('');
    console.log('⚠️  警告：不应该在同一个文件中混合使用两个仓库的链接！');
    console.log('');
    return false;
  }

  // 判断当前版本
  const totalDevLinks = stats.devLinks.reduce((sum, item) => sum + item.count, 0);
  const totalPublicLinks = stats.publicLinks.reduce((sum, item) => sum + item.count, 0);

  if (totalDevLinks > 0 && totalPublicLinks === 0) {
    console.log('✅ 所有链接都指向Dev仓库');
    console.log('   当前版本: Dev版本');
    console.log(`   链接数量: ${totalDevLinks} 个`);
    console.log('');
    return true;
  }

  if (totalPublicLinks > 0 && totalDevLinks === 0) {
    console.log('✅ 所有链接都指向Public仓库');
    console.log('   当前版本: Public版本');
    console.log(`   链接数量: ${totalPublicLinks} 个`);
    console.log('');
    return true;
  }

  if (totalDevLinks === 0 && totalPublicLinks === 0) {
    console.log('ℹ️  未找到任何GitHub仓库链接');
    console.log('');
    return true;
  }

  // 存在混合使用（但不在同一个文件中）
  console.log('⚠️  发现同时存在Dev和Public仓库链接：');
  console.log(`   Dev链接: ${totalDevLinks} 个（在 ${stats.devLinks.length} 个文件中）`);
  console.log(`   Public链接: ${totalPublicLinks} 个（在 ${stats.publicLinks.length} 个文件中）`);
  console.log('');
  console.log('💡 建议：');
  console.log('   - 如果要使用Dev版本，运行: npm run links:switch-to-dev');
  console.log('   - 如果要使用Public版本，运行: npm run links:switch-to-public');
  console.log('');

  return false;
}

/**
 * 主函数
 */
function main() {
  console.log('');
  console.log('🔍 开始验证GitHub仓库链接...');
  console.log('');

  // 获取所有文件
  console.log('📁 扫描文件...');
  const files = getAllFiles();
  stats.totalFiles = files.length;
  console.log(`   找到 ${stats.totalFiles} 个文件`);
  console.log('');

  // 检查每个文件
  console.log('🔧 检查链接...');
  files.forEach(file => {
    checkFileLinks(file);
  });

  // 打印结果
  const success = printResults();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // 退出
  process.exit(success ? 0 : 1);
}

// 执行
main();

