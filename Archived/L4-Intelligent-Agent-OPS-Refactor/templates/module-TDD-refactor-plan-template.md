# {Module}模块 TDD重构任务计划 - 基于三模块成功经验

## 🎉 **重构概述** (基于Context/Plan/Confirm成功模式)

**模块**: {Module} ({模块中文名})
**重构类型**: TDD (Test-Driven Development) + 系统性批判性思维方法论 + GLFB循环
**目标**: 达到100%完美质量标准 (基于三模块成功经验)
**基于规则**: `.augment/rules/import-all.mdc`, `.augment/rules/testing-strategy-new.mdc`, `.augment/rules/critical-thinking-methodology.mdc`
**完成标准**: **100%完美质量标准** + **{Module}模块{特色}协调器特色100%实现**
**架构澄清**: MPLP v1.0是智能体构建框架协议，{Module}模块是L2协调层的{特色}协调器

## 🚨 **CRITICAL: 架构缺失警告** (基于Confirm模块教训)

**重要发现**: Confirm模块TDD重构时遗漏了MPLP预留接口，导致架构不完整。
**根本原因**: 将预留接口视为"未来功能"而非"架构基础设施"。
**强制要求**: 所有8个MPLP模块预留接口是**强制性架构基础设施**，必须在TDD阶段实现。
**验证机制**: 使用`bash quality/scripts/shared/architecture-integrity-check.sh`强制验证。

**禁止重复Confirm模块的架构缺失问题！**

## 🏆 **三模块成功经验总结**

### ✅ **验证的成功模式**
- **Context模块**: 100%完成，14个功能域，Schema驱动开发
- **Plan模块**: 100%完成，GLFB循环验证，5大智能协调器
- **Confirm模块**: 100%完成，从73%→100%历史性提升，企业级审批协调器

### 🧠 **统一方法论验证**
- ✅ **系统性链式批判性思维**: 复杂问题的结构化解决方案
- ✅ **GLFB循环**: Global-Local-Feedback-Breakthrough完整验证
- ✅ **Plan-Confirm-Trace-Delivery流程**: 端到端质量保证
- ✅ **问题模式识别**: 批量修复策略完全有效
- ✅ **根本原因分析**: 精确识别和解决核心问题

## 📊 **三模块成功经验详细总结**

### **Context模块成功经验** (100%完成)
```markdown
✅ 核心成就:
- 14个功能域100%实现
- Schema驱动开发模式验证成功
- 21个测试文件完整覆盖
- 33个TypeScript文件，0个模块内错误

✅ 关键成功因素:
- Schema驱动的功能域分析方法
- 模块级质量门禁范围明确
- 完整的DDD四层架构实现
- 厂商中立的集成设计

✅ 可复制经验:
- 基于Schema字段的功能分解
- 模块专项验证命令设计
- 协议层标准化接口实现
- AI功能边界清晰定义
```

### **Plan模块成功经验** (100%完成)
```markdown
✅ 核心成就:
- GLFB循环方法论4个循环成功验证
- 5大智能协调器完整实现
- 8个MPLP预留接口100%实现
- 294/294测试，19/19套件100%通过

✅ 关键成功因素:
- 客观验证脚本建立，避免主观评估
- 精确修复策略，避免批量修改风险
- 预留接口模式，下划线前缀参数标记
- 循环控制机制，失败时回到全局规划

✅ 可复制经验:
- validate-plan-module.sh验证脚本模式
- 连续失败升级机制设计
- 预留接口等待CoreOrchestrator激活模式
- 智能协调器专业化实现
```

### **Confirm模块成功经验** (100%完成)
```markdown
✅ 核心成就:
- 从73%→100%模块测试通过率历史性提升
- 278/278模块测试，21/21功能测试100%通过
- 16个测试文件100%通过率
- 企业级审批协调器特色100%实现

✅ 关键成功因素:
- 系统性问题模式识别和批量修复
- 根本原因分析：构造函数、测试数据、Mock配置
- 边界条件处理和实体方法实现
- 持续验证和效果跟踪机制

✅ 可复制经验:
- 4阶段修复过程：分析→修复→优化→达成
- 测试数据创建统一化策略
- Mock配置与实际服务实现对齐
- 时间逻辑和语法错误精确修复
```

## 📊 **质量标准基准** (基于三模块成功经验)

### **100%完美质量标准**
- **模块测试通过率**: **100%** (Context: 21个测试文件, Plan: 294/294测试, Confirm: 278/278测试)
- **功能测试通过率**: **100%** (Confirm: 21/21功能测试)
- **测试套件通过率**: **100%** (Plan: 19/19套件, Confirm: 16/16套件)
- **TypeScript编译**: **0错误** (三模块全部达成)
- **ESLint检查**: **0错误，0警告** (三模块全部达成)
- **双重命名约定**: **100%合规** (三模块验证成功)

