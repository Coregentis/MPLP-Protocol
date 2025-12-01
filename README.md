> **MPLP v1.0.0 — Frozen Specification**  
> **Status**: ✅ **FROZEN** as of 2025-11-30.  
> All documentation, schemas, and golden tests are locked. Any normative change requires a protocol version upgrade.

> **Official Protocol Name (v1.0)**: The protocol defined in this repository is officially named **“Multi-Agent Lifecycle Protocol” (MPLP)**. Any earlier drafts referring to “Multi-Agent Protocol for Learning & Planning” are deprecated.

2. **Build the Workspace**:
   ```bash
   pnpm -r build
   ```

3. **Run the Single Agent Flow**:
   ```bash
   pnpm examples:ts-single-agent
   ```

   You should see output indicating the flow execution:
   ```text
   Starting Single Agent Basic Example...
   Running flow...
   ✅ Flow succeeded!
   Context ID: ctx-1
   Plan ID: plan-1
   Confirm Status: approved
   Trace Root Span: root
   Total Events: 8
   ```

## 📊 Current Status

### ✅ MPLP v1.0 Core Protocol Invariants Locked

- **Cross-language Golden Test Suite**: TypeScript + Python harnesses
- **9 flows passing** (FLOW-01~05 + SA-01~02 + MAP-01~02)
- **100% pass rate**: 9/9 flows in TypeScript, 9/9 flows in Python
- **Behavioral semantics locked** for `Context`, `Plan`, `Confirm`, `Trace` modules

### 🎯 v1.0 Compliance Boundary

An implementation claiming "MPLP v1.0 compatible" means:
- ✅ All L1 JSON Schemas validate without errors
- ✅ FLOW-01 through FLOW-05 pass in a cross-language test harness
- ✅ `agent_role` semantics preserved for executor polymorphism
Apache-2.0
