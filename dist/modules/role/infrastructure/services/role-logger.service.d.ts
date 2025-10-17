export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
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
export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    enableStructured: boolean;
    module: string;
    environment: 'development' | 'production' | 'test';
}
export declare class RoleLoggerService {
    private config;
    private logBuffer;
    private readonly maxBufferSize;
    constructor(config?: Partial<LoggerConfig>);
    debug(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
    private log;
    private shouldLog;
    private outputToConsole;
    private addToBuffer;
    private generateTraceId;
    getLogBuffer(): LogEntry[];
    clearBuffer(): void;
    updateConfig(config: Partial<LoggerConfig>): void;
    getConfig(): LoggerConfig;
}
export declare function createRoleLogger(config?: Partial<LoggerConfig>): RoleLoggerService;
export declare const roleLogger: RoleLoggerService;
//# sourceMappingURL=role-logger.service.d.ts.map