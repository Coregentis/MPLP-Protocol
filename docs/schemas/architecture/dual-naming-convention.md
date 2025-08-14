# MPLP 双重命名约定规范

## 📋 **概述**

MPLP采用双重命名约定来确保Schema层和TypeScript层的数据结构既保持一致性又符合各自的最佳实践。这是MPLP架构的核心特性之一。

**版本**: v1.0.0  
**强制执行**: 所有MPLP模块  
**零容忍政策**: 违反命名约定将导致代码拒绝

## 🎯 **核心原则**

### **分层命名策略**
```
Schema层 (JSON)     →  snake_case  →  数据存储和传输
                    ↕ 映射转换
TypeScript层 (TS)   →  camelCase   →  应用程序逻辑
```

### **强制性要求**
- **Schema层**: 100% snake_case命名
- **TypeScript层**: 100% camelCase命名  
- **映射函数**: 必须提供双向转换
- **验证机制**: 100%映射一致性验证

## 📊 **命名规则详解**

### **1. 基础字段命名**

| Schema层 (snake_case) | TypeScript层 (camelCase) | 说明 |
|----------------------|-------------------------|------|
| `context_id` | `contextId` | 上下文标识符 |
| `created_at` | `createdAt` | 创建时间 |
| `updated_at` | `updatedAt` | 更新时间 |
| `protocol_version` | `protocolVersion` | 协议版本 |
| `user_id` | `userId` | 用户标识符 |
| `session_id` | `sessionId` | 会话标识符 |
| `business_metadata` | `businessMetadata` | 业务元数据 |
| `security_context` | `securityContext` | 安全上下文 |

### **2. 复合字段命名**

| Schema层 (snake_case) | TypeScript层 (camelCase) | 说明 |
|----------------------|-------------------------|------|
| `execution_status` | `executionStatus` | 执行状态 |
| `workflow_configuration` | `workflowConfiguration` | 工作流配置 |
| `error_handling_policy` | `errorHandlingPolicy` | 错误处理策略 |
| `performance_metrics` | `performanceMetrics` | 性能指标 |
| `access_control_list` | `accessControlList` | 访问控制列表 |
| `data_validation_rules` | `dataValidationRules` | 数据验证规则 |

### **3. 嵌套对象命名**

```json
// Schema层 (snake_case)
{
  "business_context": {
    "department_info": {
      "department_id": "string",
      "department_name": "string",
      "manager_user_id": "string"
    },
    "project_metadata": {
      "project_id": "string",
      "start_date": "string",
      "end_date": "string"
    }
  }
}
```

```typescript
// TypeScript层 (camelCase)
interface BusinessContext {
  departmentInfo: {
    departmentId: string;
    departmentName: string;
    managerUserId: string;
  };
  projectMetadata: {
    projectId: string;
    startDate: string;
    endDate: string;
  };
}
```

## 🔧 **映射实现规范**

### **标准Mapper类模板**

