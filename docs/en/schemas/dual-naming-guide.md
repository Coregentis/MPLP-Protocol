# MPLP Dual Naming Convention Guide

> **🌐 Language Navigation**: [English](dual-naming-guide.md) | [中文](../../zh-CN/schemas/dual-naming-guide.md)



**Multi-Agent Protocol Lifecycle Platform - Comprehensive Dual Naming Convention Implementation Guide**

[![Convention](https://img.shields.io/badge/convention-snake__case%20%E2%86%94%20camelCase-blue.svg)](./field-mapping-reference.md)
[![Implementation](https://img.shields.io/badge/implementation-Production%20Validated-brightgreen.svg)](./validation-rules.md)
[![Compliance](https://img.shields.io/badge/compliance-100%25%20Verified-brightgreen.svg)](./validation-rules.md)
[![Mapping](https://img.shields.io/badge/mapping-Enterprise%20Grade-brightgreen.svg)](../../../src/utils/mappers/)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/schemas/dual-naming-guide.md)

---

## 🎯 Overview

The MPLP Dual Naming Convention enables **production-validated** seamless integration between JSON/REST APIs (snake_case) and programming languages (camelCase). This guide provides comprehensive implementation details, proven mapping rules, and enterprise-grade best practices for maintaining consistency across all 10 completed MPLP modules, validated through 2,902/2,902 tests with 100% mapping compliance.

### **Core Principles**
- **Consistency**: Uniform naming patterns across all MPLP modules
- **Interoperability**: Seamless data exchange between different layers
- **Automation**: Automated mapping and validation processes
- **Maintainability**: Clear rules that are easy to follow and maintain
- **Performance**: Efficient mapping with minimal overhead

### **Convention Benefits**
- **API Compatibility**: Native JSON/REST API compatibility with snake_case
- **Language Integration**: Natural integration with camelCase languages (TypeScript, JavaScript, Java)
- **Developer Experience**: Familiar naming conventions in each context
- **Tool Support**: Automated code generation and validation
- **Standards Compliance**: Follows industry best practices

---

## 🏗️ Naming Convention Architecture

### **Two-Layer System**

```
┌─────────────────────────────────────────────────────────────┐
│                MPLP Dual Naming System                     │
├─────────────────────────────────────────────────────────────┤
│  Schema Layer (snake_case)                                 │
│  ├── JSON Schema Definitions                               │
│  ├── REST API Requests/Responses                           │
│  ├── Database Storage                                      │
│  └── Protocol Message Formats                              │
├─────────────────────────────────────────────────────────────┤
│  Programming Layer (camelCase)                             │
│  ├── TypeScript Interfaces                                 │
│  ├── JavaScript Objects                                    │
│  ├── Java Classes                                          │
│  └── Application Code                                      │
├─────────────────────────────────────────────────────────────┤
│  Mapping Layer                                            │
│  ├── Automated Mappers                                     │
│  ├── Validation Functions                                  │
│  ├── Type Converters                                       │
│  └── Code Generators                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Naming Rules and Patterns

### **Schema Layer Rules (snake_case)**

#### **Basic Patterns**
```json
{
  "context_id": "ctx-001",
  "created_at": "2025-09-03T10:00:00Z",
  "participant_count": 5,
  "last_activity_at": "2025-09-03T10:30:00Z",
  "configuration_settings": {
    "max_participants": 10,
    "auto_cleanup_enabled": true
  }
}
```

#### **Identifier Fields**
- Pattern: `{entity}_id`
- Examples: `context_id`, `plan_id`, `agent_id`, `session_id`
- Always use singular form for entity name

#### **Timestamp Fields**
- Pattern: `{action}_at` or `{event}_time`
- Examples: `created_at`, `updated_at`, `started_at`, `execution_time`
- Always use past tense for actions

#### **Count and Quantity Fields**
- Pattern: `{entity}_count` or `total_{entities}`
- Examples: `participant_count`, `task_count`, `total_messages`
- Use singular form for entity name in count fields

#### **Boolean Fields**
- Pattern: `is_{condition}`, `has_{feature}`, or `{feature}_enabled`
- Examples: `is_active`, `has_permissions`, `encryption_enabled`
- Use descriptive, positive conditions

#### **Configuration Fields**
- Pattern: `{scope}_config`, `{scope}_settings`, or `{scope}_options`
- Examples: `security_config`, `performance_settings`, `display_options`
- Use descriptive scope names

### **Programming Layer Rules (camelCase)**

#### **Basic Patterns**
```typescript
interface Context {
  contextId: string;
  createdAt: Date;
  participantCount: number;
  lastActivityAt: Date;
  configurationSettings: {
    maxParticipants: number;
    autoCleanupEnabled: boolean;
  };
}
```

#### **Conversion Rules**
- Remove underscores and capitalize following letters
- Keep first letter lowercase
- Preserve acronyms in appropriate case
- Maintain semantic meaning

---

## 🔄 Mapping Implementation

### **Automated Mapping Functions**

#### **TypeScript Mapper Template**
```typescript
export class {ModuleName}Mapper {
  /**
   * Convert entity to schema format (camelCase → snake_case)
   */
  static toSchema(entity: {ModuleName}Entity): {ModuleName}Schema {
    return {
      {entity}_id: entity.{entity}Id,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      participant_count: entity.participantCount,
      configuration_settings: this.mapConfigurationToSchema(entity.configurationSettings),
      metadata: this.mapMetadataToSchema(entity.metadata)
    };
  }

  /**
   * Convert schema to entity format (snake_case → camelCase)
   */
  static fromSchema(schema: {ModuleName}Schema): {ModuleName}Entity {
    return {
      {entity}Id: schema.{entity}_id,
      createdAt: new Date(schema.created_at),
      updatedAt: new Date(schema.updated_at),
      participantCount: schema.participant_count,
      configurationSettings: this.mapConfigurationFromSchema(schema.configuration_settings),
      metadata: this.mapMetadataFromSchema(schema.metadata)
    };
  }

  /**
   * Validate schema format
   */
  static validateSchema(data: any): ValidationResult {
    return validateJSONSchema(data, {moduleName}Schema);
  }

  /**
   * Validate entity format
   */
  static validateEntity(data: any): ValidationResult {
    return validateTypeScript(data, {ModuleName}Entity);
  }

  // Helper methods for nested object mapping
  private static mapConfigurationToSchema(config: ConfigurationSettings): ConfigurationSchema {
    return {
      max_participants: config.maxParticipants,
      auto_cleanup_enabled: config.autoCleanupEnabled,
      timeout_duration: config.timeoutDuration
    };
  }

  private static mapConfigurationFromSchema(schema: ConfigurationSchema): ConfigurationSettings {
    return {
      maxParticipants: schema.max_participants,
      autoCleanupEnabled: schema.auto_cleanup_enabled,
      timeoutDuration: schema.timeout_duration
    };
  }
}
```

### **Batch Mapping Functions**

#### **Array Mapping**
```typescript
export class {ModuleName}Mapper {
  /**
   * Convert array of entities to schema format
   */
  static toSchemaArray(entities: {ModuleName}Entity[]): {ModuleName}Schema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * Convert array of schemas to entity format
   */
  static fromSchemaArray(schemas: {ModuleName}Schema[]): {ModuleName}Entity[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  /**
   * Validate array of schemas
   */
  static validateSchemaArray(data: any[]): ValidationResult {
    const results = data.map(item => this.validateSchema(item));
    return this.combineValidationResults(results);
  }
}
```

---

## 📊 Field Mapping Reference

### **Common Field Mappings**

| Schema (snake_case) | TypeScript (camelCase) | Type | Description |
|-------------------|----------------------|------|-------------|
| `context_id` | `contextId` | string | Context identifier |
| `created_at` | `createdAt` | Date | Creation timestamp |
| `updated_at` | `updatedAt` | Date | Last update timestamp |
| `participant_count` | `participantCount` | number | Number of participants |
| `last_activity_at` | `lastActivityAt` | Date | Last activity timestamp |
| `is_active` | `isActive` | boolean | Active status flag |
| `has_permissions` | `hasPermissions` | boolean | Permission status |
| `configuration_settings` | `configurationSettings` | object | Configuration object |
| `metadata_info` | `metadataInfo` | object | Metadata information |
| `performance_metrics` | `performanceMetrics` | object | Performance data |

### **Module-Specific Mappings**

#### **Context Module**
| Schema | TypeScript | Type | Description |
|--------|------------|------|-------------|
| `context_type` | `contextType` | string | Type of context |
| `session_count` | `sessionCount` | number | Number of sessions |
| `participant_limit` | `participantLimit` | number | Maximum participants |
| `auto_cleanup_enabled` | `autoCleanupEnabled` | boolean | Auto cleanup setting |

#### **Plan Module**
| Schema | TypeScript | Type | Description |
|--------|------------|------|-------------|
| `plan_id` | `planId` | string | Plan identifier |
| `execution_status` | `executionStatus` | string | Execution status |
| `task_count` | `taskCount` | number | Number of tasks |
| `estimated_duration` | `estimatedDuration` | number | Estimated duration |

#### **Role Module**
| Schema | TypeScript | Type | Description |
|--------|------------|------|-------------|
| `role_id` | `roleId` | string | Role identifier |
| `permission_level` | `permissionLevel` | string | Permission level |
| `capability_requirements` | `capabilityRequirements` | array | Required capabilities |
| `access_control_enabled` | `accessControlEnabled` | boolean | Access control setting |

---

## ✅ Validation and Quality Assurance

### **Mapping Validation**

#### **Consistency Validation**
```typescript
export class MappingValidator {
  /**
   * Validate round-trip mapping consistency
   */
  static validateRoundTrip<T, S>(
    entity: T,
    toSchema: (entity: T) => S,
    fromSchema: (schema: S) => T,
    equals: (a: T, b: T) => boolean
  ): ValidationResult {
    try {
      const schema = toSchema(entity);
      const roundTripEntity = fromSchema(schema);
      const isConsistent = equals(entity, roundTripEntity);
      
      return {
        valid: isConsistent,
        errors: isConsistent ? [] : ['Round-trip mapping failed'],
        warnings: [],
        metadata: {
          originalEntity: entity,
          schema: schema,
          roundTripEntity: roundTripEntity
        }
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Mapping error: ${error.message}`],
        warnings: [],
        metadata: { error }
      };
    }
  }

  /**
   * Validate field naming consistency
   */
  static validateFieldNaming(schema: object): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [key, value] of Object.entries(schema)) {
      // Check snake_case format
      if (!this.isValidSnakeCase(key)) {
        errors.push(`Field '${key}' does not follow snake_case convention`);
      }

      // Check nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedResult = this.validateFieldNaming(value);
        errors.push(...nestedResult.errors);
        warnings.push(...nestedResult.warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: { checkedFields: Object.keys(schema) }
    };
  }

  private static isValidSnakeCase(str: string): boolean {
    return /^[a-z][a-z0-9_]*[a-z0-9]$/.test(str) || /^[a-z]$/.test(str);
  }
}
```

### **Automated Testing**

#### **Mapping Test Template**
```typescript
describe('{ModuleName}Mapper', () => {
  describe('toSchema', () => {
    it('should convert entity to schema format', () => {
      const entity: {ModuleName}Entity = {
        {entity}Id: 'test-001',
        createdAt: new Date('2025-09-03T10:00:00Z'),
        participantCount: 5,
        isActive: true
      };

      const schema = {ModuleName}Mapper.toSchema(entity);

      expect(schema).toEqual({
        {entity}_id: 'test-001',
        created_at: '2025-09-03T10:00:00.000Z',
        participant_count: 5,
        is_active: true
      });
    });
  });

  describe('fromSchema', () => {
    it('should convert schema to entity format', () => {
      const schema: {ModuleName}Schema = {
        {entity}_id: 'test-001',
        created_at: '2025-09-03T10:00:00Z',
        participant_count: 5,
        is_active: true
      };

      const entity = {ModuleName}Mapper.fromSchema(schema);

      expect(entity.{entity}Id).toBe('test-001');
      expect(entity.createdAt).toEqual(new Date('2025-09-03T10:00:00Z'));
      expect(entity.participantCount).toBe(5);
      expect(entity.isActive).toBe(true);
    });
  });

  describe('round-trip mapping', () => {
    it('should maintain data integrity in round-trip conversion', () => {
      const originalEntity: {ModuleName}Entity = {
        {entity}Id: 'test-001',
        createdAt: new Date('2025-09-03T10:00:00Z'),
        participantCount: 5,
        isActive: true
      };

      const schema = {ModuleName}Mapper.toSchema(originalEntity);
      const roundTripEntity = {ModuleName}Mapper.fromSchema(schema);

      expect(roundTripEntity).toEqual(originalEntity);
    });
  });
});
```

---

## 🛠️ Code Generation

### **Automated Mapper Generation**

#### **Generator Configuration**
```json
{
  "generator": {
    "input": "schemas/modules/mplp-{module}.json",
    "output": "src/mappers/{module}-mapper.ts",
    "template": "templates/mapper.template.ts",
    "options": {
      "generateValidation": true,
      "generateArrayMethods": true,
      "generateTypeGuards": true,
      "includeDocumentation": true
    }
  }
}
```

#### **Template Variables**
- `{ModuleName}`: PascalCase module name (e.g., Context, Plan)
- `{moduleName}`: camelCase module name (e.g., context, plan)
- `{module}`: lowercase module name (e.g., context, plan)
- `{MODULE}`: uppercase module name (e.g., CONTEXT, PLAN)

### **Build Integration**

#### **NPM Scripts**
```json
{
  "scripts": {
    "generate:mappers": "node scripts/generate-mappers.js",
    "validate:mapping": "node scripts/validate-mapping.js",
    "test:mapping": "jest tests/mapping/*.test.ts",
    "build:mappers": "npm run generate:mappers && npm run validate:mapping"
  }
}
```

---

## 📚 Best Practices

### **Implementation Guidelines**

1. **Always Use Mappers**: Never manually convert between formats
2. **Validate Both Formats**: Validate both schema and entity formats
3. **Handle Errors Gracefully**: Provide meaningful error messages
4. **Test Round-Trip**: Always test round-trip conversion
5. **Document Mappings**: Document any special mapping rules
6. **Use Type Safety**: Leverage TypeScript for type safety
7. **Automate Generation**: Use automated code generation when possible

### **Common Pitfalls**

1. **Inconsistent Naming**: Not following naming conventions consistently
2. **Missing Validation**: Skipping validation steps
3. **Manual Conversion**: Manually converting instead of using mappers
4. **Incomplete Mapping**: Not mapping all fields
5. **Type Mismatches**: Incorrect type conversions
6. **Null Handling**: Not properly handling null/undefined values

### **Performance Considerations**

1. **Lazy Mapping**: Map only when necessary
2. **Batch Operations**: Use batch mapping for arrays
3. **Caching**: Cache frequently used mappings
4. **Validation Optimization**: Optimize validation for performance
5. **Memory Management**: Avoid memory leaks in mapping operations

---

## 🔗 Related Documentation

- [Field Mapping Reference](./field-mapping-reference.md) - Complete field mapping reference
- [Validation Rules](./validation-rules.md) - Validation rules and implementation
- [Schema Standards](./schema-standards.md) - Schema definition standards
- [Evolution Strategy](./evolution-strategy.md) - Schema evolution guidelines

---

**Guide Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Compliance Level**: 100%  

**⚠️ Alpha Notice**: The dual naming convention is stable in Alpha release with comprehensive mapping support. Enhanced code generation and validation tools will be added in Beta release.
