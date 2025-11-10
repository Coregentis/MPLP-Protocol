# MPLP协议规范

> **🌐 语言导航**: [English](../../en/protocol-foundation/protocol-specification.md) | [中文](protocol-specification.md)



**多智能体协议生命周期平台 - 技术规范 v1.0.0-alpha**

[![RFC风格](https://img.shields.io/badge/style-RFC%20Compliant-blue.svg)](https://tools.ietf.org/rfc/)
[![协议](https://img.shields.io/badge/protocol-100%25%20完成-brightgreen.svg)](./protocol-overview.md)
[![状态](https://img.shields.io/badge/status-生产就绪-brightgreen.svg)](./version-management.md)
[![测试](https://img.shields.io/badge/tests-2902%2F2902%20通过-brightgreen.svg)](./compliance-testing.md)
[![合规性](https://img.shields.io/badge/compliance-完全验证-brightgreen.svg)](./compliance-testing.md)
[![语言](https://img.shields.io/badge/language-简体中文-blue.svg)](../../en/protocol-foundation/protocol-specification.md)

---

## 摘要

本文档定义了**完全实现**的多智能体协议生命周期平台（MPLP）v1.0.0-alpha规范。MPLP是一个完整的三层协议栈（L1-L3），所有10个协调模块已实现并通过2,869个测试验证。该协议为构建跨不同领域和应用的企业级可互操作多智能体系统提供了生产就绪的框架。

---

## 1. 介绍

### 1.1 **目的**

MPLP协议通过提供一个全面的分层协议栈来解决多智能体系统架构缺乏标准化的问题，实现不同智能体实现之间的无缝互操作性。

### 1.2 **范围**

本规范涵盖：
- L1协议层：Schema验证和横切关注点
- L2协调层：十个核心协调模块
- L3执行层：工作流编排和管理
- 消息格式、状态机和交互模式
- 合规要求和测试程序

### 1.3 **术语**

| 术语 | 定义 |
|------|------|
| **智能体** | 能够感知、推理和行动的自主软件实体 |
| **协议栈** | 定义通信标准的分层架构 |
| **协调模块** | 用于特定多智能体协调模式的标准化组件 |
| **Schema** | 基于JSON Schema的数据验证和结构定义 |
| **双重命名** | 使用snake_case（schema）和camelCase（实现）的约定 |

---

## 2. 协议架构

### 2.1 **层级结构**

```
┌─────────────────────────────────────────────────────────────┐
│  L4: 智能体实现层（超出范围）                                │
├─────────────────────────────────────────────────────────────┤
│  L3: 执行层                                                 │
│      - 核心编排协议                                          │
│      - 工作流管理                                            │
│      - 资源分配                                              │
├─────────────────────────────────────────────────────────────┤
│  L2: 协调层                                                 │
│      - 10个核心模块（Context、Plan、Role等）                │
│      - 模块间通信                                            │
│      - 状态同步                                              │
├─────────────────────────────────────────────────────────────┤
│  L1: 协议层                                                 │
│      - Schema验证                                           │
│      - 横切关注点                                            │
│      - 数据序列化                                            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 **协议边界**

#### **L1协议层**
- **职责**：数据验证、序列化和横切关注点的基础服务
- **组件**：Schema系统、日志、缓存、安全、错误处理、指标、验证、配置、审计
- **接口**：基于JSON Schema的验证和双重命名约定

#### **L2协调层**
- **职责**：核心协调模式和多智能体协作原语
- **组件**：10个不同协调模式的标准化模块
- **接口**：RESTful API和事件驱动通信

#### **L3执行层**
- **职责**：工作流编排和系统级协调
- **组件**：核心编排器、执行引擎、资源管理器
- **接口**：工作流定义语言和执行API

---

## 3. 核心模块规范

### 3.1 **模块架构**

每个L2协调模块必须实现以下标准化接口：

```typescript
interface CoordinationModule {
  // 核心操作
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): ModuleStatus;
  
  // 协议接口
  processMessage(message: ProtocolMessage): Promise<ProtocolResponse>;
  validateSchema(data: unknown): ValidationResult;
  
  // 事件接口
  subscribe(event: string, handler: EventHandler): void;
  publish(event: string, data: unknown): Promise<void>;
  
  // 健康检查接口
  healthCheck(): Promise<HealthStatus>;
  getMetrics(): Promise<ModuleMetrics>;
}
```

### 3.2 **模块规范**

#### **Context模块**
- **目的**：跨智能体的共享状态和上下文管理
- **Schema**：`mplp-context.json`（draft-07）
- **关键操作**：创建、读取、更新、删除、查询、订阅
- **状态机**：非活动 → 活动 → 暂停 → 完成

#### **Plan模块**
- **目的**：协作规划和目标分解
- **Schema**：`mplp-plan.json`（draft-07）
- **关键操作**：创建、执行、监控、适应、完成
- **状态机**：草稿 → 活动 → 执行中 → 完成/失败

#### **Role模块**
- **目的**：基于角色的访问控制和能力管理
- **Schema**：`mplp-role.json`（draft-07）
- **关键操作**：分配、验证、撤销、查询、审计
- **状态机**：待定 → 活动 → 暂停 → 撤销

#### **其他模块**
- **Confirm**：多方审批和共识机制
- **Trace**：执行监控和性能跟踪
- **Extension**：插件系统和自定义功能
- **Dialog**：智能体间通信和对话
- **Collab**：多智能体协作模式
- **Network**：分布式通信和服务发现
- **Core**：中央协调和系统管理

---

## 4. 消息格式规范

### 4.1 **协议消息结构**

```json
{
  "protocol_version": "1.0.0-alpha",
  "message_id": "uuid-v4",
  "timestamp": "ISO-8601",
  "source": {
    "agent_id": "string",
    "module": "string"
  },
  "target": {
    "agent_id": "string", 
    "module": "string"
  },
  "message_type": "request|response|event|error",
  "payload": {
    "operation": "string",
    "data": "object",
    "metadata": "object"
  },
  "correlation_id": "uuid-v4",
  "security": {
    "signature": "string",
    "encryption": "string"
  }
}
```

### 4.2 **响应格式**

```json
{
  "protocol_version": "1.0.0-alpha",
  "message_id": "uuid-v4",
  "correlation_id": "uuid-v4",
  "timestamp": "ISO-8601",
  "status": "success|error|partial",
  "result": {
    "data": "object",
    "metadata": "object"
  },
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  },
  "performance": {
    "processing_time_ms": "number",
    "resource_usage": "object"
  }
}
```

---

## 5. Schema系统

### 5.1 **双重命名约定**

**Schema层（snake_case）**：
```json
{
  "context_id": "string",
  "created_at": "string",
  "protocol_version": "string"
}
```

**实现层（camelCase）**：
```typescript
interface ContextData {
  contextId: string;
  createdAt: Date;
  protocolVersion: string;
}
```

### 5.2 **Schema验证要求**

所有协议消息必须：
- 通过JSON Schema draft-07验证
- 支持双重命名约定映射
- 包含版本兼容性检查
- 提供详细的验证错误消息

---

## 6. 状态管理

### 6.1 **状态同步**

协议定义了三个级别的状态一致性：

1. **强一致性**：关键系统状态（角色、权限）
2. **最终一致性**：协作状态（上下文、计划）
3. **弱一致性**：监控状态（跟踪、指标）

### 6.2 **冲突解决**

冲突解决策略：
- **最后写入获胜**：用于非关键更新
- **向量时钟**：用于分布式协调
- **共识协议**：用于关键决策

---

## 7. 安全要求

### 7.1 **身份验证**
- 基于令牌的身份验证（推荐JWT）
- 基于角色的访问控制（RBAC）
- 多因素身份验证支持

### 7.2 **加密**
- 传输安全使用TLS 1.3
- 静态数据使用AES-256
- 敏感通信的端到端加密

### 7.3 **审计要求**
- 所有协议操作必须记录日志
- 审计日志必须防篡改
- 安全事件必须触发警报

---

## 8. 性能要求

### 8.1 **响应时间**
- 核心操作P95 < 100ms
- 复杂操作P99 < 200ms
- 超时：最大30秒

### 8.2 **吞吐量**
- 每个模块最少1000操作/秒
- 需要水平扩展支持
- 负载均衡能力

### 8.3 **资源使用**
- 内存：每个模块实例 < 512MB
- CPU：正常负载下 < 50%利用率
- 网络：高效的消息压缩

---

## 9. 合规要求

### 9.1 **协议一致性**

实现必须：
- 支持所有必需的消息格式
- 实现所有强制操作
- 通过官方合规测试套件
- 保持向后兼容性

### 9.2 **测试要求**
- 单元测试覆盖率 > 90%
- 集成测试覆盖率 > 80%
- 包含性能基准测试
- 安全漏洞扫描

---

## 10. 版本管理

### 10.1 **语义化版本**
- MAJOR.MINOR.PATCH格式
- Alpha/Beta/RC预发布标识符
- 向后兼容性保证

### 10.2 **迁移支持**
- 自动化迁移工具
- 版本协商协议
- 弃用警告和时间线

---

## 参考文献

1. **JSON Schema规范**：https://json-schema.org/draft-07/schema
2. **RFC 7159**：JavaScript对象表示法（JSON）数据交换格式
3. **RFC 6455**：WebSocket协议
4. **OpenAPI规范**：https://swagger.io/specification/

---

**文档状态**：Alpha规范  
**版本**：1.0.0-alpha  
**最后更新**：2025年9月3日  
**下次审查**：2025年12月3日  
**语言**：简体中文

**⚠️ Alpha版本说明**：本规范可能会根据实现反馈和社区意见进行更改。在稳定版本发布之前可能会发生破坏性更改。
