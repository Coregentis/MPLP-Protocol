# MCP Echo Server

Minimal echo server for MPLP tool-call evidence testing.

---

## BYO Execution

> ⚠️ **Bring Your Own Execution**  
> This server runs locally on your machine.  
> The Lab does not execute it and does not host submissions.

---

## Strength Level: S1 (Presence)

This flow validates presence-level tool event shapes only.  
Field semantics are not standardized in v0.2.  
Cross-artifact links (Plan↔Trace step_id) deferred to v0.3.

---

## Run Locally

```bash
npm install
npm start
```

Server listens on stdio (MCP standard).
