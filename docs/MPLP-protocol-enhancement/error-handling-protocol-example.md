# MPLP错误处理协议示例

## 📋 **示例概述**

**基于Schema**: `mplp-error-handling.json`  
**示例版本**: MPLP v1.0.0  
**创建时间**: 2025-08-12  
**用途**: 演示统一错误处理协议的完整使用方法

## 🚨 **错误信息示例**

### **标准错误信息结构**

```json
{
  "error_info": {
    "error_id": "550e8400-e29b-41d4-a716-446655440001",
    "error_code": "CORD0001",
    "error_category": "validation",
    "error_severity": "medium",
    "error_message": "协调请求参数验证失败",
    "technical_message": "Required field 'target_module' is missing in coordination request",
    "error_details": {
      "missing_fields": ["target_module"],
      "provided_fields": ["source_module", "operation", "payload"],
      "validation_rules": {
        "target_module": "required, must be valid module type"
      }
    },
    "source_module": "coordination",
    "source_function": "validateCoordinationRequest",
    "stack_trace": [
      {
        "module": "coordination",
        "function_name": "validateCoordinationRequest",
        "file_path": "src/modules/coordination/validators.ts",
        "line_number": 45,
        "column_number": 12
      },
      {
        "module": "coordination",
        "function_name": "processCoordinationRequest",
        "file_path": "src/modules/coordination/processor.ts",
        "line_number": 123,
        "column_number": 8
      }
    ],
    "context": {
      "request_id": "req-550e8400-e29b-41d4-a716-446655440002",
      "session_id": "sess-550e8400-e29b-41d4-a716-446655440003",
      "user_id": "user123",
      "operation": "create_coordination_request",
      "input_parameters": {
        "source_module": "context",
        "operation": "get_context_data",
        "payload": {"context_id": "ctx-001"}
      },
      "environment": "production"
    },
    "recovery_suggestions": [
      {
        "strategy": "retry",
        "description": "添加缺失的target_module字段后重试",
        "automated": false,
        "success_probability": 0.95
      },
      {
        "strategy": "fallback",
        "description": "使用默认目标模块进行处理",
        "automated": true,
        "success_probability": 0.8
      }
    ],
    "occurred_at": "2025-08-12T10:30:00Z"
  }
}
```

## 🔄 **错误传播示例**

### **跨模块错误传播链**

```json
{
  "error_propagation": {
    "propagation_id": "prop-550e8400-e29b-41d4-a716-446655440004",
    "original_error": {
      "error_id": "550e8400-e29b-41d4-a716-446655440001",
      "error_code": "CORD0001",
      "error_category": "validation",
      "error_severity": "medium",
      "error_message": "协调请求参数验证失败",
      "source_module": "coordination",
      "occurred_at": "2025-08-12T10:30:00Z"
    },
    "propagation_chain": [
      {
        "module": "core",
        "function": "handleCoordinationError",
        "transformation": "wrapped",
        "added_context": {
          "workflow_id": "wf-001",
          "step_id": "step-003"
        },
        "timestamp": "2025-08-12T10:30:01Z"
      },
      {
        "module": "orchestration",
        "function": "processWorkflowError",
        "transformation": "enriched",
        "added_context": {
          "workflow_status": "failed",
          "affected_steps": ["step-003", "step-004"]
        },
        "timestamp": "2025-08-12T10:30:02Z"
      }
    ],
    "final_error": {
      "error_id": "550e8400-e29b-41d4-a716-446655440005",
      "error_code": "ORCH0001",
      "error_category": "business",
      "error_severity": "high",
      "error_message": "工作流执行失败：协调步骤验证错误",
      "source_module": "orchestration",
      "occurred_at": "2025-08-12T10:30:02Z"
    },
    "propagation_rules": [
      {
        "rule_name": "coordination_to_orchestration",
        "condition": "error_category == 'validation' && source_module == 'coordination'",
        "action": "transform",
        "transformation_template": "工作流执行失败：{original_error_message}"
      }
    ]
  }
}
```

## 🔧 **错误恢复示例**

### **自动错误恢复流程**

```json
{
  "error_recovery": {
    "recovery_id": "rec-550e8400-e29b-41d4-a716-446655440006",
    "error_id": "550e8400-e29b-41d4-a716-446655440001",
    "recovery_strategy": "retry",
    "recovery_attempts": [
      {
        "attempt_number": 1,
        "strategy_used": "retry",
        "attempt_timestamp": "2025-08-12T10:30:05Z",
        "success": false,
        "duration_ms": 150,
        "failure_reason": "Same validation error persists"
      },
      {
        "attempt_number": 2,
        "strategy_used": "fallback",
        "attempt_timestamp": "2025-08-12T10:30:10Z",
        "success": true,
        "duration_ms": 200,
        "result_data": {
          "fallback_target_module": "context",
          "processed_successfully": true
        }
      }
    ],
    "final_outcome": "recovered",
    "recovery_metadata": {
      "total_attempts": 2,
      "total_duration_ms": 350,
      "resources_consumed": {
        "cpu_time_ms": 50,
        "memory_mb": 2.5
      },
      "side_effects": [
        "Used fallback target module",
        "Logged recovery event"
      ]
    },
    "completed_at": "2025-08-12T10:30:10Z"
  }
}
```

