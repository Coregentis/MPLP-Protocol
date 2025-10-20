/**
 * Role仓库接口
 *
 * @description Role模块的仓库接口定义，基于DDD架构模式 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 领域层 - 仓库接口
 */
import { RoleEntity } from '../entities/role.entity';
import { UUID, RoleType, RoleStatus, SecurityClearance } from '../../types';
/**
 * 分页参数
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}
/**
 * 分页结果
 */
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
/**
 * 角色查询过滤器
 */
export interface RoleQueryFilter {
    roleType?: RoleType[];
    status?: RoleStatus[];
    name?: string;
    displayName?: string;
    contextId?: UUID;
    securityClearance?: SecurityClearance[];
    department?: string;
    hasPermission?: {
        resourceType: string;
        resourceId: string;
        action: string;
    };
    createdAfter?: Date;
    createdBefore?: Date;
    updatedAfter?: Date;
    updatedBefore?: Date;
    agentCount?: {
        min?: number;
        max?: number;
    };
    complexityScore?: {
        min?: number;
        max?: number;
    };
}
/**
 * 角色排序选项
 */
export interface RoleSortOptions {
    field: 'name' | 'roleType' | 'status' | 'createdAt' | 'updatedAt' | 'complexityScore';
    direction: 'asc' | 'desc';
}
/**
 * 批量操作结果
 */
export interface BulkOperationResult {
    success: number;
    failed: number;
    errors: Array<{
        roleId: UUID;
        error: string;
    }>;
}
/**
 * Role仓库接口
 *
 * @description 定义Role实体的持久化操作接口，支持企业级RBAC功能
 */
export interface IRoleRepository {
    /**
     * 创建角色
     * @param role 角色实体
     * @returns 创建的角色实体
     */
    create(role: RoleEntity): Promise<RoleEntity>;
    /**
     * 根据ID查找角色
     * @param roleId 角色ID
     * @returns 角色实体或null
     */
    findById(roleId: UUID): Promise<RoleEntity | null>;
    /**
     * 根据名称查找角色
     * @param name 角色名称
     * @returns 角色实体或null
     */
    findByName(name: string): Promise<RoleEntity | null>;
    /**
     * 更新角色
     * @param role 角色实体
     * @returns 更新后的角色实体
     */
    update(role: RoleEntity): Promise<RoleEntity>;
    /**
     * 删除角色
     * @param roleId 角色ID
     * @returns 是否删除成功
     */
    delete(roleId: UUID): Promise<boolean>;
    /**
     * 检查角色是否存在
     * @param roleId 角色ID
     * @returns 是否存在
     */
    exists(roleId: UUID): Promise<boolean>;
    /**
     * 查找所有角色
     * @param pagination 分页参数
     * @param filter 查询过滤器
     * @param sort 排序选项
     * @returns 分页的角色列表
     */
    findAll(pagination?: PaginationParams, filter?: RoleQueryFilter, sort?: RoleSortOptions): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 根据上下文ID查找角色
     * @param contextId 上下文ID
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 根据角色类型查找角色
     * @param roleType 角色类型
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    findByType(roleType: RoleType, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 根据状态查找角色
     * @param status 角色状态
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    findByStatus(status: RoleStatus, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 搜索角色
     * @param searchTerm 搜索词
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    search(searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 查找具有特定权限的角色
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param action 操作类型
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    findByPermission(resourceType: string, resourceId: string, action: string, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 检查角色是否有特定权限
     * @param roleId 角色ID
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param action 操作类型
     * @returns 是否有权限
     */
    hasPermission(roleId: UUID, resourceType: string, resourceId: string, action: string): Promise<boolean>;
    /**
     * 查找角色的父角色
     * @param roleId 角色ID
     * @returns 父角色列表
     */
    findParentRoles(roleId: UUID): Promise<RoleEntity[]>;
    /**
     * 查找角色的子角色
     * @param roleId 角色ID
     * @returns 子角色列表
     */
    findChildRoles(roleId: UUID): Promise<RoleEntity[]>;
    /**
     * 查找角色的委托关系
     * @param roleId 角色ID
     * @returns 委托关系列表
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
     * @param roles 角色实体数组
     * @returns 批量操作结果
     */
    bulkCreate(roles: RoleEntity[]): Promise<BulkOperationResult>;
    /**
     * 批量更新角色
     * @param roles 角色实体数组
     * @returns 批量操作结果
     */
    bulkUpdate(roles: RoleEntity[]): Promise<BulkOperationResult>;
    /**
     * 批量删除角色
     * @param roleIds 角色ID数组
     * @returns 批量操作结果
     */
    bulkDelete(roleIds: UUID[]): Promise<BulkOperationResult>;
    /**
     * 获取角色统计信息
     * @returns 统计信息
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
     * @returns 复杂度分布
     */
    getComplexityDistribution(): Promise<Array<{
        range: string;
        count: number;
        percentage: number;
    }>>;
    /**
     * 获取角色的版本历史
     * @param roleId 角色ID
     * @param pagination 分页参数
     * @returns 版本历史列表
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
     * @param roleId 角色ID
     * @param pagination 分页参数
     * @returns 审计日志列表
     */
    getAuditLog(roleId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<{
        eventId: UUID;
        eventType: string;
        timestamp: Date;
        userId: string;
        action: string;
        details: Record<string, unknown>;
    }>>;
}
//# sourceMappingURL=role-repository.interface.d.ts.map