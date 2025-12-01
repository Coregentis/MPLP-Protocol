---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# 1. Purpose
The Value State Layer (VSL) Specification defines the normative interface for the persistence layer of MPLP. It abstracts the storage details from the runtime logic.

# 2. Normative Scope
This specification applies to:
- **L3 Runtime**: The consumer of VSL.
- **L4 Adapters**: The providers of VSL (FS, KV, S3).

# 3. Responsibilities (SHALL / MUST)
1.  The VSL **MUST** provide a Key-Value interface for Protocol Object storage (`get`, `put`, `delete`).
2.  The VSL **MUST** provide an Append-Only interface for Event Logs (`append`).
3.  The VSL **MUST** guarantee Read-after-Write consistency for the Orchestrator.
4.  The VSL **SHOULD** support pluggable backends (Memory, FileSystem, Database).
5.  The VSL **MUST** persist data according to the configured durability policy.
6.  The VSL **MUST** support retrieval of events by `trace_id` or `context_id`.
7.  The VSL **MUST NOT** modify the data payload (it is a dumb store).
8.  The VSL **SHALL** handle concurrent access safely (e.g., file locking).

# 4. Cross-module Bindings
- **All Modules**: Persist their state via VSL (MUST).
- **Trace Module**: Persists logs via VSL (MUST).

# 5. Event Obligations
- **N/A**: VSL is infrastructure. It stores events, it does not emit them (usually).

# 6. PSG Bindings (Runtime Touchpoints)
- **Backing Store**: VSL is the physical backing store for the logical PSG.
- **MUST write to**: Storage medium.
- **MUST read from**: Storage medium.

# 7. Invariants
- **immutability**: Events in the log MUST NOT be modified after append.
- **durability**: Acknowledged writes MUST survive process restart (if persistent backend used).

# 8. Governance Considerations
- **Portability**: Agents should be able to move between runtimes by transferring the VSL state.
- **Privacy**: VSL stores all user data. Encryption at rest is RECOMMENDED.

# 9. Examples (Optional)
**Interface**:
```typescript
interface ValueStateLayer {
  put(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
  appendEvent(event: MplpEvent): Promise<void>;
}
```

# 10. Change Log