## 📊 **错误监控示例**

### **错误统计和趋势分析**

```json
{
  "error_monitoring": {
    "monitoring_id": "mon-550e8400-e29b-41d4-a716-446655440007",
    "time_window": {
      "start_time": "2025-08-12T10:00:00Z",
      "end_time": "2025-08-12T11:00:00Z",
      "duration_ms": 3600000
    },
    "error_statistics": {
      "total_errors": 45,
      "errors_by_category": {
        "validation": 20,
        "network": 10,
        "timeout": 8,
        "resource": 5,
        "system": 2
      },
      "errors_by_severity": {
        "low": 15,
        "medium": 20,
        "high": 8,
        "critical": 2,
        "fatal": 0
      },
      "errors_by_module": {
        "coordination": 15,
        "orchestration": 12,
        "transaction": 8,
        "eventBus": 6,
        "stateSync": 4
      },
      "error_rate": 0.0125,
      "recovery_success_rate": 0.87
    },
    "trending_data": {
      "error_trend": "stable",
      "trend_confidence": 0.85,
      "predicted_next_hour": 48,
      "anomaly_detected": false
    },
    "alert_thresholds": {
      "error_rate_threshold": 0.05,
      "critical_error_threshold": 5,
      "recovery_failure_threshold": 0.2
    }
  }
}
```

## 📢 **错误通知示例**

### **多渠道错误通知**

```json
{
  "error_notification": {
    "notification_id": "notif-550e8400-e29b-41d4-a716-446655440008",
    "error_id": "550e8400-e29b-41d4-a716-446655440001",
    "notification_type": "immediate",
    "recipients": [
      {
        "recipient_type": "team",
        "recipient_id": "ops-team",
        "notification_method": "email",
        "priority": "high"
      },
      {
        "recipient_type": "system",
        "recipient_id": "monitoring-dashboard",
        "notification_method": "webhook",
        "priority": "normal"
      }
    ],
    "notification_content": {
      "subject": "MPLP协调模块错误告警",
      "summary": "协调请求验证失败，已触发自动恢复",
      "detailed_message": "在处理协调请求时发生验证错误，缺少必需的target_module字段。系统已自动使用fallback策略成功恢复。",
      "action_items": [
        "检查客户端请求格式",
        "验证API文档是否需要更新",
        "考虑增强输入验证提示"
      ]
    },
    "delivery_status": {
      "sent_at": "2025-08-12T10:30:15Z",
      "delivery_attempts": 1,
      "successful_deliveries": 2,
      "failed_deliveries": 0
    }
  }
}
```

## 🎯 **错误代码规范**

### **错误代码格式**
- **格式**: `ABCD1234`
- **A-D**: 模块或功能标识
- **1234**: 具体错误编号

### **模块错误代码前缀**
- `CORD`: Coordination (协调模块)
- `ORCH`: Orchestration (编排模块)
- `TRAN`: Transaction (事务模块)
- `EVNT`: Event Bus (事件总线)
- `SYNC`: State Sync (状态同步)
- `CORE`: Core (核心模块)
- `CTXT`: Context (上下文模块)
- `PLAN`: Plan (计划模块)
- `CONF`: Confirm (确认模块)
- `TRAC`: Trace (追踪模块)
- `ROLE`: Role (角色模块)
- `EXTN`: Extension (扩展模块)
- `COLB`: Collab (协作模块)
- `DIAL`: Dialog (对话模块)
- `NETW`: Network (网络模块)

### **常见错误代码示例**
- `CORD0001`: 协调请求参数验证失败
- `CORD0002`: 协调目标模块不可用
- `ORCH0001`: 工作流编排失败
- `TRAN0001`: 事务提交失败
- `EVNT0001`: 事件发布失败
- `SYNC0001`: 状态同步冲突

## 🔧 **使用指南**

### **错误处理最佳实践**
1. **统一错误格式**: 使用标准错误信息结构
2. **详细上下文**: 提供充分的错误上下文信息
3. **恢复建议**: 为每个错误提供恢复策略
4. **错误传播**: 正确处理跨模块错误传播
5. **监控告警**: 建立完善的错误监控体系

### **错误处理流程**
1. **错误捕获**: 在适当位置捕获错误
2. **错误包装**: 使用标准格式包装错误信息
3. **错误传播**: 按照传播规则传递错误
4. **错误恢复**: 尝试自动恢复策略
5. **错误通知**: 发送相关通知
6. **错误记录**: 记录错误用于分析

### **集成示例**
```typescript
// 错误处理集成示例
import { ErrorInfo, ErrorRecovery } from './mplp-error-handling';

try {
  // 业务逻辑
} catch (error) {
  const errorInfo: ErrorInfo = {
    error_id: generateUUID(),
    error_code: 'CORD0001',
    error_category: 'validation',
    error_severity: 'medium',
    error_message: '协调请求参数验证失败',
    source_module: 'coordination',
    occurred_at: new Date().toISOString()
  };
  
  // 尝试错误恢复
  const recovery = await attemptErrorRecovery(errorInfo);
  
  // 发送错误通知
  await sendErrorNotification(errorInfo);
}
```

---

**示例版本**: v1.0.0  
**创建时间**: 2025-08-12  
**适用范围**: MPLP错误处理协议  
**维护状态**: 活跃维护
