/**
 * MPLP Context模块主入口
 * 
 * @description Context模块的统一导出入口，提供上下文和全局状态管理功能
 * @version 1.0.0
 * @module L2协调层 - Context模块
 * @architecture 统一DDD架构 + L3管理器集成模式
 * @status ✅ 实现中 - 基于实际Schema重构
 */

// ===== DDD架构层导出 =====

// API层
export * from './api/controllers/context.controller';
export * from './api/dto/context.dto';
export * from './api/mappers/context.mapper';

// 应用层
export * from './application/services/context-management.service';

// 领域层
export * from './domain/entities/context.entity';
export * from './domain/repositories/context-repository.interface';

// 基础设施层
export * from './infrastructure/repositories/context.repository';
export * from './infrastructure/protocols/context.protocol.js';
export * from './infrastructure/factories/context-protocol.factory.js';

// ===== 适配器导出 =====
export { ContextModuleAdapter } from './infrastructure/adapters/context-module.adapter';

// ===== 模块集成 =====
export * from './module.js';

// ===== 类型定义导出 =====
export * from './types.js';

/**
 * Context模块信息
 */
export const CONTEXT_MODULE_INFO = {
  name: 'context',
  version: '1.0.0',
  description: 'MPLP上下文和全局状态管理模块',
  layer: 'L2',
  status: 'implementing',
  features: [
    '上下文管理',
    '状态同步', 
    '生命周期管理',
    '权限控制',
    '审计追踪',
    '性能监控',
    '版本历史',
    '搜索索引',
    '缓存策略',
    '同步配置',
    '错误处理',
    '集成接口',
    '事件集成'
  ],
  dependencies: [
    'security',
    'performance', 
    'eventBus',
    'errorHandler',
    'coordination',
    'orchestration',
    'stateSync',
    'transaction',
    'protocolVersion'
  ]
} as const;
