#!/usr/bin/env node

/**
 * GitHub仓库链接切换脚本
 * Repository Links Switching Script
 * 
 * 功能：自动替换所有文档中的GitHub仓库链接
 * 支持Dev版本和Public版本之间的切换
 * 
 * 使用方法：
 * node scripts/switch-repository-links.js dev
 * node scripts/switch-repository-links.js public
 * 或
 * npm run links:switch-to-dev
 * npm run links:switch-to-public
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 仓库URL映射
const REPO_MAPPINGS = {
  dev: {
    url: 'https://github.com/Coregentis/MPLP-Protocol-Dev',
    name: 'MPLP-Protocol-Dev',
    description: '开发版本仓库'
  },
  public: {
    url: 'https://github.com/Coregentis/MPLP-Protocol',
    name: 'MPLP-Protocol',
    description: '开源版本仓库'
  }
};

// 配置
const CONFIG = {
  // 需要处理的文件模式
  filePatterns: [
    '**/*.md',
    '**/*.json',
    '**/*.yml',
    '**/*.yaml'
  ],
  // 忽略的目录
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
  // 忽略的文件
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
  modifiedFiles: 0,
  totalReplacements: 0,
  errors: []
};

/**
 * 获取所有需要处理的文件
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
 * 替换文件中的仓库链接
 */
function replaceLinksInFile(filePath, targetVersion) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let replacements = 0;

    const targetRepo = REPO_MAPPINGS[targetVersion];
    
    // 获取其他版本的仓库URL
    const otherVersions = Object.keys(REPO_MAPPINGS).filter(v => v !== targetVersion);

    // 替换所有其他版本的链接为目标版本
    for (const otherVersion of otherVersions) {
      const otherRepo = REPO_MAPPINGS[otherVersion];
      
      // 替换完整URL（带协议）
      const urlRegex = new RegExp(otherRepo.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const urlMatches = content.match(urlRegex);
      if (urlMatches) {
        content = content.replace(urlRegex, targetRepo.url);
        replacements += urlMatches.length;
        modified = true;
      }

      // 替换仓库名称（在GitHub链接中）
      const nameRegex = new RegExp(
        `github\\.com/Coregentis/${otherRepo.name}`,
        'g'
      );
      const nameMatches = content.match(nameRegex);
      if (nameMatches) {
        content = content.replace(
          nameRegex,
          `github.com/Coregentis/${targetRepo.name}`
        );
        replacements += nameMatches.length;
        modified = true;
      }
    }

    // 如果有修改，写回文件
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.modifiedFiles++;
      stats.totalReplacements += replacements;
      return { modified: true, replacements };
    }

    return { modified: false, replacements: 0 };

  } catch (error) {
    stats.errors.push({
      file: filePath,
      error: error.message
    });
    return { modified: false, replacements: 0, error: error.message };
  }
}

/**
 * 打印进度
 */
function printProgress(current, total, file) {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.round(percentage / 2)) + '░'.repeat(50 - Math.round(percentage / 2));
  process.stdout.write(`\r  [${bar}] ${percentage}% (${current}/${total}) ${file.substring(0, 50).padEnd(50)}`);
}

/**
 * 打印结果
 */
function printResults(targetVersion) {
  const targetRepo = REPO_MAPPINGS[targetVersion];

  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 链接替换结果');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`目标版本: ${targetVersion} (${targetRepo.description})`);
  console.log(`目标仓库: ${targetRepo.url}`);
  console.log('');
  console.log(`总文件数: ${stats.totalFiles}`);
  console.log(`修改文件数: ${stats.modifiedFiles}`);
  console.log(`总替换次数: ${stats.totalReplacements}`);
  console.log('');

  if (stats.errors.length > 0) {
    console.log('❌ 错误：');
    for (const error of stats.errors) {
      console.log(`  - ${error.file}: ${error.error}`);
    }
    console.log('');
  }

  if (stats.modifiedFiles > 0) {
    console.log('✅ 链接替换成功！');
    console.log(`   已将 ${stats.modifiedFiles} 个文件中的 ${stats.totalReplacements} 个链接更新为 ${targetVersion} 版本仓库`);
  } else {
    console.log('ℹ️  没有需要替换的链接');
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * 主函数
 */
function main() {
  const targetVersion = process.argv[2];

  // 验证参数
  if (!targetVersion || !REPO_MAPPINGS[targetVersion]) {
    console.error('❌ 错误：无效的版本参数');
    console.error('');
    console.error('使用方法：');
    console.error('  node scripts/switch-repository-links.js [dev|public]');
    console.error('');
    console.error('示例：');
    console.error('  node scripts/switch-repository-links.js dev      # 切换到Dev版本仓库');
    console.error('  node scripts/switch-repository-links.js public   # 切换到Public版本仓库');
    process.exit(1);
  }

  console.log('');
  console.log('🔄 开始替换GitHub仓库链接...');
  console.log('');

  // 获取所有文件
  console.log('📁 扫描文件...');
  const files = getAllFiles();
  stats.totalFiles = files.length;
  console.log(`   找到 ${stats.totalFiles} 个文件`);
  console.log('');

  // 处理每个文件
  console.log('🔧 处理文件...');
  files.forEach((file, index) => {
    printProgress(index + 1, files.length, file);
    replaceLinksInFile(file, targetVersion);
  });

  // 打印结果
  printResults(targetVersion);

  // 退出
  process.exit(stats.errors.length > 0 ? 1 : 0);
}

// 执行
main();

