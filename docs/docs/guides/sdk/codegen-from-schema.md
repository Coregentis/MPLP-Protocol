---
sidebar_position: 6

doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Guide for generating type-safe code from MPLP JSON schemas in multiple languages."
title: Codegen From Schema

---



# Codegen From Schema


## 1. Purpose

This document describes how to generate SDK models from the MPLP JSON Schemas (`schemas/v2/`).

## 2. Source Schemas

All codegen MUST use the schemas in `schemas/v2/` as the single source of truth:

- `mplp-context.schema.json`
- `mplp-plan.schema.json`
- `mplp-confirm.schema.json`
- `mplp-trace.schema.json`
- `mplp-role.schema.json`
- `mplp-dialog.schema.json`
- `mplp-collab.schema.json`
- `mplp-extension.schema.json`
- `mplp-core.schema.json`
- `mplp-network.schema.json`

## 3. Generated Outputs

| Language | Output Directory | Type |
|:---------|:-----------------|:-------------|
| TypeScript | `packages/sdk-ts/src/types/` | Interfaces & Enums |
| Python | `packages/sdk-py/src/mplp/model/` | Pydantic v2 Classes |