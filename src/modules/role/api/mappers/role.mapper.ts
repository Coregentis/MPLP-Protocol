/**
 * MPLP Role Module - Schema-TypeScript Mapper
 * @description 基于实际Schema的完整双重命名约定映射器 - 企业级RBAC安全中心
 * @version 1.0.0
 * @module RoleMapper
 */

import {
  UUID,
  Priority,
  RoleType,
  RoleStatus,
  AgentType,
  AgentStatus,
  ExpertiseLevel,
  CommunicationStyle,
  ConflictResolutionStrategy,
  GrantType,
  InheritanceType,
  MergeStrategy,
  ConflictResolution,
  SecurityClearance,
  SeniorityLevel,
  HealthStatus,
  CheckStatus,
  Agent
} from '../../types';

import { randomUUID } from 'crypto';

// ===== SCHEMA INTERFACES (snake_case) =====

/**
 * Role Schema Interface - 基于mplp-role.json
 * 所有字段使用snake_case命名约定
 */
export interface RoleSchema {
  // 基础协议字段
  protocol_version: string;
  timestamp: string;
  role_id: UUID;
  context_id: UUID;

  // 角色核心字段
  name: string;
  display_name?: string;
  description?: string;
  role_type: RoleType;
  status: RoleStatus;

  // 范围配置
  scope?: {
    level: 'global' | 'organization' | 'project' | 'team' | 'individual';
    context_ids?: UUID[];
    plan_ids?: UUID[];
    resource_constraints?: {
      max_contexts?: number;
      max_plans?: number;
      allowed_resource_types?: string[];
    };
  };

  // 权限管理
  permissions: Array<{
    permission_id: UUID;
    resource_type: 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';
    resource_id: UUID | '*';
    actions: Array<'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin'>;
    conditions?: {
      time_based?: {
        start_time?: string;
        end_time?: string;
        timezone?: string;
        days_of_week?: number[];
      };
      location_based?: {
        allowed_ip_ranges?: string[];
        geo_restrictions?: string[];
      };
      context_based?: {
        required_attributes?: Record<string, unknown>;
        forbidden_attributes?: Record<string, unknown>;
      };
      approval_required?: {
        for_actions?: string[];
        approval_threshold?: number;
        approver_roles?: string[];
      };
    };
    grant_type: GrantType;
    expiry?: string;
  }>;

  // 继承机制
  inheritance?: {
    parent_roles?: Array<{
      role_id: UUID;
      inheritance_type: InheritanceType;
      excluded_permissions?: UUID[];
      conditions?: Record<string, unknown>;
    }>;
    child_roles?: Array<{
      role_id: UUID;
      delegation_level: number;
      can_further_delegate: boolean;
    }>;
    inheritance_rules?: {
      merge_strategy: MergeStrategy;
      conflict_resolution: ConflictResolution;
      max_inheritance_depth?: number;
    };
  };

  // 委托机制
  delegation?: {
    can_delegate: boolean;
    delegatable_permissions?: UUID[];
    delegation_constraints?: {
      max_delegation_depth?: number;
      time_limit?: number;
      require_approval?: boolean;
      revocable?: boolean;
    };
    active_delegations?: Array<{
      delegation_id: UUID;
      delegated_to: string;
      permissions: UUID[];
      start_time: string;
      end_time?: string;
      status: 'active' | 'suspended' | 'revoked' | 'expired';
    }>;
  };

  // 属性管理
  attributes?: {
    security_clearance?: SecurityClearance;
    department?: string;
    seniority_level?: SeniorityLevel;
    certification_requirements?: Array<{
      certification: string;
      level: string;
      expiry?: string;
      issuer?: string;
    }>;
    custom_attributes?: Record<string, string | number | boolean>;
  };

  // 验证规则
  validation_rules?: {
    assignment_rules?: Array<{
      rule_id: UUID;
      condition: string;
      action: 'allow' | 'deny' | 'require_approval';
      message?: string;
    }>;
    separation_of_duties?: Array<{
      conflicting_roles: UUID[];
      severity: 'warning' | 'error' | 'critical';
      exception_approval_required?: boolean;
    }>;
  };

  // 审计设置
  audit_settings?: {
    audit_enabled: boolean;
    audit_events?: Array<'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed'>;
    retention_period?: string;
    compliance_frameworks?: string[];
  };

  // Agent管理
  agents?: Array<{
    agent_id: UUID;
    name: string;
    type: AgentType;
    domain: string;
    status: AgentStatus;
    capabilities: {
      core: {
        critical_thinking: boolean;
        scenario_validation: boolean;
        ddsc_dialog: boolean;
        mplp_protocols: string[];
      };
      specialist: {
        domain: string;
        expertise_level: ExpertiseLevel;
        knowledge_areas: string[];
        tools?: string[];
      };
      collaboration: {
        communication_style: CommunicationStyle;
        conflict_resolution: ConflictResolutionStrategy;
        decision_weight: number;
        trust_level: number;
      };
      learning: {
        experience_accumulation: boolean;
        pattern_recognition: boolean;
        adaptation_mechanism: boolean;
        performance_optimization: boolean;
      };
    };
    configuration?: {
      basic: {
        max_concurrent_tasks: number;
        timeout_ms: number;
        retry_policy?: {
          max_retries: number;
          backoff_ms: number;
          backoff_multiplier?: number;
          max_backoff_ms?: number;
        };
        priority_level?: Priority;
      };
      communication: {
        protocols: string[];
        message_format: string;
        encryption_enabled?: boolean;
        compression_enabled?: boolean;
      };
      security: {
        authentication_required: boolean;
        authorization_level?: string;
        audit_logging: boolean;
        data_encryption?: boolean;
      };
    };
    performance_metrics?: {
      response_time_ms?: number;
      throughput_ops_per_sec?: number;
      success_rate?: number;
      error_rate?: number;
      last_updated?: string;
    };
    created_at: string;
    updated_at?: string;
    created_by: string;
  }>;

  // Agent管理配置
  agent_management?: {
    max_agents?: number;
    auto_scaling?: boolean;
    load_balancing?: boolean;
    health_check_interval_ms?: number;
    default_agent_config?: Record<string, unknown>;
  };

  // 团队配置
  team_configuration?: {
    max_team_size?: number;
    collaboration_rules?: Array<{
      rule_name: string;
      rule_type: 'communication' | 'decision' | 'conflict_resolution' | 'resource_sharing';
      rule_config?: Record<string, unknown>;
    }>;
    decision_mechanism?: {
      type: 'consensus' | 'majority' | 'weighted' | 'authority';
      threshold?: number;
      timeout_ms?: number;
    };
  };

  // 性能监控
  performance_metrics: {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: {
      role_assignment_latency_ms?: number;
      permission_check_latency_ms?: number;
      role_security_score?: number;
      permission_accuracy_percent?: number;
      role_management_efficiency_score?: number;
      active_roles_count?: number;
      role_operations_per_second?: number;
      role_memory_usage_mb?: number;
      average_role_complexity_score?: number;
    };
    health_status?: {
      status: HealthStatus;
      last_check?: string;
      checks?: Array<{
        check_name: string;
        status: CheckStatus;
        message?: string;
        duration_ms?: number;
      }>;
    };
    alerting?: {
      enabled?: boolean;
      thresholds?: {
        max_role_assignment_latency_ms?: number;
        max_permission_check_latency_ms?: number;
        min_role_security_score?: number;
        min_permission_accuracy_percent?: number;
        min_role_management_efficiency_score?: number;
      };
      notification_channels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
    };
  };

