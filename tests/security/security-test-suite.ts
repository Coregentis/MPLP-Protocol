/**
 * MPLP安全测试套件
 * 基于SCTM+GLFB+ITCM增强框架设计的企业级安全测试系统
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 安全测试结果接口
 */
export interface SecurityTestResult {
  testType: 'vulnerability_scan' | 'penetration_test' | 'permission_test' | 'data_security' | 'compliance_check';
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  findings: SecurityFinding[];
  recommendations: string[];
  executionTime: number;
  timestamp: string;
}

/**
 * 安全发现接口
 */
export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  location?: string;
  cwe?: string; // Common Weakness Enumeration
  cvss?: number; // Common Vulnerability Scoring System
  remediation: string;
}

/**
 * 安全测试配置
 */
export interface SecurityTestConfig {
  enableVulnerabilityScanning: boolean;
  enablePenetrationTesting: boolean;
  enablePermissionTesting: boolean;
  enableDataSecurityTesting: boolean;
  enableComplianceChecking: boolean;
  testTimeout: number;
  reportFormat: 'json' | 'html' | 'xml';
  outputDirectory: string;
}

/**
 * MPLP安全测试套件主类
 */
export class MPLPSecurityTestSuite {
  private config: SecurityTestConfig;
  private results: SecurityTestResult[] = [];

  constructor(config: Partial<SecurityTestConfig> = {}) {
    this.config = {
      enableVulnerabilityScanning: true,
      enablePenetrationTesting: true,
      enablePermissionTesting: true,
      enableDataSecurityTesting: true,
      enableComplianceChecking: true,
      testTimeout: 300000, // 5分钟
      reportFormat: 'json',
      outputDirectory: './tests/security/reports',
      ...config
    };

    // 确保报告目录存在
    if (!fs.existsSync(this.config.outputDirectory)) {
      fs.mkdirSync(this.config.outputDirectory, { recursive: true });
    }
  }

  /**
   * 执行完整的安全测试套件
   */
  async executeSecurityTests(): Promise<SecurityTestResult[]> {
    console.log('🛡️ 开始执行MPLP安全测试套件...');
    
    const startTime = Date.now();
    this.results = [];

    try {
      // 1. 漏洞扫描测试
      if (this.config.enableVulnerabilityScanning) {
        console.log('🔍 执行漏洞扫描测试...');
        const vulnResults = await this.runVulnerabilityScanning();
        this.results.push(...vulnResults);
      }

      // 2. 权限测试
      if (this.config.enablePermissionTesting) {
        console.log('🔐 执行权限验证测试...');
        const permResults = await this.runPermissionTests();
        this.results.push(...permResults);
      }

      // 3. 数据安全测试
      if (this.config.enableDataSecurityTesting) {
        console.log('🔒 执行数据安全测试...');
        const dataResults = await this.runDataSecurityTests();
        this.results.push(...dataResults);
      }

      // 4. 渗透测试
      if (this.config.enablePenetrationTesting) {
        console.log('⚔️ 执行渗透测试...');
        const penResults = await this.runPenetrationTests();
        this.results.push(...penResults);
      }

      // 5. 合规性检查
      if (this.config.enableComplianceChecking) {
        console.log('📋 执行合规性检查...');
        const compResults = await this.runComplianceChecks();
        this.results.push(...compResults);
      }

      const totalTime = Date.now() - startTime;
      console.log(`✅ 安全测试套件执行完成，耗时: ${totalTime}ms`);

      // 生成测试报告
      await this.generateSecurityReport();

      return this.results;

    } catch (error) {
      console.error('❌ 安全测试执行失败:', error);
      throw error;
    }
  }

  /**
   * 运行漏洞扫描测试
   */
  private async runVulnerabilityScanning(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // 1. NPM审计扫描
    const npmAuditResult = await this.runNpmAudit();
    results.push(npmAuditResult);

    // 2. 依赖漏洞扫描
    const depScanResult = await this.runDependencyScanning();
    results.push(depScanResult);

    // 3. 代码安全扫描
    const codeScanResult = await this.runCodeSecurityScanning();
    results.push(codeScanResult);

    return results;
  }

