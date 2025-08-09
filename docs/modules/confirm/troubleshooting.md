# Confirm Module Troubleshooting

**Version**: v1.0.0
**Last Updated**: 2025-08-09
**Module**: Confirm (Confirmation and Approval Workflow Protocol)

---

## 📋 **Overview**

This document provides troubleshooting guidance for common issues encountered when using the Confirm Module. All solutions are based on actual implementation and testing experience.

## 🚨 **Common Issues**

### 1. Validation Errors

#### Issue: "第1个审批步骤名称不能为空"
```typescript
// ❌ Incorrect - missing step name
const workflow = {
  steps: [
    {
      stepId: 'step-1',
      name: '', // Empty name causes validation error
      approverRole: 'manager'
    }
  ]
};

// ✅ Correct - provide step name
const workflow = {
  steps: [
    {
      stepId: 'step-1',
      name: '管理层审批', // Proper step name
      approverRole: 'manager'
    }
  ]
};
```

**Solution**: Ensure all approval steps have non-empty names.

#### Issue: "上下文ID不能为空"
```typescript
// ❌ Incorrect
const request = {
  contextId: '', // Empty context ID
  confirmationType: ConfirmationType.PLAN_APPROVAL
};

// ✅ Correct
const request = {
  contextId: 'ctx-123', // Valid context ID
  confirmationType: ConfirmationType.PLAN_APPROVAL
};
```

**Solution**: Always provide a valid, non-empty context ID.

#### Issue: "审批工作流必须包含至少一个步骤"
```typescript
// ❌ Incorrect
const workflow = {
  steps: [] // Empty steps array
};

// ✅ Correct
const workflow = {
  steps: [
    {
      stepId: 'step-1',
      name: '初级审批',
      approverRole: 'supervisor'
    }
  ]
};
```

**Solution**: Ensure approval workflow contains at least one step.

### 2. Type Errors

#### Issue: Interface Mismatch
```typescript
// ❌ Incorrect - using wrong field names
const step = {
  stepName: '审批步骤', // Should be 'name'
  approver: { // Should be 'approvers' array
    userId: 'user-123'
  }
};

// ✅ Correct - using proper interface
const step: ApprovalStep = {
  stepId: 'step-1',
  name: '审批步骤', // Correct field name
  approvers: [{ // Correct field name and structure
    approverId: 'user-123',
    name: 'John Doe',
    role: 'manager',
    email: 'john@company.com',
    priority: 1,
    isActive: true
  }],
  approverRole: 'manager'
};
```

**Solution**: Use the correct interface field names as defined in the TypeScript types.

#### Issue: Enum Value Errors
```typescript
// ❌ Incorrect - invalid enum value
const request = {
  confirmationType: 'invalid_type', // Not a valid ConfirmationType
  priority: 'super_high' // Not a valid Priority
};

// ✅ Correct - using proper enum values
const request = {
  confirmationType: ConfirmationType.PLAN_APPROVAL,
  priority: Priority.HIGH
};
```

**Solution**: Use the predefined enum values from the module exports.

### 3. Service Integration Issues

#### Issue: Service Not Found
```typescript
// ❌ Incorrect - service not properly initialized
const result = await confirmService.createConfirm(request);
// Error: confirmService is undefined

// ✅ Correct - proper service initialization
import { ConfirmManagementService } from '@mplp/confirm';

const confirmService = new ConfirmManagementService(
  repository,
  validationService
);
const result = await confirmService.createConfirm(request);
```

**Solution**: Ensure services are properly imported and initialized with required dependencies.

#### Issue: Repository Connection Errors
```typescript
// Check repository connection
try {
  const result = await confirmService.createConfirm(request);
} catch (error) {
  if (error.message.includes('connection')) {
    console.error('Database connection issue:', error);
    // Implement retry logic or fallback
  }
}
```

**Solution**: Implement proper error handling and retry mechanisms for database operations.

### 4. Workflow Configuration Issues

#### Issue: Invalid Step Order
```typescript
// ❌ Incorrect - duplicate step orders
const workflow = {
  steps: [
    { stepId: 'step-1', stepOrder: 1, name: 'Step 1' },
    { stepId: 'step-2', stepOrder: 1, name: 'Step 2' } // Duplicate order
  ]
};

// ✅ Correct - unique step orders
const workflow = {
  steps: [
    { stepId: 'step-1', stepOrder: 1, name: 'Step 1' },
    { stepId: 'step-2', stepOrder: 2, name: 'Step 2' }
  ]
};
```

**Solution**: Ensure each step has a unique step order value.

#### Issue: Timeout Configuration
```typescript
// ❌ Incorrect - invalid timeout values
const step = {
  timeoutHours: 800 // Exceeds maximum of 720 hours
};

// ✅ Correct - valid timeout values
const step = {
  timeoutHours: 48 // Within valid range (1-720 hours)
};
```

**Solution**: Keep timeout values within the valid range (1-720 hours).

## 🔧 **Debugging Techniques**