  // 监控集成
  monitoring_integration: {
    enabled: boolean;
    supported_providers: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
    integration_endpoints?: {
      metrics_api?: string;
      role_access_api?: string;
      permission_metrics_api?: string;
      security_events_api?: string;
    };
    role_metrics?: {
      track_role_usage?: boolean;
      track_permission_checks?: boolean;
      track_access_patterns?: boolean;
      track_security_events?: boolean;
    };
    export_formats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
  };

  // 版本历史
  version_history: {
    enabled: boolean;
    max_versions: number;
    versions?: Array<{
      version_id: UUID;
      version_number: number;
      created_at: string;
      created_by: string;
      change_summary?: string;
      role_snapshot?: Record<string, unknown>;
      change_type: 'created' | 'updated' | 'permission_changed' | 'status_changed' | 'deleted';
    }>;
    auto_versioning?: {
      enabled?: boolean;
      version_on_permission_change?: boolean;
      version_on_status_change?: boolean;
    };
  };

  // 搜索元数据
  search_metadata: {
    enabled: boolean;
    indexing_strategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
    searchable_fields?: Array<'role_id' | 'name' | 'role_type' | 'permissions' | 'agents' | 'metadata' | 'description'>;
    search_indexes?: Array<{
      index_id: string;
      index_name: string;
      fields: string[];
      index_type: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
      created_at?: string;
      last_updated?: string;
    }>;
    auto_indexing?: {
      enabled?: boolean;
      index_new_roles?: boolean;
      reindex_interval_hours?: number;
    };
  };

  // 角色操作
  role_operation: 'create' | 'assign' | 'revoke' | 'update' | 'delete';

  // 事件集成
  event_integration: {
    enabled: boolean;
    event_bus_connection?: {
      bus_type?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
      connection_string?: string;
      topic_prefix?: string;
      consumer_group?: string;
    };
    published_events?: Array<'role_created' | 'role_updated' | 'role_deleted' | 'permission_granted' | 'permission_revoked' | 'access_granted' | 'access_denied'>;
    subscribed_events?: Array<'context_updated' | 'plan_executed' | 'confirm_approved' | 'security_alert'>;
    event_routing?: {
      routing_rules?: Array<{
        rule_id?: string;
        condition?: string;
        target_topic?: string;
        enabled?: boolean;
      }>;
    };
  };

  // 审计跟踪
  audit_trail: {
    enabled: boolean;
    retention_days: number;
    audit_events?: Array<{
      event_id: UUID;
      event_type: 'role_created' | 'role_updated' | 'role_assigned' | 'role_revoked' | 'permission_granted' | 'permission_revoked' | 'role_activated' | 'role_deactivated';
      timestamp: string;
      user_id: string;
      user_role?: string;
      action: string;
      resource: string;
      role_operation?: string;
      role_id?: UUID;
      role_name?: string;
      role_type?: string;
      permission_ids?: string[];
      role_status?: string;
      role_details?: Record<string, unknown>;
      ip_address?: string;
      user_agent?: string;
      session_id?: string;
      correlation_id?: UUID;
    }>;
    compliance_settings?: {
      gdpr_enabled?: boolean;
      hipaa_enabled?: boolean;
      sox_enabled?: boolean;
      role_audit_level?: 'basic' | 'detailed' | 'comprehensive';
      role_data_logging?: boolean;
      custom_compliance?: string[];
    };
  };
}

// ===== TYPESCRIPT INTERFACES (camelCase) =====

/**
 * Role Entity Data Interface - TypeScript层
 * 所有字段使用camelCase命名约定
 */
export interface RoleEntityData {
  // 基础协议字段
  protocolVersion: string;
  timestamp: Date;
  roleId: UUID;
  contextId: UUID;

  // 角色核心字段
  name: string;
  displayName?: string;
  description?: string;
  roleType: RoleType;
  status: RoleStatus;

  // 范围配置
  scope?: {
    level: 'global' | 'organization' | 'project' | 'team' | 'individual';
    contextIds?: UUID[];
    planIds?: UUID[];
    resourceConstraints?: {
      maxContexts?: number;
      maxPlans?: number;
      allowedResourceTypes?: string[];
    };
  };

  // 权限管理
  permissions: Array<{
    permissionId: UUID;
    resourceType: 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';
    resourceId: UUID | '*';
    actions: Array<'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin'>;
    conditions?: {
      timeBased?: {
        startTime?: Date;
        endTime?: Date;
        timezone?: string;
        daysOfWeek?: number[];
      };
      locationBased?: {
        allowedIpRanges?: string[];
        geoRestrictions?: string[];
      };
      contextBased?: {
        requiredAttributes?: Record<string, unknown>;
        forbiddenAttributes?: Record<string, unknown>;
      };
      approvalRequired?: {
        forActions?: string[];
        approvalThreshold?: number;
        approverRoles?: string[];
      };
    };
    grantType: GrantType;
    expiry?: Date;
  }>;

  // 继承机制
  inheritance?: {
    parentRoles?: Array<{
      roleId: UUID;
      inheritanceType: InheritanceType;
      excludedPermissions?: UUID[];
      conditions?: Record<string, unknown>;
    }>;
    childRoles?: Array<{
      roleId: UUID;
      delegationLevel: number;
      canFurtherDelegate: boolean;
    }>;
    inheritanceRules?: {
      mergeStrategy: MergeStrategy;
      conflictResolution: ConflictResolution;
      maxInheritanceDepth?: number;
    };
  };

  // 委托机制
  delegation?: {
    canDelegate: boolean;
    delegatablePermissions?: UUID[];
    delegationConstraints?: {
      maxDelegationDepth?: number;
      timeLimit?: number;
      requireApproval?: boolean;
      revocable?: boolean;
    };
    activeDelegations?: Array<{
      delegationId: UUID;
      delegatedTo: string;
      permissions: UUID[];
      startTime: Date;
      endTime?: Date;
      status: 'active' | 'suspended' | 'revoked' | 'expired';
    }>;
  };

  // 属性管理
  attributes?: {
    securityClearance?: SecurityClearance;
    department?: string;
    seniorityLevel?: SeniorityLevel;
    certificationRequirements?: Array<{
      certification: string;
      level: string;
      expiry?: Date;
      issuer?: string;
    }>;
    customAttributes?: Record<string, string | number | boolean>;
  };

  // 验证规则
  validationRules?: {
    assignmentRules?: Array<{
      ruleId: UUID;
      condition: string;
      action: 'allow' | 'deny' | 'require_approval';
      message?: string;
    }>;
    separationOfDuties?: Array<{
      conflictingRoles: UUID[];
      severity: 'warning' | 'error' | 'critical';
      exceptionApprovalRequired?: boolean;
    }>;
  };

  // 审计设置
  auditSettings?: {
    auditEnabled: boolean;
    auditEvents?: Array<'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed'>;
    retentionPeriod?: string;
    complianceFrameworks?: string[];
  };

  // Agent管理
  agents?: Agent[];

  // Agent管理配置
  agentManagement?: {
    maxAgents?: number;
    autoScaling?: boolean;
    loadBalancing?: boolean;
    healthCheckIntervalMs?: number;
    defaultAgentConfig?: Record<string, unknown>;
  };

