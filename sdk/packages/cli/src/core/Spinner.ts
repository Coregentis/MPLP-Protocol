/**
 * @fileoverview CLI Spinner implementation
 */

import ora, { Ora } from 'ora';
import chalk from 'chalk';
import { CLISpinner } from './types';

/**
 * CLI Spinner implementation
 */
export class Spinner implements CLISpinner {
  private spinner: Ora;

  constructor(text?: string) {
    this.spinner = ora({
      text: text || '',
      color: 'cyan',
      spinner: 'dots'
    });
  }

  /**
   * Start the spinner
   */
  public start(text?: string): void {
    if (text) {
      this.spinner.text = text;
    }
    this.spinner.start();
  }

  /**
   * Stop the spinner
   */
  public stop(): void {
    this.spinner.stop();
  }

  /**
   * Stop with success message
   */
  public succeed(text?: string): void {
    this.spinner.succeed(text);
  }

  /**
   * Stop with failure message
   */
  public fail(text?: string): void {
    this.spinner.fail(text);
  }

  /**
   * Stop with warning message
   */
  public warn(text?: string): void {
    this.spinner.warn(text);
  }

  /**
   * Stop with info message
   */
  public info(text?: string): void {
    this.spinner.info(text);
  }

  /**
   * Get/set spinner text
   */
  public get text(): string {
    return this.spinner.text;
  }

  public set text(value: string) {
    this.spinner.text = value;
  }

  /**
   * Check if spinner is spinning
   */
  public get isSpinning(): boolean {
    return this.spinner.isSpinning;
  }

  /**
   * Update spinner text
   */
  public update(text: string): void {
    this.spinner.text = text;
  }

  /**
   * Change spinner color
   */
  public setColor(color: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray'): void {
    this.spinner.color = color;
  }

  /**
   * Change spinner type
   */
  public setSpinner(spinner: string): void {
    (this.spinner as any).spinner = spinner;
  }

  /**
   * Create a progress spinner with steps
   */
  public static createProgress(steps: string[]): ProgressSpinner {
    return new ProgressSpinner(steps);
  }

  /**
   * Create a multi-line spinner for parallel operations
   */
  public static createMultiLine(): MultiLineSpinner {
    return new MultiLineSpinner();
  }
}

/**
 * Progress spinner for multi-step operations
 */
export class ProgressSpinner {
  private currentStep = 0;
  private spinner: Ora;

  constructor(private readonly steps: string[]) {
    this.spinner = ora({
      text: this.getCurrentStepText(),
      color: 'cyan',
      spinner: 'dots'
    });
  }

  /**
   * Start the progress spinner
   */
  public start(): void {
    this.spinner.start();
  }

  /**
   * Move to next step
   */
  public nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.spinner.text = this.getCurrentStepText();
    }
  }

  /**
   * Complete current step and move to next
   */
  public completeStep(): void {
    const stepText = this.steps[this.currentStep];
    this.spinner.succeed(chalk.green(`✓ ${stepText}`));
    
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.spinner = ora({
        text: this.getCurrentStepText(),
        color: 'cyan',
        spinner: 'dots'
      });
      this.spinner.start();
    }
  }

  /**
   * Fail current step
   */
  public failStep(error?: string): void {
    const stepText = this.steps[this.currentStep];
    const errorText = error ? ` (${error})` : '';
    this.spinner.fail(chalk.red(`✖ ${stepText}${errorText}`));
  }

  /**
   * Complete all remaining steps
   */
  public complete(): void {
    this.spinner.succeed(chalk.green('✓ All steps completed'));
  }

  /**
   * Get current step text with progress
   */
  private getCurrentStepText(): string {
    const progress = `[${this.currentStep + 1}/${this.steps.length}]`;
    const stepText = this.steps[this.currentStep];
    return `${chalk.gray(progress)} ${stepText}`;
  }

  /**
   * Get current step index
   */
  public getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * Get total steps
   */
  public getTotalSteps(): number {
    return this.steps.length;
  }

  /**
   * Check if all steps are completed
   */
  public isCompleted(): boolean {
    return this.currentStep >= this.steps.length - 1;
  }
}

/**
 * Multi-line spinner for parallel operations
 */
export class MultiLineSpinner {
  private spinners = new Map<string, Ora>();
  private completed = new Set<string>();

  /**
   * Add a new spinner line
   */
  public add(id: string, text: string): void {
    const spinner = ora({
      text,
      color: 'cyan',
      spinner: 'dots'
    });
    
    this.spinners.set(id, spinner);
    spinner.start();
  }

  /**
   * Update spinner text
   */
  public update(id: string, text: string): void {
    const spinner = this.spinners.get(id);
    if (spinner) {
      spinner.text = text;
    }
  }

  /**
   * Complete a spinner
   */
  public complete(id: string, text?: string): void {
    const spinner = this.spinners.get(id);
    if (spinner) {
      spinner.succeed(text);
      this.completed.add(id);
    }
  }

  /**
   * Fail a spinner
   */
  public fail(id: string, text?: string): void {
    const spinner = this.spinners.get(id);
    if (spinner) {
      spinner.fail(text);
      this.completed.add(id);
    }
  }

  /**
   * Stop all spinners
   */
  public stopAll(): void {
    for (const [id, spinner] of this.spinners) {
      if (!this.completed.has(id)) {
        spinner.stop();
      }
    }
  }

  /**
   * Complete all spinners
   */
  public completeAll(): void {
    for (const [id, spinner] of this.spinners) {
      if (!this.completed.has(id)) {
        spinner.succeed();
        this.completed.add(id);
      }
    }
  }

  /**
   * Check if all spinners are completed
   */
  public isAllCompleted(): boolean {
    return this.completed.size === this.spinners.size;
  }

  /**
   * Get active spinners count
   */
  public getActiveCount(): number {
    return this.spinners.size - this.completed.size;
  }
}
