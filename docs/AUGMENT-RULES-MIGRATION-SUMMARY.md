# Augment Rules 精髓迁移总结

## 🎯 **迁移背景**

从项目根目录的`augment-rules`文件夹中选择最精髓的规则，迁移到`.augment/rules`中，确保Augment Agent能够完全服从这些核心开发规则、思考规则和测试规则。

## ✅ **完成的规则迁移**

### 1. **批判性思维方法论 (critical-thinking-methodology.mdc) - 新建**

#### **核心价值**: 最高优先级的思维规则
```markdown
🎯 自我提问驱动的开发
- 开发前的系统性规划 (7个核心问题)
- 开发中的持续验证 (7个验证问题)
- 开发后的全面评估 (7个评估问题)
- 反思性学习 (5个反思问题)
```

#### **实施框架**:
- **问题分析三层法**: 表面问题 → 根本原因 → 解决方案边界
- **用户视角验证法**: 新手、专家、维护者三重视角
- **系统性完整性检查**: 功能、技术、用户体验、文档四维度

#### **禁止思维模式**:
```markdown
❌ 表面思维、单一视角、功能导向、技术导向、完美主义、经验主义
✅ 系统思维、用户思维、批判思维、创新思维、学习思维、协作思维
```

### 2. **TypeScript编程标准 (typescript-standards.mdc) - 新建**

#### **核心原则**:
- **严格类型检查**: 启用所有strict选项，禁止any类型
- **接口优先设计**: 定义清晰的契约和抽象
- **泛型和类型安全**: 合理使用泛型提高复用性

#### **DDD架构标准**:
```
src/modules/{module}/
├── api/                 # API Layer
├── application/         # Application Layer  
├── domain/             # Domain Layer
└── infrastructure/     # Infrastructure Layer
```

#### **质量要求**:
- TypeScript严格模式: 100%启用
- 类型覆盖率: > 95%
- 循环依赖: 0个
- any类型使用: 0个

### 3. **代码质量标准 (code-quality-standards.mdc) - 新建**

#### **质量核心原则**:
- **可读性优先**: 有意义命名、单一职责、必要注释
- **类型安全**: 完整的类型定义和验证
- **错误处理**: 完整和正确的错误处理机制

#### **架构质量标准**:
- **模块化设计**: 独立性和可测试性
- **依赖管理**: 依赖注入，避免硬编码
- **配置管理**: 外部化配置

#### **性能质量标准**:
- API响应时间 < 100ms (简单查询)
- API响应时间 < 500ms (复杂查询)
- 避免内存泄漏

### 4. **开发工作流增强 (development-workflow.mdc) - 更新**

#### **新增内容**:
- **MPLP上下文认知**: 9模块生产就绪状态
- **工具使用规范**: str-replace-editor、包管理器使用
- **信息收集优先**: 避免重复开发已有功能

### 5. **测试策略增强 (testing-strategy.mdc) - 更新**

#### **新增MPLP测试基准**:
- 保持89.2%以上的测试覆盖率
- 确保所有353个测试持续通过
- 新增功能必须包含相应测试
- 测试必须基于实际Schema编写

### 6. **CircleCI工作流规则 (circleci-workflow.mdc) - 新建**

#### **CI/CD核心原则**:
- **CircleCI MCP工具优先**: 使用专用MCP工具进行CI/CD操作
- **配置验证优先**: 部署前必须验证CircleCI配置
- **渐进式部署策略**: 开发→主分支→版本标签的渐进式流程

#### **工作流设计规范**:
- **开发工作流**: 并行执行，快速反馈，包含单元测试、集成测试、构建验证、安全扫描
- **发布工作流**: 顺序执行，严格验证，版本标签触发，完整质量门禁

### 7. **发布管理规则 (release-management.mdc) - 新建**

#### **发布核心原则**:
- **一次构建成功原则**: 构建脚本必须一次性成功，无需手动修复
- **双仓库发布策略**: 开发版本和开源版本完全分离
- **语义化版本控制**: 严格遵循SemVer规范
- **路径问题根本解决**: 在构建时彻底解决所有路径问题

### 8. **公开发布策略规则 (public-release-strategy.mdc) - 新建**

