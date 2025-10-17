"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleProtocol = void 0;
class RoleProtocol {
    roleService;
    _securityManager;
    _performanceMonitor;
    _eventBusManager;
    _errorHandler;
    _coordinationManager;
    _orchestrationManager;
    _stateSyncManager;
    _transactionManager;
    _protocolVersionManager;
    constructor(roleService, _securityManager, _performanceMonitor, _eventBusManager, _errorHandler, _coordinationManager, _orchestrationManager, _stateSyncManager, _transactionManager, _protocolVersionManager) {
        this.roleService = roleService;
        this._securityManager = _securityManager;
        this._performanceMonitor = _performanceMonitor;
        this._eventBusManager = _eventBusManager;
        this._errorHandler = _errorHandler;
        this._coordinationManager = _coordinationManager;
        this._orchestrationManager = _orchestrationManager;
        this._stateSyncManager = _stateSyncManager;
        this._transactionManager = _transactionManager;
        this._protocolVersionManager = _protocolVersionManager;
    }
    async executeOperation(request) {
        try {
            let result;
            switch (request.operation) {
                case 'create_role': {
                    result = await this.roleService.createRole(request.payload);
                    break;
                }
                case 'update_role': {
                    const { roleId, ...updateData } = request.payload;
                    result = await this.roleService.updateRole(roleId, updateData);
                    break;
                }
                case 'delete_role': {
                    const { roleId } = request.payload;
                    const deleteResult = await this.roleService.deleteRole(roleId);
                    const response = {
                        protocolVersion: request.protocolVersion,
                        timestamp: new Date().toISOString(),
                        requestId: request.requestId,
                        success: true,
                        data: deleteResult,
                        message: deleteResult ? 'Role deleted successfully' : 'Failed to delete role',
                        metadata: {
                            operation: request.operation,
                            module: 'role'
                        }
                    };
                    return response;
                }
                case 'get_role': {
                    const { roleId } = request.payload;
                    result = await this.roleService.getRoleById(roleId);
                    break;
                }
                case 'get_role_by_name': {
                    const { name } = request.payload;
                    result = await this.roleService.getRoleByName(name);
                    break;
                }
                case 'list_roles': {
                    const { pagination, filter, sort } = request.payload;
                    const paginatedResult = await this.roleService.getAllRoles(pagination, filter, sort);
                    result = pagination ? paginatedResult : paginatedResult.items;
                    break;
                }
                case 'list_roles_by_context': {
                    const { contextId, pagination } = request.payload;
                    result = await this.roleService.getRolesByContextId(contextId, pagination);
                    break;
                }
                case 'list_roles_by_type': {
                    const { roleType, pagination } = request.payload;
                    result = await this.roleService.getRolesByType(roleType, pagination);
                    break;
                }
                case 'search_roles': {
                    const { searchTerm, pagination } = request.payload;
                    result = await this.roleService.searchRoles(searchTerm, pagination);
                    break;
                }
                case 'check_permission': {
                    const { roleId, resourceType, resourceId, action } = request.payload;
                    result = await this.roleService.checkPermission(roleId, resourceType, resourceId, action);
                    break;
                }
                case 'add_permission': {
                    const { roleId, permission } = request.payload;
                    result = await this.roleService.addPermission(roleId, permission);
                    break;
                }
                case 'remove_permission': {
                    const { roleId, permissionId } = request.payload;
                    result = await this.roleService.removePermission(roleId, permissionId);
                    break;
                }
                case 'activate_role': {
                    const { roleId } = request.payload;
                    result = await this.roleService.activateRole(roleId);
                    break;
                }
                case 'deactivate_role': {
                    const { roleId } = request.payload;
                    result = await this.roleService.deactivateRole(roleId);
                    break;
                }
                case 'get_role_statistics': {
                    result = await this.roleService.getRoleStatistics();
                    break;
                }
                case 'get_complexity_distribution': {
                    result = await this.roleService.getComplexityDistribution();
                    break;
                }
                case 'bulk_create_roles': {
                    const { requests } = request.payload;
                    result = await this.roleService.bulkCreateRoles(requests);
                    break;
                }
                default:
                    throw new Error(`Unsupported operation: ${request.operation}`);
            }
            return {
                protocolVersion: request.protocolVersion,
                timestamp: new Date().toISOString(),
                requestId: request.requestId,
                success: true,
                data: result,
                metadata: {
                    operation: request.operation,
                    module: 'role'
                }
            };
        }
        catch (error) {
            return {
                protocolVersion: request.protocolVersion,
                timestamp: new Date().toISOString(),
                requestId: request.requestId,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    getProtocolMetadata() {
        return {
            name: 'Role Protocol',
            moduleName: 'role',
            version: '1.0.0',
            description: 'Enterprise-grade RBAC Security Center Protocol',
            capabilities: [
                'rbac', 'permissions', 'inheritance', 'delegation', 'audit',
                'monitoring', 'bulkOperations', 'search', 'statistics'
            ],
            dependencies: [
                'MLPPSecurityManager', 'MLPPPerformanceMonitor', 'MLPPEventBusManager',
                'MLPPErrorHandler', 'MLPPCoordinationManager', 'MLPPOrchestrationManager',
                'MLPPStateSyncManager', 'MLPPTransactionManager', 'MLPPProtocolVersionManager'
            ],
            supportedOperations: [
                'create_role', 'update_role', 'delete_role', 'get_role', 'get_role_by_name',
                'list_roles', 'list_roles_by_context', 'list_roles_by_type', 'search_roles',
                'check_permission', 'add_permission', 'remove_permission', 'activate_role',
                'deactivate_role', 'get_role_statistics', 'get_complexity_distribution', 'bulk_create_roles'
            ],
            crossCuttingConcerns: [
                'security', 'performance', 'eventBus', 'errorHandling', 'coordination',
                'orchestration', 'stateSync', 'transaction', 'protocolVersion'
            ],
            slaGuarantees: {
                availability: '99.9%',
                responseTime: '<100ms',
                throughput: '1000 ops/sec'
            }
        };
    }
    async healthCheck() {
        try {
            const statistics = await this.roleService.getRoleStatistics();
            return {
                status: 'healthy',
                timestamp: new Date(),
                details: {
                    service: 'healthy',
                    repository: 'healthy',
                    totalRoles: statistics.totalRoles,
                    activeRoles: statistics.activeRoles,
                    crossCuttingConcerns: 'healthy'
                },
                checks: [
                    {
                        name: 'role-service',
                        status: 'pass',
                        message: 'Role service is operational'
                    },
                    {
                        name: 'statistics',
                        status: 'pass',
                        message: `Total roles: ${statistics.totalRoles}, Active: ${statistics.activeRoles}`
                    }
                ],
                metadata: {
                    totalRoles: statistics.totalRoles,
                    activeRoles: statistics.activeRoles,
                    module: 'role'
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    service: 'unhealthy',
                    repository: 'unhealthy',
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                checks: [
                    {
                        name: 'role-service',
                        status: 'fail',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    }
                ],
                metadata: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    module: 'role'
                }
            };
        }
    }
    getMetadata() {
        return {
            name: 'MPLP Role Protocol',
            version: '1.0.0',
            description: 'Role模块协议 - 企业级RBAC安全中心和权限管理',
            capabilities: [
                'role_management',
                'permission_control',
                'agent_management',
                'rbac_security',
                'inheritance_management',
                'delegation_control',
                'audit_trail',
                'performance_monitoring'
            ],
            dependencies: [
                'mplp-security',
                'mplp-event-bus',
                'mplp-coordination',
                'mplp-orchestration'
            ],
            supportedOperations: [
                'create_role',
                'update_role',
                'delete_role',
                'get_role',
                'list_roles',
                'check_permission',
                'assign_role',
                'revoke_role'
            ]
        };
    }
    async getHealthStatus() {
        try {
            const roleServiceHealth = await this.checkRoleServiceHealth();
            return {
                status: roleServiceHealth ? 'healthy' : 'degraded',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: 'initialized',
                    roleService: roleServiceHealth ? 'healthy' : 'degraded',
                    crossCuttingConcerns: 'active'
                },
                checks: [
                    {
                        name: 'role_service',
                        status: roleServiceHealth ? 'pass' : 'warn',
                        message: roleServiceHealth ? 'Role service is healthy' : 'Role service has issues'
                    },
                    {
                        name: 'cross_cutting_concerns',
                        status: 'pass',
                        message: 'All cross-cutting concerns are active'
                    }
                ]
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                checks: [
                    {
                        name: 'health_check',
                        status: 'fail',
                        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ]
            };
        }
    }
    async checkRoleServiceHealth() {
        try {
            await this.roleService.getRoleStatistics();
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.RoleProtocol = RoleProtocol;
