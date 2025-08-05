# MPLP v1.0 标准版实施指南 (修正版)

## 🎯 **实施概述**

**目标**: 在现有MPLP v1.0基础上完善核心功能，使其成为完整的标准版本
**原则**: 统一接口、保持兼容、链式更新、系统性协调
**范围**: Core模块 + 5个协议Schema + 对应实现 + 测试验证

## 🚨 **重要修正**

**系统性分析发现**: Core模块是整个重构的关键前提，必须优先更新
- Core模块当前只支持4个工作流阶段，无法协调完整的10模块系统
- WorkflowStage和ProtocolModule类型定义不完整
- 缺少新功能的模块间协调机制

## 📋 **修正后的详细实施计划**

### **Phase 0: Core模块基础更新 (1周) - 最高优先级**

#### **0.1 Core类型定义修正 (2天)**

**任务**: 修正Core模块的基础类型定义

**关键修正**:
```typescript
// 修正前 (不完整)
export type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace';
export type ProtocolModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension';

// 修正后 (完整)
export type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'collab' | 'dialog' | 'network';
export type ProtocolModule = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'collab' | 'dialog' | 'network';

// 新增事件类型
export type CoordinationEventType =
  | 'stage_started' | 'stage_completed' | 'stage_failed'
  | 'workflow_completed' | 'workflow_failed'
  | 'decision_started' | 'decision_completed' | 'consensus_reached'  // Collab事件
  | 'role_created' | 'role_activated' | 'role_deactivated'          // Role事件
  | 'dialog_started' | 'turn_completed' | 'dialog_ended'            // Dialog事件
  | 'plugin_registered' | 'plugin_activated' | 'plugin_executed'    // Extension事件
  | 'knowledge_persisted' | 'knowledge_shared' | 'context_updated'  // Context事件
  | 'network_formed' | 'topology_changed' | 'agent_joined';         // Network事件
```

**需要更新的文件**:
```
src/modules/core/types.ts
src/public/modules/core/types/core.types.ts
release/src/modules/core/types/core.types.ts
```

#### **0.2 Core Schema标准化 (1天)**

**任务**: 统一Core Schema标准并扩展支持

**Schema修正**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-core.json",
  "title": "MPLP Core Protocol v1.0",
  "description": "Core模块协议Schema - 10模块工作流编排和协调",
  "type": "object",
  "properties": {
    "workflow_config": {
      "type": "object",
      "properties": {
        "stages": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["context", "plan", "confirm", "trace", "role", "extension", "collab", "dialog", "network"]
          }
        },
        "execution_mode": {
          "type": "string",
          "enum": ["sequential", "parallel", "conditional", "hybrid"]
        },
        "module_coordination": {
          "type": "object",
          "properties": {
            "decision_coordination": {"type": "boolean"},
            "lifecycle_coordination": {"type": "boolean"},
            "dialog_coordination": {"type": "boolean"},
            "plugin_coordination": {"type": "boolean"},
            "knowledge_coordination": {"type": "boolean"}
          }
        }
      }
    }
  }
}
```

#### **0.3 CoreOrchestrator功能扩展 (3天)**

**任务**: 扩展CoreOrchestrator支持10模块协调

**新增协调方法**:
```typescript
class CoreOrchestrator {
  // 现有方法保持不变

  // 新增：模块间协调方法
  async coordinateDecision(collabRequest: DecisionCoordinationRequest): Promise<DecisionResult> {
    // 协调Collab模块的决策过程
    const collabModule = this.modules.get('collab');
    const result = await collabModule.execute(collabRequest);

    // 通知相关模块决策结果
    await this.notifyModules('decision_completed', result);

    return result;
  }

  async coordinateLifecycle(roleRequest: LifecycleCoordinationRequest): Promise<LifecycleResult> {
    // 协调Role模块的生命周期管理
    const roleModule = this.modules.get('role');
    const result = await roleModule.execute(roleRequest);

    // 更新其他模块的角色信息
    await this.updateModuleRoles(result);

    return result;
  }

