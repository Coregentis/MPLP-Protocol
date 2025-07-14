# MPLP 项目开发预设指令

> **预设版本**: v2.5  
> **更新时间**: 2025-07-15T10:30:00+08:00  
> **适用项目**: Multi-Agent Project Lifecycle Protocol (MPLP) v1.0  

## 🎯 AI 助手开发约束

你将基于已有的 `.cursor/rules/*.mdc` 项目规范开发 MPLP 协议项目。

### 📌 强制执行的开发约束：

#### 0. **Schema驱动开发原则（最高优先级）** 
```
所有开发任务必须严格遵循Schema驱动原则：
- 开发前必须先读取相关src/schemas/*.json文件
- 所有字段名称、类型结构、枚举值必须100%匹配Schema定义
- 禁止在Schema未确认前编写代码或测试用例
- 严格按照Schema → Types → Modules → Services → Tests的开发顺序
参考规则：.cursor/rules/schema-driven-development.mdc
```

#### 1. **架构设计规则（严格执行）** 
```
所有开发必须严格遵循架构设计原则：
- 厂商中立原则：核心功能不依赖特定厂商，通过标准接口实现集成
- 模块化设计：6个核心模块独立且协作，边界清晰
- 性能约束：必须满足各模块性能指标要求
- 接口设计：通用接口命名必须中立，使用I前缀+PascalCase
- 错误处理：统一的错误处理机制和日志记录
参考规则：.cursor/rules/architecture.mdc
```

#### 2. **MPLP 生命周期流程（严格执行）**
```
所有任务必须遵循：Plan → Confirm → Trace → Delivery 流程
- Plan: 规划阶段 - 分析需求，制定实施计划
- Confirm: 确认阶段 - 验证计划，确认技术方案  
- Trace: 追踪阶段 - 记录实施过程，监控性能指标
- Delivery: 交付阶段 - 完成编码，更新文档，验证质量
```

#### 3. **测试规范（严格执行）** 
```
所有代码必须遵循严格的测试规范：
- 测试覆盖率：核心模块≥95%，其他模块≥90%
- 测试类型：单元测试、集成测试、性能测试全覆盖
- 测试数据：使用标准化的测试数据生成方法
- 测试命名：遵循describe('模块名称'), test('应该做什么')格式
- 边界测试：必须包含边界条件和错误场景测试
参考规则：.cursor/rules/test-style.mdc, .cursor/rules/test-data.mdc
```

#### 4. **规则引用机制（必须执行）**
```
每轮生成代码/文档前，必须先确认你当前引用的 `.mdc` 规则，并说明所遵循的部分：
- 引用规则文件：如 `.cursor/rules/core-modules.mdc`
- 遵循章节：如 "Context模块实现规范"
- 应用约束：如 "状态操作<5ms性能要求"
```

#### 5. **输出标准化（强制包含）**
```
输出必须同时包含：
✅ 修改文件名和路径
✅ 归属模块（trace/context/plan/confirm/role/extension）
✅ delivery-checklist.mdc 符合性检查
✅ versioning.mdc 版本号变更需求
✅ 性能指标验证（如适用）
✅ 测试覆盖率要求（≥90%单元测试）
```

