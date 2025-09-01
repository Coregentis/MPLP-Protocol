/**
 * MPLP Confirm Module - Analytics Service Tests
 * @description 企业级审批工作流分析服务测试 - 严格基于Schema驱动开发
 * @version 1.0.0
 * @module ConfirmAnalyticsServiceTest
 */

import { ConfirmAnalyticsService, IAnalyticsEngine, TimeRange, ConfirmAnalysis, ApprovalTrends, ApprovalReport } from '../../../src/modules/confirm/application/services/confirm-analytics.service';
import { IConfirmRepository } from '../../../src/modules/confirm/domain/repositories/confirm-repository.interface';
import { ConfirmEntity } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import { UUID } from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData } from './test-data-factory';

// Mock Repository
const mockRepository: jest.Mocked<IConfirmRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByFilter: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  findByContextId: jest.fn(),
  findByPlanId: jest.fn(),
  findByRequesterId: jest.fn(),
  findByApproverId: jest.fn(),
  findByStatus: jest.fn(),
  findByPriority: jest.fn(),
  findByType: jest.fn(),
  findByDateRange: jest.fn(),
  findByTimeRange: jest.fn(),
  updateBatch: jest.fn(),
  deleteBatch: jest.fn(),
  clear: jest.fn(),
  getStatistics: jest.fn()
} as any;

// Mock Analytics Engine
const mockAnalyticsEngine: jest.Mocked<IAnalyticsEngine> = {
  analyzeWorkflowPerformance: jest.fn(),
  detectBottlenecks: jest.fn(),
  generateInsights: jest.fn()
};

