"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkProtocolFactory = void 0;
const network_protocol_1 = require("../protocols/network.protocol");
const factory_1 = require("../../../../core/protocols/cross-cutting-concerns/factory");
class NetworkProtocolFactory {
    static factoryInstance = null;
    instances;
    defaultConfig;
    constructor() {
        this.instances = new Map();
        this.defaultConfig = {
            enableLogging: true,
            enableMetrics: true,
            enableCaching: false,
            maxCacheSize: 1000,
            cacheTimeout: 300000,
            networkTimeout: 30000,
            maxConnections: 1000,
            retryAttempts: 3,
            retryDelay: 1000
        };
    }
    async createProtocol(instanceId = 'default', config = {}) {
        if (this.instances.has(instanceId)) {
            const existingInstance = this.instances.get(instanceId);
            if (existingInstance && existingInstance.isInitialized) {
                return existingInstance;
            }
        }
        const finalConfig = {
            ...this.defaultConfig,
            ...config,
            instanceId
        };
        const crossCuttingFactory = factory_1.CrossCuttingConcernsFactory.getInstance();
        const managers = crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: finalConfig.enableMetrics ?? false },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: true },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        const networkManagementService = {};
        const networkAnalyticsService = {};
        const networkMonitoringService = {};
        const networkSecurityService = {};
        const protocol = new network_protocol_1.NetworkProtocol(networkManagementService, networkAnalyticsService, networkMonitoringService, networkSecurityService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
        const initialized = await protocol.initialize(finalConfig);
        if (!initialized) {
            throw new Error(`协议实例 ${instanceId} 初始化失败`);
        }
        this.instances.set(instanceId, protocol);
        return protocol;
    }
    getProtocol(instanceId = 'default') {
        return this.instances.get(instanceId) || null;
    }
    async destroyProtocol(instanceId = 'default') {
        try {
            const protocol = this.instances.get(instanceId);
            if (!protocol) {
                return false;
            }
            if (protocol.healthCheckInterval) {
                clearInterval(protocol.healthCheckInterval);
            }
            if (protocol.healthCheckInterval) {
                clearInterval(protocol.healthCheckInterval);
            }
            this.instances.delete(instanceId);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    getAllProtocols() {
        return new Map(this.instances);
    }
    getProtocolStatus(instanceId = 'default') {
        const protocol = this.instances.get(instanceId);
        if (!protocol) {
            return null;
        }
        return {
            instanceId,
            initialized: protocol.isInitialized,
            active: protocol.isActive,
            errorCount: protocol.errorCount,
            lastHealthCheck: protocol.lastHealthCheck,
            metrics: protocol.metrics,
            timestamp: new Date().toISOString()
        };
    }
    getAllProtocolStatus() {
        const statuses = [];
        for (const [instanceId, protocol] of this.instances) {
            statuses.push({
                instanceId,
                initialized: protocol.isInitialized,
                active: protocol.isActive,
                errorCount: protocol.errorCount,
                lastHealthCheck: protocol.lastHealthCheck,
                metrics: protocol.metrics,
                timestamp: new Date().toISOString()
            });
        }
        return statuses;
    }
    async restartProtocol(instanceId = 'default', newConfig = {}) {
        const currentProtocol = this.instances.get(instanceId);
        const currentConfig = currentProtocol ? currentProtocol.config : {};
        await this.destroyProtocol(instanceId);
        const mergedConfig = { ...currentConfig, ...newConfig };
        return await this.createProtocol(instanceId, mergedConfig);
    }
    async createMultipleProtocols(configs) {
        const protocols = [];
        const errors = [];
        for (const config of configs) {
            try {
                const instanceId = config.instanceId || `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const protocol = await this.createProtocol(instanceId, config);
                if (protocol) {
                    protocols.push(protocol);
                }
            }
            catch (error) {
                errors.push({
                    config,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        if (errors.length > 0) {
            void errors;
        }
        return protocols;
    }
    async healthCheckAll() {
        const results = {
            total: this.instances.size,
            healthy: 0,
            unhealthy: 0,
            details: []
        };
        for (const [instanceId, protocol] of this.instances) {
            try {
                const health = await protocol.healthCheck();
                if (health.status === 'healthy') {
                    results.healthy++;
                }
                else {
                    results.unhealthy++;
                }
                results.details.push({
                    instanceId,
                    ...health
                });
            }
            catch (error) {
                results.unhealthy++;
                results.details.push({
                    instanceId,
                    healthy: false,
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: new Date().toISOString()
                });
            }
        }
        return results;
    }
    async cleanup() {
        try {
            const instanceIds = Array.from(this.instances.keys());
            for (const instanceId of instanceIds) {
                await this.destroyProtocol(instanceId);
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    getFactoryStats() {
        const stats = {
            totalInstances: this.instances.size,
            initializedInstances: 0,
            activeInstances: 0,
            errorInstances: 0,
            instances: []
        };
        for (const [instanceId, protocol] of this.instances) {
            if (protocol.isInitialized) {
                stats.initializedInstances++;
            }
            if (protocol.isActive) {
                stats.activeInstances++;
            }
            if (protocol.errorCount > 0) {
                stats.errorInstances++;
            }
            stats.instances.push({
                instanceId,
                initialized: protocol.isInitialized,
                active: protocol.isActive,
                errorCount: protocol.errorCount,
                operationsCount: protocol.metrics.operationsCount
            });
        }
        return stats;
    }
    setDefaultConfig(config) {
        this.defaultConfig = {
            ...this.defaultConfig,
            ...config
        };
    }
    getDefaultConfig() {
        return { ...this.defaultConfig };
    }
    static create(_config) {
        if (!NetworkProtocolFactory.factoryInstance) {
            NetworkProtocolFactory.factoryInstance = new NetworkProtocolFactory();
        }
        const mockNetworkManagementService = {
            createNetwork: jest.fn(),
            updateNetwork: jest.fn(),
            deleteNetwork: jest.fn(),
            getNetwork: jest.fn(),
            getAllNetworks: jest.fn(),
            addNodeToNetwork: jest.fn(),
            removeNodeFromNetwork: jest.fn(),
            addEdgeToNetwork: jest.fn(),
            removeEdgeFromNetwork: jest.fn(),
            getNetworkTopology: jest.fn(),
            validateNetworkConfiguration: jest.fn(),
            optimizeNetworkPerformance: jest.fn(),
            getNetworkMetrics: jest.fn(),
            getNetworkHealth: jest.fn(),
            backupNetworkConfiguration: jest.fn(),
            restoreNetworkConfiguration: jest.fn(),
            exportNetworkConfiguration: jest.fn(),
            importNetworkConfiguration: jest.fn(),
            cloneNetwork: jest.fn(),
            mergeNetworks: jest.fn()
        };
        const mockManagers = {
            securityManager: { validateRequest: jest.fn().mockResolvedValue({ allowed: true }) },
            performanceMonitor: { recordMetric: jest.fn() },
            eventBusManager: { publish: jest.fn() },
            errorHandler: { handleError: jest.fn() },
            coordinationManager: {},
            orchestrationManager: {},
            stateSyncManager: {},
            transactionManager: {},
            protocolVersionManager: {}
        };
        const mockNetworkAnalyticsService = {
            analyzeNetwork: jest.fn().mockResolvedValue({}),
            generateHealthReport: jest.fn().mockResolvedValue({})
        };
        const mockNetworkMonitoringService = {
            getRealtimeMetrics: jest.fn().mockResolvedValue({}),
            getDashboard: jest.fn().mockResolvedValue({}),
            startMonitoring: jest.fn().mockResolvedValue(undefined)
        };
        const mockNetworkSecurityService = {
            performThreatDetection: jest.fn().mockResolvedValue([]),
            performSecurityAudit: jest.fn().mockResolvedValue({}),
            getSecurityDashboard: jest.fn().mockResolvedValue({})
        };
        return new network_protocol_1.NetworkProtocol(mockNetworkManagementService, mockNetworkAnalyticsService, mockNetworkMonitoringService, mockNetworkSecurityService, mockManagers.securityManager, mockManagers.performanceMonitor, mockManagers.eventBusManager, mockManagers.errorHandler, mockManagers.coordinationManager, mockManagers.orchestrationManager, mockManagers.stateSyncManager, mockManagers.transactionManager, mockManagers.protocolVersionManager);
    }
    static createWithDefaults() {
        return NetworkProtocolFactory.create({
            enableLogging: true,
            enableMetrics: true,
            enableCaching: true
        });
    }
    static createForTesting() {
        return NetworkProtocolFactory.create({
            enableLogging: false,
            enableMetrics: false,
            enableCaching: false
        });
    }
    static createForProduction() {
        return NetworkProtocolFactory.create({
            enableLogging: true,
            enableMetrics: true,
            enableCaching: true,
            enableSecurity: true
        });
    }
    static singletonInstance = null;
    static getInstance() {
        if (!NetworkProtocolFactory.singletonInstance) {
            NetworkProtocolFactory.singletonInstance = NetworkProtocolFactory.create();
        }
        return NetworkProtocolFactory.singletonInstance;
    }
    static resetInstance() {
        NetworkProtocolFactory.factoryInstance = null;
        NetworkProtocolFactory.singletonInstance = null;
    }
}
exports.NetworkProtocolFactory = NetworkProtocolFactory;
const networkProtocolFactory = new NetworkProtocolFactory();
module.exports = {
    NetworkProtocolFactory,
    networkProtocolFactory
};
