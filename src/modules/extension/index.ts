/**
 * MPLP Extension模块主入口
 * 
 * @description Extension模块的统一导出入口，提供扩展管理和插件协调功能
 * @version 1.0.0
 * @module L2协调层 - Extension模块
 * @architecture 统一DDD架构 + L3管理器集成模式
 * @status ✅ 实现中 - 基于实际Schema重构
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/extension.controller';
export * from './api/dto/extension.dto';
export * from './api/mappers/extension.mapper';

// 应用层 - 3个核心服务
export * from './application/services/extension-management.service';
export * from './application/services/extension-analytics.service';
export * from './application/services/extension-security.service';

// 领域层
export * from './domain/entities/extension.entity';
export * from './domain/repositories/extension.repository.interface';

// 基础设施层
export * from './infrastructure/repositories/extension.repository';
export * from './infrastructure/protocols/extension.protocol';
export * from './infrastructure/factories/extension-protocol.factory';

// ===== 模块集成 =====
export * from './module';

// ===== 类型定义导出 =====
export * from './types';

/**
 * Extension模块信息
 */
export const EXTENSION_MODULE_INFO = {
  name: 'extension',
  version: '1.0.0',
  description: 'MPLP扩展管理和插件协调模块',
  layer: 'L2',
  status: 'implementing',
  features: [
    '扩展生命周期管理',
    '插件协调',
    '扩展点管理',
    'API扩展',
    '事件订阅',
    '安全沙箱',
    '资源限制',
    '代码签名',
    '权限管理',
    '性能监控',
    '版本历史',
    '搜索元数据',
    '事件集成',
    '审计追踪'
  ],
  dependencies: [
    'security',
    'performance',
    'eventBus',
    'errorHandler',
    'coordination',
    'orchestration',
    'sandboxing',
    'resourceManagement',
    'protocolVersion'
  ]
} as const;
