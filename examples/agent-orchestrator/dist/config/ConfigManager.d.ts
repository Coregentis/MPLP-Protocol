/**
 * @fileoverview Configuration Manager for Agent Orchestrator
 * @version 1.1.0-beta
 */
import { Logger } from '@mplp/core';
import { AgentOrchestratorConfig } from '../types';
/**
 * Configuration Manager - 基于MPLP V1.0 Alpha配置管理模式
 */
export declare class ConfigManager {
    private logger;
    private config;
    constructor(logger: Logger);
    /**
     * Load configuration from environment and files
     */
    loadConfig(): Promise<AgentOrchestratorConfig>;
    /**
     * Get current configuration
     */
    getConfig(): AgentOrchestratorConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<AgentOrchestratorConfig>): void;
    /**
     * Create default configuration
     */
    private createDefaultConfig;
    /**
     * Load configuration from environment variables
     */
    private loadFromEnvironment;
    /**
     * Load configuration from files
     */
    private loadFromFiles;
    /**
     * Validate configuration
     */
    private validateConfig;
}
//# sourceMappingURL=ConfigManager.d.ts.map