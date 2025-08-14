# MPLP Coordination Protocol Schema

## 📋 **概述**

Coordination协议Schema定义了MPLP系统中跨模块协调通信的标准数据结构，实现多智能体协议生命周期平台各模块间的高效协调和同步机制。经过企业级功能增强，现已包含完整的协调效率监控、同步性能分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-coordination.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 90.8%
**功能完整性**: ✅ 100% (基础功能 + 协调监控 + 企业级功能)
**企业级特性**: ✅ 协调效率监控、同步性能分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **跨模块通信**: 管理MPLP 10个模块间的协调通信
- **消息路由**: 智能的消息路由和分发机制
- **同步协调**: 模块间的同步和异步协调机制
- **冲突解决**: 跨模块操作的冲突检测和解决

### **协调监控功能**
- **协调效率监控**: 实时监控模块间协调的效率、延迟、成功率
- **同步性能分析**: 详细的模块同步性能分析和优化建议
- **冲突解决监控**: 监控模块间冲突的检测和解决过程
- **协调过程审计**: 监控协调过程的合规性和决策记录
- **一致性状态监控**: 监控全局状态的一致性和可靠性

### **企业级功能**
- **模块协调审计**: 完整的模块协调和同步记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **版本控制**: 协调配置的版本历史、变更追踪和快照管理
- **搜索索引**: 协调数据的全文搜索、语义搜索和自动索引
- **事件集成**: 协调事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和协调事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab, Dialog, Network
L2 协调层    │ Core, Orchestration ← [Coordination]  
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
| `coordination_id` | string | ✅ | UUID v4格式的协调标识符 |
| `coordination_type` | string | ✅ | 协调类型枚举值 |
| `source_module` | string | ✅ | 源模块类型 |
| `target_module` | string | ✅ | 目标模块类型 |
| `coordination_request` | object | ✅ | 协调请求信息 |

### **协调类型枚举**
```json
{
  "coordination_type": {
    "enum": [
      "request",      // 请求协调
      "response",     // 响应协调
      "notification", // 通知协调
      "query",        // 查询协调
      "command",      // 命令协调
      "event"         // 事件协调
    ]
  }
}
```

