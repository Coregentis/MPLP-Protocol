"use strict";
/**
 * @fileoverview Development server implementation - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
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
exports.DevServer = void 0;
const MPLPEventManager_1 = require("../core/MPLPEventManager");
const http = __importStar(require("http"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const events_1 = require("events");
const FileWatcher_1 = require("./FileWatcher");
const BuildManager_1 = require("./BuildManager");
const HotReloadManager_1 = require("./HotReloadManager");
const LogManager_1 = require("./LogManager");
const MetricsManager_1 = require("./MetricsManager");
/**
 * Development server implementation - 基于MPLP V1.0 Alpha事件架构
 */
class DevServer extends events_1.EventEmitter {
    constructor(config, context) {
        super(); // Call EventEmitter constructor
        this._isRunning = false;
        this.startTime = 0;
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this.config = config;
        this.context = context;
        this.setupManagers();
    }
    // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====
    /**
     * EventEmitter兼容的on方法
     */
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    /**
     * EventEmitter兼容的off方法
     */
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    /**
     * Get running status
     */
    get isRunning() {
        return this._isRunning;
    }
    /**
     * Get server metrics
     */
    get metrics() {
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
    async start() {
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
        }
        catch (error) {
            this.emit('server:error', error);
            throw error;
        }
    }
    /**
     * Stop the development server
     */
    async stop() {
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
                await new Promise((resolve) => {
                    this.server.close(() => resolve());
                });
            }
            this._isRunning = false;
            this.emit('server:stop');
        }
        catch (error) {
            this.emit('server:error', error);
            throw error;
        }
    }
    /**
     * Restart the development server
     */
    async restart() {
        await this.stop();
        await this.start();
        this.emit('server:restart');
    }
    /**
     * Add watch pattern
     */
    addWatchPattern(pattern) {
        if (this.fileWatcher) {
            this.fileWatcher.addPattern(pattern);
        }
    }
    /**
     * Remove watch pattern
     */
    removeWatchPattern(pattern) {
        if (this.fileWatcher) {
            this.fileWatcher.removePattern(pattern);
        }
    }
    /**
     * Perform build
     */
    async build() {
        if (!this.buildManager) {
            throw new Error('Build manager not initialized');
        }
        return await this.buildManager.build();
    }
    /**
     * Broadcast message to all connected clients
     */
    broadcast(message) {
        if (this.hotReloadManager) {
            this.hotReloadManager.broadcast(message);
        }
    }
    /**
     * Get number of connected clients
     */
    getConnectedClients() {
        return this.hotReloadManager?.connectedClients || 0;
    }
    /**
     * Setup managers
     */
    setupManagers() {
        // Create managers
        this.fileWatcher = new FileWatcher_1.FileWatcher(this.config);
        this.buildManager = new BuildManager_1.BuildManager(this.config);
        this.logManager = new LogManager_1.LogManager(this.config);
        this.metricsManager = new MetricsManager_1.MetricsManager();
        if (this.config.hotReload) {
            this.hotReloadManager = new HotReloadManager_1.HotReloadManager(this.config);
        }
        // Setup event handlers
        this.setupEventHandlers();
    }
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
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
    async startManagers() {
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
    async stopManagers() {
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
    async createServer() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
        return new Promise((resolve, reject) => {
            this.server.listen(this.config.port, this.config.host, () => {
                if (this.logManager) {
                    this.logManager.log('info', `Server listening on ${this.config.host}:${this.config.port}`, 'DevServer');
                }
                resolve();
            });
            this.server.on('error', (error) => {
                reject(error);
            });
        });
    }
    /**
     * Handle HTTP request
     */
    handleRequest(req, res) {
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
    handleApiRequest(req, res) {
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
    async handleBuildRequest(req, res) {
        try {
            const result = await this.build();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        }
        catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }
    /**
     * Serve static file
     */
    serveStaticFile(req, res) {
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
    sendFile(filePath, res) {
        try {
            const content = fs.readFileSync(filePath);
            const ext = path.extname(filePath);
            const contentType = this.getContentType(ext);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
        catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
    /**
     * Get content type for file extension
     */
    getContentType(ext) {
        const types = {
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
    serveDevelopmentDashboard(res) {
        const dashboard = this.generateDashboardHTML();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(dashboard);
    }
    /**
     * Generate dashboard HTML
     */
    generateDashboardHTML() {
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
    async startFileWatching() {
        if (this.fileWatcher) {
            await this.fileWatcher.start();
        }
    }
    /**
     * Perform initial build
     */
    async performInitialBuild() {
        if (this.buildManager) {
            try {
                await this.buildManager.build();
            }
            catch (error) {
                if (this.logManager) {
                    this.logManager.log('error', `Initial build failed: ${error.message}`, 'DevServer');
                }
            }
        }
    }
    /**
     * Open browser
     */
    async openBrowser() {
        const url = `http://${this.config.host}:${this.config.port}`;
        try {
            // Try to dynamically import 'open' module
            const openModule = await Promise.resolve(`${'open'}`).then(s => __importStar(require(s))).catch(() => null);
            if (openModule && openModule.default) {
                await openModule.default(url);
            }
            else {
                console.log(`Please open ${url} in your browser`);
            }
            if (this.logManager) {
                this.logManager.log('info', `Opened browser at ${url}`, 'DevServer');
            }
        }
        catch (error) {
            if (this.logManager) {
                this.logManager.log('warn', `Failed to open browser: ${error.message}`, 'DevServer');
            }
        }
    }
    /**
     * Handle file change
     */
    handleFileChange(event) {
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
    handleBuildComplete(result) {
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
    handleBuildError(error) {
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
exports.DevServer = DevServer;
//# sourceMappingURL=DevServer.js.map