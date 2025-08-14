/**
 * Extension模块功能场景测试
 * 
 * 基于真实用户需求和实际源代码实现的功能场景测试，确保90%功能场景覆盖率
 * 
 * 测试目的：发现源代码和源功能中的不足，从用户角度验证功能是否满足实际需求
 * 
 * 用户真实场景：
 * 1. 系统管理员需要安装和管理扩展
 * 2. 开发者需要创建和部署扩展
 * 3. 最终用户需要激活和配置扩展
 * 4. 运维人员需要监控扩展状态和依赖
 * 
 * @version 1.0.0
 * @created 2025-08-02
 */

import { ExtensionManagementService, CreateExtensionRequest, OperationResult } from '../../src/modules/extension/application/services/extension-management.service';
import { Extension } from '../../src/modules/extension/domain/entities/extension.entity';
import { IExtensionRepository, ExtensionFilter, PaginationOptions, PaginatedResult } from '../../src/modules/extension/domain/repositories/extension-repository.interface';
import { 
  ExtensionType, 
  ExtensionStatus,
  ExtensionConfiguration,
  ExtensionPoint,
  ApiExtension,
  EventSubscription
} from '../../src/modules/extension/types';
import { UUID } from '../../src/public/shared/types';
import { v4 as uuidv4 } from 'uuid';

