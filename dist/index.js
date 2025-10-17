"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION_INFO = exports.MPLP_INFO = exports.MPLP_CAPABILITIES = exports.MPLP_PROJECT_NAME = exports.MPLP_STATUS = exports.MPLP_PROTOCOL_VERSION = exports.MPLP_VERSION = void 0;
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
exports.MPLP_INFO = {
    name: 'MPLP',
    version: '1.1.0-beta',
    fullName: 'Multi-Agent Protocol Lifecycle Platform',
    description: 'L1-L3 Protocol Stack for Multi-Agent Systems with Complete SDK Ecosystem',
    architecture: 'L1-L3 Layered Architecture',
    status: 'Production Ready',
    modules: [
        'context',
        'plan',
        'role',
        'confirm',
        'trace',
        'extension',
        'dialog',
        'collab',
        'core',
        'network'
    ],
    capabilities: exports.MPLP_CAPABILITIES,
    license: 'MIT',
    repository: 'https://github.com/Coregentis/MPLP-Protocol',
    documentation: 'https://github.com/Coregentis/MPLP-Protocol/tree/main/docs'
};
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
exports.default = {
    MPLP_VERSION: exports.MPLP_VERSION,
    MPLP_PROTOCOL_VERSION: exports.MPLP_PROTOCOL_VERSION,
    MPLP_STATUS: exports.MPLP_STATUS,
    MPLP_PROJECT_NAME: exports.MPLP_PROJECT_NAME,
    MPLP_CAPABILITIES: exports.MPLP_CAPABILITIES,
    MPLP_INFO: exports.MPLP_INFO,
    VERSION_INFO: exports.VERSION_INFO
};
