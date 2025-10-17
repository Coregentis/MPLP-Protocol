import { RoleEntity } from '../../domain/entities/role.entity';
import { IRoleRepository, PaginationParams, PaginatedResult, RoleQueryFilter, RoleSortOptions } from '../../domain/repositories/role-repository.interface';
import { UUID, RoleType, RoleStatus, Permission, SecurityClearance } from '../../types';
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
export interface UpdateRoleRequest {
    name?: string;
    displayName?: string;
    description?: string;
    status?: RoleStatus;
    permissions?: Permission[];
    attributes?: CreateRoleRequest['attributes'];
}
export interface AssignRoleRequest {
    roleId: UUID;
    userId: string;
    assignedBy: string;
    reason?: string;
    expiryDate?: Date;
}
export declare class RoleManagementService {
    private readonly repository;
    constructor(repository: IRoleRepository);
    createRole(request: CreateRoleRequest): Promise<RoleEntity>;
    getRoleById(roleId: UUID): Promise<RoleEntity | null>;
    getRoleByName(name: string): Promise<RoleEntity | null>;
    updateRole(roleId: UUID, request: UpdateRoleRequest): Promise<RoleEntity>;
    deleteRole(roleId: UUID): Promise<boolean>;
    getAllRoles(pagination?: PaginationParams, filter?: RoleQueryFilter, sort?: RoleSortOptions): Promise<PaginatedResult<RoleEntity>>;
    getRolesByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    getRolesByContext(contextId: UUID): Promise<RoleEntity[]>;
    getRolesByType(roleType: RoleType, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    searchRoles(searchParams: string | {
        query: string;
        filters?: {
            status?: RoleStatus;
            roleType?: RoleType;
            contextId?: UUID;
        };
    }, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    checkPermission(roleId: UUID, resourceType: string, resourceId: string, action: string): Promise<boolean>;
    addPermission(roleId: UUID, permission: Permission): Promise<RoleEntity>;
    removePermission(roleId: UUID, permissionId: UUID): Promise<RoleEntity>;
    assignRole(request: AssignRoleRequest): Promise<{
        roleId: UUID;
        userId: string;
        planId?: UUID;
        assignedAt: string;
        success: boolean;
    }>;
    activateRole(roleId: UUID): Promise<RoleEntity>;
    deactivateRole(roleId: UUID): Promise<RoleEntity>;
    getRoleStatistics(): Promise<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
        rolesByType: Record<RoleType, number>;
        averageComplexityScore: number;
        totalPermissions: number;
        totalAgents: number;
    }>;
    getComplexityDistribution(): Promise<Array<{
        range: string;
        count: number;
        percentage: number;
    }>>;
    bulkCreateRoles(requests: CreateRoleRequest[]): Promise<{
        successfulRoles: RoleEntity[];
        failedRoles: Array<{
            request: CreateRoleRequest;
            error: string;
        }>;
    }>;
    private validateRoleCoordinationPermission;
    private getRoleCoordinationContext;
    private recordRoleCoordinationMetrics;
    private manageRoleExtensionCoordination;
    private requestRoleChangeCoordination;
    private coordinateCollabRoleManagement;
    private enableDialogDrivenRoleCoordination;
    private coordinateRoleAcrossNetwork;
    getUserPermissions(_userId: string): Promise<Permission[]>;
    getRolePermissions(roleId: UUID): Promise<Permission[]>;
    private deduplicatePermissions;
    private validateRoleData;
}
//# sourceMappingURL=role-management.service.d.ts.map