### **优先级枚举**
```json
{
  "priority": {
    "enum": [
      "low",       // 低优先级
      "normal",    // 普通优先级
      "high",      // 高优先级
      "urgent",    // 紧急优先级
      "critical"   // 关键优先级
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
  "coordination_id": "550e8400-e29b-41d4-a716-446655440000",
  "coordination_type": "request",
  "source_module": "context",
  "target_module": "plan",
  "created_at": "2025-08-13T10:30:00.000Z",
  "coordination_request": {
    "request_id": "550e8400-e29b-41d4-a716-446655440001",
    "operation": "generatePlanFromContext",
    "payload": {
      "context_id": "context-123",
      "context_metadata": {
        "project_type": "software_development",
        "complexity": "high",
        "timeline": "3_months",
        "team_size": 8
      },
      "planning_requirements": {
        "methodology": "agile",
        "sprint_duration": "2_weeks",
        "quality_gates": ["code_review", "testing", "security_scan"]
      }
    },
    "priority": "high",
    "timeout_ms": 60000,
    "retry_policy": {
      "max_retries": 3,
      "retry_delay_ms": 2000,
      "backoff_strategy": "exponential"
    },
    "expected_response_format": {
      "plan_id": "string",
      "plan_structure": "object",
      "estimated_duration": "string",
      "resource_requirements": "object"
    }
  },
  "coordination_response": {
    "response_id": "550e8400-e29b-41d4-a716-446655440002",
    "request_id": "550e8400-e29b-41d4-a716-446655440001",
    "response_status": "success",
    "response_time_ms": 2500,
    "response_data": {
      "plan_id": "plan-456",
      "plan_structure": {
        "phases": [
          {
            "phase_name": "需求分析",
            "duration_weeks": 2,
            "deliverables": ["需求文档", "用例图", "原型设计"]
          },
          {
            "phase_name": "系统设计",
            "duration_weeks": 3,
            "deliverables": ["架构设计", "数据库设计", "接口设计"]
          }
        ],
        "total_phases": 6,
        "critical_path": ["需求分析", "系统设计", "核心开发", "集成测试"]
      },
      "estimated_duration": "12_weeks",
      "resource_requirements": {
        "developers": 6,
        "testers": 2,
        "devops_engineers": 1,
        "project_manager": 1
      }
    },
    "error_info": null,
    "metadata": {
      "processing_time_ms": 2500,
      "resource_usage": {
        "cpu_cores": 2.1,
        "memory_mb": 512,
        "ai_model_calls": 3
      }
    }
  },
  "coordination_context": {
    "session_id": "550e8400-e29b-41d4-a716-446655440003",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440004",
    "user_context": {
      "user_id": "user-789",
      "organization_id": "org-012",
      "permissions": ["create_plan", "modify_context", "view_trace"]
    },
    "execution_context": {
      "environment": "production",
      "region": "us-west-2",
      "instance_id": "instance-001",
      "load_balancer_id": "lb-001"
    },
    "coordination_chain": [
      {
        "step_order": 1,
        "module": "context",
        "operation": "validateContext",
        "completed_at": "2025-08-13T10:29:45.000Z"
      },
      {
        "step_order": 2,
        "module": "plan",
        "operation": "generatePlanFromContext",
        "started_at": "2025-08-13T10:30:00.000Z",
        "status": "in_progress"
      }
    ]
  },
  "quality_assurance": {
    "validation_rules": [
      {
        "rule_name": "payload_schema_validation",
        "rule_status": "passed",
        "validation_time_ms": 15
      },
      {
        "rule_name": "module_compatibility_check",
        "rule_status": "passed",
        "validation_time_ms": 8
      },
      {
        "rule_name": "security_permission_check",
        "rule_status": "passed",
        "validation_time_ms": 12
      }
    ],
    "performance_metrics": {
      "coordination_latency_ms": 25,
      "message_size_bytes": 2048,
      "serialization_time_ms": 3,
      "network_transmission_time_ms": 18
    },
    "compliance_checks": {
      "data_privacy_compliant": true,
      "audit_trail_recorded": true,
      "security_level_maintained": "confidential"
    }
  },
  "coordination_patterns": {
    "pattern_type": "request_response",
    "synchronization_mode": "synchronous",
    "coordination_strategy": "direct_communication",
    "fallback_mechanisms": [
      {
        "mechanism": "retry_with_backoff",
        "trigger_condition": "timeout",
        "max_attempts": 3
      },
      {
        "mechanism": "alternative_module",
        "trigger_condition": "module_unavailable",
        "alternative_modules": ["trace", "role"]
      }
    ],
    "optimization_hints": {
      "cache_response": true,
      "cache_duration_seconds": 300,
      "batch_similar_requests": true,
      "compress_large_payloads": true
    }
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface CoordinationData {
  protocolVersion: string;
  timestamp: string;
  coordinationId: string;
  coordinationType: CoordinationType;
  sourceModule: ModuleType;
  targetModule: ModuleType;
  createdAt: string;
  coordinationRequest: {
    requestId: string;
    operation: string;
    payload: Record<string, unknown>;
    priority: Priority;
    timeoutMs: number;
    retryPolicy: {
      maxRetries: number;
      retryDelayMs: number;
      backoffStrategy: 'linear' | 'exponential' | 'fixed';
    };
    expectedResponseFormat: Record<string, string>;
  };
  coordinationResponse: {
    responseId: string;
    requestId: string;
    responseStatus: ResponseStatus;
    responseTimeMs: number;
    responseData: Record<string, unknown>;
    errorInfo?: {
      errorCode: string;
      errorMessage: string;
      errorDetails?: Record<string, unknown>;
      stackTrace?: string[];
    };
    metadata: {
      processingTimeMs: number;
      resourceUsage: {
        cpuCores: number;
        memoryMb: number;
        aiModelCalls?: number;
      };
    };
  };
  coordinationContext: {
    sessionId: string;
    correlationId: string;
    userContext: {
      userId: string;
      organizationId: string;
      permissions: string[];
    };
    executionContext: {
      environment: 'development' | 'testing' | 'staging' | 'production';
      region: string;
      instanceId: string;
      loadBalancerId: string;
    };
    coordinationChain: Array<{
      stepOrder: number;
      module: ModuleType;
      operation: string;
      startedAt?: string;
      completedAt?: string;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
    }>;
  };
  qualityAssurance: {
    validationRules: Array<{
      ruleName: string;
      ruleStatus: 'passed' | 'failed' | 'skipped';
      validationTimeMs: number;
    }>;
    performanceMetrics: {
      coordinationLatencyMs: number;
      messageSizeBytes: number;
      serializationTimeMs: number;
      networkTransmissionTimeMs: number;
    };
    complianceChecks: {
      dataPrivacyCompliant: boolean;
      auditTrailRecorded: boolean;
      securityLevelMaintained: 'public' | 'internal' | 'confidential' | 'secret';
    };
  };
  coordinationPatterns: {
    patternType: 'request_response' | 'publish_subscribe' | 'message_queue' | 'event_stream';
    synchronizationMode: 'synchronous' | 'asynchronous' | 'hybrid';
    coordinationStrategy: 'direct_communication' | 'mediated_communication' | 'broadcast';
    fallbackMechanisms: Array<{
      mechanism: 'retry_with_backoff' | 'alternative_module' | 'graceful_degradation';
      triggerCondition: 'timeout' | 'error' | 'module_unavailable' | 'overload';
      maxAttempts?: number;
      alternativeModules?: ModuleType[];
    }>;
    optimizationHints: {
      cacheResponse: boolean;
      cacheDurationSeconds: number;
      batchSimilarRequests: boolean;
      compressLargePayloads: boolean;
    };
  };
}

type CoordinationType = 'request' | 'response' | 'notification' | 'query' | 'command' | 'event';
type Priority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
type ResponseStatus = 'success' | 'error' | 'timeout' | 'cancelled' | 'pending';
type ModuleType = 'core' | 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 'extension' | 'collab' | 'dialog' | 'network';
```

