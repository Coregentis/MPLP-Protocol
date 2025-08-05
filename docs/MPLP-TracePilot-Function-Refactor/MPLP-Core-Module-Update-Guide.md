# MPLP Core模块更新指南

## 🎯 **Core模块更新概述**

**更新原因**: Core模块是整个MPLP系统的协调中心，必须支持完整的10模块协调  
**当前问题**: 只支持4个工作流阶段，无法协调完整的MPLP系统  
**更新目标**: 使Core模块成为真正的10模块协调中心  
**优先级**: 最高优先级，阻塞性更新

## 🔍 **当前Core模块问题分析**

### **1. 类型定义不完整**
```typescript
// 当前问题
export type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace';  // 缺少5个阶段
export type ProtocolModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension';  // 缺少3个模块

// 事件类型不完整
export type CoordinationEventType = 'stage_started' | 'stage_completed' | 'stage_failed' | 'workflow_completed' | 'workflow_failed';  // 缺少新模块事件
```

### **2. 协调能力不足**
```typescript
// 当前CoreOrchestrator只能协调基础工作流
// 缺少对新模块功能的协调能力:
// - 决策协调 (Collab)
// - 生命周期协调 (Role)  
// - 对话协调 (Dialog)
// - 插件协调 (Extension)
// - 知识协调 (Context)
```

### **3. Schema标准不一致**
```json
// 当前mplp-core.json使用旧标准
"$schema": "http://json-schema.org/draft-07/schema#"  // 需要更新为draft/2020-12/schema
```

## 🏗️ **详细更新方案**

### **1. 类型定义完整更新**

#### **1.1 WorkflowStage类型扩展**
```typescript
// 文件: src/modules/core/types.ts
// 修正前
export type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace';

// 修正后
export type WorkflowStage = 
  | 'context' | 'plan' | 'confirm' | 'trace'      // 基础阶段
  | 'role' | 'extension'                          // 核心协议阶段
  | 'collab' | 'dialog' | 'network';              // L4智能体阶段
```

#### **1.2 ProtocolModule类型扩展**
```typescript
// 修正前
export type ProtocolModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension';

// 修正后  
export type ProtocolModule = 
  | 'context' | 'plan' | 'confirm' | 'trace'      // 基础模块
  | 'role' | 'extension'                          // 核心协议模块
  | 'collab' | 'dialog' | 'network';              // L4智能体模块
```

#### **1.3 CoordinationEvent类型扩展**
```typescript
// 新增完整的事件类型
export type CoordinationEventType = 
  // 基础工作流事件
  | 'stage_started' | 'stage_completed' | 'stage_failed' 
  | 'workflow_completed' | 'workflow_failed'
  
  // Collab模块事件
  | 'decision_started' | 'decision_completed' | 'consensus_reached'
  | 'voting_started' | 'voting_completed' | 'conflict_detected'
  
  // Role模块事件  
  | 'role_created' | 'role_activated' | 'role_deactivated'
  | 'lifecycle_started' | 'capability_updated' | 'role_terminated'
  
  // Dialog模块事件
  | 'dialog_started' | 'turn_completed' | 'dialog_ended'
  | 'state_persisted' | 'goal_achieved' | 'dialog_timeout'
  
  // Extension模块事件
  | 'plugin_registered' | 'plugin_activated' | 'plugin_executed'
  | 'plugin_deactivated' | 'plugin_error' | 'plugin_unregistered'
  
  // Context模块事件
  | 'knowledge_persisted' | 'knowledge_shared' | 'context_updated'
  | 'cross_session_sync' | 'version_created' | 'access_granted'
  
  // Network模块事件
  | 'network_formed' | 'topology_changed' | 'agent_joined'
  | 'agent_left' | 'route_updated' | 'network_partitioned';

// 扩展CoordinationEvent接口
export interface CoordinationEvent {
  event_id: UUID;
  event_type: CoordinationEventType;
  execution_id: UUID;
  stage?: WorkflowStage;
  module?: ProtocolModule;
  data?: any;
  timestamp: Timestamp;
  correlation_id?: UUID;  // 新增：用于事件关联
  priority?: 'low' | 'normal' | 'high' | 'critical';  // 新增：事件优先级
}
```

