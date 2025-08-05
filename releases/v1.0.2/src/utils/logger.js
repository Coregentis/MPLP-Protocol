"use strict";
/**
 * MPLP日志工具 - 厂商中立设计
 *
 * 提供统一的日志记录功能，遵循厂商中立原则，不依赖特定日志服务。
 * 可通过适配器模式扩展到不同的日志后端。
 *
 * @version v1.0.0
 * @created 2025-07-09T10:00:00+08:00
 * @updated 2025-08-14T15:30:00+08:00
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
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
 * 日志类
 *
 * 提供统一的日志记录功能，支持不同日志级别和格式化选项
 */
var Logger = /** @class */ (function () {
    /**
     * 构造函数
     *
     * @param namespace 日志命名空间
     * @param options 日志选项
     */
    function Logger(namespace, options) {
        if (options === void 0) { options = {}; }
        this.namespace = namespace;
        this.level = options.level || LogLevel.INFO;
        this.includeTimestamp = options.includeTimestamp !== undefined ? options.includeTimestamp : true;
        this.includeStack = options.includeStack || false;
        this.formatter = options.formatter;
    }
    /**
     * 记录调试日志
     *
     * @param message 日志消息
     * @param data 附加数据
     */
    Logger.prototype.debug = function (message, data) {
        this.log(LogLevel.DEBUG, message, data);
    };
    /**
     * 记录信息日志
     *
     * @param message 日志消息
     * @param data 附加数据
     */
    Logger.prototype.info = function (message, data) {
        this.log(LogLevel.INFO, message, data);
    };
    /**
     * 记录警告日志
     *
     * @param message 日志消息
     * @param data 附加数据
     */
    Logger.prototype.warn = function (message, data) {
        this.log(LogLevel.WARN, message, data);
    };
    /**
     * 记录错误日志
     *
     * @param message 日志消息
     * @param data 附加数据
     */
    Logger.prototype.error = function (message, data) {
        this.log(LogLevel.ERROR, message, data);
    };
    /**
     * 设置日志级别
     *
     * @param level 日志级别
     */
    Logger.prototype.setLevel = function (level) {
        this.level = level;
    };
    /**
     * 获取当前日志级别
     *
     * @returns 当前日志级别
     */
    Logger.prototype.getLevel = function () {
        return this.level;
    };
    /**
     * 创建子日志记录器
     *
     * @param subNamespace 子命名空间
     * @returns 子日志记录器
     */
    Logger.prototype.createSubLogger = function (subNamespace) {
        return new Logger("".concat(this.namespace, ":").concat(subNamespace), {
            level: this.level,
            includeTimestamp: this.includeTimestamp,
            includeStack: this.includeStack,
            formatter: this.formatter
        });
    };
    /**
     * 记录日志
     *
     * @param level 日志级别
     * @param message 日志消息
     * @param data 附加数据
     */
    Logger.prototype.log = function (level, message, data) {
        // 检查日志级别
        if (!this.shouldLog(level)) {
            return;
        }
        var timestamp = this.includeTimestamp ? new Date().toISOString() : '';
        var stack;
        if (this.includeStack && level === LogLevel.ERROR) {
            var stackTrace = new Error().stack;
            stack = stackTrace ? stackTrace.split('\n').slice(2).join('\n') : undefined;
        }
        var logEntry = {
            level: level,
            message: message,
            namespace: this.namespace,
            timestamp: timestamp,
            data: data,
            stack: stack
        };
        // 使用自定义格式化函数或默认格式化
        if (this.formatter) {
            var formattedMessage = this.formatter(level, message, this.namespace, timestamp, data);
            console.log(formattedMessage);
        }
        else {
            var prefix = "[".concat(timestamp, "] [").concat(level.toUpperCase(), "] [").concat(this.namespace, "]:");
            if (data) {
                console.log("".concat(prefix, " ").concat(message), data);
            }
            else {
                console.log("".concat(prefix, " ").concat(message));
            }
            if (stack && level === LogLevel.ERROR) {
                console.log("".concat(prefix, " Stack trace:"), stack);
            }
        }
    };
    /**
     * 检查是否应该记录指定级别的日志
     *
     * @param level 日志级别
     * @returns 是否应该记录
     */
    Logger.prototype.shouldLog = function (level) {
        var levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        var currentLevelIndex = levels.indexOf(this.level);
        var targetLevelIndex = levels.indexOf(level);
        return targetLevelIndex >= currentLevelIndex;
    };
    return Logger;
}());
exports.Logger = Logger;
