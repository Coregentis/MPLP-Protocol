/**
 * @fileoverview CLI Runner - Command line interface for dev tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */
/**
 * CLI runner for MPLP development tools
 */
export declare class CLIRunner {
    private program;
    private debugManager;
    private performanceAnalyzer;
    private monitoringDashboard;
    private devToolsServer;
    constructor();
    /**
     * Setup CLI commands
     */
    private setupCommands;
    /**
     * Handle debug command
     */
    private handleDebugCommand;
    /**
     * Handle performance command
     */
    private handlePerformanceCommand;
    /**
     * Handle monitoring command
     */
    private handleMonitoringCommand;
    /**
     * Handle server command
     */
    private handleServerCommand;
    /**
     * Handle status command
     */
    private handleStatusCommand;
    /**
     * Handle start all command
     */
    private handleStartAllCommand;
    /**
     * Handle stop all command
     */
    private handleStopAllCommand;
    /**
     * Run CLI
     */
    run(argv?: string[]): Promise<void>;
}
//# sourceMappingURL=CLIRunner.d.ts.map