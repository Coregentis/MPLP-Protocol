# AI Agent Quick Start Commands v4.0 - 适配MPLP v1.0重写项目的完整执行流程

## 🚨 **MPLP v1.0重写项目状态说明 (CRITICAL UPDATE)**

**CRITICAL**: MPLP v1.0重写项目 - 8/10模块已完成（Context, Plan, Role, Confirm, Trace, Extension, Dialog, Collab），2/10模块待重写
**当前状态**:
- **已完成模块**: Context, Plan, Role, Confirm, Trace, Extension, Dialog, Collab - 达到企业级标准（100%测试通过率，零技术债务，完整文档）
- **待重写模块**: Core, Network
- Schema文件位于: `src/schemas/mplp-*.json` (JSON Schema Draft-07)
- 测试文件位于: `tests/modules/[模块名]/` 目录
- **测试统一标准**: 已建立统一测试标准模板 (`tests/templates/unified-test-standard.md`)
- 源代码: 需要基于Schema从零开始完整重写
**重写性质**: 基于8个已完成模块的企业级标准，统一重写剩余模块
**最新成就**: Dialog模块100%测试通过率达成，验证了完整执行流程的有效性
**测试要求**: 所有新模块必须遵循统一测试标准，确保测试架构一致性

## 🧠 **记忆外部化系统集成说明**

**CRITICAL**: 本版本集成了AI Agent记忆外部化系统，解决长上下文记忆局限问题
**核心原理**: 工具承担记忆责任，AI Agent执行标准化操作
**保障机制**: 自动化约束检查 + 智能提醒 + 实时验证 + 人工监督

### **执行前必须准备的工具**
```bash
# 1. 约束检查工具（立即可用）
npm run ai-agent:constraint-check

# 2. 智能助手工具（上下文感知）
npm run ai-agent:smart-assistant

# 3. 项目结构验证工具（适配新结构）
# 验证Schema文件存在
ls -la src/schemas/mplp-*.json

# 验证测试目录结构
ls -la tests/

# 4. 质量检查工具（适配新项目结构）
npm run typecheck && npm run lint

# 5. 企业级完整性验证工具（新增）
npm run ai-agent:completeness-check [模块名]

# 6. 统一测试标准验证工具（新增）
npm run ai-agent:test-standard-check [模块名]

# 7. 测试模板生成工具（新增）
npm run ai-agent:generate-test-template [模块名]

# 8. 统一测试标准执行工具（新增）
npm run ai-agent:unified-test-execution [模块名]

# 9. 测试覆盖率验证工具（新增）
npm run ai-agent:test-coverage-check [模块名]
```

## 🚀 **用户启动指令模板（增强版）**

