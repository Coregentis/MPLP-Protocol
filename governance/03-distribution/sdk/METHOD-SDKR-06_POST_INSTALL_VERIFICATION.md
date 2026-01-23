---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-06_POST_INSTALL_VERIFICATION"
---

# METHOD-SDKR-06: Post-Install Verification

**Document ID**: METHOD-SDKR-06  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This method defines mandatory verification steps after SDK publication to public registries.

This is **not** local repository testing. This is **user-level reality verification**.

---

## 2. Verification Environment

| Requirement | Specification |
|:---|:---|
| Environment | Clean VM or container |
| No local repo | MUST install from registry only |
| Network | Real registry access required |

---

## 3. TypeScript Verification Steps

> **Note**: In multi-package mode, verification applies to each `@mplp/*` package in the Publish Set.

### Step 1: Install

```bash
# Install facade package (includes all dependencies)
npm install @mplp/sdk-ts@{version}

# Or install individual packages
npm install @mplp/core@{version} @mplp/schema@{version}
```

**Failure**: Package not found or install error

### Step 2: Import

```typescript
import { Context, Plan, Trace } from 'mplp-sdk-ts';
```

**Failure**: Import error or missing exports

### Step 3: Type Check

```typescript
const ctx: Context = { /* minimal valid */ };
```

**Failure**: Type mismatch

### Step 4: Enum Validation

```typescript
import { CROSS_CUTTING_ENUM_VALUES } from 'mplp-sdk-ts';
// Must have exactly 11 values
```

**Failure**: Enum count mismatch

---

## 4. Python Verification Steps

### Step 1: Install

```bash
pip install mplp=={version}
```

**Failure**: Package not found or install error

### Step 2: Import

```python
from mplp.models import Context, Plan, Trace
from mplp.generated.cross_cutting import CROSS_CUTTING_ENUM_VALUES
```

**Failure**: Import error

### Step 3: Instantiation

```python
from mplp.models.common import Metadata
m = Metadata(protocol_version="1.0.0", schema_version="2.0.0")
```

**Failure**: Validation error

### Step 4: Enum Validation

```python
assert len(CROSS_CUTTING_ENUM_VALUES) == 11
```

**Failure**: Enum count mismatch

---

## 5. Failure Handling (GOVERNANCE RULING)

### 5.1 Failure = Invalid Release

> **RULING**: Failure of post-install verification renders the SDK release **INVALID**, regardless of pre-publish checks.

This is a governance-level determination, not a technical recommendation.

### 5.2 Consequences

If ANY verification step fails:

- Release is considered **INVALID**
- Release MUST NOT be promoted or announced
- Incident record MUST be created (per METHOD-SDKR-07)
- Rollback procedure MUST be initiated immediately

### 5.3 No Exceptions

The following arguments do NOT override this ruling:

| Argument | Ruling |
|:---|:---:|
| "CI passed" | NOT VALID |
| "Works on my machine" | NOT VALID |
| "User environment issue" | NOT VALID |
| "Only affects edge cases" | NOT VALID |

Post-install verification is the **final gate**. No exceptions.

---

## 6. Clean Environment Requirements

Verification MUST be executed in a clean environment:

| Requirement | Specification |
|:---|:---|
| No local repository | Local repo MUST NOT be mounted |
| Fresh virtualenv/node_modules | No pre-existing packages |
| Registry-only install | MUST use `npm install` / `pip install` from public registry |
| No cached packages | Package cache MUST be cleared |

### 6.1 Verification Script Template

```bash
# TypeScript
rm -rf node_modules package-lock.json
npm cache clean --force
npm install mplp-sdk-ts@{version}

# Python
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install --no-cache-dir mplp=={version}
```

### 6.2 Environment Violation = Invalid Verification

If verification is run in a non-clean environment:
- Verification result is **INVALID**
- Verification MUST be re-run in clean environment

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: README.md, METHOD-SDKR-07
