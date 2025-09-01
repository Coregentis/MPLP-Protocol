/**
 * Confirm仓库测试
 * 
 * @description 测试MemoryConfirmRepository的数据存储和检索功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { MemoryConfirmRepository } from '../../../src/modules/confirm/infrastructure/repositories/confirm.repository';
import { ConfirmEntity } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import { ConfirmQueryFilter, UUID } from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData } from './test-data-factory';

describe('MemoryConfirmRepository测试', () => {
  let repository: MemoryConfirmRepository;
  let mockConfirmEntity: ConfirmEntity;

  beforeEach(() => {
    repository = new MemoryConfirmRepository();

    const mockData = createMockConfirmEntityData();

    mockConfirmEntity = new ConfirmEntity(mockData);
  });

  describe('create方法测试', () => {
    it('应该成功创建确认实体', async () => {
      const result = await repository.create(mockConfirmEntity);

      expect(result).toEqual(mockConfirmEntity);
      expect(result.confirmId).toBe('confirm-test-001');
    });

    it('应该能够创建多个确认实体', async () => {
      // 首次创建
      await repository.create(mockConfirmEntity);

      // 创建第二个实体
      const secondData = createMockConfirmEntityData({
        confirmId: 'confirm-test-002'
      });
      const secondEntity = new ConfirmEntity(secondData);

      const result = await repository.create(secondEntity);

      expect(result.confirmId).toBe('confirm-test-002');
    });
  });

  describe('findById方法测试', () => {
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
  });

  describe('findAll方法测试', () => {
    it('应该返回所有确认实体', async () => {
      await repository.create(mockConfirmEntity);

      // 创建第二个实体
      const secondData = createMockConfirmEntityData({
        confirmId: 'confirm-test-002'
      });
      const secondEntity = new ConfirmEntity(secondData);
      await repository.create(secondEntity);

      const result = await repository.findAll();

      expect(result.items).toHaveLength(2);
      expect(result.items.map(c => c.confirmId)).toContain('confirm-test-001');
      expect(result.items.map(c => c.confirmId)).toContain('confirm-test-002');
      expect(result.total).toBe(2);
    });

    it('应该支持分页', async () => {
      // 保存多个实体
      for (let i = 1; i <= 5; i++) {
        const entityData = createMockConfirmEntityData({
          confirmId: `confirm-test-${i.toString().padStart(3, '0')}`
        });
        const entity = new ConfirmEntity(entityData);
        await repository.create(entity);
      }

      const result = await repository.findAll({ page: 1, limit: 3 });

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.hasNext).toBe(true);
    });

    it('应该返回空结果当没有数据', async () => {
      const result = await repository.findAll();

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findByFilter方法测试', () => {
    beforeEach(async () => {
      // 准备测试数据
      await repository.create(mockConfirmEntity);
      
      const approvedEntity = new ConfirmEntity({
        ...mockConfirmEntity.toEntityData(),
        confirmId: 'confirm-test-002' as UUID,
        status: 'approved',
        priority: 'medium'
      });
      await repository.create(approvedEntity);

      const rejectedEntity = new ConfirmEntity({
        ...mockConfirmEntity.toEntityData(),
        confirmId: 'confirm-test-003' as UUID,
        status: 'rejected',
        priority: 'low'
      });
      await repository.create(rejectedEntity);
    });

    it('应该按状态过滤', async () => {
      const filter: ConfirmQueryFilter = { status: 'pending' };
      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('pending');
    });

    it('应该按优先级过滤', async () => {
      const filter: ConfirmQueryFilter = { priority: 'high' };
      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].priority).toBe('high');
    });

    it('应该按确认类型过滤', async () => {
      const filter: ConfirmQueryFilter = { confirmationType: 'approval' };
      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(3); // 所有测试数据都是approval类型
    });

    it('应该支持多条件过滤', async () => {
      const filter: ConfirmQueryFilter = { 
        status: 'approved',
        priority: 'medium'
      };
      const result = await repository.findByFilter(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('approved');
      expect(result.items[0].priority).toBe('medium');
    });

    it('应该支持分页过滤', async () => {
      const filter: ConfirmQueryFilter = {};
      const pagination = { page: 1, limit: 2 };
      const result = await repository.findByFilter(filter, pagination);

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.hasNext).toBe(true);
    });

    it('应该返回空数组当没有匹配的数据', async () => {
      const filter: ConfirmQueryFilter = { status: 'cancelled' };
      const result = await repository.findByFilter(filter);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('update方法测试', () => {
    it('应该成功更新确认实体', async () => {
      // 先创建实体
      await repository.create(mockConfirmEntity);

      const updates = { status: 'approved' as any };
      const result = await repository.update(mockConfirmEntity.confirmId, updates);

      expect(result.status).toBe('approved');
    });

    it('应该抛出错误当实体不存在', async () => {
      const updates = { status: 'approved' as any };
      await expect(repository.update('non-existent-id' as UUID, updates)).rejects.toThrow(
        'Confirm with ID non-existent-id not found'
      );
    });
  });

  describe('delete方法测试', () => {
    it('应该成功删除确认实体', async () => {
      await repository.create(mockConfirmEntity);
      
      await repository.delete('confirm-test-001' as UUID);
      
      const result = await repository.findById('confirm-test-001' as UUID);
      expect(result).toBeNull();
    });

    it('应该抛出错误当实体不存在', async () => {
      await expect(repository.delete('non-existent' as UUID)).rejects.toThrow(
        'Confirm with ID non-existent not found'
      );
    });
  });

  describe('exists方法测试', () => {
    it('应该返回true当确认实体存在', async () => {
      await repository.create(mockConfirmEntity);

      const result = await repository.exists('confirm-test-001' as UUID);

      expect(result).toBe(true);
    });

    it('应该返回false当确认实体不存在', async () => {
      const result = await repository.exists('non-existent' as UUID);

      expect(result).toBe(false);
    });
  });

  describe('并发操作测试', () => {
    it('应该正确处理并发保存操作', async () => {
      const entities = [];
      for (let i = 1; i <= 10; i++) {
        const entity = new ConfirmEntity({
          ...mockConfirmEntity.toEntityData(),
          confirmId: `confirm-test-${i.toString().padStart(3, '0')}` as UUID
        });
        entities.push(entity);
      }

      // 并发保存
      const promises = entities.map(entity => repository.create(entity));
      await Promise.all(promises);

      const result = await repository.findAll();
      expect(result.items).toHaveLength(10);
      expect(result.total).toBe(10);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内处理大量数据', async () => {
      const startTime = Date.now();
      
      // 保存1000个实体
      for (let i = 1; i <= 1000; i++) {
        const entity = new ConfirmEntity({
          ...mockConfirmEntity.toEntityData(),
          confirmId: `confirm-test-${i.toString().padStart(4, '0')}` as UUID
        });
        await repository.create(entity);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
    });
  });
});
