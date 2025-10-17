"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkEntity = exports.NetworkEdge = exports.NetworkNode = void 0;
class NetworkNode {
    nodeId;
    agentId;
    nodeType;
    status;
    capabilities;
    address;
    metadata;
    constructor(nodeId, agentId, nodeType, status, capabilities = [], address, metadata = {}) {
        this.nodeId = nodeId;
        this.agentId = agentId;
        this.nodeType = nodeType;
        this.status = status;
        this.capabilities = capabilities;
        this.address = address;
        this.metadata = metadata;
    }
    updateStatus(newStatus) {
        this.status = newStatus;
    }
    addCapability(capability) {
        if (!this.capabilities.includes(capability)) {
            this.capabilities.push(capability);
        }
    }
    removeCapability(capability) {
        const index = this.capabilities.indexOf(capability);
        if (index > -1) {
            this.capabilities.splice(index, 1);
        }
    }
    isOnline() {
        return this.status === 'online';
    }
    hasCapability(capability) {
        return this.capabilities.includes(capability);
    }
}
exports.NetworkNode = NetworkNode;
class NetworkEdge {
    edgeId;
    sourceNodeId;
    targetNodeId;
    edgeType;
    direction;
    status;
    weight;
    metadata;
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
    updateStatus(newStatus) {
        this.status = newStatus;
    }
    updateWeight(newWeight) {
        if (newWeight >= 0) {
            this.weight = newWeight;
        }
    }
    isActive() {
        return this.status === 'active';
    }
}
exports.NetworkEdge = NetworkEdge;
class NetworkEntity {
    networkId;
    protocolVersion;
    timestamp;
    contextId;
    name;
    topology;
    nodes;
    discoveryMechanism;
    routingStrategy;
    status;
    createdAt;
    createdBy;
    auditTrail;
    monitoringIntegration;
    performanceMetrics;
    versionHistory;
    searchMetadata;
    networkOperation;
    eventIntegration;
    description;
    edges;
    updatedAt;
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
    addNode(node) {
        if (!this.nodes.find(n => n.nodeId === node.nodeId)) {
            this.nodes.push(node);
            this.addAuditEntry('node_added', 'system', { nodeId: node.nodeId });
        }
    }
    removeNode(nodeId) {
        const index = this.nodes.findIndex(n => n.nodeId === nodeId);
        if (index > -1) {
            this.nodes.splice(index, 1);
            this.addAuditEntry('node_removed', 'system', { nodeId });
            return true;
        }
        return false;
    }
    getNode(nodeId) {
        return this.nodes.find(n => n.nodeId === nodeId);
    }
    getOnlineNodes() {
        return this.nodes.filter(node => node.isOnline());
    }
    addEdge(edge) {
        if (!this.edges.find(e => e.edgeId === edge.edgeId)) {
            this.edges.push(edge);
            this.addAuditEntry('edge_added', 'system', { edgeId: edge.edgeId });
        }
    }
    removeEdge(edgeId) {
        const index = this.edges.findIndex(e => e.edgeId === edgeId);
        if (index > -1) {
            this.edges.splice(index, 1);
            this.addAuditEntry('edge_removed', 'system', { edgeId });
            return true;
        }
        return false;
    }
    updateStatus(newStatus) {
        const oldStatus = this.status;
        this.status = newStatus;
        this.updatedAt = new Date();
        this.addAuditEntry('status_changed', 'system', {
            oldStatus,
            newStatus
        });
    }
    addAuditEntry(action, actor, details) {
        this.auditTrail.push({
            timestamp: new Date().toISOString(),
            action,
            actor,
            details
        });
    }
    getNetworkStats() {
        const totalNodes = this.nodes.length;
        const onlineNodes = this.getOnlineNodes().length;
        const totalEdges = this.edges.length;
        const activeEdges = this.edges.filter(e => e.isActive()).length;
        const topologyEfficiency = totalNodes > 0 ? (activeEdges / Math.max(totalNodes - 1, 1)) : 0;
        return {
            totalNodes,
            onlineNodes,
            totalEdges,
            activeEdges,
            topologyEfficiency: Math.min(topologyEfficiency, 1.0)
        };
    }
    isHealthy() {
        const stats = this.getNetworkStats();
        return stats.onlineNodes > 0 &&
            stats.activeEdges > 0 &&
            this.status === 'active';
    }
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