### **标准模块重构启动指令（适配项目全部重写）**
```markdown
请执行MPLP模块重构任务：

**目标模块**: [模块名称，如：core/collab/dialog/network] (仅剩余4个待重写模块)
**重构性质**: 基于Schema从零开始完整实现（项目已全部重写）
**重构目标**: 统一成为MPLP v1.0版本标准
**质量标准**: [企业级重写标准95%+ - 基于Context和Plan模块]
**Schema位置**: src/schemas/mplp-[模块名].json
**测试位置**: tests/modules/[模块名]/
**统一测试标准**: tests/templates/unified-test-standard.md
**测试执行指南**: docs/ai-agent-execution/MPLP-Unified-Test-Standard-Execution-Guide.md

⚠️ **CRITICAL**: 必须完成所有企业级组件，参考Context模块标准：
- ✅ Domain Entities (src/modules/[模块]/domain/entities/)
- ✅ Domain Services (src/modules/[模块]/domain/services/)
- ✅ API Controllers (src/modules/[模块]/api/controllers/)
- ✅ API DTOs (src/modules/[模块]/api/dto/)
- ✅ module.ts (src/modules/[模块]/module.ts)
- ✅ 8文件文档套件 (docs/modules/[模块]/)
- ✅ 完整测试覆盖 (tests/modules/[模块]/)

**🧠 文件记录系统启动** (CRITICAL - 基于文件的持久化记忆管理):
1. 验证项目重写状态：
   ```bash
   # 确认Schema文件存在
   ls -la src/schemas/core-modules/mplp-[模块名].json
   ls -la src/schemas/cross-cutting-concerns/

   # 确认测试目录结构
   ls -la tests/
   ```
2. 创建会话记录文件：
   ```bash
   # 创建当前会话记录
   touch docs/ai-agent-execution/memory-records/session-records/current-session.md
   ```
3. 立即运行约束检查工具：
   ```bash
   npm run ai-agent:pre-check
   ```
4. 设置智能助手上下文：
   ```bash
   npm run ai-agent:remind create-module [模块名]
   ```
5. 承诺执行标准：我将基于实际Schema文件从零开始实现模块，使用文件记录系统管理状态，不依赖Agent Memory，确保所有关键信息持久化记录

**🚨 Schema驱动开发强制前置要求** (必须先完成，基于开发失败经验教训):
1. **项目重写状态确认**: 理解项目已全部重写，需要基于Schema从零开始实现
2. **Schema文件强制验证**:
   ```bash
   # 必须确认目标模块Schema文件存在
   ls -la src/schemas/core-modules/mplp-[模块名].json
   # 必须确认横切关注点Schema存在
   ls -la src/schemas/cross-cutting-concerns/
   ```
3. **Schema驱动开发核心文档强制阅读** (.augment/rules/ - 按优先级顺序):
   - 🔥 **MPLP-Development-Workflow.mdc** (Schema驱动开发工作流 - 最高优先级)
   - 🔥 **MPLP-Development-Framework.mdc** (智能约束引用和Schema驱动 - 最高优先级)
   - 🔥 **MPLP-Dual-Naming-Convention.mdc** (双重命名约定 - 强制执行)
   - 🔥 **MPLP-Module-Standardization.mdc** (模块标准化要求 - 强制执行)
   - 🔥 **MPLP-Project-Directory-Structure.mdc** (项目目录结构 - 强制遵循)
   - MPLP-Core-Development-Rules.mdc (项目现状和核心原则)
   - MPLP-Architecture-Core-Principles.mdc (架构设计原则)
   - MPLP-Critical-Thinking-Methodology.mdc (SCTM+GLFB+ITCM方法论)
   - MPLP-TypeScript-Standards.mdc (TypeScript严格标准)
   - MPLP-Testing-Strategy.mdc (测试策略和质量门禁)
4. **文档引用体系理解**: 阅读 `docs/ai-agent-execution/MPLP-Document-Reference-Mapping.md`

**🔄 每个阶段的文件记录流程** (强制执行):
阶段开始前：
1. 更新会话记录文件当前阶段状态
2. 运行约束提醒：`npm run ai-agent:remind <operation> <module>`
3. 重新确认核心约束和目标
4. 请求用户确认理解正确性

阶段执行中：
1. 实时更新会话记录文件的执行进度
2. 每个文件修改后运行：`npm run ai-agent:live-check`
3. 发现问题立即记录到文件并报告
4. 严格遵循工具提醒的约束条件

阶段完成后：
1. 运行完整检查：`npm run ai-agent:full-check`
2. 生成合规性报告
3. 将关键决策记录到决策记录文件
4. 更新模块重构日志
5. 请求用户验证和确认

**🔥 Schema驱动开发执行要求** (基于开发失败经验，强制执行):
1. **Schema优先实现**:
   - 必须先读取src/schemas/core-modules/mplp-[模块名].json实际文件
   - 必须先读取src/schemas/cross-cutting-concerns/所有横切关注点Schema
   - 绝对禁止假设字段名称、类型或结构
2. **双重命名约定强制执行**:
   - Schema层: 100%使用snake_case (context_id, created_at, protocol_version)
   - TypeScript层: 100%使用camelCase (contextId, createdAt, protocolVersion)
   - 映射函数: 必须实现toSchema(), fromSchema(), validateSchema()
   - 映射一致性: 必须达到100%一致性验证
3. **统一测试标准强制执行** (基于6个模块测试统一经验):
   - 必须先读取tests/templates/unified-test-standard.md了解统一测试标准
   - 必须创建完整的测试目录结构: unit/functional/integration/e2e/performance/factories
   - 必须实现标准化测试工厂: {module}-test.factory.ts
   - 必须遵循测试命名约定: describe('{Module}模块测试'), it('应该{预期行为}')
   - 测试覆盖率要求: 单元测试≥90%, 功能测试≥85%, 集成测试≥80%
4. **开发顺序强制遵循**:
   - 步骤1: 读取并理解实际Schema文件
   - 步骤2: 读取并理解统一测试标准模板
   - 步骤3: 生成完整字段映射表
   - 步骤4: 创建统一测试目录结构和测试工厂
   - 步骤5: 实现完整Mapper类
   - 步骤6: 基于Mapper实现业务逻辑
   - 步骤7: 实现完整测试套件(单元/功能/集成/e2e/性能)
   - 绝对禁止跳过任何步骤或颠倒顺序
4. **质量门禁强制执行**: 每个步骤完成后立即运行验证，失败立即停止
5. **7阶段渐进执行**: 严格按照 `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md` 执行
6. **SCTM+GLFB+ITCM方法论**: 遵循系统性批判性思维和零技术债务政策
7. **MPLP v1.0统一标准**: 确保与其他模块保持架构一致性和质量标准一致性

**🚨 AI Agent Schema驱动开发承诺** (基于开发失败经验教训):
我承诺严格遵循Schema驱动开发原则：
1. **Schema优先**: 必须先读取并完全理解实际Schema文件，绝不假设字段名称和结构
2. **双重命名严格执行**: Schema层严格使用snake_case，TypeScript层严格使用camelCase，100%映射一致性
3. **开发顺序强制遵循**: Schema读取→字段映射表→Mapper实现→业务逻辑，绝不跳过任何步骤
4. **质量门禁强制执行**: 每个步骤完成后立即运行验证，发现问题立即停止并报告
5. **文件记录系统**: 严格使用文件记录系统管理状态，不依赖Agent Memory
6. **实时验证**: 在每个关键点运行检查工具，主动报告任何不确定性
7. **监督接受**: 接受所有用户监督和纠正，持续改进执行方法

**CRITICAL**: 我承诺如果违反Schema驱动开发原则，立即停止开发并请求用户指导。

**🔥 Schema驱动开发理解强制验证** (基于开发失败经验，必须100%正确回答):
在开始任何开发前，必须回答以下Schema驱动开发核心问题：

**Schema驱动开发理解验证**:
1. **Schema优先原则**: 为什么必须先读取实际Schema文件再开始任何开发？
2. **双重命名约定**: Schema层使用什么命名？TypeScript层使用什么命名？
3. **字段映射要求**: 必须实现哪些映射函数？映射一致性要求是什么？
4. **开发顺序**: Schema驱动开发的正确顺序是什么？(Schema读取→字段映射→Mapper实现→业务逻辑)
5. **质量门禁**: 每个开发步骤后必须运行哪些验证？

**模块标准化理解验证**:
6. **目录结构**: MPLP模块的强制目录结构是什么？哪些是MANDATORY？
7. **DDD分层**: api/application/domain/infrastructure各层的职责是什么？
8. **横切关注点**: 必须集成哪9个横切关注点？如何集成？
9. **预留接口**: 预留接口模式的核心原理是什么？参数命名规则是什么？
10. **协议接口**: IMLPPProtocol接口必须实现哪些方法？

**统一测试标准理解验证** (基于6个模块测试统一经验):
11. **测试目录结构**: 统一测试标准要求的强制目录结构是什么？
12. **测试文件标准**: 核心测试文件(7个)和支持文件(2个)分别是什么？
13. **测试工厂模式**: 测试数据工厂必须实现哪些方法？命名约定是什么？
14. **测试覆盖率要求**: 单元测试、功能测试、集成测试的覆盖率要求分别是多少？
15. **测试质量标准**: 测试通过率要求是什么？代码质量要求是什么？

⚠️ **CRITICAL**: 所有问题必须基于实际文档内容正确回答，AI Agent确认理解后才能进入阶段2。

**开始执行阶段1**: 完成上述Schema驱动开发强制前置要求和理解验证后，基于项目全部重写的现状进入阶段2。
```

