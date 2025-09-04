# Dialog API 参考

**智能体间通信和对话 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Dialog%20模块-blue.svg)](../modules/dialog/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--dialog.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-121%2F121%20通过-green.svg)](../modules/dialog/testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/api-reference/dialog-api.md)

---

## 🎯 概述

Dialog API为多智能体系统提供全面的智能体间通信和对话管理功能。它支持智能对话管理、记忆管理、上下文感知对话和企业级通信功能。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  DialogController,
  DialogManagementService,
  CreateDialogDto,
  UpdateDialogDto,
  DialogResponseDto
} from 'mplp/modules/dialog';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const dialogModule = mplp.getModule('dialog');
```

## 🏗️ 核心接口

### **DialogResponseDto** (响应接口)

```typescript
interface DialogResponseDto {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  dialogId: string;               // 唯一对话标识符
  contextId: string;              // 关联的上下文ID
  sessionId: string;              // 对话会话ID
  status: DialogStatus;           // 对话状态
  type: DialogType;               // 对话类型
  
  // 参与者
  participants: DialogParticipant[];
  currentSpeaker?: string;        // 当前发言者ID
  
  // 消息和对话
  messages: DialogMessage[];
  conversationFlow: ConversationFlow;
  
  // 记忆和上下文
  memoryContext: MemoryContext;
  conversationHistory: ConversationSummary[];
  
  // 企业级功能
  auditTrail: DialogAuditTrail;
  performanceMetrics: DialogMetrics;
  
  // 元数据
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateDialogDto** (创建请求接口)

```typescript
interface CreateDialogDto {
  contextId: string;              // 必需：关联的上下文ID
  type: DialogType;               // 必需：对话类型
  
  // 参与者
  participants: Array<{
    participantId: string;
    role: ParticipantRole;
    capabilities?: string[];
  }>;
  
  // 初始配置
  configuration?: DialogConfiguration;
  
  // 初始消息（可选）
  initialMessage?: {
    content: string;
    type: MessageType;
    senderId: string;
  };
  
  // 元数据
  metadata?: Record<string, any>;
}
```

## 🔧 核心枚举类型

### **DialogStatus** (对话状态)

```typescript
enum DialogStatus {
  ACTIVE = 'active',              // 活跃对话
  PAUSED = 'paused',              // 暂停对话
  COMPLETED = 'completed',        // 已完成对话
  TERMINATED = 'terminated',      // 已终止对话
  ERROR = 'error'                 // 错误状态
}
```

### **DialogType** (对话类型)

```typescript
enum DialogType {
  NEGOTIATION = 'negotiation',    // 协商对话
  COLLABORATION = 'collaboration', // 协作对话
  INFORMATION_EXCHANGE = 'information_exchange', // 信息交换
  DECISION_MAKING = 'decision_making', // 决策制定
  PROBLEM_SOLVING = 'problem_solving', // 问题解决
  CASUAL = 'casual'               // 随意对话
}
```

### **MessageType** (消息类型)

```typescript
enum MessageType {
  TEXT = 'text',                  // 文本消息
  STRUCTURED = 'structured',      // 结构化数据
  COMMAND = 'command',            // 命令消息
  RESPONSE = 'response',          // 响应消息
  NOTIFICATION = 'notification',  // 通知
  SYSTEM = 'system'               // 系统消息
}
```

## 🎮 控制器API

### **DialogController**

主要的REST API控制器，提供HTTP端点访问。

#### **创建对话**
```typescript
async createDialog(dto: CreateDialogDto): Promise<DialogOperationResult>
```

**HTTP端点**: `POST /api/dialogs`

**请求示例**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "type": "collaboration",
  "participants": [
    {
      "participantId": "agent-001",
      "role": "facilitator",
      "capabilities": ["natural_language", "decision_support"]
    },
    {
      "participantId": "agent-002",
      "role": "contributor",
      "capabilities": ["data_analysis", "reporting"]
    }
  ],
  "configuration": {
    "maxDuration": 3600000,
    "allowInterruptions": true,
    "memoryRetention": "session"
  },
  "initialMessage": {
    "content": "让我们开始项目分析的协作。",
    "type": "text",
    "senderId": "agent-001"
  }
}
```

#### **发送消息**
```typescript
async sendMessage(dialogId: string, message: DialogMessageDto): Promise<DialogOperationResult>
```

**HTTP端点**: `POST /api/dialogs/{dialogId}/messages`

#### **获取对话**
```typescript
async getDialog(dialogId: string): Promise<DialogResponseDto>
```

**HTTP端点**: `GET /api/dialogs/{dialogId}`

#### **更新对话**
```typescript
async updateDialog(dialogId: string, dto: UpdateDialogDto): Promise<DialogOperationResult>
```

**HTTP端点**: `PUT /api/dialogs/{dialogId}`

#### **结束对话**
```typescript
async endDialog(dialogId: string, reason?: string): Promise<DialogOperationResult>
```

**HTTP端点**: `POST /api/dialogs/{dialogId}/end`

#### **获取对话历史**
```typescript
async getConversationHistory(dialogId: string, pagination?: PaginationParams): Promise<ConversationHistoryResult>
```

**HTTP端点**: `GET /api/dialogs/{dialogId}/history`

## 🔧 服务层API

### **DialogManagementService**

核心业务逻辑服务，提供对话管理功能。

#### **主要方法**

```typescript
class DialogManagementService {
  // 基础CRUD操作
  async createDialog(request: CreateDialogRequest): Promise<DialogEntity>;
  async getDialogById(dialogId: string): Promise<DialogEntity | null>;
  async updateDialog(dialogId: string, request: UpdateDialogRequest): Promise<DialogEntity>;
  async deleteDialog(dialogId: string): Promise<boolean>;
  
