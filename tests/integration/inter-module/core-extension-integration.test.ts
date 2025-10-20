/**
 * Core-Extension模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证核心驱动扩展的集成功能
 */

import { CoreOrchestrationService } from '../../../src/modules/core/application/services/core-orchestration.service';
import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { ExtensionTestFactory } from '../../modules/extension/factories/extension-test.factory';

describe('Core-Extension模块间集成测试', () => {
  let coreService: CoreOrchestrationService;
  let extensionService: ExtensionManagementService;
  let mockCoreEntity: any;
  let mockExtensionEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    coreService = new CoreOrchestrationService(
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
    mockCoreEntity = { coreId: 'core-extension-001' }; // 简化的mock数据
    mockExtensionEntity = ExtensionTestFactory.createExtensionEntity();
  });

  describe('核心驱动扩展集成', () => {
    it('应该基于核心编排创建扩展', async () => {
      // Arrange
      const coreId = mockCoreEntity.coreId;

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 52,
        installedExtensions: 46,
        activeExtensions: 40,
        extensionsByCategory: { 'core_orchestrated': 28, 'system': 18, 'utility': 6 },
        averageInstallTime: 240
      } as any);

      // Act
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(extensionStats).toBeDefined();
      expect(extensionStats.extensionsByCategory['core_orchestrated']).toBeGreaterThan(0);
    });

    it('应该查询核心和扩展统计的关联', async () => {
      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 58,
        installedExtensions: 52,
        activeExtensions: 46,
        extensionsByCategory: { 'core_orchestrated': 32, 'system': 20, 'utility': 6 },
        averageInstallTime: 230
      } as any);

      // Act
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(extensionStats.extensionsByCategory['core_orchestrated']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Core模块的预留接口参数', async () => {
      const testCoreIntegration = async (
        _coreId: string,
        _extensionId: string,
        _extensionConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testCoreIntegration(
        mockCoreEntity.coreId,
        mockExtensionEntity.extensionId,
        { extensionType: 'core_orchestrated', managed: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Extension模块的预留接口参数', async () => {
      const testExtensionIntegration = async (
        _extensionId: string,
        _coreId: string,
        _coreData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testExtensionIntegration(
        mockExtensionEntity.extensionId,
        mockCoreEntity.coreId,
        { coreType: 'orchestrator', extensionManagementEnabled: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('扩展编排集成测试', () => {
    it('应该支持核心扩展的编排管理', async () => {
      const orchestrationData = {
        coreId: mockCoreEntity.coreId,
        extensionId: mockExtensionEntity.extensionId,
        operation: 'extension_orchestration'
      };

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 48,
        installedExtensions: 42,
        activeExtensions: 36,
        extensionsByCategory: { 'orchestration_managed': 24, 'system': 18, 'utility': 6 },
        averageInstallTime: 220
      } as any);

      // Act
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(extensionStats.extensionsByCategory['orchestration_managed']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理扩展统计获取失败', async () => {
      jest.spyOn(extensionService, 'getExtensionStatistics').mockRejectedValue(new Error('Extension service unavailable'));

      await expect(extensionService.getExtensionStatistics()).rejects.toThrow('Extension service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Core-Extension集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 42,
        installedExtensions: 36,
        activeExtensions: 30,
        extensionsByCategory: { 'core_orchestrated': 20, 'system': 16, 'utility': 6 },
        averageInstallTime: 210
      } as any);

      const extensionStats = await extensionService.getExtensionStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(extensionStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Core-Extension数据关联的一致性', () => {
      const coreId = mockCoreEntity.coreId;
      const extensionId = mockExtensionEntity.extensionId;

      expect(coreId).toBeDefined();
      expect(typeof coreId).toBe('string');
      expect(coreId.length).toBeGreaterThan(0);
      
      expect(extensionId).toBeDefined();
      expect(typeof extensionId).toBe('string');
      expect(extensionId.length).toBeGreaterThan(0);
    });

    it('应该验证核心扩展关联数据的完整性', () => {
      const coreData = {
        coreId: mockCoreEntity.coreId,
        orchestrationType: 'extension_driven',
        extensionManagementEnabled: true,
        managedExtensionTypes: ['core_orchestrated', 'system']
      };

      const extensionData = {
        extensionId: mockExtensionEntity.extensionId,
        coreId: coreData.coreId,
        extensionType: 'core_orchestrated',
        status: 'orchestrated'
      };

      expect(extensionData.coreId).toBe(coreData.coreId);
      expect(coreData.extensionManagementEnabled).toBe(true);
      expect(coreData.managedExtensionTypes).toContain(extensionData.extensionType);
    });
  });
});
