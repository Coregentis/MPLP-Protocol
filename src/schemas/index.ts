/**
 * MPLP Protocol Schema Index v1.0
 * @description Export all MPLP protocol schema definitions with organized structure
 * @version 1.0.0
 * @updated 2025-08-22 - Reorganized into core-modules and cross-cutting-concerns
 */

// ===== L2 COORDINATION LAYER: CORE MODULES SCHEMA (10 modules) =====

// Production-Ready Modules (3)
import ContextSchema from './core-modules/mplp-context.json';
import PlanSchema from './core-modules/mplp-plan.json';
import ConfirmSchema from './core-modules/mplp-confirm.json';

// Enterprise-Standard Modules (4)
import TraceSchema from './core-modules/mplp-trace.json';
import RoleSchema from './core-modules/mplp-role.json';
import ExtensionSchema from './core-modules/mplp-extension.json';
import CoreSchema from './core-modules/mplp-core.json';

// Pending Modules (3)
import CollabSchema from './core-modules/mplp-collab.json';
import DialogSchema from './core-modules/mplp-dialog.json';
import NetworkSchema from './core-modules/mplp-network.json';

// ===== L1 PROTOCOL LAYER: CROSS-CUTTING CONCERNS SCHEMA (9 concerns) =====

// Security & Performance Infrastructure
import SecuritySchema from './cross-cutting-concerns/mplp-security.json';
import PerformanceSchema from './cross-cutting-concerns/mplp-performance.json';

// Events & Storage Infrastructure
import EventBusSchema from './cross-cutting-concerns/mplp-event-bus.json';
import ErrorHandlingSchema from './cross-cutting-concerns/mplp-error-handling.json';

// Coordination & Orchestration Infrastructure
import CoordinationSchema from './cross-cutting-concerns/mplp-coordination.json';
import OrchestrationSchema from './cross-cutting-concerns/mplp-orchestration.json';
import StateSyncSchema from './cross-cutting-concerns/mplp-state-sync.json';

// Transaction & Protocol Management Infrastructure
import TransactionSchema from './cross-cutting-concerns/mplp-transaction.json';
import ProtocolVersionSchema from './cross-cutting-concerns/mplp-protocol-version.json';

// ===== SCHEMA EXPORTS =====

// Core Modules Schema Export
export {
  // Production-Ready Modules
  ContextSchema,
  PlanSchema,
  ConfirmSchema,
  // Enterprise-Standard Modules
  TraceSchema,
  RoleSchema,
  ExtensionSchema,
  CoreSchema,
  // Pending Modules
  CollabSchema,
  DialogSchema,
  NetworkSchema
};

// Cross-Cutting Concerns Schema Export
export {
  SecuritySchema,
  PerformanceSchema,
  EventBusSchema,
  ErrorHandlingSchema,
  CoordinationSchema,
  OrchestrationSchema,
  StateSyncSchema,
  TransactionSchema,
  ProtocolVersionSchema
};

// ===== SCHEMA MAPPING TABLES =====

// Core Modules Schema Map
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

// Cross-Cutting Concerns Schema Map
export const CrossCuttingConcernsSchemaMap = {
  security: SecuritySchema,
  performance: PerformanceSchema,
  eventBus: EventBusSchema,
  errorHandling: ErrorHandlingSchema,
  coordination: CoordinationSchema,
  orchestration: OrchestrationSchema,
  stateSync: StateSyncSchema,
  transaction: TransactionSchema,
  protocolVersion: ProtocolVersionSchema
} as const;

// Complete Schema Map (Unified)
export const SchemaMap = {
  ...CoreModulesSchemaMap,
  ...CrossCuttingConcernsSchemaMap
} as const;

// ===== TYPE DEFINITIONS =====

// Schema Name Types
export type CoreModuleSchemaName = keyof typeof CoreModulesSchemaMap;
export type CrossCuttingConcernSchemaName = keyof typeof CrossCuttingConcernsSchemaMap;
export type SchemaName = keyof typeof SchemaMap;

// Schema Collections
export const AllCoreModulesSchemas = Object.values(CoreModulesSchemaMap);
export const AllCrossCuttingConcernsSchemas = Object.values(CrossCuttingConcernsSchemaMap);
export const AllSchemas = Object.values(SchemaMap);

// Module Name Collections
export const CoreModuleNames = Object.keys(CoreModulesSchemaMap) as Array<keyof typeof CoreModulesSchemaMap>;
export const CrossCuttingConcernNames = Object.keys(CrossCuttingConcernsSchemaMap) as Array<keyof typeof CrossCuttingConcernsSchemaMap>;
export const ModuleNames = Object.keys(SchemaMap) as Array<keyof typeof SchemaMap>;

// Module Status Categories
export const ProductionReadyModules = ['context', 'plan', 'confirm'] as const;
export const EnterpriseStandardModules = ['trace', 'role', 'extension', 'core'] as const;
export const PendingModules = ['collab', 'dialog', 'network'] as const;

// ===== SCHEMA VALIDATION FUNCTIONS =====

/**
 * Generic Schema Validation Function
 * @param data - Data to validate
 * @param schemaName - Name of the schema to validate against
 * @returns Validation result with details
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export function validateProtocolData(data: unknown, schemaName: SchemaName): ValidationResult {
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
export const validateContextProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'context');
export const validatePlanProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'plan');
export const validateConfirmProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'confirm');
export const validateTraceProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'trace');
export const validateRoleProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'role');
export const validateExtensionProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'extension');
export const validateCoreProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'core');
export const validateCollabProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'collab');
export const validateDialogProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'dialog');
export const validateNetworkProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'network');

// Cross-Cutting Concerns Validation
export const validateSecurityProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'security');
export const validatePerformanceProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'performance');
export const validateEventBusProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'eventBus');
export const validateErrorHandlingProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'errorHandling');
export const validateCoordinationProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'coordination');
export const validateOrchestrationProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'orchestration');
export const validateStateSyncProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'stateSync');
export const validateTransactionProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'transaction');
export const validateProtocolVersionProtocol = (data: unknown): ValidationResult =>
  validateProtocolData(data, 'protocolVersion');

// ===== SCHEMA UTILITIES =====

/**
 * Get schema by name
 */
export function getSchema(schemaName: SchemaName) {
  return SchemaMap[schemaName];
}

/**
 * Check if a schema name is a core module
 */
export function isCoreModule(schemaName: string): schemaName is CoreModuleSchemaName {
  return schemaName in CoreModulesSchemaMap;
}

/**
 * Check if a schema name is a cross-cutting concern
 */
export function isCrossCuttingConcern(schemaName: string): schemaName is CrossCuttingConcernSchemaName {
  return schemaName in CrossCuttingConcernsSchemaMap;
}
