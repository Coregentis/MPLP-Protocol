/**
 * Role控制器功能测试
 * 
 * @description 测试RoleController的REST API功能 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer 测试层 - 功能测试 (Tier 3)
 */

import { RoleController } from '../../../../src/modules/role/api/controllers/role.controller';
import { RoleManagementService } from '../../../../src/modules/role/application/services/role-management.service';
import { MemoryRoleRepository } from '../../../../src/modules/role/infrastructure/repositories/role.repository';
import { RoleEntity } from '../../../../src/modules/role/domain/entities/role.entity';
import { 
  createMockCreateRoleRequest, 
  createSimpleMockRoleEntityData,
  createTestUUID,
  createTestPermission
} from '../test-data-factory';
import { UUID, RoleType, RoleStatus } from '../../../../src/modules/role/types';

// Mock HTTP请求和响应对象
const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => ({
  body,
  params,
  query,
  headers: {},
  method: 'GET',
  url: '/'
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('RoleController功能测试', () => {
  let roleController: RoleController;
  let roleService: RoleManagementService;
  let roleRepository: MemoryRoleRepository;

  beforeEach(async () => {
    roleRepository = new MemoryRoleRepository();
    roleService = new RoleManagementService(roleRepository);
    roleController = new RoleController(roleService);
  });

  afterEach(async () => {
    await roleRepository.clear();
  });

  describe('POST /roles - 创建角色', () => {
    it('应该成功创建角色', async () => {
      const createRequest = createMockCreateRoleRequest();
      const req = mockRequest(createRequest);
      const res = mockResponse();

      await roleController.createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            roleId: expect.any(String),
            name: createRequest.name,
            roleType: createRequest.roleType,
            contextId: createRequest.contextId
          })
        })
      );
    });

    it('应该正确处理无效输入', async () => {
      const invalidRequest = {
        // 缺少必需字段
        name: '',
        roleType: 'invalid'
      };
      const req = mockRequest(invalidRequest);
      const res = mockResponse();

      await roleController.createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String)
        })
      );
    });

    it('应该正确处理服务错误', async () => {
      jest.spyOn(roleService, 'createRole').mockRejectedValueOnce(new Error('Service error'));

      const createRequest = createMockCreateRoleRequest();
      const req = mockRequest(createRequest);
      const res = mockResponse();

      await roleController.createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Service error')
        })
      );
    });
  });

  describe('GET /roles/:roleId - 获取角色', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
    });

    it('应该成功获取角色', async () => {
      const req = mockRequest({}, { roleId: testRole.roleId });
      const res = mockResponse();

      await roleController.getRoleById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            roleId: testRole.roleId,
            name: testRole.name
          })
        })
      );
    });

    it('应该正确处理角色不存在', async () => {
      const nonExistentId = createTestUUID();
      const req = mockRequest({}, { roleId: nonExistentId });
      const res = mockResponse();

      await roleController.getRoleById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('not found')
        })
      );
    });

    it('应该正确处理无效的角色ID', async () => {
      const req = mockRequest({}, { roleId: 'invalid-id' });
      const res = mockResponse();

      await roleController.getRoleById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid role ID')
        })
      );
    });
  });

  describe('PUT /roles/:roleId - 更新角色', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
    });

    it('应该成功更新角色', async () => {
      const updateData = {
        name: 'updated-role-name',
        displayName: 'Updated Role Name',
        description: 'Updated description'
      };
      const req = mockRequest(updateData, { roleId: testRole.roleId });
      const res = mockResponse();

      await roleController.updateRole(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            roleId: testRole.roleId,
            name: updateData.name,
            displayName: updateData.displayName,
            description: updateData.description
          })
        })
      );
    });

    it('应该正确处理部分更新', async () => {
      const updateData = {
        name: 'partially-updated-name'
        // 只更新name字段
      };
      const req = mockRequest(updateData, { roleId: testRole.roleId });
      const res = mockResponse();

      await roleController.updateRole(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            roleId: testRole.roleId,
            name: updateData.name
          })
        })
      );
    });
  });

  describe('DELETE /roles/:roleId - 删除角色', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
    });

    it('应该成功删除角色', async () => {
      const req = mockRequest({}, { roleId: testRole.roleId });
      const res = mockResponse();

      await roleController.deleteRole(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('deleted successfully')
        })
      );

      // 验证角色已删除
      const deletedRole = await roleService.getRoleById(testRole.roleId);
      expect(deletedRole).toBeNull();
    });
  });

  describe('GET /roles - 获取所有角色', () => {
    beforeEach(async () => {
      // 创建多个测试角色
      const createRequests = [
        createMockCreateRoleRequest(),
        { ...createMockCreateRoleRequest(), name: 'role-2' },
        { ...createMockCreateRoleRequest(), name: 'role-3' }
      ];

      for (const createRequest of createRequests) {
        await roleService.createRole(createRequest);
      }
    });

    it('应该成功获取所有角色', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await roleController.getAllRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                roleId: expect.any(String),
                name: expect.any(String)
              })
            ]),
            total: expect.any(Number),
            page: expect.any(Number),
            limit: expect.any(Number)
          })
        })
      );
    });

    it('应该支持分页查询', async () => {
      const req = mockRequest({}, {}, { page: 1, limit: 2 });
      const res = mockResponse();

      await roleController.getAllRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            items: expect.any(Array),
            page: 1,
            limit: 2,
            total: expect.any(Number)
          })
        })
      );
    });
  });

  describe('GET /roles/by-context/:contextId - 根据上下文获取角色', () => {
    let testContextId: UUID;

    beforeEach(async () => {
      testContextId = 'context-test-001' as UUID;
      
      // 创建属于特定上下文的角色
      const createRequest = { ...createMockCreateRoleRequest(), contextId: testContextId };
      await roleService.createRole(createRequest);
    });

    it('应该成功根据上下文获取角色', async () => {
      const req = mockRequest({}, { contextId: testContextId });
      const res = mockResponse();

      await roleController.getRolesByContext(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              contextId: testContextId
            })
          ])
        })
      );
    });
  });

  describe('GET /roles/by-type/:roleType - 根据类型获取角色', () => {
    beforeEach(async () => {
      // 创建不同类型的角色
      const organizationalRole = { ...createMockCreateRoleRequest(), roleType: 'organizational' as RoleType };
      const functionalRole = { ...createMockCreateRoleRequest(), roleType: 'functional' as RoleType, name: 'functional-role' };
      
      await roleService.createRole(organizationalRole);
      await roleService.createRole(functionalRole);
    });

    it('应该成功根据类型获取角色', async () => {
      const req = mockRequest({}, { roleType: 'organizational' });
      const res = mockResponse();

      await roleController.getRolesByType(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              roleType: 'organizational'
            })
          ])
        })
      );
    });
  });

  describe('GET /roles/search - 搜索角色', () => {
    beforeEach(async () => {
      // 创建多个测试角色
      const roles = [
        { ...createMockCreateRoleRequest(), name: 'admin-role', roleType: 'organizational' as RoleType },
        { ...createMockCreateRoleRequest(), name: 'user-role', roleType: 'functional' as RoleType },
        { ...createMockCreateRoleRequest(), name: 'guest-role', roleType: 'functional' as RoleType }
      ];

      for (const role of roles) {
        await roleService.createRole(role);
      }
    });

    it('应该成功搜索角色', async () => {
      const req = mockRequest({}, {}, { 
        query: 'admin',
        roleType: 'organizational',
        status: 'active'
      });
      const res = mockResponse();

      await roleController.searchRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            roles: expect.any(Array),
            total: expect.any(Number),
            page: expect.any(Number),
            limit: expect.any(Number)
          })
        })
      );
    });
  });

  describe('POST /roles/:roleId/check-permission - 检查权限', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
      
      // 添加测试权限
      const permission = createTestPermission({
        resourceType: 'context',
        resourceId: 'test-resource' as UUID,
        actions: ['read', 'write']
      });
      await roleService.addPermission(testRole.roleId, permission);
    });

    it('应该成功检查权限', async () => {
      const checkRequest = {
        resourceType: 'context',
        resourceId: 'test-resource',
        action: 'read'
      };
      const req = mockRequest(checkRequest, { roleId: testRole.roleId });
      const res = mockResponse();

      await roleController.checkPermission(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            hasPermission: true,
            resourceType: 'context',
            resourceId: 'test-resource',
            action: 'read'
          })
        })
      );
    });

    it('应该正确返回无权限结果', async () => {
      const checkRequest = {
        resourceType: 'context',
        resourceId: 'test-resource',
        action: 'delete' // 没有delete权限
      };
      const req = mockRequest(checkRequest, { roleId: testRole.roleId });
      const res = mockResponse();

      await roleController.checkPermission(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            hasPermission: false,
            resourceType: 'context',
            resourceId: 'test-resource',
            action: 'delete'
          })
        })
      );
    });
  });

  describe('POST /roles/:roleId/activate - 激活角色', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
      // 先停用角色
      await roleService.deactivateRole(testRole.roleId);
    });

    it('应该成功激活角色', async () => {
      const req = mockRequest({}, { roleId: testRole.roleId });
      const res = mockResponse();

      await roleController.activateRole(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            roleId: testRole.roleId,
            status: 'active'
          })
        })
      );
    });
  });

  describe('POST /roles/:roleId/deactivate - 停用角色', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
    });

    it('应该成功停用角色', async () => {
      const req = mockRequest({}, { roleId: testRole.roleId });
      const res = mockResponse();

      await roleController.deactivateRole(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            roleId: testRole.roleId,
            status: 'inactive'
          })
        })
      );
    });
  });

  describe('GET /roles/statistics - 获取统计信息', () => {
    beforeEach(async () => {
      // 创建不同状态和类型的角色
      const roles = [
        { ...createMockCreateRoleRequest(), name: 'active-org-role', roleType: 'organizational' as RoleType },
        { ...createMockCreateRoleRequest(), name: 'active-func-role', roleType: 'functional' as RoleType },
        { ...createMockCreateRoleRequest(), name: 'inactive-role', roleType: 'organizational' as RoleType }
      ];

      for (const role of roles) {
        const createdRole = await roleService.createRole(role);
        if (role.name === 'inactive-role') {
          await roleService.deactivateRole(createdRole.roleId);
        }
      }
    });

    it('应该成功获取统计信息', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await roleController.getStatistics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            totalRoles: expect.any(Number),
            activeRoles: expect.any(Number),
            inactiveRoles: expect.any(Number),
            rolesByType: expect.objectContaining({
              organizational: expect.any(Number),
              functional: expect.any(Number)
            }),
            averagePermissionsPerRole: expect.any(Number)
          })
        })
      );
    });
  });

  describe('POST /roles/bulk - 批量创建角色', () => {
    it('应该成功批量创建角色', async () => {
      const bulkRequest = {
        roles: [
          createMockCreateRoleRequest(),
          { ...createMockCreateRoleRequest(), name: 'bulk-role-2' },
          { ...createMockCreateRoleRequest(), name: 'bulk-role-3' }
        ]
      };
      const req = mockRequest(bulkRequest);
      const res = mockResponse();

      await roleController.bulkCreateRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            successful: expect.any(Array),
            failed: expect.any(Array),
            summary: expect.objectContaining({
              total: 3,
              successful: expect.any(Number),
              failed: expect.any(Number)
            })
          })
        })
      );
    });

    it('应该正确处理无效的批量请求格式', async () => {
      const invalidRequest = { invalid: 'data' };
      const req = mockRequest(invalidRequest);
      const res = mockResponse();

      await roleController.bulkCreateRoles(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Invalid request format')
        })
      );
    });
  });

  describe('兼容性方法测试', () => {
    let testRole: RoleEntity;

    beforeEach(async () => {
      const createRequest = createMockCreateRoleRequest();
      testRole = await roleService.createRole(createRequest);
    });

    describe('getRole - 旧版本兼容方法', () => {
      it('应该成功获取角色', async () => {
        const response = await roleController.getRole(testRole.roleId);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(
          expect.objectContaining({
            roleId: testRole.roleId,
            name: testRole.name
          })
        );
      });

      it('应该正确处理角色不存在', async () => {
        const nonExistentId = createTestUUID();
        const response = await roleController.getRole(nonExistentId);

        expect(response.success).toBe(false);
        expect(response.error).toContain('not found');
      });
    });

    describe('getRoleByName - 按名称获取角色', () => {
      it('应该成功按名称获取角色', async () => {
        const response = await roleController.getRoleByName(testRole.name);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(
          expect.objectContaining({
            roleId: testRole.roleId,
            name: testRole.name
          })
        );
      });

      it('应该正确处理角色名称不存在', async () => {
        const response = await roleController.getRoleByName('non-existent-role');

        expect(response.success).toBe(false);
        expect(response.error).toContain('not found');
      });
    });

    describe('addPermission - 添加权限', () => {
      it('应该成功添加权限', async () => {
        const permission = createTestPermission({
          resourceType: 'task',
          resourceId: 'task-001' as UUID,
          actions: ['read', 'update']
        });

        const response = await roleController.addPermission(testRole.roleId, permission);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(
          expect.objectContaining({
            roleId: testRole.roleId,
            permissions: expect.arrayContaining([
              expect.objectContaining({
                resourceType: 'task',
                resourceId: 'task-001'
              })
            ])
          })
        );
      });

      it('应该正确处理添加权限时的错误', async () => {
        jest.spyOn(roleService, 'addPermission').mockRejectedValueOnce(new Error('Permission error'));

        const permission = createTestPermission();
        const response = await roleController.addPermission(testRole.roleId, permission);

        expect(response.success).toBe(false);
        expect(response.error).toContain('Permission error');
      });
    });

    describe('removePermission - 移除权限', () => {
      let permissionId: UUID;

      beforeEach(async () => {
        const permission = createTestPermission({
          resourceType: 'task',
          resourceId: 'task-002' as UUID,
          actions: ['read']
        });
        const updatedRole = await roleService.addPermission(testRole.roleId, permission);
        permissionId = updatedRole.permissions[updatedRole.permissions.length - 1].permissionId;
      });

      it('应该成功移除权限', async () => {
        const response = await roleController.removePermission(testRole.roleId, permissionId);

        expect(response.success).toBe(true);
        expect(response.data).toEqual(
          expect.objectContaining({
            roleId: testRole.roleId
          })
        );
      });

      it('应该正确处理移除权限时的错误', async () => {
        jest.spyOn(roleService, 'removePermission').mockRejectedValueOnce(new Error('Remove error'));

        const response = await roleController.removePermission(testRole.roleId, permissionId);

        expect(response.success).toBe(false);
        expect(response.error).toContain('Remove error');
      });
    });

    describe('getRoleStatistics - 旧版本统计方法', () => {
      it('应该成功获取角色统计信息', async () => {
        const response = await roleController.getRoleStatistics();

        expect(response.success).toBe(true);
        expect(response.data).toEqual(
          expect.objectContaining({
            totalRoles: expect.any(Number),
            activeRoles: expect.any(Number),
            inactiveRoles: expect.any(Number),
            rolesByType: expect.any(Object),
            averageComplexityScore: expect.any(Number)
          })
        );
      });

      it('应该正确处理统计错误', async () => {
        jest.spyOn(roleService, 'getRoleStatistics').mockRejectedValueOnce(new Error('Statistics error'));

        const response = await roleController.getRoleStatistics();

        expect(response.success).toBe(false);
        expect(response.error).toContain('Statistics error');
      });
    });

    describe('getComplexityDistribution - 复杂度分布', () => {
      it('应该成功获取复杂度分布', async () => {
        const response = await roleController.getComplexityDistribution();

        expect(response.success).toBe(true);
        expect(response.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              range: expect.any(String),
              count: expect.any(Number),
              percentage: expect.any(Number)
            })
          ])
        );
      });

      it('应该正确处理复杂度分布错误', async () => {
        jest.spyOn(roleService, 'getComplexityDistribution').mockRejectedValueOnce(new Error('Distribution error'));

        const response = await roleController.getComplexityDistribution();

        expect(response.success).toBe(false);
        expect(response.error).toContain('Distribution error');
      });
    });
  });
});
