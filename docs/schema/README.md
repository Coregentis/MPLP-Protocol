# MPLP Schema Documentation

## Overview

This directory contains JSON Schema definitions for all MPLP modules following the dual naming convention:
- **Schema Layer**: snake_case (context_id, created_at, protocol_version)
- **TypeScript Layer**: camelCase (contextId, createdAt, protocolVersion)

## Schema Files

All schema files follow the naming pattern: `mplp-*.json` and use JSON Schema draft-07 standard.

### Core Modules (10)
1. `mplp-context.json` - Context management schema
2. `mplp-plan.json` - Planning and workflow schema
3. `mplp-confirm.json` - Approval and confirmation schema
4. `mplp-trace.json` - Execution monitoring schema
5. `mplp-role.json` - Role and permission schema
6. `mplp-extension.json` - Extension management schema
7. `mplp-dialog.json` - Dialog management schema
8. `mplp-collab.json` - Collaboration schema
9. `mplp-core.json` - Core orchestration schema
10. `mplp-network.json` - Network communication schema

## Dual Naming Convention

### Schema Layer (snake_case)
```json
{
  "context_id": "string",
  "created_at": "string",
  "protocol_version": "string"
}
```

### TypeScript Layer (camelCase)
```typescript
interface Context {
  contextId: string;
  createdAt: string;
  protocolVersion: string;
}
```

### Mapping Functions
Every module must implement:
- `toSchema()` - Convert TypeScript to Schema
- `fromSchema()` - Convert Schema to TypeScript
- `validateSchema()` - Validate against JSON Schema
- `toSchemaArray()` - Batch convert to Schema
- `fromSchemaArray()` - Batch convert from Schema

## Validation

All schemas are validated using:
```bash
npm run validate:schemas
```

## References

- [Dual Naming Convention](.augment/rules/dual-naming-convention.mdc)
- [Schema-Driven Development](.augment/rules/development-workflow-new.mdc)
