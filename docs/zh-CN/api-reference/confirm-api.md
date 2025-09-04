# Confirm API 参考

**多方审批和共识机制 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Confirm%20模块-blue.svg)](../modules/confirm/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--confirm.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-265%2F265%20通过-green.svg)](../modules/confirm/testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/api-reference/confirm-api.md)

---

## 🎯 概述

Confirm API为多智能体系统提供全面的审批工作流和共识管理功能。它支持复杂的审批流程、风险评估、合规跟踪和企业级工作流管理。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  ConfirmController,
  ConfirmManagementService,
  CreateConfirmRequestDTO,
  UpdateConfirmRequestDTO,
  ConfirmResponseDTO
} from 'mplp/modules/confirm';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const confirmModule = mplp.getModule('confirm');
```

## 🏗️ 核心接口

### **ConfirmResponseDTO** (响应接口)

```typescript
interface ConfirmResponseDTO {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  confirmId: string;              // 唯一确认标识符
  contextId: string;              // 关联的上下文ID
  planId?: string;                // 关联的计划ID（可选）
  confirmationType: ConfirmationType; // 确认类型
  status: ConfirmationStatus;     // 确认状态
  priority: Priority;             // 优先级
  
  // 请求者信息
  requester: {
    userId: string;
    role: string;
    department?: string;
    requestReason: string;
  };
  
  // 审批工作流
  approvalWorkflow: {
    workflowType: WorkflowType;
    steps: ApprovalStep[];
    currentStep: number;
    completionCriteria: CompletionCriteria;
  };
  
  // 主题和风险评估
  subject: {
    title: string;
    description: string;
    impactAssessment: ImpactAssessment;
    attachments?: Attachment[];
  };
  riskAssessment: RiskAssessment;
  
  // 企业级功能
  auditTrail: AuditTrail;
  complianceTracking: ComplianceTracking;
  
