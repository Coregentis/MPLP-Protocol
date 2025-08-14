# MPLP Schema 最佳实践指南

## 📋 **概述**

本指南汇总了MPLP Schema设计、开发、维护和演进的最佳实践，基于项目实际经验和行业标准制定。

**版本**: v1.0.0  
**适用范围**: 所有MPLP Schema开发和维护工作  
**经验来源**: MPLP项目6个模块的成功实践

## 🎯 **设计最佳实践**

### **1. Schema结构设计**

#### **统一的Schema模板**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-{module}.json",
  "title": "MPLP {Module} Protocol v1.0",
  "description": "{Module}模块协议Schema - {详细功能描述}",
  "type": "object",
  "$defs": {
    // 通用类型定义，复用性强
    "uuid": { /* UUID定义 */ },
    "timestamp": { /* 时间戳定义 */ },
    "version": { /* 版本号定义 */ }
  },
  "properties": {
    "protocol_version": {
      "$ref": "#/$defs/version",
      "const": "1.0.0",
      "description": "MPLP协议版本"
    },
    "timestamp": {
      "$ref": "#/$defs/timestamp",
      "description": "协议消息时间戳"
    }
    // 模块特定字段
  },
  "required": ["protocol_version", "timestamp"],
  "additionalProperties": false,
  "examples": [
    // 提供完整的使用示例
  ]
}
```

#### **字段设计原则**
```typescript
// ✅ 好的字段设计
const goodFieldDesign = {
  // 1. 使用描述性名称
  "user_authentication_token": "string",
  "session_expiry_timestamp": "string",
  "business_rule_priority": "number",

  // 2. 合理的字段约束
  "email": {
    "type": "string",
    "format": "email",
    "maxLength": 255
  },
  "age": {
    "type": "integer",
    "minimum": 0,
    "maximum": 150
  },

  // 3. 清晰的枚举定义
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "suspended", "archived"],
    "description": "实体状态：active-活跃，inactive-非活跃，suspended-暂停，archived-归档"
  }
};

// ❌ 避免的字段设计
const badFieldDesign = {
  // 1. 模糊的字段名
  "data": "object",
  "info": "string",
  "flag": "boolean",

  // 2. 过于宽松的约束
  "text": {
    "type": "string"
    // 缺少长度限制
  },

  // 3. 不清晰的枚举
  "type": {
    "enum": [1, 2, 3] // 数字枚举，含义不明
  }
};
```

### **2. 命名约定最佳实践**

#### **字段命名规范**
```typescript
// Schema层：严格使用snake_case
const schemaFields = {
  "context_id": "string",           // ✅ 正确
  "created_at": "string",           // ✅ 正确
  "protocol_version": "string",     // ✅ 正确
  "business_metadata": "object",    // ✅ 正确
  
  "contextId": "string",            // ❌ 错误：应该是snake_case
  "createdAt": "string",            // ❌ 错误：应该是snake_case
  "protocolVersion": "string"       // ❌ 错误：应该是snake_case
};

// TypeScript层：严格使用camelCase
interface TypeScriptInterface {
  contextId: string;                // ✅ 正确
  createdAt: string;                // ✅ 正确
  protocolVersion: string;          // ✅ 正确
  businessMetadata: object;         // ✅ 正确
  
