/**
 * Core资源服务测试 - 基于实际代码
 * 
 * @description 基于实际CoreResourceService代码的测试，遵循RBCT方法论
 * @version 1.0.0
 * @layer 应用层测试 - 服务
 */

import { CoreResourceService, ResourceRequirements, ResourceAllocation, SystemPerformanceMetrics, WorkloadData, BalancingResult } from '../../../../../src/modules/core/application/services/core-resource.service';
import { ICoreRepository } from '../../../../../src/modules/core/domain/repositories/core-repository.interface';
import { UUID } from '../../../../../src/modules/core/types';

// 创建模拟仓储 - 基于实际ICoreRepository接口
function createMockRepository(): jest.Mocked<ICoreRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findByOrchestratorId: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    findByCriteria: jest.fn(),
    findWithPagination: jest.fn(),
    saveBatch: jest.fn(),
    deleteBatch: jest.fn()
  };
}

describe('CoreResourceService测试', () => {
  let service: CoreResourceService;
  let mockRepository: jest.Mocked<ICoreRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = createMockRepository();
    service = new CoreResourceService(mockRepository);
  });

  describe('构造函数测试', () => {
    it('应该正确创建CoreResourceService实例', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CoreResourceService);
    });
  });

  describe('allocateResources方法测试', () => {
    it('应该成功分配系统资源', async () => {
      const executionId = 'exec-test-001';
      const resourceRequirements: ResourceRequirements = {
        cpuCores: 2,
        memoryMb: 1024,
        diskSpaceMb: 2048,
        networkBandwidthMbps: 100,
        priority: 'medium',
        estimatedDurationMs: 300000
      };

      const result = await service.allocateResources(executionId, resourceRequirements);

      expect(result).toBeDefined();
      expect(result.allocationId).toBeDefined();
      expect(result.executionId).toBe(executionId);
      expect(result.allocatedResources).toBeDefined();
      expect(result.allocatedResources.cpuCores).toBeGreaterThan(0);
      expect(result.allocatedResources.memoryMb).toBeGreaterThan(0);
      expect(result.status).toBe('allocated');
      expect(result.allocationTime).toBeDefined();
    });

    it('应该处理高优先级资源请求', async () => {
      const executionId = 'exec-high-priority-001';
      const resourceRequirements: ResourceRequirements = {
        cpuCores: 4,
        memoryMb: 2048,
        diskSpaceMb: 4096,
        networkBandwidthMbps: 200,
        priority: 'critical',
        estimatedDurationMs: 600000
      };

      const result = await service.allocateResources(executionId, resourceRequirements);

      expect(result).toBeDefined();
      expect(result.allocatedResources.cpuCores).toBeGreaterThanOrEqual(resourceRequirements.cpuCores || 0);
      expect(result.allocatedResources.memoryMb).toBeGreaterThanOrEqual(resourceRequirements.memoryMb || 0);
      expect(result.status).toBe('allocated');
    });

    it('应该处理低优先级资源请求', async () => {
      const executionId = 'exec-low-priority-001';
      const resourceRequirements: ResourceRequirements = {
        cpuCores: 1,
        memoryMb: 512,
        diskSpaceMb: 1024,
        networkBandwidthMbps: 50,
        priority: 'low',
        estimatedDurationMs: 150000
      };

      const result = await service.allocateResources(executionId, resourceRequirements);

      expect(result).toBeDefined();
      expect(result.status).toBe('allocated');
      expect(result.allocatedResources.cpuCores).toBeGreaterThan(0);
    });

    it('应该处理资源分配失败', async () => {
      const executionId = 'exec-fail-001';
      const resourceRequirements: ResourceRequirements = {
        cpuCores: 1000, // 不合理的高需求
        memoryMb: 1000000, // 不合理的高需求
        priority: 'low'
      };

      // 当资源需求过高时，服务会抛出异常
      await expect(service.allocateResources(executionId, resourceRequirements))
        .rejects.toThrow('Insufficient resources available');
    });
  });

  describe('releaseResources方法测试', () => {
    it('应该成功释放已分配的资源', async () => {
      // 先分配资源
      const executionId = 'exec-release-001';
      const resourceRequirements: ResourceRequirements = {
        cpuCores: 2,
        memoryMb: 1024,
        priority: 'medium'
      };

      const allocation = await service.allocateResources(executionId, resourceRequirements);
      
      // 然后释放资源
      const result = await service.releaseResources(allocation.allocationId);

      expect(result).toBe(true);
    });

    it('应该处理不存在的分配ID', async () => {
      const nonExistentId = 'non-existent-allocation' as UUID;

      const result = await service.releaseResources(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('monitorSystemPerformance方法测试', () => {
    it('应该成功监控系统性能', async () => {
      const result = await service.monitorSystemPerformance();

      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.cpuUsagePercent).toBeDefined();
      expect(result.memoryUsagePercent).toBeDefined();
      expect(result.diskUsagePercent).toBeDefined();
      expect(result.networkUsagePercent).toBeDefined();
      expect(result.activeWorkflows).toBeDefined();
      expect(result.queuedWorkflows).toBeDefined();
      expect(result.averageResponseTimeMs).toBeDefined();
      expect(result.throughputPerSecond).toBeDefined();
      expect(result.errorRate).toBeDefined();
      expect(typeof result.cpuUsagePercent).toBe('number');
      expect(typeof result.memoryUsagePercent).toBe('number');
      expect(typeof result.diskUsagePercent).toBe('number');
      expect(typeof result.networkUsagePercent).toBe('number');
    });

    it('应该返回合理的性能指标范围', async () => {
      const result = await service.monitorSystemPerformance();

      expect(result.cpuUsagePercent).toBeGreaterThanOrEqual(0);
      expect(result.cpuUsagePercent).toBeLessThanOrEqual(100);
      expect(result.memoryUsagePercent).toBeGreaterThanOrEqual(0);
      expect(result.memoryUsagePercent).toBeLessThanOrEqual(100);
      expect(result.diskUsagePercent).toBeGreaterThanOrEqual(0);
      expect(result.diskUsagePercent).toBeLessThanOrEqual(100);
      expect(result.networkUsagePercent).toBeGreaterThanOrEqual(0);
      expect(result.networkUsagePercent).toBeLessThanOrEqual(100);
    });
  });

  describe('balanceWorkload方法测试', () => {
    it('应该成功执行负载均衡', async () => {
      const workloadData: WorkloadData = {
        workflowId: 'workload-test-001' as UUID,
        priority: 'medium',
        estimatedResourceUsage: {
          cpuCores: 2,
          memoryMb: 1024,
          diskSpaceMb: 2048,
          networkBandwidthMbps: 100,
          priority: 'medium',
          estimatedDurationMs: 120000
        },
        currentLoad: 0.5,
        targetNodes: ['node1', 'node2']
      };

      const result = await service.balanceWorkload(workloadData);

      expect(result).toBeDefined();
      expect(result.workflowId).toBe(workloadData.workflowId);
      expect(result.balancingId).toBeDefined();
      expect(result.targetNode).toBeDefined();
      expect(result.balancingTime).toBeDefined();
      expect(result.estimatedImprovement).toBeDefined();
      expect(result.estimatedImprovement.loadReduction).toBeDefined();
      expect(result.estimatedImprovement.responseTimeImprovement).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it('应该处理零负载工作流', async () => {
      const workloadData: WorkloadData = {
        workflowId: 'workload-empty-001' as UUID,
        priority: 'low',
        estimatedResourceUsage: {
          cpuCores: 0,
          memoryMb: 0,
          priority: 'low'
        },
        currentLoad: 0,
        targetNodes: []
      };

      const result = await service.balanceWorkload(workloadData);

      expect(result).toBeDefined();
      expect(result.workflowId).toBe(workloadData.workflowId);
      expect(result.status).toBeDefined();
    });

    it('应该处理不同优先级的工作负载', async () => {
      const priorities = ['low', 'medium', 'high', 'critical'] as const;

      for (const priority of priorities) {
        const workloadData: WorkloadData = {
          workflowId: `workload-${priority}-001` as UUID,
          priority,
          estimatedResourceUsage: {
            cpuCores: 1,
            memoryMb: 256,
            priority
          },
          currentLoad: 0.3,
          targetNodes: ['node1']
        };

        const result = await service.balanceWorkload(workloadData);

        expect(result).toBeDefined();
        expect(result.workflowId).toBe(workloadData.workflowId);
        expect(result.status).toBeDefined();
      }
    });
  });

  describe('getResourceUsageStatistics方法测试', () => {
    it('应该成功获取资源使用统计', async () => {
      const result = await service.getResourceUsageStatistics();

      expect(result).toBeDefined();
      expect(result.totalAllocations).toBeDefined();
      expect(result.activeAllocations).toBeDefined();
      expect(result.averageAllocationDuration).toBeDefined();
      expect(result.resourceUtilization).toBeDefined();
      expect(result.resourceUtilization.cpu).toBeDefined();
      expect(result.resourceUtilization.memory).toBeDefined();
      expect(result.resourceUtilization.disk).toBeDefined();
      expect(result.resourceUtilization.network).toBeDefined();
      expect(typeof result.totalAllocations).toBe('number');
      expect(typeof result.activeAllocations).toBe('number');
      expect(typeof result.averageAllocationDuration).toBe('number');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内分配资源', async () => {
      const executionId = 'perf-test-001';
      const resourceRequirements: ResourceRequirements = {
        cpuCores: 1,
        memoryMb: 512,
        priority: 'medium'
      };

      const startTime = Date.now();
      const result = await service.allocateResources(executionId, resourceRequirements);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该在合理时间内监控系统性能', async () => {
      const startTime = Date.now();
      const result = await service.monitorSystemPerformance();
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(200); // 应该在200ms内完成
    });
  });

  describe('错误处理测试', () => {
    it('应该处理资源分配异常', async () => {
      const executionId = 'error-test-001';
      const resourceRequirements: ResourceRequirements = {
        priority: 'medium'
      };

      // 即使在异常情况下，也应该返回一个有效的结果
      const result = await service.allocateResources(executionId, resourceRequirements);

      expect(result).toBeDefined();
      expect(result.executionId).toBe(executionId);
    });

    it('应该处理性能监控异常', async () => {
      // 性能监控应该始终返回一个结果，即使在异常情况下
      const result = await service.monitorSystemPerformance();

      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理零资源需求', async () => {
      const executionId = 'zero-resource-001';
      const resourceRequirements: ResourceRequirements = {
        cpuCores: 0,
        memoryMb: 0,
        diskSpaceMb: 0,
        networkBandwidthMbps: 0,
        priority: 'low'
      };

      const result = await service.allocateResources(executionId, resourceRequirements);

      expect(result).toBeDefined();
      expect(result.executionId).toBe(executionId);
    });

    it('应该处理极大资源需求', async () => {
      const executionId = 'large-resource-001';
      const resourceRequirements: ResourceRequirements = {
        cpuCores: Number.MAX_SAFE_INTEGER,
        memoryMb: Number.MAX_SAFE_INTEGER,
        priority: 'critical'
      };

      // 极大的资源需求会导致分配失败
      await expect(service.allocateResources(executionId, resourceRequirements))
        .rejects.toThrow('Insufficient resources available');
    });
  });
});
