# MPLP Mapper Implementation Templates v1.0

## 📋 **Template Overview**

**Purpose**: Standardized Mapper implementation templates for MPLP dual naming convention
**Scope**: Schema (snake_case) ↔ TypeScript (camelCase) mapping
**Quality Standard**: Zero Technical Debt + Enterprise-Grade Implementation
**Based On**: 6 completed modules unified implementation pattern (Context, Plan, Confirm, Trace, Role, Extension)
**CRITICAL**: All 10 modules must use IDENTICAL Mapper implementation pattern

## 🎯 **Dual Naming Convention Standard**

### **Schema Layer (snake_case)**
```json
{
  "context_id": "uuid-string",
  "created_at": "2025-08-22T10:30:00Z",
  "security_context": {
    "user_identity": {
      "user_id": "string",
      "display_name": "string"
    }
  }
}
```

### **TypeScript Layer (camelCase)**
```typescript
interface ModuleEntityData {
  contextId: string;
  createdAt: Date;
  securityContext: {
    userIdentity: {
      userId: string;
      displayName: string;
    };
  };
}
```

## 🏗️ **Complete Mapper Template**

### **1. Schema Interface Definition**
```typescript
/**
 * {Module} Schema Interface (snake_case) - Based on mplp-{module}.json
 */
export interface {Module}Schema {
  // ===== BASIC PROTOCOL FIELDS =====
  protocol_version: string;
  timestamp: string;
  {module}_id: string;
  name: string;
  description?: string;
  status: string;
  
  // ===== CROSS-MODULE COORDINATION FIELDS =====
  // (Based on MPLP module relationships)
  context_id?: string;        // Associated Context ID
  plan_id?: string;          // Associated Plan ID  
  role_id?: string;          // Creator Role ID
  trace_id?: string;         // Monitoring Trace ID
  
  // ===== CROSS-CUTTING CONCERNS INTEGRATION =====
  // (Based on 9 cross-cutting concerns schemas)
  security_context?: SecurityContextSchema;
  performance_metrics?: PerformanceMetricsSchema;
  error_handling?: ErrorHandlingSchema;
  event_bus?: EventBusSchema;
  coordination?: CoordinationSchema;
  state_sync?: StateSyncSchema;
  orchestration?: OrchestrationSchema;
  transaction?: TransactionSchema;
  protocol_version_info?: ProtocolVersionSchema;
  
  // ===== MODULE-SPECIFIC FIELDS =====
  // Add module-specific fields here based on mplp-{module}.json
  {module}_specific_field?: string;
}
```

### **2. TypeScript Entity Data Interface**
```typescript
/**
 * {Module} Entity Data Interface (camelCase) - TypeScript Layer
 */
export interface {Module}EntityData {
  // ===== BASIC PROTOCOL FIELDS =====
  protocolVersion: string;
  timestamp: Date;
  {module}Id: string;
  name: string;
  description?: string;
  status: string;
  
  // ===== CROSS-MODULE COORDINATION FIELDS =====
  contextId?: string;
  planId?: string;
  roleId?: string;
  traceId?: string;
  
  // ===== CROSS-CUTTING CONCERNS INTEGRATION =====
  securityContext?: SecurityContextData;
  performanceMetrics?: PerformanceMetricsData;
  errorHandling?: ErrorHandlingData;
  eventBus?: EventBusData;
  coordination?: CoordinationData;
  stateSync?: StateSyncData;
  orchestration?: OrchestrationData;
  transaction?: TransactionData;
  protocolVersionInfo?: ProtocolVersionData;
  
  // ===== MODULE-SPECIFIC FIELDS =====
  {module}SpecificField?: string;
}
```

