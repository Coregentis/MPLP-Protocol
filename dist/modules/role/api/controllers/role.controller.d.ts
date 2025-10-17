import { Request, Response } from 'express';
import { RoleManagementService } from '../../application/services/role-management.service';
import { RoleEntity } from '../../domain/entities/role.entity';
import { UUID, RoleType, Permission } from '../../types';
import { PaginationParams, PaginatedResult } from '../../domain/repositories/role-repository.interface';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleManagementService);
    createRole(req: Request, res: Response): Promise<void>;
    getRoleById(req: Request, res: Response): Promise<void>;
    getRole(roleId: UUID): Promise<ApiResponse<RoleEntity>>;
    getRoleByName(name: string): Promise<ApiResponse<RoleEntity>>;
    updateRole(req: Request, res: Response): Promise<void>;
    deleteRole(req: Request, res: Response): Promise<void>;
    getAllRoles(req: Request, res: Response): Promise<void>;
    getRolesByContext(req: Request, res: Response): Promise<void>;
    getRolesByContextId(contextId: UUID, pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<RoleEntity>>>;
    getRolesByType(req: Request, res: Response): Promise<void>;
    searchRoles(req: Request, res: Response): Promise<void>;
    checkPermission(req: Request, res: Response): Promise<void>;
    addPermission(roleId: UUID, permission: Permission): Promise<ApiResponse<RoleEntity>>;
    removePermission(roleId: UUID, permissionId: UUID): Promise<ApiResponse<RoleEntity>>;
    activateRole(req: Request, res: Response): Promise<void>;
    deactivateRole(req: Request, res: Response): Promise<void>;
    getStatistics(_req: Request, res: Response): Promise<void>;
    getRoleStatistics(): Promise<ApiResponse<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
        rolesByType: Record<RoleType, number>;
        averageComplexityScore: number;
        totalPermissions: number;
        totalAgents: number;
    }>>;
    getComplexityDistribution(): Promise<ApiResponse<Array<{
        range: string;
        count: number;
        percentage: number;
    }>>>;
    bulkCreateRoles(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=role.controller.d.ts.map