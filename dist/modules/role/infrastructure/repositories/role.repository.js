"use strict";
/**
 * Role内存仓库实现
 *
 * @description Role模块的内存仓库实现，用于开发和测试 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 基础设施层 - 仓库实现
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryRoleRepository = void 0;
/**
 * 内存Role仓库实现
 *
 * @description 基于内存存储的Role仓库实现，提供完整的CRUD操作和企业级RBAC功能
 */
class MemoryRoleRepository {
    constructor() {
        this.roles = new Map();
        this.nameIndex = new Map();
    }
    // ===== 基础CRUD操作 =====
    /**
     * 创建角色
     */
    async create(role) {
        // 检查名称唯一性
        if (this.nameIndex.has(role.name)) {
            throw new Error(`Role with name '${role.name}' already exists`);
        }
        this.roles.set(role.roleId, role);
        this.nameIndex.set(role.name, role.roleId);
        return role;
    }
    /**
     * 根据ID查找角色
     */
    async findById(roleId) {
        return this.roles.get(roleId) || null;
    }
    /**
     * 根据名称查找角色
     */
    async findByName(name) {
        const roleId = this.nameIndex.get(name);
        if (!roleId)
            return null;
        return this.roles.get(roleId) || null;
    }
    /**
     * 更新角色
     */
    async update(role) {
        const existing = this.roles.get(role.roleId);
        if (!existing) {
            throw new Error(`Role with ID ${role.roleId} not found`);
        }
        // 如果名称发生变化，更新名称索引
        if (existing.name !== role.name) {
            this.nameIndex.delete(existing.name);
            if (this.nameIndex.has(role.name)) {
                throw new Error(`Role with name '${role.name}' already exists`);
            }
            this.nameIndex.set(role.name, role.roleId);
        }
        this.roles.set(role.roleId, role);
        return role;
    }
    /**
     * 删除角色
     */
    async delete(roleId) {
        const role = this.roles.get(roleId);
        if (!role) {
            return false;
        }
        this.roles.delete(roleId);
        this.nameIndex.delete(role.name);
        return true;
    }
    /**
     * 检查角色是否存在
     */
    async exists(roleId) {
        return this.roles.has(roleId);
    }
    // ===== 查询操作 =====
    /**
     * 查找所有角色
     */
    async findAll(pagination, filter, sort) {
        let roles = Array.from(this.roles.values());
        // 应用过滤器
        if (filter) {
            roles = this.applyFilter(roles, filter);
        }
        // 应用排序
        if (sort) {
            roles = this.applySort(roles, sort);
        }
        // 应用分页
        return this.applyPagination(roles, pagination);
    }
    /**
     * 根据上下文ID查找角色
     */
    async findByContextId(contextId, pagination) {
        const roles = Array.from(this.roles.values()).filter(role => role.contextId === contextId);
        return this.applyPagination(roles, pagination);
    }
    /**
     * 根据角色类型查找角色
     */
    async findByType(roleType, pagination) {
        const roles = Array.from(this.roles.values()).filter(role => role.roleType === roleType);
        return this.applyPagination(roles, pagination);
    }
    /**
     * 根据状态查找角色
     */
    async findByStatus(status, pagination) {
        const roles = Array.from(this.roles.values()).filter(role => role.status === status);
        return this.applyPagination(roles, pagination);
    }
    /**
     * 搜索角色
     */
    async search(searchTerm, pagination) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const roles = Array.from(this.roles.values()).filter(role => role.name.toLowerCase().includes(lowerSearchTerm) ||
            role.displayName?.toLowerCase().includes(lowerSearchTerm) ||
            role.description?.toLowerCase().includes(lowerSearchTerm));
        return this.applyPagination(roles, pagination);
    }
    // ===== 权限相关操作 =====
    /**
     * 查找具有特定权限的角色
     */
    async findByPermission(resourceType, resourceId, action, pagination) {
        const roles = Array.from(this.roles.values()).filter(role => role.hasPermission(resourceType, resourceId, action));
        return this.applyPagination(roles, pagination);
    }
    /**
     * 检查角色是否有特定权限
     */
    async hasPermission(roleId, resourceType, resourceId, action) {
        const role = this.roles.get(roleId);
        if (!role)
            return false;
        return role.hasPermission(resourceType, resourceId, action);
    }
    // ===== 继承和委托操作 =====
    /**
     * 查找角色的父角色
     */
    async findParentRoles(roleId) {
        const role = this.roles.get(roleId);
        if (!role || !role.inheritance?.parentRoles)
            return [];
        const parentRoles = [];
        for (const parent of role.inheritance.parentRoles) {
            const parentRole = this.roles.get(parent.roleId);
            if (parentRole) {
                parentRoles.push(parentRole);
            }
        }
        return parentRoles;
    }
    /**
     * 查找角色的子角色
     */
    async findChildRoles(roleId) {
        const role = this.roles.get(roleId);
        if (!role || !role.inheritance?.childRoles)
            return [];
        const childRoles = [];
        for (const child of role.inheritance.childRoles) {
            const childRole = this.roles.get(child.roleId);
            if (childRole) {
                childRoles.push(childRole);
            }
        }
        return childRoles;
    }
    /**
     * 查找角色的委托关系
     */
    async findDelegations(roleId) {
        const role = this.roles.get(roleId);
        if (!role || !role.delegation?.activeDelegations)
            return [];
        return role.delegation.activeDelegations.map(delegation => ({
            delegationId: delegation.delegationId,
            delegatedTo: delegation.delegatedTo,
            permissions: delegation.permissions,
            startTime: delegation.startTime,
            endTime: delegation.endTime,
            status: delegation.status
        }));
    }
    // ===== 批量操作 =====
    /**
     * 批量创建角色
     */
    async bulkCreate(roles) {
        const result = {
            success: 0,
            failed: 0,
            errors: []
        };
        for (const role of roles) {
            try {
                await this.create(role);
                result.success++;
            }
            catch (error) {
                result.failed++;
                result.errors.push({
                    roleId: role.roleId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return result;
    }
    /**
     * 批量更新角色
     */
    async bulkUpdate(roles) {
        const result = {
            success: 0,
            failed: 0,
            errors: []
        };
        for (const role of roles) {
            try {
                await this.update(role);
                result.success++;
            }
            catch (error) {
                result.failed++;
                result.errors.push({
                    roleId: role.roleId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return result;
    }
    /**
     * 批量删除角色
     */
    async bulkDelete(roleIds) {
        const result = {
            success: 0,
            failed: 0,
            errors: []
        };
        for (const roleId of roleIds) {
            try {
                const deleted = await this.delete(roleId);
                if (deleted) {
                    result.success++;
                }
                else {
                    result.failed++;
                    result.errors.push({
                        roleId,
                        error: 'Role not found'
                    });
                }
            }
            catch (error) {
                result.failed++;
                result.errors.push({
                    roleId,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return result;
    }
    // ===== 统计和分析操作 =====
    /**
     * 获取角色统计信息
     */
    async getStatistics() {
        const roles = Array.from(this.roles.values());
        const rolesByType = {
            system: 0,
            organizational: 0,
            functional: 0,
            project: 0,
            temporary: 0
        };
        let totalComplexityScore = 0;
        let totalPermissions = 0;
        let totalAgents = 0;
        let activeRoles = 0;
        let inactiveRoles = 0;
        for (const role of roles) {
            rolesByType[role.roleType]++;
            totalComplexityScore += role.getComplexityScore();
            totalPermissions += role.permissions.length;
            totalAgents += role.agents?.length || 0;
            if (role.status === 'active') {
                activeRoles++;
            }
            else {
                inactiveRoles++;
            }
        }
        return {
            totalRoles: roles.length,
            activeRoles,
            inactiveRoles,
            rolesByType,
            averageComplexityScore: roles.length > 0 ? totalComplexityScore / roles.length : 0,
            totalPermissions,
            totalAgents
        };
    }
    /**
     * 获取角色复杂度分布
     */
    async getComplexityDistribution() {
        const roles = Array.from(this.roles.values());
        const distribution = {
            'Low (0-25)': 0,
            'Medium (26-50)': 0,
            'High (51-75)': 0,
            'Very High (76-100)': 0
        };
        for (const role of roles) {
            const score = role.getComplexityScore();
            if (score <= 25)
                distribution['Low (0-25)']++;
            else if (score <= 50)
                distribution['Medium (26-50)']++;
            else if (score <= 75)
                distribution['High (51-75)']++;
            else
                distribution['Very High (76-100)']++;
        }
        const total = roles.length;
        return Object.entries(distribution).map(([range, count]) => ({
            range,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
        }));
    }
    // ===== 审计和版本操作 =====
    /**
     * 获取角色的版本历史
     */
    async getVersionHistory(roleId, pagination) {
        const role = this.roles.get(roleId);
        if (!role || !role.versionHistory.versions) {
            return {
                items: [],
                total: 0,
                page: 1,
                limit: 10,
                hasNext: false,
                hasPrevious: false
            };
        }
        const versions = role.versionHistory.versions.map(v => ({
            versionId: v.versionId,
            versionNumber: v.versionNumber,
            createdAt: v.createdAt,
            createdBy: v.createdBy,
            changeSummary: v.changeSummary,
            changeType: v.changeType
        }));
        return this.applyPagination(versions, pagination);
    }
    /**
     * 获取角色的审计日志
     */
    async getAuditLog(roleId, pagination) {
        const role = this.roles.get(roleId);
        if (!role || !role.auditTrail.auditEvents) {
            return {
                items: [],
                total: 0,
                page: 1,
                limit: 10,
                hasNext: false,
                hasPrevious: false
            };
        }
        const auditEvents = role.auditTrail.auditEvents.map(event => ({
            eventId: event.eventId,
            eventType: event.eventType,
            timestamp: event.timestamp,
            userId: event.userId,
            action: event.action,
            details: event.roleDetails || {}
        }));
        return this.applyPagination(auditEvents, pagination);
    }
    // ===== 私有辅助方法 =====
    /**
     * 应用过滤器
     */
    applyFilter(roles, filter) {
        return roles.filter(role => {
            if (filter.roleType && !filter.roleType.includes(role.roleType))
                return false;
            if (filter.status && !filter.status.includes(role.status))
                return false;
            if (filter.name && !role.name.toLowerCase().includes(filter.name.toLowerCase()))
                return false;
            if (filter.contextId && role.contextId !== filter.contextId)
                return false;
            if (filter.department && role.attributes?.department !== filter.department)
                return false;
            if (filter.securityClearance && role.attributes?.securityClearance && !filter.securityClearance.includes(role.attributes.securityClearance))
                return false;
            if (filter.hasPermission) {
                const { resourceType, resourceId, action } = filter.hasPermission;
                if (!role.hasPermission(resourceType, resourceId, action))
                    return false;
            }
            if (filter.createdAfter && role.timestamp < filter.createdAfter)
                return false;
            if (filter.createdBefore && role.timestamp > filter.createdBefore)
                return false;
            if (filter.agentCount) {
                const agentCount = role.agents?.length || 0;
                if (filter.agentCount.min !== undefined && agentCount < filter.agentCount.min)
                    return false;
                if (filter.agentCount.max !== undefined && agentCount > filter.agentCount.max)
                    return false;
            }
            if (filter.complexityScore) {
                const complexityScore = role.getComplexityScore();
                if (filter.complexityScore.min !== undefined && complexityScore < filter.complexityScore.min)
                    return false;
                if (filter.complexityScore.max !== undefined && complexityScore > filter.complexityScore.max)
                    return false;
            }
            return true;
        });
    }
    /**
     * 应用排序
     */
    applySort(roles, sort) {
        return roles.sort((a, b) => {
            let aValue;
            let bValue;
            switch (sort.field) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'roleType':
                    aValue = a.roleType;
                    bValue = b.roleType;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'createdAt':
                case 'updatedAt':
                    aValue = a.timestamp;
                    bValue = b.timestamp;
                    break;
                case 'complexityScore':
                    aValue = a.getComplexityScore();
                    bValue = b.getComplexityScore();
                    break;
                default:
                    return 0;
            }
            if (aValue < bValue)
                return sort.direction === 'asc' ? -1 : 1;
            if (aValue > bValue)
                return sort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    /**
     * 应用分页
     */
    applyPagination(items, pagination) {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const offset = pagination?.offset || (page - 1) * limit;
        const total = items.length;
        const paginatedItems = items.slice(offset, offset + limit);
        return {
            items: paginatedItems,
            total,
            page,
            limit,
            hasNext: offset + limit < total,
            hasPrevious: offset > 0
        };
    }
    /**
     * 清空所有角色数据 (用于测试)
     */
    async clear() {
        this.roles.clear();
        this.nameIndex.clear();
    }
    /**
     * 获取所有角色 (返回数组，用于测试)
     */
    async findAllAsArray() {
        return Array.from(this.roles.values());
    }
}
exports.MemoryRoleRepository = MemoryRoleRepository;
//# sourceMappingURL=role.repository.js.map