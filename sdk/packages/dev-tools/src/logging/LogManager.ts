/**
 * @fileoverview Log Manager - Central logging coordinator
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { LogConfig, LogEntry, LogLevel, LogFilter, LogStatistics } from '../types/logging';
import { MPLPEventManager } from '../utils/MPLPEventManager';

/**
 * Central logging coordinator for MPLP applications
 */
export class LogManager {
  private eventManager: MPLPEventManager;
  private config: LogConfig;
  private entries: LogEntry[] = [];
  private isActive = false;
  private readonly maxEntries: number;

  constructor(config: LogConfig = { level: 'info', outputs: [], formatters: [] }) {
    this.eventManager = new MPLPEventManager();
    this.config = config;
    this.maxEntries = config.maxEntries || 10000;
  }

  // EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Start log manager
   */
  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.emit('started');
  }

  /**
   * Stop log manager
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.emit('stopped');
  }

  /**
   * Log a message
   */
  log(level: LogLevel, message: string, source: string, metadata?: Record<string, any>): void {
    if (!this.isActive || !this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      source,
      metadata,
      correlationId: metadata?.correlationId
    };

    this.addEntry(entry);
    this.emit('logEntry', entry);
  }

  /**
   * Log debug message
   */
  debug(message: string, source: string, metadata?: Record<string, any>): void {
    this.log('debug', message, source, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, source: string, metadata?: Record<string, any>): void {
    this.log('info', message, source, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, source: string, metadata?: Record<string, any>): void {
    this.log('warn', message, source, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, source: string, metadata?: Record<string, any>, error?: Error): void {
    const entryMetadata = { ...metadata };
    if (error) {
      entryMetadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    this.log('error', message, source, entryMetadata);
  }

  /**
   * Log fatal message
   */
  fatal(message: string, source: string, metadata?: Record<string, any>, error?: Error): void {
    const entryMetadata = { ...metadata };
    if (error) {
      entryMetadata.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    this.log('fatal', message, source, entryMetadata);
  }

  /**
   * Get all log entries
   */
  getAllEntries(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Get filtered log entries
   */
  getFilteredEntries(filter: LogFilter): LogEntry[] {
    return this.entries.filter(entry => this.matchesFilter(entry, filter));
  }

  /**
   * Get log statistics
   */
  getStatistics(): LogStatistics {
    const entriesByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    };

    const entriesBySource: Record<string, number> = {};
    const entriesByCategory: Record<string, number> = {};

    let errorCount = 0;
    let startTime = new Date();
    let endTime = new Date(0);

    this.entries.forEach(entry => {
      entriesByLevel[entry.level]++;
      
      entriesBySource[entry.source] = (entriesBySource[entry.source] || 0) + 1;
      
      if (entry.category) {
        entriesByCategory[entry.category] = (entriesByCategory[entry.category] || 0) + 1;
      }

      if (entry.level === 'error' || entry.level === 'fatal') {
        errorCount++;
      }

      if (entry.timestamp < startTime) {
        startTime = entry.timestamp;
      }
      if (entry.timestamp > endTime) {
        endTime = entry.timestamp;
      }
    });

    const timeRangeMs = endTime.getTime() - startTime.getTime();
    const timeRangeMinutes = timeRangeMs / (1000 * 60);

    return {
      totalEntries: this.entries.length,
      entriesByLevel,
      entriesBySource,
      entriesByCategory,
      timeRange: { start: startTime, end: endTime },
      errorRate: this.entries.length > 0 ? errorCount / this.entries.length : 0,
      averageEntriesPerMinute: timeRangeMinutes > 0 ? this.entries.length / timeRangeMinutes : 0
    };
  }

  /**
   * Clear all log entries
   */
  clearEntries(): void {
    this.entries = [];
    this.emit('entriesCleared');
  }

  /**
   * Search log entries
   */
  searchEntries(query: string, filter?: LogFilter): LogEntry[] {
    const searchFilter = filter || {};
    const queryLower = query.toLowerCase();

    return this.entries.filter(entry => {
      // Apply existing filters
      if (!this.matchesFilter(entry, searchFilter)) {
        return false;
      }

      // Apply text search
      return (
        entry.message.toLowerCase().includes(queryLower) ||
        entry.source.toLowerCase().includes(queryLower) ||
        (entry.category && entry.category.toLowerCase().includes(queryLower)) ||
        (entry.metadata && JSON.stringify(entry.metadata).toLowerCase().includes(queryLower))
      );
    });
  }

  /**
   * Add log entry
   */
  private addEntry(entry: LogEntry): void {
    this.entries.push(entry);

    // Keep only the most recent entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  /**
   * Check if should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const configLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= configLevelIndex;
  }

  /**
   * Check if entry matches filter
   */
  private matchesFilter(entry: LogEntry, filter: LogFilter): boolean {
    if (filter.level && !filter.level.includes(entry.level)) {
      return false;
    }

    if (filter.source && !filter.source.includes(entry.source)) {
      return false;
    }

    if (filter.category && (!entry.category || !filter.category.includes(entry.category))) {
      return false;
    }

    if (filter.timeRange) {
      if (entry.timestamp < filter.timeRange.start || entry.timestamp > filter.timeRange.end) {
        return false;
      }
    }

    if (filter.correlationId && entry.correlationId !== filter.correlationId) {
      return false;
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesSearch = (
        entry.message.toLowerCase().includes(searchLower) ||
        entry.source.toLowerCase().includes(searchLower) ||
        (entry.category && entry.category.toLowerCase().includes(searchLower))
      );
      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current configuration
   */
  getConfig(): LogConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }
}
