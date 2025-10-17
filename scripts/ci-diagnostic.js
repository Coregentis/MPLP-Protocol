#!/usr/bin/env node

/**
 * CI/CD Diagnostic Tool
 * 诊断CI/CD失败的根本原因
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 MPLP CI/CD Diagnostic Tool\n');

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function runCheck(name, command, options = {}) {
  console.log(`\n📋 Checking: ${name}`);
  console.log(`   Command: ${command}`);
  
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    
    results.passed.push(name);
    console.log(`   ✅ PASSED`);
    return { success: true, output };
  } catch (error) {
    results.failed.push({ name, error: error.message });
    console.log(`   ❌ FAILED: ${error.message}`);
    return { success: false, error };
  }
}

function checkFileExists(name, filePath) {
  console.log(`\n📋 Checking: ${name}`);
  console.log(`   Path: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    results.passed.push(name);
    console.log(`   ✅ EXISTS`);
    return true;
  } else {
    results.failed.push({ name, error: 'File not found' });
    console.log(`   ❌ NOT FOUND`);
    return false;
  }
}

// 1. 检查Node.js和npm版本
console.log('\n═══════════════════════════════════════');
console.log('1️⃣  Environment Checks');
console.log('═══════════════════════════════════════');

runCheck('Node.js version', 'node --version');
runCheck('npm version', 'npm --version');

// 2. 检查关键文件
console.log('\n═══════════════════════════════════════');
console.log('2️⃣  Critical Files');
console.log('═══════════════════════════════════════');

checkFileExists('package.json', 'package.json');
checkFileExists('tsconfig.json', 'tsconfig.json');
checkFileExists('jest.config.js', 'jest.config.js');

// 3. 检查TypeScript编译
console.log('\n═══════════════════════════════════════');
console.log('3️⃣  TypeScript Compilation');
console.log('═══════════════════════════════════════');

runCheck('TypeScript compilation', 'npm run typecheck');

// 4. 检查ESLint
console.log('\n═══════════════════════════════════════');
console.log('4️⃣  Code Quality (ESLint)');
console.log('═══════════════════════════════════════');

runCheck('ESLint check', 'npm run lint', { silent: false });

// 5. 检查Schema验证
console.log('\n═══════════════════════════════════════');
console.log('5️⃣  Schema Validation');
console.log('═══════════════════════════════════════');

runCheck('Schema validation', 'npm run validate:schemas');

// 6. 检查Mapper验证
console.log('\n═══════════════════════════════════════');
console.log('6️⃣  Mapper Consistency');
console.log('═══════════════════════════════════════');

runCheck('Mapper validation', 'npm run validate:mapping');

// 7. 检查安全审计
console.log('\n═══════════════════════════════════════');
console.log('7️⃣  Security Audit');
console.log('═══════════════════════════════════════');

const auditResult = runCheck('npm audit', 'npm audit --audit-level=moderate', { silent: true });
if (!auditResult.success) {
  console.log('\n⚠️  Security vulnerabilities detected:');
  try {
    const auditJson = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditJson);
    console.log(`   Critical: ${audit.metadata?.vulnerabilities?.critical || 0}`);
    console.log(`   High: ${audit.metadata?.vulnerabilities?.high || 0}`);
    console.log(`   Moderate: ${audit.metadata?.vulnerabilities?.moderate || 0}`);
    console.log(`   Low: ${audit.metadata?.vulnerabilities?.low || 0}`);
  } catch (e) {
    console.log('   Could not parse audit results');
  }
}

// 8. 检查测试
console.log('\n═══════════════════════════════════════');
console.log('8️⃣  Test Suite');
console.log('═══════════════════════════════════════');

runCheck('Unit tests', 'npm run test:unit -- --passWithNoTests');
runCheck('Integration tests', 'npm run test:integration -- --passWithNoTests');

// 9. 检查构建
console.log('\n═══════════════════════════════════════');
console.log('9️⃣  Build Process');
console.log('═══════════════════════════════════════');

runCheck('Build', 'npm run build');

// 生成报告
console.log('\n\n═══════════════════════════════════════');
console.log('📊 DIAGNOSTIC SUMMARY');
console.log('═══════════════════════════════════════');

console.log(`\n✅ Passed: ${results.passed.length}`);
results.passed.forEach(name => console.log(`   - ${name}`));

console.log(`\n❌ Failed: ${results.failed.length}`);
results.failed.forEach(({ name, error }) => {
  console.log(`   - ${name}`);
  console.log(`     Error: ${error}`);
});

if (results.warnings.length > 0) {
  console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
  results.warnings.forEach(warning => console.log(`   - ${warning}`));
}

// 保存报告
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length
  },
  details: results
};

fs.writeFileSync('ci-diagnostic-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Full report saved to: ci-diagnostic-report.json');

// 退出码
process.exit(results.failed.length > 0 ? 1 : 0);

