"use strict";
/**
 * @fileoverview Debug Manager - Central debugging coordinator
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugManager = void 0;
const events_1 = require("events");
const AgentDebugger_1 = require("./AgentDebugger");
const WorkflowDebugger_1 = require("./WorkflowDebugger");
const ProtocolInspector_1 = require("./ProtocolInspector");
const StateInspector_1 = require("./StateInspector");
/**
 * Central debugging coordinator for MPLP applications
 */
class DebugManager extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.sessions = new Map();
        this.isActive = false;
        this.config = {
            enabled: true,
            logLevel: 'info',
            breakpoints: [],
            watchExpressions: [],
            ...config
        };
        this.agentDebugger = new AgentDebugger_1.AgentDebugger(this.config);
        this.workflowDebugger = new WorkflowDebugger_1.WorkflowDebugger(this.config);
        this.protocolInspector = new ProtocolInspector_1.ProtocolInspector(this.config);
        this.stateInspector = new StateInspector_1.StateInspector(this.config);
        this.setupEventHandlers();
    }
    /**
     * Start debugging session
     */
    async start() {
        if (this.isActive) {
            return;
        }
        try {
            await this.agentDebugger.start();
            await this.workflowDebugger.start();
            await this.protocolInspector.start();
            await this.stateInspector.start();
            this.isActive = true;
            this.emit('started');
            console.log('🐛 Debug Manager started');
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Stop debugging session
     */
    async stop() {
        if (!this.isActive) {
            return;
        }
        try {
            await this.agentDebugger.stop();
            await this.workflowDebugger.stop();
            await this.protocolInspector.stop();
            await this.stateInspector.stop();
            this.sessions.clear();
            this.isActive = false;
            this.emit('stopped');
            console.log('🐛 Debug Manager stopped');
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Create new debug session
     */
    createSession(sessionId, target) {
        if (this.sessions.has(sessionId)) {
            throw new Error(`Debug session '${sessionId}' already exists`);
        }
        const session = {
            id: sessionId,
            target,
            startTime: new Date(),
            breakpoints: [],
            watchExpressions: [],
            isActive: true,
            events: []
        };
        this.sessions.set(sessionId, session);
        this.emit('sessionCreated', session);
        return session;
    }
    /**
     * Get debug session
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * End debug session
     */
    endSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
            session.endTime = new Date();
            this.sessions.delete(sessionId);
            this.emit('sessionEnded', session);
        }
    }
    /**
     * Add breakpoint
     */
    addBreakpoint(sessionId, location, condition) {
        const session = this.getSession(sessionId);
        if (session) {
            const breakpoint = {
                id: `bp_${Date.now()}`,
                location,
                condition,
                enabled: true,
                hitCount: 0
            };
            session.breakpoints.push(breakpoint);
            this.emit('breakpointAdded', { sessionId, breakpoint });
        }
    }
    /**
     * Remove breakpoint
     */
    removeBreakpoint(sessionId, breakpointId) {
        const session = this.getSession(sessionId);
        if (session) {
            const index = session.breakpoints.findIndex(bp => bp.id === breakpointId);
            if (index !== -1) {
                const breakpoint = session.breakpoints.splice(index, 1)[0];
                this.emit('breakpointRemoved', { sessionId, breakpoint });
            }
        }
    }
    /**
     * Add watch expression
     */
    addWatchExpression(sessionId, expression) {
        const session = this.getSession(sessionId);
        if (session) {
            const watch = {
                id: `watch_${Date.now()}`,
                expression,
                enabled: true,
                lastValue: undefined,
                lastEvaluated: new Date()
            };
            session.watchExpressions.push(watch);
            this.emit('watchAdded', { sessionId, watch });
        }
    }
    /**
     * Get debugging statistics
     */
    getStatistics() {
        return {
            isActive: this.isActive,
            activeSessions: this.sessions.size,
            totalBreakpoints: Array.from(this.sessions.values())
                .reduce((total, session) => total + session.breakpoints.length, 0),
            totalWatchExpressions: Array.from(this.sessions.values())
                .reduce((total, session) => total + session.watchExpressions.length, 0),
            debuggers: {
                agent: this.agentDebugger.getStatistics(),
                workflow: this.workflowDebugger.getStatistics(),
                protocol: this.protocolInspector.getStatistics(),
                state: this.stateInspector.getStatistics()
            }
        };
    }
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Forward events from sub-debuggers
        this.agentDebugger.on('event', (event) => {
            this.emit('debugEvent', { source: 'agent', ...event });
        });
        this.workflowDebugger.on('event', (event) => {
            this.emit('debugEvent', { source: 'workflow', ...event });
        });
        this.protocolInspector.on('event', (event) => {
            this.emit('debugEvent', { source: 'protocol', ...event });
        });
        this.stateInspector.on('event', (event) => {
            this.emit('debugEvent', { source: 'state', ...event });
        });
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('configUpdated', this.config);
    }
}
exports.DebugManager = DebugManager;
//# sourceMappingURL=DebugManager.js.map