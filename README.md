# Multi-Agent Project Lifecycle Protocol (MPLP) v1.0

> **项目版本**: v1.0.1  
> **更新时间**: 2025-07-11T23:59:23Z  
> **开发状态**: ✅ **Phase 3 - Plan模块开发完成**  
> **新增功能**: Plan模块failure_resolver机制，TracePilot增强版适配器，Schema驱动开发规范 🆕

## 🎯 项目概述

Multi-Agent Project Lifecycle Protocol (MPLP) 是一个标准化的多代理项目生命周期协议，提供了完整的Plan→Confirm→Trace→Delivery工作流程控制。

### 🚀 核心特性

#### **6个核心模块** (v1.0标准)
- **Context模块** - 全局状态管理 (<5ms性能)
- **Plan模块** - 任务规划结构 + **失败恢复机制** 🆕
- **Confirm模块** - 验证决策机制 (<3ms性能)
- **Trace模块** - 追踪记录信息 (<2ms性能)
- **Role模块** - 角色定义能力 (<1ms性能)
- **Extension模块** - 扩展机制框架 (<50ms性能)

#### **Plan模块增强功能** 🆕
- **失败恢复策略**: retry/rollback/skip/manual_intervention
- **批量恢复处理**: 支持批量失败任务处理
- **依赖管理**: 智能解锁依赖任务
- **性能监控**: <10ms失败恢复，<50ms批处理

#### **TracePilot双版本集成** 🆕
- **基础版适配器**: `tracepilot-adapter.ts` - 标准同步功能
- **增强版适配器**: `enhanced-tracepilot-adapter.ts` - AI智能追踪
- **智能功能**: 问题检测、任务追踪、自动修复建议
- **向后兼容**: 完整兼容现有接口

### 📊 性能指标

- **API响应时间**: P95 < 100ms, P99 < 200ms
- **协议解析**: < 10ms
- **Plan模块**: 计划解析<8ms，失败恢复<10ms 🆕
- **TracePilot同步**: 单次<100ms，批处理>1000 TPS

## 🏗️ 技术架构

### 核心技术栈
- **Node.js 18+** + **TypeScript 5.0+** (严格模式)
- **Express.js 4.18+** + **WebSocket**
- **PostgreSQL 14+** + **Redis 7+**
- **Docker** + **Kubernetes**

### 项目结构
```
mplp-v1.0/
├── src/
│   ├── modules/
│   │   ├── context/         # Context模块
│   │   ├── plan/           # Plan模块 + failure_resolver 🆕
│   │   ├── trace/          # Trace模块
│   │   └── ...
│   ├── mcp/
│   │   ├── tracepilot-adapter.ts         # 基础版适配器
│   │   └── enhanced-tracepilot-adapter.ts # 增强版适配器 🆕
│   └── ...
├── .cursor/
│   ├── rules/              # 14个治理规则文件
│   └── presets/           # AI助手约束配置
├── ProjectRules/          # 项目主规则配置
└── docs/                  # 完整文档体系 🆕
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

### 运行测试
```bash
npm test                    # 单元测试 (≥90%覆盖率)
npm run test:integration   # 集成测试 (≥80%覆盖率)
npm run test:e2e          # E2E测试 (≥60%覆盖率)
```

## 📋 开发规范

### Schema驱动开发原则 🆕
所有开发必须严格遵循Schema驱动原则：

1. **📖 开发前必读Schema** - 先读取相关`src/schemas/*.json`文件
2. **🎯 100%字段匹配** - 所有字段名称、类型、枚举值必须完全匹配Schema
3. **🔄 严格开发顺序** - Schema → Types → Modules → Services → Tests
4. **🚫 禁止Schema偏离** - 严禁使用与Schema不符的字段名称或类型

### 文件命名规范 🆕
所有模块内文件必须遵循统一的命名格式：

```
{module-name}-{component-type}.ts
```

例如：`context-controller.ts`, `plan-manager.ts`, `failure-resolver.ts`

详细规范请参阅[文件命名规范指南](docs/guides/file-naming-convention.md)

### 文件重命名工具 🆕
项目提供自动重命名工具，帮助修正不符合命名规范的文件：

```bash
npm run rename-files
```

### Plan→Confirm→Trace→Delivery流程
每个开发任务必须严格遵循四阶段流程：

1. **📋 Plan** - 分析需求，**先读取Schema**，制定技术方案 🆕
2. **✅ Confirm** - 确认方案，验证Schema合规性和规则符合性 🆕
3. **📊 Trace** - 实施开发，记录进度指标
4. **🚀 Delivery** - 交付验证，更新文档版本

### 规则文件引用
- 必须优先引用 `.cursor/rules/schema-driven-development.mdc` 🆕
- 必须引用相关 `.cursor/rules/*.mdc` 文件
- 必须遵循 `auto-sync-updates.mdc` 同步更新规则
- 必须验证性能标准和测试覆盖率

## 📚 文档体系

### 完整文档结构 🆕
- **[requirements-docs/](requirements-docs/)** - 原始需求文档
- **[docs/](docs/)** - 按功能分类的文档体系
  - `architecture/` - 架构设计文档
  - `tracepilot/` - TracePilot集成文档
  - `mcp/` - MCP协议集成文档
  - `user-guides/` - 用户指南文档
  - `api/` - API接口文档
  - `guides/` - 开发指南文档 🆕
    - [文件命名规范指南](docs/guides/file-naming-convention.md) 🆕

### 关键文档
- [开发预设指令](.cursor/presets/mplp-development.md) (v2.2)
- [项目治理报告](docs/architecture/governance-report.md)
- [TracePilot激活报告](docs/tracepilot/activation-report.md)
- [Plan模块失败恢复机制](src/modules/plan/) 🆕
- [命名约定规则](.cursor/rules/naming-convention.mdc) 🆕

## 🎯 最新更新 (v1.0.1)

### Plan模块增强 🆕
- ✅ 实现failure_resolver失败恢复机制
- ✅ 支持4种恢复策略 (retry/rollback/skip/manual)
- ✅ 批量失败任务处理能力
- ✅ 智能依赖管理和解锁
- ✅ 完整测试覆盖 (>90%)

### TracePilot适配器升级 🆕
- ✅ 升级到增强版适配器
- ✅ 新增AI智能追踪功能
- ✅ 问题检测和自动修复建议
- ✅ 向后兼容保障
- ✅ 完整测试适配

### 治理层优化 🆕
- ✅ 新增auto-sync-updates.mdc自动同步规则
- ✅ 完善版本管理和文档一致性
- ✅ 强化规则文件交叉引用验证
- ✅ 统一文件命名规范和自动检查机制

## 🤝 贡献指南

请参阅 [CONTRIBUTING.md](ProjectRules/CONTRIBUTING.md) 了解详细的贡献流程。

## 📄 许可证

本项目采用 [MIT License](ProjectRules/LICENSE)。

---

**维护团队**: Coregentis MPLP 项目团队  
**技术支持**: [GitHub Issues](../../issues)  
**文档更新**: 遵循auto-sync-updates.mdc自动同步机制 