### **全局验证基础设施**
```bash
# 基于三模块成功经验的验证脚本
./scripts/validate-{module}-module.sh

# 验证维度 (三模块完美质量基准)
□ TypeScript编译检查: 0错误 (绝对禁止any类型)
□ ESLint代码质量检查: 0警告 (完美代码质量)
□ 模块测试: 100%通过 (零技术债务)
□ 功能测试: 100%通过 (核心功能验证)
□ Schema映射一致性: 100%合规 (双重命名约定)
□ MPLP模块集成: 深度集成验证
□ 系统性批判性思维: 方法论合规验证
□ 文档任务完成度: 100%完成
□ 文件结构完整性: 100%合规
□ 完成度评分: 100/100 (完美质量标准)
```

### **全局进度跟踪**
- **总任务数**: 基于模块复杂度确定 (Context: 14个功能域, Plan: 5大协调器, Confirm: 5个协调器)
- **当前进度**: 0% (待开始)
- **质量门禁**: 每个阶段完成后进行强制验证
- **最终验证**: 达到100%完美质量标准

## 🔄 **GLFB循环实施指导** (基于Plan模块成功验证)

### **循环执行原则** (Plan模块4个循环成功验证)
```markdown
RULE: 严格按照全局-局部-反馈-突破循环执行 (Plan模块验证有效)

1. 全局规划 (Global Planning)
   □ 从任务总体出发，建立完整验证基础设施 (Plan模块成功经验)
   □ 设计客观验证标准，避免主观评估 (Plan模块教训)
   □ 评估风险和制定应对策略

2. 局部执行 (Local Execution)
   □ 专注当前子任务的高质量实现
   □ 遵循技术标准和开发规范 (双重命名约定等)
   □ 记录实施过程和问题 (Confirm模块详细记录)

3. 全局反馈 (Global Feedback)
   □ 运行完整验证脚本评估整体状态 (Plan模块验证脚本)
   □ 分析子任务完成对全局的影响
   □ 更新进度和质量指标

4. 突破循环 (Breakthrough)
   □ 基于反馈结果决定下一步行动
   □ 验证通过→下一子任务，验证失败→修复问题 (Plan模块循环控制)
   □ 连续失败→回到全局规划重新设计 (Plan模块经验)
   □ 更新任务管理系统状态
```

### **强制验证检查点** (基于三模块成功经验)
```markdown
每个子任务完成后必须执行 (Context/Plan/Confirm验证模式)：
□ 运行 ./scripts/validate-{module}-module.sh (Plan模块验证脚本)
□ 检查模块测试通过率 (Confirm模块从73%→100%经验)
□ 验证TypeScript编译状态 (三模块0错误标准)
□ 更新任务管理系统进度
□ 记录问题和解决方案 (Confirm模块详细记录)
□ 评估对后续任务的影响

阶段性检查点 (基于模块复杂度)：
□ 深度系统集成验证 (Context模块14个功能域经验)
□ 性能基准测试 (Plan模块企业级性能)
□ 架构一致性检查 (三模块DDD架构)
□ 技术债务评估 (零技术债务标准)
□ 风险重新评估
```

### **循环控制机制** (Plan模块验证有效)
```markdown
验证通过条件 (三模块成功标准)：
□ TypeScript编译: 0错误 (三模块达成)
□ ESLint检查: 0警告 (三模块达成)
□ 模块测试通过率: 100% (三模块达成)
□ 功能测试通过率: 100% (Confirm模块标准)

验证失败处理 (Plan模块成功经验)：
□ 立即停止进入下一任务
□ 应用系统性批判性思维分析根本原因 (Confirm模块经验)
□ 识别问题模式，批量修复 (Confirm模块策略)
□ 修复问题后重新验证
□ 记录问题和解决方案

升级机制 (Plan模块循环控制经验)：
□ 连续3次验证失败→回到全局规划重新设计 (Plan模块验证)
□ 发现系统性问题→暂停当前循环，解决根本问题
□ 时间超出预期50%→重新评估任务分解和优先级
```

## 🎯 **基于三模块成功经验的功能分析**

### **{Module}模块核心定位** (基于Context/Plan/Confirm成功模式)
基于`{module}-MPLP-positioning-analysis.md`系统性批判性思维分析：

**协议栈定位**: MPLP智能体构建框架协议L2协调层的{特色}专业化组件
**核心特色**: {核心特色描述} (参考: Context-上下文管理, Plan-任务规划, Confirm-审批协调)
**与CoreOrchestrator关系**: 预留接口模式，等待CoreOrchestrator激活，提供{特色}协调能力
**协议栈标准**: {特色}协调专业化 + 企业级{特色}治理 + AI集成标准化接口
**AI功能边界**: 提供AI集成接口，不实现AI决策算法 (三模块统一边界)
**成功模式参考**:
- Context模块: 14个功能域，Schema驱动开发
- Plan模块: 5大智能协调器，8个MPLP预留接口
- Confirm模块: 5个协调器，企业级审批流程

