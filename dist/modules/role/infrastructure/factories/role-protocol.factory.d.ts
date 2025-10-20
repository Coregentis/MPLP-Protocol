/**
 * Role协议工厂
 *
 * @description Role模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 * @schema 基于 mplp-role.json Schema驱动开发
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
/**
 * Role协议工厂配置
 * @description 基于mplp-role.json Schema的配置接口
 */
export interface RoleProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    roleConfiguration?: {
        maxRoles?: number;
        defaultRoleType?: 'system' | 'organizational' | 'functional' | 'project' | 'temporary';
        permissionModel?: 'rbac' | 'abac' | 'hybrid';
        inheritanceMode?: 'none' | 'single' | 'multiple';
        auditEnabled?: boolean;
        securityClearanceRequired?: boolean;
    };
    agentManagement?: {
        maxAgents?: number;
        autoScaling?: boolean;
        loadBalancing?: boolean;
        healthCheckIntervalMs?: number;
    };
    performanceMetrics?: {
        enabled?: boolean;
        collectionIntervalSeconds?: number;
        roleAssignmentLatencyThresholdMs?: number;
        permissionCheckLatencyThresholdMs?: number;
        securityScoreThreshold?: number;
    };
    crossCuttingConcerns?: {
        security?: {
            enabled: boolean;
        };
        performance?: {
            enabled: boolean;
        };
        eventBus?: {
            enabled: boolean;
        };
        errorHandler?: {
            enabled: boolean;
        };
        coordination?: {
            enabled: boolean;
        };
        orchestration?: {
            enabled: boolean;
        };
        stateSync?: {
            enabled: boolean;
        };
        transaction?: {
            enabled: boolean;
        };
        protocolVersion?: {
            enabled: boolean;
        };
    };
}
/**
 * Role协议工厂
 *
 * @description 提供Role协议的标准化创建和配置
 * @schema 严格遵循mplp-role.json Schema定义
 * @naming 双重命名约定：Schema(snake_case) ↔ TypeScript(camelCase)
 */
export declare class RoleProtocolFactory {
    private static instance;
    private protocol;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): RoleProtocolFactory;
    /**
     * 创建Role协议实例
     * @param config 基于mplp-role.json Schema的配置
     */
    createProtocol(config?: RoleProtocolFactoryConfig): Promise<IMLPPProtocol>;
    /**
     * 获取协议元数据
     * @description 基于mplp-role.json Schema的元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 获取协议健康状态
     * @description 基于Schema定义的健康检查
     */
    getHealthStatus(): Promise<HealthStatus>;
    /**
     * 重置协议实例
     * @description 用于测试和重新配置
     */
    reset(): void;
    /**
     * 销毁协议实例
     * @description 清理资源和连接
     */
    destroy(): Promise<void>;
}
/**
 * 默认Role协议工厂配置
 * @description 基于mplp-role.json Schema的默认配置
 */
export declare const DEFAULT_ROLE_PROTOCOL_CONFIG: RoleProtocolFactoryConfig;
//# sourceMappingURL=role-protocol.factory.d.ts.map