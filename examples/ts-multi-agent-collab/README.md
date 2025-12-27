# MPLP Multi-Agent Collaboration Example

> **Status**: 🚧 **Skeleton / Planned for Phase P7**
>
> This directory contains the architectural skeleton for the Multi-Agent Collaboration flow. The full implementation will be delivered in Phase P7 following the release of the Golden Test Suite.

## 🎯 Objective

The goal of this example is to demonstrate how multiple independent Agents can collaborate to solve a complex problem using the MPLP protocol. Unlike the Single Agent flow, this involves:

1.  **Multiple Roles**: Distinct agents with different capabilities (e.g., a "Planner" and an "Executor").
2.  **Dialog**: Structured message exchange between agents.
3.  **Shared State**: A synchronized `Collab` object that tracks the joint progress.

## 🏗 Architecture Design

### 1. The Agents

We define two primary agents for this scenario:

*   **Agent A (Planner)**:
    *   **Role**: Analyzes the user request and decomposes it into a high-level plan.
    *   **Capabilities**: `planning`, `delegation`.
    *   **Responsibility**: Owns the `Plan` object.

*   **Agent B (Executor)**:
    *   **Role**: Executes specific steps defined by the Planner.
    *   **Capabilities**: `tool-execution`, `api-calls`.
    *   **Responsibility**: Reports status updates and results back to the Planner.

### 2. The Protocol Flow

The collaboration follows a strict protocol flow:

1.  **Handshake**: Agents establish a `Network` session and exchange `Role` definitions.
2.  **Proposal**: The Planner creates a `Plan` and shares it via a `Dialog` message.
3.  **Negotiation**: The Executor reviews the plan. It can `Confirm` it or request changes (creating a `Dialog` thread).
4.  **Execution**: Once confirmed, the Executor runs the steps.
5.  **Synchronization**: The `Collab` object is updated with the status of each step, ensuring both agents have a consistent view of reality.

### 3. Data Model

## 📂 Current Structure

```text
.
├── src/
│   └── index.ts        # Skeleton entry point (Placeholder)
├── package.json        # Project configuration
└── tsconfig.json       # TypeScript configuration
```

## 🚀 How to Run (Future)

Once implemented, this example will be runnable via:

```bash
pnpm examples:ts-multi-agent
```

It will output the conversation log between the two agents and the final state of the shared Plan.