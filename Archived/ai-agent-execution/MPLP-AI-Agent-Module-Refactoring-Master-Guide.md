# MPLP AI Agent Module Rewrite Master Guide v2.0

## 📋 **AI Agent执行总览**

**目标**: 基于Schema从零开始完整重写MPLP模块到统一企业级标准
**项目状态**: MPLP v1.0重写项目 - 6/10模块已完成（Context, Plan, Role, Confirm, Trace, Extension），4/10模块待重写
**Schema位置**: src/schemas/mplp-*.json (JSON Schema Draft-07)
**测试位置**: tests/modules/[模块名]/
**测试标准**: tests/templates/unified-test-standard.md (统一测试标准模板)
**方法论**: SCTM+GLFB+ITCM + Schema驱动开发 + 统一测试标准
**质量标准**: 零技术债务 + 95%+测试覆盖率 + 完整文档套件 + 统一测试架构（企业级标准）
**执行模式**: 7阶段渐进式验证执行
**CRITICAL**: 所有10个模块必须使用IDENTICAL架构模式、横切关注点集成方式和测试标准
**基准模块**: Context, Plan, Role, Confirm, Trace, Extension模块（已达到企业级标准和统一测试标准）

## 🎯 **AI Agent强制执行流程**

### **执行前准备 (MANDATORY)**
```markdown
在开始任何重构任务前，AI Agent必须：

1. **理解项目重写状态**: 确认MPLP v1.0重写项目状态（6/10模块已完成）
2. **验证Schema文件**: 确认目标模块的Schema文件存在于src/schemas/mplp-*.json
3. **验证测试目录**: 确认tests/目录结构存在
4. **验证统一测试标准**: 确认tests/templates/unified-test-standard.md存在并理解内容
5. 接收用户指定的目标模块名称
6. 确认目标质量标准（企业级标准：95%+测试覆盖率+零技术债务+完整文档+统一测试架构）
7. 读取本文档的完整执行流程
8. 按照7个阶段的顺序执行，不得跳过任何阶段
9. 每个阶段完成后必须向用户汇报结果和质量验证状态
10. **参考基准模块**: 以Context, Plan, Role, Confirm, Trace, Extension模块为标准，确保一致性
```

## 🔧 **阶段1: 强制文档阅读和架构理解**

### **Step 1.1: 强制阅读文档清单**
```markdown
⚠️ CRITICAL: 必须先阅读 docs/ai-agent-execution/MPLP-Document-Reference-Mapping.md
了解完整的文档引用体系和阅读顺序！

AI Agent必须按以下顺序阅读文档：

=== 第一轮：架构理解文档 ===
□ 1. .augment/rules/MPLP-Core-Development-Rules.mdc ⭐ CRITICAL
   目的：理解MPLP v1.0项目现状、核心原则、技术标准

□ 2. docs/architecture/MPLP-Protocol-Specification-v1.0.md ⭐ CRITICAL
   目的：理解MPLP整体架构、L1-L3分层、10个模块定位

□ 3. .augment/rules/MPLP-Architecture-Core-Principles.mdc ⭐ CRITICAL
   目的：理解架构设计原则、模块协调机制、预留接口模式

□ 4. src/schemas/core-modules/index.ts ⭐ CRITICAL
   目的：理解模块分类、状态信息、特色功能描述

□ 5. src/schemas/core-modules/mplp-[目标模块].json ⭐ CRITICAL
   目的：理解目标模块的完整Schema定义和字段结构（项目重写后的实际Schema文件）

=== 第二轮：技术实施文档 ===
□ 6. .augment/rules/MPLP-Dual-Naming-Convention.mdc ⭐ MANDATORY
   目的：理解双重命名约定的具体要求和映射规则

□ 7. docs/implementation/MPLP-Mapper-Implementation-Templates.md ⭐ CRITICAL
   目的：掌握Mapper实现的完整模板和双重命名约定

□ 8. src/schemas/cross-cutting-concerns/index.ts ⭐ CRITICAL
   目的：理解横切关注点分类、L1位置、L3管理器映射

□ 9. src/schemas/cross-cutting-concerns/ (所有9个文件) ⭐ CRITICAL
   目的：理解9个横切关注点的Schema定义和集成要求

□ 10. docs/implementation/MPLP-Cross-Cutting-Concerns-Integration-Guide.md ⭐ CRITICAL
    目的：掌握9个横切关注点的L1-L3集成架构

□ 11. docs/implementation/MPLP-Reserved-Interface-Implementation-Templates.md ⭐ CRITICAL
    目的：掌握预留接口模式和Interface-First实现

=== 第三轮：质量保证文档 ===
□ 12. .augment/rules/MPLP-TypeScript-Standards.mdc ⭐ MANDATORY
    目的：理解TypeScript质量标准和零技术债务政策

□ 13. .augment/rules/MPLP-Module-Standardization.mdc ⭐ MANDATORY
    目的：理解模块标准化要求和合规检查

□ 14. docs/implementation/MPLP-Module-Refactoring-Step-by-Step-Guide.md ⭐ CRITICAL
    目的：掌握10步重构流程和质量标准

□ 15. docs/implementation/MPLP-Quality-Assurance-and-Validation-Framework.md ⭐ CRITICAL
    目的：掌握4层验证系统和质量门禁要求

□ 16. .augment/rules/MPLP-Critical-Thinking-Methodology.mdc ⭐ CRITICAL
    目的：掌握SCTM+GLFB+ITCM方法论和成功模式

□ 17. tests/templates/unified-test-standard.md ⭐ CRITICAL
    目的：掌握统一测试标准和测试架构要求（基于6个模块测试统一经验）
```