#### **1.4 新增协调接口**
```typescript
// 决策协调接口
export interface DecisionCoordinationRequest {
  contextId: UUID;
  decisionType: 'simple_voting' | 'weighted_voting' | 'consensus' | 'delegation';
  participants: string[];
  parameters: Record<string, any>;
  timeout_ms?: number;
}

export interface DecisionResult {
  success: boolean;
  decision: any;
  consensus_reached: boolean;
  participant_votes: Record<string, any>;
  execution_time_ms: number;
}

// 生命周期协调接口
export interface LifecycleCoordinationRequest {
  contextId: UUID;
  operation: 'create' | 'activate' | 'deactivate' | 'terminate';
  roleConfig: any;
  parameters: Record<string, any>;
}

export interface LifecycleResult {
  success: boolean;
  roleId: string;
  operation: string;
  result: any;
  affected_modules: string[];
}

// 对话协调接口
export interface DialogCoordinationRequest {
  contextId: UUID;
  dialogType: 'fixed' | 'adaptive' | 'goal_driven' | 'context_aware';
  participants: string[];
  parameters: Record<string, any>;
}

export interface DialogResult {
  success: boolean;
  dialogId: string;
  turns_completed: number;
  final_state: any;
  goal_achieved: boolean;
}

// 插件协调接口
export interface PluginCoordinationRequest {
  contextId: UUID;
  operation: 'register' | 'activate' | 'execute' | 'deactivate';
  pluginId: string;
  parameters: Record<string, any>;
}

export interface PluginResult {
  success: boolean;
  pluginId: string;
  operation: string;
  result: any;
  integration_points: string[];
}

// 知识协调接口
export interface KnowledgeCoordinationRequest {
  contextId: UUID;
  operation: 'persist' | 'share' | 'sync' | 'version';
  knowledgeData: any;
  parameters: Record<string, any>;
}

export interface KnowledgeResult {
  success: boolean;
  knowledgeId: string;
  operation: string;
  shared_with: string[];
  version: string;
}
```

### **2. CoreOrchestrator功能扩展**

#### **2.1 模块注册机制增强**
```typescript
// 文件: src/modules/core/orchestrator/core-orchestrator.ts

class CoreOrchestrator {
  private readonly modules: Map<ProtocolModule, ModuleInterface> = new Map();
  private readonly moduleCapabilities: Map<ProtocolModule, string[]> = new Map();
  private readonly moduleHealthStatus: Map<ProtocolModule, ModuleHealthStatus> = new Map();
  
  // 增强的模块注册方法
  async registerModule(module: ProtocolModule, moduleInterface: ModuleInterface): Promise<void> {
    // 验证模块兼容性
    await this.validateModuleCompatibility(module, moduleInterface);
    
    // 注册模块
    this.modules.set(module, moduleInterface);
    
    // 注册模块能力
    const capabilities = await moduleInterface.getCapabilities();
    this.moduleCapabilities.set(module, capabilities);
    
    // 初始化健康状态
    this.moduleHealthStatus.set(module, {
      status: 'healthy',
      last_check: new Date().toISOString(),
      error_count: 0,
      performance_metrics: {
        avg_response_time: 0,
        success_rate: 1.0,
        total_requests: 0
      }
    });
    
    // 发布模块注册事件
    await this.publishEvent({
      event_id: uuidv4(),
      event_type: 'module_registered',
      execution_id: uuidv4(),
      module,
      data: { capabilities },
      timestamp: new Date().toISOString()
    });
    
    this.logger.info(`Module ${module} registered successfully`);
  }
  
  private async validateModuleCompatibility(module: ProtocolModule, moduleInterface: ModuleInterface): Promise<void> {
    // 验证模块接口
    if (!moduleInterface.execute || typeof moduleInterface.execute !== 'function') {
      throw new Error(`Module ${module} missing required execute method`);
    }
    
    // 验证模块版本兼容性
    const moduleVersion = await moduleInterface.getVersion();
    if (!this.isVersionCompatible(moduleVersion)) {
      throw new Error(`Module ${module} version ${moduleVersion} is not compatible`);
    }
    
    // 验证模块依赖
    const dependencies = await moduleInterface.getDependencies();
    for (const dep of dependencies) {
      if (!this.modules.has(dep as ProtocolModule)) {
        throw new Error(`Module ${module} requires dependency ${dep} which is not registered`);
      }
    }
  }
}
```

