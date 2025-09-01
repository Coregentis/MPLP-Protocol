/**
 * Context实体单元测试
 *
 * @description 基于实际接口的ContextEntity测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { ContextEntity } from '../../../../src/modules/context/domain/entities/context.entity';
import { ContextStatus } from '../../../../src/modules/context/types';

describe('ContextEntity测试', () => {

  describe('构造函数和基本属性测试', () => {
    it('应该正确创建Context实体并设置所有属性', () => {
      // 📋 Arrange - 基于实际ContextEntity构造函数
      const contextData = {
        name: 'Test Context',
        description: 'Test context description',
        sharedState: {
          variables: { key1: 'value1', key2: 42 },
          resources: { allocated: {}, requirements: {} },
          dependencies: [],
          goals: []
        }
      };

      // 🎬 Act
      const entity = new ContextEntity(contextData);

      // ✅ Assert - 使用实际的getter属性
      expect(entity.name).toBe('Test Context');
      expect(entity.description).toBe('Test context description');
      expect(entity.status).toBe('active'); // 默认值
      expect(entity.lifecycleStage).toBe('planning'); // 默认值
      expect(entity.protocolVersion).toBe('1.0.0'); // 默认值
      expect(entity.contextId).toBeDefined(); // 自动生成
      expect(entity.timestamp).toBeDefined(); // 自动生成
      expect(entity.sharedState.variables.key1).toBe('value1');
      expect(entity.sharedState.variables.key2).toBe(42);
    });

    it('应该正确处理最小化的Context数据', () => {
      // 📋 Arrange - 最小化数据
      const minimalData = {
        name: 'Minimal Context'
      };

      // 🎬 Act
      const entity = new ContextEntity(minimalData);

      // ✅ Assert
      expect(entity.name).toBe('Minimal Context');
      expect(entity.description).toBeUndefined();
      expect(entity.status).toBe('active'); // 默认值
      expect(entity.lifecycleStage).toBe('planning'); // 默认值
      expect(entity.protocolVersion).toBe('1.0.0'); // 默认值
      expect(entity.contextId).toBeDefined(); // 自动生成
      expect(entity.timestamp).toBeDefined(); // 自动生成
    });
  });

  describe('updateName功能测试', () => {
    let entity: ContextEntity;

    beforeEach(() => {
      entity = new ContextEntity({ name: 'Original Name' });
    });

    it('应该成功更新名称', () => {
      // 🎬 Act
      entity.updateName('New Name');

      // ✅ Assert
      expect(entity.name).toBe('New Name');
    });

    it('应该在名称为空时抛出错误', () => {
      // 🎬 Act & Assert
      expect(() => entity.updateName('')).toThrow('Context name cannot be empty');
      expect(() => entity.updateName('   ')).toThrow('Context name cannot be empty');
    });

    it('应该在名称过长时抛出错误', () => {
      // 📋 Arrange
      const longName = 'a'.repeat(256);

      // 🎬 Act & Assert
      expect(() => entity.updateName(longName)).toThrow('Context name cannot exceed 255 characters');
    });
  });

  describe('updateDescription功能测试', () => {
    let entity: ContextEntity;

    beforeEach(() => {
      entity = new ContextEntity({ name: 'Test Context' });
    });

    it('应该成功更新描述', () => {
      // 🎬 Act
      entity.updateDescription('New description');

      // ✅ Assert
      expect(entity.description).toBe('New description');
    });

    it('应该允许设置为undefined', () => {
      // 🎬 Act
      entity.updateDescription(undefined);

      // ✅ Assert
      expect(entity.description).toBeUndefined();
    });

    it('应该在描述过长时抛出错误', () => {
      // 📋 Arrange
      const longDescription = 'a'.repeat(1001);

      // 🎬 Act & Assert
      expect(() => entity.updateDescription(longDescription)).toThrow('Context description cannot exceed 1000 characters');
    });
  });

  describe('changeStatus功能测试', () => {
    let entity: ContextEntity;

    beforeEach(() => {
      entity = new ContextEntity({ name: 'Status Test Context' });
    });

    it('应该成功更新状态', () => {
      // 🎬 Act
      entity.changeStatus('suspended');

      // ✅ Assert
      expect(entity.status).toBe('suspended');
    });

    it('应该验证状态转换的有效性', () => {
      // 📋 Arrange - 设置为completed状态
      entity.changeStatus('completed');

      // 🎬 Act & Assert - 从completed不能转换到active
      expect(() => entity.changeStatus('active')).toThrow('Invalid status transition from completed to active');
    });
  });

  describe('canBeDeleted功能测试', () => {
    it('应该在completed状态时允许删除', () => {
      // 📋 Arrange
      const entity = new ContextEntity({
        name: 'Delete Test Context',
        status: 'completed' as ContextStatus
      });

      // 🎬 Act
      const canDelete = entity.canBeDeleted();

      // ✅ Assert
      expect(canDelete).toBe(true);
    });

    it('应该在active状态时不允许删除', () => {
      // 📋 Arrange
      const entity = new ContextEntity({
        name: 'No Delete Test Context',
        status: 'active' as ContextStatus
      });

      // 🎬 Act
      const canDelete = entity.canBeDeleted();

      // ✅ Assert
      expect(canDelete).toBe(false);
    });
  });
});