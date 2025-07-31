/**
 * 真实业务场景示例
 * 模拟一个AI驱动的客户服务系统，展示MPLP在实际业务中的应用
 */

import { 
  PerformanceEnhancedOrchestrator,
  ModuleInterface,
  ExecutionContext
} from 'mplp';

// 业务场景：AI客户服务系统
// 工作流：接收客户问题 -> 理解意图 -> 生成回复 -> 质量检查 -> 发送回复

interface CustomerQuery {
  id: string;
  customerId: string;
  message: string;
  channel: 'email' | 'chat' | 'phone';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
}

interface AIResponse {
  response: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
}

// 配置
const customerServiceConfig = {
  default_workflow: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    parallel_execution: false,
    timeout_ms: 30000,
    retry_policy: {
      max_attempts: 2,
      delay_ms: 1000,
      backoff_multiplier: 1.5,
      max_delay_ms: 5000
    }
  },
  module_timeout_ms: 10000,
  max_concurrent_executions: 20,
  enable_performance_monitoring: true,
  enable_event_logging: true
};

// 创建调度器
const orchestrator = new PerformanceEnhancedOrchestrator(customerServiceConfig);

// Context模块 - 理解客户查询上下文
const contextModule: ModuleInterface = {
  module_name: 'context',
  
  async initialize() {
    console.log('🤖 初始化客户上下文分析模块');
    // 加载客户历史数据、偏好设置等
  },

  async execute(context: ExecutionContext) {
    const query: CustomerQuery = context.input_data;
    console.log(`📋 分析客户查询: ${query.id}`);
    
    // 模拟客户上下文分析
    const customerProfile = await this.getCustomerProfile(query.customerId);
    const queryContext = await this.analyzeQuery(query);
    const historicalContext = await this.getHistoricalContext(query.customerId);
    
    return {
      success: true,
      data: {
        customer_profile: customerProfile,
        query_context: queryContext,
        historical_context: historicalContext,
        enriched_query: {
          ...query,
          customer_tier: customerProfile.tier,
          previous_issues: historicalContext.recent_issues
        }
      }
    };
  },

  async cleanup() {
    console.log('🧹 清理上下文模块资源');
  },

  getStatus() {
    return {
      module_name: 'context',
      status: 'active',
      last_execution: new Date().toISOString(),
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 150,
        total_executions: 1000,
        success_rate: 0.99,
        error_rate: 0.01,
        last_updated: new Date().toISOString()
      }
    };
  },

  async getCustomerProfile(customerId: string) {
    // 模拟客户档案获取
    return {
      id: customerId,
      name: 'John Doe',
      tier: 'premium',
      language: 'zh-CN',
      preferences: ['quick_response', 'detailed_explanation']
    };
  },

  async analyzeQuery(query: CustomerQuery) {
    // 模拟查询分析
    return {
      intent: 'product_inquiry',
      sentiment: 'neutral',
      urgency: query.priority,
      category: 'technical_support'
    };
  },

  async getHistoricalContext(customerId: string) {
    // 模拟历史上下文获取
    return {
      recent_issues: ['login_problem', 'billing_question'],
      satisfaction_score: 4.2,
      interaction_count: 15
    };
  }
};

