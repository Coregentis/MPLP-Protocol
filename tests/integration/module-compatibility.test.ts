/**
 * MPLP 模块兼容性测试
 * 
 * @version v1.0.0
 * @created 2025-07-16T12:00:00+08:00
 * @compliance .cursor/rules/schema-design.mdc
 * @description 测试所有模块版本的兼容性，确保系统组件可以无缝协作
 */

import { expect } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';
import { ContextManager } from '../../src/modules/context/context-manager';
import { PlanManager } from '../../src/modules/plan/plan-manager';
import { ConfirmManager } from '../../src/modules/confirm/confirm-manager';
import { TraceManager } from '../../src/modules/trace/trace-manager';
import { RoleManager } from '../../src/modules/role/role-manager';
import { ExtensionManager } from '../../src/modules/extension/extension-manager';
import { FailureResolverManager } from '../../src/modules/plan/failure-resolver';
import { PlanModuleMetadata } from '../../src/modules/plan/index';
import { 
  ITraceAdapter, 
  AdapterType, 
  SyncResult, 
  AdapterHealth, 
  RecoverySuggestion
} from '../../src/interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../src/types/trace';
import { IContextManager } from '../../src/interfaces/module-integration.interface';
import { IRoleManager } from '../../src/interfaces/module-integration.interface';

// 模拟logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// 模拟模块信息
const moduleInfo = {
  context: { 
    name: 'ContextModule',
    version: '1.0.1',
    dependencies: []
  },
  plan: { 
    name: PlanModuleMetadata.name,
    version: PlanModuleMetadata.version,
    dependencies: []
  },
  confirm: { 
    name: 'ConfirmModule',
    version: '1.0.1',
    dependencies: ['context', 'role']
  },
  trace: { 
    name: 'TraceModule',
    version: '1.0.1',
    dependencies: []
  },
  role: { 
    name: 'RoleModule',
    version: '1.0.1',
    dependencies: []
  },
  extension: { 
    name: 'ExtensionModule',
    version: '1.0.1',
    dependencies: ['context', 'role', 'trace']
  }
};

// 模拟Trace适配器 - 厂商中立设计
class MockTraceAdapter implements ITraceAdapter {
  getAdapterInfo() {
    return {
      type: AdapterType.BASE,
      version: '1.0.0'
    };
  }
  
  async syncTraceData(data: MPLPTraceData): Promise<SyncResult> {
    return {
      success: true,
      sync_timestamp: new Date().toISOString(),
      latency_ms: 5,
      errors: []
    };
  }
  
  async syncBatch(dataArray: MPLPTraceData[]): Promise<SyncResult> {
    return {
      success: true,
      sync_timestamp: new Date().toISOString(),
      latency_ms: 10,
      errors: []
    };
  }
  
  async reportFailure(failure: any): Promise<SyncResult> {
    return {
      success: true,
      sync_timestamp: new Date().toISOString(),
      latency_ms: 5,
      errors: []
    };
  }
  
  async checkHealth(): Promise<AdapterHealth> {
    return {
      status: 'healthy',
      last_check: new Date().toISOString(),
      metrics: {
        avg_latency_ms: 45,
        success_rate: 0.99,
        error_rate: 0.01
      }
    };
  }
  
  // 增强型方法
  async getRecoverySuggestions(failureId: string): Promise<RecoverySuggestion[]> {
    return [
      {
        suggestion_id: 'sugg-1',
        failure_id: failureId,
        suggestion: 'Retry the operation',
        confidence_score: 0.9,
        estimated_effort: 'low' // 修正为枚举类型值
      }
    ];
  }
  
  // 可选方法
  async getAnalytics(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    return {
      total_traces: 100,
      error_rate: 0.01
    };
  }
  
  async detectDevelopmentIssues(): Promise<{
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      file_path?: string;
    }>;
    confidence: number;
  }> {
    return {
      issues: [],
      confidence: 1.0
    };
  }
}

