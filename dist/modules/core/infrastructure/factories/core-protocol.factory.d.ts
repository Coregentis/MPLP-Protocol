/**
 * Core协议工厂
 *
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，创建Core协议实例
 * @version 1.0.0
 * @layer 基础设施层 - 协议工厂
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的协议工厂模式
 */
import { CoreProtocol, CoreProtocolConfig } from '../protocols/core.protocol';
import { ICoreRepository } from '../../domain/repositories/core-repository.interface';
import { CoreManagementService } from '../../application/services/core-management.service';
import { CoreMonitoringService } from '../../application/services/core-monitoring.service';
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
import { CoreResourceService } from '../../application/services/core-resource.service';
/**
 * Core协议工厂配置
 */
export interface CoreProtocolFactoryConfig extends CoreProtocolConfig {
    repositoryType?: 'memory' | 'database' | 'file';
    customRepository?: ICoreRepository;
}
/**
 * Core协议工厂
 *
 * @description 单例工厂，负责创建和配置Core协议实例，集成所有必要的服务和横切关注点管理器
 */
export declare class CoreProtocolFactory {
    private static instance;
    private crossCuttingFactory;
    private constructor();
    /**
     * 获取工厂单例实例
     */
    static getInstance(): CoreProtocolFactory;
    /**
     * 创建Core协议实例
     */
    createProtocol(config?: CoreProtocolFactoryConfig): Promise<CoreProtocol>;
    /**
     * 创建带有自定义服务的协议实例
     */
    createProtocolWithServices(managementService: CoreManagementService, monitoringService: CoreMonitoringService, orchestrationService: CoreOrchestrationService, resourceService: CoreResourceService, repository: ICoreRepository, config?: CoreProtocolConfig): Promise<CoreProtocol>;
    /**
     * 创建轻量级协议实例（用于测试）
     */
    createLightweightProtocol(config?: CoreProtocolConfig): Promise<CoreProtocol>;
    /**
     * 验证协议配置
     */
    validateConfig(config: CoreProtocolFactoryConfig): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * 获取支持的仓库类型
     */
    getSupportedRepositoryTypes(): string[];
    /**
     * 获取默认配置
     */
    getDefaultConfig(): CoreProtocolFactoryConfig;
    /**
     * 创建仓库实例
     */
    private createRepository;
    /**
     * 重置工厂实例（用于测试）
     */
    static resetInstance(): void;
}
//# sourceMappingURL=core-protocol.factory.d.ts.map