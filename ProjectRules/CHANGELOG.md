# 变更日志（Changelog）

所有显著变更都会记录在此。

## [未发布]
- 待定

## [1.0.1] - 2024-07-09
### 更新
- **重大更新**：ProjectRules 根据《技术规范统一标准.md》进行全面更新
- **MPLP_ProjectRules.mdc**：新增技术标准基线章节，更新测试质量要求，补充文档管理规范
- **CONTRIBUTING.md**：新增技术标准要求章节，更新代码规范，新增质量检查清单
- **SECURITY.md**：新增安全标准要求，更新处理流程时效，补充合规要求
- **README.md**：更新文档说明，新增技术标准文档引用

### 技术标准
- 明确技术栈要求：Node.js 18+ + TypeScript 5.0+ + Express.js 4.18+ + PostgreSQL 14+ + Redis 7+
- 明确性能要求：API响应P95<100ms，协议解析<10ms，TPS>10,000，可用性99.9%
- 明确质量要求：单元测试≥90%，集成测试≥80%，E2E测试≥60%，0个高危漏洞
- 明确安全要求：TLS 1.3 + JWT + OAuth 2.0 + RBAC，100%API端点认证

## [1.0.0] - 2024-07-09
- Multi-Agent Project Lifecycle Protocol (MPLP) 项目初始化
- 完成主要文档编写
- 实现基础功能
- 建立项目规则和贡献指南

---

> 按照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范维护本文件。 