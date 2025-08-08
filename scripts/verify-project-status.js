#!/usr/bin/env node

/**
 * MPLP项目状态验证脚本
 * 
 * 目的：确保文档声称与实际代码状态一致，防止文档与现实不符的问题
 * 
 * 验证项目：
 * 1. TypeScript编译错误数量
 * 2. ESLint错误和警告数量
 * 3. 测试通过率和覆盖率
 * 4. Any类型使用情况
 * 5. 各模块的实际状态
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProjectStatusVerifier {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      typescript: { errors: 0, files: 0 },
      eslint: { errors: 0, warnings: 0, files: 0 },
      tests: { total: 0, passed: 0, failed: 0, coverage: 0 },
      anyTypes: { count: 0, files: [] },
      modules: {}
    };
  }

  /**
   * 运行TypeScript编译检查
   */
  async checkTypeScript() {
    console.log('🔍 检查TypeScript编译状态...');
    
    try {
      const output = execSync('npm run typecheck', { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
      
      this.results.typescript.errors = 0;
      this.results.typescript.files = 0;
      console.log('✅ TypeScript编译成功，0个错误');
      
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      
      // 解析错误数量
      const errorMatch = output.match(/Found (\d+) errors? in (\d+) files?/);
      if (errorMatch) {
        this.results.typescript.errors = parseInt(errorMatch[1]);
        this.results.typescript.files = parseInt(errorMatch[2]);
      }
      
      console.log(`❌ TypeScript编译失败: ${this.results.typescript.errors}个错误 (${this.results.typescript.files}个文件)`);
    }
  }

  /**
   * 运行ESLint检查
   */
  async checkESLint() {
    console.log('🔍 检查ESLint状态...');
    
    try {
      const output = execSync('npm run lint', { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
      
      this.results.eslint.errors = 0;
      this.results.eslint.warnings = 0;
      console.log('✅ ESLint检查通过，0个错误和警告');
      
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      
      // 解析错误和警告数量
      const lines = output.split('\n');
      let errors = 0, warnings = 0;
      
      lines.forEach(line => {
        if (line.includes('error')) errors++;
        if (line.includes('warning')) warnings++;
      });
      
      this.results.eslint.errors = errors;
      this.results.eslint.warnings = warnings;
      
      console.log(`❌ ESLint检查失败: ${errors}个错误, ${warnings}个警告`);
    }
  }

  /**
   * 检查测试状态
   */
  async checkTests() {
    console.log('🔍 检查测试状态...');
    
    try {
      const output = execSync('npm test -- --passWithNoTests --coverage', { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      });
      
      // 解析测试结果
      const testMatch = output.match(/Tests:\s+(\d+) passed/);
      const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)/);
      
      if (testMatch) {
        this.results.tests.passed = parseInt(testMatch[1]);
        this.results.tests.total = this.results.tests.passed;
      }
      
      if (coverageMatch) {
        this.results.tests.coverage = parseFloat(coverageMatch[1]);
      }
      
      console.log(`✅ 测试通过: ${this.results.tests.passed}/${this.results.tests.total}, 覆盖率: ${this.results.tests.coverage}%`);
      
    } catch (error) {
      const output = error.stdout || error.stderr || '';
      console.log('❌ 测试运行失败');
      console.log(output.substring(0, 500) + '...');
    }
  }

  /**
   * 检查Any类型使用情况
   */
  async checkAnyTypes() {
    console.log('🔍 检查Any类型使用情况...');
    
    const srcDir = path.join(process.cwd(), 'src');
    const anyTypeFiles = [];
    let totalAnyCount = 0;
    
    const checkFile = (filePath) => {
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const anyMatches = content.match(/:\s*any\b/g) || [];
        
        if (anyMatches.length > 0) {
          anyTypeFiles.push({
            file: path.relative(process.cwd(), filePath),
            count: anyMatches.length
          });
          totalAnyCount += anyMatches.length;
        }
      } catch (error) {
        // 忽略读取错误
      }
    };
    
    const walkDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else {
            checkFile(fullPath);
          }
        });
      } catch (error) {
        // 忽略目录读取错误
      }
    };
    
    walkDir(srcDir);
    
    this.results.anyTypes.count = totalAnyCount;
    this.results.anyTypes.files = anyTypeFiles;
    
    if (totalAnyCount === 0) {
      console.log('✅ 未发现any类型使用');
    } else {
      console.log(`❌ 发现${totalAnyCount}个any类型使用 (${anyTypeFiles.length}个文件)`);
    }
  }

  /**
   * 检查各模块状态
   */
  async checkModules() {
    console.log('🔍 检查各模块状态...');
    
    const modulesDir = path.join(process.cwd(), 'src', 'modules');
    
    try {
      const modules = fs.readdirSync(modulesDir);
      
      for (const module of modules) {
        const modulePath = path.join(modulesDir, module);
        const stat = fs.statSync(modulePath);
        
        if (stat.isDirectory()) {
          this.results.modules[module] = {
            exists: true,
            hasApi: fs.existsSync(path.join(modulePath, 'api')),
            hasApplication: fs.existsSync(path.join(modulePath, 'application')),
            hasDomain: fs.existsSync(path.join(modulePath, 'domain')),
            hasInfrastructure: fs.existsSync(path.join(modulePath, 'infrastructure')),
            hasTests: fs.existsSync(path.join(modulePath, '__tests__')) || 
                     fs.existsSync(path.join(process.cwd(), 'src', 'tests', 'unit', `${module}.test.ts`))
          };
        }
      }
      
      console.log(`✅ 检查了${Object.keys(this.results.modules).length}个模块`);
      
    } catch (error) {
      console.log('❌ 模块检查失败:', error.message);
    }
  }

  /**
   * 生成验证报告
   */
  generateReport() {
    console.log('\n📊 项目状态验证报告');
    console.log('='.repeat(50));
    
    console.log(`\n🕐 验证时间: ${this.results.timestamp}`);
    
    console.log(`\n📝 TypeScript状态:`);
    console.log(`   错误数量: ${this.results.typescript.errors}`);
    console.log(`   影响文件: ${this.results.typescript.files}`);
    
    console.log(`\n🔧 ESLint状态:`);
    console.log(`   错误数量: ${this.results.eslint.errors}`);
    console.log(`   警告数量: ${this.results.eslint.warnings}`);
    
    console.log(`\n🧪 测试状态:`);
    console.log(`   通过测试: ${this.results.tests.passed}/${this.results.tests.total}`);
    console.log(`   测试覆盖率: ${this.results.tests.coverage}%`);
    
    console.log(`\n🚫 Any类型使用:`);
    console.log(`   总数量: ${this.results.anyTypes.count}`);
    console.log(`   影响文件: ${this.results.anyTypes.files.length}`);
    
    console.log(`\n📦 模块状态:`);
    Object.entries(this.results.modules).forEach(([name, status]) => {
      const dddComplete = status.hasApi && status.hasApplication && status.hasDomain && status.hasInfrastructure;
      console.log(`   ${name}: ${dddComplete ? '✅' : '⚠️'} DDD架构${dddComplete ? '完整' : '不完整'}, ${status.hasTests ? '✅' : '❌'} ${status.hasTests ? '有测试' : '无测试'}`);
    });
    
    // 保存报告到文件
    const reportPath = path.join(process.cwd(), 'docs', 'project-status-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 详细报告已保存到: ${reportPath}`);
  }

  /**
   * 运行完整验证
   */
  async run() {
    console.log('🚀 开始MPLP项目状态验证...\n');
    
    await this.checkTypeScript();
    await this.checkESLint();
    await this.checkTests();
    await this.checkAnyTypes();
    await this.checkModules();
    
    this.generateReport();
    
    // 返回验证结果
    const hasIssues = 
      this.results.typescript.errors > 0 ||
      this.results.eslint.errors > 0 ||
      this.results.anyTypes.count > 0;
    
    if (hasIssues) {
      console.log('\n❌ 发现问题，请查看上述报告');
      process.exit(1);
    } else {
      console.log('\n✅ 项目状态验证通过！');
      process.exit(0);
    }
  }
}

// 运行验证
if (require.main === module) {
  const verifier = new ProjectStatusVerifier();
  verifier.run().catch(error => {
    console.error('验证过程出错:', error);
    process.exit(1);
  });
}

module.exports = ProjectStatusVerifier;
