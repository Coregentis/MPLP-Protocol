/**
 * @fileoverview Development server implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
import { EventEmitter } from 'events';
import { DevServerConfig, IDevServer, ServerMetrics, WebSocketMessage, BuildResult } from './types';
/**
 * Development server implementation - 基于MPLP V1.0 Alpha事件架构
 */
export declare class DevServer extends EventEmitter implements IDevServer {
    private eventManager;
    readonly config: DevServerConfig;
    private readonly context;
    private server?;
    private fileWatcher?;
    private buildManager?;
    private hotReloadManager?;
    private logManager?;
    private metricsManager?;
    private _isRunning;
    private startTime;
    constructor(config: DevServerConfig, context: any);
    /**
     * EventEmitter兼容的on方法
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * EventEmitter兼容的off方法
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event?: string): this;
    /**
     * Get running status
     */
    get isRunning(): boolean;
    /**
     * Get server metrics
     */
    get metrics(): ServerMetrics;
    /**
     * Start the development server
     */
    start(): Promise<void>;
    /**
     * Stop the development server
     */
    stop(): Promise<void>;
    /**
     * Restart the development server
     */
    restart(): Promise<void>;
    /**
     * Add watch pattern
     */
    addWatchPattern(pattern: string): void;
    /**
     * Remove watch pattern
     */
    removeWatchPattern(pattern: string): void;
    /**
     * Perform build
     */
    build(): Promise<BuildResult>;
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: WebSocketMessage): void;
    /**
     * Get number of connected clients
     */
    getConnectedClients(): number;
    /**
     * Setup managers
     */
    private setupManagers;
    /**
     * Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Start managers
     */
    private startManagers;
    /**
     * Stop managers
     */
    private stopManagers;
    /**
     * Create HTTP server
     */
    private createServer;
    /**
     * Handle HTTP request
     */
    private handleRequest;
    /**
     * Handle API request
     */
    private handleApiRequest;
    /**
     * Handle build request
     */
    private handleBuildRequest;
    /**
     * Serve static file
     */
    private serveStaticFile;
    /**
     * Send file
     */
    private sendFile;
    /**
     * Get content type for file extension
     */
    private getContentType;
    /**
     * Serve development dashboard
     */
    private serveDevelopmentDashboard;
    /**
     * Generate dashboard HTML
     */
    private generateDashboardHTML;
    /**
     * Start file watching
     */
    private startFileWatching;
    /**
     * Perform initial build
     */
    private performInitialBuild;
    /**
     * Open browser
     */
    private openBrowser;
    /**
     * Handle file change
     */
    private handleFileChange;
    /**
     * Handle build complete
     */
    private handleBuildComplete;
    /**
     * Handle build error
     */
    private handleBuildError;
}
//# sourceMappingURL=DevServer.d.ts.map