### **Step 1.2: 架构理解验证 (MANDATORY)**
```markdown
阅读完成后，AI Agent必须回答以下问题：

=== 基础架构理解验证 ===
1. MPLP v1.0的核心定位是什么？L1-L3架构层次的职责分别是什么？
   (来源：import-all.mdc + 协议规范)

2. 预留接口模式的核心原理是什么？CoreOrchestrator的作用是什么？
   (来源：架构核心原则)

3. 零技术债务政策的具体要求是什么？双重命名约定的规则是什么？
   (来源：TypeScript标准 + 命名约定规则)

=== 目标模块理解验证 ===
4. 目标模块在MPLP生态系统中的独特定位和核心价值是什么？
   (来源：模块索引 + 协议规范)

5. 目标模块的Schema包含多少个主要字段？关键字段有哪些？
   (来源：目标模块Schema文件)

6. 目标模块需要集成哪些横切关注点？最关键的是哪3个？
   (来源：横切关注点索引 + 集成指导)

=== 实施方法理解验证 ===
7. 目标模块应该实现多少个预留接口？参考哪个成功模块？

=== 统一测试标准理解验证 === (基于6个模块测试统一经验)
8. 统一测试标准要求的强制目录结构是什么？必须包含哪些测试层？
   (来源：tests/templates/unified-test-standard.md)

9. 测试数据工厂必须实现哪些方法？测试命名约定是什么？
   (来源：统一测试标准模板)

10. 各层测试的覆盖率要求分别是多少？测试通过率要求是什么？
    (来源：统一测试标准模板)
   (来源：接口模板 + 成功模式)

8. 目标模块的双重命名映射关系举例（至少5个字段）？
   (来源：Mapper模板 + 命名约定)

9. 目标模块应该达到什么质量标准？具体指标是什么？
   (来源：质量保证框架)

10. SCTM+GLFB+ITCM方法论的核心要素是什么？如何应用？
    (来源：批判性思维方法论)

⚠️ 所有问题必须正确回答，用户确认后才能进入阶段2。
```

## 🏗️ **阶段2: 完整模块结构创建和Schema集成**

