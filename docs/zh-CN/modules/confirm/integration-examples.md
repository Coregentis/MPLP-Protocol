# Confirm模块集成示例

> **🌐 语言导航**: [English](../../../en/modules/confirm/integration-examples.md) | [中文](integration-examples.md)



**多智能体协议生命周期平台 - Confirm模块集成示例 v1.0.0-alpha**

[![集成](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![示例](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![工作流](https://img.shields.io/badge/workflow-Best%20Practices-orange.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/confirm/integration-examples.md)

---

## 🎯 集成概览

本文档提供Confirm模块的全面集成示例，展示真实世界的企业工作流场景、跨模块审批集成模式，以及使用MPLP Confirm模块构建安全审批系统的最佳实践。

### **集成场景**
- **企业审批平台**: 具有合规功能的完整工作流系统
- **多租户工作流系统**: 可扩展的多组织审批工作流
- **跨模块集成**: 与Context、Role和Plan模块的集成
- **实时决策平台**: 高性能审批处理
- **合规和审计**: 监管合规和审计跟踪管理
- **AI驱动的决策支持**: 机器学习增强的审批路由

---

## 🚀 基础集成示例

### **1. 企业审批平台**

#### **Express.js与企业工作流**
```typescript
import express from 'express';
import { ConfirmModule } from '@mplp/confirm';
import { EnterpriseWorkflowService } from '@mplp/confirm/services';
import { ApprovalMiddleware } from '@mplp/confirm/middleware';

// 初始化Express应用
const app = express();
app.use(express.json());

// 使用企业功能初始化Confirm模块
const confirmModule = new ConfirmModule({
  workflow: {
    bpmnSupport: true,
    parallelExecution: true,
    aiPoweredRouting: true,
    dynamicEscalation: true
  },
  approval: {
    multiLevelApprovals: true,
    conditionalApprovals: true,
    bulkProcessing: true,
    delegationSupport: true
  },
  decision: {
    aiRecommendations: true,
    riskAssessment: true,
    impactAnalysis: true,
    complianceChecking: true
  },
  database: {
    type: 'postgresql',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    ssl: true,
    poolSize: 100
  },
  cache: {
    type: 'redis',
    cluster: true,
    host: process.env.REDIS_HOST
  }
});

const workflowService = confirmModule.getEnterpriseWorkflowService();
const approvalMiddleware = new ApprovalMiddleware(confirmModule);

// 全局应用审批中间件
app.use(approvalMiddleware.authenticate());
app.use(approvalMiddleware.auditRequest());

// 企业预算审批工作流
app.post('/approvals/budget', approvalMiddleware.requirePermission('budget:request'), async (req, res) => {
  try {
    const approvalRequest = await workflowService.createApprovalRequest({
      requestType: 'budget_approval',
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'normal',
      urgency: req.body.urgency || 'normal',
      requestedBy: req.user.userId,
      contextId: req.body.context_id,
      subject: {
        subjectType: 'budget_allocation',
        subjectId: req.body.budget_id,
        amount: req.body.amount,
        currency: req.body.currency || 'USD',
        category: req.body.category,
        fiscalYear: req.body.fiscal_year,
        quarter: req.body.quarter
      },
      approvalCriteria: {
        requiredApprovals: req.body.amount > 100000 ? 3 : 2,
        approvalThreshold: 'majority',
        escalationRules: {
          timeoutHours: req.body.amount > 500000 ? 24 : 48,
          escalationLevels: ['manager', 'director', 'vp'],
          autoEscalate: true
        }
      },
      workflowDefinition: {
        workflowId: 'wf-budget-approval-001',
        steps: [
          {
            stepName: '直接经理审批',
            stepType: 'human_approval',
            approverRole: 'direct_manager',
            required: true,
            timeoutHours: 24
          },
          {
            stepName: '财务审查',
            stepType: 'human_approval',
            approverRole: 'finance_manager',
            required: true,
            timeoutHours: 24,
            parallel: true
          },
          ...(req.body.amount > 100000 ? [{
            stepName: '高管审批',
            stepType: 'human_approval',
            approverRole: 'executive',
            required: true,
            timeoutHours: 48
          }] : [])
        ]
      },
      metadata: {
        department: req.body.department,
        costCenter: req.body.cost_center,
        businessJustification: req.body.business_justification,
        expectedRoi: req.body.expected_roi,
        riskLevel: req.body.risk_level || 'medium'
      }
    });

    // 发送实时通知
    await confirmModule.getNotificationService().sendApprovalNotifications({
      approvalId: approvalRequest.approvalId,
      notificationTypes: ['email', 'slack', 'dashboard'],
      urgency: req.body.urgency
    });

    res.status(201).json({
      success: true,
      data: {
        approvalId: approvalRequest.approvalId,
        status: approvalRequest.status,
        currentStep: approvalRequest.currentStep,
        estimatedCompletion: approvalRequest.estimatedCompletion,
        trackingUrl: `${process.env.APP_URL}/approvals/${approvalRequest.approvalId}`
      }
    });

  } catch (error) {
    console.error('预算审批请求创建失败:', error);
    res.status(500).json({
      success: false,
      error: '审批请求创建失败',
      details: error.message
    });
  }
});

// 处理审批决策
app.post('/approvals/:approvalId/decisions', approvalMiddleware.requireApprovalAccess(), async (req, res) => {
  try {
    const { approvalId } = req.params;
    
    const decisionResult = await workflowService.processApprovalDecision(approvalId, {
      decision: req.body.decision, // 'approved' | 'rejected' | 'conditional'
      decisionRationale: req.body.decision_rationale,
      approverId: req.user.userId,
      stepName: req.body.step_name,
      conditions: req.body.conditions || [],
      comments: req.body.comments || [],
      attachments: req.body.attachments || [],
      metadata: {
        approvalTimestamp: new Date().toISOString(),
        approvalLocation: req.body.approval_location || 'web',
        approvalMethod: 'web_interface',
        riskAssessment: req.body.risk_assessment,
        complianceCheck: req.body.compliance_check || 'passed'
      }
    });

    // 发送决策通知
    await confirmModule.getNotificationService().sendDecisionNotifications({
      approvalId: approvalId,
      decisionId: decisionResult.decisionId,
      decision: req.body.decision,
      nextActions: decisionResult.nextActions
    });

    res.json({
      success: true,
      data: {
        decisionId: decisionResult.decisionId,
        decisionStatus: decisionResult.decisionStatus,
        workflowStatus: decisionResult.workflowStatus,
        nextActions: decisionResult.nextActions,
        completionPercentage: decisionResult.completionPercentage
      }
    });

  } catch (error) {
    console.error('审批决策处理失败:', error);
    res.status(500).json({
      success: false,
      error: '决策处理失败',
      details: error.message
    });
  }
});

// 获取审批状态和进度
app.get('/approvals/:approvalId/status', approvalMiddleware.requireApprovalAccess(), async (req, res) => {
  try {
    const { approvalId } = req.params;
    
    const approvalStatus = await workflowService.getApprovalStatus(approvalId);
    
    res.json({
      success: true,
      data: approvalStatus
    });

  } catch (error) {
    console.error('获取审批状态失败:', error);
    res.status(500).json({
      success: false,
      error: '获取状态失败',
      details: error.message
    });
  }
});

// 批量审批处理
app.post('/approvals/bulk-decisions', approvalMiddleware.requirePermission('approval:bulk'), async (req, res) => {
  try {
    const bulkDecisions = req.body.decisions; // Array of decision objects
    
    const bulkResult = await workflowService.processBulkDecisions(bulkDecisions, {
      approverId: req.user.userId,
      batchId: req.body.batch_id,
      processingMode: req.body.processing_mode || 'parallel'
    });

    res.json({
      success: true,
      data: {
        batchId: bulkResult.batchId,
        totalProcessed: bulkResult.totalProcessed,
        successCount: bulkResult.successCount,
        failureCount: bulkResult.failureCount,
        results: bulkResult.results
      }
    });

  } catch (error) {
    console.error('批量审批处理失败:', error);
    res.status(500).json({
      success: false,
      error: '批量处理失败',
      details: error.message
    });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`企业审批平台服务器运行在端口 ${PORT}`);
});
```

### **2. 跨模块集成示例**

#### **与Context模块集成**
```typescript
import { ContextModule } from '@mplp/context';
import { ConfirmModule } from '@mplp/confirm';
import { RoleModule } from '@mplp/role';

// 初始化模块
const contextModule = new ContextModule(contextConfig);
const confirmModule = new ConfirmModule(confirmConfig);
const roleModule = new RoleModule(roleConfig);

// 设置跨模块事件监听
contextModule.on('context.approval_required', async (event) => {
  console.log('上下文模块请求审批:', event);
  
  // 从上下文获取审批要求
  const contextData = await contextModule.getContextData(event.contextId);
  
  // 基于上下文创建审批请求
  const approvalRequest = await confirmModule.createApprovalRequest({
    requestType: 'context_change_approval',
    title: `上下文变更审批: ${contextData.contextName}`,
    description: `请求审批上下文 ${event.contextId} 的变更`,
    contextId: event.contextId,
    subject: {
      subjectType: 'context_modification',
      subjectId: event.contextId,
      changeType: event.changeType,
      impactLevel: event.impactLevel
    },
    workflowDefinition: {
      workflowId: 'wf-context-change-approval',
      steps: [
        {
          stepName: '技术负责人审批',
          stepType: 'human_approval',
          approverRole: 'technical_lead',
          required: true
        }
      ]
    }
  });
  
  // 通知上下文模块审批已创建
  contextModule.emit('approval.created', {
    contextId: event.contextId,
    approvalId: approvalRequest.approvalId
  });
});

// 监听审批完成事件
confirmModule.on('approval.completed', async (event) => {
  if (event.requestType === 'context_change_approval') {
    // 通知上下文模块审批结果
    await contextModule.handleApprovalResult({
      contextId: event.contextId,
      approvalResult: event.finalDecision,
      approvalId: event.approvalId
    });
  }
});
```

---

## 🔧 高级集成模式

### **AI驱动的智能审批路由**

```typescript
import { AIRecommendationService } from '@mplp/confirm/ai';

class IntelligentApprovalPlatform {
  constructor(
    private confirmModule: ConfirmModule,
    private aiService: AIRecommendationService
  ) {}

  async createIntelligentApprovalRequest(request: any): Promise<any> {
    // 阶段1: AI分析请求内容
    const requestAnalysis = await this.aiService.analyzeApprovalRequest({
      requestType: request.requestType,
      subject: request.subject,
      requesterProfile: request.requesterProfile,
      organizationalContext: request.organizationalContext
    });

    // 阶段2: AI推荐最佳审批者
    const approverRecommendations = await this.aiService.recommendOptimalApprovers({
      requestAnalysis: requestAnalysis,
      availableApprovers: await this.getAvailableApprovers(),
      workloadBalancing: true,
      expertiseMatching: true,
      responseTimeOptimization: true
    });

    // 阶段3: AI优化工作流路径
    const optimizedWorkflow = await this.aiService.optimizeWorkflowPath({
      baseWorkflow: request.workflowDefinition,
      approverRecommendations: approverRecommendations,
      urgencyLevel: request.urgency,
      riskAssessment: requestAnalysis.riskLevel
    });

    // 阶段4: 创建智能审批请求
    return await this.confirmModule.createApprovalRequest({
      ...request,
      workflowDefinition: optimizedWorkflow,
      aiEnhanced: true,
      intelligentRouting: {
        enabled: true,
        recommendations: approverRecommendations,
        optimizationGoals: ['minimize_time', 'maximize_expertise', 'balance_workload']
      }
    });
  }
}
```

---

## 🔗 相关文档

- [Confirm模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [测试指南](./testing-guide.md) - 测试策略

---

**集成版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 生产就绪  

**⚠️ Alpha版本说明**: Confirm模块集成示例在Alpha版本中提供企业级审批工作流集成模式。额外的高级集成模式和最佳实践将在Beta版本中添加。
