"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
class RoleController {
    roleService;
    constructor(roleService) {
        this.roleService = roleService;
    }
    async createRole(req, res) {
        try {
            const createRequest = req.body;
            const role = await this.roleService.createRole(createRequest);
            res.status(201).json({
                success: true,
                data: role,
                message: 'Role created successfully',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && (error.message.includes('validation') ||
                error.message.includes('required') ||
                error.message.includes('invalid')) ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async getRoleById(req, res) {
        try {
            const roleId = req.params.roleId;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(roleId)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid role ID format',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const role = await this.roleService.getRoleById(roleId);
            if (!role) {
                res.status(404).json({
                    success: false,
                    error: 'Role not found',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: role,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && (error.message.includes('Invalid UUID') ||
                error.message.includes('invalid') ||
                error.message.includes('validation')) ? 400 : 500;
            res.status(statusCode).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async getRole(roleId) {
        try {
            const role = await this.roleService.getRoleById(roleId);
            if (!role) {
                return {
                    success: false,
                    error: 'Role not found',
                    timestamp: new Date().toISOString()
                };
            }
            return {
                success: true,
                data: role,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
    async getRoleByName(name) {
        try {
            const role = await this.roleService.getRoleByName(name);
            if (!role) {
                return {
                    success: false,
                    error: 'Role not found',
                    timestamp: new Date().toISOString()
                };
            }
            return {
                success: true,
                data: role,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
    async updateRole(req, res) {
        try {
            const roleId = req.params.roleId;
            const updateRequest = req.body;
            const role = await this.roleService.updateRole(roleId, updateRequest);
            res.status(200).json({
                success: true,
                data: role,
                message: 'Role updated successfully',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async deleteRole(req, res) {
        try {
            const roleId = req.params.roleId;
            const result = await this.roleService.deleteRole(roleId);
            res.status(200).json({
                success: true,
                message: 'Role deleted successfully',
                deleted: result,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async getAllRoles(req, res) {
        try {
            const pagination = req.query.page ? {
                page: parseInt(req.query.page, 10),
                limit: parseInt(req.query.limit, 10) || 10
            } : undefined;
            const filter = req.query.filter ? JSON.parse(req.query.filter) : undefined;
            const sort = req.query.sort ? JSON.parse(req.query.sort) : undefined;
            const roles = await this.roleService.getAllRoles(pagination, filter, sort);
            res.status(200).json({
                success: true,
                data: roles,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async getRolesByContext(req, res) {
        try {
            const contextId = req.params.contextId;
            const pagination = req.query.page ? {
                page: parseInt(req.query.page, 10),
                limit: parseInt(req.query.limit, 10) || 10
            } : undefined;
            const roles = await this.roleService.getRolesByContextId(contextId, pagination);
            const responseData = pagination ? roles : roles.items;
            res.status(200).json({
                success: true,
                data: responseData,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async getRolesByContextId(contextId, pagination) {
        try {
            const roles = await this.roleService.getRolesByContextId(contextId, pagination);
            return {
                success: true,
                data: roles,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
    async getRolesByType(req, res) {
        try {
            const roleType = req.params.roleType;
            const pagination = req.query.page ? {
                page: parseInt(req.query.page, 10),
                limit: parseInt(req.query.limit, 10) || 10
            } : undefined;
            const roles = await this.roleService.getRolesByType(roleType, pagination);
            res.status(200).json({
                success: true,
                data: roles,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async searchRoles(req, res) {
        try {
            const searchTerm = (req.query.q || req.query.query);
            if (!searchTerm) {
                res.status(400).json({
                    success: false,
                    error: 'Search term is required',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const pagination = req.query.page ? {
                page: parseInt(req.query.page, 10),
                limit: parseInt(req.query.limit, 10) || 10
            } : undefined;
            const roles = await this.roleService.searchRoles(searchTerm, pagination);
            const responseData = {
                roles: roles.items,
                total: roles.total,
                page: roles.page,
                limit: roles.limit
            };
            res.status(200).json({
                success: true,
                data: responseData,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async checkPermission(req, res) {
        try {
            const roleId = req.params.roleId;
            const { resourceType, resourceId, action } = req.body;
            const hasPermission = await this.roleService.checkPermission(roleId, resourceType, resourceId, action);
            res.status(200).json({
                success: true,
                data: {
                    hasPermission,
                    resourceType,
                    resourceId,
                    action
                },
                message: hasPermission ? 'Permission granted' : 'Permission denied',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async addPermission(roleId, permission) {
        try {
            const role = await this.roleService.addPermission(roleId, permission);
            return {
                success: true,
                data: role,
                message: 'Permission added successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
    async removePermission(roleId, permissionId) {
        try {
            const role = await this.roleService.removePermission(roleId, permissionId);
            return {
                success: true,
                data: role,
                message: 'Permission removed successfully',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
    async activateRole(req, res) {
        try {
            const roleId = req.params.roleId;
            const role = await this.roleService.activateRole(roleId);
            res.status(200).json({
                success: true,
                data: role,
                message: 'Role activated successfully',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async deactivateRole(req, res) {
        try {
            const roleId = req.params.roleId;
            const role = await this.roleService.deactivateRole(roleId);
            res.status(200).json({
                success: true,
                data: role,
                message: 'Role deactivated successfully',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async getStatistics(_req, res) {
        try {
            const statistics = await this.roleService.getRoleStatistics();
            const responseData = {
                totalRoles: statistics.totalRoles,
                activeRoles: statistics.activeRoles,
                inactiveRoles: statistics.inactiveRoles,
                rolesByType: statistics.rolesByType,
                averagePermissionsPerRole: statistics.totalPermissions / statistics.totalRoles || 0
            };
            res.status(200).json({
                success: true,
                data: responseData,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
    async getRoleStatistics() {
        try {
            const statistics = await this.roleService.getRoleStatistics();
            return {
                success: true,
                data: statistics,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
    async getComplexityDistribution() {
        try {
            const distribution = await this.roleService.getComplexityDistribution();
            return {
                success: true,
                data: distribution,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
    async bulkCreateRoles(req, res) {
        try {
            const requestBody = req.body;
            const requests = Array.isArray(requestBody) ? requestBody : requestBody.roles;
            if (!requests || !Array.isArray(requests)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid request format. Expected array of roles or {roles: [...]}',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const result = await this.roleService.bulkCreateRoles(requests);
            const responseData = {
                successful: result.successfulRoles,
                failed: result.failedRoles.map((failed, index) => ({
                    index,
                    error: failed.error,
                    request: failed.request
                })),
                summary: {
                    total: requests.length,
                    successful: result.successfulRoles.length,
                    failed: result.failedRoles.length
                }
            };
            res.status(201).json({
                success: true,
                data: responseData,
                message: `Bulk operation completed: ${responseData.summary.successful} successful, ${responseData.summary.failed} failed`,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    }
}
exports.RoleController = RoleController;
