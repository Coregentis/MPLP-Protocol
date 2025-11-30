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
- ✅ Emit PipelineStageEvent + GraphUpdateEvent (Observability REQUIRED)
- ✅ Document Module→PSG mapping + use PSG as single source of truth (Runtime Glue REQUIRED)

**See**: [MPLP v1.0 Compliance Guide](docs/02-guides/mplp-v1.0-compliance-guide.md)

### 🔓 Extensibility by Design

- FLOWS 06–25 are **reference scenarios** for products and vendors (not required for v1.0)
- L2 modules (`Dialog`, `Collab`, `Extension`, `Core`, `Network`) are **structure-defined, behavior-open**
- Implementations may add custom flows and invariants without changing core protocol

### Development Phases

| Phase | Status | Description |
| :--- | :--- | :--- |
| **P0-P6** | ✅ **Complete** | Schemas v2, Core Protocol, Coordination, Reference Runtime, Integration Layer, Examples |
| **P7.3.F** | ✅ **Complete** | Golden Test Suite Category A (FLOW-01~05) - Protocol Invariant Milestone |
| **Profiles** | ✅ **Complete** | SA + MAP Profiles with 4 flows (SA-01~02, MAP-01~02) |
| **Observability** | ✅ **Complete** | Event taxonomy (12 families), core schemas, module obligations |
| **Learning** | ✅ **Complete** | LearningSample format (6 families), collection points, invariants |
| **Runtime Glue** | ✅ **Complete** | L3 specs (Module→PSG, Crosscuts, Drift, Rollback) |
| **Integration** | ✅ **Complete** | Minimal Integration Spec (IDE, CI, Git, Tools) - 4 event families |

## 📚 Documentation

- 📘 [MPLP v1.0 Specification](docs/01-spec/README.md) - Full protocol specification
- ✅ [MPLP v1.0 Compliance Guide](docs/02-guides/mplp-v1.0-compliance-guide.md) - Certification & compliance
- 🧪 [Golden Test Suite Overview](docs/08-tests/golden-test-suite-overview.md) - Protocol-invariant flows
- 🏗 [00-spec](docs/00-spec) - Protocol specifications
- 🎯 [01-architecture](docs/01-architecture) - System architecture and design
- ⚙️ [05-runtime](docs/05-runtime) - Runtime design (AEL, VSL, Orchestrator)
- 💡 [07-examples](docs/07-examples) - Detailed example guides

## License

Apache-2.0
