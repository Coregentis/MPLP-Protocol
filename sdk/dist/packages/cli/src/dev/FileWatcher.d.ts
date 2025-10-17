/**
 * @fileoverview File watcher implementation
 */
import { EventEmitter } from 'events';
import { DevServerConfig, IFileWatcher } from './types';
/**
 * File watcher implementation using fs.watch
 */
export declare class FileWatcher extends EventEmitter implements IFileWatcher {
    private eventManager;
    private readonly config;
    private watchers;
    private _isWatching;
    private _watchedPaths;
    private debounceTimers;
    private readonly debounceDelay;
    constructor(config: DevServerConfig);
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
    /**
     * Get watching status
     */
    get isWatching(): boolean;
    /**
     * Get watched paths
     */
    get watchedPaths(): string[];
    /**
     * Start file watching
     */
    start(): Promise<void>;
    /**
     * Stop file watching
     */
    stop(): Promise<void>;
    /**
     * Add watch pattern
     */
    addPattern(pattern: string): void;
    /**
     * Remove watch pattern
     */
    removePattern(pattern: string): void;
    /**
     * Check if pattern is a glob pattern
     */
    private isGlobPattern;
    /**
     * Add glob pattern
     */
    private addGlobPattern;
    /**
     * Remove glob pattern
     */
    private removeGlobPattern;
    /**
     * Add single path
     */
    private addSinglePath;
    /**
     * Remove single path
     */
    private removeSinglePath;
    /**
     * Watch directory
     */
    private watchDirectory;
    /**
     * Watch file
     */
    private watchFile;
    /**
     * Unwatch path
     */
    private unwatchPath;
    /**
     * Handle file event
     */
    private handleFileEvent;
    /**
     * Debounce file event
     */
    private debounceFileEvent;
    /**
     * Emit file event
     */
    private emitFileEvent;
    /**
     * Check if file should be ignored
     */
    private shouldIgnoreFile;
    /**
     * Check if path matches pattern
     */
    private matchesPattern;
    /**
     * Convert glob pattern to regex
     */
    private globToRegex;
    /**
     * Get base path from glob pattern
     */
    private getBasePath;
}
//# sourceMappingURL=FileWatcher.d.ts.map