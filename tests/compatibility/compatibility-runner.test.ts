/**
 * MPLP兼容性测试执行器
 * 基于SCTM+GLFB+ITCM增强框架设计的企业级兼容性测试执行器
 */

import { MPLPCompatibilityTestSuite, CompatibilityTestResult } from './compatibility-test-suite';

describe('MPLP兼容性测试套件执行', () => {
  let compatibilitySuite: MPLPCompatibilityTestSuite;

  beforeAll(async () => {
    console.log('🔧 初始化MPLP兼容性测试环境...');
    compatibilitySuite = new MPLPCompatibilityTestSuite({
      enablePlatformTesting: true,
      enableNodeVersionTesting: true,
      enableDatabaseTesting: true,
      enableExternalServiceTesting: false, // 暂时禁用外部服务测试
      enableBrowserTesting: false, // 暂时禁用浏览器测试
      enableDeploymentTesting: false, // 暂时禁用部署测试
      testTimeout: 180000, // 3分钟超时
      reportFormat: 'json',
      outputDirectory: './tests/compatibility/reports'
    });
  });

  afterAll(async () => {
    console.log('🧹 清理兼容性测试环境...');
  });

  describe('平台兼容性测试', () => {
    it('应该执行操作系统兼容性测试', async () => {
      console.log('\n🖥️ 执行操作系统兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const osResult = results.find(r => r.testName === 'Operating System Compatibility');

      expect(osResult).toBeDefined();
      expect(osResult!.testType).toBe('platform');
      expect(['passed', 'failed', 'warning']).toContain(osResult!.status);
      expect(['full', 'partial', 'none']).toContain(osResult!.compatibility);

      console.log(`   📊 操作系统兼容性: ${osResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${osResult!.status}`);
      console.log(`   🖥️ 平台: ${osResult!.environment.platform}`);
      console.log(`   🏗️ 架构: ${osResult!.environment.arch}`);
      console.log(`   💾 内存: ${osResult!.environment.memory}GB`);
      console.log(`   🔧 CPU核心: ${osResult!.environment.cpus}`);

      if (osResult!.issues.length > 0) {
        console.log(`   ⚠️  发现问题:`);
        osResult!.issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }

      // 验证结果结构
      expect(osResult!.environment).toBeDefined();
      expect(osResult!.issues).toBeInstanceOf(Array);
      expect(osResult!.recommendations).toBeInstanceOf(Array);
      expect(typeof osResult!.executionTime).toBe('number');
    }, 60000);

    it('应该执行文件系统兼容性测试', async () => {
      console.log('\n📁 执行文件系统兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const fsResult = results.find(r => r.testName === 'File System Compatibility');

      expect(fsResult).toBeDefined();
      expect(fsResult!.testType).toBe('platform');

      console.log(`   📊 文件系统兼容性: ${fsResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${fsResult!.status}`);
      console.log(`   📁 问题数量: ${fsResult!.issues.length}`);

      if (fsResult!.issues.length > 0) {
        console.log(`   ⚠️  文件系统问题:`);
        fsResult!.issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
    }, 30000);

    it('应该执行路径兼容性测试', async () => {
      console.log('\n🛤️ 执行路径兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const pathResult = results.find(r => r.testName === 'Path Compatibility');

      expect(pathResult).toBeDefined();
      expect(pathResult!.testType).toBe('platform');

      console.log(`   📊 路径兼容性: ${pathResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${pathResult!.status}`);
      console.log(`   🛤️ 问题数量: ${pathResult!.issues.length}`);

      if (pathResult!.issues.length > 0) {
        console.log(`   ⚠️  路径问题:`);
        pathResult!.issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
    }, 30000);
  });

  describe('Node.js版本兼容性测试', () => {
    it('应该执行Node.js版本兼容性测试', async () => {
      console.log('\n🟢 执行Node.js版本兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const nodeResult = results.find(r => r.testName === 'Node.js Version Compatibility');

      expect(nodeResult).toBeDefined();
      expect(nodeResult!.testType).toBe('nodejs_version');

      console.log(`   📊 Node.js兼容性: ${nodeResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${nodeResult!.status}`);
      console.log(`   🟢 Node.js版本: ${nodeResult!.environment.nodeVersion}`);

      if (nodeResult!.issues.length > 0) {
        console.log(`   ⚠️  Node.js版本问题:`);
        nodeResult!.issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }

      // 验证Node.js版本要求
      const majorVersion = parseInt(nodeResult!.environment.nodeVersion.slice(1).split('.')[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(18); // 最低要求Node.js 18
    }, 30000);

    it('应该执行NPM版本兼容性测试', async () => {
      console.log('\n📦 执行NPM版本兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const npmResult = results.find(r => r.testName === 'NPM Version Compatibility');

      expect(npmResult).toBeDefined();
      expect(npmResult!.testType).toBe('nodejs_version');

      console.log(`   📊 NPM兼容性: ${npmResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${npmResult!.status}`);
      console.log(`   📦 NPM版本: ${npmResult!.environment.npmVersion}`);

      if (npmResult!.issues.length > 0) {
        console.log(`   ⚠️  NPM版本问题:`);
        npmResult!.issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
    }, 30000);

    it('应该执行Node.js API兼容性测试', async () => {
      console.log('\n🔌 执行Node.js API兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const apiResult = results.find(r => r.testName === 'Node.js API Compatibility');

      expect(apiResult).toBeDefined();
      expect(apiResult!.testType).toBe('nodejs_version');

      console.log(`   📊 API兼容性: ${apiResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${apiResult!.status}`);
      console.log(`   🔌 API问题数量: ${apiResult!.issues.length}`);

      if (apiResult!.issues.length > 0) {
        console.log(`   ⚠️  API兼容性问题:`);
        apiResult!.issues.slice(0, 3).forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
    }, 30000);
  });

  describe('数据库兼容性测试', () => {
    it('应该执行内存数据库兼容性测试', async () => {
      console.log('\n💾 执行内存数据库兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const memoryDbResult = results.find(r => r.testName === 'Memory Database Compatibility');

      expect(memoryDbResult).toBeDefined();
      expect(memoryDbResult!.testType).toBe('database');

      console.log(`   📊 内存数据库兼容性: ${memoryDbResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${memoryDbResult!.status}`);
      console.log(`   💾 问题数量: ${memoryDbResult!.issues.length}`);

      if (memoryDbResult!.issues.length > 0) {
        console.log(`   ⚠️  内存数据库问题:`);
        memoryDbResult!.issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
    }, 30000);

    it('应该执行PostgreSQL兼容性测试', async () => {
      console.log('\n🐘 执行PostgreSQL兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const pgResult = results.find(r => r.testName === 'PostgreSQL Compatibility');

      expect(pgResult).toBeDefined();
      expect(pgResult!.testType).toBe('database');

      console.log(`   📊 PostgreSQL兼容性: ${pgResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${pgResult!.status}`);
      console.log(`   🐘 问题数量: ${pgResult!.issues.length}`);

      if (pgResult!.issues.length > 0) {
        console.log(`   ⚠️  PostgreSQL问题:`);
        pgResult!.issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
    }, 30000);

    it('应该执行MongoDB兼容性测试', async () => {
      console.log('\n🍃 执行MongoDB兼容性测试...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();
      const mongoResult = results.find(r => r.testName === 'MongoDB Compatibility');

      expect(mongoResult).toBeDefined();
      expect(mongoResult!.testType).toBe('database');

      console.log(`   📊 MongoDB兼容性: ${mongoResult!.compatibility}`);
      console.log(`   🔍 测试状态: ${mongoResult!.status}`);
      console.log(`   🍃 问题数量: ${mongoResult!.issues.length}`);

      if (mongoResult!.issues.length > 0) {
        console.log(`   ⚠️  MongoDB问题:`);
        mongoResult!.issues.forEach((issue, index) => {
          console.log(`      ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
        });
      }
    }, 30000);
  });

  describe('兼容性测试综合报告', () => {
    it('应该生成完整的兼容性测试报告', async () => {
      console.log('\n📋 生成兼容性测试综合报告...');
      
      const results = await compatibilitySuite.executeCompatibilityTests();

      // 统计测试结果
      const totalTests = results.length;
      const passedTests = results.filter(r => r.status === 'passed').length;
      const failedTests = results.filter(r => r.status === 'failed').length;
      const warningTests = results.filter(r => r.status === 'warning').length;

      const fullCompatibility = results.filter(r => r.compatibility === 'full').length;
      const partialCompatibility = results.filter(r => r.compatibility === 'partial').length;
      const noCompatibility = results.filter(r => r.compatibility === 'none').length;

      const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
      const criticalIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0);
      const highIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'high').length, 0);
      const mediumIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'medium').length, 0);
      const lowIssues = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'low').length, 0);

      console.log(`\n📊 兼容性测试综合报告:`);
      console.log(`   🧪 测试总数: ${totalTests}`);
      console.log(`   ✅ 通过测试: ${passedTests}`);
      console.log(`   ❌ 失败测试: ${failedTests}`);
      console.log(`   ⚠️  警告测试: ${warningTests}`);
      console.log(`   📈 通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

      console.log(`\n🔧 兼容性统计:`);
      console.log(`   ✅ 完全兼容: ${fullCompatibility}`);
      console.log(`   ⚠️  部分兼容: ${partialCompatibility}`);
      console.log(`   ❌ 不兼容: ${noCompatibility}`);
      console.log(`   📈 兼容率: ${(((fullCompatibility + partialCompatibility) / totalTests) * 100).toFixed(1)}%`);

      console.log(`\n🔍 兼容性问题统计:`);
      console.log(`   📊 问题总数: ${totalIssues}`);
      console.log(`   🚨 严重问题: ${criticalIssues}`);
      console.log(`   ⚠️  高危问题: ${highIssues}`);
      console.log(`   📋 中危问题: ${mediumIssues}`);
      console.log(`   ℹ️  低危问题: ${lowIssues}`);

      // 验证测试完整性
      expect(totalTests).toBeGreaterThan(0);
      expect(results.every(r => r.testType && r.testName && r.status)).toBe(true);
      expect(results.every(r => r.compatibility && Array.isArray(r.issues))).toBe(true);
      expect(results.every(r => Array.isArray(r.recommendations))).toBe(true);

      // 兼容性标准验证
      expect(criticalIssues).toBeLessThanOrEqual(0); // 不应有严重兼容性问题
      expect(noCompatibility).toBeLessThanOrEqual(1); // 最多1个完全不兼容的测试

      if (criticalIssues > 0 || noCompatibility > 1) {
        console.log(`\n🚨 兼容性警告: 发现${criticalIssues}个严重问题和${noCompatibility}个不兼容项，需要立即处理！`);
      } else {
        console.log(`\n✅ 兼容性状态良好: 系统具有良好的跨平台兼容性`);
      }

      // 环境信息报告
      const env = results[0]?.environment;
      if (env) {
        console.log(`\n🖥️ 测试环境信息:`);
        console.log(`   平台: ${env.platform} ${env.arch}`);
        console.log(`   Node.js: ${env.nodeVersion}`);
        console.log(`   NPM: ${env.npmVersion}`);
        console.log(`   操作系统: ${env.osVersion}`);
        console.log(`   内存: ${env.memory}GB`);
        console.log(`   CPU核心: ${env.cpus}`);
      }
    }, 240000);
  });
});
