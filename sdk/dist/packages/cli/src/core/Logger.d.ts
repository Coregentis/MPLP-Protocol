/**
 * @fileoverview CLI Logger implementation
 */
import { CLILogger } from './types';
/**
 * CLI Logger implementation
 */
export declare class Logger implements CLILogger {
    private readonly debugEnabled;
    constructor();
    /**
     * Log an info message
     */
    info(message: string, ...args: unknown[]): void;
    /**
     * Log a warning message
     */
    warn(message: string, ...args: unknown[]): void;
    /**
     * Log an error message
     */
    error(message: string, ...args: unknown[]): void;
    /**
     * Log a success message
     */
    success(message: string, ...args: unknown[]): void;
    /**
     * Log a debug message (only in debug mode)
     */
    debug(message: string, ...args: unknown[]): void;
    /**
     * Log a plain message
     */
    log(message: string, ...args: unknown[]): void;
    /**
     * Log a message with custom color
     */
    colored(color: string, text: string): string;
    /**
     * Log a header message
     */
    header(message: string): void;
    /**
     * Log a subheader message
     */
    subheader(message: string): void;
    /**
     * Log a list of items
     */
    list(items: string[], bullet?: string): void;
    /**
     * Log a table of key-value pairs
     */
    table(data: Record<string, string>, indent?: number): void;
    /**
     * Log a progress message
     */
    progress(current: number, total: number, message: string): void;
    /**
     * Create a progress bar
     */
    private createProgressBar;
    /**
     * Log a code block
     */
    code(code: string, language?: string): void;
    /**
     * Log a command example
     */
    command(command: string, description?: string): void;
    /**
     * Log multiple command examples
     */
    commands(commands: Array<{
        command: string;
        description?: string;
    }>): void;
    /**
     * Clear the console
     */
    clear(): void;
    /**
     * Log a separator line
     */
    separator(char?: string, length?: number): void;
    /**
     * Log an empty line
     */
    newline(): void;
    /**
     * Log multiple empty lines
     */
    newlines(count: number): void;
    /**
     * Log a banner message
     */
    banner(message: string, width?: number): void;
    /**
     * Check if debug mode is enabled
     */
    isDebugEnabled(): boolean;
    /**
     * Set debug mode
     */
    setDebugMode(enabled: boolean): void;
}
//# sourceMappingURL=Logger.d.ts.map