#### 6. **禁止行为（严格禁止）**
```
❌ 不允许直接跳过 Plan/Trace 阶段进入编码
❌ 不允许忽略 .mdc 规则约束
❌ 不允许生成不符合性能标准的代码
❌ 不允许省略错误处理和日志记录
❌ 不允许使用 any 类型或绕过 TypeScript 严格模式
❌ 不允许违反Schema定义实现不一致的代码
❌ 不允许忽略厂商中立原则使用特定厂商实现
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
- [ ] versioning.mdc 版本号更新
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
- 创建 `src/modules/plan/failure-resolver.ts` - 实现智能故障处理
- 创建 `tests/modules/plan/failure-resolver.test.ts` - 全面测试覆盖

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
- 更新 `src/adapters/trace/enhanced-trace-adapter.ts` - 实现厂商中立适配器
- 更新 `tests/modules/plan/plan-manager.test.ts` - 适配增强版测试

### 🔄 人工触发语句示例

以下是一些标准触发语句，可以在对话开始时使用，以激活特定的开发约束：

#### 1. **Schema驱动开发触发**
> 「请严格按照Schema驱动开发原则，为[模块名]实现[功能名]功能。」

#### 2. **架构规则触发**
> 「请严格遵守架构设计规则，特别是厂商中立原则，为[模块名]开发[功能名]。」

#### 3. **测试规范触发**
> 「请按照测试规范要求，为[模块名]的[功能名]编写全面的测试用例，确保覆盖率≥95%。」

#### 4. **完整流程触发**
> 「请为[模块名]实现[功能名]，必须严格走Plan→Confirm→Trace→Delivery流程，并遵守相关.mdc规则。」

#### 5. **项目审计触发**
> 「请根据项目开发目前阶段，结合Architecture和产品Roadmap，评估MPLP项目1.0产品开发程度，并进行全面审计。」

#### 6. **性能优化触发**
> 「请对[模块名]进行性能优化，确保符合性能标准规范中的指标要求。」

#### 7. **代码重构触发**
> 「请根据架构设计规则和命名约定，重构[文件路径]，确保厂商中立和接口一致性。」

### 📚 参考规则文件

- `.cursor/rules/schema-driven-development.mdc` - Schema驱动开发核心规则
- `.cursor/rules/architecture.mdc` - 架构设计规则
- `.cursor/rules/schema-design.mdc` - Schema设计原则
- `.cursor/rules/naming-convention.mdc` - 命名约定规则
- `.cursor/rules/auto-docs.mdc` - 自动文档规则
- `.cursor/rules/agent-role.mdc` - Agent角色权限控制规则
- `.cursor/rules/api-design.mdc` - API设计规范
- `.cursor/rules/testing-strategy.mdc` - 测试策略规范
- `.cursor/rules/test-style.mdc` - 测试风格规范
- `.cursor/rules/test-data.mdc` - 测试数据生成规范
- `.cursor/rules/security-requirements.mdc` - 安全要求规范
- `.cursor/rules/performance-standards.mdc` - 性能标准规范
- `.cursor/rules/integration-patterns.mdc` - 集成模式规范
- `.cursor/rules/data-management.mdc` - 数据管理规范
- `.cursor/rules/monitoring-logging.mdc` - 监控日志规范
- `.cursor/rules/deployment-operations.mdc` - 部署运维规范
- `.cursor/rules/delivery-checklist.mdc` - 交付检查清单
- `.cursor/rules/versioning.mdc` - 版本管理规范
- `.cursor/rules/development-workflow.mdc` - 开发流程规范
- `.cursor/rules/extension-protocol.mdc` - 扩展协议规范
- `.cursor/rules/doc-style.mdc` - 文档风格规则
- `.cursor/rules/trace-lifecycle.mdc` - 追踪生命周期规则
- `.cursor/rules/auto-sync-updates.mdc` - 自动同步更新规则
- `.cursor/rules/commit-guideline.mdc` - 提交指南规则
- `.cursor/rules/pre-commit-checks.mdc` - Pre-commit检查规则

### ✅ 审计执行标准与方法

#### **六维度量化指标**
```markdown
## 📊 项目审计维度

1. **架构一致性审计**
   - 接口命名匹配度：目标>95%
   - 厂商中立实现度：目标100%
   - 模块边界清晰度：目标>90%
   - 错误处理一致性：目标100%

2. **Schema一致性审计**
   - 代码与Schema匹配度：目标100%
   - 字段命名一致性：目标100%
   - Schema验证覆盖率：目标>95%
   - 类型安全度：目标100%

3. **测试完整性审计**
   - 单元测试覆盖率：目标≥95%（核心模块）
   - 集成测试覆盖率：目标≥80%
   - 性能测试覆盖率：目标≥70%
   - 边界条件测试：目标>90%

4. **性能达标审计**
   - API响应时间：目标P95<100ms
   - 协议解析性能：目标<10ms
   - 模块特定性能：按各模块标准
   - 资源利用率：CPU<70%，内存<512MB

5. **文档完整性审计**
   - API文档匹配度：目标>95%
   - 代码注释覆盖率：目标>80%
   - 架构文档更新度：目标100%
   - 使用指南完整性：目标>90%

6. **开发规范审计**
   - ESLint规则符合率：目标100%
   - 命名约定匹配度：目标>95%
   - Git提交规范符合率：目标>90%
   - 代码审查覆盖率：目标100%
```

#### **审计结果输出模板**
```markdown
## 📋 项目审计结果

### 总体评分：[X/10]

### 详细审计结果
| 审计维度 | 当前状态 | 目标状态 | 差距 | 优先级 |
|---------|---------|---------|------|-------|
| 架构一致性 | [X%] | [Y%] | [Z%] | [高/中/低] |
| Schema一致性 | [X%] | [Y%] | [Z%] | [高/中/低] |
| 测试完整性 | [X%] | [Y%] | [Z%] | [高/中/低] |
| 性能达标 | [X%] | [Y%] | [Z%] | [高/中/低] |
| 文档完整性 | [X%] | [Y%] | [Z%] | [高/中/低] |
| 开发规范 | [X%] | [Y%] | [Z%] | [高/中/低] |

### 关键问题
1. [问题1描述]
2. [问题2描述]
3. [问题3描述]

### 改进建议
1. [建议1]
2. [建议2]
3. [建议3]
```

---

**预设指令版本**: v2.5  
**维护团队**: Coregentis MPLP 项目团队  
**更新周期**: 每个开发阶段开始前更新 