  /**
   * NPM审计扫描
   */
  private async runNpmAudit(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    
    try {
      const auditOutput = await this.executeCommand('npm audit --json');
      const auditData = JSON.parse(auditOutput);
      
      const findings: SecurityFinding[] = [];
      
      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([pkg, vuln]: [string, any]) => {
          findings.push({
            id: `npm-${pkg}-${vuln.severity}`,
            title: `${pkg} vulnerability`,
            description: vuln.title || `Vulnerability in ${pkg}`,
            severity: this.mapSeverity(vuln.severity),
            category: 'dependency',
            location: `package: ${pkg}`,
            cvss: vuln.cvss?.score,
            remediation: vuln.fixAvailable ? 'Update to fixed version' : 'No fix available'
          });
        });
      }

      const status = findings.filter(f => f.severity === 'high' || f.severity === 'critical').length > 0 ? 'failed' : 'passed';

      return {
        testType: 'vulnerability_scan',
        testName: 'NPM Audit Scan',
        status,
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Update vulnerable dependencies',
          'Review security advisories',
          'Consider alternative packages for unfixable vulnerabilities'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'vulnerability_scan',
        testName: 'NPM Audit Scan',
        status: 'failed',
        severity: 'high',
        findings: [{
          id: 'npm-audit-error',
          title: 'NPM Audit Failed',
          description: `NPM audit execution failed: ${error.message}`,
          severity: 'high',
          category: 'tool_error',
          remediation: 'Check npm installation and network connectivity'
        }],
        recommendations: ['Fix npm audit execution issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 依赖漏洞扫描
   */
  private async runDependencyScanning(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // 检查package.json中的依赖
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // 检查已知的有问题的包
        const problematicPackages = [
          'event-stream', 'flatmap-stream', 'getcookies', 'rc', 'node-ipc'
        ];

        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const [pkg, version] of Object.entries(allDeps)) {
          if (problematicPackages.includes(pkg)) {
            findings.push({
              id: `dep-${pkg}`,
              title: `Potentially problematic dependency: ${pkg}`,
              description: `Package ${pkg} has been flagged for security concerns`,
              severity: 'medium',
              category: 'dependency',
              location: `package.json: ${pkg}@${version}`,
              remediation: 'Review package necessity and consider alternatives'
            });
          }
        }
      }

      return {
        testType: 'vulnerability_scan',
        testName: 'Dependency Security Scan',
        status: findings.length > 0 ? 'warning' : 'passed',
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Regularly update dependencies',
          'Use npm audit for continuous monitoring',
          'Consider using tools like Snyk for advanced scanning'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'vulnerability_scan',
        testName: 'Dependency Security Scan',
        status: 'failed',
        severity: 'medium',
        findings: [{
          id: 'dep-scan-error',
          title: 'Dependency scan failed',
          description: `Dependency scanning failed: ${error.message}`,
          severity: 'medium',
          category: 'tool_error',
          remediation: 'Check file permissions and package.json format'
        }],
        recommendations: ['Fix dependency scanning issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 代码安全扫描
   */
  private async runCodeSecurityScanning(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // 扫描常见的安全问题模式
      const srcDir = path.join(process.cwd(), 'src');
      if (fs.existsSync(srcDir)) {
        await this.scanDirectoryForSecurityIssues(srcDir, findings);
      }

      return {
        testType: 'vulnerability_scan',
        testName: 'Code Security Scan',
        status: findings.filter(f => f.severity === 'high' || f.severity === 'critical').length > 0 ? 'failed' : 'passed',
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Review flagged code patterns',
          'Implement input validation',
          'Use parameterized queries',
          'Avoid hardcoded secrets'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'vulnerability_scan',
        testName: 'Code Security Scan',
        status: 'failed',
        severity: 'medium',
        findings: [{
          id: 'code-scan-error',
          title: 'Code security scan failed',
          description: `Code scanning failed: ${error.message}`,
          severity: 'medium',
          category: 'tool_error',
          remediation: 'Check file permissions and source code accessibility'
        }],
        recommendations: ['Fix code scanning issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 扫描目录中的安全问题
   */
  private async scanDirectoryForSecurityIssues(dir: string, findings: SecurityFinding[]): Promise<void> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await this.scanDirectoryForSecurityIssues(filePath, findings);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        // 跳过Schema文件和测试文件，避免误报
        if (file.includes('schema') || file.includes('.test.') || file.includes('.spec.')) {
          continue;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        this.scanFileContent(filePath, content, findings);
      }
    }
  }

  /**
   * 扫描文件内容中的安全问题
   */
  private scanFileContent(filePath: string, content: string, findings: SecurityFinding[]): void {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // 检查硬编码密码
      if (/password\s*[:=]\s*['"][^'"]{3,}['"]/.test(line.toLowerCase())) {
        findings.push({
          id: `hardcoded-password-${filePath}-${lineNumber}`,
          title: 'Potential hardcoded password',
          description: 'Hardcoded password detected in source code',
          severity: 'high',
          category: 'credential_exposure',
          location: `${filePath}:${lineNumber}`,
          cwe: 'CWE-798',
          remediation: 'Use environment variables or secure configuration'
        });
      }
      
      // 检查SQL注入风险
      if (/query\s*\+\s*['"]/.test(line) || /['"].*\+.*query/.test(line)) {
        findings.push({
          id: `sql-injection-${filePath}-${lineNumber}`,
          title: 'Potential SQL injection vulnerability',
          description: 'String concatenation in SQL query detected',
          severity: 'high',
          category: 'injection',
          location: `${filePath}:${lineNumber}`,
          cwe: 'CWE-89',
          remediation: 'Use parameterized queries or prepared statements'
        });
      }
      
      // 检查eval使用
      if (/\beval\s*\(/.test(line)) {
        findings.push({
          id: `eval-usage-${filePath}-${lineNumber}`,
          title: 'Dangerous eval() usage',
          description: 'Use of eval() function detected',
          severity: 'high',
          category: 'code_injection',
          location: `${filePath}:${lineNumber}`,
          cwe: 'CWE-95',
          remediation: 'Avoid eval() and use safer alternatives'
        });
      }
    });
  }

  /**
   * 执行命令行工具
   */
  private executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { shell: true });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      // 设置超时
      setTimeout(() => {
        process.kill();
        reject(new Error('Command timeout'));
      }, this.config.testTimeout);
    });
  }

