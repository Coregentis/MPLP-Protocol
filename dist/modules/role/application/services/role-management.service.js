"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleManagementService = void 0;
const role_entity_1 = require("../../domain/entities/role.entity");
const crypto_1 = require("crypto");
class RoleManagementService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async createRole(request) {
        if (!request.name || request.name.trim() === '') {
            throw new Error('Role name is required and cannot be empty');
        }
        const existingRole = await this.repository.findByName(request.name);
        if (existingRole) {
            throw new Error(`Role with name '${request.name}' already exists`);
        }
        const roleId = (0, crypto_1.randomUUID)();
        const role = new role_entity_1.RoleEntity({
            protocolVersion: '1.0.0',
            timestamp: new Date(),
            roleId,
            contextId: request.contextId,
            name: request.name,
            displayName: request.displayName,
            description: request.description,
            roleType: request.roleType,
            status: 'active',
            scope: request.scope,
            permissions: request.permissions,
            attributes: request.attributes,
            performanceMetrics: {
                enabled: true,
                collectionIntervalSeconds: 60
            },
            monitoringIntegration: {
                enabled: false,
                supportedProviders: []
            },
            versionHistory: {
                enabled: true,
                maxVersions: 50
            },
            searchMetadata: {
                enabled: true,
                indexingStrategy: 'keyword'
            },
            roleOperation: 'create',
            eventIntegration: {
                enabled: false
            },
            auditTrail: {
                enabled: true,
                retentionDays: 365
            }
        });
        const saved = await this.repository.create(role);
        return saved;
    }
    async getRoleById(roleId) {
        return await this.repository.findById(roleId);
    }
    async getRoleByName(name) {
        return await this.repository.findByName(name);
    }
    async updateRole(roleId, request) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        if (request.name !== undefined) {
            const existingRole = await this.repository.findByName(request.name);
            if (existingRole && existingRole.roleId !== roleId) {
                throw new Error(`Role with name '${request.name}' already exists`);
            }
            role.name = request.name;
        }
        if (request.displayName !== undefined) {
            role.displayName = request.displayName;
        }
        if (request.description !== undefined) {
            role.description = request.description;
        }
        if (request.status !== undefined) {
            role.status = request.status;
        }
        if (request.permissions !== undefined) {
            role.permissions = request.permissions;
        }
        if (request.attributes !== undefined) {
            role.attributes = { ...role.attributes, ...request.attributes };
        }
        role.roleOperation = 'update';
        const updated = await this.repository.update(role);
        return updated;
    }
    async deleteRole(roleId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        return await this.repository.delete(roleId);
    }
    async getAllRoles(pagination, filter, sort) {
        return await this.repository.findAll(pagination, filter, sort);
    }
    async getRolesByContextId(contextId, pagination) {
        return await this.repository.findByContextId(contextId, pagination);
    }
    async getRolesByContext(contextId) {
        const result = await this.repository.findByContextId(contextId);
        return result.items;
    }
    async getRolesByType(roleType, pagination) {
        const result = await this.repository.findByType(roleType, pagination);
        if (!pagination) {
            return result.items;
        }
        return result;
    }
    async searchRoles(searchParams, pagination) {
        if (typeof searchParams === 'string') {
            return await this.repository.search(searchParams, pagination);
        }
        const { query, filters } = searchParams;
        const results = await this.repository.search(query, pagination);
        if (filters) {
            results.items = results.items.filter(role => {
                if (filters.status && role.status !== filters.status)
                    return false;
                if (filters.roleType && role.roleType !== filters.roleType)
                    return false;
                if (filters.contextId && role.contextId !== filters.contextId)
                    return false;
                return true;
            });
            results.total = results.items.length;
            results.hasNext = false;
            results.hasPrevious = false;
        }
        return results;
    }
    async checkPermission(roleId, resourceType, resourceId, action) {
        return await this.repository.hasPermission(roleId, resourceType, resourceId, action);
    }
    async addPermission(roleId, permission) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        role.addPermission(permission);
        role.roleOperation = 'update';
        return await this.repository.update(role);
    }
    async removePermission(roleId, permissionId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        role.removePermission(permissionId);
        role.roleOperation = 'update';
        return await this.repository.update(role);
    }
    async assignRole(request) {
        const role = await this.repository.findById(request.roleId);
        if (!role) {
            throw new Error(`Role with ID ${request.roleId} not found`);
        }
        if (role.status !== 'active') {
            throw new Error(`Role ${request.roleId} is not active`);
        }
        return {
            roleId: request.roleId,
            userId: request.userId,
            assignedAt: new Date().toISOString(),
            success: true
        };
    }
    async activateRole(roleId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        role.activate();
        role.roleOperation = 'update';
        return await this.repository.update(role);
    }
    async deactivateRole(roleId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        role.deactivate();
        role.roleOperation = 'update';
        return await this.repository.update(role);
    }
    async getRoleStatistics() {
        return await this.repository.getStatistics();
    }
    async getComplexityDistribution() {
        return await this.repository.getComplexityDistribution();
    }
    async bulkCreateRoles(requests) {
        const successfulRoles = [];
        const failedRoles = [];
        for (const request of requests) {
            try {
                const roleId = (0, crypto_1.randomUUID)();
                const role = new role_entity_1.RoleEntity({
                    protocolVersion: '1.0.0',
                    timestamp: new Date(),
                    roleId,
                    contextId: request.contextId,
                    name: request.name,
                    displayName: request.displayName,
                    description: request.description,
                    roleType: request.roleType,
                    status: 'active',
                    scope: request.scope,
                    permissions: request.permissions,
                    attributes: request.attributes,
                    performanceMetrics: {
                        enabled: true,
                        collectionIntervalSeconds: 60
                    },
                    monitoringIntegration: {
                        enabled: false,
                        supportedProviders: []
                    },
                    versionHistory: {
                        enabled: true,
                        maxVersions: 50
                    },
                    searchMetadata: {
                        enabled: true,
                        indexingStrategy: 'keyword'
                    },
                    roleOperation: 'create',
                    eventIntegration: {
                        enabled: false
                    },
                    auditTrail: {
                        enabled: true,
                        retentionDays: 365
                    }
                });
                await this.repository.create(role);
                successfulRoles.push(role);
            }
            catch (error) {
                failedRoles.push({
                    request,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return { successfulRoles, failedRoles };
    }
    async validateRoleCoordinationPermission(_userId, _roleId, _coordinationContext) {
        return true;
    }
    async getRoleCoordinationContext(_contextId, _roleType) {
        return {
            contextId: _contextId,
            roleType: _roleType,
            coordinationMode: 'role_coordination',
            timestamp: new Date().toISOString(),
            coordinationLevel: 'enterprise_rbac'
        };
    }
    async recordRoleCoordinationMetrics(_roleId, _metrics) {
    }
    async manageRoleExtensionCoordination(_roleId, _extensions) {
        return true;
    }
    async requestRoleChangeCoordination(_roleId, _change) {
        return true;
    }
    async coordinateCollabRoleManagement(_collabId, _roleConfig) {
        return true;
    }
    async enableDialogDrivenRoleCoordination(_dialogId, _roleParticipants) {
        return true;
    }
    async coordinateRoleAcrossNetwork(_networkId, _roleConfig) {
        return true;
    }
    async getUserPermissions(_userId) {
        const permissions = [];
        const basicPermissions = [
            {
                permissionId: (0, crypto_1.randomUUID)(),
                resourceType: 'context',
                resourceId: '*',
                actions: ['read'],
                grantType: 'direct',
                conditions: {
                    timeBased: {
                        startTime: new Date(),
                        endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    }
                },
                expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            {
                permissionId: (0, crypto_1.randomUUID)(),
                resourceType: 'plan',
                resourceId: '*',
                actions: ['read'],
                grantType: 'direct',
                conditions: {
                    timeBased: {
                        startTime: new Date(),
                        endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    }
                },
                expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
        ];
        permissions.push(...basicPermissions);
        return this.deduplicatePermissions(permissions);
    }
    async getRolePermissions(roleId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            return [];
        }
        return role.permissions || [];
    }
    deduplicatePermissions(permissions) {
        const seen = new Set();
        return permissions.filter(permission => {
            const actions = permission.actions.join(',');
            const key = `${permission.resourceType}:${permission.resourceId}:${actions}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    validateRoleData(data) {
        return !!(data.name && data.roleType && data.contextId);
    }
}
exports.RoleManagementService = RoleManagementService;
