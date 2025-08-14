# Plan模块 TDD重构任务计划

## 📋 **重构概述**

**模块**: Plan (任务规划协调)  
**重构类型**: TDD (Test-Driven Development)  
**目标**: 达到L4智能体操作系统标准  
**基于规则**: `.augment/rules/import-all.mdc`, `.augment/rules/testing-strategy-new.mdc`  
**完成标准**: Extension模块L4标准 (54功能测试100%通过率, 8个MPLP模块预留接口)

## 🎯 **基于修正定位的L4功能分析**

### **Plan模块核心定位**
基于`plan-MPLP-positioning-analysis.md`系统性批判性思维分析：

**L4架构定位**: L4智能体操作系统协调层(L2)的专业化组件  
**核心特色**: 任务规划协调器，复杂任务分解和依赖关系管理  
**与CoreOrchestrator关系**: 指令-响应协作，提供规划协调能力  
**L4标准**: 规划协调专业化 + 企业级任务治理 + 智能化依赖管理

#### **1. 任务规划协调引擎 (核心特色)**
- [ ] 支持1000+复杂任务规划协调
- [ ] 任务分解智能算法
- [ ] 目标优先级评估和匹配系统
- [ ] 规划性能监控和分析引擎
- [ ] 规划策略自适应优化机制

#### **2. 依赖关系管理协调系统 (核心特色)**
- [ ] 多种依赖类型协调 (finish_to_start/start_to_start/finish_to_finish/start_to_finish)
- [ ] 依赖冲突检测和解决协调 (≥98%准确率)
- [ ] 依赖链优化和管理协调 (≥35%效果)
- [ ] 依赖变更影响分析协调 (<50ms响应)
- [ ] 依赖关系图管理系统

#### **3. 执行策略优化协调系统 (L4标准)**
- [ ] 多种优化策略协调 (time_optimal/resource_optimal/cost_optimal/quality_optimal/balanced)
- [ ] 资源约束管理和优化协调 (≥25%利用率提升)
- [ ] 时间线规划和调整协调 (<100ms响应)
- [ ] 执行效率评估和改进协调 (≥30%优化效果)
- [ ] 执行策略优化引擎

#### **4. 风险评估协调管理 (L4智能化)**
- [ ] 多维度风险评估协调 (时间/资源/质量/技术风险)
- [ ] 风险缓解策略生成协调 (≥90%成功率)
- [ ] 风险监控和预警协调 (<30ms响应)
- [ ] 风险应对措施执行协调 (≥95%识别准确率)
- [ ] 风险评估协调引擎

#### **5. 失败恢复协调系统**
- [ ] 多种恢复策略协调 (retry/rollback/skip/manual_intervention)
- [ ] 失败影响分析协调 (<20ms检测响应)
- [ ] 恢复计划生成协调 (≥92%成功率)
- [ ] 恢复执行监控协调 (<200ms执行时间)
- [ ] 失败恢复协调引擎

#### **6. MPLP规划协调器集成**
- [ ] 4个核心模块规划协调集成 (Context, Role, Trace, Extension)
- [ ] 4个扩展模块规划协调集成 (Confirm, Collab, Dialog, Network)
- [ ] CoreOrchestrator指令-响应协作支持 (10种协调场景)
- [ ] 规划协调器特色接口实现 (体现协调专业化)
- [ ] 规划协调事件总线和状态反馈

## 🔍 **当前代码分析**

### **现有实现状态**
基于 `src/modules/plan/` 分析：

#### **✅ 已实现组件**
- [x] Schema定义 (`mplp-plan.json`) - 完整的规划协议定义 (估算600+行)
- [x] TypeScript类型 (`types.ts`) - 完整类型定义
- [x] 领域实体 (`plan.entity.ts`) - 1028行核心业务逻辑
- [x] DDD架构结构 - 完整的分层架构
- [x] 双重命名约定 - 已正确实现snake_case私有属性

#### **❌ 缺失组件 (TDD重构目标)**
- [ ] Mapper类 - Schema-TypeScript双重命名约定映射
- [ ] DTO类 - API数据传输对象
- [ ] Controller - API控制器
- [ ] Repository实现 - 数据持久化
- [ ] 应用服务 - 规划管理服务
- [ ] 模块适配器 - MPLP生态系统集成
- [ ] 预留接口 - CoreOrchestrator协调准备

#### **🚨 质量问题识别 (基于规划协调器特色)**
- [ ] 双重命名约定已正确实现 (entity中使用snake_case私有属性)
- [ ] 缺少Schema验证和映射函数
- [ ] **缺少任务规划协调引擎实现**
- [ ] **缺少依赖关系管理协调系统核心算法**
- [ ] **缺少执行策略优化协调系统功能**
- [ ] **缺少风险评估协调管理能力**
- [ ] **缺少失败恢复协调系统功能**
- [ ] 缺少MPLP规划协调器特色接口
- [ ] 缺少与CoreOrchestrator的协作机制
- [ ] 缺少完整的规划协调异常处理和恢复机制

