/**
 * @fileoverview Base command class for CLI commands
 */
import { CLICommand, CLICommandArgs, CLIContext, CLILogger, CLISpinner } from '../core/types';
/**
 * Base class for CLI commands
 */
export declare abstract class BaseCommand implements CLICommand {
    abstract readonly name: string;
    abstract readonly description: string;
    readonly aliases?: string[];
    readonly options?: Array<{
        readonly flags: string;
        readonly description: string;
        readonly defaultValue?: unknown;
        readonly required?: boolean;
        readonly choices?: string[];
    }>;
    readonly arguments?: Array<{
        readonly name: string;
        readonly description: string;
        readonly required?: boolean;
        readonly variadic?: boolean;
    }>;
    readonly examples?: string[];
    protected logger: CLILogger;
    protected spinner: CLISpinner;
    protected context: CLIContext;
    constructor(context: CLIContext);
    /**
     * Execute the command
     */
    abstract execute(args: CLICommandArgs): Promise<void>;
    /**
     * Validate command arguments and options
     */
    protected validate(args: CLICommandArgs): void;
    /**
     * Extract option name from flags
     */
    private extractOptionName;
    /**
     * Show help for this command
     */
    protected showHelp(): void;
    /**
     * Get option value with type safety
     */
    protected getOption<T = unknown>(args: CLICommandArgs, name: string, defaultValue?: T): T;
    /**
     * Get argument value with bounds checking
     */
    protected getArgument(args: CLICommandArgs, index: number, defaultValue?: string): string;
    /**
     * Check if option is present
     */
    protected hasOption(args: CLICommandArgs, name: string): boolean;
    /**
     * Get all arguments as array
     */
    protected getArguments(args: CLICommandArgs): string[];
    /**
     * Get all options as object
     */
    protected getOptions(args: CLICommandArgs): Record<string, unknown>;
    /**
     * Start a spinner with message
     */
    protected startSpinner(message: string): void;
    /**
     * Stop spinner with success
     */
    protected succeedSpinner(message?: string): void;
    /**
     * Stop spinner with failure
     */
    protected failSpinner(message?: string): void;
    /**
     * Update spinner text
     */
    protected updateSpinner(message: string): void;
    /**
     * Log info message
     */
    protected info(message: string, ...args: unknown[]): void;
    /**
     * Log success message
     */
    protected success(message: string, ...args: unknown[]): void;
    /**
     * Log warning message
     */
    protected warn(message: string, ...args: unknown[]): void;
    /**
     * Log error message
     */
    protected error(message: string, ...args: unknown[]): void;
    /**
     * Log debug message
     */
    protected debug(message: string, ...args: unknown[]): void;
    /**
     * Execute with error handling
     */
    protected executeWithErrorHandling(operation: () => Promise<void>, errorMessage?: string): Promise<void>;
    /**
     * Execute with spinner
     */
    protected executeWithSpinner<T>(operation: () => Promise<T>, startMessage: string, successMessage?: string, errorMessage?: string): Promise<T>;
    /**
     * Prompt user for confirmation
     */
    protected confirm(message: string, defaultValue?: boolean): Promise<boolean>;
    /**
     * Prompt user for input
     */
    protected prompt(message: string, defaultValue?: string): Promise<string>;
    /**
     * Prompt user to select from choices
     */
    protected select(message: string, choices: string[], defaultValue?: string): Promise<string>;
}
//# sourceMappingURL=BaseCommand.d.ts.map