/**
 * Role协议实现
 *
 * @description Role模块的MPLP协议实现，基于Context、Plan、Confirm模块的企业级标准集成所有9个L3横切关注点管理器
 * @version 1.0.0
 * @layer 基础设施层 - 协议
 * @integration 统一L3管理器注入模式，与Context/Plan/Confirm模块IDENTICAL架构
 */
import { RoleManagementService } from '../../application/services/role-management.service';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
/**
 * Role协议类
 *
 * @description 实现IMLPPProtocol接口，集成9个L3横切关注点管理器，提供企业级RBAC安全中心协议服务
 * @pattern 统一L3管理器注入模式，确保与Context/Plan/Confirm模块架构一致性
 */
export declare class RoleProtocol implements IMLPPProtocol {
    private readonly roleService;
    private readonly _securityManager;
    private readonly _performanceMonitor;
    private readonly _eventBusManager;
    private readonly _errorHandler;
    private readonly _coordinationManager;
    private readonly _orchestrationManager;
    private readonly _stateSyncManager;
    private readonly _transactionManager;
    private readonly _protocolVersionManager;
    constructor(roleService: RoleManagementService, _securityManager: MLPPSecurityManager, _performanceMonitor: MLPPPerformanceMonitor, _eventBusManager: MLPPEventBusManager, _errorHandler: MLPPErrorHandler, _coordinationManager: MLPPCoordinationManager, _orchestrationManager: MLPPOrchestrationManager, _stateSyncManager: MLPPStateSyncManager, _transactionManager: MLPPTransactionManager, _protocolVersionManager: MLPPProtocolVersionManager);
    /**
     * 实现IMLPPProtocol标准接口：执行协议操作
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 实现IMLPPProtocol标准接口：获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 实现IMLPPProtocol标准接口：健康检查
     */
    healthCheck(): Promise<HealthStatus>;
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
    /**
     * 检查Role服务健康状态
     * @private
     */
    private checkRoleServiceHealth;
}
//# sourceMappingURL=role.protocol.d.ts.map