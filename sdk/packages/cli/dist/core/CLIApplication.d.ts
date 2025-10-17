/**
 * @fileoverview Main CLI Application class with Enterprise Features
 */
import { CLIConfig, CLICommand, CLIContext, CommandHistory, PluginInfo, BatchOperation, PerformanceMetric, AuditLogEntry } from './types';
/**
 * Main CLI Application class with Enterprise Features
 */
export declare class CLIApplication {
    private readonly config;
    private readonly program;
    private readonly context;
    private readonly commands;
    private readonly commandHistory;
    private readonly plugins;
    private readonly performanceMetrics;
    private readonly auditLog;
    private readonly batchOperations;
    private interactiveMode;
    private readonly historyFile;
    private readonly configDir;
    constructor(config: CLIConfig);
    /**
     * Setup the commander program
     */
    private setupProgram;
    /**
     * Register all commands
     */
    private registerCommands;
    /**
     * Register a single command
     */
    private registerCommand;
    /**
     * Run the CLI application
     */
    run(argv?: string[]): Promise<void>;
    /**
     * Handle errors
     */
    private handleError;
    /**
     * Show environment information
     */
    private showEnvironmentInfo;
    /**
     * Get environment information
     */
    private getEnvironmentInfo;
    /**
     * Get CLI context
     */
    getContext(): CLIContext;
    /**
     * Get registered commands
     */
    getCommands(): Map<string, CLICommand>;
    /**
     * Add a command dynamically
     */
    addCommand(command: CLICommand): void;
    /**
     * Remove a command
     */
    removeCommand(name: string): boolean;
    /**
     * Ensure config directory exists
     */
    private ensureConfigDir;
    /**
     * Load command history from file
     */
    private loadCommandHistory;
    /**
     * Save command history to file
     */
    private saveCommandHistory;
    /**
     * Add command to history
     */
    private addToHistory;
    /**
     * Get command history
     */
    getCommandHistory(limit?: number): CommandHistory[];
    /**
     * Clear command history
     */
    clearCommandHistory(): void;
    /**
     * Load plugins from plugins directory
     */
    private loadPlugins;
    /**
     * Install a plugin
     */
    installPlugin(name: string, source: string): Promise<void>;
    /**
     * Uninstall a plugin
     */
    uninstallPlugin(name: string): boolean;
    /**
     * List installed plugins
     */
    getPlugins(): PluginInfo[];
    /**
     * Record performance metric
     */
    recordPerformanceMetric(command: string, duration: number, success: boolean, metadata?: Record<string, any>): void;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(command?: string): Record<string, PerformanceMetric[]>;
    /**
     * Get performance analytics
     */
    getPerformanceAnalytics(command?: string): Record<string, any>;
    /**
     * Add audit log entry
     */
    private addAuditLogEntry;
    /**
     * Get audit log
     */
    getAuditLog(limit?: number): AuditLogEntry[];
    /**
     * Create batch operation
     */
    createBatchOperation(name: string, commands: Array<{
        command: string;
        args: string[];
        options: Record<string, any>;
    }>): string;
    /**
     * Execute batch operation
     */
    executeBatchOperation(batchId: string): Promise<BatchOperation>;
    /**
     * Get batch operations
     */
    getBatchOperations(): BatchOperation[];
    /**
     * Start interactive mode
     */
    startInteractiveMode(): Promise<void>;
    /**
     * Get command suggestions for auto-completion
     */
    getCommandSuggestions(partial: string): string[];
    /**
     * Enhanced run method with enterprise features
     */
    runWithEnterpriseFeatures(argv?: string[]): Promise<void>;
}
//# sourceMappingURL=CLIApplication.d.ts.map