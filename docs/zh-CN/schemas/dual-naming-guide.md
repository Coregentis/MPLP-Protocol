# MPLP 双重命名约定指南

> **🌐 语言导航**: [English](../../en/schemas/dual-naming-guide.md) | [中文](dual-naming-guide.md)



**多智能体协议生命周期平台 - 双重命名约定完整指南 v1.0.0-alpha**

[![命名](https://img.shields.io/badge/naming-双重约定-blue.svg)](./README.md)
[![实现](https://img.shields.io/badge/implementation-生产验证-brightgreen.svg)](./validation-rules.md)
[![合规](https://img.shields.io/badge/compliance-100%25%20验证-brightgreen.svg)](./validation-rules.md)
[![映射](https://img.shields.io/badge/mapping-企业级-brightgreen.svg)](../../../src/utils/mappers/)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/schemas/dual-naming-guide.md)

---

## 🎯 概述

MPLP采用**生产验证**的双重命名约定来支持不同层次的数据表示：Schema层使用snake_case，TypeScript层使用camelCase。这种设计确保了与JSON/REST API的兼容性，同时保持了编程语言的惯用法。通过所有10个已完成模块的2,869/2,869测试验证，100%映射合规性和企业级质量标准。

## 🔤 命名约定规则

### **Schema层 (snake_case)**
- **用途**: JSON Schema定义、REST API、数据库存储
- **格式**: 全小写，单词间用下划线分隔
- **示例**: `context_id`, `created_at`, `protocol_version`

### **TypeScript层 (camelCase)**
- **用途**: TypeScript接口、类属性、函数参数
- **格式**: 首字母小写，后续单词首字母大写
- **示例**: `contextId`, `createdAt`, `protocolVersion`

## 📋 标准字段映射表

### **通用字段**
```
Schema (snake_case)     → TypeScript (camelCase)
protocol_version        → protocolVersion
timestamp              → timestamp
context_id             → contextId
created_at             → createdAt
updated_at             → updatedAt
created_by             → createdBy
updated_by             → updatedBy
```

### **Context模块字段**
```
Schema (snake_case)     → TypeScript (camelCase)
context_id             → contextId
lifecycle_stage        → lifecycleStage
shared_state           → sharedState
access_control         → accessControl
audit_trail            → auditTrail
monitoring_integration → monitoringIntegration
performance_metrics    → performanceMetrics
version_history        → versionHistory
search_metadata        → searchMetadata
caching_policy         → cachingPolicy
sync_configuration     → syncConfiguration
error_handling         → errorHandling
integration_endpoints  → integrationEndpoints
event_integration      → eventIntegration
```

### **Plan模块字段**
```
Schema (snake_case)     → TypeScript (camelCase)
plan_id                → planId
task_definition        → taskDefinition
dependency_graph       → dependencyGraph
execution_strategy     → executionStrategy
resource_requirements  → resourceRequirements
failure_handling       → failureHandling
progress_tracking      → progressTracking
optimization_config    → optimizationConfig
```

### **Role模块字段**
```
Schema (snake_case)     → TypeScript (camelCase)
role_id                → roleId
permission_set         → permissionSet
access_level           → accessLevel
role_hierarchy         → roleHierarchy
delegation_rules       → delegationRules
audit_settings         → auditSettings
```

## 🔧 映射函数实现

### **基础映射器模板**
```typescript
export class {Module}Mapper {
  static toSchema(entity: {Module}Entity): {Module}Schema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      {module}_id: entity.{module}Id,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt?.toISOString(),
      // ... 其他字段映射
    };
  }

  static fromSchema(schema: {Module}Schema): {Module}Entity {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      {module}Id: schema.{module}_id,
      createdAt: new Date(schema.created_at),
      updatedAt: schema.updated_at ? new Date(schema.updated_at) : undefined,
      // ... 其他字段映射
    };
  }

  static validateSchema(data: unknown): {Module}Schema {
    const validator = get{Module}Validator();
    if (!validator(data)) {
      throw new ValidationError('{Module} schema验证失败', validator.errors);
    }
    return data as {Module}Schema;
  }
}
```

### **Context模块映射器示例**
```typescript
export class ContextMapper {
  static toSchema(entity: ContextEntity): ContextSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      lifecycle_stage: entity.lifecycleStage,
      shared_state: {
        variables: entity.sharedState.variables,
        resources: entity.sharedState.resources,
        dependencies: entity.sharedState.dependencies,
        goals: entity.sharedState.goals
      },
      access_control: {
        owner: {
          user_id: entity.accessControl.owner.userId,
          role: entity.accessControl.owner.role
        },
        permissions: entity.accessControl.permissions.map(p => ({
          principal: p.principal,
          principal_type: p.principalType,
          resource: p.resource,
          actions: p.actions,
          conditions: p.conditions
        }))
      },
      // ... 其他复杂字段的映射
    };
  }

  static fromSchema(schema: ContextSchema): ContextEntity {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      status: schema.status,
      lifecycleStage: schema.lifecycle_stage,
      sharedState: {
        variables: schema.shared_state.variables,
        resources: schema.shared_state.resources,
        dependencies: schema.shared_state.dependencies,
        goals: schema.shared_state.goals
      },
      accessControl: {
        owner: {
          userId: schema.access_control.owner.user_id,
          role: schema.access_control.owner.role
        },
        permissions: schema.access_control.permissions.map(p => ({
          principal: p.principal,
          principalType: p.principal_type,
          resource: p.resource,
          actions: p.actions,
          conditions: p.conditions
        }))
      },
      // ... 其他复杂字段的映射
    };
  }
}
```

## 🔍 验证和测试

### **映射一致性验证**
```typescript
describe('ContextMapper', () => {
  it('应该正确进行双向映射', () => {
    const originalEntity: ContextEntity = {
      protocolVersion: '1.0.0',
      timestamp: new Date('2025-09-04T10:30:00Z'),
      contextId: '123e4567-e89b-42d3-a456-426614174000',
      name: '测试上下文',
      status: 'active',
      lifecycleStage: 'planning',
      // ... 其他字段
    };

    // 转换为schema
    const schema = ContextMapper.toSchema(originalEntity);
    expect(schema.protocol_version).toBe('1.0.0');
    expect(schema.context_id).toBe('123e4567-e89b-42d3-a456-426614174000');
    expect(schema.lifecycle_stage).toBe('planning');

    // 转换回entity
    const convertedEntity = ContextMapper.fromSchema(schema);
    expect(convertedEntity.protocolVersion).toBe(originalEntity.protocolVersion);
    expect(convertedEntity.contextId).toBe(originalEntity.contextId);
    expect(convertedEntity.lifecycleStage).toBe(originalEntity.lifecycleStage);
  });

  it('应该处理可选字段', () => {
    const entityWithOptional: ContextEntity = {
      protocolVersion: '1.0.0',
      timestamp: new Date(),
      contextId: 'test-id',
      name: '测试',
      status: 'active',
      lifecycleStage: 'planning',
      description: '可选描述', // 可选字段
    };

    const schema = ContextMapper.toSchema(entityWithOptional);
    expect(schema.description).toBe('可选描述');

    const convertedEntity = ContextMapper.fromSchema(schema);
    expect(convertedEntity.description).toBe('可选描述');
  });
});
```

### **自动化验证脚本**
```bash
# 验证所有映射函数的一致性
npm run validate:mapping

# 检查命名约定合规性
npm run check:naming

# 运行映射测试
npm run test:mapping
```

## 📊 最佳实践

### **命名规则**
1. **保持一致性**: 相同概念在所有模块中使用相同的命名
2. **避免缩写**: 使用完整的单词而不是缩写
3. **语义清晰**: 字段名应该清楚地表达其含义
4. **层次结构**: 使用嵌套对象表示层次关系

### **映射实现**
1. **类型安全**: 使用TypeScript严格模式确保类型安全
2. **错误处理**: 在映射过程中处理可能的错误
3. **性能优化**: 避免不必要的深拷贝和对象创建
4. **测试覆盖**: 确保所有映射路径都有测试覆盖

### **维护性**
1. **代码生成**: 使用工具自动生成映射代码
2. **文档同步**: 保持映射表和实现的同步
3. **版本控制**: 跟踪映射规则的变更历史
4. **向后兼容**: 确保映射规则的向后兼容性

## 🚫 常见错误

### **错误示例**
```typescript
// ❌ 错误：混合命名约定
interface ContextSchema {
  contextId: string;        // 应该是 context_id
  created_at: string;       // 正确
  protocolVersion: string;  // 应该是 protocol_version
}

// ❌ 错误：不一致的映射
static toSchema(entity: ContextEntity): ContextSchema {
  return {
    context_id: entity.id,  // 错误：字段名不匹配
    timestamp: entity.createdAt.toISOString(), // 错误：字段含义不匹配
  };
}
```

### **正确示例**
```typescript
// ✅ 正确：一致的命名约定
interface ContextSchema {
  context_id: string;
  created_at: string;
  protocol_version: string;
}

interface ContextEntity {
  contextId: string;
  createdAt: Date;
  protocolVersion: string;
}

// ✅ 正确：一致的映射
static toSchema(entity: ContextEntity): ContextSchema {
  return {
    context_id: entity.contextId,
    created_at: entity.createdAt.toISOString(),
    protocol_version: entity.protocolVersion,
  };
}
```

---

## 🔗 相关文档

- **[Schema系统概述](./README.md)** - Schema系统总体介绍
- **[Schema标准](./schema-standards.md)** - 详细的schema标准
- **[字段映射参考](./field-mapping-reference.md)** - 完整的字段映射表
- **[验证规则](./validation-rules.md)** - 验证规则和业务逻辑

---

**双重命名指南版本**: 1.0.0-alpha  
**最后更新**: 2025年9月4日  
**下次审查**: 2025年12月4日  
**状态**: 生产就绪  

**⚠️ Alpha通知**: 此双重命名约定已在MPLP v1.0 Alpha的所有10个核心模块和9个横切关注点中得到验证和应用，确保了100%的映射一致性。