### 1. Enable Debug Logging
```typescript
// Enable detailed logging
const confirmService = new ConfirmManagementService(
  repository,
  validationService,
  { debug: true }
);

// Check validation results
const validationResult = validationService.validateCreateRequest(
  contextId,
  confirmationType,
  priority,
  subject,
  requester,
  approvalWorkflow
);

if (!validationResult.isValid) {
  console.log('Validation errors:', validationResult.errors);
  console.log('Validation warnings:', validationResult.warnings);
}
```

### 2. Test Individual Components
```typescript
// Test validation service separately
const validationService = new ConfirmValidationService();
const result = validationService.validateSubject(subject);

if (!result.isValid) {
  console.log('Subject validation failed:', result.errors);
}

// Test repository operations
try {
  await repository.save(confirm);
  console.log('Repository save successful');
} catch (error) {
  console.error('Repository save failed:', error);
}
```

### 3. Verify Data Structures
```typescript
// Verify request structure
console.log('Request structure:', JSON.stringify(request, null, 2));

// Verify workflow structure
console.log('Workflow structure:', JSON.stringify(workflow, null, 2));

// Check for missing required fields
const requiredFields = ['contextId', 'confirmationType', 'priority', 'subject', 'requester', 'approvalWorkflow'];
for (const field of requiredFields) {
  if (!request[field]) {
    console.error(`Missing required field: ${field}`);
  }
}
```

## 🔍 **Performance Issues**

### 1. Slow Query Performance
```typescript
// Add query optimization
const queryOptions = {
  limit: 50, // Limit result set size
  offset: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc' as const
};

const result = await confirmService.queryConfirms({
  contextId: 'ctx-123',
  status: ConfirmStatus.PENDING,
  ...queryOptions
});
```

**Solution**: Use pagination and appropriate filtering to limit query result sizes.

### 2. Memory Usage Issues
```typescript
// Implement proper cleanup
class ConfirmServiceWrapper {
  private confirmService: ConfirmManagementService;
  
  async processConfirmations(requests: CreateConfirmRequest[]) {
    const results = [];
    
    // Process in batches to manage memory
    const batchSize = 10;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(req => this.confirmService.createConfirm(req))
      );
      results.push(...batchResults);
      
      // Allow garbage collection
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }
}
```

**Solution**: Process large datasets in batches and implement proper memory management.

## 🚨 **Error Codes Reference**

### Validation Errors
- **VALIDATION_ERROR**: Input validation failed
- **REQUIRED_FIELD_MISSING**: Required field not provided
- **INVALID_FIELD_VALUE**: Field value doesn't meet requirements
- **INVALID_WORKFLOW_STRUCTURE**: Approval workflow structure invalid

### Service Errors
- **SERVICE_UNAVAILABLE**: Service temporarily unavailable
- **DEPENDENCY_ERROR**: Required dependency not available
- **CONFIGURATION_ERROR**: Service configuration invalid

### Data Errors
- **CONFIRM_NOT_FOUND**: Confirmation not found
- **CONTEXT_NOT_FOUND**: Context not found
- **DUPLICATE_CONFIRM**: Duplicate confirmation detected
- **DATA_INTEGRITY_ERROR**: Data integrity constraint violation

### Permission Errors
- **PERMISSION_DENIED**: User lacks required permissions
- **ROLE_NOT_AUTHORIZED**: User role not authorized for operation
- **ACCESS_DENIED**: Access denied for resource

## 🔄 **Recovery Procedures**

### 1. Service Recovery
```typescript
// Implement service recovery
class ResilientConfirmService {
  private maxRetries = 3;
  private retryDelay = 1000;
  
  async createConfirmWithRetry(request: CreateConfirmRequest) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.confirmService.createConfirm(request);
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        console.log(`Attempt ${attempt} failed, retrying in ${this.retryDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        this.retryDelay *= 2; // Exponential backoff
      }
    }
  }
}
```

### 2. Data Recovery
```typescript
// Implement data validation and recovery
async function validateAndRecoverConfirm(confirmId: string) {
  try {
    const confirm = await confirmService.getConfirmById(confirmId);
    
    if (!confirm.success) {
      console.error(`Confirm ${confirmId} not found`);
      return false;
    }
    
    // Validate data integrity
    const validation = validationService.validateConfirm(confirm.data);
    
    if (!validation.isValid) {
      console.log(`Confirm ${confirmId} has validation issues:`, validation.errors);
      // Implement recovery logic
    }
    
    return true;
  } catch (error) {
    console.error(`Error validating confirm ${confirmId}:`, error);
    return false;
  }
}
```

## 📞 **Getting Help**

### 1. Check Test Cases
Review the comprehensive test suite for usage examples:
- `tests/modules/confirm/` - Domain service tests
- `tests/functional/confirm-functional.test.ts` - Functional scenario tests

### 2. Enable Verbose Logging
```typescript
// Enable detailed logging for debugging
process.env.LOG_LEVEL = 'debug';
process.env.CONFIRM_DEBUG = 'true';
```

### 3. Validate Configuration
```typescript
// Validate module configuration
const config = {
  database: { /* database config */ },
  notifications: { enabled: true },
  timeouts: { defaultTimeoutHours: 24 }
};

// Verify configuration is valid
console.log('Configuration:', JSON.stringify(config, null, 2));
```

---

For additional support, refer to the [API Reference](api-reference.md), [Examples](examples.md), and [Testing](testing.md) documentation.
