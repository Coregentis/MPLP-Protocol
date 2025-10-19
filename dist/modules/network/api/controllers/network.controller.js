"use strict";
/**
 * Network控制器
 *
 * @description Network模块的API控制器，基于DDD架构
 * @version 1.0.0
 * @layer API层 - 控制器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkController = void 0;
const network_mapper_1 = require("../mappers/network.mapper");
/**
 * Network控制器
 */
class NetworkController {
    constructor(networkManagementService) {
        this.networkManagementService = networkManagementService;
    }
    /**
     * 创建新网络
     */
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
    /**
     * 根据ID获取网络
     */
    async getNetworkById(networkId) {
        const network = await this.networkManagementService.getNetworkById(networkId);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 根据名称获取网络
     */
    async getNetworkByName(name) {
        const network = await this.networkManagementService.getNetworkByName(name);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 根据上下文ID获取网络列表
     */
    async getNetworksByContextId(contextId) {
        const networks = await this.networkManagementService.getNetworksByContextId(contextId);
        return network_mapper_1.NetworkMapper.toDtoArray(networks);
    }
    /**
     * 更新网络
     */
    async updateNetwork(networkId, updateDto) {
        const network = await this.networkManagementService.updateNetwork(networkId, updateDto);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 删除网络
     */
    async deleteNetwork(networkId) {
        return await this.networkManagementService.deleteNetwork(networkId);
    }
    /**
     * 添加节点到网络
     */
    async addNodeToNetwork(networkId, addNodeDto) {
        const network = await this.networkManagementService.addNodeToNetwork(networkId, {
            agentId: addNodeDto.agentId,
            nodeType: addNodeDto.nodeType,
            capabilities: addNodeDto.capabilities,
            address: addNodeDto.address
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 从网络移除节点
     */
    async removeNodeFromNetwork(networkId, nodeId) {
        const network = await this.networkManagementService.removeNodeFromNetwork(networkId, nodeId);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 更新节点状态
     */
    async updateNodeStatus(networkId, nodeId, updateStatusDto) {
        const network = await this.networkManagementService.updateNodeStatus(networkId, nodeId, updateStatusDto.status);
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 添加边缘连接
     */
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
    /**
     * 获取网络统计信息
     */
    async getNetworkStatistics(networkId) {
        const stats = await this.networkManagementService.getNetworkStatistics(networkId);
        return stats;
    }
    /**
     * 检查网络健康状态
     */
    async checkNetworkHealth(networkId) {
        return await this.networkManagementService.checkNetworkHealth(networkId);
    }
    /**
     * 获取节点的邻居
     */
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
    /**
     * 搜索网络
     */
    async searchNetworks(searchDto) {
        const networks = await this.networkManagementService.searchNetworks(searchDto.query, searchDto.filters);
        return network_mapper_1.NetworkMapper.toDtoArray(networks);
    }
    /**
     * 获取全局统计信息
     */
    async getGlobalStatistics() {
        return await this.networkManagementService.getGlobalStatistics();
    }
    /**
     * 分页查询网络
     */
    async getNetworksWithPagination(paginationDto) {
        // 注意：这里需要在仓储层实现分页查询方法
        // 暂时返回模拟数据结构
        return {
            networks: [],
            total: 0,
            page: paginationDto.page,
            limit: paginationDto.limit,
            totalPages: 0
        };
    }
    /**
     * 获取网络健康详情
     */
    async getNetworkHealthDetails(networkId) {
        // 注意：这里需要在服务层实现健康详情方法
        // 暂时返回基础健康检查
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
    /**
     * 获取网络拓扑数据
     */
    async getNetworkTopology(_networkId) {
        // 注意：这里需要在仓储层实现拓扑数据获取方法
        // 暂时返回null，需要后续实现
        return null;
    }
    /**
     * 更新网络拓扑
     */
    async updateNetworkTopology(_networkId, _topologyDto) {
        // 注意：这里需要在仓储层实现拓扑更新方法
        // 暂时返回false，需要后续实现
        return false;
    }
    /**
     * 获取网络的审计追踪
     */
    async getNetworkAuditTrail(_networkId, _limit, _offset) {
        // 注意：这里需要在仓储层实现审计追踪获取方法
        // 暂时返回null，需要后续实现
        return null;
    }
    /**
     * 获取网络的版本历史
     */
    async getNetworkVersionHistory(_networkId) {
        // 注意：这里需要在仓储层实现版本历史获取方法
        // 暂时返回null，需要后续实现
        return null;
    }
    /**
     * 根据标签查找网络
     */
    async getNetworksByTags(_tags) {
        // 注意：这里需要在仓储层实现标签查询方法
        // 暂时返回空数组，需要后续实现
        return [];
    }
    /**
     * 根据关键词查找网络
     */
    async getNetworksByKeywords(_keywords) {
        // 注意：这里需要在仓储层实现关键词查询方法
        // 暂时返回空数组，需要后续实现
        return [];
    }
    /**
     * 激活网络
     */
    async activateNetwork(networkId) {
        const network = await this.networkManagementService.updateNetwork(networkId, {
            status: 'active'
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 停用网络
     */
    async deactivateNetwork(networkId) {
        const network = await this.networkManagementService.updateNetwork(networkId, {
            status: 'inactive'
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 重启网络
     */
    async restartNetwork(networkId) {
        // 先停用再激活
        await this.networkManagementService.updateNetwork(networkId, {
            status: 'inactive'
        });
        // 等待一小段时间
        await new Promise(resolve => setTimeout(resolve, 100));
        const network = await this.networkManagementService.updateNetwork(networkId, {
            status: 'active'
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
    /**
     * 获取网络性能指标
     */
    async getNetworkPerformanceMetrics(networkId) {
        const network = await this.networkManagementService.getNetworkById(networkId);
        return network ? network.performanceMetrics : null;
    }
    /**
     * 更新网络性能指标
     */
    async updateNetworkPerformanceMetrics(networkId, metrics) {
        const network = await this.networkManagementService.updateNetwork(networkId, {
            performanceMetrics: metrics
        });
        return network ? network_mapper_1.NetworkMapper.toDto(network) : null;
    }
}
exports.NetworkController = NetworkController;
//# sourceMappingURL=network.controller.js.map