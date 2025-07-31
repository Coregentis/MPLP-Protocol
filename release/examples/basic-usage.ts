/**
 * 基础使用示例
 * 展示如何使用CoreOrchestrator进行基本的工作流编排
 */

import { CoreOrchestrator } from 'mplp';

// 配置
const config = {
  default_workflow: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    parallel_execution: false,
    timeout_ms: 30000,
    retry_policy: {
      max_attempts: 2,
      delay_ms: 1000,
      backoff_multiplier: 1.5,
      max_delay_ms: 5000
    },
    error_handling: {
      continue_on_error: false,
      rollback_on_failure: true,
      notification_enabled: true
    }
  },
  module_timeout_ms: 10000,
  max_concurrent_executions: 50,
  enable_performance_monitoring: true,
  enable_event_logging: true
};

// 创建调度器
const orchestrator = new CoreOrchestrator(config);

// 示例模块
const exampleModule = {
  module_name: 'context',
  initialize: async () => {
    console.log('模块初始化');
  },
  execute: async (context) => {
    console.log('执行模块:', context.context_id);
    return {
      success: true,
      data: { message: '执行成功' }
    };
  },
  cleanup: async () => {
    console.log('模块清理');
  },
  getStatus: () => ({
    module_name: 'context',
    status: 'idle',
    last_execution: new Date().toISOString(),
    error_count: 0,
    performance_metrics: {
      average_execution_time_ms: 100,
      total_executions: 1,
      success_rate: 1.0,
      error_rate: 0.0,
      last_updated: new Date().toISOString()
    }
  })
};

// 注册模块
orchestrator.registerModule(exampleModule);

// 执行工作流
async function main() {
  try {
    const result = await orchestrator.executeWorkflow('example-context-id');
    console.log('工作流执行结果:', result);
  } catch (error) {
    console.error('工作流执行失败:', error);
  }
}

main();
