"use strict";
/**
 * @fileoverview File watcher implementation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcher = void 0;
const MPLPEventManager_1 = require("../core/MPLPEventManager");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const events_1 = require("events");
/**
 * File watcher implementation using fs.watch
 */
class FileWatcher extends events_1.EventEmitter {
    constructor(config) {
        super(); // Call EventEmitter constructor
        this.watchers = new Map();
        this._isWatching = false;
        this._watchedPaths = new Set();
        this.debounceTimers = new Map();
        this.debounceDelay = 100; // ms
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this.config = config;
    }
    // ===== EventEmitter兼容方法 =====
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    /**
     * Get watching status
     */
    get isWatching() {
        return this._isWatching;
    }
    /**
     * Get watched paths
     */
    get watchedPaths() {
        return Array.from(this._watchedPaths);
    }
    /**
     * Start file watching
     */
    async start() {
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
        }
        catch (error) {
            this.emit('watcher:error', error);
            throw error;
        }
    }
    /**
     * Stop file watching
     */
    async stop() {
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
        }
        catch (error) {
            this.emit('watcher:error', error);
            throw error;
        }
    }
    /**
     * Add watch pattern
     */
    addPattern(pattern) {
        if (this.isGlobPattern(pattern)) {
            this.addGlobPattern(pattern);
        }
        else {
            this.addSinglePath(pattern);
        }
    }
    /**
     * Remove watch pattern
     */
    removePattern(pattern) {
        if (this.isGlobPattern(pattern)) {
            this.removeGlobPattern(pattern);
        }
        else {
            this.removeSinglePath(pattern);
        }
    }
    /**
     * Check if pattern is a glob pattern
     */
    isGlobPattern(pattern) {
        return pattern.includes('*') || pattern.includes('?') || pattern.includes('[');
    }
    /**
     * Add glob pattern
     */
    addGlobPattern(pattern) {
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
    removeGlobPattern(pattern) {
        const basePath = this.getBasePath(pattern);
        const fullPath = path.resolve(this.config.projectRoot, basePath);
        this.unwatchPath(fullPath);
    }
    /**
     * Add single path
     */
    addSinglePath(filePath) {
        const fullPath = path.resolve(this.config.projectRoot, filePath);
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                this.watchDirectory(fullPath);
            }
            else {
                this.watchFile(fullPath);
            }
        }
    }
    /**
     * Remove single path
     */
    removeSinglePath(filePath) {
        const fullPath = path.resolve(this.config.projectRoot, filePath);
        this.unwatchPath(fullPath);
    }
    /**
     * Watch directory
     */
    watchDirectory(dirPath, pattern) {
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
        }
        catch (error) {
            this.emit('watcher:error', error);
        }
    }
    /**
     * Watch file
     */
    watchFile(filePath) {
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
        }
        catch (error) {
            this.emit('watcher:error', error);
        }
    }
    /**
     * Unwatch path
     */
    unwatchPath(filePath) {
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
    handleFileEvent(eventType, filePath, pattern) {
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
    debounceFileEvent(eventType, filePath) {
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
    emitFileEvent(eventType, filePath) {
        let changeType;
        // Determine change type
        if (fs.existsSync(filePath)) {
            changeType = eventType === 'rename' ? 'add' : 'change';
        }
        else {
            changeType = 'unlink';
        }
        const event = {
            type: changeType,
            path: filePath,
            timestamp: new Date()
        };
        // Add stats if file exists
        if (changeType !== 'unlink') {
            try {
                event.stats = fs.statSync(filePath);
            }
            catch (error) {
                // Ignore stats errors
            }
        }
        this.emit('change', event);
        this.emit(changeType, event);
    }
    /**
     * Check if file should be ignored
     */
    shouldIgnoreFile(filePath) {
        const relativePath = path.relative(this.config.projectRoot, filePath);
        return this.config.ignorePatterns.some(pattern => {
            return this.matchesPattern(relativePath, pattern);
        });
    }
    /**
     * Check if path matches pattern
     */
    matchesPattern(filePath, pattern) {
        // Simple glob matching - in a real implementation, you'd use a library like minimatch
        const regex = this.globToRegex(pattern);
        const relativePath = path.relative(this.config.projectRoot, filePath);
        return regex.test(relativePath.replace(/\\/g, '/'));
    }
    /**
     * Convert glob pattern to regex
     */
    globToRegex(pattern) {
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
    getBasePath(pattern) {
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
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=FileWatcher.js.map