### **3. Complete Mapper Class Implementation**
```typescript
/**
 * {Module} Mapper - Complete Schema-TypeScript Mapping
 * 
 * Implements MPLP dual naming convention with cross-cutting concerns integration
 */
export class {Module}Mapper {
  /**
   * TypeScript Entity → Schema Format (camelCase → snake_case)
   */
  static toSchema(entity: {Module}EntityData): {Module}Schema {
    return {
      // ===== BASIC PROTOCOL FIELDS =====
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      {module}_id: entity.{module}Id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      
      // ===== CROSS-MODULE COORDINATION FIELDS =====
      context_id: entity.contextId,
      plan_id: entity.planId,
      role_id: entity.roleId,
      trace_id: entity.traceId,
      
      // ===== CROSS-CUTTING CONCERNS MAPPING =====
      security_context: entity.securityContext ? this.mapSecurityContextToSchema(entity.securityContext) : undefined,
      performance_metrics: entity.performanceMetrics ? this.mapPerformanceMetricsToSchema(entity.performanceMetrics) : undefined,
      error_handling: entity.errorHandling ? this.mapErrorHandlingToSchema(entity.errorHandling) : undefined,
      event_bus: entity.eventBus ? this.mapEventBusToSchema(entity.eventBus) : undefined,
      coordination: entity.coordination ? this.mapCoordinationToSchema(entity.coordination) : undefined,
      state_sync: entity.stateSync ? this.mapStateSyncToSchema(entity.stateSync) : undefined,
      orchestration: entity.orchestration ? this.mapOrchestrationToSchema(entity.orchestration) : undefined,
      transaction: entity.transaction ? this.mapTransactionToSchema(entity.transaction) : undefined,
      protocol_version_info: entity.protocolVersionInfo ? this.mapProtocolVersionToSchema(entity.protocolVersionInfo) : undefined,
      
      // ===== MODULE-SPECIFIC FIELDS =====
      {module}_specific_field: entity.{module}SpecificField
    };
  }

  /**
   * Schema Format → TypeScript Entity (snake_case → camelCase)
   */
  static fromSchema(schema: {Module}Schema): {Module}EntityData {
    return {
      // ===== BASIC PROTOCOL FIELDS =====
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      {module}Id: schema.{module}_id,
      name: schema.name,
      description: schema.description,
      status: schema.status,
      
      // ===== CROSS-MODULE COORDINATION FIELDS =====
      contextId: schema.context_id,
      planId: schema.plan_id,
      roleId: schema.role_id,
      traceId: schema.trace_id,
      
      // ===== CROSS-CUTTING CONCERNS MAPPING =====
      securityContext: schema.security_context ? this.mapSecurityContextFromSchema(schema.security_context) : undefined,
      performanceMetrics: schema.performance_metrics ? this.mapPerformanceMetricsFromSchema(schema.performance_metrics) : undefined,
      errorHandling: schema.error_handling ? this.mapErrorHandlingFromSchema(schema.error_handling) : undefined,
      eventBus: schema.event_bus ? this.mapEventBusFromSchema(schema.event_bus) : undefined,
      coordination: schema.coordination ? this.mapCoordinationFromSchema(schema.coordination) : undefined,
      stateSync: schema.state_sync ? this.mapStateSyncFromSchema(schema.state_sync) : undefined,
      orchestration: schema.orchestration ? this.mapOrchestrationFromSchema(schema.orchestration) : undefined,
      transaction: schema.transaction ? this.mapTransactionFromSchema(schema.transaction) : undefined,
      protocolVersionInfo: schema.protocol_version_info ? this.mapProtocolVersionFromSchema(schema.protocol_version_info) : undefined,
      
      // ===== MODULE-SPECIFIC FIELDS =====
      {module}SpecificField: schema.{module}_specific_field
    };
  }

  /**
   * Validate Schema Format Data
   */
  static validateSchema(data: unknown): data is {Module}Schema {
    if (!data || typeof data !== 'object') return false;

    const obj = data as Record<string, unknown>;

    // Validate required basic fields
    if (typeof obj.protocol_version !== 'string') return false;
    if (typeof obj.timestamp !== 'string') return false;
    if (typeof obj.{module}_id !== 'string') return false;
    if (typeof obj.name !== 'string') return false;
    if (typeof obj.status !== 'string') return false;

    // Additional validation logic based on specific module requirements
    return true;
  }

  /**
   * Batch Conversion: TypeScript Entity Array → Schema Array
   */
  static toSchemaArray(entities: {Module}EntityData[]): {Module}Schema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * Batch Conversion: Schema Array → TypeScript Entity Array
   */
  static fromSchemaArray(schemas: {Module}Schema[]): {Module}EntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  // ===== CROSS-CUTTING CONCERNS MAPPING METHODS =====
  // These methods handle the 9 cross-cutting concerns mapping
  
  private static mapSecurityContextToSchema(data: SecurityContextData): SecurityContextSchema {
    // Implementation based on mplp-security.json schema
    return {
      session_id: data.sessionId,
      user_identity: {
        user_id: data.userIdentity.userId,
        username: data.userIdentity.username,
        display_name: data.userIdentity.displayName,
        user_type: data.userIdentity.userType,
        // ... other security context fields
      },
      // ... other security context mapping
    };
  }

  private static mapSecurityContextFromSchema(schema: SecurityContextSchema): SecurityContextData {
    // Implementation based on mplp-security.json schema
    return {
      sessionId: schema.session_id,
      userIdentity: {
        userId: schema.user_identity.user_id,
        username: schema.user_identity.username,
        displayName: schema.user_identity.display_name,
        userType: schema.user_identity.user_type,
        // ... other security context fields
      },
      // ... other security context mapping
    };
  }

  // Similar methods for other 8 cross-cutting concerns:
  // - mapPerformanceMetricsToSchema/FromSchema
  // - mapErrorHandlingToSchema/FromSchema
  // - mapEventBusToSchema/FromSchema
  // - mapCoordinationToSchema/FromSchema
  // - mapStateSyncToSchema/FromSchema
  // - mapOrchestrationToSchema/FromSchema
  // - mapTransactionToSchema/FromSchema
  // - mapProtocolVersionToSchema/FromSchema
}
```

