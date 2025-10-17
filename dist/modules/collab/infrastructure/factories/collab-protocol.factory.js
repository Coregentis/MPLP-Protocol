"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabProtocolFactory = void 0;
const collab_protocol_1 = require("../protocols/collab.protocol");
const collab_management_service_1 = require("../../application/services/collab-management.service");
const collab_repository_impl_1 = require("../repositories/collab.repository.impl");
const factory_1 = require("../../../../core/protocols/cross-cutting-concerns/factory");
class CollabProtocolFactory {
    static instance = null;
    protocol = null;
    constructor() { }
    static getInstance() {
        if (!CollabProtocolFactory.instance) {
            CollabProtocolFactory.instance = new CollabProtocolFactory();
        }
        return CollabProtocolFactory.instance;
    }
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        const crossCuttingFactory = factory_1.CrossCuttingConcernsFactory.getInstance();
        const managers = crossCuttingFactory.createManagers({
            security: { enabled: config.crossCuttingConcerns?.security?.enabled ?? true },
            performance: { enabled: config.crossCuttingConcerns?.performance?.enabled ?? (config.enableMetrics ?? true) },
            eventBus: { enabled: config.crossCuttingConcerns?.eventBus?.enabled ?? true },
            errorHandler: { enabled: config.crossCuttingConcerns?.errorHandler?.enabled ?? true },
            coordination: { enabled: config.crossCuttingConcerns?.coordination?.enabled ?? true },
            orchestration: { enabled: config.crossCuttingConcerns?.orchestration?.enabled ?? true },
            stateSync: { enabled: config.crossCuttingConcerns?.stateSync?.enabled ?? true },
            transaction: { enabled: config.crossCuttingConcerns?.transaction?.enabled ?? true },
            protocolVersion: { enabled: config.crossCuttingConcerns?.protocolVersion?.enabled ?? true }
        });
        const repository = new collab_repository_impl_1.CollabRepositoryImpl();
        const mockMemberManager = {};
        const mockTaskAllocator = {};
        const mockLogger = {};
        const collabManagementService = new collab_management_service_1.CollabManagementService(repository, mockMemberManager, mockTaskAllocator, mockLogger);
        this.protocol = new collab_protocol_1.CollabProtocol(collabManagementService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
        return this.protocol;
    }
    async createConfiguredProtocol(config) {
        this.protocol = null;
        return this.createProtocol(config);
    }
    getProtocolMetadata() {
        return {
            name: 'collab',
            version: '1.0.0',
            description: 'Multi-Agent Collaboration management protocol with enterprise-grade features',
            capabilities: [
                'collaboration_creation',
                'collaboration_management',
                'participant_management',
                'coordination_strategy',
                'lifecycle_management',
                'performance_monitoring',
                'event_publishing'
            ],
            dependencies: [
                'security',
                'performance',
                'eventBus',
                'errorHandler',
                'coordination',
                'orchestration',
                'stateSync',
                'transaction',
                'protocolVersion'
            ],
            supportedOperations: [
                'create',
                'update',
                'delete',
                'get',
                'list',
                'start',
                'stop',
                'add_participant',
                'remove_participant'
            ]
        };
    }
    async healthCheck() {
        const timestamp = new Date().toISOString();
        const checks = [];
        try {
            if (this.protocol) {
                const protocolHealth = await this.protocol.healthCheck();
                checks.push({
                    name: 'protocol',
                    status: protocolHealth.status === 'healthy' ? 'pass' : 'fail',
                    message: protocolHealth.status === 'healthy' ? 'Protocol is healthy' : 'Protocol is unhealthy'
                });
            }
            else {
                checks.push({
                    name: 'protocol',
                    status: 'warn',
                    message: 'Protocol not yet created'
                });
            }
            checks.push({
                name: 'factory',
                status: 'pass',
                message: 'Factory is operational'
            });
            const allHealthy = checks.every(check => check.status === 'pass');
            return {
                status: allHealthy ? 'healthy' : (checks.some(check => check.status === 'fail') ? 'unhealthy' : 'degraded'),
                timestamp,
                checks
            };
        }
        catch (error) {
            checks.push({
                name: 'healthCheck',
                status: 'fail',
                message: error instanceof Error ? error.message : 'Unknown error during health check'
            });
            return {
                status: 'unhealthy',
                timestamp,
                checks
            };
        }
    }
    reset() {
        this.protocol = null;
    }
    static destroy() {
        if (CollabProtocolFactory.instance) {
            CollabProtocolFactory.instance.reset();
            CollabProtocolFactory.instance = null;
        }
    }
    static getDefaultConfig() {
        return {
            enableLogging: true,
            enableMetrics: true,
            enableCaching: false,
            repositoryType: 'memory',
            maxParticipants: 100,
            defaultCoordinationType: 'distributed',
            defaultDecisionMaking: 'consensus',
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
    }
    static validateConfig(config) {
        const errors = [];
        if (config.maxParticipants && (config.maxParticipants < 2 || config.maxParticipants > 1000)) {
            errors.push('maxParticipants must be between 2 and 1000');
        }
        if (config.repositoryType && !['memory', 'database', 'file'].includes(config.repositoryType)) {
            errors.push('repositoryType must be one of: memory, database, file');
        }
        if (config.defaultCoordinationType && !['centralized', 'distributed', 'hierarchical', 'peer_to_peer'].includes(config.defaultCoordinationType)) {
            errors.push('defaultCoordinationType must be one of: centralized, distributed, hierarchical, peer_to_peer');
        }
        if (config.defaultDecisionMaking && !['consensus', 'majority', 'weighted', 'coordinator'].includes(config.defaultDecisionMaking)) {
            errors.push('defaultDecisionMaking must be one of: consensus, majority, weighted, coordinator');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
exports.CollabProtocolFactory = CollabProtocolFactory;