#### **1. {核心特色1} (核心特色)**
- [ ] {具体功能1}
- [ ] {具体功能2}
- [ ] {具体功能3}
- [ ] {具体功能4}
- [ ] {具体功能5}

#### **2. {核心特色2} (核心特色)**
- [ ] {具体功能1}
- [ ] {具体功能2}
- [ ] {具体功能3}
- [ ] {具体功能4}
- [ ] {具体功能5}

#### **3. {核心特色3} (协议栈标准)**
- [ ] {具体功能1}（标准化接口设计）
- [ ] {具体功能2}（类型安全实现）
- [ ] {具体功能3}（性能基准达标）
- [ ] {具体功能4}（企业级质量）
- [ ] {具体功能5}（可扩展架构）

#### **4. {核心特色4} (AI集成支持)**
- [ ] {具体功能1}（AI集成标准化接口）
- [ ] {具体功能2}（多厂商AI支持）
- [ ] {具体功能3}（厂商中立设计）
- [ ] {具体功能4}（插件化AI集成）
- [ ] {具体功能5}（AI服务请求/响应格式）

#### **5. MPLP{特色}协调器集成** (基于三模块成功模式)
- [ ] 4个核心模块{特色}协调集成 (Role, Context, Trace, Plan) - Plan模块8个预留接口成功经验
- [ ] 预留接口模式实现（下划线前缀参数）- 三模块统一标准
- [ ] CoreOrchestrator中心化协调支持 - 三模块验证成功
- [ ] 4个扩展模块{特色}协调集成 (Extension, Network, Dialog, Confirm) - 扩展协调模式
- [ ] CoreOrchestrator预留接口协作支持 (10种协调场景) - Plan模块成功验证
- [ ] {特色}协调器特色接口实现 (体现协调专业化) - 三模块特色差异化
- [ ] {特色}协调事件总线和状态反馈 - Context模块事件驱动成功经验
- [ ] AI集成标准化接口（不实现AI决策算法）- 三模块统一边界

## 🔍 **当前代码分析**

### **现有实现状态**
基于 `src/modules/{module}/` 分析：

#### **✅ 已实现组件**
- [x] Schema定义 (`mplp-{module}.json`) - 完整的{特色}协议定义
- [x] TypeScript类型 (`types.ts`) - {行数}行完整类型定义
- [x] 领域实体 (`{module}.entity.ts`) - {行数}行核心业务逻辑
- [x] 应用服务 (`{module}.service.ts`) - {行数}行服务实现
- [x] DDD架构结构 - 完整的分层架构

#### **❌ 缺失组件 (TDD重构目标) - 基于三模块成功经验**
- [ ] Mapper类 - Schema-TypeScript双重命名约定映射 (三模块统一标准)
- [ ] DTO类 - API数据传输对象 (三模块完整实现)
- [ ] Controller - API控制器 (三模块REST API标准)
- [ ] Repository实现 - 数据持久化 (三模块DDD架构)
- [ ] 模块适配器 - MPLP生态系统集成 (三模块集成模式)
- [ ] 预留接口 - CoreOrchestrator协调准备 (Plan模块8个接口成功经验)

#### **🚨 质量问题识别 (基于{特色}协调器特色和三模块经验)**
- [ ] 双重命名约定不一致 (entity中使用snake_case私有属性) - 三模块统一修复经验
- [ ] 缺少Schema验证和映射函数 - Context模块Schema驱动成功经验
- [ ] **缺少{核心特色1}实现**（协议层标准化接口）- 参考Context模块14个功能域
- [ ] **缺少{核心特色2}核心机制**（不包含AI决策算法）- 三模块AI边界经验
- [ ] **缺少{核心特色3}功能**（厂商中立设计）- 三模块厂商中立标准
- [ ] **缺少{核心特色4}能力**（AI集成标准化接口）- 三模块AI集成模式
- [ ] 缺少MPLP{特色}协调器特色接口 - Plan模块预留接口成功模式
- [ ] 缺少与CoreOrchestrator的预留接口机制 - 三模块统一协调模式
- [ ] 缺少完整的{特色}协调异常处理和恢复机制 - Confirm模块企业级处理经验
- [ ] 缺少AI功能边界合规检查 - 三模块统一边界标准
- [ ] 缺少协议组合支持设计 - 三模块可组合架构经验

## 📋 **TDD重构任务清单** (基于三模块成功经验)

### **🔍 每阶段验证机制** (Context/Plan/Confirm成功验证)

