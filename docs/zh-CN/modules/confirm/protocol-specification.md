# Confirm模块协议规范

> **🌐 语言导航**: [English](../../../en/modules/confirm/protocol-specification.md) | [中文](protocol-specification.md)



**多智能体协议生命周期平台 - Confirm模块协议规范 v1.0.0-alpha**

[![协议](https://img.shields.io/badge/protocol-Workflow%20v1.0-blue.svg)](./README.md)
[![规范](https://img.shields.io/badge/specification-Enterprise%20Grade-green.svg)](./api-reference.md)
[![工作流](https://img.shields.io/badge/workflow-Compliant-orange.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/confirm/protocol-specification.md)

---

## 🎯 协议概览

Confirm模块协议定义了多智能体系统中企业级审批工作流、决策管理和共识机制的全面消息格式、数据结构和通信模式。该规范确保分布式代理网络中安全、可扩展和可互操作的审批处理。

### **协议范围**
- **工作流消息**: 流程定义、执行和状态管理协议
- **审批处理**: 多级审批链和决策路由
- **共识机制**: 多方协议和投票协议
- **决策支持**: AI推荐和风险评估协议
- **跨模块集成**: 与Context、Role和Plan模块的安全通信

### **协议特征**
- **版本**: 1.0.0-alpha
- **传输**: HTTP/HTTPS、WebSocket、消息队列
- **序列化**: 带Schema验证的JSON
- **安全**: JWT身份验证、消息签名、加密支持
- **合规**: SOX、GDPR、HIPAA、ISO27001兼容

---

## 📋 核心协议消息

### **工作流管理协议**

#### **工作流定义消息**
```json
{
  "message_type": "confirm.workflow.define",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-workflow-001",
  "timestamp": "2025-09-03T10:00:00Z",
  "correlation_id": "corr-001",
  "sender": {
    "sender_id": "admin-001",
    "sender_type": "workflow_administrator",
    "authentication": {
      "method": "jwt",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "mfa_verified": true
    }
  },
  "payload": {
    "workflow_definition": {
      "workflow_id": "wf-enterprise-budget-001",
      "workflow_name": "企业预算审批",
      "workflow_version": "2.1.0",
      "workflow_description": "具有AI驱动路由的企业预算请求多级审批流程",
      "workflow_category": "financial_approval",
      "workflow_type": "human_centric",
      "bpmn_version": "2.0",
      "trigger_conditions": {
        "request_types": ["budget_approval", "capital_expenditure"],
        "amount_thresholds": {
          "minimum": 50000,
          "maximum": 10000000,
          "currency": "USD"
        },
        "departments": ["marketing", "sales", "operations", "technology"],
        "priority_levels": ["normal", "high", "critical"],
        "security_levels": ["internal", "confidential", "restricted"]
      },
      "workflow_steps": [
        {
          "step_id": "step-001",
          "step_name": "自动预验证",
          "step_type": "automated_validation",
          "step_order": 1,
          "step_description": "预算请求完整性和合规性的自动验证",
          "execution_type": "synchronous",
          "timeout_configuration": {
            "execution_timeout_ms": 30000,
            "retry_attempts": 3,
            "retry_delay_ms": 5000
          },
          "validation_rules": [
            {
              "rule_id": "rule-001",
              "rule_name": "预算完整性检查",
              "rule_type": "data_validation",
              "rule_expression": "subject.amount > 0 AND subject.currency IS NOT NULL AND subject.category IS NOT NULL",
              "error_message": "预算请求必须包含有效的金额、货币和类别"
            },
            {
              "rule_id": "rule-002",
              "rule_name": "合规框架检查",
              "rule_type": "compliance_validation",
              "rule_expression": "metadata.compliance_requirements CONTAINS 'sox' OR metadata.compliance_requirements CONTAINS 'budget_policy'",
              "error_message": "预算请求必须指定适用的合规框架"
            }
          ],
          "success_conditions": [
            {
              "condition_type": "all_validations_passed",
              "condition_description": "所有验证规则必须通过"
            }
          ],
          "failure_actions": [
            {
              "action_type": "reject_request",
              "action_description": "验证失败时拒绝请求",
              "notification_required": true
            }
          ]
        },
        {
          "step_id": "step-002",
          "step_name": "AI智能路由",
          "step_type": "ai_routing",
          "step_order": 2,
          "step_description": "基于AI的最佳审批者选择和路由优化",
          "execution_type": "asynchronous",
          "timeout_configuration": {
            "execution_timeout_ms": 60000,
            "retry_attempts": 2,
            "retry_delay_ms": 10000
          },
          "ai_configuration": {
            "ai_provider": "openai",
            "model": "gpt-4",
            "confidence_threshold": 0.8,
            "routing_criteria": [
              "approver_expertise",
              "workload_balance",
              "response_time_optimization",
              "risk_assessment_capability"
            ],
            "fallback_routing": {
              "enabled": true,
              "fallback_method": "rule_based",
              "fallback_rules": [
                {
                  "condition": "amount > 1000000",
                  "approver_role": "executive_committee"
                },
                {
                  "condition": "amount > 100000",
                  "approver_role": "senior_manager"
                },
                {
                  "condition": "amount <= 100000",
                  "approver_role": "department_manager"
                }
              ]
            }
          }
        },
        {
          "step_id": "step-003",
          "step_name": "部门经理审批",
          "step_type": "human_approval",
          "step_order": 3,
          "step_description": "部门经理级别的预算审批",
          "execution_type": "asynchronous",
          "timeout_configuration": {
            "approval_timeout_hours": 48,
            "reminder_intervals_hours": [24, 36],
            "escalation_timeout_hours": 72
          },
          "approver_selection": {
            "selection_method": "role_based",
            "selection_criteria": {
              "role": "department_manager",
              "department": "requester_department",
              "backup_approvers": true,
              "delegation_allowed": true
            },
            "approval_requirements": {
              "required_approvals": 1,
              "approval_threshold": "simple_majority",
              "allow_conditional_approval": true,
              "require_rationale": true
            }
          },
          "escalation_rules": [
            {
              "escalation_trigger": "timeout",
              "escalation_target": "senior_manager",
              "escalation_delay_hours": 72,
              "notification_required": true
            },
            {
              "escalation_trigger": "approver_unavailable",
              "escalation_target": "backup_approver",
              "escalation_delay_hours": 24,
              "notification_required": true
            }
          ]
        },
        {
          "step_id": "step-004",
          "step_name": "财务审查",
          "step_type": "human_approval",
          "step_order": 4,
          "step_description": "财务部门的预算合规性和可行性审查",
          "execution_type": "parallel",
          "parallel_with": ["step-003"],
          "timeout_configuration": {
            "approval_timeout_hours": 72,
            "reminder_intervals_hours": [24, 48],
            "escalation_timeout_hours": 96
          },
          "approver_selection": {
            "selection_method": "department_based",
            "selection_criteria": {
              "department": "finance",
              "role": "finance_manager",
              "expertise_required": ["budget_analysis", "financial_compliance"],
              "minimum_experience_years": 5
            },
            "approval_requirements": {
              "required_approvals": 1,
              "approval_threshold": "unanimous",
              "allow_conditional_approval": true,
              "require_financial_analysis": true
            }
          },
          "review_criteria": [
            {
              "criterion_id": "budget_alignment",
              "criterion_name": "预算对齐检查",
              "criterion_description": "验证请求与年度预算计划的对齐性",
              "weight": 0.3
            },
            {
              "criterion_id": "cash_flow_impact",
              "criterion_name": "现金流影响分析",
              "criterion_description": "评估对公司现金流的影响",
              "weight": 0.4
            },
            {
              "criterion_id": "roi_analysis",
              "criterion_name": "投资回报分析",
              "criterion_description": "分析预期投资回报率",
              "weight": 0.3
            }
          ]
        }
      ],
      "workflow_configuration": {
        "parallel_execution_enabled": true,
        "conditional_routing_enabled": true,
        "dynamic_escalation_enabled": true,
        "ai_optimization_enabled": true,
        "audit_trail_required": true,
        "compliance_validation_required": true,
        "notification_preferences": {
          "real_time_notifications": true,
          "email_notifications": true,
          "slack_integration": true,
          "dashboard_updates": true
        },
        "performance_targets": {
          "average_completion_time_hours": 96,
          "escalation_rate_threshold": 0.1,
          "approval_success_rate_threshold": 0.95
        }
      },
      "integration_points": [
        {
          "module": "context",
          "integration_type": "bidirectional",
          "sync_events": ["workflow_started", "workflow_completed", "approval_decision_made"]
        },
        {
          "module": "role",
          "integration_type": "query",
          "sync_events": ["approver_selection", "permission_validation"]
        },
        {
          "module": "plan",
          "integration_type": "notification",
          "sync_events": ["budget_approved", "budget_rejected"]
        }
      ],
      "compliance_requirements": {
        "regulatory_frameworks": ["sox", "gdpr", "budget_policy_2025"],
        "audit_retention_years": 7,
        "data_classification": "confidential",
        "encryption_required": true,
        "access_logging_required": true
      }
    }
  },
  "security": {
    "message_encryption": "AES-256-GCM",
    "message_signature": "HMAC-SHA256",
    "audit_required": true,
    "compliance_tags": ["sox", "gdpr", "budget_policy"]
  }
}
```

#### **审批请求消息**
```json
{
  "message_type": "confirm.approval.request",
  "protocol_version": "1.0.0-alpha",
  "message_id": "msg-approval-req-001",
  "timestamp": "2025-09-03T14:30:00Z",
  "correlation_id": "corr-budget-001",
  "sender": {
    "sender_id": "user-marketing-001",
    "sender_type": "human_user",
    "authentication": {
      "method": "jwt",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user_account": "zhang.marketing@company.com"
    }
  },
  "payload": {
    "approval_request": {
      "request_id": "req-budget-q4-001",
      "request_type": "budget_approval",
      "title": "Q4营销活动预算申请",
      "description": "第四季度数字营销活动预算申请，包括广告投放、内容制作和活动执行",
      "priority": "high",
      "urgency": "normal",
      "context_id": "ctx-marketing-q4-2025",
      "subject": {
        "subject_type": "budget_allocation",
        "subject_id": "budget-marketing-q4-2025",
        "amount": 750000,
        "currency": "USD",
        "category": "marketing_expenses",
        "subcategory": "digital_advertising",
        "fiscal_year": "2025",
        "quarter": "Q4",
        "cost_center": "MKT-001",
        "budget_breakdown": [
          {
            "item": "数字广告投放",
            "amount": 400000,
            "percentage": 53.3,
            "justification": "Google Ads、Facebook Ads、LinkedIn Ads投放"
          },
          {
            "item": "内容制作",
            "amount": 200000,
            "percentage": 26.7,
            "justification": "视频制作、图片设计、文案创作"
          },
          {
            "item": "活动执行",
            "amount": 100000,
            "percentage": 13.3,
            "justification": "线上活动、网络研讨会、产品发布"
          },
          {
            "item": "分析工具",
            "amount": 50000,
            "percentage": 6.7,
            "justification": "营销分析工具、A/B测试平台"
          }
        ]
      },
      "business_justification": {
        "strategic_alignment": "支持公司Q4增长目标，预计带来25%的潜在客户增长",
        "expected_outcomes": [
          "品牌知名度提升30%",
          "潜在客户增长25%",
          "转化率提升15%",
          "市场份额增长5%"
        ],
        "risk_mitigation": [
          "分阶段投放降低风险",
          "实时监控和优化",
          "多渠道分散投资"
        ],
        "success_metrics": [
          {
            "metric": "潜在客户数量",
            "target": 5000,
            "measurement_period": "Q4"
          },
          {
            "metric": "转化率",
            "target": "15%",
            "measurement_period": "Q4"
          },
          {
            "metric": "投资回报率",
            "target": "3.5x",
            "measurement_period": "6个月"
          }
        ]
      },
      "approval_criteria": {
        "required_approvals": 2,
        "approval_threshold": "majority",
        "escalation_rules": {
          "timeout_hours": 72,
          "escalation_levels": ["senior_manager", "director", "vp_marketing"],
          "auto_escalate": true
        }
      },
      "attachments": [
        {
          "attachment_id": "att-001",
          "filename": "Q4营销预算详细计划.pdf",
          "file_type": "application/pdf",
          "file_size": 2048576,
          "checksum": "sha256:abc123def456...",
          "upload_timestamp": "2025-09-03T14:25:00Z"
        },
        {
          "attachment_id": "att-002",
          "filename": "市场分析报告.xlsx",
          "file_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "file_size": 1536000,
          "checksum": "sha256:def456ghi789...",
          "upload_timestamp": "2025-09-03T14:26:00Z"
        }
      ],
      "metadata": {
        "department": "marketing",
        "cost_center": "MKT-001",
        "project_code": "PROJ-Q4-MKT-2025",
        "budget_category": "operational_expenses",
        "approval_deadline": "2025-09-10T23:59:59Z",
        "business_impact": "high",
        "compliance_requirements": ["budget_policy_2025", "marketing_guidelines"],
        "stakeholders": [
          "marketing_team",
          "finance_department",
          "executive_committee"
        ]
      }
    }
  },
  "security": {
    "message_encryption": "AES-256-GCM",
    "message_signature": "HMAC-SHA256",
    "audit_required": true,
    "compliance_tags": ["budget_policy", "financial_data"]
  }
}
```

---

## 🔗 相关文档

- [Confirm模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项
- [实施指南](./implementation-guide.md) - 实施指南
- [测试指南](./testing-guide.md) - 测试策略
- [性能指南](./performance-guide.md) - 性能优化
- [集成示例](./integration-examples.md) - 集成示例

---

**协议版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业级规范  

**⚠️ Alpha版本说明**: Confirm模块协议规范在Alpha版本中提供企业级审批工作流协议定义。额外的高级协议功能和扩展将在Beta版本中添加。
