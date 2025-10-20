/**
 * MPLP安全测试执行器
 * 基于SCTM+GLFB+ITCM增强框架设计的企业级安全测试执行器
 */

import { MPLPSecurityTestSuite, SecurityTestResult } from './security-test-suite';

describe('MPLP安全测试套件执行', () => {
  let securitySuite: MPLPSecurityTestSuite;

  beforeAll(async () => {
    console.log('🛡️ 初始化MPLP安全测试环境...');
    securitySuite = new MPLPSecurityTestSuite({
      enableVulnerabilityScanning: true,
      enablePenetrationTesting: false, // 暂时禁用渗透测试
      enablePermissionTesting: true,
      enableDataSecurityTesting: true,
      enableComplianceChecking: false, // 暂时禁用合规检查
      testTimeout: 120000, // 2分钟超时
      reportFormat: 'json',
      outputDirectory: './tests/security/reports'
    });
  });

  afterAll(async () => {
    console.log('🧹 清理安全测试环境...');
  });

  describe('漏洞扫描测试', () => {
    it('应该执行NPM审计扫描', async () => {
      console.log('\n🔍 执行NPM审计扫描...');
      
      const results = await securitySuite.executeSecurityTests();
      const npmAuditResult = results.find(r => r.testName === 'NPM Audit Scan');

      expect(npmAuditResult).toBeDefined();
      expect(npmAuditResult!.testType).toBe('vulnerability_scan');
      expect(['passed', 'failed', 'warning']).toContain(npmAuditResult!.status);

      console.log(`   📊 NPM审计结果: ${npmAuditResult!.status}`);
      console.log(`   🔍 发现问题数: ${npmAuditResult!.findings.length}`);
      console.log(`   ⏱️  执行时间: ${npmAuditResult!.executionTime}ms`);

      if (npmAuditResult!.findings.length > 0) {
        console.log(`   ⚠️  主要发现:`);
        npmAuditResult!.findings.slice(0, 3).forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }

      // 验证结果结构
      expect(npmAuditResult!.findings).toBeInstanceOf(Array);
      expect(npmAuditResult!.recommendations).toBeInstanceOf(Array);
      expect(typeof npmAuditResult!.executionTime).toBe('number');
      expect(npmAuditResult!.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    }, 60000);

    it('应该执行依赖安全扫描', async () => {
      console.log('\n🔍 执行依赖安全扫描...');
      
      const results = await securitySuite.executeSecurityTests();
      const depScanResult = results.find(r => r.testName === 'Dependency Security Scan');

      expect(depScanResult).toBeDefined();
      expect(depScanResult!.testType).toBe('vulnerability_scan');

      console.log(`   📊 依赖扫描结果: ${depScanResult!.status}`);
      console.log(`   🔍 发现问题数: ${depScanResult!.findings.length}`);
      console.log(`   💡 建议数: ${depScanResult!.recommendations.length}`);

      if (depScanResult!.findings.length > 0) {
        console.log(`   ⚠️  主要发现:`);
        depScanResult!.findings.forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }
    }, 30000);

    it('应该执行代码安全扫描', async () => {
      console.log('\n🔍 执行代码安全扫描...');
      
      const results = await securitySuite.executeSecurityTests();
      const codeScanResult = results.find(r => r.testName === 'Code Security Scan');

      expect(codeScanResult).toBeDefined();
      expect(codeScanResult!.testType).toBe('vulnerability_scan');

      console.log(`   📊 代码扫描结果: ${codeScanResult!.status}`);
      console.log(`   🔍 发现问题数: ${codeScanResult!.findings.length}`);

      if (codeScanResult!.findings.length > 0) {
        console.log(`   ⚠️  主要发现:`);
        codeScanResult!.findings.slice(0, 5).forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
          if (finding.location) {
            console.log(`         位置: ${finding.location}`);
          }
        });
      }
    }, 45000);
  });

  describe('权限测试', () => {
    it('应该执行RBAC权限测试', async () => {
      console.log('\n🔐 执行RBAC权限测试...');
      
      const results = await securitySuite.executeSecurityTests();
      const rbacResult = results.find(r => r.testName === 'RBAC Permissions Test');

      expect(rbacResult).toBeDefined();
      expect(rbacResult!.testType).toBe('permission_test');

      console.log(`   📊 RBAC测试结果: ${rbacResult!.status}`);
      console.log(`   🔍 发现问题数: ${rbacResult!.findings.length}`);

      if (rbacResult!.findings.length > 0) {
        console.log(`   ⚠️  权限问题:`);
        rbacResult!.findings.forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }
    }, 30000);

    it('应该执行API访问控制测试', async () => {
      console.log('\n🔐 执行API访问控制测试...');
      
      const results = await securitySuite.executeSecurityTests();
      const apiResult = results.find(r => r.testName === 'API Access Control Test');

      expect(apiResult).toBeDefined();
      expect(apiResult!.testType).toBe('permission_test');

      console.log(`   📊 API访问控制结果: ${apiResult!.status}`);
      console.log(`   🔍 发现问题数: ${apiResult!.findings.length}`);

      if (apiResult!.findings.length > 0) {
        console.log(`   ⚠️  API安全问题:`);
        apiResult!.findings.slice(0, 3).forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }
    }, 30000);

    it('应该执行文件系统权限测试', async () => {
      console.log('\n🔐 执行文件系统权限测试...');
      
      const results = await securitySuite.executeSecurityTests();
      const fsResult = results.find(r => r.testName === 'File System Permissions Test');

      expect(fsResult).toBeDefined();
      expect(fsResult!.testType).toBe('permission_test');

      console.log(`   📊 文件系统权限结果: ${fsResult!.status}`);
      console.log(`   🔍 发现问题数: ${fsResult!.findings.length}`);

      if (fsResult!.findings.length > 0) {
        console.log(`   ⚠️  文件权限问题:`);
        fsResult!.findings.forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }
    }, 30000);
  });

  describe('数据安全测试', () => {
    it('应该执行数据加密测试', async () => {
      console.log('\n🔒 执行数据加密测试...');
      
      const results = await securitySuite.executeSecurityTests();
      const encryptionResult = results.find(r => r.testName === 'Data Encryption Test');

      expect(encryptionResult).toBeDefined();
      expect(encryptionResult!.testType).toBe('data_security');

      console.log(`   📊 数据加密测试结果: ${encryptionResult!.status}`);
      console.log(`   🔍 发现问题数: ${encryptionResult!.findings.length}`);

      if (encryptionResult!.findings.length > 0) {
        console.log(`   ⚠️  加密问题:`);
        encryptionResult!.findings.forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }
    }, 30000);

    it('应该执行敏感数据保护测试', async () => {
      console.log('\n🔒 执行敏感数据保护测试...');
      
      const results = await securitySuite.executeSecurityTests();
      const sensitiveDataResult = results.find(r => r.testName === 'Sensitive Data Protection Test');

      expect(sensitiveDataResult).toBeDefined();
      expect(sensitiveDataResult!.testType).toBe('data_security');

      console.log(`   📊 敏感数据保护结果: ${sensitiveDataResult!.status}`);
      console.log(`   🔍 发现问题数: ${sensitiveDataResult!.findings.length}`);

      if (sensitiveDataResult!.findings.length > 0) {
        console.log(`   ⚠️  敏感数据问题:`);
        sensitiveDataResult!.findings.slice(0, 3).forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }
    }, 30000);

    it('应该执行数据传输安全测试', async () => {
      console.log('\n🔒 执行数据传输安全测试...');
      
      const results = await securitySuite.executeSecurityTests();
      const transmissionResult = results.find(r => r.testName === 'Data Transmission Security Test');

      expect(transmissionResult).toBeDefined();
      expect(transmissionResult!.testType).toBe('data_security');

      console.log(`   📊 数据传输安全结果: ${transmissionResult!.status}`);
      console.log(`   🔍 发现问题数: ${transmissionResult!.findings.length}`);

      if (transmissionResult!.findings.length > 0) {
        console.log(`   ⚠️  传输安全问题:`);
        transmissionResult!.findings.forEach((finding, index) => {
          console.log(`      ${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`);
        });
      }
    }, 30000);
  });

  describe('安全测试综合报告', () => {
    it('应该生成完整的安全测试报告', async () => {
      console.log('\n📋 生成安全测试综合报告...');
      
      const results = await securitySuite.executeSecurityTests();

      // 统计测试结果
      const totalTests = results.length;
      const passedTests = results.filter(r => r.status === 'passed').length;
      const failedTests = results.filter(r => r.status === 'failed').length;
      const warningTests = results.filter(r => r.status === 'warning').length;

      const totalFindings = results.reduce((sum, r) => sum + r.findings.length, 0);
      const criticalFindings = results.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'critical').length, 0);
      const highFindings = results.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'high').length, 0);
      const mediumFindings = results.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'medium').length, 0);
      const lowFindings = results.reduce((sum, r) => sum + r.findings.filter(f => f.severity === 'low').length, 0);

      console.log(`\n📊 安全测试综合报告:`);
      console.log(`   🧪 测试总数: ${totalTests}`);
      console.log(`   ✅ 通过测试: ${passedTests}`);
      console.log(`   ❌ 失败测试: ${failedTests}`);
      console.log(`   ⚠️  警告测试: ${warningTests}`);
      console.log(`   📈 通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

      console.log(`\n🔍 安全发现统计:`);
      console.log(`   📊 发现总数: ${totalFindings}`);
      console.log(`   🚨 严重问题: ${criticalFindings}`);
      console.log(`   ⚠️  高危问题: ${highFindings}`);
      console.log(`   📋 中危问题: ${mediumFindings}`);
      console.log(`   ℹ️  低危问题: ${lowFindings}`);

      // 验证测试完整性
      expect(totalTests).toBeGreaterThan(0);
      expect(results.every(r => r.testType && r.testName && r.status)).toBe(true);
      expect(results.every(r => Array.isArray(r.findings))).toBe(true);
      expect(results.every(r => Array.isArray(r.recommendations))).toBe(true);

      // 安全标准验证
      expect(criticalFindings).toBeLessThanOrEqual(0); // 不应有严重安全问题
      expect(highFindings).toBeLessThanOrEqual(5); // 高危问题应控制在5个以内

      if (criticalFindings > 0 || highFindings > 5) {
        console.log(`\n🚨 安全警告: 发现${criticalFindings}个严重问题和${highFindings}个高危问题，需要立即处理！`);
      } else {
        console.log(`\n✅ 安全状态良好: 未发现严重安全问题`);
      }
    }, 180000);
  });
});
