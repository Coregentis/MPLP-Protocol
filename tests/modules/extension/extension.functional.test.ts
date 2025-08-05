/**
 * Extension模块功能场景测试
 * 
 * 基于用户角度的功能场景测试，验证Extension模块的实际业务价值
 * 测试目的：发现源代码和功能实现中的不足，确保用户需求得到满足
 * 
 * @version 1.0.0
 * @created 2025-08-02T15:00:00+08:00
 */

import { jest } from '@jest/globals';
import { ExtensionManagementService, CreateExtensionRequest } from '../../../src/modules/extension/application/services/extension-management.service';
import { Extension } from '../../../src/modules/extension/domain/entities/extension.entity';
import { IExtensionRepository } from '../../../src/modules/extension/domain/repositories/extension-repository.interface';
import { 
  ExtensionType, 
  ExtensionStatus,
  ExtensionConfiguration,
  ExtensionPoint,
  ApiExtension,
  EventSubscription,
  ExtensionPointType,
  TargetModule,
  HttpMethod,
  EventSource,
  DeliveryGuarantee
} from '../../../src/modules/extension/types';
import { UUID } from '../../../src/public/shared/types';

describe('Extension模块功能场景测试', () => {
  let extensionService: ExtensionManagementService;
  let mockRepository: jest.Mocked<IExtensionRepository>;

  beforeEach(() => {
    // 创建Mock Repository
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      isNameUnique: jest.fn(),
      findActiveExtensions: jest.fn(),
      findDependents: jest.fn(),
      checkDependencies: jest.fn(),
      getStatistics: jest.fn(),
      query: jest.fn()
    } as jest.Mocked<IExtensionRepository>;

    extensionService = new ExtensionManagementService(mockRepository);
  });

  describe('功能场景1: 扩展安装和管理', () => {
    describe('用户安装新扩展', () => {
      it('应该成功安装有效的扩展', async () => {
        // 准备测试数据 - 模拟用户想要安装一个日志插件
        const installRequest: CreateExtensionRequest = {
          context_id: 'context-001',
          name: 'advanced-logger',
          version: '1.0.0',
          type: 'plugin',
          display_name: '高级日志插件',
          description: '提供高级日志记录功能',
          configuration: {
            schema: {
              type: 'object',
              properties: {
                logLevel: { type: 'string', enum: ['debug', 'info', 'warn', 'error'] },
                maxFileSize: { type: 'number', minimum: 1 }
              }
            },
            current_config: {
              logLevel: 'info',
              maxFileSize: 10
            }
          }
        };

        // Mock仓库行为
        mockRepository.isNameUnique.mockResolvedValue(true);
        mockRepository.save.mockResolvedValue(undefined);

        // 执行测试
        const result = await extensionService.createExtension(installRequest);

        // 验证结果 - 从用户角度验证
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.name).toBe('advanced-logger');
        expect(result.data!.status).toBe('installed');
        expect(result.data!.type).toBe('plugin');
        
        // 验证仓库调用
        expect(mockRepository.isNameUnique).toHaveBeenCalledWith('advanced-logger', 'context-001');
        expect(mockRepository.save).toHaveBeenCalled();
      });

      it('应该拒绝安装重复名称的扩展', async () => {
        // 准备测试数据 - 用户尝试安装已存在的扩展
        const duplicateRequest: CreateExtensionRequest = {
          context_id: 'context-001',
          name: 'existing-extension',
          version: '1.0.0',
          type: 'plugin'
        };

        // Mock仓库行为 - 扩展名称已存在
        mockRepository.isNameUnique.mockResolvedValue(false);

        // 执行测试
        const result = await extensionService.createExtension(duplicateRequest);

        // 验证结果 - 用户应该收到明确的错误信息
        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展名称已存在');
        expect(result.data).toBeUndefined();
      });

      it('应该验证扩展安装的输入参数', async () => {
        // 测试场景：用户提供了无效的输入参数
        const testCases = [
          {
            name: '空请求',
            request: null as any,
            expectedError: '请求参数不能为空'
          },
          {
            name: '空上下文ID',
            request: { context_id: '', name: 'test', version: '1.0.0', type: 'plugin' as ExtensionType },
            expectedError: '上下文ID不能为空'
          },
          {
            name: '空扩展名称',
            request: { context_id: 'ctx-001', name: '', version: '1.0.0', type: 'plugin' as ExtensionType },
            expectedError: '扩展名称不能为空'
          },
          {
            name: '扩展名称过长',
            request: { 
              context_id: 'ctx-001', 
              name: 'a'.repeat(101), 
              version: '1.0.0', 
              type: 'plugin' as ExtensionType 
            },
            expectedError: '扩展名称不能超过100个字符'
          },
          {
            name: '空版本',
            request: { context_id: 'ctx-001', name: 'test', version: '', type: 'plugin' as ExtensionType },
            expectedError: '扩展版本不能为空'
          },
          {
            name: '无效扩展类型',
            request: { context_id: 'ctx-001', name: 'test', version: '1.0.0', type: 'invalid' as ExtensionType },
            expectedError: '无效的扩展类型: invalid'
          }
        ];

        for (const testCase of testCases) {
          const result = await extensionService.createExtension(testCase.request);
          
          expect(result.success).toBe(false);
          expect(result.error).toBe(testCase.expectedError);
          expect(result.data).toBeUndefined();
        }
      });
    });

    describe('用户激活扩展', () => {
      it('应该成功激活已安装的扩展', async () => {
        // 准备测试数据 - 用户想要激活一个已安装的扩展
        const extensionId = 'ext-001';
        const mockExtension = new Extension(
          extensionId,
          'context-001',
          '1.0.0',
          'test-extension',
          '1.0.0',
          'plugin',
          'installed',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        // Mock仓库行为
        mockRepository.findById.mockResolvedValue(mockExtension);
        mockRepository.checkDependencies.mockResolvedValue({
          satisfied: true,
          missing: []
        });
        mockRepository.update.mockResolvedValue(undefined);

        // 执行测试
        const result = await extensionService.activateExtension(extensionId);

        // 验证结果 - 从用户角度验证
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data!.status).toBe('active');
        
        // 验证仓库调用
        expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
        expect(mockRepository.checkDependencies).toHaveBeenCalledWith(mockExtension);
        expect(mockRepository.update).toHaveBeenCalledWith(mockExtension);
      });

      it('应该拒绝激活不存在的扩展', async () => {
        // 准备测试数据 - 用户尝试激活不存在的扩展
        const nonExistentId = 'non-existent-ext';

        // Mock仓库行为
        mockRepository.findById.mockResolvedValue(null);

        // 执行测试
        const result = await extensionService.activateExtension(nonExistentId);

        // 验证结果 - 用户应该收到明确的错误信息
        expect(result.success).toBe(false);
        expect(result.error).toBe('扩展不存在');
        expect(result.data).toBeUndefined();
      });

      it('应该验证激活扩展的输入参数', async () => {
        // 测试场景：用户提供了无效的扩展ID
        const testCases = [
          { extensionId: '', expectedError: '扩展ID不能为空' },
          { extensionId: '   ', expectedError: '扩展ID不能为空' }
        ];

        for (const testCase of testCases) {
          const result = await extensionService.activateExtension(testCase.extensionId);
          
          expect(result.success).toBe(false);
          expect(result.error).toBe(testCase.expectedError);
          expect(result.data).toBeUndefined();
        }
      });

      it('应该处理依赖不满足的情况', async () => {
        // 准备测试数据 - 扩展有未满足的依赖
        const extensionId = 'ext-with-deps';
        const mockExtension = new Extension(
          extensionId,
          'context-001',
          '1.0.0',
          'dependent-extension',
          '1.0.0',
          'plugin',
          'installed',
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        // Mock仓库行为 - 依赖检查失败
        mockRepository.findById.mockResolvedValue(mockExtension);
        mockRepository.checkDependencies.mockResolvedValue({
          satisfied: false,
          missing: ['required-extension-1', 'required-extension-2']
        });

        // 执行测试
        const result = await extensionService.activateExtension(extensionId);

        // 验证结果 - 用户应该了解具体缺少哪些依赖
        expect(result.success).toBe(false);
        expect(result.error).toBe('依赖不满足: required-extension-1, required-extension-2');
        expect(result.data).toBeUndefined();
      });
    });
  });

  describe('功能场景2: 扩展配置管理', () => {
    it('应该允许用户查看扩展详情', async () => {
      // 准备测试数据 - 用户想要查看扩展的详细信息
      const extensionId = 'ext-001';
      const mockExtension = new Extension(
        extensionId,
        'context-001',
        '1.0.0',
        'sample-extension',
        '2.1.0',
        'middleware',
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        '示例扩展',
        '这是一个示例扩展，用于演示功能'
      );

      // Mock仓库行为
      mockRepository.findById.mockResolvedValue(mockExtension);

      // 执行测试
      const result = await extensionService.getExtensionById(extensionId);

      // 验证结果 - 用户应该能看到完整的扩展信息
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.extension_id).toBe(extensionId);
      expect(result.data!.name).toBe('sample-extension');
      expect(result.data!.version).toBe('2.1.0');
      expect(result.data!.type).toBe('middleware');
      expect(result.data!.status).toBe('active');
      expect(result.data!.display_name).toBe('示例扩展');
      expect(result.data!.description).toBe('这是一个示例扩展，用于演示功能');
    });
  });

  describe('功能场景3: 扩展停用管理', () => {
    it('应该成功停用活跃的扩展', async () => {
      // 准备测试数据 - 用户想要停用一个活跃的扩展
      const extensionId = 'ext-001';
      const mockExtension = new Extension(
        extensionId,
        'context-001',
        '1.0.0',
        'active-extension',
        '1.0.0',
        'plugin',
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // Mock仓库行为
      mockRepository.findById.mockResolvedValue(mockExtension);
      mockRepository.findDependents.mockResolvedValue([]); // 没有依赖此扩展的其他扩展
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await extensionService.deactivateExtension(extensionId);

      // 验证结果 - 从用户角度验证
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.status).toBe('inactive');
      
      // 验证仓库调用
      expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
      expect(mockRepository.findDependents).toHaveBeenCalledWith(extensionId);
      expect(mockRepository.update).toHaveBeenCalledWith(mockExtension);
    });

    it('应该验证停用扩展的输入参数', async () => {
      // 测试场景：用户提供了无效的扩展ID
      const testCases = [
        { extensionId: '', expectedError: '扩展ID不能为空' },
        { extensionId: '   ', expectedError: '扩展ID不能为空' }
      ];

      for (const testCase of testCases) {
        const result = await extensionService.deactivateExtension(testCase.extensionId);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe(testCase.expectedError);
        expect(result.data).toBeUndefined();
      }
    });
  });
});