### **具体模块启动示例**

#### **Trace模块重写启动（基于Context和Plan模块的企业级架构模式）**
```markdown
请执行MPLP模块重写任务：

**目标模块**: trace
**质量标准**: 企业级重写标准95%+（需要重写以达到Context和Plan模块的统一标准）

**模块特色**: 全链监控中心，分布式追踪，性能分析，执行监控
**参考模式**: 与Context和Plan模块使用IDENTICAL架构模式
- Context模块：企业级DDD架构和横切关注点集成（95%+覆盖率，499/499测试通过）
- Plan模块：企业级预留接口模式（8个MPLP接口，95.2%覆盖率，170/170测试通过）
- Confirm模块：统一协议接口实现

**CRITICAL**: 确保与其他6个已完成模块使用IDENTICAL的架构模式和实现方式

**🔥 Schema驱动开发强制前置要求** (基于开发失败经验，必须先完成):
1. **Schema文件强制验证**:
   ```bash
   ls -la src/schemas/core-modules/mplp-trace.json
   ls -la src/schemas/cross-cutting-concerns/
   ```
2. **Schema驱动开发核心文档强制阅读** (.augment/rules/ - 按优先级):
   - 🔥 MPLP-Development-Workflow.mdc (Schema驱动开发工作流)
   - 🔥 MPLP-Development-Framework.mdc (智能约束引用和Schema驱动)
   - 🔥 MPLP-Dual-Naming-Convention.mdc (双重命名约定)
   - 🔥 MPLP-Module-Standardization.mdc (模块标准化要求)
   - 🔥 MPLP-Project-Directory-Structure.mdc (项目目录结构)
   - 其他核心规则文档 (.augment/rules/MPLP-*.mdc)
3. **文档引用体系**: 阅读 `docs/ai-agent-execution/MPLP-Document-Reference-Mapping.md`
4. **已完成模块架构经验**: 理解Context和Plan模块的企业级统一架构模式

**🔥 Schema驱动开发执行要求** (基于开发失败经验):
1. **Schema优先开发**: 必须先读取mplp-trace.json实际文件，理解所有字段结构
2. **双重命名约定**: Schema(snake_case) ↔ TypeScript(camelCase)，100%映射一致性
3. **开发顺序**: Schema读取→字段映射→Mapper实现→业务逻辑，严禁跳过
4. **7阶段执行**: 严格按照 `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md`
5. **质量门禁**: 每个步骤后立即验证，遵循SCTM+GLFB+ITCM方法论
6. **架构一致性**: 实现8-10个预留接口，集成9个横切关注点，与Context和Plan模块完全一致

**开始执行阶段1**: 完成上述Schema驱动开发强制前置要求后，回答Schema驱动开发理解验证问题。
```

