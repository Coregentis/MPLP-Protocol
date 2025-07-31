/**
 * 快速开始示例
 * 5分钟上手MPLP - 最简单的使用方式
 */

import { CoreOrchestrator } from 'mplp';

// 步骤1: 创建简单配置
const config = {
  default_workflow: {
    stages: ['context', 'plan'],
    timeout_ms: 10000
  },
  module_timeout_ms: 5000,
  max_concurrent_executions: 5
};

// 步骤2: 创建调度器
const orchestrator = new CoreOrchestrator(config);

// 步骤3: 创建简单模块
const simpleModule = {
  module_name: 'context',
  
  async initialize() {
    console.log('✅ 模块初始化完成');
  },
  
  async execute(context) {
    console.log(`🚀 处理任务: ${context.context_id}`);
    
    // 模拟一些工作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      data: {
        message: `任务 ${context.context_id} 执行成功!`,
        timestamp: new Date().toISOString()
      }
    };
  },
  
  async cleanup() {
    console.log('🧹 模块清理完成');
  },
  
  getStatus() {
    return {
      module_name: 'context',
      status: 'ready',
      last_execution: new Date().toISOString(),
      error_count: 0
    };
  }
};

// 步骤4: 注册模块
orchestrator.registerModule(simpleModule);

// 步骤5: 执行工作流
async function quickStart() {
  console.log('🎬 MPLP快速开始示例');
  
  try {
    // 执行单个任务
    console.log('\n📋 执行单个任务:');
    const result1 = await orchestrator.executeWorkflow('task-001');
    console.log('结果:', result1.success ? '✅ 成功' : '❌ 失败');
    
    // 执行多个任务
    console.log('\n📦 执行多个任务:');
    const tasks = ['task-002', 'task-003', 'task-004'];
    const results = await Promise.all(
      tasks.map(taskId => orchestrator.executeWorkflow(taskId))
    );
    
    console.log(`完成 ${results.length} 个任务`);
    results.forEach((result, index) => {
      console.log(`  任务 ${tasks[index]}: ${result.success ? '✅' : '❌'}`);
    });
    
    // 显示统计信息
    console.log('\n📊 执行统计:');
    const activeExecutions = orchestrator.getActiveExecutions();
    console.log(`活跃执行数: ${activeExecutions.length}`);
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  }
  
  console.log('\n🎉 快速开始示例完成!');
}

// 运行示例
quickStart().catch(console.error);

// 导出供其他文件使用
export { quickStart, orchestrator };