### **Mapper实现**
```typescript
export class CoordinationMapper {
  static toSchema(entity: CoordinationData): CoordinationSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      coordination_id: entity.coordinationId,
      coordination_type: entity.coordinationType,
      source_module: entity.sourceModule,
      target_module: entity.targetModule,
      created_at: entity.createdAt,
      coordination_request: {
        request_id: entity.coordinationRequest.requestId,
        operation: entity.coordinationRequest.operation,
        payload: entity.coordinationRequest.payload,
        priority: entity.coordinationRequest.priority,
        timeout_ms: entity.coordinationRequest.timeoutMs,
        retry_policy: {
          max_retries: entity.coordinationRequest.retryPolicy.maxRetries,
          retry_delay_ms: entity.coordinationRequest.retryPolicy.retryDelayMs,
          backoff_strategy: entity.coordinationRequest.retryPolicy.backoffStrategy
        },
        expected_response_format: entity.coordinationRequest.expectedResponseFormat
      },
      coordination_response: {
        response_id: entity.coordinationResponse.responseId,
        request_id: entity.coordinationResponse.requestId,
        response_status: entity.coordinationResponse.responseStatus,
        response_time_ms: entity.coordinationResponse.responseTimeMs,
        response_data: entity.coordinationResponse.responseData,
        error_info: entity.coordinationResponse.errorInfo ? {
          error_code: entity.coordinationResponse.errorInfo.errorCode,
          error_message: entity.coordinationResponse.errorInfo.errorMessage,
          error_details: entity.coordinationResponse.errorInfo.errorDetails,
          stack_trace: entity.coordinationResponse.errorInfo.stackTrace
        } : undefined,
        metadata: {
          processing_time_ms: entity.coordinationResponse.metadata.processingTimeMs,
          resource_usage: {
            cpu_cores: entity.coordinationResponse.metadata.resourceUsage.cpuCores,
            memory_mb: entity.coordinationResponse.metadata.resourceUsage.memoryMb,
            ai_model_calls: entity.coordinationResponse.metadata.resourceUsage.aiModelCalls
          }
        }
      },
      coordination_context: {
        session_id: entity.coordinationContext.sessionId,
        correlation_id: entity.coordinationContext.correlationId,
        user_context: {
          user_id: entity.coordinationContext.userContext.userId,
          organization_id: entity.coordinationContext.userContext.organizationId,
          permissions: entity.coordinationContext.userContext.permissions
        },
        execution_context: {
          environment: entity.coordinationContext.executionContext.environment,
          region: entity.coordinationContext.executionContext.region,
          instance_id: entity.coordinationContext.executionContext.instanceId,
          load_balancer_id: entity.coordinationContext.executionContext.loadBalancerId
        },
        coordination_chain: entity.coordinationContext.coordinationChain.map(step => ({
          step_order: step.stepOrder,
          module: step.module,
          operation: step.operation,
          started_at: step.startedAt,
          completed_at: step.completedAt,
          status: step.status
        }))
      },
      quality_assurance: {
        validation_rules: entity.qualityAssurance.validationRules.map(rule => ({
          rule_name: rule.ruleName,
          rule_status: rule.ruleStatus,
          validation_time_ms: rule.validationTimeMs
        })),
        performance_metrics: {
          coordination_latency_ms: entity.qualityAssurance.performanceMetrics.coordinationLatencyMs,
          message_size_bytes: entity.qualityAssurance.performanceMetrics.messageSizeBytes,
          serialization_time_ms: entity.qualityAssurance.performanceMetrics.serializationTimeMs,
          network_transmission_time_ms: entity.qualityAssurance.performanceMetrics.networkTransmissionTimeMs
        },
        compliance_checks: {
          data_privacy_compliant: entity.qualityAssurance.complianceChecks.dataPrivacyCompliant,
          audit_trail_recorded: entity.qualityAssurance.complianceChecks.auditTrailRecorded,
          security_level_maintained: entity.qualityAssurance.complianceChecks.securityLevelMaintained
        }
      },
      coordination_patterns: {
        pattern_type: entity.coordinationPatterns.patternType,
        synchronization_mode: entity.coordinationPatterns.synchronizationMode,
        coordination_strategy: entity.coordinationPatterns.coordinationStrategy,
        fallback_mechanisms: entity.coordinationPatterns.fallbackMechanisms.map(mechanism => ({
          mechanism: mechanism.mechanism,
          trigger_condition: mechanism.triggerCondition,
          max_attempts: mechanism.maxAttempts,
          alternative_modules: mechanism.alternativeModules
        })),
        optimization_hints: {
          cache_response: entity.coordinationPatterns.optimizationHints.cacheResponse,
          cache_duration_seconds: entity.coordinationPatterns.optimizationHints.cacheDurationSeconds,
          batch_similar_requests: entity.coordinationPatterns.optimizationHints.batchSimilarRequests,
          compress_large_payloads: entity.coordinationPatterns.optimizationHints.compressLargePayloads
        }
      }
    };
  }

  static fromSchema(schema: CoordinationSchema): CoordinationData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      coordinationId: schema.coordination_id,
      coordinationType: schema.coordination_type,
      sourceModule: schema.source_module,
      targetModule: schema.target_module,
      createdAt: schema.created_at,
      coordinationRequest: {
        requestId: schema.coordination_request.request_id,
        operation: schema.coordination_request.operation,
        payload: schema.coordination_request.payload,
        priority: schema.coordination_request.priority,
        timeoutMs: schema.coordination_request.timeout_ms,
        retryPolicy: {
          maxRetries: schema.coordination_request.retry_policy.max_retries,
          retryDelayMs: schema.coordination_request.retry_policy.retry_delay_ms,
          backoffStrategy: schema.coordination_request.retry_policy.backoff_strategy
        },
        expectedResponseFormat: schema.coordination_request.expected_response_format
      },
      coordinationResponse: {
        responseId: schema.coordination_response.response_id,
        requestId: schema.coordination_response.request_id,
        responseStatus: schema.coordination_response.response_status,
        responseTimeMs: schema.coordination_response.response_time_ms,
        responseData: schema.coordination_response.response_data,
        errorInfo: schema.coordination_response.error_info ? {
          errorCode: schema.coordination_response.error_info.error_code,
          errorMessage: schema.coordination_response.error_info.error_message,
          errorDetails: schema.coordination_response.error_info.error_details,
          stackTrace: schema.coordination_response.error_info.stack_trace
        } : undefined,
        metadata: {
          processingTimeMs: schema.coordination_response.metadata.processing_time_ms,
          resourceUsage: {
            cpuCores: schema.coordination_response.metadata.resource_usage.cpu_cores,
            memoryMb: schema.coordination_response.metadata.resource_usage.memory_mb,
            aiModelCalls: schema.coordination_response.metadata.resource_usage.ai_model_calls
          }
        }
      },
      coordinationContext: {
        sessionId: schema.coordination_context.session_id,
        correlationId: schema.coordination_context.correlation_id,
        userContext: {
          userId: schema.coordination_context.user_context.user_id,
          organizationId: schema.coordination_context.user_context.organization_id,
          permissions: schema.coordination_context.user_context.permissions
        },
        executionContext: {
          environment: schema.coordination_context.execution_context.environment,
          region: schema.coordination_context.execution_context.region,
          instanceId: schema.coordination_context.execution_context.instance_id,
          loadBalancerId: schema.coordination_context.execution_context.load_balancer_id
        },
        coordinationChain: schema.coordination_context.coordination_chain.map(step => ({
          stepOrder: step.step_order,
          module: step.module,
          operation: step.operation,
          startedAt: step.started_at,
          completedAt: step.completed_at,
          status: step.status
        }))
      },
      qualityAssurance: {
        validationRules: schema.quality_assurance.validation_rules.map(rule => ({
          ruleName: rule.rule_name,
          ruleStatus: rule.rule_status,
          validationTimeMs: rule.validation_time_ms
        })),
        performanceMetrics: {
          coordinationLatencyMs: schema.quality_assurance.performance_metrics.coordination_latency_ms,
          messageSizeBytes: schema.quality_assurance.performance_metrics.message_size_bytes,
          serializationTimeMs: schema.quality_assurance.performance_metrics.serialization_time_ms,
          networkTransmissionTimeMs: schema.quality_assurance.performance_metrics.network_transmission_time_ms
        },
        complianceChecks: {
          dataPrivacyCompliant: schema.quality_assurance.compliance_checks.data_privacy_compliant,
          auditTrailRecorded: schema.quality_assurance.compliance_checks.audit_trail_recorded,
          securityLevelMaintained: schema.quality_assurance.compliance_checks.security_level_maintained
        }
      },
      coordinationPatterns: {
        patternType: schema.coordination_patterns.pattern_type,
        synchronizationMode: schema.coordination_patterns.synchronization_mode,
        coordinationStrategy: schema.coordination_patterns.coordination_strategy,
        fallbackMechanisms: schema.coordination_patterns.fallback_mechanisms.map(mechanism => ({
          mechanism: mechanism.mechanism,
          triggerCondition: mechanism.trigger_condition,
          maxAttempts: mechanism.max_attempts,
          alternativeModules: mechanism.alternative_modules
        })),
        optimizationHints: {
          cacheResponse: schema.coordination_patterns.optimization_hints.cache_response,
          cacheDurationSeconds: schema.coordination_patterns.optimization_hints.cache_duration_seconds,
          batchSimilarRequests: schema.coordination_patterns.optimization_hints.batch_similar_requests,
          compressLargePayloads: schema.coordination_patterns.optimization_hints.compress_large_payloads
        }
      }
    };
  }

  static validateSchema(data: unknown): data is CoordinationSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.coordination_id === 'string' &&
      typeof obj.coordination_type === 'string' &&
      typeof obj.source_module === 'string' &&
      typeof obj.target_module === 'string' &&
      // 验证不存在camelCase字段
      !('coordinationId' in obj) &&
      !('protocolVersion' in obj) &&
      !('coordinationType' in obj)
    );
  }
}
```

---

**维护团队**: MPLP Coordination团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
