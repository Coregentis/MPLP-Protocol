/**
 * @fileoverview Main CLI Application class
 */
import { CLIConfig, CLICommand, CLIContext } from './types';
/**
 * Main CLI Application class
 */
export declare class CLIApplication {
    private readonly config;
    private readonly program;
    private readonly context;
    private readonly commands;
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
}
//# sourceMappingURL=CLIApplication.d.ts.map