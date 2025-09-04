# AI Agent快速参考卡片

## 🚨 **执行前必读检查清单**

### **📚 强制阅读顺序**
```
□ 00-AI-Agent-Execution-Control-Guide.md (本控制指南)
□ 01-MPLP-Refactoring-Overview.md (项目概述)
□ 02-MPLP-Unified-Architecture-Standard.md (架构标准)
□ 03-MPLP-Unified-Quality-Standard.md (质量标准)
□ 对应模块的重构指南 (05-13中的具体模块)
```

### **🔒 核心约束 (违反即失败)**
```
❌ 绝对禁止：
- 使用any类型 (ZERO TOLERANCE)
- TypeScript编译错误 (必须0错误)
- ESLint错误和警告 (必须0个)
- 违反双重命名约定 (Schema:snake_case ↔ TS:camelCase)
- 跳过测试或降低测试标准 (覆盖率必须≥95%)
- 在L1-L3层实现AI决策算法 (协议边界违规)
```

## 🏗️ **架构标准速查**

### **4层DDD架构 (强制)**
```
src/modules/{module}/
├── api/           # API层：controllers, dto, mappers
├── application/   # 应用层：services
├── domain/        # 领域层：entities, repositories接口
└── infrastructure/ # 基础设施层：adapters, factories, protocols, repositories实现
```

### **3个标准企业级服务 (每个模块)**
```
1. {Module}ManagementService - 核心管理服务
2. {Module}AnalyticsService - 分析服务  
3. {Module}SecurityService - 安全服务
```

### **IMLPPProtocol接口 (强制实现)**
```typescript
export class {Module}Protocol implements IMLPPProtocol {
  constructor(
    // 3个业务服务
    private readonly managementService: {Module}ManagementService,
    private readonly analyticsService: {Module}AnalyticsService,
    private readonly securityService: {Module}SecurityService,
    // 9个横切关注点管理器 (强制集成)
    private readonly securityManager: SecurityManager,
    private readonly performanceMonitor: PerformanceMonitor,
    private readonly eventBusManager: EventBusManager,
    private readonly errorHandler: ErrorHandler,
    private readonly coordinationManager: CoordinationManager,
    private readonly orchestrationManager: OrchestrationManager,
    private readonly stateSyncManager: StateSyncManager,
    private readonly transactionManager: TransactionManager,
    private readonly protocolVersionManager: ProtocolVersionManager
  ) {}

  async processRequest(request: MLPPRequest): Promise<MLPPResponse> {
    // 标准实现模式
  }
}
```

## 🧪 **质量标准速查**

### **测试要求 (强制)**
```
✅ 必须达到：
- 单元测试覆盖率: ≥95%
- 集成测试覆盖率: ≥90%
- 测试通过率: 100% (零容忍失败)
- 企业级服务测试: 100%覆盖

📝 测试命名规范：
- describe: '{ModuleName}模块{功能域}测试'
- it: '应该{预期行为}当{条件}时'
```

### **代码质量要求 (强制)**
```
✅ 必须达到：
- TypeScript编译: 0错误
- ESLint检查: 0错误, 0警告
- 代码复杂度: <10
- any类型使用: 0个 (ZERO TOLERANCE)
```

## 🔄 **标准执行流程**

### **Phase 1: 信息收集 (必须)**
```
1. 使用codebase-retrieval分析现有模块
2. 识别重构范围和影响
3. 制定详细重构计划
4. 评估风险和制定缓解措施
```

### **Phase 2: 架构设计 (必须)**
```
1. 按统一架构标准设计新架构
2. 设计3个标准企业级服务
3. 实现IMLPPProtocol接口
4. 集成9个横切关注点管理器
```

### **Phase 3: 实现测试 (必须)**
```
1. 严格按设计实现代码
2. 编写完整测试套件 (覆盖率≥95%)
3. 执行所有质量门禁检查
4. 确保100%测试通过
```

### **Phase 4: 验收交付 (必须)**
```
1. 验证功能正确性和性能达标
2. 确保架构合规性100%
3. 更新文档和创建迁移指南
4. 生成验收报告
```

