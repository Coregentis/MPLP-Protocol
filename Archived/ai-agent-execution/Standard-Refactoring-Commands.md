# MPLP v1.0标准重构启动指令 v2.0 - 适配项目全部重写的统一重构话术

## 🎯 **核心原则**

**CRITICAL**: 所有10个MPLP模块都需要基于Schema从零开始完整实现以达到MPLP v1.0版本标准
**项目状态**: 项目已全部重写，所有源代码和测试文件已删除
**Schema位置**: src/schemas/core-modules/ 和 src/schemas/cross-cutting-concerns/
**测试位置**: tests/modules/[模块名]/
**重构性质**: 基于实际Schema文件从零开始完整实现，不是修改现有代码
**重构目标**: 统一成为MPLP v1.0版本标准，而非仅仅统一协议接口架构
**记忆管理**: 使用文件记录系统，不依赖Agent Memory
**质量保证**: 基于文件的持久化状态管理和质量验证

## 📋 **标准重构启动指令**

### **通用重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构[模块名]模块，重构性质：基于Schema从零开始完整实现（项目已全部重写），重构目标：统一成为MPLP v1.0版本标准，质量标准：[企业标准75%+/生产就绪90%+]，Schema位置：src/schemas/core-modules/mplp-[模块名].json，测试位置：tests/modules/[模块名]/，当前MPLP项目包含10个模块，需要达到统一的架构标准、代码质量标准和协议标准。
```

### **Context模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Context模块，重构性质：基于Schema从零开始完整实现（项目已全部重写），重构目标：统一成为MPLP v1.0版本标准，质量标准：生产就绪90%+，Schema位置：src/schemas/core-modules/mplp-context.json，测试位置：tests/modules/context/，Context模块之前已达到100%完美质量标准，本次重构目标是基于实际Schema重新实现并确保符合MPLP v1.0的统一架构标准、协议标准和代码质量标准。
```

### **Plan模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Plan模块，重构目标：统一成为MPLP v1.0版本标准，质量标准：生产就绪90%+，Plan模块当前已达到企业级标准，本次重构目标是确保符合MPLP v1.0的统一架构标准、协议标准和代码质量标准。
```

### **Confirm模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Confirm模块，重构目标：统一成为MPLP v1.0版本标准，质量标准：生产就绪90%+，Confirm模块当前已达到企业级标准，本次重构目标是确保符合MPLP v1.0的统一架构标准、协议标准和代码质量标准。
```

### **Trace模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Trace模块，重构目标：统一成为MPLP v1.0版本标准，质量标准：企业标准75%+，Trace模块当前已达到100%测试通过率（107/107），本次重构目标是确保符合MPLP v1.0的统一架构标准、协议标准和代码质量标准。
```

### **Role模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Role模块，重构目标：统一成为MPLP v1.0版本标准，质量标准：企业标准75%+，Role模块当前已达到企业RBAC标准（75.31%覆盖率），本次重构目标是确保符合MPLP v1.0的统一架构标准、协议标准和代码质量标准。
```

### **Extension模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Extension模块，重构目标：统一成为MPLP v1.0版本标准，质量标准：企业标准75%+，Extension模块当前已达到多智能体协议平台标准，本次重构目标是确保符合MPLP v1.0的统一架构标准、协议标准和代码质量标准。
```

### **Core模块重构启动指令（最高优先级）**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Core模块，重构性质：基于Schema从零开始完整实现（项目已全部重写），重构目标：统一成为MPLP v1.0版本标准，质量标准：企业标准75%+，Schema位置：src/schemas/core-modules/mplp-core.json，测试位置：tests/modules/core/，Core模块是工作流编排中心和CoreOrchestrator基础设施，本次重构目标是基于实际Schema重新实现并建立完整的MPLP v1.0架构标准、协议标准和代码质量标准。
```

### **Collab模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Collab模块，重构目标：统一成为MPLP v1.0版本标准，质量标准：企业标准75%+，Collab模块是协作管理中心，本次重构目标是建立完整的MPLP v1.0架构标准、协议标准和代码质量标准。
```

### **Dialog模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Dialog模块，重构目标：统一成为MPLP v1.0版本标准，质量标准：企业标准75%+，Dialog模块是对话交互中心，本次重构目标是建立完整的MPLP v1.0架构标准、协议标准和代码质量标准。
```

