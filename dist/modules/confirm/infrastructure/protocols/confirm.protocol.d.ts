/**
 * Confirm协议实现
 *
 * @description Confirm模块的MPLP协议实现，基于Context和Plan模块的企业级标准集成所有9个L3横切关注点管理器
 * @version 1.0.0
 * @layer 基础设施层 - 协议
 * @integration 统一L3管理器注入模式，与Context/Plan模块IDENTICAL架构
 */
import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
/**
 * Confirm协议类
 *
 * @description 实现IMLPPProtocol接口，集成9个L3横切关注点管理器，提供企业级审批工作流协议服务
 * @pattern 统一L3管理器注入模式，确保与Context/Plan模块架构一致性
 */
export declare class ConfirmProtocol implements IMLPPProtocol {
    private readonly confirmService;
    private readonly _securityManager;
    private readonly _performanceMonitor;
    private readonly _eventBusManager;
    private readonly _errorHandler;
    private readonly _coordinationManager;
    private readonly _orchestrationManager;
    private readonly _stateSyncManager;
    private readonly _transactionManager;
    private readonly _protocolVersionManager;
    constructor(confirmService: ConfirmManagementService, _securityManager: MLPPSecurityManager, _performanceMonitor: MLPPPerformanceMonitor, _eventBusManager: MLPPEventBusManager, _errorHandler: MLPPErrorHandler, _coordinationManager: MLPPCoordinationManager, _orchestrationManager: MLPPOrchestrationManager, _stateSyncManager: MLPPStateSyncManager, _transactionManager: MLPPTransactionManager, _protocolVersionManager: MLPPProtocolVersionManager);
    /**
     * 实现IMLPPProtocol标准接口：执行协议操作
     */
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    /**
     * 实现IMLPPProtocol标准接口：获取协议元数据
     */
    getProtocolMetadata(): ProtocolMetadata;
    /**
     * 获取协议元数据（内部实现）
     */
    getMetadata(): ProtocolMetadata;
    /**
     * 健康检查
     */
    healthCheck(): Promise<HealthStatus>;
}
//# sourceMappingURL=confirm.protocol.d.ts.map