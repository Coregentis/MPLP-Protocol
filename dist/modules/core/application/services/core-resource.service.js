"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreResourceService = void 0;
class CoreResourceService {
    coreRepository;
    resourceAllocations = new Map();
    performanceHistory = [];
    constructor(coreRepository) {
        this.coreRepository = coreRepository;
    }
    async allocateResources(executionId, resourceRequirements) {
        const assessment = await this.assessResourceNeeds(resourceRequirements);
        const availability = await this.checkResourceAvailability(assessment);
        const allocation = await this.performResourceAllocation(executionId, assessment, availability);
        this.resourceAllocations.set(allocation.allocationId, allocation);
        return allocation;
    }
    async releaseResources(allocationId) {
        const allocation = this.resourceAllocations.get(allocationId);
        if (!allocation) {
            return false;
        }
        allocation.status = 'released';
        allocation.estimatedReleaseTime = new Date().toISOString();
        this.resourceAllocations.set(allocationId, allocation);
        return true;
    }
    async monitorSystemPerformance() {
        const metrics = await this.collectPerformanceMetrics();
        const trends = await this.analyzePerformanceTrends(metrics);
        const report = await this.generatePerformanceReport(metrics, trends);
        this.performanceHistory.push(report);
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory.splice(0, this.performanceHistory.length - 1000);
        }
        return report;
    }
    async balanceWorkload(workloadData) {
        const currentLoad = await this.analyzeCurrentLoad();
        const optimalAllocation = await this.calculateOptimalAllocation(workloadData, currentLoad);
        const result = await this.performLoadBalancing(workloadData, optimalAllocation);
        return result;
    }
    async getResourceUsageStatistics() {
        const allocations = Array.from(this.resourceAllocations.values());
        const activeAllocations = allocations.filter(a => a.status === 'in_use');
        const completedAllocations = allocations.filter(a => a.status === 'released');
        const averageAllocationDuration = completedAllocations.length > 0
            ? completedAllocations.reduce((sum, allocation) => {
                if (allocation.estimatedReleaseTime) {
                    const duration = new Date(allocation.estimatedReleaseTime).getTime() -
                        new Date(allocation.allocationTime).getTime();
                    return sum + duration;
                }
                return sum;
            }, 0) / completedAllocations.length
            : 0;
        const totalResources = {
            cpu: 100,
            memory: 32768,
            disk: 1048576,
            network: 10000
        };
        const usedResources = activeAllocations.reduce((sum, allocation) => ({
            cpu: sum.cpu + allocation.allocatedResources.cpuCores,
            memory: sum.memory + allocation.allocatedResources.memoryMb,
            disk: sum.disk + allocation.allocatedResources.diskSpaceMb,
            network: sum.network + allocation.allocatedResources.networkBandwidthMbps
        }), { cpu: 0, memory: 0, disk: 0, network: 0 });
        const resourceUtilization = {
            cpu: (usedResources.cpu / totalResources.cpu) * 100,
            memory: (usedResources.memory / totalResources.memory) * 100,
            disk: (usedResources.disk / totalResources.disk) * 100,
            network: (usedResources.network / totalResources.network) * 100
        };
        return {
            totalAllocations: allocations.length,
            activeAllocations: activeAllocations.length,
            averageAllocationDuration,
            resourceUtilization
        };
    }
    getPerformanceHistory(hours = 24) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.performanceHistory.filter(metric => new Date(metric.timestamp) >= cutoffTime);
    }
    async assessResourceNeeds(requirements) {
        const priorityMultiplier = {
            'low': 0.8,
            'medium': 1.0,
            'high': 1.3,
            'critical': 1.6
        };
        const multiplier = priorityMultiplier[requirements.priority];
        return {
            cpuCores: Math.ceil((requirements.cpuCores || 2) * multiplier),
            memoryMb: Math.ceil((requirements.memoryMb || 1024) * multiplier),
            diskSpaceMb: Math.ceil((requirements.diskSpaceMb || 512) * multiplier),
            networkBandwidthMbps: Math.ceil((requirements.networkBandwidthMbps || 100) * multiplier),
            priority: requirements.priority,
            estimatedDurationMs: requirements.estimatedDurationMs
        };
    }
    async checkResourceAvailability(requirements) {
        const totalResources = {
            cpuCores: 100,
            memoryMb: 32768,
            diskSpaceMb: 1048576,
            networkBandwidthMbps: 10000
        };
        const activeAllocations = Array.from(this.resourceAllocations.values())
            .filter(a => a.status === 'in_use');
        const usedResources = activeAllocations.reduce((sum, allocation) => ({
            cpuCores: sum.cpuCores + allocation.allocatedResources.cpuCores,
            memoryMb: sum.memoryMb + allocation.allocatedResources.memoryMb,
            diskSpaceMb: sum.diskSpaceMb + allocation.allocatedResources.diskSpaceMb,
            networkBandwidthMbps: sum.networkBandwidthMbps + allocation.allocatedResources.networkBandwidthMbps
        }), { cpuCores: 0, memoryMb: 0, diskSpaceMb: 0, networkBandwidthMbps: 0 });
        const availableResources = {
            cpuCores: totalResources.cpuCores - usedResources.cpuCores,
            memoryMb: totalResources.memoryMb - usedResources.memoryMb,
            diskSpaceMb: totalResources.diskSpaceMb - usedResources.diskSpaceMb,
            networkBandwidthMbps: totalResources.networkBandwidthMbps - usedResources.networkBandwidthMbps
        };
        const available = availableResources.cpuCores >= (requirements.cpuCores || 0) &&
            availableResources.memoryMb >= (requirements.memoryMb || 0) &&
            availableResources.diskSpaceMb >= (requirements.diskSpaceMb || 0) &&
            availableResources.networkBandwidthMbps >= (requirements.networkBandwidthMbps || 0);
        return { available, availableResources };
    }
    async performResourceAllocation(executionId, requirements, availability) {
        if (!availability.available) {
            throw new Error('Insufficient resources available');
        }
        const allocationId = `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const allocationTime = new Date().toISOString();
        const allocation = {
            allocationId,
            executionId,
            allocatedResources: {
                cpuCores: requirements.cpuCores || 2,
                memoryMb: requirements.memoryMb || 1024,
                diskSpaceMb: requirements.diskSpaceMb || 512,
                networkBandwidthMbps: requirements.networkBandwidthMbps || 100
            },
            allocationTime,
            estimatedReleaseTime: requirements.estimatedDurationMs
                ? new Date(Date.now() + requirements.estimatedDurationMs).toISOString()
                : undefined,
            status: 'allocated'
        };
        return allocation;
    }
    async collectPerformanceMetrics() {
        const activeAllocations = Array.from(this.resourceAllocations.values())
            .filter(a => a.status === 'in_use');
        return {
            timestamp: new Date().toISOString(),
            cpuUsagePercent: Math.random() * 80 + 10,
            memoryUsagePercent: Math.random() * 70 + 15,
            diskUsagePercent: Math.random() * 60 + 20,
            networkUsagePercent: Math.random() * 50 + 10,
            activeWorkflows: activeAllocations.length,
            queuedWorkflows: Math.floor(Math.random() * 10),
            averageResponseTimeMs: Math.random() * 500 + 100,
            throughputPerSecond: Math.random() * 100 + 50,
            errorRate: Math.random() * 5
        };
    }
    async analyzePerformanceTrends(_currentMetrics) {
        return {
            cpuTrend: 'stable',
            memoryTrend: 'stable',
            throughputTrend: 'stable',
            errorTrend: 'stable'
        };
    }
    async generatePerformanceReport(metrics, _trends) {
        return metrics;
    }
    async analyzeCurrentLoad() {
        const activeAllocations = Array.from(this.resourceAllocations.values())
            .filter(a => a.status === 'in_use');
        const totalLoad = activeAllocations.length;
        const nodeLoads = {
            'node-1': Math.random() * 100,
            'node-2': Math.random() * 100,
            'node-3': Math.random() * 100
        };
        const bottlenecks = [];
        Object.entries(nodeLoads).forEach(([node, load]) => {
            if (load > 80) {
                bottlenecks.push(node);
            }
        });
        return { totalLoad, nodeLoads, bottlenecks };
    }
    async calculateOptimalAllocation(_workloadData, currentLoad) {
        const nodeLoads = currentLoad.nodeLoads;
        const recommendedNode = Object.entries(nodeLoads)
            .sort(([, a], [, b]) => a - b)[0][0];
        const currentNodeLoad = nodeLoads[recommendedNode];
        const expectedImprovement = Math.max(0, 100 - currentNodeLoad);
        return { recommendedNode, expectedImprovement };
    }
    async performLoadBalancing(workloadData, optimalAllocation) {
        const balancingId = `balance-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        return {
            balancingId,
            workflowId: workloadData.workflowId,
            targetNode: optimalAllocation.recommendedNode,
            balancingTime: new Date().toISOString(),
            estimatedImprovement: {
                loadReduction: optimalAllocation.expectedImprovement * 0.3,
                responseTimeImprovement: optimalAllocation.expectedImprovement * 0.2
            },
            status: 'completed'
        };
    }
}
exports.CoreResourceService = CoreResourceService;
