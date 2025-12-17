---
title: Protocol Versioning
description: MPLP protocol versioning strategy using SemVer 2.0.0. Covers
  version declaration, negotiation, migration strategies, compatibility matrix,
  and freeze policy.
keywords:
  - protocol versioning
  - SemVer
  - version negotiation
  - migration
  - backward compatibility
  - version freeze
  - MPLP version
sidebar_label: Protocol Versioning
doc_status: informative
doc_role: functional-spec
normative_refs:
  - MPLP-CORPUS-v1.0.0
protocol_alignment:
  truth_level: T0
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/common/metadata.schema.json
      binding: manual
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes:
    - Manual binding applied per Remediation Option A/B.
  doc_status: normative
  normativity_scope: protocol_function
normative_id: MPLP-CORE-PROTOCOL-VERSIONING
sidebar_position: 12
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Protocol Versioning

## 1. Purpose

**Protocol Versioning** governs how MPLP versions are defined, declared, negotiated, and evolved. It ensures compatibility between runtimes and projects while enabling smooth protocol evolution.

**Design Principles**: 
- "Version once, validate everywhere" (declaration)
- "Backward compatibility where possible, clear migration when required" (evolution)

## 2. Semantic Versioning (SemVer 2.0.0)

**MPLP strictly adheres to Semantic Versioning**:

- **Major (X.0.0)**: Breaking changes to schemas or normative behavior
  - Example: Removing required field, changing enum values
- **Minor (1.Y.0)**: New features (backward compatible)
  - Example: Adding optional field, new event family
- **Patch (1.0.Z)**: Bug fixes and clarifications
  - Example: Fixing typo in schema description

**Current Version**: v1.0.0 (frozen as of 2025-12-03)

## 3. Version Declaration (MUST)

**From**: `schemas/v2/common/metadata.schema.json`

### 3.1 In Schemas

All protocol objects **MUST** declare `protocolVersion` in metadata:

```json
{
  "meta": {
    "protocolVersion": "1.0.0",
    "frozen": true,
    "freezeDate": "2025-12-03",
    "governance": "MPLP Protocol Governance Committee (MPGC)"
  }
}
```

### 3.2 In Context (Project Root)

Every project **MUST** declare MPLP version:

```json
{
  "context_id": "ctx-123",
  "mplp_version": "1.0.0",
  "domain": "software_dev",
  "environment": {
    "runtime": "Node.js v18",
    "platform": "linux"
  }
}
```

### 3.3 In Runtime

Runtime declares supported versions:

```typescript
const RUNTIME_SUPPORTED_VERSIONS = ['1.0.0', '1.1.0'];

function isVersionSupported(projectVersion: string): boolean {
  return RUNTIME_SUPPORTED_VERSIONS.includes(projectVersion);
}
```

## 4. Versioning Levels

MPLP versioning operates at three levels:

### 4.1 Protocol Version (L1 Schemas)

**Example**: v1.0.0, v1.1.0, v2.0.0

**Governs**: JSON schemas, event schemas, core data structures

### 4.2 Module Compliance (L2)

**Example**: Context Module v1.0-compliant

**Governs**: Which modules are required/optional for compliance

### 4.3 Runtime Implementation (L3)

**Example**: TracePilot Runtime v1.2.0 (supports protocol v1.0.0 and v1.1.0)

**Governs**: Runtime software version (independent of protocol version)

**Relationship**:
```
Runtime v1.2.0
   Supports Protocol v1.0.0 
   Supports Protocol v1.1.0 
   Supports Protocol v2.0.0 (not yet)
```

## 5. SemVer Rules (Detailed Examples)

### 5.1 Major Version (Breaking Changes)

**Increment when**:
- Removing required fields
- Changing field types incompatibly
- Removing enum values
- Changing normative behavior

**Example** (v1.0.0 v2.0.0):
```json
// v1.0.0
{
  "step_id": "uuid-v4",
  "status": "pending" | "in_progress" | "completed"
}

// v2.0.0 (BREAKING: removed 'pending' status)
{
  "step_id": "uuid-v4",
  "status": "ready" | "in_progress" | "completed"  // 'pending' removed
}
```

### 5.2 Minor Version (Backward Compatible)

**Increment when**:
- Adding optional fields
- Adding new enum values
- Adding new event families
- New modules (all optional)

**Example** (v1.0.0 v1.1.0):
```json
// v1.0.0
{
  "plan_id": "uuid-v4",
  "title": "string"
}

// v1.1.0 (non-breaking: added optional field)
{
  "plan_id": "uuid-v4",
  "title": "string",
  "priority": "low" | "normal" | "high"  // NEW OPTIONAL
}
```

### 5.3 Patch Version (Bug Fixes)

**Increment when**:
- Fixing schema typos
- Clarifying documentation
- Fixing validation bugs (not changing schema structure)

**Example** (v1.0.0 v1.0.1):
```json
// v1.0.0 (incorrect description)
{
  "plan_id": {
    "type": "string",
    "description": "A plan identifier"  // Vague
  }
}

// v1.0.1 (clarified description, no structural change)
{
  "plan_id": {
    "type": "string",
    "description": "UUID v4 identifier for the Plan"  // Clearer
  }
}
```

