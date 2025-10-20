/**
 * RoleSecurityService单元测试
 * 
 * @description 测试统一安全策略和验证服务的功能
 * @version 1.0.0
 */

import { RoleSecurityService, SecurityContext, SecurityEvent, PermissionRequest } from '../../../../src/modules/role/application/services/role-security.service';
import { RoleManagementService } from '../../../../src/modules/role/application/services/role-management.service';

// ===== 测试模拟对象 =====

const mockTokenManager = {
  createToken: jest.fn(),
  validateToken: jest.fn()
};

const mockSecurityPolicyEngine = {
  executePolicy: jest.fn()
};

const mockAuditLogger = {
  logAccess: jest.fn(),
  logError: jest.fn(),
  logTokenCreated: jest.fn(),
  logTokenValidationError: jest.fn(),
  logSecurityEvent: jest.fn()
};

const mockRoleManagementService = {
  getUserPermissions: jest.fn()
} as unknown as RoleManagementService;

describe('RoleSecurityService单元测试', () => {
  let roleSecurityService: RoleSecurityService;

  beforeEach(() => {
    // 重置所有模拟对象
    jest.clearAllMocks();
    
    roleSecurityService = new RoleSecurityService(
      mockRoleManagementService,
      mockTokenManager,
      mockSecurityPolicyEngine,
      mockAuditLogger
    );
  });

  describe('权限验证测试', () => {
    describe('validatePermission方法', () => {
      it('应该成功验证用户权限', async () => {
        // 准备测试数据
        const userId = 'user-001';
        const resource = 'context';
        const action = 'read';
        const context: SecurityContext = {
          userId,
          sessionId: 'session-001',
          roles: ['user'],
          permissions: ['read'],
          timestamp: new Date()
        };

        const mockPermissions = [
          {
            permissionId: 'perm-001',
            resourceType: 'context',
            resourceId: '*',
            actions: ['read'],
            grantType: 'direct' as const,
            conditions: {}
          }
        ];

        (mockRoleManagementService.getUserPermissions as jest.Mock).mockResolvedValue(mockPermissions);

        // 执行测试
        const result = await roleSecurityService.validatePermission(userId, resource, action, context);

        // 验证结果
        expect(result).toBe(true);
        expect(mockRoleManagementService.getUserPermissions).toHaveBeenCalledWith(userId);
        expect(mockAuditLogger.logAccess).toHaveBeenCalledWith({
          userId,
          resource,
          action,
          granted: true,
          timestamp: expect.any(Date),
          context
        });
      });

      it('应该拒绝无权限的用户', async () => {
        // 准备测试数据
        const userId = 'user-002';
        const resource = 'admin';
        const action = 'delete';

        const mockPermissions = [
          {
            permissionId: 'perm-001',
            resourceType: 'context',
            resourceId: '*',
            actions: ['read'],
            grantType: 'direct' as const,
            conditions: {}
          }
        ];

        (mockRoleManagementService.getUserPermissions as jest.Mock).mockResolvedValue(mockPermissions);

        // 执行测试
        const result = await roleSecurityService.validatePermission(userId, resource, action);

        // 验证结果
        expect(result).toBe(false);
        expect(mockAuditLogger.logAccess).toHaveBeenCalledWith({
          userId,
          resource,
          action,
          granted: false,
          timestamp: expect.any(Date),
          context: undefined
        });
      });

      it('应该处理权限验证错误', async () => {
        // 准备测试数据
        const userId = 'user-003';
        const resource = 'context';
        const action = 'read';
        const error = new Error('Database connection failed');

        (mockRoleManagementService.getUserPermissions as jest.Mock).mockRejectedValue(error);

        // 执行测试
        const result = await roleSecurityService.validatePermission(userId, resource, action);

        // 验证结果
        expect(result).toBe(false);
        expect(mockAuditLogger.logError).toHaveBeenCalledWith({
          userId,
          resource,
          action,
          error: error.message,
          timestamp: expect.any(Date)
        });
      });
    });

    describe('validateMultiplePermissions方法', () => {
      it('应该批量验证多个权限', async () => {
        // 准备测试数据
        const userId = 'user-004';
        const permissions: PermissionRequest[] = [
          { resource: 'context', action: 'read' },
          { resource: 'plan', action: 'create' }
        ];

        const mockUserPermissions = [
          {
            permissionId: 'perm-001',
            resourceType: 'context',
            resourceId: '*',
            actions: ['read'],
            grantType: 'direct' as const,
            conditions: {},
            expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        ];

        // 模拟每次调用getUserPermissions都返回相同的权限
        (mockRoleManagementService.getUserPermissions as jest.Mock)
          .mockResolvedValueOnce(mockUserPermissions)  // 第一次调用 - context:read
          .mockResolvedValueOnce(mockUserPermissions); // 第二次调用 - plan:create

        // 执行测试
        const results = await roleSecurityService.validateMultiplePermissions(userId, permissions);

        // 验证结果
        expect(results).toHaveLength(2);
        expect(results[0]).toEqual({
          resource: 'context',
          action: 'read',
          granted: true
        });
        expect(results[1]).toEqual({
          resource: 'plan',
          action: 'create',
          granted: false
        });
      });
    });
  });

  describe('安全令牌管理测试', () => {
    describe('createSecurityToken方法', () => {
      it('应该成功创建安全令牌', async () => {
        // 准备测试数据
        const userId = 'user-005';
        const sessionData = { deviceId: 'device-001' };
        const mockPermissions = [
          {
            permissionId: 'perm-001',
            resourceType: 'context',
            resourceId: '*',
            actions: ['read', 'write'],
            grantType: 'direct' as const,
            conditions: {}
          }
        ];

        const mockToken = {
          tokenId: 'token-001',
          userId,
          permissions: [
            { resource: 'context', action: 'read' },
            { resource: 'context', action: 'write' }
          ],
          sessionData,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        (mockRoleManagementService.getUserPermissions as jest.Mock).mockResolvedValue(mockPermissions);
        mockTokenManager.createToken.mockResolvedValue(mockToken);

        // 执行测试
        const result = await roleSecurityService.createSecurityToken(userId, sessionData);

        // 验证结果
        expect(result).toEqual(mockToken);
        expect(mockTokenManager.createToken).toHaveBeenCalledWith({
          userId,
          permissions: [
            { resource: 'context', action: 'read' },
            { resource: 'context', action: 'write' }
          ],
          sessionData,
          expiresAt: expect.any(Date)
        });
        expect(mockAuditLogger.logTokenCreated).toHaveBeenCalledWith({
          userId,
          tokenId: mockToken.tokenId,
          expiresAt: mockToken.expiresAt,
          timestamp: expect.any(Date)
        });
      });
    });

    describe('validateSecurityToken方法', () => {
      it('应该成功验证有效令牌', async () => {
        // 准备测试数据
        const tokenString = 'valid-token-string';
        const mockToken = {
          tokenId: 'token-001',
          userId: 'user-006',
          permissions: [{ resource: 'context', action: 'read' }],
          sessionData: {},
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期
        };

        mockTokenManager.validateToken.mockResolvedValue(mockToken);

        // 执行测试
        const result = await roleSecurityService.validateSecurityToken(tokenString);

        // 验证结果
        expect(result).toEqual(mockToken);
        expect(mockTokenManager.validateToken).toHaveBeenCalledWith(tokenString);
      });

      it('应该拒绝过期令牌', async () => {
        // 准备测试数据
        const tokenString = 'expired-token-string';
        const mockToken = {
          tokenId: 'token-002',
          userId: 'user-007',
          permissions: [{ resource: 'context', action: 'read' }],
          sessionData: {},
          expiresAt: new Date(Date.now() - 60 * 60 * 1000) // 1小时前过期
        };

        mockTokenManager.validateToken.mockResolvedValue(mockToken);

        // 执行测试
        const result = await roleSecurityService.validateSecurityToken(tokenString);

        // 验证结果
        expect(result).toBeNull();
      });

      it('应该处理令牌验证错误', async () => {
        // 准备测试数据
        const tokenString = 'invalid-token-string';
        const error = new Error('Invalid token format');

        mockTokenManager.validateToken.mockRejectedValue(error);

        // 执行测试
        const result = await roleSecurityService.validateSecurityToken(tokenString);

        // 验证结果
        expect(result).toBeNull();
        expect(mockAuditLogger.logTokenValidationError).toHaveBeenCalledWith({
          tokenString: 'invalid-to...',
          error: error.message,
          timestamp: expect.any(Date)
        });
      });
    });
  });

  describe('安全策略执行测试', () => {
    describe('executeSecurityPolicy方法', () => {
      it('应该成功执行安全策略', async () => {
        // 准备测试数据
        const policyName = 'access-control-policy';
        const context: SecurityContext = {
          userId: 'user-008',
          sessionId: 'session-008',
          roles: ['admin'],
          permissions: ['admin']
        };

        const mockResult = {
          success: true,
          message: 'Policy executed successfully',
          data: { allowed: true }
        };

        mockSecurityPolicyEngine.executePolicy.mockResolvedValue(mockResult);

        // 执行测试
        const result = await roleSecurityService.executeSecurityPolicy(policyName, context);

        // 验证结果
        expect(result).toEqual(mockResult);
        expect(mockSecurityPolicyEngine.executePolicy).toHaveBeenCalledWith(policyName, context);
      });
    });
  });

  describe('安全事件处理测试', () => {
    describe('handleSecurityEvent方法', () => {
      it('应该成功处理安全事件', async () => {
        // 准备测试数据
        const event: SecurityEvent = {
          type: 'unauthorized_access',
          userId: 'user-009',
          resource: 'admin',
          action: 'delete',
          timestamp: new Date(),
          result: 'denied',
          reason: 'Insufficient permissions'
        };

        // 执行测试
        await roleSecurityService.handleSecurityEvent(event);

        // 验证结果
        expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith(event);
      });

      it('应该处理不同类型的安全事件', async () => {
        // 准备测试数据
        const events: SecurityEvent[] = [
          {
            type: 'suspicious_activity',
            userId: 'user-010',
            timestamp: new Date(),
            result: 'pending'
          },
          {
            type: 'security_violation',
            userId: 'user-011',
            timestamp: new Date(),
            result: 'failed'
          }
        ];

        // 执行测试
        for (const event of events) {
          await roleSecurityService.handleSecurityEvent(event);
        }

        // 验证结果
        expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledTimes(2);
      });
    });
  });
});
