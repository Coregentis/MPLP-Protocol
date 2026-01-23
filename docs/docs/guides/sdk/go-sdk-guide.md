---
sidebar_position: 3

doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Go SDK guide for MPLP including module installation and usage patterns."
title: Go SDK Guide

---



# Go SDK Guide


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