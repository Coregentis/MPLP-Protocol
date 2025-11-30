# L4: Integration & Infrastructure

The L4 layer provides the concrete adapters that connect the abstract MPLP runtime to the real world. It isolates vendor-specific logic from the core protocol.

## Integration Packages

The repository includes four reference integration packages:

### 1. LLM Integration (`@mplp/integration-llm-http`)
-   **Role**: Provides a generic HTTP client for LLM inference.
-   **Interface**: `LlmClient`.
-   **Implementation**: `HttpLlmClient`.
-   **Vendor Neutrality**: Configurable `baseUrl` and headers allow connection to any OpenAI-compatible API or local inference server without hardcoding provider names.

### 2. Tool Execution (`@mplp/integration-tools-generic`)
-   **Role**: Manages the execution of local or remote tools.
-   **Interface**: `ToolExecutor`.
-   **Implementation**: `InMemoryToolExecutor`.
-   **Mechanism**: Maps tool names to registered handler functions.

### 3. Storage (`@mplp/integration-storage-fs` & `kv`)
-   **Role**: Provides persistence for the VSL.
-   **Implementations**:
    -   `JsonFsStorage`: Persists state as JSON files on the local filesystem.
    -   `InMemoryKeyValueStore`: Ephemeral in-memory storage for testing.

## Usage Pattern

L4 packages are injected into the L3 Runtime at initialization time. This allows the same runtime logic to run in diverse environments (e.g., local dev, serverless, edge) simply by swapping L4 adapters.
