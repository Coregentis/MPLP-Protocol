# Core模块重构指南

## 🎯 **重构目标和策略**

### **当前状态分析**
```markdown
✅ 优势分析：
- Core模块作为L3执行层的中央协调器，具有独特的架构地位
- Schema定义完整 (mplp-core.json)，包含工作流编排的核心数据结构
- 基础DDD架构框架已建立
- 9个已完成模块为Core模块提供了完整的协调目标

🔍 需要重构的方面：
- CoreOrchestrator核心协调机制需要完整实现
- 与9个已完成模块的统一架构标准对齐
- 工作流编排引擎的企业级实现
- 模块间协调和预留接口激活机制
- L3执行层的专业化功能实现
```

### **重构策略**
```markdown
🎯 重构目标：建立MPLP生态系统的中央协调器

重构原则：
✅ 协调器优先：Core模块作为L3执行层，专注于协调和编排功能
✅ 统一架构：与其他9个模块保持IDENTICAL的DDD架构
✅ 预留接口激活：激活其他模块的预留接口，实现真正的模块间协调
✅ 企业级标准：达到与其他8个企业级模块相同的质量标准

预期效果：
- 建立完整的CoreOrchestrator中央协调机制
- 实现9个模块的统一协调和编排
- 工作流执行性能提升60%
- 模块间协调效率提升70%
- 系统整体稳定性提升50%
```

## 🏗️ **新架构设计**

### **3个核心协调服务**

#### **1. CoreOrchestrationService - 中央编排服务**
```typescript
/**
 * 中央编排服务 - L3执行层核心
 * 职责：工作流编排、模块协调、执行管理
 */
export class CoreOrchestrationService {
  constructor(
    private readonly workflowRepository: IWorkflowRepository,
    private readonly moduleCoordinator: IModuleCoordinator,
    private readonly executionEngine: IExecutionEngine,
    private readonly logger: ILogger
  ) {}

  // 执行工作流
  async executeWorkflow(workflowData: WorkflowExecutionData): Promise<WorkflowResult> {
    // 1. 验证工作流数据
    await this.validateWorkflowData(workflowData);
    
    // 2. 创建工作流执行实例
    const execution = new WorkflowExecution({
      executionId: this.generateExecutionId(),
      workflowId: workflowData.workflowId,
      contextId: workflowData.contextId,
      stages: workflowData.stages,
      executionMode: workflowData.executionMode || 'sequential',
      priority: workflowData.priority || 'medium',
      timeout: workflowData.timeout || 300000,
      status: 'initializing',
      createdAt: new Date(),
      metadata: workflowData.metadata || {}
    });
    
    // 3. 启动执行引擎
    const result = await this.executionEngine.execute(execution);
    
    // 4. 持久化执行结果
    await this.workflowRepository.saveExecution(execution);
    
    return result;
  }

  // 协调模块操作
  async coordinateModuleOperation(
    sourceModule: string,
    targetModule: string,
    operation: string,
    payload: Record<string, unknown>
  ): Promise<CoordinationResult> {
    // 1. 验证模块协调请求
    await this.validateCoordinationRequest(sourceModule, targetModule, operation);
    
    // 2. 执行模块间协调
    const result = await this.moduleCoordinator.coordinate({
      sourceModule,
      targetModule,
      operation,
      payload,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }

  // 激活预留接口
  async activateReservedInterface(
    moduleId: string,
    interfaceId: string,
    activationData: InterfaceActivationData
  ): Promise<ActivationResult> {
    // 1. 验证接口激活权限
    await this.validateInterfaceActivation(moduleId, interfaceId);
    
    // 2. 激活预留接口
    const result = await this.moduleCoordinator.activateInterface({
      moduleId,
      interfaceId,
      activationData,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }
}
```

