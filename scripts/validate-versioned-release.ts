/**
 * 版本化发布验证脚本
 * 验证发布版本的完整性和质量
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../src/public/utils/logger';

interface ValidationConfig {
  version: string;
  releasesDir: string;
  skipBuild?: boolean;
  skipTests?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class VersionedReleaseValidator {
  private logger: Logger;
  private config: ValidationConfig;
  private versionDir: string;

  constructor(config: ValidationConfig) {
    this.logger = new Logger('VersionedReleaseValidator');
    this.config = config;
    this.versionDir = path.join(config.releasesDir, `v${config.version}`);
  }

  /**
   * 验证版本化发布的主流程
   */
  async validateVersionedRelease(): Promise<ValidationResult> {
    this.logger.info(`🔍 开始验证版本 v${this.config.version} 的发布...`);

    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // 1. 验证目录结构
      await this.validateDirectoryStructure(result);
      
      // 2. 验证必需文件
      await this.validateRequiredFiles(result);
      
      // 3. 验证package.json
      await this.validatePackageJson(result);
      
      // 4. 验证TypeScript配置
      await this.validateTypeScriptConfig(result);
      
      // 5. 验证源代码完整性
      await this.validateSourceCode(result);
      
      // 6. 验证文档完整性
      await this.validateDocumentation(result);
      
      // 7. 验证示例代码
      await this.validateExamples(result);
      
      // 8. 构建测试
      if (!this.config.skipBuild) {
        await this.validateBuild(result);
      }
      
      // 9. 运行测试
      if (!this.config.skipTests) {
        await this.validateTests(result);
      }
      
      // 10. 验证发布准备
      await this.validateReleaseReadiness(result);
      
      if (result.errors.length > 0) {
        result.valid = false;
      }
      
      this.logResults(result);
      return result;
      
    } catch (error) {
      result.errors.push(`验证过程中发生错误: ${error}`);
      result.valid = false;
      return result;
    }
  }

  /**
   * 1. 验证目录结构
   */
  private async validateDirectoryStructure(result: ValidationResult): Promise<void> {
    this.logger.info('📁 验证目录结构...');
    
    if (!await fs.pathExists(this.versionDir)) {
      result.errors.push(`版本目录不存在: ${this.versionDir}`);
      return;
    }
    
    const requiredDirs = [
      'src/core',
      'src/modules/context',
      'src/modules/plan',
      'src/modules/confirm',
      'src/modules/trace',
      'src/modules/role',
      'src/modules/extension',
      'src/schemas',
      'src/shared/types',
      'src/utils',
      'docs',
      'examples'
    ];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.versionDir, dir);
      if (!await fs.pathExists(dirPath)) {
        result.errors.push(`必需目录缺失: ${dir}`);
      }
    }
  }

  /**
   * 2. 验证必需文件
   */
  private async validateRequiredFiles(result: ValidationResult): Promise<void> {
    this.logger.info('📄 验证必需文件...');
    
    const requiredFiles = [
      'package.json',
      'README.md',
      'CHANGELOG.md',
      'LICENSE',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'src/index.ts',
      'tsconfig.json',
      'jest.config.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.versionDir, file);
      if (!await fs.pathExists(filePath)) {
        result.errors.push(`必需文件缺失: ${file}`);
      }
    }
  }

  /**
   * 3. 验证package.json
   */
  private async validatePackageJson(result: ValidationResult): Promise<void> {
    this.logger.info('📦 验证package.json...');
    
    try {
      const packageJsonPath = path.join(this.versionDir, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      // 验证基本字段
      const requiredFields = ['name', 'version', 'description', 'main', 'types'];
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          result.errors.push(`package.json缺少必需字段: ${field}`);
        }
      }
      
      // 验证版本号
      if (packageJson.version !== this.config.version) {
        result.errors.push(`版本号不匹配: 期望 ${this.config.version}, 实际 ${packageJson.version}`);
      }
      
      // 验证包名
      if (packageJson.name !== 'mplp-protocol') {
        result.errors.push(`包名不正确: 期望 mplp-protocol, 实际 ${packageJson.name}`);
      }
      
      // 验证依赖
      if (!packageJson.dependencies || !packageJson.dependencies.ajv) {
        result.warnings.push('缺少ajv依赖');
      }
      
      if (!packageJson.devDependencies || !packageJson.devDependencies.typescript) {
        result.warnings.push('缺少typescript开发依赖');
      }
      
      // 验证脚本
      const requiredScripts = ['build', 'test'];
      for (const script of requiredScripts) {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
          result.warnings.push(`缺少npm脚本: ${script}`);
        }
      }
      
    } catch (error) {
      result.errors.push(`package.json解析失败: ${error}`);
    }
  }

  /**
   * 4. 验证TypeScript配置
   */
  private async validateTypeScriptConfig(result: ValidationResult): Promise<void> {
    this.logger.info('🔧 验证TypeScript配置...');
    
    try {
      const tsConfigPath = path.join(this.versionDir, 'tsconfig.json');
      const tsConfig = await fs.readJson(tsConfigPath);
      
      if (!tsConfig.compilerOptions) {
        result.errors.push('tsconfig.json缺少compilerOptions');
        return;
      }
      
      const options = tsConfig.compilerOptions;
      
      // 验证关键配置
      if (options.target !== 'ES2020') {
        result.warnings.push(`TypeScript target建议使用ES2020, 当前: ${options.target}`);
      }
      
      if (!options.strict) {
        result.warnings.push('建议启用TypeScript strict模式');
      }
      
      if (!options.declaration) {
        result.errors.push('必须启用declaration生成类型定义');
      }
      
    } catch (error) {
      result.errors.push(`tsconfig.json解析失败: ${error}`);
    }
  }

  /**
   * 5. 验证源代码完整性
   */
  private async validateSourceCode(result: ValidationResult): Promise<void> {
    this.logger.info('💻 验证源代码完整性...');
    
    // 验证主入口文件
    const indexPath = path.join(this.versionDir, 'src/index.ts');
    if (await fs.pathExists(indexPath)) {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      
      // 检查关键导出
      const requiredExports = [
        'MPLPOrchestrator',
        'WorkflowManager',
        'Context',
        'Plan',
        'VERSION'
      ];
      
      for (const exportName of requiredExports) {
        if (!indexContent.includes(exportName)) {
          result.warnings.push(`主入口文件缺少导出: ${exportName}`);
        }
      }
    }
    
    // 验证模块完整性
    const modules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    for (const module of modules) {
      const modulePath = path.join(this.versionDir, `src/modules/${module}`);
      if (await fs.pathExists(modulePath)) {
        const apiPath = path.join(modulePath, 'api');
        const domainPath = path.join(modulePath, 'domain');
        const typesPath = path.join(modulePath, 'types.ts');
        
        if (!await fs.pathExists(apiPath)) {
          result.warnings.push(`模块 ${module} 缺少api层`);
        }
        
        if (!await fs.pathExists(domainPath)) {
          result.warnings.push(`模块 ${module} 缺少domain层`);
        }
        
        if (!await fs.pathExists(typesPath)) {
          result.warnings.push(`模块 ${module} 缺少types.ts`);
        }
      }
    }
  }

  /**
   * 6. 验证文档完整性
   */
  private async validateDocumentation(result: ValidationResult): Promise<void> {
    this.logger.info('📚 验证文档完整性...');
    
    // 验证README.md
    const readmePath = path.join(this.versionDir, 'README.md');
    if (await fs.pathExists(readmePath)) {
      const readmeContent = await fs.readFile(readmePath, 'utf-8');
      
      const requiredSections = [
        '## 🎯 Overview',
        '## 🚀 Features',
        '## 📦 Installation',
        '## 🔧 Quick Start'
      ];
      
      for (const section of requiredSections) {
        if (!readmeContent.includes(section)) {
          result.warnings.push(`README.md缺少章节: ${section}`);
        }
      }
      
      // 检查版本号
      if (!readmeContent.includes(`v${this.config.version}`)) {
        result.warnings.push('README.md中版本号可能不正确');
      }
    }
    
    // 验证CHANGELOG.md
    const changelogPath = path.join(this.versionDir, 'CHANGELOG.md');
    if (await fs.pathExists(changelogPath)) {
      const changelogContent = await fs.readFile(changelogPath, 'utf-8');
      
      if (!changelogContent.includes(`[${this.config.version}]`)) {
        result.warnings.push('CHANGELOG.md中缺少当前版本的条目');
      }
    }
  }

  /**
   * 7. 验证示例代码
   */
  private async validateExamples(result: ValidationResult): Promise<void> {
    this.logger.info('📝 验证示例代码...');
    
    const examplesDir = path.join(this.versionDir, 'examples');
    if (!await fs.pathExists(examplesDir)) {
      result.warnings.push('缺少examples目录');
      return;
    }
    
    const requiredExamples = [
      'quick-start.ts',
      'basic-usage.ts',
      'advanced-usage.ts',
      'README.md'
    ];
    
    for (const example of requiredExamples) {
      const examplePath = path.join(examplesDir, example);
      if (!await fs.pathExists(examplePath)) {
        result.warnings.push(`缺少示例文件: ${example}`);
      }
    }
  }

  /**
   * 8. 验证构建
   */
  private async validateBuild(result: ValidationResult): Promise<void> {
    this.logger.info('🔨 验证构建...');
    
    try {
      // 切换到版本目录并安装依赖
      process.chdir(this.versionDir);
      
      this.logger.info('📦 安装依赖...');
      execSync('npm install', { stdio: 'inherit' });
      
      this.logger.info('🔨 执行构建...');
      execSync('npm run build', { stdio: 'inherit' });
      
      // 验证构建产物
      const distDir = path.join(this.versionDir, 'dist');
      if (!await fs.pathExists(distDir)) {
        result.errors.push('构建后缺少dist目录');
      } else {
        const indexJs = path.join(distDir, 'index.js');
        const indexDts = path.join(distDir, 'index.d.ts');
        
        if (!await fs.pathExists(indexJs)) {
          result.errors.push('构建后缺少index.js');
        }
        
        if (!await fs.pathExists(indexDts)) {
          result.errors.push('构建后缺少index.d.ts');
        }
      }
      
    } catch (error) {
      result.errors.push(`构建失败: ${error}`);
    }
  }

  /**
   * 9. 验证测试
   */
  private async validateTests(result: ValidationResult): Promise<void> {
    this.logger.info('🧪 验证测试...');
    
    try {
      // 运行测试
      execSync('npm test', { stdio: 'inherit' });
      
    } catch (error) {
      result.warnings.push(`测试执行失败: ${error}`);
    }
  }

  /**
   * 10. 验证发布准备
   */
  private async validateReleaseReadiness(result: ValidationResult): Promise<void> {
    this.logger.info('🚀 验证发布准备...');
    
    // 检查是否可以打包
    try {
      execSync('npm pack --dry-run', { stdio: 'inherit' });
      
    } catch (error) {
      result.errors.push(`npm pack失败: ${error}`);
    }
  }

  /**
   * 记录验证结果
   */
  private logResults(result: ValidationResult): void {
    this.logger.info('\n📊 版本化发布验证结果:');
    
    if (result.valid) {
      this.logger.info('✅ 发布版本验证通过');
    } else {
      this.logger.error('❌ 发布版本验证失败');
    }

    if (result.errors.length > 0) {
      this.logger.error('\n🚨 错误:');
      result.errors.forEach(error => this.logger.error(`  • ${error}`));
    }

    if (result.warnings.length > 0) {
      this.logger.warn('\n⚠️ 警告:');
      result.warnings.forEach(warning => this.logger.warn(`  • ${warning}`));
    }

    if (result.suggestions.length > 0) {
      this.logger.info('\n💡 建议:');
      result.suggestions.forEach(suggestion => this.logger.info(`  • ${suggestion}`));
    }
  }
}

// CLI支持
if (require.main === module) {
  const args = process.argv.slice(2);
  const version = args.find(arg => !arg.startsWith('--')) || '1.0.0';
  const skipBuild = args.includes('--skip-build');
  const skipTests = args.includes('--skip-tests');
  
  const config: ValidationConfig = {
    version,
    releasesDir: path.resolve('releases'),
    skipBuild,
    skipTests
  };
  
  const validator = new VersionedReleaseValidator(config);
  
  validator.validateVersionedRelease()
    .then(result => {
      if (result.valid) {
        console.log(`✅ 版本 v${version} 验证通过！`);
        process.exit(0);
      } else {
        console.log(`❌ 版本 v${version} 验证失败！`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ 验证过程中发生错误:', error);
      process.exit(1);
    });
}
