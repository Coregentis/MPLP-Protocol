/**
 * MPLP v1.0.0-alpha 主导出文件
 * 
 * Multi-Agent Protocol Lifecycle Platform
 * L1-L3 协议栈统一导出
 * 
 * @version 1.0.0-alpha
 * @architecture L1-L3 Protocol Stack
 * @status Production Ready
 * @created 2025-07-28
 * @updated 2025-09-04
 */

// ===== 版本信息 =====
export const MPLP_VERSION = '1.0.0-alpha';
export const MPLP_PROTOCOL_VERSION = 'L1-L3';
export const MPLP_STATUS = 'Production Ready';

// ===== 项目信息 =====
export const MPLP_INFO = {
  name: 'MPLP',
  version: '1.0.0-alpha',
  fullName: 'Multi-Agent Protocol Lifecycle Platform',
  description: 'L1-L3 Protocol Stack for Multi-Agent Systems',
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
  capabilities: [
    'multi_agent_coordination',
    'workflow_orchestration', 
    'lifecycle_management',
    'real_time_monitoring',
    'role_based_security',
    'extension_system',
    'vendor_neutral_design',
    'schema_driven_development'
  ],
  license: 'MIT',
  repository: 'https://github.com/mplp-org/mplp',
  documentation: 'https://docs.mplp.dev'
} as const;

// ===== 版本兼容性 =====
export const VERSION_INFO = {
  current: '1.0.0-alpha',
  api_version: 'v1',
  schema_version: '1.0',
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
  MPLP_INFO,
  VERSION_INFO
};
