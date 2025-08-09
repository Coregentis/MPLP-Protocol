# Confirm Module API Reference

**Version**: v1.0.0
**Last Updated**: 2025-08-09
**Module**: Confirm (Confirmation and Approval Workflow Protocol)

---

## 📋 **Overview**

This document provides comprehensive API reference for the Confirm Module, including all services, methods, interfaces, and usage examples.

## 🔧 **Core Services**

### ConfirmManagementService

The main application service for managing confirmation workflows.

#### createConfirm()

Creates a new confirmation request with approval workflow.

```typescript
async createConfirm(request: CreateConfirmRequest): Promise<OperationResult<Confirm>>
```

**Parameters:**
```typescript
interface CreateConfirmRequest {
  contextId: UUID;
  planId?: UUID;
  confirmationType: ConfirmationType;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approvalWorkflow: ApprovalWorkflow;
  expiresAt?: Timestamp;
  metadata?: Record<string, any>;
}
```

**Returns:**
```typescript
interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}
```

**Example:**
```typescript
const result = await confirmManagementService.createConfirm({
  contextId: 'ctx-123',
  planId: 'plan-456',
  confirmationType: ConfirmationType.PLAN_APPROVAL,
  priority: Priority.HIGH,
  subject: {
    title: 'Project Plan Approval',
    description: 'Please review and approve the project plan',
    category: 'planning'
  },
  requester: {
    userId: 'user-123',
    name: 'John Doe',
    role: 'project_manager',
    email: 'john@company.com',
    requestReason: 'Project milestone approval required'
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
      }
    ]
  }
});
```

#### updateConfirmStatus()

Updates the status of an existing confirmation.

```typescript
async updateConfirmStatus(
  confirmId: UUID,
  newStatus: ConfirmStatus,
  updatedBy: string,
  reason?: string
): Promise<OperationResult<Confirm>>
```

#### getConfirmById()

Retrieves a confirmation by its ID.

```typescript
async getConfirmById(confirmId: UUID): Promise<OperationResult<Confirm>>
```

#### queryConfirms()

Queries confirmations with filtering and pagination.

```typescript
async queryConfirms(query: ConfirmQuery): Promise<OperationResult<Confirm[]>>
```

**Parameters:**
```typescript
interface ConfirmQuery {
  contextId?: UUID;
  status?: ConfirmStatus;
  confirmationType?: ConfirmationType;
  priority?: Priority;
  requesterId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## 🏗️ **Domain Services**

### ConfirmValidationService

Validates confirmation requests and business rules.

#### validateCreateRequest()

```typescript
validateCreateRequest(
  contextId: UUID,
  confirmationType: ConfirmationType,
  priority: Priority,
  subject: ConfirmSubject,
  requester: Requester,
  approvalWorkflow: ApprovalWorkflow
): ValidationResult
```

### TimeoutService

Manages timeout detection and handling.

#### checkTimeouts()

```typescript
async checkTimeouts(): Promise<TimeoutCheckResult[]>
```

#### handleTimeout()

```typescript
async handleTimeout(confirmId: UUID, timeoutReason: string): Promise<void>
```

### AutomationService

Handles automated decision-making.

#### evaluateAutoApproval()

```typescript
async evaluateAutoApproval(confirm: Confirm): Promise<AutoApprovalResult>
```

### NotificationService

Manages multi-channel notifications.

#### sendNotification()

```typescript
async sendNotification(notification: NotificationRequest): Promise<NotificationResult>
```

### EscalationEngineService

Processes escalation rules and workflows.

#### processEscalation()

```typescript
async processEscalation(confirmId: UUID, escalationRules: EscalationRule[]): Promise<EscalationResult>
```

### EventPushService

Manages real-time event broadcasting.

#### broadcastEvent()

```typescript
async broadcastEvent(event: ConfirmEvent): Promise<void>
```

## 📊 **Data Types**

### Core Enums

```typescript
enum ConfirmationType {
  PLAN_APPROVAL = 'plan_approval',
  TASK_APPROVAL = 'task_approval',
  RESOURCE_APPROVAL = 'resource_approval',
  MILESTONE_APPROVAL = 'milestone_approval',
  RISK_ACCEPTANCE = 'risk_acceptance',
  CHANGE_REQUEST = 'change_request',
  CUSTOM = 'custom'
}

enum ConfirmStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
  EXPIRED = 'expired'
}
```

### Core Interfaces

```typescript
interface ConfirmSubject {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  attachments?: Attachment[];
  impactAssessment?: ImpactAssessment;
}

interface Requester {
  userId: string;
  name?: string;
  role?: string;
  email?: string;
  department?: string;
  requestReason: string;
}

interface ApprovalWorkflow {
  workflowId?: string;
  name?: string;
  workflowType?: 'sequential' | 'parallel' | 'consensus';
  steps: ApprovalStep[];
  requireAllApprovers?: boolean;
  allowDelegation?: boolean;
  timeoutConfig?: TimeoutConfig;
  escalationRules?: EscalationRule[];
  autoApprovalRules?: AutoApprovalRule[];
  parallelExecution?: boolean;
}

interface ApprovalStep {
  stepId: string;
  name: string;
  stepOrder?: number;
  level?: ApprovalLevel;
  approvers?: Approver[];
  approverRole?: string;
  requiredApprovals?: number;
  timeoutMinutes?: number;
  timeoutHours?: number;
  isRequired?: boolean;
  status?: StepStatus;
  escalationRule?: EscalationRule;
}
```

## 🔄 **Event Types**

```typescript
interface ConfirmCreatedEvent {
  eventType: 'confirm_created';
  confirmId: UUID;
  contextId: UUID;
  confirmationType: ConfirmationType;
  priority: Priority;
  requesterId: string;
  timestamp: Timestamp;
}

interface ConfirmStatusChangedEvent {
  eventType: 'confirm_status_changed';
  confirmId: UUID;
  oldStatus: ConfirmStatus;
  newStatus: ConfirmStatus;
  changedBy: string;
  reason?: string;
  timestamp: Timestamp;
}

interface ApprovalStepCompletedEvent {
  eventType: 'approval_step_completed';
  confirmId: UUID;
  stepId: string;
  stepStatus: StepStatus;
  approverId?: string;
  timestamp: Timestamp;
}
```

## 🚨 **Error Handling**

### Error Types

```typescript
enum ConfirmErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  CONFIRM_NOT_FOUND = 'CONFIRM_NOT_FOUND',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  ESCALATION_ERROR = 'ESCALATION_ERROR',
  NOTIFICATION_ERROR = 'NOTIFICATION_ERROR'
}

interface ConfirmError {
  code: ConfirmErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Timestamp;
}
```

### Error Examples

```typescript
// Validation error
{
  code: 'VALIDATION_ERROR',
  message: '第1个审批步骤名称不能为空',
  details: { field: 'approvalWorkflow.steps[0].name' },
  timestamp: '2025-08-09T10:00:00Z'
}

// Permission denied
{
  code: 'PERMISSION_DENIED',
  message: 'User does not have permission to create confirmations',
  details: { userId: 'user-123', requiredRole: 'approver' },
  timestamp: '2025-08-09T10:00:00Z'
}
```

---

For more detailed examples and advanced usage patterns, see the [Examples](examples.md) documentation.
