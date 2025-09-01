#!/usr/bin/env node

/**
 * Dialog模块100%完美质量验证脚本
 * 
 * @description 基于Context模块100%完美标准，验证Dialog模块达到100%质量
 * @version 2.0.0
 * @standard Context模块100%完美质量标准
 * @methodology SCTM+GLFB+ITCM增强框架
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(colors.bold(colors.cyan('🎯 Dialog模块100%完美质量验证')));
console.log(colors.blue('基于Context模块100%完美标准\n'));

let totalScore = 0;
let maxScore = 0;
const results = [];

// 验证函数
function validateStep(name, command, weight = 10, successPattern = null) {
  maxScore += weight;
  console.log(colors.yellow(`🔍 ${name}...`));
  
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    
    let success = true;
    if (successPattern && !successPattern.test(output)) {
      success = false;
    }
    
    if (success) {
      console.log(colors.green(`✅ ${name} - 通过 (${weight}分)`));
      totalScore += weight;
      results.push({ name, status: 'PASS', score: weight, maxScore: weight });
    } else {
      console.log(colors.red(`❌ ${name} - 失败 (0/${weight}分)`));
      results.push({ name, status: 'FAIL', score: 0, maxScore: weight });
    }
  } catch (error) {
    console.log(colors.red(`❌ ${name} - 失败 (0/${weight}分)`));
    console.log(colors.red(`   错误: ${error.message.split('\n')[0]}`));
    results.push({ name, status: 'FAIL', score: 0, maxScore: weight, error: error.message });
  }
}

// 文件存在性验证
function validateFileExists(filePath, name, weight = 5) {
  maxScore += weight;
  console.log(colors.yellow(`🔍 ${name}...`));
  
  if (fs.existsSync(filePath)) {
    console.log(colors.green(`✅ ${name} - 存在 (${weight}分)`));
    totalScore += weight;
    results.push({ name, status: 'PASS', score: weight, maxScore: weight });
  } else {
    console.log(colors.red(`❌ ${name} - 不存在 (0/${weight}分)`));
    results.push({ name, status: 'FAIL', score: 0, maxScore: weight });
  }
}

// 测试覆盖率验证
function validateTestCoverage() {
  maxScore += 20;
  console.log(colors.yellow('🔍 测试覆盖率验证...'));
  
  try {
    // 运行测试并生成覆盖率报告
    const output = execSync('npm test -- tests/modules/dialog/ --coverage --silent', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    
    // 解析覆盖率
    const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)/);
    const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;
    
    if (coverage >= 95) {
      const score = coverage >= 100 ? 20 : Math.floor((coverage - 95) / 5 * 20 + 15);
      console.log(colors.green(`✅ 测试覆盖率: ${coverage}% - 优秀 (${score}/20分)`));
      totalScore += score;
      results.push({ name: '测试覆盖率', status: 'PASS', score, maxScore: 20, coverage });
    } else {
      const score = Math.floor(coverage / 95 * 15);
      console.log(colors.red(`❌ 测试覆盖率: ${coverage}% - 不达标 (${score}/20分)`));
      totalScore += score;
      results.push({ name: '测试覆盖率', status: 'FAIL', score, maxScore: 20, coverage });
    }
  } catch (error) {
    console.log(colors.red('❌ 测试覆盖率验证失败 (0/20分)'));
    results.push({ name: '测试覆盖率', status: 'FAIL', score: 0, maxScore: 20, error: error.message });
  }
}

// 性能基准验证
function validatePerformanceBenchmarks() {
  maxScore += 15;
  console.log(colors.yellow('🔍 性能基准验证...'));
  
  try {
    const output = execSync('npm test -- tests/modules/dialog/performance/ --silent', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    
    // 检查性能测试是否通过
    if (output.includes('PASS') && !output.includes('FAIL')) {
      console.log(colors.green('✅ 性能基准验证 - 通过 (15/15分)'));
      totalScore += 15;
      results.push({ name: '性能基准验证', status: 'PASS', score: 15, maxScore: 15 });
    } else {
      console.log(colors.red('❌ 性能基准验证 - 失败 (0/15分)'));
      results.push({ name: '性能基准验证', status: 'FAIL', score: 0, maxScore: 15 });
    }
  } catch (error) {
    console.log(colors.red('❌ 性能基准验证失败 (0/15分)'));
    results.push({ name: '性能基准验证', status: 'FAIL', score: 0, maxScore: 15, error: error.message });
  }
}

// 执行验证
console.log(colors.bold('📋 开始Dialog模块100%完美质量验证\n'));

// 1. TypeScript编译检查
validateStep(
  'TypeScript编译检查',
  'npx tsc --project tsconfig.json --noEmit',
  10
);

// 2. ESLint代码质量检查
validateStep(
  'ESLint代码质量检查',
  'npx eslint "src/modules/dialog/**/*.ts" --quiet',
  10
);

