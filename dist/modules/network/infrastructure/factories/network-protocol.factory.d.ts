/**
 * Network协议工厂
 *
 * @description Network模块的协议工厂，负责创建和管理协议实例
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 */
import { NetworkProtocol } from '../protocols/network.protocol';
/**
 * Network协议工厂类
 */
export declare class NetworkProtocolFactory {
    private static factoryInstance;
    private instances;
    private defaultConfig;
    constructor();
    /**
     * 创建Network协议实例
     * @param {string} instanceId 实例ID
     * @param {Object} config 配置选项
     * @returns {Promise<NetworkProtocol>} 协议实例
     */
    createProtocol(instanceId?: string, config?: {}): Promise<NetworkProtocol>;
    /**
     * 获取协议实例
     * @param {string} instanceId 实例ID
     * @returns {NetworkProtocol|null} 协议实例
     */
    getProtocol(instanceId?: string): NetworkProtocol | null;
    /**
     * 销毁协议实例
     * @param {string} instanceId 实例ID
     * @returns {Promise<boolean>} 销毁结果
     */
    destroyProtocol(instanceId?: string): Promise<boolean>;
    /**
     * 获取所有协议实例
     * @returns {Map<string, NetworkProtocol>} 所有实例
     */
    getAllProtocols(): Map<string, NetworkProtocol>;
    /**
     * 获取协议实例状态
     * @param {string} instanceId 实例ID
     * @returns {Object|null} 实例状态
     */
    getProtocolStatus(instanceId?: string): {
        instanceId: string;
        initialized: boolean;
        active: boolean;
        errorCount: number;
        lastHealthCheck: string | null;
        metrics: {
            operationsCount: number;
            averageResponseTime: number;
            errorRate: number;
            lastOperationTime: string | null;
        };
        timestamp: string;
    } | null;
    /**
     * 获取所有协议实例状态
     * @returns {Array<Object>} 所有实例状态
     */
    getAllProtocolStatus(): {
        instanceId: string;
        initialized: boolean;
        active: boolean;
        errorCount: number;
        lastHealthCheck: string | null;
        metrics: {
            operationsCount: number;
            averageResponseTime: number;
            errorRate: number;
            lastOperationTime: string | null;
        };
        timestamp: string;
    }[];
    /**
     * 重启协议实例
     * @param {string} instanceId 实例ID
     * @param {Object} newConfig 新配置
     * @returns {Promise<NetworkProtocol>} 重启后的协议实例
     */
    restartProtocol(instanceId?: string, newConfig?: {}): Promise<NetworkProtocol>;
    /**
     * 批量创建协议实例
     * @param configs 配置数组
     * @returns 协议实例数组
     */
    createMultipleProtocols(configs: Record<string, unknown>[]): Promise<NetworkProtocol[]>;
    /**
     * 健康检查所有协议实例
     * @returns 健康检查结果
     */
    healthCheckAll(): Promise<Record<string, unknown>>;
    /**
     * 清理所有协议实例
     * @returns 清理结果
     */
    cleanup(): Promise<boolean>;
    /**
     * 获取工厂统计信息
     * @returns 统计信息
     */
    getFactoryStats(): Record<string, unknown>;
    /**
     * 设置默认配置
     * @param config 默认配置
     */
    setDefaultConfig(config: Record<string, unknown>): void;
    /**
     * 获取默认配置
     * @returns 默认配置
     */
    getDefaultConfig(): Record<string, unknown>;
    /**
     * 静态方法：创建协议实例
     */
    static create(_config?: Record<string, unknown>): NetworkProtocol;
    /**
     * 静态方法：创建默认配置实例
     */
    static createWithDefaults(): NetworkProtocol;
    /**
     * 静态方法：创建测试实例
     */
    static createForTesting(): NetworkProtocol;
    /**
     * 静态方法：创建生产实例
     */
    static createForProduction(): NetworkProtocol;
    private static singletonInstance;
    /**
     * 静态方法：获取单例实例
     */
    static getInstance(): NetworkProtocol;
    /**
     * 静态方法：重置单例实例
     */
    static resetInstance(): void;
}
//# sourceMappingURL=network-protocol.factory.d.ts.map