/**
 * @fileoverview Log manager implementation
 */

import { EventEmitter } from 'events';
import { MPLPEventManager } from '../core/MPLPEventManager';
import { DevServerConfig, ILogManager, LogEntry } from './types';

/**
 * Log manager implementation
 */
export class LogManager extends EventEmitter implements ILogManager {
  private eventManager: MPLPEventManager;
  private readonly config: DevServerConfig;
  private _entries: LogEntry[] = [];
  private readonly _maxEntries: number = 1000;

  constructor(config: DevServerConfig) {
    super();
    this.eventManager = new MPLPEventManager();
    this.config = config;
  }

  // ===== EventEmitter兼容方法 =====
  public on(event: string, listener: (...args: any[]) => void): this { this.eventManager.on(event, listener); return this; }
  public emit(event: string, ...args: any[]): boolean { return this.eventManager.emit(event, ...args); }
  public off(event: string, listener: (...args: any[]) => void): this { this.eventManager.off(event, listener); return this; }
  public removeAllListeners(event?: string): this { this.eventManager.removeAllListeners(event); return this; }

  /**
   * Get log entries
   */
  public get entries(): LogEntry[] {
    return [...this._entries];
  }

  /**
   * Get max entries
   */
  public get maxEntries(): number {
    return this._maxEntries;
  }

  /**
   * Log a message
   */
  public log(level: LogEntry['level'], message: string, source: string, data?: any): void {
    const entry: LogEntry = {
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
  public clear(): void {
    this._entries = [];
    this.emit('log:clear');
  }

  /**
   * Get filtered entries
   */
  public getEntries(filter?: {
    level?: LogEntry['level'];
    source?: string;
    since?: Date;
  }): LogEntry[] {
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
  private outputToConsole(entry: LogEntry): void {
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
