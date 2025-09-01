/**
 * Confirm模块测试数据工厂
 * 
 * @description 提供标准化的测试数据创建方法，确保测试数据与实际实体结构一致
 * @version 1.0.0
 * @layer 测试层 - 工厂
 */

import {
  UUID,
  ConfirmationType,
  ConfirmationStatus,
  Priority,
  WorkflowType,
  StepStatus,
  DecisionOutcome,
  RiskLevel,
  ImpactLevel,
  BusinessImpact,
  TechnicalImpact,
  NotificationEvent,
  NotificationChannel,
  AuditEventType,
  HealthStatus,
  CheckStatus
} from '../../../src/modules/confirm/types';

/**
 * 创建标准的Confirm实体测试数据
 */
export function createMockConfirmEntityData(overrides: Partial<any> = {}): any {
  const defaultData = {
    protocolVersion: '1.0.0',
    timestamp: new Date('2025-08-26T10:00:00Z'),
    confirmId: 'confirm-test-001' as UUID,
    contextId: 'context-test-001' as UUID,
    planId: 'plan-test-001' as UUID,
    confirmationType: 'approval' as ConfirmationType,
    status: 'pending' as ConfirmationStatus,
    priority: 'high' as Priority,
    requester: {
      userId: 'user-001' as UUID,
      role: 'developer',
      department: 'engineering',
      requestReason: 'Deploy to production environment'
    },
    subject: {
      title: 'Production Deployment Approval',
      description: 'Request approval for deploying version 1.2.0 to production',
      impactAssessment: {
        scope: 'project' as const,
        affectedSystems: ['api-gateway', 'user-service'],
        affectedUsers: ['end-users', 'admin-users'],
        businessImpact: {
          revenue: 'positive',
          customerSatisfaction: 'positive',
          operationalEfficiency: 'neutral',
          riskMitigation: 'positive'
        } as BusinessImpact,
        technicalImpact: {
          performance: 'improved',
          scalability: 'improved', 
          maintainability: 'improved',
          security: 'enhanced',
          compatibility: 'maintained'
        } as TechnicalImpact
      },
      attachments: [{
        fileId: 'file-001',
        filename: 'deployment-plan.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
        description: 'Detailed deployment plan'
      }]
    },
    riskAssessment: {
      overallRiskLevel: 'medium' as RiskLevel,
      riskFactors: [{
        factor: 'Database Migration',
        description: 'Schema changes required',
        probability: 0.3,
        impact: 'medium' as ImpactLevel,
        mitigation: 'Rollback plan prepared'
      }],
      complianceRequirements: [{
        regulation: 'SOX',
        requirement: 'Change approval documentation',
        complianceStatus: 'compliant' as const,
        evidence: 'Approval workflow completed'
      }]
    },
    approvalWorkflow: {
      workflowType: 'sequential' as WorkflowType,
      steps: [{
        stepId: 'step-001' as UUID,
        stepOrder: 1,
        approver: {
          userId: 'tech-lead-001' as UUID,
          role: 'tech-lead',
          department: 'engineering'
        },
        status: 'pending' as StepStatus,
        requiredApprovals: 1,
        currentApprovals: 0,
        deadline: new Date('2025-08-27T18:00:00Z'),
        escalationRules: [{
          condition: 'overdue',
          action: 'escalate_to_manager',
          targetRole: 'engineering-manager'
        }]
      }],
      autoApprovalRules: [{
        condition: 'low_risk_and_automated_tests_pass',
        action: 'auto_approve',
        requiredConditions: ['risk_level_low', 'all_tests_pass']
      }]
    },
    approvals: [],
    auditTrail: [{
      eventId: 'event-001' as UUID,
      timestamp: new Date('2025-08-26T10:00:00Z'),
      userId: 'user-001' as UUID,
      action: 'created',
      details: 'Confirm request created',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Test Browser'
    }],
    notifications: {
      channels: ['email', 'slack'],
      recipients: [{
        userId: 'tech-lead-001' as UUID,
        role: 'approver',
        notificationPreferences: {
          email: true,
          slack: true,
          sms: false
        }
      }],
      templates: {
        pending: 'approval-request-template',
        approved: 'approval-granted-template',
        rejected: 'approval-rejected-template'
      }
    },
    integrations: {
      externalSystems: [{
        systemId: 'jira-001',
        systemName: 'JIRA',
        referenceId: 'PROJ-1234',
        syncStatus: 'synced',
        lastSyncAt: new Date('2025-08-26T10:00:00Z')
      }],
      webhooks: [{
        url: 'https://api.example.com/webhooks/confirm',
        events: ['approved', 'rejected'],
        secret: 'webhook-secret-key'
      }]
    },

    // Schema必需字段 - 添加到createMockConfirmEntityData
    notificationSettings: {
      notifyOnEvents: ['created', 'approved', 'rejected'] as NotificationEvent[],
      notificationChannels: ['email', 'in_app'] as NotificationChannel[],
      stakeholders: [{
        userId: 'stakeholder-001',
        role: 'manager',
        notificationPreference: 'important' as const
      }]
    },

    auditTrail: {
      enabled: true,
      retentionDays: 90,
      auditEvents: [{
        eventId: 'event-001' as UUID,
        eventType: 'created' as any,
        timestamp: new Date('2025-08-26T10:00:00Z'),
        userId: 'user-001' as UUID,
        userRole: 'admin',
        action: 'created',
        details: 'Confirm request created',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser'
      }]
    },

    monitoringIntegration: {
      enabled: true,
      supportedProviders: ['prometheus', 'grafana'] as const
    },

    performanceMetrics: {
      enabled: true,
      collectionIntervalSeconds: 60,
      healthStatus: {
        status: 'healthy' as HealthStatus,
        lastCheck: new Date('2025-08-26T10:00:00Z')
      }
    },

    versionHistory: {
      enabled: true,
      maxVersions: 10
    },

    searchMetadata: {
      enabled: true,
      indexingStrategy: 'real_time' as const,
      searchableFields: ['title', 'description']
    },

    aiIntegrationInterface: {
      enabled: true,
      supportedProviders: ['openai', 'anthropic'] as AIProvider[],
      integrationEndpoints: {
        decisionSupportApi: 'https://api.example.com/ai/decision-support',
        riskAnalysisApi: 'https://api.example.com/ai/risk-analysis',
        complianceCheckApi: 'https://api.example.com/ai/compliance-check'
      },
      authenticationConfig: {
        type: 'api_key' as AuthenticationType,
        credentials: {
          apiKey: 'test-api-key',
          endpoint: 'https://api.example.com'
        }
      },
      fallbackBehavior: 'manual_review' as FallbackBehavior
    },

    decisionSupportInterface: {
      enabled: true,
      supportedDecisionTypes: ['approval', 'risk_assessment', 'compliance_check'],
      decisionEngines: [{
        engineId: 'rule-engine-001',
        engineType: 'rule_based',
        priority: 1,
        configuration: {
          rules: ['auto_approve_low_risk', 'escalate_high_risk'],
          thresholds: {
            riskLevel: 0.7,
            confidenceLevel: 0.8
          }
        }
      }],
      humanOverride: {
        enabled: true,
        requiredRole: 'senior_approver',
        auditRequired: true
      },
      fallbackStrategy: {
        whenEnginesUnavailable: 'manual_review',
        whenEnginesDisagree: 'escalate_to_human'
      }
    },

    eventIntegration: {
      enabled: true,
      supportedEventTypes: ['status_change', 'approval_granted', 'approval_denied'],
      eventHandlers: [{
        handlerId: 'webhook-handler-001',
        handlerType: 'webhook',
        configuration: {
          url: 'https://api.example.com/webhooks/confirm',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        },
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          initialDelayMs: 1000
        }
      }],
      eventFilters: {
        includeEvents: ['approval_granted', 'approval_denied'],
        excludeEvents: [],
        conditions: {
          priority: ['high', 'critical'],
          status: ['approved', 'rejected']
        }
      }
    }
  };

  return { ...defaultData, ...overrides };
}