  // 元数据
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateConfirmRequestDTO** (创建请求接口)

```typescript
interface CreateConfirmRequestDTO {
  contextId: string;              // 必需：关联的上下文ID
  planId?: string;                // 可选：关联的计划ID
  confirmationType: ConfirmationType; // 必需：确认类型
  priority: Priority;             // 必需：优先级
  
  // 请求者信息
  requester: {
    userId: string;
    role: string;
    department?: string;
    requestReason: string;
  };
  
  // 审批工作流配置
  approvalWorkflow: {
    workflowType: WorkflowType;
    steps: Partial<ApprovalStep>[];
    completionCriteria?: Partial<CompletionCriteria>;
  };
  
  // 主题详情
  subject: {
    title: string;
    description: string;
    impactAssessment: ImpactAssessment;
    attachments?: Attachment[];
  };
  
  // 风险评估
  riskAssessment: RiskAssessment;
  
  // 元数据
  metadata?: Record<string, any>;
}
```

### **UpdateConfirmRequestDTO** (更新请求接口)

```typescript
interface UpdateConfirmRequestDTO {
  status?: ConfirmationStatus;    // 可选：更新状态
  priority?: Priority;            // 可选：更新优先级
  
  // 工作流更新
  approvalWorkflow?: Partial<{
    steps: Partial<ApprovalStep>[];
    completionCriteria: Partial<CompletionCriteria>;
  }>;
  
  // 主题更新
  subject?: Partial<{
    title: string;
    description: string;
    impactAssessment: Partial<ImpactAssessment>;
  }>;
  
  // 风险评估更新
  riskAssessment?: Partial<RiskAssessment>;
  
  // 元数据更新
  metadata?: Record<string, any>;
}
```

## 🔧 核心枚举类型

### **ConfirmationType** (确认类型)

```typescript
enum ConfirmationType {
  PLAN_APPROVAL = 'plan_approval',        // 计划审批
  TASK_APPROVAL = 'task_approval',        // 任务审批
  MILESTONE_CONFIRMATION = 'milestone_confirmation', // 里程碑确认
  RISK_ACCEPTANCE = 'risk_acceptance',    // 风险接受
  RESOURCE_ALLOCATION = 'resource_allocation', // 资源分配
  EMERGENCY_APPROVAL = 'emergency_approval'    // 紧急审批
}
```

### **ConfirmationStatus** (确认状态)

```typescript
enum ConfirmationStatus {
  PENDING = 'pending',            // 待审批
  IN_REVIEW = 'in_review',        // 审核中
  APPROVED = 'approved',          // 已批准
  REJECTED = 'rejected',          // 已拒绝
  CANCELLED = 'cancelled',        // 已取消
  EXPIRED = 'expired'             // 已过期
}
```

### **WorkflowType** (工作流类型)

```typescript
enum WorkflowType {
  SINGLE_APPROVER = 'single_approver',    // 单一审批者
  SEQUENTIAL = 'sequential',              // 顺序审批
  PARALLEL = 'parallel',                  // 并行审批
  CONSENSUS = 'consensus',                // 共识决策
  ESCALATION = 'escalation'               // 升级工作流
}
```

## 🎮 控制器API

### **ConfirmController**

主要的REST API控制器，提供HTTP端点访问。

#### **创建确认**
```typescript
async createConfirm(request: CreateConfirmRequestDTO): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP端点**: `POST /api/confirms`

**请求示例**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "confirmationType": "plan_approval",
  "priority": "high",
  "requester": {
    "userId": "user-123",
    "role": "project_manager",
    "department": "engineering",
    "requestReason": "部署新功能到生产环境"
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
    "title": "生产部署审批",
    "description": "请求批准将功能X部署到生产环境",
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
        "mitigation": "分阶段发布并监控"
      }
    ]
  }
}
```

#### **批准确认**
```typescript
async approveConfirm(confirmId: string, approverId: string, comments?: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP端点**: `POST /api/confirms/{confirmId}/approve`

#### **拒绝确认**
```typescript
async rejectConfirm(confirmId: string, approverId: string, reason: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP端点**: `POST /api/confirms/{confirmId}/reject`

#### **委派确认**
```typescript
async delegateConfirm(confirmId: string, fromApproverId: string, toApproverId: string, reason?: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP端点**: `POST /api/confirms/{confirmId}/delegate`

#### **升级确认**
```typescript
async escalateConfirm(confirmId: string, reason: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP端点**: `POST /api/confirms/{confirmId}/escalate`

#### **获取确认**
```typescript
async getConfirm(confirmId: string): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP端点**: `GET /api/confirms/{confirmId}`

#### **更新确认**
```typescript
async updateConfirm(confirmId: string, request: UpdateConfirmRequestDTO): Promise<ApiResponse<ConfirmResponseDTO>>
```

**HTTP端点**: `PUT /api/confirms/{confirmId}`

#### **删除确认**
```typescript
async deleteConfirm(confirmId: string): Promise<ApiResponse<void>>
```

**HTTP端点**: `DELETE /api/confirms/{confirmId}`

#### **查询确认**
```typescript
async queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<ApiResponse<PaginatedResult<ConfirmResponseDTO>>>
```

**HTTP端点**: `GET /api/confirms`

**查询参数**:
- `status`: 按状态过滤
- `type`: 按确认类型过滤
- `priority`: 按优先级过滤
- `approverId`: 按审批者过滤
- `requesterId`: 按请求者过滤
- `limit`: 限制结果数量
- `offset`: 分页偏移量

## 🔧 服务层API

### **ConfirmManagementService**

核心业务逻辑服务，提供确认管理功能。

#### **主要方法**

```typescript
class ConfirmManagementService {
  // 基础CRUD操作
  async createConfirm(request: CreateConfirmRequest): Promise<ConfirmEntityData>;
  async getConfirmById(confirmId: string): Promise<ConfirmEntityData | null>;
  async updateConfirm(confirmId: string, request: UpdateConfirmRequest): Promise<ConfirmEntityData>;
  async deleteConfirm(confirmId: string): Promise<boolean>;
  
  // 审批操作
  async approveConfirm(confirmId: string, approverId: string, comments?: string): Promise<ConfirmEntityData>;
  async rejectConfirm(confirmId: string, approverId: string, reason: string): Promise<ConfirmEntityData>;
  async delegateConfirm(confirmId: string, fromApproverId: string, toApproverId: string, reason?: string): Promise<ConfirmEntityData>;
  async escalateConfirm(confirmId: string, reason: string): Promise<ConfirmEntityData>;
  
  // 工作流管理
  async getWorkflowStatus(confirmId: string): Promise<WorkflowStatus>;
  async advanceWorkflow(confirmId: string): Promise<ConfirmEntityData>;
  async resetWorkflow(confirmId: string): Promise<ConfirmEntityData>;
  
  // 查询和分析
  async queryConfirms(filter: ConfirmQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ConfirmEntityData>>;
  async getStatistics(): Promise<ConfirmStatistics>;
  async getApprovalMetrics(approverId: string): Promise<ApprovalMetrics>;
}
```

## 📊 数据结构

### **ApprovalStep** (审批步骤定义)

```typescript
interface ApprovalStep {
  stepId: string;                 // 步骤标识符
  approver: {
    userId: string;
    role: string;
    department?: string;
  };
  status: StepStatus;             // 步骤状态
  requiredActions: string[];      // 必需操作
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

### **RiskAssessment** (风险评估)

```typescript
interface RiskAssessment {
  overallRiskLevel: RiskLevel;    // 整体风险级别
  riskFactors: Array<{
    factor: string;
    description?: string;
    probability: number;          // 0-1概率
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

### **ImpactAssessment** (影响评估)

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

## 🔗 相关文档

- **[实现指南](../modules/confirm/implementation-guide.md)**: 详细实现说明
- **[配置指南](../modules/confirm/configuration-guide.md)**: 配置选项参考
- **[集成示例](../modules/confirm/integration-examples.md)**: 实际使用示例
- **[协议规范](../modules/confirm/protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文
