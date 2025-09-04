# MPLP Module Refactoring Step-by-Step Guide v1.0

## 📋 **Refactoring Overview**

**Purpose**: Complete step-by-step guide for refactoring MPLP modules to unified protocol standard
**Methodology**: SCTM+GLFB+ITCM + Schema-Driven Development
**Quality Target**: Zero Technical Debt + Enterprise-Grade Implementation
**Success Pattern**: Based on 6 completed modules (Context, Plan, Confirm, Trace, Role, Extension)
**CRITICAL**: All 10 modules must use IDENTICAL architecture patterns and integration approaches

## 🎯 **Pre-Refactoring Preparation**

### **Step 0: Information Gathering (SCTM Analysis)**
```markdown
MANDATORY STEPS:
□ Read MPLP-Protocol-Specification-v1.0.md for complete architecture understanding
□ Read target module's mplp-{module}.json schema definition
□ Read all 9 cross-cutting concerns schemas in src/schemas/cross-cutting-concerns/
□ Analyze existing module code structure and current implementation
□ Identify module's specific positioning and unique features in MPLP ecosystem
□ Review successful module examples (Context, Plan, Confirm)
□ Understand module's reserved interface requirements
```

### **Step 0.1: Module Positioning Analysis**
```markdown
CRITICAL QUESTIONS TO ANSWER:
□ What is this module's unique role in the MPLP ecosystem?
□ Which other modules does this module coordinate with?
□ What are the module's core business capabilities?
□ What reserved interfaces should this module provide?
□ What cross-cutting concerns are most critical for this module?
□ What is the target quality level (production-ready/enterprise-standard)?
```

## 🔧 **Phase 1: Schema Integration and Mapping**

### **Step 1: Schema Analysis and Field Mapping**
```bash
# 1.1 Generate field mapping table
□ Create docs/modules/{module}-field-mapping.md
□ List all schema fields with snake_case names
□ Map to corresponding camelCase TypeScript names
□ Identify cross-cutting concerns fields
□ Document field types, constraints, and descriptions

# 1.2 Validate schema completeness
□ Verify all required fields are present
□ Check cross-cutting concerns integration
□ Validate field types and constraints
□ Ensure naming convention compliance
```

### **Step 2: 统一Mapper实现（基于6个已完成模块的成功模式）**
```typescript
// 2.1 创建/更新Mapper类（与其他6个模块使用IDENTICAL结构）
// File: src/modules/{module}/api/mappers/{module}.mapper.ts

CRITICAL: 必须与Context/Plan/Confirm/Trace/Role/Extension模块的Mapper保持完全一致

□ 实现{Module}Schema接口（snake_case）
  - 基于实际的src/schemas/mplp-{module}.json
  - 包含所有9个横切关注点字段
  - 与其他模块Schema结构保持一致

□ 实现{Module}EntityData接口（camelCase）
  - 完整的双重命名约定映射
  - 所有字段类型安全转换
  - 与其他模块EntityData结构保持一致

□ 实现{Module}Mapper类（与其他6个模块相同的方法签名）:
  - toSchema(entity: {Module}EntityData): {Module}Schema
  - fromSchema(schema: {Module}Schema): {Module}EntityData
  - validateSchema(data: unknown): data is {Module}Schema
  - toSchemaArray() 和 fromSchemaArray() 批量方法
  - 所有9个横切关注点映射方法（与其他模块完全相同）

# 2.2 统一测试实现（与其他6个模块相同的测试模式）
□ 创建全面的mapper测试（基于已完成模块的测试模式）
□ 测试所有字段映射的准确性（100%覆盖）
□ 测试横切关注点集成（9个关注点100%测试）
□ 验证100%类型安全（零容忍any类型）
□ 确保ESLint合规性（0警告，与其他模块相同标准）
```