## 📋 **TDD重构任务清单**

### **阶段1: 基础架构重构 (Day 1)**

#### **1.1 Schema-TypeScript映射层**
- [ ] **任务**: 创建 `PlanMapper` 类
  - [ ] 实现 `toSchema()` 方法 (camelCase → snake_case)
  - [ ] 实现 `fromSchema()` 方法 (snake_case → camelCase)
  - [ ] 实现 `validateSchema()` 方法
  - [ ] 实现批量转换方法 `toSchemaArray()`, `fromSchemaArray()`
  - [ ] **测试**: 100%映射一致性验证
  - [ ] **标准**: 遵循 `.augment/rules/dual-naming-convention.mdc`

#### **1.2 DTO层重构**
- [ ] **任务**: 创建完整的DTO类
  - [ ] `CreatePlanDto` - 创建规划请求DTO
  - [ ] `UpdatePlanDto` - 更新规划请求DTO
  - [ ] `PlanResponseDto` - 规划响应DTO
  - [ ] `PlanTaskDto` - 规划任务DTO
  - [ ] **测试**: DTO验证和转换测试
  - [ ] **标准**: 严格类型安全，零any类型

#### **1.3 领域实体增强**
- [ ] **任务**: 增强 `Plan` 实体功能
  - [ ] 验证现有双重命名约定实现
  - [ ] 添加Schema映射支持
  - [ ] 增强业务逻辑验证
  - [ ] 添加企业级功能方法
  - [ ] **测试**: 实体业务逻辑完整测试
  - [ ] **标准**: 100%业务规则覆盖

### **阶段2: 规划协调器核心重构 (Day 1-2)**

#### **2.1 任务规划协调引擎**
- [ ] **任务**: 实现 `TaskPlanningCoordinator`
  - [ ] 任务分解智能算法 (支持1000+复杂任务)
  - [ ] 目标优先级评估和匹配系统
  - [ ] 规划性能监控和分析引擎
  - [ ] 规划策略自适应优化机制
  - [ ] **测试**: 规划协调效率测试 (≥40%提升)
  - [ ] **标准**: 1000+任务规划协调支持

#### **2.2 依赖关系管理协调系统**
- [ ] **任务**: 实现 `DependencyManagementCoordinator`
  - [ ] 多种依赖类型协调 (finish_to_start/start_to_start/finish_to_finish/start_to_finish)
  - [ ] 依赖冲突检测和解决协调 (≥98%准确率)
  - [ ] 依赖链优化和管理协调 (≥35%效果)
  - [ ] 依赖变更影响分析协调 (<50ms响应)
  - [ ] **测试**: 依赖管理协调准确率测试 (≥98%)
  - [ ] **标准**: 依赖管理协调系统完整实现

#### **2.3 执行策略优化协调系统**
- [ ] **任务**: 实现 `ExecutionStrategyCoordinator`
  - [ ] 执行策略优化引擎 (≥30%优化效果)
  - [ ] 资源约束实时管理算法 (≥25%利用率提升)
  - [ ] 时间线动态调整系统 (<100ms响应)
  - [ ] 执行效率评估和优化机制
  - [ ] **测试**: 执行策略协调性能测试
  - [ ] **标准**: 执行策略协调系统完整实现

#### **2.4 MPLP规划协调器接口实现**
基于规划协调器特色，实现体现核心定位的预留接口：

**核心规划协调接口 (4个深度集成模块)**:
- [ ] `validatePlanCoordinationPermission(_userId, _planId, _coordinationContext)` - Role模块协调权限
- [ ] `getPlanCoordinationContext(_contextId, _planType)` - Context模块协调环境
- [ ] `recordPlanCoordinationMetrics(_planId, _metrics)` - Trace模块协调监控
- [ ] `managePlanExtensionCoordination(_planId, _extensions)` - Extension模块协调管理

**规划增强协调接口 (4个增强集成模块)**:
- [ ] `requestPlanChangeCoordination(_planId, _change)` - Confirm模块变更协调
- [ ] `coordinateCollabPlanManagement(_collabId, _planConfig)` - Collab模块协作协调
- [ ] `enableDialogDrivenPlanCoordination(_dialogId, _planParticipants)` - Dialog模块对话协调
- [ ] `coordinatePlanAcrossNetwork(_networkId, _planConfig)` - Network模块分布式协调

- [ ] **测试**: 规划协调器接口模拟测试 (重点验证协调特色)
- [ ] **标准**: 体现规划协调器定位，参数使用下划线前缀

### **阶段3: 规划智能分析和基础设施协调 (Day 2)**

