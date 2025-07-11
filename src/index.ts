/**
 * MPLP Core Index - Multi-Agent Project Lifecycle Protocol
 * 
 * 🎯 Schema驱动开发核心原则（2025-07-10T13:28:12+08:00 新增）:
 * 
 * 1. 📖 Schema为绝对核心: 所有开发必须严格遵循 src/schemas/*.json 定义
 * 2. 🔍 开发前必读Schema: 确认字段名称、类型结构、枚举值100%匹配
 * 3. 🚫 严禁Schema偏离: 禁止使用与Schema不符的字段名或类型
 * 4. ✅ 强制验证流程: 所有代码必须通过Schema验证工具检查
 * 
 * 参考规则: .cursor/rules/schema-driven-development.mdc
 * Schema文件: src/schemas/[context|plan|confirm|trace|role|extension]-protocol.json
 * 
 * @version 1.0.1
 * @updated 2025-07-10T13:28:12+08:00
 */

import 'reflect-metadata';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { createServer } from '@/server';
import { Server } from 'http';

/**
 * 应用程序启动函数
 * 
 * @version v1.0.1 - 新增Plan模块失败恢复机制和TracePilot增强集成
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 启动MPLP v1.0服务器...', {
      version: config.app.version,
      environment: config.app.environment,
      port: config.server.port,
      plan_failure_resolver: true, // 🆕 Plan模块失败恢复功能
      tracepilot_enhanced: true    // 🆕 TracePilot增强版适配器
    });

    // 创建Express应用
    const app = await createServer();
    
    // 创建HTTP服务器
    const server: Server = app.listen(config.server.port, () => {
      logger.info(`✅ MPLP服务器启动成功`, {
        port: config.server.port,
        environment: config.app.environment,
        tracepilot_enabled: config.tracepilot.integration.enabled,
        tracepilot_version: 'enhanced', // 🆕 使用增强版适配器
        plan_module_features: {
          basic_planning: true,
          failure_resolver: true,      // 🆕 失败恢复机制
          batch_recovery: true,        // 🆕 批量恢复处理
          intelligent_tracking: true   // 🆕 智能任务追踪
        }
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
          logger.error('❌ 服务器启动失败', { 
      error: errorMessage,
      plan_module_status: 'failure_resolver_available',
      tracepilot_status: 'enhanced_adapter_ready'
    });
    process.exit(1);
  }
}

// 启动应用程序
bootstrap().catch(error => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown fatal error';
  console.error('💥 应用程序启动致命错误:', errorMessage);
  process.exit(1);
}); 