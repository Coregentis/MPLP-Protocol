/**
 * @fileoverview Agent Orchestrator - Main entry point
 * @version 1.1.0-beta
 */
import { AgentOrchestrator } from './core/AgentOrchestrator';
import { AgentOrchestratorConfig } from './types';
export { AgentOrchestrator } from './core/AgentOrchestrator';
export { ConfigManager } from './config/ConfigManager';
export { AgentManager } from './agents/AgentManager';
export { WorkflowManager } from './workflows/WorkflowManager';
export * from './types';
/**
 * Create a sample configuration for testing
 */
export declare function createSampleConfig(): AgentOrchestratorConfig;
export default AgentOrchestrator;
//# sourceMappingURL=index.d.ts.map