  context_id: string;               // ❌ 错误：应该是camelCase
  created_at: string;               // ❌ 错误：应该是camelCase
  protocol_version: string;         // ❌ 错误：应该是camelCase
}
```

#### **模块命名规范**
```typescript
const moduleNamingConventions = {
  // Schema文件命名
  schemaFiles: [
    "mplp-context.json",      // ✅ 正确：mplp-{module}.json
    "mplp-plan.json",         // ✅ 正确
    "mplp-trace.json",        // ✅ 正确
    
    "context-schema.json",    // ❌ 错误：不符合命名约定
    "plan_schema.json",       // ❌ 错误：不符合命名约定
    "MPLPTrace.json"          // ❌ 错误：不符合命名约定
  ],

  // TypeScript类型命名
  typeNames: [
    "ContextSchema",          // ✅ 正确：{Module}Schema
    "ContextData",            // ✅ 正确：{Module}Data
    "ContextMapper",          // ✅ 正确：{Module}Mapper
    
    "contextSchema",          // ❌ 错误：应该是PascalCase
    "Context_Schema",         // ❌ 错误：不应该使用下划线
    "IContextSchema"          // ❌ 错误：避免I前缀
  ]
};
```

### **3. 类型定义最佳实践**

#### **通用类型复用**
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
      "description": "优先级枚举：critical-关键，high-高，medium-中，low-低"
    }
  }
}
```

#### **复杂对象结构**
```json
{
  "properties": {
    "metadata": {
      "type": "object",
      "properties": {
        "created_by": {"$ref": "#/$defs/uuid"},
        "created_at": {"$ref": "#/$defs/timestamp"},
        "last_modified": {"$ref": "#/$defs/timestamp"},
        "version": {"type": "integer", "minimum": 1},
        "tags": {
          "type": "array",
          "items": {"type": "string"},
          "uniqueItems": true,
          "maxItems": 20
        }
      },
      "required": ["created_by", "created_at"],
      "additionalProperties": false
    }
  }
}
```

## 🔧 **开发最佳实践**

### **1. Mapper类实现**

#### **标准Mapper模板**
```typescript
// src/modules/{module}/api/mappers/{module}.mapper.ts
export class {Module}Mapper {
  /**
   * TypeScript实体转换为Schema格式
   */
  static toSchema(entity: {Module}Data): {Module}Schema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      {module}_id: entity.{module}Id,
      // 其他字段映射
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }

  /**
   * Schema格式转换为TypeScript实体
   */
  static fromSchema(schema: {Module}Schema): {Module}Data {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      {module}Id: schema.{module}_id,
      // 其他字段映射
      createdAt: schema.created_at,
      updatedAt: schema.updated_at
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is {Module}Schema {
    // 基础类型检查
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.timestamp === 'string' &&
      typeof obj.{module}_id === 'string'
      // 其他必需字段检查
    );
  }

  /**
   * 批量转换：Schema数组 → TypeScript数组
   */
  static fromSchemaArray(schemas: {Module}Schema[]): {Module}Data[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  /**
   * 批量转换：TypeScript数组 → Schema数组
   */
  static toSchemaArray(entities: {Module}Data[]): {Module}Schema[] {
    return entities.map(entity => this.toSchema(entity));
  }
}
```

### **2. 验证集成**

#### **服务层验证**
```typescript
// src/modules/{module}/application/services/{module}.service.ts
export class {Module}Service {
  constructor(
    private validator: SchemaValidator,
    private repository: {Module}Repository
  ) {}

  async create{Module}(request: Create{Module}Request): Promise<{Module}Data> {
    // 1. 转换为Schema格式
    const schemaData = {Module}Mapper.toSchema({
      protocolVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      {module}Id: generateUUID(),
      ...request
    } as {Module}Data);

    // 2. Schema验证
    const validationResult = await this.validator.validateData(
      'mplp-{module}', 
      schemaData
    );

    if (!validationResult.isValid) {
      throw new ValidationError(
        '{Module} data validation failed',
        validationResult.errors
      );
    }

    // 3. 业务逻辑处理
    const savedData = await this.repository.save(schemaData);

    // 4. 转换回TypeScript格式
    return {Module}Mapper.fromSchema(savedData);
  }
}
```

### **3. 错误处理**

