/**
 * MPLP v1.1.0-beta 主导出文件
 *
 * Multi-Agent Protocol Lifecycle Platform
 * L1-L3 协议栈统一导出 + SDK生态系统
 *
 * @version 1.1.0-beta
 * @architecture L1-L3 Protocol Stack
 * @status Production Ready
 * @created 2025-07-28
 * @updated 2025-10-21
 *
 * 使用说明:
 * - 主类导入: import { MPLP } from 'mplp'
 * - 工厂函数: import { createMPLP, quickStart } from 'mplp'
 * - 版本信息: import { MPLP_VERSION } from 'mplp'
 * - 模块导出: import { ContextManager } from 'mplp/context'
 * - 类型导出: import type { UUID } from 'mplp/types'
 * - 工具导出: import { generateUUID } from 'mplp/utils'
 *
 * 快速开始:
 * ```typescript
 * import { quickStart } from 'mplp';
 *
 * const mplp = await quickStart();
 * const contextModule = mplp.getModule('context');
 * ```
 */

// ===== 主类和工厂函数导出 =====
export { MPLP, MPLPConfig } from './core/mplp';
export {
  createMPLP,
  quickStart,
  createProductionMPLP,
  createTestMPLP
} from './core/factory';

// ===== 版本信息 =====
export const MPLP_VERSION = '1.1.0-beta';
export const MPLP_PROTOCOL_VERSION = 'L1-L3';
export const MPLP_STATUS = 'Production Ready';
export const MPLP_PROJECT_NAME = 'Multi-Agent Protocol Lifecycle Platform';
export const MPLP_CAPABILITIES = [
  'multi_agent_coordination',
  'workflow_orchestration',
  'lifecycle_management',
  'real_time_monitoring',
  'role_based_security',
  'extension_system',
  'vendor_neutral_design',
  'schema_driven_development'
];

// ===== 项目信息 =====
export const MPLP_INFO = {
  name: 'MPLP',
  version: '1.1.0-beta',
  fullName: 'Multi-Agent Protocol Lifecycle Platform',
  description: 'L1-L3 Protocol Stack for Multi-Agent Systems with Complete SDK Ecosystem',
  architecture: 'L1-L3 Layered Architecture',
  status: 'Production Ready',
  modules: [
    'context',   // Context management and lifecycle
    'plan',      // Planning and task orchestration
    'role',      // Role-based access control
    'confirm',   // Approval and confirmation workflows
    'trace',     // Monitoring and event tracking
    'extension', // Plugin and extension management
    'dialog',    // Dialog-driven development and memory
    'collab',    // Multi-agent collaboration and decision-making
    'core',      // Runtime orchestrator and coordinator
    'network'    // Agent network topology and routing
  ],
  capabilities: MPLP_CAPABILITIES,
  license: 'MIT',
  repository: 'https://github.com/Coregentis/MPLP-Protocol',
  documentation: 'https://github.com/Coregentis/MPLP-Protocol/tree/main/docs'
} as const;

// ===== 版本兼容性 =====
export const VERSION_INFO = {
  current: '1.1.0-beta',
  api_version: 'v1',
  schema_version: '1.1',
  protocol_version: 'L1-L3',
  compatibility: {
    node: '>=18.0.0',
    typescript: '>=5.0.0'
  },
  breaking_changes: [],
  deprecated_features: []
} as const;

// ===== 默认导出 =====
export default {
  MPLP_VERSION,
  MPLP_PROTOCOL_VERSION,
  MPLP_STATUS,
  MPLP_PROJECT_NAME,
  MPLP_CAPABILITIES,
  MPLP_INFO,
  VERSION_INFO
};
