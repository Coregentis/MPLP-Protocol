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
 * @updated 2025-10-16
 *
 * 使用说明:
 * - 主包导出: import { MPLP_VERSION } from 'mplp'
 * - 模块导出: import { ContextManager } from 'mplp/context'
 * - 类型导出: import type { UUID } from 'mplp/types'
 * - 工具导出: import { generateUUID } from 'mplp/utils'
 */
export declare const MPLP_VERSION = "1.1.0-beta";
export declare const MPLP_PROTOCOL_VERSION = "L1-L3";
export declare const MPLP_STATUS = "Production Ready";
export declare const MPLP_PROJECT_NAME = "Multi-Agent Protocol Lifecycle Platform";
export declare const MPLP_CAPABILITIES: string[];
export declare const MPLP_INFO: {
    readonly name: "MPLP";
    readonly version: "1.1.0-beta";
    readonly fullName: "Multi-Agent Protocol Lifecycle Platform";
    readonly description: "L1-L3 Protocol Stack for Multi-Agent Systems with Complete SDK Ecosystem";
    readonly architecture: "L1-L3 Layered Architecture";
    readonly status: "Production Ready";
    readonly modules: readonly ["context", "plan", "role", "confirm", "trace", "extension", "dialog", "collab", "core", "network"];
    readonly capabilities: string[];
    readonly license: "MIT";
    readonly repository: "https://github.com/Coregentis/MPLP-Protocol";
    readonly documentation: "https://github.com/Coregentis/MPLP-Protocol/tree/main/docs";
};
export declare const VERSION_INFO: {
    readonly current: "1.1.0-beta";
    readonly api_version: "v1";
    readonly schema_version: "1.1";
    readonly protocol_version: "L1-L3";
    readonly compatibility: {
        readonly node: ">=18.0.0";
        readonly typescript: ">=5.0.0";
    };
    readonly breaking_changes: readonly [];
    readonly deprecated_features: readonly [];
};
declare const _default: {
    MPLP_VERSION: string;
    MPLP_PROTOCOL_VERSION: string;
    MPLP_STATUS: string;
    MPLP_PROJECT_NAME: string;
    MPLP_CAPABILITIES: string[];
    MPLP_INFO: {
        readonly name: "MPLP";
        readonly version: "1.1.0-beta";
        readonly fullName: "Multi-Agent Protocol Lifecycle Platform";
        readonly description: "L1-L3 Protocol Stack for Multi-Agent Systems with Complete SDK Ecosystem";
        readonly architecture: "L1-L3 Layered Architecture";
        readonly status: "Production Ready";
        readonly modules: readonly ["context", "plan", "role", "confirm", "trace", "extension", "dialog", "collab", "core", "network"];
        readonly capabilities: string[];
        readonly license: "MIT";
        readonly repository: "https://github.com/Coregentis/MPLP-Protocol";
        readonly documentation: "https://github.com/Coregentis/MPLP-Protocol/tree/main/docs";
    };
    VERSION_INFO: {
        readonly current: "1.1.0-beta";
        readonly api_version: "v1";
        readonly schema_version: "1.1";
        readonly protocol_version: "L1-L3";
        readonly compatibility: {
            readonly node: ">=18.0.0";
            readonly typescript: ">=5.0.0";
        };
        readonly breaking_changes: readonly [];
        readonly deprecated_features: readonly [];
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map