#### **3.1 风险评估协调管理器**
- [ ] **任务**: 实现 `RiskAssessmentCoordinator`
  - [ ] 风险评估协调引擎 (≥95%识别准确率)
  - [ ] 风险缓解策略生成系统 (≥90%成功率)
  - [ ] 风险实时监控和预警机制 (<30ms响应)
  - [ ] 风险应对自动化执行系统
  - [ ] **测试**: 风险评估协调算法测试
  - [ ] **标准**: L4风险评估协调能力

#### **3.2 失败恢复协调系统**
- [ ] **任务**: 实现 `FailureRecoveryCoordinator`
  - [ ] 失败恢复协调引擎 (<20ms检测响应)
  - [ ] 失败影响分析系统
  - [ ] 恢复计划自动生成机制 (≥92%成功率)
  - [ ] 恢复执行实时监控系统 (<200ms执行时间)
  - [ ] **测试**: 失败恢复协调完整性测试
  - [ ] **标准**: 企业级失败恢复协调标准

#### **3.3 高性能协调基础设施**
- [ ] **任务**: 实现企业级 `PlanRepository` 和 `PlanCoordinatorAdapter`
  - [ ] 高性能协调数据持久化 (支持1000+并发)
  - [ ] 协调状态智能缓存和查询优化
  - [ ] 协调事务管理和一致性保证
  - [ ] 规划协调器特色API设计
  - [ ] **测试**: 高并发协调性能测试
  - [ ] **标准**: 企业级协调性能和可靠性

#### **3.4 应用服务层重构**
- [ ] **任务**: 实现 `PlanManagementService`
  - [ ] 规划生命周期管理服务
  - [ ] 任务分解和依赖管理服务
  - [ ] 执行策略查询服务
  - [ ] 风险评估分析服务
  - [ ] **测试**: 应用服务完整单元测试
  - [ ] **标准**: 90%+代码覆盖率

## ✅ **TDD质量门禁**

### **强制质量检查**
每个TDD循环必须通过：

```bash
# TypeScript编译检查 (ZERO ERRORS)
npm run typecheck

# ESLint代码质量检查 (ZERO WARNINGS)  
npm run lint

# 单元测试 (100% PASS)
npm run test:unit:plan

# Schema映射一致性检查 (100% CONSISTENCY)
npm run validate:mapping:plan

# 双重命名约定检查 (100% COMPLIANCE)
npm run check:naming:plan
```

### **覆盖率要求**
- [ ] **单元测试覆盖率**: ≥75% (Extension模块标准)
- [ ] **核心业务逻辑覆盖率**: ≥90%
- [ ] **错误处理覆盖率**: ≥95%
- [ ] **边界条件覆盖率**: ≥85%

### **L4规划协调器性能基准**
- [ ] **任务规划协调**: <100ms (1000+任务)
- [ ] **依赖管理协调**: <50ms (依赖变更响应)
- [ ] **执行策略协调**: <100ms (策略调整)
- [ ] **风险评估协调**: <30ms (风险预警)
- [ ] **失败恢复协调**: <200ms (恢复执行)
- [ ] **协调系统可用性**: ≥99.9% (企业级SLA)
- [ ] **并发协调支持**: 1000+ (任务协调数量)
- [ ] **CoreOrchestrator协作**: <10ms (指令-响应延迟)

## 🚨 **风险控制**

### **技术风险**
- [ ] **风险**: 大规模任务协调复杂性
  - **缓解**: 使用分层协调和渐进扩容策略
- [ ] **风险**: 依赖关系算法复杂
  - **缓解**: 参考Extension模块成功模式，分步实现

### **质量风险**  
- [ ] **风险**: 测试覆盖率不达标
  - **缓解**: 每个功能先写测试，后写实现
- [ ] **风险**: 大规模规划性能不达标
  - **缓解**: 每个组件都包含性能测试和优化

## 📊 **完成标准**

### **TDD阶段完成标准 (规划协调器特色)**
- [x] 所有质量门禁100%通过
- [x] 单元测试覆盖率≥75%
- [x] **任务规划协调引擎100%实现** (支持1000+任务协调)
- [x] **依赖关系管理协调系统100%实现** (≥98%冲突检测准确率)
- [x] **执行策略优化协调系统100%实现** (≥30%优化效果)
- [x] **风险评估协调管理100%实现** (≥95%识别准确率)
- [x] **失败恢复协调系统100%实现** (≥92%恢复成功率)
- [x] 8个MPLP规划协调接口100%实现 (体现协调器特色)
- [x] 与CoreOrchestrator协作机制100%实现
- [x] 双重命名约定100%合规
- [x] 零技术债务 (0 any类型, 0 TypeScript错误)
- [x] L4智能体操作系统协调层性能基准100%达标

**完成TDD阶段后，进入BDD重构阶段**

---

**文档版本**: v1.0.0  
**创建时间**: 2025-08-12  
**基于规则**: MPLP v1.0开发规则 + Extension模块L4成功经验  
**下一步**: 完成TDD后执行 `plan-BDD-refactor-plan.md`