## 6. Version Negotiation

### 6.1 Project Load Flow

```typescript
async function loadProject(projectPath: string): Promise<PSG> {
  // 1. Read project Context
  const context = await readContext(projectPath);
  
  // 2. Check version compatibility
  const projectVersion = context.mplp_version;
  const runtimeVersion = RUNTIME_VERSION;
  
  // 3. Compare major versions
  const [projMajor] = projectVersion.split('.');
  const [runtimeMajor] = runtimeVersion.split('.');
  
  if (projMajor > runtimeMajor) {
    throw new Error(
      `Runtime too old: project requires ${projectVersion}, runtime supports ${runtimeVersion}. Please upgrade runtime.`
    );
  }
  
  if (projMajor < runtimeMajor) {
    console.warn(
      `Project version ${projectVersion} < runtime ${runtimeVersion}. Migration may be available.`
    );
    
    // Offer migration
    const migrate = await promptUser('Migrate project to v${runtimeVersion}?');
    if (migrate) {
      await migrateProject(projectPath, projectVersion, runtimeVersion);
    }
  }
  
  // 4. Load project
  return await loadPSG(projectPath);
}
```

### 6.2 Agent-Runtime Handshake

When an Agent connects to a Runtime:

**1. Exchange supported versions**:
```json
{
  "agent_capabilities": {
    "protocol_versions": ["1.0.0", "1.1.0"],
    "profiles": ["SA", "MAP"]
  },
  "runtime_capabilities": {
    "protocol_versions": ["1.0.0", "1.1.0", "1.2.0"],
    "profiles": ["SA"]
  }
}
```

**2. Negotiate highest common version**:
```typescript
function negotiateVersion(
  agentVersions: string[],
  runtimeVersions: string[]
): string | null {
  // Find intersection
  const common = agentVersions.filter(v => runtimeVersions.includes(v));
  
  if (common.length === 0) {
    return null;  // No common version - reject connection
  }
  
  // Sort by version (descending)
  common.sort((a, b) => compareVersions(b, a));
  
  // Return highest common minor version (same major)
  return common[0];
}
```

**3. Reject if no common major version**:
```typescript
const negotiated = negotiateVersion(
  ['1.0.0', '1.1.0'],
  ['2.0.0', '2.1.0']
);

if (!negotiated) {
  throw new Error('Incompatible protocol versions - cannot connect');
}
```

### 6.3 Multi-Version Runtime

**Runtime can support multiple protocol versions simultaneously**:

```typescript
class MultiVersionRuntime {
  private handlers = new Map<string, ProtocolHandler>();
  
  constructor() {
    this.handlers.set('1.0.0', new V1_0_Handler());
    this.handlers.set('1.1.0', new V1_1_Handler());
  }
  
  async handleRequest(request: any, protocolVersion: string): Promise<any> {
    const handler = this.handlers.get(protocolVersion);
    
    if (!handler) {
      throw new Error(`Unsupported protocol version: ${protocolVersion}`);
    }
    
    return await handler.process(request);
  }
}
```

## 7. Version Compatibility Matrix

| Runtime | Project v1.0 | Project v1.1 | Project v2.0 |
|:---|:---:|:---:|:---:|
| **Runtime v1.0** | Full | No (upgrade runtime) | No |
| **Runtime v1.1** | Full | Full | No (upgrade runtime) |
| **Runtime v2.0** |  Migrate |  Migrate | Full |

**Rules**:
- **Full compatibility**: Runtime supports all project features
- **Incompatible**: Requires runtime upgrade
-  **Migration needed**: Project must migrate to newer protocol version

## 8. Migration Strategies

### 8.1 In-Place Migration

**Upgrade project files** to new version:

```typescript
async function migrateInPlace(
  projectPath: string,
  toVersion: string
): Promise<void> {
  // 1. Backup
  await backupProject(projectPath);
  
  // 2. Load current data
  const psg = await loadPSG(projectPath);
  const currentVersion = psg.context.mplp_version;
  
  // 3. Apply migrations
  const migrated = await applyMigrations(psg, currentVersion, toVersion);
  
  // 4. Validate
  const valid = await validatePSG(migrated, toVersion);
  if (!valid) {
    throw new Error('Migration failed validation');
  }
  
  // 5. Write back
  await writePSG(projectPath, migrated);
  
  console.log(`Migrated from v${currentVersion} to v${toVersion}`);
}
```

### 8.2 Side-by-Side Migration

**Create new project** in target version alongside old:

```typescript
async function migrateSideBySide(
  oldProjectPath: string,
  newProjectPath: string,
  toVersion: string
): Promise<void> {
  // 1. Load old project
  const oldPSG = await loadPSG(oldProjectPath);
  
  // 2. Create new project structure
  await initializeProject(newProject Path, toVersion);
  
  // 3. Migrate data
  const newPSG = await transformPSG(oldPSG, toVersion);
  
  // 4. Write new project
  await writePSG(newProjectPath, newPSG);
  
  console.log(`Created v${toVersion} project at ${newProjectPath}`);
}
```

