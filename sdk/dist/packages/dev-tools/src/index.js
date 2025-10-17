"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEV_TOOLS_INFO = exports.SUPPORTED_MPLP_VERSIONS = exports.DEV_TOOLS_VERSION = exports.CLIRunner = exports.DevToolsServer = exports.MetricsCollector = exports.StateInspector = exports.ProtocolInspector = exports.WorkflowDebugger = exports.AgentDebugger = exports.LogManager = exports.MonitoringDashboard = exports.PerformanceAnalyzer = exports.DebugManager = void 0;
exports.startDevTools = startDevTools;
// ===== Core Tools =====
var DebugManager_1 = require("./debug/DebugManager");
Object.defineProperty(exports, "DebugManager", { enumerable: true, get: function () { return DebugManager_1.DebugManager; } });
var PerformanceAnalyzer_1 = require("./performance/PerformanceAnalyzer");
Object.defineProperty(exports, "PerformanceAnalyzer", { enumerable: true, get: function () { return PerformanceAnalyzer_1.PerformanceAnalyzer; } });
var MonitoringDashboard_1 = require("./monitoring/MonitoringDashboard");
Object.defineProperty(exports, "MonitoringDashboard", { enumerable: true, get: function () { return MonitoringDashboard_1.MonitoringDashboard; } });
var LogManager_1 = require("./logging/LogManager");
Object.defineProperty(exports, "LogManager", { enumerable: true, get: function () { return LogManager_1.LogManager; } });
// ===== Debugging Tools =====
var AgentDebugger_1 = require("./debug/AgentDebugger");
Object.defineProperty(exports, "AgentDebugger", { enumerable: true, get: function () { return AgentDebugger_1.AgentDebugger; } });
var WorkflowDebugger_1 = require("./debug/WorkflowDebugger");
Object.defineProperty(exports, "WorkflowDebugger", { enumerable: true, get: function () { return WorkflowDebugger_1.WorkflowDebugger; } });
var ProtocolInspector_1 = require("./debug/ProtocolInspector");
Object.defineProperty(exports, "ProtocolInspector", { enumerable: true, get: function () { return ProtocolInspector_1.ProtocolInspector; } });
var StateInspector_1 = require("./debug/StateInspector");
Object.defineProperty(exports, "StateInspector", { enumerable: true, get: function () { return StateInspector_1.StateInspector; } });
// ===== Performance Tools =====
var MetricsCollector_1 = require("./performance/MetricsCollector");
Object.defineProperty(exports, "MetricsCollector", { enumerable: true, get: function () { return MetricsCollector_1.MetricsCollector; } });
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
var DevToolsServer_1 = require("./server/DevToolsServer");
Object.defineProperty(exports, "DevToolsServer", { enumerable: true, get: function () { return DevToolsServer_1.DevToolsServer; } });
var CLIRunner_1 = require("./cli/CLIRunner");
Object.defineProperty(exports, "CLIRunner", { enumerable: true, get: function () { return CLIRunner_1.CLIRunner; } });
// ===== Types =====
__exportStar(require("./types/debug"), exports);
__exportStar(require("./types/performance"), exports);
__exportStar(require("./types/monitoring"), exports);
__exportStar(require("./types/logging"), exports);
__exportStar(require("./types/config"), exports);
// ===== Constants =====
exports.DEV_TOOLS_VERSION = '1.1.0-beta';
exports.SUPPORTED_MPLP_VERSIONS = ['^1.0.0-alpha', '^1.1.0-beta'];
/**
 * Development Tools Information
 */
exports.DEV_TOOLS_INFO = {
    name: '@mplp/dev-tools',
    version: exports.DEV_TOOLS_VERSION,
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
        mplp: exports.SUPPORTED_MPLP_VERSIONS,
        node: '>=18.0.0',
        typescript: '>=5.0.0'
    }
};
/**
 * Quick start function for development tools
 */
async function startDevTools(config) {
    const { DevToolsServer } = await Promise.resolve().then(() => __importStar(require('./server/DevToolsServer')));
    const server = new DevToolsServer(config);
    await server.start();
    console.log('🛠️  MPLP Development Tools started');
    console.log(`📊 Dashboard: http://localhost:${server.getPort()}`);
    console.log('🔧 Use Ctrl+C to stop');
}
//# sourceMappingURL=index.js.map