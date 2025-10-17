"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmProtocolFactory = void 0;
const confirm_protocol_1 = require("../protocols/confirm.protocol");
const confirm_management_service_1 = require("../../application/services/confirm-management.service");
const confirm_repository_1 = require("../repositories/confirm.repository");
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class ConfirmProtocolFactory {
    static instance;
    protocol = null;
    constructor() { }
    static getInstance() {
        if (!ConfirmProtocolFactory.instance) {
            ConfirmProtocolFactory.instance = new ConfirmProtocolFactory();
        }
        return ConfirmProtocolFactory.instance;
    }
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        const crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
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
        const repository = this.createRepository(config.repositoryType);
        const confirmService = new confirm_management_service_1.ConfirmManagementService(repository);
        this.protocol = new confirm_protocol_1.ConfirmProtocol(confirmService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
        return this.protocol;
    }
    getProtocol() {
        return this.protocol;
    }
    reset() {
        this.protocol = null;
    }
    createRepository(repositoryType = 'memory') {
        switch (repositoryType) {
            case 'memory':
                return new confirm_repository_1.MemoryConfirmRepository();
            case 'database':
                throw new Error('Database repository not implemented yet');
            case 'file':
                throw new Error('File repository not implemented yet');
            default:
                return new confirm_repository_1.MemoryConfirmRepository();
        }
    }
    async healthCheck() {
        if (!this.protocol) {
            return {
                status: 'unhealthy',
                details: { error: 'Protocol not initialized' }
            };
        }
        const healthStatus = await this.protocol.healthCheck();
        return {
            status: healthStatus.status === 'degraded' ? 'unhealthy' : healthStatus.status,
            details: {
                timestamp: healthStatus.timestamp,
                checks: healthStatus.checks,
                metadata: healthStatus.metadata
            }
        };
    }
    getMetadata() {
        if (!this.protocol) {
            throw new Error('Protocol not initialized. Call createProtocol() first.');
        }
        return this.protocol.getMetadata();
    }
    validateConfig(config) {
        const errors = [];
        if (config.repositoryType && !['memory', 'database', 'file'].includes(config.repositoryType)) {
            errors.push('Invalid repository type. Must be one of: memory, database, file');
        }
        if (config.crossCuttingConcerns) {
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    getStatistics() {
        return {
            protocolInitialized: this.protocol !== null,
            factoryVersion: '1.0.0',
            supportedRepositoryTypes: ['memory', 'database', 'file'],
            supportedCrossCuttingConcerns: [
                'security',
                'performance',
                'eventBus',
                'errorHandler',
                'coordination',
                'orchestration',
                'stateSync',
                'transaction',
                'protocolVersion'
            ]
        };
    }
}
exports.ConfirmProtocolFactory = ConfirmProtocolFactory;
