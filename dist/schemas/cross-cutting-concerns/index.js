"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossCuttingConcernInfo = exports.L3ManagerMapping = exports.CrossCuttingConcernNames = exports.AllCrossCuttingConcernsSchemas = exports.ProtocolManagementInfrastructure = exports.CoordinationInfrastructure = exports.StorageInfrastructure = exports.EventsInfrastructure = exports.PerformanceInfrastructure = exports.SecurityInfrastructure = exports.CrossCuttingConcernsSchemaMap = exports.ProtocolVersionSchema = exports.TransactionSchema = exports.StateSyncSchema = exports.OrchestrationSchema = exports.CoordinationSchema = exports.ErrorHandlingSchema = exports.EventBusSchema = exports.PerformanceSchema = exports.SecuritySchema = void 0;
exports.getInfrastructureCategory = getInfrastructureCategory;
exports.getL3Manager = getL3Manager;
exports.getL3Location = getL3Location;
const mplp_security_json_1 = __importDefault(require("./mplp-security.json"));
exports.SecuritySchema = mplp_security_json_1.default;
const mplp_performance_json_1 = __importDefault(require("./mplp-performance.json"));
exports.PerformanceSchema = mplp_performance_json_1.default;
const mplp_event_bus_json_1 = __importDefault(require("./mplp-event-bus.json"));
exports.EventBusSchema = mplp_event_bus_json_1.default;
const mplp_error_handling_json_1 = __importDefault(require("./mplp-error-handling.json"));
exports.ErrorHandlingSchema = mplp_error_handling_json_1.default;
const mplp_coordination_json_1 = __importDefault(require("./mplp-coordination.json"));
exports.CoordinationSchema = mplp_coordination_json_1.default;
const mplp_orchestration_json_1 = __importDefault(require("./mplp-orchestration.json"));
exports.OrchestrationSchema = mplp_orchestration_json_1.default;
const mplp_state_sync_json_1 = __importDefault(require("./mplp-state-sync.json"));
exports.StateSyncSchema = mplp_state_sync_json_1.default;
const mplp_transaction_json_1 = __importDefault(require("./mplp-transaction.json"));
exports.TransactionSchema = mplp_transaction_json_1.default;
const mplp_protocol_version_json_1 = __importDefault(require("./mplp-protocol-version.json"));
exports.ProtocolVersionSchema = mplp_protocol_version_json_1.default;
exports.CrossCuttingConcernsSchemaMap = {
    security: mplp_security_json_1.default,
    performance: mplp_performance_json_1.default,
    eventBus: mplp_event_bus_json_1.default,
    errorHandling: mplp_error_handling_json_1.default,
    coordination: mplp_coordination_json_1.default,
    orchestration: mplp_orchestration_json_1.default,
    stateSync: mplp_state_sync_json_1.default,
    transaction: mplp_transaction_json_1.default,
    protocolVersion: mplp_protocol_version_json_1.default
};
exports.SecurityInfrastructure = ['security'];
exports.PerformanceInfrastructure = ['performance'];
exports.EventsInfrastructure = ['eventBus', 'errorHandling'];
exports.StorageInfrastructure = ['stateSync', 'transaction'];
exports.CoordinationInfrastructure = ['coordination', 'orchestration'];
exports.ProtocolManagementInfrastructure = ['protocolVersion'];
exports.AllCrossCuttingConcernsSchemas = Object.values(exports.CrossCuttingConcernsSchemaMap);
exports.CrossCuttingConcernNames = Object.keys(exports.CrossCuttingConcernsSchemaMap);
exports.L3ManagerMapping = {
    'Security Infrastructure': {
        manager: 'MLPPSecurityManager',
        location: 'src/core/protocols/cross-cutting-concerns.ts',
        concerns: ['security'],
        description: 'Identity authentication, authorization, security audit, data protection'
    },
    'Performance Infrastructure': {
        manager: 'MLPPPerformanceMonitor',
        location: 'src/core/protocols/cross-cutting-concerns.ts',
        concerns: ['performance'],
        description: 'Performance monitoring, SLA management, resource optimization, caching'
    },
    'Events Infrastructure': {
        manager: 'MLPPEventBusManager',
        location: 'src/core/protocols/cross-cutting-concerns.ts',
        concerns: ['eventBus', 'errorHandling'],
        description: 'Event publishing/subscription, asynchronous messaging, error handling'
    },
    'Storage Infrastructure': {
        manager: 'MLPPStateSyncManager',
        location: 'src/core/protocols/cross-cutting-concerns.ts',
        concerns: ['stateSync', 'transaction'],
        description: 'Data storage abstraction, state synchronization, transaction management'
    }
};
function getInfrastructureCategory(concernName) {
    if (exports.SecurityInfrastructure.includes(concernName))
        return 'Security Infrastructure';
    if (exports.PerformanceInfrastructure.includes(concernName))
        return 'Performance Infrastructure';
    if (exports.EventsInfrastructure.includes(concernName))
        return 'Events Infrastructure';
    if (exports.StorageInfrastructure.includes(concernName))
        return 'Storage Infrastructure';
    if (exports.CoordinationInfrastructure.includes(concernName))
        return 'Coordination Infrastructure';
    if (exports.ProtocolManagementInfrastructure.includes(concernName))
        return 'Protocol Management Infrastructure';
    return 'Unknown Infrastructure';
}
function getL3Manager(concernName) {
    const mapping = Object.values(exports.L3ManagerMapping).find(m => m.concerns.includes(concernName));
    return mapping?.manager || 'UnknownManager';
}
function getL3Location(concernName) {
    const mapping = Object.values(exports.L3ManagerMapping).find(m => m.concerns.includes(concernName));
    return mapping?.location || 'src/core/protocols/cross-cutting-concerns.ts';
}
exports.CrossCuttingConcernInfo = {
    security: {
        category: 'Security Infrastructure',
        description: 'Identity authentication, authorization, security audit, data protection',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPSecurityManager'
    },
    performance: {
        category: 'Performance Infrastructure',
        description: 'Performance monitoring, SLA management, resource optimization, caching',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPPerformanceMonitor'
    },
    eventBus: {
        category: 'Events Infrastructure',
        description: 'Event publishing/subscription, asynchronous messaging, event routing',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPEventBusManager'
    },
    errorHandling: {
        category: 'Events Infrastructure',
        description: 'Error capturing, recovery strategies, error classification',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPErrorHandler'
    },
    coordination: {
        category: 'Coordination Infrastructure',
        description: 'Module coordination, dependency management, state synchronization',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPCoordinationManager'
    },
    orchestration: {
        category: 'Coordination Infrastructure',
        description: 'Workflow orchestration, step management, conditional execution',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPOrchestrationManager'
    },
    stateSync: {
        category: 'Storage Infrastructure',
        description: 'Distributed state, consistency guarantee, conflict resolution',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPStateSyncManager'
    },
    transaction: {
        category: 'Storage Infrastructure',
        description: 'Transaction management, ACID guarantee, rollback mechanism',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPTransactionManager'
    },
    protocolVersion: {
        category: 'Protocol Management Infrastructure',
        description: 'Version negotiation, compatibility check, upgrade management',
        l3Location: 'src/core/protocols/cross-cutting-concerns.ts',
        l3Manager: 'MLPPProtocolVersionManager'
    }
};
