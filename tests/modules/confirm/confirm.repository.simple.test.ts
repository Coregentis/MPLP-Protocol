/**
 * Confirm仓库简化测试
 * 
 * @description 测试MemoryConfirmRepository的基本功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { MemoryConfirmRepository } from '../../../src/modules/confirm/infrastructure/repositories/confirm.repository';
import { ConfirmEntity } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import { ConfirmQueryFilter, UUID } from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData } from './test-data-factory';

describe('MemoryConfirmRepository简化测试', () => {
  let repository: MemoryConfirmRepository;
  let mockConfirmEntity: ConfirmEntity;

  beforeEach(() => {
    repository = new MemoryConfirmRepository();
    const mockData = createMockConfirmEntityData();
    mockConfirmEntity = new ConfirmEntity(mockData);
  });

  describe('基本CRUD操作', () => {
    it('应该成功创建确认实体', async () => {
      const result = await repository.create(mockConfirmEntity);

      expect(result).toEqual(mockConfirmEntity);
      expect(result.confirmId).toBe('confirm-test-001');
    });

    it('应该成功查找存在的确认实体', async () => {
      await repository.create(mockConfirmEntity);

      const result = await repository.findById('confirm-test-001' as UUID);

      expect(result).toBeDefined();
      expect(result?.confirmId).toBe('confirm-test-001');
    });

    it('应该返回null当确认实体不存在', async () => {
      const result = await repository.findById('non-existent' as UUID);

      expect(result).toBeNull();
    });

    it('应该成功更新确认实体', async () => {
      await repository.create(mockConfirmEntity);
      
      const result = await repository.update('confirm-test-001' as UUID, {
        status: 'approved'
      });

      expect(result.status).toBe('approved');
    });

    it('应该抛出错误当更新不存在的实体', async () => {
      await expect(
        repository.update('non-existent' as UUID, { status: 'approved' })
      ).rejects.toThrow('Confirm with ID non-existent not found');
    });

    it('应该成功删除确认实体', async () => {
      await repository.create(mockConfirmEntity);
      
      await repository.delete('confirm-test-001' as UUID);
      
      const result = await repository.findById('confirm-test-001' as UUID);
      expect(result).toBeNull();
    });

    it('应该抛出错误当删除不存在的实体', async () => {
      await expect(
        repository.delete('non-existent' as UUID)
      ).rejects.toThrow('Confirm with ID non-existent not found');
    });
  });

  describe('查询操作', () => {
    beforeEach(async () => {
      // 准备测试数据
      await repository.create(mockConfirmEntity);
      
      const approvedData = createMockConfirmEntityData({
        confirmId: 'confirm-test-002',
        status: 'approved',
        priority: 'medium'
      });
      const approvedEntity = new ConfirmEntity(approvedData);
      await repository.create(approvedEntity);

      const rejectedData = createMockConfirmEntityData({
        confirmId: 'confirm-test-003',
        status: 'rejected',
        priority: 'low'
      });
      const rejectedEntity = new ConfirmEntity(rejectedData);
      await repository.create(rejectedEntity);
    });

    it('应该返回所有确认实体', async () => {
      const result = await repository.findAll();

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.items.map(c => c.confirmId)).toContain('confirm-test-001');
      expect(result.items.map(c => c.confirmId)).toContain('confirm-test-002');
      expect(result.items.map(c => c.confirmId)).toContain('confirm-test-003');
    });

    it('应该支持分页', async () => {
      const result = await repository.findAll({ page: 1, limit: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrevious).toBe(false);
    });

    it('应该按状态过滤', async () => {
      const filter: ConfirmQueryFilter = { status: ['pending'] };
      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('pending');
    });

    it('应该按优先级过滤', async () => {
      const filter: ConfirmQueryFilter = { priority: ['high'] };
      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].priority).toBe('high');
    });

    it('应该支持多条件过滤', async () => {
      const filter: ConfirmQueryFilter = { 
        status: ['approved'],
        priority: ['medium']
      };
      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('approved');
      expect(result.items[0].priority).toBe('medium');
    });

    it('应该返回空结果当没有匹配的数据', async () => {
      const filter: ConfirmQueryFilter = { status: ['cancelled'] };
      const result = await repository.findByFilter(filter);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('边界条件测试', () => {
    it('应该返回空结果当没有数据', async () => {
      const result = await repository.findAll();

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('应该正确处理大量数据', async () => {
      const startTime = Date.now();
      
      // 创建100个实体
      for (let i = 1; i <= 100; i++) {
        const entityData = createMockConfirmEntityData({
          confirmId: `confirm-test-${i.toString().padStart(3, '0')}`
        });
        const entity = new ConfirmEntity(entityData);
        await repository.create(entity);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成

      const result = await repository.findAll();
      expect(result.total).toBe(100);
    });

    it('应该正确处理并发操作', async () => {
      const entities = [];
      for (let i = 1; i <= 10; i++) {
        const entityData = createMockConfirmEntityData({
          confirmId: `confirm-test-${i.toString().padStart(3, '0')}`
        });
        const entity = new ConfirmEntity(entityData);
        entities.push(entity);
      }

      // 并发创建
      const promises = entities.map(entity => repository.create(entity));
      await Promise.all(promises);

      const result = await repository.findAll();
      expect(result.total).toBe(10);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理无效的分页参数', async () => {
      const result = await repository.findAll({ page: -1, limit: -1 });

      // Repository可能不处理无效参数，这是正常的
      expect(result).toBeDefined();
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('应该处理空的过滤条件', async () => {
      const filter: ConfirmQueryFilter = {};
      const result = await repository.findByFilter(filter);
      
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