#### **质量保证原则** (三模块统一标准)
```markdown
RULE: 每个开发步骤都必须有强制验证 (三模块成功验证)
- 前置检查 (Pre-check): 确保阶段开始条件满足 (Plan模块前置检查)
- 开发过程约束 (Development Constraints): 实时质量监控 (三模块实时验证)
- 完成后验证 (Post-validation): 强制质量门禁 (三模块100%通过标准)
- 系统性链式批判性思维: 每阶段应用PCTD流程 (Confirm模块成功应用)
- 问题模式识别: 批量修复策略 (Confirm模块从73%→100%经验)
- 根本原因分析: 精确识别核心问题 (三模块问题解决经验)
```

### **📈 修复过程参考** (基于Confirm模块历史性成就)
```markdown
Phase 1: 问题分析和模式识别
- 初始状态评估和问题识别
- 根本原因分析 (构造函数、测试数据、Mock配置等)

Phase 2: 系统性修复实施
- 修复策略制定和批量应用
- 持续验证和效果跟踪

Phase 3: 边界条件和细节优化
- 边界条件处理和实体方法实现
- 时间逻辑修复和语法错误修复

Phase 4: 100%完美质量达成
- 最终验证和质量保证
- 性能验证和企业级标准达成
```

### **阶段1: 基础架构重构** (基于三模块成功经验)

#### **🚨 阶段1前置检查** (三模块统一标准)
```bash
# 1. TDD重构前质量基线检查 (基于三模块成功经验)
node scripts/tdd/tdd-quality-enforcer.js pre-check {module}

# 2. Schema合规性验证 (Context模块Schema驱动成功经验)
npm run validate:schemas -- --module={module}
npm run validate:naming -- --module={module}

# 3. 系统性批判性思维应用检查 (Confirm模块成功应用)
□ 问题根本原因分析完成 (Confirm模块4个根本原因识别)
□ 解决方案边界确定 (三模块边界清晰)
□ 风险评估和应对策略制定 (Plan模块风险控制)
□ PCTD流程Plan阶段完成 (Plan-Confirm-Trace-Delivery)

# 4. 三模块成功经验参考检查
□ Context模块: Schema驱动开发模式理解
□ Plan模块: GLFB循环和预留接口模式理解
□ Confirm模块: 问题模式识别和批量修复策略理解
```

#### **1.1 Schema-TypeScript映射层** (基于三模块成功经验)
- [ ] **任务**: 创建 `{Module}Mapper` 类 (三模块统一标准)
  - [ ] 实现 `toSchema()` 方法 (camelCase → snake_case) - 三模块统一实现
    - **🔧 验证工具**: `npm run validate:mapping -- --module={module} --method=toSchema`
    - **✅ 通过标准**: 100%字段映射正确，0个类型错误 (三模块达成标准)
  - [ ] 实现 `fromSchema()` 方法 (snake_case → camelCase) - 三模块统一实现
    - **🔧 验证工具**: `npm run validate:mapping -- --module={module} --method=fromSchema`
    - **✅ 通过标准**: 100%反向映射正确，0个数据丢失 (三模块达成标准)
  - [ ] 实现 `validateSchema()` 方法 - Context模块Schema验证成功经验
    - **🔧 验证工具**: `npm run test -- --testNamePattern="{Module}Mapper.*validateSchema"`
    - **✅ 通过标准**: 100%测试通过，覆盖所有边界条件
  - [ ] 实现批量转换方法 `toSchemaArray()`, `fromSchemaArray()` - 三模块性能标准
    - **🔧 验证工具**: `npm run test -- --testNamePattern="{Module}Mapper.*Array"`
    - **✅ 通过标准**: 批量转换100%正确，性能<10ms/1000条
  - [ ] **测试**: 100%映射一致性验证 - 三模块验证成功
    - **🔧 验证工具**: `./scripts/check-module-quality.sh {module} --focus=mapper`
    - **✅ 通过标准**: 映射一致性100%，双重命名约定100%合规
  - [ ] **标准**: 遵循 `.augment/rules/dual-naming-convention.mdc` - 三模块统一标准
    - **🔧 验证工具**: `npm run check:naming -- --module={module}`
    - **✅ 通过标准**: 0个命名约定违规

**🔍 1.1 开发过程约束 (实时执行)**:
```bash
# {Module}模块专项实时TypeScript编译检查
find src/modules/{module} -name "*.ts" -exec npx tsc --noEmit {} \; --watch

# {Module}模块专项实时ESLint代码质量检查
npm run lint -- src/modules/{module}/**/*.ts --watch

# {Module}模块实时Schema映射验证
npm run validate:mapping -- --module={module} --watch
```

