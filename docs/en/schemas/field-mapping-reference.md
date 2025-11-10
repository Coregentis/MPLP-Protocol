# MPLP Field Mapping Reference

> **🌐 Language Navigation**: [English](field-mapping-reference.md) | [中文](../../zh-CN/schemas/field-mapping-reference.md)



**Multi-Agent Protocol Lifecycle Platform - Comprehensive Field Mapping Reference**

[![Mapping](https://img.shields.io/badge/mapping-Production%20Validated-brightgreen.svg)](./dual-naming-guide.md)
[![Coverage](https://img.shields.io/badge/coverage-Enterprise%20Complete-brightgreen.svg)](./validation-rules.md)
[![Modules](https://img.shields.io/badge/modules-10%2F10%20Complete-brightgreen.svg)](../modules/)
[![Tests](https://img.shields.io/badge/tests-2902%2F2902%20Pass-brightgreen.svg)](./validation-rules.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/schemas/field-mapping-reference.md)

---

## 🎯 Overview

This document provides a **production-validated** comprehensive reference for all field mappings between MPLP schema format (snake_case) and programming language format (camelCase). It serves as the authoritative source for field naming conventions across all 10 completed MPLP modules, validated through 2,902/2,902 tests with 100% mapping compliance and enterprise-grade quality standards.

### **Reference Scope**
- **Complete Coverage**: All fields across all 10 MPLP modules
- **Bidirectional Mapping**: Schema ↔ Programming language mappings
- **Type Information**: Data types and validation rules
- **Usage Examples**: Practical usage examples for each mapping
- **Special Cases**: Handling of complex and nested structures

---

## 📋 Core Field Mappings

### **Universal Fields**

These fields appear across multiple modules with consistent mapping:

| Schema (snake_case) | TypeScript (camelCase) | Type | Description | Modules |
|-------------------|----------------------|------|-------------|---------|
| `id` | `id` | string | Generic identifier | All |
| `created_at` | `createdAt` | Date | Creation timestamp | All |
| `updated_at` | `updatedAt` | Date | Last update timestamp | All |
| `version` | `version` | string | Version identifier | All |
| `status` | `status` | string | Entity status | All |
| `metadata` | `metadata` | object | Metadata container | All |
| `tags` | `tags` | string[] | Tag array | All |
| `description` | `description` | string | Entity description | All |
| `name` | `name` | string | Entity name | All |
| `type` | `type` | string | Entity type | All |

### **Timestamp Fields**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `created_at` | `createdAt` | Date | Creation timestamp |
| `updated_at` | `updatedAt` | Date | Last update timestamp |
| `started_at` | `startedAt` | Date | Start timestamp |
| `completed_at` | `completedAt` | Date | Completion timestamp |
| `last_activity_at` | `lastActivityAt` | Date | Last activity timestamp |
| `expires_at` | `expiresAt` | Date | Expiration timestamp |
| `scheduled_at` | `scheduledAt` | Date | Scheduled timestamp |
| `executed_at` | `executedAt` | Date | Execution timestamp |

### **Count and Quantity Fields**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `participant_count` | `participantCount` | number | Number of participants |
| `task_count` | `taskCount` | number | Number of tasks |
| `message_count` | `messageCount` | number | Number of messages |
| `error_count` | `errorCount` | number | Number of errors |
| `retry_count` | `retryCount` | number | Number of retries |
| `total_items` | `totalItems` | number | Total item count |
| `active_count` | `activeCount` | number | Active item count |
| `completed_count` | `completedCount` | number | Completed item count |

### **Boolean Fields**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `is_active` | `isActive` | boolean | Active status |
| `is_enabled` | `isEnabled` | boolean | Enabled status |
| `is_public` | `isPublic` | boolean | Public visibility |
| `is_required` | `isRequired` | boolean | Required status |
| `has_permissions` | `hasPermissions` | boolean | Permission status |
| `has_errors` | `hasErrors` | boolean | Error presence |
| `auto_cleanup_enabled` | `autoCleanupEnabled` | boolean | Auto cleanup setting |
| `encryption_enabled` | `encryptionEnabled` | boolean | Encryption setting |

---

## 🏗️ Module-Specific Mappings

### **Context Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `context_id` | `contextId` | string | Context identifier |
| `context_type` | `contextType` | ContextType | Type of context |
| `session_count` | `sessionCount` | number | Number of sessions |
| `participant_limit` | `participantLimit` | number | Maximum participants |
| `isolation_level` | `isolationLevel` | string | Isolation level |
| `persistence_level` | `persistenceLevel` | string | Persistence level |
| `timeout_ms` | `timeoutMs` | number | Timeout in milliseconds |
| `last_cleanup_at` | `lastCleanupAt` | Date | Last cleanup timestamp |

### **Plan Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `plan_id` | `planId` | string | Plan identifier |
| `plan_type` | `planType` | PlanType | Type of plan |
| `execution_status` | `executionStatus` | ExecutionStatus | Execution status |
| `estimated_duration` | `estimatedDuration` | number | Estimated duration |
| `actual_duration` | `actualDuration` | number | Actual duration |
| `success_rate` | `successRate` | number | Success rate percentage |
| `resource_requirements` | `resourceRequirements` | object | Resource requirements |
| `optimization_criteria` | `optimizationCriteria` | string[] | Optimization criteria |

### **Role Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `role_id` | `roleId` | string | Role identifier |
| `role_name` | `roleName` | string | Role name |
| `permission_level` | `permissionLevel` | PermissionLevel | Permission level |
| `capability_requirements` | `capabilityRequirements` | string[] | Required capabilities |
| `access_level` | `accessLevel` | AccessLevel | Access level |
| `delegation_allowed` | `delegationAllowed` | boolean | Delegation permission |
| `max_assignments` | `maxAssignments` | number | Maximum assignments |
| `assignment_duration` | `assignmentDuration` | number | Assignment duration |

### **Confirm Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `approval_id` | `approvalId` | string | Approval identifier |
| `workflow_id` | `workflowId` | string | Workflow identifier |
| `approval_status` | `approvalStatus` | ApprovalStatus | Approval status |
| `required_approvals` | `requiredApprovals` | number | Required approvals |
| `received_approvals` | `receivedApprovals` | number | Received approvals |
| `consensus_threshold` | `consensusThreshold` | number | Consensus threshold |
| `decision_deadline` | `decisionDeadline` | Date | Decision deadline |
| `escalation_rules` | `escalationRules` | object[] | Escalation rules |

### **Trace Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `trace_id` | `traceId` | string | Trace identifier |
| `span_id` | `spanId` | string | Span identifier |
| `parent_span_id` | `parentSpanId` | string | Parent span identifier |
| `operation_name` | `operationName` | string | Operation name |
| `start_time` | `startTime` | Date | Start time |
| `end_time` | `endTime` | Date | End time |
| `duration_ms` | `durationMs` | number | Duration in milliseconds |
| `performance_metrics` | `performanceMetrics` | object | Performance metrics |

### **Extension Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `extension_id` | `extensionId` | string | Extension identifier |
| `extension_name` | `extensionName` | string | Extension name |
| `extension_type` | `extensionType` | ExtensionType | Extension type |
| `api_version` | `apiVersion` | string | API version |
| `load_priority` | `loadPriority` | number | Load priority |
| `resource_limits` | `resourceLimits` | object | Resource limits |
| `security_level` | `securityLevel` | SecurityLevel | Security level |
| `sandbox_enabled` | `sandboxEnabled` | boolean | Sandbox enabled |

### **Dialog Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `conversation_id` | `conversationId` | string | Conversation identifier |
| `message_id` | `messageId` | string | Message identifier |
| `dialog_type` | `dialogType` | DialogType | Dialog type |
| `participant_ids` | `participantIds` | string[] | Participant identifiers |
| `message_count` | `messageCount` | number | Message count |
| `turn_count` | `turnCount` | number | Turn count |
| `sentiment_score` | `sentimentScore` | number | Sentiment score |
| `language_code` | `languageCode` | string | Language code |

### **Collab Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `team_id` | `teamId` | string | Team identifier |
| `collaboration_id` | `collaborationId` | string | Collaboration identifier |
| `team_size` | `teamSize` | number | Team size |
| `coordination_pattern` | `coordinationPattern` | CoordinationPattern | Coordination pattern |
| `decision_method` | `decisionMethod` | DecisionMethod | Decision method |
| `resource_sharing_enabled` | `resourceSharingEnabled` | boolean | Resource sharing |
| `conflict_resolution_strategy` | `conflictResolutionStrategy` | string | Conflict resolution |
| `performance_score` | `performanceScore` | number | Performance score |

### **Network Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `node_id` | `nodeId` | string | Node identifier |
| `network_id` | `networkId` | string | Network identifier |
| `topology_type` | `topologyType` | TopologyType | Topology type |
| `connection_count` | `connectionCount` | number | Connection count |
| `bandwidth_mbps` | `bandwidthMbps` | number | Bandwidth in Mbps |
| `latency_ms` | `latencyMs` | number | Latency in milliseconds |
| `packet_loss_rate` | `packetLossRate` | number | Packet loss rate |
| `fault_tolerance_level` | `faultToleranceLevel` | string | Fault tolerance level |

### **Core Module**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `orchestrator_id` | `orchestratorId` | string | Orchestrator identifier |
| `coordination_mode` | `coordinationMode` | CoordinationMode | Coordination mode |
| `resource_pool_id` | `resourcePoolId` | string | Resource pool identifier |
| `load_balancing_strategy` | `loadBalancingStrategy` | string | Load balancing strategy |
| `health_check_interval` | `healthCheckInterval` | number | Health check interval |
| `failover_enabled` | `failoverEnabled` | boolean | Failover enabled |
| `scaling_policy` | `scalingPolicy` | object | Scaling policy |
| `monitoring_enabled` | `monitoringEnabled` | boolean | Monitoring enabled |

---

## 🔧 Complex Structure Mappings

### **Nested Object Mappings**

#### **Metadata Structure**
```typescript
// Schema format
{
  "metadata": {
    "custom_data": {...},
    "performance_metrics": {...},
    "security_settings": {...}
  }
}

// TypeScript format
{
  metadata: {
    customData: {...},
    performanceMetrics: {...},
    securitySettings: {...}
  }
}
```

#### **Configuration Structure**
```typescript
// Schema format
{
  "configuration": {
    "max_participants": 10,
    "timeout_duration": 3600000,
    "auto_cleanup_enabled": true,
    "security_level": "high"
  }
}

// TypeScript format
{
  configuration: {
    maxParticipants: 10,
    timeoutDuration: 3600000,
    autoCleanupEnabled: true,
    securityLevel: "high"
  }
}
```

### **Array Structure Mappings**

#### **Participant Array**
```typescript
// Schema format
{
  "participants": [
    {
      "participant_id": "p1",
      "joined_at": "2025-09-03T10:00:00Z",
      "role_assignments": ["contributor"]
    }
  ]
}

// TypeScript format
{
  participants: [
    {
      participantId: "p1",
      joinedAt: new Date("2025-09-03T10:00:00Z"),
      roleAssignments: ["contributor"]
    }
  ]
}
```

---

## ✅ Validation Rules

### **Field Name Validation**

#### **Schema Layer Validation**
```typescript
function validateSchemaFieldName(fieldName: string): boolean {
  // Must be snake_case
  const snakeCasePattern = /^[a-z][a-z0-9_]*[a-z0-9]$|^[a-z]$/;
  return snakeCasePattern.test(fieldName);
}
```

#### **TypeScript Layer Validation**
```typescript
function validateTypeScriptFieldName(fieldName: string): boolean {
  // Must be camelCase
  const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/;
  return camelCasePattern.test(fieldName);
}
```

### **Mapping Consistency Validation**

```typescript
function validateMappingConsistency(
  schemaField: string,
  typeScriptField: string
): boolean {
  // Convert schema field to expected TypeScript field
  const expectedTypeScript = schemaField
    .split('_')
    .map((part, index) => 
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');
  
  return expectedTypeScript === typeScriptField;
}
```

---

## 🛠️ Usage Examples

### **Basic Mapping Example**

```typescript
// Schema data
const schemaData = {
  context_id: "ctx-001",
  created_at: "2025-09-03T10:00:00Z",
  participant_count: 5,
  is_active: true
};

// Convert to TypeScript format
const entityData = ContextMapper.fromSchema(schemaData);
// Result:
// {
//   contextId: "ctx-001",
//   createdAt: Date("2025-09-03T10:00:00Z"),
//   participantCount: 5,
//   isActive: true
// }

// Convert back to schema format
const backToSchema = ContextMapper.toSchema(entityData);
// Result matches original schemaData
```

### **Complex Structure Example**

```typescript
// Complex schema structure
const complexSchema = {
  plan_id: "plan-001",
  execution_status: "running",
  resource_requirements: {
    cpu_cores: 4,
    memory_gb: 8,
    storage_gb: 100
  },
  task_assignments: [
    {
      task_id: "task-001",
      assigned_to: "agent-001",
      estimated_duration: 3600000
    }
  ]
};

// Mapped TypeScript structure
const complexEntity = PlanMapper.fromSchema(complexSchema);
// Result:
// {
//   planId: "plan-001",
//   executionStatus: "running",
//   resourceRequirements: {
//     cpuCores: 4,
//     memoryGb: 8,
//     storageGb: 100
//   },
//   taskAssignments: [
//     {
//       taskId: "task-001",
//       assignedTo: "agent-001",
//       estimatedDuration: 3600000
//     }
//   ]
// }
```

---

## 🔗 Related Documentation

- [Dual Naming Guide](./dual-naming-guide.md) - Complete dual naming convention guide
- [Schema Standards](./schema-standards.md) - Schema definition standards
- [Validation Rules](./validation-rules.md) - Validation rules and implementation
- [Evolution Strategy](./evolution-strategy.md) - Schema evolution guidelines

---

**Reference Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Coverage**: 100% (All 10 modules)  

**⚠️ Alpha Notice**: This field mapping reference is complete and stable in Alpha release. Additional mappings for new fields will be added as modules evolve in Beta release.
