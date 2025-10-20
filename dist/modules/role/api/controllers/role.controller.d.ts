/**
 * Role控制器
 *
 * @description Role模块的API控制器，处理HTTP请求和响应 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer API层 - 控制器
 */
import { Request, Response } from 'express';
import { RoleManagementService } from '../../application/services/role-management.service';
import { RoleEntity } from '../../domain/entities/role.entity';
import { UUID, RoleType, Permission } from '../../types';
import { PaginationParams, PaginatedResult } from '../../domain/repositories/role-repository.interface';
/**
 * API响应接口
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}
/**
 * Role控制器
 *
 * @description 提供Role模块的REST API接口，企业级RBAC安全中心
 */
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleManagementService);
    /**
     * 创建角色
     * POST /roles
     */
    createRole(req: Request, res: Response): Promise<void>;
    /**
     * 获取角色
     * GET /roles/:roleId
     */
    getRoleById(req: Request, res: Response): Promise<void>;
    /**
     * 获取角色（旧方法，保持向后兼容）
     * GET /roles/:roleId
     */
    getRole(roleId: UUID): Promise<ApiResponse<RoleEntity>>;
    /**
     * 根据名称获取角色
     * GET /roles/by-name/:name
     */
    getRoleByName(name: string): Promise<ApiResponse<RoleEntity>>;
    /**
     * 更新角色
     * PUT /roles/:roleId
     */
    updateRole(req: Request, res: Response): Promise<void>;
    /**
     * 删除角色
     * DELETE /roles/:roleId
     */
    deleteRole(req: Request, res: Response): Promise<void>;
    /**
     * 获取所有角色
     * GET /roles
     */
    getAllRoles(req: Request, res: Response): Promise<void>;
    /**
     * 根据上下文获取角色
     * GET /roles/by-context/:contextId
     */
    getRolesByContext(req: Request, res: Response): Promise<void>;
    /**
     * 根据上下文ID获取角色（旧方法，保持向后兼容）
     * GET /roles/by-context/:contextId
     */
    getRolesByContextId(contextId: UUID, pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<RoleEntity>>>;
    /**
     * 根据角色类型获取角色
     * GET /roles/by-type/:roleType
     */
    getRolesByType(req: Request, res: Response): Promise<void>;
    /**
     * 搜索角色
     * GET /roles/search
     */
    searchRoles(req: Request, res: Response): Promise<void>;
    /**
     * 检查角色权限
     * POST /roles/:roleId/check-permission
     */
    checkPermission(req: Request, res: Response): Promise<void>;
    /**
     * 添加权限到角色
     * POST /roles/:roleId/permissions
     */
    addPermission(roleId: UUID, permission: Permission): Promise<ApiResponse<RoleEntity>>;
    /**
     * 从角色移除权限
     * DELETE /roles/:roleId/permissions/:permissionId
     */
    removePermission(roleId: UUID, permissionId: UUID): Promise<ApiResponse<RoleEntity>>;
    /**
     * 激活角色
     * POST /roles/:roleId/activate
     */
    activateRole(req: Request, res: Response): Promise<void>;
    /**
     * 停用角色
     * POST /roles/:roleId/deactivate
     */
    deactivateRole(req: Request, res: Response): Promise<void>;
    /**
     * 获取统计信息
     * GET /roles/statistics
     */
    getStatistics(_req: Request, res: Response): Promise<void>;
    /**
     * 获取角色统计信息（旧方法，保持向后兼容）
     * GET /roles/statistics
     */
    getRoleStatistics(): Promise<ApiResponse<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
        rolesByType: Record<RoleType, number>;
        averageComplexityScore: number;
        totalPermissions: number;
        totalAgents: number;
    }>>;
    /**
     * 获取角色复杂度分布
     * GET /roles/complexity-distribution
     */
    getComplexityDistribution(): Promise<ApiResponse<Array<{
        range: string;
        count: number;
        percentage: number;
    }>>>;
    /**
     * 批量创建角色
     * POST /roles/bulk
     */
    bulkCreateRoles(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=role.controller.d.ts.map