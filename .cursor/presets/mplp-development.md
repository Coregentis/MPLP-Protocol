# MPLP 项目开发预设指令

> **预设版本**: v2.3  
> **更新时间**: 2025-07-10T13:28:12+08:00  
> **适用项目**: Multi-Agent Project Lifecycle Protocol (MPLP) v1.0  

## 🎯 AI 助手开发约束

你将基于已有的 `.cursor/rules/*.mdc` 项目规范开发 MPLP 协议项目。

### 📌 强制执行的开发约束：

#### 0. **Schema驱动开发原则（最高优先级）** 🆕
```
所有开发任务必须严格遵循Schema驱动原则：
- 开发前必须先读取相关src/schemas/*.json文件
- 所有字段名称、类型结构、枚举值必须100%匹配Schema定义
- 禁止在Schema未确认前编写代码或测试用例
- 严格按照Schema → Types → Modules → Services → Tests的开发顺序
参考规则：.cursor/rules/schema-driven-development.mdc
```

#### 1. **MPLP 生命周期流程（严格执行）**
```
所有任务必须遵循：Plan → Confirm → Trace → Delivery 流程
- Plan: 规划阶段 - 分析需求，制定实施计划
- Confirm: 确认阶段 - 验证计划，确认技术方案  
- Trace: 追踪阶段 - 记录实施过程，监控性能指标
- Delivery: 交付阶段 - 完成编码，更新文档，验证质量
```

#### 2. **规则引用机制（必须执行）**
```
每轮生成代码/文档前，必须先确认你当前引用的 `.mdc` 规则，并说明所遵循的部分：
- 引用规则文件：如 `.cursor/rules/core-modules.mdc`
- 遵循章节：如 "Context模块实现规范"
- 应用约束：如 "状态操作<5ms性能要求"
```

#### 3. **输出标准化（强制包含）**
```
输出必须同时包含：
✅ 修改文件名和路径
✅ 归属模块（trace/context/plan/confirm/role/extension）
✅ delivery-checklist.mdc 符合性检查
✅ versioning.mdc 版本号变更需求
✅ 性能指标验证（如适用）
✅ 测试覆盖率要求（≥90%单元测试）
```

#### 4. **禁止行为（严格禁止）**
```
❌ 不允许直接跳过 Plan/Trace 阶段进入编码
❌ 不允许忽略 .mdc 规则约束
❌ 不允许生成不符合性能标准的代码
❌ 不允许省略错误处理和日志记录
❌ 不允许使用 any 类型或绕过 TypeScript 严格模式
```

### 🔧 技术标准约束（基于 technical-standards.mdc）

#### **代码质量要求**
- TypeScript 5.0+ 严格模式，100% 类型覆盖
- ESLint + Prettier 检查必须通过
- 单元测试覆盖率 ≥ 90%，集成测试 ≥ 80%

#### **性能标准要求**
- API 响应时间：P95 < 100ms, P99 < 200ms
- 协议解析性能：< 10ms
- 模块特定性能：Context <5ms, Plan <8ms, Confirm <3ms, Trace <2ms, Role <1ms, Extension <50ms

#### **安全标准要求**
- 所有输入必须验证和清理
- 敏感数据必须加密存储
- 0 个高危安全漏洞

### 📋 标准任务模板

#### **Plan 阶段模板**
```markdown
## 📋 Plan 阶段

**引用规则**: `.cursor/rules/[相关规则].mdc`
**任务模块**: [trace/context/plan/confirm/role/extension]
**预期交付**: [具体交付物]

### 技术方案
- 实现方式：[技术方案]
- 性能目标：[具体指标]
- 依赖关系：[模块依赖]

### 风险评估
- 技术风险：[风险点]
- 性能风险：[性能考虑]
- 缓解措施：[应对方案]
```

#### **Confirm 阶段模板**
```markdown
## ✅ Confirm 阶段

**方案确认**: [确认技术方案]
**规则符合性**: [符合的 .mdc 规则]
**性能目标**: [确认性能指标]
**测试策略**: [测试覆盖计划]
```

#### **Trace 阶段模板**
```markdown
## 📊 Trace 阶段

**实施进度**: [当前进度]
**性能监控**: [性能指标]
**质量检查**: [代码质量状态]
**问题记录**: [遇到的问题和解决方案]
```

