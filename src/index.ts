/**
 * MPLP v1.0 主入口文件
 * 
 * @version v1.0.0
 * @created 2025-07-09T21:00:00+08:00
 * @compliance .cursor/rules/technical-standards.mdc - TypeScript严格模式
 * @compliance .cursor/rules/core-modules.mdc - 6个核心模块集成
 */

import 'reflect-metadata';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { createServer } from '@/server';
import { Server } from 'http';

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

    // 创建Express应用
    const app = await createServer();
    
    // 创建HTTP服务器
    const server: Server = app.listen(config.server.port, () => {
      logger.info(`✅ MPLP服务器启动成功`, {
        port: config.server.port,
        environment: config.app.environment,
        tracepilot_enabled: config.tracepilot.integration.enabled
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

    process.on('SIGINT', async () => {
      logger.info('📥 接收到SIGINT信号，开始优雅关闭...');
      server.close(() => {
        logger.info('✅ 服务器已关闭');
        process.exit(0);
      });
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
    logger.error('❌ 服务器启动失败', { error: errorMessage });
    process.exit(1);
  }
}

// 启动应用程序
bootstrap().catch(error => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown fatal error';
  console.error('💥 应用程序启动致命错误:', errorMessage);
  process.exit(1);
}); 