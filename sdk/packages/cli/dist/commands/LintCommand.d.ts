/**
 * @fileoverview Lint command for code quality checking in MPLP projects
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha代码质量标准
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Lint command for code quality checking
 */
export declare class LintCommand extends BaseCommand {
    readonly name = "lint";
    readonly description = "Run linting and code quality checks";
    readonly aliases: string[];
    readonly arguments: {
        name: string;
        description: string;
        required: boolean;
    }[];
    readonly options: ({
        flags: string;
        description: string;
        defaultValue?: undefined;
        choices?: undefined;
    } | {
        flags: string;
        description: string;
        defaultValue: string;
        choices?: undefined;
    } | {
        flags: string;
        description: string;
        choices: string[];
        defaultValue: string;
    })[];
    readonly examples: string[];
    constructor(context: any);
    /**
     * Execute the lint command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Validate we're in a project directory
     */
    private validateProjectDirectory;
    /**
     * Get lint configuration
     */
    private getLintConfig;
    /**
     * Run linting
     */
    private runLinting;
    /**
     * Show lint configuration
     */
    private showLintConfiguration;
    /**
     * Run ESLint
     */
    private runESLint;
    /**
     * Run TypeScript compiler check
     */
    private runTypeScriptCheck;
    /**
     * Run Prettier check
     */
    private runPrettierCheck;
    /**
     * Build ESLint arguments
     */
    private buildESLintArgs;
    /**
     * Find ESLint executable
     */
    private findESLintExecutable;
    /**
     * Find TypeScript executable
     */
    private findTypeScriptExecutable;
    /**
     * Find Prettier executable
     */
    private findPrettierExecutable;
    /**
     * Run a command and return exit code
     */
    private runCommand;
}
//# sourceMappingURL=LintCommand.d.ts.map