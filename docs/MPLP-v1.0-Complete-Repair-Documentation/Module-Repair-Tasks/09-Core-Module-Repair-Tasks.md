# Core模块源代码修复任务清单

## 📋 **模块概述**

**模块名称**: Core (工作流编排协议)  
**优先级**: P0 (最高优先级)  
**复杂度**: 高  
**预估修复时间**: 2-3天  
**状态**: 📋 待修复

## 🎯 **模块功能分析**

### **Core模块职责**
```markdown
核心功能:
- 工作流编排和协调
- 模块间通信管理
- 生命周期管理
- 事件分发和处理
- 系统状态管理

关键特性:
- 支持复杂工作流编排
- 模块依赖关系管理
- 异步任务协调
- 错误恢复和重试
- 性能监控和优化
```

### **Schema分析**
```json
// 基于mplp-core.json Schema
{
  "workflow_id": "string",
  "orchestration_config": {
    "execution_mode": "sequential|parallel|hybrid",
    "timeout_ms": "number",
    "retry_policy": "object"
  },
  "module_registry": "array",
  "event_handlers": "array",
  "state_management": "object"
}
```

## 🔍 **当前状态诊断**

### **预期问题分析**
```bash
# 运行诊断命令
npx tsc --noEmit src/modules/core/ > core-ts-errors.log
npx eslint src/modules/core/ --ext .ts > core-eslint-errors.log

# 预期问题类型:
□ 工作流编排类型定义复杂
□ 模块注册机制类型不完整
□ 事件处理器类型缺失
□ 异步操作类型安全问题
□ 状态管理类型不一致
```

### **复杂度评估**
```markdown
高复杂度因素:
✓ 工作流编排逻辑复杂
✓ 多模块协调机制
✓ 异步事件处理
✓ 状态管理复杂性
✓ 性能要求严格

预估错误数量: 60-80个TypeScript错误
修复难度: 高 (需要深度理解工作流编排)
```

## 🔧 **系统性8步修复任务**

### **步骤1: Schema定义标准一致性检查 (0.1天)**

#### **任务1.1: Core模块Schema验证**
```bash
□ 检查 schemas/mplp-core.json Schema定义完整性
□ 验证Schema字段命名规范 (snake_case)
□ 确认Schema版本和$id标识符正确性
□ 检查与其他模块Schema的一致性
□ 确认工作流编排相关字段定义完整
```

#### **任务1.2: Schema映射基准确立**
```markdown
□ 确认Schema作为类型映射的权威基准
□ 分析workflow_id → workflowId映射关系
□ 分析orchestration_config → orchestrationConfig映射关系
□ 分析module_registry → moduleRegistry映射关系
□ 分析event_handlers → eventHandlers映射关系
□ 建立Core模块Schema映射标准
```

### **步骤2: 核心文件Schema映射修复 (0.6天)**

#### **任务2.1: types.ts完全重写**
```typescript
□ 基于mplp-core.json Schema重写types.ts文件
□ 建立完整的枚举类型体系 (WorkflowStatus, NodeType等)
□ 定义CoreProtocol主接口 (严格映射Schema字段)
□ 定义OrchestrationConfig接口 (映射orchestration_config)
□ 定义ModuleRegistration接口 (映射module_registry)
□ 定义EventHandler接口 (映射event_handlers)
□ 绝对禁止any类型使用
□ 确保TypeScript严格模式编译0错误
```

#### **任务2.2: index.ts和module.ts修复**
```typescript
□ 修复src/modules/core/index.ts导出定义
□ 修复src/modules/core/module.ts模块配置
□ 确保所有导出类型与Schema映射一致
□ 建立清晰的模块接口定义
□ ESLint检查0错误0警告
```

### **阶段2: 类型系统重构 (1天)**

#### **任务2.1: types.ts完全重写**
```typescript
// 核心类型定义
export enum WorkflowExecutionMode {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  HYBRID = 'hybrid'
}

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface CoreProtocol {
  version: string;
  id: string;
  timestamp: string;
  workflowId: string;
  orchestrationConfig: OrchestrationConfig;
  moduleRegistry: ModuleRegistration[];
  eventHandlers: EventHandler[];
  stateManagement: StateManagement;
  metadata?: Record<string, unknown>;
}

export interface OrchestrationConfig {
  executionMode: WorkflowExecutionMode;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  concurrencyLimit?: number;
  priorityLevel: number;
}

export interface ModuleRegistration {
  moduleId: string;
  moduleName: string;
  moduleType: string;
  dependencies: string[];
  configuration: Record<string, unknown>;
  healthCheck: HealthCheckConfig;
}

export interface EventHandler {
  eventType: string;
  handlerFunction: string;
  priority: number;
  async: boolean;
  retryable: boolean;
}

export interface StateManagement {
  stateStore: StateStore;
  persistenceConfig: PersistenceConfig;
  syncStrategy: SyncStrategy;
}
```

#### **任务2.2: 工作流编排类型定义**
```typescript
□ 定义WorkflowDefinition接口
□ 定义WorkflowExecution接口
□ 定义WorkflowStep接口
□ 定义WorkflowCondition接口
□ 定义WorkflowResult接口
```

#### **任务2.3: 模块管理类型定义**
```typescript
□ 定义ModuleManager接口
□ 定义ModuleLifecycle接口
□ 定义ModuleDependency接口
□ 定义ModuleHealth接口
□ 定义ModuleConfiguration接口
```

#### **任务2.4: 事件系统类型定义**
```typescript
□ 定义EventBus接口
□ 定义EventSubscription接口
□ 定义EventPayload接口
□ 定义EventFilter接口
□ 定义EventMetrics接口
```

