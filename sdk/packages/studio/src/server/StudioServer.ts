/**
 * @fileoverview Studio Server - HTTP服务器和WebSocket支持
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha服务器架构
 */

import express, { Express, Request, Response } from 'express';
import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioApplication } from '../core/StudioApplication';
import { 
  StudioConfig,
  IStudioManager 
} from '../types/studio';

/**
 * WebSocket消息类型
 */
interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  clientId?: string;
}

/**
 * Studio服务器 - 基于MPLP V1.0 Alpha服务器架构
 * 提供HTTP API和WebSocket实时通信支持
 */
export class StudioServer implements IStudioManager {
  private app: Express;
  private server: Server | null = null;
  private wsServer: WebSocketServer | null = null;
  private eventManager: MPLPEventManager;
  private studioApp: StudioApplication;
  private config: StudioConfig;
  private _isInitialized = false;
  private clients = new Map<string, WebSocket>();

  constructor(config: StudioConfig, eventManager: MPLPEventManager, studioApp: StudioApplication) {
    this.config = config;
    this.eventManager = eventManager;
    this.studioApp = studioApp;
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  // ===== IStudioManager接口实现 =====

  /**
   * 获取状态
   */
  public getStatus(): string {
    return this._isInitialized ? 'initialized' : 'not_initialized';
  }

  /**
   * 事件监听 - 委托给eventManager
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * 发射事件 - 委托给eventManager
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * 移除事件监听器 - 委托给eventManager
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * 移除所有事件监听器 - 委托给eventManager
   */
  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  // ===== 核心生命周期方法 - 基于MPLP V1.0 Alpha生命周期模式 =====

  /**
   * 初始化Studio服务器
   */
  public async initialize(): Promise<void> {
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
    } catch (error) {
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
  public async shutdown(): Promise<void> {
    if (!this._isInitialized) {
      return;
    }

    try {
      // 首先关闭所有WebSocket连接
      if (this.clients.size > 0) {
        for (const [clientId, ws] of this.clients) {
          try {
            ws.close(1000, 'Server shutdown');
          } catch (error) {
            console.warn(`Failed to close WebSocket client ${clientId}:`, error);
          }
        }
        this.clients.clear();
      }

      // 关闭WebSocket服务器
      if (this.wsServer) {
        await new Promise<void>((resolve) => {
          this.wsServer!.close(() => {
            resolve();
          });
        });
        this.wsServer = null;
      }

      // 关闭HTTP服务器
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          // 设置超时，强制关闭
          const timeout = setTimeout(() => {
            // 强制关闭所有连接
            if (this.server) {
              this.server.closeAllConnections?.();
            }
            resolve(); // 即使超时也要resolve，避免测试挂起
          }, 3000);

          this.server!.close((err) => {
            clearTimeout(timeout);
            if (err) {
              console.warn('Server close error:', err);
              resolve(); // 即使有错误也要resolve
            } else {
              resolve();
            }
          });
        });
        this.server = null;
      }

      this._isInitialized = false;
      this.emitEvent('shutdown', { module: 'StudioServer' });
    } catch (error) {
      this.emitEvent('error', {
        error: error instanceof Error ? error.message : String(error),
        module: 'StudioServer',
        context: 'shutdown'
      });
      // 在测试环境中，即使关闭失败也要标记为未初始化
      this._isInitialized = false;
      throw error;
    }
  }

  // ===== 服务器管理方法 =====

  /**
   * 启动HTTP服务器
   */
  private async startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer(this.app);
      
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
  private setupMiddleware(): void {
    // CORS配置
    if (this.config.server.cors.enabled) {
      this.app.use(cors({
        origin: this.config.server.cors.origins,
        credentials: true
      }));
    }

    // JSON解析
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 静态文件服务
    this.app.use('/static', express.static('public'));
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // 健康检查
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        version: this.config.version,
        environment: this.config.environment,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Studio信息
    this.app.get('/api/studio/info', (req: Request, res: Response) => {
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
    this.app.get('/api/projects', async (req: Request, res: Response) => {
      try {
        const projectManager = this.studioApp.getProjectManager();
        const projects = projectManager.getProjects();
        res.json({ projects });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    this.app.post('/api/projects', async (req: Request, res: Response) => {
      try {
        const { name, template } = req.body;
        const project = await this.studioApp.createProject(name, template);
        res.json({
          message: 'Project created successfully',
          project
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // 工作空间管理API
    this.app.get('/api/workspaces', async (req: Request, res: Response) => {
      try {
        const workspaceManager = this.studioApp.getWorkspaceManager();
        const workspaces = workspaceManager.getWorkspaces();
        res.json({ workspaces });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Agent管理API
    this.app.get('/api/agents', async (req: Request, res: Response) => {
      try {
        // 这里应该调用AgentBuilder获取Agent列表
        res.json({ agents: [] });
      } catch (error) {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    // 工作流管理API
    this.app.get('/api/workflows', async (req: Request, res: Response) => {
      try {
        // 这里应该调用WorkflowDesigner获取工作流列表
        res.json({ workflows: [] });
      } catch (error) {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    // 组件库API
    this.app.get('/api/components', async (req: Request, res: Response) => {
      try {
        // 这里应该调用ComponentLibrary获取组件列表
        res.json({ components: [] });
      } catch (error) {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    // 错误处理
    this.app.use((error: Error, req: Request, res: Response, next: any) => {
      console.error('Server error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    });

    // 404处理
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not found',
        path: req.path
      });
    });
  }

  /**
   * 设置WebSocket服务器
   */
  private setupWebSocket(): void {
    if (!this.server) {
      throw new Error('HTTP server not started');
    }

    this.wsServer = new WebSocketServer({ server: this.server });

    this.wsServer.on('connection', (ws: WebSocket, req) => {
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
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleWebSocketMessage(clientId, message);
        } catch (error) {
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
  private handleWebSocketMessage(clientId: string, message: WebSocketMessage): void {
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

      case 'join-project':
        this.handleJoinProject(clientId, message.data);
        break;

      case 'leave-project':
        this.handleLeaveProject(clientId, message.data);
        break;

      case 'canvas-update':
        this.handleCanvasUpdate(clientId, message.data);
        break;

      case 'cursor-move':
        this.handleCursorMove(clientId, message.data);
        break;

      case 'selection-change':
        this.handleSelectionChange(clientId, message.data);
        break;

      default:
        console.log(`Unknown message type from ${clientId}:`, message.type);
    }
  }

  /**
   * 发送消息给特定客户端
   */
  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  /**
   * 广播消息给所有客户端
   */
  public broadcast(message: WebSocketMessage): void {
    for (const [clientId, client] of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }

  // ===== 协作功能处理方法 =====

  /**
   * 处理加入项目
   */
  private handleJoinProject(clientId: string, data: any): void {
    const { projectId, userName } = data;
    console.log(`Client ${clientId} (${userName}) joined project: ${projectId}`);

    // 广播给其他客户端
    this.broadcast({
      type: 'user-joined',
      data: { projectId, userName, clientId },
      timestamp: Date.now()
    });
  }

  /**
   * 处理离开项目
   */
  private handleLeaveProject(clientId: string, data: any): void {
    const { projectId, userName } = data;
    console.log(`Client ${clientId} (${userName}) left project: ${projectId}`);

    // 广播给其他客户端
    this.broadcast({
      type: 'user-left',
      data: { projectId, userName, clientId },
      timestamp: Date.now()
    });
  }

  /**
   * 处理画布更新
   */
  private handleCanvasUpdate(clientId: string, data: any): void {
    const { projectId, elementId, changes } = data;
    console.log(`Canvas update from ${clientId} in project ${projectId}`);

    // 广播给其他客户端（除了发送者）
    for (const [otherClientId, client] of this.clients) {
      if (otherClientId !== clientId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'canvas-updated',
          data: { projectId, elementId, changes, fromClient: clientId },
          timestamp: Date.now()
        }));
      }
    }
  }

  /**
   * 处理光标移动
   */
  private handleCursorMove(clientId: string, data: any): void {
    const { projectId, position, userName } = data;

    // 广播给其他客户端（除了发送者）
    for (const [otherClientId, client] of this.clients) {
      if (otherClientId !== clientId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'cursor-moved',
          data: { projectId, position, userName, clientId },
          timestamp: Date.now()
        }));
      }
    }
  }

  /**
   * 处理选择变更
   */
  private handleSelectionChange(clientId: string, data: any): void {
    const { projectId, selectedElements, userName } = data;

    // 广播给其他客户端（除了发送者）
    for (const [otherClientId, client] of this.clients) {
      if (otherClientId !== clientId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'selection-changed',
          data: { projectId, selectedElements, userName, clientId },
          timestamp: Date.now()
        }));
      }
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
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
  private emitEvent(type: string, data: Record<string, any>): void {
    this.eventManager.emitMPLP(type, 'StudioServer', data);
  }
}