  // 团队配置
  teamConfiguration?: {
    maxTeamSize?: number;
    collaborationRules?: Array<{
      ruleName: string;
      ruleType: 'communication' | 'decision' | 'conflict_resolution' | 'resource_sharing';
      ruleConfig?: Record<string, unknown>;
    }>;
    decisionMechanism?: {
      type: 'consensus' | 'majority' | 'weighted' | 'authority';
      threshold?: number;
      timeoutMs?: number;
    };
  };

  // 性能监控
  performanceMetrics: {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics?: {
      roleAssignmentLatencyMs?: number;
      permissionCheckLatencyMs?: number;
      roleSecurityScore?: number;
      permissionAccuracyPercent?: number;
      roleManagementEfficiencyScore?: number;
      activeRolesCount?: number;
      roleOperationsPerSecond?: number;
      roleMemoryUsageMb?: number;
      averageRoleComplexityScore?: number;
    };
    healthStatus?: {
      status: HealthStatus;
      lastCheck?: Date;
      checks?: Array<{
        checkName: string;
        status: CheckStatus;
        message?: string;
        durationMs?: number;
      }>;
    };
    alerting?: {
      enabled?: boolean;
      thresholds?: {
        maxRoleAssignmentLatencyMs?: number;
        maxPermissionCheckLatencyMs?: number;
        minRoleSecurityScore?: number;
        minPermissionAccuracyPercent?: number;
        minRoleManagementEfficiencyScore?: number;
      };
      notificationChannels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
    };
  };

  // 监控集成
  monitoringIntegration: {
    enabled: boolean;
    supportedProviders: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
    integrationEndpoints?: {
      metricsApi?: string;
      roleAccessApi?: string;
      permissionMetricsApi?: string;
      securityEventsApi?: string;
    };
    roleMetrics?: {
      trackRoleUsage?: boolean;
      trackPermissionChecks?: boolean;
      trackAccessPatterns?: boolean;
      trackSecurityEvents?: boolean;
    };
    exportFormats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
  };

  // 版本历史
  versionHistory: {
    enabled: boolean;
    maxVersions: number;
    versions?: Array<{
      versionId: UUID;
      versionNumber: number;
      createdAt: Date;
      createdBy: string;
      changeSummary?: string;
      roleSnapshot?: Record<string, unknown>;
      changeType: 'created' | 'updated' | 'permission_changed' | 'status_changed' | 'deleted';
    }>;
    autoVersioning?: {
      enabled?: boolean;
      versionOnPermissionChange?: boolean;
      versionOnStatusChange?: boolean;
    };
  };

  // 搜索元数据
  searchMetadata: {
    enabled: boolean;
    indexingStrategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
    searchableFields?: Array<'role_id' | 'name' | 'role_type' | 'permissions' | 'agents' | 'metadata' | 'description'>;
    searchIndexes?: Array<{
      indexId: string;
      indexName: string;
      fields: string[];
      indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
      createdAt?: Date;
      lastUpdated?: Date;
    }>;
    autoIndexing?: {
      enabled?: boolean;
      indexNewRoles?: boolean;
      reindexIntervalHours?: number;
    };
  };

  // 角色操作
  roleOperation: 'create' | 'assign' | 'revoke' | 'update' | 'delete';

  // 事件集成
  eventIntegration: {
    enabled: boolean;
    eventBusConnection?: {
      busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
      connectionString?: string;
      topicPrefix?: string;
      consumerGroup?: string;
    };
    publishedEvents?: Array<'role_created' | 'role_updated' | 'role_deleted' | 'permission_granted' | 'permission_revoked' | 'access_granted' | 'access_denied'>;
    subscribedEvents?: Array<'context_updated' | 'plan_executed' | 'confirm_approved' | 'security_alert'>;
    eventRouting?: {
      routingRules?: Array<{
        ruleId?: string;
        condition?: string;
        targetTopic?: string;
        enabled?: boolean;
      }>;
    };
  };

  // 审计跟踪
  auditTrail: {
    enabled: boolean;
    retentionDays: number;
    auditEvents?: Array<{
      eventId: UUID;
      eventType: 'role_created' | 'role_updated' | 'role_assigned' | 'role_revoked' | 'permission_granted' | 'permission_revoked' | 'role_activated' | 'role_deactivated';
      timestamp: Date;
      userId: string;
      userRole?: string;
      action: string;
      resource: string;
      roleOperation?: string;
      roleId?: UUID;
      roleName?: string;
      roleType?: string;
      permissionIds?: string[];
      roleStatus?: string;
      roleDetails?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      correlationId?: UUID;
    }>;
    complianceSettings?: {
      gdprEnabled?: boolean;
      hipaaEnabled?: boolean;
      soxEnabled?: boolean;
      roleAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
      roleDataLogging?: boolean;
      customCompliance?: string[];
    };
  };
}

// ===== CORE MAPPER CLASS =====

/**
 * Role模块Schema-TypeScript映射器
 *
 * @description 提供Role模块Schema和TypeScript实体间的双向映射
 * @implements 双重命名约定：Schema(snake_case) ↔ TypeScript(camelCase)
 * @version 1.0.0
 */
export class RoleMapper {

