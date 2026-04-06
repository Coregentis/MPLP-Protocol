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
import { createContext, createPlan, appendTrace, MplpRuntimeClient } from '@mplp/sdk-ts';
```

**Failure**: Import error or missing exports

### Step 3: Type Check

```typescript
const ctx = createContext({
  title: "post-install-check",
  root: { domain: "verification", environment: "test" }
});
```

**Failure**: Type mismatch

### Step 4: Kernel Duty Baseline Check

```typescript
import { KERNEL_DUTY_COUNT, KERNEL_DUTY_IDS } from '@mplp/sdk-ts';

if (KERNEL_DUTY_COUNT !== 11) throw new Error('Kernel Duty count mismatch');
if (KERNEL_DUTY_IDS.length !== 11) throw new Error('Kernel Duty ID list mismatch');
```

**Failure**: Missing or incorrect Kernel Duty exports

### Step 5: Runtime Client Availability

```typescript
const client = new MplpRuntimeClient();
void client;
```

**Failure**: Missing runtime client export

---

## 4. Python Verification Steps

### Step 1: Install

```bash
pip install mplp-sdk=={version}
```

**Failure**: Package not found or install error

### Step 2: Import

```python
import mplp
```

**Failure**: Import error

### Step 3: Version Check

```python
assert mplp.__version__ == "{version}"
```

**Failure**: Version mismatch or missing export

### Step 4: Kernel Duty Baseline Check

```python
assert mplp.KERNEL_DUTY_COUNT == 11
assert len(mplp.KERNEL_DUTY_IDS) == 11
```

**Failure**: Missing or incorrect Kernel Duty exports

### Step 5: Protocol Binding Check

```python
assert mplp.MPLP_PROTOCOL_VERSION == "1.0.0"
```

**Failure**: Protocol binding mismatch

> **Current Scope Note:** The public `mplp-sdk` PyPI package is currently a minimal protocol helper package surface. Post-install verification MUST verify the surface that is actually shipped, not a richer future Python SDK surface.

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
npm install @mplp/sdk-ts@{version}

# Python
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install --no-cache-dir mplp-sdk=={version}
```

### 6.2 Environment Violation = Invalid Verification

If verification is run in a non-clean environment:
- Verification result is **INVALID**
- Verification MUST be re-run in clean environment

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: README.md, METHOD-SDKR-07
