/**
 * 开源版本验证脚本
 * 验证构建的开源版本是否符合发布标准
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../src/public/utils/logger';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
  };
}

export class PublicReleaseValidator {
  private logger: Logger;
  private releaseDir: string;
  private result: ValidationResult;

  constructor(releaseDir: string = 'public-release') {
    this.logger = new Logger('PublicReleaseValidator');
    this.releaseDir = path.resolve(releaseDir);
    this.result = {
      passed: false,
      errors: [],
      warnings: [],
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0
      }
    };
  }

  /**
   * 执行完整验证
   */
  async validate(): Promise<ValidationResult> {
    this.logger.info('🔍 开始验证开源版本...');

    try {
      // 1. 基础文件检查
      await this.validateRequiredFiles();
      
      // 2. 包配置验证
      await this.validatePackageJson();
      
      // 3. 代码质量检查
      await this.validateCodeQuality();
      
      // 4. 安全检查
      await this.validateSecurity();
      
      // 5. 功能完整性检查
      await this.validateFunctionality();
      
      // 6. 文档完整性检查
      await this.validateDocumentation();
      
      // 7. 最终构建测试
      await this.validateBuild();

      // 计算最终结果
      this.result.passed = this.result.errors.length === 0;
      this.result.summary.totalChecks = this.result.summary.passedChecks + this.result.summary.failedChecks;

      this.logResults();
      return this.result;

    } catch (error) {
      this.addError(`验证过程中发生错误: ${error}`);
      return this.result;
    }
  }

  /**
   * 1. 验证必需文件
   */
  private async validateRequiredFiles(): Promise<void> {
    this.logger.info('📁 检查必需文件...');

    const requiredFiles = [
      'package.json',
      'README.md',
      'LICENSE',
      'CONTRIBUTING.md',
      'SECURITY.md',
      'src/index.ts',
      'src/core/orchestrator/core-orchestrator.ts',
      'src/core/orchestrator/performance-enhanced-orchestrator.ts',
      'src/schemas/index.ts',
      'docs/getting-started.md',
      'docs/api-reference.md',
      'examples/quick-start.ts'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.releaseDir, file);
      if (await fs.pathExists(filePath)) {
        this.addPass(`✓ ${file}`);
      } else {
        this.addError(`✗ 缺少必需文件: ${file}`);
      }
    }

    // 检查目录结构
    const requiredDirs = [
      'src/core',
      'src/modules',
      'src/schemas',
      'src/types',
      'src/utils',
      'docs',
      'examples'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.releaseDir, dir);
      if (await fs.pathExists(dirPath)) {
        this.addPass(`✓ 目录: ${dir}`);
      } else {
        this.addError(`✗ 缺少必需目录: ${dir}`);
      }
    }
  }

  /**
   * 2. 验证package.json配置
   */
  private async validatePackageJson(): Promise<void> {
    this.logger.info('📦 验证package.json...');

    const packagePath = path.join(this.releaseDir, 'package.json');
    if (!await fs.pathExists(packagePath)) {
      this.addError('package.json不存在');
      return;
    }

    const packageJson = await fs.readJson(packagePath);

    // 检查必需字段
    const requiredFields = [
      'name', 'version', 'description', 'main', 'types',
      'repository', 'license', 'keywords', 'scripts'
    ];

    for (const field of requiredFields) {
      if (packageJson[field]) {
        this.addPass(`✓ package.json.${field}`);
      } else {
        this.addError(`✗ package.json缺少字段: ${field}`);
      }
    }

    // 检查仓库URL
    if (packageJson.repository?.url?.includes('MPLP-Protocol.git')) {
      this.addPass('✓ 仓库URL正确');
    } else {
      this.addError('✗ 仓库URL不正确');
    }

    // 检查许可证
    if (packageJson.license === 'MIT') {
      this.addPass('✓ 许可证正确');
    } else {
      this.addWarning('⚠️ 许可证可能不正确');
    }

    // 检查依赖
    if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
      this.addPass('✓ 包含生产依赖');
    } else {
      this.addWarning('⚠️ 没有生产依赖');
    }
  }

  /**
   * 3. 验证代码质量
   */
  private async validateCodeQuality(): Promise<void> {
    this.logger.info('🔧 检查代码质量...');

    try {
      // TypeScript编译检查
      execSync('npx tsc --noEmit', { 
        cwd: this.releaseDir,
        stdio: 'pipe'
      });
      this.addPass('✓ TypeScript编译通过');
    } catch (error) {
      this.addError('✗ TypeScript编译失败');
    }

    // 检查导入路径
    const tsFiles = await this.findFiles('**/*.ts');
    let pathIssues = 0;

    for (const file of tsFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // 检查是否有开发环境路径
      if (content.includes('../../public/')) {
        pathIssues++;
      }
      
      // 检查是否有内部引用
      if (content.includes('@internal') || content.includes('INTERNAL_')) {
        pathIssues++;
      }
    }

    if (pathIssues === 0) {
      this.addPass('✓ 导入路径正确');
    } else {
      this.addError(`✗ 发现${pathIssues}个路径问题`);
    }
  }

  /**
   * 4. 验证安全性
   */
  private async validateSecurity(): Promise<void> {
    this.logger.info('🔒 检查安全性...');

    // 检查敏感文件
    const sensitivePatterns = [
      '**/.env*',
      '**/secrets.*',
      '**/private.*',
      '**/docker-compose*',
      '**/*.private.*'
    ];

    let sensitiveFiles = 0;
    for (const pattern of sensitivePatterns) {
      const files = await this.findFiles(pattern);
      sensitiveFiles += files.length;
    }

    if (sensitiveFiles === 0) {
      this.addPass('✓ 无敏感文件');
    } else {
      this.addError(`✗ 发现${sensitiveFiles}个敏感文件`);
    }

    // 检查敏感内容
    const allFiles = await this.findFiles('**/*.{ts,js,json,md}');
    let sensitiveContent = 0;

    for (const file of allFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // 检查敏感关键词
      const sensitiveKeywords = [
        'password', 'secret', 'token', 'key',
        'localhost', '127.0.0.1', 'development'
      ];

      for (const keyword of sensitiveKeywords) {
        if (content.toLowerCase().includes(keyword)) {
          sensitiveContent++;
          break;
        }
      }
    }

    if (sensitiveContent === 0) {
      this.addPass('✓ 无敏感内容');
    } else {
      this.addWarning(`⚠️ 发现${sensitiveContent}个文件包含敏感关键词`);
    }
  }

  /**
   * 5. 验证功能完整性
   */
  private async validateFunctionality(): Promise<void> {
    this.logger.info('⚙️ 检查功能完整性...');

    // 检查核心模块
    const coreModules = [
      'src/core/orchestrator/core-orchestrator.ts',
      'src/core/orchestrator/performance-enhanced-orchestrator.ts',
      'src/modules/context/index.ts',
      'src/modules/plan/index.ts',
      'src/modules/confirm/index.ts',
      'src/modules/trace/index.ts',
      'src/modules/role/index.ts',
      'src/modules/extension/index.ts'
    ];

    for (const module of coreModules) {
      const modulePath = path.join(this.releaseDir, module);
      if (await fs.pathExists(modulePath)) {
        this.addPass(`✓ 核心模块: ${path.basename(module, '.ts')}`);
      } else {
        this.addError(`✗ 缺少核心模块: ${module}`);
      }
    }

    // 检查Schema文件
    const schemaFiles = [
      'context-protocol.json',
      'plan-protocol.json',
      'confirm-protocol.json',
      'trace-protocol.json',
      'role-protocol.json',
      'extension-protocol.json'
    ];

    for (const schema of schemaFiles) {
      const schemaPath = path.join(this.releaseDir, 'src/schemas', schema);
      if (await fs.pathExists(schemaPath)) {
        this.addPass(`✓ Schema: ${schema}`);
      } else {
        this.addError(`✗ 缺少Schema: ${schema}`);
      }
    }
  }

  /**
   * 6. 验证文档完整性
   */
  private async validateDocumentation(): Promise<void> {
    this.logger.info('📚 检查文档完整性...');

    // 检查README内容
    const readmePath = path.join(this.releaseDir, 'README.md');
    if (await fs.pathExists(readmePath)) {
      const readme = await fs.readFile(readmePath, 'utf-8');
      
      const requiredSections = [
        '# MPLP',
        '## 安装',
        '## 快速开始',
        '## 示例',
        '## 贡献'
      ];

      for (const section of requiredSections) {
        if (readme.includes(section)) {
          this.addPass(`✓ README包含: ${section}`);
        } else {
          this.addWarning(`⚠️ README缺少: ${section}`);
        }
      }
    }

    // 检查示例文件
    const exampleFiles = await this.findFiles('examples/*.ts');
    if (exampleFiles.length >= 3) {
      this.addPass(`✓ 包含${exampleFiles.length}个示例`);
    } else {
      this.addWarning('⚠️ 示例文件较少');
    }
  }

  /**
   * 7. 验证构建
   */
  private async validateBuild(): Promise<void> {
    this.logger.info('🏗️ 验证构建...');

    try {
      // 安装依赖
      execSync('npm install', { 
        cwd: this.releaseDir,
        stdio: 'pipe'
      });
      this.addPass('✓ 依赖安装成功');

      // 构建项目
      execSync('npm run build', { 
        cwd: this.releaseDir,
        stdio: 'pipe'
      });
      this.addPass('✓ 项目构建成功');

      // 检查构建产物
      const distPath = path.join(this.releaseDir, 'dist');
      if (await fs.pathExists(distPath)) {
        this.addPass('✓ 构建产物生成');
      } else {
        this.addError('✗ 构建产物缺失');
      }

    } catch (error) {
      this.addError(`✗ 构建失败: ${error}`);
    }
  }

  /**
   * 工具方法
   */
  private async findFiles(pattern: string): Promise<string[]> {
    const glob = require('glob');
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: this.releaseDir }, (err: any, files: string[]) => {
        if (err) reject(err);
        else resolve(files.map(f => path.join(this.releaseDir, f)));
      });
    });
  }

  private addPass(message: string): void {
    this.result.summary.passedChecks++;
    this.logger.info(`  ${message}`);
  }

  private addError(message: string): void {
    this.result.errors.push(message);
    this.result.summary.failedChecks++;
    this.logger.error(`  ${message}`);
  }

  private addWarning(message: string): void {
    this.result.warnings.push(message);
    this.logger.warn(`  ${message}`);
  }

  private logResults(): void {
    const { summary, errors, warnings } = this.result;
    
    this.logger.info('\n📊 验证结果:');
    this.logger.info(`  总检查项: ${summary.totalChecks}`);
    this.logger.info(`  通过: ${summary.passedChecks}`);
    this.logger.info(`  失败: ${summary.failedChecks}`);
    this.logger.info(`  警告: ${warnings.length}`);

    if (errors.length > 0) {
      this.logger.error('\n❌ 错误:');
      errors.forEach(error => this.logger.error(`  ${error}`));
    }

    if (warnings.length > 0) {
      this.logger.warn('\n⚠️ 警告:');
      warnings.forEach(warning => this.logger.warn(`  ${warning}`));
    }

    if (this.result.passed) {
      this.logger.info('\n🎉 验证通过！开源版本可以发布。');
    } else {
      this.logger.error('\n💥 验证失败！请修复错误后重试。');
    }
  }
}

// 主执行函数
export async function validatePublicRelease(releaseDir?: string): Promise<boolean> {
  const validator = new PublicReleaseValidator(releaseDir);
  const result = await validator.validate();
  return result.passed;
}

// 如果直接运行此脚本
if (require.main === module) {
  const releaseDir = process.argv[2];
  validatePublicRelease(releaseDir)
    .then(passed => process.exit(passed ? 0 : 1))
    .catch(error => {
      console.error('验证过程中发生错误:', error);
      process.exit(1);
    });
}