// Plan模块 - 生成回复计划
const planModule: ModuleInterface = {
  module_name: 'plan',
  
  async initialize() {
    console.log('🎯 初始化回复计划模块');
  },

  async execute(context: ExecutionContext) {
    const enrichedData = context.previous_results.context.data;
    console.log(`📝 生成回复计划: ${enrichedData.enriched_query.id}`);
    
    // 选择最佳回复策略
    const strategy = await this.selectResponseStrategy(enrichedData);
    const aiResponse = await this.generateAIResponse(enrichedData, strategy);
    const responseTemplate = await this.selectTemplate(strategy);
    
    return {
      success: true,
      data: {
        strategy,
        ai_response: aiResponse,
        template: responseTemplate,
        estimated_satisfaction: this.predictSatisfaction(aiResponse, enrichedData)
      }
    };
  },

  async cleanup() {
    console.log('🧹 清理计划模块资源');
  },

  getStatus() {
    return {
      module_name: 'plan',
      status: 'active',
      last_execution: new Date().toISOString(),
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 300,
        total_executions: 950,
        success_rate: 0.97,
        error_rate: 0.03,
        last_updated: new Date().toISOString()
      }
    };
  },

  async selectResponseStrategy(data: any) {
    // 基于客户档案和查询类型选择策略
    const { customer_profile, query_context } = data;
    
    if (customer_profile.tier === 'premium') {
      return 'personalized_detailed';
    } else if (query_context.urgency === 'urgent') {
      return 'quick_resolution';
    } else {
      return 'standard_helpful';
    }
  },

  async generateAIResponse(data: any, strategy: string): Promise<AIResponse> {
    // 模拟AI回复生成
    const query = data.enriched_query;
    
    return {
      response: `感谢您的咨询。根据您的问题"${query.message}"，我为您提供以下解决方案...`,
      confidence: 0.85,
      intent: data.query_context.intent,
      entities: { product: 'service', action: 'inquiry' }
    };
  },

  async selectTemplate(strategy: string) {
    // 选择回复模板
    const templates = {
      personalized_detailed: 'premium_template',
      quick_resolution: 'urgent_template',
      standard_helpful: 'standard_template'
    };
    
    return templates[strategy] || 'default_template';
  },

  predictSatisfaction(response: AIResponse, data: any): number {
    // 预测客户满意度
    const baseScore = response.confidence * 0.7;
    const tierBonus = data.customer_profile.tier === 'premium' ? 0.2 : 0.1;
    return Math.min(baseScore + tierBonus, 1.0);
  }
};

// Confirm模块 - 质量检查和确认
const confirmModule: ModuleInterface = {
  module_name: 'confirm',
  
  async initialize() {
    console.log('✅ 初始化质量确认模块');
  },

  async execute(context: ExecutionContext) {
    const planData = context.previous_results.plan.data;
    console.log(`🔍 质量检查回复: ${context.input_data.id}`);
    
    // 执行多层质量检查
    const qualityChecks = await this.performQualityChecks(planData);
    const complianceCheck = await this.checkCompliance(planData);
    const finalApproval = await this.getFinalApproval(qualityChecks, complianceCheck);
    
    return {
      success: true,
      data: {
        quality_score: qualityChecks.overall_score,
        compliance_passed: complianceCheck.passed,
        approved: finalApproval,
        feedback: qualityChecks.feedback,
        final_response: finalApproval ? planData.ai_response.response : null
      }
    };
  },

  async cleanup() {
    console.log('🧹 清理确认模块资源');
  },

  getStatus() {
    return {
      module_name: 'confirm',
      status: 'active',
      last_execution: new Date().toISOString(),
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 200,
        total_executions: 900,
        success_rate: 0.98,
        error_rate: 0.02,
        last_updated: new Date().toISOString()
      }
    };
  },

  async performQualityChecks(planData: any) {
    // 模拟质量检查
    const checks = {
      relevance: 0.9,
      accuracy: 0.85,
      tone: 0.92,
      completeness: 0.88
    };
    
    const overall_score = Object.values(checks).reduce((a, b) => a + b, 0) / Object.keys(checks).length;
    
    return {
      checks,
      overall_score,
      feedback: overall_score > 0.8 ? 'Good quality response' : 'Needs improvement'
    };
  },

  async checkCompliance(planData: any) {
    // 模拟合规检查
    return {
      passed: true,
      checks: ['privacy_policy', 'terms_of_service', 'data_protection'],
      violations: []
    };
  },

  async getFinalApproval(qualityChecks: any, complianceCheck: any) {
    return qualityChecks.overall_score > 0.7 && complianceCheck.passed;
  }
};

