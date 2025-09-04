# Context模块API参考

**跨智能体的共享状态和上下文管理 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Context%20模块-blue.svg)](./README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--context.json-green.svg)](../../schemas/README.md)
[![状态](https://img.shields.io/badge/status-生产就绪-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../../en/modules/context/api-reference.md)

---

## 🎯 概述

Context API为多智能体系统提供全面的上下文管理功能。它使智能体能够共享状态、协调活动，并在分布式操作中保持一致的上下文。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  ContextController,
  ContextManagementService,
  CreateContextDto,
  UpdateContextDto,
  ContextResponseDto
} from 'mplp/modules/context';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const contextModule = mplp.getModule('context');
```

## 🏗️ 核心接口

### **ContextResponseDto** (响应接口)

```typescript
interface ContextResponseDto {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  contextId: string;              // 唯一上下文标识符
  name: string;                   // 上下文名称
  description?: string;           // 上下文描述
  status: ContextStatus;          // 上下文状态
  lifecycleStage: LifecycleStage; // 生命周期阶段
  
  // 核心功能字段
  sharedState: SharedState;       // 共享状态数据
  accessControl: AccessControl;   // 访问控制配置
  configuration: Configuration;   // 上下文配置
  auditTrail: AuditTrail;        // 审计跟踪信息
  
  // 扩展字段
  participants?: Participant[];   // 参与者列表
  sessions?: Session[];          // 会话列表
  metadata?: Record<string, any>; // 自定义元数据
  tags?: string[];               // 标签列表
}
```

### **CreateContextDto** (创建请求接口)

```typescript
interface CreateContextDto {
  name: string;                   // 必需：上下文名称
  description?: string;           // 可选：上下文描述
  type?: ContextType;            // 可选：上下文类型
  
  // 初始配置
  sharedState?: Partial<SharedState>;
  accessControl?: Partial<AccessControl>;
  configuration?: Partial<Configuration>;
  
  // 参与者和会话
  participants?: string[];        // 初始参与者ID列表
  initialSessions?: number;       // 初始会话数量
  
  // 元数据
  metadata?: Record<string, any>;
  tags?: string[];
}
```

### **UpdateContextDto** (更新请求接口)

```typescript
interface UpdateContextDto {
  name?: string;                  // 可选：更新名称
  description?: string;           // 可选：更新描述
  status?: ContextStatus;         // 可选：更新状态
  
  // 部分更新字段
  sharedState?: Partial<SharedState>;
  accessControl?: Partial<AccessControl>;
  configuration?: Partial<Configuration>;
  
  // 元数据更新
  metadata?: Record<string, any>;
  tags?: string[];
}
```

## 🔧 核心枚举类型

### **ContextStatus** (上下文状态)

```typescript
enum ContextStatus {
  ACTIVE = 'active',              // 活跃状态
  INACTIVE = 'inactive',          // 非活跃状态
  SUSPENDED = 'suspended',        // 暂停状态
  COMPLETED = 'completed',        // 已完成状态
  FAILED = 'failed',              // 失败状态
  ARCHIVED = 'archived'           // 已归档状态
}
```

### **LifecycleStage** (生命周期阶段)

```typescript
enum LifecycleStage {
  PLANNING = 'planning',          // 规划阶段
  EXECUTING = 'executing',        // 执行阶段
  MONITORING = 'monitoring',      // 监控阶段
  COMPLETING = 'completing',      // 完成阶段
  CLEANUP = 'cleanup'             // 清理阶段
}
```

### **ContextType** (上下文类型)

```typescript
enum ContextType {
  COLLABORATIVE = 'collaborative',    // 协作型
  SEQUENTIAL = 'sequential',          // 顺序型
  PARALLEL = 'parallel',              // 并行型
  HIERARCHICAL = 'hierarchical',      // 分层型
  PEER_TO_PEER = 'peer_to_peer',     // 点对点型
  BROADCAST = 'broadcast',            // 广播型
  PIPELINE = 'pipeline'               // 管道型
}
```

## 🎮 控制器API

### **ContextController**

主要的REST API控制器，提供HTTP端点访问。

#### **创建上下文**
```typescript
async createContext(dto: CreateContextDto): Promise<ContextResponseDto>
```

**HTTP端点**: `POST /api/contexts`

**请求示例**:
```json
{
  "name": "多智能体协作上下文",
  "description": "用于AI智能体协作的执行环境",
  "type": "collaborative",
  "participants": ["agent-1", "agent-2"],
  "configuration": {
    "maxParticipants": 5,
    "sessionTimeout": 3600000
  }
}
```

**响应示例**:
```json
{
  "protocolVersion": "1.0.0",
  "timestamp": "2025-09-04T10:30:00.000Z",
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "多智能体协作上下文",
  "description": "用于AI智能体协作的执行环境",
  "status": "active",
  "lifecycleStage": "planning",
  "sharedState": {
    "variables": {},
    "resources": {"allocated": {}, "limits": {}},
    "dependencies": [],
    "goals": []
  }
}
```

#### **获取上下文**
```typescript
async getContext(contextId: string): Promise<ContextResponseDto | null>
```

**HTTP端点**: `GET /api/contexts/{contextId}`

#### **更新上下文**
```typescript
async updateContext(contextId: string, dto: UpdateContextDto): Promise<ContextResponseDto>
```

**HTTP端点**: `PUT /api/contexts/{contextId}`

#### **删除上下文**
```typescript
async deleteContext(contextId: string): Promise<void>
```

**HTTP端点**: `DELETE /api/contexts/{contextId}`

#### **列出上下文**
```typescript
async listContexts(filter?: ContextFilter): Promise<ContextResponseDto[]>
```

**HTTP端点**: `GET /api/contexts`

**查询参数**:
- `status`: 按状态过滤
- `type`: 按类型过滤
- `participant`: 按参与者过滤
- `limit`: 限制结果数量
- `offset`: 分页偏移量

## 🔧 服务层API

### **ContextManagementService**

核心业务逻辑服务，提供上下文管理功能。

#### **主要方法**

```typescript
class ContextManagementService {
  // 基础CRUD操作
  async createContext(data: CreateContextData): Promise<ContextEntity>;
  async getContextById(contextId: string): Promise<ContextEntity | null>;
  async updateContext(contextId: string, updates: UpdateContextData): Promise<ContextEntity>;
  async deleteContext(contextId: string): Promise<void>;
  
  // 高级查询
  async findContextsByParticipant(participantId: string): Promise<ContextEntity[]>;
  async findContextsByStatus(status: ContextStatus): Promise<ContextEntity[]>;
  async searchContexts(query: ContextSearchQuery): Promise<ContextSearchResult>;
  
  // 状态管理
  async activateContext(contextId: string): Promise<void>;
  async suspendContext(contextId: string): Promise<void>;
  async completeContext(contextId: string): Promise<void>;
  
  // 参与者管理
  async addParticipant(contextId: string, participantId: string): Promise<void>;
  async removeParticipant(contextId: string, participantId: string): Promise<void>;
  async getParticipants(contextId: string): Promise<Participant[]>;
  
  // 共享状态管理
  async updateSharedState(contextId: string, updates: Partial<SharedState>): Promise<void>;
  async getSharedState(contextId: string): Promise<SharedState>;
  
  // 性能和监控
  async getContextMetrics(contextId: string): Promise<ContextMetrics>;
  async getContextHealth(contextId: string): Promise<ContextHealth>;
}
```

## 📊 数据结构

### **SharedState** (共享状态)

```typescript
interface SharedState {
  variables: Record<string, any>;     // 共享变量
  resources: {                       // 资源管理
    allocated: Record<string, any>;
    limits: Record<string, number>;
  };
  dependencies: string[];            // 依赖关系
  goals: Goal[];                     // 目标列表
}
```

### **AccessControl** (访问控制)

```typescript
interface AccessControl {
  owner: {                          // 所有者信息
    userId: string;
    role: string;
  };
  permissions: Permission[];        // 权限列表
  restrictions?: Restriction[];     // 限制条件
}
```

### **Configuration** (配置)

```typescript
interface Configuration {
  timeoutSettings: {               // 超时设置
    defaultTimeout: number;
    maxTimeout: number;
  };
  persistence: {                   // 持久化设置
    enabled: boolean;
    storageBackend: string;
  };
  performance?: {                  // 性能设置
    cacheEnabled: boolean;
    maxCacheSize: number;
  };
}
```

---

## 🔗 相关文档

- **[实现指南](./implementation-guide.md)**: 详细实现说明
- **[配置指南](./configuration-guide.md)**: 配置选项参考
- **[集成示例](./integration-examples.md)**: 实际使用示例
- **[协议规范](./protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 生产就绪  
**语言**: 简体中文
