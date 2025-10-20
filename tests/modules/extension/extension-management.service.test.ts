/**
 * Extension管理服务单元测试
 *
 * @description 基于实际接口的ExtensionManagementService测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context、Plan、Role、Confirm模块使用IDENTICAL的测试模式
 */

import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { IExtensionRepository } from '../../../src/modules/extension/domain/repositories/extension.repository.interface';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../../src/modules/extension/types';
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

describe('ExtensionManagementService测试', () => {
  let service: ExtensionManagementService;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建服务实例
    service = new ExtensionManagementService(mockExtensionRepository);
  });

  describe('createExtension方法测试', () => {
    it('应该成功创建扩展', async () => {
      // 📋 Arrange - 准备创建请求数据
      const createRequest = {
        contextId: 'ctx-test-001' as UUID,
        name: 'test-extension',
        displayName: 'Test Extension',
        description: 'Test extension for unit testing',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
        compatibility: {
          mplpVersion: '1.0.0',
          requiredModules: ['context'],
          dependencies: [
            {
              name: 'test-dependency',
              version: '1.0.0',
              optional: false,
              reason: 'Required for testing'
            }
          ],
          conflicts: []
        },
        configuration: {
          schema: { type: 'object', properties: {} },
          currentConfig: { enabled: true },
          defaultConfig: { enabled: false },
          validationRules: []
        },
        extensionPoints: [
          {
            id: 'test-hook',
            name: 'Test Hook',
            type: 'hook' as const,
            description: 'Test extension point',
            parameters: [
              {
                name: 'data',
                type: 'object',
                required: true,
                description: 'Test data parameter'
              }
            ],
            returnType: 'boolean',
            async: false,
            executionOrder: 1
          }
        ],
        apiExtensions: [],
        eventSubscriptions: [],
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100 * 1024 * 1024,
            maxCpu: 50,
            maxFileSize: 10 * 1024 * 1024,
            maxNetworkConnections: 10,
            allowedDomains: [],
            blockedDomains: [],
            allowedHosts: [],
            allowedPorts: [80, 443],
            protocols: ['http', 'https']
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
          author: {
            name: 'Test Author'
          },
          license: {
            type: 'MIT'
          },
          keywords: ['test', 'extension'],
          category: 'testing',
          screenshots: []
        }
      };

      const expectedExtension: ExtensionEntityData = {
        extensionId: 'ext-generated-id' as UUID,
        contextId: createRequest.contextId,
        name: createRequest.name,
        displayName: createRequest.displayName,
        description: createRequest.description,
        version: createRequest.version,
        extensionType: createRequest.extensionType,
        status: 'inactive' as ExtensionStatus,
        protocolVersion: '1.0.0',
        timestamp: expect.any(String),
        compatibility: createRequest.compatibility,
        configuration: createRequest.configuration,
        extensionPoints: createRequest.extensionPoints,
        apiExtensions: createRequest.apiExtensions,
        eventSubscriptions: createRequest.eventSubscriptions,
        lifecycle: expect.any(Object),
        security: createRequest.security,
        metadata: createRequest.metadata,
        auditTrail: expect.any(Object),
        performanceMetrics: expect.any(Object),
        monitoringIntegration: expect.any(Object),
        versionHistory: expect.any(Object),
        searchMetadata: expect.any(Object),
        eventIntegration: expect.any(Object)
      };

      // Mock repository方法
      mockExtensionRepository.nameExists.mockResolvedValue(false);
      mockExtensionRepository.create.mockResolvedValue(expectedExtension);

      // 🎬 Act - 执行创建扩展操作
      const result = await service.createExtension(createRequest);

      // ✅ Assert - 验证结果
      expect(result).toEqual(expectedExtension);
      expect(mockExtensionRepository.create).toHaveBeenCalledTimes(1);
      expect(mockExtensionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createRequest.name,
          displayName: createRequest.displayName,
          extensionType: createRequest.extensionType,
          status: 'installed', // 修正状态为installed
          contextId: createRequest.contextId
        })
      );
    });

    it('应该处理创建扩展时的错误', async () => {
      // 📋 Arrange - 准备会导致错误的请求
      const createRequest = {
        contextId: 'ctx-error-001' as UUID,
        name: 'error-extension',
        displayName: 'Error Extension',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
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
        security: {
          sandboxEnabled: false,
          resourceLimits: {
            maxMemory: 0,
            maxCpu: 0,
            maxFileSize: 0,
            maxNetworkConnections: 0,
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
            api: { endpoints: [], methods: [], rateLimit: 0 }
          }
        },
        metadata: {
          author: { name: '' },
          license: { type: '' },
          keywords: [],
          category: '',
          screenshots: []
        }
      };

      // Mock repository方法
      mockExtensionRepository.nameExists.mockResolvedValue(false);
      const errorMessage = 'Database connection failed';
      mockExtensionRepository.create.mockRejectedValue(new Error(errorMessage));

      // 🎬 Act & Assert - 执行操作并验证错误
      await expect(service.createExtension(createRequest)).rejects.toThrow(errorMessage);
      expect(mockExtensionRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getExtensionById方法测试', () => {
    it('应该成功获取扩展', async () => {
      // 📋 Arrange - 准备测试数据
      const extensionId = 'ext-test-001' as UUID;
      const expectedExtension: ExtensionEntityData = {
        extensionId,
        contextId: 'ctx-test-001' as UUID,
        name: 'test-extension',
        displayName: 'Test Extension',
        description: 'Test extension',
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
            throughput: 100,
            errorRate: 0,
            memoryUsage: 1024,
            cpuUsage: 5,
            lastMeasurement: new Date().toISOString()
          },
          healthCheck: {
            enabled: true,
            interval: 30000,
            timeout: 5000,
            healthyThreshold: 2,
            unhealthyThreshold: 3
          }
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100 * 1024 * 1024,
            maxCpu: 50,
            maxFileSize: 10 * 1024 * 1024,
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
        auditTrail: {
          events: [],
          complianceSettings: {
            retentionPeriod: 365,
            encryptionRequired: false,
            auditLevel: 'standard'
          }
        },
        performanceMetrics: {
          activationLatency: 100,
          executionTime: 50,
          memoryFootprint: 1024,
          cpuUtilization: 5,
          networkLatency: 10,
          errorRate: 0,
          throughput: 100,
          availability: 99.9,
          efficiencyScore: 95,
          healthStatus: 'healthy',
          alerts: []
        },
        monitoringIntegration: {
          providers: ['prometheus'],
          endpoints: [],
          dashboards: [],
          alerting: {
            enabled: true,
            channels: ['email'],
            thresholds: {
              errorRate: 5,
              responseTime: 1000,
              availability: 95
            }
          }
        },
        versionHistory: {
          versions: [],
          autoVersioning: {
            enabled: false,
            strategy: 'semantic',
            triggers: ['api_change']
          }
        },
        searchMetadata: {
          indexedFields: ['name', 'description'],
          searchStrategies: [],
          facets: []
        },
        eventIntegration: {
          eventBus: {
            provider: 'internal',
            connectionString: '',
            topics: []
          },
          eventRouting: {
            rules: [],
            defaultRoute: 'default'
          },
          eventTransformation: {
            enabled: false,
            rules: []
          }
        }
      };

      // Mock repository findById方法
      mockExtensionRepository.findById.mockResolvedValue(expectedExtension);

      // 🎬 Act - 执行获取扩展操作
      const result = await service.getExtensionById(extensionId);

      // ✅ Assert - 验证结果
      expect(result).toEqual(expectedExtension);
      expect(mockExtensionRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockExtensionRepository.findById).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理扩展不存在的情况', async () => {
      // 📋 Arrange - 准备不存在的扩展ID
      const extensionId = 'ext-nonexistent-001' as UUID;

      // Mock repository findById方法返回null
      mockExtensionRepository.findById.mockResolvedValue(null);

      // 🎬 Act - 执行获取扩展操作
      const result = await service.getExtensionById(extensionId);

      // ✅ Assert - 验证结果为null
      expect(result).toBeNull();
      expect(mockExtensionRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockExtensionRepository.findById).toHaveBeenCalledWith(extensionId);
    });
  });

  describe('updateExtension方法测试', () => {
    it('应该成功更新扩展', async () => {
      // 📋 Arrange - 准备更新请求
      const updateRequest = {
        extensionId: 'ext-update-001' as UUID,
        displayName: 'Updated Extension',
        description: 'Updated description',
        configuration: {
          enabled: false,
          maxConnections: 50
        },
        metadata: {
          author: 'Updated Author',
          license: 'Apache-2.0',
          keywords: ['updated', 'test'],
          category: 'updated-category'
        }
      };

      const existingExtension: ExtensionEntityData = {
        extensionId: updateRequest.extensionId,
        contextId: 'ctx-update-001' as UUID,
        name: 'update-extension',
        displayName: 'Original Extension',
        description: 'Original description',
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
            throughput: 100,
            errorRate: 0,
            memoryUsage: 1024,
            cpuUsage: 5,
            lastMeasurement: new Date().toISOString()
          },
          healthCheck: {
            enabled: true,
            interval: 60000,
            timeout: 5000,
            healthyThreshold: 3,
            unhealthyThreshold: 3,
            expectedStatus: 200
          }
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100 * 1024 * 1024,
            maxCpu: 50,
            maxFileSize: 10 * 1024 * 1024,
            maxNetworkConnections: 10,
            allowedDomains: [],
            blockedDomains: [],
            allowedHosts: [],
            allowedPorts: [80, 443],
            protocols: ['http', 'https']
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
          author: { name: 'Original Author' },
          license: { type: 'MIT' },
          keywords: ['original', 'test'],
          category: 'original-category',
          screenshots: []
        },
        auditTrail: {
          events: [],
          complianceSettings: {
            accessLogging: true,
            dataClassification: 'internal',
            retentionPeriod: 365,
            encryptionEnabled: true
          }
        },
        performanceMetrics: {
          activationLatency: 50,
          executionTime: 25,
          memoryFootprint: 512,
          cpuUtilization: 3,
          networkLatency: 5,
          errorRate: 0,
          throughput: 200,
          availability: 99.9,
          efficiencyScore: 98,
          healthStatus: 'healthy',
          alerts: []
        },
        monitoringIntegration: {
          providers: ['prometheus'],
          endpoints: [],
          dashboards: [],
          alerting: {
            enabled: true,
            channels: ['email'],
            rules: []
          }
        },
        versionHistory: {
          versions: [],
          autoVersioning: {
            enabled: false,
            strategy: 'semantic',
            prerelease: false,
            buildMetadata: false
          }
        },
        searchMetadata: {
          indexedFields: ['name', 'description'],
          searchStrategies: [],
          facets: []
        },
        eventIntegration: {
          eventBus: {
            provider: 'internal',
            connectionString: '',
            topics: []
          },
          eventRouting: {
            rules: [],
            errorHandling: {
              strategy: 'retry',
              maxRetries: 3,
              backoffStrategy: 'exponential'
            }
          },
          eventTransformation: {
            enabled: false,
            transformers: []
          }
        }
      };

      const updatedExtension: ExtensionEntityData = {
        extensionId: updateRequest.extensionId,
        contextId: 'ctx-update-001' as UUID,
        name: 'update-extension',
        displayName: updateRequest.displayName!,
        description: updateRequest.description,
        version: '1.1.0',
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
          currentConfig: updateRequest.configuration!,
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
            throughput: 100,
            errorRate: 0,
            memoryUsage: 1024,
            cpuUsage: 5,
            lastMeasurement: new Date().toISOString()
          },
          healthCheck: {
            enabled: true,
            interval: 30000,
            timeout: 5000,
            healthyThreshold: 2,
            unhealthyThreshold: 3
          }
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100 * 1024 * 1024,
            maxCpu: 50,
            maxFileSize: 10 * 1024 * 1024,
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
          author: { name: updateRequest.metadata!.author! },
          license: { type: updateRequest.metadata!.license! },
          keywords: updateRequest.metadata!.keywords!,
          category: updateRequest.metadata!.category!,
          screenshots: []
        },
        auditTrail: {
          events: [],
          complianceSettings: {
            retentionPeriod: 365,
            encryptionRequired: false,
            auditLevel: 'standard'
          }
        },
        performanceMetrics: {
          activationLatency: 100,
          executionTime: 50,
          memoryFootprint: 1024,
          cpuUtilization: 5,
          networkLatency: 10,
          errorRate: 0,
          throughput: 100,
          availability: 99.9,
          efficiencyScore: 95,
          healthStatus: 'healthy',
          alerts: []
        },
        monitoringIntegration: {
          providers: ['prometheus'],
          endpoints: [],
          dashboards: [],
          alerting: {
            enabled: true,
            channels: ['email'],
            thresholds: {
              errorRate: 5,
              responseTime: 1000,
              availability: 95
            }
          }
        },
        versionHistory: {
          versions: [],
          autoVersioning: {
            enabled: false,
            strategy: 'semantic',
            triggers: ['api_change']
          }
        },
        searchMetadata: {
          indexedFields: ['name', 'description'],
          searchStrategies: [],
          facets: []
        },
        eventIntegration: {
          eventBus: {
            provider: 'internal',
            connectionString: '',
            topics: []
          },
          eventRouting: {
            rules: [],
            defaultRoute: 'default'
          },
          eventTransformation: {
            enabled: false,
            rules: []
          }
        }
      };

      // Mock repository方法
      mockExtensionRepository.findById.mockResolvedValue(existingExtension);
      mockExtensionRepository.update.mockResolvedValue(updatedExtension);

      // 🎬 Act - 执行更新扩展操作
      const result = await service.updateExtension(updateRequest);

      // ✅ Assert - 验证结果
      expect(result).toEqual(updatedExtension);
      expect(mockExtensionRepository.update).toHaveBeenCalledTimes(1);
      expect(mockExtensionRepository.update).toHaveBeenCalledWith(
        updateRequest.extensionId,
        expect.objectContaining({
          extensionId: updateRequest.extensionId,
          contextId: 'ctx-update-001',
          name: 'update-extension'
          // 注意：实际的更新数据包含完整的实体数据，不只是更新的字段
        })
      );
    });
  });

  describe('deleteExtension方法测试', () => {
    it('应该成功删除扩展', async () => {
      // 📋 Arrange - 准备删除的扩展ID
      const extensionId = 'ext-delete-001' as UUID;

      // Mock repository方法
      const mockExtension = {
        extensionId,
        status: 'inactive' as ExtensionStatus
      } as ExtensionEntityData;
      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockExtensionRepository.delete.mockResolvedValue(true);

      // 🎬 Act - 执行删除扩展操作
      const result = await service.deleteExtension(extensionId);

      // ✅ Assert - 验证结果
      expect(result).toBe(true);
      expect(mockExtensionRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockExtensionRepository.delete).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理删除不存在扩展的情况', async () => {
      // 📋 Arrange - 准备不存在的扩展ID
      const extensionId = 'ext-nonexistent-delete-001' as UUID;

      // Mock repository方法
      mockExtensionRepository.findById.mockResolvedValue(null);

      // 🎬 Act - 执行删除扩展操作
      const result = await service.deleteExtension(extensionId);

      // ✅ Assert - 验证返回false而不是抛出错误
      expect(result).toBe(false);
      // 注意：delete方法不应该被调用，因为扩展不存在，服务应该返回false
      expect(mockExtensionRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('activateExtension方法测试', () => {
    it('应该成功激活扩展', async () => {
      // 📋 Arrange - 准备激活请求
      const activationRequest = {
        extensionId: 'ext-activate-001' as UUID,
        userId: 'user-001' as UUID
      };

      // Mock repository方法
      const mockExtension = {
        extensionId: activationRequest.extensionId,
        contextId: 'ctx-test-001' as UUID,
        name: 'test-extension',
        displayName: 'Test Extension',
        description: 'Test extension',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
        status: 'inactive' as ExtensionStatus,
        timestamp: new Date().toISOString(),
        protocolVersion: '1.0.0',
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
          activationCount: 0,
          errorCount: 0,
          performanceMetrics: {
            averageResponseTime: 0,
            throughput: 0,
            errorRate: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            lastMeasurement: new Date().toISOString()
          },
          healthCheck: {
            enabled: true,
            interval: 60000,
            timeout: 5000,
            healthyThreshold: 3,
            unhealthyThreshold: 3,
            expectedStatus: 200
          }
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100 * 1024 * 1024,
            maxCpu: 50,
            maxFileSize: 10 * 1024 * 1024,
            maxNetworkConnections: 10,
            allowedDomains: [],
            blockedDomains: [],
            allowedHosts: [],
            allowedPorts: [80, 443],
            protocols: ['http', 'https']
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
        auditTrail: {
          events: [],
          complianceSettings: {
            accessLogging: true,
            dataClassification: 'internal',
            retentionPeriod: 365,
            encryptionEnabled: true
          }
        },
        performanceMetrics: {
          activationLatency: 0,
          executionTime: 0,
          memoryFootprint: 0,
          cpuUtilization: 0,
          networkLatency: 0,
          errorRate: 0,
          throughput: 0,
          availability: 1,
          efficiencyScore: 1,
          healthStatus: 'healthy',
          alerts: []
        },
        monitoringIntegration: {
          providers: [],
          endpoints: [],
          dashboards: [],
          alerting: {
            enabled: false,
            channels: [],
            rules: []
          }
        },
        versionHistory: {
          versions: [],
          autoVersioning: {
            enabled: false,
            strategy: 'semantic',
            prerelease: false,
            buildMetadata: false
          }
        },
        searchMetadata: {
          indexedFields: ['name', 'description'],
          searchStrategies: [],
          facets: []
        },
        eventIntegration: {
          eventBus: {
            provider: 'custom',
            connectionString: '',
            topics: []
          },
          eventRouting: {
            rules: [],
            errorHandling: {
              strategy: 'retry',
              maxRetries: 3,
              backoffStrategy: 'exponential'
            }
          },
          eventTransformation: {
            enabled: false,
            transformers: []
          }
        }
      } as ExtensionEntityData;
      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockExtensionRepository.update.mockResolvedValue({
        ...mockExtension,
        status: 'active' as ExtensionStatus
      });

      // 🎬 Act - 执行激活扩展操作
      const result = await service.activateExtension(activationRequest);

      // ✅ Assert - 验证结果
      expect(result).toBe(true);
    });
  });

  describe('deactivateExtension方法测试', () => {
    it('应该成功停用扩展', async () => {
      // 📋 Arrange - 准备停用的扩展ID和用户ID
      const extensionId = 'ext-deactivate-001' as UUID;
      const userId = 'user-001' as UUID;

      // Mock repository方法 - 使用与激活测试相同的完整结构
      const mockExtension = {
        extensionId,
        contextId: 'ctx-test-001' as UUID,
        name: 'test-extension',
        displayName: 'Test Extension',
        description: 'Test extension',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus,
        timestamp: new Date().toISOString(),
        protocolVersion: '1.0.0',
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
            throughput: 100,
            errorRate: 0,
            memoryUsage: 1024,
            cpuUsage: 5,
            lastMeasurement: new Date().toISOString()
          },
          healthCheck: {
            enabled: true,
            interval: 60000,
            timeout: 5000,
            healthyThreshold: 3,
            unhealthyThreshold: 3,
            expectedStatus: 200
          }
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100 * 1024 * 1024,
            maxCpu: 50,
            maxFileSize: 10 * 1024 * 1024,
            maxNetworkConnections: 10,
            allowedDomains: [],
            blockedDomains: [],
            allowedHosts: [],
            allowedPorts: [80, 443],
            protocols: ['http', 'https']
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
        auditTrail: {
          events: [],
          complianceSettings: {
            accessLogging: true,
            dataClassification: 'internal',
            retentionPeriod: 365,
            encryptionEnabled: true
          }
        },
        performanceMetrics: {
          activationLatency: 50,
          executionTime: 25,
          memoryFootprint: 512,
          cpuUtilization: 3,
          networkLatency: 5,
          errorRate: 0,
          throughput: 200,
          availability: 99.9,
          efficiencyScore: 98,
          healthStatus: 'healthy',
          alerts: []
        },
        monitoringIntegration: {
          providers: ['prometheus'],
          endpoints: [],
          dashboards: [],
          alerting: {
            enabled: true,
            channels: ['email'],
            rules: []
          }
        },
        versionHistory: {
          versions: [],
          autoVersioning: {
            enabled: false,
            strategy: 'semantic',
            prerelease: false,
            buildMetadata: false
          }
        },
        searchMetadata: {
          indexedFields: ['name', 'description'],
          searchStrategies: [],
          facets: []
        },
        eventIntegration: {
          eventBus: {
            provider: 'custom',
            connectionString: '',
            topics: []
          },
          eventRouting: {
            rules: [],
            errorHandling: {
              strategy: 'retry',
              maxRetries: 3,
              backoffStrategy: 'exponential'
            }
          },
          eventTransformation: {
            enabled: false,
            transformers: []
          }
        }
      } as ExtensionEntityData;
      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockExtensionRepository.update.mockResolvedValue({
        ...mockExtension,
        status: 'inactive' as ExtensionStatus
      });

      // 🎬 Act - 执行停用扩展操作
      const result = await service.deactivateExtension(extensionId, userId);

      // ✅ Assert - 验证结果
      expect(result).toBe(true);
    });
  });

  describe('queryExtensions方法测试', () => {
    it('应该成功查询扩展列表', async () => {
      // 📋 Arrange - 准备查询参数
      const filter = {
        contextId: 'ctx-query-001' as UUID,
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus
      };

      const pagination = {
        page: 1,
        limit: 10
      };

      const sort = [
        {
          field: 'name',
          direction: 'asc' as const
        }
      ];

      const expectedResult = {
        extensions: [
          {
            extensionId: 'ext-query-001' as UUID,
            name: 'query-extension-1',
            displayName: 'Query Extension 1',
            extensionType: 'plugin' as ExtensionType,
            status: 'active' as ExtensionStatus
          },
          {
            extensionId: 'ext-query-002' as UUID,
            name: 'query-extension-2',
            displayName: 'Query Extension 2',
            extensionType: 'plugin' as ExtensionType,
            status: 'active' as ExtensionStatus
          }
        ] as ExtensionEntityData[],
        total: 2,
        page: 1,
        limit: 10,
        hasMore: false
      };

      // Mock repository findByFilter方法
      mockExtensionRepository.findByFilter.mockResolvedValue(expectedResult);

      // 🎬 Act - 执行查询扩展操作
      const result = await service.queryExtensions(filter, pagination, sort);

      // ✅ Assert - 验证结果
      expect(result).toEqual(expectedResult);
      expect(mockExtensionRepository.findByFilter).toHaveBeenCalledTimes(1);
      expect(mockExtensionRepository.findByFilter).toHaveBeenCalledWith(filter, pagination, sort);
    });
  });

  describe('getHealthStatus方法测试', () => {
    it('应该返回健康状态', async () => {
      // 📋 Arrange - 准备Mock数据
      const mockStats = {
        totalExtensions: 10,
        activeExtensions: 8,
        inactiveExtensions: 2,
        errorExtensions: 0,
        averagePerformanceMetrics: {
          responseTime: 50,
          errorRate: 0,
          throughput: 100
        }
      };

      const mockRecentExtensions = [
        {
          extensionId: 'ext-recent-001' as UUID,
          timestamp: new Date().toISOString()
        }
      ];

      // Mock repository方法
      mockExtensionRepository.getStatistics.mockResolvedValue(mockStats);
      mockExtensionRepository.findRecentlyUpdatedExtensions.mockResolvedValue(mockRecentExtensions);

      // 🎬 Act - 执行获取健康状态操作
      const result = await service.getHealthStatus();

      // ✅ Assert - 验证结果
      expect(result).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        details: expect.any(Object)
      });
      expect(result.details.service).toBe('ExtensionManagementService');
      expect(result.details.version).toBe('1.0.0');
      expect(result.details.repository.extensionCount).toBe(10);
      expect(result.details.repository.activeExtensions).toBe(8);
      expect(result.details.performance.averageResponseTime).toBe(50);
      expect(result.details.performance.errorRate).toBe(0);
    });
  });
});
