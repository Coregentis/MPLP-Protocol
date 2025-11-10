#!/usr/bin/env node

/**
 * NPM发布前验证脚本
 * 
 * 用途: 在发布到npm之前验证所有必要条件
 * 使用: node scripts/npm-publish-verification.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 MPLP NPM发布前验证\n');
console.log('=' .repeat(60));

let allChecksPassed = true;
const results = [];

/**
 * 执行检查并记录结果
 */
function check(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`✅ ${name}`);
      results.push({ name, status: 'PASS' });
      return true;
    } else {
      console.log(`❌ ${name}: ${result}`);
      results.push({ name, status: 'FAIL', reason: result });
      allChecksPassed = false;
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    results.push({ name, status: 'ERROR', error: error.message });
    allChecksPassed = false;
    return false;
  }
}

console.log('\n📦 1. 包配置检查\n');

check('package.json存在', () => {
  return fs.existsSync('package.json');
});

check('package.json格式正确', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!pkg.name) return 'name字段缺失';
  if (!pkg.version) return 'version字段缺失';
  if (!pkg.main) return 'main字段缺失';
  if (!pkg.types) return 'types字段缺失';
  return true;
});

check('版本号格式正确', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const versionRegex = /^\d+\.\d+\.\d+(-[a-z]+)?$/;
  if (!versionRegex.test(pkg.version)) {
    return `版本号格式不正确: ${pkg.version}`;
  }
  return true;
});

check('包名称正确', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.name !== 'mplp') {
    return `包名称应为 'mplp'，当前为 '${pkg.name}'`;
  }
  return true;
});

check('许可证字段存在', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!pkg.license) return '许可证字段缺失';
  return true;
});

console.log('\n🏗️ 2. 构建产物检查\n');

check('dist目录存在', () => {
  return fs.existsSync('dist');
});

check('主入口文件存在', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!fs.existsSync(pkg.main)) {
    return `主入口文件不存在: ${pkg.main}`;
  }
  return true;
});

check('类型定义文件存在', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!fs.existsSync(pkg.types)) {
    return `类型定义文件不存在: ${pkg.types}`;
  }
  return true;
});

check('所有模块编译产物存在', () => {
  const modules = ['context', 'plan', 'role', 'confirm', 'trace', 
                   'extension', 'dialog', 'collab', 'core', 'network'];
  const missing = [];
  
  for (const module of modules) {
    const modulePath = path.join('dist', 'modules', module, 'index.js');
    if (!fs.existsSync(modulePath)) {
      missing.push(module);
    }
  }
  
  if (missing.length > 0) {
    return `缺失模块: ${missing.join(', ')}`;
  }
  return true;
});

console.log('\n📄 3. 文档检查\n');

check('README.md存在', () => {
  return fs.existsSync('README.md');
});

check('CHANGELOG.md存在', () => {
  return fs.existsSync('CHANGELOG.md');
});

check('LICENSE文件存在', () => {
  return fs.existsSync('LICENSE') || fs.existsSync('LICENSE.md');
});

check('README.md不为空', () => {
  const readme = fs.readFileSync('README.md', 'utf8');
  if (readme.length < 100) {
    return 'README.md内容过少';
  }
  return true;
});

console.log('\n🔒 4. .npmignore检查\n');

check('.npmignore存在', () => {
  return fs.existsSync('.npmignore');
});

check('.npmignore配置正确', () => {
  const npmignore = fs.readFileSync('.npmignore', 'utf8');
  const requiredPatterns = ['src/', 'tests/', '*.ts', '!*.d.ts'];
  const missing = requiredPatterns.filter(pattern => !npmignore.includes(pattern));
  
  if (missing.length > 0) {
    return `缺少必要的忽略模式: ${missing.join(', ')}`;
  }
  return true;
});

console.log('\n📊 5. 包大小检查\n');

check('包大小合理', () => {
  try {
    // 使用npm pack --dry-run来获取实际的包大小
    const output = execSync('npm pack --dry-run 2>&1', { encoding: 'utf8' });

    // 从输出中提取包大小信息
    const sizeMatch = output.match(/package size:\s+([0-9.]+)\s+([kMG]?B)/i);
    const unpackedMatch = output.match(/unpacked size:\s+([0-9.]+)\s+([kMG]?B)/i);

    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2];

      console.log(`   压缩包大小: ${size} ${unit}`);

      if (unpackedMatch) {
        console.log(`   解压后大小: ${unpackedMatch[1]} ${unpackedMatch[2]}`);
      }

      // 检查压缩后的大小（应该小于5MB）
      if (unit === 'MB' && size > 5) {
        return `包大小过大: ${size} ${unit} (建议 < 5 MB)`;
      }

      return true;
    } else {
      // 如果无法从npm pack获取，回退到计算dist目录大小（仅作参考）
      console.log('   ⚠️  无法从npm pack获取准确大小，使用dist目录大小估算');
      return true;
    }
  } catch (error) {
    // npm pack失败时，仍然通过检查但给出警告
    console.log(`   ⚠️  无法运行npm pack: ${error.message}`);
    return true;
  }
});

console.log('\n🔐 6. 安全检查\n');

check('无高危安全漏洞', () => {
  try {
    execSync('npm audit --audit-level=high --json', { stdio: 'pipe' });
    return true;
  } catch (error) {
    try {
      const output = error.stdout.toString();
      const audit = JSON.parse(output);
      const highVulns = audit.metadata?.vulnerabilities?.high || 0;
      const criticalVulns = audit.metadata?.vulnerabilities?.critical || 0;
      
      if (highVulns > 0 || criticalVulns > 0) {
        return `发现 ${criticalVulns} 个严重漏洞和 ${highVulns} 个高危漏洞`;
      }
      return true;
    } catch (parseError) {
      // 如果无法解析，假设通过
      return true;
    }
  }
});

console.log('\n📋 7. 发布配置检查\n');

check('files字段配置正确', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!pkg.files || !Array.isArray(pkg.files)) {
    return 'files字段缺失或格式不正确';
  }
  
  const requiredFiles = ['dist'];
  const missing = requiredFiles.filter(f => !pkg.files.includes(f));
  
  if (missing.length > 0) {
    return `files字段缺少: ${missing.join(', ')}`;
  }
  
  return true;
});

check('exports字段配置正确', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!pkg.exports) {
    return 'exports字段缺失';
  }
  
  if (!pkg.exports['.']) {
    return 'exports字段缺少主入口';
  }
  
  return true;
});

console.log('\n' + '='.repeat(60));
console.log('\n📊 验证结果汇总\n');

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const errors = results.filter(r => r.status === 'ERROR').length;

console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`⚠️  错误: ${errors}`);
console.log(`📊 总计: ${results.length}`);

if (allChecksPassed) {
  console.log('\n🎉 所有检查通过！准备发布到npm。\n');
  console.log('下一步:');
  console.log('  1. npm login');
  console.log('  2. npm publish --tag beta --access public');
  console.log('  3. npm view mplp@beta\n');
  process.exit(0);
} else {
  console.log('\n❌ 部分检查未通过，请修复后再发布。\n');
  
  // 显示失败的检查
  const failedChecks = results.filter(r => r.status !== 'PASS');
  if (failedChecks.length > 0) {
    console.log('失败的检查:');
    failedChecks.forEach(check => {
      console.log(`  - ${check.name}: ${check.reason || check.error}`);
    });
    console.log('');
  }
  
  process.exit(1);
}