```typescript
// src/modules/{module}/api/mappers/{module}.mapper.ts
export class {Module}Mapper {
  /**
   * TypeScript实体 → Schema格式
   * 将camelCase字段转换为snake_case
   */
  static toSchema(entity: {Module}Data): {Module}Schema {
    return {
      // 基础字段映射
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      {module}_id: entity.{module}Id,
      
      // 时间字段映射
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      
      // 复杂对象映射
      business_context: entity.businessContext ? {
        department_id: entity.businessContext.departmentId,
        project_id: entity.businessContext.projectId,
        workflow_stage: entity.businessContext.workflowStage
      } : undefined,
      
      // 数组字段映射
      related_entities: entity.relatedEntities?.map(item => ({
        entity_id: item.entityId,
        entity_type: item.entityType,
        relationship_type: item.relationshipType
      })),
      
      // 元数据映射
      metadata: entity.metadata ? {
        created_by: entity.metadata.createdBy,
        last_modified_by: entity.metadata.lastModifiedBy,
        version_number: entity.metadata.versionNumber
      } : undefined
    };
  }

  /**
   * Schema格式 → TypeScript实体
   * 将snake_case字段转换为camelCase
   */
  static fromSchema(schema: {Module}Schema): {Module}Data {
    return {
      // 基础字段映射
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      {module}Id: schema.{module}_id,
      
      // 时间字段映射
      createdAt: schema.created_at,
      updatedAt: schema.updated_at,
      
      // 复杂对象映射
      businessContext: schema.business_context ? {
        departmentId: schema.business_context.department_id,
        projectId: schema.business_context.project_id,
        workflowStage: schema.business_context.workflow_stage
      } : undefined,
      
      // 数组字段映射
      relatedEntities: schema.related_entities?.map(item => ({
        entityId: item.entity_id,
        entityType: item.entity_type,
        relationshipType: item.relationship_type
      })),
      
      // 元数据映射
      metadata: schema.metadata ? {
        createdBy: schema.metadata.created_by,
        lastModifiedBy: schema.metadata.last_modified_by,
        versionNumber: schema.metadata.version_number
      } : undefined
    };
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is {Module}Schema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    
    // 验证必需字段的命名格式
    const requiredSnakeCaseFields = [
      'protocol_version',
      'timestamp', 
      '{module}_id'
    ];
    
    for (const field of requiredSnakeCaseFields) {
      if (!(field in obj)) return false;
      if (typeof obj[field] !== 'string') return false;
    }
    
    // 验证不应该存在camelCase字段
    const prohibitedCamelCaseFields = [
      'protocolVersion',
      '{module}Id',
      'createdAt',
      'updatedAt'
    ];
    
    for (const field of prohibitedCamelCaseFields) {
      if (field in obj) return false; // 发现camelCase字段，验证失败
    }
    
    return true;
  }

  /**
   * 验证TypeScript格式数据
   */
  static validateTypeScript(data: unknown): data is {Module}Data {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    
    // 验证必需字段的命名格式
    const requiredCamelCaseFields = [
      'protocolVersion',
      'timestamp',
      '{module}Id'
    ];
    
    for (const field of requiredCamelCaseFields) {
      if (!(field in obj)) return false;
      if (typeof obj[field] !== 'string') return false;
    }
    
    // 验证不应该存在snake_case字段
    const prohibitedSnakeCaseFields = [
      'protocol_version',
      '{module}_id',
      'created_at',
      'updated_at'
    ];
    
    for (const field of prohibitedSnakeCaseFields) {
      if (field in obj) return false; // 发现snake_case字段，验证失败
    }
    
    return true;
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

  /**
   * 映射一致性验证
   * 验证双向转换的一致性
   */
  static validateMappingConsistency(original: {Module}Data): boolean {
    try {
      // 原始数据 → Schema → TypeScript
      const schemaData = this.toSchema(original);
      const convertedBack = this.fromSchema(schemaData);
      
      // 深度比较关键字段
      const keyFields = ['{module}Id', 'protocolVersion', 'timestamp'];
      
      for (const field of keyFields) {
        if (original[field as keyof {Module}Data] !== convertedBack[field as keyof {Module}Data]) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

## 🔍 **验证机制**

### **1. 编译时验证**

```typescript
// 类型级别的命名约定检查
type ValidateSnakeCase<T extends string> = T extends `${string}_${string}` 
  ? T 
  : never;

type ValidateCamelCase<T extends string> = T extends `${string}_${string}`
  ? never
  : T;

// Schema接口必须使用snake_case
interface {Module}Schema {
  protocol_version: string;  // ✅ 正确
  {module}_id: string;       // ✅ 正确
  created_at: string;        // ✅ 正确
  // protocolVersion: string; // ❌ 编译错误
}

