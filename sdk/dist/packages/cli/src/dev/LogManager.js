"use strict";
/**
 * @fileoverview Log manager implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogManager = void 0;
const events_1 = require("events");
const MPLPEventManager_1 = require("../core/MPLPEventManager");
/**
 * Log manager implementation
 */
class LogManager extends events_1.EventEmitter {
    constructor(config) {
        super();
        this._entries = [];
        this._maxEntries = 1000;
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this.config = config;
    }
    // ===== EventEmitter兼容方法 =====
    on(event, listener) { this.eventManager.on(event, listener); return this; }
    emit(event, ...args) { return this.eventManager.emit(event, ...args); }
    off(event, listener) { this.eventManager.off(event, listener); return this; }
    removeAllListeners(event) { this.eventManager.removeAllListeners(event); return this; }
    /**
     * Get log entries
     */
    get entries() {
        return [...this._entries];
    }
    /**
     * Get max entries
     */
    get maxEntries() {
        return this._maxEntries;
    }
    /**
     * Log a message
     */
    log(level, message, source, data) {
        const entry = {
            timestamp: new Date(),
            level,
            message,
            source,
            data
        };
        // Add to entries
        this._entries.push(entry);
        // Trim entries if needed
        if (this._entries.length > this._maxEntries) {
            this._entries = this._entries.slice(-this._maxEntries);
        }
        // Emit event
        this.emit('log:entry', entry);
        // Console output if not quiet
        if (!this.config.quiet) {
            this.outputToConsole(entry);
        }
    }
    /**
     * Clear log entries
     */
    clear() {
        this._entries = [];
        this.emit('log:clear');
    }
    /**
     * Get filtered entries
     */
    getEntries(filter) {
        let entries = this._entries;
        if (filter) {
            entries = entries.filter(entry => {
                if (filter.level && entry.level !== filter.level) {
                    return false;
                }
                if (filter.source && entry.source !== filter.source) {
                    return false;
                }
                if (filter.since && entry.timestamp < filter.since) {
                    return false;
                }
                return true;
            });
        }
        return entries;
    }
    /**
     * Output log entry to console
     */
    outputToConsole(entry) {
        const timestamp = entry.timestamp.toISOString().substr(11, 8);
        const level = entry.level.toUpperCase().padEnd(5);
        const source = entry.source.padEnd(12);
        let output = `[${timestamp}] ${level} ${source} ${entry.message}`;
        // Add color based on level (if supported)
        if (process.stdout.isTTY) {
            switch (entry.level) {
                case 'error':
                    output = `\x1b[31m${output}\x1b[0m`; // Red
                    break;
                case 'warn':
                    output = `\x1b[33m${output}\x1b[0m`; // Yellow
                    break;
                case 'info':
                    output = `\x1b[36m${output}\x1b[0m`; // Cyan
                    break;
                case 'debug':
                    output = `\x1b[90m${output}\x1b[0m`; // Gray
                    break;
            }
        }
        console.log(output);
        // Output data if present and verbose
        if (entry.data && this.config.verbose) {
            console.log('  Data:', entry.data);
        }
    }
}
exports.LogManager = LogManager;
//# sourceMappingURL=LogManager.js.map