"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextProtocolFactory = void 0;
const context_protocol_js_1 = require("../protocols/context.protocol.js");
const context_management_service_js_1 = require("../../application/services/context-management.service.js");
const context_repository_js_1 = require("../repositories/context.repository.js");
const factory_js_1 = require("../../../../core/protocols/cross-cutting-concerns/factory.js");
class ContextProtocolFactory {
    static instance;
    protocol = null;
    constructor() { }
    static getInstance() {
        if (!ContextProtocolFactory.instance) {
            ContextProtocolFactory.instance = new ContextProtocolFactory();
        }
        return ContextProtocolFactory.instance;
    }
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        const crossCuttingFactory = factory_js_1.CrossCuttingConcernsFactory.getInstance();
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
        const repository = new context_repository_js_1.MemoryContextRepository();
        const logger = { debug: () => { }, info: () => { }, warn: () => { }, error: () => { } };
        const cacheManager = { get: async () => null, set: async () => { }, delete: async () => { }, clear: async () => { } };
        const versionManager = {
            createVersion: async () => '1.0.0',
            getVersionHistory: async () => [],
            getVersion: async () => null,
            compareVersions: async () => ({ added: {}, modified: {}, removed: [] })
        };
        const contextManagementService = new context_management_service_js_1.ContextManagementService(repository, logger, cacheManager, versionManager);
        const analyticsService = {
            analyzeContext: async () => ({ usage: {}, patterns: {}, performance: {}, insights: [] }),
            searchContexts: async () => ({ results: [], total: 0 }),
            generateReport: async () => ({ reportId: '', data: {} })
        };
        const securityService = {
            validateAccess: async () => true,
            performSecurityAudit: async () => ({ status: 'pass', findings: [] })
        };
        this.protocol = new context_protocol_js_1.ContextProtocol(contextManagementService, analyticsService, securityService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
        return this.protocol;
    }
    getProtocol() {
        return this.protocol;
    }
    reset() {
        this.protocol = null;
    }
    static async create(config = {}) {
        const factory = ContextProtocolFactory.getInstance();
        return await factory.createProtocol(config);
    }
    static async getMetadata() {
        const factory = ContextProtocolFactory.getInstance();
        const protocol = factory.getProtocol();
        if (protocol) {
            return protocol.getProtocolMetadata();
        }
        const tempProtocol = await factory.createProtocol();
        return tempProtocol.getProtocolMetadata();
    }
    static async healthCheck() {
        const factory = ContextProtocolFactory.getInstance();
        const protocol = factory.getProtocol();
        if (protocol) {
            return await protocol.healthCheck();
        }
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: [{
                    name: 'contextProtocol',
                    status: 'fail',
                    message: 'Context protocol not initialized'
                }]
        };
    }
}
exports.ContextProtocolFactory = ContextProtocolFactory;
