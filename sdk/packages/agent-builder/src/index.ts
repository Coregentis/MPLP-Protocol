/**
 * @fileoverview MPLP Agent Builder - Main entry point
 * @version 1.1.0-beta
 */

// Core types and interfaces
export * from './types';
export * from './types/errors';

// Builder classes
export { AgentBuilder } from './builder/AgentBuilder';

// Lifecycle management
export * from './lifecycle';

// Platform adapters
export * from './adapters';

// Utilities
export * from './utils';

// Re-export commonly used types for convenience
export type {
  IAgent,
  IAgentBuilder,
  IPlatformAdapter,
  IPlatformAdapterRegistry,
  AgentConfig,
  AgentCapability,
  AgentStatus,
  AgentStatusInfo,
  AgentBehavior,
  PlatformConfig
} from './types';
