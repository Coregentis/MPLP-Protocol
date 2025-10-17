"use strict";
/**
 * Logger
 *
 * Simple logging implementation for MPLP SDK.
 * In a production environment, this would integrate with winston or another logging library.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
    LogLevel[LogLevel["VERBOSE"] = 4] = "VERBOSE";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(name, level = LogLevel.INFO) {
        this.level = LogLevel.INFO;
        this.name = name;
        this.level = level;
    }
    /**
     * Sets the log level
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * Logs an error message
     */
    error(message, ...args) {
        if (this.level >= LogLevel.ERROR) {
            console.error(`[${this.name}] ERROR:`, message, ...args);
        }
    }
    /**
     * Logs a warning message
     */
    warn(message, ...args) {
        if (this.level >= LogLevel.WARN) {
            console.warn(`[${this.name}] WARN:`, message, ...args);
        }
    }
    /**
     * Logs an info message
     */
    info(message, ...args) {
        if (this.level >= LogLevel.INFO) {
            console.info(`[${this.name}] INFO:`, message, ...args);
        }
    }
    /**
     * Logs a debug message
     */
    debug(message, ...args) {
        if (this.level >= LogLevel.DEBUG) {
            console.debug(`[${this.name}] DEBUG:`, message, ...args);
        }
    }
    /**
     * Logs a verbose message
     */
    verbose(message, ...args) {
        if (this.level >= LogLevel.VERBOSE) {
            console.log(`[${this.name}] VERBOSE:`, message, ...args);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map