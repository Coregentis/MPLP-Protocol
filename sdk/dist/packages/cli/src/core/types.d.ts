/**
 * @fileoverview Core types for MPLP CLI
 */
import { Command } from 'commander';
/**
 * CLI command interface
 */
export interface CLICommand {
    readonly name: string;
    readonly description: string;
    readonly aliases?: string[];
    readonly options?: CLIOption[];
    readonly arguments?: CLIArgument[];
    readonly examples?: string[];
    execute(args: CLICommandArgs): Promise<void>;
}
/**
 * CLI command option
 */
export interface CLIOption {
    readonly flags: string;
    readonly description: string;
    readonly defaultValue?: unknown;
    readonly required?: boolean;
    readonly choices?: string[];
}
/**
 * CLI command argument
 */
export interface CLIArgument {
    readonly name: string;
    readonly description: string;
    readonly required?: boolean;
    readonly variadic?: boolean;
}
/**
 * CLI command arguments and options
 */
export interface CLICommandArgs {
    readonly args: string[];
    readonly options: Record<string, unknown>;
    readonly command: Command;
}
/**
 * CLI configuration
 */
export interface CLIConfig {
    readonly name: string;
    readonly version: string;
    readonly description: string;
    commands: CLICommand[];
    readonly globalOptions?: CLIOption[];
}
/**
 * Project template configuration
 */
export interface ProjectTemplate {
    readonly name: string;
    readonly description: string;
    readonly type: 'basic' | 'advanced' | 'enterprise';
    readonly files: TemplateFile[];
    readonly dependencies: string[];
    readonly devDependencies: string[];
    readonly scripts: Record<string, string>;
    readonly postInstall?: string[];
}
/**
 * Template file definition
 */
export interface TemplateFile {
    readonly path: string;
    readonly content: string;
    readonly template?: boolean;
    readonly executable?: boolean;
}
/**
 * Project creation options
 */
export interface ProjectOptions {
    readonly name: string;
    readonly template: string;
    readonly directory?: string;
    readonly description?: string;
    readonly author?: string;
    readonly license?: string;
    readonly git?: boolean;
    readonly install?: boolean;
    readonly typescript?: boolean;
    readonly eslint?: boolean;
    readonly prettier?: boolean;
}
/**
 * CLI context for command execution
 */
export interface CLIContext {
    readonly cwd: string;
    readonly config: CLIConfig;
    readonly logger: CLILogger;
    readonly spinner: CLISpinner;
}
/**
 * CLI logger interface
 */
export interface CLILogger {
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    success(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    log(message: string, ...args: unknown[]): void;
    header(message: string): void;
    subheader(message: string): void;
    list(items: string[], bullet?: string): void;
    table(data: Record<string, string>, indent?: number): void;
    code(code: string, language?: string): void;
    command(command: string, description?: string): void;
    commands(commands: Array<{
        command: string;
        description?: string;
    }>): void;
    banner(message: string, width?: number): void;
    colored(color: string, text: string): string;
    newline(): void;
}
/**
 * CLI spinner interface
 */
export interface CLISpinner {
    start(text?: string): void;
    stop(): void;
    succeed(text?: string): void;
    fail(text?: string): void;
    warn(text?: string): void;
    info(text?: string): void;
    text: string;
    isSpinning: boolean;
}
/**
 * CLI error types
 */
export declare class CLIError extends Error {
    readonly code?: string | undefined;
    readonly exitCode: number;
    constructor(message: string, code?: string | undefined, exitCode?: number);
}
export declare class CommandNotFoundError extends CLIError {
    constructor(command: string);
}
export declare class InvalidArgumentError extends CLIError {
    constructor(argument: string, reason: string);
}
export declare class ProjectCreationError extends CLIError {
    constructor(message: string, cause?: Error);
}
export declare class TemplateNotFoundError extends CLIError {
    constructor(template: string);
}
/**
 * CLI validation result
 */
export interface ValidationResult {
    readonly valid: boolean;
    readonly errors: string[];
    readonly warnings: string[];
}
/**
 * File system operations interface
 */
export interface FileSystemOperations {
    exists(path: string): boolean;
    readFile(path: string, encoding?: BufferEncoding): string;
    writeFile(path: string, content: string, encoding?: BufferEncoding): void;
    mkdir(path: string, recursive?: boolean): void;
    readdir(path: string): string[];
    stat(path: string): {
        isDirectory(): boolean;
        isFile(): boolean;
    };
    copy(src: string, dest: string): void;
    remove(path: string): void;
}
/**
 * Package manager interface
 */
export interface PackageManager {
    readonly name: 'npm' | 'yarn' | 'pnpm';
    install(cwd: string, packages?: string[]): Promise<void>;
    run(cwd: string, script: string): Promise<void>;
    init(cwd: string): Promise<void>;
}
/**
 * Git operations interface
 */
export interface GitOperations {
    init(cwd: string): Promise<void>;
    add(cwd: string, files: string[]): Promise<void>;
    commit(cwd: string, message: string): Promise<void>;
    isRepository(cwd: string): boolean;
    getConfig(key: string): Promise<string | undefined>;
}
/**
 * Environment information
 */
export interface EnvironmentInfo {
    readonly nodeVersion: string;
    readonly npmVersion: string;
    readonly platform: string;
    readonly arch: string;
    readonly cwd: string;
    readonly home: string;
}
/**
 * CLI metrics and analytics
 */
export interface CLIMetrics {
    commandExecuted(command: string, duration: number, success: boolean): void;
    projectCreated(template: string, options: ProjectOptions): void;
    error(error: Error, command?: string): void;
}
/**
 * Plugin interface for extending CLI functionality
 */
export interface CLIPlugin {
    readonly name: string;
    readonly version: string;
    readonly commands?: CLICommand[];
    readonly hooks?: CLIHooks;
    initialize?(context: CLIContext): Promise<void>;
}
/**
 * CLI hooks for plugin system
 */
export interface CLIHooks {
    beforeCommand?(command: string, args: CLICommandArgs): Promise<void>;
    afterCommand?(command: string, args: CLICommandArgs, result: unknown): Promise<void>;
    onError?(error: Error, command?: string): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map