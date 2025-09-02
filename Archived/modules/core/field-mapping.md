# Core Module Field Mapping Reference

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-09-01T16:47:00Z
最后更新: 2025-09-01T16:47:00Z
文档状态: 已完成
-->

![版本](https://img.shields.io/badge/v1.0.0-stable-green)
![更新时间](https://img.shields.io/badge/Updated-2025--09--01-brightgreen)
![映射合规](https://img.shields.io/badge/Mapping-100%25_Compliant-success)
![命名约定](https://img.shields.io/badge/Convention-Dual_Naming-blue)

## 🔄 **字段映射概述**

Core模块严格遵循MPLP项目的**双重命名约定**，实现Schema层(snake_case)与TypeScript层(camelCase)之间的100%字段映射一致性。本文档提供完整的字段映射参考和转换规则。

### **映射原则**
- **Schema层**: 使用`snake_case`命名 (JSON Schema标准)
- **TypeScript层**: 使用`camelCase`命名 (JavaScript标准)
- **映射函数**: 提供双向转换 (`toSchema`, `fromSchema`)
- **验证机制**: 确保映射一致性 (`validateSchema`)

## 📋 **核心实体映射**

### **CoreEntity 字段映射**

| Schema字段 (snake_case) | TypeScript字段 (camelCase) | 类型转换 | 验证规则 |
|-------------------------|---------------------------|----------|----------|
| `core_id` | `coreId` | string → string | 必填，格式: `^core-[a-zA-Z0-9-]+$` |
| `orchestrator_id` | `orchestratorId` | string → string | 必填，格式: `^orchestrator-[a-zA-Z0-9-]+$` |
| `workflow_config` | `workflowConfig` | object → WorkflowConfig | 可选，嵌套对象映射 |
| `execution_context` | `executionContext` | object → ExecutionContext | 可选，嵌套对象映射 |
| `core_operation` | `coreOperation` | string → CoreOperationType | 必填，枚举值验证 |
| `created_at` | `createdAt` | string → Date | 必填，ISO 8601格式 |
| `updated_at` | `updatedAt` | string → Date | 可选，ISO 8601格式 |
| `protocol_version` | `protocolVersion` | string → string | 必填，语义化版本格式 |
| `metadata` | `metadata` | object → Record<string, unknown> | 可选，任意键值对 |

### **映射函数实现**

```typescript
export class CoreMapper {
  /**
   * Schema → TypeScript 转换
   */
  static fromSchema(schema: CoreEntitySchema): CoreEntity {
    return {
      coreId: schema.core_id,
      orchestratorId: schema.orchestrator_id,
      workflowConfig: schema.workflow_config ? 
        WorkflowConfigMapper.fromSchema(schema.workflow_config) : undefined,
      executionContext: schema.execution_context ? 
        ExecutionContextMapper.fromSchema(schema.execution_context) : undefined,
      coreOperation: schema.core_operation as CoreOperationType,
      createdAt: new Date(schema.created_at),
      updatedAt: schema.updated_at ? new Date(schema.updated_at) : undefined,
      protocolVersion: schema.protocol_version,
      metadata: schema.metadata
    };
  }

  /**
   * TypeScript → Schema 转换
   */
  static toSchema(entity: CoreEntity): CoreEntitySchema {
    return {
      core_id: entity.coreId,
      orchestrator_id: entity.orchestratorId,
      workflow_config: entity.workflowConfig ? 
        WorkflowConfigMapper.toSchema(entity.workflowConfig) : undefined,
      execution_context: entity.executionContext ? 
        ExecutionContextMapper.toSchema(entity.executionContext) : undefined,
      core_operation: entity.coreOperation,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt?.toISOString(),
      protocol_version: entity.protocolVersion,
      metadata: entity.metadata
    };
  }

  /**
   * 批量转换 - Schema → TypeScript
   */
  static fromSchemaArray(schemas: CoreEntitySchema[]): CoreEntity[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  /**
   * 批量转换 - TypeScript → Schema
   */
  static toSchemaArray(entities: CoreEntity[]): CoreEntitySchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * Schema验证
   */
  static validateSchema(data: unknown): data is CoreEntitySchema {
    // 使用JSON Schema验证器
    return coreEntitySchemaValidator(data);
  }
}
```

## 🏗️ **工作流配置映射**

### **WorkflowConfig 字段映射**

| Schema字段 | TypeScript字段 | 类型转换 | 验证规则 |
|------------|----------------|----------|----------|
| `name` | `name` | string → string | 必填，长度1-100 |
| `description` | `description` | string → string | 可选，最大500字符 |
| `stages` | `stages` | string[] → WorkflowStageType[] | 必填，枚举数组，唯一值 |
| `execution_mode` | `executionMode` | string → ExecutionModeType | 必填，枚举值 |
| `parallel_execution` | `parallelExecution` | boolean → boolean | 必填，布尔值 |
| `timeout_ms` | `timeoutMs` | number → number | 必填，范围1000-3600000 |
| `priority` | `priority` | string → PriorityType | 必填，枚举值 |
| `retry_config` | `retryConfig` | object → RetryConfig | 可选，嵌套对象 |

### **映射函数实现**

```typescript
export class WorkflowConfigMapper {
  static fromSchema(schema: WorkflowConfigSchema): WorkflowConfig {
    return {
      name: schema.name,
      description: schema.description,
      stages: schema.stages as WorkflowStageType[],
      executionMode: schema.execution_mode as ExecutionModeType,
      parallelExecution: schema.parallel_execution,
      timeoutMs: schema.timeout_ms,
      priority: schema.priority as PriorityType,
      retryConfig: schema.retry_config ? 
        RetryConfigMapper.fromSchema(schema.retry_config) : undefined
    };
  }

  static toSchema(config: WorkflowConfig): WorkflowConfigSchema {
    return {
      name: config.name,
      description: config.description,
      stages: config.stages,
      execution_mode: config.executionMode,
      parallel_execution: config.parallelExecution,
      timeout_ms: config.timeoutMs,
      priority: config.priority,
      retry_config: config.retryConfig ? 
        RetryConfigMapper.toSchema(config.retryConfig) : undefined
    };
  }
}
```

## 🎯 **执行上下文映射**

### **ExecutionContext 字段映射**

| Schema字段 | TypeScript字段 | 类型转换 | 验证规则 |
|------------|----------------|----------|----------|
| `context_id` | `contextId` | string → string | 必填，格式: `^context-[a-zA-Z0-9-]+$` |
| `user_id` | `userId` | string → string | 可选，用户标识符 |
| `session_id` | `sessionId` | string → string | 可选，会话标识符 |
| `environment` | `environment` | string → EnvironmentType | 必填，枚举值 |
| `resource_limits` | `resourceLimits` | object → ResourceLimits | 可选，嵌套对象 |
| `security_context` | `securityContext` | object → SecurityContext | 可选，嵌套对象 |
| `execution_metadata` | `executionMetadata` | object → Record<string, unknown> | 可选，任意键值对 |

## 🔗 **协调请求映射**

### **CoordinationRequest 字段映射**

| Schema字段 | TypeScript字段 | 类型转换 | 验证规则 |
|------------|----------------|----------|----------|
| `coordination_id` | `coordinationId` | string → string | 必填，格式: `^coord-[a-zA-Z0-9-]+$` |
| `source_module` | `sourceModule` | string → ModuleType | 必填，枚举值 |
| `target_modules` | `targetModules` | string[] → ModuleType[] | 必填，枚举数组，唯一值 |
| `operation` | `operation` | string → string | 必填，长度1-50 |
| `parameters` | `parameters` | object → Record<string, unknown> | 可选，任意键值对 |
| `coordination_mode` | `coordinationMode` | string → CoordinationModeType | 必填，枚举值 |
| `timeout_ms` | `timeoutMs` | number → number | 可选，范围1000-300000 |
| `priority` | `priority` | string → PriorityType | 可选，枚举值 |

### **映射函数实现**

```typescript
export class CoordinationRequestMapper {
  static fromSchema(schema: CoordinationRequestSchema): CoordinationRequest {
    return {
      coordinationId: schema.coordination_id,
      sourceModule: schema.source_module as ModuleType,
      targetModules: schema.target_modules as ModuleType[],
      operation: schema.operation,
      parameters: schema.parameters,
      coordinationMode: schema.coordination_mode as CoordinationModeType,
      timeoutMs: schema.timeout_ms,
      priority: schema.priority as PriorityType
    };
  }

  static toSchema(request: CoordinationRequest): CoordinationRequestSchema {
    return {
      coordination_id: request.coordinationId,
      source_module: request.sourceModule,
      target_modules: request.targetModules,
      operation: request.operation,
      parameters: request.parameters,
      coordination_mode: request.coordinationMode,
      timeout_ms: request.timeoutMs,
      priority: request.priority
    };
  }
}
```

## 💾 **资源分配映射**

### **ResourceAllocation 字段映射**

| Schema字段 | TypeScript字段 | 类型转换 | 验证规则 |
|------------|----------------|----------|----------|
| `allocation_id` | `allocationId` | string → string | 必填，格式: `^alloc-[a-zA-Z0-9-]+$` |
| `workflow_id` | `workflowId` | string → string | 必填，格式: `^wf-[a-zA-Z0-9-]+$` |
| `resource_type` | `resourceType` | string → ResourceType | 必填，枚举值 |
| `allocated_resources` | `allocatedResources` | object → AllocatedResources | 必填，嵌套对象 |
| `allocation_status` | `allocationStatus` | string → AllocationStatusType | 必填，枚举值 |
| `allocated_at` | `allocatedAt` | string → Date | 必填，ISO 8601格式 |
| `expires_at` | `expiresAt` | string → Date | 可选，ISO 8601格式 |
| `usage_statistics` | `usageStatistics` | object → UsageStatistics | 可选，嵌套对象 |

## 🔧 **类型转换规则**

### **日期时间转换**
```typescript
// Schema → TypeScript
const dateFromSchema = (dateString: string): Date => {
  return new Date(dateString);
};

// TypeScript → Schema
const dateToSchema = (date: Date): string => {
  return date.toISOString();
};
```

### **枚举值转换**
```typescript
// 枚举值验证
const validateEnumValue = <T>(value: string, enumObject: T): value is keyof T => {
  return Object.values(enumObject as any).includes(value);
};

// 安全的枚举转换
const safeEnumConversion = <T>(value: string, enumObject: T, fallback: keyof T): keyof T => {
  return validateEnumValue(value, enumObject) ? value as keyof T : fallback;
};
```

### **嵌套对象转换**
```typescript
// 条件映射
const conditionalMapping = <T, U>(
  value: T | undefined,
  mapper: (value: T) => U
): U | undefined => {
  return value ? mapper(value) : undefined;
};
```

## ✅ **映射验证**

### **验证函数**
```typescript
export class MappingValidator {
  /**
   * 验证映射一致性
   */
  static validateMappingConsistency<T, U>(
    original: T,
    toMapper: (value: T) => U,
    fromMapper: (value: U) => T,
    compareFn?: (a: T, b: T) => boolean
  ): boolean {
    try {
      const mapped = toMapper(original);
      const restored = fromMapper(mapped);
      
      if (compareFn) {
        return compareFn(original, restored);
      }
      
      return JSON.stringify(original) === JSON.stringify(restored);
    } catch (error) {
      return false;
    }
  }

  /**
   * 批量验证映射
   */
  static validateBatchMapping<T, U>(
    items: T[],
    toMapper: (value: T) => U,
    fromMapper: (value: U) => T
  ): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    
    items.forEach((item, index) => {
      if (!this.validateMappingConsistency(item, toMapper, fromMapper)) {
        errors.push(`Mapping validation failed for item at index ${index}`);
      }
    });
    
    return {
      success: errors.length === 0,
      errors
    };
  }
}
```

### **测试用例**
```typescript
describe('字段映射测试', () => {
  it('应该正确映射CoreEntity', () => {
    const schema: CoreEntitySchema = {
      core_id: 'core-test-001',
      orchestrator_id: 'orchestrator-test-001',
      core_operation: 'execute_workflow',
      created_at: '2025-09-01T16:47:00.000Z',
      protocol_version: '1.0.0'
    };
    
    const entity = CoreMapper.fromSchema(schema);
    const backToSchema = CoreMapper.toSchema(entity);
    
    expect(backToSchema).toEqual(schema);
  });

  it('应该验证映射一致性', () => {
    const testEntity = createTestCoreEntity();
    
    const isConsistent = MappingValidator.validateMappingConsistency(
      testEntity,
      CoreMapper.toSchema,
      CoreMapper.fromSchema
    );
    
    expect(isConsistent).toBe(true);
  });
});
```

## 📊 **映射性能优化**

### **缓存机制**
```typescript
class MappingCache {
  private static cache = new Map<string, any>();
  
  static get<T>(key: string): T | undefined {
    return this.cache.get(key);
  }
  
  static set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }
  
  static clear(): void {
    this.cache.clear();
  }
}
```

### **批量优化**
```typescript
// 优化的批量映射
static optimizedBatchMapping<T, U>(
  items: T[],
  mapper: (item: T) => U,
  batchSize: number = 100
): U[] {
  const results: U[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = batch.map(mapper);
    results.push(...batchResults);
  }
  
  return results;
}
```

## 🔍 **故障排除**

### **常见映射问题**

#### **1. 日期格式错误**
```typescript
// 错误：直接赋值
createdAt: schema.created_at // 错误：字符串赋值给Date

// 正确：类型转换
createdAt: new Date(schema.created_at)
```

#### **2. 枚举值验证失败**
```typescript
// 错误：未验证枚举值
coreOperation: schema.core_operation // 可能不是有效枚举值

// 正确：验证后转换
coreOperation: validateEnumValue(schema.core_operation, CoreOperationType) 
  ? schema.core_operation as CoreOperationType 
  : 'execute_workflow'
```

#### **3. 嵌套对象映射遗漏**
```typescript
// 错误：直接赋值嵌套对象
workflowConfig: schema.workflow_config // 未进行嵌套映射

// 正确：递归映射
workflowConfig: schema.workflow_config 
  ? WorkflowConfigMapper.fromSchema(schema.workflow_config) 
  : undefined
```

---

## 📚 **相关文档**

- [Schema参考](./schema-reference.md) - 完整的Schema定义
- [API参考](./api-reference.md) - API数据格式
- [测试指南](./testing-guide.md) - 映射测试策略
- [质量报告](./quality-report.md) - 映射质量验证
