/**
 * @fileoverview CLI Logger implementation
 */

import chalk from 'chalk';
import { CLILogger } from './types';

/**
 * CLI Logger implementation
 */
export class Logger implements CLILogger {
  private readonly debugEnabled: boolean;

  constructor() {
    this.debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
  }

  /**
   * Log an info message
   */
  public info(message: string, ...args: unknown[]): void {
    console.log(chalk.blue('ℹ'), message, ...args);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, ...args: unknown[]): void {
    console.warn(chalk.yellow('⚠'), message, ...args);
  }

  /**
   * Log an error message
   */
  public error(message: string, ...args: unknown[]): void {
    console.error(chalk.red('✖'), message, ...args);
  }

  /**
   * Log a success message
   */
  public success(message: string, ...args: unknown[]): void {
    console.log(chalk.green('✓'), message, ...args);
  }

  /**
   * Log a debug message (only in debug mode)
   */
  public debug(message: string, ...args: unknown[]): void {
    if (this.debugEnabled) {
      console.log(chalk.gray('🐛'), chalk.gray(message), ...args);
    }
  }

  /**
   * Log a plain message
   */
  public log(message: string, ...args: unknown[]): void {
    console.log(message, ...args);
  }

  /**
   * Log a message with custom color
   */
  public colored(color: string, text: string): string {
    const colorFn = (chalk as any)[color] as (text: string) => string;
    if (typeof colorFn === 'function') {
      return colorFn(text);
    }
    return text;
  }

  /**
   * Log a header message
   */
  public header(message: string): void {
    console.log();
    console.log(chalk.bold.cyan(message));
    console.log(chalk.cyan('='.repeat(message.length)));
  }

  /**
   * Log a subheader message
   */
  public subheader(message: string): void {
    console.log();
    console.log(chalk.bold(message));
    console.log(chalk.gray('-'.repeat(message.length)));
  }

  /**
   * Log a list of items
   */
  public list(items: string[], bullet: string = '•'): void {
    for (const item of items) {
      console.log(`  ${chalk.gray(bullet)} ${item}`);
    }
  }

  /**
   * Log a table of key-value pairs
   */
  public table(data: Record<string, string>, indent: number = 2): void {
    const maxKeyLength = Math.max(...Object.keys(data).map(key => key.length));
    const indentStr = ' '.repeat(indent);

    for (const [key, value] of Object.entries(data)) {
      const paddedKey = key.padEnd(maxKeyLength);
      console.log(`${indentStr}${chalk.cyan(paddedKey)}: ${value}`);
    }
  }

  /**
   * Log a progress message
   */
  public progress(current: number, total: number, message: string): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percentage);
    console.log(`${progressBar} ${percentage}% ${message}`);
  }

  /**
   * Create a progress bar
   */
  private createProgressBar(percentage: number, width: number = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    const filledBar = chalk.green('█'.repeat(filled));
    const emptyBar = chalk.gray('░'.repeat(empty));
    
    return `[${filledBar}${emptyBar}]`;
  }

  /**
   * Log a code block
   */
  public code(code: string, language?: string): void {
    const lines = code.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    
    console.log(chalk.gray('┌' + '─'.repeat(maxLineLength + 2) + '┐'));
    
    for (const line of lines) {
      const paddedLine = line.padEnd(maxLineLength);
      console.log(chalk.gray('│') + ` ${chalk.cyan(paddedLine)} ` + chalk.gray('│'));
    }
    
    console.log(chalk.gray('└' + '─'.repeat(maxLineLength + 2) + '┘'));
  }

  /**
   * Log a command example
   */
  public command(command: string, description?: string): void {
    console.log(`  ${chalk.gray('$')} ${chalk.cyan(command)}`);
    if (description) {
      console.log(`    ${chalk.gray(description)}`);
    }
  }

  /**
   * Log multiple command examples
   */
  public commands(commands: Array<{ command: string; description?: string }>): void {
    for (const cmd of commands) {
      this.command(cmd.command, cmd.description);
    }
  }

  /**
   * Clear the console
   */
  public clear(): void {
    console.clear();
  }

  /**
   * Log a separator line
   */
  public separator(char: string = '-', length: number = 50): void {
    console.log(chalk.gray(char.repeat(length)));
  }

  /**
   * Log an empty line
   */
  public newline(): void {
    console.log();
  }

  /**
   * Log multiple empty lines
   */
  public newlines(count: number): void {
    for (let i = 0; i < count; i++) {
      console.log();
    }
  }

  /**
   * Log a banner message
   */
  public banner(message: string, width: number = 60): void {
    const padding = Math.max(0, width - message.length - 2);
    const leftPadding = Math.floor(padding / 2);
    const rightPadding = padding - leftPadding;
    
    console.log(chalk.cyan('┌' + '─'.repeat(width - 2) + '┐'));
    console.log(chalk.cyan('│') + ' '.repeat(leftPadding) + chalk.bold.white(message) + ' '.repeat(rightPadding) + chalk.cyan('│'));
    console.log(chalk.cyan('└' + '─'.repeat(width - 2) + '┘'));
  }

  /**
   * Check if debug mode is enabled
   */
  public isDebugEnabled(): boolean {
    return this.debugEnabled;
  }

  /**
   * Set debug mode
   */
  public setDebugMode(enabled: boolean): void {
    (this as unknown as { debugEnabled: boolean }).debugEnabled = enabled;
  }
}
