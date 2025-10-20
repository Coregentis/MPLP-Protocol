/**
 * MPLP错误处理管理器
 *
 * @description L3层统一错误处理，提供错误捕获、记录和恢复功能
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
/**
 * 错误级别枚举
 */
export type ErrorLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
/**
 * MPLP错误接口
 */
export interface MLPPError {
    id: string;
    level: ErrorLevel;
    message: string;
    timestamp: string;
    source: string;
    stack?: string;
    metadata?: Record<string, unknown>;
}
/**
 * MPLP错误处理管理器
 *
 * @description 统一的错误处理实现，所有模块使用相同的错误处理策略
 */
export declare class MLPPErrorHandler {
    private errors;
    /**
     * 记录错误
     */
    logError(level: ErrorLevel, message: string, source: string, error?: Error, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * 获取错误日志
     */
    getErrors(filter?: {
        level?: ErrorLevel;
        source?: string;
    }): MLPPError[];
    /**
     * 处理未捕获的错误
     */
    handleUncaughtError(error: Error, source: string): Promise<void>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=error-handler.d.ts.map