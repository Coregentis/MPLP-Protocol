"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogProtocolFactory = void 0;
const dialog_protocol_1 = require("../protocols/dialog.protocol");
const dialog_management_service_1 = require("../../application/services/dialog-management.service");
const dialog_adapter_1 = require("../adapters/dialog.adapter");
class DialogProtocolFactory {
    static _instance;
    _protocolInstances = new Map();
    _factoryConfig;
    constructor(config) {
        this._factoryConfig = config;
    }
    static getInstance(config) {
        if (!DialogProtocolFactory._instance) {
            if (!config) {
                throw new Error('ProtocolFactoryConfig is required for first initialization');
            }
            DialogProtocolFactory._instance = new DialogProtocolFactory(config);
        }
        return DialogProtocolFactory._instance;
    }
    async createProtocolInstance(instanceConfig) {
        try {
            if (this._protocolInstances.has(instanceConfig.instanceId)) {
                throw new Error(`Protocol instance ${instanceConfig.instanceId} already exists`);
            }
            const dependencies = await this._createDependencies();
            const protocolInstance = new dialog_protocol_1.DialogProtocol(dependencies.dialogManagementService);
            await this._configureProtocolInstance(protocolInstance, instanceConfig);
            this._protocolInstances.set(instanceConfig.instanceId, protocolInstance);
            await this._recordFactoryEvent('protocol_created', {
                instanceId: instanceConfig.instanceId,
                protocolVersion: instanceConfig.protocolVersion,
                timestamp: new Date().toISOString()
            });
            return protocolInstance;
        }
        catch (error) {
            await this._recordFactoryEvent('protocol_creation_failed', {
                instanceId: instanceConfig.instanceId,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
    getProtocolInstance(instanceId) {
        return this._protocolInstances.get(instanceId) || null;
    }
    async destroyProtocolInstance(instanceId) {
        try {
            const instance = this._protocolInstances.get(instanceId);
            if (!instance) {
                throw new Error(`Protocol instance ${instanceId} not found`);
            }
            await instance.shutdown();
            this._protocolInstances.delete(instanceId);
            await this._recordFactoryEvent('protocol_destroyed', {
                instanceId,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            await this._recordFactoryEvent('protocol_destruction_failed', {
                instanceId,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
    getAllProtocolInstances() {
        return new Map(this._protocolInstances);
    }
    getFactoryStatus() {
        return {
            totalInstances: this._protocolInstances.size,
            activeInstances: this._protocolInstances.size,
            factoryConfig: this._factoryConfig,
            instanceIds: Array.from(this._protocolInstances.keys())
        };
    }
    async updateFactoryConfig(newConfig) {
        try {
            this._factoryConfig = { ...this._factoryConfig, ...newConfig };
            await this._recordFactoryEvent('factory_config_updated', {
                updatedFields: Object.keys(newConfig),
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            await this._recordFactoryEvent('factory_config_update_failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
    async healthCheck() {
        const instanceHealths = {};
        let healthyCount = 0;
        let unhealthyCount = 0;
        for (const [instanceId, instance] of this._protocolInstances) {
            try {
                const health = await instance.healthCheck();
                instanceHealths[instanceId] = health.status;
                if (health.status === 'healthy') {
                    healthyCount++;
                }
                else {
                    unhealthyCount++;
                }
            }
            catch (error) {
                instanceHealths[instanceId] = 'critical';
                unhealthyCount++;
            }
        }
        const overallStatus = unhealthyCount === 0 ? 'healthy' :
            healthyCount > unhealthyCount ? 'degraded' : 'unhealthy';
        return {
            status: overallStatus,
            instances: instanceHealths,
            factoryMetrics: {
                totalInstances: this._protocolInstances.size,
                healthyInstances: healthyCount,
                unhealthyInstances: unhealthyCount
            }
        };
    }
    async _createDependencies() {
        const dialogAdapter = new dialog_adapter_1.DialogAdapter();
        const dialogManagementService = new dialog_management_service_1.DialogManagementService(dialogAdapter, {});
        return {
            dialogManagementService,
            dialogAdapter
        };
    }
    async _configureProtocolInstance(instance, config) {
        await instance.initialize({
            instanceId: config.instanceId,
            protocolVersion: config.protocolVersion,
            customCapabilities: config.customCapabilities,
            overrideDefaults: config.overrideDefaults,
            integrationConfig: config.integrationConfig,
            factoryConfig: this._factoryConfig
        });
    }
    async _recordFactoryEvent(_eventType, _eventData) {
        if (this._factoryConfig.enableLogging) {
        }
    }
    async cleanup() {
        try {
            const shutdownPromises = Array.from(this._protocolInstances.entries()).map(async ([_instanceId, instance]) => {
                try {
                    await instance.shutdown();
                }
                catch (error) {
                }
            });
            await Promise.all(shutdownPromises);
            this._protocolInstances.clear();
            await this._recordFactoryEvent('factory_cleanup_completed', {
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            await this._recordFactoryEvent('factory_cleanup_failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
}
exports.DialogProtocolFactory = DialogProtocolFactory;