**✅ 1.1 完成后验证 (强制执行)**:
```bash
# {Module}模块专项强制质量门禁
node scripts/tdd/tdd-quality-enforcer.js stage1-1 {module}

# {Module}模块Mapper类功能验证
npm run test:unit -- --testPathPattern={module}.mapper (100%通过)
npm run validate:mapping -- --module={module} (100%一致)
find src/modules/{module} -name "*.ts" -exec npx tsc --noEmit {} \; (0错误)

# {Module}模块专项验证确认
echo "验证{Module}模块质量门禁范围：仅针对src/modules/{module}/**/*.ts"

# PCTD流程Confirm阶段验证
□ Mapper实现方案确认
□ 映射一致性验证完成
□ 质量标准达成确认
```

#### **1.2 DTO层重构 + 实时验证**
- [ ] **任务**: 创建完整的DTO类
  - [ ] `Create{Module}Dto` - 创建{特色}请求DTO
    - **🔧 验证工具**: `npm run test -- --testNamePattern="Create{Module}Dto"`
    - **✅ 通过标准**: 100%字段验证，0个any类型
  - [ ] `Update{Module}Dto` - 更新{特色}请求DTO
    - **🔧 验证工具**: `npm run test -- --testNamePattern="Update{Module}Dto"`
    - **✅ 通过标准**: 部分更新逻辑100%正确
  - [ ] `{Module}ResponseDto` - {特色}响应DTO
    - **🔧 验证工具**: `npm run test -- --testNamePattern="{Module}ResponseDto"`
    - **✅ 通过标准**: 响应格式100%标准化
  - [ ] `{特色}ManagementDto` - {特色}管理DTO
    - **🔧 验证工具**: `npm run test -- --testNamePattern="{特色}ManagementDto"`
    - **✅ 通过标准**: 管理操作DTO100%覆盖
  - [ ] **测试**: DTO验证和转换测试
    - **🔧 验证工具**: `npm run test -- --testPathPattern="dto" --module={module}`
    - **✅ 通过标准**: DTO层测试100%通过，覆盖率>90%
  - [ ] **标准**: 严格类型安全，零any类型
    - **🔧 验证工具**: `find src/modules/{module}/api/dto -name "*.ts" -exec grep -l "any" {} \;`
    - **✅ 通过标准**: 0个any类型使用

#### **1.3 领域实体重构**
- [ ] **任务**: 修复 `{Module}` 实体双重命名约定
  - [ ] 修复私有属性命名 (使用camelCase)
  - [ ] 添加Schema映射支持
  - [ ] 增强业务逻辑验证
  - [ ] 添加企业级功能方法
  - [ ] **测试**: 实体业务逻辑完整测试
  - [ ] **标准**: 100%业务规则覆盖

#### **🚨 阶段1完成验证 (强制执行)**
```bash
# 阶段1统一质量门禁验证
node scripts/tdd/tdd-quality-enforcer.js stage1-complete {module}

# 阶段1核心组件验证
./scripts/module-quality-gate.sh {module} --stage=1

# 阶段1必须达成的标准 (100%通过才能进入阶段2)
✅ Mapper类: 100%映射一致性，0个命名约定违规
✅ DTO层: 100%类型安全，0个any类型使用
✅ 实体层: 100%业务规则覆盖，0个TypeScript错误
✅ 测试覆盖: >90%覆盖率，100%测试通过
✅ 质量门禁: 0个模块内TypeScript错误，0个ESLint警告

# PCTD流程Trace阶段验证
□ 阶段1实施进展跟踪完成
□ 问题解决方案验证完成
□ 下一阶段准备工作确认
```

### **阶段2: {特色}协调器核心重构 (Day 1-2)**

#### **2.1 {核心特色1}**
- [ ] **任务**: 实现 `{ClassName1}`
  - [ ] {具体实现1}
  - [ ] {具体实现2}
  - [ ] {具体实现3}
  - [ ] {具体实现4}
  - [ ] **测试**: {测试类型}测试 ({测试标准})
  - [ ] **标准**: {性能标准}

#### **2.2 {核心特色2}**
- [ ] **任务**: 实现 `{ClassName2}`
  - [ ] {具体实现1}
  - [ ] {具体实现2}
  - [ ] {具体实现3}
  - [ ] {具体实现4}
  - [ ] **测试**: {测试类型}测试 ({测试标准})
  - [ ] **标准**: {性能标准}

#### **2.3 {核心特色3}**
- [ ] **任务**: 重构 `{ClassName3}`
  - [ ] {具体实现1}
  - [ ] {具体实现2}
  - [ ] {具体实现3}
  - [ ] {具体实现4}
  - [ ] **测试**: {测试类型}测试
  - [ ] **标准**: {性能标准}

#### **2.4 MPLP{特色}协调器接口实现** ⚠️ **强制要求 - 基于Confirm模块架构缺失教训**

