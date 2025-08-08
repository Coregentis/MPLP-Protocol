# Core模块源代码修复任务清单 (基于Plan模块8步修复法)

## 📋 **模块概述**

**模块名称**: Core (工作流编排协议)  
**优先级**: P0 (最高优先级)  
**复杂度**: 高  
**预估修复时间**: 2-3天  
**状态**: 📋 待修复  
**修复方法**: 系统性8步修复法 (基于Plan模块验证)

## 🎯 **模块功能分析**

### **Core模块职责**
```markdown
核心功能:
- 工作流编排和协调
- 模块注册和生命周期管理
- 事件总线和消息传递
- 状态管理和持久化
- 异常处理和恢复

关键特性:
- 支持多种执行模式 (顺序/并行/混合)
- 动态模块注册和依赖管理
- 高性能事件处理系统
- 分布式状态同步
- 智能故障恢复机制
```

### **Schema分析**
```json
// 基于mplp-core.json Schema
{
  "workflow_id": "string",
  "orchestration_config": {
    "execution_mode": "string",
    "timeout_ms": "number",
    "retry_policy": "object"
  },
  "module_registry": "array",
  "event_handlers": "array",
  "state_management": "object"
}
```

## 🔧 **系统性8步修复任务 (基于Plan模块成功验证)**

### **步骤1: Schema定义标准一致性检查 (0.2天)**

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
□ 分析state_management → stateManagement映射关系
□ 建立Core模块Schema映射标准
```

### **步骤2: 核心文件Schema映射修复 (0.8天)**

#### **任务2.1: types.ts完全重写 (基于Schema映射)**
```typescript
// 基于mplp-core.json Schema的完整类型定义
export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ExecutionMode {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  HYBRID = 'hybrid'
}

export interface CoreProtocol {
  version: string;
  id: string;
  timestamp: string;
  workflowId: string;           // 映射自 workflow_id
  orchestrationConfig: OrchestrationConfig;  // 映射自 orchestration_config
  moduleRegistry: ModuleRegistration[];      // 映射自 module_registry
  eventHandlers: EventHandler[];             // 映射自 event_handlers
  stateManagement: StateManagement;          // 映射自 state_management
  metadata?: Record<string, unknown>;
}

export interface OrchestrationConfig {
  executionMode: ExecutionMode;    // 映射自 execution_mode
  timeoutMs: number;              // 映射自 timeout_ms
  retryPolicy: RetryPolicy;       // 映射自 retry_policy
  concurrencyLimit?: number;      // 映射自 concurrency_limit
  priorityLevel: number;          // 映射自 priority_level
}

□ 绝对禁止any类型使用 (0个any类型)
□ TypeScript严格模式编译 (0个编译错误)
□ ESLint检查完全通过 (0个错误0警告)
□ 完整Schema字段映射 (100%覆盖)
```

#### **任务2.2: index.ts和module.ts修复**
```typescript
□ 修复src/modules/core/index.ts导出定义
□ 修复src/modules/core/module.ts模块配置
□ 确保所有导出类型与Schema映射一致
□ 建立清晰的模块接口定义
□ ESLint检查0错误0警告
```

### **步骤3: 公共依赖类型定义修复 (0.3天)**

#### **任务3.1: 共享类型统一**
```typescript
□ 修复src/public/shared/types/下Core模块相关共享类型
□ 确保WorkflowStatus、ExecutionMode等枚举与Schema一致
□ 统一BaseWorkflow、BaseModule等基础类型定义
□ 修复src/public/utils/下工具类的类型定义
□ 确保所有公共类型0个any类型使用
```

#### **任务3.2: 导入路径标准化**
```typescript
□ 统一Core模块的导入路径规范
□ 解决循环依赖问题
□ 建立清晰的模块依赖关系
□ 确保导入路径与DDD分层架构一致

