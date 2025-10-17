/**
 * @fileoverview Init command for creating new MPLP projects
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Init command for creating new MPLP projects
 */
export declare class InitCommand extends BaseCommand {
    readonly name = "init";
    readonly description = "Create a new MPLP project";
    readonly aliases: string[];
    readonly arguments: {
        name: string;
        description: string;
        required: boolean;
    }[];
    readonly options: ({
        flags: string;
        description: string;
        defaultValue: string;
        choices: string[];
    } | {
        flags: string;
        description: string;
        defaultValue?: undefined;
        choices?: undefined;
    } | {
        flags: string;
        description: string;
        defaultValue: string;
        choices?: undefined;
    })[];
    readonly examples: string[];
    private templateManager;
    private packageManager;
    private gitOps;
    constructor(context: any);
    /**
     * Execute the init command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Get project options from arguments and prompts
     */
    private getProjectOptions;
    /**
     * Validate project options
     */
    private validateProjectOptions;
    /**
     * Create the project
     */
    private createProject;
    /**
     * Initialize Git repository
     */
    private initializeGit;
    /**
     * Install dependencies
     */
    private installDependencies;
    /**
     * Get default author from Git config
     */
    private getDefaultAuthor;
    /**
     * Show success message
     */
    private showSuccessMessage;
}
//# sourceMappingURL=InitCommand.d.ts.map