/**
 * @fileoverview Log Manager - Central logging coordinator
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
import { LogConfig, LogEntry, LogLevel, LogFilter, LogStatistics } from '../types/logging';
/**
 * Central logging coordinator for MPLP applications
 */
export declare class LogManager extends EventEmitter {
    private config;
    private entries;
    private isActive;
    private readonly maxEntries;
    constructor(config?: LogConfig);
    /**
     * Start log manager
     */
    start(): Promise<void>;
    /**
     * Stop log manager
     */
    stop(): Promise<void>;
    /**
     * Log a message
     */
    log(level: LogLevel, message: string, source: string, metadata?: Record<string, any>): void;
    /**
     * Log debug message
     */
    debug(message: string, source: string, metadata?: Record<string, any>): void;
    /**
     * Log info message
     */
    info(message: string, source: string, metadata?: Record<string, any>): void;
    /**
     * Log warning message
     */
    warn(message: string, source: string, metadata?: Record<string, any>): void;
    /**
     * Log error message
     */
    error(message: string, source: string, metadata?: Record<string, any>, error?: Error): void;
    /**
     * Log fatal message
     */
    fatal(message: string, source: string, metadata?: Record<string, any>, error?: Error): void;
    /**
     * Get all log entries
     */
    getAllEntries(): LogEntry[];
    /**
     * Get filtered log entries
     */
    getFilteredEntries(filter: LogFilter): LogEntry[];
    /**
     * Get log statistics
     */
    getStatistics(): LogStatistics;
    /**
     * Clear all log entries
     */
    clearEntries(): void;
    /**
     * Search log entries
     */
    searchEntries(query: string, filter?: LogFilter): LogEntry[];
    /**
     * Add log entry
     */
    private addEntry;
    /**
     * Check if should log at this level
     */
    private shouldLog;
    /**
     * Check if entry matches filter
     */
    private matchesFilter;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Get current configuration
     */
    getConfig(): LogConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<LogConfig>): void;
}
//# sourceMappingURL=LogManager.d.ts.map