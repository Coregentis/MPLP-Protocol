"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryRoleRepository = void 0;
class MemoryRoleRepository {
    roles = new Map();
    nameIndex = new Map();
    async create(role) {
        if (this.nameIndex.has(role.name)) {
            throw new Error(`Role with name '${role.name}' already exists`);
        }
        this.roles.set(role.roleId, role);
        this.nameIndex.set(role.name, role.roleId);
        return role;
    }
    async findById(roleId) {
        return this.roles.get(roleId) || null;
    }
    async findByName(name) {
        const roleId = this.nameIndex.get(name);
        if (!roleId)
            return null;
        return this.roles.get(roleId) || null;
    }
    async update(role) {
        const existing = this.roles.get(role.roleId);
        if (!existing) {
            throw new Error(`Role with ID ${role.roleId} not found`);
        }
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
    async delete(roleId) {
        const role = this.roles.get(roleId);
        if (!role) {
            return false;
        }
        this.roles.delete(roleId);
        this.nameIndex.delete(role.name);
        return true;
    }
    async exists(roleId) {
        return this.roles.has(roleId);
    }
    async findAll(pagination, filter, sort) {
        let roles = Array.from(this.roles.values());
        if (filter) {
            roles = this.applyFilter(roles, filter);
        }
        if (sort) {
            roles = this.applySort(roles, sort);
        }
        return this.applyPagination(roles, pagination);
    }
    async findByContextId(contextId, pagination) {
        const roles = Array.from(this.roles.values()).filter(role => role.contextId === contextId);
        return this.applyPagination(roles, pagination);
    }
    async findByType(roleType, pagination) {
        const roles = Array.from(this.roles.values()).filter(role => role.roleType === roleType);
        return this.applyPagination(roles, pagination);
    }
    async findByStatus(status, pagination) {
        const roles = Array.from(this.roles.values()).filter(role => role.status === status);
        return this.applyPagination(roles, pagination);
    }
    async search(searchTerm, pagination) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const roles = Array.from(this.roles.values()).filter(role => role.name.toLowerCase().includes(lowerSearchTerm) ||
            role.displayName?.toLowerCase().includes(lowerSearchTerm) ||
            role.description?.toLowerCase().includes(lowerSearchTerm));
        return this.applyPagination(roles, pagination);
    }
    async findByPermission(resourceType, resourceId, action, pagination) {
        const roles = Array.from(this.roles.values()).filter(role => role.hasPermission(resourceType, resourceId, action));
        return this.applyPagination(roles, pagination);
    }
    async hasPermission(roleId, resourceType, resourceId, action) {
        const role = this.roles.get(roleId);
        if (!role)
            return false;
        return role.hasPermission(resourceType, resourceId, action);
    }
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
            if (filter.securityClearance && !filter.securityClearance.includes(role.attributes?.securityClearance))
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
    async clear() {
        this.roles.clear();
        this.nameIndex.clear();
    }
    async findAllAsArray() {
        return Array.from(this.roles.values());
    }
}
exports.MemoryRoleRepository = MemoryRoleRepository;
