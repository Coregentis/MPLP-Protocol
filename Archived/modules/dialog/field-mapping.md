# Dialog Module Field Mapping

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2025-08-31
**Mapping Standard**: Schema (snake_case) ↔ TypeScript (camelCase)
**Validation**: 100% mapping consistency
**Implementation**: DialogMapper class with complete dual naming support

This document provides comprehensive field mapping between JSON Schema (snake_case) and TypeScript (camelCase) for the Dialog Module, with enterprise-grade validation and consistency checking.

## 📋 **Complete Field Mapping Based on Actual Schema**

Based on the actual Schema definition in `src/schemas/mplp-dialog.json`, this document provides complete dual naming convention mapping with DialogMapper implementation.

### **Basic Protocol Fields**

| Schema Field (snake_case) | TypeScript Field (camelCase) | Type | Required | Description |
|---------------------------|------------------------------|------|----------|-------------|
| protocol_version | protocolVersion | string | ✅ | MPLP protocol version |
| timestamp | timestamp | string | ✅ | ISO 8601 format timestamp |
| dialog_id | dialogId | UUID | ✅ | Dialog unique identifier |
| name | name | string | ✅ | Dialog name |
| description | description | string | ❌ | Dialog description |
| participants | participants | string[] | ✅ | Dialog participant ID list |
| status | status | enum | ✅ | Dialog status |
| created_at | createdAt | string | ✅ | Creation timestamp |
| updated_at | updatedAt | string | ✅ | Last update timestamp |

### **Dialog Capabilities Configuration**

| Schema Field (snake_case) | TypeScript Field (camelCase) | Type | Required | Description |
|---------------------------|------------------------------|------|----------|-------------|
| capabilities | capabilities | object | ✅ | Dialog capabilities configuration |
| capabilities.basic | capabilities.basic | object | ✅ | Basic dialog capabilities |
| capabilities.intelligent_control | capabilities.intelligentControl | object | ❌ | Intelligent dialog control |
| capabilities.critical_thinking | capabilities.criticalThinking | object | ❌ | Critical thinking analysis |
| capabilities.knowledge_search | capabilities.knowledgeSearch | object | ❌ | Knowledge search integration |
| capabilities.multimodal | capabilities.multimodal | object | ❌ | Multi-modal interaction |
| capabilities.context_awareness | capabilities.contextAwareness | object | ❌ | Context awareness |
| capabilities.emotional_intelligence | capabilities.emotionalIntelligence | object | ❌ | Emotional intelligence |
| capabilities.creative_problem_solving | capabilities.creativeProblemSolving | object | ❌ | Creative problem solving |
| capabilities.ethical_reasoning | capabilities.ethicalReasoning | object | ❌ | Ethical reasoning |
| capabilities.adaptive_learning | capabilities.adaptiveLearning | object | ❌ | Adaptive learning |

### **Dialog Strategy Configuration**

| Schema Field (snake_case) | TypeScript Field (camelCase) | Type | Required | Description |
|---------------------------|------------------------------|------|----------|-------------|
| strategy | strategy | object | ❌ | Dialog strategy configuration |
| strategy.type | strategy.type | enum | ✅ | Strategy type |
| strategy.rounds | strategy.rounds | object | ❌ | Round configuration |
| strategy.exit_criteria | strategy.exitCriteria | object | ❌ | Exit criteria |
| strategy.adaptation_rules | strategy.adaptationRules | object | ❌ | Adaptation rules |

### **Context Configuration**

| Schema Field (snake_case) | TypeScript Field (camelCase) | Type | Required | Description |
|---------------------------|------------------------------|------|----------|-------------|
| context | context | object | ❌ | Dialog context configuration |
| context.session_id | context.sessionId | string | ❌ | Session ID |
| context.context_id | context.contextId | string | ❌ | Context ID |
| context.knowledge_base | context.knowledgeBase | string | ❌ | Knowledge base |
| context.previous_dialogs | context.previousDialogs | string[] | ❌ | Previous dialogs |
| context.memory_settings | context.memorySettings | object | ❌ | Memory settings |

### **Configuration Management**

