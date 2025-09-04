# Required Documentation Reference Guide v1.0

## 🚨 **CRITICAL: 文档引用缺失问题解决**

**问题**: AI Agent执行文档集缺少对现有关键文档的引用和集成
**影响**: AI Agent可能无法获得完整的上下文信息，导致执行偏差
**解决**: 建立完整的文档引用体系，确保AI Agent读取所有必需文档
**CRITICAL**: 所有引用文档必须反映统一架构原则，确保AI Agent理解一致性要求

## 📋 **完整文档引用清单**

### **🔴 强制阅读文档（MANDATORY READING）**

#### **1. .augment/rules/ 目录下的规则文档**
```markdown
□ .augment/rules/MPLP-Core-Development-Rules.mdc ⭐ CRITICAL
  内容：MPLP v1.0开发规则，项目现状，核心原则，技术标准
  用途：理解项目整体状况和开发约束
  AI Agent必读：架构定位，质量标准，禁止事项

□ .augment/rules/MPLP-Development-Workflow.mdc ⭐ CRITICAL  
  内容：开发工作流规则，SCTM+GLFB+ITCM方法论，信息收集优先
  用途：理解开发流程和方法论要求
  AI Agent必读：工作流程，方法论应用，质量要求

□ .augment/rules/MPLP-Critical-Thinking-Methodology.mdc ⭐ CRITICAL
  内容：SCTM+GLFB+ITCM标准开发方法论，成功案例验证
  用途：掌握系统性批判性思维方法
  AI Agent必读：思维框架，成功模式，陷阱防范

□ .augment/rules/MPLP-Architecture-Core-Principles.mdc ⭐ CRITICAL
  内容：MPLP架构核心原则，模块协调机制，预留接口模式
  用途：理解架构设计原则和模块协调
  AI Agent必读：架构边界，协调机制，接口模式

□ .augment/rules/MPLP-Dual-Naming-Convention.mdc ⭐ MANDATORY
  内容：双重命名约定，Schema-TypeScript映射规则
  用途：确保命名约定一致性
  AI Agent必读：命名规则，映射函数，质量门禁

□ .augment/rules/MPLP-TypeScript-Standards.mdc ⭐ MANDATORY
  内容：TypeScript标准，零技术债务政策，质量门禁
  用途：确保代码质量标准
  AI Agent必读：类型安全，质量标准，验证机制

□ .augment/rules/MPLP-Module-Standardization.mdc ⭐ MANDATORY
  内容：模块标准化规则，目录结构，导出格式，质量检查
  用途：确保模块结构一致性
  AI Agent必读：目录结构，标准化要求，合规检查

□ .augment/rules/MPLP-CircleCI-Workflow.mdc ⭐ OPTIONAL
  内容：CircleCI工作流规则，CI/CD核心原则
  用途：理解持续集成要求
  AI Agent可选读：CI/CD流程，质量门禁
```

#### **2. docs/architecture/ 目录下的架构文档**
```markdown
□ docs/architecture/MPLP-Protocol-Specification-v1.0.md ⭐ CRITICAL
  内容：MPLP协议完整规范，L1-L3架构，10个模块详解
  用途：理解整体架构和模块定位
  AI Agent必读：协议定义，架构层次，模块功能

□ docs/architecture/MPLP-Architecture-Design.md ⭐ CRITICAL
  内容：系统架构设计，组件交互关系，技术选型
  用途：理解系统设计和技术架构
  AI Agent必读：架构设计，组件关系，技术决策

□ docs/architecture/MPLP-Architecture-Decision-Records.md ⭐ IMPORTANT
  内容：架构决策记录，重要决策的背景和理由
  用途：理解架构决策的历史和原因
  AI Agent必读：决策背景，设计理由，权衡考虑

□ docs/architecture/MPLP-Implementation-Guide.md ⭐ IMPORTANT
  内容：实施指南，开发流程，最佳实践
  用途：理解实施方法和最佳实践
  AI Agent必读：实施流程，最佳实践，经验总结
```

