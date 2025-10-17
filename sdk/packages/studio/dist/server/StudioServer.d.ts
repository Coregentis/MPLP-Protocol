/**
 * @fileoverview Studio Server - HTTP服务器和WebSocket支持
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha服务器架构
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioApplication } from '../core/StudioApplication';
import { StudioConfig, IStudioManager } from '../types/studio';
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
export declare class StudioServer implements IStudioManager {
    private app;
    private server;
    private wsServer;
    private eventManager;
    private studioApp;
    private config;
    private _isInitialized;
    private clients;
    constructor(config: StudioConfig, eventManager: MPLPEventManager, studioApp: StudioApplication);
    /**
     * 获取状态
     */
    getStatus(): string;
    /**
     * 事件监听 - 委托给eventManager
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * 发射事件 - 委托给eventManager
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * 移除事件监听器 - 委托给eventManager
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * 移除所有事件监听器 - 委托给eventManager
     */
    removeAllListeners(event?: string): this;
    /**
     * 初始化Studio服务器
     */
    initialize(): Promise<void>;
    /**
     * 关闭Studio服务器
     */
    shutdown(): Promise<void>;
    /**
     * 启动HTTP服务器
     */
    private startServer;
    /**
     * 设置中间件
     */
    private setupMiddleware;
    /**
     * 设置路由
     */
    private setupRoutes;
    /**
     * 设置WebSocket服务器
     */
    private setupWebSocket;
    /**
     * 处理WebSocket消息
     */
    private handleWebSocketMessage;
    /**
     * 发送消息给特定客户端
     */
    private sendToClient;
    /**
     * 广播消息给所有客户端
     */
    broadcast(message: WebSocketMessage): void;
    /**
     * 设置事件处理器
     */
    private setupEventHandlers;
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    private emitEvent;
}
export {};
//# sourceMappingURL=StudioServer.d.ts.map