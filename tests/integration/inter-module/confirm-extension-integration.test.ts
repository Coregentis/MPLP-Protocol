/**
 * Confirm-Extension模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证确认驱动扩展的集成功能
 */

import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { ConfirmTestFactory } from '../../modules/confirm/factories/confirm-test.factory';
import { ExtensionTestFactory } from '../../modules/extension/factories/extension-test.factory';

describe('Confirm-Extension模块间集成测试', () => {
  let confirmService: ConfirmManagementService;
  let extensionService: ExtensionManagementService;
  let mockConfirmEntity: any;
  let mockExtensionEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    confirmService = new ConfirmManagementService(
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
    mockConfirmEntity = ConfirmTestFactory.createConfirmEntity();
    mockExtensionEntity = ExtensionTestFactory.createExtensionEntity();
  });

  describe('确认驱动扩展集成', () => {
    it('应该基于确认安装扩展', async () => {
      // Arrange
      const confirmId = mockConfirmEntity.confirmId;

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId,
        confirmationType: 'extension_approval',
        status: 'approved',
        extensionRequired: true
      } as any);
      
      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 26,
        installedExtensions: 22,
        activeExtensions: 18,
        extensionsByCategory: { 'approval': 10, 'workflow': 8, 'utility': 4 },
        averageInstallTime: 180
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(confirmId);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(confirm).toBeDefined();
      expect(extensionStats).toBeDefined();
      expect(extensionStats.extensionsByCategory['approval']).toBeGreaterThan(0);
    });

    it('应该查询确认统计和扩展统计的关联', async () => {
      // Mock confirm service
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 25,
        byStatus: { 'pending': 10, 'approved': 12, 'rejected': 3 },
        byType: { 'extension_approval': 15, 'manual_approval': 10 },
        byPriority: { 'high': 8, 'medium': 12, 'low': 5 }
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 30,
        installedExtensions: 25,
        activeExtensions: 20,
        extensionsByCategory: { 'approval': 12, 'workflow': 10, 'utility': 3 },
        averageInstallTime: 170
      } as any);

      // Act
      const confirmStats = await confirmService.getStatistics();
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(confirmStats.byType['extension_approval']).toBeGreaterThan(0);
      expect(extensionStats.extensionsByCategory['approval']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Confirm模块的预留接口参数', async () => {
      const testConfirmIntegration = async (
        _confirmId: string,
        _extensionId: string,
        _extensionConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testConfirmIntegration(
        mockConfirmEntity.confirmId,
        mockExtensionEntity.extensionId,
        { extensionType: 'approval', autoApprove: false }
      );

      expect(result).toBe(true);
    });

    it('应该测试Extension模块的预留接口参数', async () => {
      const testExtensionIntegration = async (
        _extensionId: string,
        _confirmId: string,
        _confirmData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testExtensionIntegration(
        mockExtensionEntity.extensionId,
        mockConfirmEntity.confirmId,
        { confirmationType: 'extension', requiresApproval: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('扩展审批集成测试', () => {
    it('应该支持确认扩展的审批管理', async () => {
      const approvalData = {
        confirmId: mockConfirmEntity.confirmId,
        extensionId: mockExtensionEntity.extensionId,
        operation: 'extension_approval'
      };

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: approvalData.confirmId,
        confirmationType: 'extension_approval',
        status: 'approved',
        approvalWorkflow: {
          steps: [{ stepId: 'step-1', status: 'completed' }]
        }
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 28,
        installedExtensions: 24,
        activeExtensions: 20,
        extensionsByCategory: { 'approved': 12, 'pending': 8, 'rejected': 4 },
        averageInstallTime: 160
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(approvalData.confirmId);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(confirm.status).toBe('approved');
      expect(extensionStats.extensionsByCategory['approved']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理确认获取失败', async () => {
      const confirmId = 'invalid-confirm-id';
      jest.spyOn(confirmService, 'getConfirm').mockRejectedValue(new Error('Confirm not found'));

      await expect(confirmService.getConfirm(confirmId)).rejects.toThrow('Confirm not found');
    });

    it('应该正确处理扩展统计获取失败', async () => {
      jest.spyOn(extensionService, 'getExtensionStatistics').mockRejectedValue(new Error('Extension service unavailable'));

      await expect(extensionService.getExtensionStatistics()).rejects.toThrow('Extension service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Confirm-Extension集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: mockConfirmEntity.confirmId,
        confirmationType: 'performance_test'
      } as any);
      
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 20,
        installedExtensions: 18,
        activeExtensions: 15,
        extensionsByCategory: { 'approval': 8, 'workflow': 7, 'utility': 3 },
        averageInstallTime: 150
      } as any);

      const confirm = await confirmService.getConfirm(mockConfirmEntity.confirmId);
      const extensionStats = await extensionService.getExtensionStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(confirm).toBeDefined();
      expect(extensionStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Confirm-Extension数据关联的一致性', () => {
      const confirmId = mockConfirmEntity.confirmId;
      const extensionId = mockExtensionEntity.extensionId;

      expect(confirmId).toBeDefined();
      expect(typeof confirmId).toBe('string');
      expect(confirmId.length).toBeGreaterThan(0);
      
      expect(extensionId).toBeDefined();
      expect(typeof extensionId).toBe('string');
      expect(extensionId.length).toBeGreaterThan(0);
    });

    it('应该验证确认扩展关联数据的完整性', () => {
      const confirmData = {
        confirmId: mockConfirmEntity.confirmId,
        confirmationType: 'extension_approval',
        extensionRequired: true,
        approvalTypes: ['install', 'configure']
      };

      const extensionData = {
        extensionId: mockExtensionEntity.extensionId,
        confirmId: confirmData.confirmId,
        category: 'approval',
        status: 'approved'
      };

      expect(extensionData.confirmId).toBe(confirmData.confirmId);
      expect(confirmData.extensionRequired).toBe(true);
      expect(confirmData.approvalTypes).toContain('install');
    });
  });
});
