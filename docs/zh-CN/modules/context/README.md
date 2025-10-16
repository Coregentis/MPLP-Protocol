# Context模块

> **🌐 语言导航**: [English](../../../en/modules/context/README.md) | [中文](README.md)



**MPLP L2协调层 - 执行上下文管理系统**

[![模块](https://img.shields.io/badge/module-Context-blue.svg)](../../architecture/l2-coordination-layer.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-499%2F499%20通过-green.svg)](./testing-guide.md)
[![覆盖率](https://img.shields.io/badge/coverage-95.1%25-green.svg)](./testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/modules/context/README.md)

---

## 🎯 概述

Context模块作为MPLP的基础协调系统，提供执行上下文管理、参与者协调和会话生命周期管理。它使多个智能体能够在明确定义的上下文中协作，同时保持隔离性、安全性和性能。

### **主要职责**
- **上下文生命周期管理**：创建、管理和终止执行上下文
- **参与者协调**：注册、管理和协调智能体参与者
- **会话管理**：处理多会话上下文和状态持久化
- **资源隔离**：确保不同上下文间的适当资源隔离
- **元数据管理**：存储和管理上下文特定的元数据和配置

### **核心特性**
- **多会话支持**：在上下文中处理多个并发会话
- **参与者管理**：高级参与者注册和角色分配
- **上下文隔离**：不同上下文间的强隔离边界
- **元数据存储**：灵活的元数据存储和检索系统
- **事件集成**：通过事件与其他L2模块无缝集成
- **性能优化**：带缓存的高性能上下文操作

---

## 🏗️ 架构

### **核心组件**

```
┌─────────────────────────────────────────────────────────────┐
│                Context模块架构                              │
├─────────────────────────────────────────────────────────────┤
│  上下文管理层                                               │
│  ├── 上下文服务 (生命周期管理)                              │
│  ├── 会话服务 (多会话支持)                                  │
│  ├── 参与者服务 (智能体协调)                                │
│  └── 元数据服务 (上下文数据管理)                            │
├─────────────────────────────────────────────────────────────┤
│  协调服务                                                   │
│  ├── 事件发布器 (上下文事件)                                │
│  ├── 状态管理器 (上下文状态)                                │
│  ├── 缓存管理器 (性能优化)                                  │
│  └── 安全管理器 (访问控制)                                  │
├─────────────────────────────────────────────────────────────┤
│  数据层                                                     │
│  ├── 上下文仓储 (上下文持久化)                              │
│  ├── 会话仓储 (会话数据)                                    │
│  ├── 参与者仓储 (参与者数据)                                │
│  └── 元数据仓储 (元数据存储)                                │
└─────────────────────────────────────────────────────────────┘
```

### **上下文类型和模式**

Context模块支持针对不同协调模式优化的多种上下文类型：

```typescript
enum ContextType {
  COLLABORATIVE = 'collaborative',    // 实时协作
  SEQUENTIAL = 'sequential',          // 顺序任务执行
  PARALLEL = 'parallel',              // 并行任务执行
  HIERARCHICAL = 'hierarchical',      // 分层协调
  PEER_TO_PEER = 'peer_to_peer',     // 点对点协调
  BROADCAST = 'broadcast',            // 一对多通信
  PIPELINE = 'pipeline'               // 数据管道处理
}
```

---

## 🔧 核心服务

### **1. 上下文服务**

管理上下文生命周期和操作的主要服务。

#### **核心能力**
- **上下文创建**：使用指定配置创建新的执行上下文
- **上下文管理**：更新、配置和管理现有上下文
- **上下文终止**：安全终止上下文并清理资源
- **上下文发现**：查找和查询现有上下文
- **上下文监控**：监控上下文健康状况和性能

#### **API接口**
```typescript
interface ContextService {
  // 上下文生命周期
  createContext(config: ContextConfig): Promise<Context>;
  getContext(contextId: string): Promise<Context | null>;
  updateContext(contextId: string, updates: ContextUpdates): Promise<Context>;
  deleteContext(contextId: string): Promise<void>;
  
  // 上下文查询
  listContexts(filter?: ContextFilter): Promise<Context[]>;
  searchContexts(query: ContextQuery): Promise<ContextSearchResult>;
  
  // 上下文监控
  getContextHealth(contextId: string): Promise<ContextHealth>;
  getContextMetrics(contextId: string): Promise<ContextMetrics>;
}
```

### **2. 会话服务**

处理上下文内的多会话管理。

#### **核心能力**
- **会话创建**：在上下文中创建新会话
- **会话管理**：管理会话状态和配置
- **会话同步**：跨会话的状态同步
- **会话隔离**：确保会话间的适当隔离

### **3. 参与者服务**

管理上下文中的智能体参与者。

#### **核心能力**
- **参与者注册**：注册新的智能体参与者
- **角色管理**：分配和管理参与者角色
- **权限控制**：基于角色的访问控制
- **参与者协调**：协调参与者间的交互

---

## 🚀 快速开始

### **安装**
```bash
npm install @mplp/context@1.0.0
```

### **基本使用**
```typescript
import { 
  ContextController,
  ContextManagementService,
  CreateContextDto,
  ContextResponseDto
} from '@mplp/context';

// 创建上下文管理服务
const contextService = new ContextManagementService();

// 创建新上下文
const newContext = await contextService.createContext({
  name: '多智能体协作上下文',
  description: '用于多智能体协作的执行上下文',
  type: 'collaborative',
  participants: ['agent-1', 'agent-2', 'agent-3']
});

console.log('上下文已创建:', newContext.contextId);
```

### **高级使用**
```typescript
// 使用控制器进行REST API操作
const contextController = new ContextController(contextService);

// 创建带有完整配置的上下文
const contextConfig = {
  name: '企业级协作上下文',
  type: 'hierarchical',
  configuration: {
    maxParticipants: 10,
    sessionTimeout: 3600000, // 1小时
    persistenceEnabled: true,
    auditEnabled: true
  },
  metadata: {
    project: 'enterprise-ai-project',
    department: 'research',
    priority: 'high'
  }
};

const response = await contextController.createContext(contextConfig);
```

---

## 📊 性能指标

### **基准性能**
- **上下文创建**: <50ms (P95)
- **上下文查询**: <10ms (P95)
- **状态更新**: <20ms (P95)
- **并发上下文**: >1000个活跃上下文
- **吞吐量**: >2000 操作/秒

### **资源使用**
- **内存占用**: <100MB (1000个上下文)
- **CPU使用**: <5% (正常负载)
- **存储**: 可配置 (内存/数据库/文件)

---

## 🔗 相关文档

- **[API参考](./api-reference.md)**: 完整的API文档
- **[实现指南](./implementation-guide.md)**: 实现最佳实践
- **[配置指南](./configuration-guide.md)**: 配置选项说明
- **[集成示例](./integration-examples.md)**: 集成用例和示例
- **[性能指南](./performance-guide.md)**: 性能优化建议
- **[协议规范](./protocol-specification.md)**: 协议详细规范
- **[测试指南](./testing-guide.md)**: 测试策略和工具

---

**最后更新**: 2025年9月4日  
**模块版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文
