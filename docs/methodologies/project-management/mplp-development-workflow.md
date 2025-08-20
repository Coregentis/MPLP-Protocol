---
type: "always_apply"
description: "Development workflow for MPLP v1.0"
---

# Development Workflow Rules

## 🏗️ **MPLP v1.0 Context**

**CRITICAL**: MPLP v1.0 is a **Multi-Agent Protocol Lifecycle Platform** with **L1-L3 layered architecture**, containing **10 complete modules**, currently **60% completed** (6/10 modules). All development must acknowledge this reality.

**Project Name**: MPLP - Multi-Agent Protocol Lifecycle Platform
**Implementation Scope**: L1-L3 layered architecture (Protocol Layer, Coordination Layer, Execution Layer)
**Architecture Positioning**: "Intelligent Agent Construction Framework Protocol" - NOT agents themselves
**Current Status**: 6 modules completed (Plan, Context, Confirm, Trace, Role, Extension), 4 modules pending (Collab, Dialog, Network, Core)
**Quality Achievement**:
- Role module reached enterprise-grade standard (75.31% coverage, 333 tests)
- Trace module achieved 100% test pass rate (107/107 tests)
- **Extension module achieved Multi-Agent Protocol Platform standard** (54 functional tests 100% pass rate, 8 MPLP module reserved interfaces, 10 CoreOrchestrator coordination scenarios)

**Architecture Boundary**:
- L1-L3 Protocol Layer: Provides standardized interfaces and coordination infrastructure
- L4 Agent Layer: Implements specific AI decision and learning logic (FUTURE)
- Current Focus: Protocol standardization and integration interfaces, NOT AI implementation

## 🎯 核心原则

### 1. 信息收集优先
```markdown
RULE: 在执行任何代码修改前，必须先进行充分的信息收集
- 使用 codebase-retrieval 工具了解现有代码结构
- 使用 git-commit-retrieval 工具查看历史变更
- 分析相关模块的依赖关系和接口
- 理解业务逻辑和架构设计
- 特别注意：MPLP已有10个完整模块，6个已完成企业级标准，避免重复开发
- 参考已完成模块的成功经验和质量标准
- **Extension模块成功经验**: 8个MPLP模块预留接口、智能协作功能、企业级功能、分布式支持
- **架构边界意识**: 明确当前开发属于L1-L3协议层，不包含AI决策和学习实现
- **协议模块理解**: 协议是"积木"，Agent是"建筑"，一个Agent可使用多个协议
```

### 2. Schema驱动开发 + 双重命名约定 + 零技术债务
```markdown
RULE: 所有开发必须遵循Schema驱动原则 + 双重命名约定 + 零技术债务要求
- 先定义或验证JSON Schema (使用snake_case)
- 基于Schema设计TypeScript接口 (使用camelCase)
- 实现Schema-TypeScript映射函数
- 确保类型定义与Schema一致
- 验证实现符合Schema规范
- 所有协议必须通过Schema验证
- 验证双重命名约定合规性

DUAL NAMING CONVENTION REQUIREMENTS:
- Schema层必须使用snake_case命名 (MANDATORY)
- TypeScript层必须使用camelCase命名 (MANDATORY)
- 必须提供双向映射函数 (MANDATORY)
- 映射一致性验证必须100%通过 (ZERO TOLERANCE)
- 禁止混用命名约定 (ZERO TOLERANCE)

ZERO TECHNICAL DEBT REQUIREMENTS:
- 绝对禁止使用any类型 (ZERO TOLERANCE)
- TypeScript编译必须0错误 (MANDATORY)
- ESLint检查必须0错误和警告 (MANDATORY)
- 每次提交前必须通过类型检查 (MANDATORY)
- 每次提交前必须通过映射验证 (MANDATORY)
- 所有模块开发完成时必须通过完整质量检查
```

### 3. 厂商中立设计
```markdown
RULE: 保持厂商中立的架构设计
- 使用适配器模式隔离厂商特定实现
- 定义通用接口和抽象层
- 避免硬编码厂商特定配置
- 支持多厂商切换和扩展
```

### 4. 工具使用规范
```markdown
RULE: 正确使用开发工具
- 使用str-replace-editor进行代码修改，避免重写整个文件
- 使用适当的包管理器，避免手动编辑package.json
- 进行精确的局部修改，保持代码格式一致
- 验证修改的正确性
```

## 🔄 开发流程

