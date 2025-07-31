# Confirm Module

## 📋 Overview

The Confirm Module manages approval workflows, decision-making processes, and confirmation mechanisms within the MPLP ecosystem. It provides comprehensive approval capabilities with DDD architecture for complex multi-agent decision workflows.

## 🏗️ Architecture

### DDD Layer Structure

```
src/modules/confirm/
├── api/                    # API Layer
│   ├── controllers/        # REST controllers
│   │   └── confirm.controller.ts
│   └── dto/               # Data transfer objects
├── application/           # Application Layer
│   ├── services/          # Application services
│   │   └── confirm-management.service.ts
│   ├── commands/          # Command handlers
│   │   └── create-confirmation.command.ts
│   └── queries/           # Query handlers
│       └── get-confirmation-by-id.query.ts
├── domain/                # Domain Layer
│   ├── entities/          # Domain entities
│   │   ├── confirmation.entity.ts
│   │   └── approval.entity.ts
│   ├── repositories/      # Repository interfaces
│   │   └── confirm-repository.interface.ts
│   └── services/          # Domain services
│       └── approval-workflow.service.ts
├── infrastructure/        # Infrastructure Layer
│   └── repositories/      # Repository implementations
│       └── confirm.repository.ts
├── module.ts             # Module integration
├── index.ts              # Public exports
└── types.ts              # Type definitions
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { initializeConfirmModule } from 'mplp';

// Initialize the module
const confirmModule = await initializeConfirmModule();

// Create a confirmation request
const result = await confirmModule.confirmManagementService.createConfirmation({
  context_id: 'ctx-123',
  plan_id: 'plan-456',
  type: 'plan_approval',
  title: 'Project Plan Approval',
  description: 'Please review and approve the project plan',
  required_approvers: ['user-1', 'user-2'],
  approval_threshold: 2,
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
});

if (result.success) {
  console.log('Confirmation created:', result.data.confirmation_id);
}
```

## 📖 API Reference

### Confirm Management Service

#### createConfirmation()

Creates a new confirmation request.

```typescript
async createConfirmation(request: CreateConfirmationRequest): Promise<OperationResult<Confirmation>>
```

**Parameters:**
```typescript
interface CreateConfirmationRequest {
  context_id: UUID;
  plan_id?: UUID;
  type: ConfirmationType;
  title: string;
  description?: string;
  required_approvers: string[];
  approval_threshold: number;
  deadline?: Date;
  metadata?: Record<string, any>;
}

type ConfirmationType = 
  | 'plan_approval'
  | 'task_approval'
  | 'resource_approval'
  | 'milestone_approval'
  | 'custom';
```

#### submitApproval()

Submits an approval decision.

```typescript
async submitApproval(
  confirmationId: UUID,
  approverId: string,
  decision: ApprovalDecision,
  comments?: string
): Promise<OperationResult<Approval>>
```

#### getConfirmationById()

Retrieves a confirmation by its ID.

```typescript
async getConfirmationById(confirmationId: UUID): Promise<OperationResult<Confirmation>>
```

#### getConfirmationStatus()

Gets the current status of a confirmation.

```typescript
async getConfirmationStatus(confirmationId: UUID): Promise<OperationResult<ConfirmationStatus>>
```

## 🎯 Domain Model

### Confirmation Entity

The core domain entity representing a confirmation request.

```typescript
class Confirmation {
  // Properties
  confirmation_id: UUID;
  context_id: UUID;
  plan_id?: UUID;
  type: ConfirmationType;
  title: string;
  description?: string;
  status: ConfirmationStatus;
  required_approvers: string[];
  approval_threshold: number;
  approvals: Approval[];
  deadline?: Date;
  metadata: Record<string, any>;
  created_at: Timestamp;
  updated_at: Timestamp;

  // Business Methods
  addApproval(approval: Approval): void;
  checkApprovalThreshold(): boolean;
  isExpired(): boolean;
  canApprove(approverId: string): boolean;
  getApprovalProgress(): ApprovalProgress;
  finalizeDecision(): ConfirmationStatus;
}
```

### Approval Entity

Individual approval within a confirmation.

```typescript
class Approval {
  // Properties
  approval_id: UUID;
  confirmation_id: UUID;
  approver_id: string;
  decision: ApprovalDecision;
  comments?: string;
  submitted_at: Timestamp;

  // Business Methods
  isApproved(): boolean;
  isRejected(): boolean;
  hasComments(): boolean;
}
```

### Status Types

