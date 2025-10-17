/**
 * @fileoverview Development server types
 */
import { EventEmitter } from 'events';
/**
 * Development server configuration
 */
export interface DevServerConfig {
    port: number;
    host: string;
    openBrowser: boolean;
    hotReload: boolean;
    enableLogs: boolean;
    enableDebug: boolean;
    enableMetrics: boolean;
    environment: string;
    verbose: boolean;
    quiet: boolean;
    projectRoot: string;
    srcDir: string;
    distDir: string;
    publicDir: string;
    watchPatterns: string[];
    ignorePatterns: string[];
    [key: string]: any;
}
/**
 * File change event
 */
export interface FileChangeEvent {
    type: 'add' | 'change' | 'unlink';
    path: string;
    stats?: any;
    timestamp: Date;
}
/**
 * Build result
 */
export interface BuildResult {
    success: boolean;
    duration: number;
    errors: BuildError[];
    warnings: BuildWarning[];
    assets: BuildAsset[];
}
/**
 * Build error
 */
export interface BuildError {
    message: string;
    file?: string;
    line?: number;
    column?: number;
    stack?: string;
}
/**
 * Build warning
 */
export interface BuildWarning {
    message: string;
    file?: string;
    line?: number;
    column?: number;
}
/**
 * Build asset
 */
export interface BuildAsset {
    name: string;
    size: number;
    type: 'js' | 'ts' | 'json' | 'other';
    path: string;
}
/**
 * Server metrics
 */
export interface ServerMetrics {
    uptime: number;
    requests: number;
    errors: number;
    buildTime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
}
/**
 * Log entry
 */
export interface LogEntry {
    timestamp: Date;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    source: string;
    data?: any;
}
/**
 * WebSocket message types
 */
export type WebSocketMessage = HotReloadMessage | LogMessage | MetricsMessage | BuildMessage | ErrorMessage;
/**
 * Hot reload message
 */
export interface HotReloadMessage {
    type: 'hot-reload';
    data: {
        action: 'reload' | 'update';
        files: string[];
        timestamp: number;
    };
}
/**
 * Log message
 */
export interface LogMessage {
    type: 'log';
    data: LogEntry;
}
/**
 * Metrics message
 */
export interface MetricsMessage {
    type: 'metrics';
    data: ServerMetrics;
}
/**
 * Build message
 */
export interface BuildMessage {
    type: 'build';
    data: BuildResult;
}
/**
 * Error message
 */
export interface ErrorMessage {
    type: 'error';
    data: {
        message: string;
        stack?: string;
        timestamp: number;
    };
}
/**
 * Development server interface
 */
export interface IDevServer extends EventEmitter {
    readonly config: DevServerConfig;
    readonly isRunning: boolean;
    readonly metrics: ServerMetrics;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    addWatchPattern(pattern: string): void;
    removeWatchPattern(pattern: string): void;
    build(): Promise<BuildResult>;
    broadcast(message: WebSocketMessage): void;
    getConnectedClients(): number;
}
/**
 * File watcher interface
 */
export interface IFileWatcher extends EventEmitter {
    readonly isWatching: boolean;
    readonly watchedPaths: string[];
    start(): Promise<void>;
    stop(): Promise<void>;
    addPattern(pattern: string): void;
    removePattern(pattern: string): void;
}
/**
 * Build manager interface
 */
export interface IBuildManager extends EventEmitter {
    readonly isBuilding: boolean;
    readonly lastBuildResult: BuildResult | null;
    build(): Promise<BuildResult>;
    watch(): Promise<void>;
    stop(): Promise<void>;
}
/**
 * Hot reload manager interface
 */
export interface IHotReloadManager extends EventEmitter {
    readonly isEnabled: boolean;
    readonly connectedClients: number;
    enable(): void;
    disable(): void;
    reload(files?: string[]): void;
    update(files: string[]): void;
    addClient(client: any): void;
    removeClient(client: any): void;
}
/**
 * Log manager interface
 */
export interface ILogManager extends EventEmitter {
    readonly entries: LogEntry[];
    readonly maxEntries: number;
    log(level: LogEntry['level'], message: string, source: string, data?: any): void;
    clear(): void;
    getEntries(filter?: {
        level?: LogEntry['level'];
        source?: string;
        since?: Date;
    }): LogEntry[];
}
/**
 * Metrics manager interface
 */
export interface IMetricsManager extends EventEmitter {
    readonly metrics: ServerMetrics;
    readonly isCollecting: boolean;
    start(): void;
    stop(): void;
    recordRequest(): void;
    recordError(): void;
    recordBuildTime(duration: number): void;
    getMetrics(): ServerMetrics;
    resetMetrics(): void;
}
/**
 * Debug manager interface
 */
export interface IDebugManager extends EventEmitter {
    readonly isEnabled: boolean;
    readonly debugPort: number;
    enable(): Promise<void>;
    disable(): Promise<void>;
    attachDebugger(): Promise<void>;
    detachDebugger(): Promise<void>;
}
/**
 * Development server events
 */
export interface DevServerEvents {
    'server:start': () => void;
    'server:stop': () => void;
    'server:restart': () => void;
    'server:error': (error: Error) => void;
    'file:change': (event: FileChangeEvent) => void;
    'file:add': (event: FileChangeEvent) => void;
    'file:unlink': (event: FileChangeEvent) => void;
    'build:start': () => void;
    'build:complete': (result: BuildResult) => void;
    'build:error': (error: BuildError) => void;
    'client:connect': (clientId: string) => void;
    'client:disconnect': (clientId: string) => void;
    'log:entry': (entry: LogEntry) => void;
    'metrics:update': (metrics: ServerMetrics) => void;
}
/**
 * Development server options for creation
 */
export interface DevServerOptions {
    config: DevServerConfig;
    context?: any;
}
/**
 * Middleware function type
 */
export type MiddlewareFunction = (req: any, res: any, next: () => void) => void;
/**
 * Route handler function type
 */
export type RouteHandler = (req: any, res: any) => void | Promise<void>;
/**
 * Development server plugin interface
 */
export interface IDevServerPlugin {
    readonly name: string;
    readonly version: string;
    apply(server: IDevServer): void | Promise<void>;
}
/**
 * Plugin configuration
 */
export interface PluginConfig {
    name: string;
    options?: Record<string, any>;
}
/**
 * Extended development server configuration with plugins
 */
export interface ExtendedDevServerConfig extends DevServerConfig {
    plugins?: (IDevServerPlugin | PluginConfig)[];
    middleware?: MiddlewareFunction[];
    routes?: Record<string, RouteHandler>;
}
//# sourceMappingURL=types.d.ts.map