"use strict";
/**
 * MPLP Core Modules Schema Index
 * @description L2 Coordination Layer - 10 Business Modules Schema Definitions
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleInfo = exports.CoreModuleNames = exports.AllCoreModulesSchemas = exports.PendingModules = exports.EnterpriseStandardModules = exports.ProductionReadyModules = exports.CoreModulesSchemaMap = exports.NetworkSchema = exports.DialogSchema = exports.CollabSchema = exports.CoreSchema = exports.ExtensionSchema = exports.RoleSchema = exports.TraceSchema = exports.ConfirmSchema = exports.PlanSchema = exports.ContextSchema = void 0;
exports.isProductionReady = isProductionReady;
exports.isEnterpriseStandard = isEnterpriseStandard;
exports.isPending = isPending;
exports.getModuleStatus = getModuleStatus;
const tslib_1 = require("tslib");
// ===== PRODUCTION-READY MODULES (3) =====
const mplp_context_json_1 = tslib_1.__importDefault(require("./mplp-context.json"));
exports.ContextSchema = mplp_context_json_1.default;
const mplp_plan_json_1 = tslib_1.__importDefault(require("./mplp-plan.json"));
exports.PlanSchema = mplp_plan_json_1.default;
const mplp_confirm_json_1 = tslib_1.__importDefault(require("./mplp-confirm.json"));
exports.ConfirmSchema = mplp_confirm_json_1.default;
// ===== ENTERPRISE-STANDARD MODULES (4) =====
const mplp_trace_json_1 = tslib_1.__importDefault(require("./mplp-trace.json"));
exports.TraceSchema = mplp_trace_json_1.default;
const mplp_role_json_1 = tslib_1.__importDefault(require("./mplp-role.json"));
exports.RoleSchema = mplp_role_json_1.default;
const mplp_extension_json_1 = tslib_1.__importDefault(require("./mplp-extension.json"));
exports.ExtensionSchema = mplp_extension_json_1.default;
const mplp_core_json_1 = tslib_1.__importDefault(require("./mplp-core.json"));
exports.CoreSchema = mplp_core_json_1.default;
// ===== PENDING MODULES (3) =====
const mplp_collab_json_1 = tslib_1.__importDefault(require("./mplp-collab.json"));
exports.CollabSchema = mplp_collab_json_1.default;
const mplp_dialog_json_1 = tslib_1.__importDefault(require("./mplp-dialog.json"));
exports.DialogSchema = mplp_dialog_json_1.default;
const mplp_network_json_1 = tslib_1.__importDefault(require("./mplp-network.json"));
exports.NetworkSchema = mplp_network_json_1.default;
// ===== CORE MODULES SCHEMA MAP =====
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
// ===== MODULE CATEGORIES =====
exports.ProductionReadyModules = ['context', 'plan', 'confirm'];
exports.EnterpriseStandardModules = ['trace', 'role', 'extension', 'core'];
exports.PendingModules = ['collab', 'dialog', 'network'];
exports.AllCoreModulesSchemas = Object.values(exports.CoreModulesSchemaMap);
exports.CoreModuleNames = Object.keys(exports.CoreModulesSchemaMap);
// ===== MODULE STATUS UTILITIES =====
function isProductionReady(moduleName) {
    return exports.ProductionReadyModules.includes(moduleName);
}
function isEnterpriseStandard(moduleName) {
    return exports.EnterpriseStandardModules.includes(moduleName);
}
function isPending(moduleName) {
    return exports.PendingModules.includes(moduleName);
}
function getModuleStatus(moduleName) {
    if (isProductionReady(moduleName))
        return 'production-ready';
    if (isEnterpriseStandard(moduleName))
        return 'enterprise-standard';
    if (isPending(moduleName))
        return 'pending';
    return 'unknown';
}
// ===== MODULE INFORMATION =====
exports.ModuleInfo = {
    context: { status: 'production-ready', description: 'Context Management Hub', features: '14 functional domains, 16 specialized services' },
    plan: { status: 'production-ready', description: 'Intelligent Task Planning Coordinator', features: '5 advanced coordinators, 8 MPLP module reserved interfaces' },
    confirm: { status: 'production-ready', description: 'Enterprise Approval Workflow', features: '4 advanced coordinators, enterprise approval workflows' },
    trace: { status: 'enterprise-standard', description: 'Full-Chain Monitoring Hub', features: '100% test pass rate (107/107), zero flaky tests' },
    role: { status: 'enterprise-standard', description: 'Enterprise RBAC Security Hub', features: '75.31% coverage, 333 tests, <10ms permission verification' },
    extension: { status: 'enterprise-standard', description: 'Multi-Agent Protocol Platform', features: '54 functional tests, 8 MPLP interfaces, AI-driven recommendations' },
    core: { status: 'enterprise-standard', description: 'Workflow Orchestration Hub', features: 'CoreOrchestrator infrastructure, workflow orchestration' },
    collab: { status: 'pending', description: 'Collaboration Management Hub', features: 'Multi-person collaboration, real-time sync' },
    dialog: { status: 'pending', description: 'Dialog Interaction Hub', features: 'Intelligent dialog, multi-modal interaction' },
    network: { status: 'pending', description: 'Network Communication Hub', features: 'Distributed architecture, network coordination' }
};
//# sourceMappingURL=index.js.map