#### **分层错误处理**
```typescript
// 1. Schema验证错误
export class SchemaValidationError extends Error {
  constructor(
    public schemaName: string,
    public validationErrors: ValidationError[]
  ) {
    super(`Schema validation failed for ${schemaName}`);
    this.name = 'SchemaValidationError';
  }
}

// 2. 业务规则验证错误
export class BusinessRuleError extends Error {
  constructor(
    public rule: string,
    public context: Record<string, unknown>
  ) {
    super(`Business rule violation: ${rule}`);
    this.name = 'BusinessRuleError';
  }
}

// 3. 数据转换错误
export class MappingError extends Error {
  constructor(
    public sourceType: string,
    public targetType: string,
    public field: string
  ) {
    super(`Mapping error: ${sourceType} → ${targetType}, field: ${field}`);
    this.name = 'MappingError';
  }
}
```

## 📊 **维护最佳实践**

### **1. 版本管理策略**

#### **语义化版本控制**
```typescript
const versioningStrategy = {
  // 主版本：破坏性变更
  majorVersion: {
    triggers: [
      'REMOVE_REQUIRED_FIELD',
      'CHANGE_FIELD_TYPE',
      'REMOVE_ENUM_VALUE',
      'CHANGE_VALIDATION_RULES'
    ],
    example: '1.0.0 → 2.0.0'
  },

  // 次版本：向后兼容的功能新增
  minorVersion: {
    triggers: [
      'ADD_OPTIONAL_FIELD',
      'ADD_ENUM_VALUE',
      'RELAX_VALIDATION',
      'ADD_NEW_FEATURE'
    ],
    example: '1.0.0 → 1.1.0'
  },

  // 修订版本：向后兼容的问题修正
  patchVersion: {
    triggers: [
      'FIX_VALIDATION_BUG',
      'UPDATE_DESCRIPTION',
      'FIX_EXAMPLE',
      'IMPROVE_DOCUMENTATION'
    ],
    example: '1.0.0 → 1.0.1'
  }
};
```

#### **兼容性保证**
```json
{
  "properties": {
    "protocol_version": {
      "enum": ["1.0.0", "1.1.0", "1.2.0"],
      "description": "支持的协议版本列表"
    },
    "backward_compatibility": {
      "type": "object",
      "properties": {
        "min_supported_version": {
          "type": "string",
          "const": "1.0.0"
        },
        "deprecated_fields": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "field_name": {"type": "string"},
              "deprecated_since": {"type": "string"},
              "removal_planned": {"type": "string"},
              "replacement": {"type": "string"}
            }
          }
        }
      }
    }
  }
}
```

### **2. 文档维护**

#### **自动化文档生成**
```typescript
// 文档生成脚本
export class SchemaDocumentationGenerator {
  async generateModuleDoc(schemaPath: string): Promise<string> {
    const schema = await this.loadSchema(schemaPath);
    
    return `
# ${schema.title}

## 概述
${schema.description}

## 字段定义
${this.generateFieldTable(schema.properties)}

## 使用示例
${this.generateExamples(schema.examples)}

## 验证规则
${this.generateValidationRules(schema)}

## 版本历史
${this.generateVersionHistory(schema)}
    `;
  }

  private generateFieldTable(properties: any): string {
    // 生成字段表格
  }

  private generateExamples(examples: any[]): string {
    // 生成示例代码
  }
}
```

### **3. 质量保证**

#### **自动化测试**
```typescript
// Schema测试套件
describe('{Module} Schema Tests', () => {
  let validator: SchemaValidator;

  beforeAll(async () => {
    validator = await createValidator();
  });

  describe('Schema Validation', () => {
    it('should validate valid {module} data', async () => {
      const validData = {
        protocol_version: '1.0.0',
        timestamp: new Date().toISOString(),
        {module}_id: generateUUID(),
        // 其他必需字段
      };

      const result = await validator.validateData('mplp-{module}', validData);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid {module} data', async () => {
      const invalidData = {
        // 缺少必需字段
      };

      const result = await validator.validateData('mplp-{module}', invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(greaterThan(0));
    });
  });

  describe('Mapper Tests', () => {
    it('should correctly map TypeScript to Schema', () => {
      const tsData: {Module}Data = {
        // TypeScript格式数据
      };

      const schemaData = {Module}Mapper.toSchema(tsData);
      
      expect(schemaData.protocol_version).toBe(tsData.protocolVersion);
      expect(schemaData.{module}_id).toBe(tsData.{module}Id);
    });

    it('should correctly map Schema to TypeScript', () => {
      const schemaData: {Module}Schema = {
        // Schema格式数据
      };

      const tsData = {Module}Mapper.fromSchema(schemaData);
      
      expect(tsData.protocolVersion).toBe(schemaData.protocol_version);
      expect(tsData.{module}Id).toBe(schemaData.{module}_id);
    });
  });
});
```

