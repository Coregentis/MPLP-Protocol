"use strict";
/**
 * @fileoverview Studio Server - HTTP服务器和WebSocket支持
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha服务器架构
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioServer = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
/**
 * Studio服务器 - 基于MPLP V1.0 Alpha服务器架构
 * 提供HTTP API和WebSocket实时通信支持
 */
class StudioServer {
    constructor(config, eventManager, studioApp) {
        this.server = null;
        this.wsServer = null;
        this._isInitialized = false;
        this.clients = new Map();
        this.config = config;
        this.eventManager = eventManager;
        this.studioApp = studioApp;
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
    }
    // ===== IStudioManager接口实现 =====
    /**
     * 获取状态
     */
    getStatus() {
        return this._isInitialized ? 'initialized' : 'not_initialized';
    }
    /**
     * 事件监听 - 委托给eventManager
     */
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    /**
     * 发射事件 - 委托给eventManager
     */
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    /**
     * 移除事件监听器 - 委托给eventManager
     */
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    /**
     * 移除所有事件监听器 - 委托给eventManager
     */
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    // ===== 核心生命周期方法 - 基于MPLP V1.0 Alpha生命周期模式 =====
    /**
     * 初始化Studio服务器
     */
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        try {
            // 启动HTTP服务器
            await this.startServer();
            // 设置WebSocket服务器
            this.setupWebSocket();
            // 设置事件监听
            this.setupEventHandlers();
            this._isInitialized = true;
            this.emitEvent('initialized', {
                module: 'StudioServer',
                port: this.config.server.port,
                host: this.config.server.host
            });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'StudioServer',
                context: 'initialization'
            });
            throw error;
        }
    }
    /**
     * 关闭Studio服务器
     */
    async shutdown() {
        if (!this._isInitialized) {
            return;
        }
        try {
            // 关闭WebSocket连接
            if (this.wsServer) {
                this.wsServer.close();
                this.wsServer = null;
            }
            // 关闭HTTP服务器
            if (this.server) {
                await new Promise((resolve, reject) => {
                    this.server.close((err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                });
                this.server = null;
            }
            // 清理客户端连接
            this.clients.clear();
            this._isInitialized = false;
            this.emitEvent('shutdown', { module: 'StudioServer' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'StudioServer',
                context: 'shutdown'
            });
            throw error;
        }
    }
    // ===== 服务器管理方法 =====
    /**
     * 启动HTTP服务器
     */
    async startServer() {
        return new Promise((resolve, reject) => {
            this.server = (0, http_1.createServer)(this.app);
            this.server.listen(this.config.server.port, this.config.server.host, () => {
                console.log(`🎨 MPLP Studio Server running on http://${this.config.server.host}:${this.config.server.port}`);
                resolve();
            });
            this.server.on('error', reject);
        });
    }
    /**
     * 设置中间件
     */
    setupMiddleware() {
        // CORS配置
        if (this.config.server.cors.enabled) {
            this.app.use((0, cors_1.default)({
                origin: this.config.server.cors.origins,
                credentials: true
            }));
        }
        // JSON解析
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // 静态文件服务
        this.app.use('/static', express_1.default.static('public'));
    }
    /**
     * 设置路由
     */
    setupRoutes() {
        // 健康检查
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                version: this.config.version,
                environment: this.config.environment,
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            });
        });
        // Studio信息
        this.app.get('/api/studio/info', (req, res) => {
            res.json({
                name: 'MPLP Studio',
                version: this.config.version,
                environment: this.config.environment,
                features: [
                    'Visual Agent Builder',
                    'Workflow Designer',
                    'Project Management',
                    'Real-time Collaboration'
                ]
            });
        });
        // 项目管理API
        this.app.get('/api/projects', async (req, res) => {
            try {
                // 这里应该调用ProjectManager获取项目列表
                res.json({ projects: [] });
            }
            catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        this.app.post('/api/projects', async (req, res) => {
            try {
                const { name, template } = req.body;
                // 这里应该调用ProjectManager创建项目
                res.json({
                    message: 'Project created successfully',
                    project: { name, template }
                });
            }
            catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // 工作空间管理API
        this.app.get('/api/workspaces', async (req, res) => {
            try {
                // 这里应该调用WorkspaceManager获取工作空间列表
                res.json({ workspaces: [] });
            }
            catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // Agent管理API
        this.app.get('/api/agents', async (req, res) => {
            try {
                // 这里应该调用AgentBuilder获取Agent列表
                res.json({ agents: [] });
            }
            catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // 工作流管理API
        this.app.get('/api/workflows', async (req, res) => {
            try {
                // 这里应该调用WorkflowDesigner获取工作流列表
                res.json({ workflows: [] });
            }
            catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // 组件库API
        this.app.get('/api/components', async (req, res) => {
            try {
                // 这里应该调用ComponentLibrary获取组件列表
                res.json({ components: [] });
            }
            catch (error) {
                res.status(500).json({
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
        // 错误处理
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        });
        // 404处理
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not found',
                path: req.path
            });
        });
    }
    /**
     * 设置WebSocket服务器
     */
    setupWebSocket() {
        if (!this.server) {
            throw new Error('HTTP server not started');
        }
        this.wsServer = new ws_1.WebSocketServer({ server: this.server });
        this.wsServer.on('connection', (ws, req) => {
            const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            this.clients.set(clientId, ws);
            console.log(`WebSocket client connected: ${clientId}`);
            // 发送欢迎消息
            this.sendToClient(clientId, {
                type: 'welcome',
                data: { clientId, timestamp: Date.now() },
                timestamp: Date.now()
            });
            // 处理消息
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleWebSocketMessage(clientId, message);
                }
                catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            });
            // 处理断开连接
            ws.on('close', () => {
                console.log(`WebSocket client disconnected: ${clientId}`);
                this.clients.delete(clientId);
            });
            // 处理错误
            ws.on('error', (error) => {
                console.error(`WebSocket error for client ${clientId}:`, error);
                this.clients.delete(clientId);
            });
        });
    }
    /**
     * 处理WebSocket消息
     */
    handleWebSocketMessage(clientId, message) {
        switch (message.type) {
            case 'ping':
                this.sendToClient(clientId, {
                    type: 'pong',
                    data: { timestamp: Date.now() },
                    timestamp: Date.now()
                });
                break;
            case 'subscribe':
                // 处理事件订阅
                console.log(`Client ${clientId} subscribed to:`, message.data);
                break;
            case 'unsubscribe':
                // 处理取消订阅
                console.log(`Client ${clientId} unsubscribed from:`, message.data);
                break;
            default:
                console.log(`Unknown message type from ${clientId}:`, message.type);
        }
    }
    /**
     * 发送消息给特定客户端
     */
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }
    /**
     * 广播消息给所有客户端
     */
    broadcast(message) {
        for (const [clientId, client] of this.clients) {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        }
    }
    /**
     * 设置事件处理器
     */
    setupEventHandlers() {
        // 监听Studio应用事件并广播给客户端
        this.eventManager.onMPLP('*', 'StudioApplication', (data) => {
            this.broadcast({
                type: 'studio-event',
                data,
                timestamp: Date.now()
            });
        });
    }
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    emitEvent(type, data) {
        this.eventManager.emitMPLP(type, 'StudioServer', data);
    }
}
exports.StudioServer = StudioServer;
//# sourceMappingURL=StudioServer.js.map