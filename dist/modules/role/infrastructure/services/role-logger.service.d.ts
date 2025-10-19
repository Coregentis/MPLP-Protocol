/**
 * Role模块统一日志服务
 *
 * @description 替换console.log的企业级日志系统，支持结构化日志记录和不同级别输出
 * @version 1.0.0
 * @layer 基础设施层 - 服务
 */
/**
 * 日志级别枚举
 */
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
/**
 * 日志条目接口
 */
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    module: string;
    message: string;
    metadata?: Record<string, unknown>;
    traceId?: string;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}
/**
 * 日志配置接口
 */
export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    enableStructured: boolean;
    module: string;
    environment: 'development' | 'production' | 'test';
}
/**
 * Role模块统一日志服务
 *
 * @description 企业级日志系统，支持结构化日志、不同级别和多种输出格式
 */
export declare class RoleLoggerService {
    private config;
    private logBuffer;
    private readonly maxBufferSize;
    constructor(config?: Partial<LoggerConfig>);
    /**
     * 记录调试信息
     */
    debug(message: string, metadata?: Record<string, unknown>): void;
    /**
     * 记录一般信息
     */
    info(message: string, metadata?: Record<string, unknown>): void;
    /**
     * 记录警告信息
     */
    warn(message: string, metadata?: Record<string, unknown>): void;
    /**
     * 记录错误信息
     */
    error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
    /**
     * 核心日志记录方法
     */
    private log;
    /**
     * 检查是否应该记录此级别的日志
     */
    private shouldLog;
    /**
     * 输出到控制台
     */
    private outputToConsole;
    /**
     * 添加到日志缓冲区
     */
    private addToBuffer;
    /**
     * 生成追踪ID
     */
    private generateTraceId;
    /**
     * 获取日志缓冲区
     */
    getLogBuffer(): LogEntry[];
    /**
     * 清空日志缓冲区
     */
    clearBuffer(): void;
    /**
     * 更新日志配置
     */
    updateConfig(config: Partial<LoggerConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): LoggerConfig;
}
/**
 * 创建Role模块日志实例的工厂函数
 */
export declare function createRoleLogger(config?: Partial<LoggerConfig>): RoleLoggerService;
/**
 * 默认Role模块日志实例
 */
export declare const roleLogger: RoleLoggerService;
//# sourceMappingURL=role-logger.service.d.ts.map