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

// ===== Core Tools =====
export { DebugManager } from './debug/DebugManager';
export { PerformanceAnalyzer } from './performance/PerformanceAnalyzer';
export { MonitoringDashboard } from './monitoring/MonitoringDashboard';
export { LogManager } from './logging/LogManager';

// ===== Debugging Tools =====
export { AgentDebugger } from './debug/AgentDebugger';
export { WorkflowDebugger } from './debug/WorkflowDebugger';
export { ProtocolInspector } from './debug/ProtocolInspector';
export { StateInspector } from './debug/StateInspector';

// ===== Performance Tools =====
export { MetricsCollector } from './performance/MetricsCollector';
// TODO: Add when implemented
// export { PerformanceProfiler } from './performance/PerformanceProfiler';
// export { ResourceMonitor } from './performance/ResourceMonitor';
// export { BenchmarkRunner } from './performance/BenchmarkRunner';

// ===== Monitoring Tools =====
// TODO: Add when implemented
// export { RealTimeMonitor } from './monitoring/RealTimeMonitor';
// export { HealthChecker } from './monitoring/HealthChecker';
// export { AlertManager } from './monitoring/AlertManager';
// export { DashboardServer } from './monitoring/DashboardServer';

// ===== Logging Tools =====
// TODO: Add when implemented
// export { StructuredLogger } from './logging/StructuredLogger';
// export { LogViewer } from './logging/LogViewer';
// export { LogAnalyzer } from './logging/LogAnalyzer';
// export { LogExporter } from './logging/LogExporter';

// ===== Utilities =====
// TODO: Add when implemented
// export { DevToolsConfig } from './config/DevToolsConfig';
export { DevToolsServer } from './server/DevToolsServer';
export { CLIRunner } from './cli/CLIRunner';

// ===== Types =====
export * from './types/debug';
export * from './types/performance';
export * from './types/monitoring';
export * from './types/logging';
export * from './types/config';

// ===== Constants =====
export const DEV_TOOLS_VERSION = '1.1.0-beta';
export const SUPPORTED_MPLP_VERSIONS = ['^1.0.0-alpha', '^1.1.0-beta'];

/**
 * Development Tools Information
 */
export const DEV_TOOLS_INFO = {
  name: '@mplp/dev-tools',
  version: DEV_TOOLS_VERSION,
  description: 'Development tools and utilities for MPLP applications',
  features: [
    'Real-time debugging and inspection',
    'Performance monitoring and analysis',
    'Application health monitoring',
    'Structured logging and analysis',
    'Development server integration',
    'CLI tools and utilities'
  ],
  compatibility: {
    mplp: SUPPORTED_MPLP_VERSIONS,
    node: '>=18.0.0',
    typescript: '>=5.0.0'
  }
};

/**
 * Quick start function for development tools
 */
export async function startDevTools(config?: Partial<any>): Promise<void> {
  const { DevToolsServer } = await import('./server/DevToolsServer');
  const server = new DevToolsServer(config);
  await server.start();
  
  console.log('🛠️  MPLP Development Tools started');
  console.log(`📊 Dashboard: http://localhost:${server.getPort()}`);
  console.log('🔧 Use Ctrl+C to stop');
}
