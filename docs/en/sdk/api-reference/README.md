# API Reference Documentation

> **🌐 Language**: English | [中文](../../docs-sdk/api-reference/README.md)

Welcome to the MPLP SDK API Reference Documentation. This section provides complete API documentation and usage guides.

---

## 📚 **Core API**

### **SDK Core**
- [SDK Core API](sdk-core.md) - MPLP class, factory functions, configuration interface

---

## 🎯 **Quick Navigation**

### **Main Classes**

| Class | Description | Documentation Link |
|-------|-------------|-------------------|
| `MPLP` | SDK main entry class | [SDK Core](sdk-core.md#mplp-class) |
| `MPLPConfig` | Configuration interface | [SDK Core](sdk-core.md#mplpconfig-interface) |

### **Factory Functions**

| Function | Description | Documentation Link |
|----------|-------------|-------------------|
| `createMPLP()` | Create MPLP instance | [SDK Core](sdk-core.md#createmplp) |
| `quickStart()` | Quick start | [SDK Core](sdk-core.md#quickstart) |
| `createProductionMPLP()` | Production configuration | [SDK Core](sdk-core.md#createproductionmplp) |
| `createTestMPLP()` | Test configuration | [SDK Core](sdk-core.md#createtestmplp) |

---

## 🔧 **Module APIs**

MPLP provides 10 core modules, each with independent APIs:

| Module | Description | Status |
|--------|-------------|--------|
| Context | Context management | ✅ Available |
| Plan | Planning coordination | ✅ Available |
| Role | Role permissions | ✅ Available |
| Confirm | Approval workflow | ✅ Available |
| Trace | Execution tracking | ✅ Available |
| Extension | Extension management | ✅ Available |
| Dialog | Dialog management | ✅ Available |
| Collab | Collaboration decision | ✅ Available |
| Network | Network communication | ✅ Available |
| Core | Core coordination | ✅ Available |

> **Note**: For detailed module API documentation, please refer to the main project's [docs/](../../docs/) directory.

---

## 📖 **Usage Examples**

### **Basic Usage**

```typescript
import { createMPLP } from 'mplp';

// Create MPLP instance
const mplp = await createMPLP({
  modules: ['context', 'plan', 'role']
});

// Get module
const contextModule = mplp.getModule('context');

// Use module
// ...
```

### **Complete Examples**

See [Examples Documentation](../examples/) for more complete examples.

---

## 🔗 **Related Resources**

- [Getting Started](../getting-started/first-agent.md)
- [Tutorials](../tutorials/)
- [Examples](../examples/)
- [Guides](../guides/)

---

## 📝 **Version Information**

- **Current Version**: v1.1.0
- **Protocol Version**: L1-L3
- **Last Updated**: 2025-10-22

---

## 💡 **Get Help**

- [GitHub Issues](https://github.com/Coregentis/MPLP-Protocol/issues)
- [Discussions](https://github.com/Coregentis/MPLP-Protocol/discussions)
- [Documentation Home](../../README.md)

---

**Maintainer**: MPLP Team  
**License**: MIT

