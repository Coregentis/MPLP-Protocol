# Multi-Agent Project Lifecycle Protocol (MPLP) v1.0

> **项目名称**: Multi-Agent Project Lifecycle Protocol (MPLP)  
> **版本**: v1.0.0  
> **创建时间**: 2024-07-09T14:30:00+08:00  
> **项目周期**: 10周 (2024-07-09 至 2024-09-17)  
> **负责团队**: Coregentis 技术团队

---

## 📋 项目概述

MPLP是一个厂商中立的多智能体项目生命周期协议，为AI驱动的软件开发提供统一的通信和协作框架。该协议基于6个核心模块（Context、Plan、Confirm、Trace、Role、Extension）构建，确保不同AI系统间的互操作性和一致性。

---

## 📁 项目目录结构

```
mplp-v1.0/
├── requirements-docs/           # 📋 原始需求和设计文档
│   ├── 01_技术设计文档.md
│   ├── 02_开发规范文档.md
│   ├── 03_项目管理计划.md
│   ├── 04_测试策略文档.md
│   ├── 05_API详细文档.md
│   ├── 06_质量保证文档.md
│   ├── 07_MPLP协议正式规范.md
│   ├── 08_AI_IDE使用指南.md
│   ├── 09_产品需求文档.md
│   ├── 10_协议架构及战略.md
│   ├── 技术规范统一标准.md
│   ├── 文档一致性检查清单.md
│   └── README.md
│
├── ProjectRules/               # 📜 项目管理规则
│   ├── CONTRIBUTING.md
│   ├── CODE_OF_CONDUCT.md
│   ├── SECURITY.md
│   ├── CHANGELOG.md
│   ├── LICENSE
│   ├── MPLP_ProjectRules.mdc
│   └── README.md
│
├── .cursor/                    # 🎯 IDE配置规则
│   └── rules/
│
├── src/                        # 🔧 源代码目录（开发时创建）
├── tests/                      # 🧪 测试目录（开发时创建）
├── docs/                       # 📚 开发文档目录（开发时创建）
├── scripts/                    # 📜 构建部署脚本（开发时创建）
│
├── README.md                   # 📖 项目总览
└── .cursor-rules               # 🎯 AI IDE开发规则
```

---

## 📚 文档导航

### 🎯 快速开始指南

| 文档 | 说明 | 路径 |
|-----|------|------|
| **项目总览** | 项目介绍和目录结构 | [README.md](./README.md) |
| **需求文档** | 完整的需求和设计规范 | [requirements-docs/](./requirements-docs/) |
| **开发规则** | AI IDE开发配置和规范 | [.cursor-rules](./.cursor-rules) |
| **项目规则** | 团队协作和管理规范 | [ProjectRules/](./ProjectRules/) |

### 📋 核心需求文档 ([requirements-docs/](./requirements-docs/))

| 优先级 | 文档名称 | 说明 | 状态 |
|-------|---------|------|------|
| **🔥 必读** | [技术规范统一标准.md](./requirements-docs/技术规范统一标准.md) | **项目统一技术标准基线，所有开发必须遵循** | ✅ 完成 |
| **🔥 必读** | [01_技术设计文档.md](./requirements-docs/01_技术设计文档.md) | 技术架构、系统设计、6个核心模块详细设计 | ✅ 完成 |
| **🔥 必读** | [07_MPLP协议正式规范.md](./requirements-docs/07_MPLP协议正式规范.md) | MPLP协议正式规范、6个核心模块标准定义 | ✅ 完成 |
| 重要 | [02_开发规范文档.md](./requirements-docs/02_开发规范文档.md) | 开发标准、代码规范、工作流程和质量要求 | ✅ 完成 |
| 重要 | [08_AI_IDE使用指南.md](./requirements-docs/08_AI_IDE使用指南.md) | AI IDE开发指导、最佳实践、工具使用 | ✅ 完成 |
| 重要 | [05_API详细文档.md](./requirements-docs/05_API详细文档.md) | REST API、GraphQL、WebSocket接口规范 | ✅ 完成 |
| 辅助 | [03_项目管理计划.md](./requirements-docs/03_项目管理计划.md) | 项目规划、里程碑、任务分解和进度管理 | ✅ 完成 |
| 辅助 | [04_测试策略文档.md](./requirements-docs/04_测试策略文档.md) | 测试策略、测试计划、质量保证和验收标准 | ✅ 完成 |
| 辅助 | [06_质量保证文档.md](./requirements-docs/06_质量保证文档.md) | 质量标准、审查流程、监控度量 | ✅ 完成 |
| 辅助 | [09_产品需求文档.md](./requirements-docs/09_产品需求文档.md) | 产品需求、功能规范、验收标准 | ✅ 完成 |
| 辅助 | [10_协议架构及战略.md](./requirements-docs/10_协议架构及战略.md) | 协议架构设计、技术战略、发展规划 | ✅ 完成 |
| 检查 | [文档一致性检查清单.md](./requirements-docs/文档一致性检查清单.md) | 文档一致性验证清单，确保技术规范统一 | ✅ 完成 |

### 🔧 开发配置文件

