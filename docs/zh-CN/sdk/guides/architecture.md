# MPLP架构指南

> **🎯 目标**: 深入理解MPLP架构设计  
> **📚 适用对象**: 架构师、高级开发者  
> **🌐 语言**: [English](../../docs-sdk-en/guides/architecture.md) | 中文

---

## 📋 **目录**

1. [整体架构](#整体架构)
2. [L1-L3协议栈](#l1-l3协议栈)
3. [10个核心模块](#10个核心模块)
4. [SDK架构](#sdk架构)
5. [设计原则](#设计原则)

---

## 🏗️ **整体架构**

### **1.1 四层架构**

```
┌─────────────────────────────────────────┐
│  L4: Agent Layer (应用层)                │
│  - 具体Agent实现                         │
│  - 业务逻辑                              │
│  - AI决策和学习                          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  L3: Execution Layer (执行层)            │
│  - CoreOrchestrator (中央协调器)         │
│  - 工作流编排                            │
│  - 资源管理                              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  L2: Coordination Layer (协调层)         │
│  - 10个核心模块                          │
│  - 模块间协作                            │
│  - 预留接口                              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  L1: Protocol Layer (协议层)             │
│  - 9个横切关注点                         │
│  - Schema定义                            │
│  - 接口规范                              │
└─────────────────────────────────────────┘
```

### **1.2 架构定位**

**MPLP是什么**:
- ✅ 智能Agent构建框架协议
- ✅ L1-L3协议栈提供标准化基础设施
- ✅ 支持Agent组合和协作的"积木"

**MPLP不是什么**:
- ❌ 不是具有AI大脑的智能Agent
- ❌ 不实现AI决策算法
- ❌ 不包含机器学习模型

---

## 🔧 **L1-L3协议栈**

### **2.1 L1: Protocol Layer (协议层)**

**9个横切关注点**:

1. **Schema定义** - JSON Schema标准
2. **类型系统** - TypeScript类型定义
3. **错误处理** - 统一错误机制
4. **日志记录** - 结构化日志
5. **性能监控** - 性能指标收集
6. **安全审计** - 安全事件记录
7. **配置管理** - 配置加载和验证
8. **事件系统** - 事件发布订阅
9. **数据验证** - Schema验证

**设计原则**:
- 厂商中立
- 标准化接口
- 可扩展性

### **2.2 L2: Coordination Layer (协调层)**

**10个核心模块**:

```
┌──────────────┬──────────────┬──────────────┐
│   Context    │     Plan     │     Role     │
│  上下文管理   │   规划协调    │   角色权限    │
├──────────────┼──────────────┼──────────────┤
│   Confirm    │    Trace     │  Extension   │
│  审批确认     │   执行跟踪    │   扩展管理    │
├──────────────┼──────────────┼──────────────┤
│   Dialog     │    Collab    │   Network    │
│  对话管理     │   协作决策    │   网络通信    │
├──────────────┴──────────────┴──────────────┤
│              Core (核心协调)                │
│          CoreOrchestrator                  │
└────────────────────────────────────────────┘
```

**模块职责**:

1. **Context** - 上下文生命周期管理
   - 创建、更新、查询上下文
   - 多会话状态管理
   - 上下文同步和搜索

2. **Plan** - AI驱动规划算法
   - 任务分解和优先级
   - 资源分配
   - 执行计划生成

3. **Role** - 企业RBAC安全中心
   - 角色定义和权限管理
   - 访问控制
   - 安全审计

4. **Confirm** - 企业级审批工作流
   - 多级审批流程
   - 审批策略管理
   - 审批历史追踪

5. **Trace** - 执行监控系统
   - 执行跟踪
   - 性能监控
   - 问题诊断

6. **Extension** - 扩展管理系统
   - 扩展加载和卸载
   - 生命周期管理
   - 依赖解析

7. **Dialog** - 智能对话管理
   - 对话流程控制
   - 上下文保持
   - 多轮对话

8. **Collab** - 多Agent协作
   - 协作决策
   - 任务分配
   - 结果聚合

9. **Network** - 分布式通信
   - 节点发现
   - 消息路由
   - 网络弹性

10. **Core** - 中央协调
    - 模块协调
    - 资源管理
    - 错误处理

### **2.3 L3: Execution Layer (执行层)**

**CoreOrchestrator职责**:

```typescript
class CoreOrchestrator {
  // 模块协调
  async coordinateModules(scenario: string): Promise<void>
  
  // 资源管理
  async allocateResources(request: ResourceRequest): Promise<void>
  
  // 工作流编排
  async orchestrateWorkflow(workflow: Workflow): Promise<void>
  
  // 错误恢复
  async handleError(error: Error): Promise<void>
}
```

**协调场景**:
1. 模块初始化协调
2. 跨模块事务管理
3. 资源分配和调度
4. 错误传播和恢复
5. 性能监控和优化

---

## 📦 **10个核心模块**

### **3.1 模块架构模式**

所有模块遵循统一的DDD架构:

```
module/
├── domain/              # 领域层
│   ├── entities/        # 实体
│   ├── value-objects/   # 值对象
│   └── repositories/    # 仓储接口
├── application/         # 应用层
│   ├── services/        # 应用服务
│   └── use-cases/       # 用例
├── infrastructure/      # 基础设施层
│   ├── persistence/     # 持久化
│   └── adapters/        # 适配器
└── interfaces/          # 接口层
    ├── api/             # API接口
    └── events/          # 事件接口
```

### **3.2 模块间协作**

**预留接口模式**:
```typescript
// 模块方法签名
async method(
  param1: Type1,
  param2: Type2,
  _coreOrchestrator?: CoreOrchestrator  // 预留参数
): Promise<Result>
```

**事件驱动协作**:
```typescript
// 发布事件
eventBus.emit('context.created', { contextId });

// 订阅事件
eventBus.on('context.created', async (data) => {
  // 其他模块响应
});
```

---

## 🎯 **SDK架构**

### **4.1 SDK核心组件**

```
SDK
├── MPLP类 (主入口)
│   ├── initialize()
│   ├── getModule()
│   └── getVersion()
├── 工厂函数
│   ├── createMPLP()
│   ├── quickStart()
│   ├── createProductionMPLP()
│   └── createTestMPLP()
└── 配置接口
    └── MPLPConfig
```

### **4.2 模块加载机制**

```typescript
// 按需加载
const mplp = await createMPLP({
  modules: ['context', 'plan', 'role']
});

// 动态加载
const contextModule = mplp.getModule('context');
```

---

## 🔑 **设计原则**

### **5.1 SOLID原则**

- **S**ingle Responsibility - 单一职责
- **O**pen/Closed - 开闭原则
- **L**iskov Substitution - 里氏替换
- **I**nterface Segregation - 接口隔离
- **D**ependency Inversion - 依赖倒置

### **5.2 厂商中立原则**

```typescript
// ✅ 正确：通用接口
interface IStorage {
  save(data: any): Promise<void>;
  load(id: string): Promise<any>;
}

// ❌ 错误：绑定特定厂商
class MongoDBStorage { }
```

### **5.3 协议与Agent分离**

```
协议 (MPLP L1-L3)
  ↓ 提供基础设施
Agent (L4)
  ↓ 实现业务逻辑
应用
```

---

## 📊 **性能架构**

### **6.1 性能目标**

| 操作 | 目标 | 实际 |
|------|------|------|
| 模块初始化 | <100ms | ~50ms |
| API调用 | <10ms | ~5ms |
| 协议解析 | <10ms | ~3ms |
| 权限检查 | <10ms | ~2ms |

### **6.2 优化策略**

- 模块懒加载
- 结果缓存
- 连接池
- 批量操作

---

## 🔗 **相关资源**

- [最佳实践](best-practices.md)
- [测试指南](testing.md)
- [部署指南](deployment.md)
- [API参考](../api-reference/sdk-core.md)

---

**版本**: v1.1.0-beta  
**更新时间**: 2025-10-22  
**维护者**: MPLP Team

