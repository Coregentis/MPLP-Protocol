/**
 * MPLP Cross-Cutting Concerns Schema Index
 * @description L1 Protocol Layer - 9 Cross-Cutting Concerns Schema Definitions
 * @version 1.0.0
 */

// ===== SECURITY & PERFORMANCE INFRASTRUCTURE =====
import SecuritySchema from './mplp-security.json';
import PerformanceSchema from './mplp-performance.json';

// ===== EVENTS & ERROR HANDLING INFRASTRUCTURE =====
import EventBusSchema from './mplp-event-bus.json';
import ErrorHandlingSchema from './mplp-error-handling.json';

// ===== COORDINATION & ORCHESTRATION INFRASTRUCTURE =====
import CoordinationSchema from './mplp-coordination.json';
import OrchestrationSchema from './mplp-orchestration.json';
import StateSyncSchema from './mplp-state-sync.json';

// ===== TRANSACTION & PROTOCOL MANAGEMENT INFRASTRUCTURE =====
import TransactionSchema from './mplp-transaction.json';
import ProtocolVersionSchema from './mplp-protocol-version.json';

// ===== EXPORTS =====
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

// ===== CROSS-CUTTING CONCERNS SCHEMA MAP =====
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

// ===== TYPE DEFINITIONS =====
export type CrossCuttingConcernSchemaName = keyof typeof CrossCuttingConcernsSchemaMap;

// ===== INFRASTRUCTURE CATEGORIES =====
export const SecurityInfrastructure = ['security'] as const;
export const PerformanceInfrastructure = ['performance'] as const;
export const EventsInfrastructure = ['eventBus', 'errorHandling'] as const;
export const StorageInfrastructure = ['stateSync', 'transaction'] as const;
export const CoordinationInfrastructure = ['coordination', 'orchestration'] as const;
export const ProtocolManagementInfrastructure = ['protocolVersion'] as const;

export const AllCrossCuttingConcernsSchemas = Object.values(CrossCuttingConcernsSchemaMap);
export const CrossCuttingConcernNames = Object.keys(CrossCuttingConcernsSchemaMap) as Array<keyof typeof CrossCuttingConcernsSchemaMap>;

// ===== L3 MANAGER MAPPING =====
export const L3ManagerMapping = {
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
} as const;

// ===== CROSS-CUTTING CONCERN UTILITIES =====
export function getInfrastructureCategory(concernName: CrossCuttingConcernSchemaName): string {
  if ((SecurityInfrastructure as readonly string[]).includes(concernName)) return 'Security Infrastructure';
  if ((PerformanceInfrastructure as readonly string[]).includes(concernName)) return 'Performance Infrastructure';
  if ((EventsInfrastructure as readonly string[]).includes(concernName)) return 'Events Infrastructure';
  if ((StorageInfrastructure as readonly string[]).includes(concernName)) return 'Storage Infrastructure';
  if ((CoordinationInfrastructure as readonly string[]).includes(concernName)) return 'Coordination Infrastructure';
  if ((ProtocolManagementInfrastructure as readonly string[]).includes(concernName)) return 'Protocol Management Infrastructure';
  return 'Unknown Infrastructure';
}

export function getL3Manager(concernName: CrossCuttingConcernSchemaName): string {
  const mapping = Object.values(L3ManagerMapping).find(m =>
    (m.concerns as readonly string[]).includes(concernName)
  );
  return mapping?.manager || 'UnknownManager';
}

export function getL3Location(concernName: CrossCuttingConcernSchemaName): string {
  const mapping = Object.values(L3ManagerMapping).find(m =>
    (m.concerns as readonly string[]).includes(concernName)
  );
  return mapping?.location || 'src/core/protocols/cross-cutting-concerns.ts';
}

// ===== CROSS-CUTTING CONCERN INFORMATION =====
export const CrossCuttingConcernInfo = {
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
} as const;
