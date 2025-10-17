"use strict";
/**
 * @fileoverview CLI Spinner implementation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLineSpinner = exports.ProgressSpinner = exports.Spinner = void 0;
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * CLI Spinner implementation
 */
class Spinner {
    constructor(text) {
        this.spinner = (0, ora_1.default)({
            text: text || '',
            color: 'cyan',
            spinner: 'dots'
        });
    }
    /**
     * Start the spinner
     */
    start(text) {
        if (text) {
            this.spinner.text = text;
        }
        this.spinner.start();
    }
    /**
     * Stop the spinner
     */
    stop() {
        this.spinner.stop();
    }
    /**
     * Stop with success message
     */
    succeed(text) {
        this.spinner.succeed(text);
    }
    /**
     * Stop with failure message
     */
    fail(text) {
        this.spinner.fail(text);
    }
    /**
     * Stop with warning message
     */
    warn(text) {
        this.spinner.warn(text);
    }
    /**
     * Stop with info message
     */
    info(text) {
        this.spinner.info(text);
    }
    /**
     * Get/set spinner text
     */
    get text() {
        return this.spinner.text;
    }
    set text(value) {
        this.spinner.text = value;
    }
    /**
     * Check if spinner is spinning
     */
    get isSpinning() {
        return this.spinner.isSpinning;
    }
    /**
     * Update spinner text
     */
    update(text) {
        this.spinner.text = text;
    }
    /**
     * Change spinner color
     */
    setColor(color) {
        this.spinner.color = color;
    }
    /**
     * Change spinner type
     */
    setSpinner(spinner) {
        this.spinner.spinner = spinner;
    }
    /**
     * Create a progress spinner with steps
     */
    static createProgress(steps) {
        return new ProgressSpinner(steps);
    }
    /**
     * Create a multi-line spinner for parallel operations
     */
    static createMultiLine() {
        return new MultiLineSpinner();
    }
}
exports.Spinner = Spinner;
/**
 * Progress spinner for multi-step operations
 */
class ProgressSpinner {
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.spinner = (0, ora_1.default)({
            text: this.getCurrentStepText(),
            color: 'cyan',
            spinner: 'dots'
        });
    }
    /**
     * Start the progress spinner
     */
    start() {
        this.spinner.start();
    }
    /**
     * Move to next step
     */
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.spinner.text = this.getCurrentStepText();
        }
    }
    /**
     * Complete current step and move to next
     */
    completeStep() {
        const stepText = this.steps[this.currentStep];
        this.spinner.succeed(chalk_1.default.green(`✓ ${stepText}`));
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.spinner = (0, ora_1.default)({
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
    failStep(error) {
        const stepText = this.steps[this.currentStep];
        const errorText = error ? ` (${error})` : '';
        this.spinner.fail(chalk_1.default.red(`✖ ${stepText}${errorText}`));
    }
    /**
     * Complete all remaining steps
     */
    complete() {
        this.spinner.succeed(chalk_1.default.green('✓ All steps completed'));
    }
    /**
     * Get current step text with progress
     */
    getCurrentStepText() {
        const progress = `[${this.currentStep + 1}/${this.steps.length}]`;
        const stepText = this.steps[this.currentStep];
        return `${chalk_1.default.gray(progress)} ${stepText}`;
    }
    /**
     * Get current step index
     */
    getCurrentStep() {
        return this.currentStep;
    }
    /**
     * Get total steps
     */
    getTotalSteps() {
        return this.steps.length;
    }
    /**
     * Check if all steps are completed
     */
    isCompleted() {
        return this.currentStep >= this.steps.length - 1;
    }
}
exports.ProgressSpinner = ProgressSpinner;
/**
 * Multi-line spinner for parallel operations
 */
class MultiLineSpinner {
    constructor() {
        this.spinners = new Map();
        this.completed = new Set();
    }
    /**
     * Add a new spinner line
     */
    add(id, text) {
        const spinner = (0, ora_1.default)({
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
    update(id, text) {
        const spinner = this.spinners.get(id);
        if (spinner) {
            spinner.text = text;
        }
    }
    /**
     * Complete a spinner
     */
    complete(id, text) {
        const spinner = this.spinners.get(id);
        if (spinner) {
            spinner.succeed(text);
            this.completed.add(id);
        }
    }
    /**
     * Fail a spinner
     */
    fail(id, text) {
        const spinner = this.spinners.get(id);
        if (spinner) {
            spinner.fail(text);
            this.completed.add(id);
        }
    }
    /**
     * Stop all spinners
     */
    stopAll() {
        for (const [id, spinner] of this.spinners) {
            if (!this.completed.has(id)) {
                spinner.stop();
            }
        }
    }
    /**
     * Complete all spinners
     */
    completeAll() {
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
    isAllCompleted() {
        return this.completed.size === this.spinners.size;
    }
    /**
     * Get active spinners count
     */
    getActiveCount() {
        return this.spinners.size - this.completed.size;
    }
}
exports.MultiLineSpinner = MultiLineSpinner;
//# sourceMappingURL=Spinner.js.map