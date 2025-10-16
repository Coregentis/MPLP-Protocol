# Confirm Module Integration Examples

> **🌐 Language Navigation**: [English](integration-examples.md) | [中文](../../../zh-CN/modules/confirm/integration-examples.md)



**Multi-Agent Protocol Lifecycle Platform - Confirm Module Integration Examples v1.0.0-alpha**

[![Integration](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![Examples](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![Workflow](https://img.shields.io/badge/workflow-Best%20Practices-orange.svg)](./api-reference.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/confirm/integration-examples.md)

---

## 🎯 Integration Overview

This document provides comprehensive integration examples for the Confirm Module, demonstrating real-world enterprise workflow scenarios, cross-module approval integration patterns, and best practices for building secure approval systems with MPLP Confirm Module.

### **Integration Scenarios**
- **Enterprise Approval Platform**: Complete workflow system with compliance features
- **Multi-Tenant Workflow System**: Scalable multi-organization approval workflows
- **Cross-Module Integration**: Integration with Context, Role, and Plan modules
- **Real-Time Decision Platform**: High-performance approval processing
- **Compliance and Audit**: Regulatory compliance and audit trail management
- **AI-Powered Decision Support**: Machine learning-enhanced approval routing

---

## 🚀 Basic Integration Examples

### **1. Enterprise Approval Platform**

#### **Express.js with Enterprise Workflows**
```typescript
import express from 'express';
import { ConfirmModule } from '@mplp/confirm';
import { EnterpriseWorkflowService } from '@mplp/confirm/services';
import { ApprovalMiddleware } from '@mplp/confirm/middleware';

// Initialize Express application
const app = express();
app.use(express.json());

// Initialize Confirm Module with enterprise features
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

// Apply approval middleware globally
app.use(approvalMiddleware.authenticate());
app.use(approvalMiddleware.auditRequest());

// Enterprise budget approval workflow
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
        requiredApprovals: req.body.required_approvals || 2,
        approvalThreshold: req.body.approval_threshold || 'majority',
        escalationRules: {
          timeoutHours: req.body.timeout_hours || 48,
          escalationLevels: req.body.escalation_levels || ['manager', 'director', 'vp'],
          autoEscalate: req.body.auto_escalate !== false
        }
      },
      workflowDefinition: {
        workflowId: 'wf-budget-approval-enterprise',
        steps: [
          {
            stepName: 'Department Manager Review',
            stepType: 'human_approval',
            approverSelection: {
              method: 'role_based',
              role: 'department_manager',
              fallbackRole: 'senior_manager'
            },
            requirements: {
              required: true,
              timeoutHours: 24,
              escalationEnabled: true
            }
          },
          {
            stepName: 'Finance Team Review',
            stepType: 'human_approval',
            approverSelection: {
              method: 'ai_recommended',
              criteria: ['financial_expertise', 'availability', 'workload']
            },
            requirements: {
              required: true,
              timeoutHours: 48,
              parallelExecution: true
            }
          },
          {
            stepName: 'Executive Approval',
            stepType: 'human_approval',
            approverSelection: {
              method: 'role_based',
              role: 'executive_team',
              minimumLevel: 'director'
            },
            requirements: {
              required: true,
              timeoutHours: 72,
              conditions: ['amount > 250000']
            }
          }
        ]
      },
      attachments: req.body.attachments || [],
      metadata: {
        department: req.body.department,
        costCenter: req.body.cost_center,
        projectCode: req.body.project_code,
        businessJustification: req.body.business_justification,
        expectedRoi: req.body.expected_roi,
        riskLevel: req.body.risk_level || 'medium',
        complianceRequirements: req.body.compliance_requirements || ['sox', 'budget_policy']
      }
    });

    res.status(201).json({
      request_id: approvalRequest.requestId,
      status: approvalRequest.status,
      workflow_execution: {
        execution_id: approvalRequest.workflowExecution.executionId,
        current_step: approvalRequest.workflowExecution.currentStep,
        estimated_completion: approvalRequest.workflowExecution.estimatedCompletion
      },
      approval_route: {
        route_id: approvalRequest.approvalRoute.routeId,
        total_steps: approvalRequest.approvalRoute.totalSteps,
        current_approvers: approvalRequest.approvalRoute.currentApprovers.map(approver => ({
          approver_id: approver.approverId,
          approver_name: approver.approverName,
          approver_role: approver.approverRole,
          due_date: approver.dueDate
        }))
      },
      audit_trail: {
        audit_id: approvalRequest.auditTrail.auditId,
        created_at: approvalRequest.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Submit approval decision with AI-powered recommendations
app.post('/approvals/:requestId/decisions', approvalMiddleware.requireApproverRole(), async (req, res) => {
  try {
    // Get AI recommendations before decision
    const aiRecommendations = await workflowService.getDecisionRecommendations({
      requestId: req.params.requestId,
      approverId: req.user.userId,
      includeRiskAssessment: true,
      includeImpactAnalysis: true,
      includeHistoricalData: true
    });

    const approvalResult = await workflowService.processApprovalDecision({
      decisionId: req.body.decision_id || workflowService.generateDecisionId(),
      requestId: req.params.requestId,
      stepId: req.body.step_id,
      approverId: req.user.userId,
      approverRole: req.user.role,
      decision: req.body.decision,
      decisionConfidence: req.body.decision_confidence || 0.95,
      decisionTimestamp: new Date(),
      decisionRationale: req.body.decision_rationale,
      conditions: req.body.conditions || [],
      recommendations: req.body.recommendations || [],
      riskAssessment: {
        riskLevel: req.body.risk_level || aiRecommendations.suggestedRiskLevel,
        riskFactors: req.body.risk_factors || aiRecommendations.identifiedRiskFactors,
        mitigationStrategies: req.body.mitigation_strategies || aiRecommendations.recommendedMitigations
      },
      aiInsights: {
        recommendationUsed: req.body.used_ai_recommendation || false,
        recommendationConfidence: aiRecommendations.confidence,
        alternativeOptions: aiRecommendations.alternativeDecisions
      },
      auditTrail: {
        decisionFactors: req.body.decision_factors || aiRecommendations.decisionFactors,
        supportingDocuments: req.body.supporting_documents || [],
        consultationNotes: req.body.consultation_notes
      }
    });

    res.json({
      decision_id: approvalResult.decision.decisionId,
      decision: approvalResult.decision.decision,
      decision_timestamp: approvalResult.decision.decisionTimestamp,
      workflow_status: {
        current_step: approvalResult.workflowState.currentStep,
        status: approvalResult.workflowState.status,
        progress_percentage: approvalResult.workflowState.progressPercentage,
        next_approvers: approvalResult.nextSteps.map(step => ({
          approver_id: step.approverId,
          approver_name: step.approverName,
          step_name: step.stepName,
          due_date: step.dueDate
        }))
      },
      ai_insights: {
        recommendation_accuracy: aiRecommendations.confidence,
        decision_alignment: approvalResult.decision.decision === aiRecommendations.recommendedDecision,
        risk_assessment_match: approvalResult.decision.riskAssessment.riskLevel === aiRecommendations.suggestedRiskLevel
      },
      final_outcome: approvalResult.finalOutcome,
      audit_trail: {
        audit_id: approvalResult.auditTrail.auditId,
        decision_recorded_at: approvalResult.decision.decisionTimestamp
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Advanced consensus process for strategic decisions
app.post('/consensus/strategic-decisions', approvalMiddleware.requirePermission('consensus:initiate'), async (req, res) => {
  try {
    const consensusProcess = await workflowService.initiateConsensusProcess({
      consensusType: 'strategic_decision',
      title: req.body.title,
      description: req.body.description,
      contextId: req.body.context_id,
      subject: {
        subjectType: req.body.subject_type,
        subjectId: req.body.subject_id,
        options: req.body.options.map(option => ({
          optionId: option.option_id,
          name: option.name,
          description: option.description,
          pros: option.pros || [],
          cons: option.cons || [],
          estimatedCost: option.estimated_cost,
          timelineMonths: option.timeline_months,
          riskLevel: option.risk_level || 'medium',
          strategicAlignment: option.strategic_alignment || 0.5
        }))
      },
      participants: req.body.participants.map(participant => ({
        participantId: participant.participant_id,
        participantName: participant.participant_name,
        participantRole: participant.participant_role,
        votingWeight: participant.voting_weight || 1.0,
        expertiseAreas: participant.expertise_areas || [],
        stakeholderType: participant.stakeholder_type || 'internal'
      })),
      consensusRules: {
        algorithm: req.body.consensus_algorithm || 'weighted_majority',
        threshold: req.body.consensus_threshold || 0.67,
        minimumParticipation: req.body.minimum_participation || 0.8,
        timeoutHours: req.body.timeout_hours || 168, // 7 days
        allowAbstention: req.body.allow_abstention !== false,
        requireJustification: req.body.require_justification !== false,
        anonymousVoting: req.body.anonymous_voting || false
      },
      evaluationCriteria: req.body.evaluation_criteria.map(criterion => ({
        criterion: criterion.criterion,
        weight: criterion.weight,
        description: criterion.description,
        scoringMethod: criterion.scoring_method || 'numeric'
      })),
      aiSupport: {
        enabled: req.body.ai_support_enabled !== false,
        analysisTypes: req.body.ai_analysis_types || ['impact_analysis', 'risk_assessment', 'stakeholder_analysis'],
        recommendationLevel: req.body.ai_recommendation_level || 'advisory'
      }
    });

    res.status(201).json({
      consensus_id: consensusProcess.consensusId,
      title: consensusProcess.title,
      status: consensusProcess.status,
      created_at: consensusProcess.createdAt,
      expires_at: consensusProcess.expiresAt,
      participants_count: consensusProcess.participantsCount,
      options_count: consensusProcess.optionsCount,
      consensus_progress: {
        votes_received: consensusProcess.consensusProgress.votesReceived,
        votes_required: consensusProcess.consensusProgress.votesRequired,
        participation_rate: consensusProcess.consensusProgress.participationRate,
        consensus_threshold: consensusProcess.consensusProgress.consensusThreshold,
        current_consensus: consensusProcess.consensusProgress.currentConsensus
      },
      voting_status: {
        voting_open: consensusProcess.votingStatus.votingOpen,
        voting_deadline: consensusProcess.votingStatus.votingDeadline,
        reminder_schedule: consensusProcess.votingStatus.reminderSchedule
      },
      ai_insights: {
        initial_analysis: consensusProcess.aiInsights?.initialAnalysis,
        recommended_approach: consensusProcess.aiInsights?.recommendedApproach,
        potential_challenges: consensusProcess.aiInsights?.potentialChallenges
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Real-time approval status with WebSocket support
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('subscribe_approval_updates', (data) => {
    const { requestId, userId } = data;
    
    // Verify user has permission to subscribe to this approval
    workflowService.verifyApprovalAccess(userId, requestId)
      .then(hasAccess => {
        if (hasAccess) {
          socket.join(`approval_${requestId}`);
          socket.emit('subscription_confirmed', { requestId });
        } else {
          socket.emit('subscription_denied', { requestId, reason: 'insufficient_permissions' });
        }
      });
  });

  socket.on('subscribe_consensus_updates', (data) => {
    const { consensusId, userId } = data;
    
    workflowService.verifyConsensusAccess(userId, consensusId)
      .then(hasAccess => {
        if (hasAccess) {
          socket.join(`consensus_${consensusId}`);
          socket.emit('subscription_confirmed', { consensusId });
        } else {
          socket.emit('subscription_denied', { consensusId, reason: 'insufficient_permissions' });
        }
      });
  });
});

// Set up real-time event broadcasting
confirmModule.on('approval.status.updated', (event) => {
  io.to(`approval_${event.requestId}`).emit('approval_status_updated', {
    request_id: event.requestId,
    status: event.status,
    current_step: event.currentStep,
    next_approvers: event.nextApprovers,
    updated_at: event.timestamp
  });
});

confirmModule.on('consensus.vote.received', (event) => {
  io.to(`consensus_${event.consensusId}`).emit('consensus_vote_received', {
    consensus_id: event.consensusId,
    participant_id: event.participantId,
    vote_option: event.voteOption,
    participation_rate: event.participationRate,
    consensus_status: event.consensusStatus,
    updated_at: event.timestamp
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Enterprise Approval Platform running on port ${PORT}`);
});
```

---

## 🔗 Cross-Module Integration Examples

### **1. Confirm + Context + Role + Plan Integration**

#### **Secure Project Approval System**
```typescript
import { ConfirmService } from '@mplp/confirm';
import { ContextService } from '@mplp/context';
import { RoleService } from '@mplp/role';
import { PlanService } from '@mplp/plan';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SecureProjectApprovalService {
  constructor(
    private readonly confirmService: ConfirmService,
    private readonly contextService: ContextService,
    private readonly roleService: RoleService,
    private readonly planService: PlanService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.setupCrossModuleEventHandlers();
  }

  async createSecureProjectApproval(request: SecureProjectApprovalRequest): Promise<SecureProjectApproval> {
    // 1. Create secure project context with approval requirements
    const projectContext = await this.contextService.createContext({
      name: `Project Approval: ${request.projectName}`,
      type: 'secure_project_approval',
      configuration: {
        maxParticipants: request.maxStakeholders || 20,
        securityLevel: request.securityLevel || 'high',
        approvalRequired: true,
        auditTrail: 'comprehensive',
        complianceFrameworks: request.complianceFrameworks || ['sox', 'iso27001']
      },
      metadata: {
        tags: ['project', 'approval', 'secure'],
        category: 'project-approval',
        priority: request.priority || 'high',
        securityMetadata: {
          classification: request.dataClassification || 'confidential',
          clearanceRequired: request.clearanceRequired,
          approvalChainRequired: true
        }
      },
      createdBy: request.requestedBy
    });

    // 2. Set up project-specific approval roles with security constraints
    const approvalRoles = await this.createProjectApprovalRoles({
      contextId: projectContext.contextId,
      projectType: request.projectType,
      budgetLevel: request.budget,
      securityLevel: request.securityLevel,
      complianceFrameworks: request.complianceFrameworks
    });

    // 3. Create intelligent project plan with approval checkpoints
    const projectPlan = await this.planService.generatePlan({
      name: `${request.projectName} - Approval Plan`,
      contextId: projectContext.contextId,
      objectives: [
        {
          objective: 'Secure Project Approval',
          description: 'Obtain all required approvals for project initiation',
          priority: 'critical',
          approvalRequired: true,
          securityConstraints: {
            requiredClearance: request.clearanceRequired,
            approvalChain: this.buildApprovalChain(request),
            auditRequired: true
          }
        },
        ...request.projectObjectives.map(obj => ({
          ...obj,
          approvalRequired: obj.requiresApproval || false,
          securityConstraints: {
            dataHandling: this.getDataHandlingRules(request.dataClassification),
            accessControl: 'role_based',
            auditTrail: 'required'
          }
        }))
      ],
      planningStrategy: {
        algorithm: 'secure_approval_planning',
        optimizationGoals: [
          'minimize_approval_time',
          'maximize_security_compliance',
          'ensure_stakeholder_alignment',
          'optimize_resource_allocation'
        ],
        approvalConstraints: {
          multiLevelApprovals: true,
          parallelApprovals: request.allowParallelApprovals || false,
          escalationEnabled: true,
          complianceValidation: true
        }
      },
      executionPreferences: {
        approvalMode: 'strict',
        auditLevel: 'comprehensive',
        securityChecking: 'continuous',
        stakeholderNotifications: 'real_time'
      }
    });

    // 4. Create comprehensive approval workflow
    const approvalWorkflow = await this.confirmService.createApprovalRequest({
      requestType: 'secure_project_approval',
      title: `Project Approval: ${request.projectName}`,
      description: `Comprehensive approval process for ${request.projectType} project with ${request.securityLevel} security requirements`,
      priority: request.priority || 'high',
      urgency: request.urgency || 'normal',
      requestedBy: request.requestedBy,
      contextId: projectContext.contextId,
      subject: {
        subjectType: 'secure_project',
        subjectId: request.projectId,
        projectName: request.projectName,
        projectType: request.projectType,
        budget: request.budget,
        currency: request.currency || 'USD',
        duration: request.estimatedDuration,
        securityLevel: request.securityLevel,
        dataClassification: request.dataClassification,
        complianceRequirements: request.complianceFrameworks
      },
      approvalCriteria: {
        requiredApprovals: this.calculateRequiredApprovals(request),
        approvalThreshold: 'unanimous', // Strict for secure projects
        escalationRules: {
          timeoutHours: request.approvalTimeoutHours || 72,
          escalationLevels: ['project_manager', 'department_head', 'security_officer', 'executive_team'],
          autoEscalate: true,
          securityEscalation: true
        },
        securityConstraints: {
          clearanceValidation: true,
          backgroundCheckRequired: request.securityLevel === 'critical',
          multiFactorApproval: true,
          auditTrailRequired: true
        }
      },
      workflowDefinition: {
        workflowId: 'wf-secure-project-approval',
        workflowName: 'Secure Project Approval Workflow',
        steps: [
          {
            stepName: 'Security Assessment',
            stepType: 'automated_security_check',
            requirements: {
              required: true,
              timeoutHours: 2,
              securityValidation: true
            },
            securityChecks: [
              'data_classification_validation',
              'clearance_requirement_check',
              'compliance_framework_validation',
              'risk_assessment'
            ]
          },
          {
            stepName: 'Technical Review',
            stepType: 'human_approval',
            approverSelection: {
              method: 'role_based',
              role: 'technical_lead',
              requireCapabilities: ['technical_architecture', 'security_design'],
              securityClearance: request.clearanceRequired
            },
            requirements: {
              required: true,
              timeoutHours: 24,
              parallelExecution: false
            }
          },
          {
            stepName: 'Financial Approval',
            stepType: 'human_approval',
            approverSelection: {
              method: 'role_based',
              role: 'finance_manager',
              requireCapabilities: ['budget_management', 'financial_analysis'],
              budgetAuthority: request.budget
            },
            requirements: {
              required: true,
              timeoutHours: 48,
              parallelExecution: true
            }
          },
          {
            stepName: 'Security Officer Review',
            stepType: 'human_approval',
            approverSelection: {
              method: 'role_based',
              role: 'security_officer',
              requireCapabilities: ['security_assessment', 'compliance_validation'],
              securityClearance: 'top_secret'
            },
            requirements: {
              required: true,
              timeoutHours: 24,
              conditions: ['security_level >= high']
            }
          },
          {
            stepName: 'Executive Approval',
            stepType: 'human_approval',
            approverSelection: {
              method: 'role_based',
              role: 'executive_team',
              minimumLevel: 'director',
              requireCapabilities: ['strategic_decision_making']
            },
            requirements: {
              required: true,
              timeoutHours: 72,
              conditions: ['budget > 1000000 OR security_level == critical']
            }
          },
          {
            stepName: 'Compliance Validation',
            stepType: 'automated_compliance_check',
            requirements: {
              required: true,
              timeoutHours: 4,
              complianceFrameworks: request.complianceFrameworks
            },
            complianceChecks: [
              'sox_compliance',
              'gdpr_compliance',
              'iso27001_compliance',
              'industry_specific_compliance'
            ]
          }
        ]
      },
      attachments: request.attachments || [],
      metadata: {
        projectType: request.projectType,
        securityLevel: request.securityLevel,
        dataClassification: request.dataClassification,
        complianceFrameworks: request.complianceFrameworks,
        businessJustification: request.businessJustification,
        strategicAlignment: request.strategicAlignment,
        riskAssessment: request.riskAssessment,
        stakeholderImpact: request.stakeholderImpact
      }
    });

    // 5. Set up comprehensive monitoring and notifications
    const monitoringSetup = await this.setupSecureProjectMonitoring({
      contextId: projectContext.contextId,
      planId: projectPlan.planId,
      approvalRequestId: approvalWorkflow.requestId,
      securityLevel: request.securityLevel,
      monitoringRules: {
        approvalProgressTracking: true,
        securityEventMonitoring: true,
        complianceViolationDetection: true,
        stakeholderNotifications: true,
        escalationAlerts: true
      }
    });

    const secureProjectApproval: SecureProjectApproval = {
      approvalId: this.generateApprovalId(),
      projectName: request.projectName,
      projectType: request.projectType,
      contextId: projectContext.contextId,
      planId: projectPlan.planId,
      approvalRequestId: approvalWorkflow.requestId,
      securityLevel: request.securityLevel,
      dataClassification: request.dataClassification,
      approvalStatus: approvalWorkflow.status,
      approvalProgress: {
        currentStep: approvalWorkflow.workflowExecution.currentStep,
        completedSteps: 0,
        totalSteps: approvalWorkflow.approvalRoute.totalSteps,
        estimatedCompletion: approvalWorkflow.workflowExecution.estimatedCompletion
      },
      securityFeatures: {
        clearanceValidation: true,
        multiFactorApproval: true,
        auditTrail: 'comprehensive',
        complianceMonitoring: true,
        securityEventTracking: true
      },
      stakeholders: {
        approvers: approvalWorkflow.approvalRoute.currentApprovers,
        watchers: request.stakeholders || [],
        securityOfficers: await this.getSecurityOfficers(request.securityLevel)
      },
      complianceStatus: {
        frameworks: request.complianceFrameworks,
        status: 'pending_validation',
        lastCheck: new Date(),
        nextCheck: this.calculateNextComplianceCheck(request.complianceFrameworks)
      },
      createdAt: new Date(),
      requestedBy: request.requestedBy
    };

    // 6. Emit secure project approval creation event
    await this.eventEmitter.emitAsync('secure.project.approval.created', {
      approvalId: secureProjectApproval.approvalId,
      projectName: request.projectName,
      contextId: projectContext.contextId,
      planId: projectPlan.planId,
      approvalRequestId: approvalWorkflow.requestId,
      securityLevel: request.securityLevel,
      requiredApprovals: approvalWorkflow.approvalRoute.totalSteps,
      estimatedCompletion: approvalWorkflow.workflowExecution.estimatedCompletion,
      createdBy: request.requestedBy,
      timestamp: new Date().toISOString()
    });

    return secureProjectApproval;
  }

  private setupCrossModuleEventHandlers(): void {
    // Handle context security events
    this.eventEmitter.on('context.security.violation', async (event) => {
      await this.handleContextSecurityViolation(event);
    });

    // Handle role permission changes
    this.eventEmitter.on('role.permission.changed', async (event) => {
      await this.handleRolePermissionChange(event);
    });

    // Handle plan execution events
    this.eventEmitter.on('plan.execution.milestone', async (event) => {
      await this.handlePlanExecutionMilestone(event);
    });

    // Handle approval workflow events
    this.eventEmitter.on('confirm.approval.decision', async (event) => {
      await this.handleApprovalDecision(event);
    });
  }
}
```

---

## 🔗 Related Documentation

- [Confirm Module Overview](./README.md) - Module overview and architecture
- [API Reference](./api-reference.md) - Complete API documentation
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization

---

**Integration Examples Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Examples**: Enterprise Ready  

**⚠️ Alpha Notice**: These integration examples showcase enterprise-grade workflow capabilities in Alpha release. Additional AI-powered decision support examples and advanced consensus integration patterns will be added based on community feedback and real-world usage in Beta release.
