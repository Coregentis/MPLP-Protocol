/**
 * @fileoverview Info command for displaying project and environment information
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Info command for displaying project and environment information
 */
export declare class InfoCommand extends BaseCommand {
    readonly name = "info";
    readonly description = "Display project and environment information";
    readonly aliases: string[];
    readonly options: {
        flags: string;
        description: string;
    }[];
    readonly examples: string[];
    private packageManager;
    private gitOps;
    constructor(context: any);
    /**
     * Execute the info command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Get environment information
     */
    private getEnvironmentInfo;
    /**
     * Get project information
     */
    private getProjectInfo;
    /**
     * Get Git information for the project
     */
    private getGitInfo;
    /**
     * Get MPLP dependencies
     */
    private getMPLPDependencies;
    /**
     * Get project structure
     */
    private getProjectStructure;
    /**
     * Get directory information
     */
    private getDirectoryInfo;
    /**
     * Display environment information
     */
    private displayEnvironmentInfo;
    /**
     * Display project information
     */
    private displayProjectInfo;
}
//# sourceMappingURL=InfoCommand.d.ts.map