  // 消息管理
  async sendMessage(dialogId: string, message: DialogMessage): Promise<MessageResult>;
  async getMessages(dialogId: string, pagination?: PaginationParams): Promise<MessageHistory>;
  async searchMessages(dialogId: string, query: MessageSearchQuery): Promise<MessageSearchResult>;
  
  // 对话管理
  async pauseDialog(dialogId: string): Promise<DialogEntity>;
  async resumeDialog(dialogId: string): Promise<DialogEntity>;
  async endDialog(dialogId: string, reason?: string): Promise<DialogEntity>;
  
  // 记忆和上下文
  async updateMemoryContext(dialogId: string, context: Partial<MemoryContext>): Promise<DialogEntity>;
  async getConversationSummary(dialogId: string): Promise<ConversationSummary>;
  
  // 分析和监控
  async getDialogMetrics(dialogId: string): Promise<DialogMetrics>;
  async getDialogHealth(dialogId: string): Promise<DialogHealth>;
}
```

## 📊 数据结构

### **DialogMessage** (对话消息)

```typescript
interface DialogMessage {
  messageId: string;              // 唯一消息标识符
  senderId: string;               // 发送者参与者ID
  recipientId?: string;           // 接收者ID（广播时可选）
  content: string;                // 消息内容
  type: MessageType;              // 消息类型
  timestamp: Date;                // 消息时间戳
  metadata?: Record<string, any>; // 附加元数据
  attachments?: MessageAttachment[]; // 消息附件
}
```

### **DialogParticipant** (对话参与者)

```typescript
interface DialogParticipant {
  participantId: string;          // 参与者标识符
  role: ParticipantRole;          // 参与者角色
  status: ParticipantStatus;      // 参与者状态
  capabilities: string[];         // 参与者能力
  joinedAt: Date;                 // 加入时间戳
  lastActiveAt?: Date;            // 最后活跃时间戳
}
```

### **MemoryContext** (记忆上下文)

```typescript
interface MemoryContext {
  shortTermMemory: Array<{
    key: string;
    value: any;
    timestamp: Date;
    ttl?: number;                 // 生存时间（秒）
  }>;
  longTermMemory: Array<{
    key: string;
    value: any;
    importance: number;           // 重要性评分（0-1）
    lastAccessed: Date;
  }>;
  conversationSummary: string;    // 当前对话摘要
  keyTopics: string[];            // 讨论的关键主题
}
```

### **ConversationFlow** (对话流程)

```typescript
interface ConversationFlow {
  currentPhase: ConversationPhase;
  phases: Array<{
    phase: ConversationPhase;
    startTime: Date;
    endTime?: Date;
    objectives: string[];
    outcomes?: string[];
  }>;
  turnTaking: {
    currentTurn: string;          // 当前发言者ID
    turnOrder: string[];          // 发言顺序
    turnDuration: number;         // 平均发言时长
  };
}
```

---

## 🔗 相关文档

- **[实现指南](../modules/dialog/implementation-guide.md)**: 详细实现说明
- **[配置指南](../modules/dialog/configuration-guide.md)**: 配置选项参考
- **[集成示例](../modules/dialog/integration-examples.md)**: 实际使用示例
- **[协议规范](../modules/dialog/protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文
