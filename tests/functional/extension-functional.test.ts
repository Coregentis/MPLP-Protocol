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
          name: '工作流验证插件',
          version: '1.0.0',
          type: 'plugin',
          display_name: 'Workflow Validator Plugin',
          description: '用于验证工作流配置的插件',
          configuration: {
            validation_rules: ['required_fields', 'dependency_check'],
            auto_fix: false
          }
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(true);
        expect(result.data).toBeInstanceOf(Extension);
        expect(result.data?.name).toBe('工作流验证插件');
        expect(result.data?.type).toBe('plugin');
        expect(result.data?.status).toBe('installed');
        expect(result.data?.configuration).toEqual(createRequest.configuration);
        
        // 验证仓库调用
        expect(mockRepository.isNameUnique).toHaveBeenCalledWith('工作流验证插件', contextId);
        expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Extension));
      });

      it('应该让开发者能够创建一个适配器扩展', async () => {
        // 用户场景：开发者创建一个数据库适配器
        const contextId = uuidv4();
        
        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.save.mockResolvedValue();

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: 'PostgreSQL适配器',
          version: '2.1.0',
          type: 'adapter',
          display_name: 'PostgreSQL Database Adapter',
          description: '连接PostgreSQL数据库的适配器',
          configuration: {
            connection_pool_size: 10,
            timeout: 30000,
            ssl_enabled: true
          }
        };

        const result = await extensionManagementService.createExtension(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.type).toBe('adapter');
        expect(result.data?.version).toBe('2.1.0');
        expect(result.data?.configuration?.connection_pool_size).toBe(10);
      });

      it('应该验证扩展名称唯一性', async () => {
        // 用户场景：尝试创建重复名称的扩展
        const contextId = uuidv4();
        
        // Mock仓库返回名称已存在
        mockRepository.isNameUnique.mockResolvedValue(false);

        const createRequest: CreateExtensionRequest = {
          context_id: contextId,
          name: '重复扩展名',
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
          name: '测试扩展',
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
            name: `测试${type}扩展`,
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
          name: '测试扩展',
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
          name: '测试扩展',
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
          name: '测试扩展',
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
        
        // 创建一个已安装的扩展
        const installedExtension = new Extension(
          extensionId,
          contextId,
          '1.0.0',
          '测试插件',
          '1.0.0',
          'plugin',
          'installed',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

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
        
        const extensionWithDeps = new Extension(
          extensionId,
          contextId,
          '1.0.0',
          '依赖扩展',
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
        const activeExtension = new Extension(
          extensionId,
          contextId,
          '1.0.0',
          '活跃插件',
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

        const extension = new Extension(
          extensionId,
          contextId,
          '1.0.0',
          '查询测试扩展',
          '1.2.0',
          'plugin',
          'active',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString(),
          'Query Test Plugin',
          '用于测试查询功能的扩展'
        );

        mockRepository.findById.mockResolvedValue(extension);

        const result = await extensionManagementService.getExtensionById(extensionId);

        expect(result.success).toBe(true);
        expect(result.data?.extension_id).toBe(extensionId);
        expect(result.data?.name).toBe('查询测试扩展');
        expect(result.data?.display_name).toBe('Query Test Plugin');
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
          new Extension(uuidv4(), contextId, '1.0.0', '插件1', '1.0.0', 'plugin', 'active', new Date().toISOString(), new Date().toISOString(), new Date().toISOString()),
          new Extension(uuidv4(), contextId, '1.0.0', '插件2', '1.1.0', 'plugin', 'installed', new Date().toISOString(), new Date().toISOString(), new Date().toISOString())
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

        const extension = new Extension(
          extensionId,
          contextId,
          '1.0.0',
          '过时扩展',
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
          new Extension(
            uuidv4(),
            contextId,
            '1.0.0',
            `扩展${i}`,
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
});