## 📊 **各模块重构重点**

### **Context模块 (05-Context-Module-Refactoring-Guide.md)**
```
🎯 重构目标: 17个服务 → 3个核心服务
📉 复杂度降低: 70%
⚡ 性能提升: 30%
🔧 重点: 服务边界重新定义，数据管理优化
```

### **Plan模块 (06-Plan-Module-Refactoring-Guide.md)**
```
🎯 重构目标: AI算法外置到L4应用层
📏 协议边界: 清晰化100%
🔗 集成简化: 50%
🔧 重点: 协议层职责重新定义，AI服务适配器
```

### **Role模块 (07-Role-Module-Refactoring-Guide.md)**
```
🎯 重构目标: RBAC简化 + 统一安全框架
🔒 安全统一: 100%
⚡ 性能提升: 40%
🔧 重点: 跨模块安全集成，权限管理简化
```

### **Network模块 (08-Network-Module-Standardization-Guide.md)**
```
🎯 重构目标: 标准化验证和调整
✅ 已达标准: 企业级质量
🔧 重点: 架构对齐，接口标准化
```

### **其他模块 (09-13)**
```
Confirm: 审批流程简化 (复杂度↓40%, 性能↑25%)
Trace: 监控系统优化 (数据处理↑50%, 查询↑60%)
Extension: 扩展管理简化 (安装性能↑40%, 管理↑30%)
Dialog: 对话系统优化 (响应时间↑45%, 并发↑60%)
Collab: 协作管理简化 (决策响应↑50%, 资源分配↑45%)
```

## 🚨 **常见错误和避免方法**

### **架构错误**
```
❌ 错误: 不按4层DDD架构组织代码
✅ 正确: 严格按照api/application/domain/infrastructure组织

❌ 错误: 不实现IMLPPProtocol接口
✅ 正确: 每个模块必须实现标准协议接口

❌ 错误: 忽略横切关注点集成
✅ 正确: 必须集成全部9个管理器
```

### **代码质量错误**
```
❌ 错误: 使用any类型
✅ 正确: 使用具体类型定义，绝不使用any

❌ 错误: 忽略TypeScript编译错误
✅ 正确: 必须解决所有编译错误

❌ 错误: 违反双重命名约定
✅ 正确: Schema用snake_case，TypeScript用camelCase
```

### **测试错误**
```
❌ 错误: 测试覆盖率不足
✅ 正确: 必须达到≥95%覆盖率

❌ 错误: 有失败的测试
✅ 正确: 必须100%测试通过

❌ 错误: 测试命名不规范
✅ 正确: 使用标准命名格式
```

## 🎯 **成功验收标准**

### **最终检查清单**
```
架构验收:
□ 4层DDD架构100%符合
□ IMLPPProtocol接口100%实现
□ 9个横切关注点100%集成
□ 3个企业级服务100%实现

质量验收:
□ 测试覆盖率≥95%
□ 测试通过率100%
□ TypeScript编译0错误
□ ESLint检查0错误和警告

性能验收:
□ 性能指标达到预期目标
□ 资源使用优化达标
□ 响应时间改进达标
□ 并发处理能力提升达标

文档验收:
□ API文档完整准确
□ 使用指南清晰易懂
□ 示例代码可用有效
□ 迁移指南完整可行
```

## 🆘 **紧急情况处理**

### **遇到问题时的处理顺序**
```
1. 🔍 重新阅读相关文档和约束
2. 🔎 使用codebase-retrieval深入分析
3. 📋 制定多个解决方案并评估
4. ⚖️ 按约束优先级选择方案
5. 🧪 充分测试和验证
6. 📝 记录决策过程和理由
```

### **约束冲突时的优先级**
```
1. 项目核心约束 (架构、质量、协议边界)
2. 技术标准和最佳实践
3. 性能和用户体验
4. 开发效率和便利性
```

---

**快速参考版本**: v1.0  
**对应控制指南**: 00-AI-Agent-Execution-Control-Guide.md  
**使用方法**: 执行过程中随时查阅，确保不偏离标准
