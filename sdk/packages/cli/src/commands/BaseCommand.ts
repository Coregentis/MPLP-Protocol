/**
 * @fileoverview Base command class for CLI commands
 */

import { CLICommand, CLICommandArgs, CLIContext, CLILogger, CLISpinner } from '../core/types';

/**
 * Base class for CLI commands
 */
export abstract class BaseCommand implements CLICommand {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public readonly aliases?: string[];
  public readonly options?: Array<{
    readonly flags: string;
    readonly description: string;
    readonly defaultValue?: unknown;
    readonly required?: boolean;
    readonly choices?: string[];
  }>;
  public readonly arguments?: Array<{
    readonly name: string;
    readonly description: string;
    readonly required?: boolean;
    readonly variadic?: boolean;
  }>;
  public readonly examples?: string[];

  protected logger: CLILogger;
  protected spinner: CLISpinner;
  protected context: CLIContext;

  constructor(context: CLIContext) {
    this.context = context;
    this.logger = context.logger;
    this.spinner = context.spinner;
  }

  /**
   * Execute the command
   */
  public abstract execute(args: CLICommandArgs): Promise<void>;

  /**
   * Validate command arguments and options
   */
  protected validate(args: CLICommandArgs): void {
    // Validate required arguments
    if (this.arguments) {
      const requiredArgs = this.arguments.filter(arg => arg.required);
      if (args.args.length < requiredArgs.length) {
        const missingArgs = requiredArgs.slice(args.args.length);
        throw new Error(`Missing required arguments: ${missingArgs.map(arg => arg.name).join(', ')}`);
      }
    }

    // Validate required options
    if (this.options) {
      const requiredOptions = this.options.filter(opt => opt.required);
      for (const option of requiredOptions) {
        const optionName = this.extractOptionName(option.flags);
        if (!(optionName in args.options)) {
          throw new Error(`Missing required option: ${option.flags}`);
        }
      }
    }
  }

  /**
   * Extract option name from flags
   */
  private extractOptionName(flags: string): string {
    const match = flags.match(/--([a-zA-Z0-9-]+)/);
    return match ? match[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) : '';
  }

  /**
   * Show help for this command
   */
  protected showHelp(): void {
    this.logger.header(`${this.name} - ${this.description}`);

    // Show usage
    let usage = `${this.context.config.name} ${this.name}`;
    
    if (this.arguments) {
      for (const arg of this.arguments) {
        const argName = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
        const argSpec = arg.variadic ? `${argName}...` : argName;
        usage += ` ${argSpec}`;
      }
    }

    if (this.options && this.options.length > 0) {
      usage += ' [options]';
    }

    this.logger.log(`Usage: ${usage}`);

    // Show arguments
    if (this.arguments && this.arguments.length > 0) {
      this.logger.subheader('Arguments:');
      for (const arg of this.arguments) {
        const required = arg.required ? ' (required)' : '';
        const variadic = arg.variadic ? ' (variadic)' : '';
        this.logger.log(`  ${arg.name}${required}${variadic} - ${arg.description}`);
      }
    }

    // Show options
    if (this.options && this.options.length > 0) {
      this.logger.subheader('Options:');
      for (const option of this.options) {
        const required = option.required ? ' (required)' : '';
        const defaultValue = option.defaultValue !== undefined ? ` (default: ${option.defaultValue})` : '';
        const choices = option.choices ? ` (choices: ${option.choices.join(', ')})` : '';
        this.logger.log(`  ${option.flags}${required}${defaultValue}${choices} - ${option.description}`);
      }
    }

    // Show examples
    if (this.examples && this.examples.length > 0) {
      this.logger.subheader('Examples:');
      this.logger.commands(this.examples.map(example => ({ command: example })));
    }
  }

  /**
   * Get option value with type safety
   */
  protected getOption<T = unknown>(args: CLICommandArgs, name: string, defaultValue?: T): T {
    const value = args.options[name];
    return value !== undefined ? (value as T) : (defaultValue as T);
  }

  /**
   * Get argument value with bounds checking
   */
  protected getArgument(args: CLICommandArgs, index: number, defaultValue?: string): string {
    return args.args[index] || defaultValue || '';
  }

  /**
   * Check if option is present
   */
  protected hasOption(args: CLICommandArgs, name: string): boolean {
    return name in args.options;
  }

  /**
   * Get all arguments as array
   */
  protected getArguments(args: CLICommandArgs): string[] {
    return [...args.args];
  }

  /**
   * Get all options as object
   */
  protected getOptions(args: CLICommandArgs): Record<string, unknown> {
    return { ...args.options };
  }

  /**
   * Start a spinner with message
   */
  protected startSpinner(message: string): void {
    this.spinner.start(message);
  }

  /**
   * Stop spinner with success
   */
  protected succeedSpinner(message?: string): void {
    this.spinner.succeed(message);
  }

  /**
   * Stop spinner with failure
   */
  protected failSpinner(message?: string): void {
    this.spinner.fail(message);
  }

  /**
   * Update spinner text
   */
  protected updateSpinner(message: string): void {
    this.spinner.text = message;
  }

  /**
   * Log info message
   */
  protected info(message: string, ...args: unknown[]): void {
    this.logger.info(message, ...args);
  }

  /**
   * Log success message
   */
  protected success(message: string, ...args: unknown[]): void {
    this.logger.success(message, ...args);
  }

  /**
   * Log warning message
   */
  protected warn(message: string, ...args: unknown[]): void {
    this.logger.warn(message, ...args);
  }

  /**
   * Log error message
   */
  protected error(message: string, ...args: unknown[]): void {
    this.logger.error(message, ...args);
  }

  /**
   * Log debug message
   */
  protected debug(message: string, ...args: unknown[]): void {
    this.logger.debug(message, ...args);
  }

  /**
   * Execute with error handling
   */
  protected async executeWithErrorHandling(
    operation: () => Promise<void>,
    errorMessage: string = 'Operation failed'
  ): Promise<void> {
    try {
      await operation();
    } catch (error) {
      this.failSpinner();
      this.error(`${errorMessage}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Execute with spinner
   */
  protected async executeWithSpinner<T>(
    operation: () => Promise<T>,
    startMessage: string,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T> {
    this.startSpinner(startMessage);
    
    try {
      const result = await operation();
      this.succeedSpinner(successMessage);
      return result;
    } catch (error) {
      this.failSpinner(errorMessage);
      throw error;
    }
  }

  /**
   * Prompt user for confirmation
   */
  protected async confirm(message: string, defaultValue: boolean = false): Promise<boolean> {
    const inquirer = require('inquirer');
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: defaultValue
      }
    ]);
    return confirmed;
  }

  /**
   * Prompt user for input
   */
  protected async prompt(message: string, defaultValue?: string): Promise<string> {
    const inquirer = require('inquirer');
    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message,
        default: defaultValue
      }
    ]);
    return value;
  }

  /**
   * Prompt user to select from choices
   */
  protected async select(message: string, choices: string[], defaultValue?: string): Promise<string> {
    const inquirer = require('inquirer');
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message,
        choices,
        default: defaultValue
      }
    ]);
    return selected;
  }
}
