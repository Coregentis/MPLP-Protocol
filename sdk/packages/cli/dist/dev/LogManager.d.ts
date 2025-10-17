/**
 * @fileoverview Log manager implementation
 */
import { EventEmitter } from 'events';
import { DevServerConfig, ILogManager, LogEntry } from './types';
/**
 * Log manager implementation
 */
export declare class LogManager extends EventEmitter implements ILogManager {
    private eventManager;
    private readonly config;
    private _entries;
    private readonly _maxEntries;
    constructor(config: DevServerConfig);
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
    /**
     * Get log entries
     */
    get entries(): LogEntry[];
    /**
     * Get max entries
     */
    get maxEntries(): number;
    /**
     * Log a message
     */
    log(level: LogEntry['level'], message: string, source: string, data?: any): void;
    /**
     * Clear log entries
     */
    clear(): void;
    /**
     * Get filtered entries
     */
    getEntries(filter?: {
        level?: LogEntry['level'];
        source?: string;
        since?: Date;
    }): LogEntry[];
    /**
     * Output log entry to console
     */
    private outputToConsole;
}
//# sourceMappingURL=LogManager.d.ts.map