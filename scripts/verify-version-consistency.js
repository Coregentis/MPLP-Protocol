#!/usr/bin/env node

/**
 * 版本号一致性验证脚本
 * Version Consistency Verification Script
 * 
 * 功能：验证package.json中的版本号一致性
 * 确保主package.json和SDK packages的版本号一致
 * 
 * 使用方法：
 * node scripts/verify-version-consistency.js
 * 或
 * npm run version:verify
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 配置
const CONFIG = {
  rootPackage: path.join(__dirname, '..', 'package.json'),
  sdkPackagesPattern: 'sdk/packages/*/package.json'
};

// 统计信息
const stats = {
  rootVersion: null,
  sdkPackages: [],
  inconsistentPackages: []
};

/**
 * 读取package.json的版本号
 */
function getPackageVersion(packagePath) {
  try {
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    return packageJson.version || null;
  } catch (error) {
    console.error(`❌ 读取失败: ${packagePath}: ${error.message}`);
    return null;
  }
}

/**
 * 验证版本一致性
 */
function verifyVersionConsistency() {
  console.log('');
  console.log('🔍 开始验证版本号一致性...');
  console.log('');

  // 1. 读取根package.json的版本号
  console.log('📦 读取根package.json...');
  stats.rootVersion = getPackageVersion(CONFIG.rootPackage);
  
  if (!stats.rootVersion) {
    console.error('❌ 无法读取根package.json的版本号');
    return false;
  }
  
  console.log(`   版本号: ${stats.rootVersion}`);
  console.log('');

  // 2. 读取所有SDK packages的版本号
  console.log('📦 读取SDK packages...');
  const sdkPackagePaths = glob.sync(CONFIG.sdkPackagesPattern);
  
  if (sdkPackagePaths.length === 0) {
    console.log('   未找到SDK packages，跳过验证');
    console.log('');
    return true;
  }

  for (const packagePath of sdkPackagePaths) {
    const version = getPackageVersion(packagePath);
    const packageName = path.basename(path.dirname(packagePath));
    
    stats.sdkPackages.push({
      name: packageName,
      path: packagePath,
      version: version
    });

    if (version !== stats.rootVersion) {
      stats.inconsistentPackages.push({
        name: packageName,
        path: packagePath,
        version: version,
        expected: stats.rootVersion
      });
    }
  }

  console.log(`   找到 ${stats.sdkPackages.length} 个SDK packages`);
  console.log('');

  return stats.inconsistentPackages.length === 0;
}

/**
 * 打印结果
 */
function printResults() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 版本号一致性验证结果');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  console.log(`根版本号: ${stats.rootVersion}`);
  console.log(`SDK packages数量: ${stats.sdkPackages.length}`);
  console.log(`不一致的packages数量: ${stats.inconsistentPackages.length}`);
  console.log('');

  if (stats.inconsistentPackages.length > 0) {
    console.log('❌ 发现版本号不一致的packages：');
    for (const pkg of stats.inconsistentPackages) {
      console.log(`  - ${pkg.name}`);
      console.log(`    当前版本: ${pkg.version}`);
      console.log(`    期望版本: ${pkg.expected}`);
      console.log(`    路径: ${pkg.path}`);
    }
    console.log('');
    console.log('💡 修复建议：');
    console.log('   1. 手动更新不一致的package.json文件');
    console.log('   2. 或使用Lerna等工具统一管理版本号');
    console.log('');
    return false;
  }

  console.log('✅ 所有package.json的版本号一致！');
  console.log(`   版本号: ${stats.rootVersion}`);
  console.log('');
  return true;
}

/**
 * 主函数
 */
function main() {
  try {
    const isConsistent = verifyVersionConsistency();
    const success = printResults();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('❌ 验证过程中发生错误：');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行
main();

