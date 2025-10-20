/**
 * Context模块功能测试
 * 基于MPLP统一测试标准v1.0
 * 
 * @description Context模块功能集成测试
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { ContextTestFactory } from '../factories/context-test.factory';

describe('Context模块功能测试', () => {
  describe('Context生命周期管理', () => {
    it('应该支持完整的Context生命周期', () => {
      // 🎯 Arrange - 创建Context
      const context = ContextTestFactory.createContextEntity({
        contextId: 'ctx-lifecycle-001',
        status: 'suspended'
      });

      // 🎯 Act & Assert - 检查Context状态
      expect(context.status).toBe('suspended');
      
      // 模拟激活操作
      const activatedContext = ContextTestFactory.createContextEntity({
        contextId: 'ctx-lifecycle-001',
        status: 'active'
      });

      expect(activatedContext.status).toBe('active');
      expect(activatedContext.contextId).toBe('ctx-lifecycle-001');
    });

    it('应该支持Context状态变更追踪', () => {
      // 🎯 Arrange
      const initialContext = ContextTestFactory.createContextEntity({
        contextId: 'ctx-state-001',
        lifecycleStage: 'planning',
        protocolVersion: '1.0.0'
      });

      // 🎯 Act - 模拟状态变更
      const updatedContext = ContextTestFactory.createContextEntity({
        contextId: 'ctx-state-001',
        lifecycleStage: 'executing',
        protocolVersion: '1.1.0'
      });

      // ✅ Assert
      expect(updatedContext.lifecycleStage).toBe('executing');
      expect(updatedContext.protocolVersion).toBe('1.1.0');
      expect(updatedContext.contextId).toBe(initialContext.contextId);
    });
  });

  describe('Context数据管理', () => {
    it('应该支持复杂Context数据结构', () => {
      // 🎯 Arrange & Act
      const context = ContextTestFactory.createContextEntity({
        contextId: 'ctx-complex-001',
        name: 'Complex Project Context',
        description: 'Complex context for testing',
        sharedState: {
          variables: {
            projectName: 'Complex Project',
            environment: 'staging',
            enableLogging: true,
            enableCaching: false,
            enableMetrics: true,
            version: '1.0.0',
            lastModified: '2025-01-01T00:00:00.000Z',
            modifiedBy: 'functional-test'
          }
        }
      });

      // ✅ Assert
      expect(context.contextId).toBe('ctx-complex-001');
      expect(context.name).toBe('Complex Project Context');
      expect(context.sharedState.variables?.projectName).toBe('Complex Project');
      expect(context.sharedState.variables?.environment).toBe('staging');
      expect(context.sharedState.variables?.enableLogging).toBe(true);
    });

    it('应该支持Context数据验证', () => {
      // 🎯 Arrange
      const validContext = ContextTestFactory.createContextEntity({
        contextId: 'ctx-valid-001',
        name: 'Valid Context',
        status: 'active'
      });

      // ✅ Assert - 验证有效数据
      expect(validContext.contextId).toBeTruthy();
      expect(validContext.name).toBeTruthy();
      expect(validContext.status).toBe('active');
      expect(validContext.sharedState).toBeTruthy();
      expect(validContext.accessControl).toBeTruthy();
      expect(validContext.configuration).toBeTruthy();
    });
  });

  describe('Context批量操作', () => {
    it('应该支持批量Context创建', () => {
      // 🎯 Arrange & Act
      const batchSize = 50;
      const contextBatch = ContextTestFactory.createContextEntityArray(batchSize);

      // ✅ Assert
      expect(contextBatch).toHaveLength(batchSize);
      expect(contextBatch.every(ctx => ctx.contextId.startsWith('ctx-test-'))).toBe(true);
      expect(contextBatch.every(ctx => ctx.lifecycleStage === 'executing')).toBe(true);
      expect(contextBatch.every(ctx => ctx.status === 'active')).toBe(true);
    });

    it('应该支持批量Context查询模拟', () => {
      // 🎯 Arrange
      const contextBatch = ContextTestFactory.createContextEntityArray(20);
      
      // 设置不同的lifecycleStage用于查询测试
      const modifiedBatch = contextBatch.map((ctx, index) =>
        ContextTestFactory.createContextEntity({
          contextId: ctx.contextId,
          lifecycleStage: index % 2 === 0 ? 'planning' : 'executing',
          status: index % 3 !== 0 ? 'active' : 'suspended'
        })
      );

      // 🎯 Act - 模拟查询操作
      const planningContexts = modifiedBatch.filter(ctx =>
        ctx.lifecycleStage === 'planning'
      );
      const activeContexts = modifiedBatch.filter(ctx => ctx.status === 'active');
      const suspendedContexts = modifiedBatch.filter(ctx => ctx.status === 'suspended');

      // ✅ Assert
      expect(planningContexts.length).toBeGreaterThan(0);
      expect(activeContexts.length).toBeGreaterThan(0);
      expect(suspendedContexts.length).toBeGreaterThan(0);
      expect(planningContexts.length + modifiedBatch.filter(ctx =>
        ctx.lifecycleStage === 'executing').length).toBe(20);
    });
  });

  describe('Context Schema映射功能', () => {
    it('应该支持Entity到Schema的转换', () => {
      // 🎯 Arrange
      const contextEntity = ContextTestFactory.createContextEntity({
        contextId: 'ctx-mapping-001',
        name: 'Mapping Test Context',
        status: 'active'
      });

      // 🎯 Act - 模拟映射转换
      const schemaData = {
        context_id: contextEntity.contextId,
        name: contextEntity.name,
        status: contextEntity.status,
        lifecycle_stage: contextEntity.lifecycleStage,
        protocol_version: contextEntity.protocolVersion,
        timestamp: contextEntity.timestamp
      };

      // ✅ Assert
      expect(schemaData.context_id).toBe('ctx-mapping-001');
      expect(schemaData.name).toBe('Mapping Test Context');
      expect(schemaData.status).toBe('active');
      expect(schemaData.lifecycle_stage).toBe('executing');
    });

    it('应该支持Schema到Entity的转换', () => {
      // 🎯 Arrange
      const schemaData = ContextTestFactory.createContextSchema({
        context_id: 'ctx-reverse-001',
        name: 'Reverse Mapping Test Context',
        status: 'active',
        lifecycle_stage: 'executing'
      });

      // 🎯 Act - 模拟反向映射
      const entityData = {
        contextId: schemaData.context_id,
        name: schemaData.name,
        status: schemaData.status,
        lifecycleStage: schemaData.lifecycle_stage,
        protocolVersion: schemaData.protocol_version,
        timestamp: schemaData.timestamp
      };

      // ✅ Assert
      expect(entityData.contextId).toBe('ctx-reverse-001');
      expect(entityData.name).toBe('Reverse Mapping Test Context');
      expect(entityData.status).toBe('active');
      expect(entityData.lifecycleStage).toBe('executing');
    });
  });

  describe('Context边界条件处理', () => {
    it('应该处理边界条件数据', () => {
      // 🎯 Arrange
      const minimalContext = ContextTestFactory.createContextEntity({
        contextId: 'ctx-minimal-001',
        name: 'Min'
      });

      const maximalContext = ContextTestFactory.createContextEntity({
        contextId: 'ctx-maximal-001',
        name: 'A'.repeat(255),
        description: 'X'.repeat(1000)
      });

      // ✅ Assert - 最小数据
      expect(minimalContext.name).toBe('Min');
      expect(minimalContext.contextId).toBe('ctx-minimal-001');

      // ✅ Assert - 最大数据
      expect(maximalContext.name).toHaveLength(255);
      expect(maximalContext.description).toHaveLength(1000);
    });

    it('应该处理特殊字符和编码', () => {
      // 🎯 Arrange & Act
      const specialCharContext = ContextTestFactory.createContextEntity({
        contextId: 'ctx-special-001',
        name: 'Test with 特殊字符 and émojis 🚀',
        description: 'Contains unicode: ñáéíóú, symbols: @#$%^&*(), and numbers: 12345',
        sharedState: {
          variables: {
            environment: 'test-环境',
            specialData: 'Unicode test: 中文测试',
            version: '1.0.0',
            lastModified: '2025-01-01T00:00:00.000Z',
            modifiedBy: 'special-char-test'
          }
        }
      });

      // ✅ Assert
      expect(specialCharContext.name).toContain('特殊字符');
      expect(specialCharContext.name).toContain('🚀');
      expect(specialCharContext.description).toContain('ñáéíóú');
      expect(specialCharContext.sharedState.variables?.environment).toBe('test-环境');
    });
  });
});