/**
 * 创建简化的Confirm实体数据（用于Mapper测试）
 */
export function createSimpleMockConfirmEntityData(overrides: Partial<any> = {}): any {
  const defaultData = {
    protocolVersion: '1.0.0',
    timestamp: new Date('2025-08-26T10:00:00Z'),
    confirmId: 'confirm-test-001' as UUID,
    contextId: 'context-test-001' as UUID,
    planId: 'plan-test-001' as UUID,
    confirmationType: 'approval' as ConfirmationType,
    status: 'pending' as ConfirmationStatus,
    priority: 'high' as Priority,
    requester: {
      userId: 'user-001' as UUID,
      role: 'developer',
      department: 'engineering',
      requestReason: 'Deploy to production'
    },
    subject: {
      title: 'Production Deployment',
      description: 'Deploy version 1.2.0',
      impactAssessment: {
        scope: 'project' as const,
        affectedSystems: ['api-gateway'],
        affectedUsers: ['end-users'],
        businessImpact: {
          revenue: 'positive',
          customerSatisfaction: 'positive',
          operationalEfficiency: 'neutral',
          riskMitigation: 'positive'
        } as BusinessImpact,
        technicalImpact: {
          performance: 'improved',
          scalability: 'improved',
          maintainability: 'improved',
          security: 'enhanced',
          compatibility: 'maintained'
        } as TechnicalImpact
      }
    },
    riskAssessment: {
      overallRiskLevel: 'medium' as RiskLevel,
      riskFactors: []
    },
    approvalWorkflow: {
      workflowType: 'sequential' as WorkflowType,
      steps: []
    },
    approvals: [],

    // 通知设置 (Schema必需字段)
    notificationSettings: {
      notifyOnEvents: ['created', 'approved', 'rejected'] as NotificationEvent[],
      notificationChannels: ['email', 'in_app'] as NotificationChannel[],
      stakeholders: [{
        userId: 'stakeholder-001',
        role: 'manager',
        notificationPreference: 'important' as const
      }]
    },

    // 审计追踪 (Schema必需字段)
    auditTrail: {
      enabled: true,
      retentionDays: 90,
      auditEvents: [{
        eventId: 'event-001' as UUID,
        eventType: 'created' as any,
        timestamp: new Date('2025-08-26T10:00:00Z'),
        userId: 'user-001' as UUID,
        userRole: 'admin',
        action: 'created',
        details: 'Confirm request created',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser'
      }]
    },

    // 监控集成 (Schema必需字段)
    monitoringIntegration: {
      enabled: true,
      supportedProviders: ['prometheus', 'grafana'] as const
    },

    // 性能指标 (Schema必需字段)
    performanceMetrics: {
      enabled: true,
      collectionIntervalSeconds: 60,
      healthStatus: {
        status: 'healthy' as HealthStatus,
        lastCheck: new Date('2025-08-26T10:00:00Z')
      }
    },

    // 版本历史 (Schema必需字段)
    versionHistory: {
      enabled: true,
      maxVersions: 10
    },

    // 搜索元数据 (Schema必需字段)
    searchMetadata: {
      enabled: true,
      indexingStrategy: 'real_time' as const,
      searchableFields: ['title', 'description']
    },

    // AI集成接口 (Schema必需字段)
    aiIntegrationInterface: {
      enabled: true,
      supportedProviders: ['openai', 'anthropic'] as AIProvider[],
      integrationEndpoints: {
        decisionSupportApi: 'https://api.example.com/ai/decision-support',
        riskAnalysisApi: 'https://api.example.com/ai/risk-analysis',
        complianceCheckApi: 'https://api.example.com/ai/compliance-check'
      },
      authenticationConfig: {
        type: 'api_key' as AuthenticationType,
        credentials: {
          apiKey: 'test-api-key',
          endpoint: 'https://api.example.com'
        }
      },
      fallbackBehavior: 'manual_review' as FallbackBehavior
    },

    // 决策支持接口 (Schema必需字段)
    decisionSupportInterface: {
      enabled: true,
      supportedDecisionTypes: ['approval', 'risk_assessment', 'compliance_check'],
      decisionEngines: [{
        engineId: 'rule-engine-001',
        engineType: 'rule_based',
        priority: 1,
        configuration: {
          rules: ['auto_approve_low_risk', 'escalate_high_risk'],
          thresholds: {
            riskLevel: 0.7,
            confidenceLevel: 0.8
          }
        }
      }],
      humanOverride: {
        enabled: true,
        requiredRole: 'senior_approver',
        auditRequired: true
      },
      fallbackStrategy: {
        whenEnginesUnavailable: 'manual_review',
        whenEnginesDisagree: 'escalate_to_human'
      }
    },

    // 事件集成 (Schema必需字段)
    eventIntegration: {
      enabled: true,
      supportedEventTypes: ['status_change', 'approval_granted', 'approval_denied'],
      eventHandlers: [{
        handlerId: 'webhook-handler-001',
        handlerType: 'webhook',
        configuration: {
          url: 'https://api.example.com/webhooks/confirm',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        },
        retryPolicy: {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          initialDelayMs: 1000
        }
      }],
      eventFilters: {
        includeEvents: ['approval_granted', 'approval_denied'],
        excludeEvents: [],
        conditions: {
          priority: ['high', 'critical'],
          status: ['approved', 'rejected']
        }
      }
    },

    notifications: {
      channels: ['email'],
      recipients: [],
      templates: {
        pending: 'approval-request-template',
        approved: 'approval-granted-template',
        rejected: 'approval-rejected-template'
      }
    },
    integrations: {
      externalSystems: [],
      webhooks: []
    }
  };

  return { ...defaultData, ...overrides };
}

