/**
 * Plan模块Schema合规性验证测试
 * 
 * 验证Plan模块所有文件是否完全符合plan-protocol.json Schema定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T18:30:00+08:00
 * @compliance Schema驱动开发验证
 */

import { PlanFactory } from '../modules/plan/plan-factory';
import {
  PlanProtocol,
  PlanStatus,
  PlanTask,
  TaskStatus,
  TaskType,
  PlanDependency,
  DependencyType,
  DependencyCriticality,
  PlanMilestone,
  MilestoneStatus,
  Priority,
  Timeline,
  Duration,
  DurationUnit,
  PlanConfiguration,
  FailureResolver,
  PlanOptimization,
  PlanRiskAssessment,
  CreatePlanRequest,
  PLAN_CONSTANTS
} from '../modules/plan/types';
import {
  isValidPlanStatusTransition,
  isValidTaskStatusTransition,
  validatePlanConfiguration,
  validateFailureResolver,
  createDefaultPlanConfiguration,
  createDefaultFailureResolver,
  createDefaultTimeline,
  validatePlanName,
  isValidUUID,
  isValidTimestamp,
  calculatePlanMemoryUsage,
  generatePlanSummary,
  clonePlan
} from '../modules/plan/utils';

describe('Plan模块Schema合规性验证', () => {
  
  describe('基础类型验证', () => {
    
    test('应该验证Plan状态枚举的完整性', () => {
      const validStatuses: PlanStatus[] = ['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed'];
      
      // 验证所有状态都符合Schema定义
      validStatuses.forEach(status => {
        expect(['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed']).toContain(status);
      });
    });

    test('应该验证Task状态枚举的完整性', () => {
      const validStatuses: TaskStatus[] = ['pending', 'ready', 'running', 'blocked', 'completed', 'failed', 'skipped'];
      
      // 验证所有状态都符合Schema定义
      validStatuses.forEach(status => {
        expect(['pending', 'ready', 'running', 'blocked', 'completed', 'failed', 'skipped']).toContain(status);
      });
    });

    test('应该验证优先级枚举的完整性', () => {
      const validPriorities: Priority[] = ['low', 'medium', 'high', 'critical'];
      
      // 验证所有优先级都符合Schema定义
      validPriorities.forEach(priority => {
        expect(['low', 'medium', 'high', 'critical']).toContain(priority);
      });
    });

    test('应该验证依赖类型枚举的完整性', () => {
      const validTypes: DependencyType[] = ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'];
      
      // 验证所有依赖类型都符合Schema定义
      validTypes.forEach(type => {
        expect(['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish']).toContain(type);
      });
    });

  });

  describe('Schema协议版本验证', () => {
    
    test('应该使用正确的协议版本', () => {
      expect(PLAN_CONSTANTS.PROTOCOL_VERSION).toBe('1.0.1');
    });

    test('应该有正确的默认值', () => {
      expect(PLAN_CONSTANTS.DEFAULT_PRIORITY).toBe('medium');
      expect(PLAN_CONSTANTS.DEFAULT_PLAN_STATUS).toBe('draft');
      expect(PLAN_CONSTANTS.DEFAULT_TASK_STATUS).toBe('pending');
      expect(PLAN_CONSTANTS.DEFAULT_TASK_TYPE).toBe('atomic');
    });

  });

  describe('PlanFactory Schema合规性验证', () => {
    let factory: PlanFactory;

    beforeEach(() => {
      factory = PlanFactory.getInstance();
    });

    test('应该创建符合Schema的Plan对象', () => {
      const request: CreatePlanRequest = {
        context_id: 'context-123',
        name: 'Test Plan',
        description: 'Test Description',
        priority: 'high',
        timeline: {
          estimated_duration: {
            value: 2,
            unit: 'weeks'
          }
        }
      };

      const result = factory.createPlan(request);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      if (result.data) {
        const plan = result.data;
        
        // 验证Schema必需字段
        expect(plan.protocol_version).toBe('1.0.1');
        expect(plan.plan_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        expect(plan.context_id).toBe('context-123');
        expect(plan.name).toBe('Test Plan');
        expect(plan.description).toBe('Test Description');
        expect(plan.status).toBe('draft');
        expect(plan.priority).toBe('high');
        expect(plan.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        
        // 验证复杂对象结构
        expect(plan.timeline).toBeDefined();
        expect(plan.timeline.estimated_duration).toBeDefined();
        expect(plan.timeline.estimated_duration.value).toBe(2);
        expect(plan.timeline.estimated_duration.unit).toBe('weeks');
        
        expect(Array.isArray(plan.tasks)).toBe(true);
        expect(Array.isArray(plan.dependencies)).toBe(true);
        expect(Array.isArray(plan.milestones)).toBe(true);
      }
    });

    test('应该验证创建的Plan对象', () => {
      const request: CreatePlanRequest = {
        context_id: 'invalid-context-id', // 无效的UUID
        name: '',
        priority: 'medium',
        timeline: {
          estimated_duration: {
            value: -1, // 无效值
            unit: 'days'
          }
        }
      };

      const result = factory.createPlan(request);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    test('应该创建符合Schema的Task对象', () => {
      const task = factory.createTask('Test Task', 'atomic', 'high', 'Test task description');
      
      expect(task.task_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(task.name).toBe('Test Task');
      expect(task.type).toBe('atomic');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('high');
      expect(task.description).toBe('Test task description');
    });

    test('应该创建符合Schema的Dependency对象', () => {
      const sourceTaskId = 'task-source-123';
      const targetTaskId = 'task-target-456';
      
      const dependency = factory.createDependency(
        sourceTaskId, 
        targetTaskId, 
        'finish_to_start', 
        'blocking'
      );
      
      expect(dependency.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(dependency.source_task_id).toBe(sourceTaskId);
      expect(dependency.target_task_id).toBe(targetTaskId);
      expect(dependency.dependency_type).toBe('finish_to_start');
      expect(dependency.criticality).toBe('blocking');
    });

    test('应该创建符合Schema的Milestone对象', () => {
      const targetDate = '2025-12-31T23:59:59.999Z';
      
      const milestone = factory.createMilestone(
        'Test Milestone',
        targetDate,
        'Test milestone description'
      );
      
      expect(milestone.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(milestone.name).toBe('Test Milestone');
      expect(milestone.target_date).toBe(targetDate);
      expect(milestone.status).toBe('upcoming');
      expect(milestone.description).toBe('Test milestone description');
      expect(Array.isArray(milestone.success_criteria)).toBe(true);
    });

  });

  describe('工具函数Schema合规性验证', () => {
    
    test('应该正确验证Plan状态转换', () => {
      // 有效转换
      expect(isValidPlanStatusTransition('draft', 'approved')).toBe(true);
      expect(isValidPlanStatusTransition('approved', 'active')).toBe(true);
      expect(isValidPlanStatusTransition('active', 'paused')).toBe(true);
      expect(isValidPlanStatusTransition('active', 'completed')).toBe(true);
      expect(isValidPlanStatusTransition('paused', 'active')).toBe(true);
      expect(isValidPlanStatusTransition('failed', 'draft')).toBe(true);
      
      // 无效转换
      expect(isValidPlanStatusTransition('completed', 'active')).toBe(false);
      expect(isValidPlanStatusTransition('cancelled', 'active')).toBe(false);
      expect(isValidPlanStatusTransition('draft', 'completed')).toBe(false);
    });

    test('应该正确验证Task状态转换', () => {
      // 有效转换
      expect(isValidTaskStatusTransition('pending', 'ready')).toBe(true);
      expect(isValidTaskStatusTransition('ready', 'running')).toBe(true);
      expect(isValidTaskStatusTransition('running', 'completed')).toBe(true);
      expect(isValidTaskStatusTransition('running', 'failed')).toBe(true);
      expect(isValidTaskStatusTransition('blocked', 'ready')).toBe(true);
      expect(isValidTaskStatusTransition('failed', 'pending')).toBe(true);
      
      // 无效转换
      expect(isValidTaskStatusTransition('completed', 'running')).toBe(false);
      expect(isValidTaskStatusTransition('skipped', 'running')).toBe(false);
      expect(isValidTaskStatusTransition('pending', 'completed')).toBe(false);
    });

    test('应该正确验证Plan配置', () => {
      const validConfig = createDefaultPlanConfiguration();
      const result = validatePlanConfiguration(validConfig);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('应该正确验证FailureResolver配置', () => {
      const validResolver = createDefaultFailureResolver();
      const result = validateFailureResolver(validResolver);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('应该正确验证Plan名称', () => {
      expect(validatePlanName('Valid Plan Name').valid).toBe(true);
      expect(validatePlanName('').valid).toBe(false);
      expect(validatePlanName('a'.repeat(256)).valid).toBe(false);
    });

    test('应该正确验证UUID格式', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-31d4-a716-446655440000')).toBe(false); // 版本不对
    });

    test('应该正确验证时间戳格式', () => {
      expect(isValidTimestamp('2025-07-10T18:30:00.000Z')).toBe(true);
      expect(isValidTimestamp('invalid-timestamp')).toBe(false);
      expect(isValidTimestamp('2025-07-10T18:30:00')).toBe(false); // 缺少毫秒和Z
    });

  });

  describe('Schema兼容性集成测试', () => {
    
    test('应该创建完整的Schema兼容Plan并进行转换', () => {
      const factory = PlanFactory.getInstance();
      
      // 创建完整的Plan请求
      const request: CreatePlanRequest = {
        context_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Complete Test Plan',
        description: 'A comprehensive test plan with all features',
        priority: 'critical',
        timeline: {
          start_date: '2025-01-01T00:00:00.000Z',
          end_date: '2025-12-31T23:59:59.999Z',
          estimated_duration: {
            value: 12,
            unit: 'months'
          }
        },
        tasks: [
          {
            name: 'Task 1',
            description: 'First task',
            type: 'atomic',
            priority: 'high',
            estimated_effort: {
              value: 5,
              unit: 'days'
            }
          }
        ],
        dependencies: [
          // 依赖关系将在任务创建后添加
        ],
        milestones: [
          {
            name: 'Milestone 1',
            description: 'First milestone',
            target_date: '2025-06-30T23:59:59.999Z'
          }
        ],
        optimization: {
          strategy: 'time_optimal',
          constraints: {
            max_duration: {
              value: 10,
              unit: 'months'
            }
          }
        },
        risk_assessment: {
          overall_risk_level: 'medium',
          identified_risks: []
        },
        failure_resolver: {
          enabled: true,
          strategies: ['retry', 'rollback'],
          retry_config: {
            max_attempts: 5,
            delay_ms: 2000,
            backoff_factor: 2.0,
            max_delay_ms: 60000
          }
        }
      };

      const result = factory.createPlan(request);
      expect(result.success).toBe(true);
      
      if (result.data) {
        const plan = result.data;
        
        // 验证Plan对象完整性
        const validation = factory.validatePlanProtocol(plan);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toEqual([]);
        
        // 测试Schema转换
        const schemaFormat = factory.toPlanProtocol(plan);
        expect(schemaFormat.protocol_version).toBe('1.0.1');
        expect(schemaFormat.progress_summary).toBeUndefined(); // 运行时字段应被移除
        
        const reconstructed = factory.fromPlanProtocol(schemaFormat);
        expect(reconstructed.progress_summary).toBeDefined(); // 运行时字段应被恢复
        
        // 测试工具函数
        const summary = generatePlanSummary(plan);
        expect(summary.id).toBe(plan.plan_id);
        expect(summary.name).toBe(plan.name);
        expect(summary.status).toBe(plan.status);
        expect(summary.priority).toBe(plan.priority);
        
        const memoryUsage = calculatePlanMemoryUsage(plan);
        expect(memoryUsage).toBeGreaterThan(0);
        
        const cloned = clonePlan(plan);
        expect(cloned).toEqual(plan);
        expect(cloned).not.toBe(plan); // 应该是深拷贝
      }
    });

  });

  describe('错误处理和边界情况验证', () => {
    
    test('应该正确处理无效的Plan数据', () => {
      const factory = PlanFactory.getInstance();
      
      const invalidPlan = {
        protocol_version: '2.0.0', // 错误版本
        timestamp: 'invalid-timestamp',
        plan_id: 'invalid-uuid',
        context_id: 'invalid-context-id',
        name: '', // 空名称
        status: 'invalid-status',
        priority: 'invalid-priority',
        timeline: {
          estimated_duration: {
            value: -1, // 负值
            unit: 'invalid-unit'
          }
        },
        tasks: [],
        dependencies: [],
        milestones: []
      } as unknown as PlanProtocol;

      const validation = factory.validatePlanProtocol(invalidPlan);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      
      // 验证错误消息包含预期的问题
      expect(validation.errors.some(error => error.includes('protocol_version'))).toBe(true);
      expect(validation.errors.some(error => error.includes('timestamp'))).toBe(true);
      expect(validation.errors.some(error => error.includes('plan_id'))).toBe(true);
      expect(validation.errors.some(error => error.includes('name'))).toBe(true);
      expect(validation.errors.some(error => error.includes('status'))).toBe(true);
      expect(validation.errors.some(error => error.includes('priority'))).toBe(true);
    });

    test('应该正确处理配置验证错误', () => {
      const invalidConfig = {
        auto_scheduling_enabled: true,
        dependency_validation_enabled: true,
        risk_monitoring_enabled: true,
        failure_recovery_enabled: true,
        performance_tracking_enabled: true,
        notification_settings: {
          enabled: true,
          channels: [], // 空渠道但启用了通知
          events: [], // 空事件但启用了通知
          task_completion: false
        },
        optimization_settings: {
          enabled: true,
          strategy: 'invalid_strategy' as any, // 无效策略
          auto_reoptimize: false
        },
        timeout_settings: {
          default_task_timeout_ms: -1, // 负值
          plan_execution_timeout_ms: 100, // 小于默认任务超时
          dependency_resolution_timeout_ms: 0 // 零值
        },
        parallel_execution_limit: -5 // 负值
      } as PlanConfiguration;

      const result = validatePlanConfiguration(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

  });

}); 