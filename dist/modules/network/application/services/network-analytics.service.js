"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkAnalyticsService = void 0;
class NetworkAnalyticsService {
    networkRepository;
    constructor(networkRepository) {
        this.networkRepository = networkRepository;
    }
    async analyzeNetwork(networkId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            throw new Error(`Network ${networkId} not found`);
        }
        const [performance, topology, security, optimization] = await Promise.all([
            this.analyzePerformance(network),
            this.analyzeTopology(network),
            this.analyzeSecurity(network),
            this.generateOptimizationSuggestions(network)
        ]);
        return {
            networkId,
            timestamp: new Date().toISOString(),
            performance,
            topology,
            security,
            optimization
        };
    }
    async generateHealthReport(networkId) {
        const network = await this.networkRepository.findById(networkId);
        if (!network) {
            throw new Error(`Network ${networkId} not found`);
        }
        const components = await this.assessComponentHealth(network);
        const alerts = await this.detectNetworkAlerts(network);
        const trends = await this.analyzeHealthTrends(network);
        const healthScore = this.calculateOverallHealthScore(components);
        const overallHealth = this.determineOverallHealth(healthScore);
        return {
            networkId,
            overallHealth,
            healthScore,
            timestamp: new Date().toISOString(),
            components,
            alerts,
            trends
        };
    }
    async analyzePerformance(network) {
        const _nodeCount = network.nodes.length;
        const _edgeCount = network.edges.length;
        const averageLatency = this.calculateAverageLatency(network);
        const throughput = this.calculateThroughput(network);
        const reliability = this.calculateReliability(network);
        const availability = this.calculateAvailability(network);
        return {
            averageLatency,
            throughput,
            reliability,
            availability
        };
    }
    async analyzeTopology(network) {
        const efficiency = this.calculateTopologyEfficiency(network);
        const redundancy = this.calculateRedundancy(network);
        const connectivity = this.calculateConnectivity(network);
        const bottlenecks = this.identifyBottlenecks(network);
        return {
            efficiency,
            redundancy,
            connectivity,
            bottlenecks
        };
    }
    async analyzeSecurity(network) {
        const vulnerabilities = this.assessVulnerabilities(network);
        const riskScore = this.calculateSecurityRiskScore(network);
        const recommendations = this.generateSecurityRecommendations(network);
        return {
            vulnerabilities,
            riskScore,
            recommendations
        };
    }
    async generateOptimizationSuggestions(network) {
        const suggestions = this.identifyOptimizationOpportunities(network);
        const potentialImprovement = this.calculatePotentialImprovement(suggestions);
        const implementationComplexity = this.assessImplementationComplexity(suggestions);
        return {
            suggestions,
            potentialImprovement,
            implementationComplexity
        };
    }
    async assessComponentHealth(network) {
        return {
            connectivity: this.assessConnectivityHealth(network),
            performance: this.assessPerformanceHealth(network),
            security: this.assessSecurityHealth(network),
            reliability: this.assessReliabilityHealth(network)
        };
    }
    async detectNetworkAlerts(network) {
        const alerts = [];
        if (network.nodes.length > 0 && network.edges.length === 0) {
            alerts.push({
                id: `alert-${Date.now()}-1`,
                severity: 'critical',
                type: 'connectivity',
                message: 'Network has nodes but no connections',
                timestamp: new Date().toISOString(),
                affectedNodes: network.nodes.map(n => n.agentId)
            });
        }
        const avgLatency = this.calculateAverageLatency(network);
        if (avgLatency > 200) {
            alerts.push({
                id: `alert-${Date.now()}-2`,
                severity: 'warning',
                type: 'performance',
                message: `High average latency detected: ${avgLatency}ms`,
                timestamp: new Date().toISOString(),
                affectedNodes: []
            });
        }
        const errorNodes = network.nodes.filter(n => n.status === 'error');
        if (errorNodes.length > 0) {
            alerts.push({
                id: `alert-${Date.now()}-3`,
                severity: 'error',
                type: 'connectivity',
                message: `${errorNodes.length} nodes in error state`,
                timestamp: new Date().toISOString(),
                affectedNodes: errorNodes.map(n => n.agentId)
            });
        }
        const offlineNodes = network.nodes.filter(n => n.status === 'offline');
        if (offlineNodes.length > 0) {
            alerts.push({
                id: `alert-${Date.now()}-4`,
                severity: 'warning',
                type: 'connectivity',
                message: `${offlineNodes.length} nodes are offline`,
                timestamp: new Date().toISOString(),
                affectedNodes: offlineNodes.map(n => n.agentId)
            });
        }
        const unencryptedEdges = network.edges.filter(e => !e.metadata.encrypted || e.metadata.encrypted === false);
        if (unencryptedEdges.length > 0) {
            alerts.push({
                id: `alert-${Date.now()}-5`,
                severity: 'warning',
                type: 'security',
                message: `${unencryptedEdges.length} unencrypted connections detected`,
                timestamp: new Date().toISOString(),
                affectedNodes: []
            });
        }
        return alerts;
    }
    async analyzeHealthTrends(_network) {
        return [
            {
                metric: 'latency',
                trend: 'stable',
                changeRate: 0.02,
                timeframe: '24h'
            },
            {
                metric: 'throughput',
                trend: 'improving',
                changeRate: 0.15,
                timeframe: '7d'
            }
        ];
    }
    calculateAverageLatency(network) {
        const baseLatency = 50;
        const nodeLatency = network.nodes.length * 2;
        const topologyFactor = network.topology === 'mesh' ? 0.8 : 1.2;
        return Math.round(baseLatency + nodeLatency * topologyFactor);
    }
    calculateThroughput(network) {
        const basethroughput = 100;
        const connectionBonus = network.edges.length * 10;
        const topologyMultiplier = network.topology === 'mesh' ? 1.5 : 1.0;
        return Math.round(basethroughput + connectionBonus * topologyMultiplier);
    }
    calculateReliability(network) {
        const redundancy = this.calculateRedundancy(network);
        const connectivity = this.calculateConnectivity(network);
        return Math.min(0.95, (redundancy + connectivity) / 2);
    }
    calculateAvailability(network) {
        const baseAvailability = 0.99;
        if (network.nodes.length === 0) {
            return 1;
        }
        const nodeHealthFactor = network.nodes.filter(n => n.status === 'online').length / network.nodes.length;
        return Math.min(0.999, baseAvailability * nodeHealthFactor);
    }
    calculateTopologyEfficiency(network) {
        const nodeCount = network.nodes.length;
        const edgeCount = network.edges.length;
        if (nodeCount <= 1)
            return 1;
        const optimalEdges = nodeCount - 1;
        const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
        const efficiency = 1 - Math.abs(edgeCount - optimalEdges) / maxEdges;
        return Math.max(0, Math.min(1, efficiency));
    }
    calculateRedundancy(network) {
        const nodeCount = network.nodes.length;
        const edgeCount = network.edges.length;
        if (nodeCount <= 1)
            return 0;
        const minEdges = nodeCount - 1;
        const redundantEdges = Math.max(0, edgeCount - minEdges);
        const maxRedundantEdges = ((nodeCount * (nodeCount - 1)) / 2) - minEdges;
        return maxRedundantEdges > 0 ? redundantEdges / maxRedundantEdges : 0;
    }
    calculateConnectivity(network) {
        if (network.nodes.length <= 1)
            return 1;
        return network.edges.length > 0 ? 0.8 : 0;
    }
    identifyBottlenecks(network) {
        const bottlenecks = [];
        const nodeConnections = new Map();
        network.edges.forEach(edge => {
            nodeConnections.set(edge.sourceNodeId, (nodeConnections.get(edge.sourceNodeId) || 0) + 1);
            nodeConnections.set(edge.targetNodeId, (nodeConnections.get(edge.targetNodeId) || 0) + 1);
        });
        const avgConnections = Array.from(nodeConnections.values()).reduce((a, b) => a + b, 0) / nodeConnections.size;
        nodeConnections.forEach((connections, nodeId) => {
            if (connections > avgConnections * 2) {
                bottlenecks.push(nodeId);
            }
        });
        return bottlenecks;
    }
    assessVulnerabilities(network) {
        let vulnerabilities = 0;
        if (network.nodes.length === 1)
            vulnerabilities += 1;
        const unencryptedEdges = network.edges.filter(e => !e.metadata.encrypted || e.metadata.encrypted === false);
        vulnerabilities += unencryptedEdges.length;
        return vulnerabilities;
    }
    calculateSecurityRiskScore(network) {
        const vulnerabilities = this.assessVulnerabilities(network);
        const baseRisk = 20;
        const vulnerabilityRisk = vulnerabilities * 15;
        return Math.min(100, baseRisk + vulnerabilityRisk);
    }
    generateSecurityRecommendations(network) {
        const recommendations = [];
        if (network.nodes.length === 1) {
            recommendations.push('Add redundant nodes to eliminate single point of failure');
        }
        const unencryptedEdges = network.edges.filter(e => !e.metadata.encrypted || e.metadata.encrypted === false);
        if (unencryptedEdges.length > 0) {
            recommendations.push('Enable encryption for all network connections');
        }
        if (recommendations.length === 0) {
            recommendations.push('Network security configuration appears optimal');
        }
        return recommendations;
    }
    identifyOptimizationOpportunities(network) {
        const suggestions = [];
        const efficiency = this.calculateTopologyEfficiency(network);
        if (efficiency < 0.7) {
            suggestions.push({
                type: 'topology',
                priority: 'high',
                description: 'Optimize network topology for better efficiency',
                expectedImprovement: (0.8 - efficiency) * 100,
                implementationCost: 50,
                riskLevel: 'medium'
            });
        }
        const bottlenecks = this.identifyBottlenecks(network);
        if (bottlenecks.length > 0) {
            suggestions.push({
                type: 'load_balancing',
                priority: 'medium',
                description: 'Implement load balancing to reduce bottlenecks',
                expectedImprovement: 25,
                implementationCost: 30,
                riskLevel: 'low'
            });
        }
        return suggestions;
    }
    calculatePotentialImprovement(suggestions) {
        return suggestions.reduce((total, suggestion) => total + suggestion.expectedImprovement, 0);
    }
    assessImplementationComplexity(suggestions) {
        const totalCost = suggestions.reduce((total, suggestion) => total + suggestion.implementationCost, 0);
        if (totalCost < 50)
            return 'low';
        if (totalCost < 100)
            return 'medium';
        return 'high';
    }
    calculateOverallHealthScore(components) {
        const scores = [
            components.connectivity.score,
            components.performance.score,
            components.security.score,
            components.reliability.score
        ];
        return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    determineOverallHealth(score) {
        if (score >= 90)
            return 'excellent';
        if (score >= 80)
            return 'good';
        if (score >= 60)
            return 'fair';
        if (score >= 40)
            return 'poor';
        return 'critical';
    }
    assessConnectivityHealth(network) {
        const connectivity = this.calculateConnectivity(network);
        const score = Math.round(connectivity * 100);
        return {
            status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
            score,
            metrics: { connectivity },
            issues: score < 80 ? ['Low network connectivity detected'] : []
        };
    }
    assessPerformanceHealth(network) {
        const latency = this.calculateAverageLatency(network);
        const throughput = this.calculateThroughput(network);
        const score = Math.round(Math.max(0, 100 - (latency - 50) / 2));
        return {
            status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
            score,
            metrics: { latency, throughput },
            issues: latency > 100 ? ['High latency detected'] : []
        };
    }
    assessSecurityHealth(network) {
        const riskScore = this.calculateSecurityRiskScore(network);
        const score = Math.round(Math.max(0, 100 - riskScore));
        return {
            status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
            score,
            metrics: { riskScore },
            issues: riskScore > 40 ? ['Security vulnerabilities detected'] : []
        };
    }
    assessReliabilityHealth(network) {
        const reliability = this.calculateReliability(network);
        const score = Math.round(reliability * 100);
        return {
            status: score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical',
            score,
            metrics: { reliability },
            issues: reliability < 0.8 ? ['Low network reliability'] : []
        };
    }
}
exports.NetworkAnalyticsService = NetworkAnalyticsService;
