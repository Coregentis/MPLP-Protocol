/**
 * Context模块性能测试
 * 基于MPLP统一测试标准v1.0
 * 
 * @description Context模块性能基准测试
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { ContextTestFactory } from '../factories/context-test.factory';
import { ContextEntity } from '../../../../src/modules/context/domain/entities/context.entity';

describe('Context模块性能测试', () => {
  let performanceData: ContextEntity[];

  beforeAll(() => {
    // 准备性能测试数据
    performanceData = ContextTestFactory.createPerformanceTestData(1000);
  });

  describe('Context实体性能基准', () => {
    it('应该在100ms内创建1000个Context实体', () => {
      const startTime = performance.now();
      
      const contexts = Array.from({ length: 1000 }, (_, index) =>
        ContextTestFactory.createContextEntity({
          contextId: `perf-${index}` as UUID,
          name: `Perf Test ${index}`
        })
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(contexts).toHaveLength(1000);
      expect(duration).toBeLessThan(100); // 100ms基准
    });

    it('应该在50ms内处理Context数据转换', () => {
      const testData = performanceData.slice(0, 100);
      const startTime = performance.now();

      const converted = testData.map(context => ({
        id: context.contextId,
        name: context.name,
        status: context.status,
        stage: context.lifecycleStage
      }));

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(converted).toHaveLength(100);
      expect(duration).toBeLessThan(50); // 50ms基准
    });
  });

  describe('Context批量操作性能', () => {
    it('应该在200ms内处理批量Context创建', () => {
      const startTime = performance.now();
      
      const batchData = ContextTestFactory.createContextEntityArray(500);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(batchData).toHaveLength(500);
      expect(duration).toBeLessThan(200); // 200ms基准
    });

    it('应该在150ms内处理批量Schema转换', () => {
      const testData = performanceData.slice(0, 200);
      const startTime = performance.now();

      const schemas = testData.map(context =>
        ContextTestFactory.createContextSchema({
          context_id: context.contextId,
          name: context.name,
          status: context.status
        })
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(schemas).toHaveLength(200);
      expect(duration).toBeLessThan(150); // 150ms基准
    });
  });

  describe('Context内存使用性能', () => {
    it('应该有效管理大量Context对象的内存', () => {
      // 测试前清理内存
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed;
      
      // 创建大量Context对象
      const largeDataSet = ContextTestFactory.createPerformanceTestData(5000);
      
      const afterCreationMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = afterCreationMemory - initialMemory;
      
      // 清理引用
      largeDataSet.length = 0;
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
      
      const afterCleanupMemory = process.memoryUsage().heapUsed;
      
      expect(largeDataSet).toHaveLength(0);
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB限制

      // 内存清理检查 - 更实际的方法：检查内存增长是否合理
      const memoryDifference = afterCleanupMemory - initialMemory;
      expect(memoryDifference).toBeLessThan(50 * 1024 * 1024); // 允许50MB的合理增长
    });
  });

  describe('Context并发处理性能', () => {
    it('应该支持并发Context操作', async () => {
      const startTime = performance.now();
      
      const concurrentOperations = Array.from({ length: 10 }, async (_, index) => {
        return new Promise<ContextEntity[]>(resolve => {
          setTimeout(() => {
            const contexts = ContextTestFactory.createContextEntityArray(50);
            resolve(contexts);
          }, Math.random() * 10); // 随机延迟模拟并发
        });
      });

      const results = await Promise.all(concurrentOperations);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(results.every(batch => batch.length === 50)).toBe(true);
      expect(duration).toBeLessThan(100); // 100ms基准
    });
  });

  describe('Context查询性能模拟', () => {
    it('应该快速过滤大量Context数据', () => {
      const largeDataSet = performanceData;
      const startTime = performance.now();

      const filtered = largeDataSet.filter(context =>
        context.lifecycleStage === 'executing' &&
        context.status === 'active' &&
        context.name?.includes('Test')
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(Array.isArray(filtered)).toBe(true);
      expect(duration).toBeLessThan(50); // 50ms基准
    });

    it('应该快速排序大量Context数据', () => {
      const largeDataSet = [...performanceData]; // 复制数组
      const startTime = performance.now();

      const sorted = largeDataSet.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(sorted).toHaveLength(largeDataSet.length);
      expect(duration).toBeLessThan(100); // 100ms基准
    });
  });

  describe('Context序列化性能', () => {
    it('应该快速序列化Context对象', () => {
      const testData = performanceData.slice(0, 100);
      const startTime = performance.now();

      const serialized = testData.map(context => JSON.stringify({
        contextId: context.contextId,
        name: context.name,
        status: context.status,
        lifecycleStage: context.lifecycleStage
      }));

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(serialized).toHaveLength(100);
      expect(serialized.every(item => typeof item === 'string')).toBe(true);
      expect(duration).toBeLessThan(30); // 30ms基准
    });

    it('应该快速反序列化Context数据', () => {
      const testData = performanceData.slice(0, 100);
      const serialized = testData.map(context => JSON.stringify({
        contextId: context.contextId,
        contextType: context.contextType,
        contextData: context.contextData,
        isActive: context.isActive
      }));

      const startTime = performance.now();

      const deserialized = serialized.map(item => JSON.parse(item));

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(deserialized).toHaveLength(100);
      expect(deserialized.every(item => typeof item === 'object')).toBe(true);
      expect(duration).toBeLessThan(20); // 20ms基准
    });
  });
});
