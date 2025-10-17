"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPLPError = void 0;
/**
 * MPLP Error Base Class
 *
 * Base error class for all MPLP SDK errors.
 * Provides common error handling functionality and error categorization.
 */
class MPLPError extends Error {
    constructor(message, code = 'MPLP_ERROR', cause) {
        super(message);
        this.name = 'MPLPError';
        this.code = code;
        this.cause = cause;
        this.timestamp = new Date();
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MPLPError);
        }
    }
    /**
     * Returns a JSON representation of the error
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack,
            cause: this.cause
                ? {
                    name: this.cause.name,
                    message: this.cause.message,
                    stack: this.cause.stack,
                }
                : undefined,
        };
    }
    /**
     * Returns a string representation of the error
     */
    toString() {
        let result = `${this.name}: ${this.message} (${this.code})`;
        if (this.cause) {
            result += `\nCaused by: ${this.cause.toString()}`;
        }
        return result;
    }
}
exports.MPLPError = MPLPError;
//# sourceMappingURL=MPLPError.js.map