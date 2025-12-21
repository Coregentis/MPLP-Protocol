---
title: Java SDK Guide
description: Guide for the MPLP Java Example. Provides instructions for running the basic Java flow example and guidance for building custom Java bindings.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Java SDK Guide, MPLP Java example, Java bindings, basic flow, SDK implementation, Java usage]
sidebar_label: Java SDK Guide
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Java Example Guide

> [!NOTE]
> Java is an **Example Only** language binding in MPLP v1.0. There is no reference Java SDK package.
> The example provides a starting point for developers to build their own Java bindings.

## 1. Purpose

The `examples/java-basic-flow/` directory provides a minimal Java example demonstrating how MPLP concepts can be implemented in Java/Spring ecosystems.

## 2. Location

```
examples/java-basic-flow/
 src/main/java/...
```

## 3. Usage

Refer to the example's README for build and run instructions.

## 4. For Full SDK Needs

If you need a production-ready Java SDK:

1. **Use the TypeScript SDK** via a wrapper or code generation
2. **Generate POJOs** from the JSON Schemas in `schemas/v2/` using tools like `jsonschema2pojo`
3. **Build your own binding** using this example as reference

## 5. Future Roadmap

A full Java SDK is under consideration for future releases.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
