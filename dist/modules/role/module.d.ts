/**
 * Role模块初始化
 *
 * @description Role模块的统一初始化和配置管理，基于Context、Plan、Confirm模块的企业级标准 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 模块层 - 初始化
 */
import { RoleModuleAdapter } from './infrastructure/adapters/role-module.adapter';
import { RoleController } from './api/controllers/role.controller';
import { RoleManagementService } from './application/services/role-management.service';
import { MemoryRoleRepository } from './infrastructure/repositories/role.repository';
import { RoleProtocol } from './infrastructure/protocols/role.protocol';
/**
 * Role模块选项
 */
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
/**
 * Role模块初始化结果
 */
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
/**
 * 初始化Role模块
 *
 * @description 创建和配置Role模块的所有组件，基于Context、Plan、Confirm模块的企业级标准
 * @param options - 模块配置选项
 * @returns Promise<RoleModuleResult> - 初始化结果
 */
export declare function initializeRoleModule(options?: RoleModuleOptions): Promise<RoleModuleResult>;
/**
 * 创建默认Role模块实例
 *
 * @description 使用默认配置创建Role模块实例，适用于快速开始和测试
 * @returns Promise<RoleModuleResult> - 默认配置的Role模块实例
 */
export declare function createDefaultRoleModule(): Promise<RoleModuleResult>;
/**
 * 创建开发环境Role模块实例
 *
 * @description 使用开发环境优化配置创建Role模块实例
 * @returns Promise<RoleModuleResult> - 开发环境配置的Role模块实例
 */
export declare function createDevelopmentRoleModule(): Promise<RoleModuleResult>;
/**
 * 创建生产环境Role模块实例
 *
 * @description 使用生产环境优化配置创建Role模块实例
 * @returns Promise<RoleModuleResult> - 生产环境配置的Role模块实例
 */
export declare function createProductionRoleModule(): Promise<RoleModuleResult>;
/**
 * Role模块版本信息
 */
export declare const ROLE_MODULE_VERSION = "1.0.0";
/**
 * Role模块元数据
 */
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