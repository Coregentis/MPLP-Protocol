/**
 * 版本化发布构建脚本
 * 构建特定版本的开源发布包
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../src/public/utils/logger';

interface VersionedBuildConfig {
  version: string;
  sourceDir: string;
  releasesDir: string;
  includeTests: boolean;
  includeDocs: boolean;
  createArchive: boolean;
}

interface SourceFileInfo {
  primaryPath: string;
  fallbackPaths: string[];
  required: boolean;
  description: string;
}

export class VersionedReleaseBuilder {
  private logger: Logger;
  private config: VersionedBuildConfig;
  private versionDir: string;

  constructor(config: VersionedBuildConfig) {
    this.logger = new Logger('VersionedReleaseBuilder');
    this.config = config;
    this.versionDir = path.join(config.releasesDir, `v${config.version}`);
  }

  /**
   * 构建版本化发布的主流程
   */
  async buildVersionedRelease(): Promise<void> {
    this.logger.info(`🚀 开始构建版本 v${this.config.version} 的开源发布...`);

    try {
      // 1. 清理和准备版本目录
      await this.cleanAndPrepareVersionDir();
      
      // 2. 复制核心文件
      await this.copySourceFiles();
      
      // 3. 生成版本特定的package.json
      await this.generateVersionedPackageJson();
      
      // 4. 复制和生成文档
      await this.copyDocumentation();
      
      // 5. 复制示例代码
      await this.copyExamples();
      
      // 6. 生成类型定义
      await this.generateTypeDefinitions();
      
      // 7. 修复路径问题
      await this.fixReleasePaths();

      // 8. 创建发布归档
      if (this.config.createArchive) {
        await this.createReleaseArchive();
      }

      // 9. 验证构建结果
      await this.validateBuild();
      
      this.logger.info(`✅ 版本 v${this.config.version} 构建完成！`);
      this.logger.info(`📁 发布目录: ${this.versionDir}`);
      
    } catch (error) {
      this.logger.error('❌ 构建失败:', error);
      throw error;
    }
  }

  /**
   * 1. 清理和准备版本目录
   */
  private async cleanAndPrepareVersionDir(): Promise<void> {
    this.logger.info(`📁 准备版本目录 v${this.config.version}...`);
    
    // 确保releases目录存在
    await fs.ensureDir(this.config.releasesDir);
    
    // 清理版本目录
    if (await fs.pathExists(this.versionDir)) {
      await fs.remove(this.versionDir);
    }
    
    // 创建版本目录结构
    const dirs = [
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
      'examples',
      'dist'
    ];
    
    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.versionDir, dir));
    }
  }

  /**
   * 分析源目录结构
   */
  private async analyzeSourceStructure(): Promise<void> {
    this.logger.info('🔍 分析源目录结构...');

    const checkPaths = [
      'src/public/modules/core',
      'src/modules/core',
      'src/core',
      'src/public/performance',
      'src/performance',
      'src/modules/context',
      'src/modules/plan',
      'src/schemas',
      'src/shared/types',
      'src/public/shared/types',
      'src/utils',
      'src/public/utils'
    ];

    for (const checkPath of checkPaths) {
      const fullPath = path.join(this.config.sourceDir, checkPath);
      const exists = await fs.pathExists(fullPath);
      this.logger.info(`  ${exists ? '✓' : '✗'} ${checkPath}`);
    }
  }

  /**
   * 2. 复制核心源文件 - 基于实际项目结构
   */
  private async copySourceFiles(): Promise<void> {
    this.logger.info('📋 复制核心源文件...');

    // 定义Release版本需要的文件结构映射
    const releaseFileMap = await this.buildReleaseFileMap();

    // 执行文件复制
    for (const [targetPath, sourceInfo] of releaseFileMap) {
      await this.copyFileOrDirectory(sourceInfo, targetPath);
    }
  }

  /**
   * 构建Release版本的文件映射
   */
  private async buildReleaseFileMap(): Promise<Map<string, SourceFileInfo>> {
    const fileMap = new Map<string, SourceFileInfo>();

    // 核心系统文件 - 基于实际源代码结构
    fileMap.set('src/core/orchestrator', {
      primaryPath: 'src/public/modules/core/orchestrator',
      fallbackPaths: [],
      required: true,
      description: '核心调度器'
    });

    fileMap.set('src/core/workflow', {
      primaryPath: 'src/public/modules/core/workflow',
      fallbackPaths: [],
      required: true,
      description: '工作流管理器'
    });

    fileMap.set('src/core/types', {
      primaryPath: 'src/public/modules/core/types',
      fallbackPaths: [],
      required: true,
      description: '核心类型定义'
    });

    fileMap.set('src/core/performance', {
      primaryPath: 'src/public/performance',
      fallbackPaths: [],
      required: true,
      description: '性能监控'
    });

    // 六大核心模块 - 完整复制包括application和infrastructure层
    const modules = ['context', 'plan', 'confirm', 'trace', 'role', 'extension'];
    for (const module of modules) {
      // 完整模块目录
      fileMap.set(`src/modules/${module}`, {
        primaryPath: `src/modules/${module}`,
        fallbackPaths: [],
        required: true,
        description: `${module}完整模块`
      });
    }

    // Schema文件
    fileMap.set('src/schemas', {
      primaryPath: 'src/schemas',
      fallbackPaths: [],
      required: true,
      description: 'JSON Schema定义'
    });

    // 共享类型 - 使用实际路径
    fileMap.set('src/shared/types', {
      primaryPath: 'src/public/shared/types',
      fallbackPaths: ['src/types'],
      required: true,
      description: '共享类型定义'
    });

    // 工具类
    fileMap.set('src/utils', {
      primaryPath: 'src/public/utils',
      fallbackPaths: [],
      required: true,
      description: '工具函数'
    });

    // 配置文件
    fileMap.set('src/config', {
      primaryPath: 'src/config',
      fallbackPaths: [],
      required: false,
      description: '配置文件'
    });

    return fileMap;
  }

  /**
   * 复制文件或目录
   */
  private async copyFileOrDirectory(sourceInfo: SourceFileInfo, targetRelativePath: string): Promise<void> {
    const targetPath = path.join(this.versionDir, targetRelativePath);

    // 尝试主路径
    let sourcePath = path.join(this.config.sourceDir, sourceInfo.primaryPath);
    let sourceExists = await fs.pathExists(sourcePath);

    // 如果主路径不存在，尝试备用路径
    if (!sourceExists && sourceInfo.fallbackPaths.length > 0) {
      for (const fallbackPath of sourceInfo.fallbackPaths) {
        sourcePath = path.join(this.config.sourceDir, fallbackPath);
        sourceExists = await fs.pathExists(sourcePath);
        if (sourceExists) {
          this.logger.info(`  📁 使用备用路径: ${fallbackPath} → ${targetRelativePath}`);
          break;
        }
      }
    }

    if (sourceExists) {
      // 确保目标目录存在
      await fs.ensureDir(path.dirname(targetPath));

      // 复制文件或目录
      await fs.copy(sourcePath, targetPath, {
        filter: (src) => {
          // 过滤掉测试文件、内部文件和临时文件
          const relativePath = path.relative(sourcePath, src);
          return !relativePath.includes('.test.') &&
                 !relativePath.includes('.spec.') &&
                 !relativePath.includes('__tests__') &&
                 !relativePath.includes('.internal.') &&
                 !relativePath.includes('.tmp') &&
                 !relativePath.includes('node_modules');
        }
      });

      this.logger.info(`  ✓ ${sourceInfo.description}: ${path.relative(this.config.sourceDir, sourcePath)} → ${targetRelativePath}`);
    } else {
      if (sourceInfo.required) {
        throw new Error(`必需文件/目录不存在: ${sourceInfo.primaryPath} (${sourceInfo.description})`);
      } else {
        this.logger.warn(`  ⚠️ 可选文件/目录不存在: ${sourceInfo.primaryPath} (${sourceInfo.description})`);
      }
    }
  }

  /**
   * 3. 生成版本特定的package.json
   */
  private async generateVersionedPackageJson(): Promise<void> {
    this.logger.info('📦 生成版本化package.json...');
    
    const sourcePackageJson = await fs.readJson(path.join(this.config.sourceDir, 'package.json'));
    
    const publicPackageJson = {
      name: 'mplp-protocol',
      version: this.config.version,
      description: 'Multi-Agent Project Lifecycle Protocol - L4 Intelligent Agent Operating System - Open Source Implementation',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      exports: {
        '.': {
          import: './dist/index.js',
          require: './dist/index.js',
          types: './dist/index.d.ts'
        }
      },
      files: [
        'dist/**/*',
        'src/**/*',
        'docs/**/*',
        'examples/**/*',
        'README.md',
        'LICENSE',
        'CHANGELOG.md'
      ],
      scripts: {
        build: 'tsc',
        test: 'jest',
        'test:coverage': 'jest --coverage',
        prepublishOnly: 'npm run build'
      },
      keywords: [
        'mplp',
        'multi-agent',
        'protocol',
        'lifecycle',
        'ai',
        'agent',
        'collaboration',
        'workflow'
      ],
      author: 'Coregentis',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/Coregentis/MPLP-Protocol.git'
      },
      bugs: {
        url: 'https://github.com/Coregentis/MPLP-Protocol/issues'
      },
      homepage: 'https://github.com/Coregentis/MPLP-Protocol#readme',
      dependencies: {
        // 只包含运行时必需的依赖
        'ajv': sourcePackageJson.dependencies?.ajv || '^8.12.0',
        'uuid': sourcePackageJson.dependencies?.uuid || '^9.0.0'
      },
      devDependencies: {
        '@types/node': sourcePackageJson.devDependencies?.['@types/node'] || '^20.0.0',
        '@types/uuid': sourcePackageJson.devDependencies?.['@types/uuid'] || '^9.0.0',
        'typescript': sourcePackageJson.devDependencies?.typescript || '^5.0.4',
        'jest': sourcePackageJson.devDependencies?.jest || '^29.5.0',
        '@types/jest': sourcePackageJson.devDependencies?.['@types/jest'] || '^29.5.0',
        'ts-jest': sourcePackageJson.devDependencies?.['ts-jest'] || '^29.1.0'
      },
      engines: {
        node: '>=18.0.0',
        npm: '>=8.0.0'
      }
    };
    
    await fs.writeJson(
      path.join(this.versionDir, 'package.json'), 
      publicPackageJson, 
      { spaces: 2 }
    );
  }

  /**
   * 4. 复制和生成文档
   */
  private async copyDocumentation(): Promise<void> {
    this.logger.info('📚 复制和生成文档...');
    
    // 复制现有文档
    const docFiles = [
      'LICENSE',
      'SECURITY.md',
      'CONTRIBUTING.md'
    ];
    
    for (const file of docFiles) {
      const sourcePath = path.join(this.config.sourceDir, file);
      const targetPath = path.join(this.versionDir, file);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
      }
    }
    
    // 生成开源版本的README.md
    await this.generatePublicReadme();
    
    // 生成CHANGELOG.md
    await this.generateChangelog();
    
    // 复制API文档
    const docsDir = path.join(this.config.sourceDir, 'docs');
    if (await fs.pathExists(docsDir)) {
      await fs.copy(docsDir, path.join(this.versionDir, 'docs'), {
        filter: (src) => {
          // 只复制公开文档
          return !src.includes('internal') && 
                 !src.includes('private') &&
                 !src.includes('dev-');
        }
      });
    }
  }

  /**
   * 生成开源版本的README.md
   */
  private async generatePublicReadme(): Promise<void> {
    const readme = `# MPLP Protocol v${this.config.version}

## 🎯 Overview

MPLP (Multi-Agent Project Lifecycle Protocol - L4 Intelligent Agent Operating System) is an open-source protocol designed for multi-agent collaboration and project lifecycle management. This protocol provides a standardized way for AI agents to collaborate on complex tasks through structured workflows.

## 🚀 Features

- **Multi-Agent Collaboration**: Coordinate multiple AI agents working on the same project
- **Lifecycle Management**: Complete project lifecycle from planning to delivery
- **Schema-Driven**: JSON Schema-based validation and type safety
- **Vendor Neutral**: Works with any AI agent implementation
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## 📦 Installation

\`\`\`bash
npm install mplp-protocol
\`\`\`

## 🔧 Quick Start

\`\`\`typescript
import { MPLPOrchestrator, Context, Plan } from 'mplp-protocol';

// Initialize the orchestrator
const orchestrator = new MPLPOrchestrator();

// Create a context for multi-agent collaboration
const context = await orchestrator.createContext({
  sessionId: 'session-123',
  agentId: 'agent-1',
  configuration: {
    maxAgents: 5,
    timeout: 30000
  }
});

// Create a plan
const plan = await orchestrator.createPlan({
  contextId: context.id,
  title: 'Example Project',
  description: 'A sample multi-agent project',
  tasks: [
    {
      id: 'task-1',
      title: 'Analysis',
      description: 'Analyze requirements'
    }
  ]
});
\`\`\`

## 📚 Documentation

- [Getting Started](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Architecture Guide](./docs/architecture.md)
- [Examples](./examples/)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Coregentis/MPLP-Protocol)
- [Issues](https://github.com/Coregentis/MPLP-Protocol/issues)
- [Documentation](https://github.com/Coregentis/MPLP-Protocol/tree/main/docs)

## 📊 Version

Current version: **v${this.config.version}**

Built with ❤️ by the Coregentis team.
`;

    await fs.writeFile(path.join(this.versionDir, 'README.md'), readme);
  }

  /**
   * 生成CHANGELOG.md
   */
  private async generateChangelog(): Promise<void> {
    const changelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [${this.config.version}] - ${new Date().toISOString().split('T')[0]}

### Added
- Complete MPLP protocol implementation
- Multi-agent collaboration support
- Schema-driven development approach
- TypeScript support with strict type checking
- Comprehensive test suite
- CircleCI CI/CD integration
- Automated release management

### Features
- Context management for multi-agent sessions
- Plan creation and execution
- Confirmation workflows
- Trace monitoring and analysis
- Role-based access control
- Extension system for custom functionality

### Technical
- Domain-Driven Design (DDD) architecture
- Vendor-neutral adapter pattern
- Performance optimization
- Comprehensive error handling
- Security best practices
- Complete documentation

---

For more details, see the [GitHub releases](https://github.com/Coregentis/MPLP-Protocol/releases).
`;

    await fs.writeFile(path.join(this.versionDir, 'CHANGELOG.md'), changelog);
  }

  /**
   * 5. 复制示例代码
   */
  private async copyExamples(): Promise<void> {
    this.logger.info('📝 生成示例代码...');

    const examplesDir = path.join(this.versionDir, 'examples');

    // 基础使用示例
    const basicExample = `/**
 * Basic MPLP Usage Example
 */

import { MPLPOrchestrator, CreateContextRequest, CreatePlanRequest } from 'mplp-protocol';

async function basicExample() {
  // Initialize orchestrator
  const orchestrator = new MPLPOrchestrator();

  // Create context
  const contextRequest: CreateContextRequest = {
    sessionId: 'example-session-001',
    agentId: 'agent-001',
    configuration: {
      maxAgents: 3,
      timeout: 30000,
      retryPolicy: 'exponential'
    }
  };

  const context = await orchestrator.createContext(contextRequest);
  console.log('Context created:', context.id);

  // Create plan
  const planRequest: CreatePlanRequest = {
    contextId: context.id,
    title: 'Example Project',
    description: 'A basic example project',
    tasks: [
      {
        id: 'task-1',
        title: 'Initialize',
        description: 'Initialize the project'
      },
      {
        id: 'task-2',
        title: 'Execute',
        description: 'Execute the main logic'
      }
    ]
  };

  const plan = await orchestrator.createPlan(planRequest);
  console.log('Plan created:', plan.id);

  return { context, plan };
}

// Run the example
basicExample()
  .then(result => console.log('Example completed successfully:', result))
  .catch(error => console.error('Example failed:', error));
`;

    await fs.writeFile(path.join(examplesDir, 'basic-usage.ts'), basicExample);

    // 高级使用示例
    const advancedExample = `/**
 * Advanced MPLP Usage Example
 * Demonstrates multi-agent collaboration
 */

import {
  MPLPOrchestrator,
  WorkflowManager,
  CreateContextRequest,
  CreatePlanRequest,
  CreateConfirmRequest,
  CreateTraceRequest
} from 'mplp-protocol';

async function advancedExample() {
  const orchestrator = new MPLPOrchestrator();
  const workflowManager = new WorkflowManager();

  // Create multi-agent context
  const contextRequest: CreateContextRequest = {
    sessionId: 'advanced-session-001',
    agentId: 'coordinator-agent',
    configuration: {
      maxAgents: 5,
      timeout: 60000,
      retryPolicy: 'exponential',
      collaborationMode: 'parallel'
    }
  };

  const context = await orchestrator.createContext(contextRequest);

  // Create collaborative plan
  const planRequest: CreatePlanRequest = {
    contextId: context.id,
    title: 'Multi-Agent Collaboration Project',
    description: 'Complex project requiring multiple agents',
    tasks: [
      {
        id: 'analysis-task',
        title: 'Requirements Analysis',
        description: 'Analyze project requirements',
        assignedAgent: 'analyst-agent',
        dependencies: []
      },
      {
        id: 'design-task',
        title: 'System Design',
        description: 'Design system architecture',
        assignedAgent: 'architect-agent',
        dependencies: ['analysis-task']
      },
      {
        id: 'implementation-task',
        title: 'Implementation',
        description: 'Implement the solution',
        assignedAgent: 'developer-agent',
        dependencies: ['design-task']
      }
    ]
  };

  const plan = await orchestrator.createPlan(planRequest);

  // Execute workflow
  const workflowResult = await workflowManager.executeWorkflow({
    contextId: context.id,
    planId: plan.id,
    mode: 'collaborative'
  });

  console.log('Advanced workflow completed:', workflowResult);
  return workflowResult;
}

advancedExample()
  .then(result => console.log('Advanced example completed:', result))
  .catch(error => console.error('Advanced example failed:', error));
`;

    await fs.writeFile(path.join(examplesDir, 'advanced-usage.ts'), advancedExample);

    // 快速开始示例
    const quickStartExample = `/**
 * Quick Start Example
 * Get up and running with MPLP in minutes
 */

import { MPLPOrchestrator } from 'mplp-protocol';

async function quickStart() {
  // 1. Create orchestrator
  const orchestrator = new MPLPOrchestrator();

  // 2. Create context
  const context = await orchestrator.createContext({
    sessionId: 'quick-start-session',
    agentId: 'my-agent',
    configuration: { maxAgents: 1, timeout: 10000 }
  });

  // 3. Create simple plan
  const plan = await orchestrator.createPlan({
    contextId: context.id,
    title: 'Quick Start Project',
    description: 'My first MPLP project',
    tasks: [{ id: 'hello', title: 'Say Hello', description: 'Print hello world' }]
  });

  // 4. Execute
  console.log('🎉 MPLP Quick Start Success!');
  console.log('Context ID:', context.id);
  console.log('Plan ID:', plan.id);

  return { context, plan };
}

quickStart();
`;

    await fs.writeFile(path.join(examplesDir, 'quick-start.ts'), quickStartExample);

    // 示例README
    const examplesReadme = `# MPLP Protocol Examples

This directory contains examples demonstrating how to use the MPLP Protocol.

## Examples

### 1. Quick Start (\`quick-start.ts\`)
The fastest way to get started with MPLP. Creates a simple context and plan.

\`\`\`bash
npx ts-node examples/quick-start.ts
\`\`\`

### 2. Basic Usage (\`basic-usage.ts\`)
Demonstrates basic MPLP concepts including context creation and plan management.

\`\`\`bash
npx ts-node examples/basic-usage.ts
\`\`\`

### 3. Advanced Usage (\`advanced-usage.ts\`)
Shows advanced features like multi-agent collaboration and workflow management.

\`\`\`bash
npx ts-node examples/advanced-usage.ts
\`\`\`

## Prerequisites

Make sure you have the required dependencies installed:

\`\`\`bash
npm install mplp-protocol
npm install -D typescript ts-node @types/node
\`\`\`

## Running Examples

1. Install dependencies
2. Run any example using \`npx ts-node examples/<example-name>.ts\`
3. Check the console output for results

## Need Help?

- Check the [API Reference](../docs/api-reference.md)
- Read the [Getting Started Guide](../docs/getting-started.md)
- Visit our [GitHub Repository](https://github.com/Coregentis/MPLP-Protocol)
`;

    await fs.writeFile(path.join(examplesDir, 'README.md'), examplesReadme);
  }

  /**
   * 6. 生成类型定义
   */
  private async generateTypeDefinitions(): Promise<void> {
    this.logger.info('🔧 生成类型定义...');

    // 创建主入口文件
    const indexContent = `/**
 * MPLP Protocol v${this.config.version}
 * Multi-Agent Project Lifecycle Protocol - L4 Intelligent Agent Operating System
 */

// Core exports
export { MPLPOrchestrator } from './core/orchestrator/core-orchestrator';
export { WorkflowManager } from './core/workflow/workflow-manager';

// Module exports
export * from './modules/context';
export * from './modules/plan';
export * from './modules/confirm';
export * from './modules/trace';
export * from './modules/role';
export * from './modules/extension';

// Shared types
export * from './shared/types';

// Utilities
export * from './utils';

// Version info
export const VERSION = '${this.config.version}';
`;

    await fs.writeFile(path.join(this.versionDir, 'src/index.ts'), indexContent);

    // 创建TypeScript配置
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
    };

    await fs.writeJson(path.join(this.versionDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

    // 创建Jest配置
    const jestConfig = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
`;

    await fs.writeFile(path.join(this.versionDir, 'jest.config.js'), jestConfig);
  }

  /**
   * 7. 修复路径问题
   */
  private async fixReleasePaths(): Promise<void> {
    this.logger.info('🔧 修复发布版本路径...');

    try {
      // 动态导入路径修复器
      const { ReleasePathFixer } = await import('./fix-release-paths');
      const pathFixer = new ReleasePathFixer(this.versionDir);
      await pathFixer.fixAllPaths();

    } catch (error) {
      this.logger.error('路径修复失败:', error);
      throw error;
    }
  }

  /**
   * 8. 创建发布归档
   */
  private async createReleaseArchive(): Promise<void> {
    this.logger.info('📦 创建发布归档...');

    try {
      const archiveName = `mplp-protocol-v${this.config.version}.tar.gz`;
      const archivePath = path.join(this.config.releasesDir, archiveName);

      // 使用tar命令创建归档
      execSync(`tar -czf "${archivePath}" -C "${this.versionDir}" .`, {
        stdio: 'inherit'
      });

      this.logger.info(`✅ 归档创建成功: ${archiveName}`);
    } catch (error) {
      this.logger.warn('⚠️ 归档创建失败，但构建继续:', error);
    }
  }

  /**
   * 9. 验证构建结果
   */
  private async validateBuild(): Promise<void> {
    this.logger.info('🔍 验证构建结果...');

    const requiredFiles = [
      'package.json',
      'README.md',
      'CHANGELOG.md',
      'LICENSE',
      'src/index.ts',
      'tsconfig.json',
      'jest.config.js'
    ];

    const requiredDirs = [
      'src/core',
      'src/modules',
      'src/schemas',
      'src/shared/types',
      'src/utils',
      'docs',
      'examples'
    ];

    // 验证必需文件
    for (const file of requiredFiles) {
      const filePath = path.join(this.versionDir, file);
      if (!await fs.pathExists(filePath)) {
        throw new Error(`必需文件缺失: ${file}`);
      }
    }

    // 验证必需目录
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.versionDir, dir);
      if (!await fs.pathExists(dirPath)) {
        throw new Error(`必需目录缺失: ${dir}`);
      }
    }

    // 验证package.json
    const packageJson = await fs.readJson(path.join(this.versionDir, 'package.json'));
    if (packageJson.version !== this.config.version) {
      throw new Error(`版本号不匹配: 期望 ${this.config.version}, 实际 ${packageJson.version}`);
    }

    this.logger.info('✅ 构建验证通过');
  }
}

// CLI支持
if (require.main === module) {
  const args = process.argv.slice(2);
  const createArchive = args.includes('--archive');
  const version = args.find(arg => !arg.startsWith('--')) || '1.0.0';

  const config: VersionedBuildConfig = {
    version,
    sourceDir: path.resolve('.'),
    releasesDir: path.resolve('releases'),
    includeTests: false,
    includeDocs: true,
    createArchive
  };

  const builder = new VersionedReleaseBuilder(config);

  builder.buildVersionedRelease()
    .then(() => {
      console.log(`🎉 版本 v${version} 构建完成！`);
      console.log(`📁 发布目录: releases/v${version}`);
      if (createArchive) {
        console.log(`📦 归档文件: releases/mplp-protocol-v${version}.tar.gz`);
      }
    })
    .catch(error => {
      console.error('❌ 构建失败:', error);
      process.exit(1);
    });
}
