/**
 * Context模块高级功能集成测试
 * 
 * 测试共享状态管理和访问控制功能的集成性
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { ContextManagementService } from '../../application/services/context-management.service';
import { SharedStateManagementService } from '../../application/services/shared-state-management.service';
import { AccessControlManagementService } from '../../application/services/access-control-management.service';
import { ContextFactory } from '../../domain/factories/context.factory';
import { ContextValidationService } from '../../domain/services/context-validation.service';
import { MockContextRepository } from '../mocks/mock-context.repository';
import { 
  SharedState, 
  ResourceStatus, 
  DependencyStatus, 
  DependencyType, 
  GoalStatus, 
  Priority 
} from '../../domain/value-objects/shared-state';
import { 
  AccessControl, 
  Action, 
  PrincipalType, 
  PolicyType, 
  PolicyEnforcement 
} from '../../domain/value-objects/access-control';

describe('Context Advanced Features Integration Tests', () => {
  let contextService: ContextManagementService;
  let sharedStateService: SharedStateManagementService;
  let accessControlService: AccessControlManagementService;
  let mockRepository: MockContextRepository;

  beforeEach(() => {
    mockRepository = new MockContextRepository();
    const contextFactory = new ContextFactory();
    const validationService = new ContextValidationService();
    sharedStateService = new SharedStateManagementService();
    accessControlService = new AccessControlManagementService();
    
    contextService = new ContextManagementService(
      mockRepository,
      contextFactory,
      validationService,
      sharedStateService,
      accessControlService
    );
  });

  describe('Shared State Integration', () => {
    it('should create context with shared state and manage variables', async () => {
      // 创建Context
      const createResult = await contextService.createContext({
        name: 'Test Context with Shared State',
        description: 'Integration test context'
      });

      expect(createResult.success).toBe(true);
      const context = createResult.data!;

      // 设置共享变量
      const setVarResult = await contextService.setSharedVariable(
        context.contextId,
        'agentCount',
        5
      );

      expect(setVarResult.success).toBe(true);

      // 获取共享变量
      const getVarResult = await contextService.getSharedVariable(
        context.contextId,
        'agentCount'
      );

      expect(getVarResult.success).toBe(true);
      expect(getVarResult.data).toBe(5);
    });

    it('should manage complete shared state with resources, dependencies, and goals', async () => {
      // 创建Context
      const createResult = await contextService.createContext({
        name: 'Complex Shared State Context',
        description: 'Testing complex shared state management'
      });

      const context = createResult.data!;

      // 创建完整的共享状态
      const sharedState = sharedStateService.createSharedState(
        { agentCount: 3, maxConcurrency: 2 },
        {
          memory: {
            type: 'memory',
            amount: 8,
            unit: 'GB',
            status: ResourceStatus.ALLOCATED
          }
        },
        {
          memory: {
            minimum: 4,
            optimal: 8,
            maximum: 16,
            unit: 'GB'
          }
        },
        [{
          id: 'dep-1',
          type: DependencyType.CONTEXT,
          name: 'Parent Context',
          status: DependencyStatus.PENDING
        }],
        [{
          id: 'goal-1',
          name: 'Complete Task',
          priority: Priority.HIGH,
          status: GoalStatus.DEFINED,
          successCriteria: [{
            metric: 'completion',
            operator: 'eq' as any,
            value: true
          }]
        }]
      );

      // 更新Context的共享状态
      const updateResult = await contextService.updateSharedState(
        context.contextId,
        sharedState
      );

      expect(updateResult.success).toBe(true);

      // 验证共享状态已正确设置
      const updatedContext = updateResult.data!;
      expect(updatedContext.sharedState).toBeDefined();
      expect(updatedContext.sharedState!.variables.agentCount).toBe(3);
      expect(updatedContext.sharedState!.allocatedResources.memory.amount).toBe(8);
      expect(updatedContext.sharedState!.dependencies).toHaveLength(1);
      expect(updatedContext.sharedState!.goals).toHaveLength(1);
    });

    it('should validate resource allocation against requirements', async () => {
      const createResult = await contextService.createContext({
        name: 'Resource Validation Context',
        description: 'Testing resource validation'
      });

      const context = createResult.data!;

      // 设置资源需求
      const requirements = {
        memory: {
          minimum: 4,
          maximum: 16,
          unit: 'GB'
        }
      };

      const sharedState = sharedStateService.createSharedState(
        {},
        {},
        requirements
      );

      await contextService.updateSharedState(context.contextId, sharedState);

      // 尝试分配超出最大限制的资源
      expect(() => {
        sharedStateService.allocateResource(
          sharedState,
          'memory',
          {
            type: 'memory',
            amount: 32,
            unit: 'GB',
            status: ResourceStatus.ALLOCATED
          }
        );
      }).toThrow('Resource allocation 32 exceeds maximum limit 16');
    });
  });

  describe('Access Control Integration', () => {
    it('should create context with access control and manage permissions', async () => {
      // 创建Context
      const createResult = await contextService.createContext({
        name: 'Access Control Context',
        description: 'Testing access control integration'
      });

      const context = createResult.data!;

      // 创建访问控制配置
      const accessControl = accessControlService.createAccessControl(
        { userId: 'admin-123', role: 'admin' },
        [{
          principal: 'user-456',
          principalType: PrincipalType.USER,
          resource: 'context-data',
          actions: [Action.READ, Action.WRITE]
        }],
        [{
          id: 'policy-1',
          name: 'Admin Policy',
          type: PolicyType.SECURITY,
          rules: [{
            condition: 'user.role == "admin"',
            action: 'admin',
            effect: 'allow'
          }],
          enforcement: PolicyEnforcement.STRICT
        }]
      );

      // 更新Context的访问控制
      const updateResult = await contextService.updateAccessControl(
        context.contextId,
        accessControl
      );

      expect(updateResult.success).toBe(true);

      // 验证访问控制已正确设置
      const updatedContext = updateResult.data!;
      expect(updatedContext.accessControl).toBeDefined();
      expect(updatedContext.accessControl!.owner.userId).toBe('admin-123');
      expect(updatedContext.accessControl!.permissions).toHaveLength(1);
      expect(updatedContext.accessControl!.policies).toHaveLength(1);
    });

    it('should check permissions correctly', async () => {
      // 创建Context
      const createResult = await contextService.createContext({
        name: 'Permission Check Context',
        description: 'Testing permission checking'
      });

      const context = createResult.data!;

      // 设置访问控制
      const accessControl = accessControlService.createAccessControl(
        { userId: 'admin-123', role: 'admin' },
        [{
          principal: 'user-456',
          principalType: PrincipalType.USER,
          resource: 'context-data',
          actions: [Action.READ]
        }]
      );

      await contextService.updateAccessControl(context.contextId, accessControl);

      // 检查所有者权限
      const ownerPermissionResult = await contextService.checkPermission(
        context.contextId,
        'admin-123',
        'any-resource',
        Action.ADMIN
      );

      expect(ownerPermissionResult.success).toBe(true);
      expect(ownerPermissionResult.data).toBe(true);

      // 检查用户权限
      const userPermissionResult = await contextService.checkPermission(
        context.contextId,
        'user-456',
        'context-data',
        Action.READ
      );

      expect(userPermissionResult.success).toBe(true);
      expect(userPermissionResult.data).toBe(true);

      // 检查无权限情况
      const noPermissionResult = await contextService.checkPermission(
        context.contextId,
        'user-456',
        'context-data',
        Action.DELETE
      );

      expect(noPermissionResult.success).toBe(true);
      expect(noPermissionResult.data).toBe(false);
    });
  });

  describe('Combined Features Integration', () => {
    it('should manage both shared state and access control together', async () => {
      // 创建Context
      const createResult = await contextService.createContext({
        name: 'Combined Features Context',
        description: 'Testing combined shared state and access control'
      });

      const context = createResult.data!;

      // 设置共享状态
      const sharedState = sharedStateService.createSharedState(
        { projectPhase: 'development' },
        {
          cpu: {
            type: 'cpu',
            amount: 4,
            unit: 'cores',
            status: ResourceStatus.AVAILABLE
          }
        }
      );

      await contextService.updateSharedState(context.contextId, sharedState);

      // 设置访问控制
      const accessControl = accessControlService.createAccessControl(
        { userId: 'project-manager', role: 'manager' },
        [{
          principal: 'developer-team',
          principalType: PrincipalType.GROUP,
          resource: 'shared-state',
          actions: [Action.READ, Action.WRITE]
        }]
      );

      await contextService.updateAccessControl(context.contextId, accessControl);

      // 验证两个功能都正常工作
      const getVarResult = await contextService.getSharedVariable(
        context.contextId,
        'projectPhase'
      );

      expect(getVarResult.success).toBe(true);
      expect(getVarResult.data).toBe('development');

      const permissionResult = await contextService.checkPermission(
        context.contextId,
        'project-manager',
        'any-resource',
        Action.ADMIN
      );

      expect(permissionResult.success).toBe(true);
      expect(permissionResult.data).toBe(true);
    });

    it('should maintain data consistency across operations', async () => {
      // 创建Context
      const createResult = await contextService.createContext({
        name: 'Data Consistency Context',
        description: 'Testing data consistency'
      });

      const context = createResult.data!;

      // 多次更新操作
      await contextService.setSharedVariable(context.contextId, 'counter', 0);
      await contextService.setSharedVariable(context.contextId, 'counter', 1);
      await contextService.setSharedVariable(context.contextId, 'counter', 2);

      // 验证最终状态
      const finalResult = await contextService.getSharedVariable(
        context.contextId,
        'counter'
      );

      expect(finalResult.success).toBe(true);
      expect(finalResult.data).toBe(2);

      // 验证Context的updatedAt时间戳已更新
      const updatedContext = await mockRepository.findById(context.contextId);
      expect(updatedContext!.updatedAt.getTime()).toBeGreaterThan(context.updatedAt.getTime());
    });
  });
});