**🚨 CRITICAL**: 基于Confirm模块架构缺失问题，预留接口是**强制性架构基础设施**，不是可选功能！

**架构缺失教训**: Confirm模块TDD重构时遗漏预留接口，导致架构不完整，必须避免重复此问题。

**强制实现要求**:
- ✅ **必须实现**: 所有8个MPLP模块预留接口
- ✅ **必须验证**: 使用架构完整性检查脚本验证
- ✅ **必须标记**: 参数使用下划线前缀，TODO注释等待CoreOrchestrator激活
- ✅ **必须测试**: 预留接口签名和临时实现的正确性

**核心{特色}协调接口 (4个深度集成模块)** - **MANDATORY**:
- [ ] `validate{Module}CoordinationPermission(_userId, _{module}Id, _coordinationContext)` - Role模块协调权限 **[强制]**
- [ ] `get{Module}CoordinationContext(_contextId, _{module}Type)` - Context模块协调环境 **[强制]**
- [ ] `record{Module}CoordinationMetrics(_{module}Id, _metrics)` - Trace模块协调监控 **[强制]**
- [ ] `align{Module}WithPlanCoordination(_planId, _{module}Strategy)` - Plan模块协调对齐 **[强制]**

**{特色}增强协调接口 (4个增强集成模块)** - **MANDATORY**:
- [ ] `request{Module}DecisionCoordination(_{module}Id, _decision)` - Confirm模块决策协调 **[强制]**
- [ ] `load{Module}SpecificCoordinationExtensions(_{module}Id, _requirements)` - Extension模块协调扩展 **[强制]**
- [ ] `coordinate{Module}AcrossNetwork(_networkId, _{module}Config)` - Network模块分布式协调 **[强制]**
- [ ] `enableDialogDriven{Module}Coordination(_dialogId, _{module}Participants)` - Dialog模块对话协调 **[强制]**

**🔍 架构完整性验证** - **MANDATORY**:
- [ ] **运行架构检查**: `bash quality/scripts/shared/architecture-integrity-check.sh`
- [ ] **验证接口数量**: 必须有8个预留接口
- [ ] **验证TODO标记**: 每个接口都有"TODO: 等待CoreOrchestrator激活"注释
- [ ] **验证参数前缀**: 所有参数使用下划线前缀（_userId, _contextId等）
- [ ] **验证接口命名**: 体现{特色}协调器特色

- [ ] **测试**: {特色}协调器接口模拟测试 (重点验证协调特色) **[强制]**
- [ ] **标准**: 体现{特色}协调器定位，参数使用下划线前缀 **[强制]**

### **阶段3: {特色}智能分析和基础设施协调 (Day 2)**

#### **3.1 {特色}智能分析协调器**
- [ ] **任务**: 实现 `{Module}AnalysisCoordinator`
  - [ ] {特色}效果分析和建议协调 (≥90%准确率)
  - [ ] {特色}问题预测和预防协调 (≥95%准确率)
  - [ ] {特色}优化策略生成和协调 (≥80%采纳率)
  - [ ] 向CoreOrchestrator提供{特色}分析报告
  - [ ] **测试**: 智能分析协调算法测试
  - [ ] **标准**: L4智能化分析协调能力

#### **3.2 {特色}治理协调器**
- [ ] **任务**: 实现 `{Module}GovernanceCoordinator`
  - [ ] {特色}安全策略协调和执行
  - [ ] {特色}合规性检查和报告协调 (100%合规)
  - [ ] {特色}审计数据收集和管理协调
  - [ ] {特色}风险评估和控制协调
  - [ ] **测试**: 治理协调完整性测试
  - [ ] **标准**: 企业级治理协调标准

#### **3.3 高性能协调基础设施**
- [ ] **任务**: 实现企业级 `{Module}Repository` 和 `{Module}CoordinatorAdapter`
  - [ ] 高性能协调数据持久化 (支持{数量}+并发)
  - [ ] 协调状态智能缓存和查询优化
  - [ ] 协调事务管理和一致性保证
  - [ ] {特色}协调器特色API设计
  - [ ] **测试**: 高并发协调性能测试
  - [ ] **标准**: 企业级协调性能和可靠性

## ✅ **TDD质量门禁**

## 🔧 **统一工具验证标准 (CRITICAL)**

**核心原则**: 每个TDD步骤都有明确的验证工具和通过标准，避免重复思考工具选择，建立统一的开发流程。

### **标准化工具映射格式**
```markdown
每个具体任务都包含:
- **🔧 验证工具**: 具体的命令或脚本
- **✅ 通过标准**: 明确的成功标准和指标

示例:
- [ ] 实现toSchema方法
  - **🔧 验证工具**: npm run validate:mapping -- --module={module} --method=toSchema
  - **✅ 通过标准**: 100%字段映射正确，0个类型错误
```