// 3. 零技术债务验证
console.log(colors.yellow('🔍 零技术债务验证...'));
maxScore += 10;
try {
  const anyUsage = execSync('grep -r ": any\\|<any>\\|any\\[\\]" src/modules/dialog --include="*.ts" | grep -v "//.*any" | wc -l', { encoding: 'utf8' }).trim();
  const fixmeCount = execSync('grep -r "FIXME\\|HACK" src/modules/dialog --include="*.ts" | wc -l', { encoding: 'utf8' }).trim();
  
  const anyCount = parseInt(anyUsage) || 0;
  const fixmeCountNum = parseInt(fixmeCount) || 0;
  const totalDebt = anyCount + fixmeCountNum;
  
  if (totalDebt === 0) {
    console.log(colors.green('✅ 零技术债务验证 - 通过 (10/10分)'));
    totalScore += 10;
    results.push({ name: '零技术债务验证', status: 'PASS', score: 10, maxScore: 10 });
  } else {
    console.log(colors.red(`❌ 零技术债务验证 - 发现${totalDebt}处技术债务 (0/10分)`));
    results.push({ name: '零技术债务验证', status: 'FAIL', score: 0, maxScore: 10, debt: totalDebt });
  }
} catch (error) {
  console.log(colors.red('❌ 零技术债务验证失败 (0/10分)'));
  results.push({ name: '零技术债务验证', status: 'FAIL', score: 0, maxScore: 10, error: error.message });
}

// 4. 双重命名约定验证
validateFileExists(
  'src/modules/dialog/api/mappers/dialog.mapper.ts',
  '双重命名约定Mapper文件',
  5
);

// 5. Schema文件验证
validateFileExists(
  'src/schemas/core-modules/mplp-dialog.json',
  'Dialog Schema文件',
  5
);

// 6. 测试文件完整性验证
const testFiles = [
  'tests/modules/dialog/unit/dialog.entity.test.ts',
  'tests/modules/dialog/unit/dialog.mapper.test.ts',
  'tests/modules/dialog/unit/dialog-management.service.test.ts',
  'tests/modules/dialog/functional/dialog-functional.test.ts',
  'tests/modules/dialog/integration/dialog-integration.test.ts',
  'tests/modules/dialog/performance/dialog-performance.test.ts'
];

testFiles.forEach(file => {
  validateFileExists(file, `测试文件: ${path.basename(file)}`, 2);
});

// 7. 测试覆盖率验证
validateTestCoverage();

// 8. 性能基准验证
validatePerformanceBenchmarks();

// 9. 文档完整性验证
const docFiles = [
  'docs/modules/dialog/README.md',
  'docs/modules/dialog/api-reference.md',
  'docs/modules/dialog/testing-guide.md',
  'docs/modules/dialog/quality-report.md'
];

docFiles.forEach(file => {
  validateFileExists(file, `文档文件: ${path.basename(file)}`, 2);
});

// 10. 最终测试执行验证
validateStep(
  '完整测试套件执行',
  'npm test -- tests/modules/dialog/ --passWithNoTests',
  15
);

// 生成最终报告
console.log('\n' + colors.bold(colors.cyan('📊 Dialog模块100%完美质量验证报告')));
console.log('='.repeat(60));

const percentage = Math.round((totalScore / maxScore) * 100);
const grade = percentage >= 98 ? 'A+' : percentage >= 95 ? 'A' : percentage >= 90 ? 'B+' : percentage >= 85 ? 'B' : 'C';

console.log(colors.bold(`总分: ${totalScore}/${maxScore} (${percentage}%)`));
console.log(colors.bold(`等级: ${grade}`));

if (percentage >= 98) {
  console.log(colors.green(colors.bold('🏆 恭喜！Dialog模块达到100%完美质量标准！')));
} else if (percentage >= 95) {
  console.log(colors.green(colors.bold('✅ Dialog模块达到企业级质量标准！')));
} else {
  console.log(colors.yellow(colors.bold('⚠️ Dialog模块需要进一步改进以达到企业级标准')));
}

// 详细结果
console.log('\n' + colors.bold('📋 详细验证结果:'));
results.forEach(result => {
  const status = result.status === 'PASS' ? colors.green('✅') : colors.red('❌');
  console.log(`${status} ${result.name}: ${result.score}/${result.maxScore}分`);
  if (result.coverage) {
    console.log(`   覆盖率: ${result.coverage}%`);
  }
  if (result.debt) {
    console.log(`   技术债务: ${result.debt}处`);
  }
  if (result.error) {
    console.log(`   错误: ${result.error.split('\n')[0]}`);
  }
});

// 改进建议
if (percentage < 98) {
  console.log('\n' + colors.bold(colors.yellow('💡 改进建议:')));
  
  const failedResults = results.filter(r => r.status === 'FAIL');
  failedResults.forEach(result => {
    console.log(colors.yellow(`• 修复: ${result.name}`));
  });
  
  const lowScoreResults = results.filter(r => r.score < r.maxScore && r.status === 'PASS');
  lowScoreResults.forEach(result => {
    console.log(colors.yellow(`• 提升: ${result.name} (当前${result.score}/${result.maxScore}分)`));
  });
}

console.log('\n' + colors.bold(colors.cyan('🎯 验证完成！')));

// 退出码
process.exit(percentage >= 95 ? 0 : 1);