#### **3. docs/implementation/ 目录下的实施文档**
```markdown
□ docs/implementation/MPLP-Mapper-Implementation-Templates.md ⭐ CRITICAL
  内容：Mapper实现模板，双重命名约定，横切关注点集成
  用途：掌握Mapper实现的标准模板
  AI Agent必读：实现模板，映射方法，集成模式

□ docs/implementation/MPLP-Cross-Cutting-Concerns-Integration-Guide.md ⭐ CRITICAL
  内容：横切关注点集成指导，L1-L3架构集成，业务逻辑集成
  用途：掌握横切关注点的完整集成方法
  AI Agent必读：集成架构，业务集成，L3管理器

□ docs/implementation/MPLP-Reserved-Interface-Implementation-Templates.md ⭐ CRITICAL
  内容：预留接口实现模板，Interface-First模式，CoreOrchestrator准备
  用途：掌握预留接口的标准实现
  AI Agent必读：接口模式，实现模板，激活准备

□ docs/implementation/MPLP-Module-Refactoring-Step-by-Step-Guide.md ⭐ CRITICAL
  内容：模块重构步骤指导，10步流程，质量标准
  用途：掌握完整的重构流程
  AI Agent必读：重构步骤，质量标准，验证机制

□ docs/implementation/MPLP-Quality-Assurance-and-Validation-Framework.md ⭐ CRITICAL
  内容：质量保证框架，4层验证系统，质量门禁
  用途：掌握质量保证和验证方法
  AI Agent必读：验证系统，质量门禁，标准定义
```

#### **4. src/schemas/ 目录下的Schema定义**
```markdown
□ src/schemas/index.ts ⭐ CRITICAL
  内容：Schema索引，分类映射，工具函数
  用途：理解Schema组织结构
  AI Agent必读：Schema分类，映射表，工具函数

□ src/schemas/core-modules/index.ts ⭐ CRITICAL
  内容：核心模块Schema索引，模块信息，状态分类
  用途：理解核心模块的分类和状态
  AI Agent必读：模块分类，状态信息，特色功能

□ src/schemas/cross-cutting-concerns/index.ts ⭐ CRITICAL
  内容：横切关注点Schema索引，基础设施映射，L1-L3位置
  用途：理解横切关注点的分类和位置
  AI Agent必读：关注点分类，L1位置，L3管理器

□ src/schemas/mplp-[目标模块].json ⭐ CRITICAL
  内容：目标模块的完整Schema定义（实际文件，draft-07标准）
  用途：理解目标模块的数据结构
  AI Agent必读：字段定义，类型约束，验证规则
  CRITICAL: 必须基于实际存在的Schema文件，不允许假设字段名称

□ src/schemas/cross-cutting-concerns/ (实际存在的横切关注点Schema) ⭐ CRITICAL
  内容：实际的横切关注点Schema定义
  用途：理解横切关注点的数据结构
  AI Agent必读：关注点Schema，集成要求，字段映射
  CRITICAL: 确保与其他6个已完成模块的集成方式一致
```

## 🔧 **文档阅读顺序和方法**

### **阶段1：架构理解阶段**
```markdown
必须按以下顺序阅读：

1. .augment/rules/MPLP-Core-Development-Rules.mdc
   目的：理解项目整体状况和核心原则
   重点：项目定位，质量标准，技术约束

2. docs/architecture/MPLP-Protocol-Specification-v1.0.md  
   目的：理解MPLP完整架构和协议定义
   重点：L1-L3架构，10个模块定位，协议边界

3. .augment/rules/MPLP-Architecture-Core-Principles.mdc
   目的：理解架构设计原则和模块协调机制
   重点：架构边界，协调机制，预留接口模式

4. src/schemas/core-modules/index.ts
   目的：理解模块分类和状态信息
   重点：模块分类，质量状态，特色功能

5. src/schemas/core-modules/mplp-[目标模块].json
   目的：理解目标模块的具体定义
   重点：字段结构，类型定义，约束规则
```

### **阶段2：技术实施阶段**
```markdown
必须按以下顺序阅读：

1. .augment/rules/MPLP-Dual-Naming-Convention.mdc
   目的：理解双重命名约定的具体要求
   重点：命名规则，映射函数，验证机制

2. docs/implementation/MPLP-Mapper-Implementation-Templates.md
   目的：掌握Mapper实现的完整模板
   重点：实现模板，映射方法，横切关注点集成

3. src/schemas/cross-cutting-concerns/index.ts
   目的：理解横切关注点的分类和架构位置
   重点：关注点分类，L1-L3映射，基础设施位置

4. docs/implementation/MPLP-Cross-Cutting-Concerns-Integration-Guide.md
   目的：掌握横切关注点的完整集成方法
   重点：L1-L3集成架构，业务逻辑集成模式

5. docs/implementation/MPLP-Reserved-Interface-Implementation-Templates.md
   目的：掌握预留接口的标准实现模式
   重点：Interface-First模式，CoreOrchestrator准备
```