### **工具使用时机统一标准**
```markdown
🚨 阶段前置检查: node scripts/tdd/tdd-quality-enforcer.js pre-check {module}
🔍 开发过程约束: 实时监控工具 (--watch模式)
✅ 完成后验证: node scripts/tdd/tdd-quality-enforcer.js stage{X}-complete {module}
🎯 最终质量门禁: ./scripts/module-quality-gate.sh {module}
```

## 🎯 **模块级质量门禁范围说明 (CRITICAL UPDATE)**

**重要澄清**: {Module}模块重构的质量门禁**仅针对{Module}模块本身**，不包括其他模块或依赖的错误。

### **Context模块成功验证案例 (2025-01-16)**：
- ✅ **Context模块TypeScript编译**: 0错误 (已验证)
- ❌ **项目其他模块**: 208个错误 (不影响Context模块质量门禁)
- ✅ **结论**: Context模块达到模块级质量标准
- ✅ **验证方法**: `find src/modules/context -name "*.ts" -exec npx tsc --noEmit {} \;`

### **{Module}模块专项质量验证**：
- ✅ **{Module}模块TypeScript编译**: 0错误 (模块内验证)
- ✅ **{Module}模块ESLint检查**: 通过 (模块内代码)
- ✅ **{Module}模块单元测试**: 100%通过率
- ✅ **{Module}模块功能实现**: 完整实现验证

### **质量门禁边界**：
```markdown
✅ 包含在质量门禁内:
- src/modules/{module}/**/*.ts 的所有TypeScript错误
- {Module}模块的ESLint警告和错误
- {Module}模块的单元测试通过率
- {Module}模块的功能完整性

❌ 不包含在质量门禁内:
- 其他模块的TypeScript/ESLint错误
- node_modules依赖的类型错误
- 项目级别的配置问题
- 其他模块的测试失败
```

### **强制质量检查**
每个TDD循环必须通过：

```bash
# {Module}模块专项TypeScript编译检查 (ZERO ERRORS)
find src/modules/{module} -name "*.ts" -exec npx tsc --noEmit {} \;

# {Module}模块专项ESLint检查 (ZERO WARNINGS)
npm run lint -- src/modules/{module}/**/*.ts

# {Module}模块单元测试 (100% PASS)
npm run test:unit:{module}

# {Module}模块Schema映射一致性检查 (100% CONSISTENCY)
npm run validate:mapping:{module}

# {Module}模块双重命名约定检查 (100% COMPLIANCE)
npm run check:naming:{module}
```

### **验证命令**：
```bash
# {Module}模块专项验证 (正确的质量门禁范围)
find src/modules/{module} -name "*.ts" -exec npx tsc --noEmit {} \;  # 0错误
npm run lint -- src/modules/{module}/**/*.ts                        # {Module}模块ESLint
npm test -- --testPathPattern="tests/modules/{module}"              # {Module}模块测试
```

## 🔧 **工具使用指导**

### **TDD重构工具链使用时机**

#### **1. 质量门禁脚本 (module-quality-gate.sh)**
```bash
使用时机:
- 每个TDD阶段完成后的验证
- 模块重构最终完成前的质量确认
- CI/CD流水线中的自动化质量检查

使用方法:
./scripts/module-quality-gate.sh {module}

预期结果:
✅ {Module}模块TypeScript编译: 0错误
✅ {Module}模块ESLint检查: 0警告
✅ {Module}模块单元测试: 100%通过
```

#### **2. 模块质量检查脚本 (check-module-quality.sh)**
```bash
使用时机:
- TDD重构开始前的基线检查
- 每个开发阶段的质量状态评估
- 问题诊断和分析

使用方法:
./scripts/check-module-quality.sh {module}

输出信息:
- TypeScript错误统计和详细信息
- ESLint警告统计和详细信息
- 测试通过率和失败详情
- 版本一致性检查结果
```

#### **3. 版本一致性修复工具 (fix-version-consistency.sh)**
```bash
使用时机:
- TDD重构开始前的版本统一
- 发现版本不一致问题时的修复
- 跨模块依赖冲突的解决

使用方法:
./scripts/fix-version-consistency.sh {module}

修复内容:
- 统一所有版本号为v1.0.0
- 修复package.json依赖版本
- 更新Schema版本标识
```

#### **4. 测试适配器模板 (test-adapter-template.ts)**
```bash
使用时机:
- TDD重构过程中遇到测试失败
- 需要适配跨模块依赖的测试
- 创建Mock对象和测试数据工厂

使用方法:
1. 复制模板到测试目录
2. 根据模块特性定制适配器
3. 在测试中使用适配器替代直接依赖

适配策略:
- 接口适配器模式
- 测试数据工厂模式
- Mock对象生成模式
```

