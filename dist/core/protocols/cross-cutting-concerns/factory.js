"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossCuttingConcernsFactory = void 0;
const security_manager_1 = require("./security-manager");
const performance_monitor_1 = require("./performance-monitor");
const event_bus_manager_1 = require("./event-bus-manager");
const error_handler_1 = require("./error-handler");
const coordination_manager_1 = require("./coordination-manager");
const orchestration_manager_1 = require("./orchestration-manager");
const state_sync_manager_1 = require("./state-sync-manager");
const transaction_manager_1 = require("./transaction-manager");
const protocol_version_manager_1 = require("./protocol-version-manager");
class CrossCuttingConcernsFactory {
    static instance;
    managers = null;
    constructor() { }
    static getInstance() {
        if (!CrossCuttingConcernsFactory.instance) {
            CrossCuttingConcernsFactory.instance = new CrossCuttingConcernsFactory();
        }
        return CrossCuttingConcernsFactory.instance;
    }
    createManagers(config = {}) {
        if (this.managers) {
            return this.managers;
        }
        this.managers = {
            security: new security_manager_1.MLPPSecurityManager(),
            performance: new performance_monitor_1.MLPPPerformanceMonitor(),
            eventBus: new event_bus_manager_1.MLPPEventBusManager(),
            errorHandler: new error_handler_1.MLPPErrorHandler(),
            coordination: new coordination_manager_1.MLPPCoordinationManager(),
            orchestration: new orchestration_manager_1.MLPPOrchestrationManager(),
            stateSync: new state_sync_manager_1.MLPPStateSyncManager(),
            transaction: new transaction_manager_1.MLPPTransactionManager(),
            protocolVersion: new protocol_version_manager_1.MLPPProtocolVersionManager()
        };
        this.applyConfiguration(config);
        return this.managers;
    }
    getManagers() {
        return this.managers;
    }
    reset() {
        this.managers = null;
    }
    applyConfiguration(config) {
        if (!this.managers)
            return;
        try {
            if (config.security && this.managers.security) {
                this.applySecurityConfig(config.security);
            }
            if (config.performance && this.managers.performance) {
                this.applyPerformanceConfig(config.performance);
            }
            if (config.eventBus && this.managers.eventBus) {
                this.applyEventBusConfig(config.eventBus);
            }
            if (config.errorHandler && this.managers.errorHandler) {
                this.applyErrorHandlerConfig(config.errorHandler);
            }
            if (config.coordination && this.managers.coordination) {
                this.applyCoordinationConfig(config.coordination);
            }
            if (config.orchestration && this.managers.orchestration) {
                this.applyOrchestrationConfig(config.orchestration);
            }
            if (config.stateSync && this.managers.stateSync) {
                this.applyStateSyncConfig(config.stateSync);
            }
            if (config.transaction && this.managers.transaction) {
                this.applyTransactionConfig(config.transaction);
            }
            if (config.protocolVersion && this.managers.protocolVersion) {
                this.applyProtocolVersionConfig(config.protocolVersion);
            }
        }
        catch (error) {
            console.error('Failed to apply cross-cutting concerns configuration:', error);
            throw new Error(`Configuration application failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    applySecurityConfig(config) {
        if (!config.enabled) {
            console.log('Security manager disabled by configuration');
        }
    }
    applyPerformanceConfig(config) {
        if (!config.enabled) {
            console.log('Performance monitor disabled by configuration');
            return;
        }
    }
    applyEventBusConfig(config) {
        if (!config.enabled) {
            console.log('Event bus disabled by configuration');
            return;
        }
    }
    applyErrorHandlerConfig(config) {
        if (!config.enabled) {
            console.log('Error handler disabled by configuration');
            return;
        }
    }
    applyCoordinationConfig(config) {
        if (!config.enabled) {
            console.log('Coordination manager disabled by configuration');
            return;
        }
    }
    applyOrchestrationConfig(config) {
        if (!config.enabled) {
            console.log('Orchestration manager disabled by configuration');
            return;
        }
    }
    applyStateSyncConfig(config) {
        if (!config.enabled) {
            console.log('State sync manager disabled by configuration');
            return;
        }
    }
    applyTransactionConfig(config) {
        if (!config.enabled) {
            console.log('Transaction manager disabled by configuration');
            return;
        }
    }
    applyProtocolVersionConfig(config) {
        if (!config.enabled) {
            console.log('Protocol version manager disabled by configuration');
            return;
        }
    }
    async healthCheckAll() {
        if (!this.managers) {
            throw new Error('Managers not initialized. Call createManagers() first.');
        }
        const results = {};
        try {
            results.security = await this.managers.security.healthCheck();
            results.performance = await this.managers.performance.healthCheck();
            results.eventBus = await this.managers.eventBus.healthCheck();
            results.errorHandler = await this.managers.errorHandler.healthCheck();
            results.coordination = await this.managers.coordination.healthCheck();
            results.orchestration = await this.managers.orchestration.healthCheck();
            results.stateSync = await this.managers.stateSync.healthCheck();
            results.transaction = await this.managers.transaction.healthCheck();
            results.protocolVersion = await this.managers.protocolVersion.healthCheck();
        }
        catch (error) {
            void error;
        }
        return results;
    }
}
exports.CrossCuttingConcernsFactory = CrossCuttingConcernsFactory;
