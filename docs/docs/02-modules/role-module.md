---
title: Role Module
description: Role Module specification for MPLP Role-Based Access Control
  (RBAC). Defines agent capabilities, permission boundaries, and behavioral
  identities.
keywords:
  - Role Module
  - RBAC
  - agent capabilities
  - permission boundaries
  - role definitions
  - access control
  - MPLP security
sidebar_label: Role Module
doc_status: normative
doc_role: normative_spec
protocol_version: 1.0.0
spec_level: L2
normative_id: MPLP-MOD-ROLE
permalink: /modules/role-module
modules:
  - role
normative_refs: []
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/mplp-role.schema.json
      local_path: packages/sdk-ts/schemas/mplp-role.schema.json
      binding: heuristic_name_match
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: normative
sidebar_position: 6
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Role Module

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

## 8. Related Documents

**Architecture**:
- [L1 Core Protocol](../01-architecture/l1-core-protocol.md)
- [Security](../01-architecture/cross-cutting/security.md) - RBAC enforcement

**Modules**:
- [Context Module](context-module.md) - owner_role reference
- [Plan Module](plan-module.md) - agent_role in steps
- [Confirm Module](confirm-module.md) - requested_by_role
- [Collab Module](collab-module.md) - participant role_id

**Schemas**:
- `schemas/v2/mplp-role.schema.json`

---

**Document Status**: Normative (Core Module)  
**Required Fields**: meta, role_id, name  
**Capabilities Format**: `resource.action` (e.g., `plan.create`)  
**Key Usage**: owner_role, agent_role, requested_by_role, participant.role_id
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
