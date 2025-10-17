"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkManagementService = void 0;
const network_entity_1 = require("../../domain/entities/network.entity");
class NetworkManagementService {
    networkRepository;
    constructor(networkRepository) {
        this.networkRepository = networkRepository;
    }
    async createNetwork(data) {
        const networkId = this.generateNetworkId();
        const nodes = data.nodes.map(nodeData => {
            const nodeId = this.generateNodeId();
            return new network_entity_1.NetworkNode(nodeId, nodeData.agentId, nodeData.nodeType, 'offline', nodeData.capabilities || [], nodeData.address, {});
        });
        const network = new network_entity_1.NetworkEntity({
            networkId,
            protocolVersion: '1.0.0',
            timestamp: new Date(),
            contextId: data.contextId,
            name: data.name,
            topology: data.topology,
            nodes,
            discoveryMechanism: data.discoveryMechanism,
            routingStrategy: data.routingStrategy,
            status: 'pending',
            createdAt: new Date(),
            createdBy: data.createdBy,
            auditTrail: [],
            monitoringIntegration: { enabled: false, endpoints: [], configuration: {} },
            performanceMetrics: { enabled: false, collectionIntervalSeconds: 60, metrics: {} },
            versionHistory: [],
            searchMetadata: { tags: [], keywords: [], categories: [], indexed: false },
            networkOperation: 'connect',
            eventIntegration: { enabled: false, eventTypes: [], configuration: {} },
            description: data.description,
            edges: [],
            updatedAt: undefined
        });
        return await this.networkRepository.save(network);
    }
    async getNetworkById(networkId) {
        return await this.networkRepository.findById(networkId);
    }
    async getNetworkByName(name) {
        return await this.networkRepository.findByName(name);
    }
    async getNetworksByContextId(contextId) {
        return await this.networkRepository.findByContextId(contextId);
    }
    async updateNetwork(networkId, data) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            return null;
        }
        if (data.name !== undefined) {
            network.name = data.name;
        }
        if (data.description !== undefined) {
            network.description = data.description;
        }
        if (data.status !== undefined) {
            network.updateStatus(data.status);
        }
        if (data.discoveryMechanism !== undefined) {
            network.discoveryMechanism = data.discoveryMechanism;
        }
        if (data.routingStrategy !== undefined) {
            network.routingStrategy = data.routingStrategy;
        }
        if (data.performanceMetrics !== undefined) {
            network.performanceMetrics = data.performanceMetrics;
        }
        if (data.monitoringIntegration !== undefined) {
            network.monitoringIntegration = data.monitoringIntegration;
        }
        if (data.searchMetadata !== undefined) {
            network.searchMetadata = data.searchMetadata;
        }
        if (data.eventIntegration !== undefined) {
            network.eventIntegration = data.eventIntegration;
        }
        network.updatedAt = new Date();
        return await this.networkRepository.save(network);
    }
    async deleteNetwork(networkId) {
        return await this.networkRepository.delete(networkId);
    }
    async addNodeToNetwork(networkId, nodeData) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            return null;
        }
        const nodeId = this.generateNodeId();
        const node = new network_entity_1.NetworkNode(nodeId, nodeData.agentId, nodeData.nodeType, 'offline', nodeData.capabilities || [], nodeData.address, {});
        network.addNode(node);
        return await this.networkRepository.save(network);
    }
    async removeNodeFromNetwork(networkId, nodeId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            return null;
        }
        const removed = network.removeNode(nodeId);
        if (!removed) {
            return null;
        }
        return await this.networkRepository.save(network);
    }
    async updateNodeStatus(networkId, nodeId, status) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            return null;
        }
        const node = network.getNode(nodeId);
        if (!node) {
            return null;
        }
        node.updateStatus(status);
        return await this.networkRepository.save(network);
    }
    async addEdgeToNetwork(networkId, edgeData) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            return null;
        }
        const edgeId = this.generateEdgeId();
        const edge = new network_entity_1.NetworkEdge(edgeId, edgeData.sourceNodeId, edgeData.targetNodeId, edgeData.edgeType, edgeData.direction, 'active', edgeData.weight || 1.0, {});
        network.addEdge(edge);
        return await this.networkRepository.save(network);
    }
    async getNetworkStatistics(networkId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            return null;
        }
        return network.getNetworkStats();
    }
    async checkNetworkHealth(networkId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            return null;
        }
        return network.isHealthy();
    }
    async getNodeNeighbors(networkId, nodeId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            return null;
        }
        return network.getNodeNeighbors(nodeId);
    }
    async searchNetworks(query, filters) {
        return await this.networkRepository.search(query, filters);
    }
    async getGlobalStatistics() {
        const stats = await this.networkRepository.getStatistics();
        return {
            ...stats,
            topologyDistribution: {},
            statusDistribution: {}
        };
    }
    generateNetworkId() {
        return `network-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateEdgeId() {
        return `edge-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
exports.NetworkManagementService = NetworkManagementService;