#### **Role模块重写启动**
```markdown
请执行MPLP模块重写任务：

**目标模块**: role
**质量标准**: 企业级重写标准95%+（需要重写以达到Context和Plan模块的统一标准）

**模块特色**: 企业RBAC安全中心，角色管理，权限控制，安全审计
**参考模式**: 与Context和Plan模块使用IDENTICAL架构模式

**🔥 Schema驱动开发执行要求** (基于开发失败经验):
1. **Schema优先开发**: 必须先读取mplp-role.json实际文件，理解所有字段结构
2. **双重命名约定**: Schema(snake_case) ↔ TypeScript(camelCase)，100%映射一致性
3. **开发顺序**: Schema读取→字段映射→Mapper实现→业务逻辑，严禁跳过
4. **7阶段执行**: 严格按照 `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md`
5. **质量门禁**: 每个步骤后立即验证，遵循SCTM+GLFB+ITCM方法论
6. **架构一致性**: 实现8-10个预留接口，集成9个横切关注点，与Context和Plan模块完全一致

**开始执行阶段1**: 完成Schema驱动开发强制前置要求后，回答Schema驱动开发理解验证问题。
```

#### **Extension模块重写启动**
```markdown
请执行MPLP模块重写任务：

**目标模块**: extension
**质量标准**: 企业级重写标准95%+（需要重写以达到Context和Plan模块的统一标准）

**模块特色**: 扩展管理中心，插件生命周期，扩展协调，AI驱动推荐
**参考模式**: Plan模块（8个MPLP接口）+ Context模块（完整协议实现）

**执行要求**:
1. 严格按照 `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md` 执行
2. 必须完成所有7个阶段，每个阶段完成后向我汇报
3. 遵循SCTM+GLFB+ITCM方法论和零技术债务政策
4. 实现8-10个预留接口，集成9个横切关注点，与Context和Plan模块完全一致

**开始执行阶段1**: 请先阅读强制文档清单，然后回答架构理解验证问题。
```

#### **Core模块重写启动（最高优先级）**
```markdown
请执行MPLP模块重写任务：

**目标模块**: core
**质量标准**: 企业级重写标准95%+（需要重写以达到Context和Plan模块的统一标准）

**模块特色**: 工作流编排中心，CoreOrchestrator基础设施，中央协调机制
**参考模式**: 与Context和Plan模块使用IDENTICAL架构模式
**CRITICAL**: 必须与Context和Plan模块使用完全相同的DDD架构和L3管理器集成方式

**执行要求**:
1. 严格按照 `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md` 执行
2. 必须完成所有7个阶段，每个阶段完成后向我汇报
3. 遵循SCTM+GLFB+ITCM方法论和零技术债务政策
4. 实现8-10个预留接口，集成所有9个横切关注点，与Context和Plan模块完全一致
5. 确保与Context和Plan模块的架构完全一致

**开始执行阶段1**: 请先阅读强制文档清单，然后回答架构理解验证问题。
```