### 8.3 Schema Migrators

**Upgraders** transform JSON from V(n) to V(n+1):

```typescript
interface Migrator {
  fromVersion: string;
  toVersion: string;
  migrate(data: any): any;
}

const migrators: Migrator[] = [
  {
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    migrate: (data) => {
      // Example: Add new optional field
      return {
        ...data,
        priority: 'normal'  // Default value
      };
    }
  }
];

async function migrateProject(
  projectPath: string,
  fromVersion: string,
  toVersion: string
): Promise<void> {
  // Find migration chain
  const chain = findMigrationChain(fromVersion, toVersion, migrators);
  
  // Apply migrations sequentially
  let data = await readProject(projectPath);
  
  for (const migrator of chain) {
    data = migrator.migrate(data);
  }
  
  // Update version
  data.context.mplp_version = toVersion;
  
  // Write back
  await writeProject(projectPath, data);
}
```

## 9. Freeze Policy

**From**: Governance freeze date (2025-12-03)

Once a version is **FROZEN** (v1.0.0):
- **NO breaking changes** permitted
- **NO normative behavior changes**
- Only clarifications and documentation improvements allowed

**To make breaking changes**: Increment major version (e.g., v2.0.0)

## 10. Downgrade Prevention

**Runtimes SHOULD prevent accidental downgrades**:

```typescript
async function validateVersionChange(
  currentVersion: string,
  newVersion: string
): Promise<void> {
  const current = parseVersion(currentVersion);
  const newVer = parseVersion(newVersion);
  
  // Prevent major version downgrade
  if (newVer.major < current.major) {
    throw new Error(
      `Cannot downgrade from v${currentVersion} to v${newVersion}. This may cause data loss.`
    );
  }
  
  // Warn on minor downgrade
  if (newVer.major === current.major && newVer.minor < current.minor) {
    console.warn(
      `Downgrading from v${currentVersion} to v${newVersion}. New features may be lost.`
    );
  }
}
```

## 11. Compatibility Testing

### 11.1 Automated Compatibility Tests

```typescript
describe('Protocol Compatibility', () => {
  it('v1.0 runtime can load v1.0 projects', async () => {
    const runtime = new V1_0_Runtime();
    const project = await runtime.loadProject('./fixtures/project-v1.0');
    expect(project).toBeDefined();
  });
  
  it('v1.1 runtime can load v1.0 projects', async () => {
    const runtime = new V1_1_Runtime();
    const project = await runtime.loadProject('./fixtures/project-v1.0');
    expect(project).toBeDefined();
  });
  
  it('v1.0 runtime rejects v1.1 projects', async () => {
    const runtime = new V1_0_Runtime();
    await expect(
      runtime.loadProject('./fixtures/project-v1.1')
    ).rejects.toThrow('Runtime too old');
  });
});
```

### 11.2 Golden File Tests

**Store example PSGs** for each version:

```
tests/golden/
   v1.0.0/    simple-plan.json    complex-plan.json    map-session.json
   v1.1.0/    simple-plan.json (with new optional fields)    priority-plan.json (uses v1.1 features)
```

**Test runtimes** against golden files:

```typescript
it('can parse all v1.0 golden files', async () => {
  const goldenFiles = await listGoldenFiles('v1.0.0');
  
  for (const file of goldenFiles) {
    const data = await readJSON(file);
    const valid = await validatePSG(data, '1.0.0');
    expect(valid).toBe(true);
  }
});
```

## 12. Deprecation Policy

**For features to be removed**:

1. **Mark as deprecated** in current minor version
2. **Document migration path**
3. **Remove in next major version**

**Example**:
```json
// v1.5.0 (deprecation warning)
{
  "old_field": "value",  // DEPRECATED: Use 'new_field' instead
  "new_field": "value"
}

// v2.0.0 (removal)
{
  "new_field": "value"  // 'old_field' removed
}
```

## 13. Version Tagging

**Git tags** for each version:

```bash
git tag -a v1.0.0 -m "MPLP Protocol v1.0.0 - Frozen"
git tag -a v1.1.0 -m "MPLP Protocol v1.1.0 - Added priority field"
git push --tags
```

## 14. Related Documents

**Governance**:
- [Versioning Policy](../../12-governance/versioning-policy.md)

**Architecture**:
- [L1 Core Protocol](../l1-core-protocol.md) - Frozen schema versions

**Schemas**:
- `schemas/v2/common/metadata.schema.json`

---

**Document Status**: Normative (Versioning strategy and compliance)  
**Versioning Levels**: Protocol (L1), Module (L2), Runtime (L3)  
**SemVer**: Major (breaking), Minor (compatible), Patch (fixes)  
**Current Version**: v1.0.0 (frozen 2025-12-03)  
**Migration**: In-place or side-by-side strategies  
**Compatibility**: Major version must match, minor version backward compatible
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
