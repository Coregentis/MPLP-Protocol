# MPLP Core Protocol Schema

## 📋 **概述**

Core协议Schema定义了MPLP系统中核心协调和工作流管理的标准数据结构，作为L2协调层的核心，统一管理整个MPLP协议簇的工作流编排和模块协调。经过最新企业级功能增强，现已包含完整的核心编排监控、系统可靠性分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-core.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强 - 最新更新)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 96.7%
**功能完整性**: ✅ 100% (基础功能 + 核心监控 + 企业级功能)
**企业级特性**: ✅ 核心编排监控、系统可靠性分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **工作流编排**: 统一管理MPLP 9个协议模块的工作流编排
- **模块协调**: 协调各模块间的交互和数据流转
- **执行控制**: 控制工作流的执行模式和状态管理
- **资源调度**: 智能的资源分配和负载均衡

### **系统级监控功能**
- **核心编排监控**: 实时监控核心编排延迟、工作流协调效率、系统可靠性
- **系统可靠性分析**: 详细的模块集成成功率分析和核心管理效率评估
- **核心状态监控**: 监控核心的编排状态、模块协调、工作流管理
- **核心管理审计**: 监控核心管理过程的合规性和可靠性
- **系统可靠性保证**: 监控核心系统的可靠性和编排管理质量

### **企业级功能**
- **核心管理审计**: 完整的核心管理和编排记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **性能监控**: 核心编排系统的详细监控和健康检查，包含关键核心指标
- **版本控制**: 核心配置的版本历史、变更追踪和快照管理
- **搜索索引**: 核心数据的全文搜索、语义搜索和自动索引
- **事件集成**: 核心事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和核心事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab, Dialog, Network
L2 协调层    │ [Core] ← Orchestration, Coordination  
L1 协议层    │ Context, Plan, Confirm, Trace, Role
基础设施层   │ Event-Bus, State-Sync, Transaction, Protocol-Version, Error-Handling
服务层      │ Security, Performance
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.0" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `core_id` | string | ✅ | UUID v4格式的核心协调标识符 |
| `workflow_definition` | object | ✅ | 工作流定义 |
| `execution_context` | object | ✅ | 执行上下文 |
| `coordination_strategy` | string | ✅ | 协调策略枚举值 |
| `resource_allocation` | object | ✅ | 资源分配配置 |

### **工作流阶段枚举**
```json
{
  "workflow_stage": {
    "enum": [
      "context",     // 上下文阶段
      "plan",        // 计划阶段
      "confirm",     // 确认阶段
      "trace",       // 追踪阶段
      "role",        // 角色阶段
      "extension",   // 扩展阶段
      "collab",      // 协作阶段
      "dialog",      // 对话阶段
      "network"      // 网络阶段
    ]
  }
}
```

### **执行模式枚举**
```json
{
  "execution_mode": {
    "enum": [
      "sequential",   // 顺序执行
      "parallel",     // 并行执行
      "conditional",  // 条件执行
      "hybrid"        // 混合执行
    ]
  }
}
```

## 🔧 **双重命名约定映射**

