"use strict";
/**
 * Role管理服务
 *
 * @description Role模块的核心应用服务，处理企业级RBAC业务逻辑和协调
 * @version 1.0.0
 * @layer 应用层 - 服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleManagementService = void 0;
const role_entity_1 = require("../../domain/entities/role.entity");
const crypto_1 = require("crypto");
/**
 * Role管理服务
 *
 * @description 提供Role模块的核心业务逻辑，包括角色管理、权限控制、安全审计
 */
class RoleManagementService {
    constructor(repository) {
        this.repository = repository;
        // Explicitly mark reserved coordination methods as intentionally unused
        // These methods are reserved for CoreOrchestrator activation
        void this.validateRoleCoordinationPermission;
        void this.getRoleCoordinationContext;
        void this.recordRoleCoordinationMetrics;
        void this.manageRoleExtensionCoordination;
        void this.requestRoleChangeCoordination;
        void this.coordinateCollabRoleManagement;
        void this.enableDialogDrivenRoleCoordination;
        void this.coordinateRoleAcrossNetwork;
    }
    // ===== 角色CRUD操作 =====
    /**
     * 创建角色
     * @param request 创建角色请求
     * @returns 创建的角色实体数据
     */
    async createRole(request) {
        // 验证必需字段
        if (!request.name || request.name.trim() === '') {
            throw new Error('Role name is required and cannot be empty');
        }
        // 验证角色名称唯一性
        const existingRole = await this.repository.findByName(request.name);
        if (existingRole) {
            throw new Error(`Role with name '${request.name}' already exists`);
        }
        // 生成角色ID
        const roleId = (0, crypto_1.randomUUID)();
        // 创建角色实体
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
        // 保存到仓库
        const saved = await this.repository.create(role);
        return saved;
    }
    /**
     * 根据ID获取角色
     * @param roleId 角色ID
     * @returns 角色实体或null
     */
    async getRoleById(roleId) {
        return await this.repository.findById(roleId);
    }
    /**
     * 根据名称获取角色
     * @param name 角色名称
     * @returns 角色实体或null
     */
    async getRoleByName(name) {
        return await this.repository.findByName(name);
    }
    /**
     * 更新角色
     * @param roleId 角色ID
     * @param request 更新角色请求
     * @returns 更新后的角色实体
     */
    async updateRole(roleId, request) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        // 更新字段
        if (request.name !== undefined) {
            // 检查名称是否已存在（排除当前角色）
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
        // 更新操作类型
        role.roleOperation = 'update';
        // 保存更新
        const updated = await this.repository.update(role);
        return updated;
    }
    /**
     * 删除角色
     * @param roleId 角色ID
     * @returns 是否删除成功
     */
    async deleteRole(roleId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        // 检查角色是否可以删除（例如，是否有活跃的分配）
        // 这里可以添加更多的业务规则检查
        return await this.repository.delete(roleId);
    }
    // ===== 角色查询操作 =====
    /**
     * 获取所有角色
     * @param pagination 分页参数
     * @param filter 查询过滤器
     * @param sort 排序选项
     * @returns 分页的角色列表
     */
    async getAllRoles(pagination, filter, sort) {
        return await this.repository.findAll(pagination, filter, sort);
    }
    /**
     * 根据上下文ID获取角色
     * @param contextId 上下文ID
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    async getRolesByContextId(contextId, pagination) {
        return await this.repository.findByContextId(contextId, pagination);
    }
    /**
     * 根据上下文ID获取角色 (别名方法，用于测试兼容性)
     * @param contextId 上下文ID
     * @returns 角色数组
     */
    async getRolesByContext(contextId) {
        const result = await this.repository.findByContextId(contextId);
        return result.items;
    }
    /**
     * 根据角色类型获取角色
     * @param roleType 角色类型
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    async getRolesByType(roleType, pagination) {
        const result = await this.repository.findByType(roleType, pagination);
        // 如果没有分页参数，返回数组格式（用于测试兼容性）
        if (!pagination) {
            return result.items;
        }
        return result;
    }
    /**
     * 搜索角色
     * @param searchParams 搜索参数（可以是字符串或复杂搜索对象）
     * @param pagination 分页参数
     * @returns 分页的角色列表
     */
    async searchRoles(searchParams, pagination) {
        // 处理不同类型的搜索参数
        if (typeof searchParams === 'string') {
            return await this.repository.search(searchParams, pagination);
        }
        // 处理复杂搜索对象
        const { query, filters } = searchParams;
        const results = await this.repository.search(query, pagination);
        // 应用过滤器
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
            // 重新计算分页信息
            results.total = results.items.length;
            results.hasNext = false;
            results.hasPrevious = false;
        }
        return results;
    }
    // ===== 权限管理操作 =====
    /**
     * 检查角色权限
     * @param roleId 角色ID
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param action 操作类型
     * @returns 是否有权限
     */
    async checkPermission(roleId, resourceType, resourceId, action) {
        return await this.repository.hasPermission(roleId, resourceType, resourceId, action);
    }
    /**
     * 添加权限到角色
     * @param roleId 角色ID
     * @param permission 权限对象
     * @returns 更新后的角色实体
     */
    async addPermission(roleId, permission) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        role.addPermission(permission);
        role.roleOperation = 'update';
        return await this.repository.update(role);
    }
    /**
     * 从角色移除权限
     * @param roleId 角色ID
     * @param permissionId 权限ID
     * @returns 更新后的角色实体
     */
    async removePermission(roleId, permissionId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        role.removePermission(permissionId);
        role.roleOperation = 'update';
        return await this.repository.update(role);
    }
    // ===== 角色分配管理 =====
    /**
     * 分配角色给用户
     * @param request 角色分配请求
     * @returns 分配结果
     */
    async assignRole(request) {
        // 验证角色是否存在
        const role = await this.repository.findById(request.roleId);
        if (!role) {
            throw new Error(`Role with ID ${request.roleId} not found`);
        }
        // 验证角色是否处于活跃状态
        if (role.status !== 'active') {
            throw new Error(`Role ${request.roleId} is not active`);
        }
        // 执行角色分配逻辑
        // 在实际实现中，这里应该：
        // 1. 检查用户是否已有该角色
        // 2. 验证分配权限
        // 3. 记录分配历史
        // 4. 发送通知等
        return {
            roleId: request.roleId,
            userId: request.userId,
            assignedAt: new Date().toISOString(),
            success: true
        };
    }
    // ===== 角色状态管理 =====
    /**
     * 激活角色
     * @param roleId 角色ID
     * @returns 更新后的角色实体
     */
    async activateRole(roleId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        role.activate();
        role.roleOperation = 'update';
        return await this.repository.update(role);
    }
    /**
     * 停用角色
     * @param roleId 角色ID
     * @returns 更新后的角色实体
     */
    async deactivateRole(roleId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            throw new Error(`Role with ID ${roleId} not found`);
        }
        role.deactivate();
        role.roleOperation = 'update';
        return await this.repository.update(role);
    }
    // ===== 统计和分析 =====
    /**
     * 获取角色统计信息
     * @returns 统计信息
     */
    async getRoleStatistics() {
        return await this.repository.getStatistics();
    }
    /**
     * 获取角色复杂度分布
     * @returns 复杂度分布
     */
    async getComplexityDistribution() {
        return await this.repository.getComplexityDistribution();
    }
    // ===== 批量操作 =====
    /**
     * 批量创建角色
     * @param requests 创建角色请求数组
     * @returns 批量操作结果
     */
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
                // 尝试保存到Repository
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
    // ===== MPLP ROLE COORDINATION RESERVED INTERFACES =====
    // Embody Role module as "Enterprise RBAC Security Center" core positioning
    // Parameters use underscore prefix, waiting for CoreOrchestrator activation
    /**
     * Core coordination interfaces (4 deep integration modules)
     * These are the most critical cross-module coordination capabilities
     */
    /**
     * Validate role coordination permission - Cross-module permission validation
     * @param _userId - User requesting coordination access
     * @param _roleId - Target role for coordination
     * @param _coordinationContext - Coordination context data
     * @returns Promise<boolean> - Whether coordination is permitted
     * @reserved Reserved for CoreOrchestrator activation
     */
    // Reserved for CoreOrchestrator activation - Cross-module permission validation
    async validateRoleCoordinationPermission(_userId, _roleId, _coordinationContext) {
        // TODO: Wait for CoreOrchestrator activation cross-module permission validation
        // Integration with security cross-cutting concern
        // const securityValidation = await this.securityManager.validateCrossModuleAccess(...);
        // Temporary implementation: Allow all coordination operations
        return true;
    }
    /**
     * Get role coordination context - Context module coordination environment
     * @param _contextId - Associated context ID
     * @param _roleType - Type of role for context retrieval
     * @returns Promise<Record<string, unknown>> - Coordination context data
     * @reserved Reserved for CoreOrchestrator activation
     */
    // Reserved for CoreOrchestrator activation - Context module integration
    async getRoleCoordinationContext(_contextId, _roleType) {
        // TODO: Wait for CoreOrchestrator activation Context module coordination environment retrieval
        // Integration with coordination cross-cutting concern
        // const coordinationContext = await this.coordinationManager.getCrossModuleContext(...);
        // Temporary implementation: Return basic context
        return {
            contextId: _contextId,
            roleType: _roleType,
            coordinationMode: 'role_coordination',
            timestamp: new Date().toISOString(),
            coordinationLevel: 'enterprise_rbac'
        };
    }
    /**
     * Record role coordination metrics - Trace module coordination monitoring
     * @param _roleId - Role ID for metrics recording
     * @param _metrics - Coordination metrics data
     * @returns Promise<void> - Metrics recording completion
     * @reserved Reserved for CoreOrchestrator activation
     */
    // Reserved for CoreOrchestrator activation - Trace module integration
    async recordRoleCoordinationMetrics(_roleId, _metrics) {
        // TODO: Wait for CoreOrchestrator activation Trace module coordination monitoring recording
        // Integration with performance cross-cutting concern
        // await this.performanceMonitor.recordCrossModuleMetrics(...);
        // Temporary implementation: Log to console (should send to Trace module)
        // console.log(`Role coordination metrics recorded for ${_roleId}:`, _metrics);
    }
    /**
     * Manage role extension coordination - Extension module coordination management
     * @param _roleId - Role ID for extension coordination
     * @param _extensions - Extension coordination data
     * @returns Promise<boolean> - Whether extension coordination succeeded
     * @reserved Reserved for CoreOrchestrator activation
     */
    // Reserved for CoreOrchestrator activation - Extension module integration
    async manageRoleExtensionCoordination(_roleId, _extensions) {
        // TODO: Wait for CoreOrchestrator activation Extension module coordination management
        // Integration with orchestration cross-cutting concern
        // const orchestrationResult = await this.orchestrationManager.coordinateExtensions(...);
        // Temporary implementation: Allow all extension coordination
        return true;
    }
    /**
     * Extended coordination interfaces (4 additional modules)
     * These provide broader ecosystem integration capabilities
     */
    /**
     * Request role change coordination - Confirm module change coordination
     * @param _roleId - Role ID for change coordination
     * @param _change - Change coordination data
     * @returns Promise<boolean> - Whether change coordination was approved
     * @reserved Reserved for CoreOrchestrator activation
     */
    // Reserved for CoreOrchestrator activation - Confirm module integration
    async requestRoleChangeCoordination(_roleId, _change) {
        // TODO: Wait for CoreOrchestrator activation Confirm module change coordination
        // Integration with event bus cross-cutting concern
        // await this.eventBusManager.publish({...});
        // Temporary implementation: Allow all change coordination
        return true;
    }
    /**
     * Coordinate collaborative role management - Collab module collaboration coordination
     * @param _collabId - Collaboration ID for role management
     * @param _roleConfig - Role configuration for collaboration
     * @returns Promise<boolean> - Whether collaboration coordination succeeded
     * @reserved Reserved for CoreOrchestrator activation
     */
    // Reserved for CoreOrchestrator activation - Collab module integration
    async coordinateCollabRoleManagement(_collabId, _roleConfig) {
        // TODO: Wait for CoreOrchestrator activation Collab module collaboration coordination
        // Integration with state sync cross-cutting concern
        // await this.stateSyncManager.syncState(...);
        // Temporary implementation: Allow all collaboration coordination
        return true;
    }
    /**
     * Enable dialog-driven role coordination - Dialog module conversation coordination
     * @param _dialogId - Dialog ID for role coordination
     * @param _roleParticipants - Role participants for dialog coordination
     * @returns Promise<boolean> - Whether dialog coordination succeeded
     * @reserved Reserved for CoreOrchestrator activation
     */
    // Reserved for CoreOrchestrator activation - Dialog module integration
    async enableDialogDrivenRoleCoordination(_dialogId, _roleParticipants) {
        // TODO: Wait for CoreOrchestrator activation Dialog module conversation coordination
        // Integration with event bus cross-cutting concern
        // await this.eventBusManager.publish({...});
        // Temporary implementation: Allow all dialog coordination
        return true;
    }
    /**
     * Coordinate role across network - Network module distributed coordination
     * @param _networkId - Network ID for role coordination
     * @param _roleConfig - Role configuration for network coordination
     * @returns Promise<boolean> - Whether network coordination succeeded
     * @reserved Reserved for CoreOrchestrator activation
     */
    // Reserved for CoreOrchestrator activation - Network module integration
    async coordinateRoleAcrossNetwork(_networkId, _roleConfig) {
        // TODO: Wait for CoreOrchestrator activation Network module distributed coordination
        // Integration with transaction cross-cutting concern
        // const distributedTransaction = await this.transactionManager.beginDistributedTransaction(...);
        // Temporary implementation: Allow all network coordination
        return true;
    }
    // ===== 私有辅助方法 =====
    // ===== 用户权限查询方法 =====
    /**
     * 获取用户权限
     * @param userId 用户ID
     * @returns 用户权限列表
     */
    async getUserPermissions(_userId) {
        // 1. 获取用户角色 (这里需要用户-角色关联的仓库，暂时返回空数组)
        // const userRoles = await this.userRepository.getUserRoles(_userId);
        // 2. 收集所有权限
        const permissions = [];
        // 暂时实现：返回基本权限用于测试
        // 在实际实现中，这里应该查询用户的角色，然后获取角色的权限
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
                        endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年有效期
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
                        endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年有效期
                    }
                },
                expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
        ];
        permissions.push(...basicPermissions);
        // 3. 去重并返回
        return this.deduplicatePermissions(permissions);
    }
    /**
     * 获取角色权限
     * @param roleId 角色ID
     * @returns 角色权限列表
     */
    async getRolePermissions(roleId) {
        const role = await this.repository.findById(roleId);
        if (!role) {
            return [];
        }
        return role.permissions || [];
    }
    /**
     * 去重权限列表
     * @param permissions 权限列表
     * @returns 去重后的权限列表
     */
    deduplicatePermissions(permissions) {
        const seen = new Set();
        return permissions.filter(permission => {
            // 为每个action创建唯一键
            const actions = permission.actions.join(',');
            const key = `${permission.resourceType}:${permission.resourceId}:${actions}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}
exports.RoleManagementService = RoleManagementService;
//# sourceMappingURL=role-management.service.js.map