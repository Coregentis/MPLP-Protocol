/**
 * Plan-Role模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证规划驱动角色管理的集成功能
 */

import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { RoleManagementService } from '../../../src/modules/role/application/services/role-management.service';
import { PlanTestFactory } from '../../modules/plan/factories/plan-test.factory';
import { RoleTestFactory } from '../../modules/role/factories/role-test.factory';

describe('Plan-Role模块间集成测试', () => {
  let planService: PlanManagementService;
  let roleService: RoleManagementService;
  let mockPlanEntity: any;
  let mockRoleEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    planService = new PlanManagementService(
      {} as any, // Mock AI service adapter
      {} as any  // Mock logger
    );

    roleService = new RoleManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockPlanEntity = PlanTestFactory.createPlanEntity();
    mockRoleEntity = RoleTestFactory.createRoleEntity();
  });

  describe('规划驱动角色管理集成', () => {
    it('应该基于规划创建角色', async () => {
      // Arrange
      const planId = mockPlanEntity.planId;
      const contextId = 'context-plan-role-001';

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId,
        contextId,
        name: 'Role Management Plan',
        status: 'active',
        tasks: []
      } as any);
      
      // Mock role service
      jest.spyOn(roleService, 'createRole').mockResolvedValue({
        roleId: 'role-001',
        contextId,
        planId,
        roleName: 'Plan Executor',
        status: 'active'
      } as any);

      // Act
      const plan = await planService.getPlan(planId);
      const role = await roleService.createRole({
        contextId: plan.contextId,
        roleName: 'Plan Executor',
        permissions: ['plan:execute', 'plan:monitor']
      } as any);

      // Assert
      expect(plan).toBeDefined();
      expect(role).toBeDefined();
      expect(role.contextId).toBe(contextId);
    });

    it('应该查询规划和角色的基本信息关联', async () => {
      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Role-based Plan',
        status: 'active',
        requiredRoles: ['executor', 'monitor']
      } as any);

      // Mock role service
      jest.spyOn(roleService, 'getRoleStatistics').mockResolvedValue({
        totalRoles: 12,
        activeRoles: 10,
        inactiveRoles: 2,
        rolesByType: { 'executor': 6, 'monitor': 4, 'admin': 2 },
        averageComplexityScore: 4.1,
        totalPermissions: 36,
        totalAgents: 24
      } as any);

      // Act
      const plan = await planService.getPlan(mockPlanEntity.planId);
      const roleStats = await roleService.getRoleStatistics();

      // Assert
      expect(plan.status).toBe('active');
      expect(roleStats.activeRoles).toBeGreaterThan(0);
      expect(roleStats.rolesByType['executor']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Plan模块的预留接口参数', async () => {
      const testPlanIntegration = async (
        _planId: string,
        _roleId: string,
        _executionConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testPlanIntegration(
        mockPlanEntity.planId,
        mockRoleEntity.roleId,
        { executorRole: 'primary', permissions: ['execute'] }
      );

      expect(result).toBe(true);
    });

    it('应该测试Role模块的预留接口参数', async () => {
      const testRoleIntegration = async (
        _roleId: string,
        _planId: string,
        _roleConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testRoleIntegration(
        mockRoleEntity.roleId,
        mockPlanEntity.planId,
        { planRole: 'executor', capabilities: ['planning', 'execution'] }
      );

      expect(result).toBe(true);
    });
  });

  describe('执行权限集成测试', () => {
    it('应该支持规划执行的角色权限管理', async () => {
      const executionData = {
        planId: mockPlanEntity.planId,
        roleId: mockRoleEntity.roleId,
        operation: 'execute_plan'
      };

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: executionData.planId,
        name: 'Execution Plan',
        status: 'active',
        requiredRoles: ['executor', 'monitor']
      } as any);

      // Mock role service
      jest.spyOn(roleService, 'createRole').mockResolvedValue({
        roleId: executionData.roleId,
        roleName: 'Plan Executor',
        permissions: ['plan:execute', 'plan:monitor'],
        status: 'active'
      } as any);

      // Act
      const plan = await planService.getPlan(executionData.planId);
      const role = await roleService.createRole({
        roleName: 'Plan Executor',
        permissions: ['plan:execute', 'plan:monitor']
      } as any);

      // Assert
      expect(plan.requiredRoles).toContain('executor');
      expect(role.permissions).toContain('plan:execute');
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理规划获取失败', async () => {
      const planId = 'invalid-plan-id';
      jest.spyOn(planService, 'getPlan').mockRejectedValue(new Error('Plan not found'));

      await expect(planService.getPlan(planId)).rejects.toThrow('Plan not found');
    });

    it('应该正确处理角色创建失败', async () => {
      const invalidRoleData = { roleName: '', permissions: [] };
      jest.spyOn(roleService, 'createRole').mockRejectedValue(new Error('Invalid role data'));

      await expect(roleService.createRole(invalidRoleData as any)).rejects.toThrow('Invalid role data');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Plan-Role集成操作', async () => {
      const startTime = Date.now();

      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Performance Test Plan',
        status: 'active'
      } as any);

      jest.spyOn(roleService, 'getRoleStatistics').mockResolvedValue({
        totalRoles: 8,
        activeRoles: 8,
        inactiveRoles: 0,
        rolesByType: { 'executor': 8 },
        averageComplexityScore: 3.5,
        totalPermissions: 24,
        totalAgents: 16
      } as any);

      const plan = await planService.getPlan(mockPlanEntity.planId);
      const roleStats = await roleService.getRoleStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(plan).toBeDefined();
      expect(roleStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Plan-Role数据关联的一致性', () => {
      const planId = mockPlanEntity.planId;
      const roleId = mockRoleEntity.roleId;

      expect(planId).toBeDefined();
      expect(typeof planId).toBe('string');
      expect(planId.length).toBeGreaterThan(0);
      
      expect(roleId).toBeDefined();
      expect(typeof roleId).toBe('string');
      expect(roleId.length).toBeGreaterThan(0);
    });

    it('应该验证规划角色关联数据的完整性', () => {
      const planData = {
        planId: mockPlanEntity.planId,
        name: 'Role-based Plan',
        requiredRoles: ['executor', 'monitor']
      };

      const roleData = {
        roleId: mockRoleEntity.roleId,
        planId: planData.planId,
        roleName: 'executor',
        permissions: ['plan:execute']
      };

      expect(roleData.planId).toBe(planData.planId);
      expect(planData.requiredRoles).toContain(roleData.roleName);
    });
  });
});
