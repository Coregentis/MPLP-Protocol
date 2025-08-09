# Confirm Module Field Mapping

**Version**: v1.0.0
**Last Updated**: 2025-08-09
**Module**: Confirm (Confirmation and Approval Workflow Protocol)

---

## 📋 **Overview**

This document details the field mapping between JSON Schema (snake_case) and TypeScript interfaces (camelCase) for the Confirm Module, following MPLP's Dual Naming Convention standard.

## 🔄 **Dual Naming Convention**

The Confirm Module follows MPLP's strict dual naming convention:
- **Schema Layer**: snake_case (JSON Schema, database, external APIs)
- **TypeScript Layer**: camelCase (application code, interfaces)
- **Mapping Functions**: Bidirectional conversion between conventions

## 📊 **Core Entity Mappings**

### Confirm Entity

#### Schema → TypeScript Mapping
```typescript
// Schema (snake_case)
interface ConfirmSchema {
  confirm_id: string;
  context_id: string;
  plan_id?: string;
  confirmation_type: string;
  priority: string;
  subject: ConfirmSubjectSchema;
  requester: RequesterSchema;
  approval_workflow: ApprovalWorkflowSchema;
  status: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

// TypeScript (camelCase)
interface Confirm {
  confirmId: UUID;
  contextId: UUID;
  planId?: UUID;
  confirmationType: ConfirmationType;
  priority: Priority;
  subject: ConfirmSubject;
  requester: Requester;
  approvalWorkflow: ApprovalWorkflow;
  status: ConfirmStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp;
  metadata?: Record<string, any>;
}
```

#### Mapping Functions
```typescript
class ConfirmMapper {
  static toSchema(confirm: Confirm): ConfirmSchema {
    return {
      confirm_id: confirm.confirmId,
      context_id: confirm.contextId,
      plan_id: confirm.planId,
      confirmation_type: confirm.confirmationType,
      priority: confirm.priority,
      subject: ConfirmSubjectMapper.toSchema(confirm.subject),
      requester: RequesterMapper.toSchema(confirm.requester),
      approval_workflow: ApprovalWorkflowMapper.toSchema(confirm.approvalWorkflow),
      status: confirm.status,
      created_at: confirm.createdAt,
      updated_at: confirm.updatedAt,
      expires_at: confirm.expiresAt,
      metadata: confirm.metadata
    };
  }

  static fromSchema(schema: ConfirmSchema): Confirm {
    return {
      confirmId: schema.confirm_id,
      contextId: schema.context_id,
      planId: schema.plan_id,
      confirmationType: schema.confirmation_type as ConfirmationType,
      priority: schema.priority as Priority,
      subject: ConfirmSubjectMapper.fromSchema(schema.subject),
      requester: RequesterMapper.fromSchema(schema.requester),
      approvalWorkflow: ApprovalWorkflowMapper.fromSchema(schema.approval_workflow),
      status: schema.status as ConfirmStatus,
      createdAt: schema.created_at,
      updatedAt: schema.updated_at,
      expiresAt: schema.expires_at,
      metadata: schema.metadata
    };
  }
}
```

### ConfirmSubject Mapping

```typescript
// Schema (snake_case)
interface ConfirmSubjectSchema {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  attachments?: AttachmentSchema[];
  impact_assessment?: ImpactAssessmentSchema;
}

// TypeScript (camelCase)
interface ConfirmSubject {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  attachments?: Attachment[];
  impactAssessment?: ImpactAssessment;
}

// Mapping Functions
class ConfirmSubjectMapper {
  static toSchema(subject: ConfirmSubject): ConfirmSubjectSchema {
    return {
      title: subject.title,
      description: subject.description,
      category: subject.category,
      tags: subject.tags,
      attachments: subject.attachments?.map(AttachmentMapper.toSchema),
      impact_assessment: subject.impactAssessment ? 
        ImpactAssessmentMapper.toSchema(subject.impactAssessment) : undefined
    };
  }

  static fromSchema(schema: ConfirmSubjectSchema): ConfirmSubject {
    return {
      title: schema.title,
      description: schema.description,
      category: schema.category,
      tags: schema.tags,
      attachments: schema.attachments?.map(AttachmentMapper.fromSchema),
      impactAssessment: schema.impact_assessment ? 
        ImpactAssessmentMapper.fromSchema(schema.impact_assessment) : undefined
    };
  }
}
```

### Requester Mapping

