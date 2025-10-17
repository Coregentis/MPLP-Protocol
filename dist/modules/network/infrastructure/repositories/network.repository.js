"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryNetworkRepository = void 0;
class MemoryNetworkRepository {
    networks = new Map();
    cache = new Map();
    async save(network) {
        this.networks.set(network.networkId, network);
        this.clearRelatedCache(network.networkId);
        return network;
    }
    async findById(networkId) {
        const cacheKey = `findById:${networkId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const network = this.networks.get(networkId) || null;
        this.cache.set(cacheKey, network);
        return network;
    }
    async findByName(name) {
        const cacheKey = `findByName:${name}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        for (const network of this.networks.values()) {
            if (network.name === name) {
                this.cache.set(cacheKey, network);
                return network;
            }
        }
        this.cache.set(cacheKey, null);
        return null;
    }
    async findByContextId(contextId) {
        const cacheKey = `findByContextId:${contextId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const results = Array.from(this.networks.values()).filter(network => network.contextId === contextId);
        this.cache.set(cacheKey, results);
        return results;
    }
    async findByTopology(topology) {
        const cacheKey = `findByTopology:${topology}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const results = Array.from(this.networks.values()).filter(network => network.topology === topology);
        this.cache.set(cacheKey, results);
        return results;
    }
    async findByStatus(status) {
        const cacheKey = `findByStatus:${status}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const results = Array.from(this.networks.values()).filter(network => network.status === status);
        this.cache.set(cacheKey, results);
        return results;
    }
    async findAll() {
        const cacheKey = 'findAll';
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const results = Array.from(this.networks.values());
        this.cache.set(cacheKey, results);
        return results;
    }
    async findWithPagination(page, limit, filters) {
        let results = Array.from(this.networks.values());
        if (filters) {
            if (filters.contextId) {
                results = results.filter(n => n.contextId === filters.contextId);
            }
            if (filters.topology) {
                results = results.filter(n => n.topology === filters.topology);
            }
            if (filters.status) {
                results = results.filter(n => n.status === filters.status);
            }
            if (filters.createdBy) {
                results = results.filter(n => n.createdBy === filters.createdBy);
            }
        }
        const total = results.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const networks = results.slice(startIndex, endIndex);
        return {
            networks,
            total,
            page,
            limit,
            totalPages
        };
    }
    async update(networkId, updates) {
        const network = this.networks.get(networkId);
        if (!network) {
            return null;
        }
        Object.assign(network, updates);
        this.networks.set(networkId, network);
        this.clearRelatedCache(networkId);
        return network;
    }
    async delete(networkId) {
        const deleted = this.networks.delete(networkId);
        if (deleted) {
            this.clearRelatedCache(networkId);
        }
        return deleted;
    }
    async exists(networkId) {
        return this.networks.has(networkId);
    }
    async findByNodeId(nodeId) {
        const cacheKey = `findByNodeId:${nodeId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const results = Array.from(this.networks.values()).filter(network => network.nodes.some(node => node.nodeId === nodeId));
        this.cache.set(cacheKey, results);
        return results;
    }
    async findByAgentId(agentId) {
        const cacheKey = `findByAgentId:${agentId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const results = Array.from(this.networks.values()).filter(network => network.nodes.some(node => node.agentId === agentId));
        this.cache.set(cacheKey, results);
        return results;
    }
    async findActiveNetworks() {
        return this.findByStatus('active');
    }
    async findByPerformanceThreshold(metric, threshold, operator) {
        const results = Array.from(this.networks.values()).filter(network => {
            const metricValue = network.performanceMetrics.metrics[metric];
            if (typeof metricValue !== 'number')
                return false;
            switch (operator) {
                case 'gt': return metricValue > threshold;
                case 'lt': return metricValue < threshold;
                case 'eq': return metricValue === threshold;
                default: return false;
            }
        });
        return results;
    }
    async search(query, filters) {
        const queryLower = query.toLowerCase();
        let results = Array.from(this.networks.values()).filter(network => {
            const nameMatch = network.name.toLowerCase().includes(queryLower);
            const descMatch = network.description?.toLowerCase().includes(queryLower) || false;
            const tagMatch = network.searchMetadata.tags.some(tag => tag.toLowerCase().includes(queryLower));
            const keywordMatch = network.searchMetadata.keywords.some(keyword => keyword.toLowerCase().includes(queryLower));
            return nameMatch || descMatch || tagMatch || keywordMatch;
        });
        if (filters) {
            if (filters.topology) {
                results = results.filter(n => n.topology === filters.topology);
            }
            if (filters.status) {
                results = results.filter(n => n.status === filters.status);
            }
            if (filters.tags && filters.tags.length > 0) {
                results = results.filter(n => filters.tags.some(tag => n.searchMetadata.tags.includes(tag)));
            }
        }
        return results;
    }
    async getStatistics() {
        const networks = Array.from(this.networks.values());
        const totalNetworks = networks.length;
        const activeNetworks = networks.filter(n => n.status === 'active').length;
        const totalNodes = networks.reduce((sum, n) => sum + n.nodes.length, 0);
        const totalEdges = networks.reduce((sum, n) => sum + n.edges.length, 0);
        const topologyDistribution = {};
        const statusDistribution = {};
        networks.forEach(network => {
            topologyDistribution[network.topology] = (topologyDistribution[network.topology] || 0) + 1;
            statusDistribution[network.status] = (statusDistribution[network.status] || 0) + 1;
        });
        return {
            totalNetworks,
            activeNetworks,
            totalNodes,
            totalEdges,
            topologyDistribution,
            statusDistribution
        };
    }
    async saveBatch(networks) {
        networks.forEach(network => {
            this.networks.set(network.networkId, network);
            this.clearRelatedCache(network.networkId);
        });
        return networks;
    }
    async deleteBatch(networkIds) {
        let allDeleted = true;
        networkIds.forEach(id => {
            const deleted = this.networks.delete(id);
            if (deleted) {
                this.clearRelatedCache(id);
            }
            else {
                allDeleted = false;
            }
        });
        return allDeleted;
    }
    async clearCache() {
        this.cache.clear();
    }
    async getVersionHistory(networkId) {
        const network = this.networks.get(networkId);
        if (!network) {
            return { networkId, versions: [] };
        }
        return {
            networkId,
            versions: network.versionHistory
        };
    }
    async findByCreatedAtRange(startDate, endDate) {
        return Array.from(this.networks.values()).filter(network => {
            const createdAt = network.createdAt;
            return createdAt >= startDate && createdAt <= endDate;
        });
    }
    async findByUpdatedAtRange(startDate, endDate) {
        return Array.from(this.networks.values()).filter(network => {
            const updatedAt = network.updatedAt;
            return updatedAt && updatedAt >= startDate && updatedAt <= endDate;
        });
    }
    async getAuditTrail(networkId, limit, offset) {
        const network = this.networks.get(networkId);
        if (!network) {
            return { networkId, auditEntries: [], total: 0 };
        }
        const total = network.auditTrail.length;
        let auditEntries = network.auditTrail;
        if (offset !== undefined) {
            auditEntries = auditEntries.slice(offset);
        }
        if (limit !== undefined) {
            auditEntries = auditEntries.slice(0, limit);
        }
        return {
            networkId,
            auditEntries,
            total
        };
    }
    async findByTags(tags) {
        return Array.from(this.networks.values()).filter(network => tags.some(tag => network.searchMetadata.tags.includes(tag)));
    }
    async findByKeywords(keywords) {
        return Array.from(this.networks.values()).filter(network => keywords.some(keyword => network.searchMetadata.keywords.includes(keyword)));
    }
    async getTopologyData(networkId) {
        const network = this.networks.get(networkId);
        if (!network) {
            return null;
        }
        const nodes = network.nodes.map(node => ({
            id: node.nodeId,
            type: node.nodeType,
            status: node.status,
            position: node.metadata.position
        }));
        const edges = network.edges.map(edge => ({
            id: edge.edgeId,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            type: edge.edgeType,
            weight: edge.weight
        }));
        return { nodes, edges };
    }
    async updateTopology(networkId, topologyData) {
        const network = this.networks.get(networkId);
        if (!network) {
            return false;
        }
        topologyData.nodes.forEach(nodeData => {
            const node = network.getNode(nodeData.id);
            if (node && nodeData.position) {
                node.metadata.position = nodeData.position;
            }
        });
        topologyData.edges.forEach(edgeData => {
            const edge = network.edges.find(e => e.sourceNodeId === edgeData.source && e.targetNodeId === edgeData.target);
            if (edge && edgeData.weight !== undefined) {
                edge.updateWeight(edgeData.weight);
            }
        });
        this.clearRelatedCache(networkId);
        return true;
    }
    async getHealthStatus(networkId) {
        const network = this.networks.get(networkId);
        if (!network) {
            return null;
        }
        const stats = network.getNetworkStats();
        const issues = [];
        const recommendations = [];
        if (stats.onlineNodes === 0) {
            issues.push('No online nodes');
            recommendations.push('Activate at least one node');
        }
        if (stats.activeEdges === 0) {
            issues.push('No active connections');
            recommendations.push('Establish connections between nodes');
        }
        if (stats.topologyEfficiency < 0.5) {
            issues.push('Low topology efficiency');
            recommendations.push('Optimize network topology');
        }
        const healthScore = Math.max(0, Math.min(1, (stats.onlineNodes / Math.max(stats.totalNodes, 1)) * 0.4 +
            (stats.activeEdges / Math.max(stats.totalEdges, 1)) * 0.3 +
            stats.topologyEfficiency * 0.3));
        return {
            networkId,
            isHealthy: network.isHealthy(),
            healthScore,
            issues,
            recommendations
        };
    }
    clearRelatedCache(networkId) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.includes(networkId) ||
                key.startsWith('findAll') ||
                key.startsWith('findBy')) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }
}
exports.MemoryNetworkRepository = MemoryNetworkRepository;