  /**
   * TypeScript实体 → Schema格式
   * @param entity Role实体数据
   * @returns Schema格式数据
   */
  static toSchema(entity: RoleEntityData): RoleSchema {
    return {
      // 基础协议字段
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      role_id: entity.roleId,
      context_id: entity.contextId,

      // 角色核心字段
      name: entity.name,
      display_name: entity.displayName,
      description: entity.description,
      role_type: entity.roleType,
      status: entity.status,

      // 范围配置
      scope: entity.scope ? {
        level: entity.scope.level,
        context_ids: entity.scope.contextIds,
        plan_ids: entity.scope.planIds,
        resource_constraints: entity.scope.resourceConstraints ? {
          max_contexts: entity.scope.resourceConstraints.maxContexts,
          max_plans: entity.scope.resourceConstraints.maxPlans,
          allowed_resource_types: entity.scope.resourceConstraints.allowedResourceTypes
        } : undefined
      } : undefined,

      // 权限管理
      permissions: entity.permissions.map(permission => ({
        permission_id: permission.permissionId,
        resource_type: permission.resourceType,
        resource_id: permission.resourceId,
        actions: permission.actions,
        conditions: permission.conditions ? {
          time_based: permission.conditions.timeBased ? {
            start_time: permission.conditions.timeBased.startTime?.toISOString(),
            end_time: permission.conditions.timeBased.endTime?.toISOString(),
            timezone: permission.conditions.timeBased.timezone,
            days_of_week: permission.conditions.timeBased.daysOfWeek
          } : undefined,
          location_based: permission.conditions.locationBased ? {
            allowed_ip_ranges: permission.conditions.locationBased.allowedIpRanges,
            geo_restrictions: permission.conditions.locationBased.geoRestrictions
          } : undefined,
          context_based: permission.conditions.contextBased ? {
            required_attributes: permission.conditions.contextBased.requiredAttributes,
            forbidden_attributes: permission.conditions.contextBased.forbiddenAttributes
          } : undefined,
          approval_required: permission.conditions.approvalRequired ? {
            for_actions: permission.conditions.approvalRequired.forActions,
            approval_threshold: permission.conditions.approvalRequired.approvalThreshold,
            approver_roles: permission.conditions.approvalRequired.approverRoles
          } : undefined
        } : undefined,
        grant_type: permission.grantType,
        expiry: permission.expiry?.toISOString()
      })),

      // 继承机制
      inheritance: entity.inheritance ? {
        parent_roles: entity.inheritance.parentRoles?.map(parent => ({
          role_id: parent.roleId,
          inheritance_type: parent.inheritanceType,
          excluded_permissions: parent.excludedPermissions,
          conditions: parent.conditions
        })),
        child_roles: entity.inheritance.childRoles?.map(child => ({
          role_id: child.roleId,
          delegation_level: child.delegationLevel,
          can_further_delegate: child.canFurtherDelegate
        })),
        inheritance_rules: entity.inheritance.inheritanceRules ? {
          merge_strategy: entity.inheritance.inheritanceRules.mergeStrategy,
          conflict_resolution: entity.inheritance.inheritanceRules.conflictResolution,
          max_inheritance_depth: entity.inheritance.inheritanceRules.maxInheritanceDepth
        } : undefined
      } : undefined,

      // 委托机制
      delegation: entity.delegation ? {
        can_delegate: entity.delegation.canDelegate,
        delegatable_permissions: entity.delegation.delegatablePermissions,
        delegation_constraints: entity.delegation.delegationConstraints ? {
          max_delegation_depth: entity.delegation.delegationConstraints.maxDelegationDepth,
          time_limit: entity.delegation.delegationConstraints.timeLimit,
          require_approval: entity.delegation.delegationConstraints.requireApproval,
          revocable: entity.delegation.delegationConstraints.revocable
        } : undefined,
        active_delegations: entity.delegation.activeDelegations?.map(delegation => ({
          delegation_id: delegation.delegationId,
          delegated_to: delegation.delegatedTo,
          permissions: delegation.permissions,
          start_time: delegation.startTime.toISOString(),
          end_time: delegation.endTime?.toISOString(),
          status: delegation.status
        }))
      } : undefined,

      // 属性管理
      attributes: entity.attributes ? {
        security_clearance: entity.attributes.securityClearance,
        department: entity.attributes.department,
        seniority_level: entity.attributes.seniorityLevel,
        certification_requirements: entity.attributes.certificationRequirements?.map(cert => ({
          certification: cert.certification,
          level: cert.level,
          expiry: cert.expiry?.toISOString(),
          issuer: cert.issuer
        })),
        custom_attributes: entity.attributes.customAttributes
      } : undefined,

      // 验证规则
      validation_rules: entity.validationRules ? {
        assignment_rules: entity.validationRules.assignmentRules?.map(rule => ({
          rule_id: rule.ruleId,
          condition: rule.condition,
          action: rule.action,
          message: rule.message
        })),
        separation_of_duties: entity.validationRules.separationOfDuties?.map(sod => ({
          conflicting_roles: sod.conflictingRoles,
          severity: sod.severity,
          exception_approval_required: sod.exceptionApprovalRequired
        }))
      } : undefined,

      // 审计设置
      audit_settings: entity.auditSettings ? {
        audit_enabled: entity.auditSettings.auditEnabled,
        audit_events: entity.auditSettings.auditEvents,
        retention_period: entity.auditSettings.retentionPeriod,
        compliance_frameworks: entity.auditSettings.complianceFrameworks
      } : undefined,

      // Agent管理 (简化版本，完整版本需要更多映射)
      agents: [], // TODO: 实现完整的Agent映射

      // Agent管理配置
      agent_management: entity.agentManagement ? {
        max_agents: entity.agentManagement.maxAgents,
        auto_scaling: entity.agentManagement.autoScaling,
        load_balancing: entity.agentManagement.loadBalancing,
        health_check_interval_ms: entity.agentManagement.healthCheckIntervalMs,
        default_agent_config: entity.agentManagement.defaultAgentConfig
      } : undefined,

      // 团队配置
      team_configuration: entity.teamConfiguration ? {
        max_team_size: entity.teamConfiguration.maxTeamSize,
        collaboration_rules: entity.teamConfiguration.collaborationRules?.map(rule => ({
          rule_name: rule.ruleName,
          rule_type: rule.ruleType,
          rule_config: rule.ruleConfig
        })),
        decision_mechanism: entity.teamConfiguration.decisionMechanism ? {
          type: entity.teamConfiguration.decisionMechanism.type,
          threshold: entity.teamConfiguration.decisionMechanism.threshold,
          timeout_ms: entity.teamConfiguration.decisionMechanism.timeoutMs
        } : undefined
      } : undefined,

      // 性能监控
      performance_metrics: {
        enabled: entity.performanceMetrics.enabled,
        collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
        metrics: entity.performanceMetrics.metrics ? {
          role_assignment_latency_ms: entity.performanceMetrics.metrics.roleAssignmentLatencyMs,
          permission_check_latency_ms: entity.performanceMetrics.metrics.permissionCheckLatencyMs,
          role_security_score: entity.performanceMetrics.metrics.roleSecurityScore,
          permission_accuracy_percent: entity.performanceMetrics.metrics.permissionAccuracyPercent,
          role_management_efficiency_score: entity.performanceMetrics.metrics.roleManagementEfficiencyScore,
          active_roles_count: entity.performanceMetrics.metrics.activeRolesCount,
          role_operations_per_second: entity.performanceMetrics.metrics.roleOperationsPerSecond,
          role_memory_usage_mb: entity.performanceMetrics.metrics.roleMemoryUsageMb,
          average_role_complexity_score: entity.performanceMetrics.metrics.averageRoleComplexityScore
        } : undefined,
        health_status: entity.performanceMetrics.healthStatus ? {
          status: entity.performanceMetrics.healthStatus.status,
          last_check: entity.performanceMetrics.healthStatus.lastCheck?.toISOString(),
          checks: entity.performanceMetrics.healthStatus.checks?.map(check => ({
            check_name: check.checkName,
            status: check.status,
            message: check.message,
            duration_ms: check.durationMs
          }))
        } : undefined,
        alerting: entity.performanceMetrics.alerting ? {
          enabled: entity.performanceMetrics.alerting.enabled,
          thresholds: entity.performanceMetrics.alerting.thresholds ? {
            max_role_assignment_latency_ms: entity.performanceMetrics.alerting.thresholds.maxRoleAssignmentLatencyMs,
            max_permission_check_latency_ms: entity.performanceMetrics.alerting.thresholds.maxPermissionCheckLatencyMs,
            min_role_security_score: entity.performanceMetrics.alerting.thresholds.minRoleSecurityScore,
            min_permission_accuracy_percent: entity.performanceMetrics.alerting.thresholds.minPermissionAccuracyPercent,
            min_role_management_efficiency_score: entity.performanceMetrics.alerting.thresholds.minRoleManagementEfficiencyScore
          } : undefined,
          notification_channels: entity.performanceMetrics.alerting.notificationChannels
        } : undefined
      },

      // 监控集成
      monitoring_integration: {
        enabled: entity.monitoringIntegration.enabled,
        supported_providers: entity.monitoringIntegration.supportedProviders,
        integration_endpoints: entity.monitoringIntegration.integrationEndpoints ? {
          metrics_api: entity.monitoringIntegration.integrationEndpoints.metricsApi,
          role_access_api: entity.monitoringIntegration.integrationEndpoints.roleAccessApi,
          permission_metrics_api: entity.monitoringIntegration.integrationEndpoints.permissionMetricsApi,
          security_events_api: entity.monitoringIntegration.integrationEndpoints.securityEventsApi
        } : undefined,
        role_metrics: entity.monitoringIntegration.roleMetrics ? {
          track_role_usage: entity.monitoringIntegration.roleMetrics.trackRoleUsage,
          track_permission_checks: entity.monitoringIntegration.roleMetrics.trackPermissionChecks,
          track_access_patterns: entity.monitoringIntegration.roleMetrics.trackAccessPatterns,
          track_security_events: entity.monitoringIntegration.roleMetrics.trackSecurityEvents
        } : undefined,
        export_formats: entity.monitoringIntegration.exportFormats
      },

      // 版本历史
      version_history: {
        enabled: entity.versionHistory.enabled,
        max_versions: entity.versionHistory.maxVersions,
        versions: entity.versionHistory.versions?.map(version => ({
          version_id: version.versionId,
          version_number: version.versionNumber,
          created_at: version.createdAt.toISOString(),
          created_by: version.createdBy,
          change_summary: version.changeSummary,
          role_snapshot: version.roleSnapshot,
          change_type: version.changeType
        })),
        auto_versioning: entity.versionHistory.autoVersioning ? {
          enabled: entity.versionHistory.autoVersioning.enabled,
          version_on_permission_change: entity.versionHistory.autoVersioning.versionOnPermissionChange,
          version_on_status_change: entity.versionHistory.autoVersioning.versionOnStatusChange
        } : undefined
      },

      // 搜索元数据
      search_metadata: {
        enabled: entity.searchMetadata.enabled,
        indexing_strategy: entity.searchMetadata.indexingStrategy,
        searchable_fields: entity.searchMetadata.searchableFields,
        search_indexes: entity.searchMetadata.searchIndexes?.map(index => ({
          index_id: index.indexId,
          index_name: index.indexName,
          fields: index.fields,
          index_type: index.indexType,
          created_at: index.createdAt?.toISOString(),
          last_updated: index.lastUpdated?.toISOString()
        })),
        auto_indexing: entity.searchMetadata.autoIndexing ? {
          enabled: entity.searchMetadata.autoIndexing.enabled,
          index_new_roles: entity.searchMetadata.autoIndexing.indexNewRoles,
          reindex_interval_hours: entity.searchMetadata.autoIndexing.reindexIntervalHours
        } : undefined
      },

      // 角色操作
      role_operation: entity.roleOperation,

      // 事件集成
      event_integration: {
        enabled: entity.eventIntegration.enabled,
        event_bus_connection: entity.eventIntegration.eventBusConnection ? {
          bus_type: entity.eventIntegration.eventBusConnection.busType,
          connection_string: entity.eventIntegration.eventBusConnection.connectionString,
          topic_prefix: entity.eventIntegration.eventBusConnection.topicPrefix,
          consumer_group: entity.eventIntegration.eventBusConnection.consumerGroup
        } : undefined,
        published_events: entity.eventIntegration.publishedEvents,
        subscribed_events: entity.eventIntegration.subscribedEvents,
        event_routing: entity.eventIntegration.eventRouting ? {
          routing_rules: entity.eventIntegration.eventRouting.routingRules?.map(rule => ({
            rule_id: rule.ruleId,
            condition: rule.condition,
            target_topic: rule.targetTopic,
            enabled: rule.enabled
          }))
        } : undefined
      },

      // 审计跟踪
      audit_trail: {
        enabled: entity.auditTrail.enabled,
        retention_days: entity.auditTrail.retentionDays,
        audit_events: entity.auditTrail.auditEvents?.map(event => ({
          event_id: event.eventId,
          event_type: event.eventType,
          timestamp: event.timestamp.toISOString(),
          user_id: event.userId,
          user_role: event.userRole,
          action: event.action,
          resource: event.resource,
          role_operation: event.roleOperation,
          role_id: event.roleId,
          role_name: event.roleName,
          role_type: event.roleType,
          permission_ids: event.permissionIds,
          role_status: event.roleStatus,
          role_details: event.roleDetails,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          session_id: event.sessionId,
          correlation_id: event.correlationId
        })),
        compliance_settings: entity.auditTrail.complianceSettings ? {
          gdpr_enabled: entity.auditTrail.complianceSettings.gdprEnabled,
          hipaa_enabled: entity.auditTrail.complianceSettings.hipaaEnabled,
          sox_enabled: entity.auditTrail.complianceSettings.soxEnabled,
          role_audit_level: entity.auditTrail.complianceSettings.roleAuditLevel,
          role_data_logging: entity.auditTrail.complianceSettings.roleDataLogging,
          custom_compliance: entity.auditTrail.complianceSettings.customCompliance
        } : undefined
      }
    };
  }

