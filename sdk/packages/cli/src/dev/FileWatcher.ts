/**
 * @fileoverview File watcher implementation
 */

import { MPLPEventManager } from '../core/MPLPEventManager';
import * as path from 'path';
import * as fs from 'fs-extra';
import { EventEmitter } from 'events';
import { DevServerConfig, IFileWatcher, FileChangeEvent } from './types';

/**
 * File watcher implementation using fs.watch
 */
export class FileWatcher extends EventEmitter implements IFileWatcher {
  private eventManager: MPLPEventManager;
  private readonly config: DevServerConfig;
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private _isWatching = false;
  private _watchedPaths: Set<string> = new Set();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceDelay = 100; // ms

  constructor(config: DevServerConfig) {
    super(); // Call EventEmitter constructor
    this.eventManager = new MPLPEventManager();
    this.config = config;
  }

  // ===== EventEmitter兼容方法 =====
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
   * Get watching status
   */
  public get isWatching(): boolean {
    return this._isWatching;
  }

  /**
   * Get watched paths
   */
  public get watchedPaths(): string[] {
    return Array.from(this._watchedPaths);
  }

  /**
   * Start file watching
   */
  public async start(): Promise<void> {
    if (this._isWatching) {
      return;
    }

    try {
      // Watch patterns from config
      for (const pattern of this.config.watchPatterns) {
        await this.addPattern(pattern);
      }

      this._isWatching = true;
      this.emit('watcher:start');
      
    } catch (error) {
      this.emit('watcher:error', error);
      throw error;
    }
  }

  /**
   * Stop file watching
   */
  public async stop(): Promise<void> {
    if (!this._isWatching) {
      return;
    }

    try {
      // Close all watchers
      for (const [path, watcher] of this.watchers) {
        watcher.close();
      }
      
      // Clear debounce timers
      for (const timer of this.debounceTimers.values()) {
        clearTimeout(timer);
      }

      this.watchers.clear();
      this._watchedPaths.clear();
      this.debounceTimers.clear();
      this._isWatching = false;
      
      this.emit('watcher:stop');
      
    } catch (error) {
      this.emit('watcher:error', error);
      throw error;
    }
  }

  /**
   * Add watch pattern
   */
  public addPattern(pattern: string): void {
    if (this.isGlobPattern(pattern)) {
      this.addGlobPattern(pattern);
    } else {
      this.addSinglePath(pattern);
    }
  }

  /**
   * Remove watch pattern
   */
  public removePattern(pattern: string): void {
    if (this.isGlobPattern(pattern)) {
      this.removeGlobPattern(pattern);
    } else {
      this.removeSinglePath(pattern);
    }
  }

  /**
   * Check if pattern is a glob pattern
   */
  private isGlobPattern(pattern: string): boolean {
    return pattern.includes('*') || pattern.includes('?') || pattern.includes('[');
  }

  /**
   * Add glob pattern
   */
  private addGlobPattern(pattern: string): void {
    // For simplicity, we'll watch the base directory and filter files
    const basePath = this.getBasePath(pattern);
    const fullPath = path.resolve(this.config.projectRoot, basePath);
    
    if (fs.existsSync(fullPath)) {
      this.watchDirectory(fullPath, pattern);
    }
  }

  /**
   * Remove glob pattern
   */
  private removeGlobPattern(pattern: string): void {
    const basePath = this.getBasePath(pattern);
    const fullPath = path.resolve(this.config.projectRoot, basePath);
    
    this.unwatchPath(fullPath);
  }

