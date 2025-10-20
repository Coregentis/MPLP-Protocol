"use strict";
/**
 * Role领域实体
 *
 * @description Role模块的核心领域实体，基于实际Schema定义 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 领域层 - 实体
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleEntity = void 0;
/**
 * Role领域实体
 *
 * @description 企业级RBAC安全中心的核心领域实体，包含完整的角色管理、权限控制和安全审计功能
 */
class RoleEntity {
    /**
     * 构造函数
     * @param data 角色实体数据
     */
    constructor(data) {
        // 基础协议字段
        this.protocolVersion = data.protocolVersion;
        this.timestamp = data.timestamp;
        this.roleId = data.roleId;
        this.contextId = data.contextId;
        // 角色核心字段
        this.name = data.name;
        this.displayName = data.displayName;
        this.description = data.description;
        this.roleType = data.roleType;
        this.status = data.status;
        // 可选字段
        this.scope = data.scope;
        this.permissions = data.permissions;
        this.inheritance = data.inheritance;
        this.delegation = data.delegation;
        this.attributes = data.attributes;
        this.validationRules = data.validationRules;
        this.auditSettings = data.auditSettings;
        this.agents = data.agents;
        this.agentManagement = data.agentManagement;
        this.teamConfiguration = data.teamConfiguration;
        // 必需字段
        this.performanceMetrics = data.performanceMetrics;
        this.monitoringIntegration = data.monitoringIntegration;
        this.versionHistory = data.versionHistory;
        this.searchMetadata = data.searchMetadata;
        this.roleOperation = data.roleOperation;
        this.eventIntegration = data.eventIntegration;
        this.auditTrail = data.auditTrail;
        // 验证实体有效性
        this.validate();
    }
    /**
     * 验证角色实体的有效性
     * @throws Error 如果实体无效
     */
    validate() {
        if (!this.roleId || !this.contextId) {
            throw new Error('Role ID and Context ID are required');
        }
        if (!this.name || this.name.trim().length === 0) {
            throw new Error('Role name is required');
        }
        if (!this.roleType || !this.status) {
            throw new Error('Role type and status are required');
        }
        if (!Array.isArray(this.permissions)) {
            throw new Error('Permissions must be an array');
        }
    }
    /**
     * 检查角色是否有特定权限
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param action 操作类型
     * @returns 是否有权限
     */
    hasPermission(resourceType, resourceId, action) {
        return this.permissions.some(permission => (permission.resourceType === resourceType || permission.resourceType === 'system') &&
            (permission.resourceId === resourceId || permission.resourceId === '*') &&
            permission.actions.includes(action));
    }
    /**
     * 添加权限
     * @param permission 权限对象
     */
    addPermission(permission) {
        // 检查权限是否已存在
        const exists = this.permissions.some(p => p.permissionId === permission.permissionId);
        if (!exists) {
            this.permissions.push(permission);
        }
    }
    /**
     * 移除权限
     * @param permissionId 权限ID
     */
    removePermission(permissionId) {
        this.permissions = this.permissions.filter(p => p.permissionId !== permissionId);
    }
    /**
     * 检查角色是否处于活跃状态
     * @returns 是否活跃
     */
    isActive() {
        return this.status === 'active';
    }
    /**
     * 激活角色
     */
    activate() {
        this.status = 'active';
    }
    /**
     * 停用角色
     */
    deactivate() {
        this.status = 'inactive';
    }
    /**
     * 获取角色的安全级别
     * @returns 安全级别
     */
    getSecurityClearance() {
        return this.attributes?.securityClearance;
    }
    /**
     * 检查角色是否可以委托权限
     * @returns 是否可以委托
     */
    canDelegate() {
        return this.delegation?.canDelegate ?? false;
    }
    /**
     * 获取角色的复杂度评分
     * @returns 复杂度评分 (0-100)
     */
    getComplexityScore() {
        let score = 0;
        // 基于权限数量
        score += Math.min(this.permissions.length * 2, 30);
        // 基于继承关系
        if (this.inheritance?.parentRoles?.length) {
            score += this.inheritance.parentRoles.length * 5;
        }
        // 基于委托关系
        if (this.delegation?.activeDelegations?.length) {
            score += this.delegation.activeDelegations.length * 3;
        }
        // 基于Agent数量
        if (this.agents?.length) {
            score += Math.min(this.agents.length * 2, 20);
        }
        // 基于验证规则
        if (this.validationRules?.assignmentRules?.length) {
            score += this.validationRules.assignmentRules.length * 2;
        }
        return Math.min(score, 100);
    }
    /**
     * 转换为简单对象
     * @returns 简单对象表示
     */
    toPlainObject() {
        return {
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp,
            roleId: this.roleId,
            contextId: this.contextId,
            name: this.name,
            displayName: this.displayName,
            description: this.description,
            roleType: this.roleType,
            status: this.status,
            scope: this.scope,
            permissions: this.permissions,
            inheritance: this.inheritance,
            delegation: this.delegation,
            attributes: this.attributes,
            validationRules: this.validationRules,
            auditSettings: this.auditSettings,
            agents: this.agents,
            agentManagement: this.agentManagement,
            teamConfiguration: this.teamConfiguration,
            performanceMetrics: this.performanceMetrics,
            monitoringIntegration: this.monitoringIntegration,
            versionHistory: this.versionHistory,
            searchMetadata: this.searchMetadata,
            roleOperation: this.roleOperation,
            eventIntegration: this.eventIntegration,
            auditTrail: this.auditTrail
        };
    }
}
exports.RoleEntity = RoleEntity;
//# sourceMappingURL=role.entity.js.map