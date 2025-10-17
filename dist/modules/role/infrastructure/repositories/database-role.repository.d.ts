import { RoleEntity } from '../../domain/entities/role.entity';
import { IRoleRepository, PaginationParams, PaginatedResult, RoleQueryFilter, RoleSortOptions, BulkOperationResult } from '../../domain/repositories/role-repository.interface';
import { UUID, RoleType, RoleStatus } from '../../types';
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    connectionTimeout?: number;
    maxConnections?: number;
    minConnections?: number;
}
export interface IDatabaseClient {
    query(sql: string, params?: unknown[]): Promise<unknown[]>;
    execute(sql: string, params?: unknown[]): Promise<{
        affectedRows: number;
        insertId?: string;
    }>;
    transaction<T>(callback: (client: IDatabaseClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
export declare class DatabaseRoleRepository implements IRoleRepository {
    private readonly dbClient;
    private readonly config;
    private readonly tableName;
    private readonly permissionsTableName;
    private readonly inheritanceTableName;
    private readonly delegationTableName;
    constructor(dbClient: IDatabaseClient, config: DatabaseConfig);
    create(role: RoleEntity): Promise<RoleEntity>;
    findById(roleId: UUID): Promise<RoleEntity | null>;
    findByName(name: string): Promise<RoleEntity | null>;
    update(role: RoleEntity): Promise<RoleEntity>;
    delete(roleId: UUID): Promise<boolean>;
    exists(roleId: UUID): Promise<boolean>;
    findAll(pagination?: PaginationParams, filter?: RoleQueryFilter, sort?: RoleSortOptions): Promise<PaginatedResult<RoleEntity>>;
    private mapRowToEntity;
    private buildWhereClause;
    private buildOrderClause;
    private buildLimitClause;
    private insertPermissions;
    findByContextId(contextId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    findByType(roleType: RoleType, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    search(query: string, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    findByStatus(status: RoleStatus, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    findByPermission(resourceType: string, resourceId: string, action: string, pagination?: PaginationParams): Promise<PaginatedResult<RoleEntity>>;
    count(filter?: RoleQueryFilter): Promise<number>;
    getComplexityDistribution(): Promise<Array<{
        range: string;
        count: number;
        percentage: number;
    }>>;
    getVersionHistory(_roleId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<{
        versionId: UUID;
        versionNumber: number;
        createdAt: Date;
        createdBy: string;
        changeSummary?: string;
        changeType: string;
    }>>;
    getAuditLog(_roleId: UUID, pagination?: PaginationParams): Promise<PaginatedResult<{
        eventId: UUID;
        eventType: string;
        timestamp: Date;
        userId: string;
        action: string;
        details: Record<string, unknown>;
    }>>;
    hasPermission(_roleId: UUID, _resourceType: string, _resourceId: string, _action: string): Promise<boolean>;
    findParentRoles(_roleId: UUID): Promise<RoleEntity[]>;
    findChildRoles(_roleId: UUID): Promise<RoleEntity[]>;
    findDelegations(_roleId: UUID): Promise<Array<{
        delegationId: UUID;
        delegatedTo: string;
        permissions: UUID[];
        startTime: Date;
        endTime?: Date;
        status: string;
    }>>;
    bulkCreate(_roles: RoleEntity[]): Promise<BulkOperationResult>;
    bulkUpdate(_roles: RoleEntity[]): Promise<BulkOperationResult>;
    bulkDelete(_roleIds: UUID[]): Promise<BulkOperationResult>;
    getStatistics(): Promise<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
        rolesByType: Record<RoleType, number>;
        averageComplexityScore: number;
        totalPermissions: number;
        totalAgents: number;
    }>;
}
//# sourceMappingURL=database-role.repository.d.ts.map