| 文件 | 说明 | 状态 |
|-----|------|------|
| [.cursor-rules](./.cursor-rules) | Cursor AI IDE开发规则和智能提示配置 | ✅ 完成 |
| [.cursor/rules/](./cursor/rules/) | 专项开发规则配置（命名规范、测试风格等） | ✅ 完成 |

### 📋 项目管理规则 ([ProjectRules/](./ProjectRules/))

| 文档名称 | 说明 | 状态 |
|---------|------|------|
| [CONTRIBUTING.md](./ProjectRules/CONTRIBUTING.md) | 贡献指南、协作流程、Pull Request规范 | ✅ 完成 |
| [CODE_OF_CONDUCT.md](./ProjectRules/CODE_OF_CONDUCT.md) | 行为准则、团队规范、社区标准 | ✅ 完成 |
| [SECURITY.md](./ProjectRules/SECURITY.md) | 安全策略、漏洞报告、安全最佳实践 | ✅ 完成 |
| [CHANGELOG.md](./ProjectRules/CHANGELOG.md) | 变更日志、版本历史、发布记录 | ✅ 完成 |
| [LICENSE](./ProjectRules/LICENSE) | 开源许可证（MIT License） | ✅ 完成 |
| [MPLP_ProjectRules.mdc](./ProjectRules/MPLP_ProjectRules.mdc) | 项目专用规则文档、团队工作流程 | ✅ 完成 |
| [README.md](./ProjectRules/README.md) | 项目规则总览和使用指南 | ✅ 完成 |

---

## 🏗️ 核心架构

MPLP基于6个核心模块构建：

```
┌─────────────────────────────────────────────────────────────┐
│                    MPLP v1.0 协议层                          │
├─────────────────────────────────────────────────────────────┤
│  Context  │  Plan   │ Confirm │  Trace  │  Role  │Extension │
│   模块    │  模块   │  模块   │  模块   │  模块  │   模块   │
├─────────────────────────────────────────────────────────────┤
│                      实现层接口                              │
├─────────────────────────────────────────────────────────────┤
│  TracePilot  │  Coregentis  │  第三方实现  │  自定义实现    │
└─────────────────────────────────────────────────────────────┘
```

### 🔗 模块关系图

```
Context ←→ Plan ←→ Confirm ←→ Trace
   ↕        ↕        ↕        ↕
Role ←→ Extension ←→ Security ←→ Monitoring
```

---

## 🚀 快速开始

### 👤 新成员入项指南

1. **📖 阅读核心文档**（按以下顺序）：
   - [requirements-docs/技术规范统一标准.md](./requirements-docs/技术规范统一标准.md) - 必读技术基线
   - [requirements-docs/01_技术设计文档.md](./requirements-docs/01_技术设计文档.md) - 了解整体架构
   - [requirements-docs/02_开发规范文档.md](./requirements-docs/02_开发规范文档.md) - 掌握开发规范
   - [requirements-docs/07_MPLP协议正式规范.md](./requirements-docs/07_MPLP协议正式规范.md) - 理解协议规范

2. **🔧 配置开发环境**：
   - 参考 [requirements-docs/08_AI_IDE使用指南.md](./requirements-docs/08_AI_IDE使用指南.md) 配置AI IDE
   - 查看 [.cursor-rules](./.cursor-rules) 了解开发规则配置

3. **📋 了解项目规则**：
   - 阅读 [ProjectRules/CONTRIBUTING.md](./ProjectRules/CONTRIBUTING.md) 了解贡献流程
   - 查看 [ProjectRules/](./ProjectRules/) 所有团队协作规范

### 🔍 文档查找指南

根据需求快速找到相关文档：

- **🏗️ 架构设计** → [requirements-docs/01_技术设计文档.md](./requirements-docs/01_技术设计文档.md), [requirements-docs/10_协议架构及战略.md](./requirements-docs/10_协议架构及战略.md)
- **📝 开发规范** → [requirements-docs/02_开发规范文档.md](./requirements-docs/02_开发规范文档.md), [.cursor-rules](./.cursor-rules)
- **🔌 API设计** → [requirements-docs/05_API详细文档.md](./requirements-docs/05_API详细文档.md), [requirements-docs/07_MPLP协议正式规范.md](./requirements-docs/07_MPLP协议正式规范.md)
- **🧪 测试规范** → [requirements-docs/04_测试策略文档.md](./requirements-docs/04_测试策略文档.md), [requirements-docs/06_质量保证文档.md](./requirements-docs/06_质量保证文档.md)
- **📋 产品需求** → [requirements-docs/09_产品需求文档.md](./requirements-docs/09_产品需求文档.md)
- **👥 团队协作** → [ProjectRules/](./ProjectRules/)

---

## 🤝 贡献指南

请查看 [ProjectRules/CONTRIBUTING.md](./ProjectRules/CONTRIBUTING.md) 了解如何参与项目贡献。

---

## 📄 许可证

本项目采用 MIT 许可证，详见 [ProjectRules/LICENSE](./ProjectRules/LICENSE)。

---

## 📞 联系我们

如有问题或建议，请通过以下方式联系：
- 项目 Issues
- 邮件: mplp-support@coregentis.com
- 技术支持: team@coregentis.com

---

> **最后更新**: 2025-01-27  
> **文档版本**: v1.0.1  
> **目录重组**: 需求文档已移至 requirements-docs/ 目录 