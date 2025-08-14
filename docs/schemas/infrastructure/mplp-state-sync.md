# MPLP State Sync Protocol Schema

## 📋 **概述**

State Sync协议Schema定义了MPLP系统中模块间状态同步的标准数据结构，确保分布式系统中的数据一致性和状态协调。经过企业级功能增强，现已包含完整的同步性能监控、一致性分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-state-sync.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 87.2%
**功能完整性**: ✅ 100% (基础功能 + 状态同步监控 + 企业级功能)
**企业级特性**: ✅ 同步性能监控、一致性分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **状态同步**: 管理模块间的状态同步和数据一致性
- **冲突解决**: 处理并发更新导致的状态冲突
- **版本控制**: 维护状态的版本历史和变更追踪
- **一致性保证**: 提供不同级别的数据一致性保证

### **状态同步监控功能**
- **同步性能监控**: 实时监控状态同步的性能、延迟、成功率
- **一致性分析**: 详细的状态一致性分析和冲突解决追踪
- **同步状态监控**: 监控同步过程的状态、进度、错误
- **状态同步审计**: 监控状态同步过程的合规性和可靠性
- **冲突解决监控**: 监控状态冲突的检测和解决过程

### **企业级功能**
- **状态同步审计**: 完整的状态同步和冲突解决记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **版本控制**: 状态同步配置的版本历史、变更追踪和快照管理
- **搜索索引**: 状态同步数据的全文搜索、语义搜索和自动索引
- **事件集成**: 状态同步事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和状态同步事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab, Dialog, Network
L2 协调层    │ Core, Orchestration, Coordination  
L1 协议层    │ Context, Plan, Confirm, Trace, Role
基础设施层   │ Event-Bus ← [State-Sync] → Transaction
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.0" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `sync_id` | string | ✅ | UUID v4格式的同步标识符 |
| `source_module` | string | ✅ | 源模块类型 |
| `target_modules` | array | ✅ | 目标模块列表 |
| `sync_strategy` | string | ✅ | 同步策略枚举值 |
| `consistency_level` | string | ✅ | 一致性级别枚举值 |

### **同步策略枚举**
```json
{
  "sync_strategy": {
    "enum": [
      "push",           // 推送同步
      "pull",           // 拉取同步
      "bidirectional",  // 双向同步
      "event_driven",   // 事件驱动同步
      "periodic"        // 定期同步
    ]
  }
}
```

### **一致性级别枚举**
```json
{
  "consistency_level": {
    "enum": [
      "eventual",         // 最终一致性
      "strong",           // 强一致性
      "bounded_staleness", // 有界过期一致性
      "session",          // 会话一致性
      "consistent_prefix" // 一致前缀
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
  "sync_id": "550e8400-e29b-41d4-a716-446655440000",
  "source_module": "context",
  "target_modules": ["plan", "trace"],
  "sync_strategy": "event_driven",
  "consistency_level": "strong",
  "conflict_resolution": "last_write_wins",
  "sync_scope": "incremental",
  "state_snapshot": {
    "snapshot_id": "550e8400-e29b-41d4-a716-446655440001",
    "module": "context",
    "version": 15,
    "state_data": {
      "active_contexts": 5,
      "total_contexts": 25,
      "context_metadata": {
        "last_updated": "2025-08-13T10:29:00.000Z",
        "update_frequency": "high"
      }
    },
    "checksum": "sha256:a1b2c3d4e5f6...",
    "metadata": {
      "size_bytes": 2048,
      "compression": "gzip",
      "encoding": "utf-8"
    },
    "created_at": "2025-08-13T10:30:00.000Z"
  },
  "state_delta": {
    "delta_id": "550e8400-e29b-41d4-a716-446655440002",
    "base_version": 14,
    "target_version": 15,
    "operations": [
      {
        "operation_type": "update",
        "path": "/active_contexts",
        "old_value": 4,
        "new_value": 5,
        "timestamp": "2025-08-13T10:29:30.000Z"
      }
    ],
    "created_at": "2025-08-13T10:30:00.000Z"
  },
  "sync_config": {
    "batch_size": 100,
    "timeout_ms": 30000,
    "retry_attempts": 3,
    "retry_backoff_ms": 1000,
    "compression_enabled": true,
    "encryption_enabled": true
  },
  "validation": {
    "schema_validation": true,
    "checksum_verification": true,
    "version_consistency": true,
    "business_rules": true
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface StateSyncData {
  protocolVersion: string;
  timestamp: string;
  syncId: string;
  sourceModule: ModuleType;
  targetModules: ModuleType[];
  syncStrategy: SyncStrategy;
  consistencyLevel: ConsistencyLevel;
  conflictResolution: ConflictResolution;
  syncScope: 'full' | 'incremental' | 'selective';
  stateSnapshot: {
    snapshotId: string;
    module: ModuleType;
    version: number;
    stateData: Record<string, unknown>;
    checksum: string;
    metadata: {
      sizeBytes: number;
      compression?: string;
      encoding: string;
    };
    createdAt: string;
  };
  stateDelta: {
    deltaId: string;
    baseVersion: number;
    targetVersion: number;
    operations: Array<{
      operationType: 'create' | 'update' | 'delete' | 'move';
      path: string;
      oldValue?: unknown;
      newValue?: unknown;
      timestamp: string;
    }>;
    createdAt: string;
  };
  syncConfig: {
    batchSize: number;
    timeoutMs: number;
    retryAttempts: number;
    retryBackoffMs: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
  };
  validation: {
    schemaValidation: boolean;
    checksumVerification: boolean;
    versionConsistency: boolean;
    businessRules: boolean;
  };
}

type SyncStrategy = 'push' | 'pull' | 'bidirectional' | 'event_driven' | 'periodic';
type ConsistencyLevel = 'eventual' | 'strong' | 'bounded_staleness' | 'session' | 'consistent_prefix';
type ConflictResolution = 'last_write_wins' | 'first_write_wins' | 'merge' | 'manual' | 'custom';
type ModuleType = 'core' | 'context' | 'plan' | 'confirm' | 'trace' | 'role' | 
                 'extension' | 'collab' | 'dialog' | 'network';
```

