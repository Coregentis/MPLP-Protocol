"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleLogger = exports.RoleLoggerService = exports.LogLevel = void 0;
exports.createRoleLogger = createRoleLogger;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class RoleLoggerService {
    config;
    logBuffer = [];
    maxBufferSize = 1000;
    constructor(config = {}) {
        this.config = {
            level: LogLevel.INFO,
            enableConsole: true,
            enableFile: false,
            enableStructured: true,
            module: 'Role',
            environment: 'development',
            ...config
        };
    }
    debug(message, metadata) {
        this.log(LogLevel.DEBUG, message, metadata);
    }
    info(message, metadata) {
        this.log(LogLevel.INFO, message, metadata);
    }
    warn(message, metadata) {
        this.log(LogLevel.WARN, message, metadata);
    }
    error(message, error, metadata) {
        const errorMetadata = error ? {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        } : {};
        this.log(LogLevel.ERROR, message, { ...metadata, ...errorMetadata });
    }
    log(level, message, metadata) {
        if (!this.shouldLog(level)) {
            return;
        }
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            module: this.config.module,
            message,
            metadata,
            traceId: this.generateTraceId()
        };
        this.addToBuffer(logEntry);
        if (this.config.enableConsole) {
            this.outputToConsole(logEntry);
        }
    }
    shouldLog(level) {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    outputToConsole(entry) {
        const prefix = `[${entry.module}] ${entry.timestamp}`;
        if (this.config.enableStructured) {
            const structuredLog = {
                timestamp: entry.timestamp,
                level: entry.level,
                module: entry.module,
                message: entry.message,
                ...(entry.metadata && { metadata: entry.metadata }),
                ...(entry.traceId && { traceId: entry.traceId })
            };
            switch (entry.level) {
                case LogLevel.DEBUG:
                    console.debug(`${prefix} [DEBUG]`, structuredLog);
                    break;
                case LogLevel.INFO:
                    console.info(`${prefix} [INFO]`, structuredLog);
                    break;
                case LogLevel.WARN:
                    console.warn(`${prefix} [WARN]`, structuredLog);
                    break;
                case LogLevel.ERROR:
                    console.error(`${prefix} [ERROR]`, structuredLog);
                    break;
            }
        }
        else {
            const metadataStr = entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : '';
            const logMessage = `${prefix} [${entry.level.toUpperCase()}] ${entry.message}${metadataStr}`;
            switch (entry.level) {
                case LogLevel.DEBUG:
                case LogLevel.INFO:
                    console.log(logMessage);
                    break;
                case LogLevel.WARN:
                    console.warn(logMessage);
                    break;
                case LogLevel.ERROR:
                    console.error(logMessage);
                    break;
            }
        }
    }
    addToBuffer(entry) {
        this.logBuffer.push(entry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift();
        }
    }
    generateTraceId() {
        return `role-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    getLogBuffer() {
        return [...this.logBuffer];
    }
    clearBuffer() {
        this.logBuffer = [];
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
}
exports.RoleLoggerService = RoleLoggerService;
function createRoleLogger(config) {
    return new RoleLoggerService(config);
}
exports.roleLogger = createRoleLogger({
    module: 'Role',
    level: LogLevel.INFO,
    enableStructured: true,
    environment: 'development'
});
