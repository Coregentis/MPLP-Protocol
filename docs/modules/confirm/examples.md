# Confirm Module Examples

**Version**: v1.0.0
**Last Updated**: 2025-08-09
**Module**: Confirm (Confirmation and Approval Workflow Protocol)

---

## 📋 **Overview**

This document provides practical examples of using the Confirm Module for various approval workflow scenarios. All examples are based on the actual implementation and tested interfaces.

## 🚀 **Quick Start Examples**

### Basic Confirmation Creation

```typescript
import { ConfirmManagementService, ConfirmationType, Priority } from '@mplp/confirm';

// Initialize the service
const confirmService = new ConfirmManagementService(repository, validationService);

// Create a basic confirmation request
const result = await confirmService.createConfirm({
  contextId: 'ctx-123',
  planId: 'plan-456',
  confirmationType: ConfirmationType.PLAN_APPROVAL,
  priority: Priority.HIGH,
  subject: {
    title: 'Project Plan Approval',
    description: 'Please review and approve the Q4 project plan',
    category: 'planning'
  },
  requester: {
    userId: 'user-123',
    name: 'John Doe',
    role: 'project_manager',
    email: 'john.doe@company.com',
    requestReason: 'Quarterly planning approval required'
  },
  approvalWorkflow: {
    workflowType: 'sequential',
    steps: [
      {
        stepId: 'step-1',
        name: 'Technical Review',
        stepOrder: 1,
        approverRole: 'tech_lead',
        isRequired: true,
        timeoutHours: 24
      },
      {
        stepId: 'step-2',
        name: 'Management Approval',
        stepOrder: 2,
        approverRole: 'manager',
        isRequired: true,
        timeoutHours: 48
      }
    ]
  }
});

if (result.success) {
  console.log('Confirmation created:', result.data?.confirmId);
} else {
  console.error('Creation failed:', result.error);
}
```

### Status Update Example

```typescript
// Update confirmation status
const updateResult = await confirmService.updateConfirmStatus(
  'confirm-123',
  ConfirmStatus.APPROVED,
  'user-456',
  'All requirements met'
);

if (updateResult.success) {
  console.log('Status updated successfully');
}
```

## 🏗️ **Workflow Examples**

### Sequential Approval Workflow

```typescript
const sequentialWorkflow = {
  workflowType: 'sequential' as const,
  steps: [
    {
      stepId: 'technical-review',
      name: 'Technical Review',
      stepOrder: 1,
      approverRole: 'tech_lead',
      isRequired: true,
      timeoutHours: 24,
      escalationRule: {
        enabled: true,
        escalationTimeoutHours: 48,
        escalationTarget: 'senior_tech_lead'
      }
    },
    {
      stepId: 'security-review',
      name: 'Security Review',
      stepOrder: 2,
      approverRole: 'security_officer',
      isRequired: true,
      timeoutHours: 48
    },
    {
      stepId: 'management-approval',
      name: 'Management Approval',
      stepOrder: 3,
      approverRole: 'manager',
      isRequired: true,
      timeoutHours: 72
    }
  ],
  autoApprovalRules: [{
    enabled: false,
    conditions: []
  }]
};
```

### Parallel Approval Workflow

```typescript
const parallelWorkflow = {
  workflowType: 'parallel' as const,
  steps: [
    {
      stepId: 'tech-review',
      name: 'Technical Review',
      stepOrder: 1,
      approverRole: 'tech_lead',
      isRequired: true,
      timeoutHours: 48
    },
    {
      stepId: 'business-review',
      name: 'Business Review',
      stepOrder: 1, // Same order for parallel execution
      approverRole: 'business_analyst',
      isRequired: true,
      timeoutHours: 48
    },
    {
      stepId: 'legal-review',
      name: 'Legal Review',
      stepOrder: 1, // Same order for parallel execution
      approverRole: 'legal_counsel',
      isRequired: true,
      timeoutHours: 72
    }
  ],
  requireAllApprovers: true,
  parallelExecution: true
};
```

## 🎯 **Domain Service Examples**

### Using ConfirmValidationService

```typescript
import { ConfirmValidationService } from '@mplp/confirm';

const validationService = new ConfirmValidationService();

// Validate a confirmation request
const validationResult = validationService.validateCreateRequest(
  'ctx-123',
  ConfirmationType.PLAN_APPROVAL,
  Priority.HIGH,
  {
    title: 'Project Plan Approval',
    description: 'Q4 project plan review'
  },
  {
    userId: 'user-123',
    role: 'project_manager',
    requestReason: 'Quarterly planning'
  },
  sequentialWorkflow
);

if (!validationResult.isValid) {
  console.log('Validation errors:', validationResult.errors);
  console.log('Validation warnings:', validationResult.warnings);
}
```

### Using TimeoutService

```typescript
import { TimeoutService } from '@mplp/confirm';

const timeoutService = new TimeoutService(repository);

// Check for timeouts
const timeoutResults = await timeoutService.checkTimeouts();

for (const timeout of timeoutResults) {
  console.log(`Timeout detected for confirmation: ${timeout.confirmId}`);
  
  // Handle the timeout
  await timeoutService.handleTimeout(timeout.confirmId, 'Approval deadline exceeded');
}
```

### Using NotificationService

```typescript
import { NotificationService } from '@mplp/confirm';

const notificationService = new NotificationService();

// Send approval request notification
const notificationResult = await notificationService.sendNotification({
  type: 'approval_request',
  confirmId: 'confirm-123',
  recipients: ['approver@company.com'],
  channel: 'email',
  template: 'approval-request-template',
  data: {
    confirmationTitle: 'Project Plan Approval',
    requesterName: 'John Doe',
    deadline: '2025-08-10T10:00:00Z'
  }
});

if (notificationResult.success) {
  console.log('Notification sent successfully');
}
```

