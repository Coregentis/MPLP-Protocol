"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION_INFO = exports.MPLP_INFO = exports.MPLP_CAPABILITIES = exports.MPLP_PROJECT_NAME = exports.MPLP_STATUS = exports.MPLP_PROTOCOL_VERSION = exports.MPLP_VERSION = exports.createTestMPLP = exports.createProductionMPLP = exports.quickStart = exports.createMPLP = exports.MPLP = void 0;
// ===== 主类和工厂函数导出 =====
var mplp_1 = require("./core/mplp");
Object.defineProperty(exports, "MPLP", { enumerable: true, get: function () { return mplp_1.MPLP; } });
var factory_1 = require("./core/factory");
Object.defineProperty(exports, "createMPLP", { enumerable: true, get: function () { return factory_1.createMPLP; } });
Object.defineProperty(exports, "quickStart", { enumerable: true, get: function () { return factory_1.quickStart; } });
Object.defineProperty(exports, "createProductionMPLP", { enumerable: true, get: function () { return factory_1.createProductionMPLP; } });
Object.defineProperty(exports, "createTestMPLP", { enumerable: true, get: function () { return factory_1.createTestMPLP; } });
// ===== 版本信息 =====
exports.MPLP_VERSION = '1.1.0-beta';
exports.MPLP_PROTOCOL_VERSION = 'L1-L3';
exports.MPLP_STATUS = 'Production Ready';
exports.MPLP_PROJECT_NAME = 'Multi-Agent Protocol Lifecycle Platform';
exports.MPLP_CAPABILITIES = [
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
exports.MPLP_INFO = {
    name: 'MPLP',
    version: '1.1.0-beta',
    fullName: 'Multi-Agent Protocol Lifecycle Platform',
    description: 'L1-L3 Protocol Stack for Multi-Agent Systems with Complete SDK Ecosystem',
    architecture: 'L1-L3 Layered Architecture',
    status: 'Production Ready',
    modules: [
        'context', // Context management and lifecycle
        'plan', // Planning and task orchestration
        'role', // Role-based access control
        'confirm', // Approval and confirmation workflows
        'trace', // Monitoring and event tracking
        'extension', // Plugin and extension management
        'dialog', // Dialog-driven development and memory
        'collab', // Multi-agent collaboration and decision-making
        'core', // Runtime orchestrator and coordinator
        'network' // Agent network topology and routing
    ],
    capabilities: exports.MPLP_CAPABILITIES,
    license: 'MIT',
    repository: 'https://github.com/Coregentis/MPLP-Protocol',
    documentation: 'https://github.com/Coregentis/MPLP-Protocol/tree/main/docs'
};
// ===== 版本兼容性 =====
exports.VERSION_INFO = {
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
};
// ===== 默认导出 =====
exports.default = {
    MPLP_VERSION: exports.MPLP_VERSION,
    MPLP_PROTOCOL_VERSION: exports.MPLP_PROTOCOL_VERSION,
    MPLP_STATUS: exports.MPLP_STATUS,
    MPLP_PROJECT_NAME: exports.MPLP_PROJECT_NAME,
    MPLP_CAPABILITIES: exports.MPLP_CAPABILITIES,
    MPLP_INFO: exports.MPLP_INFO,
    VERSION_INFO: exports.VERSION_INFO
};
//# sourceMappingURL=index.js.map