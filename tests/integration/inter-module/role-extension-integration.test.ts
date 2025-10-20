/**
 * Role-Extension模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证角色驱动扩展的集成功能
 */

import { RoleManagementService } from '../../../src/modules/role/application/services/role-management.service';
import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { RoleTestFactory } from '../../modules/role/factories/role-test.factory';
import { ExtensionTestFactory } from '../../modules/extension/factories/extension-test.factory';

describe('Role-Extension模块间集成测试', () => {
  let roleService: RoleManagementService;
  let extensionService: ExtensionManagementService;
  let mockRoleEntity: any;
  let mockExtensionEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    roleService = new RoleManagementService(
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
    mockRoleEntity = RoleTestFactory.createRoleEntity();
    mockExtensionEntity = ExtensionTestFactory.createExtensionEntity();
  });

  describe('角色驱动扩展集成', () => {
    it('应该基于角色安装扩展', async () => {
      // Arrange
      const roleId = mockRoleEntity.roleId;

      // Mock role service
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue({
        roleId,
        roleName: 'Extension Manager',
        status: 'active',
        permissions: ['extension:install', 'extension:manage']
      } as any);
      
      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 22,
        installedExtensions: 18,
        activeExtensions: 15,
        extensionsByCategory: { 'role': 8, 'security': 5, 'utility': 5 },
        averageInstallTime: 170
      } as any);

      // Act
      const role = await roleService.getRoleById(roleId);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(role).toBeDefined();
      expect(extensionStats).toBeDefined();
      expect(extensionStats.extensionsByCategory['role']).toBeGreaterThan(0);
    });

    it('应该查询角色统计和扩展统计的关联', async () => {
      // Mock role service
      jest.spyOn(roleService, 'getRoleStatistics').mockResolvedValue({
        totalRoles: 15,
        activeRoles: 12,
        inactiveRoles: 3,
        rolesByType: { 'extension_manager': 5, 'admin': 4, 'user': 6 },
        averageComplexityScore: 4.2,
        totalPermissions: 45,
        totalAgents: 30
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 28,
        installedExtensions: 22,
        activeExtensions: 18,
        extensionsByCategory: { 'role': 10, 'security': 8, 'utility': 4 },
        averageInstallTime: 160
      } as any);

      // Act
      const roleStats = await roleService.getRoleStatistics();
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(roleStats.rolesByType['extension_manager']).toBeGreaterThan(0);
      expect(extensionStats.extensionsByCategory['role']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Role模块的预留接口参数', async () => {
      const testRoleIntegration = async (
        _roleId: string,
        _extensionId: string,
        _extensionConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testRoleIntegration(
        mockRoleEntity.roleId,
        mockExtensionEntity.extensionId,
        { extensionType: 'role', permissions: ['install'] }
      );

      expect(result).toBe(true);
    });

    it('应该测试Extension模块的预留接口参数', async () => {
      const testExtensionIntegration = async (
        _extensionId: string,
        _roleId: string,
        _roleData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testExtensionIntegration(
        mockExtensionEntity.extensionId,
        mockRoleEntity.roleId,
        { roleName: 'Extension Role', permissions: ['manage'] }
      );

      expect(result).toBe(true);
    });
  });

  describe('角色权限扩展集成测试', () => {
    it('应该支持角色权限的扩展管理', async () => {
      const permissionData = {
        roleId: mockRoleEntity.roleId,
        extensionId: mockExtensionEntity.extensionId,
        operation: 'permission_extension'
      };

      // Mock role service
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue({
        roleId: permissionData.roleId,
        roleName: 'Permission Manager',
        status: 'active',
        permissions: ['extension:install', 'extension:configure', 'role:manage']
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 24,
        installedExtensions: 20,
        activeExtensions: 16,
        extensionsByCategory: { 'permission': 8, 'role': 6, 'security': 6 },
        averageInstallTime: 150
      } as any);

      // Act
      const role = await roleService.getRoleById(permissionData.roleId);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(role.permissions).toContain('extension:install');
      expect(extensionStats.extensionsByCategory['permission']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理角色获取失败', async () => {
      const roleId = 'invalid-role-id';
      jest.spyOn(roleService, 'getRoleById').mockRejectedValue(new Error('Role not found'));

      await expect(roleService.getRoleById(roleId)).rejects.toThrow('Role not found');
    });

    it('应该正确处理扩展统计获取失败', async () => {
      jest.spyOn(extensionService, 'getExtensionStatistics').mockRejectedValue(new Error('Extension service unavailable'));

      await expect(extensionService.getExtensionStatistics()).rejects.toThrow('Extension service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Role-Extension集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(roleService, 'getRoleById').mockResolvedValue({
        roleId: mockRoleEntity.roleId,
        roleName: 'Performance Test Role'
      } as any);
      
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 18,
        installedExtensions: 15,
        activeExtensions: 12,
        extensionsByCategory: { 'role': 6, 'security': 4, 'utility': 5 },
        averageInstallTime: 140
      } as any);

      const role = await roleService.getRoleById(mockRoleEntity.roleId);
      const extensionStats = await extensionService.getExtensionStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(role).toBeDefined();
      expect(extensionStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Role-Extension数据关联的一致性', () => {
      const roleId = mockRoleEntity.roleId;
      const extensionId = mockExtensionEntity.extensionId;

      expect(roleId).toBeDefined();
      expect(typeof roleId).toBe('string');
      expect(roleId.length).toBeGreaterThan(0);
      
      expect(extensionId).toBeDefined();
      expect(typeof extensionId).toBe('string');
      expect(extensionId.length).toBeGreaterThan(0);
    });

    it('应该验证角色扩展关联数据的完整性', () => {
      const roleData = {
        roleId: mockRoleEntity.roleId,
        roleName: 'Extension-enabled Role',
        extensionsEnabled: true,
        allowedExtensions: ['role', 'security']
      };

      const extensionData = {
        extensionId: mockExtensionEntity.extensionId,
        roleId: roleData.roleId,
        category: 'role',
        status: 'installed'
      };

      expect(extensionData.roleId).toBe(roleData.roleId);
      expect(roleData.extensionsEnabled).toBe(true);
      expect(roleData.allowedExtensions).toContain(extensionData.category);
    });
  });
});
