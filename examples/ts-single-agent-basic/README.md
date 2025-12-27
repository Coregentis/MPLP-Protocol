# MPLP Single Agent Basic Example

This project demonstrates a complete, runnable implementation of the **MPLP (Multi-Agent Lifecycle Protocol)** Single Agent Flow using the TypeScript Reference Runtime.

It showcases the core lifecycle of an MPLP execution: **Context → Plan → Confirm → Trace**.

## 🌟 Features

-   **Full Protocol Compliance**: Generates valid L1 Protocol Objects (Context, Plan, Confirm, Trace).
-   **Reference Runtime**: Uses `@mplp/reference-runtime` to orchestrate the flow.
-   **In-Memory Execution**: Demonstrates the logic without requiring external databases or heavy infrastructure.
-   **Persistence**: Uses `@mplp/integration-storage-fs` to log the startup state to the local filesystem.

## 📂 Project Structure

```text
.
├── src/
│   └── index.ts        # Main entry point containing the flow logic
├── data/               # Output directory for file-based storage logs
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

-   **Node.js**: v18 or higher
-   **pnpm**: v8 or higher (recommended for this monorepo)

### Installation

If you are running this from within the MPLP monorepo:

```bash
# In the root of the monorepo
pnpm install
pnpm -r build
```

### Running the Example

You can run this example directly using the script defined in the root `package.json`:

```bash
pnpm examples:ts-single-agent
```

Or run it from within the example directory:

```bash
cd examples/ts-single-agent-basic
pnpm start
```

## 📝 Code Walkthrough

The core logic resides in `src/index.ts`. Here is a breakdown of what happens:

### 1. Initialization

We start by initializing the **Runtime Context** with a unique Run ID. This context holds the state of our execution.

```typescript
const runId = uuidv4();
const context = new RuntimeContext(runId);
```

### 2. Storage Setup

We configure the **Value State Layer (VSL)** to use the file system. This ensures that our execution state is persisted.

```typescript
const storage = new JsonFsStorage({ baseDir: path.join(__dirname, '../data') });
const vsl = new InMemoryVSL(storage);
```

### 3. Orchestration

We instantiate the `SingleAgentOrchestrator`. This component is responsible for driving the flow according to the MPLP standard.

```typescript
const orchestrator = new SingleAgentOrchestrator({
    vsl: vsl,
    // We inject stub handlers for this example to simulate agent behavior
    modules: createStubModuleRegistry() 
});
```

### 4. Execution

We execute the flow. The orchestrator performs the following steps sequentially:

1.  **Context Creation**: Establishes the boundary and scope of the task.
2.  **Planning**: Generates a `Plan` object with specific steps to achieve the objective.
3.  **Confirmation**: A `Confirm` object is generated (simulating user or supervisor approval).
4.  **Tracing**: A `Trace` object is created to track the execution of the plan.

```typescript
const result = await orchestrator.run(initialContext);
```

### 5. Output

Upon success, the example prints the IDs of the generated objects and logs the total number of events emitted during the session.

## 📊 Expected Output

When you run the example, you should see output similar to this:

```text
Starting Single Agent Basic Example...
[Info] Storage initialized at: .../examples/ts-single-agent-basic/data
[Info] Flow started with Run ID: 550e8400-e29b-41d4-a716-446655440000

Context ID: 550e8400-e29b-41d4-a716-446655440001
Domain:     example-domain

--- Step 2: Plan Generated ---
Plan ID:    550e8400-e29b-41d4-a716-446655440002
Steps:      1

--- Step 3: Plan Confirmed ---
Plan Confirmed: 550e8400-e29b-41d4-a716-446655440003
Status:     approved

--- Step 4: Trace Started ---
Trace ID:   550e8400-e29b-41d4-a716-446655440004
Root Span:  root

✅ Flow succeeded!
Total Events: 8
```

## 🔍 What to Look For

-   Check the `data/` directory after running. You will see JSON files representing the state snapshots.
-   Review `src/index.ts` to see how `RuntimeContext` is used to pass data between stages.
-   Notice how the **Module Registry** allows us to swap real LLM calls with simple stubs for testing and demonstration.

## 🛠 Alternative: Using @mplp/sdk-ts

The code in `src/index.ts` demonstrates the low-level usage of `@mplp/reference-runtime`. For a simplified experience, you can use the `@mplp/sdk-ts` package:

```typescript
import { MplpRuntimeClient } from '@mplp/sdk-ts';

const client = new MplpRuntimeClient();
const result = await client.runSingleAgentFlow({ ... });
```

See [TypeScript SDK Guide](../../docs/10-sdk/ts-sdk-guide.md) for details.

## 🛠 Extension

To turn this into a real-world application:
1.  Replace the `InMemoryVSL` with a database-backed VSL (e.g., PostgreSQL).
2.  Replace the stub module handlers with real handlers that call an LLM (using `@mplp/integration-llm-http`).

---
**License**: [Apache 2.0](../../LICENSE.txt)