### 阶段1: 需求分析
```markdown
1. 理解用户需求和业务目标
2. 分析现有代码和架构
3. 识别影响范围和依赖关系
4. 制定实施计划和任务分解
```

### 阶段2: 设计规划
```markdown
1. 设计技术方案和架构
2. 定义接口和数据结构
3. 规划测试策略和验证方法
4. 评估风险和制定应对措施
```

### 阶段3: 实现开发
```markdown
1. 遵循代码质量标准
2. 实施增量开发和持续集成
3. 编写单元测试和集成测试
4. 进行代码审查和质量检查
```

### 阶段4: 测试验证
```markdown
1. 执行完整的测试套件
2. 验证功能正确性和性能
3. 检查安全性和兼容性
4. 确认文档和示例的准确性
```

### 阶段5: 部署发布
```markdown
1. 准备发布版本和变更日志
2. 执行自动化部署流程
3. 监控系统状态和性能
4. 收集反馈和持续改进
```

## 🛠️ 工具使用规范

### 代码编辑
```markdown
RULE: 使用str-replace-editor进行代码修改 + 遵循双重命名约定
- 避免重写整个文件
- 进行精确的局部修改
- 保持代码格式和风格一致
- 验证修改的正确性
- 确保字段命名符合双重命名约定
- Schema文件使用snake_case
- TypeScript文件使用camelCase
- 提供映射函数实现
```

### 包管理
```markdown
RULE: 使用适当的包管理器
- npm/yarn用于Node.js依赖
- 避免手动编辑package.json
- 使用--legacy-peer-deps解决冲突
- 定期更新和审计依赖
```

### 文件操作
```markdown
RULE: 规范的文件操作流程
- 使用view工具查看文件内容
- 使用save-file创建新文件
- 使用remove-files安全删除文件
- 保持文件结构的整洁性
```

## 📋 任务管理

### 复杂任务分解
```markdown
RULE: 对复杂任务进行结构化管理
- 使用task management工具规划任务
- 将大任务分解为可管理的子任务
- 跟踪任务进度和状态
- 及时更新任务状态和描述
```

### 任务状态管理
```markdown
状态定义:
- NOT_STARTED [ ] - 未开始的任务
- IN_PROGRESS [/] - 正在进行的任务
- COMPLETE [x] - 已完成的任务
- CANCELLED [-] - 已取消的任务
```

### 批量更新
```markdown
RULE: 高效的任务状态更新
- 使用批量更新减少API调用
- 同时更新相关任务状态
- 保持任务状态的一致性
- 记录任务变更历史
```

## 🔍 质量保证

### 代码审查
```markdown
RULE: 严格的代码审查标准 + 双重命名约定验证
- 检查代码逻辑和算法正确性
- 验证错误处理和边界条件
- 确认性能和安全性要求
- 检查文档和注释完整性
- 验证双重命名约定合规性
- 检查Schema-TypeScript映射一致性
- 确认字段命名标准化
- 验证映射函数完整性
```

### 测试要求
```markdown
RULE: 全面的测试覆盖
- 单元测试覆盖率 > 90%
- 集成测试验证模块协作
- 端到端测试验证完整流程
- 性能测试确保性能基准
```

### 文档维护
```markdown
RULE: 同步更新文档
- 代码变更必须更新相关文档
- 保持API文档的准确性
- 更新示例代码和使用指南
- 维护架构图和设计文档
```

## 🚨 错误处理

### 故障恢复
```markdown
RULE: 遇到困难时的处理策略
- 识别循环调用和无效操作
- 主动寻求用户帮助和指导
- 记录问题和解决方案
- 学习和改进处理方法
```

### 调试策略
```markdown
RULE: 系统化的调试方法
- 使用日志和诊断工具
- 逐步缩小问题范围
- 验证假设和测试解决方案
- 文档化调试过程和结果
```

## 📈 持续改进

### 性能优化
```markdown
RULE: 持续的性能优化
- 定期进行性能基准测试
- 识别和优化性能瓶颈
- 监控系统资源使用
- 实施缓存和优化策略
```

### 技术债务管理
```markdown
RULE: 主动管理技术债务
- 识别和记录技术债务
- 制定偿还计划和优先级
- 在新功能开发中考虑重构
- 平衡功能开发和代码质量
```

---

**重要提醒**: 这些规则基于MPLP项目的实际经验制定，旨在确保高质量的开发过程和最终产品。