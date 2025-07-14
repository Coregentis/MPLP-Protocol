# MPLP 数据库架构

本目录包含 Multi-Agent Project Lifecycle Protocol (MPLP) 项目的数据库架构定义和迁移脚本。

## 架构概述

MPLP 数据库架构基于 Schema 驱动开发原则设计，严格遵循厂商中立设计规则。数据库表结构直接映射自项目中定义的 JSON Schema，确保数据模型与业务逻辑的一致性。

### 核心模块表结构

数据库架构包含 6 个核心模块的表结构：

1. **Context 模块**
   - `mplp_contexts`: 上下文主表
   - `mplp_shared_states`: 共享状态表
   - `mplp_context_sessions`: 会话表

2. **Plan 模块**
   - `mplp_plans`: 计划主表
   - `mplp_tasks`: 任务表
   - `mplp_task_dependencies`: 任务依赖表
   - `mplp_milestones`: 里程碑表
   - `mplp_failure_resolvers`: 故障解决器表
   - `mplp_failures`: 故障记录表

3. **Role 模块**
   - `mplp_roles`: 角色主表
   - `mplp_permissions`: 权限表
   - `mplp_role_inheritance`: 角色继承表
   - `mplp_role_delegations`: 角色委派表
   - `mplp_user_role_assignments`: 用户角色分配表
   - `mplp_role_audit_logs`: 角色审计日志表

4. **Confirm 模块**
   - `mplp_confirmations`: 确认主表
   - `mplp_approval_workflows`: 审批工作流表
   - `mplp_approval_steps`: 审批步骤表
   - `mplp_escalation_rules`: 升级规则表
   - `mplp_audit_trails`: 审计跟踪表
   - `mplp_confirm_attachments`: 附件表

5. **Trace 模块**
   - `mplp_traces`: 追踪主表
   - `mplp_trace_events`: 事件表
   - `mplp_performance_metrics`: 性能指标表
   - `mplp_context_snapshots`: 上下文快照表
   - `mplp_error_information`: 错误信息表
   - `mplp_decision_logs`: 决策日志表
   - `mplp_trace_correlations`: 关联表

6. **Extension 模块**
   - `mplp_extensions`: 扩展主表
   - `mplp_extension_points`: 扩展点表
   - `mplp_api_extensions`: API扩展表
   - `mplp_event_subscriptions`: 事件订阅表
   - `mplp_extension_lifecycles`: 生命周期表
   - `mplp_extension_dependencies`: 扩展依赖表
   - `mplp_extension_executions`: 扩展执行日志表

## 迁移文件

数据库迁移使用 TypeORM 迁移系统实现，确保数据库版本可控。迁移文件位于 `src/database/migrations/` 目录下：

- `20250709_create_context_tables.ts`: Context 模块表结构
- `20250717_create_plan_tables.ts`: Plan 模块表结构
- `20250717_create_role_tables.ts`: Role 模块表结构
- `20250717_create_confirm_tables.ts`: Confirm 模块表结构
- `20250717_create_trace_tables.ts`: Trace 模块表结构
- `20250717_create_extension_tables.ts`: Extension 模块表结构

## 数据库配置

数据库配置位于 `src/database/data-source.ts` 文件中，使用 TypeORM 的 DataSource 配置。主要配置包括：

- 数据库连接信息
- 实体映射
- 迁移配置
- 连接池设置
- 缓存配置

## 使用方法

### 运行迁移

在开发环境中，迁移会自动运行。在生产环境中，可以使用以下命令手动运行迁移：

```bash
# 生成迁移脚本（如果有模型变更）
npm run typeorm migration:generate -- -n MigrationName

# 运行迁移
npm run typeorm migration:run
```

### 回滚迁移

如果需要回滚迁移，可以使用以下命令：

```bash
# 回滚最后一次迁移
npm run typeorm migration:revert
```

## 设计原则

1. **Schema 驱动开发**：数据库表结构直接映射自 JSON Schema 定义，确保数据模型与业务逻辑的一致性。

2. **厂商中立设计**：避免使用特定数据库的专有功能，确保可以在不同数据库系统之间迁移。

3. **性能优化**：为常用查询添加适当的索引，优化查询性能。

4. **数据完整性**：使用外键约束确保数据引用完整性。

5. **版本控制**：使用迁移系统管理数据库版本，确保可重复部署。

## 实体关系图

核心表之间的关系如下图所示：

```
MPLP_PLANS <-- MPLP_TASKS <-- MPLP_TASK_DEPENDENCIES
MPLP_ROLES <-- MPLP_PERMISSIONS
MPLP_CONFIRMATIONS <-- MPLP_APPROVAL_WORKFLOWS <-- MPLP_APPROVAL_STEPS
MPLP_TRACES <-- MPLP_TRACE_EVENTS
MPLP_EXTENSIONS <-- MPLP_EXTENSION_POINTS
```

完整的实体关系图可以在项目文档中查看。

## 注意事项

1. 在生产环境中，请确保在部署前备份数据库。
2. 迁移脚本是增量的，请不要修改已经应用的迁移脚本。
3. 如果需要修改表结构，请创建新的迁移脚本。
4. 在开发环境中，可以使用 `synchronize: true` 选项自动同步表结构，但在生产环境中应该禁用此选项。 