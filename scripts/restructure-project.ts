/**
 * 项目目录重构自动化脚本
 * 安全地重组项目结构，记录所有变更，确保功能完整性
 * 
 * @version 1.0.0
 * @created 2025-01-29T08:00:00+08:00
 */

import * as fs from 'fs';
import * as path from 'path';

interface PathMapping {
  from: string;
  to: string;
  type: 'move' | 'copy' | 'delete';
  reason: string;
}

interface ImportUpdate {
  file: string;
  oldImport: string;
  newImport: string;
  lineNumber?: number;
}

interface RestructureConfig {
  dryRun: boolean;
  createBackup: boolean;
  verbose: boolean;
  validateAfterEach: boolean;
}

interface RestructureReport {
  pathMappings: PathMapping[];
  importUpdates: ImportUpdate[];
  filesCreated: string[];
  filesDeleted: string[];
  errors: string[];
  warnings: string[];
  summary: string;
}

class ProjectRestructurer {
  private config: RestructureConfig;
  private report: RestructureReport;
  private rootDir: string;

  constructor(config: RestructureConfig) {
    this.config = config;
    this.rootDir = process.cwd();
    this.report = {
      pathMappings: [],
      importUpdates: [],
      filesCreated: [],
      filesDeleted: [],
      errors: [],
      warnings: [],
      summary: ''
    };
  }

  async restructure(): Promise<RestructureReport> {
    console.log('🚀 开始项目目录重构...');
    console.log(`根目录: ${this.rootDir}`);
    console.log(`干运行模式: ${this.config.dryRun}`);

    try {
      // 1. 创建备份
      if (this.config.createBackup) {
        await this.createBackup();
      }

      // 2. 分析当前结构
      await this.analyzeCurrentStructure();

      // 3. 创建新目录结构
      await this.createNewDirectoryStructure();

      // 4. 执行文件迁移
      await this.executeFileMigration();

      // 5. 更新引用路径
      await this.updateImportPaths();

      // 6. 更新配置文件
      await this.updateConfigFiles();

      // 7. 删除不需要的文件
      await this.deleteUnwantedFiles();

      // 8. 验证重构结果
      if (this.config.validateAfterEach) {
        await this.validateRestructure();
      }

      // 9. 生成报告
      this.generateReport();

      console.log('✅ 项目重构完成');
      return this.report;

    } catch (error) {
      this.report.errors.push(`重构失败: ${error instanceof Error ? error.message : String(error)}`);
      console.error('❌ 项目重构失败:', error);
      throw error;
    }
  }

  private async createBackup(): Promise<void> {
    const backupDir = path.join(this.rootDir, `backup-${Date.now()}`);
    
    if (!this.config.dryRun) {
      console.log('📦 创建项目备份...');
      await this.copyDirectory(this.rootDir, backupDir, [
        'node_modules',
        'dist',
        'coverage',
        '.git',
        'backup-*'
      ]);
      console.log(`✅ 备份创建完成: ${backupDir}`);
    } else {
      console.log('📦 (干运行) 跳过备份创建');
    }
  }

  private async analyzeCurrentStructure(): Promise<void> {
    console.log('🔍 分析当前项目结构...');
    
    // 分析源代码结构
    const srcFiles = await this.findFiles('src', ['.ts', '.js']);
    const testFiles = await this.findFiles('tests', ['.ts', '.js']);
    const docFiles = await this.findFiles('docs', ['.md']);

    console.log(`发现源代码文件: ${srcFiles.length}`);
    console.log(`发现测试文件: ${testFiles.length}`);
    console.log(`发现文档文件: ${docFiles.length}`);

    // 分析依赖关系
    await this.analyzeDependencies(srcFiles.concat(testFiles));
  }

