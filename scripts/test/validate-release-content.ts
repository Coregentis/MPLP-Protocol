/**
 * Release版本内容验证脚本
 * 确保发布版本符合开源标准，不包含敏感信息
 * 
 * @version 1.0.0
 * @created 2025-01-29T07:30:00+08:00
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationRule {
  name: string;
  type: 'file_exists' | 'file_not_exists' | 'content_check' | 'package_check' | 'security_check';
  target: string | string[];
  pattern?: RegExp;
  severity: 'error' | 'warning' | 'info';
  description: string;
}

interface ValidationResult {
  rule: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string[];
}

interface ValidationReport {
  totalRules: number;
  passed: number;
  failed: number;
  warnings: number;
  results: ValidationResult[];
  summary: string;
}

class ReleaseContentValidator {
  private releaseDir: string;
  private rules: ValidationRule[];

  constructor(releaseDir: string) {
    this.releaseDir = releaseDir;
    this.rules = this.initializeRules();
  }

  private initializeRules(): ValidationRule[] {
    return [
      // 必需文件检查
      {
        name: 'required_files',
        type: 'file_exists',
        target: [
          'package.json',
          'README.md',
          'LICENSE',
          'SECURITY.md',
          'src/index.ts',
          'src/modules/core/orchestrator/core-orchestrator.ts',
          'src/modules/core/orchestrator/performance-enhanced-orchestrator.ts',
          'src/core/performance/real-performance-optimizer.ts'
        ],
        severity: 'error',
        description: '检查必需文件是否存在'
      },

      // 禁止文件检查
      {
        name: 'forbidden_files',
        type: 'file_not_exists',
        target: [
          '.env',
          '.env.local',
          '.env.development',
          '.env.production',
          'docker-compose.yml',
          'docker-compose.override.yml',
          'secrets.json',
          'credentials.json',
          'private.key',
          'server.key',
          'cert.pem'
        ],
        severity: 'error',
        description: '检查是否包含禁止的敏感文件'
      },

      // 禁止目录检查
      {
        name: 'forbidden_directories',
        type: 'file_not_exists',
        target: [
          'src/internal',
          'src/experimental',
          'src/private',
          'tests/internal',
          'tests/experimental',
          'tests/load',
          'tests/security',
          'docs/internal',
          'docs/architecture',
          'docs/deployment',
          'configs',
          'scripts/deployment',
          'scripts/monitoring',
          'scripts/internal'
        ],
        severity: 'error',
        description: '检查是否包含禁止的内部目录'
      },

      // 虚假性能测试检查
      {
        name: 'fake_performance_tests',
        type: 'file_not_exists',
        target: [
          'tests/performance/ultra-fast-performance.test.ts',
          'tests/performance/optimized-performance.test.ts',
          'tests/performance/simple-optimized-performance.test.ts'
        ],
        severity: 'error',
        description: '检查是否包含虚假性能测试文件'
      },

      // 敏感信息检查
      {
        name: 'sensitive_content',
        type: 'security_check',
        target: ['**/*.ts', '**/*.js', '**/*.json', '**/*.md'],
        severity: 'error',
        description: '检查源代码中是否包含敏感信息'
      },

      // package.json验证
      {
        name: 'package_json_validation',
        type: 'package_check',
        target: 'package.json',
        severity: 'error',
        description: '验证package.json配置'
      },

      // 内部标记检查
      {
        name: 'internal_markers',
        type: 'content_check',
        target: ['**/*.ts', '**/*.js'],
        pattern: /@internal|@experimental|@private|@dev-only|INTERNAL|EXPERIMENTAL|PRIVATE|DEV-ONLY/,
        severity: 'warning',
        description: '检查代码中是否包含内部标记'
      },

      // 内部依赖检查
      {
        name: 'internal_dependencies',
        type: 'content_check',
        target: ['**/*.ts', '**/*.js'],
        pattern: /@company\/|@internal\/|\.internal\b/,
        severity: 'error',
        description: '检查是否引用内部依赖'
      },

      // 测试文件完整性检查
      {
        name: 'test_completeness',
        type: 'file_exists',
        target: [
          'tests/unit',
          'tests/integration',
          'tests/e2e',
          'tests/performance/real-business-performance.test.ts',
          'tests/test-utils'
        ],
        severity: 'warning',
        description: '检查测试文件完整性'
      },

      // 文档完整性检查
      {
        name: 'documentation_completeness',
        type: 'file_exists',
        target: [
          'docs/api-reference.md',
          'docs/performance-guide.md',
          'docs/getting-started.md',
          'examples'
        ],
        severity: 'warning',
        description: '检查文档完整性'
      }
    ];
  }

  async validate(): Promise<ValidationReport> {
    console.log('🔍 开始验证Release版本内容...');
    console.log(`验证目录: ${this.releaseDir}`);

    const report: ValidationReport = {
      totalRules: this.rules.length,
      passed: 0,
      failed: 0,
      warnings: 0,
      results: [],
      summary: ''
    };

    for (const rule of this.rules) {
      try {
        const result = await this.validateRule(rule);
        report.results.push(result);

        switch (result.status) {
          case 'pass':
            report.passed++;
            break;
          case 'fail':
            report.failed++;
            break;
          case 'warning':
            report.warnings++;
            break;
        }

        // 输出验证结果
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${rule.name}: ${result.message}`);
        
        if (result.details && result.details.length > 0) {
          result.details.forEach(detail => console.log(`   - ${detail}`));
        }

      } catch (error) {
        const result: ValidationResult = {
          rule: rule.name,
          status: 'fail',
          message: `验证规则执行失败: ${error instanceof Error ? error.message : String(error)}`
        };
        report.results.push(result);
        report.failed++;
        console.log(`❌ ${rule.name}: ${result.message}`);
      }
    }

    // 生成总结
    report.summary = this.generateSummary(report);
    console.log('\n' + report.summary);

    return report;
  }

  private async validateRule(rule: ValidationRule): Promise<ValidationResult> {
    switch (rule.type) {
      case 'file_exists':
        return this.validateFileExists(rule);
      case 'file_not_exists':
        return this.validateFileNotExists(rule);
      case 'content_check':
        return this.validateContent(rule);
      case 'package_check':
        return this.validatePackageJson(rule);
      case 'security_check':
        return this.validateSecurity(rule);
      default:
        throw new Error(`未知的验证规则类型: ${rule.type}`);
    }
  }

  private validateFileExists(rule: ValidationRule): ValidationResult {
    const targets = Array.isArray(rule.target) ? rule.target : [rule.target];
    const missingFiles: string[] = [];

    for (const target of targets) {
      const fullPath = path.join(this.releaseDir, target);
      if (!fs.existsSync(fullPath)) {
        missingFiles.push(target);
      }
    }

    if (missingFiles.length === 0) {
      return {
        rule: rule.name,
        status: 'pass',
        message: '所有必需文件都存在'
      };
    } else {
      return {
        rule: rule.name,
        status: rule.severity === 'error' ? 'fail' : 'warning',
        message: `缺少 ${missingFiles.length} 个文件`,
        details: missingFiles
      };
    }
  }

  private validateFileNotExists(rule: ValidationRule): ValidationResult {
    const targets = Array.isArray(rule.target) ? rule.target : [rule.target];
    const foundFiles: string[] = [];

    for (const target of targets) {
      const fullPath = path.join(this.releaseDir, target);
      if (fs.existsSync(fullPath)) {
        foundFiles.push(target);
      }
    }

    if (foundFiles.length === 0) {
      return {
        rule: rule.name,
        status: 'pass',
        message: '未发现禁止的文件'
      };
    } else {
      return {
        rule: rule.name,
        status: rule.severity === 'error' ? 'fail' : 'warning',
        message: `发现 ${foundFiles.length} 个禁止的文件`,
        details: foundFiles
      };
    }
  }

  private validateContent(rule: ValidationRule): ValidationResult {
    if (!rule.pattern) {
      throw new Error('内容检查规则必须包含pattern');
    }

    const targets = Array.isArray(rule.target) ? rule.target : [rule.target];
    const matchedFiles: string[] = [];

    for (const target of targets) {
      const files = this.findFiles(target);
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (rule.pattern.test(content)) {
            matchedFiles.push(path.relative(this.releaseDir, file));
          }
        } catch (error) {
          // 忽略读取错误（可能是二进制文件）
        }
      }
    }

    if (matchedFiles.length === 0) {
      return {
        rule: rule.name,
        status: 'pass',
        message: '未发现匹配的内容'
      };
    } else {
      return {
        rule: rule.name,
        status: rule.severity === 'error' ? 'fail' : 'warning',
        message: `在 ${matchedFiles.length} 个文件中发现匹配内容`,
        details: matchedFiles
      };
    }
  }

  private validatePackageJson(rule: ValidationRule): ValidationResult {
    const packageJsonPath = path.join(this.releaseDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return {
        rule: rule.name,
        status: 'fail',
        message: 'package.json文件不存在'
      };
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const issues: string[] = [];

      // 检查必需字段
      const requiredFields = ['name', 'version', 'description', 'main', 'license', 'repository'];
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          issues.push(`缺少必需字段: ${field}`);
        }
      }

      // 检查许可证
      if (packageJson.license && packageJson.license !== 'MIT') {
        issues.push(`许可证应为MIT，当前为: ${packageJson.license}`);
      }

      // 检查内部依赖
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies
      };

      for (const [name, version] of Object.entries(allDeps)) {
        if (typeof name === 'string' && (name.includes('@company') || name.includes('@internal'))) {
          issues.push(`包含内部依赖: ${name}`);
        }
      }

      // 检查脚本
      if (packageJson.scripts) {
        const suspiciousScripts = Object.keys(packageJson.scripts).filter(script => 
          script.includes('internal') || script.includes('deploy') || script.includes('prod')
        );
        
        if (suspiciousScripts.length > 0) {
          issues.push(`包含可疑脚本: ${suspiciousScripts.join(', ')}`);
        }
      }

      if (issues.length === 0) {
        return {
          rule: rule.name,
          status: 'pass',
          message: 'package.json验证通过'
        };
      } else {
        return {
          rule: rule.name,
          status: 'fail',
          message: `package.json存在 ${issues.length} 个问题`,
          details: issues
        };
      }

    } catch (error) {
      return {
        rule: rule.name,
        status: 'fail',
        message: `package.json格式错误: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private validateSecurity(rule: ValidationRule): ValidationResult {
    const sensitivePatterns = [
      { pattern: /sk-[a-zA-Z0-9]{48}/, name: 'OpenAI API Key' },
      { pattern: /pk_[a-zA-Z0-9]{24}/, name: 'Stripe Key' },
      { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
      { pattern: /mongodb:\/\/[^\s]+/, name: 'MongoDB连接字符串' },
      { pattern: /postgres:\/\/[^\s]+/, name: 'PostgreSQL连接字符串' },
      { pattern: /mysql:\/\/[^\s]+/, name: 'MySQL连接字符串' },
      { pattern: /redis:\/\/[^\s]+/, name: 'Redis连接字符串' },
      { pattern: /password\s*[:=]\s*['"]/i, name: '密码字段' },
      { pattern: /secret\s*[:=]\s*['"]/i, name: '密钥字段' },
      { pattern: /token\s*[:=]\s*['"]/i, name: 'Token字段' },
      { pattern: /\.internal\b/, name: '内部域名' },
      { pattern: /@company\//, name: '公司内部包' }
    ];

    const targets = Array.isArray(rule.target) ? rule.target : [rule.target];
    const securityIssues: string[] = [];

    for (const target of targets) {
      const files = this.findFiles(target);
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const relativePath = path.relative(this.releaseDir, file);
          
          for (const { pattern, name } of sensitivePatterns) {
            if (pattern.test(content)) {
              securityIssues.push(`${relativePath}: ${name}`);
            }
          }
        } catch (error) {
          // 忽略读取错误
        }
      }
    }

    if (securityIssues.length === 0) {
      return {
        rule: rule.name,
        status: 'pass',
        message: '未发现敏感信息'
      };
    } else {
      return {
        rule: rule.name,
        status: 'fail',
        message: `发现 ${securityIssues.length} 个安全问题`,
        details: securityIssues
      };
    }
  }

  private findFiles(pattern: string): string[] {
    const files: string[] = [];
    
    const searchDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          searchDir(fullPath);
        } else if (entry.isFile()) {
          const relativePath = path.relative(this.releaseDir, fullPath);
          if (this.matchPattern(relativePath, pattern)) {
            files.push(fullPath);
          }
        }
      }
    };

    searchDir(this.releaseDir);
    return files;
  }

  private matchPattern(filePath: string, pattern: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const normalizedPattern = pattern.replace(/\\/g, '/');
    
    const regexPattern = normalizedPattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(normalizedPath);
  }

  private generateSummary(report: ValidationReport): string {
    const passRate = ((report.passed / report.totalRules) * 100).toFixed(1);
    
    let summary = `📊 验证报告总结:\n`;
    summary += `总规则数: ${report.totalRules}\n`;
    summary += `通过: ${report.passed} (${passRate}%)\n`;
    summary += `失败: ${report.failed}\n`;
    summary += `警告: ${report.warnings}\n`;

    if (report.failed === 0) {
      summary += `\n✅ 验证通过！Release版本符合开源发布标准。`;
    } else {
      summary += `\n❌ 验证失败！请修复 ${report.failed} 个错误后重新验证。`;
    }

    if (report.warnings > 0) {
      summary += `\n⚠️ 存在 ${report.warnings} 个警告，建议检查。`;
    }

    return summary;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const releaseDir = args[0] || path.join(process.cwd(), 'release');

  if (!fs.existsSync(releaseDir)) {
    console.error(`❌ Release目录不存在: ${releaseDir}`);
    process.exit(1);
  }

  try {
    const validator = new ReleaseContentValidator(releaseDir);
    const report = await validator.validate();

    // 生成详细报告文件
    const reportPath = path.join(releaseDir, 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);

    // 根据验证结果设置退出码
    if (report.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ReleaseContentValidator, ValidationRule, ValidationResult, ValidationReport };