// Trace模块 - 记录和追踪
const traceModule: ModuleInterface = {
  module_name: 'trace',
  
  async initialize() {
    console.log('📊 初始化追踪记录模块');
  },

  async execute(context: ExecutionContext) {
    const confirmData = context.previous_results.confirm.data;
    console.log(`📝 记录执行轨迹: ${context.input_data.id}`);
    
    // 记录完整的执行轨迹
    const executionTrace = await this.createExecutionTrace(context);
    const performanceMetrics = await this.collectPerformanceMetrics(context);
    const businessMetrics = await this.updateBusinessMetrics(confirmData);
    
    return {
      success: true,
      data: {
        trace_id: `trace_${Date.now()}`,
        execution_trace: executionTrace,
        performance_metrics: performanceMetrics,
        business_metrics: businessMetrics,
        response_sent: confirmData.approved
      }
    };
  },

  async cleanup() {
    console.log('🧹 清理追踪模块资源');
  },

  getStatus() {
    return {
      module_name: 'trace',
      status: 'active',
      last_execution: new Date().toISOString(),
      error_count: 0,
      performance_metrics: {
        average_execution_time_ms: 100,
        total_executions: 1000,
        success_rate: 1.0,
        error_rate: 0.0,
        last_updated: new Date().toISOString()
      }
    };
  },

  async createExecutionTrace(context: ExecutionContext) {
    return {
      workflow_id: context.context_id,
      start_time: context.start_time,
      end_time: Date.now(),
      stages_executed: Object.keys(context.previous_results),
      total_duration: Date.now() - context.start_time
    };
  },

  async collectPerformanceMetrics(context: ExecutionContext) {
    return {
      response_time: Date.now() - context.start_time,
      memory_usage: process.memoryUsage().heapUsed,
      cpu_usage: process.cpuUsage()
    };
  },

  async updateBusinessMetrics(confirmData: any) {
    return {
      responses_generated: 1,
      quality_score: confirmData.quality_score,
      approval_rate: confirmData.approved ? 1 : 0,
      estimated_satisfaction: 0.85
    };
  }
};

// 注册所有模块
orchestrator.registerModule(contextModule);
orchestrator.registerModule(planModule);
orchestrator.registerModule(confirmModule);
orchestrator.registerModule(traceModule);

// 业务场景执行函数
async function handleCustomerQuery(query: CustomerQuery) {
  console.log(`🎬 处理客户查询: ${query.id}`);
  
  try {
    const result = await orchestrator.executeWorkflow(query.id, {
      input_data: query
    });
    
    console.log(`✅ 客户查询处理完成: ${query.id}`);
    console.log(`📊 执行结果:`, {
      success: result.success,
      duration: result.total_duration_ms,
      response_approved: result.stage_results.confirm?.data?.approved
    });
    
    return result;
  } catch (error) {
    console.error(`❌ 客户查询处理失败: ${query.id}`, error);
    throw error;
  }
}

// 示例执行
async function runCustomerServiceExample() {
  console.log('🚀 启动AI客户服务系统示例');
  
  // 模拟客户查询
  const queries: CustomerQuery[] = [
    {
      id: 'query_001',
      customerId: 'customer_123',
      message: '我无法登录我的账户，请帮助我',
      channel: 'chat',
      priority: 'high',
      timestamp: new Date().toISOString()
    },
    {
      id: 'query_002',
      customerId: 'customer_456',
      message: '我想了解你们的新产品功能',
      channel: 'email',
      priority: 'medium',
      timestamp: new Date().toISOString()
    }
  ];
  
  // 处理查询
  for (const query of queries) {
    await handleCustomerQuery(query);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 间隔1秒
  }
  
  // 获取性能统计
  const stats = orchestrator.getPerformanceStats();
  console.log('📊 系统性能统计:', {
    totalQueries: stats.totalExecutions,
    averageResponseTime: `${stats.averageExecutionTime}ms`,
    cacheHitRate: `${(stats.cacheHitRate * 100).toFixed(1)}%`
  });
  
  console.log('🎉 客户服务示例执行完成');
}

// 主函数
async function main() {
  try {
    await runCustomerServiceExample();
  } catch (error) {
    console.error('❌ 示例执行失败:', error);
  } finally {
    await orchestrator.shutdown();
  }
}

// 导出函数供其他模块使用
export { 
  handleCustomerQuery, 
  runCustomerServiceExample,
  CustomerQuery,
  AIResponse 
};

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}
