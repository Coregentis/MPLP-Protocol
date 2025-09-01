/**
 * Plan模块测试数据工厂
 * 基于MPLP统一测试标准v1.0
 * 
 * @description 提供标准化的Plan测试数据生成
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { PlanEntity } from '../../../../src/modules/plan/domain/entities/plan.entity';
import { PlanStatus, TaskType, TaskStatus, Priority } from '../../../../src/modules/plan/types';
import { UUID, Timestamp } from '../../../../src/shared/types';

export class PlanTestFactory {
  /**
   * 创建标准Plan实体用于测试
   */
  static createPlanEntity(overrides: Partial<any> = {}): PlanEntity {
    const defaultData = {
      // 基础协议字段
      protocolVersion: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z' as Timestamp,
      planId: 'plan-test-001' as UUID,
      contextId: 'ctx-test-001' as UUID,
      name: 'Test Plan',
      description: 'Test plan for unit testing',
      status: 'active' as PlanStatus,

      // 核心功能字段
      tasks: [{
        taskId: 'task-001' as UUID,
        name: 'Test Task',
        description: 'Test task description',
        type: 'atomic' as TaskType,
        status: 'pending' as TaskStatus,
        priority: 'medium' as Priority,
        estimatedDuration: 3600,
        dependencies: [],
        resources: [],
        assignees: [],
        metadata: {
          createdAt: '2025-01-01T00:00:00.000Z' as Timestamp,
          updatedAt: '2025-01-01T00:00:00.000Z' as Timestamp,
          createdBy: 'test-factory',
          tags: ['test']
        }
      }],
      
      milestones: [{
        milestoneId: 'milestone-001' as UUID,
        name: 'Test Milestone',
        description: 'Test milestone description',
        targetDate: '2025-01-31T00:00:00.000Z' as Timestamp,
        status: 'upcoming',
        criteria: ['Complete all test tasks'],
        dependencies: [],
        metadata: {
          createdAt: '2025-01-01T00:00:00.000Z' as Timestamp,
          priority: 'high' as Priority
        }
      }],

      resources: [{
        resourceId: 'resource-001' as UUID,
        name: 'Test Resource',
        type: 'human',
        status: 'available',
        capacity: 100,
        allocation: 50,
        metadata: {
          skills: ['testing'],
          availability: '2025-01-01T00:00:00.000Z'
        }
      }],

      // 企业级功能字段
      auditTrail: {
        enabled: true,
        retentionDays: 90,
        events: []
      },
      
      // 简化的其他字段
      riskAssessment: {},
      performanceMetrics: {},
      integrationPoints: {},
      versionHistory: {},
      collaborationSettings: {},
      notificationSettings: {},
      complianceSettings: {},
      customFields: {}
    };

    return new PlanEntity({ ...defaultData, ...overrides });
  }

  /**
   * 创建Plan Schema格式数据 (snake_case)
   */
  static createPlanSchema(overrides: Partial<any> = {}) {
    const defaultSchema = {
      protocol_version: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z',
      plan_id: 'plan-test-001',
      context_id: 'ctx-test-001',
      name: 'Test Plan',
      description: 'Test plan for unit testing',
      status: 'active',
      tasks: [{
        task_id: 'task-001',
        name: 'Test Task',
        description: 'Test task description',
        type: 'atomic',
        status: 'pending',
        priority: 'medium',
        estimated_duration: 3600,
        dependencies: [],
        resources: [],
        assignees: [],
        metadata: {
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
          created_by: 'test-factory',
          tags: ['test']
        }
      }],
      milestones: [{
        milestone_id: 'milestone-001',
        name: 'Test Milestone',
        description: 'Test milestone description',
        target_date: '2025-01-31T00:00:00.000Z',
        status: 'upcoming',
        criteria: ['Complete all test tasks'],
        dependencies: [],
        metadata: {
          created_at: '2025-01-01T00:00:00.000Z',
          priority: 'high'
        }
      }],
      audit_trail: {
        enabled: true,
        retention_days: 90,
        events: []
      }
    };

    return { ...defaultSchema, ...overrides };
  }

  /**
   * 创建批量Plan实体数组
   */
  static createPlanEntityArray(count: number = 3): PlanEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createPlanEntity({
        planId: `plan-test-${String(index + 1).padStart(3, '0')}` as UUID,
        name: `Test Plan ${index + 1}`,
        contextId: `ctx-test-${String(index + 1).padStart(3, '0')}` as UUID
      })
    );
  }

  /**
   * 创建性能测试用的大量数据
   */
  static createPerformanceTestData(count: number = 1000): PlanEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createPlanEntity({
        planId: `plan-perf-${String(index + 1).padStart(6, '0')}` as UUID,
        name: `Performance Test Plan ${index + 1}`,
        contextId: `ctx-perf-${String(index + 1).padStart(6, '0')}` as UUID
      })
    );
  }

  /**
   * 创建边界条件测试数据
   */
  static createBoundaryTestData() {
    return {
      minimalPlan: this.createPlanEntity({
        name: 'Min',
        tasks: []
      }),
      maximalPlan: this.createPlanEntity({
        name: 'A'.repeat(255),
        description: 'X'.repeat(1000),
        tasks: Array.from({ length: 100 }, (_, i) => ({
          taskId: `task-${i}` as UUID,
          name: `Task ${i}`,
          type: 'atomic' as TaskType,
          status: 'pending' as TaskStatus,
          priority: 'medium' as Priority
        }))
      })
    };
  }
}