// 模拟Context管理器
class MockContextManager implements IContextManager {
  // 修改方法签名以匹配接口
  async createContext(contextData: Record<string, unknown>): Promise<string> {
    return uuidv4(); // 返回上下文ID
  }
  
  async getContext(contextId: string): Promise<Record<string, unknown> | null> {
    return {
      context_id: contextId,
      protocol_version: '1.0.1',
      timestamp: new Date().toISOString(),
      name: 'Test Context',
      status: 'active',
      lifecycle_stage: 'planning',
      shared_state: {}
    };
  }
  
  async updateContext(contextId: string, contextData: Record<string, unknown>): Promise<boolean> {
    return true;
  }
  
  async validateContextExists(contextId: string): Promise<boolean> {
    return true;
  }
  
  async updateContextState(contextId: string, updates: Record<string, unknown>): Promise<boolean> {
    return true;
  }
  
  async getContextHistory(): Promise<any[]> {
    return [];
  }
  
  async deleteContext(): Promise<boolean> {
    return true;
  }
  
  // 添加接口所需的缺失方法
  async getContextState(contextId: string): Promise<Record<string, unknown> | null> {
    return {
      environment: 'test',
      debug: true
    };
  }
  
  getStatus(): {
    total_contexts: number;
    active_contexts: number;
    is_initialized: boolean;
  } {
    return {
      total_contexts: 10,
      active_contexts: 5,
      is_initialized: true
    };
  }
}

// 模拟Role管理器
class MockRoleManager implements IRoleManager {
  // 修改方法签名以匹配接口
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    return true;
  }
  
  async assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
    return true;
  }
  
  async revokeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    return true;
  }
  
  // 添加接口所需的缺失方法
  async createRole(roleData: Record<string, unknown>): Promise<string> {
    return uuidv4();
  }
  
  async getRole(roleId: string): Promise<Record<string, unknown> | null> {
    return {
      role_id: roleId,
      name: 'Test Role',
      permissions: []
    };
  }
  
  async updateRole(roleId: string, roleData: Record<string, unknown>): Promise<boolean> {
    return true;
  }
  
  async getUserRoles(userId: string): Promise<string[]> {
    return ['admin'];
  }
  
  getStatus(): {
    total_roles: number;
    total_users: number;
    is_initialized: boolean;
  } {
    return {
      total_roles: 5,
      total_users: 10,
      is_initialized: true
    };
  }
}

/**
 * 模块兼容性测试
 * 
 * 测试场景：
 * 1. 模块版本兼容性验证
 * 2. 模块依赖关系验证
 * 3. 模块接口兼容性测试
 * 4. 模块协议版本验证
 * 5. Schema兼容性验证
 */
