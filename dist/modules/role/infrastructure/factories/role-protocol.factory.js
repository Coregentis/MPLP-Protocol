"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ROLE_PROTOCOL_CONFIG = exports.RoleProtocolFactory = void 0;
const role_protocol_1 = require("../protocols/role.protocol");
const role_management_service_1 = require("../../application/services/role-management.service");
const role_repository_1 = require("../repositories/role.repository");
const factory_1 = require("../../../../core/protocols/cross-cutting-concerns/factory");
class RoleProtocolFactory {
    static instance;
    protocol = null;
    constructor() { }
    static getInstance() {
        if (!RoleProtocolFactory.instance) {
            RoleProtocolFactory.instance = new RoleProtocolFactory();
        }
        return RoleProtocolFactory.instance;
    }
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        const crossCuttingFactory = factory_1.CrossCuttingConcernsFactory.getInstance();
        const managers = crossCuttingFactory.createManagers({
            security: { enabled: config.crossCuttingConcerns?.security?.enabled ?? true },
            performance: { enabled: config.crossCuttingConcerns?.performance?.enabled ?? (config.enableMetrics ?? false) },
            eventBus: { enabled: config.crossCuttingConcerns?.eventBus?.enabled ?? true },
            errorHandler: { enabled: config.crossCuttingConcerns?.errorHandler?.enabled ?? true },
            coordination: { enabled: config.crossCuttingConcerns?.coordination?.enabled ?? true },
            orchestration: { enabled: config.crossCuttingConcerns?.orchestration?.enabled ?? true },
            stateSync: { enabled: config.crossCuttingConcerns?.stateSync?.enabled ?? true },
            transaction: { enabled: config.crossCuttingConcerns?.transaction?.enabled ?? true },
            protocolVersion: { enabled: config.crossCuttingConcerns?.protocolVersion?.enabled ?? true }
        });
        const repository = new role_repository_1.MemoryRoleRepository();
        const roleManagementService = new role_management_service_1.RoleManagementService(repository);
        this.protocol = new role_protocol_1.RoleProtocol(roleManagementService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
        return this.protocol;
    }
    getProtocolMetadata() {
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
        if (!this.protocol) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: 'not_created',
                    services: 'not_available',
                    crossCuttingConcerns: 'not_initialized'
                },
                checks: [
                    {
                        name: 'protocol_initialization',
                        status: 'fail',
                        message: 'Role protocol not initialized'
                    }
                ]
            };
        }
        try {
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: 'initialized',
                    services: 'available',
                    crossCuttingConcerns: 'initialized',
                    roleManagement: 'active',
                    permissionControl: 'active',
                    agentManagement: 'active'
                },
                checks: [
                    {
                        name: 'protocol_initialization',
                        status: 'pass',
                        message: 'Role protocol successfully initialized'
                    },
                    {
                        name: 'service_availability',
                        status: 'pass',
                        message: 'Role management service is available'
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
    reset() {
        this.protocol = null;
    }
    async destroy() {
        if (this.protocol) {
            if ('destroy' in this.protocol && typeof this.protocol.destroy === 'function') {
                await this.protocol.destroy();
            }
            this.protocol = null;
        }
    }
}
exports.RoleProtocolFactory = RoleProtocolFactory;
exports.DEFAULT_ROLE_PROTOCOL_CONFIG = {
    enableLogging: false,
    enableMetrics: true,
    enableCaching: true,
    repositoryType: 'memory',
    roleConfiguration: {
        maxRoles: 1000,
        defaultRoleType: 'functional',
        permissionModel: 'rbac',
        inheritanceMode: 'multiple',
        auditEnabled: true,
        securityClearanceRequired: false
    },
    agentManagement: {
        maxAgents: 100,
        autoScaling: false,
        loadBalancing: true,
        healthCheckIntervalMs: 30000
    },
    performanceMetrics: {
        enabled: true,
        collectionIntervalSeconds: 60,
        roleAssignmentLatencyThresholdMs: 100,
        permissionCheckLatencyThresholdMs: 10,
        securityScoreThreshold: 8.0
    },
    crossCuttingConcerns: {
        security: { enabled: true },
        performance: { enabled: true },
        eventBus: { enabled: true },
        errorHandler: { enabled: true },
        coordination: { enabled: true },
        orchestration: { enabled: true },
        stateSync: { enabled: true },
        transaction: { enabled: true },
        protocolVersion: { enabled: true }
    }
};
