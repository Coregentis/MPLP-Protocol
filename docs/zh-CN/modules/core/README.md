# Core模块

> **🌐 语言导航**: [English](../../../en/modules/core/README.md) | [中文](README.md)



**MPLP L2协调层 - 中央协调系统**

[![模块](https://img.shields.io/badge/module-Core-red.svg)](../../architecture/l2-coordination-layer.md)
[![状态](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-584%2F584%20passing-green.svg)](./testing.md)
[![覆盖率](https://img.shields.io/badge/coverage-100%25-green.svg)](./testing.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/core/README.md)

---

## 🎯 概览

Core模块作为MPLP的中央协调系统，实现L3执行层的CoreOrchestrator功能。它提供统一的协调、资源管理和系统健康监控，覆盖所有L2模块，确保无缝的多智能体系统运行。

### **主要职责**
- **中央协调**: 协调所有L2模块之间的交互
- **资源管理**: 管理系统资源和智能体生命周期
- **工作流编排**: 执行复杂的多智能体工作流
- **系统健康**: 监控和维护整体系统健康
- **性能优化**: 优化系统性能和可扩展性

### **核心特性**
- **CoreOrchestrator**: 所有模块的中央协调引擎
- **资源池管理**: 高效分配和管理系统资源
- **工作流引擎**: 执行具有依赖关系的复杂多步骤工作流
- **健康监控**: 实时系统健康和性能监控
- **错误恢复**: 自动错误检测和恢复机制
- **可扩展性支持**: 水平和垂直扩展能力

---

## 🏗️ 架构

### **核心组件**

```
┌─────────────────────────────────────────────────────────────┐
│                    Core模块架构                             │
├─────────────────────────────────────────────────────────────┤
│  CoreOrchestrator (L3执行层)                               │
│  ├── 工作流引擎                                            │
│  ├── 资源管理器                                            │
│  ├── 健康监控器                                            │
│  └── 性能优化器                                            │
├─────────────────────────────────────────────────────────────┤
│  协调服务 (L2集成)                                         │
│  ├── 模块协调器                                            │
│  ├── 事件分发器                                            │
│  ├── 状态管理器                                            │
│  └── 配置管理器                                            │
├─────────────────────────────────────────────────────────────┤
│  基础设施服务                                              │
│  ├── 指标收集器                                            │
│  ├── 错误处理器                                            │
│  ├── 安全管理器                                            │
│  └── 审计日志器                                            │
└─────────────────────────────────────────────────────────────┘
```

### **与L2模块的集成**

Core模块通过标准化接口与所有其他L2模块集成：

```typescript
interface L2ModuleIntegration {
  // 模块注册和生命周期
  registerModule(module: L2Module): Promise<void>;
  unregisterModule(moduleId: string): Promise<void>;
  
  // 事件协调
  publishEvent(event: ModuleEvent): Promise<void>;
  subscribeToEvents(moduleId: string, handler: EventHandler): void;
  
  // 资源协调
  requestResources(request: ResourceRequest): Promise<ResourceAllocation>;
  releaseResources(allocationId: string): Promise<void>;
  
  // 健康监控
  reportHealth(moduleId: string, health: HealthStatus): Promise<void>;
  getSystemHealth(): Promise<SystemHealthStatus>;
}
```

---

## 🔧 核心服务

### **1. CoreOrchestrator服务**

管理所有多智能体工作流和系统操作的中央协调引擎。

#### **核心能力**
- **工作流编排**: 执行复杂的多步骤工作流
- **模块协调**: 协调L2模块之间的交互
- **资源分配**: 高效管理系统资源
- **错误恢复**: 处理故障并实施恢复策略
- **性能优化**: 动态优化系统性能

#### **工作流编排示例**
```typescript
// 复杂多智能体工作流示例
const workflow = {
  id: 'multi-agent-planning-workflow',
  name: '多智能体规划工作流',
  steps: [
    {
      id: 'context-setup',
      module: 'context',
      action: 'createContext',
      parameters: {
        name: '协作规划会话',
        type: 'planning'
      }
    },
    {
      id: 'participant-registration',
      module: 'context',
      action: 'addParticipants',
      dependencies: ['context-setup'],
      parameters: {
        participants: ['agent-1', 'agent-2', 'agent-3']
      }
    },
    {
      id: 'plan-creation',
      module: 'plan',
      action: 'createPlan',
      dependencies: ['participant-registration'],
      parameters: {
        planType: 'collaborative',
        objectives: ['目标1', '目标2']
      }
    },
    {
      id: 'role-assignment',
      module: 'role',
      action: 'assignRoles',
      dependencies: ['participant-registration'],
      parameters: {
        roleAssignments: {
          'agent-1': 'coordinator',
          'agent-2': 'analyst',
          'agent-3': 'executor'
        }
      }
    },
    {
      id: 'execution-monitoring',
      module: 'trace',
      action: 'startMonitoring',
      dependencies: ['plan-creation', 'role-assignment'],
      parameters: {
        monitoringLevel: 'detailed'
      }
    }
  ]
};

// 执行工作流
await coreOrchestrator.executeWorkflow(workflow);
```

### **2. 资源管理服务**

管理系统资源分配和智能体生命周期的核心服务。

#### **资源类型**
- **计算资源**: CPU、内存、存储
- **网络资源**: 带宽、连接池
- **智能体资源**: 智能体实例、能力
- **数据资源**: 数据库连接、缓存

#### **资源分配策略**
```typescript
interface ResourceAllocationStrategy {
  // 资源请求评估
  evaluateRequest(request: ResourceRequest): Promise<AllocationDecision>;
  
  // 资源分配
  allocateResources(decision: AllocationDecision): Promise<ResourceAllocation>;
  
  // 资源释放
  releaseResources(allocation: ResourceAllocation): Promise<void>;
  
  // 资源优化
  optimizeAllocation(): Promise<OptimizationResult>;
}

// 智能资源分配示例
const allocationStrategy = {
  async evaluateRequest(request: ResourceRequest): Promise<AllocationDecision> {
    const availableResources = await this.getAvailableResources();
    const priority = this.calculatePriority(request);
    const feasibility = this.checkFeasibility(request, availableResources);
    
    return {
      approved: feasibility.possible,
      priority: priority,
      allocation: feasibility.allocation,
      estimatedDuration: request.estimatedDuration
    };
  }
};
```

### **3. 健康监控服务**

实时监控系统健康状态和性能指标的服务。

#### **监控维度**
- **模块健康**: 各L2模块的运行状态
- **系统性能**: CPU、内存、网络使用率
- **业务指标**: 工作流成功率、响应时间
- **错误率**: 错误频率和类型分析

#### **健康检查实现**
```typescript
class HealthMonitoringService {
  private healthChecks: Map<string, HealthCheck> = new Map();
  
  async performSystemHealthCheck(): Promise<SystemHealthStatus> {
    const moduleHealths = await Promise.all(
      Array.from(this.healthChecks.values()).map(check => 
        this.executeHealthCheck(check)
      )
    );
    
    const overallHealth = this.calculateOverallHealth(moduleHealths);
    
    return {
      status: overallHealth.status,
      score: overallHealth.score,
      modules: moduleHealths,
      timestamp: new Date(),
      recommendations: overallHealth.recommendations
    };
  }
  
  private async executeHealthCheck(check: HealthCheck): Promise<ModuleHealth> {
    try {
      const result = await check.execute();
      return {
        moduleId: check.moduleId,
        status: result.healthy ? 'healthy' : 'unhealthy',
        metrics: result.metrics,
        issues: result.issues || []
      };
    } catch (error) {
      return {
        moduleId: check.moduleId,
        status: 'error',
        error: error.message,
        issues: ['健康检查执行失败']
      };
    }
  }
}
```

### **4. 事件协调服务**

管理模块间事件通信和协调的服务。

#### **事件类型**
- **生命周期事件**: 模块启动、停止、重启
- **业务事件**: 工作流状态变更、任务完成
- **系统事件**: 资源变更、配置更新
- **错误事件**: 异常、故障、恢复

#### **事件处理机制**
```typescript
class EventCoordinationService {
  private eventBus: EventBus;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  
  async publishEvent(event: ModuleEvent): Promise<void> {
    // 事件验证
    await this.validateEvent(event);
    
    // 事件路由
    const handlers = this.getEventHandlers(event.type);
    
    // 并行处理
    const results = await Promise.allSettled(
      handlers.map(handler => handler.handle(event))
    );
    
    // 处理失败的事件
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      await this.handleEventProcessingFailures(event, failures);
    }
    
    // 记录事件处理结果
    await this.logEventProcessing(event, results);
  }
  
  subscribeToEvents(moduleId: string, eventType: string, handler: EventHandler): void {
    const key = `${moduleId}:${eventType}`;
    const handlers = this.eventHandlers.get(key) || [];
    handlers.push(handler);
    this.eventHandlers.set(key, handlers);
  }
}
```

---

## 📊 性能指标

### **系统性能基准**
- **工作流执行时间**: P95 < 500ms
- **资源分配延迟**: P95 < 100ms
- **事件处理延迟**: P95 < 50ms
- **健康检查周期**: 30秒
- **系统可用性**: 99.9%+

### **扩展性指标**
- **并发工作流**: 1000+
- **注册模块数**: 50+
- **事件吞吐量**: 10,000 events/sec
- **资源池大小**: 动态扩展

---

## 🔐 安全特性

### **访问控制**
- **模块认证**: 基于证书的模块身份验证
- **权限管理**: 细粒度的操作权限控制
- **资源隔离**: 模块间资源访问隔离
- **审计日志**: 完整的操作审计跟踪

### **数据保护**
- **传输加密**: TLS 1.3端到端加密
- **存储加密**: AES-256数据加密
- **密钥管理**: 自动密钥轮换
- **访问监控**: 实时访问行为监控

---

## 🚀 快速开始

### **基础配置**
```yaml
core:
  orchestrator:
    enabled: true
    max_concurrent_workflows: 1000
    workflow_timeout_ms: 300000
    
  resource_manager:
    enabled: true
    allocation_strategy: "intelligent"
    resource_pools:
      compute:
        cpu_cores: 16
        memory_gb: 64
      network:
        max_connections: 10000
        
  health_monitor:
    enabled: true
    check_interval_ms: 30000
    alert_thresholds:
      cpu_usage: 80
      memory_usage: 85
      error_rate: 5
```

### **模块注册示例**
```typescript
import { CoreModule } from '@mplp/core';

// 初始化Core模块
const coreModule = new CoreModule(config);

// 注册其他L2模块
await coreModule.registerModule({
  moduleId: 'context',
  name: 'Context Module',
  version: '1.0.0-alpha',
  capabilities: ['context_management', 'participant_coordination']
});

await coreModule.registerModule({
  moduleId: 'plan',
  name: 'Plan Module', 
  version: '1.0.0-alpha',
  capabilities: ['planning', 'goal_management']
});

// 启动协调服务
await coreModule.start();
```

---

## 📚 相关文档

- [协议规范](./protocol-specification.md) - Core模块协议规范
- [L2协调层架构](../../architecture/l2-coordination-layer.md) - 整体架构文档
- [工作流引擎](../../workflow/workflow-engine.md) - 工作流引擎详细文档
- [资源管理](../../infrastructure/resource-management.md) - 资源管理详细文档
- [健康监控](../../monitoring/health-monitoring.md) - 健康监控详细文档

---

**模块版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Core模块在Alpha版本中提供完整的中央协调功能。额外的高级编排功能和优化将在Beta版本中添加。
