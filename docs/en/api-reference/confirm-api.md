# Confirm API Reference

**Multi-Party Approval and Consensus Mechanisms - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Confirm%20Module-blue.svg)](../modules/confirm/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--confirm.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-265%2F265%20passing-green.svg)](../modules/confirm/testing-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/confirm-api.md)

---

## 🎯 Overview

The Confirm API provides comprehensive approval workflow and consensus management capabilities for multi-agent systems. It enables sophisticated approval processes, risk assessment, compliance tracking, and enterprise-grade workflow management. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  ConfirmController,
  ConfirmManagementService,
  CreateConfirmRequestDTO,
  UpdateConfirmRequestDTO,
  ConfirmResponseDTO
} from 'mplp/modules/confirm';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const confirmModule = mplp.getModule('confirm');
```

## 🏗️ Core Interfaces

### **ConfirmResponseDTO** (Response Interface)

```typescript
interface ConfirmResponseDTO {
  // Basic protocol fields
  protocolVersion: string;        // Protocol version "1.0.0"
  timestamp: string;              // ISO 8601 timestamp
  confirmId: string;              // Unique confirmation identifier
  contextId: string;              // Associated context ID
  planId?: string;                // Associated plan ID (optional)
  confirmationType: ConfirmationType; // Confirmation type
  status: ConfirmationStatus;     // Confirmation status
  priority: Priority;             // Priority level
  
  // Requester information
  requester: {
    userId: string;
    role: string;
    department?: string;
    requestReason: string;
  };
  
  // Approval workflow
  approvalWorkflow: {
    workflowType: WorkflowType;
    steps: ApprovalStep[];
    currentStep: number;
    completionCriteria: CompletionCriteria;
  };
  
  // Subject and risk assessment
  subject: {
    title: string;
    description: string;
    impactAssessment: ImpactAssessment;
    attachments?: Attachment[];
  };
  riskAssessment: RiskAssessment;
  
