"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRoleRepository = void 0;
const role_entity_1 = require("../../domain/entities/role.entity");
const role_mapper_1 = require("../../api/mappers/role.mapper");
class DatabaseRoleRepository {
    dbClient;
    config;
    tableName = 'mplp_roles';
    permissionsTableName = 'mplp_role_permissions';
    inheritanceTableName = 'mplp_role_inheritance';
    delegationTableName = 'mplp_role_delegations';
    constructor(dbClient, config) {
        this.dbClient = dbClient;
        this.config = config;
    }
    async create(role) {
        return await this.dbClient.transaction(async (client) => {
            const existing = await this.findByName(role.name);
            if (existing) {
                throw new Error(`Role with name '${role.name}' already exists`);
            }
            const roleSchema = role_mapper_1.RoleMapper.toSchema(role);
            const insertSql = `
        INSERT INTO ${this.tableName} (
          role_id, context_id, name, display_name, description, role_type, status,
          scope_data, permissions_data, inheritance_data, delegation_data,
          attributes_data, validation_rules_data, audit_settings_data,
          agents_data, team_configuration_data, performance_metrics_data,
          monitoring_integration_data, version_history_data, search_metadata_data,
          role_operation, event_integration_data, audit_trail_data,
          protocol_version, timestamp, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
            const insertParams = [
                roleSchema.role_id,
                roleSchema.context_id,
                roleSchema.name,
                roleSchema.display_name || null,
                roleSchema.description || null,
                roleSchema.role_type,
                roleSchema.status,
                JSON.stringify(roleSchema.scope || null),
                JSON.stringify(roleSchema.permissions || []),
                JSON.stringify(roleSchema.inheritance || null),
                JSON.stringify(roleSchema.delegation || null),
                JSON.stringify(roleSchema.attributes || null),
                JSON.stringify(roleSchema.validation_rules || null),
                JSON.stringify(roleSchema.audit_settings || null),
                JSON.stringify(roleSchema.agents || []),
                JSON.stringify(roleSchema.team_configuration || null),
                JSON.stringify(roleSchema.performance_metrics),
                JSON.stringify(roleSchema.monitoring_integration),
                JSON.stringify(roleSchema.version_history),
                JSON.stringify(roleSchema.search_metadata),
                roleSchema.role_operation,
                JSON.stringify(roleSchema.event_integration),
                JSON.stringify(roleSchema.audit_trail),
                roleSchema.protocol_version,
                roleSchema.timestamp
            ];
            await client.execute(insertSql, insertParams);
            if (role.permissions && role.permissions.length > 0) {
                await this.insertPermissions(client, role.roleId, role.permissions);
            }
            return role;
        });
    }
    async findById(roleId) {
        const sql = `SELECT * FROM ${this.tableName} WHERE role_id = ? AND deleted_at IS NULL`;
        const results = await this.dbClient.query(sql, [roleId]);
        if (!results || results.length === 0) {
            return null;
        }
        return this.mapRowToEntity(results[0]);
    }
    async findByName(name) {
        const sql = `SELECT * FROM ${this.tableName} WHERE name = ? AND deleted_at IS NULL`;
        const results = await this.dbClient.query(sql, [name]);
        if (!results || results.length === 0) {
            return null;
        }
        return this.mapRowToEntity(results[0]);
    }
    async update(role) {
        return await this.dbClient.transaction(async (client) => {
            const roleSchema = role_mapper_1.RoleMapper.toSchema(role);
            const updateSql = `
        UPDATE ${this.tableName} SET
          name = ?, display_name = ?, description = ?, role_type = ?, status = ?,
          scope_data = ?, permissions_data = ?, inheritance_data = ?, delegation_data = ?,
          attributes_data = ?, validation_rules_data = ?, audit_settings_data = ?,
          agents_data = ?, team_configuration_data = ?, performance_metrics_data = ?,
          monitoring_integration_data = ?, version_history_data = ?, search_metadata_data = ?,
          role_operation = ?, event_integration_data = ?, audit_trail_data = ?,
          updated_at = NOW()
        WHERE role_id = ? AND deleted_at IS NULL
      `;
            const updateParams = [
                roleSchema.name,
                roleSchema.display_name || null,
                roleSchema.description || null,
                roleSchema.role_type,
                roleSchema.status,
                JSON.stringify(roleSchema.scope || null),
                JSON.stringify(roleSchema.permissions || []),
                JSON.stringify(roleSchema.inheritance || null),
                JSON.stringify(roleSchema.delegation || null),
                JSON.stringify(roleSchema.attributes || null),
                JSON.stringify(roleSchema.validation_rules || null),
                JSON.stringify(roleSchema.audit_settings || null),
                JSON.stringify(roleSchema.agents || []),
                JSON.stringify(roleSchema.team_configuration || null),
                JSON.stringify(roleSchema.performance_metrics),
                JSON.stringify(roleSchema.monitoring_integration),
                JSON.stringify(roleSchema.version_history),
                JSON.stringify(roleSchema.search_metadata),
                roleSchema.role_operation,
                JSON.stringify(roleSchema.event_integration),
                JSON.stringify(roleSchema.audit_trail),
                roleSchema.role_id
            ];
            const result = await client.execute(updateSql, updateParams);
            if (result.affectedRows === 0) {
                throw new Error(`Role with ID ${role.roleId} not found or already deleted`);
            }
            return role;
        });
    }
    async delete(roleId) {
        const sql = `UPDATE ${this.tableName} SET deleted_at = NOW() WHERE role_id = ? AND deleted_at IS NULL`;
        const result = await this.dbClient.execute(sql, [roleId]);
        return result.affectedRows > 0;
    }
    async exists(roleId) {
        const sql = `SELECT 1 FROM ${this.tableName} WHERE role_id = ? AND deleted_at IS NULL`;
        const results = await this.dbClient.query(sql, [roleId]);
        return results.length > 0;
    }
    async findAll(pagination, filter, sort) {
        const { whereClause, params } = this.buildWhereClause(filter);
        const orderClause = this.buildOrderClause(sort);
        const limitClause = this.buildLimitClause(pagination);
        const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
        const countResults = await this.dbClient.query(countSql, params);
        const total = countResults[0].total;
        const dataSql = `SELECT * FROM ${this.tableName} ${whereClause} ${orderClause} ${limitClause}`;
        const dataResults = await this.dbClient.query(dataSql, params);
        const items = dataResults.map(row => this.mapRowToEntity(row));
        return {
            items,
            total,
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            hasNext: (pagination?.page || 1) * (pagination?.limit || 10) < total,
            hasPrevious: (pagination?.page || 1) > 1
        };
    }
    mapRowToEntity(row) {
        const roleSchema = {
            role_id: row.role_id,
            context_id: row.context_id,
            name: row.name,
            display_name: row.display_name,
            description: row.description,
            role_type: row.role_type,
            status: row.status,
            scope: row.scope_data ? JSON.parse(row.scope_data) : undefined,
            permissions: row.permissions_data ? JSON.parse(row.permissions_data) : [],
            inheritance: row.inheritance_data ? JSON.parse(row.inheritance_data) : undefined,
            delegation: row.delegation_data ? JSON.parse(row.delegation_data) : undefined,
            attributes: row.attributes_data ? JSON.parse(row.attributes_data) : undefined,
            validation_rules: row.validation_rules_data ? JSON.parse(row.validation_rules_data) : undefined,
            audit_settings: row.audit_settings_data ? JSON.parse(row.audit_settings_data) : undefined,
            agents: row.agents_data ? JSON.parse(row.agents_data) : [],
            team_configuration: row.team_configuration_data ? JSON.parse(row.team_configuration_data) : undefined,
            performance_metrics: JSON.parse(row.performance_metrics_data),
            monitoring_integration: JSON.parse(row.monitoring_integration_data),
            version_history: JSON.parse(row.version_history_data),
            search_metadata: JSON.parse(row.search_metadata_data),
            role_operation: row.role_operation,
            event_integration: JSON.parse(row.event_integration_data),
            audit_trail: JSON.parse(row.audit_trail_data),
            protocol_version: row.protocol_version,
            timestamp: row.timestamp
        };
        const entityData = role_mapper_1.RoleMapper.fromSchema(roleSchema);
        return new role_entity_1.RoleEntity(entityData);
    }
    buildWhereClause(filter) {
        const conditions = ['deleted_at IS NULL'];
        const params = [];
        if (filter) {
            if (filter.roleType && filter.roleType.length > 0) {
                conditions.push(`role_type IN (${filter.roleType.map(() => '?').join(', ')})`);
                params.push(...filter.roleType);
            }
            if (filter.status && filter.status.length > 0) {
                conditions.push(`status IN (${filter.status.map(() => '?').join(', ')})`);
                params.push(...filter.status);
            }
            if (filter.name) {
                conditions.push('name LIKE ?');
                params.push(`%${filter.name}%`);
            }
            if (filter.contextId) {
                conditions.push('context_id = ?');
                params.push(filter.contextId);
            }
            if (filter.createdAfter) {
                conditions.push('created_at >= ?');
                params.push(filter.createdAfter);
            }
            if (filter.createdBefore) {
                conditions.push('created_at <= ?');
                params.push(filter.createdBefore);
            }
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        return { whereClause, params };
    }
    buildOrderClause(sort) {
        if (!sort) {
            return 'ORDER BY created_at DESC';
        }
        const fieldMap = {
            name: 'name',
            roleType: 'role_type',
            status: 'status',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        };
        const field = fieldMap[sort.field] || 'created_at';
        const direction = sort.direction === 'asc' ? 'ASC' : 'DESC';
        return `ORDER BY ${field} ${direction}`;
    }
    buildLimitClause(pagination) {
        if (!pagination) {
            return 'LIMIT 10';
        }
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const offset = (page - 1) * limit;
        return `LIMIT ${limit} OFFSET ${offset}`;
    }
    async insertPermissions(client, roleId, permissions) {
        if (!permissions || permissions.length === 0)
            return;
        const sql = `INSERT INTO ${this.permissionsTableName} (role_id, permission_data, created_at) VALUES (?, ?, NOW())`;
        for (const permission of permissions) {
            await client.execute(sql, [roleId, JSON.stringify(permission)]);
        }
    }
    async findByContextId(contextId, pagination) {
        return this.findAll(pagination, { contextId });
    }
    async findByType(roleType, pagination) {
        return this.findAll(pagination, { roleType: [roleType] });
    }
    async search(query, pagination) {
        return this.findAll(pagination, { name: query });
    }
    async findByStatus(status, pagination) {
        return this.findAll(pagination, { status: [status] });
    }
    async findByPermission(resourceType, resourceId, action, pagination) {
        const filter = {
            hasPermission: {
                resourceType,
                resourceId,
                action
            }
        };
        return this.findAll(pagination, filter);
    }
    async count(filter) {
        const { whereClause, params } = this.buildWhereClause(filter);
        const sql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
        const results = await this.dbClient.query(sql, params);
        return results[0].total;
    }
    async getComplexityDistribution() {
        return [
            { range: '0-25', count: 0, percentage: 0 },
            { range: '26-50', count: 0, percentage: 0 },
            { range: '51-75', count: 0, percentage: 0 },
            { range: '76-100', count: 0, percentage: 0 }
        ];
    }
    async getVersionHistory(_roleId, pagination) {
        return {
            items: [],
            total: 0,
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            hasNext: false,
            hasPrevious: false
        };
    }
    async getAuditLog(_roleId, pagination) {
        return {
            items: [],
            total: 0,
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            hasNext: false,
            hasPrevious: false
        };
    }
    async hasPermission(_roleId, _resourceType, _resourceId, _action) {
        return false;
    }
    async findParentRoles(_roleId) {
        return [];
    }
    async findChildRoles(_roleId) {
        return [];
    }
    async findDelegations(_roleId) {
        return [];
    }
    async bulkCreate(_roles) {
        return { success: 0, failed: 0, errors: [] };
    }
    async bulkUpdate(_roles) {
        return { success: 0, failed: 0, errors: [] };
    }
    async bulkDelete(_roleIds) {
        return { success: 0, failed: 0, errors: [] };
    }
    async getStatistics() {
        return {
            totalRoles: 0,
            activeRoles: 0,
            inactiveRoles: 0,
            rolesByType: {},
            averageComplexityScore: 0,
            totalPermissions: 0,
            totalAgents: 0
        };
    }
}
exports.DatabaseRoleRepository = DatabaseRoleRepository;
