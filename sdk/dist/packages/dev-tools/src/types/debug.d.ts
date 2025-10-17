/**
 * @fileoverview Debug Types - Type definitions for debugging tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */
/**
 * Debug configuration
 */
export interface DebugConfig {
    enabled?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    breakpoints?: string[];
    watchExpressions?: string[];
    autoAttach?: boolean;
    inspectBrk?: boolean;
    port?: number;
    host?: string;
}
/**
 * Debug session
 */
export interface DebugSession {
    id: string;
    target: any;
    startTime: Date;
    endTime?: Date;
    breakpoints: Breakpoint[];
    watchExpressions: WatchExpression[];
    isActive: boolean;
    events: DebugEvent[];
}
/**
 * Breakpoint definition
 */
export interface Breakpoint {
    id: string;
    location: string;
    condition?: string;
    enabled: boolean;
    hitCount: number;
    logMessage?: string;
}
/**
 * Watch expression
 */
export interface WatchExpression {
    id: string;
    expression: string;
    enabled: boolean;
    lastValue: any;
    lastEvaluated: Date;
    error?: string;
}
/**
 * Debug event
 */
export interface DebugEvent {
    type: 'breakpoint' | 'step' | 'exception' | 'output' | 'custom';
    timestamp: Date;
    sessionId: string;
    data: any;
    source?: string;
    location?: string;
}
/**
 * Agent debug info
 */
export interface AgentDebugInfo {
    agentId: string;
    name: string;
    status: 'idle' | 'running' | 'paused' | 'error';
    currentAction?: string;
    capabilities: string[];
    state: any;
    metrics: {
        totalActions: number;
        successfulActions: number;
        failedActions: number;
        averageResponseTime: number;
    };
}
/**
 * Workflow debug info
 */
export interface WorkflowDebugInfo {
    workflowId: string;
    name: string;
    status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
    currentStep?: string;
    steps: WorkflowStepInfo[];
    startTime: Date;
    endTime?: Date;
    duration?: number;
}
/**
 * Workflow step info
 */
export interface WorkflowStepInfo {
    stepId: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    input?: any;
    output?: any;
    error?: string;
}
/**
 * Protocol inspection data
 */
export interface ProtocolInspectionData {
    protocolVersion: string;
    messageType: string;
    timestamp: Date;
    source: string;
    destination: string;
    payload: any;
    headers?: Record<string, string>;
    metadata?: Record<string, any>;
}
/**
 * State inspection data
 */
export interface StateInspectionData {
    componentId: string;
    componentType: 'agent' | 'workflow' | 'context' | 'plan' | 'other';
    timestamp: Date;
    state: any;
    previousState?: any;
    changes?: StateChange[];
}
/**
 * State change
 */
export interface StateChange {
    path: string;
    oldValue: any;
    newValue: any;
    changeType: 'added' | 'modified' | 'removed';
}
/**
 * Debug statistics
 */
export interface DebugStatistics {
    totalSessions: number;
    activeSessions: number;
    totalBreakpoints: number;
    totalWatchExpressions: number;
    totalEvents: number;
    uptime: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
}
/**
 * Debug command
 */
export interface DebugCommand {
    type: 'continue' | 'step' | 'stepIn' | 'stepOut' | 'pause' | 'stop' | 'restart';
    sessionId: string;
    parameters?: any;
}
/**
 * Debug response
 */
export interface DebugResponse {
    success: boolean;
    data?: any;
    error?: string;
    timestamp: Date;
}
/**
 * Debug statistics
 */
export interface DebugStatistics {
    totalSessions: number;
    activeSessions: number;
    totalBreakpoints: number;
    totalWatchExpressions: number;
    totalEvents: number;
    uptime: number;
    memoryUsage: {
        used: number;
        total: number;
        percentage: number;
    };
}
//# sourceMappingURL=debug.d.ts.map