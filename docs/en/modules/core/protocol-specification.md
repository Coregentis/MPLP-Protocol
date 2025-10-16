# Core Module Protocol Specification

> **🌐 Language Navigation**: [English](protocol-specification.md) | [中文](../../../zh-CN/modules/core/protocol-specification.md)



**MPLP L2 Coordination Layer - Core Module Protocol Definition**

[![Protocol](https://img.shields.io/badge/protocol-Core%20v1.0-red.svg)](./README.md)
[![Schema](https://img.shields.io/badge/schema-JSON%20Schema%20Draft--07-blue.svg)](../../architecture/schema-system.md)
[![Status](https://img.shields.io/badge/status-Stable-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/core/protocol-specification.md)

---

## 🎯 Protocol Overview

The Core Module Protocol defines the standardized communication interface for the central orchestration system in MPLP. This protocol enables seamless coordination between all L2 modules, resource management, workflow orchestration, and system health monitoring.

### **Protocol Characteristics**
- **Version**: 1.0.0-alpha
- **Schema Standard**: JSON Schema Draft-07
- **Serialization**: JSON with optional binary extensions
- **Transport**: HTTP/HTTPS, WebSocket, gRPC
- **Authentication**: JWT-based with role-based access control
- **Naming Convention**: snake_case for protocol, camelCase for TypeScript

---

## 📋 Message Types

### **1. System Control Messages**

#### **System Status Request**
```json
{
  "message_type": "system_status_request",
  "message_id": "msg-001",
  "timestamp": "2025-09-03T10:00:00Z",
  "sender": {
    "module_id": "client-001",
    "module_type": "external_client"
  },
  "request": {
    "include_modules": true,
    "include_metrics": true,
    "include_health": true,
    "time_range": {
      "start": "2025-09-03T09:00:00Z",
      "end": "2025-09-03T10:00:00Z"
    }
  }
}
```

#### **System Status Response**
```json
{
  "message_type": "system_status_response",
  "message_id": "msg-001",
  "correlation_id": "msg-001",
  "timestamp": "2025-09-03T10:00:01Z",
  "sender": {
    "module_id": "core-orchestrator",
    "module_type": "core_module"
  },
  "response": {
    "system_id": "mplp-system-001",
    "status": "healthy",
    "uptime": 86400,
    "version": "1.0.0-alpha",
    "modules": {
      "context_module": {
        "status": "healthy",
        "version": "1.0.0-alpha",
        "active_contexts": 15,
        "response_time_ms": 45
      },
      "plan_module": {
        "status": "healthy",
        "version": "1.0.0-alpha",
        "active_plans": 8,
        "response_time_ms": 32
      }
    },
    "metrics": {
      "total_requests": 125000,
      "success_rate": 0.998,
      "average_response_time_ms": 38,
      "active_workflows": 23,
      "resource_utilization": {
        "cpu_percent": 45.2,
        "memory_percent": 62.8,
        "disk_percent": 23.1,
        "network_mbps": 15.7
      }
    }
  }
}
```

### **2. Workflow Management Messages**

#### **Create Workflow Request**
```json
{
  "message_type": "create_workflow_request",
  "message_id": "msg-002",
  "timestamp": "2025-09-03T10:01:00Z",
  "sender": {
    "module_id": "workflow-client-001",
    "module_type": "external_client"
  },
  "request": {
    "workflow_definition": {
      "name": "document_processing_pipeline",
      "description": "Process documents through multiple agents",
      "version": "1.0",
      "steps": [
        {
          "step_id": "parse_documents",
          "module": "context_module",
          "action": "create_context",
          "input_schema": {
            "type": "object",
            "properties": {
              "context_name": {"type": "string"},
              "context_type": {"type": "string"},
              "max_participants": {"type": "number"}
            }
          },
          "timeout_ms": 30000,
          "retry_policy": {
            "max_retries": 3,
            "backoff_strategy": "exponential"
          }
        },
        {
          "step_id": "create_plan",
          "module": "plan_module",
          "action": "create_plan",
          "depends_on": ["parse_documents"],
          "input_mapping": {
            "context_id": "${parse_documents.output.context_id}"
          },
          "timeout_ms": 60000
        }
      ],
      "error_handling": {
        "strategy": "rollback",
        "cleanup_steps": ["cleanup_context", "release_resources"]
      }
    },
    "execution_context": {
      "priority": "normal",
      "resource_limits": {
        "max_memory_mb": 1024,
        "max_cpu_cores": 2,
        "max_execution_time_ms": 300000
      }
    }
  }
}
```

#### **Create Workflow Response**
```json
{
  "message_type": "create_workflow_response",
  "message_id": "msg-002",
  "correlation_id": "msg-002",
  "timestamp": "2025-09-03T10:01:01Z",
  "sender": {
    "module_id": "core-orchestrator",
    "module_type": "core_module"
  },
  "response": {
    "workflow_id": "wf-001",
    "status": "created",
    "validation_result": {
      "valid": true,
      "warnings": [],
      "estimated_duration_ms": 180000,
      "estimated_resources": {
        "cpu_cores": 1.5,
        "memory_mb": 512,
        "storage_mb": 100
      }
    },
    "execution_plan": {
      "total_steps": 2,
      "parallel_steps": 0,
      "sequential_steps": 2,
      "critical_path": ["parse_documents", "create_plan"]
    }
  }
}
```

### **3. Resource Management Messages**

#### **Resource Allocation Request**
```json
{
  "message_type": "resource_allocation_request",
  "message_id": "msg-003",
  "timestamp": "2025-09-03T10:02:00Z",
  "sender": {
    "module_id": "context-module-001",
    "module_type": "context_module"
  },
  "request": {
    "allocation_id": "alloc-001",
    "resource_type": "compute",
    "requirements": {
      "cpu_cores": 4,
      "memory_mb": 2048,
      "storage_mb": 500,
      "network_bandwidth_mbps": 10
    },
    "constraints": {
      "max_duration_ms": 3600000,
      "priority": "high",
      "affinity": {
        "node_type": "compute_optimized",
        "region": "us-east-1"
      }
    },
    "purpose": "multi_agent_coordination",
    "metadata": {
      "workflow_id": "wf-001",
      "step_id": "parse_documents",
      "requester_context": "ctx-001"
    }
  }
}
```

#### **Resource Allocation Response**
```json
{
  "message_type": "resource_allocation_response",
  "message_id": "msg-003",
  "correlation_id": "msg-003",
  "timestamp": "2025-09-03T10:02:01Z",
  "sender": {
    "module_id": "core-orchestrator",
    "module_type": "core_module"
  },
  "response": {
    "allocation_id": "alloc-001",
    "status": "allocated",
    "allocated_resources": {
      "cpu_cores": 4,
      "memory_mb": 2048,
      "storage_mb": 500,
      "network_bandwidth_mbps": 10,
      "node_id": "node-compute-001",
      "region": "us-east-1"
    },
    "allocation_details": {
      "allocated_at": "2025-09-03T10:02:01Z",
      "expires_at": "2025-09-03T11:02:01Z",
      "lease_duration_ms": 3600000,
      "renewal_token": "renewal-token-001"
    },
    "usage_monitoring": {
      "metrics_endpoint": "https://metrics.mplp.org/alloc-001",
      "alert_thresholds": {
        "cpu_percent": 90,
        "memory_percent": 85,
        "storage_percent": 80
      }
    }
  }
}
```

### **4. Health Monitoring Messages**

#### **Health Check Request**
```json
{
  "message_type": "health_check_request",
  "message_id": "msg-004",
  "timestamp": "2025-09-03T10:03:00Z",
  "sender": {
    "module_id": "health-monitor-001",
    "module_type": "monitoring_client"
  },
  "request": {
    "check_type": "comprehensive",
    "include_components": [
      "core_orchestrator",
      "resource_manager",
      "workflow_engine",
      "all_modules"
    ],
    "include_metrics": true,
    "include_performance": true,
    "time_window_ms": 300000
  }
}
```

#### **Health Check Response**
```json
{
  "message_type": "health_check_response",
  "message_id": "msg-004",
  "correlation_id": "msg-004",
  "timestamp": "2025-09-03T10:03:01Z",
  "sender": {
    "module_id": "core-orchestrator",
    "module_type": "core_module"
  },
  "response": {
    "overall_health": "healthy",
    "health_score": 0.98,
    "components": {
      "core_orchestrator": {
        "status": "healthy",
        "response_time_ms": 12,
        "error_rate": 0.001,
        "uptime_percent": 99.99
      },
      "resource_manager": {
        "status": "healthy",
        "available_resources": {
          "cpu_cores": 16,
          "memory_mb": 32768,
          "storage_gb": 1000
        },
        "utilization": {
          "cpu_percent": 45.2,
          "memory_percent": 62.8,
          "storage_percent": 23.1
        }
      },
      "workflow_engine": {
        "status": "healthy",
        "active_workflows": 23,
        "completed_workflows": 1247,
        "failed_workflows": 3,
        "success_rate": 0.998
      }
    },
    "performance_metrics": {
      "throughput_requests_per_second": 1250,
      "average_response_time_ms": 38,
      "p95_response_time_ms": 95,
      "p99_response_time_ms": 180,
      "error_rate": 0.002
    },
    "alerts": [
      {
        "alert_id": "alert-001",
        "severity": "warning",
        "message": "Memory usage approaching 70% threshold",
        "component": "resource_manager",
        "timestamp": "2025-09-03T10:02:45Z"
      }
    ]
  }
}
```

### **5. Event Coordination Messages**

#### **Module Event Notification**
```json
{
  "message_type": "module_event_notification",
  "message_id": "msg-005",
  "timestamp": "2025-09-03T10:04:00Z",
  "sender": {
    "module_id": "context-module-001",
    "module_type": "context_module"
  },
  "event": {
    "event_id": "evt-001",
    "event_type": "context_created",
    "event_category": "lifecycle",
    "severity": "info",
    "data": {
      "context_id": "ctx-001",
      "context_name": "document_processing_session",
      "context_type": "collaborative",
      "max_participants": 10,
      "created_by": "user-001",
      "metadata": {
        "purpose": "document_analysis",
        "priority": "normal",
        "tags": ["nlp", "analysis", "collaboration"]
      }
    },
    "correlation": {
      "workflow_id": "wf-001",
      "step_id": "parse_documents",
      "trace_id": "trace-001"
    }
  }
}
```

#### **Coordination Response**
```json
{
  "message_type": "coordination_response",
  "message_id": "msg-005",
  "correlation_id": "msg-005",
  "timestamp": "2025-09-03T10:04:01Z",
  "sender": {
    "module_id": "core-orchestrator",
    "module_type": "core_module"
  },
  "response": {
    "coordination_id": "coord-001",
    "status": "coordinated",
    "actions_taken": [
      {
        "target_module": "plan_module",
        "action": "create_default_plan",
        "parameters": {
          "context_id": "ctx-001",
          "plan_type": "collaborative",
          "auto_start": false
        },
        "status": "initiated",
        "action_id": "action-001"
      },
      {
        "target_module": "role_module",
        "action": "assign_default_roles",
        "parameters": {
          "context_id": "ctx-001",
          "role_template": "document_processing"
        },
        "status": "initiated",
        "action_id": "action-002"
      },
      {
        "target_module": "trace_module",
        "action": "start_monitoring",
        "parameters": {
          "context_id": "ctx-001",
          "monitoring_level": "detailed"
        },
        "status": "initiated",
        "action_id": "action-003"
      }
    ],
    "coordination_result": {
      "success_count": 3,
      "failure_count": 0,
      "total_actions": 3,
      "execution_time_ms": 125
    }
  }
}
```

---

## 🔧 Protocol Operations

### **Authentication and Authorization**

#### **JWT Token Structure**
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "mplp-key-001"
  },
  "payload": {
    "iss": "mplp-core-system",
    "sub": "module-context-001",
    "aud": "mplp-core-orchestrator",
    "exp": 1693747200,
    "iat": 1693743600,
    "jti": "jwt-001",
    "scope": [
      "core:system:read",
      "core:workflow:create",
      "core:resource:allocate",
      "core:health:read"
    ],
    "module_type": "context_module",
    "module_version": "1.0.0-alpha"
  }
}
```

#### **Permission Scopes**
- **core:system:read** - Read system status and configuration
- **core:system:write** - Modify system configuration
- **core:workflow:create** - Create new workflows
- **core:workflow:execute** - Execute workflows
- **core:workflow:manage** - Manage workflow lifecycle
- **core:resource:allocate** - Request resource allocation
- **core:resource:manage** - Manage resource pools
- **core:health:read** - Read health and metrics data
- **core:health:write** - Report health status
- **core:event:publish** - Publish system events
- **core:event:subscribe** - Subscribe to system events

### **Error Handling**

#### **Standard Error Response**
```json
{
  "message_type": "error_response",
  "message_id": "msg-error-001",
  "correlation_id": "msg-003",
  "timestamp": "2025-09-03T10:05:00Z",
  "sender": {
    "module_id": "core-orchestrator",
    "module_type": "core_module"
  },
  "error": {
    "error_code": "RESOURCE_ALLOCATION_FAILED",
    "error_message": "Insufficient resources available for allocation",
    "error_category": "resource_management",
    "severity": "error",
    "details": {
      "requested_cpu": 8,
      "available_cpu": 4,
      "requested_memory_mb": 4096,
      "available_memory_mb": 2048,
      "constraint_violations": [
        "cpu_cores_exceeded",
        "memory_limit_exceeded"
      ]
    },
    "suggestions": [
      "Reduce resource requirements",
      "Wait for resources to become available",
      "Use resource reservation system"
    ],
    "retry_after_ms": 30000,
    "support_reference": "ERR-CORE-001"
  }
}
```

#### **Error Codes**
- **SYSTEM_UNAVAILABLE** - Core system is temporarily unavailable
- **AUTHENTICATION_FAILED** - Authentication token is invalid or expired
- **AUTHORIZATION_DENIED** - Insufficient permissions for operation
- **WORKFLOW_CREATION_FAILED** - Workflow definition is invalid
- **WORKFLOW_EXECUTION_FAILED** - Workflow execution encountered an error
- **RESOURCE_ALLOCATION_FAILED** - Resource allocation request failed
- **RESOURCE_NOT_FOUND** - Requested resource does not exist
- **HEALTH_CHECK_FAILED** - Health check operation failed
- **EVENT_PROCESSING_FAILED** - Event processing encountered an error
- **COORDINATION_FAILED** - Module coordination failed

### **Rate Limiting**

#### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1693747200
X-RateLimit-Window: 3600
```

#### **Rate Limit Policies**
- **System Status**: 100 requests/minute per client
- **Workflow Operations**: 50 requests/minute per client
- **Resource Allocation**: 200 requests/minute per client
- **Health Checks**: 1000 requests/minute per client
- **Event Publishing**: 500 requests/minute per client

---

## 📊 Protocol Metrics

### **Performance Metrics**

#### **Response Time Targets**
- **System Status**: < 20ms (P95)
- **Workflow Creation**: < 50ms (P95)
- **Resource Allocation**: < 100ms (P95)
- **Health Checks**: < 10ms (P95)
- **Event Processing**: < 5ms (P95)

#### **Throughput Targets**
- **Concurrent Connections**: 10,000+
- **Messages per Second**: 50,000+
- **Workflow Operations**: 1,000/second
- **Resource Requests**: 5,000/second
- **Health Checks**: 10,000/second

### **Reliability Metrics**

#### **Availability Targets**
- **System Availability**: 99.9% uptime
- **API Availability**: 99.95% uptime
- **Data Consistency**: 99.99% accuracy
- **Message Delivery**: 99.9% success rate

#### **Error Rate Targets**
- **Overall Error Rate**: < 0.1%
- **Authentication Errors**: < 0.01%
- **Resource Allocation Errors**: < 0.5%
- **Workflow Execution Errors**: < 0.2%
- **System Errors**: < 0.05%

---

**Protocol Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Compatibility**: MPLP v1.0 Alpha and later  

**⚠️ Alpha Notice**: Protocol specifications may evolve based on implementation feedback and performance optimization during the Alpha phase.
