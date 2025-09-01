/**
 * MPLP Core Modules Schema Index
 * @description L2 Coordination Layer - 10 Business Modules Schema Definitions
 * @version 1.0.0
 */

// ===== PRODUCTION-READY MODULES (3) =====
import ContextSchema from './mplp-context.json';
import PlanSchema from './mplp-plan.json';
import ConfirmSchema from './mplp-confirm.json';

// ===== ENTERPRISE-STANDARD MODULES (4) =====
import TraceSchema from './mplp-trace.json';
import RoleSchema from './mplp-role.json';
import ExtensionSchema from './mplp-extension.json';
import CoreSchema from './mplp-core.json';

// ===== PENDING MODULES (3) =====
import CollabSchema from './mplp-collab.json';
import DialogSchema from './mplp-dialog.json';
import NetworkSchema from './mplp-network.json';

// ===== EXPORTS =====
export {
  // Production-Ready
  ContextSchema,
  PlanSchema,
  ConfirmSchema,
  // Enterprise-Standard
  TraceSchema,
  RoleSchema,
  ExtensionSchema,
  CoreSchema,
  // Pending
  CollabSchema,
  DialogSchema,
  NetworkSchema
};

// ===== CORE MODULES SCHEMA MAP =====
export const CoreModulesSchemaMap = {
  // Production-Ready (3)
  context: ContextSchema,
  plan: PlanSchema,
  confirm: ConfirmSchema,
  // Enterprise-Standard (4)
  trace: TraceSchema,
  role: RoleSchema,
  extension: ExtensionSchema,
  core: CoreSchema,
  // Pending (3)
  collab: CollabSchema,
  dialog: DialogSchema,
  network: NetworkSchema
} as const;

// ===== TYPE DEFINITIONS =====
export type CoreModuleSchemaName = keyof typeof CoreModulesSchemaMap;

// ===== MODULE CATEGORIES =====
export const ProductionReadyModules = ['context', 'plan', 'confirm'] as const;
export const EnterpriseStandardModules = ['trace', 'role', 'extension', 'core'] as const;
export const PendingModules = ['collab', 'dialog', 'network'] as const;

export const AllCoreModulesSchemas = Object.values(CoreModulesSchemaMap);
export const CoreModuleNames = Object.keys(CoreModulesSchemaMap) as Array<keyof typeof CoreModulesSchemaMap>;

// ===== MODULE STATUS UTILITIES =====
export function isProductionReady(moduleName: string): moduleName is typeof ProductionReadyModules[number] {
  return (ProductionReadyModules as readonly string[]).includes(moduleName);
}

export function isEnterpriseStandard(moduleName: string): moduleName is typeof EnterpriseStandardModules[number] {
  return (EnterpriseStandardModules as readonly string[]).includes(moduleName);
}

export function isPending(moduleName: string): moduleName is typeof PendingModules[number] {
  return (PendingModules as readonly string[]).includes(moduleName);
}

export function getModuleStatus(moduleName: CoreModuleSchemaName): 'production-ready' | 'enterprise-standard' | 'pending' | 'unknown' {
  if (isProductionReady(moduleName)) return 'production-ready';
  if (isEnterpriseStandard(moduleName)) return 'enterprise-standard';
  if (isPending(moduleName)) return 'pending';
  return 'unknown';
}

// ===== MODULE INFORMATION =====
export const ModuleInfo = {
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
} as const;