#### **Collab模块重写启动**
```markdown
请执行MPLP模块重写任务：

**目标模块**: collab
**质量标准**: 企业级重写标准95%+（需要重写以达到Context和Plan模块的统一标准）

**模块特色**: 协作管理中心，多人协作，实时同步，协作权限管理
**参考模式**: 与Context和Plan模块使用IDENTICAL架构模式
**CRITICAL**: 必须与Context和Plan模块使用完全相同的DDD架构和L3管理器集成方式

**执行要求**:
1. 严格按照 `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md` 执行
2. 必须完成所有7个阶段，每个阶段完成后向我汇报
3. 遵循SCTM+GLFB+ITCM方法论和零技术债务政策
4. 实现8-10个预留接口，集成所有9个横切关注点，与Context和Plan模块完全一致
5. 确保与Context和Plan模块的架构完全一致

**开始执行阶段1**: 请先阅读强制文档清单，然后回答架构理解验证问题。
```

#### **Dialog模块重写启动**
```markdown
请执行MPLP模块重写任务：

**目标模块**: dialog
**质量标准**: 企业级重写标准95%+（需要重写以达到Context和Plan模块的统一标准）

**模块特色**: 对话交互中心，智能对话，多模态交互，上下文感知
**参考模式**: 与Context和Plan模块使用IDENTICAL架构模式
**CRITICAL**: 必须与Context和Plan模块使用完全相同的DDD架构和L3管理器集成方式

**执行要求**:
1. 严格按照 `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md` 执行
2. 必须完成所有7个阶段，每个阶段完成后向我汇报
3. 遵循SCTM+GLFB+ITCM方法论和零技术债务政策
4. 实现8-10个预留接口，集成所有9个横切关注点，与Context和Plan模块完全一致
5. 确保与Context和Plan模块的架构完全一致

**开始执行阶段1**: 请先阅读强制文档清单，然后回答架构理解验证问题。
```

#### **Network模块重写启动**
```markdown
请执行MPLP模块重写任务：

**目标模块**: network
**质量标准**: 企业级重写标准95%+（需要重写以达到Context和Plan模块的统一标准）

**模块特色**: 网络通信中心，分布式架构，网络协调，节点发现和管理
**参考模式**: 与Context和Plan模块使用IDENTICAL架构模式
**CRITICAL**: 必须与Context和Plan模块使用完全相同的DDD架构和L3管理器集成方式

**执行要求**:
1. 严格按照 `docs/ai-agent-execution/MPLP-AI-Agent-Module-Refactoring-Master-Guide.md` 执行
2. 必须完成所有7个阶段，每个阶段完成后向我汇报
3. 遵循SCTM+GLFB+ITCM方法论和零技术债务政策
4. 实现8-10个预留接口，集成所有9个横切关注点，与Context和Plan模块完全一致
5. 确保与Context和Plan模块的架构完全一致

**开始执行阶段1**: 请先阅读强制文档清单，然后回答架构理解验证问题。
```

## 🔧 **阶段性验证指令（集成记忆外部化系统）**

### **阶段1完成验证指令（适配项目全部重写）**
```markdown
很好，请继续执行阶段2：完整模块结构创建和Schema集成

**🧠 记忆外部化检查点**:
1. 运行阶段转换检查：
   ```bash
   npm run ai-agent:constraint-check phase-transition schema-integration
   ```
2. 设置新阶段上下文：
   ```bash
   npm run ai-agent:remind implement-mapper [模块名]
   ```
3. **Schema驱动开发核心约束重新确认**：
   - Schema优先原则：必须先读取实际Schema文件
   - 双重命名约定：Schema(snake_case) ↔ TypeScript(camelCase)
   - 开发顺序：Schema读取→字段映射→Mapper实现→业务逻辑
   - 映射一致性：必须达到100%字段映射一致性
   - 质量门禁：每步完成后立即验证，失败立即停止

**🔥 Schema驱动开发执行要求** (基于开发失败经验，强制执行顺序):
1. **Schema文件强制读取和理解**:
   - 必须先读取src/schemas/core-modules/mplp-[模块名].json实际文件
   - 必须完全理解所有字段名称、类型、必需性、描述
   - 绝对禁止假设任何字段信息
2. **字段映射表强制生成**:
   - 基于实际Schema生成完整映射表到 `docs/modules/[模块]-field-mapping.md`
   - 必须包含所有字段的snake_case ↔ camelCase映射关系
   - 必须验证映射表100%准确性
3. **Mapper类强制实现**:
   - 基于实际Schema字段实现完整Mapper类
   - 必须包含所有9个横切关注点映射方法
   - 必须实现toSchema(), fromSchema(), validateSchema()方法
   - 必须确保100%类型安全和映射一致性
4. **目录结构创建**: 基于MPLP-Module-Standardization.mdc在src/modules/[模块名]/下创建完整DDD架构
5. **测试结构创建**: 在tests/modules/[模块名]/下创建完整测试结构
6. **实时验证**: 每个文件创建后立即运行：`npm run ai-agent:live-check`
7. **质量门禁**: 运行：`npm run typecheck && npm run lint && npm run validate:mapping`
8. **100%合规验证**: 确保Schema映射、字段命名、类型安全100%合规

**🔄 阶段完成检查**:
1. 运行完整验证：`npm run ai-agent:full-check`
2. 生成合规报告并向我汇报
3. 记录关键决策：使用remember工具记录Schema集成的关键决策和问题解决方案

完成后向我汇报结果和质量验证状态。
```