#### **核心战略原则**:
- **一次构建成功战略**: 智能化构建系统，自动分析项目结构
- **路径问题根本解决战略**: 完整的路径映射表和智能修复系统
- **完整功能验证战略**: 发布版本与开发版本100%功能相同

#### **智能构建系统**:
- **项目结构智能分析**: 自动发现所有源文件
- **智能文件复制系统**: 按路径映射表复制文件
- **智能路径修复系统**: 自动修复所有导入路径

## 📊 **规则优先级体系**

### **最高优先级 (Highest)**
- ✅ **critical-thinking-methodology.mdc**: 思维方法论
- ✅ **mplp-project-standards.mdc**: MPLP项目特定标准

### **高优先级 (High)**
- ✅ **core-development-standards.mdc**: 核心开发标准
- ✅ **typescript-standards.mdc**: TypeScript编程标准
- ✅ **code-quality-standards.mdc**: 代码质量标准

### **标准优先级 (Standard)**
- ✅ **development-workflow.mdc**: 开发工作流
- ✅ **testing-strategy.mdc**: 测试策略

### **CI/CD优先级 (CI/CD)**
- ✅ **circleci-workflow.mdc**: CircleCI工作流管理
- ✅ **release-management.mdc**: 发布管理和版本控制

### **关键优先级 (Critical)**
- ✅ **public-release-strategy.mdc**: 公开发布策略

## 🎯 **精髓选择原则**

### **选择标准**:
1. **实用性**: 能直接指导日常开发工作
2. **强制性**: 必须严格遵循，不可妥协
3. **完整性**: 覆盖开发全流程的关键环节
4. **针对性**: 特别适用于MPLP项目特点

### **新增的CI/CD规则** (用户要求补充):
- **circleci-workflow.mdc**: CircleCI工作流管理和MCP工具使用
- **release-management.mdc**: 发布管理、版本控制、双仓库策略
- **public-release-strategy.mdc**: 公开发布策略、智能构建系统

### **补充原因**:
这些规则是后续Release工作的重要组成部分，对于项目的CI/CD和发布流程至关重要。

## 🔄 **规则导入结构**

### **更新后的import-all.mdc**:
```markdown
@import augment-rules/core-development-standards.mdc
@import augment-rules/mplp-project-standards.mdc
@import augment-rules/critical-thinking-methodology.mdc
@import augment-rules/typescript-standards.mdc
@import augment-rules/code-quality-standards.mdc
@import augment-rules/imported/development-workflow.mdc
@import augment-rules/imported/testing-strategy.mdc
@import augment-rules/circleci-workflow.mdc
@import augment-rules/release-management.mdc
@import augment-rules/public-release-strategy.mdc
```

### **核心原则更新**:
新增第4条核心原则：
```markdown
### 4. Critical Thinking Methodology (MANDATORY)
- Apply systematic self-questioning before, during, and after development
- Use three-layer problem analysis: surface → root cause → solution boundary
- Validate solutions from multiple user perspectives
- Ensure system-wide completeness and integration
```

## 📈 **预期效果**

### **短期效果**:
- Augment Agent严格遵循批判性思维方法论
- 所有代码符合TypeScript严格标准
- 保持MPLP项目的高质量基准
- 避免重复开发和技术债务

### **长期效果**:
- 建立系统性的开发思维模式
- 确保代码质量的持续提升
- 支持项目的可持续发展
- 为团队协作提供统一标准

## 🚀 **执行保障**

### **强制性要求**:
- ✅ 所有规则都标记为`type: "always_apply"`
- ✅ 违反规则的代码将被拒绝
- ✅ 必须通过所有质量检查
- ✅ 保持MPLP生产级标准

### **监控机制**:
- 代码提交前自动检查
- 持续集成中的质量门禁
- 定期的规则遵循度评估
- 及时的反馈和改进

---

**总结**: 这次规则迁移成功提取了最精髓的开发规则，并根据用户要求补充了完整的CI/CD和发布管理规则，建立了从开发到发布的完整质量保障体系，确保Augment Agent能够在MPLP项目的全生命周期中发挥最佳效能。

**规则总数**: 10个核心规则文件
**覆盖范围**: 开发思维、代码质量、测试策略、CI/CD流程、发布管理
**生效时间**: 2025年8月2日
**版本**: 1.0.0
