import { RoleModuleAdapter } from './infrastructure/adapters/role-module.adapter';
import { RoleController } from './api/controllers/role.controller';
import { RoleManagementService } from './application/services/role-management.service';
import { MemoryRoleRepository } from './infrastructure/repositories/role.repository';
import { RoleProtocol } from './infrastructure/protocols/role.protocol';
export interface RoleModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    enableSecurity?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
    securityLevel?: 'basic' | 'standard' | 'enterprise';
    auditLevel?: 'basic' | 'detailed' | 'comprehensive';
}
export interface RoleModuleResult {
    roleController: RoleController;
    roleManagementService: RoleManagementService;
    roleRepository: MemoryRoleRepository;
    roleProtocol: RoleProtocol;
    roleModuleAdapter: RoleModuleAdapter;
    healthCheck: () => Promise<{
        status: 'healthy' | 'unhealthy';
        details: Record<string, unknown>;
    }>;
    shutdown: () => Promise<void>;
    getStatistics: () => Promise<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
        rolesByType: Record<string, number>;
        averageComplexityScore: number;
        totalPermissions: number;
        totalAgents: number;
    }>;
    getComplexityDistribution: () => Promise<Array<{
        range: string;
        count: number;
        percentage: number;
    }>>;
}
export declare function initializeRoleModule(options?: RoleModuleOptions): Promise<RoleModuleResult>;
export declare function createDefaultRoleModule(): Promise<RoleModuleResult>;
export declare function createDevelopmentRoleModule(): Promise<RoleModuleResult>;
export declare function createProductionRoleModule(): Promise<RoleModuleResult>;
export declare const ROLE_MODULE_VERSION = "1.0.0";
export declare const ROLE_MODULE_METADATA: {
    name: string;
    version: string;
    description: string;
    type: string;
    capabilities: string[];
    dependencies: string[];
    supportedOperations: string[];
    crossCuttingConcerns: {
        security: boolean;
        performance: boolean;
        events: boolean;
        errors: boolean;
        coordination: boolean;
        orchestration: boolean;
        stateSync: boolean;
        transactions: boolean;
        versioning: boolean;
    };
};
export * from './types';
export * from './api/controllers/role.controller';
export * from './api/dto/role.dto';
export * from './api/mappers/role.mapper';
export * from './application/services/role-management.service';
export * from './domain/entities/role.entity';
export * from './domain/repositories/role-repository.interface';
export * from './infrastructure/repositories/role.repository';
export * from './infrastructure/protocols/role.protocol';
export * from './infrastructure/adapters/role-module.adapter';
//# sourceMappingURL=module.d.ts.map