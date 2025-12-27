---
doc_type: reference
status: active
authority: Documentation Governance
description: ""
title: Java SDK Guide
---

# Java SDK Guide

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

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