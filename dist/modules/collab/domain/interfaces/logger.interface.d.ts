import { UUID } from '../../../../shared/types';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export interface LogEntry {
    id: UUID;
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: string;
    metadata?: Record<string, unknown>;
    correlationId?: UUID;
    userId?: UUID;
    sessionId?: string;
    source?: string;
    stackTrace?: string;
    tags?: string[];
}
export interface LogQuery {
    level?: LogLevel | LogLevel[];
    startTime?: Date;
    endTime?: Date;
    context?: string;
    userId?: UUID;
    sessionId?: string;
    correlationId?: UUID;
    source?: string;
    tags?: string[];
    message?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'level' | 'context';
    sortOrder?: 'asc' | 'desc';
}
export interface LogStatistics {
    totalEntries: number;
    entriesByLevel: Record<LogLevel, number>;
    entriesByContext: Record<string, number>;
    entriesBySource: Record<string, number>;
    timeRange: {
        startTime: Date;
        endTime: Date;
    };
    topErrors: Array<{
        message: string;
        count: number;
        lastOccurrence: Date;
    }>;
    performanceMetrics: {
        averageLogProcessingTime: number;
        logThroughput: number;
        errorRate: number;
    };
}
export interface LoggerConfig {
    minLevel: LogLevel;
    enableConsoleOutput: boolean;
    enableFileOutput: boolean;
    enableRemoteLogging: boolean;
    maxLogFileSize: number;
    maxLogFiles: number;
    logRotationInterval: number;
    contextFilters: string[];
    sensitiveDataMasking: boolean;
    structuredLogging: boolean;
    asyncLogging: boolean;
}
export interface ILogger {
    debug(message: string, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    info(message: string, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    warn(message: string, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    error(message: string, error?: Error, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    fatal(message: string, error?: Error, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    log(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    logWithCorrelation(level: LogLevel, message: string, correlationId: UUID, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    logUserAction(userId: UUID, action: string, resource?: string, result?: 'success' | 'failure' | 'partial', metadata?: Record<string, unknown>): Promise<void>;
    logPerformance(operation: string, duration: number, success: boolean, metadata?: Record<string, unknown>): Promise<void>;
    logSecurityEvent(eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', description: string, userId?: UUID, metadata?: Record<string, unknown>): Promise<void>;
    queryLogs(query: LogQuery): Promise<LogEntry[]>;
    getStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<LogStatistics>;
    clearOldLogs(olderThan: Date): Promise<number>;
    configure(config: Partial<LoggerConfig>): Promise<void>;
    getConfiguration(): Promise<LoggerConfig>;
    createChildLogger(context: string, metadata?: Record<string, unknown>): ILogger;
    flush(): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=logger.interface.d.ts.map