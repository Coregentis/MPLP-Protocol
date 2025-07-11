# MPLP v1.0 文档中心

> **文档版本**: v2.1.0  
> **更新时间**: 2025-07-11T23:59:23Z  
> **项目状态**: ✅ **Phase 3 - Plan模块开发完成**  
> **新增功能**: Plan模块failure_resolver机制，标准适配器接口 🆕
> **重要原则**: ✅ **厂商中立** - MPLP是完全开放的标准协议 🆕

## 📚 文档导航体系

Multi-Agent Project Lifecycle Protocol (MPLP) 提供完整的文档体系，按功能模块分类组织，便于快速查找和深入学习。

### 🔍 MPLP核心原则 🆕

#### **厂商中立原则（最高优先级）**
```
MPLP协议是一个完全厂商中立的开放标准，不依赖于任何特定厂商或平台。
所有核心功能必须独立于任何特定第三方工具或服务实现。
TracePilot和Coregentis仅作为集成示例，展示如何与MPLP协议集成。
任何厂商特定的适配器或集成必须通过Extension模块实现，不得侵入核心代码。
```

### 🚀 核心功能文档

#### **📊 Plan模块增强功能** 🆕
- **失败恢复机制**: [Plan模块实现](../src/modules/plan/)
- **恢复策略文档**: retry/rollback/skip/manual_intervention
- **性能监控**: <10ms失败恢复，<50ms批处理
- **测试覆盖**: >90%单元测试覆盖率

#### **🛠️ 标准适配器接口** 🆕
- **标准接口**: [standard-adapter-interface.ts](../src/mcp/standard-adapter-interface.ts)
- **参考实现**: [集成示例](../src/mcp/)
- **厂商中立**: 支持任何第三方工具和平台集成
- **性能标准**: <100ms同步延迟，>1000 TPS批处理

## 📁 文档分类结构

### 🏗️ [架构设计文档](architecture/)
- [governance-report.md](architecture/governance-report.md) - 项目治理架构报告
- [project-initialization.md](architecture/project-initialization.md) - 项目初始化架构
- [schema-integration.md](architecture/schema-integration.md) - Schema集成架构

### 🛠️ [集成参考示例](integration/) 
- [standard-adapter.md](integration/standard-adapter.md) - 标准适配器接口文档 🆕
- [tracepilot-example.md](integration/tracepilot-example.md) - TracePilot集成示例
- [coregentis-example.md](integration/coregentis-example.md) - Coregentis集成示例
- [third-party-integration.md](integration/third-party-integration.md) - 第三方集成指南 🆕

### 🔗 [协议集成文档](protocol/)
- [integration-guide.md](protocol/integration-guide.md) - 通用集成指南 🆕
- [adapter-pattern.md](protocol/adapter-pattern.md) - 适配器模式实现 🆕
- [reference-implementations.md](protocol/reference-implementations.md) - 参考实现示例 🆕

### 📖 [用户操作指南](user-guides/)
- [development-checklist.md](user-guides/development-checklist.md) - 开发检查清单
- [git-workflow.md](user-guides/git-workflow.md) - Git工作流程
- [project-status.md](user-guides/project-status.md) - 项目当前状态

### 📡 [API接口文档](api/)
- API参考文档和使用示例

## 🎯 推荐阅读路径

### **新用户快速上手**
1. 📊 [项目状态](user-guides/project-status.md) - 了解当前项目状态
2. 🔍 [厂商中立原则](../ProjectRules/MPLP_ProjectRules.mdc) - 了解MPLP核心原则 🆕
3. ✅ [开发检查清单](user-guides/development-checklist.md) - 遵循开发流程
4. 🔗 [Git工作流](user-guides/git-workflow.md) - 掌握协作流程

### **开发者深入学习**
1. 🏗️ [治理架构](architecture/governance-report.md) - 了解整体架构
2. 📊 [Schema集成](architecture/schema-integration.md) - 掌握数据架构
3. 🔗 [集成指南](protocol/integration-guide.md) - 学习集成标准 🆕
4. 📡 [API参考](api/) - 掌握接口调用

### **最新功能学习** 🆕
1. 📋 [Plan模块失败恢复](../src/modules/plan/plan-manager.ts) - 新增核心功能
2. 🧪 [Plan模块测试](../tests/modules/plan/) - 完整测试覆盖
3. 🛠️ [标准适配器接口](../src/mcp/standard-adapter-interface.ts) - 厂商中立设计
4. ⚙️ [自动同步规则](../.cursor/rules/auto-sync-updates.mdc) - 治理优化

## 📋 文档维护规范

### 自动同步更新机制 🆕
根据 [auto-sync-updates.mdc](../.cursor/rules/auto-sync-updates.mdc) 规则：

- **统一时间戳**: 2025-07-11T10:15:00+08:00
- **版本联动**: 功能变更触发文档版本递增
- **完整性检查**: 所有交叉引用保持一致
- **批量更新**: 相关文档同步更新

### 文档标准
- **版本标识**: 每个文档包含版本号和更新时间
- **交叉引用**: 使用相对路径链接相关文档
- **功能标记**: 使用🆕标记新增功能
- **重要性分级**: ⭐⭐⭐ 核心，⭐⭐ 重要，⭐ 辅助

## 🔗 外部资源

### 项目规则与配置
- [项目主规则](../ProjectRules/MPLP_ProjectRules.mdc) - v2.5 最新版本
- [开发预设指令](../.cursor/presets/mplp-development.md) - v2.3 AI助手约束
- [原始需求文档](../requirements-docs/) - 完整需求规范

### 源代码文档
- [核心模块实现](../src/modules/) - 6个核心模块代码
- [集成参考实现](../src/mcp/) - 标准适配器接口和示例
- [测试用例](../tests/) - 完整测试覆盖

---

**维护团队**: MPLP项目团队  
**更新机制**: 遵循auto-sync-updates.mdc自动同步  
**技术支持**: [GitHub Issues](../../issues) | support@mplp.dev 