```typescript
// Schema (snake_case)
interface RequesterSchema {
  user_id: string;
  name?: string;
  role?: string;
  email?: string;
  department?: string;
  request_reason: string;
}

// TypeScript (camelCase)
interface Requester {
  userId: string;
  name?: string;
  role?: string;
  email?: string;
  department?: string;
  requestReason: string;
}

// Mapping Functions
class RequesterMapper {
  static toSchema(requester: Requester): RequesterSchema {
    return {
      user_id: requester.userId,
      name: requester.name,
      role: requester.role,
      email: requester.email,
      department: requester.department,
      request_reason: requester.requestReason
    };
  }

  static fromSchema(schema: RequesterSchema): Requester {
    return {
      userId: schema.user_id,
      name: schema.name,
      role: schema.role,
      email: schema.email,
      department: schema.department,
      requestReason: schema.request_reason
    };
  }
}
```

### ApprovalWorkflow Mapping

```typescript
// Schema (snake_case)
interface ApprovalWorkflowSchema {
  workflow_id?: string;
  name?: string;
  workflow_type?: string;
  steps: ApprovalStepSchema[];
  require_all_approvers?: boolean;
  allow_delegation?: boolean;
  timeout_config?: TimeoutConfigSchema;
  escalation_rules?: EscalationRuleSchema[];
  auto_approval_rules?: AutoApprovalRuleSchema[];
  parallel_execution?: boolean;
}

// TypeScript (camelCase)
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

// Mapping Functions
class ApprovalWorkflowMapper {
  static toSchema(workflow: ApprovalWorkflow): ApprovalWorkflowSchema {
    return {
      workflow_id: workflow.workflowId,
      name: workflow.name,
      workflow_type: workflow.workflowType,
      steps: workflow.steps.map(ApprovalStepMapper.toSchema),
      require_all_approvers: workflow.requireAllApprovers,
      allow_delegation: workflow.allowDelegation,
      timeout_config: workflow.timeoutConfig ? 
        TimeoutConfigMapper.toSchema(workflow.timeoutConfig) : undefined,
      escalation_rules: workflow.escalationRules?.map(EscalationRuleMapper.toSchema),
      auto_approval_rules: workflow.autoApprovalRules?.map(AutoApprovalRuleMapper.toSchema),
      parallel_execution: workflow.parallelExecution
    };
  }

  static fromSchema(schema: ApprovalWorkflowSchema): ApprovalWorkflow {
    return {
      workflowId: schema.workflow_id,
      name: schema.name,
      workflowType: schema.workflow_type as 'sequential' | 'parallel' | 'consensus',
      steps: schema.steps.map(ApprovalStepMapper.fromSchema),
      requireAllApprovers: schema.require_all_approvers,
      allowDelegation: schema.allow_delegation,
      timeoutConfig: schema.timeout_config ? 
        TimeoutConfigMapper.fromSchema(schema.timeout_config) : undefined,
      escalationRules: schema.escalation_rules?.map(EscalationRuleMapper.fromSchema),
      autoApprovalRules: schema.auto_approval_rules?.map(AutoApprovalRuleMapper.fromSchema),
      parallelExecution: schema.parallel_execution
    };
  }
}
```

### ApprovalStep Mapping

```typescript
// Schema (snake_case)
interface ApprovalStepSchema {
  step_id: string;
  name: string;
  step_order?: number;
  level?: string;
  approvers?: ApproverSchema[];
  approver_role?: string;
  required_approvals?: number;
  timeout_minutes?: number;
  timeout_hours?: number;
  is_required?: boolean;
  status?: string;
  escalation_rule?: EscalationRuleSchema;
}

// TypeScript (camelCase)
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

// Mapping Functions
class ApprovalStepMapper {
  static toSchema(step: ApprovalStep): ApprovalStepSchema {
    return {
      step_id: step.stepId,
      name: step.name,
      step_order: step.stepOrder,
      level: step.level,
      approvers: step.approvers?.map(ApproverMapper.toSchema),
      approver_role: step.approverRole,
      required_approvals: step.requiredApprovals,
      timeout_minutes: step.timeoutMinutes,
      timeout_hours: step.timeoutHours,
      is_required: step.isRequired,
      status: step.status,
      escalation_rule: step.escalationRule ? 
        EscalationRuleMapper.toSchema(step.escalationRule) : undefined
    };
  }

  static fromSchema(schema: ApprovalStepSchema): ApprovalStep {
    return {
      stepId: schema.step_id,
      name: schema.name,
      stepOrder: schema.step_order,
      level: schema.level as ApprovalLevel,
      approvers: schema.approvers?.map(ApproverMapper.fromSchema),
      approverRole: schema.approver_role,
      requiredApprovals: schema.required_approvals,
      timeoutMinutes: schema.timeout_minutes,
      timeoutHours: schema.timeout_hours,
      isRequired: schema.is_required,
      status: schema.status as StepStatus,
      escalationRule: schema.escalation_rule ? 
        EscalationRuleMapper.fromSchema(schema.escalation_rule) : undefined
    };
  }
}
```

## 🔧 **Request/Response Mappings**

