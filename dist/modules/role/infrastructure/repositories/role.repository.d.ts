import { RoleEntity } from '../../domain/entities/role.entity';
import { IRoleRepository, PaginationParams, PaginatedResult, RoleQueryFilter, RoleSortOptions, BulkOperationResult } from '../../domain/repositories/role-repository.interface';
import { UUID, RoleType, RoleStatus } from '../../types';
export declare class MemoryRoleRepository implements IRoleRepository {
    private roles;
    private nameIndex;
    create(role: RoleEntity): Promise<RoleEntity>;
    findById(roleId: UUID): Promise<RoleEntity | null>;
    findByName(name: string): Promise<RoleEntity | null>;
    update(role: RoleEntity): Promise<RoleEntity>;
    delete(roleId: UUID): Promise<boolean>;
    exists(roleId: UUID): Promise<boolean>;
    findAll(pagination?: PaginationParams, filter?: RoleQueryFilter, sort?: RoleSortOptions): Promise<PaginatedResult<RoleEntity>>;
    findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    findByType(roleType: RoleType, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    findByStatus(status: RoleStatus, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    search(searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    findByPermission(resourceType: string, resourceId: string, action: string, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    hasPermission(roleId: UUID, resourceType: string, resourceId: string, action: string): Promise<boolean>;
    findParentRoles(roleId: UUID): Promise<RoleEntity[]>;
    findChildRoles(roleId: UUID): Promise<RoleEntity[]>;
    findDelegations(roleId: UUID): Promise<Array<{
        delegationId: UUID;
        delegatedTo: string;
        permissions: UUID[];
        startTime: Date;
        endTime?: Date;
        status: string;
    }>>;
    bulkCreate(roles: RoleEntity[]): Promise<BulkOperationResult>;
    bulkUpdate(roles: RoleEntity[]): Promise<BulkOperationResult>;
    bulkDelete(roleIds: UUID[]): Promise<BulkOperationResult>;
    getStatistics(): Promise<{
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
    getVersionHistory(roleId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<{
        versionId: UUID;
        versionNumber: number;
        createdAt: Date;
        createdBy: string;
        changeSummary?: string;
        changeType: string;
    }>>;
    getAuditLog(roleId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<{
        eventId: UUID;
        eventType: string;
        timestamp: Date;
        userId: string;
        action: string;
        details: Record<string, unknown>;
    }>>;
    private applyFilter;
    private applySort;
    private applyPagination;
    clear(): Promise<void>;
    findAllAsArray(): Promise<RoleEntity[]>;
}
//# sourceMappingURL=role.repository.d.ts.map