/**
 * @fileoverview Development server implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */

import { MPLPEventManager } from '../core/MPLPEventManager';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs-extra';
import { EventEmitter } from 'events';
import { DevServerConfig, IDevServer, ServerMetrics, WebSocketMessage, BuildResult } from './types';
import { FileWatcher } from './FileWatcher';
import { BuildManager } from './BuildManager';
import { HotReloadManager } from './HotReloadManager';
import { LogManager } from './LogManager';
import { MetricsManager } from './MetricsManager';

/**
 * Development server implementation - 基于MPLP V1.0 Alpha事件架构
 */
export class DevServer extends EventEmitter implements IDevServer {
  private eventManager: MPLPEventManager;
  public readonly config: DevServerConfig;
  private readonly context: any;
  
  private server?: http.Server;
  private fileWatcher?: FileWatcher;
  private buildManager?: BuildManager;
  private hotReloadManager?: HotReloadManager;
  private logManager?: LogManager;
  private metricsManager?: MetricsManager;
  
  private _isRunning = false;
  private startTime = 0;

  constructor(config: DevServerConfig, context: any) {
    super(); // Call EventEmitter constructor
    this.eventManager = new MPLPEventManager();
    this.config = config;
    this.context = context;

    this.setupManagers();
  }

  // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====