  /**
   * Schema格式 → TypeScript实体
   * @param schema Schema格式数据
   * @returns TypeScript实体数据
   */
  static fromSchema(schema: RoleSchema): RoleEntityData {
    return {
      // 基础协议字段
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      roleId: schema.role_id,
      contextId: schema.context_id,

      // 角色核心字段
      name: schema.name,
      displayName: schema.display_name,
      description: schema.description,
      roleType: schema.role_type,
      status: schema.status,

      // 范围配置
      scope: schema.scope ? {
        level: schema.scope.level,
        contextIds: schema.scope.context_ids,
        planIds: schema.scope.plan_ids,
        resourceConstraints: schema.scope.resource_constraints ? {
          maxContexts: schema.scope.resource_constraints.max_contexts,
          maxPlans: schema.scope.resource_constraints.max_plans,
          allowedResourceTypes: schema.scope.resource_constraints.allowed_resource_types
        } : undefined
      } : undefined,

      // 权限管理
      permissions: schema.permissions.map(permission => ({
        permissionId: permission.permission_id,
        resourceType: permission.resource_type,
        resourceId: permission.resource_id,
        actions: permission.actions,
        conditions: permission.conditions ? {
          timeBased: permission.conditions.time_based ? {
            startTime: permission.conditions.time_based.start_time ? new Date(permission.conditions.time_based.start_time) : undefined,
            endTime: permission.conditions.time_based.end_time ? new Date(permission.conditions.time_based.end_time) : undefined,
            timezone: permission.conditions.time_based.timezone,
            daysOfWeek: permission.conditions.time_based.days_of_week
          } : undefined,
          locationBased: permission.conditions.location_based ? {
            allowedIpRanges: permission.conditions.location_based.allowed_ip_ranges,
            geoRestrictions: permission.conditions.location_based.geo_restrictions
          } : undefined,
          contextBased: permission.conditions.context_based ? {
            requiredAttributes: permission.conditions.context_based.required_attributes,
            forbiddenAttributes: permission.conditions.context_based.forbidden_attributes
          } : undefined,
          approvalRequired: permission.conditions.approval_required ? {
            forActions: permission.conditions.approval_required.for_actions,
            approvalThreshold: permission.conditions.approval_required.approval_threshold,
            approverRoles: permission.conditions.approval_required.approver_roles
          } : undefined
        } : undefined,
        grantType: permission.grant_type,
        expiry: permission.expiry ? new Date(permission.expiry) : undefined
      })),

      // 继承机制
      inheritance: schema.inheritance ? {
        parentRoles: schema.inheritance.parent_roles?.map(parent => ({
          roleId: parent.role_id,
          inheritanceType: parent.inheritance_type,
          excludedPermissions: parent.excluded_permissions,
          conditions: parent.conditions
        })),
        childRoles: schema.inheritance.child_roles?.map(child => ({
          roleId: child.role_id,
          delegationLevel: child.delegation_level,
          canFurtherDelegate: child.can_further_delegate
        })),
        inheritanceRules: schema.inheritance.inheritance_rules ? {
          mergeStrategy: schema.inheritance.inheritance_rules.merge_strategy,
          conflictResolution: schema.inheritance.inheritance_rules.conflict_resolution,
          maxInheritanceDepth: schema.inheritance.inheritance_rules.max_inheritance_depth
        } : undefined
      } : undefined,

      // 委托机制
      delegation: schema.delegation ? {
        canDelegate: schema.delegation.can_delegate,
        delegatablePermissions: schema.delegation.delegatable_permissions,
        delegationConstraints: schema.delegation.delegation_constraints ? {
          maxDelegationDepth: schema.delegation.delegation_constraints.max_delegation_depth,
          timeLimit: schema.delegation.delegation_constraints.time_limit,
          requireApproval: schema.delegation.delegation_constraints.require_approval,
          revocable: schema.delegation.delegation_constraints.revocable
        } : undefined,
        activeDelegations: schema.delegation.active_delegations?.map(delegation => ({
          delegationId: delegation.delegation_id,
          delegatedTo: delegation.delegated_to,
          permissions: delegation.permissions,
          startTime: new Date(delegation.start_time),
          endTime: delegation.end_time ? new Date(delegation.end_time) : undefined,
          status: delegation.status
        }))
      } : undefined,

      // 属性管理
      attributes: schema.attributes ? {
        securityClearance: schema.attributes.security_clearance,
        department: schema.attributes.department,
        seniorityLevel: schema.attributes.seniority_level,
        certificationRequirements: schema.attributes.certification_requirements?.map(cert => ({
          certification: cert.certification,
          level: cert.level,
          expiry: cert.expiry ? new Date(cert.expiry) : undefined,
          issuer: cert.issuer
        })),
        customAttributes: schema.attributes.custom_attributes
      } : undefined,

      // 验证规则
      validationRules: schema.validation_rules ? {
        assignmentRules: schema.validation_rules.assignment_rules?.map(rule => ({
          ruleId: rule.rule_id,
          condition: rule.condition,
          action: rule.action,
          message: rule.message
        })),
        separationOfDuties: schema.validation_rules.separation_of_duties?.map(sod => ({
          conflictingRoles: sod.conflicting_roles,
          severity: sod.severity,
          exceptionApprovalRequired: sod.exception_approval_required
        }))
      } : undefined,

      // 审计设置
      auditSettings: schema.audit_settings ? {
        auditEnabled: schema.audit_settings.audit_enabled,
        auditEvents: schema.audit_settings.audit_events,
        retentionPeriod: schema.audit_settings.retention_period,
        complianceFrameworks: schema.audit_settings.compliance_frameworks
      } : undefined,

      // 性能监控
      performanceMetrics: {
        enabled: schema.performance_metrics.enabled,
        collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds,
        metrics: schema.performance_metrics.metrics ? {
          roleAssignmentLatencyMs: schema.performance_metrics.metrics.role_assignment_latency_ms,
          permissionCheckLatencyMs: schema.performance_metrics.metrics.permission_check_latency_ms,
          roleSecurityScore: schema.performance_metrics.metrics.role_security_score,
          permissionAccuracyPercent: schema.performance_metrics.metrics.permission_accuracy_percent,
          roleManagementEfficiencyScore: schema.performance_metrics.metrics.role_management_efficiency_score,
          activeRolesCount: schema.performance_metrics.metrics.active_roles_count,
          roleOperationsPerSecond: schema.performance_metrics.metrics.role_operations_per_second,
          roleMemoryUsageMb: schema.performance_metrics.metrics.role_memory_usage_mb,
          averageRoleComplexityScore: schema.performance_metrics.metrics.average_role_complexity_score
        } : undefined,
        healthStatus: schema.performance_metrics.health_status ? {
          status: schema.performance_metrics.health_status.status,
          lastCheck: schema.performance_metrics.health_status.last_check ? new Date(schema.performance_metrics.health_status.last_check) : undefined,
          checks: schema.performance_metrics.health_status.checks?.map(check => ({
            checkName: check.check_name,
            status: check.status,
            message: check.message,
            durationMs: check.duration_ms
          }))
        } : undefined,
        alerting: schema.performance_metrics.alerting ? {
          enabled: schema.performance_metrics.alerting.enabled,
          thresholds: schema.performance_metrics.alerting.thresholds ? {
            maxRoleAssignmentLatencyMs: schema.performance_metrics.alerting.thresholds.max_role_assignment_latency_ms,
            maxPermissionCheckLatencyMs: schema.performance_metrics.alerting.thresholds.max_permission_check_latency_ms,
            minRoleSecurityScore: schema.performance_metrics.alerting.thresholds.min_role_security_score,
            minPermissionAccuracyPercent: schema.performance_metrics.alerting.thresholds.min_permission_accuracy_percent,
            minRoleManagementEfficiencyScore: schema.performance_metrics.alerting.thresholds.min_role_management_efficiency_score
          } : undefined,
          notificationChannels: schema.performance_metrics.alerting.notification_channels
        } : undefined
      },

      // 监控集成
      monitoringIntegration: {
        enabled: schema.monitoring_integration.enabled,
        supportedProviders: schema.monitoring_integration.supported_providers,
        integrationEndpoints: schema.monitoring_integration.integration_endpoints ? {
          metricsApi: schema.monitoring_integration.integration_endpoints.metrics_api,
          roleAccessApi: schema.monitoring_integration.integration_endpoints.role_access_api,
          permissionMetricsApi: schema.monitoring_integration.integration_endpoints.permission_metrics_api,
          securityEventsApi: schema.monitoring_integration.integration_endpoints.security_events_api
        } : undefined,
        roleMetrics: schema.monitoring_integration.role_metrics ? {
          trackRoleUsage: schema.monitoring_integration.role_metrics.track_role_usage,
          trackPermissionChecks: schema.monitoring_integration.role_metrics.track_permission_checks,
          trackAccessPatterns: schema.monitoring_integration.role_metrics.track_access_patterns,
          trackSecurityEvents: schema.monitoring_integration.role_metrics.track_security_events
        } : undefined,
        exportFormats: schema.monitoring_integration.export_formats
      },

      // 版本历史
      versionHistory: {
        enabled: schema.version_history.enabled,
        maxVersions: schema.version_history.max_versions,
        versions: schema.version_history.versions?.map(version => ({
          versionId: version.version_id,
          versionNumber: version.version_number,
          createdAt: new Date(version.created_at),
          createdBy: version.created_by,
          changeSummary: version.change_summary,
          roleSnapshot: version.role_snapshot,
          changeType: version.change_type
        })),
        autoVersioning: schema.version_history.auto_versioning ? {
          enabled: schema.version_history.auto_versioning.enabled,
          versionOnPermissionChange: schema.version_history.auto_versioning.version_on_permission_change,
          versionOnStatusChange: schema.version_history.auto_versioning.version_on_status_change
        } : undefined
      },

      // 搜索元数据
      searchMetadata: {
        enabled: schema.search_metadata.enabled,
        indexingStrategy: schema.search_metadata.indexing_strategy,
        searchableFields: schema.search_metadata.searchable_fields,
        searchIndexes: schema.search_metadata.search_indexes?.map(index => ({
          indexId: index.index_id,
          indexName: index.index_name,
          fields: index.fields,
          indexType: index.index_type,
          createdAt: index.created_at ? new Date(index.created_at) : undefined,
          lastUpdated: index.last_updated ? new Date(index.last_updated) : undefined
        })),
        autoIndexing: schema.search_metadata.auto_indexing ? {
          enabled: schema.search_metadata.auto_indexing.enabled,
          indexNewRoles: schema.search_metadata.auto_indexing.index_new_roles,
          reindexIntervalHours: schema.search_metadata.auto_indexing.reindex_interval_hours
        } : undefined
      },

      // 角色操作
      roleOperation: schema.role_operation,

      // 事件集成
      eventIntegration: {
        enabled: schema.event_integration.enabled,
        eventBusConnection: schema.event_integration.event_bus_connection ? {
          busType: schema.event_integration.event_bus_connection.bus_type,
          connectionString: schema.event_integration.event_bus_connection.connection_string,
          topicPrefix: schema.event_integration.event_bus_connection.topic_prefix,
          consumerGroup: schema.event_integration.event_bus_connection.consumer_group
        } : undefined,
        publishedEvents: schema.event_integration.published_events,
        subscribedEvents: schema.event_integration.subscribed_events,
        eventRouting: schema.event_integration.event_routing ? {
          routingRules: schema.event_integration.event_routing.routing_rules?.map(rule => ({
            ruleId: rule.rule_id,
            condition: rule.condition,
            targetTopic: rule.target_topic,
            enabled: rule.enabled
          }))
        } : undefined
      },

      // 审计跟踪
      auditTrail: {
        enabled: schema.audit_trail.enabled,
        retentionDays: schema.audit_trail.retention_days,
        auditEvents: schema.audit_trail.audit_events?.map(event => ({
          eventId: event.event_id,
          eventType: event.event_type,
          timestamp: new Date(event.timestamp),
          userId: event.user_id,
          userRole: event.user_role,
          action: event.action,
          resource: event.resource,
          roleOperation: event.role_operation,
          roleId: event.role_id,
          roleName: event.role_name,
          roleType: event.role_type,
          permissionIds: event.permission_ids,
          roleStatus: event.role_status,
          roleDetails: event.role_details,
          ipAddress: event.ip_address,
          userAgent: event.user_agent,
          sessionId: event.session_id,
          correlationId: event.correlation_id
        })),
        complianceSettings: schema.audit_trail.compliance_settings ? {
          gdprEnabled: schema.audit_trail.compliance_settings.gdpr_enabled,
          hipaaEnabled: schema.audit_trail.compliance_settings.hipaa_enabled,
          soxEnabled: schema.audit_trail.compliance_settings.sox_enabled,
          roleAuditLevel: schema.audit_trail.compliance_settings.role_audit_level,
          roleDataLogging: schema.audit_trail.compliance_settings.role_data_logging,
          customCompliance: schema.audit_trail.compliance_settings.custom_compliance
        } : undefined
      }
    };
  }

