"use strict";
/**
 * @fileoverview CLI Logger implementation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * CLI Logger implementation
 */
class Logger {
    constructor() {
        this.debugEnabled = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
    }
    /**
     * Log an info message
     */
    info(message, ...args) {
        console.log(chalk_1.default.blue('ℹ'), message, ...args);
    }
    /**
     * Log a warning message
     */
    warn(message, ...args) {
        console.warn(chalk_1.default.yellow('⚠'), message, ...args);
    }
    /**
     * Log an error message
     */
    error(message, ...args) {
        console.error(chalk_1.default.red('✖'), message, ...args);
    }
    /**
     * Log a success message
     */
    success(message, ...args) {
        console.log(chalk_1.default.green('✓'), message, ...args);
    }
    /**
     * Log a debug message (only in debug mode)
     */
    debug(message, ...args) {
        if (this.debugEnabled) {
            console.log(chalk_1.default.gray('🐛'), chalk_1.default.gray(message), ...args);
        }
    }
    /**
     * Log a plain message
     */
    log(message, ...args) {
        console.log(message, ...args);
    }
    /**
     * Log a message with custom color
     */
    colored(color, text) {
        const colorFn = chalk_1.default[color];
        if (typeof colorFn === 'function') {
            return colorFn(text);
        }
        return text;
    }
    /**
     * Log a header message
     */
    header(message) {
        console.log();
        console.log(chalk_1.default.bold.cyan(message));
        console.log(chalk_1.default.cyan('='.repeat(message.length)));
    }
    /**
     * Log a subheader message
     */
    subheader(message) {
        console.log();
        console.log(chalk_1.default.bold(message));
        console.log(chalk_1.default.gray('-'.repeat(message.length)));
    }
    /**
     * Log a list of items
     */
    list(items, bullet = '•') {
        for (const item of items) {
            console.log(`  ${chalk_1.default.gray(bullet)} ${item}`);
        }
    }
    /**
     * Log a table of key-value pairs
     */
    table(data, indent = 2) {
        const maxKeyLength = Math.max(...Object.keys(data).map(key => key.length));
        const indentStr = ' '.repeat(indent);
        for (const [key, value] of Object.entries(data)) {
            const paddedKey = key.padEnd(maxKeyLength);
            console.log(`${indentStr}${chalk_1.default.cyan(paddedKey)}: ${value}`);
        }
    }
    /**
     * Log a progress message
     */
    progress(current, total, message) {
        const percentage = Math.round((current / total) * 100);
        const progressBar = this.createProgressBar(percentage);
        console.log(`${progressBar} ${percentage}% ${message}`);
    }
    /**
     * Create a progress bar
     */
    createProgressBar(percentage, width = 20) {
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        const filledBar = chalk_1.default.green('█'.repeat(filled));
        const emptyBar = chalk_1.default.gray('░'.repeat(empty));
        return `[${filledBar}${emptyBar}]`;
    }
    /**
     * Log a code block
     */
    code(code, language) {
        const lines = code.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));
        console.log(chalk_1.default.gray('┌' + '─'.repeat(maxLineLength + 2) + '┐'));
        for (const line of lines) {
            const paddedLine = line.padEnd(maxLineLength);
            console.log(chalk_1.default.gray('│') + ` ${chalk_1.default.cyan(paddedLine)} ` + chalk_1.default.gray('│'));
        }
        console.log(chalk_1.default.gray('└' + '─'.repeat(maxLineLength + 2) + '┘'));
    }
    /**
     * Log a command example
     */
    command(command, description) {
        console.log(`  ${chalk_1.default.gray('$')} ${chalk_1.default.cyan(command)}`);
        if (description) {
            console.log(`    ${chalk_1.default.gray(description)}`);
        }
    }
    /**
     * Log multiple command examples
     */
    commands(commands) {
        for (const cmd of commands) {
            this.command(cmd.command, cmd.description);
        }
    }
    /**
     * Clear the console
     */
    clear() {
        console.clear();
    }
    /**
     * Log a separator line
     */
    separator(char = '-', length = 50) {
        console.log(chalk_1.default.gray(char.repeat(length)));
    }
    /**
     * Log an empty line
     */
    newline() {
        console.log();
    }
    /**
     * Log multiple empty lines
     */
    newlines(count) {
        for (let i = 0; i < count; i++) {
            console.log();
        }
    }
    /**
     * Log a banner message
     */
    banner(message, width = 60) {
        const padding = Math.max(0, width - message.length - 2);
        const leftPadding = Math.floor(padding / 2);
        const rightPadding = padding - leftPadding;
        console.log(chalk_1.default.cyan('┌' + '─'.repeat(width - 2) + '┐'));
        console.log(chalk_1.default.cyan('│') + ' '.repeat(leftPadding) + chalk_1.default.bold.white(message) + ' '.repeat(rightPadding) + chalk_1.default.cyan('│'));
        console.log(chalk_1.default.cyan('└' + '─'.repeat(width - 2) + '┘'));
    }
    /**
     * Check if debug mode is enabled
     */
    isDebugEnabled() {
        return this.debugEnabled;
    }
    /**
     * Set debug mode
     */
    setDebugMode(enabled) {
        this.debugEnabled = enabled;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map