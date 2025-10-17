"use strict";
/**
 * @fileoverview Core types for MPLP CLI
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateNotFoundError = exports.ProjectCreationError = exports.InvalidArgumentError = exports.CommandNotFoundError = exports.CLIError = void 0;
/**
 * CLI error types
 */
class CLIError extends Error {
    constructor(message, code, exitCode = 1) {
        super(message);
        this.code = code;
        this.exitCode = exitCode;
        this.name = 'CLIError';
    }
}
exports.CLIError = CLIError;
class CommandNotFoundError extends CLIError {
    constructor(command) {
        super(`Command '${command}' not found`, 'COMMAND_NOT_FOUND', 1);
        this.name = 'CommandNotFoundError';
    }
}
exports.CommandNotFoundError = CommandNotFoundError;
class InvalidArgumentError extends CLIError {
    constructor(argument, reason) {
        super(`Invalid argument '${argument}': ${reason}`, 'INVALID_ARGUMENT', 1);
        this.name = 'InvalidArgumentError';
    }
}
exports.InvalidArgumentError = InvalidArgumentError;
class ProjectCreationError extends CLIError {
    constructor(message, cause) {
        super(`Project creation failed: ${message}`, 'PROJECT_CREATION_FAILED', 1);
        this.name = 'ProjectCreationError';
        if (cause) {
            this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
        }
    }
}
exports.ProjectCreationError = ProjectCreationError;
class TemplateNotFoundError extends CLIError {
    constructor(template) {
        super(`Template '${template}' not found`, 'TEMPLATE_NOT_FOUND', 1);
        this.name = 'TemplateNotFoundError';
    }
}
exports.TemplateNotFoundError = TemplateNotFoundError;
//# sourceMappingURL=types.js.map