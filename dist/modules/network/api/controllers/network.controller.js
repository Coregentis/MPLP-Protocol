"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkController = void 0;
const network_mapper_1 = require("../mappers/network.mapper");
class NetworkController {
    networkManagementService;
    constructor(networkManagementService) {
        this.networkManagementService = networkManagementService;
    }
    async createNetwork(createDto) {
        const network = await this.networkManagementService.createNetwork({
            contextId: createDto.contextId,
            name: createDto.name,
            description: createDto.description,
            topology: createDto.topology,
            nodes: createDto.nodes,
            discoveryMechanism: createDto.discoveryMechanism,
            routingStrategy: createDto.routingStrategy,
            createdBy: createDto.createdBy
        });
        return network_mapper_1.NetworkMapper.toDto(network);
    }
    async getNetworkById(networkId) {
        const network = await this.networkManagementService.getNetworkById(networkId);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async getNetworkByName(name) {
        const network = await this.networkManagementService.getNetworkByName(name);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async getNetworksByContextId(contextId) {
        const networks = await this.networkManagementService.getNetworksByContextId(contextId);
        return network_mapper_1.NetworkMapper.toDtoArray(networks);
    }
    async updateNetwork(networkId, updateDto) {
        const network = await this.networkManagementService.updateNetwork(networkId, updateDto);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async deleteNetwork(networkId) {
        return await this.networkManagementService.deleteNetwork(networkId);
    }
    async addNodeToNetwork(networkId, addNodeDto) {
        const network = await this.networkManagementService.addNodeToNetwork(networkId, {
            agentId: addNodeDto.agentId,
            nodeType: addNodeDto.nodeType,
            capabilities: addNodeDto.capabilities,
            address: addNodeDto.address
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async removeNodeFromNetwork(networkId, nodeId) {
        const network = await this.networkManagementService.removeNodeFromNetwork(networkId, nodeId);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async updateNodeStatus(networkId, nodeId, updateStatusDto) {
        const network = await this.networkManagementService.updateNodeStatus(networkId, nodeId, updateStatusDto.status);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async addEdgeToNetwork(networkId, addEdgeDto) {
        const network = await this.networkManagementService.addEdgeToNetwork(networkId, {
            sourceNodeId: addEdgeDto.sourceNodeId,
            targetNodeId: addEdgeDto.targetNodeId,
            edgeType: addEdgeDto.edgeType,
            direction: addEdgeDto.direction,
            weight: addEdgeDto.weight
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async getNetworkStatistics(networkId) {
        const stats = await this.networkManagementService.getNetworkStatistics(networkId);
        return stats;
    }
    async checkNetworkHealth(networkId) {
        return await this.networkManagementService.checkNetworkHealth(networkId);
    }
    async getNodeNeighbors(networkId, nodeId) {
        const neighbors = await this.networkManagementService.getNodeNeighbors(networkId, nodeId);
        return neighbors ? neighbors.map(node => ({
            nodeId: node.nodeId,
            agentId: node.agentId,
            nodeType: node.nodeType,
            status: node.status,
            capabilities: node.capabilities,
            address: node.address,
            metadata: node.metadata
        })) : null;
    }
    async searchNetworks(searchDto) {
        const networks = await this.networkManagementService.searchNetworks(searchDto.query, searchDto.filters);
        return network_mapper_1.NetworkMapper.toDtoArray(networks);
    }
    async getGlobalStatistics() {
        return await this.networkManagementService.getGlobalStatistics();
    }
    async getNetworksWithPagination(paginationDto) {
        return {
            networks: [],
            total: 0,
            page: paginationDto.page,
            limit: paginationDto.limit,
            totalPages: 0
        };
    }
    async getNetworkHealthDetails(networkId) {
        const isHealthy = await this.networkManagementService.checkNetworkHealth(networkId);
        if (isHealthy === null) {
            return null;
        }
        return {
            networkId,
            isHealthy,
            healthScore: isHealthy ? 1.0 : 0.0,
            issues: isHealthy ? [] : ['Network is not healthy'],
            recommendations: isHealthy ? [] : ['Check network connectivity']
        };
    }
    async getNetworkTopology(_networkId) {
        return null;
    }
    async updateNetworkTopology(_networkId, _topologyDto) {
        return false;
    }
    async getNetworkAuditTrail(_networkId, _limit, _offset) {
        return null;
    }
    async getNetworkVersionHistory(_networkId) {
        return null;
    }
    async getNetworksByTags(_tags) {
        return [];
    }
    async getNetworksByKeywords(_keywords) {
        return [];
    }
    async activateNetwork(networkId) {
        const network = await this.networkManagementService.updateNetwork(networkId, {
            status: 'active'
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async deactivateNetwork(networkId) {
        const network = await this.networkManagementService.updateNetwork(networkId, {
            status: 'inactive'
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async restartNetwork(networkId) {
        await this.networkManagementService.updateNetwork(networkId, {
            status: 'inactive'
        });
        await new Promise(resolve => setTimeout(resolve, 100));
        const network = await this.networkManagementService.updateNetwork(networkId, {
            status: 'active'
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    async getNetworkPerformanceMetrics(networkId) {
        const network = await this.networkManagementService.getNetworkById(networkId);
        return network ? network.performanceMetrics : null;
    }
    async updateNetworkPerformanceMetrics(networkId, metrics) {
        const network = await this.networkManagementService.updateNetwork(networkId, {
            performanceMetrics: metrics
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
}
exports.NetworkController = NetworkController;