```typescript
type ConfirmationStatus = 
  | 'pending'    // Waiting for approvals
  | 'approved'   // Approved by threshold
  | 'rejected'   // Rejected by approvers
  | 'expired'    // Deadline passed
  | 'cancelled'; // Manually cancelled

type ApprovalDecision = 'approve' | 'reject' | 'abstain';

interface ApprovalProgress {
  total_required: number;
  approvals_received: number;
  rejections_received: number;
  pending_approvers: string[];
  is_threshold_met: boolean;
}
```

## 🔧 Configuration

### Module Options

```typescript
interface ConfirmModuleOptions {
  dataSource?: DataSource;           // Database connection
  enableNotifications?: boolean;     // Enable approval notifications
  enableDeadlines?: boolean;         // Enable deadline enforcement
  enableEscalation?: boolean;        // Enable approval escalation
  defaultDeadlineHours?: number;     // Default deadline in hours
}
```

## 📊 Events

The Confirm Module emits domain events for integration:

```typescript
interface ConfirmationCreatedEvent {
  event_type: 'confirmation_created';
  confirmation_id: UUID;
  context_id: UUID;
  type: ConfirmationType;
  required_approvers: string[];
  deadline?: Date;
  created_by: string;
  timestamp: Timestamp;
}

interface ApprovalSubmittedEvent {
  event_type: 'approval_submitted';
  approval_id: UUID;
  confirmation_id: UUID;
  approver_id: string;
  decision: ApprovalDecision;
  timestamp: Timestamp;
}

interface ConfirmationCompletedEvent {
  event_type: 'confirmation_completed';
  confirmation_id: UUID;
  final_status: ConfirmationStatus;
  total_approvals: number;
  total_rejections: number;
  completion_time: number;
  timestamp: Timestamp;
}
```

## 🧪 Testing

### Unit Tests

```typescript
import { Confirmation } from '../domain/entities/confirmation.entity';
import { Approval } from '../domain/entities/approval.entity';

describe('Confirmation Entity', () => {
  test('should create valid confirmation', () => {
    const confirmation = new Confirmation(
      'conf-123',
      'ctx-123',
      'plan_approval',
      'Test Approval',
      'pending',
      ['user-1', 'user-2'],
      2,
      new Date().toISOString(),
      new Date().toISOString()
    );
    
    expect(confirmation.confirmation_id).toBe('conf-123');
    expect(confirmation.status).toBe('pending');
    expect(confirmation.approval_threshold).toBe(2);
  });

  test('should check approval threshold', () => {
    const confirmation = new Confirmation(/* ... */);
    
    // Add approvals
    confirmation.addApproval(new Approval('app-1', 'conf-123', 'user-1', 'approve'));
    confirmation.addApproval(new Approval('app-2', 'conf-123', 'user-2', 'approve'));
    
    expect(confirmation.checkApprovalThreshold()).toBe(true);
  });
});
```

## 🔗 Integration

### With Other Modules

The Confirm Module integrates with:

- **Context Module**: Confirmations are created within contexts
- **Plan Module**: Plans require confirmation before execution
- **Trace Module**: Approval workflows are monitored and traced
- **Role Module**: Approval permissions are managed by roles
- **Extension Module**: Custom approval workflows can be added

### Workflow Integration

```typescript
// Plan approval workflow
const planResult = await planService.createPlan(planRequest);
if (planResult.success) {
  const confirmResult = await confirmService.createConfirmation({
    context_id: planResult.data.context_id,
    plan_id: planResult.data.plan_id,
    type: 'plan_approval',
    title: 'Plan Approval Required',
    required_approvers: ['manager-1', 'architect-1'],
    approval_threshold: 2
  });
}
```

## 🔔 Notification Integration

### Email Notifications

```typescript
// Configure email notifications
const confirmModule = await initializeConfirmModule({
  enableNotifications: true,
  notificationConfig: {
    email: {
      provider: 'smtp',
      templates: {
        approval_request: 'approval-request-template',
        approval_reminder: 'approval-reminder-template',
        approval_completed: 'approval-completed-template'
      }
    }
  }
});
```

### Webhook Notifications

```typescript
// Configure webhook notifications
const webhookConfig = {
  endpoints: [
    {
      url: 'https://your-app.com/webhooks/approval',
      events: ['confirmation_created', 'approval_submitted', 'confirmation_completed'],
      secret: 'webhook_secret'
    }
  ]
};
```

---

The Confirm Module provides sophisticated approval workflow capabilities with flexible approval thresholds, deadline management, and comprehensive notification support for complex multi-agent decision-making processes.
