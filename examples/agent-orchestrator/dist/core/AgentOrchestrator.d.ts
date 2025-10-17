/**
 * @fileoverview Agent Orchestrator - Enterprise multi-agent orchestration platform
 * @version 1.1.0-beta
 */
import { EventEmitter } from 'events';
import { AgentOrchestratorConfig, OrchestratorStatus, SystemMetrics, AgentDeploymentConfig } from '../types';
export type { OrchestratorStatus };
/**
 * Agent Orchestrator - Enterprise multi-agent orchestration platform built with MPLP SDK
 *
 * Features:
 * - Multi-agent deployment and lifecycle management
 * - Advanced workflow orchestration and execution
 * - Real-time monitoring and performance tracking
 * - Intelligent resource allocation and scaling
 * - Enterprise security and compliance features
 * - Distributed agent coordination and communication
 * - Fault tolerance and disaster recovery
 *
 * @example
 * ```typescript
 * const config: AgentOrchestratorConfig = {
 *   name: 'MyAgentOrchestrator',
 *   version: '1.1.0-beta',
 *   // ... other config
 * };
 *
 * const orchestrator = new AgentOrchestrator(config);
 * await orchestrator.initialize();
 * await orchestrator.start();
 * ```
 */
export declare class AgentOrchestrator extends EventEmitter {
    private app;
    private orchestrator;
    private logger;
    private configManager;
    private agentManager;
    private workflowManager;
    private config;
    private status;
    private agents;
    private startTime?;
    private metrics;
    constructor(config: AgentOrchestratorConfig);
    /**
     * Initialize the orchestrator platform
     */
    initialize(): Promise<void>;
    /**
     * Start the orchestrator platform
     */
    start(): Promise<void>;
    /**
     * Stop the orchestrator platform
     */
    stop(): Promise<void>;
    /**
     * Get orchestrator status
     */
    getStatus(): OrchestratorStatus;
    /**
     * Get system metrics
     */
    getMetrics(): SystemMetrics;
    /**
     * Deploy an agent
     */
    deployAgent(deploymentConfig: AgentDeploymentConfig): Promise<string>;
    /**
     * Execute a workflow
     */
    executeWorkflow(workflowId: string, parameters?: Record<string, unknown>): Promise<string>;
    /**
     * Scale agent deployment
     */
    scaleAgent(agentId: string, replicas: number): Promise<void>;
    /**
     * Get orchestrator configuration
     */
    getConfig(): AgentOrchestratorConfig;
    /**
     * Update orchestrator configuration
     */
    updateConfig(updates: Partial<AgentOrchestratorConfig>): Promise<void>;
    /**
     * Deploy agents based on configuration
     */
    private deployAgents;
    /**
     * Create an agent from deployment configuration
     */
    private createAgent;
    /**
     * Setup workflows
     */
    private setupWorkflows;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Get uptime in seconds
     */
    private getUptime;
    /**
     * Calculate response time
     */
    private calculateResponseTime;
    /**
     * Calculate throughput
     */
    private calculateThroughput;
    /**
     * Calculate error rate
     */
    private calculateErrorRate;
    /**
     * Update metrics
     */
    private updateMetrics;
    /**
     * Reinitialize orchestrator with new configuration
     */
    private reinitialize;
    /**
     * Setup graceful shutdown
     */
    private setupGracefulShutdown;
}
//# sourceMappingURL=AgentOrchestrator.d.ts.map