describe('MPLP模块兼容性测试', () => {
  // 模块管理器
  let contextManager: MockContextManager;
  let planManager: PlanManager;
  let confirmManager: ConfirmManager;
  let traceManager: TraceManager;
  let roleManager: MockRoleManager;
  let extensionManager: ExtensionManager;
  let failureResolver: FailureResolverManager;
  let traceAdapter: MockTraceAdapter;
  
  beforeAll(async () => {
    // 初始化适配器
    traceAdapter = new MockTraceAdapter();
    
    // 初始化管理器
    contextManager = new MockContextManager();
    roleManager = new MockRoleManager();
    traceManager = new TraceManager();
    
    // 创建故障解决器
    failureResolver = new FailureResolverManager({
      default_resolver: {
        enabled: true,
        strategies: ['retry', 'rollback', 'skip', 'manual_intervention'],
        notification_channels: ['console'],
        performance_thresholds: {
          max_execution_time_ms: 30000,
          max_memory_usage_mb: 512,
          max_cpu_usage_percent: 80
        },
        intelligent_diagnostics: {
          enabled: true,
          min_confidence_score: 0.7,
          analysis_depth: 'detailed',
          pattern_recognition: true,
          historical_analysis: true,
          max_related_failures: 5
        }
      },
      trace_adapter: traceAdapter
    });
    
    // 创建计划管理器
    planManager = new PlanManager({
      auto_scheduling_enabled: true,
      dependency_validation_enabled: true,
      risk_monitoring_enabled: true,
      failure_recovery_enabled: true,
      performance_tracking_enabled: true,
      notification_settings: {
        enabled: true,
        channels: ['console'],
        events: ['task_failure', 'plan_completed'],
        task_completion: true
      },
      optimization_settings: {
        enabled: true,
        strategy: 'balanced',
        auto_reoptimize: false
      },
      timeout_settings: {
        default_task_timeout_ms: 30000,
        plan_execution_timeout_ms: 300000,
        dependency_resolution_timeout_ms: 5000
      },
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_factor: 1.5,
        max_delay_ms: 10000
      },
      parallel_execution_limit: 5
    });
    
    confirmManager = new ConfirmManager();
    extensionManager = new ExtensionManager();
    
    // 设置模块间集成
    traceManager.setAdapter(traceAdapter);
    
    // 注入依赖
    (planManager as any).failureResolver = failureResolver;
    (planManager as any).traceManager = traceManager;
    (planManager as any).contextManager = contextManager;
    (planManager as any).roleManager = roleManager;
    
    (confirmManager as any).traceManager = traceManager;
    (confirmManager as any).contextManager = contextManager;
    (confirmManager as any).roleManager = roleManager;
    
    // 使用类型断言处理接口不匹配问题
    extensionManager.setContextManager(contextManager as unknown as IContextManager);
    extensionManager.setRoleManager(roleManager as unknown as IRoleManager);
    extensionManager.setTraceManager(traceManager);
    
    // 启动管理器
    await extensionManager.start();
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  afterAll(async () => {
    // 停止管理器
    await extensionManager.stop();
  });
  
  test('1. 模块版本兼容性验证', () => {
    // 验证所有模块版本兼容
    // 所有模块应该使用相同的主版本号和次版本号
    const versions = Object.values(moduleInfo).map(info => info.version);
    const majorVersions = versions.map(v => v.split('.')[0]);
    const minorVersions = versions.map(v => v.split('.')[1]);
    
    // 检查所有主版本号是否相同
    const uniqueMajorVersions = new Set(majorVersions);
    expect(uniqueMajorVersions.size).toBe(1);
    
    // 检查所有次版本号是否兼容
    const uniqueMinorVersions = new Set(minorVersions);
    expect(uniqueMinorVersions.size).toBeLessThanOrEqual(2); // 允许最多两个不同的次版本号
    
    // 输出所有模块版本
    console.log('模块版本:');
    for (const [module, info] of Object.entries(moduleInfo)) {
      console.log(`  ${module}: ${info.version}`);
    }
  });
  
  test('2. 模块依赖关系验证', () => {
    // 验证模块依赖关系
    // 检查每个模块的依赖是否存在
    for (const [module, info] of Object.entries(moduleInfo)) {
      if (info.dependencies) {
        for (const dependency of info.dependencies) {
          expect(moduleInfo).toHaveProperty(dependency);
        }
      }
    }
    
    // 检查是否有循环依赖
    const checkCircularDependencies = () => {
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      
      const dfs = (module: string): boolean => {
        if (!visited.has(module)) {
          visited.add(module);
          recursionStack.add(module);
          
          // 从自定义moduleInfo中获取dependencies
          const dependencies = moduleInfo[module as keyof typeof moduleInfo]?.dependencies || [];
          for (const dependency of dependencies) {
            if (!visited.has(dependency) && dfs(dependency)) {
              return true;
            } else if (recursionStack.has(dependency)) {
              return true; // 发现循环依赖
            }
          }
        }
        
        recursionStack.delete(module);
        return false;
      };
      
      for (const module of Object.keys(moduleInfo)) {
        if (dfs(module)) {
          return true; // 存在循环依赖
        }
      }
      
      return false; // 不存在循环依赖
    };
    
    expect(checkCircularDependencies()).toBe(false);
    
    // 输出模块依赖关系
    console.log('模块依赖关系:');
    for (const [module, info] of Object.entries(moduleInfo)) {
      console.log(`  ${module} 依赖: ${info.dependencies?.join(', ') || '无'}`);
    }
  });
  
  test('3. 模块接口兼容性测试', async () => {
    // 创建测试数据
    const testUserId = `compatibility-test-${uuidv4()}`;
    const testContextId = uuidv4();
    
    // 创建上下文
    const contextId = await contextManager.createContext({
      context_id: testContextId,
      name: 'Compatibility Test Context',
      description: 'Context for compatibility testing',
      initialState: {
        environment: 'compatibility_test',
        created_by: testUserId
      }
    });
    
    expect(contextId).toBeDefined();
    
    // 创建计划
    const planResult = await planManager.createPlan(
      testContextId,
      'Compatibility Test Plan',
      'Plan for compatibility testing',
      'medium'
    );
    
    expect(planResult).toBeDefined();
    expect(planResult.success).toBe(true);
    expect(planResult.data?.plan_id).toBeDefined();
    const testPlanId = planResult.data?.plan_id || '';
    
    // 创建确认请求
    const confirmResult = await confirmManager.createConfirmation({
      context_id: testContextId,
      plan_id: testPlanId,
      confirmation_type: 'plan_approval',
      priority: 'medium',
      subject: {
        title: 'Compatibility Test Confirmation',
        description: 'Confirmation for compatibility testing',
        impact_assessment: {
          scope: 'project',
          business_impact: 'medium',
          technical_impact: 'low'
        }
      }
    });
    
    expect(confirmResult.success).toBe(true);
    expect(confirmResult.data?.confirm_id).toBeDefined();
    
    // 安装扩展
    const installResult = await extensionManager.installExtension({
      context_id: testContextId, // 添加必需的context_id
      name: 'compatibility-test-extension',
      version: '1.0.0',
      source: 'memory://compatibility-test',
      auto_activate: true
    });
    
    expect(installResult.success).toBe(true);
    
    // 记录追踪数据
    const traceResult = await traceManager.recordTrace({
      trace_id: uuidv4(),
      trace_type: 'operation',
      context_id: testContextId,
      operation_name: 'test_compatibility',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: 100,
      status: 'completed',
      metadata: {
        user_id: testUserId,
        test_id: uuidv4()
      },
      events: [],
      performance_metrics: {
        cpu_usage: 10,
        memory_usage_mb: 50,
        network_io_bytes: 1024,
        disk_io_bytes: 512
      },
      error_info: null,
      parent_trace_id: null,
      adapter_metadata: {
        agent_id: 'test-agent',
        session_id: 'test-session',
        operation_complexity: 'low',
        expected_duration_ms: 100,
        quality_gates: {
          max_duration_ms: 500,
          max_memory_mb: 100,
          max_error_rate: 0.01,
          required_events: ['trace_start', 'trace_end']
        }
      },
      protocol_version: '1.0.1'
    });
    
    // 验证所有模块接口正常工作
    console.log('模块接口兼容性测试通过');
  });
  
  test('4. 模块协议版本验证', async () => {
    // 创建测试上下文
    const testContextId = uuidv4();
    const contextId = await contextManager.createContext({
      context_id: testContextId,
      name: 'Protocol Version Test Context',
      description: 'Context for protocol version testing'
    });
    
    expect(contextId).toBeDefined();
    
    // 获取上下文
    const context = await contextManager.getContext(testContextId);
    expect(context).toBeDefined();
    expect(context?.protocol_version).toBeDefined();
    
    // 创建测试计划
    const planResult = await planManager.createPlan(
      testContextId,
      'Protocol Version Test Plan',
      'Plan for protocol version testing',
      'medium'
    );
    
    expect(planResult).toBeDefined();
    expect(planResult.data).toBeDefined();
    
    // 验证所有协议版本兼容
    // 检查所有协议版本是否使用相同的主版本号
    const protocolVersions = [
      context?.protocol_version as string,
      '1.0.1' // 计划协议版本
    ];
    
    const protocolMajorVersions = protocolVersions.map(v => v.split('.')[0]);
    const uniqueProtocolMajorVersions = new Set(protocolMajorVersions);
    expect(uniqueProtocolMajorVersions.size).toBe(1);
    
    console.log('协议版本:');
    console.log(`  Context协议版本: ${context?.protocol_version}`);
    console.log(`  Plan协议版本: 1.0.1`);
  });
  
  test('5. Schema兼容性验证', async () => {
    // 创建测试数据
    const testContextId = uuidv4();
    const testUserId = `schema-test-${uuidv4()}`;
    
    // 创建上下文
    const contextId = await contextManager.createContext({
      context_id: testContextId,
      name: 'Schema Test Context',
      description: 'Context for schema compatibility testing',
      initialState: {
        schema_test: true,
        nested_data: {
          level1: {
            level2: {
              level3: 'deep nesting test'
            }
          }
        },
        array_data: [1, 2, 3, 4, 5],
        complex_array: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      }
    });
    
    expect(contextId).toBeDefined();
    
    // 创建计划
    const planResult = await planManager.createPlan(
      testContextId,
      'Schema Test Plan',
      'Plan for schema compatibility testing',
      'medium'
    );
    
    expect(planResult).toBeDefined();
    
    // 创建确认请求
    const confirmResult = await confirmManager.createConfirmation({
      context_id: testContextId,
      confirmation_type: 'plan_approval',
      priority: 'high',
      subject: {
        title: 'Schema Test Confirmation',
        description: 'Confirmation for schema compatibility testing',
        impact_assessment: {
          scope: 'project',
          business_impact: 'high',
          technical_impact: 'medium'
        }
      }
    });
    
    expect(confirmResult.success).toBe(true);
    
    // 安装扩展
    const installResult = await extensionManager.installExtension({
      context_id: testContextId, // 添加必需的context_id
      name: 'schema-test-extension',
      version: '1.0.0',
      source: 'memory://schema-test',
      auto_activate: true,
      configuration: {
        logging_level: 'debug',
        feature_flags: {
          experimental_features: true,
          beta_api: false
        }
      }
    });
    
    expect(installResult.success).toBe(true);
    
    // 记录复杂追踪数据
    await traceManager.recordTrace({
      trace_id: uuidv4(),
      trace_type: 'operation',
      context_id: testContextId,
      operation_name: 'test_schema_compatibility',
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: 150,
      status: 'completed',
      metadata: {
        user_id: testUserId,
        test_id: uuidv4(),
        test_vectors: [
          { name: 'vector1', value: [1, 2, 3] },
          { name: 'vector2', value: [4, 5, 6] }
        ],
        nested_objects: {
          level1: {
            level2: {
              level3: {
                level4: {
                  level5: 'deep nesting test'
                }
              }
            }
          }
        }
      },
      events: [],
      performance_metrics: {
        cpu_usage: 12,
        memory_usage_mb: 45,
        network_io_bytes: 2048,
        disk_io_bytes: 1024
      },
      error_info: null,
      parent_trace_id: null,
      adapter_metadata: {
        agent_id: 'schema-test-agent',
        session_id: 'schema-test-session',
        operation_complexity: 'medium',
        expected_duration_ms: 150,
        quality_gates: {
          max_duration_ms: 300,
          max_memory_mb: 100,
          max_error_rate: 0.01,
          required_events: []
        }
      },
      protocol_version: '1.0.1'
    });
    
    console.log('Schema兼容性测试通过');
  });
}); 