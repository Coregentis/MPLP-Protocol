import { RoleManagementService } from '../../application/services/role-management.service';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
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
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    getProtocolMetadata(): ProtocolMetadata;
    healthCheck(): Promise<HealthStatus>;
    getMetadata(): ProtocolMetadata;
    getHealthStatus(): Promise<HealthStatus>;
    private checkRoleServiceHealth;
}
//# sourceMappingURL=role.protocol.d.ts.map