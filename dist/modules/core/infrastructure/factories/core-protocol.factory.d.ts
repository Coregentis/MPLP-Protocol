import { CoreProtocol, CoreProtocolConfig } from '../protocols/core.protocol';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
export interface CoreProtocolFactoryConfig extends CoreProtocolConfig {
    repositoryType?: 'memory' | 'database' | 'file';
    customRepository?: ICoreRepository;
}
export declare class CoreProtocolFactory {
    private static instance;
    private crossCuttingFactory;
    private constructor();
    static getInstance(): CoreProtocolFactory;
    createProtocol(config?: CoreProtocolFactoryConfig): Promise<CoreProtocol>;
    createProtocolWithServices(managementService: CoreManagementService, monitoringService: CoreMonitoringService, orchestrationService: CoreOrchestrationService, resourceService: CoreResourceService, repository: ICoreRepository, config?: CoreProtocolConfig): Promise<CoreProtocol>;
    createLightweightProtocol(config?: CoreProtocolConfig): Promise<CoreProtocol>;
    validateConfig(config: CoreProtocolFactoryConfig): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    getSupportedRepositoryTypes(): string[];
    getDefaultConfig(): CoreProtocolFactoryConfig;
    private createRepository;
    static resetInstance(): void;
}
//# sourceMappingURL=core-protocol.factory.d.ts.map