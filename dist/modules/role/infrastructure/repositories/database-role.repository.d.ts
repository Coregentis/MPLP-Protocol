/**
 * Role数据库仓库实现
 *
 * @description Role模块的数据库仓库实现，支持生产环境数据持久化 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 基础设施层 - 数据库仓库实现
 * @pattern 基于SCTM+GLFB+ITCM增强框架+RBCT方法论设计
 */
import { RoleEntity } from '../../domain/entities/role.entity';
import { IRoleRepository, PaginationParams, PaginatedResult, RoleQueryFilter, RoleSortOptions, BulkOperationResult } from '../../domain/repositories/role-repository.interface';
import { UUID, RoleType, RoleStatus } from '../../types';
/**
 * 数据库连接配置接口
 */
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
/**
 * 简化的数据库客户端接口
 */
export interface IDatabaseClient {
    query(sql: string, params?: unknown[]): Promise<unknown[]>;
    execute(sql: string, params?: unknown[]): Promise<{
        affectedRows: number;
        insertId?: string;
    }>;
    transaction<T>(callback: (client: IDatabaseClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
/**
 * 数据库Role仓库实现
 *
 * @description 基于数据库存储的Role仓库实现，提供完整的CRUD操作和企业级RBAC功能
 */
export declare class DatabaseRoleRepository implements IRoleRepository {
    private readonly dbClient;
    private readonly config;
    private readonly tableName;
    private readonly permissionsTableName;
    private readonly inheritanceTableName;
    private readonly delegationTableName;
    constructor(dbClient: IDatabaseClient, config: DatabaseConfig);
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
     * 删除角色（软删除）
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
     * 将数据库行映射为实体
     */
    private mapRowToEntity;
    /**
     * 构建WHERE子句
     */
    private buildWhereClause;
    /**
     * 构建ORDER BY子句
     */
    private buildOrderClause;
    /**
     * 构建LIMIT子句
     */
    private buildLimitClause;
    /**
     * 插入权限关联
     */
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
    /**
     * 安全的JSON解析辅助方法 (CWE-502 修复)
     */
    private safeJsonParse;
}
//# sourceMappingURL=database-role.repository.d.ts.map