### **阶段2完成验证指令（适配项目全部重写）**
```markdown
很好，请继续执行阶段3：核心业务逻辑实现和横切关注点集成

**🧠 记忆外部化检查点**:
1. 运行阶段转换检查：
   ```bash
   npm run ai-agent:constraint-check phase-transition cross-cutting-integration
   ```
2. 设置新阶段上下文：
   ```bash
   npm run ai-agent:remind implement-protocol [模块名]
   ```
3. 重新确认核心约束：请重述9个L3管理器注入和横切关注点集成的要求

**执行要求** (基于项目全部重写):
1. **实现完整DDD架构**: 创建domain/entities、application/services、infrastructure/repositories等完整实现
2. **实现协议类**: 基于IMLPPProtocol接口从零开始实现协议类，注入所有9个L3管理器
3. **集成横切关注点**: 在业务逻辑中集成横切关注点调用模式（参考已完成模块的集成方式）
4. **实现API控制器**: 创建完整的REST API控制器和DTO类
5. 每个文件实现后运行：`npm run ai-agent:live-check`
6. 实现安全验证、性能监控、事件发布、错误处理等完整集成
7. 运行集成测试：`npm run test:cross-cutting-integration:[模块]`
8. **CRITICAL**: 确保与Context/Plan/Confirm/Trace/Role/Extension模块的横切关注点集成完全一致

**🔄 阶段完成检查**:
1. 运行架构完整性检查：`bash quality/scripts/shared/architecture-integrity-check.sh`
2. 运行完整验证：`npm run ai-agent:full-check`
3. 记录关键决策：使用remember工具记录横切关注点集成的关键决策和架构选择

完成后向我汇报结果和集成验证状态，以及与其他6个模块的一致性确认。
```

### **阶段3完成验证指令（集成记忆外部化系统）**
```markdown
很好，请继续执行阶段4：预留接口实现

**🧠 记忆外部化检查点**:
1. 运行阶段转换检查：
   ```bash
   node scripts/ai-agent-constraint-checklist.js phase-transition reserved-interfaces
   ```
2. 设置新阶段上下文：
   ```bash
   node scripts/ai-agent-smart-assistant.js remind implement-interfaces [模块名]
   ```
3. 重新确认核心约束：请重述预留接口模式和Interface-First设计原则

**执行要求**:
1. 根据模块类型实现相应数量的预留接口（4-10个，与其他6个模块相同的接口数量标准）
2. 所有参数使用下划线前缀，添加TODO注释（与其他6个模块相同的命名约定和注释格式）
3. 每个接口实现后运行：`node scripts/ai-agent-constraint-checklist.js interface-check`
4. 集成横切关注点到预留接口中（与其他6个模块相同的集成方式）
5. 提供临时实现返回成功状态（与其他6个模块相同的临时实现模式）
6. 运行接口测试：`npm run test:reserved-interfaces:[模块]`
7. **CRITICAL**: 确保预留接口与其他6个已完成模块的接口模式完全一致

**🔄 阶段完成检查**:
1. 运行架构完整性检查：`bash quality/scripts/shared/architecture-integrity-check.sh`
2. 运行完整验证：`node scripts/ai-agent-constraint-checklist.js full-check`
3. 记录关键决策：使用remember工具记录预留接口设计的关键决策和实现方案

完成后向我汇报结果和接口验证状态，以及与其他6个模块的接口兼容性确认。
```

