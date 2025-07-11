# Changelog

所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [Unreleased]

### Added
- Extension模块添加了缺失的`event_subscriptions`和`lifecycle`字段，符合Schema标准
- 新增`toExtensionPerformanceMetrics`函数，支持性能指标转换为Schema标准格式

### Changed
- Extension模块字段重命名：`extension_type` → `type`，`security_policies` → `security`
- 文件重命名：`extension.controller.ts` → `extension-controller.ts`，保持命名一致性
- 更新utils/performance.ts和utils/logger.ts，使用Schema标准类型
- 所有Record<string, any>类型更新为Record<string, unknown>，提高类型安全性

### Fixed
- 修复Extension模块与Schema定义不一致的问题
- 修复ExtensionExecutionContext中的request_id引用错误

## [1.0.0] - 2025-07-09

### Added
- 初始版本发布
- 实现6个核心模块：Context, Plan, Confirm, Trace, Role, Extension
- 完整的REST API和GraphQL支持
- RBAC权限控制系统
- 完备的测试覆盖率 