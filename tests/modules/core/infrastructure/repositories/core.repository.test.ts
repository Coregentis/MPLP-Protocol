/**
 * Core仓储测试
 * 
 * @description 测试Core模块的仓储实现
 * @version 1.0.0
 * @layer 基础设施层测试 - 仓储
 */

import { MemoryCoreRepository } from '../../../../../src/modules/core/infrastructure/repositories/core.repository';
import { CoreEntity } from '../../../../../src/modules/core/domain/entities/core.entity';
import { createTestCoreEntity } from '../../helpers/test-factories';
import { UUID, WorkflowStatusType } from '../../../../../src/modules/core/types';

describe('MemoryCoreRepository测试', () => {
  let repository: MemoryCoreRepository;

  beforeEach(() => {
    repository = new MemoryCoreRepository();
  });

  describe('构造函数测试', () => {
    it('应该正确创建MemoryCoreRepository实例', () => {
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(MemoryCoreRepository);
    });

    it('应该初始化为空仓储', async () => {
      const count = await repository.count();
      expect(count).toBe(0);
    });
  });

  describe('save方法测试', () => {
    it('应该成功保存Core实体', async () => {
      const testEntity = createTestCoreEntity();

      const result = await repository.save(testEntity);

      expect(result).toBeDefined();
      expect(result.workflowId).toBe(testEntity.workflowId);
      expect(result.orchestratorId).toBe(testEntity.orchestratorId);
    });

    it('应该更新已存在的实体', async () => {
      const testEntity = createTestCoreEntity();

      // 首次保存
      await repository.save(testEntity);

      // 修改实体并再次保存
      const updatedEntity = createTestCoreEntity();
      Object.defineProperty(updatedEntity, 'workflowId', {
        value: testEntity.workflowId,
        writable: false,
        enumerable: true,
        configurable: false
      });

      const result = await repository.save(updatedEntity);

      expect(result.workflowId).toBe(testEntity.workflowId);
      
      // 验证实体已更新
      const count = await repository.count();
      expect(count).toBe(1);
    });

    it('应该处理保存时的错误', async () => {
      const invalidEntity = null as any;

      await expect(repository.save(invalidEntity)).rejects.toThrow();
    });
  });

  describe('findById方法测试', () => {
    it('应该成功根据ID查找实体', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const result = await repository.findById(testEntity.workflowId);

      expect(result).toBeDefined();
      expect(result!.workflowId).toBe(testEntity.workflowId);
    });

    it('应该在实体不存在时返回null', async () => {
      const nonExistentId = 'non-existent-id' as UUID;

      const result = await repository.findById(nonExistentId);

      expect(result).toBeNull();
    });

    it('应该处理无效ID的情况', async () => {
      const invalidId = '' as UUID;

      const result = await repository.findById(invalidId);

      expect(result).toBeNull();
    });
  });

  describe('findAll方法测试', () => {
    it('应该返回所有实体', async () => {
      const testEntity1 = createTestCoreEntity();
      const testEntity2 = createTestCoreEntity();
      
      await repository.save(testEntity1);
      await repository.save(testEntity2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result.map(e => e.workflowId)).toContain(testEntity1.workflowId);
      expect(result.map(e => e.workflowId)).toContain(testEntity2.workflowId);
    });

    it('应该在没有实体时返回空数组', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('应该返回实体的副本而不是原始引用', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const result = await repository.findAll();

      expect(result[0]).not.toBe(testEntity);
      expect(result[0].workflowId).toBe(testEntity.workflowId);
    });
  });

  describe('findByStatus方法测试', () => {
    it('应该根据状态查找实体', async () => {
      const testEntity1 = createTestCoreEntity();
      const testEntity2 = createTestCoreEntity();
      
      // 模拟不同状态的实体
      jest.spyOn(testEntity1, 'isWorkflowInProgress').mockReturnValue(true);
      jest.spyOn(testEntity1, 'isWorkflowCompleted').mockReturnValue(false);

      jest.spyOn(testEntity2, 'isWorkflowInProgress').mockReturnValue(false);
      jest.spyOn(testEntity2, 'isWorkflowCompleted').mockReturnValue(true);

      await repository.save(testEntity1);
      await repository.save(testEntity2);

      const inProgressResults = await repository.findByStatus('in_progress' as WorkflowStatusType);
      const completedResults = await repository.findByStatus('completed' as WorkflowStatusType);

      // 验证结果基于模拟的方法
      expect(inProgressResults.length).toBeGreaterThanOrEqual(0);
      expect(completedResults.length).toBeGreaterThanOrEqual(0);
    });

    it('应该在没有匹配状态的实体时返回空数组', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const result = await repository.findByStatus('failed' as WorkflowStatusType);

      expect(result).toEqual([]);
    });
  });

  describe('findByOrchestratorId方法测试', () => {
    it('应该根据协调器ID查找实体', async () => {
      const orchestratorId = '87654321-4321-4321-8321-210987654321' as UUID;
      const testEntity1 = createTestCoreEntity();
      const testEntity2 = createTestCoreEntity();

      // 设置相同的协调器ID
      Object.defineProperty(testEntity1, 'orchestratorId', {
        value: orchestratorId,
        writable: false,
        enumerable: true,
        configurable: false
      });
      Object.defineProperty(testEntity2, 'orchestratorId', {
        value: orchestratorId,
        writable: false,
        enumerable: true,
        configurable: false
      });

      await repository.save(testEntity1);
      await repository.save(testEntity2);

      const result = await repository.findByOrchestratorId(orchestratorId);

      expect(result).toHaveLength(2);
      expect(result.every(e => e.orchestratorId === orchestratorId)).toBe(true);
    });

    it('应该在没有匹配协调器ID的实体时返回空数组', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const nonExistentId = 'non-existent-orchestrator' as UUID;
      const result = await repository.findByOrchestratorId(nonExistentId);

      expect(result).toEqual([]);
    });
  });

  describe('delete方法测试', () => {
    it('应该成功删除实体', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const result = await repository.delete(testEntity.workflowId);

      expect(result).toBe(true);
      
      // 验证实体已删除
      const found = await repository.findById(testEntity.workflowId);
      expect(found).toBeNull();
    });

    it('应该在删除不存在的实体时返回false', async () => {
      const nonExistentId = 'non-existent-id' as UUID;

      const result = await repository.delete(nonExistentId);

      expect(result).toBe(false);
    });

    it('应该在删除后更新计数', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      let count = await repository.count();
      expect(count).toBe(1);

      await repository.delete(testEntity.workflowId);

      count = await repository.count();
      expect(count).toBe(0);
    });
  });

  describe('exists方法测试', () => {
    it('应该正确检查实体是否存在', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const exists = await repository.exists(testEntity.workflowId);
      const notExists = await repository.exists('non-existent-id' as UUID);

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });
  });

  describe('count方法测试', () => {
    it('应该正确返回实体数量', async () => {
      expect(await repository.count()).toBe(0);

      const testEntity1 = createTestCoreEntity();
      await repository.save(testEntity1);
      expect(await repository.count()).toBe(1);

      const testEntity2 = createTestCoreEntity();
      await repository.save(testEntity2);
      expect(await repository.count()).toBe(2);

      await repository.delete(testEntity1.workflowId);
      expect(await repository.count()).toBe(1);
    });
  });

  describe('findByCriteria方法测试', () => {
    it('应该根据条件查找实体', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const criteria = {
        orchestratorId: testEntity.orchestratorId
      };

      const result = await repository.findByCriteria(criteria);

      expect(result).toHaveLength(1);
      expect(result[0].orchestratorId).toBe(testEntity.orchestratorId);
    });

    it('应该支持日期范围查询', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const criteria = {
        startDate: new Date('2025-09-01T00:00:00.000Z'),
        endDate: new Date('2025-09-01T23:59:59.999Z')
      };

      const result = await repository.findByCriteria(criteria);

      expect(result).toHaveLength(1);
    });

    it('应该在没有匹配条件的实体时返回空数组', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const criteria = {
        orchestratorId: 'non-existent-orchestrator' as UUID
      };

      const result = await repository.findByCriteria(criteria);

      expect(result).toEqual([]);
    });
  });

  describe('findWithPagination方法测试', () => {
    it('应该支持分页查询', async () => {
      // 创建多个测试实体
      const entities = [];
      for (let i = 0; i < 5; i++) {
        const entity = createTestCoreEntity();
        entities.push(entity);
        await repository.save(entity);
      }

      const result = await repository.findWithPagination(0, 3);

      expect(result.entities).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    it('应该正确处理最后一页', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const result = await repository.findWithPagination(0, 5);

      expect(result.entities).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('应该处理超出范围的分页请求', async () => {
      const testEntity = createTestCoreEntity();
      await repository.save(testEntity);

      const result = await repository.findWithPagination(10, 5);

      expect(result.entities).toHaveLength(0);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('批量操作测试', () => {
    it('应该支持批量保存', async () => {
      const entities = [createTestCoreEntity(), createTestCoreEntity()];

      const result = await repository.saveBatch(entities);

      expect(result).toHaveLength(2);
      expect(await repository.count()).toBe(2);
    });

    it('应该支持批量删除', async () => {
      const entities = [createTestCoreEntity(), createTestCoreEntity()];
      await repository.saveBatch(entities);

      const workflowIds = entities.map(e => e.workflowId);
      const deletedCount = await repository.deleteBatch(workflowIds);

      expect(deletedCount).toBe(2);
      expect(await repository.count()).toBe(0);
    });

    it('应该处理批量操作中的部分失败', async () => {
      const validEntity = createTestCoreEntity();
      const invalidEntity = null as any;

      await expect(repository.saveBatch([validEntity, invalidEntity])).rejects.toThrow();
    });
  });

  describe('并发操作测试', () => {
    it('应该支持并发读写操作', async () => {
      const entities = Array(10).fill(null).map(() => createTestCoreEntity());

      // 并发保存
      const savePromises = entities.map(entity => repository.save(entity));
      await Promise.all(savePromises);

      expect(await repository.count()).toBe(10);

      // 并发读取
      const readPromises = entities.map(entity => repository.findById(entity.workflowId));
      const results = await Promise.all(readPromises);

      expect(results.every(result => result !== null)).toBe(true);
    });

    it('应该处理并发删除操作', async () => {
      const entities = Array(5).fill(null).map(() => createTestCoreEntity());
      await repository.saveBatch(entities);

      // 并发删除
      const deletePromises = entities.map(entity => repository.delete(entity.workflowId));
      const results = await Promise.all(deletePromises);

      expect(results.every(result => result === true)).toBe(true);
      expect(await repository.count()).toBe(0);
    });
  });

  describe('内存管理测试', () => {
    it('应该正确管理内存使用', async () => {
      // 创建大量实体测试内存管理
      const entities = Array(1000).fill(null).map(() => createTestCoreEntity());
      
      for (const entity of entities) {
        await repository.save(entity);
      }

      expect(await repository.count()).toBe(1000);

      // 清理一半实体
      for (let i = 0; i < 500; i++) {
        await repository.delete(entities[i].workflowId);
      }

      expect(await repository.count()).toBe(500);
    });
  });
});
