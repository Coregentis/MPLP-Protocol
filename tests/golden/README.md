# Golden Test Suite

**Status**: Reference
**Scope**: Engineering Self-Verification

## Purpose

This directory contains the **Golden Test Suite**, a set of reference flows and invariants used for **engineering self-verification** of the MPLP reference implementation.

## ⚠️ Important Disclaimer

> [!IMPORTANT]
> **Not a Certification Suite**
>
> *   This test suite is for **internal engineering verification** only.
> *   Passing these tests does **not** constitute official MPLP Certification.
> *   The "PASS/FAIL" outputs from the harness refer to **test case execution status**, not protocol conformance judgment.

## Structure

*   `flows/`: Reference event sequences (Golden Flows).
*   `harness/`: TypeScript test runner (Engineering Tool).
*   `invariants/`: Logic for checking trace consistency.