### **Step 2.1: 项目结构验证和创建**
```markdown
基于项目全部重写的现状，首先验证和创建完整结构：

1. **验证Schema文件存在**:
   ```bash
   ls -la src/schemas/core-modules/mplp-[目标模块].json
   ls -la src/schemas/cross-cutting-concerns/
   ```

2. **创建完整模块目录结构**:
   ```bash
   mkdir -p src/modules/[目标模块]/{api/{controllers,dto,mappers,websocket},application/{services,commands,queries},domain/{entities,repositories,services,factories},infrastructure/{repositories,adapters}}
   ```

3. **创建统一测试目录结构** (基于tests/templates/unified-test-standard.md):
   ```bash
   mkdir -p tests/modules/[目标模块]/{unit,functional,integration,e2e,performance,factories}
   ```

4. **创建测试工厂文件**:
   ```bash
   touch tests/modules/[目标模块]/factories/[目标模块]-test.factory.ts
   touch tests/modules/[目标模块]/README.md
   ```
```

### **Step 2.2: 字段映射表生成**
```markdown
基于src/schemas/core-modules/mplp-[目标模块].json的实际Schema，生成完整的字段映射表：

创建文件：docs/modules/[目标模块]-field-mapping.md

内容格式：
| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型 | 必需 | 描述 |
|-------------------------|---------------------------|------|------|------|
| [module]_id             | [module]Id                | UUID | ✅   | 模块唯一标识 |
| created_at              | createdAt                 | Date | ✅   | 创建时间 |
| ... (所有字段) | ... | ... | ... | ... |

必须包含：
- 所有基础协议字段
- 所有跨模块协调字段
- 所有9个横切关注点字段
- 所有模块特定字段
```

### **Step 2.3: 完整Mapper类实现**
```markdown
基于实际Schema文件和 docs/implementation/MPLP-Mapper-Implementation-Templates.md 模板：

文件位置：src/modules/[目标模块]/api/mappers/[目标模块].mapper.ts

**CRITICAL**: 基于src/schemas/core-modules/mplp-[目标模块].json的实际字段结构实现

必须实现的方法：
□ [Module]Schema interface (snake_case) - 基于实际Schema文件
□ [Module]EntityData interface (camelCase) - 基于实际Schema字段映射
□ static toSchema(entity: [Module]EntityData): [Module]Schema
□ static fromSchema(schema: [Module]Schema): [Module]EntityData
□ static validateSchema(data: unknown): data is [Module]Schema
□ static toSchemaArray() 和 fromSchemaArray() 批量方法
□ 所有9个横切关注点的映射方法：
  - mapSecurityContextToSchema/FromSchema
  - mapPerformanceMetricsToSchema/FromSchema
  - mapEventBusToSchema/FromSchema
  - mapErrorHandlingToSchema/FromSchema
  - mapCoordinationToSchema/FromSchema
  - mapOrchestrationToSchema/FromSchema
  - mapStateSyncToSchema/FromSchema
  - mapTransactionToSchema/FromSchema
  - mapProtocolVersionToSchema/FromSchema

质量验证：
npm run typecheck        # 必须0错误
npm run lint             # 必须0警告
npm run validate:mapping # 必须100%一致性
```

### **Step 2.4: 统一测试工厂实现** (基于6个模块测试统一经验)
```markdown
基于 tests/templates/unified-test-standard.md 和已完成模块的测试工厂模式：

文件位置：tests/modules/[目标模块]/factories/[目标模块]-test.factory.ts

**必须实现的方法**：
□ static create{Module}Entity(overrides?: Partial<{Module}EntityData>): {Module}Entity
□ static create{Module}Schema(overrides?: Partial<any>): {Module}Schema
□ static create{Module}EntityArray(count: number = 3): {Module}Entity[]
□ static createPerformanceTestData(count: number = 1000): {Module}Entity[]
□ static createBoundaryTestData(): { minimal{Module}, maximal{Module} }

**测试数据标准**：
□ 基于实际Schema结构生成测试数据
□ 支持双重命名约定 (Schema: snake_case, TypeScript: camelCase)
□ 包含边界条件测试数据 (最小值、最大值、特殊字符)
□ 支持性能测试大量数据生成
□ 包含错误场景测试数据

**参考模板**：
- Context模块: tests/modules/context/factories/context-test.factory.ts
- Plan模块: tests/modules/plan/factories/plan-test.factory.ts
- Role模块: tests/modules/role/factories/role-test.factory.ts

质量验证：
npm run test -- tests/modules/[目标模块]/factories/
```