#### **5. TDD质量执行器 (tdd-quality-enforcer.js)**
```bash
使用时机:
- 每个TDD阶段的前置检查
- 开发过程中的实时质量监控
- 阶段完成后的强制验证

使用方法:
node scripts/tdd/tdd-quality-enforcer.js [stage] {module}

阶段参数:
- pre-check: 前置检查
- stage1-1: 阶段1.1完成验证
- stage1-2: 阶段1.2完成验证
- final: 最终质量验证
```

### **覆盖率要求**
- [ ] **单元测试覆盖率**: ≥75% (Extension模块标准)
- [ ] **核心业务逻辑覆盖率**: ≥90%
- [ ] **错误处理覆盖率**: ≥95%
- [ ] **边界条件覆盖率**: ≥85%

### **L4{特色}协调器性能基准**
- [ ] **{特色}协调**: <{时间}ms ({数量}+{实体})
- [ ] **{特色}决策协调**: <{时间}ms ({操作}协调)
- [ ] **{特色}分析协调**: <{时间}ms (实时分析协调)
- [ ] **{特色}治理协调**: <{时间}ms (权限和合规协调)
- [ ] **协调系统可用性**: ≥99.9% (企业级SLA)
- [ ] **并发协调支持**: {数量}+ ({实体}协调数量)
- [ ] **CoreOrchestrator协作**: <10ms (指令-响应延迟)

## 🚨 **风险控制**

### **技术风险**
- [ ] **风险**: 双重命名约定重构复杂
  - **缓解**: 使用自动化映射工具和完整测试覆盖
- [ ] **风险**: MPLP预留接口设计复杂
  - **缓解**: 参考Extension模块成功模式

### **质量风险**  
- [ ] **风险**: 测试覆盖率不达标
  - **缓解**: 每个功能先写测试，后写实现
- [ ] **风险**: 性能不达标
  - **缓解**: 每个组件都包含性能测试

## 📊 **完成标准** (基于三模块100%成功经验)

### **TDD阶段完成标准** ({特色}协调器特色 - 三模块验证标准)
- [x] **所有质量门禁100%通过** (三模块达成标准)
- [x] **模块测试通过率100%** (Context: 21个文件, Plan: 294/294, Confirm: 278/278)
- [x] **功能测试通过率100%** (Confirm: 21/21功能测试标准)
- [x] **{核心特色1}100%实现** ({具体标准} - 协议层标准化接口)
- [x] **{核心特色2}100%实现** ({具体标准} - 厂商中立设计)
- [x] **{核心特色3}100%实现** ({具体标准} - 可组合架构)
- [x] **{核心特色4}100%实现** ({具体标准} - AI集成标准化接口)
- [x] **8个MPLP{特色}协调接口100%实现** (Plan模块预留接口成功模式) **[强制 - 基于Confirm模块架构缺失教训]**
- [x] **与CoreOrchestrator预留接口机制100%实现** (三模块统一协调模式) **[强制 - 架构基础设施]**
- [x] **架构完整性检查100%通过** (防止Confirm模块类似的架构缺失) **[强制 - 新增验证]**
- [x] **双重命名约定100%合规** (三模块统一标准)
- [x] **零技术债务** (0 any类型, 0 TypeScript错误) - 三模块达成标准
- [x] **智能体构建框架协议协调层性能基准100%达标** (三模块企业级性能)
- [x] **AI功能边界100%合规** (不包含AI决策算法) - 三模块统一边界
- [x] **协议组合支持100%实现** (三模块可组合架构验证)

### **🎯 三模块成功标准对比验证**
```markdown
Context模块标准: Schema驱动 + 14个功能域 + 模块级质量门禁
Plan模块标准: GLFB循环 + 5大协调器 + 8个预留接口 + 客观验证
Confirm模块标准: 问题模式识别 + 批量修复 + 73%→100%提升 + 企业级协调

{Module}模块目标: 融合三模块成功经验 + {特色}协调器特色 + 100%完美质量
```

**🎉 完成TDD阶段后，模块达到三模块验证的智能体构建框架协议标准**

---

**文档版本**: v3.0.0 - **基于三模块成功经验的统一模板**
**创建时间**: {日期}
**更新时间**: 2025-08-19 ← **三模块成功经验整合日期**
**架构澄清**: 明确MPLP v1.0是智能体构建框架协议，AI功能属于L4 Agent层
**基于经验**: Context模块Schema驱动 + Plan模块GLFB循环 + Confirm模块问题模式识别
**成功验证**: 三模块100%完美质量标准的可复制性和有效性
**下一步**: 完成TDD后执行 `{module}-BDD-refactor-plan.md`
