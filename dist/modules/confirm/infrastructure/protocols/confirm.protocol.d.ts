import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager } from '../../../../core/protocols/cross-cutting-concerns';
import { IMLPPProtocol, MLPPRequest, MLPPResponse, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
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
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    getProtocolMetadata(): ProtocolMetadata;
    getMetadata(): ProtocolMetadata;
    healthCheck(): Promise<HealthStatus>;
}
//# sourceMappingURL=confirm.protocol.d.ts.map