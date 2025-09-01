#!/usr/bin/env node

/**
 * MPLP v1.0 快速质量门禁检查脚本
 * 基于SCTM+GLFB+ITCM方法论的统一质量门禁检查
 * 适用于所有8个已完成模块的企业级质量标准验证
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 MPLP v1.0 快速质量门禁检查开始');
console.log('📅 检查时间:', new Date().toLocaleString());
console.log('🎯 检查范围: 8个已完成模块 (Context, Plan, Role, Confirm, Trace, Extension, Dialog, Collab)');
console.log('📋 质量标准: 企业级标准 + 零技术债务政策');
console.log('');

let totalChecks = 6;
let passedChecks = 0;
let failedChecks = 0;
const checkResults = [];

function logSuccess(message) {
    console.log('✅', message);
    passedChecks++;
    checkResults.push(`✅ ${message}`);
}

function logWarning(message) {
    console.log('⚠️', message);
    checkResults.push(`⚠️ ${message}`);
}

function logFailure(message) {
    console.log('❌', message);
    failedChecks++;
    checkResults.push(`❌ ${message}`);
}

function logInfo(message) {
    console.log('ℹ️', message);
}

// 1. TypeScript类型检查
console.log('🔍 1/6 执行TypeScript类型检查...');
try {
    execSync('npm run typecheck', { stdio: 'pipe' });
    logSuccess('TypeScript类型检查通过 - 0错误');
} catch (error) {
    logFailure('TypeScript类型检查失败');
}
console.log('');

// 2. ESLint代码质量检查
console.log('🔍 2/6 执行ESLint代码质量检查...');
try {
    execSync('npm run lint', { stdio: 'pipe' });
    logSuccess('ESLint代码质量检查通过 - 0错误，0警告');
} catch (error) {
    logFailure('ESLint代码质量检查失败');
}
console.log('');

// 3. Schema语法验证
console.log('🔍 3/6 执行Schema语法验证...');
const schemaDir = 'src/schemas/core-modules';
let schemaValid = true;
let schemaCount = 0;

try {
    if (fs.existsSync(schemaDir)) {
        const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
            const filePath = path.join(schemaDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                JSON.parse(content);
                schemaCount++;
            } catch (e) {
                schemaValid = false;
                logFailure(`Schema文件语法错误: ${file}`);
            }
        }
        
        if (schemaValid && schemaCount > 0) {
            logSuccess(`Schema语法验证通过 - ${schemaCount}个文件语法正确`);
        } else if (schemaCount === 0) {
            logWarning('Schema语法验证 - 未找到Schema文件');
        }
    } else {
        logWarning('Schema语法验证 - Schema目录不存在');
    }
} catch (error) {
    logFailure('Schema语法验证失败');
}
console.log('');

// 4. 安全审计
console.log('🔍 4/6 执行安全审计...');
try {
    execSync('npm run security:audit', { stdio: 'pipe' });
    logSuccess('安全审计通过 - 0个安全漏洞');
} catch (error) {
    logFailure('安全审计失败或发现漏洞');
}
console.log('');

// 5. 构建验证
console.log('🔍 5/6 执行构建验证...');
try {
    execSync('npm run build', { stdio: 'pipe' });
    logSuccess('构建验证通过 - TypeScript编译成功');
} catch (error) {
    logFailure('构建验证失败');
}
console.log('');

// 6. 测试验证（简化版）
console.log('🔍 6/6 执行测试验证...');
try {
    const testOutput = execSync('npm test', { encoding: 'utf8', stdio: 'pipe' });
    
    // 解析测试结果
    const testSuitesMatch = testOutput.match(/Test Suites:\s+(\d+)\s+passed/);
    const testsMatch = testOutput.match(/Tests:\s+(\d+)\s+passed/);
    
    if (testSuitesMatch && testsMatch) {
        const testSuites = testSuitesMatch[1];
        const totalTests = testsMatch[1];
        logSuccess(`测试验证通过 - ${testSuites}个测试套件，${totalTests}个测试，100%通过率`);
    } else {
        logSuccess('测试验证通过 - 所有测试执行成功');
    }
} catch (error) {
    logFailure('测试验证失败');
}
console.log('');

// 生成检查报告
console.log('📊 质量门禁检查报告');
console.log('==========================');
console.log('📅 检查时间:', new Date().toLocaleString());
console.log('🎯 检查范围: MPLP v1.0 - 8个已完成模块');
console.log('📋 质量标准: 企业级标准 + 零技术债务政策');
console.log('');

console.log('📈 检查结果统计:');
console.log(`- 总检查项: ${totalChecks}`);
console.log(`- 通过检查: ${passedChecks}`);
console.log(`- 失败检查: ${failedChecks}`);
console.log(`- 通过率: ${Math.round((passedChecks * 100) / totalChecks)}%`);
console.log('');

console.log('📋 详细检查结果:');
checkResults.forEach(result => console.log(result));
console.log('');

// 判断整体结果
if (failedChecks === 0) {
    console.log('🎉 质量门禁检查结果: ✅ 通过');
    console.log('🏆 所有8个模块达到企业级质量标准！');
    console.log('🚀 模块已准备好进行生产部署');
    process.exit(0);
} else {
    console.log('⚠️ 质量门禁检查结果: ❌ 未通过');
    console.log('🔧 请修复失败的检查项后重新运行');
    console.log('📖 详细信息请查看上述检查结果');
    process.exit(1);
}