  private async createNewDirectoryStructure(): Promise<void> {
    console.log('📁 创建新目录结构...');

    const newDirectories = [
      // 源代码目录
      'src/public/modules/core',
      'src/public/performance',
      'src/public/shared',
      'src/public/utils',
      'src/internal/experimental',
      'src/internal/monitoring',
      'src/internal/analytics',
      'src/internal/dev-tools',
      
      // 测试目录
      'tests/public/unit',
      'tests/public/integration',
      'tests/public/e2e',
      'tests/public/performance',
      'tests/public/test-utils',
      'tests/internal/experimental',
      'tests/internal/load',
      'tests/internal/security',
      
      // 文档目录
      'docs/public/api',
      'docs/public/guides',
      'docs/public/examples',
      'docs/internal/architecture',
      'docs/internal/deployment',
      'docs/internal/security',
      
      // 示例目录
      'examples/basic',
      'examples/advanced',
      'examples/performance',
      
      // 脚本目录
      'scripts/public/build',
      'scripts/public/test',
      'scripts/internal/deployment',
      'scripts/internal/monitoring',
      
      // 配置目录
      'configs/public',
      'configs/internal'
    ];

    for (const dir of newDirectories) {
      const fullPath = path.join(this.rootDir, dir);
      
      if (!this.config.dryRun) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.report.filesCreated.push(dir);
      }
      
      if (this.config.verbose) {
        console.log(`  📁 ${this.config.dryRun ? '(干运行)' : ''}创建目录: ${dir}`);
      }
    }
  }

  private async executeFileMigration(): Promise<void> {
    console.log('📦 执行文件迁移...');

    const migrations: PathMapping[] = [
      // 核心模块迁移
      {
        from: 'src/modules/core',
        to: 'src/public/modules/core',
        type: 'move',
        reason: '核心模块移至公开目录'
      },
      {
        from: 'src/core/performance',
        to: 'src/public/performance',
        type: 'move',
        reason: '性能模块移至公开目录'
      },
      {
        from: 'src/shared',
        to: 'src/public/shared',
        type: 'move',
        reason: '共享类型移至公开目录'
      },
      {
        from: 'src/utils',
        to: 'src/public/utils',
        type: 'move',
        reason: '工具函数移至公开目录'
      },
      
      // 测试文件迁移
      {
        from: 'tests/unit',
        to: 'tests/public/unit',
        type: 'move',
        reason: '单元测试移至公开测试目录'
      },
      {
        from: 'tests/integration',
        to: 'tests/public/integration',
        type: 'move',
        reason: '集成测试移至公开测试目录'
      },
      {
        from: 'tests/e2e',
        to: 'tests/public/e2e',
        type: 'move',
        reason: 'E2E测试移至公开测试目录'
      },
      {
        from: 'tests/test-utils',
        to: 'tests/public/test-utils',
        type: 'move',
        reason: '测试工具移至公开测试目录'
      }
    ];

    for (const migration of migrations) {
      await this.executeMigration(migration);
    }
  }

  private async executeMigration(migration: PathMapping): Promise<void> {
    const fromPath = path.join(this.rootDir, migration.from);
    const toPath = path.join(this.rootDir, migration.to);

    if (!fs.existsSync(fromPath)) {
      this.report.warnings.push(`源路径不存在: ${migration.from}`);
      return;
    }

    try {
      if (!this.config.dryRun) {
        if (migration.type === 'move') {
          await this.moveDirectory(fromPath, toPath);
        } else if (migration.type === 'copy') {
          await this.copyDirectory(fromPath, toPath);
        }
      }

      this.report.pathMappings.push(migration);
      
      if (this.config.verbose) {
        console.log(`  📦 ${this.config.dryRun ? '(干运行)' : ''}${migration.type}: ${migration.from} → ${migration.to}`);
      }

    } catch (error) {
      this.report.errors.push(`迁移失败 ${migration.from} → ${migration.to}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updateImportPaths(): Promise<void> {
    console.log('🔗 更新引用路径...');

    const pathMappings = new Map<string, string>([
      ['src/modules/core', 'src/public/modules/core'],
      ['src/core/performance', 'src/public/performance'],
      ['src/shared', 'src/public/shared'],
      ['src/utils', 'src/public/utils'],
      ['tests/unit', 'tests/public/unit'],
      ['tests/integration', 'tests/public/integration'],
      ['tests/e2e', 'tests/public/e2e'],
      ['tests/test-utils', 'tests/public/test-utils']
    ]);

    // 查找所有TypeScript文件
    const allFiles = await this.findFiles('.', ['.ts', '.js'], [
      'node_modules',
      'dist',
      'coverage',
      'backup-*'
    ]);

    for (const file of allFiles) {
      await this.updateFileImports(file, pathMappings);
    }
  }

  private async updateFileImports(filePath: string, pathMappings: Map<string, string>): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let hasChanges = false;

      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 匹配import语句
        const importMatch = line.match(/^(\s*import\s+.*from\s+['"])([^'"]+)(['"].*)/);
        if (importMatch) {
          const [, prefix, importPath, suffix] = importMatch;
          
          // 检查是否需要更新路径
          for (const [oldPath, newPath] of pathMappings) {
            if (importPath.startsWith(oldPath)) {
              const newImportPath = importPath.replace(oldPath, newPath);
              const newLine = prefix + newImportPath + suffix;
              
              lines[i] = newLine;
              hasChanges = true;
              
              this.report.importUpdates.push({
                file: path.relative(this.rootDir, filePath),
                oldImport: importPath,
                newImport: newImportPath,
                lineNumber: i + 1
              });
              
              if (this.config.verbose) {
                console.log(`    🔗 ${path.relative(this.rootDir, filePath)}:${i + 1} ${importPath} → ${newImportPath}`);
              }
              break;
            }
          }
        }
      }

      if (hasChanges && !this.config.dryRun) {
        updatedContent = lines.join('\n');
        fs.writeFileSync(filePath, updatedContent);
      }

    } catch (error) {
      this.report.errors.push(`更新文件引用失败 ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updateConfigFiles(): Promise<void> {
    console.log('⚙️ 更新配置文件...');

    // 更新 tsconfig.json
    await this.updateTsConfig();
    
    // 更新 jest.config.js
    await this.updateJestConfig();
    
    // 更新 package.json
    await this.updatePackageJson();
  }

  private async updateTsConfig(): Promise<void> {
    const tsConfigPath = path.join(this.rootDir, 'tsconfig.json');
    
    if (!fs.existsSync(tsConfigPath)) {
      this.report.warnings.push('tsconfig.json 不存在');
      return;
    }

    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      // 添加路径映射
      if (!tsConfig.compilerOptions) {
        tsConfig.compilerOptions = {};
      }
      
      tsConfig.compilerOptions.baseUrl = '.';
      tsConfig.compilerOptions.paths = {
        '@public/*': ['src/public/*'],
        '@internal/*': ['src/internal/*'],
        '@core/*': ['src/public/modules/core/*'],
        '@performance/*': ['src/public/performance/*'],
        '@shared/*': ['src/public/shared/*'],
        '@utils/*': ['src/public/utils/*'],
        '@tests/*': ['tests/public/*']
      };

      if (!this.config.dryRun) {
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      }
      
      console.log(`  ⚙️ ${this.config.dryRun ? '(干运行)' : ''}更新 tsconfig.json`);

    } catch (error) {
      this.report.errors.push(`更新 tsconfig.json 失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updateJestConfig(): Promise<void> {
    const jestConfigPath = path.join(this.rootDir, 'jest.config.js');
    
    if (!fs.existsSync(jestConfigPath)) {
      this.report.warnings.push('jest.config.js 不存在');
      return;
    }

    try {
      let content = fs.readFileSync(jestConfigPath, 'utf8');
      
      // 更新测试路径
      content = content.replace(
        /testMatch:\s*\[([^\]]+)\]/,
        `testMatch: [
    '<rootDir>/tests/public/**/*.test.ts',
    '<rootDir>/tests/public/**/*.spec.ts'
  ]`
      );

      // 添加模块名映射
      const moduleNameMapping = `
  moduleNameMapper: {
    '^@public/(.*)$': '<rootDir>/src/public/$1',
    '^@internal/(.*)$': '<rootDir>/src/internal/$1',
    '^@core/(.*)$': '<rootDir>/src/public/modules/core/$1',
    '^@performance/(.*)$': '<rootDir>/src/public/performance/$1',
    '^@shared/(.*)$': '<rootDir>/src/public/shared/$1',
    '^@utils/(.*)$': '<rootDir>/src/public/utils/$1',
    '^@tests/(.*)$': '<rootDir>/tests/public/$1'
  },`;

      if (!content.includes('moduleNameMapper')) {
        content = content.replace(
          /module\.exports\s*=\s*{/,
          `module.exports = {${moduleNameMapping}`
        );
      }

      if (!this.config.dryRun) {
        fs.writeFileSync(jestConfigPath, content);
      }
      
      console.log(`  ⚙️ ${this.config.dryRun ? '(干运行)' : ''}更新 jest.config.js`);

    } catch (error) {
      this.report.errors.push(`更新 jest.config.js 失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updatePackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.rootDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      this.report.errors.push('package.json 不存在');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // 更新脚本中的路径引用
      if (packageJson.scripts) {
        for (const [scriptName, scriptValue] of Object.entries(packageJson.scripts)) {
          if (typeof scriptValue === 'string') {
            let updatedScript = scriptValue;
            
            // 更新测试路径
            updatedScript = updatedScript.replace(/tests\/unit/g, 'tests/public/unit');
            updatedScript = updatedScript.replace(/tests\/integration/g, 'tests/public/integration');
            updatedScript = updatedScript.replace(/tests\/e2e/g, 'tests/public/e2e');
            updatedScript = updatedScript.replace(/tests\/performance/g, 'tests/public/performance');
            
            if (updatedScript !== scriptValue) {
              packageJson.scripts[scriptName] = updatedScript;
              console.log(`    📝 更新脚本 ${scriptName}: ${scriptValue} → ${updatedScript}`);
            }
          }
        }
      }

      if (!this.config.dryRun) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      }
      
      console.log(`  ⚙️ ${this.config.dryRun ? '(干运行)' : ''}更新 package.json`);

    } catch (error) {
      this.report.errors.push(`更新 package.json 失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async deleteUnwantedFiles(): Promise<void> {
    console.log('🗑️ 删除不需要的文件...');

    const filesToDelete = [
      'tests/performance/ultra-fast-performance.test.ts',
      'tests/performance/optimized-performance.test.ts',
      'tests/performance/simple-optimized-performance.test.ts',
      'docs/performance/performance-optimization-achievement.md'
    ];

    for (const file of filesToDelete) {
      const filePath = path.join(this.rootDir, file);
      
      if (fs.existsSync(filePath)) {
        if (!this.config.dryRun) {
          fs.unlinkSync(filePath);
        }
        
        this.report.filesDeleted.push(file);
        console.log(`  🗑️ ${this.config.dryRun ? '(干运行)' : ''}删除文件: ${file}`);
      }
    }
  }

  private async validateRestructure(): Promise<void> {
    console.log('✅ 验证重构结果...');

    // 检查关键文件是否存在
    const criticalFiles = [
      'src/public/modules/core/orchestrator/core-orchestrator.ts',
      'src/public/performance/real-performance-optimizer.ts',
      'tests/public/performance/real-business-performance.test.ts'
    ];

    for (const file of criticalFiles) {
      const filePath = path.join(this.rootDir, file);
      if (!fs.existsSync(filePath) && !this.config.dryRun) {
        this.report.errors.push(`关键文件缺失: ${file}`);
      }
    }

    // 检查是否有残留的旧路径引用
    if (!this.config.dryRun) {
      await this.checkForOldPathReferences();
    }
  }

  private async checkForOldPathReferences(): Promise<void> {
    const allFiles = await this.findFiles('.', ['.ts', '.js'], [
      'node_modules',
      'dist',
      'coverage',
      'backup-*'
    ]);

    const oldPaths = [
      'src/modules/core',
      'src/core/performance',
      'tests/unit',
      'tests/integration'
    ];

    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const oldPath of oldPaths) {
          if (content.includes(oldPath)) {
            this.report.warnings.push(`文件 ${path.relative(this.rootDir, file)} 仍包含旧路径引用: ${oldPath}`);
          }
        }
      } catch (error) {
        // 忽略读取错误
      }
    }
  }

  private generateReport(): void {
    this.report.summary = `
📊 项目重构报告总结:
- 路径映射: ${this.report.pathMappings.length} 个
- 引用更新: ${this.report.importUpdates.length} 个
- 创建文件/目录: ${this.report.filesCreated.length} 个
- 删除文件: ${this.report.filesDeleted.length} 个
- 错误: ${this.report.errors.length} 个
- 警告: ${this.report.warnings.length} 个

${this.report.errors.length === 0 ? '✅ 重构成功完成' : '❌ 重构过程中发现错误'}
`;

    console.log(this.report.summary);
  }

  // 辅助方法
  private async findFiles(dir: string, extensions: string[], excludeDirs: string[] = []): Promise<string[]> {
    const files: string[] = [];
    
    const scanDir = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(this.rootDir, fullPath);
        
        if (entry.isDirectory()) {
          if (!excludeDirs.some(exclude => relativePath.includes(exclude))) {
            scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          if (extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
    };

    const startDir = path.join(this.rootDir, dir);
    if (fs.existsSync(startDir)) {
      scanDir(startDir);
    }
    
    return files;
  }

  private async analyzeDependencies(files: string[]): Promise<void> {
    // 分析文件间的依赖关系
    // 这里可以添加更复杂的依赖分析逻辑
    console.log(`分析 ${files.length} 个文件的依赖关系...`);
  }

  private async moveDirectory(from: string, to: string): Promise<void> {
    await this.copyDirectory(from, to);
    fs.rmSync(from, { recursive: true });
  }

  private async copyDirectory(from: string, to: string, excludeDirs: string[] = []): Promise<void> {
    if (!fs.existsSync(from)) return;

    fs.mkdirSync(to, { recursive: true });
    
    const entries = fs.readdirSync(from, { withFileTypes: true });
    
    for (const entry of entries) {
      const fromPath = path.join(from, entry.name);
      const toPath = path.join(to, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          await this.copyDirectory(fromPath, toPath, excludeDirs);
        }
      } else {
        fs.copyFileSync(fromPath, toPath);
      }
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  const config: RestructureConfig = {
    dryRun: args.includes('--dry-run'),
    createBackup: !args.includes('--no-backup'),
    verbose: args.includes('--verbose'),
    validateAfterEach: !args.includes('--no-validate')
  };

  try {
    const restructurer = new ProjectRestructurer(config);
    const report = await restructurer.restructure();

    // 保存报告
    const reportPath = path.join(process.cwd(), 'restructure-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);

    if (report.errors.length > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ 重构过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ProjectRestructurer, RestructureConfig, RestructureReport };