### **Mapper实现**
```typescript
export class StateSyncMapper {
  static toSchema(entity: StateSyncData): StateSyncSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      sync_id: entity.syncId,
      source_module: entity.sourceModule,
      target_modules: entity.targetModules,
      sync_strategy: entity.syncStrategy,
      consistency_level: entity.consistencyLevel,
      conflict_resolution: entity.conflictResolution,
      sync_scope: entity.syncScope,
      state_snapshot: {
        snapshot_id: entity.stateSnapshot.snapshotId,
        module: entity.stateSnapshot.module,
        version: entity.stateSnapshot.version,
        state_data: entity.stateSnapshot.stateData,
        checksum: entity.stateSnapshot.checksum,
        metadata: {
          size_bytes: entity.stateSnapshot.metadata.sizeBytes,
          compression: entity.stateSnapshot.metadata.compression,
          encoding: entity.stateSnapshot.metadata.encoding
        },
        created_at: entity.stateSnapshot.createdAt
      },
      state_delta: {
        delta_id: entity.stateDelta.deltaId,
        base_version: entity.stateDelta.baseVersion,
        target_version: entity.stateDelta.targetVersion,
        operations: entity.stateDelta.operations.map(op => ({
          operation_type: op.operationType,
          path: op.path,
          old_value: op.oldValue,
          new_value: op.newValue,
          timestamp: op.timestamp
        })),
        created_at: entity.stateDelta.createdAt
      },
      sync_config: {
        batch_size: entity.syncConfig.batchSize,
        timeout_ms: entity.syncConfig.timeoutMs,
        retry_attempts: entity.syncConfig.retryAttempts,
        retry_backoff_ms: entity.syncConfig.retryBackoffMs,
        compression_enabled: entity.syncConfig.compressionEnabled,
        encryption_enabled: entity.syncConfig.encryptionEnabled
      },
      validation: {
        schema_validation: entity.validation.schemaValidation,
        checksum_verification: entity.validation.checksumVerification,
        version_consistency: entity.validation.versionConsistency,
        business_rules: entity.validation.businessRules
      }
    };
  }

  static fromSchema(schema: StateSyncSchema): StateSyncData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      syncId: schema.sync_id,
      sourceModule: schema.source_module,
      targetModules: schema.target_modules,
      syncStrategy: schema.sync_strategy,
      consistencyLevel: schema.consistency_level,
      conflictResolution: schema.conflict_resolution,
      syncScope: schema.sync_scope,
      stateSnapshot: {
        snapshotId: schema.state_snapshot.snapshot_id,
        module: schema.state_snapshot.module,
        version: schema.state_snapshot.version,
        stateData: schema.state_snapshot.state_data,
        checksum: schema.state_snapshot.checksum,
        metadata: {
          sizeBytes: schema.state_snapshot.metadata.size_bytes,
          compression: schema.state_snapshot.metadata.compression,
          encoding: schema.state_snapshot.metadata.encoding
        },
        createdAt: schema.state_snapshot.created_at
      },
      stateDelta: {
        deltaId: schema.state_delta.delta_id,
        baseVersion: schema.state_delta.base_version,
        targetVersion: schema.state_delta.target_version,
        operations: schema.state_delta.operations.map(op => ({
          operationType: op.operation_type,
          path: op.path,
          oldValue: op.old_value,
          newValue: op.new_value,
          timestamp: op.timestamp
        })),
        createdAt: schema.state_delta.created_at
      },
      syncConfig: {
        batchSize: schema.sync_config.batch_size,
        timeoutMs: schema.sync_config.timeout_ms,
        retryAttempts: schema.sync_config.retry_attempts,
        retryBackoffMs: schema.sync_config.retry_backoff_ms,
        compressionEnabled: schema.sync_config.compression_enabled,
        encryptionEnabled: schema.sync_config.encryption_enabled
      },
      validation: {
        schemaValidation: schema.validation.schema_validation,
        checksumVerification: schema.validation.checksum_verification,
        versionConsistency: schema.validation.version_consistency,
        businessRules: schema.validation.business_rules
      }
    };
  }

  static validateSchema(data: unknown): data is StateSyncSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.sync_id === 'string' &&
      typeof obj.source_module === 'string' &&
      Array.isArray(obj.target_modules) &&
      // 验证不存在camelCase字段
      !('syncId' in obj) &&
      !('protocolVersion' in obj) &&
      !('sourceModule' in obj)
    );
  }
}
```

