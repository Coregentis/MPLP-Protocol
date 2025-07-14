# Multi-Agent Project Lifecycle Protocol (MPLP) v1.0

> **项目版本**: v1.0.5  
> **更新时间**: 2025-07-26T18:30:00Z  
> **开发状态**: ✅ **Stage 1 - 核心架构实现完成**  
> **新增功能**: 依赖注入容器、事件总线系统、性能监控框架、缓存策略框架、Schema验证系统、厂商中立适配器 🆕

## 🎯 项目概述

Multi-Agent Project Lifecycle Protocol (MPLP) 是一个标准化的多代理项目生命周期协议，提供了完整的Plan→Confirm→Trace→Delivery工作流程控制。

### 🚀 核心特性

#### **6个核心模块** (v1.0标准)
- **Context模块** - 全局状态管理 (<5ms性能)
- **Plan模块** - 任务规划结构 + **失败恢复机制** ✅
- **Confirm模块** - 验证决策机制 (<3ms性能)
- **Trace模块** - 追踪记录信息 (<2ms性能)
- **Role模块** - 角色定义能力 (<1ms性能)
- **Extension模块** - 扩展机制框架 (<50ms性能)

#### **核心架构组件** 🆕
- **依赖注入容器**: 模块间松耦合集成，支持循环依赖检测
- **事件总线系统**: 发布/订阅模式，过滤与异步处理
- **缓存策略框架**: 多级缓存支持，多种提供者
- **性能监控框架**: 指标收集、分析与报告
- **Schema验证系统**: 运行时验证与编译时类型检查
- **错误处理系统**: 统一的错误代码与处理机制

#### **厂商中立适配器架构** 🆕
- **统一适配器接口**: 所有模块使用标准接口，不依赖特定厂商实现
- **适配器工厂**: 简化适配器创建与管理
- **扩展点机制**: 支持功能扩展而不修改核心代码
- **向后兼容**: 提供旧接口的重定向支持

#### **Plan模块增强功能** 
- **失败恢复策略**: retry/rollback/skip/manual_intervention
- **批量恢复处理**: 支持批量失败任务处理
- **依赖管理**: 智能解锁依赖任务
- **性能监控**: <10ms失败恢复，<50ms批处理

#### **TracePilot双版本集成** 
- **基础版适配器**: `tracepilot-adapter.ts` - 标准同步功能
- **增强版适配器**: `enhanced-tracepilot-adapter.ts` - AI智能追踪
- **智能功能**: 问题检测、任务追踪、自动修复建议
- **向后兼容**: 完整兼容现有接口

### 📊 性能指标

- **API响应时间**: P95 < 100ms, P99 < 200ms
- **协议解析**: < 10ms
- **依赖注入**: 容器初始化<50ms，实例解析<1ms 🆕
- **事件处理**: 发布<2ms，处理<10ms，吞吐量>10000/秒 🆕
- **缓存性能**: 读取<1ms，命中率>85% 🆕
- **Plan模块**: 计划解析<8ms，失败恢复<10ms
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
│   ├── modules/           # 6个核心模块
│   │   ├── context/       # Context模块
│   │   ├── plan/          # Plan模块 + failure_resolver
│   │   ├── trace/         # Trace模块
│   │   └── ...
│   ├── core/              # 核心架构组件 🆕
│   │   ├── cache/         # 缓存策略框架
│   │   ├── error/         # 错误处理系统
│   │   ├── events/        # 事件总线系统
│   │   ├── performance/   # 性能监控框架
│   │   └── schema/        # Schema验证系统
│   ├── adapters/          # 厂商中立适配器 🆕
│   │   ├── trace/         # 追踪适配器
│   │   └── ...
│   ├── interfaces/        # 接口定义 🆕
│   │   ├── trace-adapter.interface.ts
│   │   └── ...
│   ├── mcp/
│   │   ├── tracepilot-adapter.ts         # 基础版适配器
│   │   └── enhanced-tracepilot-adapter.ts # 增强版适配器
│   └── ...
├── .cursor/
│   ├── rules/              # 14个治理规则文件
│   └── presets/           # AI助手约束配置
├── ProjectRules/          # 项目主规则配置
└── docs/                  # 完整文档体系
    ├── architecture/      # 架构设计文档 🆕
    ├── guides/           # 开发指南 🆕
    └── summary/          # 模块总结 🆕
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

### 厂商中立设计原则 🆕
所有模块开发必须遵循厂商中立原则：
1. **📦 使用接口而非具体实现** - 始终通过接口进行模块间通信
2. **🏭 利用适配器工厂模式** - 创建与获取适配器实例
3. **🔄 提供向后兼容性** - 对已有代码保持兼容
4. **⚙️ 使用依赖注入** - 避免硬编码依赖