### **Step 3: 统一横切关注点集成（与其他6个模块使用IDENTICAL模式）**
```typescript
// 3.1 更新模块构造函数（与其他6个已完成模块完全相同的注入模式）
CRITICAL: 必须与Context/Plan/Confirm/Trace/Role/Extension模块的构造函数保持完全一致

export class {Module}Protocol extends MLPPProtocolBase implements IMLPPProtocol {
  constructor(
    private readonly {module}ManagementService: {Module}ManagementService,
    // 统一的9个L3管理器注入（与其他6个模块完全相同）
    private readonly securityManager: MLPPSecurityManager,
    private readonly performanceMonitor: MLPPPerformanceMonitor,
    private readonly eventBusManager: MLPPEventBusManager,
    private readonly errorHandler: MLPPErrorHandler,
    private readonly coordinationManager: MLPPCoordinationManager,
    private readonly orchestrationManager: MLPPOrchestrationManager,
    private readonly stateSyncManager: MLPPStateSyncManager,
    private readonly transactionManager: MLPPTransactionManager,
    private readonly protocolVersionManager: MLPPProtocolVersionManager
  ) {
    super();
  }
}

// 3.2 统一业务逻辑集成（与其他6个模块使用相同的调用序列）
□ 安全验证：所有操作使用统一的安全验证模式
□ 性能监控：所有操作使用统一的性能监控模式
□ 事件发布：所有状态变更使用统一的事件发布模式
□ 错误处理：使用统一的横切关注点错误管理器
□ 事务管理：数据操作使用统一的事务管理模式
□ 状态同步：分布式操作使用统一的状态同步模式
□ 协调管理：跨模块操作使用统一的协调管理模式
□ 编排管理：工作流操作使用统一的编排管理模式
□ 协议版本管理：兼容性使用统一的协议版本管理模式
```

## 🏗️ **Phase 2: Protocol Interface Implementation**

### **Step 4: Unified Protocol Interface**
```typescript
// 4.1 Implement IMLPPProtocol Interface
// File: src/modules/{module}/protocol/{module}.protocol.ts

export class {Module}Protocol extends MLPPProtocolBase implements IMLPPProtocol {
  constructor(
    private readonly {module}ManagementService: {Module}ManagementService,
    ...crossCuttingManagers: CrossCuttingManagers[]
  ) {
    super(...crossCuttingManagers);
  }

  async executeOperation(request: MLPPRequest): Promise<MLPPResponse> {
    // Implementation with cross-cutting concerns integration
  }

  getProtocolMetadata(): ProtocolMetadata {
    // Module-specific metadata
  }

  async healthCheck(): Promise<HealthStatus> {
    // Health check with cross-cutting concerns
  }
}

// 4.2 Protocol Factory Implementation
□ Create {module}-protocol.factory.ts
□ Implement protocol instantiation logic
□ Configure dependency injection
□ Set up cross-cutting concerns managers
```

### **Step 5: Reserved Interface Pattern Implementation**
```typescript
// 5.1 Implement Reserved Interfaces
// Based on Plan module successful pattern (lines 851-989)

□ Add MPLP coordination reserved interfaces section
□ Implement all cross-module coordination methods
□ Use underscore prefix for parameters (_userId, _planId, etc.)
□ Add TODO comments for CoreOrchestrator activation
□ Provide temporary implementations that return success
□ Integrate cross-cutting concerns in reserved interfaces

// 5.2 Reserved Interface Categories (based on module type)
□ Core coordination interfaces (4 deep integration modules)
□ Extended coordination interfaces (4 additional modules)  
□ Specialized coordination interfaces (module-specific)

// Example reserved interface:
private async validateModuleCoordinationPermission(
  _userId: UUID,
  _moduleId: UUID,
  _coordinationContext: Record<string, unknown>
): Promise<boolean> {
  // TODO: Wait for CoreOrchestrator activation Role module coordination
  // Integration with security cross-cutting concern
  return true; // Temporary implementation
}
```

## 🔄 **Phase 3: Business Logic Integration**