/**
 * 创建Schema格式的测试数据
 */
export function createMockConfirmSchemaData(overrides: Partial<any> = {}): any {
  const defaultData = {
    protocol_version: '1.0.0',
    timestamp: '2025-08-26T10:00:00.000Z',
    confirm_id: '550e8400-e29b-41d4-a716-446655440001',
    context_id: '550e8400-e29b-41d4-a716-446655440002',
    plan_id: '550e8400-e29b-41d4-a716-446655440003',
    confirmation_type: 'approval',
    status: 'pending',
    priority: 'high',
    requester: {
      user_id: 'user-001',
      role: 'developer',
      department: 'engineering',
      request_reason: 'Deploy to production'
    },
    subject: {
      title: 'Production Deployment',
      description: 'Deploy version 1.2.0',
      impact_assessment: {
        scope: 'project',
        affected_systems: ['api-gateway'],
        affected_users: ['end-users'],
        business_impact: {
          revenue: 'positive',
          customer_satisfaction: 'positive',
          operational_efficiency: 'neutral',
          risk_mitigation: 'positive'
        },
        technical_impact: {
          performance: 'improved',
          scalability: 'improved',
          maintainability: 'improved',
          security: 'enhanced',
          compatibility: 'maintained'
        }
      }
    },
    risk_assessment: {
      overall_risk_level: 'medium',
      risk_factors: []
    },
    approval_workflow: {
      workflow_type: 'sequential',
      steps: []
    },
    approvals: [],
    audit_trail: {
      enabled: true,
      retention_days: 90,
      audit_events: []
    },
    notifications: {
      channels: ['email'],
      recipients: [],
      templates: {
        pending: 'approval-request-template',
        approved: 'approval-granted-template',
        rejected: 'approval-rejected-template'
      }
    },
    integrations: {
      external_systems: [],
      webhooks: []
    },
    // Schema必需字段
    notification_settings: {
      notify_on_events: ['created', 'approved', 'rejected'],
      notification_channels: ['email', 'in_app'],
      stakeholders: [{
        user_id: 'stakeholder-001',
        role: 'manager',
        notification_preference: 'important'
      }]
    },
    monitoring_integration: {
      enabled: true,
      supported_providers: ['prometheus', 'grafana']
    },
    performance_metrics: {
      enabled: true,
      collection_interval_seconds: 60,
      health_status: {
        status: 'healthy',
        last_check: '2025-08-26T10:00:00.000Z'
      }
    },
    version_history: {
      enabled: true,
      max_versions: 10
    },
    search_metadata: {
      enabled: true,
      indexing_strategy: 'real_time',
      searchable_fields: ['title', 'description']
    },
    ai_integration_interface: {
      enabled: true,
      supported_providers: ['openai', 'anthropic'],
      integration_endpoints: {
        decision_support_api: 'https://api.example.com/ai/decision-support',
        risk_analysis_api: 'https://api.example.com/ai/risk-analysis',
        compliance_check_api: 'https://api.example.com/ai/compliance-check'
      },
      authentication_config: {
        type: 'api_key',
        credentials: {
          api_key: 'test-api-key',
          endpoint: 'https://api.example.com'
        }
      },
      fallback_behavior: 'manual_review'
    },
    decision_support_interface: {
      enabled: true,
      supported_decision_types: ['approval', 'risk_assessment', 'compliance_check'],
      decision_engines: [{
        engine_id: 'rule-engine-001',
        engine_type: 'rule_based',
        priority: 1,
        configuration: {
          rules: ['auto_approve_low_risk', 'escalate_high_risk'],
          thresholds: {
            risk_level: 0.7,
            confidence_level: 0.8
          }
        }
      }],
      human_override: {
        enabled: true,
        required_role: 'senior_approver',
        audit_required: true
      },
      fallback_strategy: {
        when_engines_unavailable: 'manual_review',
        when_engines_disagree: 'escalate_to_human'
      }
    },
    event_integration: {
      enabled: true,
      supported_event_types: ['status_change', 'approval_granted', 'approval_denied'],
      event_handlers: [{
        handler_id: 'webhook-handler-001',
        handler_type: 'webhook',
        configuration: {
          url: 'https://api.example.com/webhooks/confirm',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }
        },
        retry_policy: {
          max_retries: 3,
          backoff_strategy: 'exponential',
          initial_delay_ms: 1000
        }
      }],
      event_filters: {
        include_events: ['approval_granted', 'approval_denied'],
        exclude_events: [],
        conditions: {
          priority: ['high', 'critical'],
          status: ['approved', 'rejected']
        }
      }
    }
  };

  return { ...defaultData, ...overrides };
}

