/**
 * Context管理服务 v2.0 测试
 * 
 * 验证核心业务逻辑的正确性
 * 支持14个功能域的完整业务操作
 */

import { ContextManagementService, CreateContextRequest, UpdateContextRequest } from '../../../../../src/modules/context/application/services/context-management.service';
import { ContextRepository } from '../../../../../src/modules/context/infrastructure/repositories/context.repository';
import { Context } from '../../../../../src/modules/context/domain/entities/context.entity';

describe('ContextManagementService测试', () => {
  let service: ContextManagementService;
  let repository: ContextRepository;

  beforeEach(() => {
    repository = new ContextRepository();
    service = new ContextManagementService(repository);
  });

  describe('创建Context', () => {
    it('应该能成功创建Context', async () => {
      const request: CreateContextRequest = {
        name: '测试上下文',
        description: '测试描述',
        status: 'active',
        lifecycleStage: 'planning'
      };

      const result = await service.createContext(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe('测试上下文');
      expect(result.data!.status).toBe('active');
      expect(result.data!.lifecycleStage).toBe('planning');
    });

    it('应该拒绝无效的创建请求', async () => {
      const request: CreateContextRequest = {
        name: '', // 无效的名称
        status: 'active',
        lifecycleStage: 'planning'
      };

      const result = await service.createContext(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(result.validationErrors).toContain('Name is required');
    });

    it('应该拒绝重复的名称', async () => {
      const request: CreateContextRequest = {
        name: '重复名称',
        status: 'active',
        lifecycleStage: 'planning'
      };

      // 第一次创建
      await service.createContext(request);

      // 第二次创建相同名称
      const result = await service.createContext(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('应该能使用自定义配置创建Context', async () => {
      const request: CreateContextRequest = {
        name: '自定义配置上下文',
        status: 'active',
        lifecycleStage: 'planning',
        auditConfig: {
          enabled: true,
          retentionDays: 90,
          auditEvents: []
        },
        monitoringConfig: {
          enabled: true,
          supportedProviders: ['prometheus'],
          exportFormats: ['json']
        }
      };

      const result = await service.createContext(request);

      expect(result.success).toBe(true);
      expect(result.data!.auditTrail.enabled).toBe(true);
      expect(result.data!.auditTrail.retentionDays).toBe(90);
      expect(result.data!.monitoringIntegration.enabled).toBe(true);
      expect(result.data!.monitoringIntegration.supportedProviders).toContain('prometheus');
    });
  });

  describe('更新Context', () => {
    let contextId: string;

    beforeEach(async () => {
      const request: CreateContextRequest = {
        name: '待更新上下文',
        status: 'active',
        lifecycleStage: 'planning'
      };

      const result = await service.createContext(request);
      contextId = result.data!.contextId;
    });

    it('应该能成功更新Context基础字段', async () => {
      const updateRequest: UpdateContextRequest = {
        name: '更新后的名称',
        description: '更新后的描述',
        status: 'inactive'
      };

      const result = await service.updateContext(contextId, updateRequest);

      expect(result.success).toBe(true);
      expect(result.data!.name).toBe('更新后的名称');
      expect(result.data!.description).toBe('更新后的描述');
      expect(result.data!.status).toBe('inactive');
    });

    it('应该能更新功能域配置', async () => {
      const updateRequest: UpdateContextRequest = {
        auditUpdates: {
          enabled: true,
          retentionDays: 60
        },
        performanceUpdates: {
          enabled: true,
          collectionIntervalSeconds: 30
        }
      };

      const result = await service.updateContext(contextId, updateRequest);

      expect(result.success).toBe(true);
      expect(result.data!.auditTrail.enabled).toBe(true);
      expect(result.data!.auditTrail.retentionDays).toBe(60);
      expect(result.data!.performanceMetrics.enabled).toBe(true);
      expect(result.data!.performanceMetrics.collectionIntervalSeconds).toBe(30);
    });

    it('应该拒绝更新不存在的Context', async () => {
      const updateRequest: UpdateContextRequest = {
        name: '新名称'
      };

      const result = await service.updateContext('non-existent-id', updateRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('删除Context', () => {
    it('应该能成功删除Context', async () => {
      // 创建Context
      const createRequest: CreateContextRequest = {
        name: '待删除上下文',
        status: 'active',
        lifecycleStage: 'planning'
      };

      const createResult = await service.createContext(createRequest);
      const contextId = createResult.data!.contextId;

      // 删除Context
      const deleteResult = await service.deleteContext(contextId);

      expect(deleteResult.success).toBe(true);

      // 验证已删除
      const getResult = await service.getContext(contextId);
      expect(getResult.success).toBe(false);
      expect(getResult.error).toContain('not found');
    });

    it('应该拒绝删除不存在的Context', async () => {
      const result = await service.deleteContext('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('查询Context', () => {
    beforeEach(async () => {
      // 创建测试数据
      const contexts = [
        {
          name: 'Context 1',
          status: 'active',
          lifecycleStage: 'planning'
        },
        {
          name: 'Context 2',
          status: 'inactive',
          lifecycleStage: 'executing'
        },
        {
          name: 'Context 3',
          status: 'active',
          lifecycleStage: 'completed'
        }
      ];

      for (const context of contexts) {
        await service.createContext(context);
      }
    });

    it('应该能获取单个Context', async () => {
      // 先创建一个Context
      const createRequest: CreateContextRequest = {
        name: '单个查询测试',
        status: 'active',
        lifecycleStage: 'planning'
      };

      const createResult = await service.createContext(createRequest);
      const contextId = createResult.data!.contextId;

      // 查询这个Context
      const result = await service.getContext(contextId);

      expect(result.success).toBe(true);
      expect(result.data!.name).toBe('单个查询测试');
    });

    it('应该能查询Context列表', async () => {
      const result = await service.queryContexts();

      expect(result.success).toBe(true);
      expect(result.data!.items.length).toBeGreaterThan(0);
      expect(result.data!.total).toBeGreaterThan(0);
    });

    it('应该能使用过滤器查询Context', async () => {
      const result = await service.queryContexts({
        status: 'active'
      });

      expect(result.success).toBe(true);
      expect(result.data!.items.every(c => c.status === 'active')).toBe(true);
    });

    it('应该能使用分页查询Context', async () => {
      const result = await service.queryContexts(undefined, {
        page: 1,
        limit: 2
      });

      expect(result.success).toBe(true);
      expect(result.data!.items.length).toBeLessThanOrEqual(2);
      expect(result.data!.page).toBe(1);
      expect(result.data!.limit).toBe(2);
    });
  });

  describe('统计信息', () => {
    beforeEach(async () => {
      // 创建不同状态的Context
      const contexts = [
        { name: 'Active 1', status: 'active', lifecycleStage: 'planning' },
        { name: 'Active 2', status: 'active', lifecycleStage: 'executing' },
        { name: 'Inactive 1', status: 'inactive', lifecycleStage: 'completed' }
      ];

      for (const context of contexts) {
        await service.createContext(context);
      }
    });

    it('应该能获取Context统计信息', async () => {
      const result = await service.getContextStatistics();

      expect(result.success).toBe(true);
      expect(result.data!.total).toBeGreaterThan(0);
      expect(result.data!.statusStats).toBeDefined();
      expect(result.data!.lifecycleStats).toBeDefined();
      expect(result.data!.featureDomainStats).toBeDefined();
      expect(result.data!.configurationStats).toBeDefined();

      // 验证状态统计
      expect(result.data!.statusStats.active).toBeGreaterThan(0);
      expect(result.data!.statusStats.inactive).toBeGreaterThan(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理Repository错误', async () => {
      // 模拟Repository错误
      const mockRepository = {
        findByName: jest.fn().mockRejectedValue(new Error('Database error')),
        save: jest.fn(),
        findById: jest.fn(),
        exists: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        getStatusStatistics: jest.fn(),
        getLifecycleStageStatistics: jest.fn(),
        getFeatureDomainStatistics: jest.fn(),
        getConfigurationStatistics: jest.fn()
      } as any;

      const errorService = new ContextManagementService(mockRepository);

      const request: CreateContextRequest = {
        name: '错误测试',
        status: 'active',
        lifecycleStage: 'planning'
      };

      const result = await errorService.createContext(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
