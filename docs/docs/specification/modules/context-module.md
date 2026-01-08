---
entry_surface: documentation
doc_type: normative
normativity: normative
status: frozen
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-CONTEXT-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-context.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Context Module
sidebar_label: Context Module
sidebar_position: 2
description: "MPLP module specification: Context Module. Defines schema requirements and invariants."
---

# Context Module

## Scope

This specification defines the normative schema requirements and lifecycle obligations for the **Context module** as represented by `schemas/v2/mplp-context.schema.json`.

## Non-Goals

This specification does not define implementation details, runtime behavior beyond schema-defined obligations, or vendor/framework-specific integrations.

---

## 1. Purpose

The **Context Module** defines the "World State" of a project. It serves as the **root anchor** for all other protocol entities (Plans, Traces, Roles). A Context object encapsulates the business domain, runtime environment, and global constraints within which agents operate.

**Design Principle**: "Every Plan, Trace, and Role must belong to exactly one Context"

## 2. Canonical Schema

**From**: `schemas/v2/mplp-context.schema.json`

### 2.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| **`meta`** | Object | Protocol metadata (version, source, governance) |
| **`context_id`** | UUID v4 | Global unique identifier |
| **`root`** | Object | Environment definition (domain, environment, entry_point) |
| **`title`** | String (min 1 char) | Human-readable project name |
| **`status`** | Enum | Lifecycle state |

### 2.2 Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `summary` | String | Brief background and scope description |
| `tags` | Array[String] | Classification tags for retrieval |
| `language` | String | Primary working language (e.g., "en", "zh-CN") |
| `owner_role` | String | Reference to Role module (role_id) |
| `constraints` | Object | Security, compliance, budget, deadline constraints |
| `created_at` | ISO 8601 | Creation timestamp |
| `updated_at` | ISO 8601 | Last modification timestamp |
| `trace` | Object | Global trace reference |
| `events` | Array | Key lifecycle events |
| `governance` | Object | Lifecycle phase and locking status |

### 2.3 The `root` Object

**Required sub-fields**: `domain`, `environment`

```json
{
  "root": {
    "domain": "backend",
    "environment": "production",
    "entry_point": "services/auth/"
  }
}
```

### 2.4 The `governance` Object

```json
{
  "governance": {
    "lifecyclePhase": "implementation",
    "truthDomain": "architecture",
    "locked": false,
    "lastConfirmRef": { "$ref": "confirm-123" }
  }
}
```

## 3. Lifecycle State Machine

### 3.1 Status Enum

**From schema**: `["draft", "active", "suspended", "archived", "closed"]`

<MermaidDiagram id="d03a6dea7f89f987" />

### 3.2 Status Semantics

| Status | Mutable | Plans Executable | Description |
|:---|:---:|:---:|:---|
| **draft** | Yes | No | Context being defined, constraints mutable |
| **active** |  Limited | Yes | Live project, agents can execute plans |
| **suspended** |  Limited | No | Execution paused (budget/policy) |
| **archived** | No | No | Read-only historical record |
| **closed** | No | No | Terminated, no further operations |

## 4. Normative Requirements

**From**: `schemas/v2/invariants/sa-invariants.yaml`

### 4.1 SA Profile Invariants

| ID | Rule | Description |
|:---|:---|:---|
| `sa_requires_context` | `context_id` MUST exist | Every SA runtime requires a valid Context |
| `sa_context_must_be_active` | `status == 'active'` | Plans can only execute in active Context |
| `sa_plan_context_binding` | `plan.context_id == context.context_id` | Plan must bind to loaded Context |
| `sa_trace_context_binding` | `trace.context_id == context.context_id` | Trace must bind to same Context |

### 4.2 Validation Rules

```typescript
function validateContext(ctx: Context): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!ctx.context_id) errors.push('context_id is required');
  if (!ctx.title || ctx.title.length < 1) errors.push('title must be non-empty');
  if (!ctx.root?.domain) errors.push('root.domain is required');
  if (!ctx.root?.environment) errors.push('root.environment is required');
  
  // UUID v4 format
  const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  if (!uuidV4.test(ctx.context_id)) {
    errors.push('context_id must be UUID v4 format');
  }
  
  // Status enum
  const validStatuses = ['draft', 'active', 'suspended', 'archived', 'closed'];
  if (!validStatuses.includes(ctx.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
}
```