describe('ConfirmAnalyticsService测试', () => {
  let analyticsService: ConfirmAnalyticsService;
  let mockConfirmEntity: ConfirmEntity;

  beforeEach(() => {
    analyticsService = new ConfirmAnalyticsService(mockRepository, mockAnalyticsEngine);
    
    const mockData = createMockConfirmEntityData({
      confirmId: 'confirm-analytics-001',
      status: 'approved'
    });
    mockConfirmEntity = new ConfirmEntity(mockData);
    
    jest.clearAllMocks();
  });

  describe('analyzeConfirmRequest方法测试', () => {
    it('应该成功分析确认请求', async () => {
      const requestId = 'confirm-analytics-001' as UUID;
      mockRepository.findById.mockResolvedValue(mockConfirmEntity);

      const result = await analyticsService.analyzeConfirmRequest(requestId);

      expect(mockRepository.findById).toHaveBeenCalledWith(requestId);
      expect(result).toBeDefined();
      expect(result.requestId).toBe(requestId);
      expect(result.workflow).toBeDefined();
      expect(result.performance).toBeDefined();
      expect(result.insights).toBeDefined();
    });

    it('应该处理不存在的确认请求', async () => {
      const requestId = 'non-existent' as UUID;
      mockRepository.findById.mockResolvedValue(null);

      await expect(analyticsService.analyzeConfirmRequest(requestId))
        .rejects.toThrow('Confirm request non-existent not found');
    });

    it('应该正确计算工作流指标', async () => {
      const requestId = 'confirm-analytics-001' as UUID;
      mockRepository.findById.mockResolvedValue(mockConfirmEntity);

      const result = await analyticsService.analyzeConfirmRequest(requestId);

      expect(result.workflow.totalSteps).toBeGreaterThanOrEqual(0);
      expect(result.workflow.completedSteps).toBeGreaterThanOrEqual(0);
      expect(result.workflow.averageApprovalTime).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.workflow.bottlenecks)).toBe(true);
    });
  });

  describe('analyzeApprovalTrends方法测试', () => {
    it('应该成功分析审批趋势', async () => {
      const timeRange: TimeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const mockRequests = [mockConfirmEntity];
      mockRepository.findByTimeRange.mockResolvedValue(mockRequests);

      const result = await analyticsService.analyzeApprovalTrends(timeRange);

      expect(mockRepository.findByTimeRange).toHaveBeenCalledWith(timeRange);
      expect(result).toBeDefined();
      expect(result.timeRange).toEqual(timeRange);
      expect(result.totalRequests).toBe(1);
      expect(result.trends).toBeDefined();
    });

    it('应该处理空数据集', async () => {
      const timeRange: TimeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      mockRepository.findByTimeRange.mockResolvedValue([]);

      const result = await analyticsService.analyzeApprovalTrends(timeRange);

      expect(result.totalRequests).toBe(0);
      expect(result.approvalRate).toBe(0);
    });
  });

  describe('generateApprovalReport方法测试', () => {
    it('应该成功生成审批报告', async () => {
      const timeRange: TimeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const mockRequests = [mockConfirmEntity];
      mockRepository.findByTimeRange.mockResolvedValue(mockRequests);

      const result = await analyticsService.generateApprovalReport('performance', { timeRange });

      expect(result).toBeDefined();
      expect(result.reportType).toBe('performance');
      expect(result.summary).toBeDefined();
      expect(result.insights).toBeDefined();
      expect(result.summary.totalRequests).toBe(1);
    });

    it('应该生成正确的报告摘要', async () => {
      const timeRange: TimeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      // 创建不同状态的请求
      const approvedRequest = new ConfirmEntity(createMockConfirmEntityData({ status: 'approved' }));
      const rejectedRequest = new ConfirmEntity(createMockConfirmEntityData({ status: 'rejected' }));
      const pendingRequest = new ConfirmEntity(createMockConfirmEntityData({ status: 'pending' }));

      mockRepository.findByTimeRange.mockResolvedValue([approvedRequest, rejectedRequest, pendingRequest]);

      const result = await analyticsService.generateApprovalReport('compliance', { timeRange });

      expect(result.summary.totalRequests).toBe(3);
      expect(result.summary.approvedRequests).toBe(1);
      expect(result.summary.rejectedRequests).toBe(1);
      expect(result.summary.pendingRequests).toBe(1);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内处理分析请求', async () => {
      const requestId = 'confirm-analytics-001' as UUID;
      mockRepository.findById.mockResolvedValue(mockConfirmEntity);

      const startTime = Date.now();
      await analyticsService.analyzeConfirmRequest(requestId);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该在合理时间内生成报告', async () => {
      const timeRange: TimeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      mockRepository.findByTimeRange.mockResolvedValue([mockConfirmEntity]);

      const startTime = Date.now();
      await analyticsService.generateApprovalReport('efficiency', { timeRange });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200); // 应该在200ms内完成
    });
  });

  describe('边界条件测试', () => {
    it('应该处理无审批历史的请求', async () => {
      const requestId = 'confirm-no-history' as UUID;
      const entityWithoutHistory = new ConfirmEntity(createMockConfirmEntityData({
        confirmId: requestId,
        approvalWorkflow: {
          workflowId: 'workflow-001',
          steps: [] // 无审批步骤
        }
      }));

      mockRepository.findById.mockResolvedValue(entityWithoutHistory);

      const result = await analyticsService.analyzeConfirmRequest(requestId);

      expect(result.workflow.totalSteps).toBe(0);
      expect(result.workflow.completedSteps).toBe(0);
      expect(result.workflow.averageApprovalTime).toBe(0);
    });

    it('应该处理大量数据的趋势分析', async () => {
      const timeRange: TimeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      };

      // 创建1000个请求
      const mockRequests = Array.from({ length: 1000 }, (_, i) => 
        new ConfirmEntity(createMockConfirmEntityData({
          confirmId: `confirm-${i.toString().padStart(4, '0')}`,
          status: i % 2 === 0 ? 'approved' : 'rejected'
        }))
      );

      mockRepository.findByTimeRange.mockResolvedValue(mockRequests);

      const startTime = Date.now();
      const result = await analyticsService.analyzeApprovalTrends(timeRange);
      const endTime = Date.now();

      expect(result.totalRequests).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});