| Schema Field (snake_case) | TypeScript Field (camelCase) | Type | Required | Description |
|---------------------------|------------------------------|------|----------|-------------|
| configuration | configuration | object | ❌ | Dialog configuration |
| configuration.max_turns | configuration.maxTurns | number | ❌ | Maximum turns |
| configuration.timeout | configuration.timeout | number | ❌ | Timeout in milliseconds |
| configuration.enable_logging | configuration.enableLogging | boolean | ❌ | Enable logging |
| configuration.enable_metrics | configuration.enableMetrics | boolean | ❌ | Enable metrics |
| configuration.custom_settings | configuration.customSettings | object | ❌ | Custom settings |

### **Multi-modal Support**

| Schema Field (snake_case) | TypeScript Field (camelCase) | Type | Required | Description |
|---------------------------|------------------------------|------|----------|-------------|
| multimodal_support | multimodalSupport | string[] | ❌ | Supported modalities |
| input_modes | inputModes | string[] | ❌ | Input modes |
| output_modes | outputModes | string[] | ❌ | Output modes |
| processing_options | processingOptions | object | ❌ | Processing options |

### **Metadata and Audit**

| Schema Field (snake_case) | TypeScript Field (camelCase) | Type | Required | Description |
|---------------------------|------------------------------|------|----------|-------------|
| metadata | metadata | object | ❌ | Dialog metadata |
| metadata.tags | metadata.tags | string[] | ❌ | Dialog tags |
| metadata.category | metadata.category | string | ❌ | Dialog category |
| metadata.priority | metadata.priority | number | ❌ | Dialog priority |
| metadata.owner | metadata.owner | string | ❌ | Dialog owner |
| audit_trail | auditTrail | object[] | ❌ | Audit trail |
| performance_metrics | performanceMetrics | object | ❌ | Performance metrics |

## 🔄 **Mapping Functions**

### **TypeScript Mapper Implementation**

```typescript
export class DialogMapper {
  /**
   * Converts DialogEntity to DialogSchema (camelCase → snake_case)
   */
  static toSchema(entity: DialogEntity): DialogSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      dialog_id: entity.dialogId,
      name: entity.name,
      description: entity.description,
      participants: entity.participants,
      status: entity.status,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
      
      capabilities: {
        basic: entity.capabilities.basic,
        intelligent_control: entity.capabilities.intelligentControl,
        critical_thinking: entity.capabilities.criticalThinking,
        knowledge_search: entity.capabilities.knowledgeSearch,
        multimodal: entity.capabilities.multimodal,
        context_awareness: entity.capabilities.contextAwareness,
        emotional_intelligence: entity.capabilities.emotionalIntelligence,
        creative_problem_solving: entity.capabilities.creativeProblemSolving,
        ethical_reasoning: entity.capabilities.ethicalReasoning,
        adaptive_learning: entity.capabilities.adaptiveLearning
      },
      
      strategy: entity.strategy ? {
        type: entity.strategy.type,
        rounds: entity.strategy.rounds,
        exit_criteria: entity.strategy.exitCriteria,
        adaptation_rules: entity.strategy.adaptationRules
      } : undefined,
      
      context: entity.context ? {
        session_id: entity.context.sessionId,
        context_id: entity.context.contextId,
        knowledge_base: entity.context.knowledgeBase,
        previous_dialogs: entity.context.previousDialogs,
        memory_settings: entity.context.memorySettings
      } : undefined,
      
      configuration: entity.configuration ? {
        max_turns: entity.configuration.maxTurns,
        timeout: entity.configuration.timeout,
        enable_logging: entity.configuration.enableLogging,
        enable_metrics: entity.configuration.enableMetrics,
        custom_settings: entity.configuration.customSettings
      } : undefined,
      
      multimodal_support: entity.multimodalSupport,
      input_modes: entity.inputModes,
      output_modes: entity.outputModes,
      processing_options: entity.processingOptions,
      
      metadata: entity.metadata ? {
        tags: entity.metadata.tags,
        category: entity.metadata.category,
        priority: entity.metadata.priority,
        owner: entity.metadata.owner
      } : undefined,
      
      audit_trail: entity.auditTrail,
      performance_metrics: entity.performanceMetrics
    };
  }

  /**
   * Converts DialogSchema to DialogEntity (snake_case → camelCase)
   */
  static fromSchema(schema: DialogSchema): DialogEntity {
    return new DialogEntity(
      schema.dialog_id,
      schema.name,
      schema.description,
      schema.participants,
      schema.status,
      new Date(schema.created_at),
      new Date(schema.updated_at),
      {
        protocolVersion: schema.protocol_version,
        timestamp: schema.timestamp,
        
        capabilities: {
          basic: schema.capabilities.basic,
          intelligentControl: schema.capabilities.intelligent_control,
          criticalThinking: schema.capabilities.critical_thinking,
          knowledgeSearch: schema.capabilities.knowledge_search,
          multimodal: schema.capabilities.multimodal,
          contextAwareness: schema.capabilities.context_awareness,
          emotionalIntelligence: schema.capabilities.emotional_intelligence,
          creativeProblemSolving: schema.capabilities.creative_problem_solving,
          ethicalReasoning: schema.capabilities.ethical_reasoning,
          adaptiveLearning: schema.capabilities.adaptive_learning
        },
        
        strategy: schema.strategy ? {
          type: schema.strategy.type,
          rounds: schema.strategy.rounds,
          exitCriteria: schema.strategy.exit_criteria,
          adaptationRules: schema.strategy.adaptation_rules
        } : undefined,
        
        context: schema.context ? {
          sessionId: schema.context.session_id,
          contextId: schema.context.context_id,
          knowledgeBase: schema.context.knowledge_base,
          previousDialogs: schema.context.previous_dialogs,
          memorySettings: schema.context.memory_settings
        } : undefined,
        
        configuration: schema.configuration ? {
          maxTurns: schema.configuration.max_turns,
          timeout: schema.configuration.timeout,
          enableLogging: schema.configuration.enable_logging,
          enableMetrics: schema.configuration.enable_metrics,
          customSettings: schema.configuration.custom_settings
        } : undefined,
        
        multimodalSupport: schema.multimodal_support,
        inputModes: schema.input_modes,
        outputModes: schema.output_modes,
        processingOptions: schema.processing_options,
        
        metadata: schema.metadata ? {
          tags: schema.metadata.tags,
          category: schema.metadata.category,
          priority: schema.metadata.priority,
          owner: schema.metadata.owner
        } : undefined,
        
        auditTrail: schema.audit_trail,
        performanceMetrics: schema.performance_metrics
      }
    );
  }

  /**
   * Validates schema against JSON Schema definition
   */
  static validateSchema(schema: unknown): DialogSchema {
    // JSON Schema validation implementation
    const validator = new JSONSchemaValidator();
    const result = validator.validate(schema, dialogJsonSchema);
    
    if (!result.valid) {
      throw new ValidationError('Invalid dialog schema', result.errors);
    }
    
    return schema as DialogSchema;
  }
}
```

