"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSecurityService = exports.ContextSecurityService = exports.UnifiedSecurityAPI = void 0;
class UnifiedSecurityAPI {
    roleSecurityService;
    constructor(roleSecurityService) {
        this.roleSecurityService = roleSecurityService;
    }
    async hasPermission(userId, resource, action, context) {
        return await this.roleSecurityService.validatePermission(userId, resource, action, context);
    }
    async hasMultiplePermissions(userId, permissions) {
        return await this.roleSecurityService.validateMultiplePermissions(userId, permissions);
    }
    async validateToken(tokenString) {
        return await this.roleSecurityService.validateSecurityToken(tokenString);
    }
    async reportSecurityEvent(event) {
        await this.roleSecurityService.handleSecurityEvent(event);
    }
    async validateContextAccess(userId, contextId, action, context) {
        return await this.hasPermission(userId, `context:${contextId}`, action, context);
    }
    async validatePlanAccess(userId, planId, action, context) {
        return await this.hasPermission(userId, `plan:${planId}`, action, context);
    }
    async validateConfirmAccess(userId, confirmId, action, context) {
        return await this.hasPermission(userId, `confirm:${confirmId}`, action, context);
    }
    async validateTraceAccess(userId, traceId, action, context) {
        return await this.hasPermission(userId, `trace:${traceId}`, action, context);
    }
    async validateExtensionAccess(userId, extensionId, action, context) {
        return await this.hasPermission(userId, `extension:${extensionId}`, action, context);
    }
    async validateDialogAccess(userId, dialogId, action, context) {
        return await this.hasPermission(userId, `dialog:${dialogId}`, action, context);
    }
    async validateCollabAccess(userId, collabId, action, context) {
        return await this.hasPermission(userId, `collab:${collabId}`, action, context);
    }
    async validateNetworkAccess(userId, networkId, action, context) {
        return await this.hasPermission(userId, `network:${networkId}`, action, context);
    }
    async validateCoreAccess(userId, coreResource, action, context) {
        return await this.hasPermission(userId, `core:${coreResource}`, action, context);
    }
    async validateResourceAccess(userId, resourceType, resourceId, action, context) {
        return await this.hasPermission(userId, `${resourceType}:${resourceId}`, action, context);
    }
    async validateSystemPermission(userId, systemAction, context) {
        return await this.hasPermission(userId, 'system', systemAction, context);
    }
    async validateAdminPermission(userId, adminAction, context) {
        return await this.hasPermission(userId, 'admin', adminAction, context);
    }
}
exports.UnifiedSecurityAPI = UnifiedSecurityAPI;
class ContextSecurityService {
    unifiedSecurityAPI;
    constructor(unifiedSecurityAPI) {
        this.unifiedSecurityAPI = unifiedSecurityAPI;
    }
    async validateContextAccess(userId, contextId, action) {
        return await this.unifiedSecurityAPI.validateContextAccess(userId, contextId, action);
    }
}
exports.ContextSecurityService = ContextSecurityService;
class PlanSecurityService {
    unifiedSecurityAPI;
    constructor(unifiedSecurityAPI) {
        this.unifiedSecurityAPI = unifiedSecurityAPI;
    }
    async validatePlanAccess(userId, planId, action) {
        return await this.unifiedSecurityAPI.validatePlanAccess(userId, planId, action);
    }
}
exports.PlanSecurityService = PlanSecurityService;
