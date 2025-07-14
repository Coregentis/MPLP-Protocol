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

## [1.0.2] - 2025-07-12

### Added
- 实现厂商中立设计原则，确保模块间通过标准接口通信
- 增强Plan模块的故障解决器功能，支持智能诊断和恢复建议
- 新增`ITraceAdapter`接口，替代直接依赖特定厂商实现
- 添加`syncFailureToAdapter`方法，支持将故障信息同步到任何兼容适配器
- 添加`getRecoverySuggestions`方法，从增强型适配器获取恢复建议
- 添加`detectDevelopmentIssues`方法，检测与故障相关的开发问题
- 更新Schema定义，添加`recovery_suggestions`和`development_issues`字段
- 新增API端点支持故障诊断和恢复建议功能
- 添加详细的技术文档`docs/failure-resolver.md`

### Changed
- 接口命名规范从`TraceAdapterInterface`更新为`ITraceAdapter`
- 字段命名从厂商特定（如`tracepilot_metadata`）更新为中立命名（如`adapter_metadata`）
- 重构`PlanManager.setTraceAdapter`方法，支持自动检测增强型适配器功能
- 更新`FailureResolverManager`，使用厂商中立设计原则
- 优化`diagnoseFaiure`方法，利用增强型适配器的AI诊断能力
- 更新`updateTaskStatus`方法，支持增强型故障处理功能

### Fixed
- 修复Plan模块与特定厂商实现强耦合的问题
- 解决多厂商适配器切换时的兼容性问题
- 修复故障诊断过程中的性能瓶颈，确保<10ms响应时间

### Security
- 增强故障处理过程中的数据安全性，确保敏感信息不被泄露
- 实现适配器权限验证，防止未授权的适配器访问

## [1.0.1] - 2025-07-10

### Added
- 添加Trace模块与Plan模块的集成接口
- 实现基础故障解决器功能

### Changed
- 优化Plan模块的性能，提高任务处理速度
- 更新Schema定义，支持更丰富的元数据

### Fixed
- 修复Plan模块中的并发任务处理问题
- 解决Trace模块数据同步的竞态条件

## [1.0.0] - 2025-07-09

### Added
- 初始版本发布
- 实现6个核心模块：Context, Plan, Confirm, Trace, Role, Extension
- 完整的REST API和GraphQL支持
- RBAC权限控制系统
- 完备的测试覆盖率 