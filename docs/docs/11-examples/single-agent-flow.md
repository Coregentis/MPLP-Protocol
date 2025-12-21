---
title: Single Agent Flow
description: Complete runnable example of a Single Agent (SA) Flow using the MPLP TypeScript SDK. Covers Context creation, Plan building, execution, and Trace generation.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Single Agent Flow, MPLP example, TypeScript SDK, SA profile, Context creation, Plan building, Trace generation, runnable example]
sidebar_label: Single Agent Flow
sidebar_position: 1
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Single Agent Flow Example

> [!IMPORTANT]
> **Informative, not normative.**
> This is an example implementation for learning purposes. See the [Protocol Specification](../01-architecture/architecture-overview.md) for normative requirements.

This document describes the **Single Agent (SA) Flow** example, which demonstrates a complete, runnable implementation of the MPLP Protocol v1.0.0 using the TypeScript SDK.

## 🧭 How to Use This Section

| Your Goal | Start Here |
|:----------|:-----------|
| **Run the code** | [Running the Example](#3-running-the-example) |
| **Understand components** | [Key Components](#4-key-components) |
| **See multi-agent** | [Multi-Agent Collab Flow](./multi-agent-collab-flow.md) |
| **Integrate tools** | [Tool Execution Integration](./tool-execution-integration.md) |

## 1. Overview

**Location**: `examples/ts-single-agent-basic/`

**Related Golden Flow**: `flow-01-single-agent-plan-single-agent-plan`

This example shows:
- Creating a Context with metadata
- Building a Plan with sequential steps
- Executing steps through a ModuleRegistry
- Generating Trace spans for observability
- Using InMemoryVSL for state persistence

## 2. Directory Structure

```
examples/ts-single-agent-basic/
 src/    index.ts          # Main entry point
 data/                  # Persisted state (InMemoryVSL output)
 package.json
 tsconfig.json
 README.md
```

## 3. Running the Example

### Prerequisites

```bash
# Install dependencies
pnpm install

# Build the SDK
pnpm -r build
```

### Execute

```bash
pnpm examples:ts-single-agent
```

Or with debug logging:

```bash
DEBUG=mplp:* pnpm examples:ts-single-agent
```

## 4. Key Components

### 4.1 SDK Import

```typescript
import { 
  ContextBuilder, 
  PlanBuilder, 
  ModuleRegistry,
  InMemoryVSL 
} from '@mplp/sdk-ts';
```

### 4.2 Context Creation

```typescript
const context = new ContextBuilder()
  .title("My First MPLP Task")
  .root({ domain: "demo", environment: "dev" })
  .meta({ protocol_version: "1.0.0" })
  .build();
```

### 4.3 Plan Definition

```typescript
const plan = new PlanBuilder()
  .contextId(context.context_id)
  .objective("Hello World")
  .steps([
    { step_id: "step-1", action: "greet", status: "pending" }
  ])
  .build();
```

### 4.4 Module Registry

The ModuleRegistry defines handlers for each step action:

```typescript
const registry: ModuleRegistry = {
  greet: async ({ ctx }) => ({
    status: "completed",
    output: { message: `Hello, ${ctx.title}!` }
  })
};
```

### 4.5 Trace Output

After execution, a Trace is generated:

```typescript
const trace = {
  trace_id: "trace-xxx",
  root_span: {
    span_id: "span-1",
    name: "root",
    start_time: "...",
    end_time: "...",
    status: "ok"
  }
};
```

## 5. Expected Output

``` Single Agent Flow completed successfully
Context ID: ctx-xxx
Plan Status: completed
Trace Root Span: root
Total Events: N
```

## 6. Extending the Example

To turn this into a production application:

1. **Replace InMemoryVSL** with a database-backed VSL (e.g., PostgreSQL)
2. **Add real LLM integration** using `@mplp/integration-llm-http`
3. **Add tool handlers** for external API calls

## 7. Related Documentation

- [TypeScript SDK Guide](../10-sdk/ts-sdk-guide.md)
- [SA Profile Specification](../03-profiles/sa-profile.md)
- [Golden Flow Registry](../09-tests/golden-flow-registry.md)

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
