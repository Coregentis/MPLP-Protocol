/**
 * @fileoverview Development server command
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Development server command
 */
export declare class DevCommand extends BaseCommand {
    readonly name = "dev";
    readonly description = "Start the development server";
    readonly aliases: string[];
    readonly arguments: never[];
    readonly options: ({
        flags: string;
        description: string;
        defaultValue: string;
    } | {
        flags: string;
        description: string;
        defaultValue?: undefined;
    })[];
    readonly examples: string[];
    private devServer?;
    constructor(context: any);
    /**
     * Execute the dev command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Validate we're in a project directory
     */
    private validateProjectDirectory;
    /**
     * Get development server configuration
     */
    private getDevServerConfig;
    /**
     * Load custom configuration file
     */
    private loadCustomConfig;
    /**
     * Load project-specific configuration
     */
    private loadProjectConfig;
    /**
     * Validate development server configuration
     */
    private validateDevServerConfig;
    /**
     * Start development server
     */
    private startDevServer;
    /**
     * Show configuration summary
     */
    private showConfigurationSummary;
    /**
     * Show server information
     */
    private showServerInfo;
    /**
     * Setup graceful shutdown
     */
    private setupGracefulShutdown;
    /**
     * Keep the process alive
     */
    private keepAlive;
}
//# sourceMappingURL=DevCommand.d.ts.map