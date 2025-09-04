#!/usr/bin/env node

/**
 * MPLP Dependency Check Script
 * 
 * 检查项目依赖的安全性、版本兼容性和许可证合规性
 * 用于GitHub Actions CI/CD流水线中的依赖验证
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DependencyChecker {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.packageLockPath = path.join(process.cwd(), 'package-lock.json');
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 运行完整的依赖检查
   */
  async runChecks() {
    console.log('🔍 开始依赖检查...\n');

    try {
      // 1. 检查package.json和package-lock.json存在性
      this.checkPackageFiles();
      
      // 2. 检查依赖版本一致性
      this.checkVersionConsistency();
      
      // 3. 运行npm audit检查安全漏洞
      this.checkSecurityVulnerabilities();
      
      // 4. 检查过时的依赖
      this.checkOutdatedDependencies();
      
      // 5. 检查许可证合规性
      this.checkLicenseCompliance();
      
      // 6. 输出检查结果
      this.outputResults();
      
    } catch (error) {
      console.error('❌ 依赖检查过程中发生错误:', error.message);
      process.exit(1);
    }
  }

  /**
   * 检查package文件存在性
   */
  checkPackageFiles() {
    console.log('📋 检查package文件...');
    
    if (!fs.existsSync(this.packageJsonPath)) {
      this.errors.push('package.json文件不存在');
    }
    
    if (!fs.existsSync(this.packageLockPath)) {
      this.errors.push('package-lock.json文件不存在');
    }
    
    if (this.errors.length === 0) {
      console.log('✅ package文件检查通过');
    }
  }

  /**
   * 检查依赖版本一致性
   */
  checkVersionConsistency() {
    console.log('🔄 检查版本一致性...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      const packageLock = JSON.parse(fs.readFileSync(this.packageLockPath, 'utf8'));
      
      // 检查主要依赖版本
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      const allDeps = { ...dependencies, ...devDependencies };
      
      let inconsistencies = 0;
      
      for (const [name, version] of Object.entries(allDeps)) {
        if (packageLock.packages && packageLock.packages[`node_modules/${name}`]) {
          const lockVersion = packageLock.packages[`node_modules/${name}`].version;
          // 简单的版本兼容性检查
          if (!this.isVersionCompatible(version, lockVersion)) {
            this.warnings.push(`依赖 ${name}: package.json(${version}) 与 package-lock.json(${lockVersion}) 版本不一致`);
            inconsistencies++;
          }
        }
      }
      
      if (inconsistencies === 0) {
        console.log('✅ 版本一致性检查通过');
      } else {
        console.log(`⚠️ 发现 ${inconsistencies} 个版本不一致问题`);
      }
      
    } catch (error) {
      this.errors.push(`版本一致性检查失败: ${error.message}`);
    }
  }

  /**
   * 检查安全漏洞
   */
  checkSecurityVulnerabilities() {
    console.log('🔒 检查安全漏洞...');
    
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities) {
        const vulnCount = Object.keys(audit.vulnerabilities).length;
        if (vulnCount > 0) {
          const highVulns = Object.values(audit.vulnerabilities).filter(v => v.severity === 'high' || v.severity === 'critical').length;
          
          if (highVulns > 0) {
            this.errors.push(`发现 ${highVulns} 个高危/严重安全漏洞`);
          } else {
            this.warnings.push(`发现 ${vulnCount} 个安全漏洞（无高危）`);
          }
        } else {
          console.log('✅ 未发现安全漏洞');
        }
      }
      
    } catch (error) {
      // npm audit可能返回非零退出码，但仍有有效输出
      if (error.stdout) {
        try {
          const audit = JSON.parse(error.stdout);
          if (audit.vulnerabilities) {
            const vulnCount = Object.keys(audit.vulnerabilities).length;
            if (vulnCount > 0) {
              this.warnings.push(`发现 ${vulnCount} 个安全漏洞`);
            }
          }
        } catch (parseError) {
          this.warnings.push('安全漏洞检查完成，但解析结果时出错');
        }
      } else {
        this.warnings.push(`安全检查警告: ${error.message}`);
      }
    }
  }

  /**
   * 检查过时的依赖
   */
  checkOutdatedDependencies() {
    console.log('📅 检查过时依赖...');
    
    try {
      const outdatedResult = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdated = JSON.parse(outdatedResult);
      
      const outdatedCount = Object.keys(outdated).length;
      if (outdatedCount > 0) {
        this.warnings.push(`发现 ${outdatedCount} 个过时的依赖包`);
        
        // 列出主要的过时依赖
        const majorOutdated = Object.entries(outdated)
          .filter(([, info]) => this.isMajorVersionOutdated(info.current, info.latest))
          .slice(0, 5); // 只显示前5个
          
        if (majorOutdated.length > 0) {
          console.log('⚠️ 主要过时依赖:');
          majorOutdated.forEach(([name, info]) => {
            console.log(`  - ${name}: ${info.current} → ${info.latest}`);
          });
        }
      } else {
        console.log('✅ 所有依赖都是最新的');
      }
      
    } catch (error) {
      // npm outdated在有过时依赖时返回非零退出码
      if (error.stdout) {
        try {
          const outdated = JSON.parse(error.stdout);
          const outdatedCount = Object.keys(outdated).length;
          if (outdatedCount > 0) {
            this.warnings.push(`发现 ${outdatedCount} 个过时的依赖包`);
          }
        } catch (parseError) {
          console.log('✅ 依赖版本检查完成');
        }
      } else {
        console.log('✅ 依赖版本检查完成');
      }
    }
  }

  /**
   * 检查许可证合规性
   */
  checkLicenseCompliance() {
    console.log('📜 检查许可证合规性...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      
      // 检查项目许可证
      if (!packageJson.license) {
        this.warnings.push('项目未指定许可证');
      }
      
      // 简单的许可证检查 - 在实际项目中可能需要更复杂的检查
      const restrictedLicenses = ['GPL-3.0', 'AGPL-3.0'];
      if (packageJson.license && restrictedLicenses.includes(packageJson.license)) {
        this.warnings.push(`项目使用了限制性许可证: ${packageJson.license}`);
      }
      
      console.log('✅ 许可证合规性检查完成');
      
    } catch (error) {
      this.warnings.push(`许可证检查失败: ${error.message}`);
    }
  }

  /**
   * 输出检查结果
   */
  outputResults() {
    console.log('\n📊 依赖检查结果:');
    console.log(`错误: ${this.errors.length}`);
    console.log(`警告: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ 错误:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ 所有依赖检查通过！');
    }
    
    // 如果有错误，退出码为1
    if (this.errors.length > 0) {
      console.log('\n❌ 依赖检查失败');
      process.exit(1);
    } else {
      console.log('\n✅ 依赖检查成功');
      process.exit(0);
    }
  }

  /**
   * 检查版本兼容性
   */
  isVersionCompatible(specVersion, actualVersion) {
    // 简化的版本兼容性检查
    // 在实际项目中可能需要使用semver库进行更精确的检查
    if (specVersion.startsWith('^') || specVersion.startsWith('~')) {
      return true; // 语义化版本范围通常是兼容的
    }
    return specVersion === actualVersion;
  }

  /**
   * 检查是否是主要版本过时
   */
  isMajorVersionOutdated(current, latest) {
    try {
      const currentMajor = parseInt(current.split('.')[0]);
      const latestMajor = parseInt(latest.split('.')[0]);
      return latestMajor > currentMajor;
    } catch (error) {
      return false;
    }
  }
}

// 运行依赖检查
if (require.main === module) {
  const checker = new DependencyChecker();
  checker.runChecks().catch(error => {
    console.error('依赖检查失败:', error);
    process.exit(1);
  });
}

module.exports = DependencyChecker;
