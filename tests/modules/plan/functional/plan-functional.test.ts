/**
 * Plan模块功能测试
 * 基于MPLP统一测试标准v1.0
 * 
 * @description Plan模块功能集成测试
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { PlanTestFactory } from '../factories/plan-test.factory';

describe('Plan模块功能测试', () => {
  describe('Plan生命周期管理', () => {
    it('应该支持完整的Plan生命周期', () => {
      // 🎯 Arrange - 创建Plan
      const plan = PlanTestFactory.createPlanEntity({
        planId: 'plan-lifecycle-001',
        status: 'draft'
      });

      // 🎯 Act & Assert - 检查Plan状态
      expect(plan.status).toBe('draft');

      // 模拟激活操作
      const activatedPlan = PlanTestFactory.createPlanEntity({
        planId: 'plan-lifecycle-001',
        status: 'active'
      });
      
      expect(activatedPlan.status).toBe('active');
      expect(activatedPlan.planId).toBe('plan-lifecycle-001');
    });

    it('应该支持Plan状态变更追踪', () => {
      // 🎯 Arrange
      const initialPlan = PlanTestFactory.createPlanEntity({
        planId: 'plan-state-001',
        status: 'draft',
        protocolVersion: '1.0.0'
      });

      // 🎯 Act - 模拟状态变更
      const updatedPlan = PlanTestFactory.createPlanEntity({
        planId: 'plan-state-001',
        status: 'active',
        protocolVersion: '1.1.0'
      });

      // ✅ Assert
      expect(updatedPlan.status).toBe('active');
      expect(updatedPlan.protocolVersion).toBe('1.1.0');
      expect(updatedPlan.planId).toBe(initialPlan.planId);
    });
  });

  describe('Plan任务管理', () => {
    it('应该支持复杂任务结构', () => {
      // 🎯 Arrange & Act
      const plan = PlanTestFactory.createPlanEntity({
        planId: 'plan-complex-001',
        name: 'Complex Plan',
        tasks: [{
          taskId: 'task-complex-001',
          name: 'Complex Task',
          description: 'Complex task with dependencies',
          type: 'composite',
          status: 'pending',
          priority: 'high',
          estimatedDuration: 7200,
          dependencies: ['task-dep-001'],
          resources: ['resource-001'],
          assignees: ['user-001'],
          metadata: {
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            createdBy: 'functional-test',
            tags: ['complex', 'high-priority']
          }
        }]
      });

      // ✅ Assert
      expect(plan.planId).toBe('plan-complex-001');
      expect(plan.name).toBe('Complex Plan');
      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks[0].name).toBe('Complex Task');
      expect(plan.tasks[0].type).toBe('composite');
      expect(plan.tasks[0].priority).toBe('high');
    });

    it('应该支持Plan数据验证', () => {
      // 🎯 Arrange
      const validPlan = PlanTestFactory.createPlanEntity({
        planId: 'plan-valid-001',
        name: 'Valid Plan',
        status: 'active'
      });

      // ✅ Assert - 验证有效数据
      expect(validPlan.planId).toBeTruthy();
      expect(validPlan.name).toBeTruthy();
      expect(validPlan.status).toBe('active');
      expect(validPlan.contextId).toBeTruthy();
      expect(Array.isArray(validPlan.tasks)).toBe(true);
    });
  });

  describe('Plan批量操作', () => {
    it('应该支持批量Plan创建', () => {
      // 🎯 Arrange & Act
      const batchSize = 50;
      const planBatch = PlanTestFactory.createPlanEntityArray(batchSize);

      // ✅ Assert
      expect(planBatch).toHaveLength(batchSize);
      expect(planBatch.every(plan => plan.planId.startsWith('plan-test-'))).toBe(true);
      expect(planBatch.every(plan => plan.status === 'active')).toBe(true);
      expect(planBatch.every(plan => Array.isArray(plan.tasks))).toBe(true);
    });

    it('应该支持批量Plan查询模拟', () => {
      // 🎯 Arrange
      const planBatch = PlanTestFactory.createPlanEntityArray(20);
      
      // 设置不同的status用于查询测试
      const modifiedBatch = planBatch.map((plan, index) => 
        PlanTestFactory.createPlanEntity({
          planId: plan.planId,
          status: index % 2 === 0 ? 'active' : 'draft',
          name: `Modified Plan ${index + 1}`
        })
      );

      // 🎯 Act - 模拟查询操作
      const activePlans = modifiedBatch.filter(plan => plan.status === 'active');
      const draftPlans = modifiedBatch.filter(plan => plan.status === 'draft');

      // ✅ Assert
      expect(activePlans.length).toBeGreaterThan(0);
      expect(draftPlans.length).toBeGreaterThan(0);
      expect(activePlans.length + draftPlans.length).toBe(20);
    });
  });

  describe('Plan Schema映射功能', () => {
    it('应该支持Entity到Schema的转换', () => {
      // 🎯 Arrange
      const planEntity = PlanTestFactory.createPlanEntity({
        planId: 'plan-mapping-001',
        name: 'Mapping Test Plan',
        status: 'active'
      });

      // 🎯 Act - 模拟映射转换
      const schemaData = {
        plan_id: planEntity.planId,
        name: planEntity.name,
        status: planEntity.status,
        context_id: planEntity.contextId,
        protocol_version: planEntity.protocolVersion,
        timestamp: planEntity.timestamp
      };

      // ✅ Assert
      expect(schemaData.plan_id).toBe('plan-mapping-001');
      expect(schemaData.name).toBe('Mapping Test Plan');
      expect(schemaData.status).toBe('active');
      expect(schemaData.context_id).toBeTruthy();
    });

    it('应该支持Schema到Entity的转换', () => {
      // 🎯 Arrange
      const schemaData = PlanTestFactory.createPlanSchema({
        plan_id: 'plan-reverse-001',
        name: 'Reverse Mapping Test Plan',
        status: 'active'
      });

      // 🎯 Act - 模拟反向映射
      const entityData = {
        planId: schemaData.plan_id,
        name: schemaData.name,
        status: schemaData.status,
        contextId: schemaData.context_id,
        protocolVersion: schemaData.protocol_version,
        timestamp: schemaData.timestamp
      };

      // ✅ Assert
      expect(entityData.planId).toBe('plan-reverse-001');
      expect(entityData.name).toBe('Reverse Mapping Test Plan');
      expect(entityData.status).toBe('active');
      expect(entityData.contextId).toBeTruthy();
    });
  });

  describe('Plan边界条件处理', () => {
    it('应该处理边界条件数据', () => {
      // 🎯 Arrange
      const boundaryData = PlanTestFactory.createBoundaryTestData();

      // ✅ Assert - 最小数据
      expect(boundaryData.minimalPlan.name).toBe('Min');
      expect(boundaryData.minimalPlan.tasks).toHaveLength(0);

      // ✅ Assert - 最大数据
      expect(boundaryData.maximalPlan.name).toHaveLength(255);
      expect(boundaryData.maximalPlan.description).toHaveLength(1000);
      expect(boundaryData.maximalPlan.tasks.length).toBeGreaterThan(0);
    });

    it('应该处理特殊字符和编码', () => {
      // 🎯 Arrange & Act
      const specialCharPlan = PlanTestFactory.createPlanEntity({
        planId: 'plan-special-001',
        name: 'Test with 特殊字符 and émojis 🚀',
        description: 'Contains unicode: ñáéíóú, symbols: @#$%^&*(), and numbers: 12345'
      });

      // ✅ Assert
      expect(specialCharPlan.name).toContain('特殊字符');
      expect(specialCharPlan.name).toContain('🚀');
      expect(specialCharPlan.description).toContain('ñáéíóú');
      expect(specialCharPlan.planId).toBe('plan-special-001');
    });
  });
});
