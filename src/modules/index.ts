/**
 * MPLP v1.0 - Complete 10-Module Export Index
 *
 * 统一导出所有10个MPLP模块，提供完整的L4智能体操作系统功能
 *
 * 🎯 模块架构:
 *
 * 📋 核心协议模块 (6个):
 * - Context: 上下文管理和生命周期
 * - Plan: 规划和任务编排
 * - Confirm: 审批和确认工作流
 * - Trace: 监控和事件追踪
 * - Role: RBAC和权限管理
 * - Extension: 插件和扩展管理
 *
 * 🤖 L4智能体模块 (3个):
 * - Collab: 多智能体协作和决策
 * - Dialog: 对话驱动开发和记忆
 * - Network: 智能体网络拓扑和路由
 *
 * ⚙️ 核心协调模块 (1个):
 * - Core: 工作流编排和模块协调
 *
 * @version 1.0.0
 * @created 2025-08-02T20:00:00+08:00
 * @updated 2025-08-04T00:00:00+08:00
 * @compliance Schema驱动开发原则
 * @compliance DDD架构标准
 */

// ===== 模块重新导出 =====
// 为了避免类型冲突，我们使用命名空间方式导出

import * as ContextModule from './context';
import * as PlanModule from './plan';
import * as ConfirmModule from './confirm';
import * as TraceModule from './trace';
import * as RoleModule from './role';
import * as ExtensionModule from './extension';
import * as CollabModule from './collab';
import * as DialogModule from './dialog';
import * as NetworkModule from './network';

export {
  ContextModule,
  PlanModule,
  ConfirmModule,
  TraceModule,
  RoleModule,
  ExtensionModule,
  CollabModule,
  DialogModule,
  NetworkModule,
};

// ===== 模块类型定义 =====

export interface MPLPModuleServices {
  contextService: any;
  planService: any;
  confirmService: any;
  traceService: any;
  roleService: any;
  extensionService: any;
  collabService: any;
  dialogService: any;
  networkService: any;
}

// ===== 模块初始化函数 =====

/**
 * 初始化所有MPLP模块
 *
 * @returns Promise<MPLPModuleServices> 所有模块服务的集合
 */
export async function initializeAllModules(): Promise<MPLPModuleServices> {
  // 注意：这里需要实际的模块初始化逻辑
  // 目前返回模拟的服务实例，实际使用时需要替换为真实的初始化逻辑
  return {
    contextService: null, // 需要实际的初始化逻辑
    planService: null,
    confirmService: null,
    traceService: null,
    roleService: null,
    extensionService: null,
    collabService: null,
    dialogService: null,
    networkService: null,
  };
}

/**
 * 模块信息常量 - MPLP v1.0 十模块标准定义
 */
export const MPLP_MODULES = {
  CORE_PROTOCOLS: ['context', 'plan', 'confirm', 'trace', 'role', 'extension'],
  L4_AGENTS: ['collab', 'dialog', 'network'],
  COORDINATOR: ['core'],
  ALL_MODULES: [
    'context',
    'plan',
    'confirm',
    'trace',
    'role',
    'extension',
    'collab',
    'dialog',
    'network',
    'core',
  ],
  TOTAL_COUNT: 10,
  VERSION: '1.0.0',
} as const;