#### **2. CoreResourceService - 资源管理服务**
```typescript
/**
 * 资源管理服务
 * 职责：系统资源分配、性能监控、负载均衡
 */
export class CoreResourceService {
  constructor(
    private readonly resourceRepository: IResourceRepository,
    private readonly performanceMonitor: IPerformanceMonitor,
    private readonly loadBalancer: ILoadBalancer
  ) {}

  // 分配系统资源
  async allocateResources(
    executionId: string,
    resourceRequirements: ResourceRequirements
  ): Promise<ResourceAllocation> {
    // 1. 评估资源需求
    const assessment = await this.assessResourceNeeds(resourceRequirements);
    
    // 2. 检查资源可用性
    const availability = await this.checkResourceAvailability(assessment);
    
    // 3. 执行资源分配
    const allocation = await this.performResourceAllocation(executionId, assessment, availability);
    
    return allocation;
  }

  // 监控系统性能
  async monitorSystemPerformance(): Promise<PerformanceMetrics> {
    // 1. 收集性能指标
    const metrics = await this.performanceMonitor.collectMetrics();
    
    // 2. 分析性能趋势
    const trends = await this.analyzePerformanceTrends(metrics);
    
    // 3. 生成性能报告
    const report = await this.generatePerformanceReport(metrics, trends);
    
    return report;
  }

  // 执行负载均衡
  async balanceWorkload(workloadData: WorkloadData): Promise<BalancingResult> {
    // 1. 分析当前负载
    const currentLoad = await this.analyzeCurrentLoad();
    
    // 2. 计算最优分配
    const optimalAllocation = await this.calculateOptimalAllocation(workloadData, currentLoad);
    
    // 3. 执行负载重分配
    const result = await this.loadBalancer.rebalance(optimalAllocation);
    
    return result;
  }
}
```

#### **3. CoreMonitoringService - 监控管理服务**
```typescript
/**
 * 监控管理服务
 * 职责：系统监控、健康检查、告警管理
 */
export class CoreMonitoringService {
  constructor(
    private readonly monitoringRepository: IMonitoringRepository,
    private readonly healthChecker: IHealthChecker,
    private readonly alertManager: IAlertManager
  ) {}

  // 执行系统健康检查
  async performHealthCheck(): Promise<SystemHealthStatus> {
    // 1. 检查所有模块健康状态
    const moduleHealth = await this.checkAllModulesHealth();
    
    // 2. 检查系统资源状态
    const resourceHealth = await this.checkSystemResources();
    
    // 3. 检查网络连接状态
    const networkHealth = await this.checkNetworkConnectivity();
    
    // 4. 生成综合健康报告
    const overallHealth = this.calculateOverallHealth(moduleHealth, resourceHealth, networkHealth);
    
    return {
      overall: overallHealth,
      modules: moduleHealth,
      resources: resourceHealth,
      network: networkHealth,
      timestamp: new Date().toISOString()
    };
  }

  // 管理系统告警
  async manageAlerts(alertData: AlertData): Promise<AlertResult> {
    // 1. 验证告警数据
    await this.validateAlertData(alertData);
    
    // 2. 评估告警严重程度
    const severity = await this.assessAlertSeverity(alertData);
    
    // 3. 执行告警处理
    const result = await this.alertManager.processAlert({
      ...alertData,
      severity,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }

  // 生成监控报告
  async generateMonitoringReport(reportType: MonitoringReportType): Promise<MonitoringReport> {
    // 1. 收集监控数据
    const monitoringData = await this.collectMonitoringData(reportType);
    
    // 2. 分析数据趋势
    const trends = await this.analyzeMonitoringTrends(monitoringData);
    
    // 3. 生成报告
    const report = await this.createMonitoringReport(monitoringData, trends, reportType);
    
    return report;
  }
}
```

## 🔧 **CoreOrchestrator实现**

