/**
 * ExtensionController企业级测试
 * 验证Controller层的类型安全性和API响应格式
 * 
 * @description 基于修复后的零技术债务Controller实现的完整测试套件
 * @version 1.0.0
 * @layer API层测试
 * @pattern 企业级测试 + 类型安全验证 + API响应标准化
 */

import { ExtensionController } from '../../../src/modules/extension/api/controllers/extension.controller';
import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { ExtensionType, ExtensionStatus } from '../../../src/modules/extension/types';
import { UUID } from '../../../src/shared/types';
import { 
  ExtensionResponseDto,
  ExtensionListResponseDto,
  HealthStatusResponseDto,
  ExtensionPerformanceMetricsDto
} from '../../../src/modules/extension/api/dto/extension.dto';

// 测试数据工厂
const createMockExtensionResponseDto = (): ExtensionResponseDto => ({
  extensionId: 'ext-001' as UUID,
  contextId: 'ctx-001' as UUID,
  name: 'test-extension',
  displayName: 'Test Extension',
  description: 'Test extension for unit testing',
  version: '1.0.0',
  extensionType: 'plugin' as ExtensionType,
  status: 'active' as ExtensionStatus,
  protocolVersion: '1.0.0',
  timestamp: new Date().toISOString(),
  compatibility: {
    mplpVersion: '1.0.0',
    requiredModules: [],
    dependencies: [],
    conflicts: []
  },
  configuration: {
    schema: {},
    currentConfig: {},
    defaultConfig: {},
    validationRules: []
  },
  extensionPoints: [],
  apiExtensions: [],
  eventSubscriptions: [],
  lifecycle: {
    installDate: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    activationCount: 1,
    errorCount: 0,
    performanceMetrics: {
      averageResponseTime: 50,
      throughput: 1000,
      errorRate: 0.01,
      memoryUsage: 50000000,
      cpuUsage: 25,
      lastMeasurement: new Date().toISOString()
    },
    healthCheck: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
      expectedStatus: 200,
      healthyThreshold: 3,
      unhealthyThreshold: 3
    }
  },
  security: {
    sandboxEnabled: true,
    resourceLimits: {
      maxMemory: 100000000,
      maxCpu: 50,
      maxFileSize: 10000000,
      maxNetworkConnections: 10,
      allowedDomains: [],
      blockedDomains: []
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
  metadata: {
    author: { name: 'Test Author' },
    license: { type: 'MIT' },
    keywords: ['test'],
    category: 'testing',
    screenshots: []
  },
  auditTrail: { events: [], complianceSettings: {} },
  performanceMetrics: {
    activationLatency: 100,
    executionTime: 50,
    memoryFootprint: 50000000,
    cpuUtilization: 25,
    networkLatency: 10,
    errorRate: 0.01,
    throughput: 1000,
    availability: 99.9,
    efficiencyScore: 85,
    healthStatus: 'healthy',
    alerts: []
  },
  monitoringIntegration: { providers: [], endpoints: [], dashboards: [], alerting: {} },
  versionHistory: { versions: [], autoVersioning: {} },
  searchMetadata: { indexedFields: [], searchStrategies: [], facets: [] },
  eventIntegration: { eventBus: {}, eventRouting: {}, eventTransformation: {} }
});

describe('ExtensionController企业级测试', () => {
  let controller: ExtensionController;
  let mockExtensionManagementService: jest.Mocked<ExtensionManagementService>;

  beforeEach(() => {
    // 创建模拟服务
    mockExtensionManagementService = {
      activateExtension: jest.fn(),
      deactivateExtension: jest.fn(),
      queryExtensions: jest.fn(),
      getHealthStatus: jest.fn()
    } as any;

    // 创建Controller实例
    controller = new ExtensionController(mockExtensionManagementService);
  });

  describe('类型安全性验证', () => {
    it('应该返回正确类型的ApiResponse<ExtensionResponseDto>', async () => {
      // 🎯 Arrange
      const mockExtension = createMockExtensionResponseDto();
      const mockHttpResponse = {
        status: 200,
        data: mockExtension,
        error: null
      };
      
      // Mock HTTP方法
      (controller as any).createExtensionHttp = jest.fn().mockResolvedValue(mockHttpResponse);

      const createDto = {
        contextId: 'ctx-001' as UUID,
        name: 'test-extension',
        displayName: 'Test Extension',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType
      };

      // 🎯 Act
      const result = await controller.createExtension(createDto);

      // ✅ Assert - 验证返回类型结构
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(typeof result.success).toBe('boolean');
      
      if (result.success && result.data) {
        expect(result.data).toHaveProperty('extensionId');
        expect(result.data).toHaveProperty('contextId');
        expect(result.data).toHaveProperty('name');
        expect(result.data).toHaveProperty('extensionType');
        expect(result.data).toHaveProperty('status');
      }
    });

    it('应该返回正确类型的ApiResponse<boolean>用于删除操作', async () => {
      // 🎯 Arrange
      const mockHttpResponse = {
        status: 200,
        data: true,
        error: null
      };
      
      (controller as any).deleteExtensionHttp = jest.fn().mockResolvedValue(mockHttpResponse);

      // 🎯 Act
      const result = await controller.deleteExtension('ext-001' as UUID);

      // ✅ Assert
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(typeof result.data).toBe('boolean');
    });
  });

  describe('错误处理验证', () => {
    it('应该正确处理HTTP错误响应', async () => {
      // 🎯 Arrange
      const mockHttpResponse = {
        status: 404,
        data: null,
        error: { message: 'Extension not found' }
      };
      
      (controller as any).getExtensionHttp = jest.fn().mockResolvedValue(mockHttpResponse);

      // 🎯 Act
      const result = await controller.getExtension('non-existent' as UUID);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it('应该正确处理异常情况', async () => {
      // 🎯 Arrange
      (controller as any).getExtensionHttp = jest.fn().mockRejectedValue(new Error('Network error'));

      // 🎯 Act
      const result = await controller.getExtension('ext-001' as UUID);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Network error');
    });
  });

  describe('服务集成验证', () => {
    it('应该正确调用ExtensionManagementService进行激活', async () => {
      // 🎯 Arrange
      mockExtensionManagementService.activateExtension.mockResolvedValue(true);

      // 🎯 Act
      const result = await controller.activateExtension('ext-001' as UUID);

      // ✅ Assert
      expect(mockExtensionManagementService.activateExtension).toHaveBeenCalledWith({
        extensionId: 'ext-001',
        force: false
      });
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('应该正确调用ExtensionManagementService进行停用', async () => {
      // 🎯 Arrange
      mockExtensionManagementService.deactivateExtension.mockResolvedValue(true);

      // 🎯 Act
      const result = await controller.deactivateExtension('ext-001' as UUID);

      // ✅ Assert
      expect(mockExtensionManagementService.deactivateExtension).toHaveBeenCalledWith('ext-001');
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  describe('查询功能验证', () => {
    it('应该正确处理扩展查询', async () => {
      // 🎯 Arrange
      const mockExtensions = [createMockExtensionResponseDto()];
      mockExtensionManagementService.queryExtensions.mockResolvedValue({
        extensions: mockExtensions,
        total: 1,
        hasMore: false
      });

      const criteria = {
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus
      };

      // 🎯 Act
      const result = await controller.queryExtensions(criteria);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('应该正确处理扩展列表查询', async () => {
      // 🎯 Arrange
      const mockExtensions = [createMockExtensionResponseDto()];
      mockExtensionManagementService.queryExtensions.mockResolvedValue({
        extensions: mockExtensions,
        total: 1,
        hasMore: false
      });

      const options = {
        contextId: 'ctx-001' as UUID,
        page: 1,
        limit: 10
      };

      // 🎯 Act
      const result = await controller.listExtensions(options);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('extensions');
      expect(result.data).toHaveProperty('total');
      expect(result.data).toHaveProperty('page');
      expect(result.data).toHaveProperty('limit');
    });
  });

  describe('健康状态和性能指标验证', () => {
    it('应该返回正确的健康状态', async () => {
      // 🎯 Arrange
      const mockHealthStatus: HealthStatusResponseDto = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        details: {
          service: 'extension-service',
          version: '1.0.0',
          repository: {
            status: 'healthy',
            extensionCount: 10,
            activeExtensions: 8,
            lastOperation: new Date().toISOString()
          },
          performance: {
            averageResponseTime: 50,
            totalExtensions: 10,
            errorRate: 0.01
          }
        }
      };

      mockExtensionManagementService.getHealthStatus.mockResolvedValue(mockHealthStatus);

      // 🎯 Act
      const result = await controller.getHealthStatus();

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHealthStatus);
      expect(result.data?.status).toBe('healthy');
    });

    it('应该返回正确的性能指标', async () => {
      // 🎯 Arrange
      const mockHealthStatus: HealthStatusResponseDto = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        details: {
          service: 'extension-service',
          version: '1.0.0',
          repository: {
            status: 'healthy',
            extensionCount: 10,
            activeExtensions: 8,
            lastOperation: new Date().toISOString()
          },
          performance: {
            averageResponseTime: 50,
            totalExtensions: 10,
            errorRate: 0.01
          }
        }
      };

      mockExtensionManagementService.getHealthStatus.mockResolvedValue(mockHealthStatus);

      // 🎯 Act
      const result = await controller.getPerformanceMetrics();

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('activationLatency');
      expect(result.data).toHaveProperty('executionTime');
      expect(result.data).toHaveProperty('memoryFootprint');
      expect(result.data).toHaveProperty('healthStatus');
      expect(result.data?.healthStatus).toBe('healthy');
    });
  });
});
