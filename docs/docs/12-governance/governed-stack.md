# Governed Stack Architecture

> [!IMPORTANT]
> **Normative Status**: **FROZEN v1.0.0**
> 
> This document defines the "Governed Stack" — the recommended architecture for deploying MPLP-compliant agent systems.

## 1. The Stack Layers

| Component | Role |
|:---|:---|
| **Governance Shell** | User interface for monitoring and approval |
| **MPLP Runtime** | The protocol-compliant execution engine |
| **Agent Logic** | The LLM-driven reasoning and tool use |
| **Infrastructure** | Compute, storage, and network |

## 2. Compliance Boundaries

The "Governed Stack" ensures that the **Agent Logic** is always wrapped by the **MPLP Runtime**, preventing unobserved or unauthorized actions.

---

© 2025 Bangshi Beijing Network Technology Limited Company
