/**
 * @fileoverview MPLP Development Tools - Main Entry Point
 * @version 1.1.0-beta
 * @author MPLP Team
 *
 * Development tools and utilities for MPLP applications including:
 * - Debugging tools and utilities
 * - Performance monitoring and analysis
 * - Real-time application monitoring
 * - Log management and visualization
 * - Development server integration
 */
export { DebugManager } from './debug/DebugManager';
export { PerformanceAnalyzer } from './performance/PerformanceAnalyzer';
export { MonitoringDashboard } from './monitoring/MonitoringDashboard';
export { LogManager } from './logging/LogManager';
export { AgentDebugger } from './debug/AgentDebugger';
export { WorkflowDebugger } from './debug/WorkflowDebugger';
export { ProtocolInspector } from './debug/ProtocolInspector';
export { StateInspector } from './debug/StateInspector';
export { MetricsCollector } from './performance/MetricsCollector';
export { DevToolsServer } from './server/DevToolsServer';
export { CLIRunner } from './cli/CLIRunner';
export * from './types/debug';
export * from './types/performance';
export * from './types/monitoring';
export * from './types/logging';
export * from './types/config';
export declare const DEV_TOOLS_VERSION = "1.1.0-beta";
export declare const SUPPORTED_MPLP_VERSIONS: string[];
/**
 * Development Tools Information
 */
export declare const DEV_TOOLS_INFO: {
    name: string;
    version: string;
    description: string;
    features: string[];
    compatibility: {
        mplp: string[];
        node: string;
        typescript: string;
    };
};
/**
 * Quick start function for development tools
 */
export declare function startDevTools(config?: Partial<any>): Promise<void>;
//# sourceMappingURL=index.d.ts.map