## 🔄 **阶段3: 横切关注点集成**

### **Step 3.1: 统一L3管理器注入模式**
```markdown
基于 docs/implementation/MPLP-Cross-Cutting-Concerns-Integration-Guide.md：

更新文件：src/modules/[目标模块]/protocol/[目标模块].protocol.ts

**CRITICAL**: ALL 10 modules use IDENTICAL L3 manager injection pattern for consistency

必须注入的9个L3管理器（与其他6个已完成模块完全相同）：
□ private readonly securityManager: MLPPSecurityManager
□ private readonly performanceMonitor: MLPPPerformanceMonitor
□ private readonly eventBusManager: MLPPEventBusManager
□ private readonly errorHandler: MLPPErrorHandler
□ private readonly coordinationManager: MLPPCoordinationManager
□ private readonly orchestrationManager: MLPPOrchestrationManager
□ private readonly stateSyncManager: MLPPStateSyncManager
□ private readonly transactionManager: MLPPTransactionManager
□ private readonly protocolVersionManager: MLPPProtocolVersionManager

构造函数模式：
export class [Module]Protocol extends MLPPProtocolBase implements IMLPPProtocol {
  constructor(
    private readonly [module]ManagementService: [Module]ManagementService,
    // L3 Cross-Cutting Managers (from src/core/protocols/cross-cutting-concerns.ts)
    private readonly securityManager: MLPPSecurityManager,
    private readonly performanceMonitor: MLPPPerformanceMonitor,
    private readonly eventBusManager: MLPPEventBusManager,
    private readonly errorHandler: MLPPErrorHandler,
    private readonly coordinationManager: MLPPCoordinationManager,
    private readonly orchestrationManager: MLPPOrchestrationManager,
    private readonly stateSyncManager: MLPPStateSyncManager,
    private readonly transactionManager: MLPPTransactionManager,
    private readonly protocolVersionManager: MLPPProtocolVersionManager
  ) {
    super();
  }
}
```

### **Step 3.2: 统一标准化调用模式**
```markdown
在executeOperation方法中使用与其他6个已完成模块IDENTICAL的调用模式：

**CRITICAL**: 使用已验证的标准调用顺序，与Context/Plan/Confirm/Trace/Role/Extension模块保持完全一致

标准调用模式：
□ 1. 安全验证：await this.securityManager.validateRequest(request)
□ 2. 性能监控开始：await this.performanceMonitor.startOperation(operationName)
□ 3. 事务管理：await this.transactionManager.beginTransaction(transactionId)
□ 4. 业务逻辑执行：await this.[module]ManagementService.executeOperation(request)
□ 5. 状态同步：await this.stateSyncManager.syncState(stateData)
□ 6. 事件发布：await this.eventBusManager.publishEvent(eventData)
□ 7. 事务提交：await this.transactionManager.commitTransaction(transactionId)
□ 8. 性能监控结束：await this.performanceMonitor.endOperation(operationName)
□ 9. 错误处理：catch块中使用this.errorHandler.handleError(error)

实现示例：
```typescript
async executeOperation(request: MLPPRequest): Promise<MLPPResponse> {
  try {
    // 1. 安全验证
    await this.securityManager.validateRequest(request);

    // 2. 性能监控开始
    await this.performanceMonitor.startOperation(request.operation);

    // 3. 事务管理
    const transactionId = await this.transactionManager.beginTransaction();

    // 4. 业务逻辑执行
    const result = await this.[module]ManagementService.executeOperation(request);

    // 5. 状态同步
    await this.stateSyncManager.syncState(result);

    // 6. 事件发布
    await this.eventBusManager.publishEvent({
      type: `${request.operation}_completed`,
      data: result
    });

    // 7. 事务提交
    await this.transactionManager.commitTransaction(transactionId);

    // 8. 性能监控结束
    await this.performanceMonitor.endOperation(request.operation);

    return { success: true, data: result };
  } catch (error) {
    // 9. 错误处理
    await this.errorHandler.handleError(error);
    throw error;
  }
}
```

质量验证：
npm run test:cross-cutting-integration:[目标模块]
```