  async coordinateDialog(dialogRequest: DialogCoordinationRequest): Promise<DialogResult> {
    // 协调Dialog模块的多轮对话
    const dialogModule = this.modules.get('dialog');
    const result = await dialogModule.execute(dialogRequest);

    // 同步对话状态到Context模块
    await this.syncDialogState(result);

    return result;
  }

  async coordinatePlugin(pluginRequest: PluginCoordinationRequest): Promise<PluginResult> {
    // 协调Extension模块的插件管理
    const extensionModule = this.modules.get('extension');
    const result = await extensionModule.execute(pluginRequest);

    // 注册插件到其他模块
    await this.registerPluginToModules(result);

    return result;
  }

  async coordinateKnowledge(knowledgeRequest: KnowledgeCoordinationRequest): Promise<KnowledgeResult> {
    // 协调Context模块的知识管理
    const contextModule = this.modules.get('context');
    const result = await contextModule.execute(knowledgeRequest);

    // 同步知识到相关模块
    await this.syncKnowledgeToModules(result);

    return result;
  }

  // 新增：扩展工作流执行方法
  async executeExtendedWorkflow(contextId: UUID, config: ExtendedWorkflowConfig): Promise<WorkflowExecutionResult> {
    // 支持10模块的完整工作流执行
    const stages = config.stages || ['context', 'plan', 'confirm', 'trace'];
    const results: StageExecutionResult[] = [];

    for (const stage of stages) {
      const stageResult = await this.executeStageWithCoordination(stage, contextId, config);
      results.push(stageResult);

      if (stageResult.status === 'failed') {
        break;
      }
    }

    return {
      execution_id: uuidv4(),
      context_id: contextId,
      status: results.every(r => r.status === 'completed') ? 'completed' : 'failed',
      stages: results,
      total_duration_ms: results.reduce((sum, r) => sum + r.duration_ms, 0),
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
  }

  private async executeStageWithCoordination(stage: WorkflowStage, contextId: UUID, config: ExtendedWorkflowConfig): Promise<StageExecutionResult> {
    const startTime = Date.now();

    try {
      let result: any;

      // 根据阶段类型选择协调方法
      switch (stage) {
        case 'collab':
          result = await this.coordinateDecision({ contextId, ...config.collabConfig });
          break;
        case 'role':
          result = await this.coordinateLifecycle({ contextId, ...config.roleConfig });
          break;
        case 'dialog':
          result = await this.coordinateDialog({ contextId, ...config.dialogConfig });
          break;
        case 'extension':
          result = await this.coordinatePlugin({ contextId, ...config.extensionConfig });
          break;
        case 'context':
          result = await this.coordinateKnowledge({ contextId, ...config.contextConfig });
          break;
        default:
          // 使用原有的执行方法
          const module = this.modules.get(stage as ProtocolModule);
          result = await module.execute({ contextId });
      }

      return {
        stage,
        status: 'completed',
        result,
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    } catch (error) {
      return {
        stage,
        status: 'failed',
        error: error as Error,
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    }
  }
}
```

### **Phase 1: 其他模块Schema完善 (1周)**

#### **1.1 Schema标准化 (2天)**

**任务**: 统一所有Schema文件的标准和格式

**具体工作**:
```bash
# 1. 统一JSON Schema标准 (基于Phase 0的Core模块标准化)
所有Schema文件使用: "https://json-schema.org/draft/2020-12/schema"

# 2. 保持现有版本格式
$id: "https://mplp.dev/schemas/v1.0/mplp-[module].json"
title: "MPLP [Module] Protocol v1.0"

# 3. 需要更新的文件 (Core模块已在Phase 0完成)
src/schemas/mplp-collab.json
src/schemas/mplp-role.json
src/schemas/mplp-dialog.json
src/schemas/mplp-extension.json
src/schemas/mplp-context.json
```

**验证标准**:
- [ ] 所有Schema文件使用统一标准
- [ ] 版本号格式一致
- [ ] Schema验证通过
- [ ] 与Core模块协调接口兼容

#### **1.2 协议功能完善 (3天)**

**任务**: 在现有协议中添加完善的功能字段

**Collab协议完善**:
```typescript
// 在现有collaboration对象中添加
decision_coordination: {
  enabled: boolean;
  strategy: 'simple_voting' | 'weighted_voting' | 'consensus' | 'delegation';
  parameters: {
    threshold: number;
    weights: Record<string, number>;
    timeout_ms: number;
  };
  conflict_resolution: 'mediation' | 'escalation' | 'override';
}
```

**Role协议完善**:
```typescript
// 在现有role对象中添加
lifecycle_management: {
  enabled: boolean;
  creation_strategy: 'static' | 'dynamic' | 'template_based' | 'ai_generated';
  parameters: {
    creation_rules: string[];
    template_source: string;
    generation_criteria: object;
  };
  capability_management: {
    skills: string[];
    expertise_level: number;
    learning_enabled: boolean;
  };
}
```

**Dialog协议完善**:
```typescript
// 在现有dialog对象中添加
multi_turn_management: {
  enabled: boolean;
  turn_strategy: 'fixed' | 'adaptive' | 'goal_driven' | 'context_aware';
  parameters: {
    min_turns: number;
    max_turns: number;
    exit_criteria: object;
  };
  state_management: {
    persistence: boolean;
    transitions: string[];
    rollback_support: boolean;
  };
}
```

**Extension协议完善**:
```typescript
// 在现有extension对象中添加
strategy_plugin_support: {
  enabled: boolean;
  categories: ('methodology' | 'algorithm' | 'workflow' | 'analysis')[];
  lifecycle: {
    registration: object;
    activation: object;
    execution: object;
    deactivation: object;
  };
  integration_points: ('pre_execution' | 'post_execution' | 'error_handling' | 'monitoring')[];
}
```

**Context协议完善**:
```typescript
// 在现有context对象中添加
knowledge_persistence: {
  enabled: boolean;
  strategy: 'memory' | 'file' | 'database' | 'distributed';
  parameters: {
    storage_backend: string;
    retention_policy: object;
    access_control: object;
  };
  sharing: {
    cross_session: boolean;
    cross_application: boolean;
    sharing_rules: string[];
  };
}
```

### **Phase 2: 类型定义更新 (2天)**

#### **2.1 TypeScript类型更新**

**任务**: 更新对应的TypeScript类型定义

**需要更新的文件** (Core模块已在Phase 0完成):
```
src/modules/collab/types.ts
src/modules/role/types.ts
src/modules/dialog/types.ts
src/modules/extension/types.ts
src/modules/context/types.ts
```

**更新原则**:
- 保持现有类型定义不变
- 添加新的可选字段类型
- 确保类型与Schema完全一致
- 确保与Core模块的协调接口兼容

#### **2.2 接口兼容性验证**

**任务**: 确保新类型定义与现有代码和Core模块兼容

**验证内容**:
- [ ] 现有代码编译通过
- [ ] 新字段为可选字段
- [ ] 类型推导正确
- [ ] Core模块协调接口兼容

### **Phase 3: 实现层开发 (2-3周)**

#### **3.1 CollaborationManager增强 (3-4天)**

**任务**: 实现决策协调功能

**新增方法**:
```typescript
class CollaborationManager {
  // 现有方法保持不变
  
  // 新增决策协调方法
  async makeDecision(request: DecisionRequest): Promise<DecisionResult> {
    if (!request.decision_coordination?.enabled) {
      return this.defaultDecision(request);
    }
    
    switch (request.decision_coordination.strategy) {
      case 'simple_voting':
        return await this.simpleVoting(request);
      case 'weighted_voting':
        return await this.weightedVoting(request);
      case 'consensus':
        return await this.consensusDecision(request);
      case 'delegation':
        return await this.delegatedDecision(request);
      default:
        throw new Error(`Unsupported decision strategy: ${request.decision_coordination.strategy}`);
    }
  }
  
  private async simpleVoting(request: DecisionRequest): Promise<DecisionResult> {
    // 简单投票实现
  }
  
  private async weightedVoting(request: DecisionRequest): Promise<DecisionResult> {
    // 加权投票实现
  }
  
  private async consensusDecision(request: DecisionRequest): Promise<DecisionResult> {
    // 共识决策实现
  }
  
  private async delegatedDecision(request: DecisionRequest): Promise<DecisionResult> {
    // 委托决策实现
  }
}
```

#### **3.2 RoleManagementService增强 (3-4天)**

**任务**: 实现生命周期管理功能

**新增方法**:
```typescript
class RoleManagementService {
  // 现有方法保持不变
  
  // 新增生命周期管理方法
  async generateRole(criteria: GenerationCriteria): Promise<OperationResult<Role>> {
    if (!criteria.lifecycle_management?.enabled) {
      return this.createStaticRole(criteria);
    }
    
    switch (criteria.lifecycle_management.creation_strategy) {
      case 'dynamic':
        return await this.dynamicRoleGeneration(criteria);
      case 'template_based':
        return await this.templateBasedGeneration(criteria);
      case 'ai_generated':
        return await this.aiGeneratedRole(criteria);
      default:
        return this.createStaticRole(criteria);
    }
  }
  
  async manageCapabilities(roleId: string, management: CapabilityManagement): Promise<OperationResult<void>> {
    // 能力管理实现
  }
  
  private async dynamicRoleGeneration(criteria: GenerationCriteria): Promise<OperationResult<Role>> {
    // 动态角色生成实现
  }
  
  private async templateBasedGeneration(criteria: GenerationCriteria): Promise<OperationResult<Role>> {
    // 模板基础生成实现
  }
  
  private async aiGeneratedRole(criteria: GenerationCriteria): Promise<OperationResult<Role>> {
    // AI生成角色实现
  }
}
```

#### **3.3 DialogManager增强 (3-4天)**

**任务**: 实现多轮对话管理功能

**新增方法**:
```typescript
class DialogManager {
  // 现有方法保持不变
  
  // 新增多轮对话管理方法
  async conductMultiTurnDialog(config: MultiTurnConfig): Promise<DialogResult> {
    if (!config.multi_turn_management?.enabled) {
      return this.singleTurnDialog(config);
    }
    
    const strategy = config.multi_turn_management.turn_strategy;
    const parameters = config.multi_turn_management.parameters;
    
    switch (strategy) {
      case 'fixed':
        return await this.fixedTurnDialog(config, parameters);
      case 'adaptive':
        return await this.adaptiveTurnDialog(config, parameters);
      case 'goal_driven':
        return await this.goalDrivenDialog(config, parameters);
      case 'context_aware':
        return await this.contextAwareDialog(config, parameters);
      default:
        throw new Error(`Unsupported turn strategy: ${strategy}`);
    }
  }
  
  async manageDialogState(sessionId: string, stateConfig: StateManagement): Promise<OperationResult<void>> {
    // 对话状态管理实现
  }
  
  private async fixedTurnDialog(config: MultiTurnConfig, parameters: any): Promise<DialogResult> {
    // 固定轮次对话实现
  }
  
  private async adaptiveTurnDialog(config: MultiTurnConfig, parameters: any): Promise<DialogResult> {
    // 自适应轮次对话实现
  }
}
```

#### **3.4 ExtensionManager增强 (3-4天)**

**任务**: 实现策略插件支持功能

**新增方法**:
```typescript
class ExtensionManager {
  // 现有方法保持不变
  
  // 新增策略插件支持方法
  async registerStrategyPlugin(plugin: StrategyPlugin): Promise<OperationResult<void>> {
    if (!plugin.strategy_plugin_support?.enabled) {
      return this.registerRegularExtension(plugin);
    }
    
    // 验证插件类别
    const supportedCategories = plugin.strategy_plugin_support.categories;
    if (!this.validatePluginCategories(supportedCategories)) {
      return { success: false, error: 'Invalid plugin categories' };
    }
    
    // 注册插件
    await this.executePluginLifecycle(plugin, 'registration');
    
    return { success: true };
  }
  
  async executeStrategyPlugin(pluginId: string, context: PluginContext): Promise<PluginResult> {
    // 策略插件执行实现
  }
  
  private async executePluginLifecycle(plugin: StrategyPlugin, phase: string): Promise<void> {
    // 插件生命周期执行实现
  }
  
  private validatePluginCategories(categories: string[]): boolean {
    const validCategories = ['methodology', 'algorithm', 'workflow', 'analysis'];
    return categories.every(cat => validCategories.includes(cat));
  }
}
```

#### **3.5 ContextManager增强 (3-4天)**

**任务**: 实现知识持久化功能

**新增方法**:
```typescript
class ContextManager {
  // 现有方法保持不变
  
  // 新增知识持久化方法
  async persistKnowledge(contextId: string, knowledge: KnowledgeData): Promise<OperationResult<void>> {
    const context = await this.getContext(contextId);
    if (!context.knowledge_persistence?.enabled) {
      return { success: true }; // 不启用持久化
    }
    
    const strategy = context.knowledge_persistence.strategy;
    
    switch (strategy) {
      case 'memory':
        return await this.memoryPersistence(knowledge);
      case 'file':
        return await this.filePersistence(knowledge);
      case 'database':
        return await this.databasePersistence(knowledge);
      case 'distributed':
        return await this.distributedPersistence(knowledge);
      default:
        throw new Error(`Unsupported persistence strategy: ${strategy}`);
    }
  }
  
  async shareKnowledge(fromContext: string, toContext: string, rules: SharingRules): Promise<OperationResult<void>> {
    // 知识共享实现
  }
  
  private async memoryPersistence(knowledge: KnowledgeData): Promise<OperationResult<void>> {
    // 内存持久化实现
  }
  
  private async filePersistence(knowledge: KnowledgeData): Promise<OperationResult<void>> {
    // 文件持久化实现
  }
}
```

### **Phase 4: 测试验证 (1周)**

#### **4.1 Core模块测试 (2天) - 最高优先级**

**任务**: 为Core模块的新功能添加完整测试

**Core模块测试覆盖**:
- [ ] 10模块工作流编排测试
- [ ] 模块间协调机制测试
- [ ] 新事件类型处理测试
- [ ] 扩展工作流执行测试

#### **4.2 其他模块单元测试 (2天)**

**任务**: 为其他模块新功能添加单元测试

**测试覆盖**:
- [ ] 所有新增方法的单元测试
- [ ] 边界条件和错误处理测试
- [ ] 参数验证测试
- [ ] 与Core模块协调的测试

#### **4.3 系统集成测试 (2天)**

**任务**: 验证完整系统的协作功能

**测试内容**:
- [ ] Core模块与其他模块的集成测试
- [ ] 跨模块功能协作测试
- [ ] 完整10模块业务流程测试
- [ ] 性能基准测试

#### **4.4 Schema验证测试 (1天)**

**任务**: 验证Schema定义的正确性

**验证内容**:
- [ ] Schema语法验证
- [ ] 数据验证测试
- [ ] 类型一致性验证
- [ ] Core模块Schema与其他模块的兼容性验证

## ✅ **修正后的验收标准**

### **系统完整性 (最重要)**
- [ ] Core模块支持10模块完整协调
- [ ] 所有工作流类型正确执行
- [ ] 模块间数据流正确传递
- [ ] 事件处理覆盖所有事件类型

### **功能完整性**
- [ ] Core模块 + 5个协议的核心功能全部实现
- [ ] 所有新功能通过Core模块协调
- [ ] API接口保持向后兼容
- [ ] 跨模块功能正常工作

### **质量标准**
- [ ] 代码覆盖率 > 90%
- [ ] 所有测试用例通过 (包括Core模块测试)
- [ ] 性能指标达到要求
- [ ] 系统集成测试通过

### **文档完整性**
- [ ] Core模块文档更新
- [ ] Schema文档更新
- [ ] API文档更新
- [ ] 工作流编排指南更新

## 🚨 **风险控制**

### **兼容性风险**
- 严格保持现有API不变
- 新功能通过可选参数实现
- 完整的回归测试验证

### **质量风险**
- 每个功能都有完整测试覆盖
- 代码审查和质量检查
- 渐进式开发和验证

### **进度风险**
- 分阶段实施，每阶段独立验证
- 关键路径优先开发
- 及时风险识别和应对
