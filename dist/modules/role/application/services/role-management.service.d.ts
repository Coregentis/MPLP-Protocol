/**
 * Role管理服务
 *
 * @description Role模块的核心应用服务，处理企业级RBAC业务逻辑和协调
 * @version 1.0.0
 * @layer 应用层 - 服务
 */
import { RoleEntity } from '../../domain/entities/role.entity';
import { IRoleRepository, PaginationParams, PaginatedResult, RoleQueryFilter, RoleSortOptions } from '../../domain/repositories/role-repository.interface';
import { UUID, RoleType, RoleStatus, Permission, SecurityClearance } from '../../types';
/**
 * 创建角色请求
 */
export interface CreateRoleRequest {
    contextId: UUID;
    name: string;
    displayName?: string;
    description?: string;
    roleType: RoleType;
    permissions: Permission[];
    scope?: {
        level: 'global' | 'organization' | 'project' | 'team' | 'individual';
        contextIds?: UUID[];
        planIds?: UUID[];
        resourceConstraints?: {
            maxContexts?: number;
            maxPlans?: number;
            allowedResourceTypes?: string[];
        };
    };
    attributes?: {
        securityClearance?: SecurityClearance;
        department?: string;
        certificationRequirements?: Array<{
            certification: string;
            level: string;
            expiry?: Date;
            issuer?: string;
        }>;
    };
}
/**
 * 更新角色请求
 */
export interface UpdateRoleRequest {
    name?: string;
    displayName?: string;
    description?: string;
    status?: RoleStatus;
    permissions?: Permission[];
    attributes?: CreateRoleRequest['attributes'];
}
/**
 * 角色分配请求
 */
export interface AssignRoleRequest {
    roleId: UUID;
    userId: string;
    assignedBy: string;
    reason?: string;
    expiryDate?: Date;
}
/**
 * Role管理服务
 *
 * @description 提供Role模块的核心业务逻辑，包括角色管理、权限控制、安全审计
 */
