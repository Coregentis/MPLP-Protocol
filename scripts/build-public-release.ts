/**
 * 开源版本构建脚本
 * 从开发版本构建面向用户的开源版本
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../src/public/utils/logger';

interface BuildConfig {
  sourceDir: string;
  targetDir: string;
  version: string;
  includeTests: boolean;
  includeDocs: boolean;
}

export class PublicReleaseBuilder {
  private logger: Logger;
  private config: BuildConfig;

  constructor(config: BuildConfig) {
    this.logger = new Logger('PublicReleaseBuilder');
    this.config = config;
  }

  /**
   * 构建开源版本的主流程
   */
  async buildPublicRelease(): Promise<void> {
    this.logger.info('🚀 开始构建开源版本...');

    try {
      // 1. 清理和准备
      await this.cleanAndPrepare();
      
      // 2. 复制核心文件
      await this.copySourceFiles();
      
      // 3. 重构路径和依赖
      await this.refactorPaths();
      
      // 4. 清理敏感内容
      await this.sanitizeContent();
      
      // 5. 生成开源特定文件
      await this.generatePublicFiles();
      
      // 6. 验证构建结果
      await this.validateBuild();
      
      this.logger.info('✅ 开源版本构建完成！');
    } catch (error) {
      this.logger.error('❌ 构建失败:', error);
      throw error;
    }
  }

  /**
   * 1. 清理和准备目录结构
   */
  private async cleanAndPrepare(): Promise<void> {
    this.logger.info('📁 准备目录结构...');
    
    // 清理目标目录
    if (await fs.pathExists(this.config.targetDir)) {
      await fs.remove(this.config.targetDir);
    }
    
    // 创建目录结构
    const dirs = [
      'src/core',
      'src/modules',
      'src/schemas',
      'src/types',
      'src/utils',
      'docs',
      'examples',
      'tests'
    ];
    
    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.config.targetDir, dir));
    }
  }

  /**
   * 2. 复制核心源文件
   */
  private async copySourceFiles(): Promise<void> {
    this.logger.info('📋 复制核心源文件...');
    
    const copyTasks = [
      // 核心调度器
      {
        from: 'src/public/modules/core/orchestrator',
        to: 'src/core/orchestrator'
      },
      {
        from: 'src/public/modules/core/workflow',
        to: 'src/core/workflow'
      },
      {
        from: 'src/core/performance',
        to: 'src/core/performance'
      },
      
      // 六大核心模块
      {
        from: 'src/modules/context',
        to: 'src/modules/context'
      },
      {
        from: 'src/modules/plan',
        to: 'src/modules/plan'
      },
      {
        from: 'src/modules/confirm',
        to: 'src/modules/confirm'
      },
      {
        from: 'src/modules/trace',
        to: 'src/modules/trace'
      },
      {
        from: 'src/modules/role',
        to: 'src/modules/role'
      },
      {
        from: 'src/modules/extension',
        to: 'src/modules/extension'
      },
      
      // Schema和类型
      {
        from: 'src/schemas',
        to: 'src/schemas'
      },
      {
        from: 'src/shared/types',
        to: 'src/types'
      },
      
      // 工具类
      {
        from: 'src/public/utils',
        to: 'src/utils'
      },
      
      // 文档和示例
      {
        from: 'docs',
        to: 'docs',
        filter: (src: string) => !src.includes('internal')
      },
      {
        from: 'examples',
        to: 'examples'
      }
    ];

    for (const task of copyTasks) {
      const sourcePath = path.join(this.config.sourceDir, task.from);
      const targetPath = path.join(this.config.targetDir, task.to);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath, {
          filter: task.filter || (() => true)
        });
        this.logger.info(`  ✓ 复制: ${task.from} -> ${task.to}`);
      } else {
        this.logger.warn(`  ⚠️ 源路径不存在: ${task.from}`);
      }
    }
  }

  /**
   * 3. 重构导入路径
   */
  private async refactorPaths(): Promise<void> {
    this.logger.info('🔧 重构导入路径...');
    
    const pathMappings = {
      // 开发版本路径 -> 开源版本路径
      '../../public/utils/': '../utils/',
      '../../public/shared/types/': '../types/',
      '../../public/modules/core/': '../core/',
      '../../../public/utils/': '../../utils/',
      '../../../public/shared/types/': '../../types/',
      '../../../../public/shared/types/': '../../../types/',
      '../../../../public/utils/': '../../../utils/',
      '../../../performance/': '../core/performance/',
      '../../types/index': '../types/index'
    };

    await this.replaceInFiles(this.config.targetDir, pathMappings);
  }

  /**
   * 4. 清理敏感内容
   */
  private async sanitizeContent(): Promise<void> {
    this.logger.info('🧹 清理敏感内容...');
    
    // 删除敏感文件
    const sensitivePatterns = [
      '**/.env*',
      '**/secrets.*',
      '**/private.*',
      '**/internal/**',
      '**/*.private.*',
      '**/docker-compose*',
      '**/.cursor/**'
    ];

    for (const pattern of sensitivePatterns) {
      const files = await this.globFiles(pattern);
      for (const file of files) {
        await fs.remove(file);
      }
    }

    // 清理敏感内容
    const contentReplacements = {
      // 移除内部注释
      '/\\*\\s*@internal[\\s\\S]*?\\*/': '',
      '//\\s*@internal.*': '',
      
      // 移除调试代码
      'console\\.debug\\([^)]*\\);?': '',
      'debugger;?': '',
      
      // 移除内部配置
      'INTERNAL_': 'PUBLIC_',
      'development.': 'production.'
    };

    await this.replaceInFiles(this.config.targetDir, contentReplacements);
  }

  /**
   * 5. 生成开源特定文件
   */
  private async generatePublicFiles(): Promise<void> {
    this.logger.info('📝 生成开源特定文件...');
    
    // 生成package.json
    await this.generatePackageJson();
    
    // 生成index.ts
    await this.generateIndexFile();
    
    // 生成README.md
    await this.generateReadme();
    
    // 复制许可证和贡献指南
    await this.copyLegalFiles();
  }

  /**
   * 6. 验证构建结果
   */
  private async validateBuild(): Promise<void> {
    this.logger.info('✅ 验证构建结果...');
    
    // 检查必需文件
    const requiredFiles = [
      'package.json',
      'README.md',
      'LICENSE',
      'src/index.ts',
      'src/core/orchestrator',
      'src/schemas'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.config.targetDir, file);
      if (!await fs.pathExists(filePath)) {
        throw new Error(`缺少必需文件: ${file}`);
      }
    }

    // 尝试编译TypeScript
    try {
      execSync('npx tsc --noEmit', { 
        cwd: this.config.targetDir,
        stdio: 'pipe'
      });
      this.logger.info('  ✓ TypeScript编译检查通过');
    } catch (error) {
      this.logger.error('  ❌ TypeScript编译检查失败');
      throw error;
    }
  }

  /**
   * 工具方法：替换文件内容
   */
  private async replaceInFiles(dir: string, replacements: Record<string, string>): Promise<void> {
    const files = await this.globFiles('**/*.{ts,js,json,md}', dir);
    
    for (const file of files) {
      let content = await fs.readFile(file, 'utf-8');
      let modified = false;
      
      for (const [search, replace] of Object.entries(replacements)) {
        const regex = new RegExp(search, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          modified = true;
        }
      }
      
      if (modified) {
        await fs.writeFile(file, content);
      }
    }
  }

  /**
   * 工具方法：文件匹配
   */
  private async globFiles(pattern: string, cwd?: string): Promise<string[]> {
    // 简化的glob实现，实际应使用glob库
    const glob = require('glob');
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: cwd || this.config.targetDir }, (err: any, files: string[]) => {
        if (err) reject(err);
        else resolve(files.map(f => path.join(cwd || this.config.targetDir, f)));
      });
    });
  }

  /**
   * 生成开源版本的package.json
   */
  private async generatePackageJson(): Promise<void> {
    const devPackageJson = await fs.readJson(path.join(this.config.sourceDir, 'package.json'));
    
    const publicPackageJson = {
      name: 'mplp',
      version: this.config.version,
      description: 'Multi-Agent Project Lifecycle Protocol - L4 Intelligent Agent Operating System - Open Source Framework',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      repository: {
        type: 'git',
        url: 'https://github.com/Coregentis/MPLP-Protocol.git'
      },
      homepage: 'https://github.com/Coregentis/MPLP-Protocol',
      bugs: {
        url: 'https://github.com/Coregentis/MPLP-Protocol/issues'
      },
      license: 'MIT',
      keywords: [
        'mplp',
        'multi-agent',
        'ai',
        'workflow',
        'orchestration',
        'protocol'
      ],
      scripts: {
        build: 'tsc',
        test: 'jest',
        'test:coverage': 'jest --coverage',
        prepublishOnly: 'npm run build'
      },
      dependencies: {
        // 只包含生产依赖
        'ajv': devPackageJson.dependencies.ajv,
        'ajv-formats': devPackageJson.dependencies['ajv-formats']
      },
      devDependencies: {
        // 只包含必要的开发依赖
        'typescript': devPackageJson.devDependencies.typescript,
        'jest': devPackageJson.devDependencies.jest,
        '@types/jest': devPackageJson.devDependencies['@types/jest'],
        '@types/node': devPackageJson.devDependencies['@types/node']
      },
      engines: {
        node: '>=16.0.0'
      }
    };

    await fs.writeJson(
      path.join(this.config.targetDir, 'package.json'),
      publicPackageJson,
      { spaces: 2 }
    );
  }

  /**
   * 生成统一的index.ts导出文件
   */
  private async generateIndexFile(): Promise<void> {
    const indexContent = `/**
 * MPLP - Multi-Agent Project Lifecycle Protocol - L4 Intelligent Agent Operating System
 * Open Source Framework for Multi-Agent Collaboration
 * 
 * @version ${this.config.version}
 * @license MIT
 */

// Core Orchestrators
export { CoreOrchestrator } from './core/orchestrator/core-orchestrator';
export { PerformanceEnhancedOrchestrator } from './core/orchestrator/performance-enhanced-orchestrator';

// Workflow Management
export { WorkflowManager } from './core/workflow/workflow-manager';

// Core Modules
export * from './modules/context';
export * from './modules/plan';
export * from './modules/confirm';
export * from './modules/trace';
export * from './modules/role';
export * from './modules/extension';

// Schema Validation
export { SchemaValidator } from './schemas';

// Performance Tools
export {
  IntelligentCacheManager,
  ConnectionPoolManager,
  BatchProcessor,
  BusinessPerformanceMonitor
} from './core/performance/real-performance-optimizer';

// Type Definitions
export * from './types';

// Utilities
export { Logger } from './utils/logger';

// Default Exports (for convenience)
export { CoreOrchestrator as Orchestrator } from './core/orchestrator/core-orchestrator';
export { PerformanceEnhancedOrchestrator as EnhancedOrchestrator } from './core/orchestrator/performance-enhanced-orchestrator';
`;

    await fs.writeFile(
      path.join(this.config.targetDir, 'src/index.ts'),
      indexContent
    );
  }

  /**
   * 生成开源版本的README.md
   */
  private async generateReadme(): Promise<void> {
    // 这里应该生成开源版本的README
    // 可以基于模板或从现有README修改
    const readmeContent = `# MPLP - Multi-Agent Project Lifecycle Protocol - L4 Intelligent Agent Operating System

🤖 Open Source Framework for Multi-Agent Collaboration

[详细的README内容...]
`;

    await fs.writeFile(
      path.join(this.config.targetDir, 'README.md'),
      readmeContent
    );
  }

  /**
   * 复制法律文件
   */
  private async copyLegalFiles(): Promise<void> {
    const legalFiles = ['LICENSE', 'CONTRIBUTING.md', 'SECURITY.md'];
    
    for (const file of legalFiles) {
      const sourcePath = path.join(this.config.sourceDir, file);
      const targetPath = path.join(this.config.targetDir, file);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
      }
    }
  }
}

// 主执行函数
export async function buildPublicRelease(version: string): Promise<void> {
  const config: BuildConfig = {
    sourceDir: process.cwd(),
    targetDir: path.join(process.cwd(), 'public-release'),
    version,
    includeTests: true,
    includeDocs: true
  };

  const builder = new PublicReleaseBuilder(config);
  await builder.buildPublicRelease();
}

// 如果直接运行此脚本
if (require.main === module) {
  const version = process.argv[2] || '1.0.0';
  buildPublicRelease(version).catch(console.error);
}
