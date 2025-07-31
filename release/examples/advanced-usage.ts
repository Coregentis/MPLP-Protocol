/**
 * 高级使用示例
 * 展示MPLP的高级功能，包括错误处理、重试机制、性能监控等
 */

import { 
  CoreOrchestrator, 
  PerformanceEnhancedOrchestrator,
  WorkflowConfiguration,
  ModuleInterface,
  ExecutionContext
} from 'mplp';

// 高级配置
const advancedConfig = {
  default_workflow: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    parallel_execution: true, // 启用并行执行
    timeout_ms: 60000,
    retry_policy: {
      max_attempts: 3,
      delay_ms: 2000,
      backoff_multiplier: 2.0,
      max_delay_ms: 10000
    },
    error_handling: {
      continue_on_error: true,
      rollback_on_failure: true,
      notification_enabled: true
    }
  },
  module_timeout_ms: 15000,
  max_concurrent_executions: 100,
  enable_performance_monitoring: true,
  enable_event_logging: true
};

// 创建性能增强版调度器
const orchestrator = new PerformanceEnhancedOrchestrator(advancedConfig);

// 高级模块示例 - Context模块
const contextModule: ModuleInterface = {
  module_name: 'context',
  
  async initialize() {
    console.log('🚀 Context模块初始化');
    // 模拟初始化逻辑
    await this.setupDatabase();
    await this.loadConfiguration();
  },

  async execute(context: ExecutionContext) {
    console.log(`📋 执行Context模块: ${context.context_id}`);
    
    try {
      // 模拟复杂的业务逻辑
      const contextData = await this.fetchContextData(context.context_id);
      const processedData = await this.processContext(contextData);
      
      return {
        success: true,
        data: processedData,
        metadata: {
          execution_time: Date.now() - context.start_time,
          memory_usage: process.memoryUsage().heapUsed
        }
      };
    } catch (error) {
      console.error('❌ Context模块执行失败:', error);
      throw error;
    }
  },

  async cleanup() {
    console.log('🧹 Context模块清理');
    await this.closeConnections();
  },

  getStatus() {
    return {
      module_name: 'context',
      status: 'active',
      last_execution: new Date().toISOString(),
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 250,
        total_executions: 100,
        success_rate: 0.98,
        error_rate: 0.02,
        last_updated: new Date().toISOString()
      }
    };
  },

  // 私有方法
  async setupDatabase() {
    // 模拟数据库连接
    console.log('🔗 连接数据库');
  },

  async loadConfiguration() {
    // 模拟配置加载
    console.log('⚙️ 加载配置');
  },

  async fetchContextData(contextId: string) {
    // 模拟数据获取
    console.log(`📥 获取上下文数据: ${contextId}`);
    return { id: contextId, data: 'sample data' };
  },

  async processContext(data: any) {
    // 模拟数据处理
    console.log('⚡ 处理上下文数据');
    return { ...data, processed: true, timestamp: Date.now() };
  },

  async closeConnections() {
    // 模拟连接关闭
    console.log('🔌 关闭连接');
  }
};

// Plan模块示例
const planModule: ModuleInterface = {
  module_name: 'plan',
  
  async initialize() {
    console.log('🎯 Plan模块初始化');
  },

  async execute(context: ExecutionContext) {
    console.log(`📝 执行Plan模块: ${context.context_id}`);
    
    // 模拟计划生成
    const plan = await this.generatePlan(context);
    const optimizedPlan = await this.optimizePlan(plan);
    
    return {
      success: true,
      data: optimizedPlan,
      metadata: {
        plan_complexity: 'medium',
        estimated_duration: 5000
      }
    };
  },

  async cleanup() {
    console.log('🧹 Plan模块清理');
  },

  getStatus() {
    return {
      module_name: 'plan',
      status: 'active',
      last_execution: new Date().toISOString(),
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 180,
        total_executions: 85,
        success_rate: 0.99,
        error_rate: 0.01,
        last_updated: new Date().toISOString()
      }
    };
  },

  async generatePlan(context: ExecutionContext) {
    console.log('🔄 生成执行计划');
    return {
      steps: ['step1', 'step2', 'step3'],
      dependencies: [],
      resources: ['cpu', 'memory']
    };
  },

  async optimizePlan(plan: any) {
    console.log('⚡ 优化执行计划');
    return { ...plan, optimized: true };
  }
};

// 注册模块
orchestrator.registerModule(contextModule);
orchestrator.registerModule(planModule);

// 设置事件监听
orchestrator.addEventListener((event) => {
  console.log(`📡 事件: ${event.type} - ${event.message}`);
});

// 设置性能监控
const performanceMonitor = orchestrator.getPerformanceMonitor();
performanceMonitor.on('alert', (alert) => {
  console.warn(`⚠️ 性能告警: ${alert.message}`);
});

// 高级执行示例
async function advancedExample() {
  try {
    console.log('🚀 开始高级工作流示例');
    
    // 预热缓存
    console.log('🔥 预热缓存');
    await orchestrator.warmupCache(['context-1', 'context-2']);
    
    // 批量执行
    console.log('📦 批量执行工作流');
    const contextIds = ['ctx-1', 'ctx-2', 'ctx-3', 'ctx-4', 'ctx-5'];
    const results = await Promise.all(
      contextIds.map(id => orchestrator.executeWorkflow(id))
    );
    
    console.log('✅ 批量执行完成:', results.length);
    
    // 获取性能统计
    const stats = orchestrator.getPerformanceStats();
    console.log('📊 性能统计:', {
      cacheHitRate: `${(stats.cacheHitRate * 100).toFixed(1)}%`,
      averageExecutionTime: `${stats.averageExecutionTime}ms`,
      totalExecutions: stats.totalExecutions
    });
    
    // 获取模块状态
    const moduleStatuses = orchestrator.getModuleStatuses();
    console.log('📋 模块状态:', moduleStatuses);
    
  } catch (error) {
    console.error('❌ 高级示例执行失败:', error);
  } finally {
    // 清理资源
    console.log('🧹 清理资源');
    await orchestrator.shutdown();
  }
}

// 错误处理示例
async function errorHandlingExample() {
  console.log('🔧 错误处理示例');
  
  try {
    // 模拟错误场景
    await orchestrator.executeWorkflow('invalid-context');
  } catch (error) {
    console.log('✅ 错误被正确捕获:', error.message);
  }
}

// 性能测试示例
async function performanceExample() {
  console.log('⚡ 性能测试示例');
  
  const startTime = Date.now();
  const iterations = 50;
  
  for (let i = 0; i < iterations; i++) {
    await orchestrator.executeWorkflow(`perf-test-${i}`);
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  
  console.log(`📊 性能测试结果:
    - 总执行次数: ${iterations}
    - 总耗时: ${totalTime}ms
    - 平均耗时: ${avgTime.toFixed(2)}ms
    - 吞吐量: ${(iterations / (totalTime / 1000)).toFixed(2)} ops/sec
  `);
}

// 主函数
async function main() {
  console.log('🎬 MPLP高级使用示例开始');
  
  await advancedExample();
  await errorHandlingExample();
  await performanceExample();
  
  console.log('🎉 示例执行完成');
}

// 运行示例
if (require.main === module) {
  main().catch(console.error);
}

export { advancedExample, errorHandlingExample, performanceExample };
