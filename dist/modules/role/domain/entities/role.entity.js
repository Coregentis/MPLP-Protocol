"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleEntity = void 0;
class RoleEntity {
    protocolVersion;
    timestamp;
    roleId;
    contextId;
    name;
    displayName;
    description;
    roleType;
    status;
    scope;
    permissions;
    inheritance;
    delegation;
    attributes;
    validationRules;
    auditSettings;
    agents;
    agentManagement;
    teamConfiguration;
    performanceMetrics;
    monitoringIntegration;
    versionHistory;
    searchMetadata;
    roleOperation;
    eventIntegration;
    auditTrail;
    constructor(data) {
        this.protocolVersion = data.protocolVersion;
        this.timestamp = data.timestamp;
        this.roleId = data.roleId;
        this.contextId = data.contextId;
        this.name = data.name;
        this.displayName = data.displayName;
        this.description = data.description;
        this.roleType = data.roleType;
        this.status = data.status;
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
        this.performanceMetrics = data.performanceMetrics;
        this.monitoringIntegration = data.monitoringIntegration;
        this.versionHistory = data.versionHistory;
        this.searchMetadata = data.searchMetadata;
        this.roleOperation = data.roleOperation;
        this.eventIntegration = data.eventIntegration;
        this.auditTrail = data.auditTrail;
        this.validate();
    }
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
    hasPermission(resourceType, resourceId, action) {
        return this.permissions.some(permission => (permission.resourceType === resourceType || permission.resourceType === 'system') &&
            (permission.resourceId === resourceId || permission.resourceId === '*') &&
            permission.actions.includes(action));
    }
    addPermission(permission) {
        const exists = this.permissions.some(p => p.permissionId === permission.permissionId);
        if (!exists) {
            this.permissions.push(permission);
        }
    }
    removePermission(permissionId) {
        this.permissions = this.permissions.filter(p => p.permissionId !== permissionId);
    }
    isActive() {
        return this.status === 'active';
    }
    activate() {
        this.status = 'active';
    }
    deactivate() {
        this.status = 'inactive';
    }
    getSecurityClearance() {
        return this.attributes?.securityClearance;
    }
    canDelegate() {
        return this.delegation?.canDelegate ?? false;
    }
    getComplexityScore() {
        let score = 0;
        score += Math.min(this.permissions.length * 2, 30);
        if (this.inheritance?.parentRoles?.length) {
            score += this.inheritance.parentRoles.length * 5;
        }
        if (this.delegation?.activeDelegations?.length) {
            score += this.delegation.activeDelegations.length * 3;
        }
        if (this.agents?.length) {
            score += Math.min(this.agents.length * 2, 20);
        }
        if (this.validationRules?.assignmentRules?.length) {
            score += this.validationRules.assignmentRules.length * 2;
        }
        return Math.min(score, 100);
    }
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
