"use strict";
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
    name;
    level = LogLevel.INFO;
    constructor(name, level = LogLevel.INFO) {
        this.name = name;
        this.level = level;
    }
    setLevel(level) {
        this.level = level;
    }
    error(message, ...args) {
        if (this.level >= LogLevel.ERROR) {
            console.error(`[${this.name}] ERROR:`, message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.level >= LogLevel.WARN) {
            console.warn(`[${this.name}] WARN:`, message, ...args);
        }
    }
    info(message, ...args) {
        if (this.level >= LogLevel.INFO) {
            console.info(`[${this.name}] INFO:`, message, ...args);
        }
    }
    debug(message, ...args) {
        if (this.level >= LogLevel.DEBUG) {
            console.log(`[${this.name}] DEBUG:`, message, ...args);
        }
    }
    verbose(message, ...args) {
        if (this.level >= LogLevel.VERBOSE) {
            console.log(`[${this.name}] VERBOSE:`, message, ...args);
        }
    }
}
exports.Logger = Logger;
