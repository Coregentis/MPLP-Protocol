"use strict";
/**
 * MPLP Protocol Schema Index v1.0
 * @description Export all MPLP protocol schema definitions with organized structure
 * @version 1.0.0
 * @updated 2025-08-22 - Reorganized into core-modules and cross-cutting-concerns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProtocolVersionProtocol = exports.validateTransactionProtocol = exports.validateStateSyncProtocol = exports.validateOrchestrationProtocol = exports.validateCoordinationProtocol = exports.validateErrorHandlingProtocol = exports.validateEventBusProtocol = exports.validatePerformanceProtocol = exports.validateSecurityProtocol = exports.validateNetworkProtocol = exports.validateDialogProtocol = exports.validateCollabProtocol = exports.validateCoreProtocol = exports.validateExtensionProtocol = exports.validateRoleProtocol = exports.validateTraceProtocol = exports.validateConfirmProtocol = exports.validatePlanProtocol = exports.validateContextProtocol = exports.PendingModules = exports.EnterpriseStandardModules = exports.ProductionReadyModules = exports.ModuleNames = exports.CrossCuttingConcernNames = exports.CoreModuleNames = exports.AllSchemas = exports.AllCrossCuttingConcernsSchemas = exports.AllCoreModulesSchemas = exports.SchemaMap = exports.CrossCuttingConcernsSchemaMap = exports.CoreModulesSchemaMap = exports.ProtocolVersionSchema = exports.TransactionSchema = exports.StateSyncSchema = exports.OrchestrationSchema = exports.CoordinationSchema = exports.ErrorHandlingSchema = exports.EventBusSchema = exports.PerformanceSchema = exports.SecuritySchema = exports.NetworkSchema = exports.DialogSchema = exports.CollabSchema = exports.CoreSchema = exports.ExtensionSchema = exports.RoleSchema = exports.TraceSchema = exports.ConfirmSchema = exports.PlanSchema = exports.ContextSchema = void 0;
exports.validateProtocolData = validateProtocolData;
exports.getSchema = getSchema;
exports.isCoreModule = isCoreModule;
exports.isCrossCuttingConcern = isCrossCuttingConcern;
const tslib_1 = require("tslib");
// ===== L2 COORDINATION LAYER: CORE MODULES SCHEMA (10 modules) =====
// Production-Ready Modules (3)
const mplp_context_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-context.json"));
exports.ContextSchema = mplp_context_json_1.default;
const mplp_plan_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-plan.json"));
exports.PlanSchema = mplp_plan_json_1.default;
const mplp_confirm_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-confirm.json"));
exports.ConfirmSchema = mplp_confirm_json_1.default;
// Enterprise-Standard Modules (4)
const mplp_trace_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-trace.json"));
exports.TraceSchema = mplp_trace_json_1.default;
const mplp_role_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-role.json"));
exports.RoleSchema = mplp_role_json_1.default;
const mplp_extension_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-extension.json"));
exports.ExtensionSchema = mplp_extension_json_1.default;
const mplp_core_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-core.json"));
exports.CoreSchema = mplp_core_json_1.default;
// Pending Modules (3)
const mplp_collab_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-collab.json"));
exports.CollabSchema = mplp_collab_json_1.default;
const mplp_dialog_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-dialog.json"));
exports.DialogSchema = mplp_dialog_json_1.default;
const mplp_network_json_1 = tslib_1.__importDefault(require("./core-modules/mplp-network.json"));
exports.NetworkSchema = mplp_network_json_1.default;
// ===== L1 PROTOCOL LAYER: CROSS-CUTTING CONCERNS SCHEMA (9 concerns) =====
// Security & Performance Infrastructure
const mplp_security_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-security.json"));
exports.SecuritySchema = mplp_security_json_1.default;
const mplp_performance_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-performance.json"));
exports.PerformanceSchema = mplp_performance_json_1.default;
// Events & Storage Infrastructure
const mplp_event_bus_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-event-bus.json"));
exports.EventBusSchema = mplp_event_bus_json_1.default;
const mplp_error_handling_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-error-handling.json"));
exports.ErrorHandlingSchema = mplp_error_handling_json_1.default;
// Coordination & Orchestration Infrastructure
const mplp_coordination_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-coordination.json"));
exports.CoordinationSchema = mplp_coordination_json_1.default;
const mplp_orchestration_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-orchestration.json"));
exports.OrchestrationSchema = mplp_orchestration_json_1.default;
const mplp_state_sync_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-state-sync.json"));
exports.StateSyncSchema = mplp_state_sync_json_1.default;
// Transaction & Protocol Management Infrastructure
const mplp_transaction_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-transaction.json"));
exports.TransactionSchema = mplp_transaction_json_1.default;
const mplp_protocol_version_json_1 = tslib_1.__importDefault(require("./cross-cutting-concerns/mplp-protocol-version.json"));
exports.ProtocolVersionSchema = mplp_protocol_version_json_1.default;
// ===== SCHEMA MAPPING TABLES =====
// Core Modules Schema Map
exports.CoreModulesSchemaMap = {
    // Production-Ready (3)
    context: mplp_context_json_1.default,
    plan: mplp_plan_json_1.default,
    confirm: mplp_confirm_json_1.default,
    // Enterprise-Standard (4)
    trace: mplp_trace_json_1.default,
    role: mplp_role_json_1.default,
    extension: mplp_extension_json_1.default,
    core: mplp_core_json_1.default,
    // Pending (3)
    collab: mplp_collab_json_1.default,
    dialog: mplp_dialog_json_1.default,
    network: mplp_network_json_1.default
};
// Cross-Cutting Concerns Schema Map
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
// Complete Schema Map (Unified)
exports.SchemaMap = {
    ...exports.CoreModulesSchemaMap,
    ...exports.CrossCuttingConcernsSchemaMap
};
// Schema Collections
exports.AllCoreModulesSchemas = Object.values(exports.CoreModulesSchemaMap);
exports.AllCrossCuttingConcernsSchemas = Object.values(exports.CrossCuttingConcernsSchemaMap);
exports.AllSchemas = Object.values(exports.SchemaMap);
// Module Name Collections
exports.CoreModuleNames = Object.keys(exports.CoreModulesSchemaMap);
exports.CrossCuttingConcernNames = Object.keys(exports.CrossCuttingConcernsSchemaMap);
exports.ModuleNames = Object.keys(exports.SchemaMap);
// Module Status Categories
exports.ProductionReadyModules = ['context', 'plan', 'confirm'];
exports.EnterpriseStandardModules = ['trace', 'role', 'extension', 'core'];
exports.PendingModules = ['collab', 'dialog', 'network'];
function validateProtocolData(data, schemaName) {
    // TODO: Implement actual JSON Schema validation using ajv or similar
    // This is a placeholder implementation
    if (!data || typeof data !== 'object') {
        return {
            isValid: false,
            errors: ['Data must be a non-null object']
        };
    }
    // Basic validation placeholder
    return {
        isValid: true,
        warnings: [`Schema validation for '${schemaName}' not yet implemented`]
    };
}
// ===== CONVENIENCE VALIDATION FUNCTIONS =====
// Core Modules Validation
const validateContextProtocol = (data) => validateProtocolData(data, 'context');
exports.validateContextProtocol = validateContextProtocol;
const validatePlanProtocol = (data) => validateProtocolData(data, 'plan');
exports.validatePlanProtocol = validatePlanProtocol;
const validateConfirmProtocol = (data) => validateProtocolData(data, 'confirm');
exports.validateConfirmProtocol = validateConfirmProtocol;
const validateTraceProtocol = (data) => validateProtocolData(data, 'trace');
exports.validateTraceProtocol = validateTraceProtocol;
const validateRoleProtocol = (data) => validateProtocolData(data, 'role');
exports.validateRoleProtocol = validateRoleProtocol;
const validateExtensionProtocol = (data) => validateProtocolData(data, 'extension');
exports.validateExtensionProtocol = validateExtensionProtocol;
const validateCoreProtocol = (data) => validateProtocolData(data, 'core');
exports.validateCoreProtocol = validateCoreProtocol;
const validateCollabProtocol = (data) => validateProtocolData(data, 'collab');
exports.validateCollabProtocol = validateCollabProtocol;
const validateDialogProtocol = (data) => validateProtocolData(data, 'dialog');
exports.validateDialogProtocol = validateDialogProtocol;
const validateNetworkProtocol = (data) => validateProtocolData(data, 'network');
exports.validateNetworkProtocol = validateNetworkProtocol;
// Cross-Cutting Concerns Validation
const validateSecurityProtocol = (data) => validateProtocolData(data, 'security');
exports.validateSecurityProtocol = validateSecurityProtocol;
const validatePerformanceProtocol = (data) => validateProtocolData(data, 'performance');
exports.validatePerformanceProtocol = validatePerformanceProtocol;
const validateEventBusProtocol = (data) => validateProtocolData(data, 'eventBus');
exports.validateEventBusProtocol = validateEventBusProtocol;
const validateErrorHandlingProtocol = (data) => validateProtocolData(data, 'errorHandling');
exports.validateErrorHandlingProtocol = validateErrorHandlingProtocol;
const validateCoordinationProtocol = (data) => validateProtocolData(data, 'coordination');
exports.validateCoordinationProtocol = validateCoordinationProtocol;
const validateOrchestrationProtocol = (data) => validateProtocolData(data, 'orchestration');
exports.validateOrchestrationProtocol = validateOrchestrationProtocol;
const validateStateSyncProtocol = (data) => validateProtocolData(data, 'stateSync');
exports.validateStateSyncProtocol = validateStateSyncProtocol;
const validateTransactionProtocol = (data) => validateProtocolData(data, 'transaction');
exports.validateTransactionProtocol = validateTransactionProtocol;
const validateProtocolVersionProtocol = (data) => validateProtocolData(data, 'protocolVersion');
exports.validateProtocolVersionProtocol = validateProtocolVersionProtocol;
// ===== SCHEMA UTILITIES =====
/**
 * Get schema by name
 */
function getSchema(schemaName) {
    return exports.SchemaMap[schemaName];
}
/**
 * Check if a schema name is a core module
 */
function isCoreModule(schemaName) {
    return schemaName in exports.CoreModulesSchemaMap;
}
/**
 * Check if a schema name is a cross-cutting concern
 */
function isCrossCuttingConcern(schemaName) {
    return schemaName in exports.CrossCuttingConcernsSchemaMap;
}
//# sourceMappingURL=index.js.map