### **Step 6: Service Layer Refactoring**
```typescript
// 6.1 Update Management Service
// File: src/modules/{module}/application/services/{module}-management.service.ts

□ Integrate cross-cutting concerns in all business methods
□ Update method signatures to include cross-cutting data
□ Add comprehensive error handling
□ Implement performance monitoring
□ Add security validation
□ Integrate event publishing
□ Add transaction management
□ Implement state synchronization

// 6.2 Update Domain Entities
□ Add cross-cutting concerns data to entity classes
□ Update toEntityData() methods to include cross-cutting data
□ Ensure entity classes support schema mapping
□ Add validation methods for cross-cutting concerns
```

### **Step 7: Repository Layer Integration**
```typescript
// 7.1 Update Repository Interface and Implementation
□ Add cross-cutting concerns to repository methods
□ Integrate transaction management
□ Add performance monitoring for data operations
□ Implement error handling with cross-cutting error manager
□ Add audit logging through security manager
```

## 📊 **Phase 4: Quality Assurance and Testing**

### **Step 8: Comprehensive Testing**
```bash
# 8.1 Unit Testing
□ Test all mapper methods (100% coverage)
□ Test all business logic methods
□ Test cross-cutting concerns integration
□ Test reserved interface implementations
□ Test error handling scenarios

# 8.2 Integration Testing  
□ Test protocol interface implementation
□ Test cross-cutting concerns coordination
□ Test schema validation and mapping
□ Test performance benchmarks
□ Test security compliance

# 8.3 Quality Gates Validation
npm run typecheck        # Must pass: 0 errors
npm run lint             # Must pass: 0 warnings
npm run test             # Must pass: 100%
npm run validate:mapping # Must pass: 100% consistency
npm run validate:security # Must pass: security compliance
npm run validate:performance # Must pass: performance SLA
```

### **Step 9: Documentation and Finalization**
```markdown
# 9.1 Update Module Documentation
□ Update module README with new protocol interface
□ Document all reserved interfaces and their purposes
□ Update API documentation with cross-cutting concerns
□ Create module-specific implementation examples

# 9.2 Integration Verification
□ Verify module works with existing MPLP ecosystem
□ Test cross-module coordination capabilities
□ Validate reserved interface completeness
□ Confirm quality standards compliance
```

## 🎯 **Success Criteria Checklist**

### **Architecture Compliance**
```markdown
✅ Module implements IMLPPProtocol interface
✅ Module extends MLPPProtocolBase class
✅ All 9 cross-cutting concerns integrated
✅ Reserved interface pattern implemented
✅ Schema-driven development followed
✅ Dual naming convention enforced
✅ L1-L3 architecture compliance
```

### **Quality Standards**
```markdown
✅ TypeScript compilation: 0 errors
✅ ESLint check: 0 warnings
✅ Test coverage: >90%
✅ Mapper consistency: 100%
✅ Security compliance: 100%
✅ Performance SLA: Met
✅ Documentation: Complete
```

### **Functional Requirements**
```markdown
✅ All module-specific business logic preserved
✅ Cross-module coordination capabilities added
✅ Reserved interfaces for future CoreOrchestrator activation
✅ Enterprise-grade error handling and recovery
✅ Comprehensive monitoring and observability
✅ Security validation and audit trails
```

## 🚀 **Post-Refactoring Validation**

### **Step 10: Production Readiness Assessment**
```markdown
PRODUCTION-READY CRITERIA:
□ 100% test pass rate (like Trace module: 107/107)
□ Zero technical debt (mandatory)
□ Complete cross-cutting concerns integration
□ Full reserved interface implementation
□ Comprehensive documentation
□ Performance benchmarks met
□ Security compliance verified

ENTERPRISE-STANDARD CRITERIA:
□ >75% test coverage (like Role module: 75.31%)
□ Zero technical debt (mandatory)
□ Core cross-cutting concerns integrated
□ Basic reserved interface implementation
□ Standard documentation
□ Performance benchmarks met
```

---

**Guide Version**: 1.0.0  
**Success Pattern**: Based on Context, Plan, Confirm modules  
**Quality Standard**: Zero Technical Debt + Enterprise-Grade  
**Methodology**: SCTM+GLFB+ITCM + Schema-Driven Development