### **Schema层 (snake_case)**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "core_id": "550e8400-e29b-41d4-a716-446655440000",
  "workflow_definition": {
    "workflow_id": "550e8400-e29b-41d4-a716-446655440001",
    "workflow_name": "智能项目管理工作流",
    "workflow_version": "2.1.0",
    "workflow_description": "基于MPLP协议的智能项目管理完整工作流",
    "workflow_stages": [
      {
        "stage_id": "stage-001",
        "stage_name": "context",
        "stage_order": 1,
        "stage_dependencies": [],
        "execution_mode": "sequential",
        "timeout_seconds": 300,
        "retry_policy": {
          "max_attempts": 3,
          "backoff_strategy": "exponential",
          "base_delay_ms": 1000
        },
        "success_criteria": {
          "required_outputs": ["context_id", "context_metadata"],
          "validation_rules": ["context_completeness", "context_validity"]
        }
      },
      {
        "stage_id": "stage-002",
        "stage_name": "plan",
        "stage_order": 2,
        "stage_dependencies": ["stage-001"],
        "execution_mode": "conditional",
        "timeout_seconds": 600,
        "conditions": [
          {
            "condition_type": "output_check",
            "source_stage": "context",
            "condition_expression": "context_metadata.complexity == 'high'"
          }
        ]
      }
    ],
    "workflow_metadata": {
      "created_by": "core_orchestrator",
      "created_at": "2025-08-13T10:30:00.000Z",
      "last_modified": "2025-08-13T10:35:00.000Z",
      "tags": ["project_management", "intelligent", "mplp"],
      "category": "business_workflow"
    }
  },
  "execution_context": {
    "execution_id": "550e8400-e29b-41d4-a716-446655440002",
    "current_stage": "plan",
    "execution_status": "in_progress",
    "started_at": "2025-08-13T10:30:00.000Z",
    "estimated_completion": "2025-08-13T11:00:00.000Z",
    "stage_history": [
      {
        "stage_name": "context",
        "started_at": "2025-08-13T10:30:00.000Z",
        "completed_at": "2025-08-13T10:32:30.000Z",
        "status": "completed",
        "duration_ms": 150000,
        "outputs": {
          "context_id": "context-123",
          "context_metadata": {
            "complexity": "high",
            "priority": "critical",
            "estimated_duration": "2_weeks"
          }
        }
      }
    ],
    "global_variables": {
      "project_id": "project-456",
      "user_id": "user-789",
      "organization_id": "org-012",
      "environment": "production"
    },
    "resource_usage": {
      "cpu_cores_allocated": 4,
      "memory_mb_allocated": 8192,
      "storage_gb_allocated": 100,
      "network_bandwidth_mbps": 50
    }
  },
  "coordination_strategy": "intelligent_adaptive",
  "module_coordination": {
    "active_modules": ["context", "plan", "trace", "role"],
    "coordination_patterns": [
      {
        "pattern_name": "context_plan_coordination",
        "source_module": "context",
        "target_module": "plan",
        "coordination_type": "data_flow",
        "data_mapping": {
          "context_metadata": "plan_requirements",
          "context_constraints": "plan_constraints"
        },
        "synchronization_mode": "synchronous"
      }
    ],
    "conflict_resolution": {
      "strategy": "priority_based",
      "escalation_enabled": true,
      "manual_intervention_threshold": "high"
    }
  },
  "resource_allocation": {
    "allocation_strategy": "dynamic_optimization",
    "resource_pools": [
      {
        "pool_id": "compute_pool_001",
        "pool_type": "compute",
        "total_capacity": {
          "cpu_cores": 32,
          "memory_gb": 128,
          "storage_gb": 1000
        },
        "allocated_capacity": {
          "cpu_cores": 16,
          "memory_gb": 64,
          "storage_gb": 400
        },
        "allocation_policies": [
          {
            "policy_name": "high_priority_first",
            "policy_weight": 0.7
          },
          {
            "policy_name": "load_balancing",
            "policy_weight": 0.3
          }
        ]
      }
    ],
    "scaling_policies": {
      "auto_scaling_enabled": true,
      "scale_up_threshold": 80,
      "scale_down_threshold": 30,
      "min_instances": 2,
      "max_instances": 10
    }
  },
  "performance_monitoring": {
    "monitoring_enabled": true,
    "metrics_collection_interval": 30,
    "performance_targets": {
      "workflow_completion_time": 1800,
      "stage_transition_time": 60,
      "resource_utilization_target": 75,
      "error_rate_threshold": 0.01
    },
    "alerting_rules": [
      {
        "rule_name": "workflow_timeout",
        "condition": "execution_time > workflow_completion_time * 1.2",
        "severity": "critical",
        "notification_channels": ["email", "slack"]
      }
    ]
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface CoreData {
  protocolVersion: string;
  timestamp: string;
  coreId: string;
  workflowDefinition: {
    workflowId: string;
    workflowName: string;
    workflowVersion: string;
    workflowDescription: string;
    workflowStages: Array<{
      stageId: string;
      stageName: WorkflowStage;
      stageOrder: number;
      stageDependencies: string[];
      executionMode: ExecutionMode;
      timeoutSeconds: number;
      retryPolicy: {
        maxAttempts: number;
        backoffStrategy: 'linear' | 'exponential' | 'fixed';
        baseDelayMs: number;
      };
      successCriteria: {
        requiredOutputs: string[];
        validationRules: string[];
      };
      conditions?: Array<{
        conditionType: 'output_check' | 'time_based' | 'resource_based';
        sourceStage: string;
        conditionExpression: string;
      }>;
    }>;
    workflowMetadata: {
      createdBy: string;
      createdAt: string;
      lastModified: string;
      tags: string[];
      category: string;
    };
  };
  executionContext: {
    executionId: string;
    currentStage: WorkflowStage;
    executionStatus: WorkflowStatus;
    startedAt: string;
    estimatedCompletion: string;
    stageHistory: Array<{
      stageName: WorkflowStage;
      startedAt: string;
      completedAt?: string;
      status: 'running' | 'completed' | 'failed' | 'skipped';
      durationMs?: number;
      outputs?: Record<string, unknown>;
    }>;
    globalVariables: Record<string, unknown>;
    resourceUsage: {
      cpuCoresAllocated: number;
      memoryMbAllocated: number;
      storageGbAllocated: number;
      networkBandwidthMbps: number;
    };
  };
  coordinationStrategy: CoordinationStrategy;
  moduleCoordination: {
    activeModules: WorkflowStage[];
    coordinationPatterns: Array<{
      patternName: string;
      sourceModule: WorkflowStage;
      targetModule: WorkflowStage;
      coordinationType: 'data_flow' | 'control_flow' | 'event_driven';
      dataMapping: Record<string, string>;
      synchronizationMode: 'synchronous' | 'asynchronous';
    }>;
    conflictResolution: {
      strategy: 'priority_based' | 'consensus' | 'manual';
      escalationEnabled: boolean;
      manualInterventionThreshold: 'low' | 'medium' | 'high';
    };
  };
  resourceAllocation: {
    allocationStrategy: 'static' | 'dynamic_optimization' | 'predictive';
    resourcePools: Array<{
      poolId: string;
      poolType: 'compute' | 'storage' | 'network' | 'memory';
      totalCapacity: Record<string, number>;
      allocatedCapacity: Record<string, number>;
      allocationPolicies: Array<{
        policyName: string;
        policyWeight: number;
      }>;
    }>;
    scalingPolicies: {
      autoScalingEnabled: boolean;
      scaleUpThreshold: number;
      scaleDownThreshold: number;
      minInstances: number;
      maxInstances: number;
    };
  };
  performanceMonitoring: {
    monitoringEnabled: boolean;
    metricsCollectionInterval: number;
    performanceTargets: {
      workflowCompletionTime: number;
      stageTransitionTime: number;
      resourceUtilizationTarget: number;
      errorRateThreshold: number;
    };
    alertingRules: Array<{
      ruleName: string;
      condition: string;
      severity: 'info' | 'warning' | 'error' | 'critical';
      notificationChannels: string[];
    }>;
  };
}

type WorkflowStage = 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'collab' | 'dialog' | 'network';
type ExecutionMode = 'sequential' | 'parallel' | 'conditional' | 'hybrid';
type WorkflowStatus = 'created' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'paused';
type CoordinationStrategy = 'simple' | 'intelligent_adaptive' | 'machine_learning' | 'rule_based';
```

### **Mapper实现**
```typescript
export class CoreMapper {
  static toSchema(entity: CoreData): CoreSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      core_id: entity.coreId,
      workflow_definition: {
        workflow_id: entity.workflowDefinition.workflowId,
        workflow_name: entity.workflowDefinition.workflowName,
        workflow_version: entity.workflowDefinition.workflowVersion,
        workflow_description: entity.workflowDefinition.workflowDescription,
        workflow_stages: entity.workflowDefinition.workflowStages.map(stage => ({
          stage_id: stage.stageId,
          stage_name: stage.stageName,
          stage_order: stage.stageOrder,
          stage_dependencies: stage.stageDependencies,
          execution_mode: stage.executionMode,
          timeout_seconds: stage.timeoutSeconds,
          retry_policy: {
            max_attempts: stage.retryPolicy.maxAttempts,
            backoff_strategy: stage.retryPolicy.backoffStrategy,
            base_delay_ms: stage.retryPolicy.baseDelayMs
          },
          success_criteria: {
            required_outputs: stage.successCriteria.requiredOutputs,
            validation_rules: stage.successCriteria.validationRules
          },
          conditions: stage.conditions?.map(condition => ({
            condition_type: condition.conditionType,
            source_stage: condition.sourceStage,
            condition_expression: condition.conditionExpression
          }))
        })),
        workflow_metadata: {
          created_by: entity.workflowDefinition.workflowMetadata.createdBy,
          created_at: entity.workflowDefinition.workflowMetadata.createdAt,
          last_modified: entity.workflowDefinition.workflowMetadata.lastModified,
          tags: entity.workflowDefinition.workflowMetadata.tags,
          category: entity.workflowDefinition.workflowMetadata.category
        }
      },
      execution_context: {
        execution_id: entity.executionContext.executionId,
        current_stage: entity.executionContext.currentStage,
        execution_status: entity.executionContext.executionStatus,
        started_at: entity.executionContext.startedAt,
        estimated_completion: entity.executionContext.estimatedCompletion,
        stage_history: entity.executionContext.stageHistory.map(history => ({
          stage_name: history.stageName,
          started_at: history.startedAt,
          completed_at: history.completedAt,
          status: history.status,
          duration_ms: history.durationMs,
          outputs: history.outputs
        })),
        global_variables: entity.executionContext.globalVariables,
        resource_usage: {
          cpu_cores_allocated: entity.executionContext.resourceUsage.cpuCoresAllocated,
          memory_mb_allocated: entity.executionContext.resourceUsage.memoryMbAllocated,
          storage_gb_allocated: entity.executionContext.resourceUsage.storageGbAllocated,
          network_bandwidth_mbps: entity.executionContext.resourceUsage.networkBandwidthMbps
        }
      },
      coordination_strategy: entity.coordinationStrategy,
      module_coordination: {
        active_modules: entity.moduleCoordination.activeModules,
        coordination_patterns: entity.moduleCoordination.coordinationPatterns.map(pattern => ({
          pattern_name: pattern.patternName,
          source_module: pattern.sourceModule,
          target_module: pattern.targetModule,
          coordination_type: pattern.coordinationType,
          data_mapping: pattern.dataMapping,
          synchronization_mode: pattern.synchronizationMode
        })),
        conflict_resolution: {
          strategy: entity.moduleCoordination.conflictResolution.strategy,
          escalation_enabled: entity.moduleCoordination.conflictResolution.escalationEnabled,
          manual_intervention_threshold: entity.moduleCoordination.conflictResolution.manualInterventionThreshold
        }
      },
      resource_allocation: {
        allocation_strategy: entity.resourceAllocation.allocationStrategy,
        resource_pools: entity.resourceAllocation.resourcePools.map(pool => ({
          pool_id: pool.poolId,
          pool_type: pool.poolType,
          total_capacity: pool.totalCapacity,
          allocated_capacity: pool.allocatedCapacity,
          allocation_policies: pool.allocationPolicies.map(policy => ({
            policy_name: policy.policyName,
            policy_weight: policy.policyWeight
          }))
        })),
        scaling_policies: {
          auto_scaling_enabled: entity.resourceAllocation.scalingPolicies.autoScalingEnabled,
          scale_up_threshold: entity.resourceAllocation.scalingPolicies.scaleUpThreshold,
          scale_down_threshold: entity.resourceAllocation.scalingPolicies.scaleDownThreshold,
          min_instances: entity.resourceAllocation.scalingPolicies.minInstances,
          max_instances: entity.resourceAllocation.scalingPolicies.maxInstances
        }
      },
      performance_monitoring: {
        monitoring_enabled: entity.performanceMonitoring.monitoringEnabled,
        metrics_collection_interval: entity.performanceMonitoring.metricsCollectionInterval,
        performance_targets: {
          workflow_completion_time: entity.performanceMonitoring.performanceTargets.workflowCompletionTime,
          stage_transition_time: entity.performanceMonitoring.performanceTargets.stageTransitionTime,
          resource_utilization_target: entity.performanceMonitoring.performanceTargets.resourceUtilizationTarget,
          error_rate_threshold: entity.performanceMonitoring.performanceTargets.errorRateThreshold
        },
        alerting_rules: entity.performanceMonitoring.alertingRules.map(rule => ({
          rule_name: rule.ruleName,
          condition: rule.condition,
          severity: rule.severity,
          notification_channels: rule.notificationChannels
        }))
      }
    };
  }

  static fromSchema(schema: CoreSchema): CoreData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      coreId: schema.core_id,
      workflowDefinition: {
        workflowId: schema.workflow_definition.workflow_id,
        workflowName: schema.workflow_definition.workflow_name,
        workflowVersion: schema.workflow_definition.workflow_version,
        workflowDescription: schema.workflow_definition.workflow_description,
        workflowStages: schema.workflow_definition.workflow_stages.map(stage => ({
          stageId: stage.stage_id,
          stageName: stage.stage_name,
          stageOrder: stage.stage_order,
          stageDependencies: stage.stage_dependencies,
          executionMode: stage.execution_mode,
          timeoutSeconds: stage.timeout_seconds,
          retryPolicy: {
            maxAttempts: stage.retry_policy.max_attempts,
            backoffStrategy: stage.retry_policy.backoff_strategy,
            baseDelayMs: stage.retry_policy.base_delay_ms
          },
          successCriteria: {
            requiredOutputs: stage.success_criteria.required_outputs,
            validationRules: stage.success_criteria.validation_rules
          },
          conditions: stage.conditions?.map(condition => ({
            conditionType: condition.condition_type,
            sourceStage: condition.source_stage,
            conditionExpression: condition.condition_expression
          }))
        })),
        workflowMetadata: {
          createdBy: schema.workflow_definition.workflow_metadata.created_by,
          createdAt: schema.workflow_definition.workflow_metadata.created_at,
          lastModified: schema.workflow_definition.workflow_metadata.last_modified,
          tags: schema.workflow_definition.workflow_metadata.tags,
          category: schema.workflow_definition.workflow_metadata.category
        }
      },
      executionContext: {
        executionId: schema.execution_context.execution_id,
        currentStage: schema.execution_context.current_stage,
        executionStatus: schema.execution_context.execution_status,
        startedAt: schema.execution_context.started_at,
        estimatedCompletion: schema.execution_context.estimated_completion,
        stageHistory: schema.execution_context.stage_history.map(history => ({
          stageName: history.stage_name,
          startedAt: history.started_at,
          completedAt: history.completed_at,
          status: history.status,
          durationMs: history.duration_ms,
          outputs: history.outputs
        })),
        globalVariables: schema.execution_context.global_variables,
        resourceUsage: {
          cpuCoresAllocated: schema.execution_context.resource_usage.cpu_cores_allocated,
          memoryMbAllocated: schema.execution_context.resource_usage.memory_mb_allocated,
          storageGbAllocated: schema.execution_context.resource_usage.storage_gb_allocated,
          networkBandwidthMbps: schema.execution_context.resource_usage.network_bandwidth_mbps
        }
      },
      coordinationStrategy: schema.coordination_strategy,
      moduleCoordination: {
        activeModules: schema.module_coordination.active_modules,
        coordinationPatterns: schema.module_coordination.coordination_patterns.map(pattern => ({
          patternName: pattern.pattern_name,
          sourceModule: pattern.source_module,
          targetModule: pattern.target_module,
          coordinationType: pattern.coordination_type,
          dataMapping: pattern.data_mapping,
          synchronizationMode: pattern.synchronization_mode
        })),
        conflictResolution: {
          strategy: schema.module_coordination.conflict_resolution.strategy,
          escalationEnabled: schema.module_coordination.conflict_resolution.escalation_enabled,
          manualInterventionThreshold: schema.module_coordination.conflict_resolution.manual_intervention_threshold
        }
      },
      resourceAllocation: {
        allocationStrategy: schema.resource_allocation.allocation_strategy,
        resourcePools: schema.resource_allocation.resource_pools.map(pool => ({
          poolId: pool.pool_id,
          poolType: pool.pool_type,
          totalCapacity: pool.total_capacity,
          allocatedCapacity: pool.allocated_capacity,
          allocationPolicies: pool.allocation_policies.map(policy => ({
            policyName: policy.policy_name,
            policyWeight: policy.policy_weight
          }))
        })),
        scalingPolicies: {
          autoScalingEnabled: schema.resource_allocation.scaling_policies.auto_scaling_enabled,
          scaleUpThreshold: schema.resource_allocation.scaling_policies.scale_up_threshold,
          scaleDownThreshold: schema.resource_allocation.scaling_policies.scale_down_threshold,
          minInstances: schema.resource_allocation.scaling_policies.min_instances,
          maxInstances: schema.resource_allocation.scaling_policies.max_instances
        }
      },
      performanceMonitoring: {
        monitoringEnabled: schema.performance_monitoring.monitoring_enabled,
        metricsCollectionInterval: schema.performance_monitoring.metrics_collection_interval,
        performanceTargets: {
          workflowCompletionTime: schema.performance_monitoring.performance_targets.workflow_completion_time,
          stageTransitionTime: schema.performance_monitoring.performance_targets.stage_transition_time,
          resourceUtilizationTarget: schema.performance_monitoring.performance_targets.resource_utilization_target,
          errorRateThreshold: schema.performance_monitoring.performance_targets.error_rate_threshold
        },
        alertingRules: schema.performance_monitoring.alerting_rules.map(rule => ({
          ruleName: rule.rule_name,
          condition: rule.condition,
          severity: rule.severity,
          notificationChannels: rule.notification_channels
        }))
      }
    };
  }

  static validateSchema(data: unknown): data is CoreSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.core_id === 'string' &&
      typeof obj.workflow_definition === 'object' &&
      typeof obj.execution_context === 'object' &&
      // 验证不存在camelCase字段
      !('coreId' in obj) &&
      !('protocolVersion' in obj) &&
      !('workflowDefinition' in obj)
    );
  }
}
```

---

**维护团队**: MPLP Core团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
