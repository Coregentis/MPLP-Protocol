#!/usr/bin/env node

/**
 * MPLP项目重新初始化脚本
 * 
 * @version v2.2
 * @created 2025-07-09T21:00:00+08:00
 * @compliance .cursor/rules/development-workflow.mdc - 项目初始化流程
 * @compliance .cursor/rules/delivery-checklist.mdc - 质量门禁要求
 * @performance 初始化时间 <30秒，TracePilot连接 <5秒
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MPLPProjectReinitializer {
  constructor() {
    this.rootDir = process.cwd();
    this.startTime = Date.now();
    
    // 需要保留的关键文件和目录
    this.preserveItems = [
      // 治理层配置 (必须保留)
      '.cursor',
      '.cursor-rules',
      'ProjectRules',
      'PROJECT_GOVERNANCE_REPORT.md',
      'PROJECT_STATUS.md',
      'DEVELOPMENT_CHECKLIST.md',
      'GIT_WORKFLOW.md',
      
      // 项目基础配置
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.build.json',
      'jest.config.js',
      '.eslintrc.json',
      '.prettierrc.json',
      '.gitignore',
      '.env.example',
      'README.md',
      
      // Git和Husky
      '.git',
      '.husky',
      
      // Docker和K8s (可选保留)
      'docker',
      'k8s',
      'Dockerfile',
      'docker-compose.yml',
      
      // TracePilot核心集成
      'src/mcp',
      'trace',
      'versioning',
      
      // 脚本目录
      'scripts'
    ];
    
    // 需要清理的目录和文件
    this.cleanupItems = [
      'dist',
      'node_modules',
      'coverage',
      'tests',
      '.nyc_output'
    ];
  }

  /**
   * 执行完整的项目重新初始化流程
   */
  async reinitialize() {
    console.log('🚀 开始MPLP项目重新初始化...');
    console.log(`📋 Plan阶段: 清理旧文件，保留治理层配置`);
    
    try {
      // 1. 备份关键配置
      await this.backupCriticalConfigs();
      
      // 2. 清理旧文件
      await this.cleanupOldFiles();
      
      // 3. 重新安装依赖
      await this.reinstallDependencies();
      
      // 4. 创建核心目录结构
      await this.createCoreStructure();
      
      // 5. 恢复关键配置
      await this.restoreCriticalConfigs();
      
      // 6. 验证治理层配置
      await this.validateGovernanceLayer();
      
      const duration = Date.now() - this.startTime;
      console.log(`✅ 项目重新初始化完成! 耗时: ${duration}ms`);
      
      if (duration > 30000) {
        console.warn(`⚠️  初始化时间 ${duration}ms 超过目标 30秒`);
      }
      
      console.log('\n📊 下一步: 运行 npm run dev 启动开发服务器');
      console.log('🔗 TracePilot集成: 检查 src/mcp/tracepilot-adapter.ts');
      
    } catch (error) {
      console.error('❌ 项目重新初始化失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 备份关键配置文件
   */
  async backupCriticalConfigs() {
    console.log('📦 备份关键配置文件...');
    
    const backupDir = path.join(this.rootDir, '.backup-configs');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const criticalConfigs = [
      'package.json',
      'tsconfig.json',
      '.cursor-rules',
      'src/mcp/tracepilot-adapter.ts'
    ];
    
    criticalConfigs.forEach(configFile => {
      const srcPath = path.join(this.rootDir, configFile);
      if (fs.existsSync(srcPath)) {
        const backupPath = path.join(backupDir, configFile.replace('/', '_'));
        fs.copyFileSync(srcPath, backupPath);
        console.log(`  ✅ 备份: ${configFile}`);
      }
    });
  }

  /**
   * 清理旧文件和目录
   */
  async cleanupOldFiles() {
    console.log('🧹 清理旧文件和目录...');
    
    this.cleanupItems.forEach(item => {
      const itemPath = path.join(this.rootDir, item);
      if (fs.existsSync(itemPath)) {
        try {
          if (fs.lstatSync(itemPath).isDirectory()) {
            fs.rmSync(itemPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(itemPath);
          }
          console.log(`  🗑️  删除: ${item}`);
        } catch (error) {
          console.warn(`  ⚠️  无法删除 ${item}: ${error.message}`);
        }
      }
    });
    
    // 清理src目录中的旧模块文件，保留mcp目录
    const srcDir = path.join(this.rootDir, 'src');
    if (fs.existsSync(srcDir)) {
      const srcItems = fs.readdirSync(srcDir);
      srcItems.forEach(item => {
        if (item !== 'mcp' && item !== 'types') {
          const itemPath = path.join(srcDir, item);
          try {
            if (fs.lstatSync(itemPath).isDirectory()) {
              fs.rmSync(itemPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(itemPath);
            }
            console.log(`  🗑️  清理src: ${item}`);
          } catch (error) {
            console.warn(`  ⚠️  无法清理 src/${item}: ${error.message}`);
          }
        }
      });
    }
  }

  /**
   * 重新安装依赖
   */
  async reinstallDependencies() {
    console.log('📦 重新安装项目依赖...');
    
    try {
      console.log('  🔄 npm install...');
      execSync('npm install', { 
        stdio: 'inherit',
        cwd: this.rootDir 
      });
      
      console.log('  ✅ 依赖安装完成');
    } catch (error) {
      throw new Error(`依赖安装失败: ${error.message}`);
    }
  }

  /**
   * 创建核心目录结构
   */
  async createCoreStructure() {
    console.log('🏗️  创建核心目录结构...');
    
    const coreDirectories = [
      // 6个核心模块目录
      'src/modules/context',
      'src/modules/plan', 
      'src/modules/confirm',
      'src/modules/trace',
      'src/modules/role',
      'src/modules/extension',
      
      // 基础架构目录
      'src/types',
      'src/utils',
      'src/config',
      'src/middleware',
      'src/routes',
      'src/services',
      'src/repositories',
      
      // 测试目录
      'tests/unit',
      'tests/integration',
      'tests/e2e',
      'tests/mocks',
      
      // 数据库相关
      'src/database/entities',
      'src/database/migrations',
      'src/database/seeds',
      
      // API相关
      'src/api/rest',
      'src/api/graphql',
      'src/api/websocket',
      
      // 其他必要目录
      'logs',
      'tmp',
      'uploads'
    ];
    
    coreDirectories.forEach(dir => {
      const dirPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  📁 创建: ${dir}`);
      }
    });
    
    // 创建.gitkeep文件确保空目录被Git跟踪
    coreDirectories.forEach(dir => {
      const gitkeepPath = path.join(this.rootDir, dir, '.gitkeep');
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '# 此文件确保空目录被Git跟踪\n');
      }
    });
  }

  /**
   * 恢复关键配置文件
   */
  async restoreCriticalConfigs() {
    console.log('🔄 恢复关键配置文件...');
    
    // 确保重要配置文件存在并正确
    const configs = {
      'src/index.ts': this.generateMainIndexFile(),
      'src/config/index.ts': this.generateConfigFile(),
      'src/types/index.ts': this.generateTypesFile(),
      'tests/setup.ts': this.generateTestSetupFile()
    };
    
    Object.entries(configs).forEach(([filePath, content]) => {
      const fullPath = path.join(this.rootDir, filePath);
      fs.writeFileSync(fullPath, content);
      console.log(`  ✅ 创建: ${filePath}`);
    });
  }

  /**
   * 验证治理层配置
   */
  async validateGovernanceLayer() {
    console.log('🔍 验证治理层配置...');
    
    const requiredGovernanceFiles = [
      '.cursor-rules',
      '.cursor/rules/core-modules.mdc',
      '.cursor/rules/technical-standards.mdc',
      '.cursor/rules/trace-lifecycle.mdc',
      'ProjectRules/MPLP_ProjectRules.mdc',
      'src/mcp/tracepilot-adapter.ts'
    ];
    
    let allValid = true;
    
    requiredGovernanceFiles.forEach(file => {
      const filePath = path.join(this.rootDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ 验证: ${file}`);
      } else {
        console.error(`  ❌ 缺失: ${file}`);
        allValid = false;
      }
    });
    
    if (!allValid) {
      throw new Error('治理层配置文件验证失败，请检查缺失文件');
    }
    
    console.log('  🎯 治理层配置验证通过');
  }

  /**
   * 生成主入口文件
   */
  generateMainIndexFile() {
    return `/**
 * MPLP v1.0 主入口文件
 * 
 * @version v1.0.0
 * @created ${new Date().toISOString()}
 * @compliance .cursor/rules/technical-standards.mdc - TypeScript严格模式
 * @compliance .cursor/rules/core-modules.mdc - 6个核心模块集成
 */

import 'reflect-metadata';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { createServer } from '@/server';
import { TracePilotAdapter } from '@/mcp/tracepilot-adapter';

/**
 * 应用程序启动函数
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 启动MPLP v1.0服务器...', {
      version: config.app.version,
      environment: config.app.environment,
      port: config.server.port
    });

    // 初始化TracePilot连接
    const tracePilotAdapter = new TracePilotAdapter(config.tracepilot);
    logger.info('🔗 TracePilot适配器初始化完成');

    // 创建并启动服务器
    const server = await createServer();
    
    server.listen(config.server.port, () => {
      logger.info(\`✅ MPLP服务器启动成功\`, {
        port: config.server.port,
        environment: config.app.environment,
        tracepilot_enabled: true
      });
    });

    // 优雅关闭处理
    process.on('SIGTERM', async () => {
      logger.info('📥 接收到SIGTERM信号，开始优雅关闭...');
      server.close(() => {
        logger.info('✅ 服务器已关闭');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ 服务器启动失败', { error: error.message });
    process.exit(1);
  }
}

// 启动应用程序
bootstrap().catch(error => {
  console.error('💥 应用程序启动致命错误:', error);
  process.exit(1);
});
`;
  }

  /**
   * 生成配置文件
   */
  generateConfigFile() {
    return `/**
 * MPLP v1.0 配置管理
 * 
 * @compliance .cursor/rules/security-requirements.mdc - 敏感配置管理
 * @compliance .cursor/rules/integration-patterns.mdc - TracePilot配置
 */

import { config as dotenvConfig } from 'dotenv';

// 加载环境变量
dotenvConfig();

export const config = {
  app: {
    name: 'MPLP',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'mplp',
    username: process.env.DB_USERNAME || 'mplp',
    password: process.env.DB_PASSWORD || 'password',
    synchronize: process.env.NODE_ENV === 'development'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD
  },
  
  tracepilot: {
    apiUrl: process.env.TRACEPILOT_API_URL || 'http://localhost:8080',
    apiKey: process.env.TRACEPILOT_API_KEY || 'dev-key',
    timeout: parseInt(process.env.TRACEPILOT_TIMEOUT || '10000', 10),
    retryAttempts: parseInt(process.env.TRACEPILOT_RETRY || '3', 10),
    batchSize: parseInt(process.env.TRACEPILOT_BATCH_SIZE || '100', 10)
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'mplp-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};
`;
  }

  /**
   * 生成类型定义文件
   */
  generateTypesFile() {
    return `/**
 * MPLP v1.0 核心类型定义
 * 
 * @compliance .cursor/rules/technical-standards.mdc - TypeScript严格模式
 * @compliance .cursor/rules/core-modules.mdc - 6个核心模块类型
 */

// 基础协议接口
export interface BaseProtocol {
  version: string;
  timestamp: string;
}

// Context模块类型
export interface ContextProtocol extends BaseProtocol {
  context_id: string;
  user_id: string;
  shared_state: Record<string, unknown>;
  lifecycle_stage: 'active' | 'inactive' | 'suspended';
}

// Plan模块类型  
export interface PlanProtocol extends BaseProtocol {
  plan_id: string;
  context_id: string;
  tasks: TaskDefinition[];
  dependencies: DependencyMapping[];
  execution_strategy: 'sequential' | 'parallel' | 'conditional';
}

// Trace模块类型
export interface TraceProtocol extends BaseProtocol {
  trace_id: string;
  parent_trace_id?: string;
  context_id: string;
  trace_type: 'operation' | 'state_change' | 'error' | 'compensation';
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
  operation_name: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  performance_metrics: PerformanceMetrics;
  // TracePilot集成字段
  tracepilot_sync_id?: string;
  tracepilot_sync_status: 'pending' | 'synced' | 'failed';
}

// 性能指标类型
export interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage_mb: number;
  network_io_bytes: number;
  disk_io_bytes: number;
  db_query_count: number;
  db_query_time_ms: number;
  api_call_count: number;
  api_call_time_ms: number;
  custom_metrics: Record<string, number>;
}

// 其他必要类型
export interface TaskDefinition {
  task_id: string;
  task_name: string;
  parameters: Record<string, unknown>;
  estimated_duration: number;
}

export interface DependencyMapping {
  task_id: string;
  depends_on: string[];
  dependency_type: 'hard' | 'soft';
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  error_code?: string;
  timestamp: string;
  request_id: string;
  performance: {
    response_time_ms: number;
    trace_id: string;
    tracepilot_sync_id?: string;
  };
}
`;
  }

  /**
   * 生成测试配置文件
   */
  generateTestSetupFile() {
    return `/**
 * Jest测试环境配置
 * 
 * @compliance .cursor/rules/testing-strategy.mdc - 测试环境配置
 */

import 'reflect-metadata';

// 设置测试环境
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.DB_NAME = 'mplp_test';

// 模拟TracePilot适配器（测试环境）
jest.mock('../src/mcp/tracepilot-adapter', () => ({
  TracePilotAdapter: jest.fn().mockImplementation(() => ({
    syncTraceData: jest.fn().mockResolvedValue({
      success: true,
      sync_latency: 50,
      traces_synced: 1,
      errors: [],
      timestamp: new Date().toISOString()
    })
  }))
}));

// 全局测试配置
global.beforeEach(() => {
  jest.clearAllMocks();
});
`;
  }
}

// 执行重新初始化
if (require.main === module) {
  const reinitializer = new MPLPProjectReinitializer();
  reinitializer.reinitialize().catch(error => {
    console.error('💥 重新初始化失败:', error);
    process.exit(1);
  });
}

module.exports = { MPLPProjectReinitializer }; 