export declare class RoleManagementService {
    private readonly repository;
    constructor(repository: IRoleRepository);
    /**
     * 创建角色
     * @param request 创建角色请求
     * @returns 创建的角色实体数据
     */
    createRole(request: CreateRoleRequest): Promise<RoleEntity>;
    /**
     * 根据ID获取角色
     * @param roleId 角色ID
     * @returns 角色实体或null
     */
    getRoleById(roleId: UUID): Promise<RoleEntity | null>;
    /**
     * 根据名称获取角色
     * @param name 角色名称
     * @returns 角色实体或null
     */
    getRoleByName(name: string): Promise<RoleEntity | null>;
    /**
     * 更新角色
     * @param roleId 角色ID
     * @param request 更新角色请求
     * @returns 更新后的角色实体
     */
    updateRole(roleId: UUID, request: UpdateRoleRequest): Promise<RoleEntity>;
    /**
     * 删除角色
     * @param roleId 角色ID
     * @returns 是否删除成功
     */
    deleteRole(roleId: UUID): Promise<boolean>;
    /**
     * 获取所有角色
     * @param pagination 分页参数
     * @param filter 查询过滤器
     * @param sort 排序选项
     * @returns 分页的角色列表
     */
    getAllRoles(pagination?: PaginationParams, filter?: RoleQueryFilter, sort?: RoleSortOptions): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 根据上下文ID获取角色
     * @param contextId 上下文ID
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    getRolesByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 根据上下文ID获取角色 (别名方法，用于测试兼容性)
     * @param contextId 上下文ID
     * @returns 角色数组
     */
    getRolesByContext(contextId: UUID): Promise<RoleEntity[]>;
    /**
     * 根据角色类型获取角色
     * @param roleType 角色类型
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    getRolesByType(roleType: RoleType, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 搜索角色
     * @param searchParams 搜索参数（可以是字符串或复杂搜索对象）
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    searchRoles(searchParams: string | {
        query: string;
        filters?: {
            status?: RoleStatus;
            roleType?: RoleType;
            contextId?: UUID;
        };
    }, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    /**
     * 检查角色权限
     * @param roleId 角色ID
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param action 操作类型
     * @returns 是否有权限
     */
    checkPermission(roleId: UUID, resourceType: string, resourceId: string, action: string): Promise<boolean>;
    /**
     * 添加权限到角色
     * @param roleId 角色ID
     * @param permission 权限对象
     * @returns 更新后的角色实体
     */
    addPermission(roleId: UUID, permission: Permission): Promise<RoleEntity>;
    /**
     * 从角色移除权限
     * @param roleId 角色ID
     * @param permissionId 权限ID
     * @returns 更新后的角色实体
     */
    removePermission(roleId: UUID, permissionId: UUID): Promise<RoleEntity>;
    /**
     * 分配角色给用户
     * @param request 角色分配请求
     * @returns 分配结果
     */
    assignRole(request: AssignRoleRequest): Promise<{
        roleId: UUID;
        userId: string;
        planId?: UUID;
        assignedAt: string;
        success: boolean;
    }>;
    /**
     * 激活角色
     * @param roleId 角色ID
     * @returns 更新后的角色实体
     */
    activateRole(roleId: UUID): Promise<RoleEntity>;
    /**
     * 停用角色
     * @param roleId 角色ID
     * @returns 更新后的角色实体
     */
    deactivateRole(roleId: UUID): Promise<RoleEntity>;
    /**
     * 获取角色统计信息
     * @returns 统计信息
     */
    getRoleStatistics(): Promise<{
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
     * 批量创建角色
     * @param requests 创建角色请求数组
     * @returns 批量操作结果
     */
    bulkCreateRoles(requests: CreateRoleRequest[]): Promise<{
        successfulRoles: RoleEntity[];
        failedRoles: Array<{
            request: CreateRoleRequest;
            error: string;
        }>;
    }>;
    /**
     * Core coordination interfaces (4 deep integration modules)
     * These are the most critical cross-module coordination capabilities
     */
    /**
     * Validate role coordination permission - Cross-module permission validation
     * @param _userId - User requesting coordination access
     * @param _roleId - Target role for coordination
     * @param _coordinationContext - Coordination context data
     * @returns Promise<boolean> - Whether coordination is permitted
     */
    private validateRoleCoordinationPermission;
    /**
     * Get role coordination context - Context module coordination environment
     * @param _contextId - Associated context ID
     * @param _roleType - Type of role for context retrieval
     * @returns Promise<Record<string, unknown>> - Coordination context data
     */
    private getRoleCoordinationContext;
    /**
     * Record role coordination metrics - Trace module coordination monitoring
     * @param _roleId - Role ID for metrics recording
     * @param _metrics - Coordination metrics data
     * @returns Promise<void> - Metrics recording completion
     */
    private recordRoleCoordinationMetrics;
    /**
     * Manage role extension coordination - Extension module coordination management
     * @param _roleId - Role ID for extension coordination
     * @param _extensions - Extension coordination data
     * @returns Promise<boolean> - Whether extension coordination succeeded
     */
    private manageRoleExtensionCoordination;
    /**
     * Extended coordination interfaces (4 additional modules)
     * These provide broader ecosystem integration capabilities
     */
    /**
     * Request role change coordination - Confirm module change coordination
     * @param _roleId - Role ID for change coordination
     * @param _change - Change coordination data
     * @returns Promise<boolean> - Whether change coordination was approved
     */
    private requestRoleChangeCoordination;
    /**
     * Coordinate collaborative role management - Collab module collaboration coordination
     * @param _collabId - Collaboration ID for role management
     * @param _roleConfig - Role configuration for collaboration
     * @returns Promise<boolean> - Whether collaboration coordination succeeded
     */
    private coordinateCollabRoleManagement;
    /**
     * Enable dialog-driven role coordination - Dialog module conversation coordination
     * @param _dialogId - Dialog ID for role coordination
     * @param _roleParticipants - Role participants for dialog coordination
     * @returns Promise<boolean> - Whether dialog coordination succeeded
     */
    private enableDialogDrivenRoleCoordination;
    /**
     * Coordinate role across network - Network module distributed coordination
     * @param _networkId - Network ID for role coordination
     * @param _roleConfig - Role configuration for network coordination
     * @returns Promise<boolean> - Whether network coordination succeeded
     */
    private coordinateRoleAcrossNetwork;
    /**
     * 获取用户权限
     * @param userId 用户ID
     * @returns 用户权限列表
     */
    getUserPermissions(_userId: string): Promise<Permission[]>;
    /**
     * 获取角色权限
     * @param roleId 角色ID
     * @returns 角色权限列表
     */
    getRolePermissions(roleId: UUID): Promise<Permission[]>;
    /**
     * 去重权限列表
     * @param permissions 权限列表
     * @returns 去重后的权限列表
     */
    private deduplicatePermissions;
    /**
     * 验证角色数据
     * @param data 角色数据
     * @returns 是否有效
     */
    private validateRoleData;
}
//# sourceMappingURL=role-management.service.d.ts.map