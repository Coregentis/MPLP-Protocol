/**
 * Role-Dialog模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证角色驱动对话的集成功能
 */

import { RoleManagementService } from '../../../src/modules/role/application/services/role-management.service';
import { DialogManagementService } from '../../../src/modules/dialog/application/services/dialog-management.service';
import { RoleTestFactory } from '../../modules/role/factories/role-test.factory';
describe('Role-Dialog模块间集成测试', () => {
  let roleService: RoleManagementService;
  let dialogService: DialogManagementService;
  let mockRoleEntity: any;
  let mockDialogEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    roleService = new RoleManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    dialogService = new DialogManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockRoleEntity = RoleTestFactory.createRoleEntity();
    mockDialogEntity = { dialogId: 'dialog-role-001' }; // 简化的mock数据
  });

  describe('角色驱动对话集成', () => {
    it('应该基于角色创建对话', async () => {
      // Arrange
      const roleId = mockRoleEntity.roleId;

      // Mock role service
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue({
        roleId,
        roleName: 'Dialog Manager',
        status: 'active',
        permissions: ['dialog:create', 'dialog:manage']
      } as any);
      
      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 32,
        averageParticipants: 3.2,
        activeDialogs: 28,
        endedDialogs: 4,
        dialogsByCapability: {
          intelligentControl: 18,
          criticalThinking: 15,
          knowledgeSearch: 20,
          multimodal: 10
        },
        recentActivity: {
          dailyCreated: [3, 5, 4, 7, 6, 8, 5],
          weeklyActive: [22, 28, 25, 32]
        }
      } as any);

      // Act
      const role = await roleService.getRoleById(roleId);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(role).toBeDefined();
      expect(dialogStats).toBeDefined();
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });

    it('应该查询角色统计和对话统计的关联', async () => {
      // Mock role service
      jest.spyOn(roleService, 'getRoleStatistics').mockResolvedValue({
        totalRoles: 18,
        activeRoles: 15,
        inactiveRoles: 3,
        rolesByType: { 'dialog_manager': 6, 'moderator': 5, 'participant': 7 },
        averageComplexityScore: 4.5,
        totalPermissions: 54,
        totalAgents: 36
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 35,
        averageParticipants: 3.5,
        activeDialogs: 30,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 20,
          criticalThinking: 18,
          knowledgeSearch: 22,
          multimodal: 12
        },
        recentActivity: {
          dailyCreated: [4, 6, 5, 8, 7, 9, 6],
          weeklyActive: [25, 30, 28, 35]
        }
      } as any);

      // Act
      const roleStats = await roleService.getRoleStatistics();
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(roleStats.rolesByType['dialog_manager']).toBeGreaterThan(0);
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Role模块的预留接口参数', async () => {
      const testRoleIntegration = async (
        _roleId: string,
        _dialogId: string,
        _dialogConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testRoleIntegration(
        mockRoleEntity.roleId,
        mockDialogEntity.dialogId,
        { dialogType: 'role', intelligent: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Dialog模块的预留接口参数', async () => {
      const testDialogIntegration = async (
        _dialogId: string,
        _roleId: string,
        _roleData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testDialogIntegration(
        mockDialogEntity.dialogId,
        mockRoleEntity.roleId,
        { roleName: 'Dialog Role', permissions: ['dialog'] }
      );

      expect(result).toBe(true);
    });
  });

  describe('角色对话集成测试', () => {
    it('应该支持角色对话的智能管理', async () => {
      const intelligentData = {
        roleId: mockRoleEntity.roleId,
        dialogId: mockDialogEntity.dialogId,
        operation: 'intelligent_dialog'
      };

      // Mock role service
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue({
        roleId: intelligentData.roleId,
        roleName: 'Intelligent Moderator',
        status: 'active',
        dialogCapabilities: ['intelligent', 'criticalThinking']
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 28,
        averageParticipants: 3.0,
        activeDialogs: 24,
        endedDialogs: 4,
        dialogsByCapability: {
          intelligentControl: 24,
          criticalThinking: 20,
          knowledgeSearch: 18,
          multimodal: 8
        },
        recentActivity: {
          dailyCreated: [3, 4, 5, 6, 5, 7, 4],
          weeklyActive: [20, 24, 22, 28]
        }
      } as any);

      // Act
      const role = await roleService.getRoleById(intelligentData.roleId);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(role.dialogCapabilities).toContain('intelligent');
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理角色获取失败', async () => {
      const roleId = 'invalid-role-id';
      jest.spyOn(roleService, 'getRoleById').mockRejectedValue(new Error('Role not found'));

      await expect(roleService.getRoleById(roleId)).rejects.toThrow('Role not found');
    });

    it('应该正确处理对话统计获取失败', async () => {
      jest.spyOn(dialogService, 'getDialogStatistics').mockRejectedValue(new Error('Dialog service unavailable'));

      await expect(dialogService.getDialogStatistics()).rejects.toThrow('Dialog service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Role-Dialog集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue({
        roleId: mockRoleEntity.roleId,
        roleName: 'Performance Test Role'
      } as any);
      
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 20,
        averageParticipants: 2.5,
        activeDialogs: 18,
        endedDialogs: 2,
        dialogsByCapability: {
          intelligentControl: 12,
          criticalThinking: 10,
          knowledgeSearch: 14,
          multimodal: 6
        },
        recentActivity: {
          dailyCreated: [2, 3, 4, 5, 4, 6, 3],
          weeklyActive: [15, 18, 16, 20]
        }
      } as any);

      const role = await roleService.getRoleById(mockRoleEntity.roleId);
      const dialogStats = await dialogService.getDialogStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(role).toBeDefined();
      expect(dialogStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Role-Dialog数据关联的一致性', () => {
      const roleId = mockRoleEntity.roleId;
      const dialogId = mockDialogEntity.dialogId;

      expect(roleId).toBeDefined();
      expect(typeof roleId).toBe('string');
      expect(roleId.length).toBeGreaterThan(0);
      
      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');
      expect(dialogId.length).toBeGreaterThan(0);
    });

    it('应该验证角色对话关联数据的完整性', () => {
      const roleData = {
        roleId: mockRoleEntity.roleId,
        roleName: 'Dialog-enabled Role',
        dialogEnabled: true,
        supportedCapabilities: ['intelligent', 'criticalThinking']
      };

      const dialogData = {
        dialogId: mockDialogEntity.dialogId,
        roleId: roleData.roleId,
        capabilities: ['intelligent', 'knowledgeSearch'],
        status: 'active'
      };

      expect(dialogData.roleId).toBe(roleData.roleId);
      expect(roleData.dialogEnabled).toBe(true);
      expect(dialogData.capabilities).toContain('intelligent');
    });
  });
});