  /**
   * 映射严重程度
   */
  private mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'moderate': 
      case 'medium': return 'medium';
      case 'low':
      case 'info': return 'low';
      default: return 'medium';
    }
  }

  /**
   * 运行权限测试
   */
  private async runPermissionTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // 1. RBAC权限测试
    const rbacResult = await this.testRBACPermissions();
    results.push(rbacResult);

    // 2. API访问控制测试
    const apiResult = await this.testAPIAccessControl();
    results.push(apiResult);

    // 3. 文件系统权限测试
    const fsResult = await this.testFileSystemPermissions();
    results.push(fsResult);

    return results;
  }

  /**
   * 测试RBAC权限系统
   */
  private async testRBACPermissions(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // 检查Role模块的权限配置
      const roleModulePath = path.join(process.cwd(), 'src/modules/role');
      if (fs.existsSync(roleModulePath)) {
        // 检查权限配置文件
        const configFiles = ['permissions.json', 'roles.json', 'rbac.config.ts'];
        let hasPermissionConfig = false;

        for (const configFile of configFiles) {
          const configPath = path.join(roleModulePath, configFile);
          if (fs.existsSync(configPath)) {
            hasPermissionConfig = true;
            break;
          }
        }

        if (!hasPermissionConfig) {
          findings.push({
            id: 'rbac-config-missing',
            title: 'RBAC configuration not found',
            description: 'No RBAC configuration files found in Role module',
            severity: 'medium',
            category: 'access_control',
            location: roleModulePath,
            remediation: 'Implement proper RBAC configuration'
          });
        }

        // 检查权限验证逻辑
        const serviceFiles = fs.readdirSync(path.join(roleModulePath, 'application/services'))
          .filter(f => f.endsWith('.ts'));

        let hasPermissionValidation = false;
        for (const serviceFile of serviceFiles) {
          const content = fs.readFileSync(path.join(roleModulePath, 'application/services', serviceFile), 'utf8');
          if (content.includes('checkPermission') || content.includes('hasRole') || content.includes('authorize')) {
            hasPermissionValidation = true;
            break;
          }
        }

        if (!hasPermissionValidation) {
          findings.push({
            id: 'rbac-validation-missing',
            title: 'Permission validation logic not found',
            description: 'No permission validation methods found in Role services',
            severity: 'high',
            category: 'access_control',
            location: `${roleModulePath}/application/services`,
            remediation: 'Implement permission validation methods'
          });
        }
      } else {
        findings.push({
          id: 'role-module-missing',
          title: 'Role module not found',
          description: 'Role module directory not found',
          severity: 'critical',
          category: 'access_control',
          location: roleModulePath,
          remediation: 'Implement Role module for access control'
        });
      }

      return {
        testType: 'permission_test',
        testName: 'RBAC Permissions Test',
        status: findings.filter(f => f.severity === 'high' || f.severity === 'critical').length > 0 ? 'failed' : 'passed',
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Implement comprehensive RBAC system',
          'Add permission validation to all protected endpoints',
          'Create role hierarchy and permission matrix',
          'Add audit logging for permission checks'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'permission_test',
        testName: 'RBAC Permissions Test',
        status: 'failed',
        severity: 'high',
        findings: [{
          id: 'rbac-test-error',
          title: 'RBAC test failed',
          description: `RBAC testing failed: ${error.message}`,
          severity: 'high',
          category: 'tool_error',
          remediation: 'Fix RBAC testing infrastructure'
        }],
        recommendations: ['Fix RBAC testing issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 测试API访问控制
   */
  private async testAPIAccessControl(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // 扫描API路由文件
      const srcDir = path.join(process.cwd(), 'src');
      await this.scanForAPISecurityIssues(srcDir, findings);

      return {
        testType: 'permission_test',
        testName: 'API Access Control Test',
        status: findings.filter(f => f.severity === 'high' || f.severity === 'critical').length > 0 ? 'failed' : 'passed',
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Add authentication middleware to all protected routes',
          'Implement rate limiting',
          'Add input validation and sanitization',
          'Use HTTPS for all API communications'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'permission_test',
        testName: 'API Access Control Test',
        status: 'failed',
        severity: 'medium',
        findings: [{
          id: 'api-test-error',
          title: 'API access control test failed',
          description: `API testing failed: ${error.message}`,
          severity: 'medium',
          category: 'tool_error',
          remediation: 'Fix API testing infrastructure'
        }],
        recommendations: ['Fix API testing issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 扫描API安全问题
   */
  private async scanForAPISecurityIssues(dir: string, findings: SecurityFinding[]): Promise<void> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await this.scanForAPISecurityIssues(filePath, findings);
      } else if ((file.includes('controller') || file.includes('route') || file.includes('api')) &&
                 (file.endsWith('.ts') || file.endsWith('.js'))) {
        const content = fs.readFileSync(filePath, 'utf8');
        this.scanAPIFileContent(filePath, content, findings);
      }
    }
  }

  /**
   * 扫描API文件内容
   */
  private scanAPIFileContent(filePath: string, content: string, findings: SecurityFinding[]): void {
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // 检查未保护的路由
      if (/(app\.|router\.|express\.)(get|post|put|delete|patch)\s*\(/.test(line) &&
          !content.includes('authenticate') && !content.includes('authorize') &&
          !content.includes('checkPermission')) {
        findings.push({
          id: `unprotected-route-${filePath}-${lineNumber}`,
          title: 'Potentially unprotected API route',
          description: 'API route without apparent authentication/authorization',
          severity: 'medium',
          category: 'access_control',
          location: `${filePath}:${lineNumber}`,
          remediation: 'Add authentication and authorization middleware'
        });
      }

      // 检查CORS配置
      if (/cors\s*\(\s*\)/.test(line) || /Access-Control-Allow-Origin.*\*/.test(line)) {
        findings.push({
          id: `cors-wildcard-${filePath}-${lineNumber}`,
          title: 'Permissive CORS configuration',
          description: 'CORS allows all origins (*)',
          severity: 'medium',
          category: 'configuration',
          location: `${filePath}:${lineNumber}`,
          remediation: 'Configure CORS to allow only trusted origins'
        });
      }
    });
  }

  /**
   * 测试文件系统权限
   */
  private async testFileSystemPermissions(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // 检查敏感文件的权限
      const sensitiveFiles = [
        '.env',
        '.env.local',
        '.env.production',
        'config/database.json',
        'config/secrets.json',
        'private.key',
        'certificate.pem'
      ];

      for (const file of sensitiveFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const mode = stats.mode & parseInt('777', 8);

          // 检查文件权限是否过于宽松
          if (mode > parseInt('600', 8)) {
            findings.push({
              id: `file-permission-${file}`,
              title: `Insecure file permissions: ${file}`,
              description: `File ${file} has overly permissive permissions (${mode.toString(8)})`,
              severity: 'high',
              category: 'file_permissions',
              location: filePath,
              remediation: `Change file permissions to 600 or more restrictive`
            });
          }
        }
      }

      return {
        testType: 'permission_test',
        testName: 'File System Permissions Test',
        status: findings.filter(f => f.severity === 'high' || f.severity === 'critical').length > 0 ? 'failed' : 'passed',
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Set restrictive permissions on sensitive files (600 or 640)',
          'Store secrets in environment variables or secure vaults',
          'Regularly audit file permissions',
          'Use proper file ownership and group settings'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'permission_test',
        testName: 'File System Permissions Test',
        status: 'failed',
        severity: 'medium',
        findings: [{
          id: 'fs-permission-test-error',
          title: 'File system permission test failed',
          description: `File system testing failed: ${error.message}`,
          severity: 'medium',
          category: 'tool_error',
          remediation: 'Fix file system testing infrastructure'
        }],
        recommendations: ['Fix file system testing issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 运行数据安全测试
   */
  private async runDataSecurityTests(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // 1. 数据加密测试
    const encryptionResult = await this.testDataEncryption();
    results.push(encryptionResult);

    // 2. 敏感数据保护测试
    const sensitiveDataResult = await this.testSensitiveDataProtection();
    results.push(sensitiveDataResult);

    // 3. 数据传输安全测试
    const transmissionResult = await this.testDataTransmissionSecurity();
    results.push(transmissionResult);

    return results;
  }

  /**
   * 测试数据加密
   */
  private async testDataEncryption(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // 检查加密配置
      const srcDir = path.join(process.cwd(), 'src');
      await this.scanForEncryptionUsage(srcDir, findings);

      // 检查数据库配置中的加密设置
      const configFiles = ['config/database.json', 'src/config/database.ts', '.env'];
      for (const configFile of configFiles) {
        const configPath = path.join(process.cwd(), configFile);
        if (fs.existsSync(configPath)) {
          const content = fs.readFileSync(configPath, 'utf8');
          if (!content.includes('encrypt') && !content.includes('ssl') && !content.includes('tls')) {
            findings.push({
              id: `db-encryption-missing-${configFile}`,
              title: 'Database encryption not configured',
              description: `Database configuration in ${configFile} does not specify encryption`,
              severity: 'medium',
              category: 'data_protection',
              location: configPath,
              remediation: 'Enable database encryption and SSL/TLS connections'
            });
          }
        }
      }

      return {
        testType: 'data_security',
        testName: 'Data Encryption Test',
        status: findings.filter(f => f.severity === 'high' || f.severity === 'critical').length > 0 ? 'failed' : 'passed',
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Implement encryption for sensitive data at rest',
          'Use strong encryption algorithms (AES-256)',
          'Implement proper key management',
          'Enable database encryption and SSL connections'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'data_security',
        testName: 'Data Encryption Test',
        status: 'failed',
        severity: 'medium',
        findings: [{
          id: 'encryption-test-error',
          title: 'Data encryption test failed',
          description: `Encryption testing failed: ${error.message}`,
          severity: 'medium',
          category: 'tool_error',
          remediation: 'Fix encryption testing infrastructure'
        }],
        recommendations: ['Fix encryption testing issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 扫描加密使用情况
   */
  private async scanForEncryptionUsage(dir: string, findings: SecurityFinding[]): Promise<void> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await this.scanForEncryptionUsage(filePath, findings);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        // 跳过Schema文件、测试文件、文档文件等，避免误报
        if (file.includes('schema') || file.includes('.test.') || file.includes('.spec.') ||
            file.includes('mock') || file.includes('example') || file.includes('doc') ||
            filePath.includes('node_modules') || filePath.includes('dist') || filePath.includes('build')) {
          continue;
        }
        const content = fs.readFileSync(filePath, 'utf8');

        // 检查是否使用了弱加密算法 - 使用更精确的检测
        const weakCryptoPatterns = [
          { pattern: /crypto\.createCipher\(['"]des['"]|crypto\.createDecipher\(['"]des['"]/gi, algorithm: 'des' },
          { pattern: /crypto\.createHash\(['"]md5['"]/gi, algorithm: 'md5' },
          { pattern: /crypto\.createHash\(['"]sha1['"]/gi, algorithm: 'sha1' },
          { pattern: /crypto\.createCipher\(['"]rc4['"]|crypto\.createDecipher\(['"]rc4['"]/gi, algorithm: 'rc4' },
          { pattern: /\.digest\(['"]md5['"]\)/gi, algorithm: 'md5' },
          { pattern: /\.digest\(['"]sha1['"]\)/gi, algorithm: 'sha1' }
        ];

        for (const { pattern, algorithm } of weakCryptoPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            findings.push({
              id: `weak-crypto-${filePath}-${algorithm}`,
              title: `Weak cryptographic algorithm: ${algorithm}`,
              description: `Use of weak cryptographic algorithm ${algorithm} detected`,
              severity: 'high',
              category: 'cryptography',
              location: filePath,
              cwe: 'CWE-327',
              remediation: `Replace ${algorithm} with stronger algorithms like SHA-256 or AES-256`
            });
          }
        }

        // 检查硬编码的加密密钥
        if (/key\s*[:=]\s*['"][a-fA-F0-9]{16,}['"]/.test(content)) {
          findings.push({
            id: `hardcoded-key-${filePath}`,
            title: 'Hardcoded encryption key',
            description: 'Hardcoded encryption key detected in source code',
            severity: 'critical',
            category: 'key_management',
            location: filePath,
            cwe: 'CWE-798',
            remediation: 'Use environment variables or secure key management systems'
          });
        }
      }
    }
  }

  /**
   * 测试敏感数据保护
   */
  private async testSensitiveDataProtection(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // 扫描源代码中的敏感数据
      const srcDir = path.join(process.cwd(), 'src');
      await this.scanForSensitiveData(srcDir, findings);

      // 检查日志配置
      const logConfigFiles = ['src/config/logging.ts', 'src/utils/logger.ts'];
      for (const logFile of logConfigFiles) {
        const logPath = path.join(process.cwd(), logFile);
        if (fs.existsSync(logPath)) {
          const content = fs.readFileSync(logPath, 'utf8');
          if (!content.includes('sanitize') && !content.includes('redact') && !content.includes('mask')) {
            findings.push({
              id: `log-sanitization-missing-${logFile}`,
              title: 'Log sanitization not implemented',
              description: 'Logging configuration does not include data sanitization',
              severity: 'medium',
              category: 'data_protection',
              location: logPath,
              remediation: 'Implement log data sanitization to prevent sensitive data leakage'
            });
          }
        }
      }

      return {
        testType: 'data_security',
        testName: 'Sensitive Data Protection Test',
        status: findings.filter(f => f.severity === 'high' || f.severity === 'critical').length > 0 ? 'failed' : 'passed',
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Implement data masking for sensitive information',
          'Add data sanitization to logging systems',
          'Use data classification and handling policies',
          'Implement data loss prevention (DLP) measures'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'data_security',
        testName: 'Sensitive Data Protection Test',
        status: 'failed',
        severity: 'medium',
        findings: [{
          id: 'sensitive-data-test-error',
          title: 'Sensitive data protection test failed',
          description: `Sensitive data testing failed: ${error.message}`,
          severity: 'medium',
          category: 'tool_error',
          remediation: 'Fix sensitive data testing infrastructure'
        }],
        recommendations: ['Fix sensitive data testing issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 扫描敏感数据
   */
  private async scanForSensitiveData(dir: string, findings: SecurityFinding[]): Promise<void> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await this.scanForSensitiveData(filePath, findings);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          const lineNumber = index + 1;

          // 检查信用卡号模式
          if (/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/.test(line)) {
            findings.push({
              id: `credit-card-${filePath}-${lineNumber}`,
              title: 'Potential credit card number',
              description: 'Credit card number pattern detected',
              severity: 'high',
              category: 'sensitive_data',
              location: `${filePath}:${lineNumber}`,
              remediation: 'Remove or mask credit card numbers'
            });
          }

          // 检查社会安全号码模式
          if (/\b\d{3}-\d{2}-\d{4}\b/.test(line)) {
            findings.push({
              id: `ssn-${filePath}-${lineNumber}`,
              title: 'Potential social security number',
              description: 'Social security number pattern detected',
              severity: 'high',
              category: 'sensitive_data',
              location: `${filePath}:${lineNumber}`,
              remediation: 'Remove or mask social security numbers'
            });
          }

          // 检查邮箱地址（在某些上下文中可能是敏感的）
          if (/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(line) &&
              (line.includes('admin') || line.includes('root') || line.includes('test'))) {
            findings.push({
              id: `email-${filePath}-${lineNumber}`,
              title: 'Hardcoded email address',
              description: 'Hardcoded email address detected',
              severity: 'low',
              category: 'sensitive_data',
              location: `${filePath}:${lineNumber}`,
              remediation: 'Use configuration files for email addresses'
            });
          }
        });
      }
    }
  }

  /**
   * 测试数据传输安全
   */
  private async testDataTransmissionSecurity(): Promise<SecurityTestResult> {
    const startTime = Date.now();
    const findings: SecurityFinding[] = [];

    try {
      // 检查HTTPS配置
      const srcDir = path.join(process.cwd(), 'src');
      await this.scanForHTTPSUsage(srcDir, findings);

      return {
        testType: 'data_security',
        testName: 'Data Transmission Security Test',
        status: findings.filter(f => f.severity === 'high' || f.severity === 'critical').length > 0 ? 'failed' : 'passed',
        severity: findings.length > 0 ? 'medium' : 'low',
        findings,
        recommendations: [
          'Use HTTPS for all data transmission',
          'Implement certificate pinning',
          'Use strong TLS configurations',
          'Validate SSL certificates properly'
        ],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        testType: 'data_security',
        testName: 'Data Transmission Security Test',
        status: 'failed',
        severity: 'medium',
        findings: [{
          id: 'transmission-test-error',
          title: 'Data transmission security test failed',
          description: `Transmission security testing failed: ${error.message}`,
          severity: 'medium',
          category: 'tool_error',
          remediation: 'Fix transmission security testing infrastructure'
        }],
        recommendations: ['Fix transmission security testing issues'],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 扫描HTTPS使用情况
   */
  private async scanForHTTPSUsage(dir: string, findings: SecurityFinding[]): Promise<void> {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await this.scanForHTTPSUsage(filePath, findings);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          const lineNumber = index + 1;

          // 检查HTTP URL（非HTTPS）
          if (/['"]http:\/\/[^'"]*['"]/.test(line) && !line.includes('localhost') && !line.includes('127.0.0.1')) {
            findings.push({
              id: `http-url-${filePath}-${lineNumber}`,
              title: 'Insecure HTTP URL',
              description: 'HTTP URL detected instead of HTTPS',
              severity: 'medium',
              category: 'transmission_security',
              location: `${filePath}:${lineNumber}`,
              remediation: 'Use HTTPS URLs for secure communication'
            });
          }

          // 检查不安全的请求配置
          if (/rejectUnauthorized\s*:\s*false/.test(line)) {
            findings.push({
              id: `reject-unauthorized-false-${filePath}-${lineNumber}`,
              title: 'SSL certificate validation disabled',
              description: 'SSL certificate validation is disabled',
              severity: 'high',
              category: 'transmission_security',
              location: `${filePath}:${lineNumber}`,
              cwe: 'CWE-295',
              remediation: 'Enable SSL certificate validation'
            });
          }
        });
      }
    }
  }

  /**
   * 运行渗透测试（占位符，将在下一部分实现）
   */
  private async runPenetrationTests(): Promise<SecurityTestResult[]> {
    // 将在下一部分实现
    return [];
  }

  /**
   * 运行合规性检查（占位符，将在下一部分实现）
   */
  private async runComplianceChecks(): Promise<SecurityTestResult[]> {
    // 将在下一部分实现
    return [];
  }

  /**
   * 生成安全测试报告（占位符，将在下一部分实现）
   */
  private async generateSecurityReport(): Promise<void> {
    // 将在下一部分实现
  }
}
