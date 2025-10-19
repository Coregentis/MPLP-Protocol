"use strict";
/**
 * Network领域实体
 *
 * @description Network模块的核心领域实体，基于DDD架构设计
 * @version 1.0.0
 * @layer 领域层 - 实体
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkEntity = exports.NetworkEdge = exports.NetworkNode = void 0;
/**
 * 网络节点实体
 */
class NetworkNode {
    constructor(nodeId, agentId, nodeType, status, capabilities = [], address, metadata = {}) {
        this.nodeId = nodeId;
        this.agentId = agentId;
        this.nodeType = nodeType;
        this.status = status;
        this.capabilities = capabilities;
        this.address = address;
        this.metadata = metadata;
    }
    /**
     * 更新节点状态
     */
    updateStatus(newStatus) {
        this.status = newStatus;
    }
    /**
     * 添加能力
     */
    addCapability(capability) {
        if (!this.capabilities.includes(capability)) {
            this.capabilities.push(capability);
        }
    }
    /**
     * 移除能力
     */
    removeCapability(capability) {
        const index = this.capabilities.indexOf(capability);
        if (index > -1) {
            this.capabilities.splice(index, 1);
        }
    }
    /**
     * 检查是否在线
     */
    isOnline() {
        return this.status === 'online';
    }
    /**
     * 检查是否具有特定能力
     */
    hasCapability(capability) {
        return this.capabilities.includes(capability);
    }
}
exports.NetworkNode = NetworkNode;
/**
 * 网络边缘连接实体
 */
class NetworkEdge {
    constructor(edgeId, sourceNodeId, targetNodeId, edgeType, direction, status, weight = 1.0, metadata = {}) {
        this.edgeId = edgeId;
        this.sourceNodeId = sourceNodeId;
        this.targetNodeId = targetNodeId;
        this.edgeType = edgeType;
        this.direction = direction;
        this.status = status;
        this.weight = weight;
        this.metadata = metadata;
    }
    /**
     * 更新边缘状态
     */
    updateStatus(newStatus) {
        this.status = newStatus;
    }
    /**
     * 更新权重
     */
    updateWeight(newWeight) {
        if (newWeight >= 0) {
            this.weight = newWeight;
        }
    }
    /**
     * 检查连接是否活跃
     */
    isActive() {
        return this.status === 'active';
    }
}
exports.NetworkEdge = NetworkEdge;
/**
 * Network核心实体
 */
class NetworkEntity {
    constructor(data) {
        this.networkId = data.networkId;
        this.protocolVersion = data.protocolVersion;
        this.timestamp = data.timestamp;
        this.contextId = data.contextId;
        this.name = data.name;
        this.topology = data.topology;
        this.nodes = data.nodes || [];
        this.discoveryMechanism = data.discoveryMechanism;
        this.routingStrategy = data.routingStrategy;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.auditTrail = data.auditTrail || [];
        this.monitoringIntegration = data.monitoringIntegration;
        this.performanceMetrics = data.performanceMetrics;
        this.versionHistory = data.versionHistory || [];
        this.searchMetadata = data.searchMetadata;
        this.networkOperation = data.networkOperation;
        this.eventIntegration = data.eventIntegration;
        this.description = data.description;
        this.edges = data.edges || [];
        this.updatedAt = data.updatedAt;
    }
    /**
     * 添加节点
     */
    addNode(node) {
        if (!this.nodes.find(n => n.nodeId === node.nodeId)) {
            this.nodes.push(node);
            this.addAuditEntry('node_added', 'system', { nodeId: node.nodeId });
        }
    }
    /**
     * 移除节点
     */
    removeNode(nodeId) {
        const index = this.nodes.findIndex(n => n.nodeId === nodeId);
        if (index > -1) {
            this.nodes.splice(index, 1);
            this.addAuditEntry('node_removed', 'system', { nodeId });
            return true;
        }
        return false;
    }
    /**
     * 获取节点
     */
    getNode(nodeId) {
        return this.nodes.find(n => n.nodeId === nodeId);
    }
    /**
     * 获取在线节点
     */
    getOnlineNodes() {
        return this.nodes.filter(node => node.isOnline());
    }
    /**
     * 添加边缘连接
     */
    addEdge(edge) {
        if (!this.edges.find(e => e.edgeId === edge.edgeId)) {
            this.edges.push(edge);
            this.addAuditEntry('edge_added', 'system', { edgeId: edge.edgeId });
        }
    }
    /**
     * 移除边缘连接
     */
    removeEdge(edgeId) {
        const index = this.edges.findIndex(e => e.edgeId === edgeId);
        if (index > -1) {
            this.edges.splice(index, 1);
            this.addAuditEntry('edge_removed', 'system', { edgeId });
            return true;
        }
        return false;
    }
    /**
     * 更新网络状态
     */
    updateStatus(newStatus) {
        const oldStatus = this.status;
        this.status = newStatus;
        this.updatedAt = new Date();
        this.addAuditEntry('status_changed', 'system', {
            oldStatus,
            newStatus
        });
    }
    /**
     * 添加审计条目
     */
    addAuditEntry(action, actor, details) {
        this.auditTrail.push({
            timestamp: new Date().toISOString(),
            action,
            actor,
            details
        });
    }
    /**
     * 获取网络统计信息
     */
    getNetworkStats() {
        const totalNodes = this.nodes.length;
        const onlineNodes = this.getOnlineNodes().length;
        const totalEdges = this.edges.length;
        const activeEdges = this.edges.filter(e => e.isActive()).length;
        // 简单的拓扑效率计算
        const topologyEfficiency = totalNodes > 0 ? (activeEdges / Math.max(totalNodes - 1, 1)) : 0;
        return {
            totalNodes,
            onlineNodes,
            totalEdges,
            activeEdges,
            topologyEfficiency: Math.min(topologyEfficiency, 1.0)
        };
    }
    /**
     * 检查网络是否健康
     */
    isHealthy() {
        const stats = this.getNetworkStats();
        return stats.onlineNodes > 0 &&
            stats.activeEdges > 0 &&
            this.status === 'active';
    }
    /**
     * 获取节点的邻居
     */
    getNodeNeighbors(nodeId) {
        const neighbors = [];
        for (const edge of this.edges) {
            if (edge.isActive()) {
                if (edge.sourceNodeId === nodeId) {
                    const neighbor = this.getNode(edge.targetNodeId);
                    if (neighbor)
                        neighbors.push(neighbor);
                }
                else if (edge.targetNodeId === nodeId && edge.direction === 'bidirectional') {
                    const neighbor = this.getNode(edge.sourceNodeId);
                    if (neighbor)
                        neighbors.push(neighbor);
                }
            }
        }
        return neighbors;
    }
}
exports.NetworkEntity = NetworkEntity;
//# sourceMappingURL=network.entity.js.map