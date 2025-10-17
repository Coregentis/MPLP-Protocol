/**
 * @fileoverview Generate command for creating code from templates
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Generate command for creating code from templates
 */
export declare class GenerateCommand extends BaseCommand {
    readonly name = "generate";
    readonly description = "Generate code from templates";
    readonly aliases: string[];
    readonly arguments: {
        name: string;
        description: string;
        required: boolean;
    }[];
    readonly options: ({
        flags: string;
        description: string;
        choices?: undefined;
    } | {
        flags: string;
        description: string;
        choices: string[];
    })[];
    readonly examples: string[];
    private generatorManager;
    constructor(context: any);
    /**
     * Execute the generate command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Validate we're in a project directory
     */
    private validateProjectDirectory;
    /**
     * Get generation options from arguments and prompts
     */
    private getGenerationOptions;
    /**
     * Validate generation options
     */
    private validateGenerationOptions;
    /**
     * Show dry run output
     */
    private showDryRun;
    /**
     * Generate code
     */
    private generateCode;
    /**
     * Show success message
     */
    private showSuccessMessage;
}
//# sourceMappingURL=GenerateCommand.d.ts.map