// 标准化导入路径示例
import { CoreProtocol, WorkflowStatus } from '../types';
import { BaseEntity } from '../../../public/shared/types';
import { Logger } from '../../../public/utils/logger';
```

### **步骤4: 项目级依赖版本冲突检查 (0.1天)**

#### **任务4.1: 依赖兼容性验证**
```bash
□ 检查Core模块相关依赖版本兼容性
□ 验证工作流引擎相关依赖版本
□ 确认事件处理库版本兼容性
□ 检查异步处理库版本一致性
□ 验证无版本冲突影响类型定义
```

### **步骤5: 模块业务文件逐一修复 (1天)**

#### **任务5.1: DDD分层文件修复**
```typescript
API层修复:
□ core.controller.ts: 控制器类型定义和方法签名
□ workflow.routes.ts: 工作流路由配置类型

Application层修复:
□ workflow-orchestration.service.ts: 编排服务类型定义
□ module-registry.service.ts: 模块注册服务类型
□ event-handling.service.ts: 事件处理服务类型

Domain层修复:
□ workflow.entity.ts: 工作流实体类型定义
□ module.entity.ts: 模块实体类型定义
□ value-objects/: 所有值对象类型定义

Infrastructure层修复:
□ workflow.mapper.ts: 工作流映射器类型定义
□ module-registry.impl.ts: 模块注册实现类型
□ event-bus.impl.ts: 事件总线实现类型

严格执行要求:
□ 每个文件0个any类型使用
□ 每个文件TypeScript编译0错误
□ 每个文件ESLint检查0错误0警告
□ 基于实际业务功能进行类型定义
```

### **步骤6: SRC目录全面类型巡查 (0.2天)**

#### **任务6.1: 全面类型检查**
```bash
□ 巡查src/modules/core/目录下所有.ts文件
□ 检查是否有遗漏的any类型使用
□ 验证所有文件的TypeScript编译状态
□ 确认所有文件的ESLint检查状态
□ 预期扫描文件数: ~60个TypeScript文件
```

### **步骤7: 测试文件修复和四层测试 (0.3天)**

#### **任务7.1: 测试修复和验证**
```bash
□ 修复tests/modules/core/下所有测试文件类型定义
□ 基于实际Schema和业务功能编写测试
□ 执行四层测试验证功能完整性
□ 确保测试覆盖率达到90%+标准

四层测试执行:
□ 功能场景测试: 验证工作流编排完整流程
□ 单元测试: 覆盖所有核心业务逻辑
□ 集成测试: 验证模块间协作
□ 端到端测试: 验证完整业务流程和性能
```

### **步骤8: 文档和目录更新 (0.1天)**

#### **任务8.1: 文档同步更新**
```markdown
□ 更新Core模块README.md文档
□ 更新API文档和Schema文档同步
□ 更新代码注释和JSDoc文档
□ 整理目录结构和文件组织
□ 确保文档与代码完全一致
```

## ✅ **修复检查清单 (基于Plan模块标准)**

### **类型定义检查**
```markdown
□ CoreProtocol接口完整定义 (基于Schema映射)
□ 工作流编排类型完整
□ 模块注册类型完整
□ 事件处理类型完整
□ 状态管理类型完整
□ 所有枚举类型正确定义
□ 复杂类型嵌套正确
□ 异步操作类型安全
```

### **代码质量检查**
```markdown
□ TypeScript编译0错误 (严格模式)
□ ESLint检查0错误0警告
□ 无any类型使用 (绝对禁止)
□ 导入路径规范统一
□ 循环依赖完全解决
□ 代码风格一致
□ 业务注释完整
□ 性能无明显下降
```

## 🎯 **预期修复效果 (基于Plan模块验证)**

### **修复前预估状态**
```
TypeScript错误: 60-80个
ESLint错误: 15-25个
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

---

**任务状态**: 📋 待执行  
**修复方法**: 系统性8步修复法 (Plan模块验证成功)  
**预期完成**: 2-3天  
**质量标准**: Plan模块级别 (370%质量提升)  
**最后更新**: 2025-08-07