#### **Delivery 阶段模板**
```markdown
## 🚀 Delivery 阶段

**交付文件**: [修改的文件列表]
**模块归属**: [属于哪个核心模块]
**Checklist 验证**: 
- [ ] delivery-checklist.mdc 符合性
- [ ] versioning.mdc 版本更新
- [ ] 性能测试通过
- [ ] 安全扫描通过
- [ ] 测试覆盖率达标

**版本影响**: [是否需要版本号变更]
```

### 🎯 使用示例

#### **任务1：Plan模块failure_resolver功能实现**
**用户请求**:
> 「请你为 `plan` 模块补充 `failure_resolver` 功能，但必须严格走 Plan → Confirm → Trace → Delivery 流程，并遵守相关 `.mdc` 规则。」

**AI 助手成功完成的流程**:
1. **Plan**: 分析 plan 模块规则，设计 failure_resolver 方案（4种恢复策略）
2. **Confirm**: 确认技术方案符合性能要求 (<10ms)
3. **Trace**: 记录实施过程，监控开发进度，实现批处理恢复
4. **Delivery**: 交付代码，创建测试用例，验证覆盖率>90%

**实际交付成果**:
- 修改 `src/modules/plan/plan-manager.ts` - 添加失败任务恢复机制
- 增强 `src/modules/plan/types.ts` - 添加失败相关事件类型
- 创建 `tests/modules/plan/plan-manager.test.ts` - 全面测试覆盖

#### **任务2：TracePilot适配器升级**
**用户请求**:
> 「Plan模块没有使用更新的TracePilot MCP方法，需要升级到增强版适配器。」

**AI 助手成功完成的流程**:
1. **Plan**: 分析现有适配器差异，规划升级路径
2. **Confirm**: 确认升级方案和兼容性保障
3. **Trace**: 实施升级，添加AI智能追踪功能
4. **Delivery**: 完成升级，更新测试，验证兼容性

**实际交付成果**:
- 升级 `src/modules/plan/plan-manager.ts` - 使用EnhancedTracePilotAdapter
- 增强 `src/mcp/enhanced-tracepilot-adapter.ts` - 添加向后兼容方法
- 更新 `tests/modules/plan/plan-manager.test.ts` - 适配增强版测试

### 📚 参考规则文件

- `.cursor/rules/schema-driven-development.mdc` - **Schema驱动开发核心规则** 🆕
- `.cursor/rules/core-modules.mdc` - 6个核心模块规范
- `.cursor/rules/technical-standards.mdc` - 技术标准基线
- `.cursor/rules/api-design.mdc` - API设计规范
- `.cursor/rules/testing-strategy.mdc` - 测试策略规范
- `.cursor/rules/security-requirements.mdc` - 安全要求规范
- `.cursor/rules/performance-standards.mdc` - 性能标准规范
- `.cursor/rules/integration-patterns.mdc` - 集成模式规范
- `.cursor/rules/data-management.mdc` - 数据管理规范
- `.cursor/rules/monitoring-logging.mdc` - 监控日志规范
- `.cursor/rules/deployment-operations.mdc` - 部署运维规范
- `.cursor/rules/delivery-checklist.mdc` - 交付检查清单
- `.cursor/rules/versioning.mdc` - 版本管理规范
- `.cursor/rules/development-workflow.mdc` - 开发流程规范

---

**预设指令版本**: v2.2  
**维护团队**: Coregentis MPLP 项目团队  
**更新周期**: 每个开发阶段开始前更新 

### 🎯 **审计执行标准与方法**

#### **六维度量化指标**
```markdown
<code_block_to_apply_changes_from>
```

---

## ✅ CONFIRM 阶段 - 审计范围与标准确认
```markdown
✅ 架构一致性: 接口命名匹配度>95%, 错误处理模式100%一致
✅ 版本一致性: 所有版本号100%匹配同步  
✅ 开发一致性: ESLint零违规, 命名约定匹配度>95%
✅ 需求一致性: PRD需求实现覆盖率>90%
✅ 文档一致性: 代码注释覆盖率>80%, API文档匹配度>95%
✅ 测试一致性: 测试覆盖率>85%, Mock方式统一性>90%
``` 