## 🎭 **阶段4: 预留接口实现**

### **Step 4.1: 预留接口数量确定**
```markdown
基于模块类型确定预留接口数量：

已完成重写模块（Context, Plan）：8-10个预留接口
待重写模块（Confirm, Trace, Role, Extension）：8-10个预留接口
待重写模块（Core, Collab, Dialog, Network）：8-10个预留接口

参考企业级成功模式：
- Plan模块：8个MPLP预留接口（lines 851-989）- 企业级标准
- Context模块：完整的协议接口实现 - 企业级标准
```

### **Step 4.2: 预留接口实现**
```markdown
基于 docs/implementation/MPLP-Reserved-Interface-Implementation-Templates.md：

文件位置：src/modules/[目标模块]/application/services/[目标模块]-management.service.ts

必须实现的接口类别：
□ 核心协调接口（4个深度集成模块）：
  - validate[Module]CoordinationPermission(_userId, _[module]Id, _context)
  - get[Module]CoordinationContext(_contextId, _[module]Type)  
  - record[Module]CoordinationMetrics(_[module]Id, _metrics)
  - manage[Module]ExtensionCoordination(_[module]Id, _extensions)

□ 扩展协调接口（4个额外模块）：
  - request[Module]ChangeCoordination(_[module]Id, _change)
  - coordinateCollab[Module]Management(_collabId, _[module]Config)
  - enableDialogDriven[Module]Coordination(_dialogId, _participants)
  - coordinate[Module]AcrossNetwork(_networkId, _[module]Config)

□ 专业化协调接口（模块特定）：
  - handle[Module]SpecificCoordination(_specificParam, _specificConfig)

强制要求：
□ 所有参数使用下划线前缀（_param）
□ 所有方法为private（等待激活）
□ 所有方法包含TODO注释等待CoreOrchestrator激活
□ 所有方法集成适当的横切关注点
□ 所有方法提供临时实现返回成功
```

## 📊 **阶段5: 协议接口实现**

### **Step 5.1: IMLPPProtocol接口实现**
```markdown
必须实现的方法：
□ async executeOperation(request: MLPPRequest): Promise<MLPPResponse>
□ getProtocolMetadata(): ProtocolMetadata  
□ async healthCheck(): Promise<HealthStatus>

executeOperation必须支持的操作：
□ create_[module]
□ update_[module]
□ get_[module]
□ delete_[module]
□ list_[module]s

getProtocolMetadata必须包含：
□ moduleName: '[module]'
□ version: '1.0.0'
□ supportedOperations: [操作列表]
□ capabilities: [能力列表]
□ crossCuttingConcerns: [9个关注点列表]
□ dependencies: {required: [], optional: []}
□ slaGuarantees: {responseTime, availability, throughput}
```

### **Step 5.2: 协议工厂实现**
```markdown
创建文件：src/modules/[目标模块]/protocol/[目标模块]-protocol.factory.ts

必须实现：
□ 依赖注入配置
□ 横切关注点管理器注入
□ 协议实例创建
□ 健康检查配置
```

## 🔍 **阶段6: 质量验证执行**

### **Step 6.1: 统一测试标准验证执行** (基于6个模块测试统一经验)
```markdown
基于 tests/templates/unified-test-standard.md 和 docs/implementation/MPLP-Quality-Assurance-and-Validation-Framework.md：

**统一测试架构验证**：
□ 测试目录结构完整性：unit/functional/integration/e2e/performance/factories
□ 核心测试文件(7个)：service/controller/entity/mapper/repository/dto/performance
□ 支持文件(2个)：test-factory + README
□ 测试工厂标准化：create{Module}Entity, create{Module}Schema方法

**分层测试执行**：
Tier 1: Unit Testing (单元测试覆盖率≥90%)
□ npm run test -- tests/modules/[目标模块]/unit/
□ 验证：service/controller/entity/mapper/repository/dto测试

Tier 2: Integration Testing (集成测试覆盖率≥80%)
□ npm run test -- tests/modules/[目标模块]/integration/
□ 验证：模块集成测试

Tier 3: Functional Testing (功能测试覆盖率≥85%)
□ npm run test -- tests/modules/[目标模块]/functional/
□ 验证：功能集成测试

Tier 4: E2E & Performance Testing
□ npm run test -- tests/modules/[目标模块]/e2e/
□ npm run test -- tests/modules/[目标模块]/performance/
□ 验证：端到端测试和性能基准测试
```

