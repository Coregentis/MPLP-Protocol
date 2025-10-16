# Dialog API Reference

> **🌐 Language Navigation**: [English](dialog-api.md) | [中文](../../zh-CN/api-reference/dialog-api.md)



**Inter-Agent Communication and Conversations - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Dialog%20Module-blue.svg)](../modules/dialog/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--dialog.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-121%2F121%20passing-green.svg)](../modules/dialog/testing-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/dialog-api.md)

---

## 🎯 Overview

The Dialog API provides comprehensive inter-agent communication and conversation management capabilities. It enables intelligent dialog management, memory management, context-aware conversations, and enterprise-grade communication features. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  DialogController,
  DialogManagementService,
  CreateDialogDto,
  UpdateDialogDto,
  DialogResponseDto
} from 'mplp/modules/dialog';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const dialogModule = mplp.getModule('dialog');
```

## 🏗️ Core Interfaces

### **DialogResponseDto** (Response Interface)

```typescript
interface DialogResponseDto {
  // Basic protocol fields
  protocolVersion: string;        // Protocol version "1.0.0"
  timestamp: string;              // ISO 8601 timestamp
  dialogId: string;               // Unique dialog identifier
  contextId: string;              // Associated context ID
  sessionId: string;              // Dialog session ID
  status: DialogStatus;           // Dialog status
  type: DialogType;               // Dialog type
  
  // Participants
  participants: DialogParticipant[];
  currentSpeaker?: string;        // Current speaker ID
  
  // Messages and conversation
  messages: DialogMessage[];
  conversationFlow: ConversationFlow;
  
  // Memory and context
  memoryContext: MemoryContext;
  conversationHistory: ConversationSummary[];
  
  // Enterprise features
  auditTrail: DialogAuditTrail;
  performanceMetrics: DialogMetrics;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateDialogDto** (Create Request Interface)

```typescript
interface CreateDialogDto {
  contextId: string;              // Required: Associated context ID
  type: DialogType;               // Required: Dialog type
  
  // Participants
  participants: Array<{
    participantId: string;
    role: ParticipantRole;
    capabilities?: string[];
  }>;
  
  // Initial configuration
  configuration?: DialogConfiguration;
  
  // Initial message (optional)
  initialMessage?: {
    content: string;
    type: MessageType;
    senderId: string;
  };
  
  // Metadata
  metadata?: Record<string, any>;
}
```

## 🔧 Core Enums

### **DialogStatus** (Dialog Status)

```typescript
enum DialogStatus {
  ACTIVE = 'active',              // Active dialog
  PAUSED = 'paused',              // Paused dialog
  COMPLETED = 'completed',        // Completed dialog
  TERMINATED = 'terminated',      // Terminated dialog
  ERROR = 'error'                 // Error state
}
```

### **DialogType** (Dialog Type)

```typescript
enum DialogType {
  NEGOTIATION = 'negotiation',    // Negotiation dialog
  COLLABORATION = 'collaboration', // Collaboration dialog
  INFORMATION_EXCHANGE = 'information_exchange', // Information exchange
  DECISION_MAKING = 'decision_making', // Decision making
  PROBLEM_SOLVING = 'problem_solving', // Problem solving
  CASUAL = 'casual'               // Casual conversation
}
```

### **MessageType** (Message Type)

```typescript
enum MessageType {
  TEXT = 'text',                  // Text message
  STRUCTURED = 'structured',      // Structured data
  COMMAND = 'command',            // Command message
  RESPONSE = 'response',          // Response message
  NOTIFICATION = 'notification',  // Notification
  SYSTEM = 'system'               // System message
}
```

## 🎮 Controller API

### **DialogController**

Main REST API controller providing HTTP endpoint access.

#### **Create Dialog**
```typescript
async createDialog(dto: CreateDialogDto): Promise<DialogOperationResult>
```

**HTTP Endpoint**: `POST /api/dialogs`

**Request Example**:
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
    "content": "Let's begin our collaboration on the project analysis.",
    "type": "text",
    "senderId": "agent-001"
  }
}
```

#### **Send Message**
```typescript
async sendMessage(dialogId: string, message: DialogMessageDto): Promise<DialogOperationResult>
```

**HTTP Endpoint**: `POST /api/dialogs/{dialogId}/messages`

#### **Get Dialog**
```typescript
async getDialog(dialogId: string): Promise<DialogResponseDto>
```

**HTTP Endpoint**: `GET /api/dialogs/{dialogId}`

#### **Update Dialog**
```typescript
async updateDialog(dialogId: string, dto: UpdateDialogDto): Promise<DialogOperationResult>
```

**HTTP Endpoint**: `PUT /api/dialogs/{dialogId}`

#### **End Dialog**
```typescript
async endDialog(dialogId: string, reason?: string): Promise<DialogOperationResult>
```

**HTTP Endpoint**: `POST /api/dialogs/{dialogId}/end`

#### **Get Conversation History**
```typescript
async getConversationHistory(dialogId: string, pagination?: PaginationParams): Promise<ConversationHistoryResult>
```

**HTTP Endpoint**: `GET /api/dialogs/{dialogId}/history`

## 🔧 Service Layer API

### **DialogManagementService**

Core business logic service providing dialog management functionality.

#### **Main Methods**

```typescript
class DialogManagementService {
  // Basic CRUD operations
  async createDialog(request: CreateDialogRequest): Promise<DialogEntity>;
  async getDialogById(dialogId: string): Promise<DialogEntity | null>;
  async updateDialog(dialogId: string, request: UpdateDialogRequest): Promise<DialogEntity>;
  async deleteDialog(dialogId: string): Promise<boolean>;
  
