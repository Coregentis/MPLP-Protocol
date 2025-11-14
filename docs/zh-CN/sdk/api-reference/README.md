# API参考文档

> **🌐 语言**: [English](../../docs-sdk-en/api-reference/README.md) | 中文

欢迎使用MPLP SDK API参考文档。本节提供完整的API文档和使用指南。

---

## 📚 **核心API**

### **SDK核心**
- [SDK Core API](sdk-core.md) - MPLP类、工厂函数、配置接口

---

## 🎯 **快速导航**

### **主要类**

| 类名 | 描述 | 文档链接 |
|------|------|---------|
| `MPLP` | SDK主入口类 | [SDK Core](sdk-core.md#mplp类) |
| `MPLPConfig` | 配置接口 | [SDK Core](sdk-core.md#mplpconfig接口) |

### **工厂函数**

| 函数名 | 描述 | 文档链接 |
|--------|------|---------|
| `createMPLP()` | 创建MPLP实例 | [SDK Core](sdk-core.md#createmplp) |
| `quickStart()` | 快速启动 | [SDK Core](sdk-core.md#quickstart) |
| `createProductionMPLP()` | 生产环境配置 | [SDK Core](sdk-core.md#createproductionmplp) |
| `createTestMPLP()` | 测试环境配置 | [SDK Core](sdk-core.md#createtestmplp) |

---

## 🔧 **模块API**

MPLP提供10个核心模块，每个模块都有独立的API：

| 模块 | 描述 | 状态 |
|------|------|------|
| Context | 上下文管理 | ✅ 可用 |
| Plan | 规划协调 | ✅ 可用 |
| Role | 角色权限 | ✅ 可用 |
| Confirm | 审批确认 | ✅ 可用 |
| Trace | 执行跟踪 | ✅ 可用 |
| Extension | 扩展管理 | ✅ 可用 |
| Dialog | 对话管理 | ✅ 可用 |
| Collab | 协作决策 | ✅ 可用 |
| Network | 网络通信 | ✅ 可用 |
| Core | 核心协调 | ✅ 可用 |

> **注意**: 详细的模块API文档请参考主项目的[docs/](../../docs/)目录。

---

## 📖 **使用示例**

### **基础使用**

```typescript
import { createMPLP } from 'mplp';

// 创建MPLP实例
const mplp = await createMPLP({
  modules: ['context', 'plan', 'role']
});

// 获取模块
const contextModule = mplp.getModule('context');

// 使用模块
// ...
```

### **完整示例**

查看[示例文档](../examples/)了解更多完整示例。

---

## 🔗 **相关资源**

- [快速开始](../getting-started/first-agent.md)
- [教程](../tutorials/)
- [示例](../examples/)
- [指南](../guides/)

---

## 📝 **版本信息**

- **当前版本**: v1.1.0
- **协议版本**: L1-L3
- **更新时间**: 2025-10-22

---

## 💡 **获取帮助**

- [GitHub Issues](https://github.com/Coregentis/MPLP-Protocol/issues)
- [讨论区](https://github.com/Coregentis/MPLP-Protocol/discussions)
- [文档主页](../../README.md)

---

**维护者**: MPLP Team  
**许可证**: MIT