## 🚀 **性能最佳实践**

### **1. Schema优化**

#### **结构优化**
```json
{
  // ✅ 好的结构设计
  "properties": {
    // 1. 扁平化结构，避免深层嵌套
    "user_id": {"type": "string"},
    "user_name": {"type": "string"},
    "user_email": {"type": "string"},
    
    // 2. 合理使用引用
    "created_at": {"$ref": "#/$defs/timestamp"},
    "updated_at": {"$ref": "#/$defs/timestamp"},
    
    // 3. 索引友好的字段设计
    "status": {"enum": ["active", "inactive"]},
    "priority": {"type": "integer", "minimum": 1, "maximum": 5}
  },

  // ❌ 避免的结构设计
  "avoid": {
    // 1. 过深的嵌套
    "user": {
      "profile": {
        "personal": {
          "details": {
            "name": {"type": "string"}
          }
        }
      }
    },
    
    // 2. 过于复杂的验证规则
    "complex_field": {
      "allOf": [
        {"if": {}, "then": {}, "else": {}},
        {"anyOf": [{}, {}, {}]},
        {"oneOf": [{}, {}]}
      ]
    }
  }
}
```

### **2. 验证性能优化**

#### **缓存策略**
```typescript
export class OptimizedValidator {
  private schemaCache = new LRUCache<string, CompiledSchema>({
    max: 100,
    ttl: 1000 * 60 * 10 // 10分钟缓存
  });

  private validationCache = new LRUCache<string, ValidationResult>({
    max: 1000,
    ttl: 1000 * 60 * 5 // 5分钟缓存
  });

  async validateWithCache(
    schemaName: string, 
    data: unknown
  ): Promise<ValidationResult> {
    // 1. 检查验证结果缓存
    const cacheKey = this.generateCacheKey(schemaName, data);
    const cached = this.validationCache.get(cacheKey);
    if (cached) return cached;

    // 2. 获取编译后的Schema
    let compiledSchema = this.schemaCache.get(schemaName);
    if (!compiledSchema) {
      compiledSchema = await this.compileSchema(schemaName);
      this.schemaCache.set(schemaName, compiledSchema);
    }

    // 3. 执行验证
    const result = await this.executeValidation(compiledSchema, data);

    // 4. 缓存成功的验证结果
    if (result.isValid) {
      this.validationCache.set(cacheKey, result);
    }

    return result;
  }
}
```

## ✅ **检查清单**

### **Schema设计检查**
- [ ] 遵循统一的结构模板
- [ ] 使用正确的命名约定
- [ ] 包含完整的字段描述
- [ ] 定义合理的验证规则
- [ ] 提供使用示例
- [ ] 考虑性能影响

### **代码实现检查**
- [ ] 实现完整的Mapper类
- [ ] 添加适当的错误处理
- [ ] 编写全面的测试用例
- [ ] 集成验证中间件
- [ ] 优化性能表现

### **维护质量检查**
- [ ] 文档与代码同步
- [ ] 版本管理规范
- [ ] 兼容性测试通过
- [ ] 性能基准达标
- [ ] 监控和日志完善

---

**维护团队**: MPLP最佳实践团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