### **中央协调机制**
```typescript
/**
 * CoreOrchestrator - MPLP生态系统中央协调器
 * L3执行层的核心实现
 */
export class CoreOrchestrator {
  constructor(
    private readonly orchestrationService: CoreOrchestrationService,
    private readonly resourceService: CoreResourceService,
    private readonly monitoringService: CoreMonitoringService,
    // 9个L3管理器注入
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

  // 执行完整工作流
  async executeWorkflow(contextId: string, workflowConfig: WorkflowConfig): Promise<WorkflowResult> {
    // 1. 安全验证
    await this.securityManager.validateWorkflowExecution(contextId, workflowConfig);
    
    // 2. 性能监控开始
    const performanceTimer = this.performanceMonitor.startTimer('workflow_execution');
    
    // 3. 开始事务
    const transaction = await this.transactionManager.beginTransaction();
    
    try {
      // 4. 执行工作流
      const result = await this.orchestrationService.executeWorkflow({
        workflowId: this.generateWorkflowId(),
        contextId,
        ...workflowConfig
      });
      
      // 5. 提交事务
      await this.transactionManager.commitTransaction(transaction);
      
      // 6. 发布完成事件
      await this.eventBusManager.publish('workflow_completed', {
        contextId,
        workflowId: result.workflowId,
        result
      });
      
      return result;
    } catch (error) {
      // 7. 回滚事务
      await this.transactionManager.rollbackTransaction(transaction);
      
      // 8. 错误处理
      await this.errorHandler.handleError(error as Error, { contextId, workflowConfig });
      
      throw error;
    } finally {
      // 9. 性能监控结束
      this.performanceMonitor.endTimer(performanceTimer);
    }
  }

  // 激活模块预留接口
  async activateModuleInterfaces(moduleId: string, interfaces: InterfaceActivationConfig[]): Promise<ActivationResult[]> {
    const results: ActivationResult[] = [];
    
    for (const interfaceConfig of interfaces) {
      const result = await this.orchestrationService.activateReservedInterface(
        moduleId,
        interfaceConfig.interfaceId,
        interfaceConfig.activationData
      );
      results.push(result);
    }
    
    return results;
  }
}
```

## 📊 **实施计划**

### **Phase 1: 核心架构实现 (Week 1-2)**
```markdown
Day 1-3: 基础架构搭建
- [ ] 完善DDD分层架构，确保与其他9个模块IDENTICAL
- [ ] 实现Schema-TypeScript双重命名约定映射
- [ ] 创建核心实体和值对象
- [ ] 建立Repository接口和实现

Day 4-7: 核心服务实现
- [ ] 实现CoreOrchestrationService核心编排服务
- [ ] 实现CoreResourceService资源管理服务
- [ ] 实现CoreMonitoringService监控管理服务
- [ ] 集成9个横切关注点L3管理器

Day 8-14: CoreOrchestrator实现
- [ ] 实现CoreOrchestrator中央协调器
- [ ] 实现工作流执行引擎
- [ ] 实现模块间协调机制
- [ ] 实现预留接口激活机制
```

### **Phase 2: 模块集成和测试 (Week 3-4)**
```markdown
Day 15-21: 模块集成
- [ ] 与9个已完成模块的集成测试
- [ ] 预留接口激活功能验证
- [ ] 跨模块协调功能测试
- [ ] 工作流端到端测试

Day 22-28: 质量保证
- [ ] 达到95%+测试覆盖率
- [ ] 实现100%测试通过率
- [ ] 零技术债务验证
- [ ] 性能基准测试
- [ ] 完整的8文件文档套件
```

## ✅ **验收标准**

### **功能验收**
```markdown
核心功能验收：
- [ ] CoreOrchestrator中央协调机制100%实现
- [ ] 9个模块预留接口激活100%成功
- [ ] 工作流执行引擎100%功能完整
- [ ] 模块间协调机制100%可用

性能验收：
- [ ] 工作流执行响应时间<500ms
- [ ] 模块协调响应时间<100ms
- [ ] 系统资源利用率<80%
- [ ] 并发处理能力>100个工作流/秒
```

### **质量验收**
```markdown
代码质量验收：
- [ ] TypeScript编译0错误
- [ ] ESLint检查0错误和警告
- [ ] 测试覆盖率≥95%
- [ ] 测试通过率100%

架构验收：
- [ ] DDD架构100%符合统一标准
- [ ] 横切关注点100%集成
- [ ] IMLPPProtocol接口100%实现
- [ ] 双重命名约定100%合规
```

## 🔄 **9个模块协调接口设计**