### CreateConfirmRequest Mapping

```typescript
// Schema (snake_case)
interface CreateConfirmRequestSchema {
  context_id: string;
  plan_id?: string;
  confirmation_type: string;
  priority: string;
  subject: ConfirmSubjectSchema;
  requester: RequesterSchema;
  approval_workflow: ApprovalWorkflowSchema;
  expires_at?: string;
  metadata?: Record<string, any>;
}

// TypeScript (camelCase)
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

// Mapping Functions
class CreateConfirmRequestMapper {
  static toSchema(request: CreateConfirmRequest): CreateConfirmRequestSchema {
    return {
      context_id: request.contextId,
      plan_id: request.planId,
      confirmation_type: request.confirmationType,
      priority: request.priority,
      subject: ConfirmSubjectMapper.toSchema(request.subject),
      requester: RequesterMapper.toSchema(request.requester),
      approval_workflow: ApprovalWorkflowMapper.toSchema(request.approvalWorkflow),
      expires_at: request.expiresAt,
      metadata: request.metadata
    };
  }

  static fromSchema(schema: CreateConfirmRequestSchema): CreateConfirmRequest {
    return {
      contextId: schema.context_id,
      planId: schema.plan_id,
      confirmationType: schema.confirmation_type as ConfirmationType,
      priority: schema.priority as Priority,
      subject: ConfirmSubjectMapper.fromSchema(schema.subject),
      requester: RequesterMapper.fromSchema(schema.requester),
      approvalWorkflow: ApprovalWorkflowMapper.fromSchema(schema.approval_workflow),
      expiresAt: schema.expires_at,
      metadata: schema.metadata
    };
  }
}
```

## 🧪 **Mapping Validation**

### Validation Functions

```typescript
class MappingValidator {
  static validateConfirmMapping(original: Confirm, mapped: Confirm): boolean {
    return (
      original.confirmId === mapped.confirmId &&
      original.contextId === mapped.contextId &&
      original.planId === mapped.planId &&
      original.confirmationType === mapped.confirmationType &&
      original.priority === mapped.priority &&
      original.status === mapped.status &&
      original.createdAt === mapped.createdAt &&
      original.updatedAt === mapped.updatedAt &&
      original.expiresAt === mapped.expiresAt &&
      this.validateSubjectMapping(original.subject, mapped.subject) &&
      this.validateRequesterMapping(original.requester, mapped.requester) &&
      this.validateWorkflowMapping(original.approvalWorkflow, mapped.approvalWorkflow)
    );
  }

  static validateRoundTripMapping(original: Confirm): boolean {
    const schema = ConfirmMapper.toSchema(original);
    const restored = ConfirmMapper.fromSchema(schema);
    return this.validateConfirmMapping(original, restored);
  }
}
```

### Test Examples

```typescript
describe('Confirm Field Mapping', () => {
  it('should correctly map Confirm to schema and back', () => {
    const original: Confirm = {
      confirmId: 'confirm-123',
      contextId: 'ctx-456',
      confirmationType: ConfirmationType.PLAN_APPROVAL,
      priority: Priority.HIGH,
      // ... other fields
    };

    const schema = ConfirmMapper.toSchema(original);
    const restored = ConfirmMapper.fromSchema(schema);

    expect(MappingValidator.validateConfirmMapping(original, restored)).toBe(true);
  });

  it('should handle optional fields correctly', () => {
    const minimal: Confirm = {
      confirmId: 'confirm-123',
      contextId: 'ctx-456',
      confirmationType: ConfirmationType.PLAN_APPROVAL,
      priority: Priority.HIGH,
      // ... required fields only
    };

    expect(() => {
      const schema = ConfirmMapper.toSchema(minimal);
      const restored = ConfirmMapper.fromSchema(schema);
    }).not.toThrow();
  });
});
```

## 📊 **Common Field Patterns**

### Standard Patterns
```typescript
// ID fields
'confirm_id' → 'confirmId'
'context_id' → 'contextId'
'plan_id' → 'planId'
'step_id' → 'stepId'
'workflow_id' → 'workflowId'

// Timestamp fields
'created_at' → 'createdAt'
'updated_at' → 'updatedAt'
'expires_at' → 'expiresAt'

// Boolean fields
'is_required' → 'isRequired'
'require_all_approvers' → 'requireAllApprovers'
'allow_delegation' → 'allowDelegation'
'parallel_execution' → 'parallelExecution'

// Compound fields
'confirmation_type' → 'confirmationType'
'approval_workflow' → 'approvalWorkflow'
'escalation_rule' → 'escalationRule'
'timeout_config' → 'timeoutConfig'
```

---

This field mapping documentation ensures consistent data transformation between the schema and TypeScript layers, maintaining data integrity and following MPLP's dual naming convention standards.
