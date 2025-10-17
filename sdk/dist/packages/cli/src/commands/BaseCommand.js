"use strict";
/**
 * @fileoverview Base command class for CLI commands
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommand = void 0;
/**
 * Base class for CLI commands
 */
class BaseCommand {
    constructor(context) {
        this.context = context;
        this.logger = context.logger;
        this.spinner = context.spinner;
    }
    /**
     * Validate command arguments and options
     */
    validate(args) {
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
    extractOptionName(flags) {
        const match = flags.match(/--([a-zA-Z0-9-]+)/);
        return match ? match[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) : '';
    }
    /**
     * Show help for this command
     */
    showHelp() {
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
    getOption(args, name, defaultValue) {
        const value = args.options[name];
        return value !== undefined ? value : defaultValue;
    }
    /**
     * Get argument value with bounds checking
     */
    getArgument(args, index, defaultValue) {
        return args.args[index] || defaultValue || '';
    }
    /**
     * Check if option is present
     */
    hasOption(args, name) {
        return name in args.options;
    }
    /**
     * Get all arguments as array
     */
    getArguments(args) {
        return [...args.args];
    }
    /**
     * Get all options as object
     */
    getOptions(args) {
        return { ...args.options };
    }
    /**
     * Start a spinner with message
     */
    startSpinner(message) {
        this.spinner.start(message);
    }
    /**
     * Stop spinner with success
     */
    succeedSpinner(message) {
        this.spinner.succeed(message);
    }
    /**
     * Stop spinner with failure
     */
    failSpinner(message) {
        this.spinner.fail(message);
    }
    /**
     * Update spinner text
     */
    updateSpinner(message) {
        this.spinner.text = message;
    }
    /**
     * Log info message
     */
    info(message, ...args) {
        this.logger.info(message, ...args);
    }
    /**
     * Log success message
     */
    success(message, ...args) {
        this.logger.success(message, ...args);
    }
    /**
     * Log warning message
     */
    warn(message, ...args) {
        this.logger.warn(message, ...args);
    }
    /**
     * Log error message
     */
    error(message, ...args) {
        this.logger.error(message, ...args);
    }
    /**
     * Log debug message
     */
    debug(message, ...args) {
        this.logger.debug(message, ...args);
    }
    /**
     * Execute with error handling
     */
    async executeWithErrorHandling(operation, errorMessage = 'Operation failed') {
        try {
            await operation();
        }
        catch (error) {
            this.failSpinner();
            this.error(`${errorMessage}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Execute with spinner
     */
    async executeWithSpinner(operation, startMessage, successMessage, errorMessage) {
        this.startSpinner(startMessage);
        try {
            const result = await operation();
            this.succeedSpinner(successMessage);
            return result;
        }
        catch (error) {
            this.failSpinner(errorMessage);
            throw error;
        }
    }
    /**
     * Prompt user for confirmation
     */
    async confirm(message, defaultValue = false) {
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
    async prompt(message, defaultValue) {
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
    async select(message, choices, defaultValue) {
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
exports.BaseCommand = BaseCommand;
//# sourceMappingURL=BaseCommand.js.map