### **Step 6.2: 质量门禁验证**
```markdown
所有质量门禁必须通过：

□ TypeScript编译：0错误 (npm run typecheck)
□ ESLint检查：0警告 (npm run lint)
□ 统一测试标准合规：100% (基于tests/templates/unified-test-standard.md)
□ 测试覆盖率：单元≥90%, 功能≥85%, 集成≥80%, 整体≥85%
□ 测试通过率：100%通过率 (MANDATORY)
□ Schema映射一致性：100% (npm run validate:mapping)
□ 安全合规：100% (npm run validate:security)
□ 性能SLA：达标 (npm run validate:performance)
□ 横切关注点集成：100%
□ 预留接口完整性：100%
```

### **Step 6.3: 企业级完整性强制验证（新增）**
```markdown
⚠️ CRITICAL: 必须通过与Context模块的完整性对比验证

**架构组件完整性检查**：
□ Domain Entities存在：src/modules/[模块]/domain/entities/[模块].entity.ts
□ Domain Services存在：src/modules/[模块]/domain/services/
□ API Controllers存在：src/modules/[模块]/api/controllers/[模块].controller.ts
□ API DTOs存在：src/modules/[模块]/api/dto/[模块].dto.ts
□ module.ts存在：src/modules/[模块]/module.ts
□ 8文件文档套件存在：docs/modules/[模块]/ (8个.md文件)

**与企业级标准对比**：
□ 目录结构与已完成6个模块一致
□ 文档套件与已完成6个模块一致
□ 测试架构与统一测试标准一致
□ 测试覆盖率≥已完成模块标准
□ 代码质量≥已完成模块标准

**验证命令**：
```bash
# 架构完整性验证
bash scripts/validate-module-completeness.sh [模块名] context

# 企业级标准对比
bash scripts/compare-with-enterprise-standard.sh [模块名] context
```

**验证失败处理**：
如果任何检查失败，必须补全缺失组件后重新验证，直到100%通过。
```

## 🎉 **阶段7: 完成报告和文档更新**

### **Step 7.1: 重构完成报告**
```markdown
AI Agent必须提供完整的重构完成报告：

1. 架构合规性确认：
□ 模块实现IMLPPProtocol接口 ✅
□ 模块继承MLPPProtocolBase类 ✅  
□ 所有9个横切关注点集成 ✅
□ 预留接口模式实现 ✅
□ Schema驱动开发遵循 ✅
□ 双重命名约定执行 ✅

2. 质量标准达成：
□ TypeScript编译：0错误 ✅
□ ESLint检查：0警告 ✅
□ 测试覆盖率：[具体百分比] ✅
□ 映射一致性：100% ✅
□ 安全合规：100% ✅
□ 性能SLA：达标 ✅

3. 功能完整性：
□ 所有模块特定业务逻辑保留 ✅
□ 跨模块协调能力添加 ✅
□ 预留接口为CoreOrchestrator激活准备 ✅
□ 企业级错误处理和恢复 ✅
□ 全面监控和可观测性 ✅

4. 达成质量标准：[企业级重写标准 - 基于Context和Plan模块]
```

### **Step 7.2: 文档更新**
```markdown
必须更新的文档：
□ 模块README.md更新协议接口说明
□ API文档更新横切关注点集成
□ 字段映射表文档完整
□ 实施经验和问题记录
```

---

**执行指南版本**: 1.0.0
**适用范围**: 所有MPLP v1.0模块重构（Context, Plan, Confirm, Trace, Role, Extension, Core, Collab, Dialog, Network）
**强制执行**: 7阶段渐进式验证，不得跳过任何阶段
**CRITICAL**: 确保所有10个模块使用IDENTICAL架构模式和集成方式，保持完全一致性