## 🔄 **Factory Pattern Examples**

### Using ConfirmFactory

```typescript
import { ConfirmFactory } from '@mplp/confirm';

// Create a plan approval confirmation
const planApproval = ConfirmFactory.createPlanApproval(
  'ctx-123',
  {
    title: 'Q4 Marketing Plan Approval',
    description: 'Review and approve the Q4 marketing strategy'
  },
  {
    userId: 'marketing-manager-001',
    name: 'Sarah Johnson',
    role: 'marketing_manager',
    requestReason: 'Quarterly planning cycle'
  },
  'plan-789'
);

// Create a risk acceptance confirmation
const riskAcceptance = ConfirmFactory.createRiskAcceptance(
  'ctx-456',
  {
    title: 'Security Risk Acceptance',
    description: 'Accept identified security risks for legacy system'
  },
  {
    userId: 'security-officer-001',
    name: 'Mike Chen',
    role: 'security_officer',
    requestReason: 'Legacy system maintenance'
  }
);
```

## 📊 **Query Examples**

### Basic Queries

```typescript
// Get confirmation by ID
const confirmation = await confirmService.getConfirmById('confirm-123');

if (confirmation.success) {
  console.log('Confirmation found:', confirmation.data);
}

// Query confirmations with filters
const queryResult = await confirmService.queryConfirms({
  contextId: 'ctx-123',
  status: ConfirmStatus.PENDING,
  confirmationType: ConfirmationType.PLAN_APPROVAL,
  limit: 10,
  offset: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

if (queryResult.success) {
  console.log(`Found ${queryResult.data?.length} confirmations`);
}
```

### Advanced Filtering

```typescript
// Query by multiple criteria
const advancedQuery = await confirmService.queryConfirms({
  status: ConfirmStatus.IN_REVIEW,
  priority: Priority.HIGH,
  requesterId: 'user-123',
  limit: 20
});

// Query by date range (if supported)
const recentConfirmations = await confirmService.queryConfirms({
  createdAfter: '2025-08-01T00:00:00Z',
  createdBefore: '2025-08-09T23:59:59Z',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

## 🔔 **Event Handling Examples**

### Event Subscription

```typescript
import { EventPushService } from '@mplp/confirm';

const eventService = new EventPushService();

// Subscribe to confirmation events
eventService.subscribeToEvents('confirm_created', (event) => {
  console.log('New confirmation created:', event.confirmId);
  
  // Send welcome notification
  notificationService.sendNotification({
    type: 'confirmation_created',
    confirmId: event.confirmId,
    recipients: [event.requesterId],
    channel: 'email'
  });
});

// Subscribe to status changes
eventService.subscribeToEvents('confirm_status_changed', (event) => {
  console.log(`Confirmation ${event.confirmId} status changed to ${event.newStatus}`);
  
  // Update external systems
  if (event.newStatus === ConfirmStatus.APPROVED) {
    // Trigger downstream processes
    triggerDownstreamProcess(event.confirmId);
  }
});
```

## 🚨 **Error Handling Examples**

### Comprehensive Error Handling

```typescript
try {
  const result = await confirmService.createConfirm(confirmRequest);
  
  if (!result.success) {
    switch (result.error) {
      case 'VALIDATION_ERROR':
        console.log('Validation failed:', result.metadata?.validationErrors);
        break;
      case 'PERMISSION_DENIED':
        console.log('User lacks permission to create confirmations');
        break;
      case 'CONTEXT_NOT_FOUND':
        console.log('Specified context does not exist');
        break;
      default:
        console.log('Unknown error:', result.error);
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
  
  // Log error for monitoring
  logger.error('Confirmation creation failed', {
    error: error.message,
    stack: error.stack,
    request: confirmRequest
  });
}
```

### Retry Logic Example

```typescript
async function createConfirmationWithRetry(request: CreateConfirmRequest, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await confirmService.createConfirm(request);
      
      if (result.success) {
        return result;
      }
      
      // Don't retry validation errors
      if (result.error === 'VALIDATION_ERROR') {
        return result;
      }
      
      if (attempt === maxRetries) {
        return result;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

## 🔧 **Integration Examples**

### Integration with Context Module

```typescript
import { ContextService } from '@mplp/context';
import { ConfirmManagementService } from '@mplp/confirm';

// Create confirmation within a context
async function createContextualConfirmation(contextId: string) {
  // Verify context exists
  const context = await contextService.getContextById(contextId);
  
  if (!context.success) {
    throw new Error('Context not found');
  }
  
  // Create confirmation
  const confirmation = await confirmService.createConfirm({
    contextId,
    confirmationType: ConfirmationType.MILESTONE_APPROVAL,
    // ... other properties
  });
  
  return confirmation;
}
```

### Integration with Plan Module

```typescript
import { PlanService } from '@mplp/plan';

// Create plan approval workflow
async function createPlanApprovalWorkflow(planId: string) {
  // Get plan details
  const plan = await planService.getPlanById(planId);
  
  if (!plan.success) {
    throw new Error('Plan not found');
  }
  
  // Create approval confirmation
  const approval = await confirmService.createConfirm({
    contextId: plan.data.contextId,
    planId: planId,
    confirmationType: ConfirmationType.PLAN_APPROVAL,
    subject: {
      title: `Approval Required: ${plan.data.title}`,
      description: `Please review and approve the plan: ${plan.data.description}`
    },
    // ... workflow configuration
  });
  
  return approval;
}
```

---

These examples demonstrate the comprehensive capabilities of the Confirm Module and provide practical guidance for implementing approval workflows in real-world scenarios.
