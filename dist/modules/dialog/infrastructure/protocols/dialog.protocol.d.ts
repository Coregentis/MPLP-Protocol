/**
 * Dialog MPLP Protocol Implementation
 * @description Dialog模块MPLP协议接口实现
 * @version 1.0.0
 */
import { DialogManagementService } from '../../application/services/dialog-management.service';
/**
 * MPLP协议接口定义
 * 基于已完成模块的标准协议接口
 */
export interface IMLPPProtocol {
    readonly protocolName: string;
    readonly protocolVersion: string;
    readonly moduleId: string;
    readonly capabilities: string[];
    readonly dependencies: string[];
    initialize(config?: unknown): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    shutdown(): Promise<void>;
    healthCheck(): Promise<ProtocolHealthStatus>;
    getStatus(): Promise<ProtocolStatus>;
    getMetrics(): Promise<ProtocolMetrics>;
    sendMessage(targetModule: string, message: unknown): Promise<void>;
    receiveMessage(sourceModule: string, message: unknown): Promise<unknown>;
    broadcastMessage(message: unknown): Promise<void>;
    updateConfiguration(config: unknown): Promise<void>;
    getConfiguration(): Promise<unknown>;
    validateConfiguration(config: unknown): Promise<boolean>;
}
/**
 * 协议健康状态接口
 */
export interface ProtocolHealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    timestamp: string;
    checks: HealthCheck[];
    metrics: Record<string, number>;
    errors: string[];
}
/**
 * 协议状态接口
 */
export interface ProtocolStatus {
    state: 'initializing' | 'running' | 'stopping' | 'stopped' | 'error';
    uptime: number;
    lastActivity: string;
    activeConnections: number;
    processedRequests: number;
}
/**
 * 协议指标接口
 */
export interface ProtocolMetrics {
    performance: {
        averageResponseTime: number;
        requestsPerSecond: number;
        errorRate: number;
        throughput: number;
    };
    resources: {
        memoryUsage: number;
        cpuUsage: number;
        diskUsage: number;
        networkUsage: number;
    };
    business: {
        activeDialogs: number;
        totalDialogs: number;
        dialogsPerHour: number;
        averageDialogDuration: number;
    };
}
/**
 * 健康检查接口
 */
export interface HealthCheck {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration: number;
    timestamp: string;
}
/**
 * Dialog协议实现类
 * 实现MPLP协议标准接口
 */
export declare class DialogProtocol implements IMLPPProtocol {
    private readonly dialogManagementService;
    readonly protocolName = "MPLP-Dialog";
    readonly protocolVersion = "1.0.0";
    readonly moduleId = "dialog";
    readonly capabilities: string[];
    readonly dependencies: string[];
    private _status;
    private _startTime;
    private _lastActivity;
    private _activeConnections;
    private _processedRequests;
    private _configuration;
    constructor(dialogManagementService: DialogManagementService);
    /**
     * 初始化协议
     * @param _config 初始化配置
     */
    initialize(_config?: unknown): Promise<void>;
    /**
     * 启动协议
     */
    start(): Promise<void>;
    /**
     * 停止协议
     */
    stop(): Promise<void>;
    /**
     * 重启协议
     */
    restart(): Promise<void>;
    /**
     * 关闭协议
     */
    shutdown(): Promise<void>;
    /**
     * 健康检查
     * @returns 健康状态
     */
    healthCheck(): Promise<ProtocolHealthStatus>;
    /**
     * 获取协议状态
     * @returns 协议状态
     */
    getStatus(): Promise<ProtocolStatus>;
    /**
     * 获取协议指标
     * @returns 协议指标
     */
    getMetrics(): Promise<ProtocolMetrics>;
    /**
     * 发送消息到目标模块
     * @param _targetModule 目标模块
     * @param _message 消息内容
     */
    sendMessage(_targetModule: string, _message: unknown): Promise<void>;
    /**
     * 接收来自源模块的消息
     * @param _sourceModule 源模块
     * @param _message 消息内容
     * @returns 处理结果
     */
    receiveMessage(_sourceModule: string, _message: unknown): Promise<unknown>;
    /**
     * 广播消息到所有模块
     * @param _message 消息内容
     */
    broadcastMessage(_message: unknown): Promise<void>;
    /**
     * 更新协议配置
     * @param _config 新配置
     */
    updateConfiguration(_config: unknown): Promise<void>;
    /**
     * 获取当前配置
     * @returns 当前配置
     */
    getConfiguration(): Promise<unknown>;
    /**
     * 验证配置有效性
     * @param _config 待验证配置
     * @returns 是否有效
     */
    validateConfiguration(_config: unknown): Promise<boolean>;
}
//# sourceMappingURL=dialog.protocol.d.ts.map