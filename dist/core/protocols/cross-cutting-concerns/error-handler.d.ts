export type ErrorLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface MLPPError {
    id: string;
    level: ErrorLevel;
    message: string;
    timestamp: string;
    source: string;
    stack?: string;
    metadata?: Record<string, unknown>;
}
export declare class MLPPErrorHandler {
    private errors;
    logError(level: ErrorLevel, message: string, source: string, error?: Error, metadata?: Record<string, unknown>): Promise<void>;
    getErrors(filter?: {
        level?: ErrorLevel;
        source?: string;
    }): MLPPError[];
    handleUncaughtError(error: Error, source: string): Promise<void>;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=error-handler.d.ts.map