#!/usr/bin/env node

/**
 * package.json仓库字段更新脚本
 * Package.json Repository Field Update Script
 * 
 * 功能：更新package.json中的repository字段
 * 
 * 使用方法：
 * node scripts/update-package-repository.js <repository-url>
 */

const fs = require('fs');
const path = require('path');

/**
 * 更新package.json的repository字段
 */
function updatePackageRepository(repoUrl) {
  const packagePath = path.join(__dirname, '..', 'package.json');

  try {
    // 读取package.json
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);

    // 更新repository字段
    if (!packageJson.repository) {
      packageJson.repository = {};
    }

    if (typeof packageJson.repository === 'string') {
      packageJson.repository = {
        type: 'git',
        url: `${repoUrl}.git`
      };
    } else {
      packageJson.repository.url = `${repoUrl}.git`;
      if (!packageJson.repository.type) {
        packageJson.repository.type = 'git';
      }
    }

    // 写回package.json（保持格式）
    fs.writeFileSync(
      packagePath,
      JSON.stringify(packageJson, null, 2) + '\n',
      'utf8'
    );

    console.log(`✅ 已更新package.json的repository字段为: ${repoUrl}.git`);
    return true;

  } catch (error) {
    console.error(`❌ 更新package.json失败: ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    console.error('❌ 错误：缺少仓库URL参数');
    console.error('');
    console.error('使用方法：');
    console.error('  node scripts/update-package-repository.js <repository-url>');
    console.error('');
    console.error('示例：');
    console.error('  node scripts/update-package-repository.js https://github.com/Coregentis/MPLP-Protocol-Dev');
    process.exit(1);
  }

  const success = updatePackageRepository(repoUrl);
  process.exit(success ? 0 : 1);
}

// 执行
main();

