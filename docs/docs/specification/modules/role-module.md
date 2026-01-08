---
entry_surface: documentation
doc_type: normative
normativity: normative
status: frozen
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-ROLE-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-role.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Role Module
sidebar_label: Role Module
sidebar_position: 5
description: "MPLP module specification: Role Module. Defines schema requirements and invariants."
---

# Role Module

## Scope

This specification defines the normative schema requirements and lifecycle obligations for the **Role module** as represented by `schemas/v2/mplp-role.schema.json`.

## Non-Goals

This specification does not define implementation details, runtime behavior beyond schema-defined obligations, or vendor/framework-specific integrations.

---

## 1. Purpose

The **Role Module** defines capability declarations, permission boundaries, and behavioral identities for agents in MPLP. It provides the RBAC (Role-Based Access Control) foundation for secure multi-agent systems.

**Design Principle**: "Explicit capabilities, enforced boundaries"

## 2. Canonical Schema

**From**: `schemas/v2/mplp-role.schema.json`

### 2.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| **`meta`** | Object | Protocol metadata |
| **`role_id`** | UUID v4 | Global unique identifier |
| **`name`** | String | Human-readable role name |

### 2.2 Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `description` | String | Detailed role function description |
| `capabilities` | Array[String] | Permission/capability tags |
| `created_at` | ISO 8601 | Creation timestamp |
| `updated_at` | ISO 8601 | Last modification timestamp |
| `trace` | Object | Audit trace reference |
| `events` | Array | Role lifecycle events |
| `governance` | Object | Lifecycle phase and locking |

## 3. Capabilities Model

### 3.1 Capability Format

Capabilities follow a **resource.action** pattern:

```
<resource>.<action>
```

**Examples**:
- `plan.create` - Can create new Plans
- `plan.execute` - Can execute Plans
- `confirm.approve` - Can approve Confirm requests
- `context.modify` - Can modify Context
- `trace.read` - Can read Traces
- `collab.join` - Can join collaboration sessions

### 3.2 Standard Capabilities

| Capability | Description |
|:---|:---|
| `plan.create` | Create new Plans |
| `plan.propose` | Submit Plans for approval |
| `plan.execute` | Execute approved Plans |
| `confirm.approve` | Approve approval requests |
| `confirm.reject` | Reject approval requests |
| `context.read` | Read Context data |
| `context.modify` | Modify Context |
| `trace.read` | Read execution traces |
| `collab.join` | Join collaboration sessions |
| `collab.orchestrate` | Act as session orchestrator |

### 3.3 Capability Checking

```typescript
class RoleManager {
  async checkCapability(role_id: string, required: string): Promise<boolean> {
    const role = await this.getRole(role_id);
    
    if (!role || !role.capabilities) {
      return false;
    }
    
    // Direct match
    if (role.capabilities.includes(required)) {
      return true;
    }
    
    // Wildcard match (e.g., 'plan.*' matches 'plan.create')
    const [resource] = required.split('.');
    if (role.capabilities.includes(`${resource}.*`)) {
      return true;
    }
    
    // Super admin
    if (role.capabilities.includes('*')) {
      return true;
    }
    
    return false;
  }
}
```

## 4. Common Role Patterns

### 4.1 SA Profile Roles

| Role | Name | Capabilities |
|:---|:---|:---|
| **Planner** | `planner` | `plan.create`, `plan.propose` |
| **Executor** | `executor` | `plan.execute`, `trace.read` |
| **Reviewer** | `reviewer` | `confirm.approve`, `confirm.reject`, `trace.read` |
| **Architect** | `architect` | `plan.*`, `context.*` |

### 4.2 MAP Profile Roles

| Role | Name | Capabilities | MAP Function |
|:---|:---|:---|:---|
| **Orchestrator** | `orchestrator` | `collab.orchestrate`, `plan.*` | Controls session flow |
| **Coder** | `coder` | `plan.execute`, `trace.read` | Code implementation |
| **Tester** | `tester` | `plan.execute`, `trace.read` | Test execution |
| **Human User** | `human_user` | `confirm.approve`, `plan.propose` | Final approval |

## 5. References from Other Modules

### 5.1 Usage in Context

```json
{
  "context_id": "ctx-123",
  "owner_role": "role-architect-001"
}
```

### 5.2 Usage in Plan Steps

```json
{
  "step_id": "s1",
  "description": "Write authentication code",
  "agent_role": "coder"
}
```

### 5.3 Usage in Confirm

```json
{
  "confirm_id": "confirm-001",
  "requested_by_role": "role-planner-001"
}
```

### 5.4 Usage in Collab

```json
{
  "participant_id": "p1",
  "role_id": "role-coder-001",
  "kind": "agent"
}
```

## 6. SDK Examples

### 6.1 TypeScript

```typescript
import { v4 as uuidv4 } from 'uuid';

interface Role {
  meta: { protocolVersion: string };
  role_id: string;
  name: string;
  description?: string;
  capabilities?: string[];
  created_at?: string;
}

function createRole(name: string, capabilities: string[]): Role {
  return {
    meta: { protocolVersion: '1.0.0' },
    role_id: uuidv4(),
    name,
    capabilities,
    created_at: new Date().toISOString()
  };
}

// Create standard roles
const planner = createRole('planner', ['plan.create', 'plan.propose']);
const executor = createRole('executor', ['plan.execute', 'trace.read']);
const reviewer = createRole('reviewer', ['confirm.approve', 'confirm.reject']);
```

### 6.2 Python

```python
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime
from typing import List, Optional

class Role(BaseModel):
    role_id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    description: Optional[str] = None
    capabilities: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)

# Create standard roles
planner = Role(
    name='planner',
    description='Creates and proposes execution plans',
    capabilities=['plan.create', 'plan.propose']
)
```

## 7. Complete JSON Example

```json
{
  "meta": {
    "protocolVersion": "1.0.0",
    "source": "mplp-runtime"
  },
  "governance": {
    "lifecyclePhase": "active",
    "locked": false
  },
  "role_id": "role-architect-550e8400",
  "name": "architect",
  "description": "Senior agent responsible for system design and plan creation. Has full plan and context permissions.",
  "capabilities": [
    "plan.create",
    "plan.propose",
    "plan.execute",
    "context.read",
    "context.modify",
    "confirm.approve",
    "trace.read"
  ],
  "created_at": "2025-12-01T00:00:00.000Z",
  "updated_at": "2025-12-07T00:00:00.000Z"
}
```

**Schemas**:
- `schemas/v2/mplp-role.schema.json`

## 8. Related Documents

**Architecture**:
- [L1 Core Protocol](/docs/specification/architecture/l1-core-protocol)

**Modules**:
- [Context Module](context-module.md)
- [Plan Module](plan-module.md)
- [Confirm Module](confirm-module.md)

---

**Required Fields**: meta, role_id, name  
**Capabilities Format**: `resource.action` (e.g., `plan.create`)  
**Key Usage**: owner_role, agent_role, requested_by_role, participant.role_id