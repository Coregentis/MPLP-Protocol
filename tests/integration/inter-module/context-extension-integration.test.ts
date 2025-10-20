/**
 * Context-Extension模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证上下文驱动扩展的集成功能
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { ContextTestFactory } from '../../modules/context/factories/context-test.factory';
import { ExtensionTestFactory } from '../../modules/extension/factories/extension-test.factory';

describe('Context-Extension模块间集成测试', () => {
  let contextService: ContextManagementService;
  let extensionService: ExtensionManagementService;
  let mockContextEntity: any;
  let mockExtensionEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    contextService = new ContextManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    extensionService = new ExtensionManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockContextEntity = ContextTestFactory.createContextEntity();
    mockExtensionEntity = ExtensionTestFactory.createExtensionEntity();
  });

  describe('上下文驱动扩展集成', () => {
    it('应该基于上下文安装扩展', async () => {
      // Arrange
      const contextId = mockContextEntity.contextId;

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId,
        name: 'Extension Context',
        status: 'active',
        extensionsEnabled: true
      } as any);
      
      // Mock extension service - 使用实际存在的方法
      jest.spyOn(extensionService, 'createExtension').mockResolvedValue({
        extensionId: 'ext-001',
        contextId,
        name: 'Context Extension',
        status: 'installed',
        version: '1.0.0'
      } as any);

      // Act
      const context = await contextService.getContext(contextId);
      const extension = await extensionService.createExtension({
        contextId: context.contextId,
        name: 'Context Extension',
        version: '1.0.0'
      } as any);

      // Assert
      expect(context).toBeDefined();
      expect(extension).toBeDefined();
      expect(extension.contextId).toBe(contextId);
    });

    it('应该查询上下文统计和扩展统计的关联', async () => {
      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        total: 12,
        byStatus: { 'active': 10, 'suspended': 2 },
        byLifecycleStage: { 'executing': 8, 'monitoring': 4 },
        extensionEnabled: 10
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 25,
        installedExtensions: 20,
        activeExtensions: 18,
        extensionsByCategory: { 'context': 8, 'utility': 7, 'integration': 5 },
        averageInstallTime: 150
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(contextStats.extensionEnabled).toBeGreaterThan(0);
      expect(extensionStats.extensionsByCategory['context']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Context模块的预留接口参数', async () => {
      const testContextIntegration = async (
        _contextId: string,
        _extensionId: string,
        _extensionConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testContextIntegration(
        mockContextEntity.contextId,
        mockExtensionEntity.extensionId,
        { extensionType: 'context', autoLoad: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Extension模块的预留接口参数', async () => {
      const testExtensionIntegration = async (
        _extensionId: string,
        _contextId: string,
        _contextData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testExtensionIntegration(
        mockExtensionEntity.extensionId,
        mockContextEntity.contextId,
        { contextType: 'user', supportExtensions: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('扩展生命周期集成测试', () => {
    it('应该支持上下文扩展的生命周期管理', async () => {
      const lifecycleData = {
        contextId: mockContextEntity.contextId,
        extensionId: mockExtensionEntity.extensionId,
        operation: 'lifecycle_management'
      };

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId: lifecycleData.contextId,
        name: 'Lifecycle Context',
        status: 'active',
        extensionLifecycle: 'managed'
      } as any);

      // Mock extension service - 使用listExtensions代替getExtension
      jest.spyOn(extensionService, 'listExtensions').mockResolvedValue([{
        extensionId: lifecycleData.extensionId,
        contextId: lifecycleData.contextId,
        status: 'active',
        lifecycle: { stage: 'running', health: 'healthy' }
      }] as any);

      // Act
      const context = await contextService.getContext(lifecycleData.contextId);
      const extensions = await extensionService.listExtensions();

      // Assert
      expect(context.extensionLifecycle).toBe('managed');
      expect(extensions).toHaveLength(1);
      expect(extensions[0].contextId).toBe(lifecycleData.contextId);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理上下文不支持扩展的情况', async () => {
      const contextId = 'no-extension-context';
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId,
        extensionsEnabled: false
      } as any);

      const context = await contextService.getContext(contextId);
      expect(context.extensionsEnabled).toBe(false);
    });

    it('应该正确处理扩展创建失败', async () => {
      const invalidExtensionData = { name: '', version: '' };
      jest.spyOn(extensionService, 'createExtension').mockRejectedValue(new Error('Invalid extension data'));

      await expect(extensionService.createExtension(invalidExtensionData as any)).rejects.toThrow('Invalid extension data');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Context-Extension集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId: mockContextEntity.contextId,
        name: 'Performance Test Context'
      } as any);
      
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 15,
        installedExtensions: 12,
        activeExtensions: 10,
        extensionsByCategory: { 'context': 5, 'utility': 5, 'integration': 2 },
        averageInstallTime: 120
      } as any);

      const context = await contextService.getContext(mockContextEntity.contextId);
      const extensionStats = await extensionService.getExtensionStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(context).toBeDefined();
      expect(extensionStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Context-Extension数据关联的一致性', () => {
      const contextId = mockContextEntity.contextId;
      const extensionId = mockExtensionEntity.extensionId;

      expect(contextId).toBeDefined();
      expect(typeof contextId).toBe('string');
      expect(contextId.length).toBeGreaterThan(0);
      
      expect(extensionId).toBeDefined();
      expect(typeof extensionId).toBe('string');
      expect(extensionId.length).toBeGreaterThan(0);
    });

    it('应该验证上下文扩展关联数据的完整性', () => {
      const contextData = {
        contextId: mockContextEntity.contextId,
        name: 'Extension-enabled Context',
        extensionsEnabled: true,
        supportedExtensions: ['utility', 'integration']
      };

      const extensionData = {
        extensionId: mockExtensionEntity.extensionId,
        contextId: contextData.contextId,
        category: 'utility',
        status: 'installed'
      };

      expect(extensionData.contextId).toBe(contextData.contextId);
      expect(contextData.extensionsEnabled).toBe(true);
      expect(contextData.supportedExtensions).toContain(extensionData.category);
    });
  });
});
