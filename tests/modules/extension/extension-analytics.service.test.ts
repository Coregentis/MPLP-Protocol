/**
 * ExtensionAnalyticsService测试
 * 
 * @description 测试Extension分析服务的功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import {
  ExtensionAnalyticsService,
  IMetricsCollector,
  IAnalyticsEngine,
  ExtensionUsageMetrics,
  ExtensionHealthMetrics,
  UsageAnalysis,
  PerformanceAnalysis,
  AnomalyDetection,
  GenerateReportRequest,
  AnalyticsReport
} from '../../../src/modules/extension/application/services/extension-analytics.service';
import { IExtensionRepository } from '../../../src/modules/extension/domain/repositories/extension.repository.interface';
import { ExtensionEntityData, ExtensionPerformanceMetrics } from '../../../src/modules/extension/types';
import { UUID } from '../../../src/shared/types';

// Mock ExtensionRepository
const mockExtensionRepository: jest.Mocked<IExtensionRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByFilter: jest.fn(),
  findByContextId: jest.fn(),
  findByName: jest.fn(),
  search: jest.fn(),
  count: jest.fn(),
  exists: jest.fn(),
  nameExists: jest.fn(),
  getStatistics: jest.fn(),
  findRecentlyUpdatedExtensions: jest.fn(),
  createBatch: jest.fn(),
  updateBatch: jest.fn(),
  deleteBatch: jest.fn(),
  optimize: jest.fn()
};

// Mock MetricsCollector
const mockMetricsCollector: jest.Mocked<IMetricsCollector> = {
  collectUsageMetrics: jest.fn(),
  collectPerformanceMetrics: jest.fn(),
  collectHealthMetrics: jest.fn()
};

// Mock AnalyticsEngine
const mockAnalyticsEngine: jest.Mocked<IAnalyticsEngine> = {
  analyzeUsagePatterns: jest.fn(),
  analyzePerformanceTrends: jest.fn(),
  detectAnomalies: jest.fn()
};

describe('ExtensionAnalyticsService测试', () => {
  let service: ExtensionAnalyticsService;
  const testExtensionId = 'ext-test-001' as UUID;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建服务实例
    service = new ExtensionAnalyticsService(
      mockExtensionRepository,
      mockMetricsCollector,
      mockAnalyticsEngine
    );
  });

  describe('collectUsageMetrics', () => {
    it('应该成功收集使用指标', async () => {
      // Arrange
      const mockExtension: ExtensionEntityData = {
        extensionId: testExtensionId,
        name: 'Test Extension',
        version: '1.0.0',
        status: 'enabled',
        extensionType: 'api',
        contextId: 'ctx-001' as UUID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        protocolVersion: '1.0.0',
        description: 'Test extension',
        author: 'Test Author',
        tags: ['test'],
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
          extensionPoints: [],
          apiExtensions: [],
          eventSubscriptions: []
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100,
            maxCpu: 50,
            maxFileSize: 1000,
            maxNetworkConnections: 10,
            allowedDomains: [],
            blockedDomains: [],
            allowedHosts: [],
            allowedPorts: [],
            protocols: []
          },
          codeSigning: {
            required: false,
            trustedSigners: []
          },
          permissions: {
            fileSystem: { read: [], write: [], execute: [] },
            network: { allowedHosts: [], allowedPorts: [], protocols: [] },
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rateLimit: 100 }
          }
        },
        performanceMetrics: {
          responseTime: 50,
          throughput: 100,
          errorRate: 0.01,
          resourceUsage: {
            memory: 80,
            cpu: 30,
            network: 5,
            storage: 500
          }
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
        versionHistory: [],
        searchMetadata: {
          keywords: ['test'],
          categories: ['testing'],
          popularity: 0,
          rating: 0,
          downloadCount: 0
        },
        eventIntegration: {
          publishedEvents: [],
          subscribedEvents: [],
          eventHandlers: []
        }
      };

      const mockUsageMetrics: ExtensionUsageMetrics = {
        extensionId: testExtensionId,
        activationCount: 10,
        usageTime: 3600,
        featureUsage: { 'feature1': 5, 'feature2': 3 },
        userCount: 2,
        lastUsed: new Date().toISOString(),
        popularityScore: 75
      };

      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockMetricsCollector.collectUsageMetrics.mockResolvedValue(mockUsageMetrics);

      // Act
      const result = await service.collectUsageMetrics(testExtensionId);

      // Assert
      expect(mockExtensionRepository.findById).toHaveBeenCalledWith(testExtensionId);
      expect(mockMetricsCollector.collectUsageMetrics).toHaveBeenCalledWith(testExtensionId);
      expect(result).toEqual(mockUsageMetrics);
    });

    it('应该在扩展不存在时抛出错误', async () => {
      // Arrange
      mockExtensionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.collectUsageMetrics(testExtensionId))
        .rejects.toThrow(`Extension ${testExtensionId} not found`);
    });
  });

  describe('collectPerformanceMetrics', () => {
    it('应该成功收集性能指标', async () => {
      // Arrange
      const mockExtension: ExtensionEntityData = {
        extensionId: testExtensionId,
        name: 'Test Extension',
        version: '1.0.0',
        status: 'enabled',
        extensionType: 'api',
        contextId: 'ctx-001' as UUID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        protocolVersion: '1.0.0',
        description: 'Test extension',
        author: 'Test Author',
        tags: ['test'],
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
          extensionPoints: [],
          apiExtensions: [],
          eventSubscriptions: []
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100,
            maxCpu: 50,
            maxFileSize: 1000,
            maxNetworkConnections: 10,
            allowedDomains: [],
            blockedDomains: [],
            allowedHosts: [],
            allowedPorts: [],
            protocols: []
          },
          codeSigning: {
            required: false,
            trustedSigners: []
          },
          permissions: {
            fileSystem: { read: [], write: [], execute: [] },
            network: { allowedHosts: [], allowedPorts: [], protocols: [] },
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rateLimit: 100 }
          }
        },
        performanceMetrics: {
          responseTime: 50,
          throughput: 100,
          errorRate: 0.01,
          resourceUsage: {
            memory: 80,
            cpu: 30,
            network: 5,
            storage: 500
          }
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
        versionHistory: [],
        searchMetadata: {
          keywords: ['test'],
          categories: ['testing'],
          popularity: 0,
          rating: 0,
          downloadCount: 0
        },
        eventIntegration: {
          publishedEvents: [],
          subscribedEvents: [],
          eventHandlers: []
        }
      };

      const mockPerformanceMetrics: ExtensionPerformanceMetrics = {
        responseTime: 50,
        throughput: 100,
        errorRate: 0.01,
        resourceUsage: {
          memory: 80,
          cpu: 30,
          network: 5,
          storage: 500
        }
      };

      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockMetricsCollector.collectPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);

      // Act
      const result = await service.collectPerformanceMetrics(testExtensionId);

      // Assert
      expect(mockExtensionRepository.findById).toHaveBeenCalledWith(testExtensionId);
      expect(mockMetricsCollector.collectPerformanceMetrics).toHaveBeenCalledWith(testExtensionId);
      expect(result).toEqual(mockPerformanceMetrics);
    });
  });

  describe('generateReport', () => {
    it('应该生成综合分析报告', async () => {
      // Arrange
      const request: GenerateReportRequest = {
        reportType: 'comprehensive',
        timeRange: {
          start: '2025-01-01T00:00:00Z',
          end: '2025-01-31T23:59:59Z'
        },
        extensionIds: [testExtensionId],
        includeDetails: true
      };

      const mockExtensions: ExtensionEntityData[] = [{
        extensionId: testExtensionId,
        name: 'Test Extension',
        version: '1.0.0',
        status: 'enabled',
        extensionType: 'api',
        contextId: 'ctx-001' as UUID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        protocolVersion: '1.0.0',
        description: 'Test extension',
        author: 'Test Author',
        tags: ['test'],
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
          extensionPoints: [],
          apiExtensions: [],
          eventSubscriptions: []
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100,
            maxCpu: 50,
            maxFileSize: 1000,
            maxNetworkConnections: 10,
            allowedDomains: [],
            blockedDomains: [],
            allowedHosts: [],
            allowedPorts: [],
            protocols: []
          },
          codeSigning: {
            required: false,
            trustedSigners: []
          },
          permissions: {
            fileSystem: { read: [], write: [], execute: [] },
            network: { allowedHosts: [], allowedPorts: [], protocols: [] },
            database: { read: [], write: [], admin: [] },
            api: { endpoints: [], methods: [], rateLimit: 100 }
          }
        },
        performanceMetrics: {
          responseTime: 50,
          throughput: 100,
          errorRate: 0.01,
          resourceUsage: {
            memory: 80,
            cpu: 30,
            network: 5,
            storage: 500
          }
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
        versionHistory: [],
        searchMetadata: {
          keywords: ['test'],
          categories: ['testing'],
          popularity: 0,
          rating: 0,
          downloadCount: 0
        },
        eventIntegration: {
          publishedEvents: [],
          subscribedEvents: [],
          eventHandlers: []
        }
      }];

      const mockUsageAnalysis: UsageAnalysis = {
        totalUsage: 100,
        averageUsageTime: 3600,
        mostUsedFeatures: ['feature1', 'feature2'],
        userEngagement: 0.8,
        trends: []
      };

      const mockPerformanceAnalysis: PerformanceAnalysis = {
        averageResponseTime: 50,
        throughput: 100,
        errorRate: 0.01,
        resourceUtilization: {
          memory: 80,
          cpu: 30,
          network: 5,
          storage: 500
        },
        performanceTrends: []
      };

      const mockAnomalyDetection: AnomalyDetection = {
        anomalies: [],
        riskLevel: 'low',
        recommendations: []
      };

      mockExtensionRepository.findByFilter.mockResolvedValue({
        extensions: mockExtensions,
        total: mockExtensions.length,
        page: 1,
        limit: 10,
        hasMore: false
      });
      mockExtensionRepository.findById.mockResolvedValue(mockExtensions[0]);
      mockMetricsCollector.collectUsageMetrics.mockResolvedValue({
        extensionId: testExtensionId,
        activationCount: 10,
        usageTime: 3600,
        featureUsage: {},
        userCount: 2,
        lastUsed: new Date().toISOString(),
        popularityScore: 75
      });
      mockMetricsCollector.collectPerformanceMetrics.mockResolvedValue({
        responseTime: 50,
        throughput: 100,
        errorRate: 0.01,
        resourceUsage: {
          memory: 80,
          cpu: 30,
          network: 5,
          storage: 500
        }
      });
      mockMetricsCollector.collectHealthMetrics.mockResolvedValue({
        extensionId: testExtensionId,
        status: 'enabled',
        uptime: 99.9,
        errorCount: 0,
        warningCount: 0,
        memoryUsage: 80,
        cpuUsage: 30,
        healthScore: 95
      });
      mockAnalyticsEngine.analyzeUsagePatterns.mockResolvedValue(mockUsageAnalysis);
      mockAnalyticsEngine.analyzePerformanceTrends.mockResolvedValue(mockPerformanceAnalysis);
      mockAnalyticsEngine.detectAnomalies.mockResolvedValue(mockAnomalyDetection);

      // Act
      const result = await service.generateReport(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.reportType).toBe('comprehensive');
      expect(result.timeRange).toEqual(request.timeRange);
      expect(result.summary).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.details.usageAnalysis).toEqual(mockUsageAnalysis);
      expect(result.details.performanceAnalysis).toEqual(mockPerformanceAnalysis);
      expect(result.details.anomalyDetection).toEqual(mockAnomalyDetection);
    });
  });
});