  /**
   * EventEmitter兼容的on方法
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的emit方法
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * EventEmitter兼容的off方法
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的removeAllListeners方法
   */
  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Get running status
   */
  public get isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Get server metrics
   */
  public get metrics(): ServerMetrics {
    return this.metricsManager?.getMetrics() || {
      uptime: 0,
      requests: 0,
      errors: 0,
      buildTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Start the development server
   */
  public async start(): Promise<void> {
    if (this._isRunning) {
      throw new Error('Development server is already running');
    }

    try {
      this.startTime = Date.now();
      
      // Start managers
      await this.startManagers();
      
      // Create HTTP server
      await this.createServer();
      
      // Start file watching
      if (this.config.hotReload) {
        await this.startFileWatching();
      }
      
      // Perform initial build
      await this.performInitialBuild();
      
      // Open browser if requested
      if (this.config.openBrowser) {
        await this.openBrowser();
      }
      
      this._isRunning = true;
      this.emit('server:start');
      
    } catch (error) {
      this.emit('server:error', error);
      throw error;
    }
  }

  /**
   * Stop the development server
   */
  public async stop(): Promise<void> {
    if (!this._isRunning) {
      return;
    }

    try {
      // Stop file watching
      if (this.fileWatcher) {
        await this.fileWatcher.stop();
      }
      
      // Stop build manager
      if (this.buildManager) {
        await this.buildManager.stop();
      }
      
      // Stop managers
      await this.stopManagers();
      
      // Close HTTP server
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server!.close(() => resolve());
        });
      }
      
      this._isRunning = false;
      this.emit('server:stop');
      
    } catch (error) {
      this.emit('server:error', error);
      throw error;
    }
  }

  /**
   * Restart the development server
   */
  public async restart(): Promise<void> {
    await this.stop();
    await this.start();
    this.emit('server:restart');
  }

  /**
   * Add watch pattern
   */
  public addWatchPattern(pattern: string): void {
    if (this.fileWatcher) {
      this.fileWatcher.addPattern(pattern);
    }
  }

  /**
   * Remove watch pattern
   */
  public removeWatchPattern(pattern: string): void {
    if (this.fileWatcher) {
      this.fileWatcher.removePattern(pattern);
    }
  }

  /**
   * Perform build
   */
  public async build(): Promise<BuildResult> {
    if (!this.buildManager) {
      throw new Error('Build manager not initialized');
    }
    
    return await this.buildManager.build();
  }

  /**
   * Broadcast message to all connected clients
   */
  public broadcast(message: WebSocketMessage): void {
    if (this.hotReloadManager) {
      this.hotReloadManager.broadcast(message);
    }
  }

  /**
   * Get number of connected clients
   */
  public getConnectedClients(): number {
    return this.hotReloadManager?.connectedClients || 0;
  }

  /**
   * Setup managers
   */
  private setupManagers(): void {
    // Create managers
    this.fileWatcher = new FileWatcher(this.config);
    this.buildManager = new BuildManager(this.config);
    this.logManager = new LogManager(this.config);
    this.metricsManager = new MetricsManager();
    
    if (this.config.hotReload) {
      this.hotReloadManager = new HotReloadManager(this.config);
    }
    
    // Setup event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // File watcher events
    if (this.fileWatcher) {
      this.fileWatcher.on('change', (event) => {
        this.handleFileChange(event);
      });
    }
    
    // Build manager events
    if (this.buildManager) {
      this.buildManager.on('build:complete', (result) => {
        this.handleBuildComplete(result);
      });
      
      this.buildManager.on('build:error', (error) => {
        this.handleBuildError(error);
      });
    }
    
    // Log manager events
    if (this.logManager) {
      this.logManager.on('log:entry', (entry) => {
        if (this.config.enableLogs) {
          this.broadcast({
            type: 'log',
            data: entry
          });
        }
      });
    }
    
    // Metrics manager events
    if (this.metricsManager) {
      this.metricsManager.on('metrics:update', (metrics) => {
        if (this.config.enableMetrics) {
          this.broadcast({
            type: 'metrics',
            data: metrics
          });
        }
      });
    }
  }

  /**
   * Start managers
   */
  private async startManagers(): Promise<void> {
    if (this.logManager) {
      this.logManager.log('info', 'Starting development server managers', 'DevServer');
    }
    
    if (this.metricsManager) {
      this.metricsManager.start();
    }
    
    if (this.hotReloadManager) {
      this.hotReloadManager.enable();
    }
  }

  /**
   * Stop managers
   */
  private async stopManagers(): Promise<void> {
    if (this.logManager) {
      this.logManager.log('info', 'Stopping development server managers', 'DevServer');
    }
    
    if (this.metricsManager) {
      this.metricsManager.stop();
    }
    
    if (this.hotReloadManager) {
      this.hotReloadManager.disable();
    }
  }

  /**
   * Create HTTP server
   */
  private async createServer(): Promise<void> {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });
    
    return new Promise<void>((resolve, reject) => {
      this.server!.listen(this.config.port, this.config.host, () => {
        if (this.logManager) {
          this.logManager.log('info', `Server listening on ${this.config.host}:${this.config.port}`, 'DevServer');
        }
        resolve();
      });
      
      this.server!.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Handle HTTP request
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (this.metricsManager) {
      this.metricsManager.recordRequest();
    }
    
    const url = req.url || '/';
    
    // Handle WebSocket upgrade for hot reload
    if (this.config.hotReload && url === '/ws') {
      // WebSocket handling would be implemented here
      // For now, just return a simple response
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('WebSocket endpoint');
      return;
    }
    
    // Handle API routes
    if (url.startsWith('/api/')) {
      this.handleApiRequest(req, res);
      return;
    }
    
    // Serve static files
    this.serveStaticFile(req, res);
  }

  /**
   * Handle API request
   */
  private handleApiRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '';
    
    if (url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'running',
        uptime: Date.now() - this.startTime,
        metrics: this.metrics
      }));
      return;
    }
    
    if (url === '/api/build') {
      this.handleBuildRequest(req, res);
      return;
    }
    
    // 404 for unknown API routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  /**
   * Handle build request
   */
  private async handleBuildRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const result = await this.build();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (error as Error).message }));
    }
  }

  /**
   * Serve static file
   */
  private serveStaticFile(req: http.IncomingMessage, res: http.ServerResponse): void {
    let filePath = req.url || '/';
    
    // Default to index.html for root
    if (filePath === '/') {
      filePath = '/index.html';
    }
    
    // Try to serve from public directory first
    const publicPath = path.join(this.config.publicDir, filePath);
    const distPath = path.join(this.config.distDir, filePath);
    
    // Check public directory first
    if (fs.existsSync(publicPath)) {
      this.sendFile(publicPath, res);
      return;
    }
    
    // Check dist directory
    if (fs.existsSync(distPath)) {
      this.sendFile(distPath, res);
      return;
    }
    
    // Serve development dashboard for unknown routes
    this.serveDevelopmentDashboard(res);
  }

  /**
   * Send file
   */
  private sendFile(filePath: string, res: http.ServerResponse): void {
    try {
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      const contentType = this.getContentType(ext);
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }

  /**
   * Get content type for file extension
   */
  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    
    return types[ext] || 'text/plain';
  }

  /**
   * Serve development dashboard
   */
  private serveDevelopmentDashboard(res: http.ServerResponse): void {
    const dashboard = this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(dashboard);
  }

  /**
   * Generate dashboard HTML
   */
  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>MPLP Development Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        .status { background: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric h3 { margin: 0 0 10px 0; color: #007acc; }
        .metric p { margin: 0; font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <h1 class="header">MPLP Development Server</h1>
    
    <div class="status">
        <h2>Server Status: Running</h2>
        <p>Environment: ${this.config.environment}</p>
        <p>Port: ${this.config.port}</p>
        <p>Hot Reload: ${this.config.hotReload ? 'Enabled' : 'Disabled'}</p>
        <p>Uptime: ${Math.floor((Date.now() - this.startTime) / 1000)}s</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>Requests</h3>
            <p>${this.metrics.requests}</p>
        </div>
        <div class="metric">
            <h3>Errors</h3>
            <p>${this.metrics.errors}</p>
        </div>
        <div class="metric">
            <h3>Connected Clients</h3>
            <p>${this.getConnectedClients()}</p>
        </div>
        <div class="metric">
            <h3>Memory Usage</h3>
            <p>${Math.round(this.metrics.memoryUsage.heapUsed / 1024 / 1024)}MB</p>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 5 seconds
        setTimeout(() => location.reload(), 5000);
    </script>
</body>
</html>
    `;
  }

  /**
   * Start file watching
   */
  private async startFileWatching(): Promise<void> {
    if (this.fileWatcher) {
      await this.fileWatcher.start();
    }
  }

  /**
   * Perform initial build
   */
  private async performInitialBuild(): Promise<void> {
    if (this.buildManager) {
      try {
        await this.buildManager.build();
      } catch (error) {
        if (this.logManager) {
          this.logManager.log('error', `Initial build failed: ${(error as Error).message}`, 'DevServer');
        }
      }
    }
  }

  /**
   * Open browser
   */
  private async openBrowser(): Promise<void> {
    const url = `http://${this.config.host}:${this.config.port}`;
    
    try {
      // Try to dynamically import 'open' module
      const openModule = await import('open' as any).catch(() => null);
      if (openModule && openModule.default) {
        await openModule.default(url);
      } else {
        console.log(`Please open ${url} in your browser`);
      }
      
      if (this.logManager) {
        this.logManager.log('info', `Opened browser at ${url}`, 'DevServer');
      }
    } catch (error) {
      if (this.logManager) {
        this.logManager.log('warn', `Failed to open browser: ${(error as Error).message}`, 'DevServer');
      }
    }
  }

  /**
   * Handle file change
   */
  private handleFileChange(event: any): void {
    if (this.logManager) {
      this.logManager.log('info', `File ${event.type}: ${event.path}`, 'FileWatcher');
    }
    
    // Trigger rebuild
    if (this.buildManager) {
      this.buildManager.build().catch((error) => {
        if (this.logManager) {
          this.logManager.log('error', `Build failed: ${error.message}`, 'BuildManager');
        }
      });
    }
    
    // Trigger hot reload
    if (this.hotReloadManager) {
      this.hotReloadManager.reload([event.path]);
    }
  }

  /**
   * Handle build complete
   */
  private handleBuildComplete(result: BuildResult): void {
    if (this.logManager) {
      this.logManager.log('info', `Build completed in ${result.duration}ms`, 'BuildManager');
    }
    
    if (this.metricsManager) {
      this.metricsManager.recordBuildTime(result.duration);
    }
    
    this.broadcast({
      type: 'build',
      data: result
    });
  }

  /**
   * Handle build error
   */
  private handleBuildError(error: any): void {
    if (this.logManager) {
      this.logManager.log('error', `Build error: ${error.message}`, 'BuildManager');
    }
    
    if (this.metricsManager) {
      this.metricsManager.recordError();
    }
    
    this.broadcast({
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      }
    });
  }
}
