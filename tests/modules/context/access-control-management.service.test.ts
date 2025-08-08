/**
 * 访问控制管理服务单元测试
 * 
 * 测试AccessControlManagementService的核心功能
 * 
 * @version 1.0.0
 * @created 2025-08-07
 */

import { AccessControlManagementService } from '../../../src/modules/context/application/services/access-control-management.service';
import {
  AccessControl,
  Owner,
  Permission,
  Policy,
  Action,
  PrincipalType,
  PolicyType,
  PolicyEnforcement
} from '../../../src/modules/context/domain/value-objects/access-control';

describe('AccessControlManagementService', () => {
  let service: AccessControlManagementService;
  let testOwner: Owner;

  beforeEach(() => {
    service = new AccessControlManagementService();
    testOwner = {
      userId: 'user-123',
      role: 'admin'
    };
  });

  describe('createAccessControl', () => {
    it('should create a new access control with owner only', () => {
      const accessControl = service.createAccessControl(testOwner);

      expect(accessControl).toBeInstanceOf(AccessControl);
      expect(accessControl.owner).toEqual(testOwner);
      expect(accessControl.permissions).toEqual([]);
      expect(accessControl.policies).toEqual([]);
    });

    it('should create a new access control with permissions and policies', () => {
      const permissions: Permission[] = [{
        principal: 'user-456',
        principalType: PrincipalType.USER,
        resource: 'context-data',
        actions: [Action.READ]
      }];

      const policies: Policy[] = [{
        id: 'policy-1',
        name: 'Test Policy',
        type: PolicyType.SECURITY,
        rules: [{
          condition: 'user.role == "admin"',
          action: 'read',
          effect: 'allow'
        }],
        enforcement: PolicyEnforcement.STRICT
      }];

      const accessControl = service.createAccessControl(testOwner, permissions, policies);

      expect(accessControl.permissions).toEqual(permissions);
      expect(accessControl.policies).toEqual(policies);
    });
  });

  describe('addPermission', () => {
    it('should add a new permission', () => {
      const accessControl = service.createAccessControl(testOwner);
      const permission: Permission = {
        principal: 'user-456',
        principalType: PrincipalType.USER,
        resource: 'context-data',
        actions: [Action.READ, Action.WRITE]
      };

      const updatedAccessControl = service.addPermission(accessControl, permission);

      expect(updatedAccessControl.permissions).toContain(permission);
    });

    it('should update existing permission for same principal and resource', () => {
      const initialPermission: Permission = {
        principal: 'user-456',
        principalType: PrincipalType.USER,
        resource: 'context-data',
        actions: [Action.READ]
      };
      const accessControl = service.createAccessControl(testOwner, [initialPermission]);

      const updatedPermission: Permission = {
        principal: 'user-456',
        principalType: PrincipalType.USER,
        resource: 'context-data',
        actions: [Action.READ, Action.WRITE, Action.EXECUTE]
      };

      const updatedAccessControl = service.addPermission(accessControl, updatedPermission);

      expect(updatedAccessControl.permissions).toHaveLength(1);
      expect(updatedAccessControl.permissions[0].actions).toEqual([Action.READ, Action.WRITE, Action.EXECUTE]);
    });

    it('should validate permission before adding', () => {
      const accessControl = service.createAccessControl(testOwner);
      const invalidPermission: Permission = {
        principal: '',
        principalType: PrincipalType.USER,
        resource: 'context-data',
        actions: [Action.READ]
      };

      expect(() => {
        service.addPermission(accessControl, invalidPermission);
      }).toThrow('Permission principal cannot be empty');
    });
  });

  describe('removePermission', () => {
    it('should remove existing permission', () => {
      const permission: Permission = {
        principal: 'user-456',
        principalType: PrincipalType.USER,
        resource: 'context-data',
        actions: [Action.READ]
      };
      const accessControl = service.createAccessControl(testOwner, [permission]);

      const updatedAccessControl = service.removePermission(
        accessControl, 
        'user-456', 
        'context-data'
      );

      expect(updatedAccessControl.permissions).toHaveLength(0);
    });

    it('should not affect other permissions', () => {
      const permissions: Permission[] = [
        {
          principal: 'user-456',
          principalType: PrincipalType.USER,
          resource: 'context-data',
          actions: [Action.READ]
        },
        {
          principal: 'user-789',
          principalType: PrincipalType.USER,
          resource: 'context-data',
          actions: [Action.WRITE]
        }
      ];
      const accessControl = service.createAccessControl(testOwner, permissions);

      const updatedAccessControl = service.removePermission(
        accessControl, 
        'user-456', 
        'context-data'
      );

      expect(updatedAccessControl.permissions).toHaveLength(1);
      expect(updatedAccessControl.permissions[0].principal).toBe('user-789');
    });
  });

  describe('addPolicy', () => {
    it('should add a new policy', () => {
      const accessControl = service.createAccessControl(testOwner);
      const policy: Policy = {
        id: 'policy-1',
        name: 'Test Policy',
        type: PolicyType.SECURITY,
        rules: [{
          condition: 'user.role == "admin"',
          action: 'read',
          effect: 'allow'
        }],
        enforcement: PolicyEnforcement.STRICT
      };

      const updatedAccessControl = service.addPolicy(accessControl, policy);

      expect(updatedAccessControl.policies).toContain(policy);
    });

    it('should validate policy before adding', () => {
      const accessControl = service.createAccessControl(testOwner);
      const invalidPolicy: Policy = {
        id: '',
        name: 'Test Policy',
        type: PolicyType.SECURITY,
        rules: [],
        enforcement: PolicyEnforcement.STRICT
      };

      expect(() => {
        service.addPolicy(accessControl, invalidPolicy);
      }).toThrow('Policy ID cannot be empty');
    });
  });

  describe('removePolicy', () => {
    it('should remove existing policy', () => {
      const policy: Policy = {
        id: 'policy-1',
        name: 'Test Policy',
        type: PolicyType.SECURITY,
        rules: [{
          condition: 'user.role == "admin"',
          action: 'read',
          effect: 'allow'
        }],
        enforcement: PolicyEnforcement.STRICT
      };
      const accessControl = service.createAccessControl(testOwner, [], [policy]);

      const updatedAccessControl = service.removePolicy(accessControl, 'policy-1');

      expect(updatedAccessControl.policies).toHaveLength(0);
    });
  });

  describe('checkPermission', () => {
    it('should return true for owner access', () => {
      const accessControl = service.createAccessControl(testOwner);

      const hasPermission = service.checkPermission(
        accessControl,
        'user-123',
        'any-resource',
        Action.ADMIN
      );

      expect(hasPermission).toBe(true);
    });

    it('should return true for explicit permission', () => {
      const permission: Permission = {
        principal: 'user-456',
        principalType: PrincipalType.USER,
        resource: 'context-data',
        actions: [Action.READ, Action.WRITE]
      };
      const accessControl = service.createAccessControl(testOwner, [permission]);

      const hasPermission = service.checkPermission(
        accessControl,
        'user-456',
        'context-data',
        Action.READ
      );

      expect(hasPermission).toBe(true);
    });

    it('should return false for missing permission', () => {
      const accessControl = service.createAccessControl(testOwner);

      const hasPermission = service.checkPermission(
        accessControl,
        'user-456',
        'context-data',
        Action.READ
      );

      expect(hasPermission).toBe(false);
    });
  });

  describe('getPermissionsForPrincipal', () => {
    it('should return permissions for specific principal', () => {
      const permissions: Permission[] = [
        {
          principal: 'user-456',
          principalType: PrincipalType.USER,
          resource: 'context-data',
          actions: [Action.READ]
        },
        {
          principal: 'user-456',
          principalType: PrincipalType.USER,
          resource: 'shared-state',
          actions: [Action.WRITE]
        },
        {
          principal: 'user-789',
          principalType: PrincipalType.USER,
          resource: 'context-data',
          actions: [Action.ADMIN]
        }
      ];
      const accessControl = service.createAccessControl(testOwner, permissions);

      const userPermissions = service.getPermissionsForPrincipal(accessControl, 'user-456');

      expect(userPermissions).toHaveLength(2);
      expect(userPermissions.every(p => p.principal === 'user-456')).toBe(true);
    });
  });

  describe('getPermissionsForResource', () => {
    it('should return permissions for specific resource', () => {
      const permissions: Permission[] = [
        {
          principal: 'user-456',
          principalType: PrincipalType.USER,
          resource: 'context-data',
          actions: [Action.READ]
        },
        {
          principal: 'user-789',
          principalType: PrincipalType.USER,
          resource: 'context-data',
          actions: [Action.WRITE]
        },
        {
          principal: 'user-456',
          principalType: PrincipalType.USER,
          resource: 'shared-state',
          actions: [Action.ADMIN]
        }
      ];
      const accessControl = service.createAccessControl(testOwner, permissions);

      const resourcePermissions = service.getPermissionsForResource(accessControl, 'context-data');

      expect(resourcePermissions).toHaveLength(2);
      expect(resourcePermissions.every(p => p.resource === 'context-data')).toBe(true);
    });
  });

  describe('permission creation helpers', () => {
    it('should create read-only permission', () => {
      const permission = service.createReadOnlyPermission(
        'user-456',
        PrincipalType.USER,
        'context-data'
      );

      expect(permission.actions).toEqual([Action.READ]);
    });

    it('should create read-write permission', () => {
      const permission = service.createReadWritePermission(
        'user-456',
        PrincipalType.USER,
        'context-data'
      );

      expect(permission.actions).toEqual([Action.READ, Action.WRITE]);
    });

    it('should create admin permission', () => {
      const permission = service.createAdminPermission(
        'user-456',
        PrincipalType.USER,
        'context-data'
      );

      expect(permission.actions).toEqual([
        Action.READ, 
        Action.WRITE, 
        Action.EXECUTE, 
        Action.DELETE, 
        Action.ADMIN
      ]);
    });
  });

  describe('validation', () => {
    it('should validate permission with empty actions', () => {
      const accessControl = service.createAccessControl(testOwner);
      const invalidPermission: Permission = {
        principal: 'user-456',
        principalType: PrincipalType.USER,
        resource: 'context-data',
        actions: []
      };

      expect(() => {
        service.addPermission(accessControl, invalidPermission);
      }).toThrow('Permission must have at least one action');
    });

    it('should validate policy with empty rules', () => {
      const accessControl = service.createAccessControl(testOwner);
      const invalidPolicy: Policy = {
        id: 'policy-1',
        name: 'Test Policy',
        type: PolicyType.SECURITY,
        rules: [],
        enforcement: PolicyEnforcement.STRICT
      };

      expect(() => {
        service.addPolicy(accessControl, invalidPolicy);
      }).toThrow('Policy must have at least one rule');
    });

    it('should validate policy rule with invalid effect', () => {
      const accessControl = service.createAccessControl(testOwner);
      const invalidPolicy: Policy = {
        id: 'policy-1',
        name: 'Test Policy',
        type: PolicyType.SECURITY,
        rules: [{
          condition: 'user.role == "admin"',
          action: 'read',
          effect: 'invalid' as any
        }],
        enforcement: PolicyEnforcement.STRICT
      };

      expect(() => {
        service.addPolicy(accessControl, invalidPolicy);
      }).toThrow('Policy rule effect must be "allow" or "deny"');
    });
  });
});
