/**
 * Release版本结构验证脚本
 * 专门验证releases目录中的版本化发布包
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../src/public/utils/logger';

interface ReleaseValidationConfig {
  version: string;
  releasesDir: string;
  performBuildTest?: boolean;
  performInstallTest?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

export class ReleaseStructureValidator {
  private logger: Logger;
  private config: ReleaseValidationConfig;
  private releaseDir: string;

  constructor(config: ReleaseValidationConfig) {
    this.logger = new Logger('ReleaseStructureValidator');
    this.config = config;
    this.releaseDir = path.join(config.releasesDir, `v${config.version}`);
  }

  /**
   * 验证Release版本结构
   */
  async validateReleaseStructure(): Promise<ValidationResult> {
    this.logger.info(`🔍 验证Release版本 v${this.config.version} 的结构...`);

    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      info: []
    };

    try {
      // 1. 验证Release目录存在
      await this.validateReleaseDirectory(result);
      
      // 2. 验证必需文件
      await this.validateRequiredFiles(result);
      
      // 3. 验证package.json
      await this.validateReleasePackageJson(result);
      
      // 4. 验证源代码结构
      await this.validateReleaseSourceStructure(result);
      
      // 5. 验证模块完整性
      await this.validateModuleCompleteness(result);
      
      // 6. 验证文档完整性
      await this.validateDocumentationCompleteness(result);
      
      // 7. 验证示例代码
      await this.validateExampleCompleteness(result);
      
      // 8. 可选：构建测试
      if (this.config.performBuildTest) {
        await this.performBuildTest(result);
      }
      
      // 9. 可选：安装测试
      if (this.config.performInstallTest) {
        await this.performInstallTest(result);
      }
      
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
   * 1. 验证Release目录存在
   */
  private async validateReleaseDirectory(result: ValidationResult): Promise<void> {
    this.logger.info('📁 验证Release目录...');
    
    if (!await fs.pathExists(this.releaseDir)) {
      result.errors.push(`Release目录不存在: ${this.releaseDir}`);
      return;
    }
    
    result.info.push(`Release目录: ${this.releaseDir}`);
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
      'src/index.ts',
      'tsconfig.json',
      'jest.config.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.releaseDir, file);
      if (!await fs.pathExists(filePath)) {
        result.errors.push(`必需文件缺失: ${file}`);
      } else {
        result.info.push(`✓ ${file}`);
      }
    }
  }

  /**
   * 3. 验证Release版本的package.json
   */
  private async validateReleasePackageJson(result: ValidationResult): Promise<void> {
    this.logger.info('📦 验证Release package.json...');
    
    try {
      const packageJsonPath = path.join(this.releaseDir, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      // 验证包名
      if (packageJson.name !== 'mplp-protocol') {
        result.errors.push(`包名错误: 期望 'mplp-protocol', 实际 '${packageJson.name}'`);
      }
      
      // 验证版本号
      if (packageJson.version !== this.config.version) {
        result.errors.push(`版本号错误: 期望 '${this.config.version}', 实际 '${packageJson.version}'`);
      }
      
      // 验证主入口
      if (packageJson.main !== 'dist/index.js') {
        result.warnings.push(`主入口可能不正确: ${packageJson.main}`);
      }
      
      // 验证类型定义
      if (packageJson.types !== 'dist/index.d.ts') {
        result.warnings.push(`类型定义入口可能不正确: ${packageJson.types}`);
      }
      
      // 验证关键依赖
      if (!packageJson.dependencies?.ajv) {
        result.warnings.push('缺少ajv依赖');
      }
      
      if (!packageJson.devDependencies?.typescript) {
        result.warnings.push('缺少typescript开发依赖');
      }
      
      result.info.push(`包名: ${packageJson.name}`);
      result.info.push(`版本: ${packageJson.version}`);
      result.info.push(`描述: ${packageJson.description}`);
      
    } catch (error) {
      result.errors.push(`package.json解析失败: ${error}`);
    }
  }

  /**
   * 4. 验证Release源代码结构
   */
  private async validateReleaseSourceStructure(result: ValidationResult): Promise<void> {
    this.logger.info('💻 验证Release源代码结构...');
    
    const requiredDirs = [
      'src/core',
      'src/modules',
      'src/schemas',
      'src/shared/types',
      'src/utils'
    ];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.releaseDir, dir);
      if (!await fs.pathExists(dirPath)) {
        result.errors.push(`必需目录缺失: ${dir}`);
      } else {
        result.info.push(`✓ ${dir}`);
      }
    }
    
    // 验证主入口文件
    const indexPath = path.join(this.releaseDir, 'src/index.ts');
    if (await fs.pathExists(indexPath)) {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      
      // 检查关键导出
      const requiredExports = [
        'MPLPOrchestrator',
        'WorkflowManager',
        'VERSION'
      ];
      
      for (const exportName of requiredExports) {
        if (!indexContent.includes(exportName)) {
          result.warnings.push(`主入口文件缺少导出: ${exportName}`);
        }
      }
      
      // 检查版本号
      if (indexContent.includes(`VERSION = '${this.config.version}'`)) {
        result.info.push(`✓ 版本号正确: ${this.config.version}`);
      } else {
        result.warnings.push('主入口文件中版本号可能不正确');
      }
    }
  }

  /**
   * 5. 验证模块完整性
   */
  private async validateModuleCompleteness(result: ValidationResult): Promise<void> {
    this.logger.info('🧩 验证模块完整性...');
    
    const modules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    
    for (const module of modules) {
      const moduleDir = path.join(this.releaseDir, `src/modules/${module}`);
      
      if (!await fs.pathExists(moduleDir)) {
        result.errors.push(`模块目录缺失: ${module}`);
        continue;
      }
      
      // 检查模块结构
      const requiredPaths = [
        `src/modules/${module}/api`,
        `src/modules/${module}/domain`,
        `src/modules/${module}/types.ts`,
        `src/modules/${module}/index.ts`
      ];
      
      for (const requiredPath of requiredPaths) {
        const fullPath = path.join(this.releaseDir, requiredPath);
        if (!await fs.pathExists(fullPath)) {
          result.warnings.push(`模块 ${module} 缺少: ${requiredPath.split('/').pop()}`);
        }
      }
      
      result.info.push(`✓ 模块 ${module} 结构完整`);
    }
  }

  /**
   * 6. 验证文档完整性
   */
  private async validateDocumentationCompleteness(result: ValidationResult): Promise<void> {
    this.logger.info('📚 验证文档完整性...');
    
    // 验证README.md
    const readmePath = path.join(this.releaseDir, 'README.md');
    if (await fs.pathExists(readmePath)) {
      const readmeContent = await fs.readFile(readmePath, 'utf-8');
      
      if (readmeContent.includes(`v${this.config.version}`)) {
        result.info.push('✓ README.md包含正确版本号');
      } else {
        result.warnings.push('README.md中版本号可能不正确');
      }
      
      const requiredSections = ['Overview', 'Features', 'Installation', 'Quick Start'];
      for (const section of requiredSections) {
        if (!readmeContent.includes(section)) {
          result.warnings.push(`README.md缺少章节: ${section}`);
        }
      }
    }
    
    // 验证CHANGELOG.md
    const changelogPath = path.join(this.releaseDir, 'CHANGELOG.md');
    if (await fs.pathExists(changelogPath)) {
      const changelogContent = await fs.readFile(changelogPath, 'utf-8');
      
      if (changelogContent.includes(`[${this.config.version}]`)) {
        result.info.push('✓ CHANGELOG.md包含当前版本');
      } else {
        result.warnings.push('CHANGELOG.md中缺少当前版本条目');
      }
    }
  }

  /**
   * 7. 验证示例代码
   */
  private async validateExampleCompleteness(result: ValidationResult): Promise<void> {
    this.logger.info('📝 验证示例代码...');
    
    const examplesDir = path.join(this.releaseDir, 'examples');
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
      } else {
        result.info.push(`✓ ${example}`);
      }
    }
  }

  /**
   * 8. 构建测试
   */
  private async performBuildTest(result: ValidationResult): Promise<void> {
    this.logger.info('🔨 执行构建测试...');
    
    const originalCwd = process.cwd();
    
    try {
      // 切换到Release目录
      process.chdir(this.releaseDir);
      
      // 安装依赖
      this.logger.info('📦 安装依赖...');
      execSync('npm install', { stdio: 'inherit' });
      
      // 执行构建
      this.logger.info('🔨 执行构建...');
      execSync('npm run build', { stdio: 'inherit' });
      
      // 验证构建产物
      const distDir = path.join(this.releaseDir, 'dist');
      if (await fs.pathExists(distDir)) {
        const indexJs = path.join(distDir, 'index.js');
        const indexDts = path.join(distDir, 'index.d.ts');
        
        if (await fs.pathExists(indexJs) && await fs.pathExists(indexDts)) {
          result.info.push('✅ 构建测试通过');
        } else {
          result.errors.push('构建产物不完整');
        }
      } else {
        result.errors.push('构建后缺少dist目录');
      }
      
    } catch (error) {
      result.errors.push(`构建测试失败: ${error}`);
    } finally {
      // 恢复原始工作目录
      process.chdir(originalCwd);
    }
  }

  /**
   * 9. 安装测试
   */
  private async performInstallTest(result: ValidationResult): Promise<void> {
    this.logger.info('📦 执行安装测试...');
    
    try {
      // 测试npm pack
      const originalCwd = process.cwd();
      process.chdir(this.releaseDir);
      
      execSync('npm pack --dry-run', { stdio: 'inherit' });
      result.info.push('✅ npm pack测试通过');
      
      process.chdir(originalCwd);
      
    } catch (error) {
      result.errors.push(`安装测试失败: ${error}`);
    }
  }

  /**
   * 记录验证结果
   */
  private logResults(result: ValidationResult): void {
    this.logger.info('\n📊 Release版本验证结果:');
    
    if (result.valid) {
      this.logger.info('✅ Release版本验证通过');
    } else {
      this.logger.error('❌ Release版本验证失败');
    }

    if (result.errors.length > 0) {
      this.logger.error('\n🚨 错误:');
      result.errors.forEach(error => this.logger.error(`  • ${error}`));
    }

    if (result.warnings.length > 0) {
      this.logger.warn('\n⚠️ 警告:');
      result.warnings.forEach(warning => this.logger.warn(`  • ${warning}`));
    }

    if (result.info.length > 0) {
      this.logger.info('\n📋 信息:');
      result.info.forEach(info => this.logger.info(`  • ${info}`));
    }
  }
}

// CLI支持
if (require.main === module) {
  const args = process.argv.slice(2);
  const version = args.find(arg => !arg.startsWith('--')) || '1.0.0';
  const performBuildTest = args.includes('--build-test');
  const performInstallTest = args.includes('--install-test');
  
  const config: ReleaseValidationConfig = {
    version,
    releasesDir: path.resolve('releases'),
    performBuildTest,
    performInstallTest
  };
  
  const validator = new ReleaseStructureValidator(config);
  
  validator.validateReleaseStructure()
    .then(result => {
      if (result.valid) {
        console.log(`✅ Release版本 v${version} 验证通过！`);
        process.exit(0);
      } else {
        console.log(`❌ Release版本 v${version} 验证失败！`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ 验证过程中发生错误:', error);
      process.exit(1);
    });
}