  /**
   * 验证Schema格式数据
   * @param data 待验证数据
   * @returns 是否为有效的RoleSchema
   */
  static validateSchema(data: unknown): data is RoleSchema {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const schema = data as Record<string, unknown>;

    // 验证必需字段
    const requiredFields = [
      'protocol_version',
      'timestamp',
      'role_id',
      'context_id',
      'name',
      'role_type',
      'status',
      'permissions',
      'performance_metrics',
      'monitoring_integration',
      'version_history',
      'search_metadata',
      'role_operation',
      'event_integration',
      'audit_trail'
    ];

    for (const field of requiredFields) {
      if (!(field in schema)) {
        return false;
      }
    }

    // 验证基础字段类型
    if (typeof schema.protocol_version !== 'string' ||
        typeof schema.timestamp !== 'string' ||
        typeof schema.role_id !== 'string' ||
        typeof schema.context_id !== 'string' ||
        typeof schema.name !== 'string' ||
        typeof schema.role_type !== 'string' ||
        typeof schema.status !== 'string' ||
        !Array.isArray(schema.permissions)) {
      return false;
    }

    // 验证复杂对象
    if (typeof schema.performance_metrics !== 'object' ||
        typeof schema.monitoring_integration !== 'object' ||
        typeof schema.version_history !== 'object' ||
        typeof schema.search_metadata !== 'object' ||
        typeof schema.event_integration !== 'object' ||
        typeof schema.audit_trail !== 'object') {
      return false;
    }

    return true;
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   * @param entities TypeScript实体数组
   * @returns Schema格式数组
   */
  static toSchemaArray(entities: RoleEntityData[]): RoleSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript实体数组
   * @param schemas Schema格式数组
   * @returns TypeScript实体数组
   */
  static fromSchemaArray(schemas: RoleSchema[]): RoleEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  /**
   * 批量验证Schema数组
   * @param dataArray 待验证数据数组
   * @returns 验证结果数组
   */
  static validateSchemaArray(dataArray: unknown[]): boolean {
    return dataArray.every(data => this.validateSchema(data));
  }

  /**
   * 创建默认的Role实体数据
   * @param overrides 覆盖的字段
   * @returns 默认Role实体数据
   */
  static createDefault(overrides: Partial<RoleEntityData> = {}): RoleEntityData {
    const defaultData: RoleEntityData = {
      protocolVersion: '1.0.0',
      timestamp: new Date(),
      roleId: randomUUID() as UUID,
      contextId: randomUUID() as UUID,
      name: 'default-role',
      roleType: 'organizational' as RoleType,
      status: 'active' as RoleStatus,
      permissions: [],
      performanceMetrics: {
        enabled: true,
        collectionIntervalSeconds: 60
      },
      monitoringIntegration: {
        enabled: false,
        supportedProviders: []
      },
      versionHistory: {
        enabled: true,
        maxVersions: 50
      },
      searchMetadata: {
        enabled: true,
        indexingStrategy: 'keyword'
      },
      roleOperation: 'create',
      eventIntegration: {
        enabled: false
      },
      auditTrail: {
        enabled: true,
        retentionDays: 365
      }
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * 深度克隆Role实体数据
   * @param entity 原始实体数据
   * @returns 克隆的实体数据
   */
  static clone(entity: RoleEntityData): RoleEntityData {
    return JSON.parse(JSON.stringify(entity));
  }

  /**
   * 比较两个Role实体数据是否相等
   * @param entity1 实体1
   * @param entity2 实体2
   * @returns 是否相等
   */
  static equals(entity1: RoleEntityData, entity2: RoleEntityData): boolean {
    return JSON.stringify(this.toSchema(entity1)) === JSON.stringify(this.toSchema(entity2));
  }

  /**
   * 获取实体数据的哈希值
   * @param entity 实体数据
   * @returns 哈希值
   */
  static getHash(entity: RoleEntityData): string {
    const schema = this.toSchema(entity);
    const str = JSON.stringify(schema);
    // 简单哈希算法
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }

  // ===== 辅助转换方法 =====

  /**
   * 将对象键名转换为snake_case
   * @param obj 原始对象
   * @returns snake_case格式的对象
   */
  private static objectToSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;

    const toSnakeCase = (str: string): string => {
      return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    };

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = toSnakeCase(key);
      if (Array.isArray(value)) {
        result[snakeKey] = value.map(item =>
          typeof item === 'object' && item !== null ? this.objectToSnakeCase(item as Record<string, unknown>) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[snakeKey] = this.objectToSnakeCase(value as Record<string, unknown>);
      } else {
        result[snakeKey] = value;
      }
    }
    return result;
  }

  /**
   * 将对象键名转换为camelCase
   * @param obj 原始对象
   * @returns camelCase格式的对象
   */
  private static objectToCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;

    const toCamelCase = (str: string): string => {
      return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    };

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = toCamelCase(key);
      if (Array.isArray(value)) {
        result[camelKey] = value.map(item =>
          typeof item === 'object' && item !== null ? this.objectToCamelCase(item as Record<string, unknown>) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[camelKey] = this.objectToCamelCase(value as Record<string, unknown>);
      } else {
        result[camelKey] = value;
      }
    }
    return result;
  }

  // ===== 9个横切关注点映射方法 =====

  /**
   * 1. 安全上下文映射到Schema (SecurityManager)
   * @description 将TypeScript安全上下文对象转换为Schema格式
   * @param securityContext 安全上下文对象
   * @returns Schema格式的安全上下文
   */
  static mapSecurityContextToSchema(securityContext: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(securityContext);
  }

  /**
   * 1. Schema安全上下文映射到TypeScript (SecurityManager)
   * @description 将Schema格式的安全上下文转换为TypeScript对象
   * @param securityContext Schema格式的安全上下文
   * @returns TypeScript格式的安全上下文
   */
  static mapSecurityContextFromSchema(securityContext: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(securityContext);
  }

  /**
   * 2. 性能指标映射到Schema (PerformanceMonitor)
   * @description 将TypeScript性能指标对象转换为Schema格式
   * @param performanceMetrics 性能指标对象
   * @returns Schema格式的性能指标
   */
  static mapPerformanceMetricsToSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(performanceMetrics);
  }

