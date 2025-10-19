/**
 * Role内存仓库实现
 *
 * @description Role模块的内存仓库实现，用于开发和测试 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 基础设施层 - 仓库实现
 */
import { RoleEntity } from '../../domain/entities/role.entity';
import { IRoleRepository, PaginationParams, PaginatedResult, RoleQueryFilter, RoleSortOptions, BulkOperationResult } from '../../domain/repositories/role-repository.interface';
import { UUID, RoleType, RoleStatus } from '../../types';
/**
 * 内存Role仓库实现
 *
 * @description 基于内存存储的Role仓库实现，提供完整的CRUD操作和企业级RBAC功能
 */
export declare class MemoryRoleRepository implements IRoleRepository {
    private roles;
    private nameIndex;
    /**
     * 创建角色
     */
    create(role: RoleEntity): Promise<RoleEntity>;
    /**
     * 根据ID查找角色
     */
    findById(roleId: UUID): Promise<RoleEntity | null>;
    /**
     * 根据名称查找角色
     */
    findByName(name: string): Promise<RoleEntity | null>;
    /**
     * 更新角色
     */
    update(role: RoleEntity): Promise<RoleEntity>;
    /**
     * 删除角色
     */
    delete(roleId: UUID): Promise<boolean>;
    /**
     * 检查角色是否存在
     */
    exists(roleId: UUID): Promise<boolean>;
    /**
     * 查找所有角色
     */
    findAll(pagination?: PaginationParams, filter?: RoleQueryFilter, sort?: RoleSortOptions): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 根据上下文ID查找角色
     */
    findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 根据角色类型查找角色
     */
    findByType(roleType: RoleType, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 根据状态查找角色
     */
    findByStatus(status: RoleStatus, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 搜索角色
     */
    search(searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 查找具有特定权限的角色
     */
    findByPermission(resourceType: string, resourceId: string, action: string, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 检查角色是否有特定权限
     */
    hasPermission(roleId: UUID, resourceType: string, resourceId: string, action: string): Promise<boolean>;
    /**
     * 查找角色的父角色
     */
    findParentRoles(roleId: UUID): Promise<RoleEntity[]>;
    /**
     * 查找角色的子角色
     */
    findChildRoles(roleId: UUID): Promise<RoleEntity[]>;
    /**
     * 查找角色的委托关系
     */
    findDelegations(roleId: UUID): Promise<Array<{
        delegationId: UUID;
        delegatedTo: string;
        permissions: UUID[];
        startTime: Date;
        endTime?: Date;
        status: string;
    }>>;
    /**
     * 批量创建角色
     */
    bulkCreate(roles: RoleEntity[]): Promise<BulkOperationResult>;
    /**
     * 批量更新角色
     */
    bulkUpdate(roles: RoleEntity[]): Promise<BulkOperationResult>;
    /**
     * 批量删除角色
     */
    bulkDelete(roleIds: UUID[]): Promise<BulkOperationResult>;
    /**
     * 获取角色统计信息
     */
    getStatistics(): Promise<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
        rolesByType: Record<RoleType, number>;
        averageComplexityScore: number;
        totalPermissions: number;
        totalAgents: number;
    }>;
    /**
     * 获取角色复杂度分布
     */
    getComplexityDistribution(): Promise<Array<{
        range: string;
        count: number;
        percentage: number;
    }>>;
    /**
     * 获取角色的版本历史
     */
    getVersionHistory(roleId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<{
        versionId: UUID;
        versionNumber: number;
        createdAt: Date;
        createdBy: string;
        changeSummary?: string;
        changeType: string;
    }>>;
    /**
     * 获取角色的审计日志
     */
    getAuditLog(roleId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<{
        eventId: UUID;
        eventType: string;
        timestamp: Date;
        userId: string;
        action: string;
        details: Record<string, unknown>;
    }>>;
    /**
     * 应用过滤器
     */
    private applyFilter;
    /**
     * 应用排序
     */
    private applySort;
    /**
     * 应用分页
     */
    private applyPagination;
    /**
     * 清空所有角色数据 (用于测试)
     */
    clear(): Promise<void>;
    /**
     * 获取所有角色 (返回数组，用于测试)
     */
    findAllAsArray(): Promise<RoleEntity[]>;
}
//# sourceMappingURL=role.repository.d.ts.map