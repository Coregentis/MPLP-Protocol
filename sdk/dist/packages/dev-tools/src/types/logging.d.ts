/**
 * @fileoverview Logging Types - Type definitions for logging tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */
/**
 * Log level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
/**
 * Log entry
 */
export interface LogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    message: string;
    source: string;
    category?: string;
    metadata?: Record<string, any>;
    stackTrace?: string;
    correlationId?: string;
}
/**
 * Log filter
 */
export interface LogFilter {
    level?: LogLevel[];
    source?: string[];
    category?: string[];
    timeRange?: {
        start: Date;
        end: Date;
    };
    search?: string;
    correlationId?: string;
}
/**
 * Log configuration
 */
export interface LogConfig {
    level: LogLevel;
    outputs: LogOutput[];
    formatters: LogFormatter[];
    filters?: LogFilter[];
    maxEntries?: number;
    rotationConfig?: LogRotationConfig;
}
/**
 * Log output
 */
export interface LogOutput {
    type: 'console' | 'file' | 'database' | 'remote' | 'custom';
    config: Record<string, any>;
    enabled: boolean;
    formatter?: string;
}
/**
 * Log formatter
 */
export interface LogFormatter {
    name: string;
    type: 'json' | 'text' | 'structured' | 'custom';
    config: Record<string, any>;
}
/**
 * Log rotation configuration
 */
export interface LogRotationConfig {
    maxSize: number;
    maxFiles: number;
    interval: 'daily' | 'weekly' | 'monthly';
    compress: boolean;
}
/**
 * Log statistics
 */
export interface LogStatistics {
    totalEntries: number;
    entriesByLevel: Record<LogLevel, number>;
    entriesBySource: Record<string, number>;
    entriesByCategory: Record<string, number>;
    timeRange: {
        start: Date;
        end: Date;
    };
    errorRate: number;
    averageEntriesPerMinute: number;
}
/**
 * Log search result
 */
export interface LogSearchResult {
    entries: LogEntry[];
    totalCount: number;
    hasMore: boolean;
    searchTime: number;
    query: LogSearchQuery;
}
/**
 * Log search query
 */
export interface LogSearchQuery {
    text?: string;
    filters: LogFilter;
    sortBy: 'timestamp' | 'level' | 'source';
    sortOrder: 'asc' | 'desc';
    limit: number;
    offset: number;
}
/**
 * Log export configuration
 */
export interface LogExportConfig {
    format: 'json' | 'csv' | 'txt';
    filters: LogFilter;
    compression: boolean;
    destination: string;
    includeMetadata: boolean;
}
/**
 * Log analysis result
 */
export interface LogAnalysisResult {
    patterns: LogPattern[];
    anomalies: LogAnomaly[];
    trends: LogTrend[];
    recommendations: LogRecommendation[];
    analysisTime: Date;
}
/**
 * Log pattern
 */
export interface LogPattern {
    id: string;
    pattern: string;
    frequency: number;
    firstSeen: Date;
    lastSeen: Date;
    examples: LogEntry[];
}
/**
 * Log anomaly
 */
export interface LogAnomaly {
    id: string;
    type: 'spike' | 'drop' | 'pattern' | 'error';
    severity: 'low' | 'medium' | 'high';
    description: string;
    timestamp: Date;
    affectedEntries: number;
    examples: LogEntry[];
}
/**
 * Log trend
 */
export interface LogTrend {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    change: number;
    timeframe: string;
    confidence: number;
}
/**
 * Log recommendation
 */
export interface LogRecommendation {
    type: 'performance' | 'error' | 'configuration' | 'monitoring';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    action: string;
    impact: string;
}
/**
 * Log viewer configuration
 */
export interface LogViewerConfig {
    autoRefresh: boolean;
    refreshInterval: number;
    maxDisplayEntries: number;
    defaultFilters: LogFilter;
    colorScheme: 'light' | 'dark' | 'auto';
    fontSize: number;
    showMetadata: boolean;
    showStackTrace: boolean;
}
//# sourceMappingURL=logging.d.ts.map