#### **2.2 扩展工作流执行引擎**
```typescript
// 新增扩展工作流配置
export interface ExtendedWorkflowConfig extends WorkflowConfiguration {
  // 模块特定配置
  collabConfig?: {
    decision_strategy: string;
    participants: string[];
    timeout_ms: number;
  };
  roleConfig?: {
    lifecycle_strategy: string;
    generation_criteria: any;
  };
  dialogConfig?: {
    turn_strategy: string;
    max_turns: number;
    exit_criteria: any;
  };
  extensionConfig?: {
    plugin_categories: string[];
    execution_mode: string;
  };
  contextConfig?: {
    persistence_strategy: string;
    sharing_enabled: boolean;
  };
  
  // 协调配置
  coordination?: {
    enable_cross_module_events: boolean;
    enable_data_flow_tracking: boolean;
    enable_state_synchronization: boolean;
  };
}

// 扩展工作流执行方法
async executeExtendedWorkflow(contextId: UUID, config: ExtendedWorkflowConfig): Promise<WorkflowExecutionResult> {
  const executionId = uuidv4();
  const startTime = Date.now();
  
  // 创建执行上下文
  const executionContext: ExecutionContext = {
    execution_id: executionId,
    context_id: contextId,
    workflow_config: config,
    started_at: new Date().toISOString(),
    current_stage: null,
    stage_results: new Map(),
    coordination_data: new Map()
  };
  
  this.activeExecutions.set(executionId, executionContext);
  
  try {
    // 发布工作流开始事件
    await this.publishEvent({
      event_id: uuidv4(),
      event_type: 'workflow_started',
      execution_id: executionId,
      data: { config },
      timestamp: new Date().toISOString()
    });
    
    const stages = config.stages || ['context', 'plan', 'confirm', 'trace'];
    const results: StageExecutionResult[] = [];
    
    // 执行工作流阶段
    for (const stage of stages) {
      executionContext.current_stage = stage;
      
      const stageResult = await this.executeStageWithCoordination(stage, executionContext);
      results.push(stageResult);
      
      // 存储阶段结果用于后续协调
      executionContext.stage_results.set(stage, stageResult);
      
      if (stageResult.status === 'failed' && !config.continue_on_failure) {
        break;
      }
    }
    
    // 计算最终状态
    const finalStatus = results.every(r => r.status === 'completed') ? 'completed' : 'failed';
    
    // 发布工作流完成事件
    await this.publishEvent({
      event_id: uuidv4(),
      event_type: finalStatus === 'completed' ? 'workflow_completed' : 'workflow_failed',
      execution_id: executionId,
      data: { results },
      timestamp: new Date().toISOString()
    });
    
    return {
      execution_id: executionId,
      context_id: contextId,
      status: finalStatus,
      stages: results,
      total_duration_ms: Date.now() - startTime,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString()
    };
    
  } catch (error) {
    // 发布工作流失败事件
    await this.publishEvent({
      event_id: uuidv4(),
      event_type: 'workflow_failed',
      execution_id: executionId,
      data: { error: error.message },
      timestamp: new Date().toISOString()
    });
    
    throw error;
  } finally {
    this.activeExecutions.delete(executionId);
  }
}
```

### **3. Schema更新**

#### **3.1 mplp-core.json完整更新**
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-core.json",
  "title": "MPLP Core Protocol v1.0",
  "description": "Core模块协议Schema - 10模块工作流编排和协调",
  "type": "object",
  "properties": {
    "version": {"type": "string", "const": "1.0"},
    "id": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"},
    
    "workflow_config": {
      "type": "object",
      "properties": {
        "stages": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["context", "plan", "confirm", "trace", "role", "extension", "collab", "dialog", "network"]
          },
          "minItems": 1
        },
        "execution_mode": {
          "type": "string",
          "enum": ["sequential", "parallel", "conditional", "hybrid"],
          "default": "sequential"
        },
        "timeout_ms": {"type": "integer", "minimum": 1000},
        "continue_on_failure": {"type": "boolean", "default": false},
        
        "coordination": {
          "type": "object",
          "properties": {
            "enable_cross_module_events": {"type": "boolean", "default": true},
            "enable_data_flow_tracking": {"type": "boolean", "default": true},
            "enable_state_synchronization": {"type": "boolean", "default": true}
          }
        },
        
        "module_configs": {
          "type": "object",
          "properties": {
            "collab_config": {"type": "object"},
            "role_config": {"type": "object"},
            "dialog_config": {"type": "object"},
            "extension_config": {"type": "object"},
            "context_config": {"type": "object"}
          }
        }
      },
      "required": ["stages"]
    },
    
    "execution_context": {
      "type": "object",
      "properties": {
        "execution_id": {"type": "string"},
        "context_id": {"type": "string"},
        "current_stage": {
          "type": "string",
          "enum": ["context", "plan", "confirm", "trace", "role", "extension", "collab", "dialog", "network"]
        },
        "started_at": {"type": "string", "format": "date-time"}
      },
      "required": ["execution_id", "context_id"]
    }
  },
  "required": ["version", "id", "timestamp", "workflow_config"]
}
```

## 📋 **实施检查清单**

### **Phase 0.1: 类型定义修正 (2天)**
- [ ] 更新WorkflowStage类型支持10个模块
- [ ] 更新ProtocolModule类型支持10个模块
- [ ] 扩展CoordinationEvent事件类型
- [ ] 新增模块协调接口定义
- [ ] 验证类型定义编译通过

### **Phase 0.2: Schema标准化 (1天)**
- [ ] 更新mplp-core.json使用draft/2020-12/schema
- [ ] 扩展workflow_config支持10个模块
- [ ] 新增module_configs配置
- [ ] 验证Schema语法正确

### **Phase 0.3: CoreOrchestrator功能扩展 (3天)**
- [ ] 实现增强的模块注册机制
- [ ] 实现扩展工作流执行引擎
- [ ] 实现模块间协调方法
- [ ] 实现事件处理扩展
- [ ] 验证所有功能正常工作

## ✅ **验收标准**

### **功能完整性**
- [ ] 支持完整的10模块工作流编排
- [ ] 支持所有新模块的协调机制
- [ ] 支持完整的事件处理
- [ ] 保持向后兼容性

### **质量标准**
- [ ] 所有测试用例通过
- [ ] 代码覆盖率 > 90%
- [ ] 性能指标达到要求
- [ ] 错误处理完善

### **集成验证**
- [ ] 与其他5个模块正确集成
- [ ] 跨模块数据流正确传递
- [ ] 事件系统正常工作
- [ ] 工作流执行稳定可靠
