"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancer = exports.ServiceDiscovery = void 0;
class ServiceDiscovery {
    config;
    registeredServices = new Map();
    serviceInstances = new Map();
    healthCheckInterval = null;
    loadBalancer;
    constructor(config) {
        this.config = config;
        this.loadBalancer = new LoadBalancer({
            strategy: 'round_robin',
            healthCheckEnabled: true,
            failoverEnabled: true,
            maxRetries: 3
        });
        this.startHealthChecking();
    }
    async registerService(registration) {
        const serviceRegistration = {
            serviceId: this.generateUUID(),
            registeredAt: new Date().toISOString(),
            lastHeartbeat: new Date().toISOString(),
            ...registration
        };
        switch (this.config.provider) {
            case 'consul':
                await this.registerWithConsul(serviceRegistration);
                break;
            case 'etcd':
                await this.registerWithEtcd(serviceRegistration);
                break;
            case 'zookeeper':
                await this.registerWithZookeeper(serviceRegistration);
                break;
            case 'memory':
                await this.registerInMemory(serviceRegistration);
                break;
        }
        this.registeredServices.set(serviceRegistration.serviceId, serviceRegistration);
        console.log(`Service registered: ${serviceRegistration.serviceName} (${serviceRegistration.serviceId})`);
        return serviceRegistration;
    }
    async deregisterService(serviceId) {
        const registration = this.registeredServices.get(serviceId);
        if (!registration) {
            throw new Error(`Service not found: ${serviceId}`);
        }
        switch (this.config.provider) {
            case 'consul':
                await this.deregisterFromConsul(serviceId);
                break;
            case 'etcd':
                await this.deregisterFromEtcd(serviceId);
                break;
            case 'zookeeper':
                await this.deregisterFromZookeeper(serviceId);
                break;
            case 'memory':
                await this.deregisterFromMemory(serviceId);
                break;
        }
        this.registeredServices.delete(serviceId);
        console.log(`Service deregistered: ${registration.serviceName} (${serviceId})`);
    }
    async discoverServices(query = {}) {
        let instances = [];
        switch (this.config.provider) {
            case 'consul':
                instances = await this.discoverFromConsul(query);
                break;
            case 'etcd':
                instances = await this.discoverFromEtcd(query);
                break;
            case 'zookeeper':
                instances = await this.discoverFromZookeeper(query);
                break;
            case 'memory':
                instances = await this.discoverFromMemory(query);
                break;
        }
        if (query.healthyOnly) {
            instances = instances.filter(instance => instance.healthStatus.status === 'healthy');
        }
        return instances;
    }
    async getServiceInstance(serviceName, query = {}) {
        const instances = await this.discoverServices({ ...query, serviceName });
        return this.loadBalancer.selectInstance(instances);
    }
    async updateHealthStatus(serviceId, status) {
        const registration = this.registeredServices.get(serviceId);
        if (!registration) {
            return;
        }
        const serviceName = registration.serviceName;
        const instances = this.serviceInstances.get(serviceName) || [];
        const instance = instances.find(i => i.serviceId === serviceId);
        if (instance) {
            instance.healthStatus = status;
            instance.lastSeen = new Date().toISOString();
        }
        switch (this.config.provider) {
            case 'consul':
                await this.updateConsulHealth(serviceId, status);
                break;
            case 'etcd':
                await this.updateEtcdHealth(serviceId, status);
                break;
            case 'zookeeper':
                await this.updateZookeeperHealth(serviceId, status);
                break;
            case 'memory':
                await this.updateMemoryHealth(serviceId, status);
                break;
        }
    }
    async performHealthCheck(registration) {
        const { healthCheck } = registration;
        const startTime = Date.now();
        try {
            switch (healthCheck.type) {
                case 'http':
                    return await this.performHttpHealthCheck(registration, startTime);
                case 'tcp':
                    return await this.performTcpHealthCheck(registration, startTime);
                case 'ttl':
                    return await this.performTtlHealthCheck(registration, startTime);
                default:
                    return {
                        status: 'unknown',
                        lastCheck: new Date().toISOString(),
                        consecutiveFailures: 0,
                        message: 'Unsupported health check type'
                    };
            }
        }
        catch (error) {
            return {
                status: 'unhealthy',
                lastCheck: new Date().toISOString(),
                consecutiveFailures: 1,
                message: error instanceof Error ? error.message : 'Health check failed',
                responseTime: Date.now() - startTime
            };
        }
    }
    async registerWithConsul(registration) {
        console.log(`Registering with Consul: ${registration.serviceName}`);
        await this.simulateNetworkCall();
    }
    async registerWithEtcd(registration) {
        console.log(`Registering with Etcd: ${registration.serviceName}`);
        await this.simulateNetworkCall();
    }
    async registerWithZookeeper(registration) {
        console.log(`Registering with Zookeeper: ${registration.serviceName}`);
        await this.simulateNetworkCall();
    }
    async registerInMemory(registration) {
        const instance = {
            instanceId: this.generateUUID(),
            serviceId: registration.serviceId,
            serviceName: registration.serviceName,
            version: registration.version,
            address: registration.address,
            port: registration.port,
            protocol: registration.protocol,
            status: 'active',
            metadata: registration.metadata,
            healthStatus: {
                status: 'healthy',
                lastCheck: new Date().toISOString(),
                consecutiveFailures: 0
            },
            lastSeen: new Date().toISOString()
        };
        const instances = this.serviceInstances.get(registration.serviceName) || [];
        instances.push(instance);
        this.serviceInstances.set(registration.serviceName, instances);
    }
    async deregisterFromConsul(serviceId) {
        console.log(`Deregistering from Consul: ${serviceId}`);
        await this.simulateNetworkCall();
    }
    async deregisterFromEtcd(serviceId) {
        console.log(`Deregistering from Etcd: ${serviceId}`);
        await this.simulateNetworkCall();
    }
    async deregisterFromZookeeper(serviceId) {
        console.log(`Deregistering from Zookeeper: ${serviceId}`);
        await this.simulateNetworkCall();
    }
    async deregisterFromMemory(serviceId) {
        for (const [serviceName, instances] of this.serviceInstances.entries()) {
            const filteredInstances = instances.filter(i => i.serviceId !== serviceId);
            if (filteredInstances.length !== instances.length) {
                this.serviceInstances.set(serviceName, filteredInstances);
            }
        }
    }
    async discoverFromConsul(query) {
        console.log(`Discovering from Consul:`, query);
        await this.simulateNetworkCall();
        return this.filterInstances(Array.from(this.serviceInstances.values()).flat(), query);
    }
    async discoverFromEtcd(query) {
        console.log(`Discovering from Etcd:`, query);
        await this.simulateNetworkCall();
        return this.filterInstances(Array.from(this.serviceInstances.values()).flat(), query);
    }
    async discoverFromZookeeper(query) {
        console.log(`Discovering from Zookeeper:`, query);
        await this.simulateNetworkCall();
        return this.filterInstances(Array.from(this.serviceInstances.values()).flat(), query);
    }
    async discoverFromMemory(query) {
        const allInstances = Array.from(this.serviceInstances.values()).flat();
        return this.filterInstances(allInstances, query);
    }
    async performHttpHealthCheck(_registration, startTime) {
        await this.simulateNetworkCall(100);
        return {
            status: 'healthy',
            lastCheck: new Date().toISOString(),
            consecutiveFailures: 0,
            responseTime: Date.now() - startTime
        };
    }
    async performTcpHealthCheck(_registration, startTime) {
        await this.simulateNetworkCall(50);
        return {
            status: 'healthy',
            lastCheck: new Date().toISOString(),
            consecutiveFailures: 0,
            responseTime: Date.now() - startTime
        };
    }
    async performTtlHealthCheck(registration, startTime) {
        const lastHeartbeat = new Date(registration.lastHeartbeat);
        const now = new Date();
        const timeSinceHeartbeat = now.getTime() - lastHeartbeat.getTime();
        const isHealthy = timeSinceHeartbeat < this.config.ttl;
        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            lastCheck: new Date().toISOString(),
            consecutiveFailures: isHealthy ? 0 : 1,
            message: isHealthy ? 'TTL valid' : 'TTL expired',
            responseTime: Date.now() - startTime
        };
    }
    async updateConsulHealth(serviceId, status) {
        console.log(`Updating Consul health for ${serviceId}:`, status.status);
        await this.simulateNetworkCall();
    }
    async updateEtcdHealth(serviceId, status) {
        console.log(`Updating Etcd health for ${serviceId}:`, status.status);
        await this.simulateNetworkCall();
    }
    async updateZookeeperHealth(serviceId, status) {
        console.log(`Updating Zookeeper health for ${serviceId}:`, status.status);
        await this.simulateNetworkCall();
    }
    async updateMemoryHealth(serviceId, status) {
        for (const instances of this.serviceInstances.values()) {
            const instance = instances.find(i => i.serviceId === serviceId);
            if (instance) {
                instance.healthStatus = status;
                instance.lastSeen = new Date().toISOString();
            }
        }
    }
    filterInstances(instances, query) {
        return instances.filter(instance => {
            if (query.serviceName && instance.serviceName !== query.serviceName) {
                return false;
            }
            if (query.tags && query.tags.length > 0) {
                return true;
            }
            if (query.healthyOnly && instance.healthStatus.status !== 'healthy') {
                return false;
            }
            if (query.region && instance.metadata.region !== query.region) {
                return false;
            }
            if (query.zone && instance.metadata.zone !== query.zone) {
                return false;
            }
            return true;
        });
    }
    startHealthChecking() {
        this.healthCheckInterval = setInterval(async () => {
            for (const registration of this.registeredServices.values()) {
                try {
                    const healthStatus = await this.performHealthCheck(registration);
                    await this.updateHealthStatus(registration.serviceId, healthStatus);
                }
                catch (error) {
                    console.error(`Health check failed for ${registration.serviceName}:`, error);
                }
            }
        }, this.config.healthCheckInterval);
    }
    async simulateNetworkCall(delay = 50) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        this.registeredServices.clear();
        this.serviceInstances.clear();
    }
}
exports.ServiceDiscovery = ServiceDiscovery;
class LoadBalancer {
    config;
    roundRobinCounters = new Map();
    constructor(config) {
        this.config = config;
    }
    selectInstance(instances) {
        if (instances.length === 0) {
            return null;
        }
        const healthyInstances = this.config.healthCheckEnabled
            ? instances.filter(i => i.healthStatus.status === 'healthy')
            : instances;
        if (healthyInstances.length === 0) {
            return this.config.failoverEnabled ? instances[0] : null;
        }
        switch (this.config.strategy) {
            case 'round_robin':
                return this.roundRobinSelect(healthyInstances);
            case 'weighted_round_robin':
                return this.weightedRoundRobinSelect(healthyInstances);
            case 'random':
                return this.randomSelect(healthyInstances);
            case 'least_connections':
                return this.leastConnectionsSelect(healthyInstances);
            default:
                return healthyInstances[0];
        }
    }
    roundRobinSelect(instances) {
        const serviceName = instances[0].serviceName;
        const counter = this.roundRobinCounters.get(serviceName) || 0;
        const selectedIndex = counter % instances.length;
        this.roundRobinCounters.set(serviceName, counter + 1);
        return instances[selectedIndex];
    }
    weightedRoundRobinSelect(instances) {
        const totalWeight = instances.reduce((sum, instance) => sum + instance.metadata.weight, 0);
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        for (const instance of instances) {
            currentWeight += instance.metadata.weight;
            if (random <= currentWeight) {
                return instance;
            }
        }
        return instances[0];
    }
    randomSelect(instances) {
        const randomIndex = Math.floor(Math.random() * instances.length);
        return instances[randomIndex];
    }
    leastConnectionsSelect(instances) {
        return instances[0];
    }
}
exports.LoadBalancer = LoadBalancer;
