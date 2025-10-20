"use strict";
/**
 * Role模块统一日志服务
 *
 * @description 替换console.log的企业级日志系统，支持结构化日志记录和不同级别输出
 * @version 1.0.0
 * @layer 基础设施层 - 服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleLogger = exports.RoleLoggerService = exports.LogLevel = void 0;
exports.createRoleLogger = createRoleLogger;
/**
 * 日志级别枚举
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Role模块统一日志服务
 *
 * @description 企业级日志系统，支持结构化日志、不同级别和多种输出格式
 */
class RoleLoggerService {
    constructor(config = {}) {
        this.logBuffer = [];
        this.maxBufferSize = 1000;
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
    /**
     * 记录调试信息
     */
    debug(message, metadata) {
        this.log(LogLevel.DEBUG, message, metadata);
    }
    /**
     * 记录一般信息
     */
    info(message, metadata) {
        this.log(LogLevel.INFO, message, metadata);
    }
    /**
     * 记录警告信息
     */
    warn(message, metadata) {
        this.log(LogLevel.WARN, message, metadata);
    }
    /**
     * 记录错误信息
     */
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
    /**
     * 核心日志记录方法
     */
    log(level, message, metadata) {
        // 检查日志级别
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
        // 添加到缓冲区
        this.addToBuffer(logEntry);
        // 输出日志
        if (this.config.enableConsole) {
            this.outputToConsole(logEntry);
        }
        // 未来可以扩展文件输出、远程日志等
    }
    /**
     * 检查是否应该记录此级别的日志
     */
    shouldLog(level) {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    /**
     * 输出到控制台
     */
    outputToConsole(entry) {
        const prefix = `[${entry.module}] ${entry.timestamp}`;
        if (this.config.enableStructured) {
            // 结构化输出
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
                    // eslint-disable-next-line no-console
                    console.debug(`${prefix} [DEBUG]`, structuredLog);
                    break;
                case LogLevel.INFO:
                    // eslint-disable-next-line no-console
                    console.info(`${prefix} [INFO]`, structuredLog);
                    break;
                case LogLevel.WARN:
                    // eslint-disable-next-line no-console
                    console.warn(`${prefix} [WARN]`, structuredLog);
                    break;
                case LogLevel.ERROR:
                    // eslint-disable-next-line no-console
                    console.error(`${prefix} [ERROR]`, structuredLog);
                    break;
            }
        }
        else {
            // 简单文本输出
            const metadataStr = entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : '';
            const logMessage = `${prefix} [${entry.level.toUpperCase()}] ${entry.message}${metadataStr}`;
            switch (entry.level) {
                case LogLevel.DEBUG:
                case LogLevel.INFO:
                    // eslint-disable-next-line no-console
                    console.log(logMessage);
                    break;
                case LogLevel.WARN:
                    // eslint-disable-next-line no-console
                    console.warn(logMessage);
                    break;
                case LogLevel.ERROR:
                    // eslint-disable-next-line no-console
                    console.error(logMessage);
                    break;
            }
        }
    }
    /**
     * 添加到日志缓冲区
     */
    addToBuffer(entry) {
        this.logBuffer.push(entry);
        // 保持缓冲区大小
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift();
        }
    }
    /**
     * 生成追踪ID
     */
    generateTraceId() {
        return `role-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * 获取日志缓冲区
     */
    getLogBuffer() {
        return [...this.logBuffer];
    }
    /**
     * 清空日志缓冲区
     */
    clearBuffer() {
        this.logBuffer = [];
    }
    /**
     * 更新日志配置
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * 获取当前配置
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.RoleLoggerService = RoleLoggerService;
/**
 * 创建Role模块日志实例的工厂函数
 */
function createRoleLogger(config) {
    return new RoleLoggerService(config);
}
/**
 * 默认Role模块日志实例
 */
exports.roleLogger = createRoleLogger({
    module: 'Role',
    level: LogLevel.INFO,
    enableStructured: true,
    environment: 'development'
});
//# sourceMappingURL=role-logger.service.js.map