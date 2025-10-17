/**
 * @fileoverview Build command for compiling MPLP projects
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha构建模式
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Build command for compiling MPLP projects
 */
export declare class BuildCommand extends BaseCommand {
    readonly name = "build";
    readonly description = "Build the project for production";
    readonly aliases: string[];
    readonly arguments: any[];
    readonly options: ({
        flags: string;
        description: string;
        defaultValue: string;
        choices?: undefined;
    } | {
        flags: string;
        description: string;
        choices: string[];
        defaultValue: string;
    } | {
        flags: string;
        description: string;
        defaultValue?: undefined;
        choices?: undefined;
    })[];
    readonly examples: string[];
    constructor(context: any);
    /**
     * Execute the build command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Validate we're in a project directory
     */
    private validateProjectDirectory;
    /**
     * Get build configuration
     */
    private getBuildConfig;
    /**
     * Validate build configuration
     */
    private validateBuildConfig;
    /**
     * Start build process
     */
    private startBuild;
    /**
     * Show build configuration
     */
    private showBuildConfiguration;
    /**
     * Show build results
     */
    private showBuildResults;
    /**
     * Format file size
     */
    private formatFileSize;
    /**
     * Keep the process alive for watch mode
     */
    private keepAlive;
}
//# sourceMappingURL=BuildCommand.d.ts.map