# Core Module Architecture Guide

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-09-01T16:43:00Z
最后更新: 2025-09-01T16:43:00Z
文档状态: 已完成
-->

![版本](https://img.shields.io/badge/v1.0.0-stable-green)
![更新时间](https://img.shields.io/badge/Updated-2025--09--01-brightgreen)
![架构](https://img.shields.io/badge/Architecture-DDD-blue)
![层次](https://img.shields.io/badge/Layer-L3_Execution-orange)

## 🏗️ **架构概述**

Core模块采用**领域驱动设计(DDD)**架构，作为MPLP生态系统的**L3执行层核心组件**，负责统一协调和管理其他9个MPLP模块。Core模块实现了与已完成8个模块**IDENTICAL**的统一架构标准。

### **架构定位**
```
┌─────────────────────────────────────────────────────────────┐
│                    L4 Agent Layer                          │
│                   (用户应用层)                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                L3 Execution Layer                          │
│              (Core模块 - 执行协调层)                         │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │ CoreOrchestrator│  │   Reserved Interface Activator  │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                L2 Coordination Layer                       │
│     (9个MPLP模块 - Context, Plan, Role, Confirm等)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 L1 Protocol Layer                          │
│              (9个横切关注点管理器)                           │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **DDD分层架构**

### **API层 (Presentation Layer)**
```
src/modules/core/api/
├── controllers/
│   ├── core.controller.ts           # REST API控制器
│   └── core-orchestrator.controller.ts # 编排API控制器
├── dto/
│   ├── core.dto.ts                  # 数据传输对象
│   ├── workflow-request.dto.ts      # 工作流请求DTO
│   └── coordination-request.dto.ts  # 协调请求DTO
├── middleware/
│   ├── core-auth.middleware.ts      # 认证中间件
│   └── core-validation.middleware.ts # 验证中间件
└── routes/
    └── core.routes.ts               # 路由定义
```

**职责**:
- 提供RESTful API接口
- 请求验证和数据转换
- 认证和授权
- 错误处理和响应格式化

### **应用层 (Application Layer)**
```
src/modules/core/application/
├── services/
│   ├── core-management.service.ts   # 核心管理服务
│   ├── core-orchestration.service.ts # 编排服务
│   ├── core-resource.service.ts     # 资源管理服务
│   └── core-monitoring.service.ts   # 监控服务
├── coordinators/
│   └── core-services-coordinator.ts # 服务协调器
├── use-cases/
│   ├── execute-workflow.use-case.ts # 工作流执行用例
│   └── coordinate-modules.use-case.ts # 模块协调用例
└── handlers/
    ├── workflow-event.handler.ts    # 工作流事件处理器
    └── coordination-event.handler.ts # 协调事件处理器
```

**职责**:
- 业务用例实现
- 应用服务协调
- 事件处理
- 事务管理

### **领域层 (Domain Layer)**
```
src/modules/core/domain/
├── entities/
│   ├── core.entity.ts               # 核心实体
│   ├── workflow.entity.ts           # 工作流实体
│   └── coordination.entity.ts       # 协调实体
├── orchestrators/
│   └── core.orchestrator.ts         # 核心编排器
├── activators/
│   └── reserved-interface.activator.ts # 预留接口激活器
├── services/
│   ├── workflow-execution.service.ts # 工作流执行服务
│   └── module-coordination.service.ts # 模块协调服务
├── repositories/
│   └── core-repository.interface.ts # 仓储接口
└── value-objects/
    ├── workflow-config.vo.ts        # 工作流配置值对象
    └── coordination-result.vo.ts    # 协调结果值对象
```

**职责**:
- 核心业务逻辑
- 领域实体和值对象
- 领域服务
- 业务规则验证

### **基础设施层 (Infrastructure Layer)**
```
src/modules/core/infrastructure/
├── repositories/
│   └── core.repository.ts           # 仓储实现
├── adapters/
│   └── core-module.adapter.ts       # 模块适配器
├── factories/
│   ├── core-protocol.factory.ts     # 协议工厂
│   └── core-orchestrator.factory.ts # 编排器工厂
├── integration/
│   └── cross-cutting-concerns-integration.ts # 横切关注点集成
└── protocols/
    └── core.protocol.ts             # 核心协议实现
```

**职责**:
- 数据持久化
- 外部系统集成
- 技术实现细节
- 基础设施服务

## 🔧 **核心组件详解**

### **1. CoreOrchestrator - 中央协调器**

```typescript
export class CoreOrchestrator {
  constructor(
    private readonly orchestrationService: CoreOrchestrationService,
    private readonly resourceService: CoreResourceService,
    private readonly monitoringService: CoreMonitoringService,
    // L3管理器注入
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

  // 核心方法
  async executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowResult>
  async coordinateModules(modules: string[], operation: string, parameters: Record<string, unknown>): Promise<CoordinationResult>
  async getSystemStatus(): Promise<SystemStatus>
}
```

**核心职责**:
- 工作流编排和执行
- 模块间协调管理
- 系统状态监控
- 资源分配和管理

### **2. ReservedInterfaceActivator - 预留接口激活器**

```typescript
export class ReservedInterfaceActivator {
  constructor(
    private readonly orchestrationService: CoreOrchestrationService
  ) {}

  // 核心方法
  async activateInterface(moduleId: string, interfaceId: string, parameters: Record<string, unknown>): Promise<ActivationResult>
  async deactivateInterface(moduleId: string, interfaceId: string): Promise<void>
  async getActiveInterfaces(): Promise<ActiveInterface[]>
}
```

**核心职责**:
- 发现和激活预留接口
- 参数注入和生命周期管理
- 接口状态监控

### **3. 横切关注点集成**

Core模块集成了MPLP的9个横切关注点管理器：

```typescript
export class CrossCuttingConcernsIntegration {
  private managers = {
    security: MLPPSecurityManager,
    performance: MLPPPerformanceMonitor,
    eventBus: MLPPEventBusManager,
    errorHandler: MLPPErrorHandler,
    coordination: MLPPCoordinationManager,
    orchestration: MLPPOrchestrationManager,
    stateSync: MLPPStateSyncManager,
    transaction: MLPPTransactionManager,
    protocolVersion: MLPPProtocolVersionManager
  };
}
```

## 🔄 **数据流架构**

### **工作流执行数据流**
```
API Request → DTO Validation → Use Case → CoreOrchestrator
     ↓
Security Validation → Performance Monitoring → Transaction Begin
     ↓
Orchestration Plan → Module Coordination → Resource Allocation
     ↓
Workflow Execution → State Sync → Event Publishing
     ↓
Transaction Commit → Performance Recording → Response
```

### **模块协调数据流**
```
Coordination Request → Access Validation → Coordination Manager
     ↓
Module Discovery → Interface Activation → Parameter Injection
     ↓
Operation Execution → Result Collection → State Synchronization
     ↓
Event Publishing → Performance Recording → Response
```

## 🏛️ **设计模式应用**

### **1. 工厂模式 (Factory Pattern)**
- `CoreOrchestratorFactory`: 创建和配置CoreOrchestrator实例
- `CoreProtocolFactory`: 创建协议实例和依赖注入

### **2. 适配器模式 (Adapter Pattern)**
- L3管理器适配器: 桥接MLPP管理器和Core接口
- 模块适配器: 统一不同模块的接口

### **3. 观察者模式 (Observer Pattern)**
- 事件驱动架构: 工作流事件和协调事件
- 状态变更通知: 系统状态和模块状态监控

### **4. 策略模式 (Strategy Pattern)**
- 执行策略: 不同的工作流执行策略
- 协调策略: 不同的模块协调策略

### **5. 单例模式 (Singleton Pattern)**
- 工厂实例管理: 确保工厂的唯一性
- 资源管理器: 全局资源管理

## 🔐 **安全架构**

### **认证和授权**
- JWT令牌验证
- 基于角色的访问控制(RBAC)
- API密钥管理
- 操作权限验证

### **数据安全**
- 敏感数据加密
- 传输层安全(TLS)
- 数据脱敏
- 审计日志

### **系统安全**
- 输入验证和清理
- SQL注入防护
- XSS攻击防护
- 速率限制

## 📊 **性能架构**

### **性能优化策略**
- 异步处理: 非阻塞I/O操作
- 连接池: 数据库连接复用
- 缓存策略: 多层缓存架构
- 负载均衡: 请求分发优化

### **监控和指标**
- 实时性能监控
- 资源使用统计
- 错误率追踪
- 响应时间分析

### **扩展性设计**
- 水平扩展支持
- 微服务架构
- 容器化部署
- 自动伸缩

## 🔗 **模块集成架构**

### **MPLP模块集成**
Core模块通过预留接口模式与其他9个MPLP模块集成：

```typescript
// 预留接口示例
private async _integrateWithContext(_contextId: string, _operation: string): Promise<void> {
  // TODO: 等待CoreOrchestrator激活
}

private async _integrateWithPlan(_planId: string, _parameters: Record<string, unknown>): Promise<void> {
  // TODO: 等待CoreOrchestrator激活
}
```

### **激活机制**
当CoreOrchestrator激活时，预留接口将被自动填充实际实现：

```typescript
// 激活后的实际实现
private async integrateWithContext(contextId: string, operation: string): Promise<void> {
  const contextData = await this.coreOrchestrator.getContextData(contextId);
  await this.performContextOperation(operation, contextData);
}
```

## 📈 **质量保证架构**

### **代码质量**
- TypeScript严格模式
- ESLint代码检查
- 零技术债务政策
- 代码覆盖率监控

### **测试架构**
- 单元测试: 100%通过率 (45/45)
- 集成测试: 模块间协作验证
- 性能测试: 响应时间和吞吐量
- 端到端测试: 完整工作流验证

### **持续集成**
- 自动化构建
- 自动化测试
- 代码质量检查
- 自动化部署

---

## 📚 **相关文档**

- [API参考](./api-reference.md) - 完整的API文档
- [Schema参考](./schema-reference.md) - JSON Schema规范
- [测试指南](./testing-guide.md) - 测试策略和实践
- [质量报告](./quality-report.md) - 质量指标和验证