### **阶段3：质量保证阶段**
```markdown
必须按以下顺序阅读：

1. .augment/rules/MPLP-TypeScript-Standards.mdc
   目的：理解TypeScript质量标准和零技术债务政策
   重点：类型安全，质量门禁，验证要求

2. .augment/rules/MPLP-Module-Standardization.mdc
   目的：理解模块标准化要求和合规检查
   重点：目录结构，导出格式，质量检查

3. docs/implementation/MPLP-Quality-Assurance-and-Validation-Framework.md
   目的：掌握完整的质量保证和验证体系
   重点：4层验证系统，质量门禁，标准定义

4. .augment/rules/MPLP-Critical-Thinking-Methodology.mdc
   目的：掌握SCTM+GLFB+ITCM方法论和成功模式
   重点：思维框架，成功案例，方法论应用
```

## 📊 **文档引用验证机制**

### **AI Agent文档阅读验证**
```markdown
验证方法：在每个阶段开始前，AI Agent必须确认已阅读相关文档

阶段1验证问题（统一架构理解）：
1. MPLP v1.0的核心定位是什么？（来自import-all.mdc）
2. 6个已完成模块使用的统一架构模式是什么？（来自协议规范）
3. 预留接口模式的核心原理是什么？（来自架构核心原则）
4. 目标模块必须与哪6个已完成模块保持架构一致？（来自模块索引）
5. 目标模块Schema必须基于哪个实际文件？（来自实际Schema文件）

阶段2验证问题（统一实施标准）：
1. 双重命名约定的具体规则是什么？（来自命名约定规则）
2. Mapper类必须实现哪些方法？（与其他6个模块相同）（来自Mapper模板）
3. 9个横切关注点必须如何集成？（与其他6个模块IDENTICAL）（来自集成指导）
4. 横切关注点集成的标准调用顺序是什么？（与其他模块完全相同）（来自集成指导）
5. 预留接口的参数命名约定是什么？（与其他模块一致）（来自接口模板）

阶段3验证问题（统一质量标准）：
1. 零技术债务政策的具体要求是什么？（与其他6个模块相同标准）（来自TypeScript标准）
2. 模块标准化的目录结构要求是什么？（与其他模块IDENTICAL结构）（来自模块标准化）
3. 4层验证系统包含哪些层次？（与其他模块相同验证）（来自质量保证框架）
4. 如何确保与其他6个已完成模块的架构完全一致？（来自统一架构原则）
```

### **文档引用完整性检查**
```markdown
检查清单：
□ AI Agent确认已阅读所有强制文档
□ AI Agent正确回答所有验证问题
□ AI Agent理解文档间的关联关系
□ AI Agent掌握文档中的关键概念和要求
□ AI Agent能够应用文档中的方法和模板
```

## 🚨 **文档引用缺失的风险和应对**

### **统一架构风险识别（基于6个已完成模块的经验）**
```markdown
最高风险：偏离统一架构模式
影响：破坏与其他6个已完成模块的架构一致性，导致MPLP生态系统不兼容
应对：强制验证与Context/Plan/Confirm/Trace/Role/Extension模块的架构一致性

高风险：跳过统一架构文档阅读
影响：可能违反统一架构原则，实现与其他模块不一致的设计
应对：强制验证统一架构理解，确保与其他6个模块保持一致

中风险：跳过统一规则文档阅读
影响：可能违反统一开发约束，产生与其他模块不一致的技术债务
应对：强制验证统一规则理解，建立与其他模块相同的合规检查

低风险：跳过统一实施文档阅读
影响：可能实施方法与其他6个模块不一致，质量标准不统一
应对：提供与其他模块相同的标准模板，强制使用统一模板
```

### **应对机制**
```markdown
1. 强制文档阅读验证：每个阶段开始前必须通过文档理解验证
2. 分阶段文档引用：按照执行阶段分批引用相关文档
3. 关键概念重复确认：对关键概念进行多次确认和验证
4. 文档更新同步：确保AI Agent使用的是最新版本的文档
5. 引用追踪机制：记录AI Agent的文档阅读和理解状态
```

---

**引用指南版本**: 2.0.0
**文档覆盖**: 100%现有关键文档 + 统一架构原则文档
**验证机制**: 分阶段强制验证 + 统一架构一致性验证
**风险控制**: 完整的风险识别和应对机制 + 架构偏差预防
**统一架构要求**: 基于Context/Plan/Confirm/Trace/Role/Extension模块的文档引用经验
**质量基准**: 与其他6个已完成模块保持完全一致的文档引用标准
**CRITICAL**: 确保所有文档引用支持统一架构原则，避免架构不一致的风险
