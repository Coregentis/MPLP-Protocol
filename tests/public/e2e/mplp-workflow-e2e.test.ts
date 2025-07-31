/**
 * MPLP完整工作流端到端测试
 * 
 * 测试完整的Context→Plan→Confirm→Trace工作流端到端场景
 * 验证真实业务流程、数据一致性、性能表现
 * 
 * @version 1.0.0
 * @created 2025-01-28T22:30:00+08:00
 */

import { CoreOrchestrator } from '../../../src/public/modules/core/orchestrator/core-orchestrator';
import { WorkflowManager } from '../../../src/public/modules/core/workflow/workflow-manager';
import {
  WorkflowStage,
  WorkflowConfiguration,
  OrchestratorConfiguration,
  ModuleInterface,
  ExecutionContext,
  ModuleStatus,
  WorkflowExecutionResult
} from '../../../src/public/modules/core/types/core.types';
import { UUID } from '../../../src/public/shared/types';
import { TestDataFactory } from '../test-utils/test-data-factory';
import { TestHelpers } from '../test-utils/test-helpers';

describe('MPLP完整工作流端到端测试', () => {
  let orchestrator: CoreOrchestrator;
  let workflowManager: WorkflowManager;
  let executionResults: WorkflowExecutionResult[] = [];

  beforeAll(async () => {
    // 创建工作流管理器
    workflowManager = new WorkflowManager();

    // 创建生产级配置
    const config: OrchestratorConfiguration = {
      default_workflow: {
        stages: ['context', 'plan', 'confirm', 'trace'] as WorkflowStage[],
        parallel_execution: false,
        timeout_ms: 300000, // 5分钟超时
        retry_policy: {
          max_attempts: 3,
          delay_ms: 1000,
          backoff_multiplier: 2,
          max_delay_ms: 10000
        },
        error_handling: {
          continue_on_error: false,
          rollback_on_failure: true,
          notification_enabled: true
        }
      },
      module_timeout_ms: 60000, // 1分钟模块超时
      max_concurrent_executions: 10,
      enable_performance_monitoring: true,
      enable_event_logging: true
    };

    orchestrator = new CoreOrchestrator(config);

    // 注册真实的模块实现（模拟）
    await registerRealModules();
  });

  afterAll(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  afterEach(() => {
    // 记录每次执行结果用于分析
    // executionResults会在测试中被填充
  });

  async function registerRealModules() {
    // Context模块 - 模拟真实的上下文创建和管理
    const contextModule: ModuleInterface = {
      module_name: 'context',
      initialize: async () => {
        // 模拟模块初始化
        await TestHelpers.Async.wait(100);
      },
      execute: async (context: ExecutionContext) => {
        // 模拟真实的上下文处理逻辑
        await TestHelpers.Async.wait(200);
        
        const contextData = {
          context_id: context.context_id,
          name: `Project-${context.context_id.slice(0, 8)}`,
          type: 'multi_agent_project',
          status: 'active',
          metadata: {
            created_by: 'system',
            project_type: 'ai_collaboration',
            priority: 'high',
            estimated_duration: '2 weeks'
          },
          agents: [
            { id: 'agent-1', role: 'coordinator', status: 'ready' },
            { id: 'agent-2', role: 'executor', status: 'ready' },
            { id: 'agent-3', role: 'validator', status: 'ready' }
          ]
        };

        return { 
          success: true, 
          data: contextData,
          metrics: {
            execution_time_ms: 200,
            memory_usage_mb: 15,
            cpu_usage_percent: 5
          }
        };
      },
      cleanup: async () => {
        await TestHelpers.Async.wait(50);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'context',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 200,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // Plan模块 - 模拟真实的计划生成和优化
    const planModule: ModuleInterface = {
      module_name: 'plan',
      initialize: async () => {
        await TestHelpers.Async.wait(150);
      },
      execute: async (context: ExecutionContext) => {
        // 模拟复杂的计划生成逻辑
        await TestHelpers.Async.wait(500);
        
        const planData = {
          plan_id: TestDataFactory.Base.generateUUID(),
          context_id: context.context_id,
          name: `Execution Plan for ${context.context_id.slice(0, 8)}`,
          description: 'Multi-agent collaboration execution plan',
          steps: [
            {
              step_id: TestDataFactory.Base.generateUUID(),
              name: 'Initialize Agents',
              description: 'Set up all agents and their communication channels',
              order: 1,
              estimated_duration: '30 minutes',
              dependencies: [],
              assigned_agent: 'agent-1'
            },
            {
              step_id: TestDataFactory.Base.generateUUID(),
              name: 'Execute Tasks',
              description: 'Parallel execution of assigned tasks',
              order: 2,
              estimated_duration: '1 hour',
              dependencies: ['step-1'],
              assigned_agent: 'agent-2'
            },
            {
              step_id: TestDataFactory.Base.generateUUID(),
              name: 'Validate Results',
              description: 'Quality assurance and validation',
              order: 3,
              estimated_duration: '20 minutes',
              dependencies: ['step-2'],
              assigned_agent: 'agent-3'
            }
          ],
          total_estimated_duration: '1 hour 50 minutes',
          resource_requirements: {
            cpu_cores: 4,
            memory_gb: 8,
            storage_gb: 10
          }
        };

        return { 
          success: true, 
          data: planData,
          metrics: {
            execution_time_ms: 500,
            memory_usage_mb: 25,
            cpu_usage_percent: 15
          }
        };
      },
      cleanup: async () => {
        await TestHelpers.Async.wait(75);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'plan',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 500,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // Confirm模块 - 模拟真实的确认和审批流程
    const confirmModule: ModuleInterface = {
      module_name: 'confirm',
      initialize: async () => {
        await TestHelpers.Async.wait(100);
      },
      execute: async (context: ExecutionContext) => {
        // 模拟审批流程
        await TestHelpers.Async.wait(300);
        
        const confirmData = {
          confirm_id: TestDataFactory.Base.generateUUID(),
          context_id: context.context_id,
          subject: {
            type: 'plan_approval',
            title: 'Multi-Agent Collaboration Plan Approval',
            description: 'Request approval for the generated execution plan',
            impact_assessment: 'Medium impact - involves 3 agents and significant resources'
          },
          approval_workflow: {
            steps: [
              {
                step_id: TestDataFactory.Base.generateUUID(),
                name: 'Technical Review',
                approver_role: 'technical_lead',
                status: 'approved',
                approved_at: new Date().toISOString(),
                comments: 'Plan structure looks good, resource allocation is reasonable'
              },
              {
                step_id: TestDataFactory.Base.generateUUID(),
                name: 'Resource Approval',
                approver_role: 'resource_manager',
                status: 'approved',
                approved_at: new Date().toISOString(),
                comments: 'Resources are available and allocated'
              }
            ],
            final_status: 'approved',
            approved_at: new Date().toISOString()
          }
        };

        return { 
          success: true, 
          data: confirmData,
          metrics: {
            execution_time_ms: 300,
            memory_usage_mb: 18,
            cpu_usage_percent: 8
          }
        };
      },
      cleanup: async () => {
        await TestHelpers.Async.wait(60);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'confirm',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 300,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // Trace模块 - 模拟真实的追踪和监控
    const traceModule: ModuleInterface = {
      module_name: 'trace',
      initialize: async () => {
        await TestHelpers.Async.wait(80);
      },
      execute: async (context: ExecutionContext) => {
        // 模拟追踪数据收集和分析
        await TestHelpers.Async.wait(250);
        
        const traceData = {
          trace_id: TestDataFactory.Base.generateUUID(),
          context_id: context.context_id,
          event: {
            event_type: 'workflow_execution_completed',
            source: {
              module: 'mplp_orchestrator',
              component: 'workflow_engine',
              version: '1.0.0'
            },
            data: {
              workflow_id: context.execution_id,
              total_stages: 4,
              successful_stages: 4,
              total_duration_ms: 1250,
              resource_usage: {
                peak_memory_mb: 25,
                peak_cpu_percent: 15,
                total_io_operations: 156
              }
            },
            severity: 'info',
            tags: ['workflow', 'multi-agent', 'success']
          },
          performance_metrics: {
            response_time_ms: 1250,
            throughput_ops_per_sec: 3.2,
            error_rate: 0.0,
            availability_percent: 100.0
          },
          correlations: [
            {
              correlation_id: context.context_id,
              type: 'context_correlation',
              strength: 1.0
            }
          ]
        };

        return { 
          success: true, 
          data: traceData,
          metrics: {
            execution_time_ms: 250,
            memory_usage_mb: 20,
            cpu_usage_percent: 10
          }
        };
      },
      cleanup: async () => {
        await TestHelpers.Async.wait(40);
      },
      getStatus: (): ModuleStatus => ({
        module_name: 'trace',
        status: 'idle',
        last_execution: new Date().toISOString(),
        error_count: 0,
        performance_metrics: {
          average_execution_time_ms: 250,
          total_executions: 1,
          success_rate: 1.0,
          error_rate: 0.0,
          last_updated: new Date().toISOString()
        }
      })
    };

    // 注册所有模块
    orchestrator.registerModule(contextModule);
    orchestrator.registerModule(planModule);
    orchestrator.registerModule(confirmModule);
    orchestrator.registerModule(traceModule);
  }

  describe('完整业务流程测试', () => {
    it('应该成功执行完整的MPLP工作流', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const startTime = Date.now();

      // 执行完整工作流
      const result = await orchestrator.executeWorkflow(contextId);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // 记录执行结果
      executionResults.push(result);

      // 验证工作流执行结果
      expect(result.context_id).toBe(contextId);
      expect(result.status).toBe('completed');
      expect(result.stages).toHaveLength(4);

      // 验证每个阶段都成功执行
      const stageNames = result.stages.map(s => s.stage);
      expect(stageNames).toEqual(['context', 'plan', 'confirm', 'trace']);
      
      result.stages.forEach(stage => {
        expect(stage.status).toBe('completed');
        expect(stage.result).toBeDefined();
        expect(stage.duration_ms).toBeGreaterThan(0);
        expect(stage.started_at).toBeDefined();
        expect(stage.completed_at).toBeDefined();
      });

      // 验证性能指标
      expect(result.total_duration_ms).toBeGreaterThan(0);
      expect(result.total_duration_ms).toBeLessThan(10000); // 应该在10秒内完成
      expect(totalDuration).toBeLessThan(15000); // 包括测试开销，应该在15秒内完成

      // 验证数据一致性
      const contextStage = result.stages.find(s => s.stage === 'context');
      const planStage = result.stages.find(s => s.stage === 'plan');
      const confirmStage = result.stages.find(s => s.stage === 'confirm');
      const traceStage = result.stages.find(s => s.stage === 'trace');

      expect(contextStage?.result?.data?.context_id).toBe(contextId);
      expect(planStage?.result?.data?.context_id).toBe(contextId);
      expect(confirmStage?.result?.data?.context_id).toBe(contextId);
      expect(traceStage?.result?.data?.context_id).toBe(contextId);

      // 验证业务逻辑
      expect(contextStage?.result?.data?.agents).toHaveLength(3);
      expect(planStage?.result?.data?.steps).toHaveLength(3);
      expect(confirmStage?.result?.data?.approval_workflow?.final_status).toBe('approved');
      expect(traceStage?.result?.data?.performance_metrics?.error_rate).toBe(0.0);
    }, 30000); // 30秒超时

    it('应该正确处理并发工作流执行', async () => {
      // 准备多个并发执行
      const concurrentExecutions = 3;
      const contextIds = Array.from({ length: concurrentExecutions }, () => 
        TestDataFactory.Base.generateUUID()
      );

      const startTime = Date.now();

      // 并发执行多个工作流
      const promises = contextIds.map(contextId => 
        orchestrator.executeWorkflow(contextId)
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      // 记录执行结果
      executionResults.push(...results);

      // 验证所有执行都成功
      expect(results).toHaveLength(concurrentExecutions);
      results.forEach((result, index) => {
        expect(result.context_id).toBe(contextIds[index]);
        expect(result.status).toBe('completed');
        expect(result.stages).toHaveLength(4);
        expect(result.stages.every(s => s.status === 'completed')).toBe(true);
      });

      // 验证并发性能
      expect(totalDuration).toBeLessThan(20000); // 并发执行应该比顺序执行快

      // 验证资源隔离
      const allContextIds = results.map(r => r.context_id);
      const uniqueContextIds = [...new Set(allContextIds)];
      expect(uniqueContextIds).toHaveLength(concurrentExecutions);
    }, 45000); // 45秒超时
  });
});