  /**
   * Add single path
   */
  private addSinglePath(filePath: string): void {
    const fullPath = path.resolve(this.config.projectRoot, filePath);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        this.watchDirectory(fullPath);
      } else {
        this.watchFile(fullPath);
      }
    }
  }

  /**
   * Remove single path
   */
  private removeSinglePath(filePath: string): void {
    const fullPath = path.resolve(this.config.projectRoot, filePath);
    this.unwatchPath(fullPath);
  }

  /**
   * Watch directory
   */
  private watchDirectory(dirPath: string, pattern?: string): void {
    if (this.watchers.has(dirPath)) {
      return;
    }

    try {
      const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          const filePath = path.join(dirPath, filename);
          this.handleFileEvent(eventType, filePath, pattern);
        }
      });

      this.watchers.set(dirPath, watcher);
      this._watchedPaths.add(dirPath);
      
      watcher.on('error', (error) => {
        this.emit('watcher:error', error);
      });
      
    } catch (error) {
      this.emit('watcher:error', error);
    }
  }

  /**
   * Watch file
   */
  private watchFile(filePath: string): void {
    if (this.watchers.has(filePath)) {
      return;
    }

    try {
      const watcher = fs.watch(filePath, (eventType) => {
        this.handleFileEvent(eventType, filePath);
      });

      this.watchers.set(filePath, watcher);
      this._watchedPaths.add(filePath);
      
      watcher.on('error', (error) => {
        this.emit('watcher:error', error);
      });
      
    } catch (error) {
      this.emit('watcher:error', error);
    }
  }

  /**
   * Unwatch path
   */
  private unwatchPath(filePath: string): void {
    const watcher = this.watchers.get(filePath);
    
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
      this._watchedPaths.delete(filePath);
    }
  }

  /**
   * Handle file event
   */
  private handleFileEvent(eventType: string, filePath: string, pattern?: string): void {
    // Check if file should be ignored
    if (this.shouldIgnoreFile(filePath)) {
      return;
    }

    // Check if file matches pattern (if provided)
    if (pattern && !this.matchesPattern(filePath, pattern)) {
      return;
    }

    // Debounce file events
    this.debounceFileEvent(eventType, filePath);
  }

  /**
   * Debounce file event
   */
  private debounceFileEvent(eventType: string, filePath: string): void {
    const key = `${eventType}:${filePath}`;
    
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.emitFileEvent(eventType, filePath);
      this.debounceTimers.delete(key);
    }, this.debounceDelay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Emit file event
   */
  private emitFileEvent(eventType: string, filePath: string): void {
    let changeType: FileChangeEvent['type'];
    
    // Determine change type
    if (fs.existsSync(filePath)) {
      changeType = eventType === 'rename' ? 'add' : 'change';
    } else {
      changeType = 'unlink';
    }

    const event: FileChangeEvent = {
      type: changeType,
      path: filePath,
      timestamp: new Date()
    };

    // Add stats if file exists
    if (changeType !== 'unlink') {
      try {
        event.stats = fs.statSync(filePath);
      } catch (error) {
        // Ignore stats errors
      }
    }

    this.emit('change', event);
    this.emit(changeType, event);
  }

  /**
   * Check if file should be ignored
   */
  private shouldIgnoreFile(filePath: string): boolean {
    const relativePath = path.relative(this.config.projectRoot, filePath);
    
    return this.config.ignorePatterns.some(pattern => {
      return this.matchesPattern(relativePath, pattern);
    });
  }

  /**
   * Check if path matches pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple glob matching - in a real implementation, you'd use a library like minimatch
    const regex = this.globToRegex(pattern);
    const relativePath = path.relative(this.config.projectRoot, filePath);
    
    return regex.test(relativePath.replace(/\\/g, '/'));
  }

  /**
   * Convert glob pattern to regex
   */
  private globToRegex(pattern: string): RegExp {
    // Simple glob to regex conversion
    let regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    return new RegExp(`^${regexPattern}$`);
  }

  /**
   * Get base path from glob pattern
   */
  private getBasePath(pattern: string): string {
    const parts = pattern.split('/');
    const baseParts = [];
    
    for (const part of parts) {
      if (part.includes('*') || part.includes('?') || part.includes('[')) {
        break;
      }
      baseParts.push(part);
    }
    
    return baseParts.join('/') || '.';
  }
}