## 5. Module Interactions

### 5.1 Dependencies

<MermaidDiagram id="9a730e3846503302" />

### 5.2 Interaction Examples

**Plan binding**:
```json
{
  "plan_id": "plan-123",
  "context_id": "ctx-456",  // MUST match loaded Context
  "title": "Fix Login Bug"
}
```

**Role binding**:
```json
{
  "context_id": "ctx-456",
  "owner_role": "role-architect-001"
}
```

## 6. SDK Examples

### 6.1 TypeScript (Creating Context)

```typescript
import { v4 as uuidv4 } from 'uuid';

interface Context {
  meta: { protocolVersion: string };
  context_id: string;
  root: { domain: string; environment: string; entry_point?: string };
  title: string;
  status: 'draft' | 'active' | 'suspended' | 'archived' | 'closed';
  summary?: string;
  owner_role?: string;
  created_at?: string;
}

function createContext(
  title: string,
  domain: string,
  environment: string
): Context {
  return {
    meta: { protocolVersion: '1.0.0' },
    context_id: uuidv4(),
    root: { domain, environment },
    title,
    status: 'draft',
    created_at: new Date().toISOString()
  };
}

// Usage
const ctx = createContext('Refactor Auth Service', 'backend', 'dev');
```

### 6.2 Python (Pydantic Model)

```python
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime
from typing import Optional, Literal
from enum import Enum

class ContextStatus(str, Enum):
    DRAFT = 'draft'
    ACTIVE = 'active'
    SUSPENDED = 'suspended'
    ARCHIVED = 'archived'
    CLOSED = 'closed'

class ContextRoot(BaseModel):
    domain: str
    environment: str
    entry_point: Optional[str] = None

class Context(BaseModel):
    context_id: str = Field(default_factory=lambda: str(uuid4()))
    root: ContextRoot
    title: str = Field(..., min_length=1)
    status: ContextStatus = ContextStatus.DRAFT
    summary: Optional[str] = None
    owner_role: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

# Usage
ctx = Context(
    root=ContextRoot(domain='backend', environment='dev'),
    title='Refactor Auth Service'
)
```

## 7. Complete JSON Example

```json
{
  "meta": {
    "protocolVersion": "1.0.0",
    "source": "mplp-sdk-ts",
    "frozen": false
  },
  "governance": {
    "lifecyclePhase": "implementation",
    "truthDomain": "architecture",
    "locked": false
  },
  "context_id": "550e8400-e29b-41d4-a716-446655440000",
  "root": {
    "domain": "backend",
    "environment": "production",
    "entry_point": "services/auth/"
  },
  "title": "Refactor Authentication Service",
  "summary": "Migrate from session-based auth to JWT tokens",
  "status": "active",
  "tags": ["security", "backend", "Q4-2025"],
  "language": "en",
  "owner_role": "role-architect-001",
  "constraints": {
    "budget_usd": 5000,
    "deadline": "2025-12-31",
    "compliance": ["SOC2", "GDPR"]
  },
  "created_at": "2025-12-01T00:00:00.000Z",
  "updated_at": "2025-12-07T00:00:00.000Z",
  "trace": {
    "trace_id": "trace-ctx-550e8400"
  }
}

**Schemas**:
- `schemas/v2/mplp-context.schema.json`
- `schemas/v2/invariants/sa-invariants.yaml`

## 8. Related Documents

**Architecture**:
- [Architecture Overview](/docs/specification/architecture)
- [L1 Core Protocol](/docs/specification/architecture/l1-core-protocol)

**Modules**:
- [Plan Module](plan-module.md)
- [Role Module](role-module.md)

---

**Required Fields**: meta, context_id, root, title, status  
**Status Enum**: draft active suspended/archived closed  
**Key Invariant**: All Plans/Traces MUST reference valid context_id