  // Message management
  async sendMessage(dialogId: string, message: DialogMessage): Promise<MessageResult>;
  async getMessages(dialogId: string, pagination?: PaginationParams): Promise<MessageHistory>;
  async searchMessages(dialogId: string, query: MessageSearchQuery): Promise<MessageSearchResult>;
  
  // Conversation management
  async pauseDialog(dialogId: string): Promise<DialogEntity>;
  async resumeDialog(dialogId: string): Promise<DialogEntity>;
  async endDialog(dialogId: string, reason?: string): Promise<DialogEntity>;
  
  // Memory and context
  async updateMemoryContext(dialogId: string, context: Partial<MemoryContext>): Promise<DialogEntity>;
  async getConversationSummary(dialogId: string): Promise<ConversationSummary>;
  
  // Analytics and monitoring
  async getDialogMetrics(dialogId: string): Promise<DialogMetrics>;
  async getDialogHealth(dialogId: string): Promise<DialogHealth>;
}
```

## 📊 Data Structures

### **DialogMessage** (Dialog Message)

```typescript
interface DialogMessage {
  messageId: string;              // Unique message identifier
  senderId: string;               // Sender participant ID
  recipientId?: string;           // Recipient ID (optional for broadcast)
  content: string;                // Message content
  type: MessageType;              // Message type
  timestamp: Date;                // Message timestamp
  metadata?: Record<string, any>; // Additional metadata
  attachments?: MessageAttachment[]; // Message attachments
}
```

### **DialogParticipant** (Dialog Participant)

```typescript
interface DialogParticipant {
  participantId: string;          // Participant identifier
  role: ParticipantRole;          // Participant role
  status: ParticipantStatus;      // Participant status
  capabilities: string[];         // Participant capabilities
  joinedAt: Date;                 // Join timestamp
  lastActiveAt?: Date;            // Last activity timestamp
}
```

### **MemoryContext** (Memory Context)

```typescript
interface MemoryContext {
  shortTermMemory: Array<{
    key: string;
    value: any;
    timestamp: Date;
    ttl?: number;                 // Time to live (seconds)
  }>;
  longTermMemory: Array<{
    key: string;
    value: any;
    importance: number;           // Importance score (0-1)
    lastAccessed: Date;
  }>;
  conversationSummary: string;    // Current conversation summary
  keyTopics: string[];            // Key topics discussed
}
```

### **ConversationFlow** (Conversation Flow)

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
    currentTurn: string;          // Current speaker ID
    turnOrder: string[];          // Turn order
    turnDuration: number;         // Average turn duration
  };
}
```

---

## 🔗 Related Documentation

- **[Implementation Guide](../modules/dialog/implementation-guide.md)**: Detailed implementation instructions
- **[Configuration Guide](../modules/dialog/configuration-guide.md)**: Configuration options reference
- **[Integration Examples](../modules/dialog/integration-examples.md)**: Real-world usage examples
- **[Protocol Specification](../modules/dialog/protocol-specification.md)**: Underlying protocol specification

---

**Last Updated**: September 4, 2025  
**API Version**: v1.0.0  
**Status**: Enterprise Grade Production Ready  
**Language**: English
