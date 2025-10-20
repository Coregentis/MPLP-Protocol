/**
 * DialogAnalyticsService测试
 * 
 * @description 测试Dialog分析服务的功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import {
  DialogAnalyticsService,
  GenerateAnalyticsReportRequest,
  AnalyzeDialogUsageRequest,
  AnalyzeDialogPerformanceRequest,
  DialogAnalyticsReport,
  UsageAnalysis,
  PerformanceAnalysis
} from '../../../../src/modules/dialog/application/services/dialog-analytics.service';
import { DialogRepository } from '../../../../src/modules/dialog/domain/repositories/dialog.repository';
import { DialogEntity } from '../../../../src/modules/dialog/domain/entities/dialog.entity';
import { UUID } from '../../../../src/modules/dialog/types';

// Mock DialogRepository
const mockDialogRepository: jest.Mocked<DialogRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  findByParticipant: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  count: jest.fn(),
  search: jest.fn(),
  findActiveDialogs: jest.fn(),
  findByCapability: jest.fn()
};

describe('DialogAnalyticsService测试', () => {
  let service: DialogAnalyticsService;
  const testDialogId = 'dialog-test-001' as UUID;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建服务实例
    service = new DialogAnalyticsService(mockDialogRepository);
  });

  const createMockDialog = (): DialogEntity => ({
    dialogId: testDialogId,
    name: 'Test Dialog',
    description: 'Test dialog for analytics',
    participants: ['user-001', 'agent-001'],
    capabilities: {
      basic: { enabled: true },
      intelligentControl: { enabled: true, settings: {} },
      criticalThinking: { enabled: false },
      knowledgeSearch: { enabled: true, settings: {} },
      multimodal: { enabled: false },
      contextAwareness: { enabled: true, settings: {} },
      emotionalIntelligence: { enabled: false },
      creativeGeneration: { enabled: false },
      ethicalReasoning: { enabled: false },
      adaptiveLearning: { enabled: false }
    },
    strategy: {
      type: 'adaptive',
      settings: {
        maxTurns: 50,
        timeout: 1800,
        exitConditions: ['goal_achieved', 'timeout']
      }
    },
    context: {
      sessionId: 'session-001',
      environment: 'production',
      metadata: {}
    },
    configuration: {
      settings: {},
      environment: {},
      resources: {
        memory: 100,
        cpu: 50,
        storage: 1000,
        network: 10
      },
      dependencies: [],
      integrations: []
    },
    metadata: {},
    auditTrail: {
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedBy: 'system',
      updatedAt: new Date().toISOString(),
      version: 1,
      changes: []
    },
    monitoringIntegration: {
      healthCheckEndpoint: '/health',
      metricsEndpoint: '/metrics',
      loggingLevel: 'info',
      alerting: {
        enabled: true,
        thresholds: {
          errorRate: 0.05,
          responseTime: 1000,
          memoryUsage: 90,
          cpuUsage: 80
        }
      }
    },
    performanceMetrics: {
      responseTime: 85,
      throughput: 100,
      errorRate: 0.02,
      resourceUsage: {
        memory: 65,
        cpu: 45,
        network: 30,
        storage: 500
      }
    },
    versionHistory: [],
    searchMetadata: {
      keywords: ['test', 'analytics'],
      categories: ['testing'],
      popularity: 0,
      rating: 0,
      downloadCount: 0
    },
    dialogOperation: 'start',
    dialogDetails: {
      currentTurn: 1,
      totalTurns: 0,
      status: 'active',
      lastActivity: new Date().toISOString(),
      participants: ['user-001', 'agent-001']
    },
    eventIntegration: {
      publishedEvents: [],
      subscribedEvents: [],
      eventHandlers: []
    },
    protocolVersion: '1.0.0',
    timestamp: new Date().toISOString()
  });

  describe('generateAnalyticsReport', () => {
    it('应该成功生成综合分析报告', async () => {
      // Arrange
      const mockDialogs = [createMockDialog()];
      const request: GenerateAnalyticsReportRequest = {
        dialogIds: [testDialogId],
        reportType: 'comprehensive',
        includeRecommendations: true
      };

      mockDialogRepository.findActiveDialogs.mockResolvedValue(mockDialogs);

      // Act
      const result = await service.generateAnalyticsReport(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.reportType).toBe('comprehensive');
      expect(result.dialogIds).toEqual([testDialogId]);
      expect(result.summary).toBeDefined();
      expect(result.usageAnalysis).toBeDefined();
      expect(result.performanceAnalysis).toBeDefined();
      expect(result.healthAnalysis).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.trends).toBeDefined();
    });

    it('应该生成使用分析报告', async () => {
      // Arrange
      const mockDialogs = [createMockDialog()];
      const request: GenerateAnalyticsReportRequest = {
        dialogIds: [testDialogId],
        reportType: 'usage'
      };

      mockDialogRepository.findActiveDialogs.mockResolvedValue(mockDialogs);

      // Act
      const result = await service.generateAnalyticsReport(request);

      // Assert
      expect(result.reportType).toBe('usage');
      expect(result.usageAnalysis).toBeDefined();
      expect(result.performanceAnalysis).toBeUndefined();
      expect(result.healthAnalysis).toBeUndefined();
    });

    it('应该处理空对话列表的情况', async () => {
      // Arrange
      const request: GenerateAnalyticsReportRequest = {
        reportType: 'usage'
      };

      mockDialogRepository.findActiveDialogs.mockResolvedValue([]);

      // Act
      const result = await service.generateAnalyticsReport(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.dialogIds).toEqual([]);
      expect(result.summary.totalDialogs).toBe(0);
    });
  });

  describe('analyzeDialogUsage', () => {
    it('应该成功分析对话使用情况', async () => {
      // Arrange
      const mockDialog = createMockDialog();
      mockDialogRepository.findById.mockResolvedValue(mockDialog);

      const request: AnalyzeDialogUsageRequest = {
        dialogIds: [testDialogId],
        analysisType: 'detailed'
      };

      // Act
      const result = await service.analyzeDialogUsage(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.totalInteractions).toBeGreaterThan(0);
      expect(result.averageSessionDuration).toBeGreaterThan(0);
      expect(result.mostUsedCapabilities).toBeDefined();
      expect(result.participantEngagement).toBeDefined();
      expect(result.peakUsageHours).toBeDefined();
    });

    it('应该处理基础分析类型', async () => {
      // Arrange
      const request: AnalyzeDialogUsageRequest = {
        dialogIds: [testDialogId],
        analysisType: 'basic'
      };

      // Act
      const result = await service.analyzeDialogUsage(request);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.totalInteractions).toBe('number');
      expect(typeof result.averageSessionDuration).toBe('number');
    });
  });

  describe('analyzeDialogPerformance', () => {
    it('应该成功分析对话性能', async () => {
      // Arrange
      const request: AnalyzeDialogPerformanceRequest = {
        dialogIds: [testDialogId],
        performanceMetrics: ['responseTime', 'throughput', 'errorRate']
      };

      // Act
      const result = await service.analyzeDialogPerformance(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.averageResponseTime).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
      expect(result.errorRate).toBeGreaterThanOrEqual(0);
      expect(result.resourceUtilization).toBeDefined();
      expect(result.performanceTrends).toBeDefined();
      expect(Array.isArray(result.performanceTrends)).toBe(true);
    });

    it('应该包含资源利用率信息', async () => {
      // Arrange
      const request: AnalyzeDialogPerformanceRequest = {
        dialogIds: [testDialogId],
        performanceMetrics: ['resourceUsage']
      };

      // Act
      const result = await service.analyzeDialogPerformance(request);

      // Assert
      expect(result.resourceUtilization).toBeDefined();
      expect(typeof result.resourceUtilization.memory).toBe('number');
      expect(typeof result.resourceUtilization.cpu).toBe('number');
      expect(typeof result.resourceUtilization.network).toBe('number');
    });
  });

  describe('getDialogRankings', () => {
    it('应该成功获取对话排名', async () => {
      // Arrange
      const dialogIds = [testDialogId, 'dialog-test-002' as UUID];

      // Act
      const result = await service.getDialogRankings(dialogIds);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(dialogIds.length);
      
      result.forEach((ranking, index) => {
        expect(ranking.dialogId).toBe(dialogIds[index]);
        expect(typeof ranking.score).toBe('number');
        expect(typeof ranking.rank).toBe('number');
        expect(ranking.metrics).toBeDefined();
        expect(typeof ranking.metrics.usage).toBe('number');
        expect(typeof ranking.metrics.performance).toBe('number');
        expect(typeof ranking.metrics.health).toBe('number');
      });
    });

    it('应该按分数排序对话', async () => {
      // Arrange
      const dialogIds = [testDialogId, 'dialog-test-002' as UUID, 'dialog-test-003' as UUID];

      // Act
      const result = await service.getDialogRankings(dialogIds);

      // Assert
      expect(result.length).toBe(3);
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);
      
      // 验证分数递减
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
      expect(result[1].score).toBeGreaterThanOrEqual(result[2].score);
    });
  });

  describe('错误处理', () => {
    it('应该处理repository错误', async () => {
      // Arrange
      const request: GenerateAnalyticsReportRequest = {
        dialogIds: [testDialogId],
        reportType: 'usage'
      };

      mockDialogRepository.findActiveDialogs.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.generateAnalyticsReport(request))
        .rejects.toThrow('Database error');
    });

    it('应该处理空结果', async () => {
      // Arrange
      const request: GenerateAnalyticsReportRequest = {
        dialogIds: [],
        reportType: 'performance'
      };

      mockDialogRepository.findActiveDialogs.mockResolvedValue([]);

      // Act
      const result = await service.generateAnalyticsReport(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.summary.totalDialogs).toBe(0);
      expect(result.summary.activeDialogs).toBe(0);
    });
  });
});