### **模块协调映射表**
```markdown
Core模块作为L3执行层，需要协调以下9个L2协调层模块：

✅ 已完成模块协调接口：
1. Context模块 - 上下文管理协调
2. Plan模块 - 规划任务协调
3. Role模块 - 权限安全协调
4. Confirm模块 - 审批流程协调
5. Trace模块 - 监控追踪协调
6. Extension模块 - 扩展管理协调
7. Dialog模块 - 对话交互协调
8. Collab模块 - 协作管理协调
9. Network模块 - 网络通信协调
```

### **预留接口激活机制**
```typescript
/**
 * 预留接口激活器
 * 负责激活其他模块中以下划线前缀标记的预留接口
 */
export class ReservedInterfaceActivator {
  // 激活Context模块预留接口
  async activateContextInterfaces(contextId: string): Promise<void> {
    // 激活Context模块中的预留接口参数
    // 例如：_userId, _contextId, _metadata等参数
    await this.orchestrationService.activateReservedInterface('context', 'user_context_sync', {
      contextId,
      activationType: 'user_sync',
      parameters: { userId: contextId.split('-')[1] }
    });
  }

  // 激活Plan模块预留接口
  async activatePlanInterfaces(planId: string): Promise<void> {
    // 激活Plan模块中的AI服务集成接口
    await this.orchestrationService.activateReservedInterface('plan', 'ai_service_integration', {
      planId,
      activationType: 'ai_integration',
      parameters: { aiServiceEndpoint: process.env.AI_SERVICE_URL }
    });
  }

  // 激活Role模块预留接口
  async activateRoleInterfaces(userId: string, roleId: string): Promise<void> {
    // 激活Role模块中的权限验证接口
    await this.orchestrationService.activateReservedInterface('role', 'permission_validation', {
      userId,
      roleId,
      activationType: 'permission_sync',
      parameters: { securityLevel: 'enterprise' }
    });
  }
}
```

## 🎯 **企业级特性实现**

### **工作流模板系统**
```typescript
/**
 * 工作流模板管理
 * 提供预定义的工作流模板和自定义模板支持
 */
export class WorkflowTemplateManager {
  // 标准工作流模板
  static readonly STANDARD_TEMPLATES = {
    // 完整的MPLP工作流
    FULL_MPLP_WORKFLOW: {
      name: 'Full MPLP Workflow',
      stages: ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'network'],
      executionMode: 'sequential',
      timeout: 600000,
      description: '完整的MPLP生态系统工作流'
    },

    // 快速协作工作流
    QUICK_COLLABORATION: {
      name: 'Quick Collaboration',
      stages: ['context', 'role', 'collab', 'trace'],
      executionMode: 'parallel',
      timeout: 180000,
      description: '快速多人协作工作流'
    },

    // 安全审批工作流
    SECURE_APPROVAL: {
      name: 'Secure Approval',
      stages: ['context', 'role', 'confirm', 'trace'],
      executionMode: 'sequential',
      timeout: 300000,
      description: '安全审批工作流'
    }
  };

  // 创建自定义工作流模板
  async createCustomTemplate(templateData: CustomTemplateData): Promise<WorkflowTemplate> {
    // 验证模板数据
    await this.validateTemplateData(templateData);

    // 创建模板
    const template = new WorkflowTemplate({
      templateId: this.generateTemplateId(),
      name: templateData.name,
      stages: templateData.stages,
      executionMode: templateData.executionMode,
      timeout: templateData.timeout,
      description: templateData.description,
      metadata: templateData.metadata,
      createdAt: new Date()
    });

    return template;
  }
}
```

### **性能优化机制**
```typescript
/**
 * 性能优化管理器
 * 提供缓存、批处理、连接池等性能优化功能
 */
export class PerformanceOptimizer {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly batchProcessor = new BatchProcessor();
  private readonly connectionPool = new ConnectionPool();

  // 智能缓存机制
  async getCachedResult<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300000): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && !this.isCacheExpired(cached, ttl)) {
      return cached.data as T;
    }

    const result = await fetcher();
    this.cache.set(key, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  // 批处理优化
  async batchProcess<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 10
  ): Promise<R[]> {
    return await this.batchProcessor.process(items, processor, batchSize);
  }

  // 连接池管理
  async executeWithConnection<T>(operation: (connection: Connection) => Promise<T>): Promise<T> {
    const connection = await this.connectionPool.acquire();
    try {
      return await operation(connection);
    } finally {
      this.connectionPool.release(connection);
    }
  }
}
```