// TypeScript接口必须使用camelCase
interface {Module}Data {
  protocolVersion: string;   // ✅ 正确
  {module}Id: string;        // ✅ 正确
  createdAt: string;         // ✅ 正确
  // protocol_version: string; // ❌ 编译错误
}
```

### **2. 运行时验证**

```typescript
// 运行时命名约定检查
export class NamingConventionValidator {
  static validateSchemaFields(obj: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    
    for (const key of Object.keys(obj)) {
      if (!this.isSnakeCase(key)) {
        errors.push(`Schema字段 "${key}" 必须使用snake_case命名`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateTypeScriptFields(obj: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    
    for (const key of Object.keys(obj)) {
      if (!this.isCamelCase(key)) {
        errors.push(`TypeScript字段 "${key}" 必须使用camelCase命名`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private static isSnakeCase(str: string): boolean {
    return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(str);
  }
  
  private static isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str) && !/.*_.*/.test(str);
  }
}
```

### **3. 自动化测试**

```typescript
// 映射一致性测试
describe('{Module}Mapper 双重命名约定测试', () => {
  describe('命名约定验证', () => {
    it('Schema数据应该使用snake_case', () => {
      const schemaData: {Module}Schema = {
        protocol_version: '1.0.0',
        {module}_id: 'test-id',
        created_at: '2025-08-13T10:00:00Z'
      };
      
      const result = NamingConventionValidator.validateSchemaFields(schemaData);
      expect(result.isValid).toBe(true);
    });
    
    it('TypeScript数据应该使用camelCase', () => {
      const tsData: {Module}Data = {
        protocolVersion: '1.0.0',
        {module}Id: 'test-id',
        createdAt: '2025-08-13T10:00:00Z'
      };
      
      const result = NamingConventionValidator.validateTypeScriptFields(tsData);
      expect(result.isValid).toBe(true);
    });
  });
  
  describe('映射一致性测试', () => {
    it('双向转换应该保持数据一致性', () => {
      const originalData: {Module}Data = {
        protocolVersion: '1.0.0',
        {module}Id: 'test-id-123',
        createdAt: '2025-08-13T10:00:00Z'
      };
      
      // TypeScript → Schema → TypeScript
      const schemaData = {Module}Mapper.toSchema(originalData);
      const convertedBack = {Module}Mapper.fromSchema(schemaData);
      
      expect(convertedBack).toEqual(originalData);
      expect({Module}Mapper.validateMappingConsistency(originalData)).toBe(true);
    });
  });
});
```

## 🛠️ **开发工具支持**

### **1. ESLint规则**

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Schema文件中禁止camelCase
    'mplp/schema-snake-case': ['error', {
      patterns: ['src/schemas/*.json']
    }],
    
    // TypeScript文件中禁止snake_case
    'mplp/typescript-camel-case': ['error', {
      patterns: ['src/**/*.ts']
    }]
  }
};
```

### **2. 自动化检查脚本**

```bash
#!/bin/bash
# scripts/validate-naming-convention.sh

echo "🔍 验证双重命名约定..."

# 检查Schema文件
echo "检查Schema文件命名约定..."
npm run validate:schema-naming

# 检查TypeScript文件
echo "检查TypeScript文件命名约定..."
npm run validate:typescript-naming

# 检查映射一致性
echo "检查映射一致性..."
npm run validate:mapping-consistency

echo "✅ 双重命名约定验证完成"
```

## ✅ **最佳实践**

### **1. 开发流程**
1. **设计阶段**: 先定义Schema字段（snake_case）
2. **实现阶段**: 创建TypeScript接口（camelCase）
3. **映射阶段**: 实现Mapper类的双向转换
4. **测试阶段**: 验证映射一致性和命名约定
5. **集成阶段**: 确保所有模块遵循统一标准

### **2. 代码审查检查清单**
- [ ] Schema字段100%使用snake_case
- [ ] TypeScript字段100%使用camelCase
- [ ] Mapper类实现了所有必需方法
- [ ] 映射一致性测试通过
- [ ] 命名约定验证通过

### **3. 常见错误避免**
```typescript
// ❌ 错误：在Schema中使用camelCase
{
  "protocolVersion": "1.0.0",  // 错误
  "contextId": "abc123"        // 错误
}

// ✅ 正确：在Schema中使用snake_case
{
  "protocol_version": "1.0.0", // 正确
  "context_id": "abc123"       // 正确
}

// ❌ 错误：在TypeScript中使用snake_case
interface ContextData {
  protocol_version: string;     // 错误
  context_id: string;          // 错误
}

// ✅ 正确：在TypeScript中使用camelCase
interface ContextData {
  protocolVersion: string;      // 正确
  contextId: string;           // 正确
}
```

---

**维护团队**: MPLP架构团队  
**最后更新**: 2025-08-13  
**强制执行**: 所有MPLP模块  
**违规处理**: 代码拒绝，必须修正后重新提交
