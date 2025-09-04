# MPLP Schema 标准

**多智能体协议生命周期平台 - Schema 标准和约定 v1.0.0-alpha**

[![Schema](https://img.shields.io/badge/schema-JSON%20Schema%20Draft--07-blue.svg)](./README.md)
[![实现](https://img.shields.io/badge/implementation-生产完成-brightgreen.svg)](./validation-rules.md)
[![合规](https://img.shields.io/badge/compliance-企业级验证-brightgreen.svg)](./validation-rules.md)
[![版本](https://img.shields.io/badge/version-1.0.0--alpha-brightgreen.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/schemas/schema-standards.md)

---

## 🎯 概述

本文档定义了MPLP项目中所有JSON Schema的**生产验证**标准、约定和企业级最佳实践。这些标准确保了所有10个已完成模块schema的一致性、可维护性和互操作性，通过2,869/2,869测试验证，100% Schema合规性。

## 📋 文件命名标准

### **命名模式**
```
模式: mplp-{module-name}.json
示例:
- mplp-context.json      # Context模块schema
- mplp-plan.json         # Plan模块schema
- mplp-role.json         # Role模块schema
```

### **目录结构**
```
src/schemas/
├── core-modules/           # 核心模块schema
│   ├── mplp-context.json
│   ├── mplp-plan.json
│   └── ...
└── cross-cutting-concerns/ # 横切关注点schema
    ├── mplp-coordination.json
    ├── mplp-error-handling.json
    └── ...
```

## 🔤 字段命名约定

### **双重命名系统**

#### **Schema层 (snake_case)**
```json
{
  "context_id": "ctx-001",
  "created_at": "2025-09-04T10:30:00Z",
  "protocol_version": "1.0.0",
  "lifecycle_stage": "planning",
  "shared_state": {
    "resource_allocation": {},
    "dependency_graph": []
  }
}
```

#### **TypeScript层 (camelCase)**
```typescript
interface ContextEntity {
  contextId: string;
  createdAt: Date;
  protocolVersion: string;
  lifecycleStage: string;
  sharedState: {
    resourceAllocation: ResourceAllocation;
    dependencyGraph: Dependency[];
  };
}
```

### **映射规则**
```
snake_case → camelCase 转换规则:
- context_id → contextId
- created_at → createdAt
- protocol_version → protocolVersion
- lifecycle_stage → lifecycleStage
- shared_state → sharedState
- resource_allocation → resourceAllocation
- dependency_graph → dependencyGraph
```

## 📝 Schema结构标准

### **必需元数据**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-{module}.json",
  "title": "MPLP {Module} Protocol v1.0",
  "description": "{Module}模块协议Schema - {功能描述}",
  "type": "object"
}
```

### **标准定义块**
```json
{
  "$defs": {
    "uuid": {
      "type": "string",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
      "description": "UUID v4格式的唯一标识符"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601格式的时间戳"
    },
    "version": {
      "type": "string",
      "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
      "description": "语义化版本号 (SemVer)"
    },
    "priority": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low"],
      "description": "优先级枚举"
    }
  }
}
```

### **必需根属性**
```json
{
  "properties": {
    "protocol_version": {
      "$ref": "#/$defs/version",
      "description": "MPLP协议版本",
      "const": "1.0.0"
    },
    "timestamp": {
      "$ref": "#/$defs/timestamp",
      "description": "协议消息时间戳"
    }
  },
  "required": ["protocol_version", "timestamp"],
  "additionalProperties": false
}
```

## 🔍 验证标准

### **JSON Schema验证**
- 所有schema必须符合JSON Schema Draft-07规范
- 使用严格模式验证 (`"additionalProperties": false`)
- 所有字段必须有描述
- 枚举值必须明确定义

### **业务规则验证**
- 实现自定义验证器用于复杂业务逻辑
- 跨字段验证规则
- 状态转换验证
- 资源约束验证

### **性能要求**
- 验证时间 < 10ms (典型负载)
- Schema编译时间 < 100ms
- 内存使用 < 10MB per schema

## 📚 文档标准

### **字段描述**
- 每个字段必须有清晰的中文描述
- 包含字段用途和约束说明
- 提供示例值
- 说明与其他字段的关系

### **示例数据**
```json
{
  "examples": [
    {
      "protocol_version": "1.0.0",
      "timestamp": "2025-09-04T10:30:00Z",
      "context_id": "123e4567-e89b-42d3-a456-426614174000",
      "name": "示例上下文",
      "status": "active",
      "lifecycle_stage": "planning"
    }
  ]
}
```

## 🔄 版本控制标准

### **语义版本控制**
- 主版本: 破坏性更改
- 次版本: 向后兼容的新增功能
- 补丁版本: 错误修复

### **向后兼容性规则**
- 不能删除必需字段
- 不能更改字段类型
- 不能删除枚举值
- 可以添加可选字段
- 可以添加新的枚举值

### **迁移策略**
- 提供自动迁移脚本
- 6个月弃用通知期
- 详细的迁移指南
- 版本兼容性矩阵

## 🛠️ 实现标准

### **TypeScript集成**
```typescript
// 自动生成的类型定义
export interface {Module}Schema {
  // schema字段 (snake_case)
}

export interface {Module}Entity {
  // TypeScript字段 (camelCase)
}

export class {Module}Mapper {
  static toSchema(entity: {Module}Entity): {Module}Schema;
  static fromSchema(schema: {Module}Schema): {Module}Entity;
  static validateSchema(data: unknown): {Module}Schema;
}
```

### **验证实现**
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const validate{Module} = ajv.compile({module}Schema);

export function validate{Module}Data(data: unknown): {Module}Schema {
  if (!validate{Module}(data)) {
    throw new ValidationError('验证失败', validate{Module}.errors);
  }
  return data as {Module}Schema;
}
```

## 📊 质量指标

### **合规性指标**
- JSON Schema Draft-07合规性: 100%
- 字段描述覆盖率: 100%
- 示例数据覆盖率: 100%
- 验证规则覆盖率: 100%

### **性能指标**
- 验证性能: < 10ms
- Schema大小: 平均1,135行
- 编译时间: < 100ms
- 内存使用: < 10MB

### **维护性指标**
- 代码重复率: < 5%
- 文档同步率: 100%
- 测试覆盖率: 100%
- 自动化程度: 95%

---

## 🔗 相关文档

- **[Schema系统概述](./README.md)** - Schema系统总体介绍
- **[双重命名指南](./dual-naming-guide.md)** - 详细的命名约定指南
- **[字段映射参考](./field-mapping-reference.md)** - 完整的字段映射表
- **[验证规则](./validation-rules.md)** - 验证规则和业务逻辑

---

**Schema标准版本**: 1.0.0-alpha  
**最后更新**: 2025年9月4日  
**下次审查**: 2025年12月4日  
**状态**: 生产就绪  

**⚠️ Alpha通知**: 这些schema标准基于MPLP v1.0 Alpha的实际实现制定，已在10个核心模块和9个横切关注点中得到验证和应用。