### Schema驱动开发原则
所有开发必须严格遵循Schema驱动原则：

1. **📖 开发前必读Schema** - 先读取相关`src/schemas/*.json`文件
2. **🎯 100%字段匹配** - 所有字段名称、类型、枚举值必须完全匹配Schema
3. **🔄 严格开发顺序** - Schema → Types → Modules → Services → Tests
4. **🚫 禁止Schema偏离** - 严禁使用与Schema不符的字段名称或类型

### 文件命名规范
所有模块内文件必须遵循统一的命名格式：

```
{module-name}-{component-type}.ts
```

例如：`context-controller.ts`, `plan-manager.ts`, `failure-resolver.ts`

详细规范请参阅[文件命名规范指南](docs/guides/file-naming-convention.md)

### 文件重命名工具
项目提供自动重命名工具，帮助修正不符合命名规范的文件：

```bash
npm run rename-files
```

### Plan→Confirm→Trace→Delivery流程
每个开发任务必须严格遵循四阶段流程：

1. **📋 Plan** - 分析需求，**先读取Schema**，制定技术方案
2. **✅ Confirm** - 确认方案，验证Schema合规性和规则符合性
3. **📊 Trace** - 实施开发，记录进度指标
4. **🚀 Delivery** - 交付验证，更新文档版本

### 规则文件引用
- 必须优先引用 `.cursor/rules/schema-driven-development.mdc`
- 必须引用 `.cursor/rules/vendor-neutral-design.mdc` 🆕
- 必须引用相关 `.cursor/rules/*.mdc` 文件
- 必须遵循 `auto-sync-updates.mdc` 同步更新规则
- 必须验证性能标准和测试覆盖率

## 📚 文档体系

### 完整文档结构
- **[requirements-docs/](requirements-docs/)** - 原始需求文档
- **[docs/](docs/)** - 按功能分类的文档体系
  - `architecture/` - 架构设计文档
    - [依赖图实现](docs/architecture/dependency-graph-implementation.md) 🆕
    - [缓存策略](docs/architecture/cache-strategy.md) 🆕
    - [性能基准计划](docs/architecture/performance-benchmark-plan.md) 🆕
  - `guides/` - 开发指南文档
    - [文件命名规范指南](docs/guides/file-naming-convention.md)
    - [厂商中立设计指南](docs/guides/vendor-neutral-design.md) 🆕
    - [Schema驱动开发指南](docs/guides/schema-driven-development.md) 🆕
    - [适配器工厂迁移指南](docs/guides/adapter-factory-migration.md) 🆕
  - `summary/` - 模块功能总结 🆕
    - [API框架总结](docs/summary/api-framework-summary.md) 🆕
    - [错误处理总结](docs/summary/error-handling-summary.md) 🆕
    - [事件总线总结](docs/summary/event-bus-summary.md) 🆕
    - [Schema验证系统总结](docs/summary/schema-validation-system-summary.md) 🆕

### 关键文档
- [开发预设指令](.cursor/presets/mplp-development.md) (v2.2)
- [项目治理报告](docs/architecture/governance-report.md)
- [失败恢复机制](docs/failure-resolver.md) 🆕
- [厂商中立设计指南](docs/guides/vendor-neutral-design.md) 🆕
- [命名约定规则](.cursor/rules/naming-convention.mdc)

## 🎯 最新更新 (v1.0.5) 🆕

### 核心架构实现 🆕
- ✅ 实现依赖注入容器和依赖图分析工具
- ✅ 实现事件总线系统，支持过滤和异步处理
- ✅ 实现性能监控框架，支持指标收集和分析
- ✅ 实现缓存策略框架，支持多级缓存和不同提供者
- ✅ 实现Schema验证系统，确保Schema合规性
- ✅ 实现统一的错误处理系统和错误代码标准

### 厂商中立适配器架构 🆕
- ✅ 实现统一的适配器接口定义
- ✅ 创建适配器工厂和管理器
- ✅ 提供向后兼容的重定向支持
- ✅ 重构现有代码以使用厂商中立接口
- ✅ 完整测试覆盖（>90%）

### 数据库架构 🆕
- ✅ 实现所有6个核心模块的数据库表结构
- ✅ 创建迁移脚本确保数据库版本可控
- ✅ 优化表结构和索引提高查询性能
- ✅ 支持不同数据库引擎的兼容性

## 🤝 贡献指南

请参阅 [CONTRIBUTING.mdc](ProjectRules/CONTRIBUTING.mdc) 了解详细的贡献流程。

## 📄 许可证

本项目采用 [MIT License](ProjectRules/LICENSE)。

---

**维护团队**: Coregentis MPLP 项目团队  
**技术支持**: [GitHub Issues](../../issues)  
**文档更新**: 遵循auto-sync-updates.mdc自动同步机制 