# Context Module Protocol Specification

**Multi-Agent Protocol Lifecycle Platform - Context Module Protocol Specification v1.0.0-alpha**

[![Protocol](https://img.shields.io/badge/protocol-MPLP%20v1.0.0--alpha-blue.svg)](../../protocol-foundation/protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Context-green.svg)](./README.md)
[![Status](https://img.shields.io/badge/status-Stable-green.svg)](./implementation-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/context/protocol-specification.md)

---

## 🎯 Protocol Overview

This document defines the complete protocol specification for the Context Module, including message formats, communication patterns, state management protocols, and integration interfaces. The Context Module protocol enables standardized context management and participant coordination across distributed multi-agent systems.

### **Protocol Scope**
- **Context Lifecycle Protocol**: Creation, management, and termination of contexts
- **Participant Coordination Protocol**: Participant registration, role management, and coordination
- **State Synchronization Protocol**: Real-time state synchronization across distributed nodes
- **Event Notification Protocol**: Context-related event publishing and subscription
- **Integration Protocol**: Cross-module integration and coordination patterns

### **Protocol Compliance**
- **MPLP Core Protocol**: Fully compliant with MPLP v1.0.0-alpha core protocol
- **Message Format**: JSON-based message format with schema validation
- **Transport Layer**: HTTP/HTTPS, WebSocket, and message queue support
- **Security**: TLS encryption and authentication required for all communications
- **Versioning**: Semantic versioning with backward compatibility guarantees

---

## 📋 Message Format Specification

### **Base Message Structure**

All Context Module protocol messages follow the MPLP base message format:

```json
{
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-ctx-{uuid}",
  "message_type": "context.{operation}",
  "timestamp": "2025-09-03T10:00:00.000Z",
  "sender": {
    "sender_id": "string",
    "sender_type": "agent|system|service",
    "sender_version": "string"
  },
  "recipient": {
    "recipient_id": "string",
    "recipient_type": "agent|system|service|broadcast"
  },
  "correlation_id": "string",
  "reply_to": "string",
  "headers": {
    "content_type": "application/json",
    "encoding": "utf-8",
    "compression": "gzip",
    "priority": "normal|high|critical",
    "ttl": 30000
  },
  "payload": {
    // Message-specific payload
  },
  "metadata": {
    "trace_id": "string",
    "span_id": "string",
    "context_id": "string",
    "session_id": "string"
  }
}
```

### **Message Types**

#### **Context Lifecycle Messages**
- `context.create.request` - Request to create a new context
- `context.create.response` - Response to context creation request
- `context.update.request` - Request to update context configuration
- `context.update.response` - Response to context update request
- `context.delete.request` - Request to delete a context
- `context.delete.response` - Response to context deletion request
- `context.get.request` - Request to retrieve context information
- `context.get.response` - Response with context information
- `context.list.request` - Request to list contexts
- `context.list.response` - Response with context list

#### **Participant Management Messages**
- `context.participant.add.request` - Request to add participant
- `context.participant.add.response` - Response to add participant request
- `context.participant.remove.request` - Request to remove participant
- `context.participant.remove.response` - Response to remove participant request
- `context.participant.update.request` - Request to update participant
- `context.participant.update.response` - Response to update participant request
- `context.participant.list.request` - Request to list participants
- `context.participant.list.response` - Response with participant list

#### **State Synchronization Messages**
- `context.state.sync` - State synchronization message
- `context.state.update` - State update notification
- `context.state.conflict` - State conflict notification
- `context.state.resolved` - State conflict resolution

#### **Event Notification Messages**
- `context.event.created` - Context created event
- `context.event.updated` - Context updated event
- `context.event.deleted` - Context deleted event
- `context.event.participant.joined` - Participant joined event
- `context.event.participant.left` - Participant left event
- `context.event.state.changed` - Context state changed event

---

## 🔄 Protocol Operations

### **1. Context Creation Protocol**

#### **Create Context Request**
```json
{
  "message_type": "context.create.request",
  "payload": {
    "context_request": {
      "name": "collaborative-planning-session",
      "type": "collaborative",
      "description": "Multi-agent collaborative planning session",
      "configuration": {
        "max_participants": 10,
        "max_sessions": 5,
        "timeout_ms": 3600000,
        "persistence_level": "durable",
        "isolation_level": "shared",
        "auto_cleanup": true,
        "cleanup_delay_ms": 300000
      },
      "access_control": {
        "visibility": "private",
        "join_policy": "invitation_only",
        "required_capabilities": ["planning", "collaboration"],
        "required_roles": ["contributor"]
      },
      "metadata": {
        "tags": ["planning", "collaborative", "high-priority"],
        "category": "project-management",
        "priority": "high",
        "custom_data": {
          "project_id": "proj-001",
          "department": "engineering"
        }
      }
    }
  }
}
```

#### **Create Context Response**
```json
{
  "message_type": "context.create.response",
  "payload": {
    "context_response": {
      "success": true,
      "context": {
        "context_id": "ctx-001",
        "name": "collaborative-planning-session",
        "type": "collaborative",
        "status": "active",
        "version": "1.0.0",
        "configuration": {
          "max_participants": 10,
          "max_sessions": 5,
          "timeout_ms": 3600000,
          "persistence_level": "durable",
          "isolation_level": "shared",
          "auto_cleanup": true
        },
        "participant_count": 0,
        "session_count": 0,
        "created_at": "2025-09-03T10:00:00.000Z",
        "updated_at": "2025-09-03T10:00:00.000Z",
        "expires_at": "2025-09-03T11:00:00.000Z"
      },
      "access_info": {
        "context_url": "mplp://contexts/ctx-001",
        "join_token": "jwt-token-here",
        "permissions": ["read", "write", "manage_participants"]
      }
    }
  }
}
```

### **2. Participant Management Protocol**

#### **Add Participant Request**
```json
{
  "message_type": "context.participant.add.request",
  "payload": {
    "participant_request": {
      "context_id": "ctx-001",
      "participant": {
        "participant_id": "part-001",
        "agent_id": "agent-001",
        "participant_type": "agent",
        "display_name": "Planning Agent Alpha",
        "capabilities": ["strategic_planning", "resource_allocation", "risk_assessment"],
        "roles": ["contributor", "analyst"],
        "configuration": {
          "max_concurrent_tasks": 5,
          "timeout_ms": 300000,
          "notification_preferences": {
            "email": true,
            "push": false,
            "in_app": true
          }
        },
        "metadata": {
          "department": "engineering",
          "expertise_level": "senior",
          "availability": "full-time"
        }
      },
      "join_options": {
        "auto_assign_tasks": true,
        "send_welcome_message": true,
        "notify_existing_participants": true
      }
    }
  }
}
```

#### **Add Participant Response**
```json
{
  "message_type": "context.participant.add.response",
  "payload": {
    "participant_response": {
      "success": true,
      "participant": {
        "participant_id": "part-001",
        "agent_id": "agent-001",
        "context_id": "ctx-001",
        "status": "active",
        "roles": ["contributor", "analyst"],
        "permissions": ["read", "write", "comment"],
        "joined_at": "2025-09-03T10:05:00.000Z",
        "last_activity_at": "2025-09-03T10:05:00.000Z"
      },
      "context_info": {
        "participant_count": 1,
        "available_roles": ["reviewer", "approver"],
        "active_sessions": []
      }
    }
  }
}
```

### **3. State Synchronization Protocol**

#### **State Synchronization Message**
```json
{
  "message_type": "context.state.sync",
  "payload": {
    "state_sync": {
      "context_id": "ctx-001",
      "sync_type": "incremental",
      "version": 5,
      "base_version": 4,
      "changes": [
        {
          "change_id": "chg-001",
          "change_type": "participant_added",
          "timestamp": "2025-09-03T10:05:00.000Z",
          "data": {
            "participant_id": "part-001",
            "agent_id": "agent-001",
            "roles": ["contributor"]
          }
        },
        {
          "change_id": "chg-002",
          "change_type": "metadata_updated",
          "timestamp": "2025-09-03T10:06:00.000Z",
          "data": {
            "key": "priority",
            "old_value": "normal",
            "new_value": "high"
          }
        }
      ],
      "checksum": "sha256-hash-here",
      "sync_metadata": {
        "node_id": "node-001",
        "sync_reason": "participant_change",
        "conflict_resolution": "last_write_wins"
      }
    }
  }
}
```

### **4. Event Notification Protocol**

#### **Context Event Notification**
```json
{
  "message_type": "context.event.participant.joined",
  "payload": {
    "event": {
      "event_id": "evt-001",
      "event_type": "participant_joined",
      "context_id": "ctx-001",
      "timestamp": "2025-09-03T10:05:00.000Z",
      "data": {
        "participant_id": "part-001",
        "agent_id": "agent-001",
        "participant_type": "agent",
        "roles": ["contributor", "analyst"],
        "capabilities": ["strategic_planning", "resource_allocation"],
        "join_reason": "invited"
      },
      "metadata": {
        "triggered_by": "system",
        "notification_level": "info",
        "requires_acknowledgment": false
      }
    }
  }
}
```

---

## 🔒 Security Protocol

### **Authentication and Authorization**

#### **Authentication Requirements**
- **Bearer Token**: JWT bearer token required for all requests
- **Token Validation**: Tokens must be validated against MPLP identity service
- **Token Expiration**: Tokens must have reasonable expiration times (max 24 hours)
- **Refresh Mechanism**: Token refresh mechanism must be implemented

#### **Authorization Model**
```json
{
  "authorization": {
    "context_permissions": {
      "read": "View context information and participants",
      "write": "Modify context configuration and metadata",
      "manage_participants": "Add, remove, and modify participants",
      "delete": "Delete the context",
      "admin": "Full administrative access"
    },
    "participant_permissions": {
      "join": "Join the context as a participant",
      "leave": "Leave the context",
      "invite": "Invite other participants",
      "assign_roles": "Assign roles to other participants",
      "moderate": "Moderate context activities"
    }
  }
}
```

### **Data Protection**

#### **Encryption Requirements**
- **Transport Encryption**: TLS 1.3 required for all communications
- **Message Encryption**: End-to-end encryption for sensitive data
- **Key Management**: Proper key rotation and management
- **Data at Rest**: AES-256 encryption for stored context data

#### **Privacy Protection**
```json
{
  "privacy_settings": {
    "data_retention": {
      "context_data": "90_days",
      "participant_data": "30_days_after_leave",
      "metadata": "1_year",
      "audit_logs": "7_years"
    },
    "anonymization": {
      "participant_ids": true,
      "ip_addresses": true,
      "device_information": true
    },
    "consent_management": {
      "required_consents": ["data_processing", "communication"],
      "consent_tracking": true,
      "withdrawal_support": true
    }
  }
}
```

---

## 🔄 Error Handling Protocol

### **Error Response Format**

```json
{
  "message_type": "context.error.response",
  "payload": {
    "error": {
      "error_code": "CONTEXT_NOT_FOUND",
      "error_message": "The specified context does not exist",
      "error_details": {
        "context_id": "ctx-001",
        "requested_operation": "get_context",
        "timestamp": "2025-09-03T10:00:00.000Z"
      },
      "error_category": "client_error",
      "retry_after": null,
      "help_url": "https://docs.mplp.dev/errors/CONTEXT_NOT_FOUND"
    }
  }
}
```

### **Standard Error Codes**

#### **Client Errors (4xx)**
- `CONTEXT_NOT_FOUND` (404) - Requested context does not exist
- `PARTICIPANT_NOT_FOUND` (404) - Requested participant does not exist
- `INVALID_REQUEST` (400) - Request format or data is invalid
- `UNAUTHORIZED` (401) - Authentication required or failed
- `FORBIDDEN` (403) - Insufficient permissions for operation
- `CONTEXT_FULL` (409) - Context has reached maximum participant limit
- `PARTICIPANT_ALREADY_EXISTS` (409) - Participant already exists in context
- `INVALID_STATE_TRANSITION` (409) - Invalid context state transition

#### **Server Errors (5xx)**
- `INTERNAL_ERROR` (500) - Internal server error
- `SERVICE_UNAVAILABLE` (503) - Context service temporarily unavailable
- `TIMEOUT` (504) - Operation timeout
- `STORAGE_ERROR` (500) - Database or storage error
- `SYNC_CONFLICT` (500) - State synchronization conflict

### **Retry and Recovery**

#### **Retry Policy**
```json
{
  "retry_policy": {
    "max_retries": 3,
    "base_delay_ms": 1000,
    "max_delay_ms": 30000,
    "backoff_multiplier": 2.0,
    "jitter": true,
    "retryable_errors": [
      "SERVICE_UNAVAILABLE",
      "TIMEOUT",
      "INTERNAL_ERROR",
      "STORAGE_ERROR"
    ],
    "non_retryable_errors": [
      "INVALID_REQUEST",
      "UNAUTHORIZED",
      "FORBIDDEN",
      "CONTEXT_NOT_FOUND"
    ]
  }
}
```

---

## 📊 Performance Protocol

### **Performance Requirements**

#### **Response Time Targets**
- **Context Operations**: < 100ms (P95)
- **Participant Operations**: < 50ms (P95)
- **State Synchronization**: < 200ms (P95)
- **Event Notifications**: < 10ms (P95)
- **Bulk Operations**: < 500ms (P95)

#### **Throughput Targets**
- **Context Creation**: 100+ contexts/second
- **Participant Operations**: 1,000+ operations/second
- **State Updates**: 5,000+ updates/second
- **Event Publishing**: 10,000+ events/second

### **Performance Monitoring**

#### **Metrics Collection**
```json
{
  "performance_metrics": {
    "response_times": {
      "context_create": "histogram",
      "participant_add": "histogram",
      "state_sync": "histogram"
    },
    "throughput": {
      "requests_per_second": "counter",
      "operations_per_second": "counter"
    },
    "resource_usage": {
      "cpu_utilization": "gauge",
      "memory_usage": "gauge",
      "connection_count": "gauge"
    },
    "error_rates": {
      "client_errors": "counter",
      "server_errors": "counter",
      "timeout_errors": "counter"
    }
  }
}
```

---

## 🔗 Integration Protocol

### **Cross-Module Integration**

#### **Plan Module Integration**
```json
{
  "integration": {
    "plan_module": {
      "events": {
        "context_created": "plan.context.available",
        "participant_joined": "plan.participant.available",
        "context_deleted": "plan.context.unavailable"
      },
      "operations": {
        "create_execution_context": "plan.execution.context.create",
        "assign_task_context": "plan.task.context.assign"
      }
    }
  }
}
```

#### **Role Module Integration**
```json
{
  "integration": {
    "role_module": {
      "events": {
        "participant_joined": "role.participant.evaluate",
        "context_created": "role.context.initialize"
      },
      "operations": {
        "validate_permissions": "role.permissions.validate",
        "assign_roles": "role.assignment.create"
      }
    }
  }
}
```

---

## 🔗 Related Documentation

- [Context Module Overview](./README.md) - Module overview and architecture
- [API Reference](./api-reference.md) - Complete API documentation
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization

---

**Protocol Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Stable  

**⚠️ Alpha Notice**: This protocol specification is stable and production-ready in Alpha release. Minor enhancements and optimizations may be added in Beta release while maintaining backward compatibility.
