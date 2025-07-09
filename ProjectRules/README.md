# MPLP 1.0 项目管理规则

> **规则版本**: v2.1  
> **创建时间**: 2025-07-09  
> **最后更新**: 2025-07-09T19:04:01+08:00  
> **适用范围**: Multi-Agent Project Lifecycle Protocol (MPLP) v1.0 项目  
> **关联文档**: [Requirements-docs](../requirements-docs/) | [MPLP协议开发专项路线图](../requirements-docs/mplp_protocol_roadmap.md)  
> **协议版本**: v1.0 (完全基于Roadmap v1.0规划)

## 📋 项目规则概述

本文件夹包含MPLP 1.0项目的所有管理规则、协作规范和社区治理文档，确保项目按照统一的标准和流程进行开发和维护。

## 📚 规则文档结构

### 🎯 核心管理文档
| 文档名称 | 说明 | 版本 |
|---------|------|------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 贡献指南和代码提交规范 | v2.1 |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | 社区行为准则和协作规范 | v2.1 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更记录和发布说明 | v2.1 |
| [SECURITY.md](./SECURITY.md) | 安全政策和漏洞报告流程 | v2.1 |
| [LICENSE](./LICENSE) | 项目许可证（MIT License） | v2.1 |

### 🔧 项目配置文档
| 文档名称 | 说明 | 版本 |
|---------|------|------|
| [MPLP_ProjectRules.mdc](./MPLP_ProjectRules.mdc) | MPLP项目规则配置文件 | v2.1 |

## 🎯 项目管理标准（基于Roadmap v1.0）

### 开发周期管理
- **项目周期**: 12周 (2025-07-09 至 2025-10-01)
- **开发阶段**: 5个主要阶段（符合Roadmap规划）
  1. 核心架构实现 (第1-2周)
  2. 6个核心模块实现 (第3-6周)
  3. 集成和API层 (第7-8周)
  4. 测试和文档 (第9-10周)
  5. 发布准备 (第11-12周)

### 技术标准（匹配Roadmap技术栈）
- **技术栈**: Node.js 18+ + TypeScript 5.0+ + PostgreSQL 14+ + Redis 7+
- **性能标准**: API响应P95<100ms，协议解析<10ms
- **质量标准**: 单元测试≥90%，集成测试≥80%
- **安全标准**: TLS 1.3 + JWT + RBAC

### 协议规范
- **核心模块**: Context、Plan、Confirm、Trace、Role、Extension (6个核心模块)
- **协议版本**: v1.0 (基于Roadmap v1.0规划)
- **平台集成**: TracePilot + Coregentis双平台支持

---

**规则维护**: Coregentis MPLP项目团队  
**技术支持**: mplp-support@coregentis.com  
**更新周期**: 重大变更时或每月定期更新 