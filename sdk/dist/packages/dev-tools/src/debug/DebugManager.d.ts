/**
 * @fileoverview Debug Manager - Central debugging coordinator
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
import { DebugConfig, DebugSession } from '../types/debug';
/**
 * Central debugging coordinator for MPLP applications
 */
export declare class DebugManager extends EventEmitter {
    private config;
    private sessions;
    private agentDebugger;
    private workflowDebugger;
    private protocolInspector;
    private stateInspector;
    private isActive;
    constructor(config?: DebugConfig);
    /**
     * Start debugging session
     */
    start(): Promise<void>;
    /**
     * Stop debugging session
     */
    stop(): Promise<void>;
    /**
     * Create new debug session
     */
    createSession(sessionId: string, target: any): DebugSession;
    /**
     * Get debug session
     */
    getSession(sessionId: string): DebugSession | undefined;
    /**
     * End debug session
     */
    endSession(sessionId: string): void;
    /**
     * Add breakpoint
     */
    addBreakpoint(sessionId: string, location: string, condition?: string): void;
    /**
     * Remove breakpoint
     */
    removeBreakpoint(sessionId: string, breakpointId: string): void;
    /**
     * Add watch expression
     */
    addWatchExpression(sessionId: string, expression: string): void;
    /**
     * Get debugging statistics
     */
    getStatistics(): any;
    /**
     * Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Get current configuration
     */
    getConfig(): DebugConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<DebugConfig>): void;
}
//# sourceMappingURL=DebugManager.d.ts.map