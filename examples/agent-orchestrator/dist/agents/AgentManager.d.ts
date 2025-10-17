/**
 * @fileoverview Agent Manager for Agent Orchestrator
 * @version 1.1.0-beta
 */
import { Logger } from '@mplp/core';
import { AgentDeploymentConfig } from '../types';
/**
 * Agent Manager - 基于MPLP V1.0 Alpha智能体管理模式
 */
export declare class AgentManager {
    private logger;
    private deployments;
    private isRunning;
    constructor(logger: Logger);
    /**
     * Initialize agent manager
     */
    initialize(agentConfigs: AgentDeploymentConfig[]): Promise<void>;
    /**
     * Start agent manager
     */
    start(): Promise<void>;
    /**
     * Stop agent manager
     */
    stop(): Promise<void>;
    /**
     * Deploy an agent
     */
    deployAgent(config: AgentDeploymentConfig): Promise<string>;
    /**
     * Scale an agent deployment
     */
    scaleAgent(agentId: string, replicas: number): Promise<void>;
    /**
     * Get agent deployment
     */
    getDeployment(agentId: string): AgentDeploymentConfig | undefined;
    /**
     * List all deployments
     */
    listDeployments(): AgentDeploymentConfig[];
    /**
     * Validate deployment configuration
     */
    private validateDeploymentConfig;
    /**
     * Execute deployment based on strategy
     */
    private executeDeployment;
    /**
     * Deploy single instance
     */
    private deploySingle;
    /**
     * Deploy replicated instances
     */
    private deployReplicated;
    /**
     * Deploy distributed instances
     */
    private deployDistributed;
    /**
     * Deploy load balanced instances
     */
    private deployLoadBalanced;
    /**
     * Execute scaling operation
     */
    private executeScaling;
    /**
     * Scale up agent instances
     */
    private scaleUp;
    /**
     * Scale down agent instances
     */
    private scaleDown;
    /**
     * Simulate deployment for demo purposes
     */
    private simulateDeployment;
    /**
     * Simulate scaling for demo purposes
     */
    private simulateScaling;
    /**
     * Start agent monitoring
     */
    private startAgentMonitoring;
    /**
     * Monitor agent health and performance
     */
    private monitorAgents;
    /**
     * Check agent health
     */
    private checkAgentHealth;
    /**
     * Monitor resource usage
     */
    private monitorResourceUsage;
    /**
     * Check scaling conditions
     */
    private checkScalingConditions;
}
//# sourceMappingURL=AgentManager.d.ts.map