### **阶段4完成验证指令（集成记忆外部化系统）**
```markdown
很好，请继续执行阶段5：协议接口实现

**🧠 记忆外部化检查点**:
1. 运行阶段转换检查：
   ```bash
   node scripts/ai-agent-constraint-checklist.js phase-transition protocol-implementation
   ```
2. 设置新阶段上下文：
   ```bash
   node scripts/ai-agent-smart-assistant.js remind implement-protocol [模块名]
   ```
3. 重新确认核心约束：请重述IMLPPProtocol接口和协议工厂的要求

**执行要求**:
1. 实现IMLPPProtocol接口的所有方法
2. 每个方法实现后运行：`node scripts/ai-agent-constraint-checklist.js protocol-check`
3. 实现协议元数据和健康检查
4. 创建协议工厂和依赖注入配置
5. 运行协议测试：`npm run test:protocol-integration:[模块]`

**🔄 阶段完成检查**:
1. 运行完整验证：`node scripts/ai-agent-constraint-checklist.js full-check`
2. 记录关键决策：使用remember工具记录协议实现的关键决策

完成后向我汇报结果和协议验证状态。
```

### **阶段5完成验证指令（集成记忆外部化系统）**
```markdown
很好，请继续执行阶段6：质量验证执行

**🧠 记忆外部化检查点**:
1. 运行阶段转换检查：
   ```bash
   node scripts/ai-agent-constraint-checklist.js phase-transition quality-validation
   ```
2. 设置新阶段上下文：
   ```bash
   node scripts/ai-agent-smart-assistant.js remind write-tests [模块名]
   ```
3. 重新确认核心约束：请重述4层验证系统和质量门禁的要求

**执行要求**:
1. 执行4层验证系统的所有测试
2. 每个测试层完成后运行：`node scripts/ai-agent-constraint-checklist.js test-check`
3. 运行所有质量门禁验证
4. 确保达到目标质量标准（企业级重写标准95%+ - 基于Context和Plan模块）
5. 生成完整的质量报告

**🔄 阶段完成检查**:
1. 运行最终验证：`node scripts/ai-agent-constraint-checklist.js final-check`
2. 记录关键决策：使用remember工具记录质量验证的结果和问题解决方案

完成后向我汇报结果和最终质量验证状态。
```

### **阶段6完成验证指令（集成记忆外部化系统）**
```markdown
很好，请执行阶段7：完成报告和文档更新

**🧠 记忆外部化检查点**:
1. 运行最终检查：
   ```bash
   node scripts/ai-agent-constraint-checklist.js completion-check
   ```
2. 生成完整的合规报告
3. 回顾所有记录的关键决策

**执行要求**:
1. 提供完整的重构完成报告
2. 确认所有架构合规性和质量标准
3. 更新相关文档和README
4. 记录实施经验和问题解决方案
5. 使用remember工具记录整个重构过程的总结和经验教训

**🔄 最终验证**:
1. 运行所有检查工具确认100%合规
2. 生成最终的记忆外部化系统使用报告

完成后提供最终的重构完成报告。
```

## 🎯 **统一架构问题处理指令（基于6个已完成模块的经验）**

### **遇到技术问题时**
```markdown
CRITICAL: 优先参考其他6个已完成模块的解决方案

遇到技术问题时，请：
1. 首先查阅Context/Plan/Confirm/Trace/Role/Extension模块的相同技术实现
2. 参考其他6个已完成模块的成功实现模式
3. 检查是否遵循了与其他模块相同的约束和标准
4. 确保技术解决方案与其他6个模块保持一致
5. 向我详细描述问题和已尝试的解决方案，以及与其他模块的对比
```

### **质量门禁失败时**
```markdown
CRITICAL: 使用与其他6个已完成模块相同的质量标准

质量门禁失败时，请：
1. 对比其他6个已完成模块的质量门禁通过标准
2. 查阅质量保证框架文档，确保使用相同的验证方式
3. 参考其他模块的质量问题解决经验
4. 修复问题后重新运行验证，确保达到与其他模块相同的质量水平
5. 确保100%通过所有质量门禁，与其他6个模块保持一致
```

### **架构理解有疑问时**
```markdown
CRITICAL: 确保架构理解与其他6个已完成模块完全一致

架构理解有疑问时，请：
1. 重新阅读协议规范文档，特别关注统一架构原则
2. 查阅架构决策记录(ADR)，了解统一架构的设计理由
3. 深入研究Context/Plan/Confirm/Trace/Role/Extension模块的架构实现
4. 确保架构理解与其他6个模块完全一致
5. 向我详细说明疑问点，以及与其他模块架构的对比分析
```
```

## 🧠 **记忆外部化系统详细使用指南**

### **AI Agent执行承诺**
```markdown
我，AI Agent，郑重承诺：