  /**
   * 2. Schema性能指标映射到TypeScript (PerformanceMonitor)
   * @description 将Schema格式的性能指标转换为TypeScript对象
   * @param performanceMetrics Schema格式的性能指标
   * @returns TypeScript格式的性能指标
   */
  static mapPerformanceMetricsFromSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(performanceMetrics);
  }

  /**
   * 3. 事件总线映射到Schema (EventBusManager)
   * @description 将TypeScript事件总线对象转换为Schema格式
   * @param eventBus 事件总线对象
   * @returns Schema格式的事件总线
   */
  static mapEventBusToSchema(eventBus: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(eventBus);
  }

  /**
   * 3. Schema事件总线映射到TypeScript (EventBusManager)
   * @description 将Schema格式的事件总线转换为TypeScript对象
   * @param eventBus Schema格式的事件总线
   * @returns TypeScript格式的事件总线
   */
  static mapEventBusFromSchema(eventBus: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(eventBus);
  }

  /**
   * 4. 错误处理映射到Schema (ErrorHandler)
   * @description 将TypeScript错误处理对象转换为Schema格式
   * @param errorHandling 错误处理对象
   * @returns Schema格式的错误处理
   */
  static mapErrorHandlingToSchema(errorHandling: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(errorHandling);
  }

  /**
   * 4. Schema错误处理映射到TypeScript (ErrorHandler)
   * @description 将Schema格式的错误处理转换为TypeScript对象
   * @param errorHandling Schema格式的错误处理
   * @returns TypeScript格式的错误处理
   */
  static mapErrorHandlingFromSchema(errorHandling: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(errorHandling);
  }

  /**
   * 5. 协调管理映射到Schema (CoordinationManager)
   * @description 将TypeScript协调管理对象转换为Schema格式
   * @param coordination 协调管理对象
   * @returns Schema格式的协调管理
   */
  static mapCoordinationToSchema(coordination: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(coordination);
  }

  /**
   * 5. Schema协调管理映射到TypeScript (CoordinationManager)
   * @description 将Schema格式的协调管理转换为TypeScript对象
   * @param coordination Schema格式的协调管理
   * @returns TypeScript格式的协调管理
   */
  static mapCoordinationFromSchema(coordination: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(coordination);
  }

  /**
   * 6. 编排管理映射到Schema (OrchestrationManager)
   * @description 将TypeScript编排管理对象转换为Schema格式
   * @param orchestration 编排管理对象
   * @returns Schema格式的编排管理
   */
  static mapOrchestrationToSchema(orchestration: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(orchestration);
  }

  /**
   * 6. Schema编排管理映射到TypeScript (OrchestrationManager)
   * @description 将Schema格式的编排管理转换为TypeScript对象
   * @param orchestration Schema格式的编排管理
   * @returns TypeScript格式的编排管理
   */
  static mapOrchestrationFromSchema(orchestration: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(orchestration);
  }

  /**
   * 7. 状态同步映射到Schema (StateSyncManager)
   * @description 将TypeScript状态同步对象转换为Schema格式
   * @param stateSync 状态同步对象
   * @returns Schema格式的状态同步
   */
  static mapStateSyncToSchema(stateSync: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(stateSync);
  }

  /**
   * 7. Schema状态同步映射到TypeScript (StateSyncManager)
   * @description 将Schema格式的状态同步转换为TypeScript对象
   * @param stateSync Schema格式的状态同步
   * @returns TypeScript格式的状态同步
   */
  static mapStateSyncFromSchema(stateSync: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(stateSync);
  }

  /**
   * 8. 事务管理映射到Schema (TransactionManager)
   * @description 将TypeScript事务管理对象转换为Schema格式
   * @param transaction 事务管理对象
   * @returns Schema格式的事务管理
   */
  static mapTransactionToSchema(transaction: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(transaction);
  }

  /**
   * 8. Schema事务管理映射到TypeScript (TransactionManager)
   * @description 将Schema格式的事务管理转换为TypeScript对象
   * @param transaction Schema格式的事务管理
   * @returns TypeScript格式的事务管理
   */
  static mapTransactionFromSchema(transaction: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(transaction);
  }

  /**
   * 9. 协议版本映射到Schema (ProtocolVersionManager)
   * @description 将TypeScript协议版本对象转换为Schema格式
   * @param protocolVersion 协议版本对象
   * @returns Schema格式的协议版本
   */
  static mapProtocolVersionToSchema(protocolVersion: Record<string, unknown>): Record<string, unknown> {
    return this.objectToSnakeCase(protocolVersion);
  }

  /**
   * 9. Schema协议版本映射到TypeScript (ProtocolVersionManager)
   * @description 将Schema格式的协议版本转换为TypeScript对象
   * @param protocolVersion Schema格式的协议版本
   * @returns TypeScript格式的协议版本
   */
  static mapProtocolVersionFromSchema(protocolVersion: Record<string, unknown>): Record<string, unknown> {
    return this.objectToCamelCase(protocolVersion);
  }
}
