---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Go SDK Design Specification


## 1. Introduction

The Go SDK (`mplp-go`) is designed for high-performance backend systems, orchestrators, and control planes. It prioritizes speed, concurrency, and type safety.

## 2. Design Goals

*   **Performance**: Minimize allocations and use efficient serialization.
*   **Concurrency**: Leverage Goroutines for parallel step execution and event processing.
*   **Simplicity**: Idiomatic Go code with flat package structures and explicit error handling.

## 3. Core Components

### 3.1. Structs & Validation

Native Go structs generated from schemas, with a custom `Validate()` method for protocol compliance.

```go
type Plan struct {
    ID    string `json:"plan_id"`
    Title string `json:"title"`
    // ...
}

func (p *Plan) Validate() error {
    // Custom validation logic
}
```

### 3.2. The Orchestrator Engine

A highly concurrent engine capable of managing thousands of flows.

```go
func (e *Engine) RunFlow(ctx context.Context, flow *Flow) error {
    // Uses errgroup to manage concurrent steps
}
```

## 4. Package Structure

*   `github.com/coregentis/mplp/go/core`: Core types and validators.
*   `github.com/coregentis/mplp/go/runtime`: Execution engine.
*   `github.com/coregentis/mplp/go/transport`: gRPC and HTTP transport layers.

## 5. Implementation Plan

1.  **Schema Compilation**: Use `quicktype` or custom templates to generate Go structs.
2.  **Validator Port**: Port the logic from `ajv` (JS) to a native Go validator or use `gojsonschema`.
3.  **Engine Build**: Implement the core loop using Go's concurrency primitives.