### **Network模块重构启动指令**
```markdown
请使用 AI-Agent-Quick-Start-Commands.md 来重构Network模块，重构目标：统一成为MPLP v1.0版本标准，质量标准：企业标准75%+，Network模块是网络通信中心，本次重构目标是建立完整的MPLP v1.0架构标准、协议标准和代码质量标准。
```

## 🔧 **MPLP v1.0版本标准说明**

### **统一架构标准**
```markdown
✅ DDD分层架构：api/application/domain/infrastructure
✅ 横切关注点集成：9个L3管理器统一注入
✅ 预留接口模式：Interface-First设计，下划线前缀参数
✅ 协议接口实现：IMLPPProtocol接口标准实现
✅ 依赖注入配置：统一的协议工厂和配置管理
```

### **统一协议标准**
```markdown
✅ Schema规范：JSON Schema draft-07标准
✅ 双重命名约定：Schema层snake_case，TypeScript层camelCase
✅ 映射函数：完整的toSchema/fromSchema/validateSchema实现
✅ 协议元数据：标准化的协议信息和健康检查
✅ 错误处理：统一的错误处理机制和日志记录
```

### **统一代码质量标准**
```markdown
✅ 零技术债务：绝对禁止any类型，TypeScript 0错误，ESLint 0警告
✅ 测试覆盖率：企业标准≥75%，生产就绪≥90%
✅ 测试通过率：100%测试通过，零不稳定测试
✅ 性能标准：API响应<100ms，协议解析<10ms
✅ 安全合规：完整的安全验证和审计追踪
```

## 📊 **模块状态和重构需求**

### **项目重写状态说明**
```markdown
🚨 CRITICAL: 项目已全部重写，所有源代码和测试文件已删除
📁 Schema位置: src/schemas/core-modules/ (10个模块Schema文件)
📁 测试位置: tests/modules/ (需要重新创建)
🔄 重构性质: 基于Schema从零开始完整实现，不是修改现有代码
```

### **已完成模块（6个）- 需要基于Schema重新实现**
```markdown
✅ Context模块：之前达到100%完美质量标准 → 需要基于mplp-context.json重新实现
✅ Plan模块：企业级标准 → 需要MPLP v1.0标准统一
✅ Confirm模块：企业级标准 → 需要MPLP v1.0标准统一
✅ Trace模块：100%测试通过率 → 需要MPLP v1.0标准统一
✅ Role模块：企业RBAC标准 → 需要MPLP v1.0标准统一
✅ Extension模块：多智能体协议平台标准 → 需要MPLP v1.0标准统一
```

### **待完成模块（4个）**
```markdown
🔄 Core模块：工作流编排中心 → 需要建立MPLP v1.0标准
🔄 Collab模块：协作管理中心 → 需要建立MPLP v1.0标准
🔄 Dialog模块：对话交互中心 → 需要建立MPLP v1.0标准
🔄 Network模块：网络通信中心 → 需要建立MPLP v1.0标准
```

## 🧠 **文件记录系统集成**

### **每次重构必须包含**
```markdown
📁 会话记录：创建详细的重构执行记录
📁 模块日志：更新模块特定的重构日志
📁 决策记录：记录重要的架构和技术决策
📁 进度跟踪：更新整体项目进度状态
📁 知识库：记录经验教训和最佳实践
```

### **AI Agent承诺**
```markdown
🤖 我承诺在每次重构中：
1. 使用文件记录系统，不依赖Agent Memory
2. 实时更新会话记录和模块日志
3. 记录所有重要决策和解决方案
4. 确保记录信息准确、完整、可审查
5. 支持用户监督和记录修正
```

## 🎯 **重构成功标准**

### **技术标准**
```markdown
✅ 架构合规：100%符合MPLP v1.0架构标准
✅ 协议合规：100%符合MPLP v1.0协议标准
✅ 质量合规：100%符合目标质量标准
✅ 测试通过：100%测试通过率
✅ 零技术债务：TypeScript 0错误，ESLint 0警告
```

### **流程标准**
```markdown
✅ 文件记录：完整的重构执行记录
✅ 用户确认：所有关键阶段用户确认
✅ 工具验证：所有自动化检查通过
✅ 文档更新：相关文档同步更新
✅ 知识沉淀：经验教训记录完整
```

---

**版本**: 1.0.0
**生效日期**: 2025-08-24
**适用范围**: 所有10个MPLP模块重构
**核心改进**: 基于文件记录系统的统一重构标准
**重构目标**: MPLP v1.0版本标准统一化