### **阶段3: 导入路径修复 (0.5天)**

#### **任务3.1: 路径映射分析**
```markdown
□ 分析当前导入路径结构
□ 识别循环依赖问题
□ 制定统一路径规范
□ 设计模块间接口
```

#### **任务3.2: 批量路径修复**
```typescript
// 标准导入路径结构
import {
  CoreProtocol,
  WorkflowExecutionMode,
  WorkflowStatus,
  OrchestrationConfig,
  ModuleRegistration,
  EventHandler,
  StateManagement
} from '../types';

import { BaseEntity } from '../../../public/shared/types';
import { Logger } from '../../../public/utils/logger';
import { ValidationError } from '../../../public/shared/errors';
```

#### **任务3.3: 循环依赖解决**
```markdown
□ 识别Core模块的循环依赖
□ 重构接口定义打破循环
□ 使用依赖注入解决强耦合
□ 验证依赖关系的正确性
```

### **阶段4: 接口一致性修复 (0.5-1天)**

#### **任务4.1: Schema-Application映射**
```typescript
// Schema (snake_case) → Application (camelCase)
{
  "workflow_id": "string",           // → workflowId: string
  "orchestration_config": "object", // → orchestrationConfig: OrchestrationConfig
  "module_registry": "array",       // → moduleRegistry: ModuleRegistration[]
  "event_handlers": "array",        // → eventHandlers: EventHandler[]
  "state_management": "object"      // → stateManagement: StateManagement
}
```

#### **任务4.2: 方法签名标准化**
```typescript
□ 修复WorkflowOrchestrator方法签名
□ 修复ModuleManager方法签名
□ 修复EventBus方法签名
□ 修复StateManager方法签名
□ 统一异步操作返回类型
```

#### **任务4.3: 数据转换修复**
```typescript
□ 修复工作流数据转换逻辑
□ 修复模块注册数据转换
□ 修复事件数据转换
□ 修复状态数据转换
□ 确保类型安全的数据流
```

### **阶段5: 质量验证优化 (0.5天)**

#### **任务5.1: 编译验证**
```bash
□ 运行TypeScript编译检查
□ 确保0个编译错误
□ 验证类型推断正确性
□ 检查导入路径有效性
```

#### **任务5.2: 代码质量验证**
```bash
□ 运行ESLint检查
□ 确保0个错误和警告
□ 验证代码风格一致性
□ 检查any类型使用情况
```

#### **任务5.3: 功能验证**
```bash
□ 运行Core模块单元测试
□ 验证工作流编排功能
□ 测试模块注册机制
□ 验证事件处理系统
□ 测试状态管理功能
```

## ✅ **修复检查清单**

### **类型定义检查**
```markdown
□ CoreProtocol接口完整定义
□ 工作流编排类型完整
□ 模块管理类型完整
□ 事件系统类型完整
□ 状态管理类型完整
□ 所有枚举类型正确定义
□ 复杂类型嵌套正确
□ 泛型类型使用正确
```

### **接口一致性检查**
```markdown
□ Schema与Application层映射正确
□ 方法签名类型匹配
□ 返回类型统一标准
□ 参数类型精确定义
□ 异步操作类型安全
□ 错误处理类型完整
□ 数据转换类型正确
□ 配置类型验证完整
```

### **代码质量检查**
```markdown
□ TypeScript编译0错误
□ ESLint检查0错误0警告
□ 无any类型使用
□ 导入路径规范统一
□ 循环依赖完全解决
□ 代码风格一致
□ 注释文档完整
□ 性能无明显下降
```

## 🎯 **预期修复效果**

### **修复前预估状态**
```
TypeScript错误: 60-80个
ESLint错误: 20-30个
编译状态: 失败
功能状态: 部分可用
代码质量: 4.0/10
技术债务: 严重
```

### **修复后目标状态**
```
TypeScript错误: 0个 ✅
ESLint错误: 0个 ✅
编译状态: 成功 ✅
功能状态: 完全可用 ✅
代码质量: 9.5/10 ✅
技术债务: 零 ✅
```

### **质量提升指标**
```
编译成功率: 提升100%
类型安全性: 提升300%+
代码可维护性: 提升250%+
开发效率: 提升400%+
系统稳定性: 提升200%+
```

## ⚠️ **风险评估和应对**

### **高风险点**
```markdown
风险1: 工作流编排逻辑复杂
应对: 分步骤重构，保持功能完整性

风险2: 模块间依赖关系复杂
应对: 仔细分析依赖，使用接口解耦

风险3: 异步操作类型安全
应对: 使用Promise类型，确保错误处理

风险4: 性能影响
应对: 增量修复，持续性能监控
```

### **应急预案**
```markdown
预案1: 修复过程中功能异常
- 立即回滚到修复前状态
- 分析问题原因
- 调整修复策略

预案2: 修复时间超出预期
- 分阶段提交修复
- 优先修复阻塞性问题
- 调整后续模块修复计划
```

## 📚 **参考资料**

### **技术文档**
- Core模块Schema: `schemas/mplp-core.json`
- 工作流编排文档: `docs/core/workflow-orchestration.md`
- 模块管理文档: `docs/core/module-management.md`

### **修复参考**
- Plan模块修复案例: `03-Plan-Module-Source-Code-Repair-Methodology.md`
- 修复方法论: `00-Source-Code-Repair-Methodology-Overview.md`
- 快速参考指南: `Quick-Repair-Reference-Guide.md`

---

**任务状态**: 📋 待执行  
**负责人**: 待分配  
**开始时间**: 待定  
**预期完成**: 2-3天  
**最后更新**: 2025-08-07
