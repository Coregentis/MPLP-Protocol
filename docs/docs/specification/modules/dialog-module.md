---
entry_surface: documentation
doc_type: normative
normativity: normative
status: frozen
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-DIALOG-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-dialog.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Dialog Module
sidebar_label: Dialog Module
sidebar_position: 7
description: "MPLP module specification: Dialog Module. Defines schema requirements and invariants."
---

# Dialog Module

## Scope

This specification defines the normative schema requirements and lifecycle obligations for the **Dialog module** as represented by `schemas/v2/mplp-dialog.schema.json`.

## Non-Goals

This specification does not define implementation details, runtime behavior beyond schema-defined obligations, or vendor/framework-specific integrations.

---

## 1. Purpose

The **Dialog Module** provides the structure for conversational interactions in MPLP. It captures message exchanges between users, agents, and systems using a format aligned with OpenAI/Anthropic message standards.

**Design Principle**: "Standardized conversation format for interoperability"

## 2. Canonical Schema

**From**: `schemas/v2/mplp-dialog.schema.json`

### 2.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| **`meta`** | Object | Protocol metadata |
| **`dialog_id`** | UUID v4 | Global unique identifier |
| **`context_id`** | UUID v4 | Link to parent Context |
| **`status`** | Enum | Dialog lifecycle status |
| **`messages`** | Array | Message list |

### 2.2 Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `thread_id` | UUID v4 | Thread ID for multi-turn grouping |
| `started_at` | ISO 8601 | Dialog start timestamp |
| `ended_at` | ISO 8601 | Dialog end timestamp |
| `trace` | Object | Audit trace reference |
| `events` | Array | Dialog lifecycle events |
| `governance` | Object | Lifecycle phase and locking |

### 2.3 The `Message` Object (Minimal Protocol Format)

**Required**: `role`, `content`, `timestamp`

| Field | Type | Description |
|:---|:---|:---|
| **`role`** | Enum | Message sender role |
| **`content`** | String | Message text content |
| **`timestamp`** | ISO 8601 | Message timestamp |
| `event` | Object | Optional L1 Event reference |

**Role Enum**: `["user", "assistant", "system", "agent"]`

## 3. Message Roles

### 3.1 Role Semantics

| Role | Description | Typical Use |
|:---|:---|:---|
| **user** | Human user message | User questions, commands |
| **assistant** | AI assistant response | LLM-generated responses |
| **system** | System instruction | Prompts, configuration |
| **agent** | MPLP Agent message | Agent-to-agent communication |

### 3.2 OpenAI/Anthropic Compatibility

**MPLP Dialog uses OpenAI-compatible format**:

```json
{
  "role": "user",
  "content": "Please fix the login bug"
}
```

**Conversion to OpenAI API**:
```typescript
function toOpenAIMessages(dialog: Dialog): OpenAIMessage[] {
  return dialog.messages.map(msg => ({
    role: msg.role === 'agent'  'assistant' : msg.role,
    content: msg.content
  }));
}
```

**Conversion to Anthropic API**:
```typescript
function toAnthropicMessages(dialog: Dialog): AnthropicMessage[] {
  return dialog.messages
    .filter(msg => msg.role !== 'system')  // System handled separately
    .map(msg => ({
      role: msg.role === 'user'  'user' : 'assistant',
      content: msg.content
    }));
}
```

## 4. Lifecycle State Machine

### 4.1 Dialog Status

**From schema**: `["active", "paused", "completed", "cancelled"]`

<MermaidDiagram id="beaf633e2a40766b" />

### 4.2 Status Semantics

| Status | New Messages Allowed | Description |
|:---|:---:|:---|
| **active** | Yes | Conversation in progress |
| **paused** | No | Temporarily paused |
| **completed** | No | Successfully finished |
| **cancelled** | No | Aborted |

## 5. Conversation Patterns

### 5.1 User-Agent Dialog

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Please fix the 500 error on /login",
      "timestamp": "2025-12-07T00:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "I'll analyze the error logs and create a fix plan. Let me start by reading the server logs.",
      "timestamp": "2025-12-07T00:00:05.000Z"
    },
    {
      "role": "user",
      "content": "The logs are in /var/log/app/",
      "timestamp": "2025-12-07T00:00:15.000Z"
    }
  ]
}
```

### 5.2 Agent-Agent Dialog

**For MAP collaboration**:

```json
{
  "messages": [
    {
      "role": "agent",
      "content": "[Orchestrator] Starting code review session for PR #42",
      "timestamp": "2025-12-07T00:00:00.000Z"
    },
    {
      "role": "agent",
      "content": "[Coder] I've implemented the JWT migration. Key changes in auth/token.ts",
      "timestamp": "2025-12-07T00:00:10.000Z"
    },
    {
      "role": "agent",
      "content": "[Reviewer] I see a potential issue at line 45. Token expiry not handled.",
      "timestamp": "2025-12-07T00:00:20.000Z"
    }
  ]
}
```

### 5.3 System Prompts

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a senior software engineer. You help users fix bugs and implement features.",
      "timestamp": "2025-12-07T00:00:00.000Z"
    },
    {
      "role": "user",
      "content": "Help me debug this authentication error",
      "timestamp": "2025-12-07T00:00:01.000Z"
    }
  ]
}
```

## 6. Threading

### 6.1 Thread Grouping

**Use `thread_id` to group related dialogs**:

```typescript
interface DialogThread {
  thread_id: string;
  dialogs: Dialog[];
  topic: string;
}

async function getDialogsByThread(thread_id: string): Promise<Dialog[]> {
  return await db.query('dialogs', { thread_id });
}
```

### 6.2 Context Window Management

```typescript
function getRecentMessages(dialog: Dialog, maxTokens: number): Message[] {
  const messages: Message[] = [];
  let tokenCount = 0;
  
  // Process from most recent
  for (const msg of [...dialog.messages].reverse()) {
    const msgTokens = estimateTokens(msg.content);
    if (tokenCount + msgTokens > maxTokens) break;
    
    messages.unshift(msg);
    tokenCount += msgTokens;
  }
  
  return messages;
}
```

## 7. SDK Examples

### 7.1 TypeScript

```typescript
import { v4 as uuidv4 } from 'uuid';

type DialogRole = 'user' | 'assistant' | 'system' | 'agent';
type DialogStatus = 'active' | 'paused' | 'completed' | 'cancelled';

interface Message {
  role: DialogRole;
  content: string;
  timestamp: string;
}

interface Dialog {
  meta: { protocolVersion: string };
  dialog_id: string;
  context_id: string;
  thread_id?: string;
  status: DialogStatus;
  messages: Message[];
  started_at?: string;
}

function createDialog(context_id: string, systemPrompt?: string): Dialog {
  const dialog: Dialog = {
    meta: { protocolVersion: '1.0.0' },
    dialog_id: uuidv4(),
    context_id,
    status: 'active',
    messages: [],
    started_at: new Date().toISOString()
  };
  
  if (systemPrompt) {
    dialog.messages.push({
      role: 'system',
      content: systemPrompt,
      timestamp: new Date().toISOString()
    });
  }
  
  return dialog;
}

function addMessage(dialog: Dialog, role: DialogRole, content: string): void {
  if (dialog.status !== 'active') {
    throw new Error(`Cannot add message to ${dialog.status} dialog`);
  }
  
  dialog.messages.push({
    role,
    content,
    timestamp: new Date().toISOString()
  });
}

// Usage
const dialog = createDialog('ctx-123', 'You are a helpful coding assistant.');
addMessage(dialog, 'user', 'Please fix the login bug');
addMessage(dialog, 'assistant', 'I will analyze the error and create a fix.');
```

### 7.2 Python

```python
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime
from typing import List, Optional
from enum import Enum

class DialogRole(str, Enum):
    USER = 'user'
    ASSISTANT = 'assistant'
    SYSTEM = 'system'
    AGENT = 'agent'

class DialogStatus(str, Enum):
    ACTIVE = 'active'
    PAUSED = 'paused'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'

class Message(BaseModel):
    role: DialogRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Dialog(BaseModel):
    dialog_id: str = Field(default_factory=lambda: str(uuid4()))
    context_id: str
    thread_id: Optional[str] = None
    status: DialogStatus = DialogStatus.ACTIVE
    messages: List[Message] = []
    started_at: datetime = Field(default_factory=datetime.now)
    
    def add_message(self, role: DialogRole, content: str):
        if self.status != DialogStatus.ACTIVE:
            raise ValueError(f"Cannot add to {self.status} dialog")
        self.messages.append(Message(role=role, content=content))

# Usage
dialog = Dialog(context_id='ctx-123')
dialog.add_message(DialogRole.SYSTEM, 'You are a helpful assistant.')
dialog.add_message(DialogRole.USER, 'Fix the login bug')
```

## 8. Complete JSON Example

```json
{
  "meta": {
    "protocolVersion": "1.0.0",
    "source": "mplp-runtime"
  },
  "dialog_id": "dialog-550e8400-e29b-41d4-a716-446655440005",
  "context_id": "ctx-550e8400-e29b-41d4-a716-446655440000",
  "thread_id": "thread-login-fix-001",
  "status": "completed",
  "started_at": "2025-12-07T00:00:00.000Z",
  "ended_at": "2025-12-07T00:10:00.000Z",
  "messages": [
    {
      "role": "system",
      "content": "You are a senior backend developer specializing in authentication systems.",
      "timestamp": "2025-12-07T00:00:00.000Z"
    },
    {
      "role": "user",
      "content": "We're seeing a 500 error on the /login endpoint in production. Can you help fix it?",
      "timestamp": "2025-12-07T00:00:05.000Z"
    },
    {
      "role": "assistant",
      "content": "I'll help you fix this. Let me first analyze the error logs to understand the root cause. Can you tell me where the logs are located?",
      "timestamp": "2025-12-07T00:00:08.000Z"
    },
    {
      "role": "user",
      "content": "The logs are in /var/log/app/auth.log",
      "timestamp": "2025-12-07T00:00:20.000Z"
    },
    {
      "role": "assistant",
      "content": "I found the issue. There's a null pointer exception in the session validation. I'll create a plan to fix it.",
      "timestamp": "2025-12-07T00:05:00.000Z"
    }
  ]
}
**Schemas**:
- `schemas/v2/mplp-dialog.schema.json`

## 9. Related Documents

**Architecture**:
- [Architecture Overview](/docs/specification/architecture)
- [L1 Core Protocol](/docs/specification/architecture/l1-core-protocol)

**Modules**:
- [Context Module](context-module.md)
- [Collab Module](collab-module.md)

---

**Required Fields**: meta, dialog_id, context_id, status, messages  
**Message Format**: OpenAI/Anthropic compatible (role, content, timestamp)  
**Roles**: user, assistant, system, agent  
**Status Enum**: active paused/completed/cancelled