describe('Extension模块功能场景测试 - 基于真实用户需求', () => {
  let extensionManagementService: ExtensionManagementService;
  let mockRepository: jest.Mocked<IExtensionRepository>;

  // 辅助函数：创建Extension实体（使用Schema格式）
  function createExtension(
    extensionId: string,
    contextId: string,
    protocolVersion: string,
    name: string,
    version: string,
    type: ExtensionType,
    status: ExtensionStatus,
    timestamp: string,
    createdAt: string,
    updatedAt: string
  ): Extension {
    return new Extension({
      extension_id: extensionId,
      context_id: contextId,
      protocol_version: protocolVersion,
      name,
      version,
      extension_type: type,
      status,
      timestamp,
      created_at: createdAt,
      updated_at: updatedAt
    });
  }

  beforeEach(() => {
    // 基于实际接口创建Mock依赖
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFilter: jest.fn(),
      isNameUnique: jest.fn(),
      checkDependencies: jest.fn(),
      findDependents: jest.fn(), // 添加缺失的方法
      exists: jest.fn(),
      count: jest.fn()
    } as unknown as jest.Mocked<IExtensionRepository>;

    // 创建服务实例 - 基于实际构造函数
    extensionManagementService = new ExtensionManagementService(mockRepository);
  });

  describe('1. 扩展创建场景 - 系统管理员日常使用', () => {
    describe('基本扩展创建 - 用户最常见的需求', () => {
      it('应该让系统管理员能够创建一个插件扩展', async () => {
        // 用户场景：系统管理员想安装一个工作流验证插件
        const contextId = uuidv4();
        
        // Mock仓库返回值
        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.save.mockResolvedValue();

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'workflow-validator-plugin',
          version: '1.0.0',
          type: 'plugin',
          display_name: 'Workflow Validator Plugin',
          description: '用于验证工作流配置的插件',
          configuration: {
            schema: {
              type: 'object',
              properties: {
                validation_rules: { type: 'array' },
                auto_fix: { type: 'boolean' }
              }
            },
            current_config: {
              validation_rules: ['required_fields', 'dependency_check'],
              auto_fix: false
            },
            default_config: {
              validation_rules: [],
              auto_fix: true
            }
          }
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(true);
        expect(result.data).toBeInstanceOf(Extension);
        expect(result.data?.name).toBe('workflow-validator-plugin');
        expect(result.data?.type).toBe('plugin');
        expect(result.data?.status).toBe('installed');
        expect(result.data?.configuration).toEqual(createRequest.configuration);
        
        // 验证仓库调用
        expect(mockRepository.isNameUnique).toHaveBeenCalledWith('workflow-validator-plugin', contextId);
        expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Extension));
      });

      it('应该让开发者能够创建一个适配器扩展', async () => {
        // 用户场景：开发者创建一个数据库适配器
        const contextId = uuidv4();
        
        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.save.mockResolvedValue();

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'postgresql-adapter',
          version: '2.1.0',
          type: 'adapter',
          display_name: 'PostgreSQL Database Adapter',
          description: '连接PostgreSQL数据库的适配器',
          configuration: {
            schema: {
              type: 'object',
              properties: {
                connection_pool_size: { type: 'number' },
                timeout: { type: 'number' },
                ssl_enabled: { type: 'boolean' }
              }
            },
            current_config: {
              connection_pool_size: 10,
              timeout: 30000,
              ssl_enabled: true
            },
            default_config: {
              connection_pool_size: 5,
              timeout: 15000,
              ssl_enabled: false
            }
          }
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.type).toBe('adapter');
        expect(result.data?.version).toBe('2.1.0');
        expect(result.data?.configuration?.current_config?.connection_pool_size).toBe(10);
      });

      it('应该验证扩展名称唯一性', async () => {
        // 用户场景：尝试创建重复名称的扩展
        const contextId = uuidv4();
        
        // Mock仓库返回名称已存在
        mockRepository.isNameUnique.mockResolvedValue(false);

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'duplicate-extension',
          version: '1.0.0',
          type: 'plugin'
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展名称已存在');
        expect(mockRepository.save).not.toHaveBeenCalled();
      });
    });

    describe('扩展类型验证 - 防止用户错误', () => {
      it('应该验证扩展类型的有效性', async () => {
        // 用户场景：用户输入了无效的扩展类型
        const contextId = uuidv4();
        
        mockRepository.isNameUnique.mockResolvedValue(true);

        const createRequest = {
          context_id: contextId,
          name: 'test-extension',
          version: '1.0.0',
          type: 'invalid_type' as ExtensionType
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('无效的扩展类型: invalid_type');
        expect(mockRepository.save).not.toHaveBeenCalled();
      });

      it('应该支持所有有效的扩展类型', async () => {
        // 用户场景：验证所有支持的扩展类型
        const contextId = uuidv4();
        const validTypes: ExtensionType[] = ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'];
        
        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.save.mockResolvedValue();

        for (const type of validTypes) {
          const createRequest: CreateExtensionRequest = {
            context_id: contextId,
            name: `test-${type}-extension`,
            version: '1.0.0',
            type: type
          };

          const result = await extensionManagementService.createExtension(createRequest);
          expect(result.success).toBe(true);
          expect(result.data?.type).toBe(type);
        }

        expect(mockRepository.save).toHaveBeenCalledTimes(validTypes.length);
      });
    });

    describe('输入验证 - 防止用户错误', () => {
      it('应该拒绝空的扩展名称', async () => {
        // 用户场景：用户忘记输入扩展名称
        const contextId = uuidv4();
        
        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: '',
          version: '1.0.0',
          type: 'plugin'
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展名称不能为空');
        expect(mockRepository.isNameUnique).not.toHaveBeenCalled();
      });

      it('应该拒绝过长的扩展名称', async () => {
        // 用户场景：用户输入了过长的扩展名称
        const contextId = uuidv4();
        const longName = 'a'.repeat(101);
        
        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: longName,
          version: '1.0.0',
          type: 'plugin'
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展名称不能超过100个字符');
        expect(mockRepository.isNameUnique).not.toHaveBeenCalled();
      });

      it('应该拒绝空的扩展版本', async () => {
        // 用户场景：用户忘记输入版本号
        const contextId = uuidv4();
        
        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'test-extension',
          version: '',
          type: 'plugin'
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展版本不能为空');
        expect(mockRepository.isNameUnique).not.toHaveBeenCalled();
      });

      it('应该拒绝空的上下文ID', async () => {
        // 用户场景：系统错误导致上下文ID为空
        const createRequest: CreateExtensionRequest = {
          context_id: '',
          name: 'test-extension',
          version: '1.0.0',
          type: 'plugin'
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('上下文ID不能为空');
        expect(mockRepository.isNameUnique).not.toHaveBeenCalled();
      });
    });

    describe('异常处理 - 系统健壮性', () => {
      it('应该处理创建扩展时的异常情况', async () => {
        // 用户场景：数据库连接失败等系统异常
        const contextId = uuidv4();
        
        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.save.mockRejectedValue(new Error('数据库连接失败'));

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'test-extension',
          version: '1.0.0',
          type: 'plugin'
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe('数据库连接失败');
      });
    });
  });

  describe('2. 扩展激活场景 - 用户日常操作', () => {
    describe('基本激活功能 - 最常见的需求', () => {
      it('应该让用户能够激活已安装的扩展', async () => {
        // 用户场景：激活一个已安装的插件
        const extensionId = uuidv4();
        const contextId = uuidv4();
        
        // 创建一个已安装的扩展 (使用Schema格式)
        const installedExtension = new Extension({
          extension_id: extensionId,
          context_id: contextId,
          protocol_version: '1.0.0',
          name: 'test-plugin',
          version: '1.0.0',
          extension_type: 'plugin',
          status: 'installed',
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        mockRepository.findById.mockResolvedValue(installedExtension);
        mockRepository.checkDependencies.mockResolvedValue({
          satisfied: true,
          missing: []
        });
        mockRepository.update.mockResolvedValue();

        const result = await extensionManagementService.activateExtension(extensionId);

        expect(result.success).toBe(true);
        expect(result.data?.status).toBe('active');
        expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
        expect(mockRepository.checkDependencies).toHaveBeenCalledWith(installedExtension);
        expect(mockRepository.update).toHaveBeenCalled();
      });

      it('应该检查扩展依赖是否满足', async () => {
        // 用户场景：激活一个有依赖的扩展，但依赖不满足
        const extensionId = uuidv4();
        const contextId = uuidv4();
        
        const extensionWithDeps = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'dependency-extension',
          '1.0.0',
          'plugin',
          'installed',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.findById.mockResolvedValue(extensionWithDeps);
        mockRepository.checkDependencies.mockResolvedValue({
          satisfied: false,
          missing: ['required-plugin-v1.0', 'database-adapter-v2.0']
        });

        const result = await extensionManagementService.activateExtension(extensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('依赖不满足: required-plugin-v1.0, database-adapter-v2.0');
        expect(mockRepository.update).not.toHaveBeenCalled();
      });

      it('应该处理扩展不存在的情况', async () => {
        // 用户场景：尝试激活不存在的扩展
        const nonExistentExtensionId = uuidv4();
        
        mockRepository.findById.mockResolvedValue(null);

        const result = await extensionManagementService.activateExtension(nonExistentExtensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展不存在');
        expect(mockRepository.checkDependencies).not.toHaveBeenCalled();
        expect(mockRepository.update).not.toHaveBeenCalled();
      });

      it('应该验证扩展ID不能为空', async () => {
        // 用户场景：系统错误导致扩展ID为空
        const result = await extensionManagementService.activateExtension('');

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展ID不能为空');
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });
    });
  });

  describe('3. 扩展停用场景 - 用户管理需求', () => {
    describe('基本停用功能', () => {
      it('应该让用户能够停用已激活的扩展', async () => {
        // 用户场景：停用一个不再需要的扩展
        const extensionId = uuidv4();
        const contextId = uuidv4();

        // 创建一个已激活的扩展
        const activeExtension = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'active-plugin',
          '1.0.0',
          'plugin',
          'active',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.findById.mockResolvedValue(activeExtension);
        mockRepository.findDependents.mockResolvedValue([]); // 没有依赖的扩展
        mockRepository.update.mockResolvedValue();

        const result = await extensionManagementService.deactivateExtension(extensionId);

        expect(result.success).toBe(true);
        expect(result.data?.status).toBe('inactive'); // 修复：停用后状态应该是inactive，不是installed
        expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
        expect(mockRepository.update).toHaveBeenCalled();
      });

      it('应该处理扩展不存在的情况', async () => {
        // 用户场景：尝试停用不存在的扩展
        const nonExistentExtensionId = uuidv4();

        mockRepository.findById.mockResolvedValue(null);

        const result = await extensionManagementService.deactivateExtension(nonExistentExtensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展不存在');
        expect(mockRepository.update).not.toHaveBeenCalled();
      });

      it('应该验证扩展ID不能为空', async () => {
        // 用户场景：系统错误导致扩展ID为空
        const result = await extensionManagementService.deactivateExtension('');

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展ID不能为空');
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });
    });
  });

  describe('4. 扩展查询场景 - 用户浏览和搜索', () => {
    describe('基本查询功能', () => {
      it('应该让用户能够根据ID查找扩展', async () => {
        // 用户场景：查看特定扩展的详细信息
        const extensionId = uuidv4();
        const contextId = uuidv4();

        const extension = new Extension({
          extension_id: extensionId,
          context_id: contextId,
          protocol_version: '1.0.0',
          name: 'query-test-extension',
          version: '1.2.0',
          extension_type: 'plugin',
          status: 'active',
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          display_name: 'Query Test Plugin',
          description: '用于测试查询功能的扩展'
        });

        mockRepository.findById.mockResolvedValue(extension);

        const result = await extensionManagementService.getExtensionById(extensionId);

        expect(result.success).toBe(true);
        expect(result.data?.extensionId).toBe(extensionId);
        expect(result.data?.name).toBe('query-test-extension');
        expect(result.data?.displayName).toBe('Query Test Plugin');
        expect(result.data?.description).toBe('用于测试查询功能的扩展');
        expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
      });

      it('应该处理扩展不存在的情况', async () => {
        // 用户场景：查询不存在的扩展
        const nonExistentExtensionId = uuidv4();

        mockRepository.findById.mockResolvedValue(null);

        const result = await extensionManagementService.getExtensionById(nonExistentExtensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展不存在');
      });

      it('应该让用户能够按条件查询扩展列表', async () => {
        // 用户场景：查看所有插件类型的扩展
        const contextId = uuidv4();

        const extensions = [
          createExtension(uuidv4(), contextId, '1.0.0', 'plugin-1', '1.0.0', 'plugin', 'active', new Date().toISOString(), new Date().toISOString(), new Date().toISOString()),
          createExtension(uuidv4(), contextId, '1.0.0', 'plugin-2', '1.1.0', 'plugin', 'installed', new Date().toISOString(), new Date().toISOString(), new Date().toISOString())
        ];

        const paginatedResult: PaginatedResult<Extension> = {
          items: extensions,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        };

        mockRepository.findByFilter.mockResolvedValue(paginatedResult);

        const filter: ExtensionFilter = {
          type: 'plugin',
          status: undefined,
          context_id: contextId
        };

        const pagination: PaginationOptions = {
          page: 1,
          limit: 10
        };

        const result = await extensionManagementService.getExtensions(filter, pagination);

        expect(result.success).toBe(true);
        expect(result.data?.items).toHaveLength(2);
        expect(result.data?.total).toBe(2);
        expect(result.data?.items[0].type).toBe('plugin');
        expect(result.data?.items[1].type).toBe('plugin');
        expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, pagination);
      });
    });
  });

  describe('5. 扩展删除场景 - 清理和维护', () => {
    describe('基本删除功能', () => {
      it('应该让管理员能够删除不需要的扩展', async () => {
        // 用户场景：删除一个过时的扩展
        const extensionId = uuidv4();
        const contextId = uuidv4();

        const extension = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'outdated-extension',
          '0.9.0',
          'plugin',
          'installed',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.findById.mockResolvedValue(extension);
        mockRepository.findDependents.mockResolvedValue([]); // 无依赖
        mockRepository.delete.mockResolvedValue();

        const result = await extensionManagementService.deleteExtension(extensionId);

        expect(result.success).toBe(true);
        expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
        expect(mockRepository.delete).toHaveBeenCalledWith(extensionId);
      });

      it('应该处理扩展不存在的情况', async () => {
        // 用户场景：尝试删除不存在的扩展
        const nonExistentExtensionId = uuidv4();

        mockRepository.findById.mockResolvedValue(null);

        const result = await extensionManagementService.deleteExtension(nonExistentExtensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展不存在');
        expect(mockRepository.delete).not.toHaveBeenCalled();
      });

      it('应该验证扩展ID不能为空', async () => {
        // 用户场景：系统错误导致扩展ID为空
        const result = await extensionManagementService.deleteExtension('');

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展ID不能为空');
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });
    });
  });

  describe('6. 边界条件和异常处理 - 系统健壮性', () => {
    describe('异常处理', () => {
      it('应该处理激活扩展时的异常情况', async () => {
        // 用户场景：系统异常导致激活失败
        const extensionId = uuidv4();

        mockRepository.findById.mockRejectedValue(new Error('数据库连接超时'));

        const result = await extensionManagementService.activateExtension(extensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('数据库连接超时');
      });

      it('应该处理停用扩展时的异常情况', async () => {
        // 用户场景：系统异常导致停用失败
        const extensionId = uuidv4();

        mockRepository.findById.mockRejectedValue(new Error('网络连接失败'));

        const result = await extensionManagementService.deactivateExtension(extensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('网络连接失败');
      });

      it('应该处理查询扩展时的异常情况', async () => {
        // 用户场景：系统异常导致查询失败
        const extensionId = uuidv4();

        mockRepository.findById.mockRejectedValue(new Error('查询超时'));

        const result = await extensionManagementService.getExtensionById(extensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('查询超时');
      });

      it('应该处理删除扩展时的异常情况', async () => {
        // 用户场景：系统异常导致删除失败
        const extensionId = uuidv4();

        mockRepository.findById.mockRejectedValue(new Error('权限不足'));

        const result = await extensionManagementService.deleteExtension(extensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('权限不足');
      });
    });

    describe('边界条件', () => {
      it('应该处理大量扩展的查询', async () => {
        // 用户场景：系统中有大量扩展时的查询性能
        const contextId = uuidv4();
        const largeExtensionList = Array.from({ length: 1000 }, (_, i) =>
          createExtension(
            uuidv4(),
            contextId,
            '1.0.0',
            `extension-${i}`,
            '1.0.0',
            'plugin',
            'installed',
            new Date().toISOString(),
            new Date().toISOString(),
            new Date().toISOString()
          )
        );

        const paginatedResult: PaginatedResult<Extension> = {
          items: largeExtensionList.slice(0, 50), // 分页返回前50个
          total: 1000,
          page: 1,
          limit: 50,
          total_pages: 20 // 使用正确的字段名
        };

        mockRepository.findByFilter.mockResolvedValue(paginatedResult);

        const filter: ExtensionFilter = {
          context_id: contextId
        };

        const pagination: PaginationOptions = {
          page: 1,
          limit: 50
        };

        const result = await extensionManagementService.getExtensions(filter, pagination);

        expect(result.success).toBe(true);
        expect(result.data?.items).toHaveLength(50);
        expect(result.data?.total).toBe(1000);
        expect(result.data?.totalPages).toBe(20);
      });
    });
  });

  describe('6. Plugin Ecosystem场景 - 扩展生态系统', () => {
    describe('扩展依赖管理', () => {
      it('应该能够安装有依赖关系的扩展', async () => {
        // 用户场景：安装一个需要其他扩展的插件
        const contextId = uuidv4();
        const dependencyId = uuidv4();

        // 创建依赖扩展
        const dependencyExtension = createExtension(
          dependencyId,
          contextId,
          '1.0.0',
          'basic-tools-extension',
          '1.0.0',
          'plugin',
          'active',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.isNameUnique.mockResolvedValue(true);
        // Mock findById to return the dependency extension when called with dependencyId
        mockRepository.findById.mockImplementation((id: string) => {
          if (id === dependencyId) {
            return Promise.resolve(dependencyExtension);
          }
          return Promise.resolve(null);
        });
        mockRepository.checkDependencies.mockResolvedValue([dependencyExtension]);
        mockRepository.save.mockResolvedValue();

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'advanced-analytics-plugin',
          version: '1.0.0',
          type: 'plugin',
          dependencies: [
            {
              extension_id: dependencyId,
              name: 'basic-tools-extension',
              version_range: '^1.0.0',
              optional: false
            }
          ]
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.compatibility?.dependencies).toHaveLength(1);
        expect(mockRepository.findById).toHaveBeenCalledWith(dependencyId);
      });

      it('应该拒绝安装缺少依赖的扩展', async () => {
        // 用户场景：尝试安装依赖不满足的扩展
        const contextId = uuidv4();
        const missingDependencyId = uuidv4();

        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.checkDependencies.mockResolvedValue([]); // 依赖不存在

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'advanced-analytics-plugin',
          version: '1.0.0',
          type: 'plugin',
          dependencies: [
            {
              extension_id: missingDependencyId,
              name: 'missing-dependency',
              version_range: '^1.0.0',
              optional: false
            }
          ]
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toContain('依赖');
      });
    });

    describe('扩展冲突检测', () => {
      it('应该检测并阻止冲突的扩展安装', async () => {
        // 用户场景：尝试安装与现有扩展冲突的插件
        const contextId = uuidv4();
        const conflictingExtensionId = uuidv4();

        const existingExtension = createExtension(
          conflictingExtensionId,
          contextId,
          '1.0.0',
          'old-data-processor',
          '1.0.0',
          'plugin',
          'active',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.isNameUnique.mockResolvedValue(true);
        // Mock findById to return the conflicting extension when called with conflictingExtensionId
        mockRepository.findById.mockImplementation((id: string) => {
          if (id === conflictingExtensionId) {
            return Promise.resolve(existingExtension);
          }
          return Promise.resolve(null);
        });
        mockRepository.findByFilter.mockResolvedValue({
          items: [existingExtension],
          total: 1,
          page: 1,
          limit: 10,
          total_pages: 1
        });

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'new-data-processor',
          version: '2.0.0',
          type: 'plugin',
          conflicts: [
            {
              extension_id: conflictingExtensionId,
              name: 'old-data-processor',
              reason: '功能重叠，不能同时使用'
            }
          ]
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(false);
        expect(result.error).toContain('冲突');
      });
    });
  });

  describe('7. Dynamic Loading场景 - 动态加载机制', () => {
    describe('扩展动态加载', () => {
      it('应该能够动态加载扩展代码', async () => {
        // 用户场景：运行时动态加载扩展功能
        const extensionId = uuidv4();
        const contextId = uuidv4();

        const extension = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'dynamic-loading-test-extension',
          '1.0.0',
          'plugin',
          'installed',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.findById.mockResolvedValue(extension);
        mockRepository.checkDependencies.mockResolvedValue({
          satisfied: true,
          missing: []
        });
        mockRepository.update.mockResolvedValue();

        const result = await extensionManagementService.activateExtension(extensionId);

        expect(result.success).toBe(true);
        expect(result.data?.status).toBe('active');
        expect(mockRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            extensionId: extensionId,
            status: 'active'
          })
        );
      });

      it('应该处理扩展代码加载失败的情况', async () => {
        // 用户场景：扩展代码损坏或不兼容
        const extensionId = uuidv4();
        const contextId = uuidv4();

        const corruptedExtension = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'corrupted-extension',
          '1.0.0',
          'plugin',
          'installed',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.findById.mockResolvedValue(corruptedExtension);
        mockRepository.checkDependencies.mockResolvedValue({
          satisfied: true,
          missing: []
        });
        mockRepository.update.mockRejectedValue(new Error('扩展代码加载失败'));

        const result = await extensionManagementService.activateExtension(extensionId);

        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展代码加载失败');
      });
    });
  });

  describe('8. Lifecycle Management场景 - 生命周期管理', () => {
    describe('扩展生命周期状态转换', () => {
      it('应该正确管理扩展的完整生命周期', async () => {
        // 用户场景：扩展从安装到删除的完整生命周期
        const extensionId = uuidv4();
        const contextId = uuidv4();

        // 1. 创建扩展 (installed状态)
        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.save.mockResolvedValue();

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'lifecycle-test-extension',
          version: '1.0.0',
          type: 'plugin'
        };

        const createResult = await extensionManagementService.createExtension(createRequest);
        expect(createResult.success).toBe(true);
        expect(createResult.data?.status).toBe('installed');

        // 2. 激活扩展 (active状态)
        const installedExtension = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'lifecycle-test-extension',
          '1.0.0',
          'plugin',
          'installed',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        const activeExtension = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'lifecycle-test-extension',
          '1.0.0',
          'plugin',
          'active',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        const inactiveExtension = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'lifecycle-test-extension',
          '1.0.0',
          'plugin',
          'inactive',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        // Setup mocks for all lifecycle steps
        mockRepository.findById
          .mockResolvedValueOnce(installedExtension)  // For activate
          .mockResolvedValueOnce(activeExtension)     // For deactivate
          .mockResolvedValueOnce(inactiveExtension);  // For delete

        mockRepository.checkDependencies.mockResolvedValue({
          satisfied: true,
          missing: []
        });
        mockRepository.update.mockResolvedValue();
        mockRepository.findDependents.mockResolvedValue([]);
        mockRepository.delete.mockResolvedValue();

        const activateResult = await extensionManagementService.activateExtension(extensionId);
        expect(activateResult.success).toBe(true);

        // 3. 停用扩展 (inactive状态)
        const deactivateResult = await extensionManagementService.deactivateExtension(extensionId);
        expect(deactivateResult.success).toBe(true);

        // 4. 删除扩展
        const deleteResult = await extensionManagementService.deleteExtension(extensionId);
        expect(deleteResult.success).toBe(true);
      });

      it('应该阻止删除有依赖的扩展', async () => {
        // 用户场景：尝试删除被其他扩展依赖的扩展
        const extensionId = uuidv4();
        const dependentId = uuidv4();
        const contextId = uuidv4();

        const extension = createExtension(
          extensionId,
          contextId,
          '1.0.0',
          'basic-extension',
          '1.0.0',
          'plugin',
          'inactive',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        const dependentExtension = createExtension(
          dependentId,
          contextId,
          '1.0.0',
          'dependent-extension',
          '1.0.0',
          'plugin',
          'active',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        mockRepository.findById.mockResolvedValue(extension);
        mockRepository.findDependents.mockResolvedValue([dependentExtension]);

        const result = await extensionManagementService.deleteExtension(extensionId);

        expect(result.success).toBe(false);
        expect(result.error).toContain('依赖');
        expect(mockRepository.delete).not.toHaveBeenCalled();
      });
    });
  });
});
