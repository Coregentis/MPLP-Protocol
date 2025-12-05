# MPLP SDK Overview

**Protocol Version**: v1.0.0 (FROZEN)

## SDK Matrix

| Language   | Package        | Version | Status | Golden Flows (01-05) |
|------------|----------------|---------|--------|----------------------|
| TypeScript | `@mplp/sdk-ts` | 1.0.3   | Stable | Fully Covered        |
| Python     | `mplp`         | 1.0.0   | Stable | Fully Covered        |

## Golden Flows

The following standardized flows are implemented in both SDKs to ensure parity:

1.  **Single Agent**: Basic plan execution.
2.  **Multi-Agent**: Coordination between multiple agents.
3.  **Risk Confirmation**: Human-in-the-loop confirmation.
4.  **Error Recovery**: Handling and recovering from failures.
5.  **Network Transport**: Event propagation over network.

## Cross-Language Testing

Cross-language compatibility is verified via:
- `packages/sdk-py/tests/cross_language/`
- Shared fixtures in `packages/sdk-py/testing/fixtures/`

## Roadmap

- **v1.1**: Enhanced Observability
- **Future**: Go, Rust, Java SDKs