  // Enterprise features
  auditTrail: AuditTrail;
  complianceTracking: ComplianceTracking;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateConfirmRequestDTO** (Create Request Interface)

```typescript
interface CreateConfirmRequestDTO {
  contextId: string;              // Required: Associated context ID
  planId?: string;                // Optional: Associated plan ID
  confirmationType: ConfirmationType; // Required: Confirmation type
  priority: Priority;             // Required: Priority level
  
  // Requester information
  requester: {
    userId: string;
    role: string;
    department?: string;
    requestReason: string;
  };
  
  // Approval workflow configuration
  approvalWorkflow: {
    workflowType: WorkflowType;
    steps: Partial<ApprovalStep>[];
    completionCriteria?: Partial<CompletionCriteria>;
  };
  
  // Subject details
  subject: {
    title: string;
    description: string;
    impactAssessment: ImpactAssessment;
    attachments?: Attachment[];
  };
  
  // Risk assessment
  riskAssessment: RiskAssessment;
  
  // Metadata
  metadata?: Record<string, any>;
}
```

### **UpdateConfirmRequestDTO** (Update Request Interface)

```typescript
interface UpdateConfirmRequestDTO {
  status?: ConfirmationStatus;    // Optional: Update status
  priority?: Priority;            // Optional: Update priority
  
  // Workflow updates
  approvalWorkflow?: Partial<{
    steps: Partial<ApprovalStep>[];
    completionCriteria: Partial<CompletionCriteria>;
  }>;
  
  // Subject updates
  subject?: Partial<{
    title: string;
    description: string;
    impactAssessment: Partial<ImpactAssessment>;
  }>;
  
  // Risk assessment updates
  riskAssessment?: Partial<RiskAssessment>;
  
  // Metadata updates
  metadata?: Record<string, any>;
}
```

## 🔧 Core Enums

### **ConfirmationType** (Confirmation Type)

```typescript
enum ConfirmationType {
  PLAN_APPROVAL = 'plan_approval',        // Plan approval
  TASK_APPROVAL = 'task_approval',        // Task approval
  MILESTONE_CONFIRMATION = 'milestone_confirmation', // Milestone confirmation
  RISK_ACCEPTANCE = 'risk_acceptance',    // Risk acceptance
  RESOURCE_ALLOCATION = 'resource_allocation', // Resource allocation
  EMERGENCY_APPROVAL = 'emergency_approval'    // Emergency approval
}
```

### **ConfirmationStatus** (Confirmation Status)

```typescript
enum ConfirmationStatus {
  PENDING = 'pending',            // Pending approval
  IN_REVIEW = 'in_review',        // Under review
  APPROVED = 'approved',          // Approved
  REJECTED = 'rejected',          // Rejected
  CANCELLED = 'cancelled',        // Cancelled
  EXPIRED = 'expired'             // Expired
}
```

### **WorkflowType** (Workflow Type)

```typescript
enum WorkflowType {
  SINGLE_APPROVER = 'single_approver',    // Single approver
  SEQUENTIAL = 'sequential',              // Sequential approval
  PARALLEL = 'parallel',                  // Parallel approval
  CONSENSUS = 'consensus',                // Consensus-based
  ESCALATION = 'escalation'               // Escalation workflow
}
```

## 🎮 Controller API

### **ConfirmController**

Main REST API controller providing HTTP endpoint access.

#### **Create Confirmation**
```typescript
async createConfirm(request: CreateConfirmRequestDTO): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP Endpoint**: `POST /api/confirms`

**Request Example**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "confirmationType": "plan_approval",
  "priority": "high",
  "requester": {
    "userId": "user-123",
    "role": "project_manager",
    "department": "engineering",
    "requestReason": "Deploy new feature to production"
  },
  "approvalWorkflow": {
    "workflowType": "sequential",
    "steps": [
      {
        "stepId": "step-1",
        "approver": {
          "userId": "tech-lead-456",
          "role": "technical_lead"
        },
        "requiredActions": ["technical_review"]
      },
      {
        "stepId": "step-2",
        "approver": {
          "userId": "manager-789",
          "role": "engineering_manager"
        },
        "requiredActions": ["business_approval"]
      }
    ]
  },
  "subject": {
    "title": "Production Deployment Approval",
    "description": "Request approval for deploying feature X to production",
    "impactAssessment": {
      "scope": "organization",
      "businessImpact": {
        "revenue": "positive",
        "customerSatisfaction": "positive",
        "operationalEfficiency": "neutral"
      },
      "technicalImpact": {
        "systemPerformance": "neutral",
        "securityPosture": "improved",
        "maintainability": "improved"
      }
    }
  },
  "riskAssessment": {
    "overallRiskLevel": "medium",
    "riskFactors": [
      {
        "factor": "deployment_complexity",
        "probability": 0.3,
        "impact": "medium",
        "mitigation": "Staged rollout with monitoring"
      }
    ]
  }
}
```

#### **Approve Confirmation**
```typescript
async approveConfirm(confirmId: string, approverId: string, comments?: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP Endpoint**: `POST /api/confirms/{confirmId}/approve`

#### **Reject Confirmation**
```typescript
async rejectConfirm(confirmId: string, approverId: string, reason: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP Endpoint**: `POST /api/confirms/{confirmId}/reject`

#### **Delegate Confirmation**
```typescript
async delegateConfirm(confirmId: string, fromApproverId: string, toApproverId: string, reason?: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP Endpoint**: `POST /api/confirms/{confirmId}/delegate`

#### **Escalate Confirmation**
```typescript
async escalateConfirm(confirmId: string, reason: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP Endpoint**: `POST /api/confirms/{confirmId}/escalate`

#### **Get Confirmation**
```typescript
async getConfirm(confirmId: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP Endpoint**: `GET /api/confirms/{confirmId}`

#### **Update Confirmation**
```typescript
async updateConfirm(confirmId: string, request: UpdateConfirmRequestDTO): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP Endpoint**: `PUT /api/confirms/{confirmId}`

#### **Delete Confirmation**
```typescript
async deleteConfirm(confirmId: string): Promise<ApiResponse<void>>
```

**HTTP Endpoint**: `DELETE /api/confirms/{confirmId}`

#### **Query Confirmations**
```typescript
async queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<ConfirmResponseDTO>>>
```

**HTTP Endpoint**: `GET /api/confirms`

**Query Parameters**:
- `status`: Filter by status
- `type`: Filter by confirmation type
- `priority`: Filter by priority
- `approverId`: Filter by approver
- `requesterId`: Filter by requester
- `limit`: Limit results
- `offset`: Pagination offset

## 🔧 Service Layer API

### **ConfirmManagementService**

Core business logic service providing confirmation management functionality.

#### **Main Methods**

```typescript
class ConfirmManagementService {
  // Basic CRUD operations
  async createConfirm(request: CreateConfirmRequest): Promise<ConfirmEntityData>;
  async getConfirmById(confirmId: string): Promise<ConfirmEntityData | null>;
  async updateConfirm(confirmId: string, request: UpdateConfirmRequest): Promise<ConfirmEntityData>;
  async deleteConfirm(confirmId: string): Promise<boolean>;
  
  // Approval operations
  async approveConfirm(confirmId: string, approverId: string, comments?: string): Promise<ConfirmEntityData>;
  async rejectConfirm(confirmId: string, approverId: string, reason: string): Promise<ConfirmEntityData>;
  async delegateConfirm(confirmId: string, fromApproverId: string, toApproverId: string, reason?: string): Promise<ConfirmEntityData>;
  async escalateConfirm(confirmId: string, reason: string): Promise<ConfirmEntityData>;
  
  // Workflow management
  async getWorkflowStatus(confirmId: string): Promise<WorkflowStatus>;
  async advanceWorkflow(confirmId: string): Promise<ConfirmEntityData>;
  async resetWorkflow(confirmId: string): Promise<ConfirmEntityData>;
  
  // Query and analytics
  async queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntityData>>;
  async getStatistics(): Promise<ConfirmStatistics>;
  async getApprovalMetrics(approverId: string): Promise<ApprovalMetrics>;
}
```

## 📊 Data Structures

### **ApprovalStep** (Approval Step Definition)

```typescript
interface ApprovalStep {
  stepId: string;                 // Step identifier
  approver: {
    userId: string;
    role: string;
    department?: string;
  };
  status: StepStatus;             // Step status
  requiredActions: string[];      // Required actions
  decision?: {
    outcome: DecisionOutcome;
    comments?: string;
    timestamp: Date;
  };
  timeConstraints?: {
    deadline?: Date;
    reminderIntervals?: number[];
  };
}
```

### **RiskAssessment** (Risk Assessment)

```typescript
interface RiskAssessment {
  overallRiskLevel: RiskLevel;    // Overall risk level
  riskFactors: Array<{
    factor: string;
    description?: string;
    probability: number;          // 0-1 probability
    impact: ImpactLevel;
    mitigation?: string;
  }>;
  complianceRequirements?: Array<{
    regulation: string;
    requirement: string;
    complianceStatus: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
    evidence?: string;
  }>;
}
```

### **ImpactAssessment** (Impact Assessment)

```typescript
interface ImpactAssessment {
  scope: 'task' | 'project' | 'organization' | 'external';
  affectedSystems?: string[];
  affectedUsers?: string[];
  businessImpact: {
    revenue: 'positive' | 'negative' | 'neutral';
    customerSatisfaction: 'positive' | 'negative' | 'neutral';
    operationalEfficiency: 'positive' | 'negative' | 'neutral';
  };
  technicalImpact: {
    systemPerformance: 'improved' | 'degraded' | 'neutral';
    securityPosture: 'improved' | 'degraded' | 'neutral';
    maintainability: 'improved' | 'degraded' | 'neutral';
  };
}
```

---

## 🔗 Related Documentation

- **[Implementation Guide](../modules/confirm/implementation-guide.md)**: Detailed implementation instructions
- **[Configuration Guide](../modules/confirm/configuration-guide.md)**: Configuration options reference
- **[Integration Examples](../modules/confirm/integration-examples.md)**: Real-world usage examples
- **[Protocol Specification](../modules/confirm/protocol-specification.md)**: Underlying protocol specification

---

**Last Updated**: September 4, 2025  
**API Version**: v1.0.0  
**Status**: Enterprise Grade Production Ready  
**Language**: English
