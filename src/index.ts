/**
 * MPLP Core Index - Multi-Agent Project Lifecycle Protocol - L4 Intelligent Agent Operating System - 厂商中立设计
 * 
 * 应用程序入口点，负责启动服务器和配置基础设施。
 * 
 * 🎯 Schema驱动开发核心原则:
 * 
 * 1. 📖 Schema为绝对核心: 所有开发必须严格遵循 src/schemas/*.json 定义
 * 2. 🔍 开发前必读Schema: 确认字段名称、类型结构、枚举值100%匹配
 * 3. 🚫 严禁Schema偏离: 禁止使用与Schema不符的字段名或类型
 * 4. ✅ 强制验证流程: 所有代码必须通过Schema验证工具检查
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 * @compliance .cursor/rules/schema-driven-development.mdc - Schema驱动开发原则
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */

import 'reflect-metadata';
import { config } from './config';
import { Logger } from './public/utils/logger';
import { createServer } from './server';
import { Server } from 'http';
import { AppDataSource } from './database/data-source';

// 创建应用程序Logger实例
const logger = new Logger('MPLP-App');

/**
 * 应用程序启动函数
 * 
 * 负责初始化和启动MPLP服务器，配置错误处理和优雅关闭
 * 
 * @version v1.0.3 - 新增Plan模块失败恢复机制和增强型追踪适配器集成
 * @returns Promise<void>
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 启动MPLP v1.0服务器...', {
      version: config.app.version,
      environment: config.app.environment,
      port: config.server.port,
      plan_failure_resolver: true, // 🆕 Plan模块失败恢复功能
      trace_adapter_enhanced: true // 🆕 增强版追踪适配器
    });

    // 初始化数据库连接
    logger.info('📦 初始化数据库连接...');
    await initializeDatabase();

    // 创建Express应用
    const app = await createServer();
    
    // 创建HTTP服务器
    const server: Server = app.listen(config.server.port, () => {
      logger.info('✅ MPLP服务器启动成功', {
        port: config.server.port,
        environment: config.app.environment,
        trace_adapter_enabled: config.traceAdapter.integration.enabled,
        trace_adapter_version: 'enhanced', // 🆕 使用增强版适配器
        plan_module_features: {
          basic_planning: true,
          failure_resolver: true,      // 🆕 失败恢复机制
          batch_recovery: true,        // 🆕 批量恢复处理
          intelligent_tracking: true   // 🆕 智能任务追踪
        }
      });
    });

    // 配置优雅关闭处理
    configureGracefulShutdown(server);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
    logger.error('❌ 服务器启动失败', { 
      error: errorMessage,
      plan_module_status: 'failure_resolver_available',
      trace_adapter_status: 'enhanced_adapter_ready'
    });
    process.exit(1);
  }
}

/**
 * 初始化数据库连接
 * 
 * @returns Promise<void>
 */
async function initializeDatabase(): Promise<void> {
  try {
    // 初始化数据源
    await AppDataSource.initialize();
    logger.info('✅ 数据库连接初始化成功', {
      isInitialized: AppDataSource.isInitialized,
      driver: 'sqlite',
      database: 'in-memory'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    logger.error('❌ 数据库连接初始化失败', { error: errorMessage });
    throw new Error(`数据库连接初始化失败: ${errorMessage}`);
  }
}

/**
 * 配置优雅关闭处理
 * 
 * @param server HTTP服务器实例
 */
function configureGracefulShutdown(server: Server): void {
  // SIGTERM信号处理
  process.on('SIGTERM', async () => {
    logger.info('📥 接收到SIGTERM信号，开始优雅关闭...');
    await gracefulShutdown(server);
  });

  // SIGINT信号处理
  process.on('SIGINT', async () => {
    logger.info('📥 接收到SIGINT信号，开始优雅关闭...');
    await gracefulShutdown(server);
  });
}

/**
 * 执行优雅关闭流程
 * 
 * @param server HTTP服务器实例
 */
async function gracefulShutdown(server: Server): Promise<void> {
  try {
    // 关闭HTTP服务器
    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('✅ HTTP服务器已关闭');
        resolve();
      });
    });

    // 关闭数据库连接
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('✅ 数据库连接已关闭');
    }
    
    logger.info('✅ 所有资源已清理完毕');
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown shutdown error';
    logger.error('❌ 服务器关闭过程中出错', { error: errorMessage });
    process.exit(1);
  }
}

// 启动应用程序
bootstrap().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown fatal error';
  logger.error('💥 应用程序启动致命错误', { error: errorMessage });
  process.exit(1);
}); 