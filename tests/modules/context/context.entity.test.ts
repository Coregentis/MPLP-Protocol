/**
 * Context实体单元测试
 * 
 * 测试Context实体的所有领域行为，确保100%分支覆盖
 * 
 * @version 1.0.0
 * @created 2025-01-28T16:00:00+08:00
 */

import { Context } from '../../../src/modules/context/domain/entities/context.entity';
import { UUID, EntityStatus } from '../../../src/public/shared/types';
import { ContextLifecycleStage } from '../../../src/public/shared/types/context-types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('Context Entity', () => {
  let contextData: any;

  beforeEach(() => {
    contextData = TestDataFactory.Context.createContextData();
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  describe('构造函数', () => {
    it('应该正确创建Context实例', async () => {
      // 执行测试
      const context = await TestHelpers.Performance.expectExecutionTime(
        () => new Context(
          contextData.contextId,
          contextData.name,
          contextData.description,
          contextData.lifecycleStage,
          contextData.status,
          contextData.createdAt,
          contextData.updatedAt,
          contextData.sessionIds,
          contextData.sharedStateIds,
          contextData.configuration,
          contextData.metadata
        ),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );

      // 验证结果
      expect(context.contextId).toBe(contextData.contextId);
      expect(context.name).toBe(contextData.name);
      expect(context.description).toBe(contextData.description);
      expect(context.lifecycleStage).toBe(contextData.lifecycleStage);
      expect(context.status).toBe(contextData.status);
      expect(context.createdAt).toBe(contextData.createdAt);
      expect(context.updatedAt).toBe(contextData.updatedAt);
      expect(context.sessionIds).toEqual(contextData.sessionIds);
      expect(context.sharedStateIds).toEqual(contextData.sharedStateIds);
      expect(context.configuration).toEqual(contextData.configuration);
      expect(context.metadata).toEqual(contextData.metadata);
    });

    it('应该使用默认值创建Context实例', () => {
      // 执行测试
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        contextData.status,
        contextData.createdAt,
        contextData.updatedAt
      );

      // 验证默认值
      expect(context.sessionIds).toEqual([]);
      expect(context.sharedStateIds).toEqual([]);
      expect(context.configuration).toEqual({});
      expect(context.metadata).toEqual({});
    });
  });

  describe('activate', () => {
    it('应该成功激活暂停的Context', async () => {
      // 准备测试数据
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        EntityStatus.SUSPENDED,
        contextData.createdAt,
        contextData.updatedAt
      );

      const originalUpdatedAt = context.updatedAt.getTime();

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      const result = context.activate();

      // 验证结果
      expect(result).toBe(true);
      expect(context.status).toBe(EntityStatus.ACTIVE);
      expect(context.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });

    it('应该不激活已经活跃的Context', () => {
      // 准备测试数据
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        EntityStatus.ACTIVE,
        contextData.createdAt,
        contextData.updatedAt
      );

      const originalUpdatedAt = context.updatedAt;

      // 执行测试
      const result = context.activate();

      // 验证结果
      expect(result).toBe(false);
      expect(context.status).toBe(EntityStatus.ACTIVE);
      expect(context.updatedAt).toEqual(originalUpdatedAt);
    });

    it('应该测试所有状态的激活行为', async () => {
      const statusTests = [
        {
          name: '从SUSPENDED激活',
          initialStatus: EntityStatus.SUSPENDED,
          expectedResult: true,
          expectedFinalStatus: EntityStatus.ACTIVE
        },
        {
          name: '从ACTIVE激活',
          initialStatus: EntityStatus.ACTIVE,
          expectedResult: false,
          expectedFinalStatus: EntityStatus.ACTIVE
        },
        {
          name: '从INACTIVE激活',
          initialStatus: EntityStatus.INACTIVE,
          expectedResult: false,
          expectedFinalStatus: EntityStatus.INACTIVE
        }
      ];

      await TestHelpers.BranchCoverage.testAllBranches(
        statusTests,
        (testCase) => {
          const context = new Context(
            contextData.contextId,
            contextData.name,
            contextData.description,
            contextData.lifecycleStage,
            testCase.initialStatus,
            contextData.createdAt,
            contextData.updatedAt
          );

          const result = context.activate();
          
          expect(result).toBe(testCase.expectedResult);
          expect(context.status).toBe(testCase.expectedFinalStatus);
        }
      );
    });
  });

  describe('suspend', () => {
    it('应该成功暂停活跃的Context', async () => {
      // 准备测试数据
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        EntityStatus.ACTIVE,
        contextData.createdAt,
        contextData.updatedAt
      );

      const originalUpdatedAt = context.updatedAt.getTime();

      // 等待足够时间确保时间差异
      await TestHelpers.Async.wait(10);

      // 执行测试
      const result = context.suspend();

      // 验证结果
      expect(result).toBe(true);
      expect(context.status).toBe(EntityStatus.SUSPENDED);
      expect(context.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });

    it('应该不暂停已经暂停的Context', () => {
      // 准备测试数据
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        EntityStatus.SUSPENDED,
        contextData.createdAt,
        contextData.updatedAt
      );

      const originalUpdatedAt = context.updatedAt;

      // 执行测试
      const result = context.suspend();

      // 验证结果
      expect(result).toBe(false);
      expect(context.status).toBe(EntityStatus.SUSPENDED);
      expect(context.updatedAt).toEqual(originalUpdatedAt);
    });
  });

  describe('addSessionId', () => {
    it('应该成功添加新的SessionId', () => {
      // 准备测试数据
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        contextData.status,
        contextData.createdAt,
        contextData.updatedAt,
        []
      );

      const sessionId = TestDataFactory.Base.generateUUID();

      // 执行测试
      context.addSessionId(sessionId);

      // 验证结果
      expect(context.sessionIds).toContain(sessionId);
      expect(context.sessionIds.length).toBe(1);
    });

    it('应该不添加重复的SessionId', () => {
      // 准备测试数据
      const sessionId = TestDataFactory.Base.generateUUID();
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        contextData.status,
        contextData.createdAt,
        contextData.updatedAt,
        [sessionId]
      );

      // 执行测试
      context.addSessionId(sessionId);

      // 验证结果
      expect(context.sessionIds).toContain(sessionId);
      expect(context.sessionIds.length).toBe(1);
    });
  });

  describe('removeSessionId', () => {
    it('应该成功移除存在的SessionId', () => {
      // 准备测试数据
      const sessionId = TestDataFactory.Base.generateUUID();
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        contextData.status,
        contextData.createdAt,
        contextData.updatedAt,
        [sessionId]
      );

      // 执行测试
      const result = context.removeSessionId(sessionId);

      // 验证结果
      expect(result).toBe(true);
      expect(context.sessionIds).not.toContain(sessionId);
      expect(context.sessionIds.length).toBe(0);
    });

    it('应该处理移除不存在的SessionId', () => {
      // 准备测试数据
      const sessionId = TestDataFactory.Base.generateUUID();
      const nonExistentSessionId = TestDataFactory.Base.generateUUID();
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        contextData.status,
        contextData.createdAt,
        contextData.updatedAt,
        [sessionId]
      );

      // 执行测试
      const result = context.removeSessionId(nonExistentSessionId);

      // 验证结果
      expect(result).toBe(false);
      expect(context.sessionIds).toContain(sessionId);
      expect(context.sessionIds.length).toBe(1);
    });
  });

  describe('updateConfiguration', () => {
    it('应该成功更新配置', async () => {
      // 准备测试数据
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        contextData.status,
        contextData.createdAt,
        contextData.updatedAt,
        [],
        [],
        { existing: 'value' }
      );

      const newConfig = { new: 'configuration', updated: true };
      const originalUpdatedAt = context.updatedAt.getTime();

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      context.updateConfiguration(newConfig);

      // 验证结果
      expect(context.configuration).toEqual({ existing: 'value', ...newConfig });
      expect(context.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });

    it('应该处理空配置更新', () => {
      // 准备测试数据
      const context = new Context(
        contextData.contextId,
        contextData.name,
        contextData.description,
        contextData.lifecycleStage,
        contextData.status,
        contextData.createdAt,
        contextData.updatedAt,
        [],
        [],
        { existing: 'value' }
      );

      const originalConfig = { ...context.configuration };

      // 执行测试
      context.updateConfiguration({});

      // 验证结果
      expect(context.configuration).toEqual(originalConfig);
    });
  });

  describe('状态检查', () => {
    it('应该正确识别活跃状态', () => {
      const statusTests = [
        { status: EntityStatus.ACTIVE, expected: true },
        { status: EntityStatus.SUSPENDED, expected: false },
        { status: EntityStatus.INACTIVE, expected: false }
      ];

      statusTests.forEach(({ status, expected }) => {
        const context = new Context(
          contextData.contextId,
          contextData.name,
          contextData.description,
          contextData.lifecycleStage,
          status,
          contextData.createdAt,
          contextData.updatedAt
        );

        expect(context.status === EntityStatus.ACTIVE).toBe(expected);
      });
    });
  });

  describe('边界条件测试', () => {
    it('应该处理极端值', async () => {
      const boundaryTests = [
        {
          name: '空字符串名称',
          input: { name: '', description: contextData.description, sessionIds: contextData.sessionIds },
          expectedError: undefined
        },
        {
          name: '超长名称',
          input: { name: 'a'.repeat(10000), description: contextData.description, sessionIds: contextData.sessionIds },
          expectedError: undefined
        },
        {
          name: 'null描述',
          input: { name: contextData.name, description: null, sessionIds: contextData.sessionIds },
          expectedError: undefined
        },
        {
          name: '大量SessionIds',
          input: {
            name: contextData.name,
            description: contextData.description,
            sessionIds: Array(1000).fill(0).map(() => TestDataFactory.Base.generateUUID())
          },
          expectedError: undefined
        }
      ];

      await TestHelpers.BranchCoverage.testBoundaryConditions(
        boundaryTests,
        (input) => {
          return new Context(
            contextData.contextId,
            input.name,
            input.description,
            contextData.lifecycleStage,
            contextData.status,
            contextData.createdAt,
            contextData.updatedAt,
            input.sessionIds
          );
        }
      );
    });
  });
});