/**
 * 创建CreateConfirmRequest测试数据
 */
export function createMockCreateConfirmRequest(overrides: Partial<any> = {}): any {
  const defaultData = {
    contextId: 'context-test-001' as UUID,
    confirmationType: 'approval' as ConfirmationType,
    priority: 'high' as Priority,
    requester: {
      userId: 'user-001' as UUID,
      role: 'developer',
      requestReason: 'Deploy to production'
    },
    subject: {
      title: 'Production Deployment',
      description: 'Deploy version 1.2.0',
      impactAssessment: {
        scope: 'project' as const,
        businessImpact: {
          revenue: 'positive',
          customerSatisfaction: 'positive',
          operationalEfficiency: 'neutral',
          riskMitigation: 'positive'
        } as BusinessImpact,
        technicalImpact: {
          performance: 'improved',
          scalability: 'improved',
          maintainability: 'improved',
          security: 'enhanced',
          compatibility: 'maintained'
        } as TechnicalImpact
      }
    },
    riskAssessment: {
      overallRiskLevel: 'medium' as RiskLevel,
      riskFactors: []
    },
    approvalWorkflow: {
      workflowType: 'sequential' as WorkflowType,
      steps: [{
        stepId: 'step-001' as UUID,
        stepOrder: 1,
        approver: {
          userId: 'approver-001' as UUID,
          role: 'tech-lead',
          department: 'engineering'
        },
        status: 'pending' as StepStatus,
        requiredApprovals: 1,
        currentApprovals: 0,
        deadline: new Date('2025-08-27T18:00:00Z'),
        escalationRules: []
      }],
      autoApprovalRules: []
    }
  };

  return { ...defaultData, ...overrides };
}