## 🔍 **验证规则**

### **必需字段验证**
```json
{
  "required": [
    "protocol_version",
    "timestamp",
    "sync_id",
    "source_module",
    "target_modules",
    "sync_strategy",
    "consistency_level"
  ]
}
```

### **状态同步业务规则验证**
```typescript
const stateSyncValidationRules = {
  // 验证版本一致性
  validateVersionConsistency: (baseVersion: number, targetVersion: number) => {
    return targetVersion > baseVersion && (targetVersion - baseVersion) === 1;
  },

  // 验证校验和
  validateChecksum: (stateData: unknown, checksum: string) => {
    const calculatedChecksum = calculateSHA256(JSON.stringify(stateData));
    return checksum === `sha256:${calculatedChecksum}`;
  },

  // 验证同步策略和一致性级别匹配
  validateStrategyConsistencyMatch: (strategy: string, consistency: string) => {
    const validCombinations = {
      'push': ['eventual', 'bounded_staleness'],
      'pull': ['eventual', 'session'],
      'bidirectional': ['strong', 'bounded_staleness'],
      'event_driven': ['strong', 'eventual'],
      'periodic': ['eventual', 'bounded_staleness']
    };
    
    return validCombinations[strategy]?.includes(consistency) || false;
  },

  // 验证增量操作有效性
  validateDeltaOperations: (operations: DeltaOperation[]) => {
    return operations.every(op => {
      if (op.operationType === 'create') return op.newValue !== undefined;
      if (op.operationType === 'delete') return op.oldValue !== undefined;
      if (op.operationType === 'update') return op.oldValue !== undefined && op.newValue !== undefined;
      return true;
    });
  }
};
```

## 🚀 **使用示例**

### **推送状态同步**
```typescript
import { StateSyncService } from '@mplp/state-sync';

const stateSyncService = new StateSyncService();

await stateSyncService.pushStateUpdate({
  sourceModule: "context",
  targetModules: ["plan", "trace"],
  syncStrategy: "event_driven",
  consistencyLevel: "strong",
  stateSnapshot: {
    module: "context",
    version: 16,
    stateData: {
      activeContexts: 6,
      totalContexts: 26,
      recentUpdates: ["context-001", "context-002"]
    }
  },
  syncConfig: {
    batchSize: 50,
    timeoutMs: 15000,
    retryAttempts: 3,
    compressionEnabled: true,
    encryptionEnabled: true
  }
});
```

### **处理状态冲突**
```typescript
// 监听冲突事件
stateSyncService.on('conflict.detected', async (event) => {
  console.log(`检测到冲突: ${event.syncId}`);
  
  // 自定义冲突解决
  const resolution = await resolveConflict({
    localVersion: event.localState,
    remoteVersion: event.remoteState,
    conflictType: event.conflictType
  });
  
  await stateSyncService.resolveConflict(event.syncId, resolution);
});
```

### **状态版本管理**
```typescript
// 获取状态历史
const stateHistory = await stateSyncService.getStateHistory({
  module: "context",
  fromVersion: 10,
  toVersion: 16
});

// 回滚到特定版本
await stateSyncService.rollbackToVersion({
  module: "context",
  targetVersion: 14,
  reason: "数据异常回滚"
});
```

---

**维护团队**: MPLP State Sync团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
