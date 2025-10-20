"use strict";
/**
 * Role控制器
 *
 * @description Role模块的API控制器，处理HTTP请求和响应 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer API层 - 控制器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
/**
 * Role控制器
 *
 * @description 提供Role模块的REST API接口，企业级RBAC安全中心
 */
class RoleController {
    constructor(roleService) {
        this.roleService = roleService;
    }
    /**
     * 创建角色
     * POST /roles
     */
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
    /**
     * 获取角色
     * GET /roles/:roleId
     */
    async getRoleById(req, res) {
        try {
            const roleId = req.params.roleId;
            // 验证UUID格式
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
    /**
     * 获取角色（旧方法，保持向后兼容）
     * GET /roles/:roleId
     */
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
    /**
     * 根据名称获取角色
     * GET /roles/by-name/:name
     */
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
    /**
     * 更新角色
     * PUT /roles/:roleId
     */
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
    /**
     * 删除角色
     * DELETE /roles/:roleId
     */
    async deleteRole(req, res) {
        try {
            const roleId = req.params.roleId;
            const result = await this.roleService.deleteRole(roleId);
            res.status(200).json({
                success: true,
                message: 'Role deleted successfully',
                deleted: result, // 使用result变量显示删除结果
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
    /**
     * 获取所有角色
     * GET /roles
     */
    async getAllRoles(req, res) {
        try {
            // 从查询参数中解析分页、过滤和排序选项
            const pagination = req.query.page ? {
                page: parseInt(req.query.page, 10),
                limit: parseInt(req.query.limit, 10) || 10
            } : undefined;
            const filter = req.query.filter ? JSON.parse(req.query.filter) : undefined;
            const sort = req.query.sort ? JSON.parse(req.query.sort) : undefined;
            const roles = await this.roleService.getAllRoles(pagination, filter, sort);
            // 返回完整的PaginatedResult格式
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
    /**
     * 根据上下文获取角色
     * GET /roles/by-context/:contextId
     */
    async getRolesByContext(req, res) {
        try {
            const contextId = req.params.contextId;
            const pagination = req.query.page ? {
                page: parseInt(req.query.page, 10),
                limit: parseInt(req.query.limit, 10) || 10
            } : undefined;
            const roles = await this.roleService.getRolesByContextId(contextId, pagination);
            // 如果没有分页参数，返回数组格式以匹配测试期望
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
    /**
     * 根据上下文ID获取角色（旧方法，保持向后兼容）
     * GET /roles/by-context/:contextId
     */
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
    /**
     * 根据角色类型获取角色
     * GET /roles/by-type/:roleType
     */
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
    /**
     * 搜索角色
     * GET /roles/search
     */
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
            // 搜索结果总是返回分页格式
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
    /**
     * 检查角色权限
     * POST /roles/:roleId/check-permission
     */
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
    /**
     * 添加权限到角色
     * POST /roles/:roleId/permissions
     */
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
    /**
     * 从角色移除权限
     * DELETE /roles/:roleId/permissions/:permissionId
     */
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
    /**
     * 激活角色
     * POST /roles/:roleId/activate
     */
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
    /**
     * 停用角色
     * POST /roles/:roleId/deactivate
     */
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
    /**
     * 获取统计信息
     * GET /roles/statistics
     */
    async getStatistics(_req, res) {
        try {
            const statistics = await this.roleService.getRoleStatistics();
            // 转换响应格式以匹配测试期望
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
    /**
     * 获取角色统计信息（旧方法，保持向后兼容）
     * GET /roles/statistics
     */
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
    /**
     * 获取角色复杂度分布
     * GET /roles/complexity-distribution
     */
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
    /**
     * 批量创建角色
     * POST /roles/bulk
     */
    async bulkCreateRoles(req, res) {
        try {
            // 支持两种格式：直接数组或 {roles: [...]} 对象
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
            // 转换为测试期望的格式
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
//# sourceMappingURL=role.controller.js.map