---
title: Go SDK Guide
description: Guide for the MPLP Go Example. Provides instructions for running the basic Go flow example and guidance for building custom Go bindings.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Go SDK Guide, MPLP Go example, Go bindings, basic flow, SDK implementation, Go usage]
sidebar_label: Go SDK Guide
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Go Example Guide

> [!NOTE]
> Go is an **Example Only** language binding in MPLP v1.0. There is no official Go SDK package.
> The example provides a starting point for developers to build their own Go bindings.

## 1. Purpose

The `examples/go-basic-flow/` directory provides a minimal Go example demonstrating how MPLP concepts can be implemented in Go.

## 2. Location

```
examples/go-basic-flow/
 main.go
```

## 3. Usage

```bash
cd examples/go-basic-flow
go run main.go
```

## 4. For Full SDK Needs

If you need a production-ready Go SDK:

1. **Use the TypeScript SDK** via a wrapper or code generation
2. **Generate Go structs** from the JSON Schemas in `schemas/v2/`
3. **Build your own binding** using this example as reference

## 5. Future Roadmap

A full Go SDK (`mplp-sdk-go`) is under consideration for v1.2+.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
