/**
 * @fileoverview CLI Spinner implementation
 */
import { CLISpinner } from './types';
/**
 * CLI Spinner implementation
 */
export declare class Spinner implements CLISpinner {
    private spinner;
    constructor(text?: string);
    /**
     * Start the spinner
     */
    start(text?: string): void;
    /**
     * Stop the spinner
     */
    stop(): void;
    /**
     * Stop with success message
     */
    succeed(text?: string): void;
    /**
     * Stop with failure message
     */
    fail(text?: string): void;
    /**
     * Stop with warning message
     */
    warn(text?: string): void;
    /**
     * Stop with info message
     */
    info(text?: string): void;
    /**
     * Get/set spinner text
     */
    get text(): string;
    set text(value: string);
    /**
     * Check if spinner is spinning
     */
    get isSpinning(): boolean;
    /**
     * Update spinner text
     */
    update(text: string): void;
    /**
     * Change spinner color
     */
    setColor(color: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray'): void;
    /**
     * Change spinner type
     */
    setSpinner(spinner: string): void;
    /**
     * Create a progress spinner with steps
     */
    static createProgress(steps: string[]): ProgressSpinner;
    /**
     * Create a multi-line spinner for parallel operations
     */
    static createMultiLine(): MultiLineSpinner;
}
/**
 * Progress spinner for multi-step operations
 */
export declare class ProgressSpinner {
    private readonly steps;
    private currentStep;
    private spinner;
    constructor(steps: string[]);
    /**
     * Start the progress spinner
     */
    start(): void;
    /**
     * Move to next step
     */
    nextStep(): void;
    /**
     * Complete current step and move to next
     */
    completeStep(): void;
    /**
     * Fail current step
     */
    failStep(error?: string): void;
    /**
     * Complete all remaining steps
     */
    complete(): void;
    /**
     * Get current step text with progress
     */
    private getCurrentStepText;
    /**
     * Get current step index
     */
    getCurrentStep(): number;
    /**
     * Get total steps
     */
    getTotalSteps(): number;
    /**
     * Check if all steps are completed
     */
    isCompleted(): boolean;
}
/**
 * Multi-line spinner for parallel operations
 */
export declare class MultiLineSpinner {
    private spinners;
    private completed;
    /**
     * Add a new spinner line
     */
    add(id: string, text: string): void;
    /**
     * Update spinner text
     */
    update(id: string, text: string): void;
    /**
     * Complete a spinner
     */
    complete(id: string, text?: string): void;
    /**
     * Fail a spinner
     */
    fail(id: string, text?: string): void;
    /**
     * Stop all spinners
     */
    stopAll(): void;
    /**
     * Complete all spinners
     */
    completeAll(): void;
    /**
     * Check if all spinners are completed
     */
    isAllCompleted(): boolean;
    /**
     * Get active spinners count
     */
    getActiveCount(): number;
}
//# sourceMappingURL=Spinner.d.ts.map