## 📊 **Validation Rules**

### **Required Field Validation**
- `protocol_version`: Must be valid MPLP version string
- `timestamp`: Must be valid ISO 8601 timestamp
- `dialog_id`: Must be valid UUID format
- `name`: Must be non-empty string
- `participants`: Must be non-empty array of participant IDs
- `status`: Must be valid dialog status enum value
- `created_at`: Must be valid ISO 8601 timestamp
- `updated_at`: Must be valid ISO 8601 timestamp

### **Optional Field Validation**
- All capability objects must follow capability schema
- Strategy configuration must match strategy type requirements
- Context fields must be valid when provided
- Metadata fields must follow metadata schema

### **Business Rule Validation**
- Dialog must have at least one participant
- Basic capability must always be enabled
- Strategy type must be supported
- Timeout must be positive number if specified
- Max turns must be positive number if specified

## 🔧 **Usage Examples**

### **Entity to Schema Conversion**
```typescript
const entity = new DialogEntity(/* ... */);
const schema = DialogMapper.toSchema(entity);
console.log(schema.dialog_id); // UUID
console.log(schema.created_at); // ISO string
```

### **Schema to Entity Conversion**
```typescript
const schema: DialogSchema = {
  dialog_id: 'uuid-here',
  name: 'My Dialog',
  // ... other fields
};
const entity = DialogMapper.fromSchema(schema);
console.log(entity.dialogId); // UUID
console.log(entity.createdAt); // Date object
```

### **Schema Validation**
```typescript
try {
  const validSchema = DialogMapper.validateSchema(inputData);
  // Process valid schema
} catch (error) {
  console.error('Schema validation failed:', error.message);
}
```

---

**Mapping Version**: 1.0.0  
**Module Version**: 1.0.0  
**Last Updated**: 2025-01-27  
**Status**: Production Ready  
**Compliance**: 100% MPLP dual naming convention
