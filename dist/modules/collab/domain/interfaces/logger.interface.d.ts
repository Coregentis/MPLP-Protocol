/**
 * Logger Interface - Domain Layer
 * @description Interface for logging operations in collaboration module
 * @version 1.0.0
 * @author MPLP Development Team
 * @created 2025-01-27
 * @refactoring_guide_compliance 100%
 */
import { UUID } from '../../../../shared/types';
/**
 * Log level enumeration
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
/**
 * Log entry structure
 */
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
/**
 * Log query parameters
 */
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
/**
 * Log statistics
 */
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
/**
 * Logger configuration
 */
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
/**
 * Logger Interface
 * Handles all logging operations for the collaboration module
 *
 * @interface ILogger
 * @description Core interface for logging as required by refactoring guide
 */
export interface ILogger {
    /**
     * Log debug message
     * @param message - Debug message
     * @param context - Log context (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    debug(message: string, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log info message
     * @param message - Info message
     * @param context - Log context (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    info(message: string, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log warning message
     * @param message - Warning message
     * @param context - Log context (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    warn(message: string, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log error message
     * @param message - Error message
     * @param error - Error object (optional)
     * @param context - Log context (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    error(message: string, error?: Error, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log fatal error message
     * @param message - Fatal error message
     * @param error - Error object (optional)
     * @param context - Log context (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    fatal(message: string, error?: Error, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Generic log method
     * @param level - Log level
     * @param message - Log message
     * @param context - Log context (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    log(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log with correlation ID for request tracking
     * @param level - Log level
     * @param message - Log message
     * @param correlationId - Correlation ID for request tracking
     * @param context - Log context (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    logWithCorrelation(level: LogLevel, message: string, correlationId: UUID, context?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log user action
     * @param userId - User identifier
     * @param action - Action performed
     * @param resource - Resource affected (optional)
     * @param result - Action result (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    logUserAction(userId: UUID, action: string, resource?: string, result?: 'success' | 'failure' | 'partial', metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log performance metrics
     * @param operation - Operation name
     * @param duration - Operation duration in milliseconds
     * @param success - Whether operation was successful
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    logPerformance(operation: string, duration: number, success: boolean, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log security event
     * @param eventType - Security event type
     * @param severity - Event severity
     * @param description - Event description
     * @param userId - User involved (optional)
     * @param metadata - Additional metadata (optional)
     * @returns Promise<void>
     */
    logSecurityEvent(eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', description: string, userId?: UUID, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Query log entries
     * @param query - Log query parameters
     * @returns Promise<LogEntry[]> - Array of matching log entries
     */
    queryLogs(query: LogQuery): Promise<LogEntry[]>;
    /**
     * Get log statistics
     * @param timeRange - Time range for statistics (optional)
     * @returns Promise<LogStatistics> - Log statistics
     */
    getStatistics(timeRange?: {
        startTime: Date;
        endTime: Date;
    }): Promise<LogStatistics>;
    /**
     * Clear old log entries
     * @param olderThan - Clear entries older than this date
     * @returns Promise<number> - Number of entries cleared
     */
    clearOldLogs(olderThan: Date): Promise<number>;
    /**
     * Set logger configuration
     * @param config - Logger configuration
     * @returns Promise<void>
     */
    configure(config: Partial<LoggerConfig>): Promise<void>;
    /**
     * Get current logger configuration
     * @returns Promise<LoggerConfig> - Current configuration
     */
    getConfiguration(): Promise<LoggerConfig>;
    /**
     * Create child logger with specific context
     * @param context - Context for child logger
     * @param metadata - Default metadata for child logger (optional)
     * @returns ILogger - Child logger instance
     */
    createChildLogger(context: string, metadata?: Record<string, unknown>): ILogger;
    /**
     * Flush pending log entries
     * @returns Promise<void>
     */
    flush(): Promise<void>;
    /**
     * Close logger and cleanup resources
     * @returns Promise<void>
     */
    close(): Promise<void>;
}
//# sourceMappingURL=logger.interface.d.ts.map