## 🧪 **测试策略**

### **测试架构设计**
```markdown
测试层次结构：
├── 单元测试 (70%) - 核心逻辑测试
│   ├── CoreOrchestrationService测试
│   ├── CoreResourceService测试
│   ├── CoreMonitoringService测试
│   └── CoreOrchestrator测试
├── 集成测试 (20%) - 模块协调测试
│   ├── 9个模块集成测试
│   ├── 预留接口激活测试
│   ├── 工作流端到端测试
│   └── 跨模块协调测试
└── 端到端测试 (10%) - 完整场景测试
    ├── 完整MPLP工作流测试
    ├── 性能压力测试
    ├── 故障恢复测试
    └── 安全渗透测试
```

### **关键测试用例**
```typescript
describe('Core模块企业级测试套件', () => {
  describe('CoreOrchestrator核心功能', () => {
    it('应该成功执行完整MPLP工作流', async () => {
      // 测试完整的9个模块协调工作流
    });

    it('应该成功激活所有模块预留接口', async () => {
      // 测试预留接口激活机制
    });

    it('应该在模块故障时正确处理和恢复', async () => {
      // 测试故障恢复机制
    });
  });

  describe('性能基准测试', () => {
    it('工作流执行应该在500ms内完成', async () => {
      // 性能基准测试
    });

    it('应该支持100个并发工作流执行', async () => {
      // 并发性能测试
    });
  });

  describe('9个模块集成测试', () => {
    it('应该成功与Context模块协调', async () => {
      // Context模块集成测试
    });

    it('应该成功与Plan模块协调', async () => {
      // Plan模块集成测试
    });

    // ... 其他7个模块的集成测试
  });
});
```

## 📚 **文档标准**

### **完整8文件文档套件**
```markdown
1. README.md - 模块概述和快速开始
2. API.md - 完整API参考文档
3. ARCHITECTURE.md - 架构设计详解
4. TESTING.md - 测试策略和指南
5. PERFORMANCE.md - 性能优化和基准
6. SECURITY.md - 安全机制和最佳实践
7. DEPLOYMENT.md - 部署指南和配置
8. CHANGELOG.md - 版本变更记录
```

### **API文档示例**
```markdown
# Core模块API参考

## CoreOrchestrator

### executeWorkflow(contextId, workflowConfig)

执行完整的MPLP工作流。

**参数:**
- `contextId` (string): 上下文标识符
- `workflowConfig` (WorkflowConfig): 工作流配置

**返回值:**
- `Promise<WorkflowResult>`: 工作流执行结果

**示例:**
```typescript
const result = await coreOrchestrator.executeWorkflow('ctx-001', {
  stages: ['context', 'plan', 'confirm'],
  executionMode: 'sequential',
  timeout: 300000
});
```

**错误处理:**
- `WorkflowValidationError`: 工作流配置无效
- `ModuleCoordinationError`: 模块协调失败
- `ExecutionTimeoutError`: 执行超时
```

## 🚀 **部署和运维**

### **容器化部署**
```dockerfile
# Core模块Docker配置
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/
COPY docs/ ./docs/

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node src/health-check.js

# 启动Core模块
CMD ["node", "src/modules/core/index.js"]
```

### **监控和告警**
```yaml
# Core模块监控配置
monitoring:
  metrics:
    - workflow_execution_time
    - module_coordination_success_rate
    - resource_utilization
    - error_rate

  alerts:
    - name: workflow_execution_timeout
      condition: workflow_execution_time > 500ms
      severity: warning

    - name: module_coordination_failure
      condition: coordination_success_rate < 95%
      severity: critical

    - name: high_resource_usage
      condition: resource_utilization > 80%
      severity: warning
```

---

**版本**: v1.0
**创建时间**: 2025-01-27
**重构周期**: 4周
**维护者**: Core模块重构小组
**依赖模块**: Context, Plan, Role, Confirm, Trace, Extension, Dialog, Collab, Network (9个)
