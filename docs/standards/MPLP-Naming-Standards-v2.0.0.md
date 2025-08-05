# MPLP 命名标准和编码规范 v2.0.0

## 📋 **文档信息**

**文档版本**: v2.0.0  
**创建日期**: 2025-08-04  
**最后更新**: 2025-08-04 21:47  
**负责人**: MPLP核心团队  
**状态**: 生效中  

## 🎯 **标准概述**

**目标**: 建立统一的命名标准和编码规范，确保整个MPLP项目的一致性  
**范围**: 所有10个模块、文件、代码、文档、Schema、配置  
**原则**: 清晰、一致、可维护、可扩展  

## 📁 **文件命名标准**

### **Schema文件**
```
格式: mplp-[module].json
示例: 
- mplp-core.json
- mplp-collab.json  
- mplp-role.json
- mplp-dialog.json
- mplp-extension.json
- mplp-context.json
- mplp-plan.json
- mplp-confirm.json
- mplp-trace.json
- mplp-network.json
```

### **TypeScript文件**
```
格式: [module].types.ts, [service].service.ts, [entity].entity.ts
示例:
- core.types.ts
- collaboration-manager.service.ts
- workflow-execution.entity.ts
- module-adapter.base.ts
```

### **测试文件**
```
格式: [module]-[type].test.ts
示例:
- core-functional.test.ts
- collab-unit.test.ts
- dialog-integration.test.ts
- end-to-end.test.ts
```

### **文档文件**
```
格式: [Module]-[Type]-v[Version].md
示例:
- Core-API-Reference-v2.0.0.md
- Collab-User-Guide-v2.0.0.md
- MPLP-Architecture-Overview-v2.0.0.md
```

## 💻 **代码命名标准**

### **接口命名**
```typescript
格式: [Module][Purpose]Interface
示例:
- CoreOrchestratorInterface
- CollabDecisionInterface
- RoleLifecycleInterface
- DialogStateInterface
- ExtensionPluginInterface
```

### **类命名**
```typescript
格式: [Module][Purpose][Type]
示例:
- CoreOrchestrator
- CollaborationManager
- RoleLifecycleService
- DialogStateManager
- ExtensionPluginRegistry
```

### **方法命名**
```typescript
格式: [action][Object][Context?]
示例:
- createContext()
- executeWorkflow()
- coordinateDecision()
- manageLifecycle()
- persistKnowledge()
```

### **常量命名**
```typescript
格式: [MODULE]_[PURPOSE]_[DETAIL]
示例:
- CORE_DEFAULT_TIMEOUT
- COLLAB_MAX_PARTICIPANTS
- ROLE_CREATION_STRATEGIES
- DIALOG_STATE_TRANSITIONS
- EXTENSION_PLUGIN_CATEGORIES
```

## 🏗️ **模块标准**

### **10个标准模块名称**
```
1. core      - 核心协调模块
2. context   - 上下文管理模块
3. plan      - 计划制定模块
4. confirm   - 确认审批模块
5. trace     - 追踪监控模块
6. role      - 角色管理模块
7. extension - 扩展管理模块
8. collab    - 协作决策模块
9. dialog    - 对话交互模块
10. network  - 网络拓扑模块
```

### **模块目录结构**
```
src/modules/[module]/
├── api/                 # API层
├── application/         # 应用层
├── domain/             # 领域层
├── infrastructure/     # 基础设施层
├── types.ts           # 类型定义
└── index.ts           # 模块入口
```

## 📊 **Schema标准**

### **Schema结构标准**
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-[module].json",
  "title": "MPLP [Module] Protocol v1.0",
  "description": "[Module]模块协议Schema - [功能描述]",
  "version": "1.0.0",
  "lastUpdated": "2025-08-04",
  "type": "object",
  "properties": {
    "version": {"type": "string", "const": "1.0"},
    "id": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"},
    "[module]": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "required": ["version", "id", "timestamp", "[module]"]
}
```

## 🔧 **TypeScript标准**

### **基础类型标准**
```typescript
// 统一基础类型
export type UUID = string;
export type Timestamp = string;
export type ModuleName = 'core' | 'context' | 'plan' | 'confirm' | 'trace' | 
                        'role' | 'extension' | 'collab' | 'dialog' | 'network';

// 工作流阶段类型（完整10模块）
export type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace' | 
                           'role' | 'extension' | 'collab' | 'dialog' | 'network';

// 协议模块类型（完整10模块）
export type ProtocolModule = 'context' | 'plan' | 'confirm' | 'trace' | 
                            'role' | 'extension' | 'collab' | 'dialog' | 'network';
```

### **接口定义标准**
```typescript
// 基础协议接口
export interface BaseProtocol {
  version: string;
  id: UUID;
  timestamp: Timestamp;
}

// 请求响应标准
export interface OperationRequest {
  requestId: UUID;
  timestamp: Timestamp;
  // 具体请求字段
}

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  requestId: UUID;
  timestamp: Timestamp;
}

// 配置标准
export interface ModuleConfiguration {
  enabled: boolean;
  timeout: number;
  retryPolicy: RetryPolicy;
  // 模块特定配置
}
```

## 📚 **文档标准**

### **文档版本标准**
```
版本格式: v2.0.0
日期格式: 2025-08-04
状态: 生效中 | 草稿 | 已废弃

文档头部标准:
---
version: v2.0.0
lastUpdated: 2025-08-04
status: 生效中
author: MPLP Team
---
```

### **文档结构标准**
```markdown
# [标题] v2.0.0

## 📋 文档信息
## 🎯 概述
## 🏗️ 主要内容
## 📊 示例
## ✅ 验收标准
## 🔗 相关链接
```

## ✅ **验收标准**

### **命名一致性**
- [ ] 所有文件命名符合标准
- [ ] 所有代码命名符合标准
- [ ] 所有模块命名统一
- [ ] 所有接口命名一致

### **版本一致性**
- [ ] 所有文档版本为v2.0.0
- [ ] 所有文档日期为2025-08-04
- [ ] 所有Schema版本统一
- [ ] 所有代码版本一致

### **结构一致性**
- [ ] 所有模块结构统一
- [ ] 所有Schema结构标准
- [ ] 所有文档结构一致
- [ ] 所有配置格式统一

---

**执行状态**: ✅ 完成  
**审查状态**: 待审查  
**生效日期**: 2025-08-04  
**下次更新**: 根据需要