## 🔧 **Implementation Checklist**

### **统一实施清单（所有10个模块使用IDENTICAL流程）**
```markdown
CRITICAL: 基于6个已完成模块的成功模式

□ 阶段1: 强制文档阅读和架构理解
  □ 读取实际的src/schemas/mplp-{module}.json文件
  □ 理解统一架构原则和双重命名约定
  □ 参考已完成模块的Mapper实现模式

□ 阶段2: Schema接口定义
  □ 创建Schema接口（snake_case命名）
  □ 创建EntityData接口（camelCase命名）
  □ 确保与其他6个模块的接口结构一致

□ 阶段3: 核心映射方法实现
  □ 实现toSchema()方法（camelCase → snake_case）
  □ 实现fromSchema()方法（snake_case → camelCase）
  □ 实现validateSchema()方法（类型安全验证）
  □ 实现批量转换方法（toSchemaArray, fromSchemaArray）

□ 阶段4: 横切关注点映射实现
  □ 实现所有9个横切关注点的映射方法
  □ 确保与其他模块的横切关注点映射一致
  □ 验证映射的完整性和正确性

□ 阶段5: 质量验证和测试
  □ 测试所有映射函数的一致性
  □ 确保100% TypeScript类型安全
  □ 验证ESLint合规性（0警告）
  □ 确保与其他6个模块的质量标准一致
```

### **统一质量门禁（零容忍标准）**
```bash
# 强制质量检查（与其他6个已完成模块相同标准）
npm run typecheck        # 必须通过：0错误
npm run lint             # 必须通过：0警告
npm run test:mappers     # 必须通过：100%
npm run validate:mapping # 必须通过：100%一致性
npm run validate:cross-cutting # 必须通过：9个关注点100%集成
```

---

**Template Version**: 2.0.0
**Based On**: 6个已完成模块的统一架构模式（Context, Plan, Confirm, Trace, Role, Extension）
**Quality Standard**: Enterprise-Grade + Zero Technical Debt + Unified Architecture
**Applicable To**: 所有MPLP v1.0模块（确保10个模块使用IDENTICAL模式）
**CRITICAL**: 确保所有模块Mapper实现完全一致，支持统一的协议生态系统
