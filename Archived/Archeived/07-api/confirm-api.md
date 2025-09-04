# MPLP v1.0 Confirm API 文档

<!--
文档元数据
版本: v1.0.0
创建时间: 2025-08-06T00:35:06Z
最后更新: 2025-08-06T00:35:06Z
文档状态: 已完成
-->

## 🎯 **API概览**

Confirm API提供了完整的确认和审批流程管理功能，支持多种确认类型、审批工作流和决策管理。

## 🔗 **基础信息**

- **Base URL**: `/api/v1/confirms`
- **认证方式**: Bearer Token
- **内容类型**: `application/json`
- **API版本**: v1.0.0

## 📋 **核心API端点**

### **1. 创建确认**
```http
POST /api/v1/confirms
Content-Type: application/json
Authorization: Bearer {token}

{
  "confirmation_type": "plan_approval",
  "title": "项目计划审批",
  "description": "请审批Q1项目计划",
  "plan_id": "plan_123456",
  "priority": "high",
  "required_approvers": ["user_001", "user_002"],
  "deadline": "2025-08-15T23:59:59Z",
  "metadata": {
    "department": "engineering",
    "budget_impact": 50000
  }
}
```

**响应示例**:
```json
{
  "status": 201,
  "data": {
    "confirm_id": "conf_789012",
    "confirmation_type": "plan_approval",
    "status": "pending",
    "title": "项目计划审批",
    "created_at": "2025-08-06T00:35:06Z",
    "deadline": "2025-08-15T23:59:59Z",
    "required_approvers": ["user_001", "user_002"],
    "current_approvers": [],
    "progress": {
      "approved_count": 0,
      "required_count": 2,
      "completion_percentage": 0
    }
  },
  "message": "确认创建成功"
}
```

### **2. 获取确认详情**
```http
GET /api/v1/confirms/{confirmId}
Authorization: Bearer {token}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "confirm_id": "conf_789012",
    "confirmation_type": "plan_approval",
    "status": "in_review",
    "title": "项目计划审批",
    "description": "请审批Q1项目计划",
    "plan_id": "plan_123456",
    "priority": "high",
    "created_at": "2025-08-06T00:35:06Z",
    "updated_at": "2025-08-06T01:15:30Z",
    "deadline": "2025-08-15T23:59:59Z",
    "required_approvers": ["user_001", "user_002"],
    "current_approvers": ["user_001"],
    "approval_history": [
      {
        "approver_id": "user_001",
        "decision": "approved",
        "timestamp": "2025-08-06T01:15:30Z",
        "comment": "计划合理，同意执行"
      }
    ],
    "progress": {
      "approved_count": 1,
      "required_count": 2,
      "completion_percentage": 50
    },
    "metadata": {
      "department": "engineering",
      "budget_impact": 50000
    }
  }
}
```

### **3. 提交审批决策**
```http
POST /api/v1/confirms/{confirmId}/approve
Content-Type: application/json
Authorization: Bearer {token}

{
  "decision": "approved",
  "comment": "计划详细且可行，同意执行",
  "conditions": ["需要每周进度汇报", "预算不得超过5万"]
}
```

**响应示例**:
```json
{
  "status": 200,
  "data": {
    "approval_id": "appr_345678",
    "confirm_id": "conf_789012",
    "approver_id": "user_002",
    "decision": "approved",
    "timestamp": "2025-08-06T02:30:45Z",
    "comment": "计划详细且可行，同意执行",
    "conditions": ["需要每周进度汇报", "预算不得超过5万"]
  },
  "message": "审批决策提交成功"
}
```

### **4. 拒绝确认**
```http
POST /api/v1/confirms/{confirmId}/reject
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "预算超出限制",
  "comment": "当前预算申请超出部门限额，请重新调整",
  "suggestions": ["减少非必要开支", "分阶段实施"]
}
```

### **5. 列出确认**
```http
GET /api/v1/confirms?status=pending&type=plan_approval&limit=10&offset=0
Authorization: Bearer {token}
```

**查询参数**:
- `status`: 过滤状态 (pending, in_review, approved, rejected)
- `type`: 确认类型 (plan_approval, task_approval, etc.)
- `priority`: 优先级 (low, medium, high, urgent)
- `assignee`: 指定审批人
- `limit`: 返回数量限制 (默认10)
- `offset`: 偏移量 (默认0)

### **6. 更新确认**
```http
PUT /api/v1/confirms/{confirmId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "deadline": "2025-08-20T23:59:59Z",
  "priority": "urgent"
}
```

### **7. 取消确认**
```http
DELETE /api/v1/confirms/{confirmId}
Authorization: Bearer {token}
```

## 📊 **数据模型**

### **确认类型 (ConfirmationType)**
- `plan_approval`: 计划审批
- `task_approval`: 任务审批
- `milestone_confirmation`: 里程碑确认
- `risk_acceptance`: 风险接受
- `resource_allocation`: 资源分配
- `emergency_approval`: 紧急审批

### **确认状态 (ConfirmStatus)**
- `pending`: 待处理
- `in_review`: 审核中
- `approved`: 已批准
- `rejected`: 已拒绝
- `cancelled`: 已取消
- `expired`: 已过期

### **决策类型 (ConfirmDecision)**
- `approved`: 同意
- `rejected`: 拒绝
- `conditional`: 有条件同意
- `deferred`: 延期决策

### **优先级 (Priority)**
- `low`: 低优先级
- `medium`: 中等优先级
- `high`: 高优先级
- `urgent`: 紧急

## 🔧 **TypeScript SDK 使用示例**

```typescript
import { ConfirmProtocol } from 'mplp/confirm';

// 创建确认
const confirmation = await ConfirmProtocol.create({
  confirmation_type: 'plan_approval',
  title: '项目计划审批',
  description: '请审批Q1项目计划',
  plan_id: 'plan_123456',
  priority: 'high',
  required_approvers: ['user_001', 'user_002'],
  deadline: '2025-08-15T23:59:59Z'
});

// 提交审批
await ConfirmProtocol.approve(confirmation.confirm_id, {
  decision: 'approved',
  comment: '计划合理，同意执行'
});

// 获取确认状态
const status = await ConfirmProtocol.getStatus(confirmation.confirm_id);
console.log('确认状态:', status.status);
```

## 🚦 **状态码**

- `200 OK`: 请求成功
- `201 Created`: 确认创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 认证失败
- `403 Forbidden`: 权限不足
- `404 Not Found`: 确认不存在
- `409 Conflict`: 确认状态冲突
- `422 Unprocessable Entity`: 数据验证失败
- `500 Internal Server Error`: 服务器内部错误

## 📈 **性能和限制**

- **请求频率**: 100 requests/minute
- **并发限制**: 5 concurrent requests
- **确认数量**: 最大1000个活跃确认
- **审批人数**: 最大10个审批人
- **文件大小**: 附件最大5MB

---

**相关文档**:
- [Confirm Protocol概览](../03-protocols/protocol-overview.md#confirm-protocol)
- [API总览](./api-overview.md)
- [认证指南](../04-development/authentication.md)