1. **不依赖长上下文记忆**：
   - 我承认我无法记住25+文档中的所有约束条件
   - 我将严格依赖外部工具来确保约束遵循
   - 我不会假设自己记住了之前的要求

2. **严格执行检查流程**：
   - 每个阶段开始前运行约束提醒工具
   - 每个操作后运行相关检查工具
   - 发现问题立即停止并报告
   - 请求用户确认和指导

3. **主动报告和确认**：
   - 主动报告任何不确定性
   - 请求用户确认理解正确性
   - 接受所有监督和纠正
   - 持续改进执行方法
```

### **用户监督指南**
```markdown
建议的监督频率和方法：

1. **每个阶段开始时**：
   - 确认AI Agent运行了约束提醒工具
   - 验证AI Agent对当前阶段要求的理解
   - 确认执行计划的合规性

2. **执行过程中**：
   - 每2小时检查自动化报告
   - 关注违规预警信号
   - 及时进行干预和纠正

3. **阶段完成后**：
   - 验证完整性检查结果
   - 确认质量标准达成
   - 记录经验和改进建议
```

### **工具使用快速参考**
```bash
# 阶段开始前
npm run ai-agent:remind <operation> <module>
npm run ai-agent:pre-check

# 执行过程中
npm run ai-agent:live-check
npm run ai-agent:check <operation> <module>

# 阶段完成后
npm run ai-agent:full-check
npm run ai-agent:verify <operation> <module>

# 最终验证
bash quality/scripts/shared/architecture-integrity-check.sh
npm run typecheck && npm run lint
```

### **🔍 企业级完整性检查清单（新增）**

**CRITICAL**: 每个模块完成后必须通过以下完整性检查，避免出现Trace模块的问题：

#### **架构组件完整性检查**
```bash
# 1. Domain层检查
ls -la src/modules/[模块]/domain/entities/[模块].entity.ts
ls -la src/modules/[模块]/domain/services/

# 2. API层检查
ls -la src/modules/[模块]/api/controllers/[模块].controller.ts
ls -la src/modules/[模块]/api/dto/[模块].dto.ts

# 3. 模块集成检查
ls -la src/modules/[模块]/module.ts

# 4. 文档套件检查（8文件标准）
ls -la docs/modules/[模块]/README.md
ls -la docs/modules/[模块]/api-reference.md
ls -la docs/modules/[模块]/architecture-guide.md
ls -la docs/modules/[模块]/testing-guide.md
ls -la docs/modules/[模块]/quality-report.md
ls -la docs/modules/[模块]/schema-reference.md
ls -la docs/modules/[模块]/field-mapping.md
ls -la docs/modules/[模块]/completion-report.md
```

#### **与企业级标准对比验证**
```bash
# 对比Context模块（企业级标准）
diff -r src/modules/context/ src/modules/[模块]/ --exclude="*.ts" | grep "Only in"
# 应该显示相同的目录结构

# 对比文档套件
diff -r docs/modules/context/ docs/modules/[模块]/ --exclude="*.md" | grep "Only in"
# 应该显示相同的文档结构
```

#### **质量标准验证**
```bash
# 测试覆盖率检查（应该≥95%）
npm run test:coverage -- --testPathPattern="tests/modules/[模块]"

# 零技术债务检查
npm run typecheck  # 必须0错误
npm run lint       # 必须0警告

# 企业级功能完整性检查
npm test tests/modules/[模块]/unit/  # 所有测试必须通过
```

### **成功保障机制**
```markdown
技术保障：
- 自动化约束检查工具
- 企业级完整性验证清单（新增）
- 实时违规预警系统
- 智能提醒和建议
- 完整的回滚机制

人工保障：
- 用户监督和确认
- 及时干预和纠正
- 经验记录和改进
- 质量验证和验收
- 与企业级标准对比验证（新增）
```

---

**指令版本**: 4.0.0 (适配项目全部重写)
**适用范围**: 所有MPLP v1.0模块重构
**执行模式**: 复制粘贴直接使用 + 记忆外部化工具支持
**项目状态**: 项目已全部重写，需要基于Schema从零开始完整实现
**Schema位置**: src/schemas/core-modules/ 和 src/schemas/cross-cutting-concerns/
**测试位置**: tests/modules/[模块名]/
**统一架构要求**: 基于Context/Plan/Confirm/Trace/Role/Extension模块的成功模式
**质量基准**: 与其他6个已完成模块保持完全一致
**记忆外部化**: 工具承担记忆责任，AI Agent执行标准操作
**CRITICAL**: 确保所有4个待完成模块与其他6个已完成模块使用IDENTICAL的架构模式
