/**
 * Extension协议实现
 *
 * @description Extension模块的协议实现，提供扩展管理和插件协调的标准化接口
 * @version 1.0.0
 * @layer Infrastructure层 - 协议
 * @pattern 协议模式 + L3管理器集成 + 横切关注点集成
 */
import { IMLPPProtocol, ProtocolMetadata, HealthStatus, MLPPRequest, MLPPResponse } from '../../../../core/protocols/mplp-protocol-base';
import { ExtensionProtocolConfig, ExtensionProtocolDependencies } from '../factories/extension-protocol.factory';
/**
 * Extension协议实现类
 */
export declare class ExtensionProtocol implements IMLPPProtocol {
    private readonly config;
    private readonly dependencies;
    private readonly adapter;
    private isInitialized;
    constructor(config: ExtensionProtocolConfig, dependencies: ExtensionProtocolDependencies);
    /**
     * 初始化协议
     */
    initialize(): Promise<void>;
    /**
     * 关闭协议
     */
    shutdown(): Promise<void>;
    /**
     * 获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 获取健康状态
     */
    healthCheck(): Promise<HealthStatus>;
    /**
     * 执行协议操作 (IMLPPProtocol接口要求)
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 处理协议请求
     */
    handleRequest(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 初始化L3管理器（预留接口）
     */
    private initializeL3Managers;
    /**
     * 初始化横切关注点
     */
    private initializeCrossCuttingConcerns;
    /**
     * 初始化扩展管理器
     */
    private initializeExtensionManager;
    /**
     * 停用所有活跃扩展
     */
    private deactivateAllExtensions;
    /**
     * 关闭L3管理器
     */
    private shutdownL3Managers;
    /**
     * 获取协议元数据
     * @description 实现IMLPPProtocol接口的getMetadata方法
     */
    getMetadata(): ProtocolMetadata;
    /**
     * 获取协议健康状态
     * @description 实现IMLPPProtocol接口的getHealthStatus方法
     */
    getHealthStatus(): Promise<HealthStatus>;
}
//# sourceMappingURL=extension.protocol.d.ts.map