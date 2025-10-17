"use strict";
/**
 * @fileoverview Log Manager - Central logging coordinator
 * @version 1.1.0-beta
 * @author MPLP Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogManager = void 0;
const events_1 = require("events");
/**
 * Central logging coordinator for MPLP applications
 */
class LogManager extends events_1.EventEmitter {
    constructor(config = { level: 'info', outputs: [], formatters: [] }) {
        super();
        this.entries = [];
        this.isActive = false;
        this.config = config;
        this.maxEntries = config.maxEntries || 10000;
    }
    /**
     * Start log manager
     */
    async start() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.emit('started');
    }
    /**
     * Stop log manager
     */
    async stop() {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        this.emit('stopped');
    }
    /**
     * Log a message
     */
    log(level, message, source, metadata) {
        if (!this.isActive || !this.shouldLog(level)) {
            return;
        }
        const entry = {
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
    debug(message, source, metadata) {
        this.log('debug', message, source, metadata);
    }
    /**
     * Log info message
     */
    info(message, source, metadata) {
        this.log('info', message, source, metadata);
    }
    /**
     * Log warning message
     */
    warn(message, source, metadata) {
        this.log('warn', message, source, metadata);
    }
    /**
     * Log error message
     */
    error(message, source, metadata, error) {
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
    fatal(message, source, metadata, error) {
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
    getAllEntries() {
        return [...this.entries];
    }
    /**
     * Get filtered log entries
     */
    getFilteredEntries(filter) {
        return this.entries.filter(entry => this.matchesFilter(entry, filter));
    }
    /**
     * Get log statistics
     */
    getStatistics() {
        const entriesByLevel = {
            debug: 0,
            info: 0,
            warn: 0,
            error: 0,
            fatal: 0
        };
        const entriesBySource = {};
        const entriesByCategory = {};
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
    clearEntries() {
        this.entries = [];
        this.emit('entriesCleared');
    }
    /**
     * Search log entries
     */
    searchEntries(query, filter) {
        const searchFilter = filter || {};
        const queryLower = query.toLowerCase();
        return this.entries.filter(entry => {
            // Apply existing filters
            if (!this.matchesFilter(entry, searchFilter)) {
                return false;
            }
            // Apply text search
            return (entry.message.toLowerCase().includes(queryLower) ||
                entry.source.toLowerCase().includes(queryLower) ||
                (entry.category && entry.category.toLowerCase().includes(queryLower)) ||
                (entry.metadata && JSON.stringify(entry.metadata).toLowerCase().includes(queryLower)));
        });
    }
    /**
     * Add log entry
     */
    addEntry(entry) {
        this.entries.push(entry);
        // Keep only the most recent entries
        if (this.entries.length > this.maxEntries) {
            this.entries = this.entries.slice(-this.maxEntries);
        }
    }
    /**
     * Check if should log at this level
     */
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
        const configLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= configLevelIndex;
    }
    /**
     * Check if entry matches filter
     */
    matchesFilter(entry, filter) {
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
            const matchesSearch = (entry.message.toLowerCase().includes(searchLower) ||
                entry.source.toLowerCase().includes(searchLower) ||
                (entry.category && entry.category.toLowerCase().includes(searchLower)));
            if (!matchesSearch) {
                return false;
            }
        }
        return true;
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.emit('configUpdated', this.config);
    }
}
exports.LogManager = LogManager;
//# sourceMappingURL=LogManager.js.map