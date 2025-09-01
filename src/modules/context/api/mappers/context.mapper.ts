/**
 * Context模块Mapper实现
 * 
 * @description 实现Schema-TypeScript双向映射，遵循双重命名约定
 * @version 1.0.0
 * @schema src/schemas/core-modules/mplp-context.json
 * @naming_convention Schema(snake_case) ↔ TypeScript(camelCase)
 * @coverage 100%字段映射覆盖
 */

import {
  ContextEntityData,
  ContextSchema,
  SharedState,
  AccessControl,
  Configuration,
  AuditTrail,
  PrincipalType,
  Permission,
  PolicyType,
  PolicyEnforcement
} from '../../types';
import { toCamelCase, toSnakeCase } from '../../../../shared/utils';

/**
 * Context模块Mapper类
 * 
 * @description 提供Schema-TypeScript双向映射和验证功能
 * @pattern 与其他6个已完成模块使用IDENTICAL的Mapper模式
 */
export class ContextMapper {
  
  /**
   * TypeScript实体 → Schema格式转换
   * 
   * @param entity - TypeScript格式的Context实体数据
   * @returns Schema格式的数据 (snake_case)
   */
  static toSchema(entity: ContextEntityData): ContextSchema {
    return {
      // 基础协议字段映射
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      lifecycle_stage: entity.lifecycleStage,

      // 核心功能字段映射 (转换为snake_case)
      shared_state: this.sharedStateToSchema(entity.sharedState),
      access_control: this.accessControlToSchema(entity.accessControl),
      configuration: this.configurationToSchema(entity.configuration),

      // 企业级功能字段映射
      audit_trail: this.auditTrailToSchema(entity.auditTrail),
      monitoring_integration: this.objectToSnakeCase(entity.monitoringIntegration),
      performance_metrics: this.objectToSnakeCase(entity.performanceMetrics),
      version_history: this.objectToSnakeCase(entity.versionHistory),
      search_metadata: this.objectToSnakeCase(entity.searchMetadata),
      caching_policy: this.objectToSnakeCase(entity.cachingPolicy),
      sync_configuration: this.objectToSnakeCase(entity.syncConfiguration),
      error_handling: this.objectToSnakeCase(entity.errorHandling),
      integration_endpoints: this.objectToSnakeCase(entity.integrationEndpoints),
      event_integration: this.objectToSnakeCase(entity.eventIntegration)
    };
  }

  /**
   * Schema格式 → TypeScript实体转换
   * 
   * @param schema - Schema格式的数据 (snake_case)
   * @returns TypeScript格式的Context实体数据
   */
  static fromSchema(schema: ContextSchema): ContextEntityData {
    return {
      // 基础协议字段映射
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      status: schema.status,
      lifecycleStage: schema.lifecycle_stage,

      // 核心功能字段映射 (转换为camelCase)
      sharedState: this.sharedStateFromSchema(schema.shared_state),
      accessControl: this.accessControlFromSchema(schema.access_control),
      configuration: this.configurationFromSchema(schema.configuration),

      // 企业级功能字段映射
      auditTrail: this.auditTrailFromSchema(schema.audit_trail),
      monitoringIntegration: this.objectToCamelCase(schema.monitoring_integration),
      performanceMetrics: this.objectToCamelCase(schema.performance_metrics),
      versionHistory: this.objectToCamelCase(schema.version_history),
      searchMetadata: this.objectToCamelCase(schema.search_metadata),
      cachingPolicy: this.objectToCamelCase(schema.caching_policy),
      syncConfiguration: this.objectToCamelCase(schema.sync_configuration),
      errorHandling: this.objectToCamelCase(schema.error_handling),
      integrationEndpoints: this.objectToCamelCase(schema.integration_endpoints),
      eventIntegration: this.objectToCamelCase(schema.event_integration)
    };
  }

  /**
   * 验证Schema格式数据
   *
   * @param data - 待验证的数据
   * @returns 类型守卫结果
   */
  static validateSchema(data: unknown): data is ContextSchema {
    try {
      if (!data || typeof data !== 'object') {
        return false;
      }

      const schema = data as Record<string, unknown>;

      // 验证必需字段
      const requiredFields = [
        'protocol_version', 'timestamp', 'context_id', 'name', 'status', 'lifecycle_stage',
        'shared_state', 'access_control', 'configuration', 'audit_trail',
        'monitoring_integration', 'performance_metrics', 'version_history',
        'search_metadata', 'caching_policy', 'sync_configuration',
        'error_handling', 'integration_endpoints', 'event_integration'
      ];

      for (const field of requiredFields) {
        if (!(field in schema)) {
          return false;
        }
      }

      // 验证基础字段类型
      if (typeof schema.protocol_version !== 'string' ||
          typeof schema.timestamp !== 'string' ||
          typeof schema.context_id !== 'string' ||
          typeof schema.name !== 'string' ||
          typeof schema.status !== 'string' ||
          typeof schema.lifecycle_stage !== 'string') {
        return false;
      }

      // 验证复杂对象字段
      if (typeof schema.shared_state !== 'object' ||
          typeof schema.access_control !== 'object' ||
          typeof schema.configuration !== 'object' ||
          typeof schema.audit_trail !== 'object') {
        return false;
      }

      // 验证协议版本格式
      if (!this.validateProtocolVersion(schema.protocol_version as string)) {
        return false;
      }

      // 验证时间戳格式
      if (!this.validateTimestamp(schema.timestamp as string)) {
        return false;
      }

      // 验证UUID格式
      if (!this.validateUUID(schema.context_id as string)) {
        return false;
      }

      // 验证枚举值
      if (!this.validateStatus(schema.status as string)) {
        return false;
      }

      if (!this.validateLifecycleStage(schema.lifecycle_stage as string)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 批量转换：TypeScript数组 → Schema数组
   */
  static toSchemaArray(entities: ContextEntityData[]): ContextSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript数组
   */
  static fromSchemaArray(schemas: ContextSchema[]): ContextEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  // ===== 私有辅助方法 =====

  /**
   * SharedState对象转换为Schema格式
   */
  private static sharedStateToSchema(sharedState: SharedState | Partial<SharedState> | undefined): Record<string, unknown> {
    if (!sharedState) {
      return {
        variables: {},
        resources: { allocated: {}, requirements: {} },
        dependencies: [],
        goals: []
      };
    }

    return {
      variables: sharedState.variables || {},
      resources: {
        allocated: sharedState.resources?.allocated || {},
        limits: sharedState.resources?.limits || {}
      },
      dependencies: sharedState.dependencies || [],
      goals: sharedState.goals || []
    };
  }

  /**
   * Schema格式转换为SharedState对象
   */
  private static sharedStateFromSchema(schema: Record<string, unknown>): SharedState {
    return {
      variables: (schema.variables as Record<string, string | number | boolean | object>) || {},
      resources: {
        allocated: (schema.resources as Record<string, unknown>)?.allocated as Record<string, {
          type: string;
          amount: number;
          unit: string;
          status: 'available' | 'allocated' | 'exhausted';
        }> || {},
        limits: (schema.resources as Record<string, unknown>)?.limits as Record<string, {
          max_amount: number;
          unit: string;
          enforcement_policy: string;
        }> || {}
      },
      dependencies: (schema.dependencies as string[]) || [],
      goals: (schema.goals as string[]) || []
    };
  }

  /**
   * AccessControl对象转换为Schema格式
   */
  private static accessControlToSchema(accessControl: AccessControl | Partial<AccessControl> | undefined): Record<string, unknown> {
    if (!accessControl) {
      return {
        owner: { user_id: '', role: '' },
        permissions: [],
        policies: []
      };
    }
    return {
      owner: {
        user_id: accessControl.owner?.userId || '',
        role: accessControl.owner?.role || ''
      },
      permissions: (accessControl.permissions || []).map(perm => ({
        principal: perm.principal,
        principal_type: perm.principalType,
        resource: perm.resource,
        actions: perm.actions,
        conditions: perm.conditions
      })),
      policies: accessControl.policies?.map(policy => ({
        id: policy.id,
        name: policy.name,
        type: policy.type,
        rules: policy.rules,
        enforcement: policy.enforcement
      }))
    };
  }

  /**
   * Schema格式转换为AccessControl对象
   */
  private static accessControlFromSchema(schema: Record<string, unknown>): AccessControl {
    const owner = schema.owner as Record<string, unknown>;
    return {
      owner: {
        userId: owner.user_id as string,
        role: owner.role as string
      },
      permissions: ((schema.permissions as unknown[]) || []).map((perm: unknown) => {
        const permObj = perm as Record<string, unknown>;
        return {
          principal: permObj.principal as string,
          principalType: permObj.principal_type as PrincipalType,
          resource: permObj.resource as string,
          actions: permObj.actions as unknown as Permission[],
          conditions: permObj.conditions as Record<string, unknown>
        };
      }),
      policies: ((schema.policies as unknown[]) || []).map((policy: unknown) => {
        const policyObj = policy as Record<string, unknown>;
        return {
          id: policyObj.id as string,
          name: policyObj.name as string,
          type: policyObj.type as PolicyType,
          rules: policyObj.rules as Record<string, unknown>[],
          enforcement: policyObj.enforcement as PolicyEnforcement
        };
      })
    };
  }

  /**
   * Configuration对象转换为Schema格式
   */
  private static configurationToSchema(configuration: Configuration | Partial<Configuration> | undefined): Record<string, unknown> {
    if (!configuration) {
      return {
        timeout_settings: { default_timeout: 30000, max_timeout: 300000 },
        persistence: { enabled: true, storage_backend: 'memory' }
      };
    }
    return {
      timeout_settings: {
        default_timeout: configuration.timeoutSettings?.defaultTimeout || 30000,
        max_timeout: configuration.timeoutSettings?.maxTimeout || 300000,
        cleanup_timeout: configuration.timeoutSettings?.cleanupTimeout
      },
      notification_settings: configuration.notificationSettings ? {
        enabled: configuration.notificationSettings.enabled,
        channels: configuration.notificationSettings.channels,
        events: configuration.notificationSettings.events
      } : undefined,
      persistence: {
        enabled: configuration.persistence?.enabled || true,
        storage_backend: configuration.persistence?.storageBackend || 'memory',
        retention_policy: configuration.persistence?.retentionPolicy ? {
          duration: configuration.persistence.retentionPolicy.duration,
          max_versions: configuration.persistence.retentionPolicy.maxVersions
        } : undefined
      }
    };
  }

  /**
   * Schema格式转换为Configuration对象
   */
  private static configurationFromSchema(schema: Record<string, unknown>): Configuration {
    const timeoutSettings = schema.timeout_settings as Record<string, unknown>;
    const notificationSettings = schema.notification_settings as Record<string, unknown>;
    const persistence = schema.persistence as Record<string, unknown>;

    return {
      timeoutSettings: {
        defaultTimeout: timeoutSettings.default_timeout as number,
        maxTimeout: timeoutSettings.max_timeout as number,
        cleanupTimeout: timeoutSettings.cleanup_timeout as number
      },
      notificationSettings: notificationSettings ? {
        enabled: notificationSettings.enabled as boolean,
        channels: notificationSettings.channels as unknown as ('email' | 'webhook' | 'sms' | 'push')[],
        events: notificationSettings.events as unknown as ('created' | 'updated' | 'completed' | 'failed' | 'timeout')[]
      } : undefined,
      persistence: {
        enabled: persistence.enabled as boolean,
        storageBackend: persistence.storage_backend as 'memory' | 'database' | 'file' | 'redis',
        retentionPolicy: persistence.retention_policy ? {
          duration: (persistence.retention_policy as Record<string, unknown>).duration as string,
          maxVersions: (persistence.retention_policy as Record<string, unknown>).max_versions as number
        } : undefined
      }
    };
  }

  /**
   * AuditTrail对象转换为Schema格式
   */
  private static auditTrailToSchema(auditTrail: AuditTrail): Record<string, unknown> {
    return {
      enabled: auditTrail.enabled,
      retention_days: auditTrail.retentionDays,
      audit_events: auditTrail.auditEvents?.map(event => ({
        event_id: event.eventId,
        event_type: event.eventType,
        timestamp: event.timestamp,
        user_id: event.userId,
        user_role: event.userRole,
        action: event.action,
        resource: event.resource,
        context_operation: event.contextOperation,
        context_id: event.contextId,
        context_name: event.contextName,
        lifecycle_stage: event.lifecycleStage,
        shared_state_keys: event.sharedStateKeys,
        access_level: event.accessLevel,
        context_details: event.contextDetails,
        old_value: event.oldValue,
        new_value: event.newValue,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        session_id: event.sessionId,
        correlation_id: event.correlationId
      })),
      compliance_settings: auditTrail.complianceSettings ? {
        gdpr_enabled: auditTrail.complianceSettings.gdprEnabled,
        hipaa_enabled: auditTrail.complianceSettings.hipaaEnabled,
        sox_enabled: auditTrail.complianceSettings.soxEnabled,
        context_audit_level: auditTrail.complianceSettings.contextAuditLevel,
        context_data_logging: auditTrail.complianceSettings.contextDataLogging,
        custom_compliance: auditTrail.complianceSettings.customCompliance
      } : undefined
    };
  }

  /**
   * Schema格式转换为AuditTrail对象
   */
  private static auditTrailFromSchema(schema: Record<string, unknown>): AuditTrail {
    const complianceSettings = schema.compliance_settings as Record<string, unknown>;

    return {
      enabled: schema.enabled as boolean,
      retentionDays: schema.retention_days as number,
      auditEvents: ((schema.audit_events as unknown[]) || []).map((event: unknown) => {
        const eventObj = event as Record<string, unknown>;
        return {
          eventId: eventObj.event_id as string,
          eventType: eventObj.event_type as 'context_created' | 'context_updated' | 'context_deleted' | 'context_accessed' | 'context_shared' | 'permission_changed' | 'state_changed' | 'cache_updated' | 'sync_executed',
          timestamp: eventObj.timestamp as string,
          userId: eventObj.user_id as string,
          userRole: eventObj.user_role as string,
          action: eventObj.action as string,
          resource: eventObj.resource as string,
          contextOperation: eventObj.context_operation as string,
          contextId: eventObj.context_id as string,
          contextName: eventObj.context_name as string,
          lifecycleStage: eventObj.lifecycle_stage as string,
          sharedStateKeys: eventObj.shared_state_keys as string[],
          accessLevel: eventObj.access_level as string,
          contextDetails: eventObj.context_details as Record<string, unknown>,
          oldValue: eventObj.old_value as Record<string, unknown> | undefined,
          newValue: eventObj.new_value as Record<string, unknown> | undefined,
          ipAddress: eventObj.ip_address as string,
          userAgent: eventObj.user_agent as string,
          sessionId: eventObj.session_id as string,
          correlationId: eventObj.correlation_id as string
        };
      }),
      complianceSettings: complianceSettings ? {
        gdprEnabled: complianceSettings.gdpr_enabled as boolean,
        hipaaEnabled: complianceSettings.hipaa_enabled as boolean,
        soxEnabled: complianceSettings.sox_enabled as boolean,
        contextAuditLevel: complianceSettings.context_audit_level as 'basic' | 'detailed' | 'comprehensive',
        contextDataLogging: complianceSettings.context_data_logging as boolean,
        customCompliance: complianceSettings.custom_compliance as string[]
      } : undefined
    };
  }

  /**
   * 通用对象转换为snake_case
   */
  private static objectToSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;
    
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
   * 通用对象转换为camelCase
   */
  private static objectToCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;

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

  // ===== 验证辅助方法 =====

  /**
   * 验证协议版本格式
   */
  private static validateProtocolVersion(version: string): boolean {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return semverRegex.test(version);
  }

  /**
   * 验证时间戳格式 (ISO 8601)
   */
  private static validateTimestamp(timestamp: string): boolean {
    try {
      const date = new Date(timestamp);
      return date.toISOString() === timestamp;
    } catch {
      return false;
    }
  }

  /**
   * 验证UUID格式
   */
  private static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * 验证状态枚举值
   */
  private static validateStatus(status: string): boolean {
    const validStatuses = ['active', 'suspended', 'completed', 'terminated'];
    return validStatuses.includes(status);
  }

  /**
   * 验证生命周期阶段枚举值
   */
  private static validateLifecycleStage(stage: string): boolean {
    const validStages = ['planning', 'executing', 'monitoring', 'completed'];
    return validStages.includes(stage);
  }

  /**
   * 验证映射一致性
   */
  static validateMappingConsistency(
    entity: ContextEntityData,
    schema: ContextSchema
  ): { isConsistent: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // 转换实体到Schema再转换回来
      const convertedSchema = this.toSchema(entity);
      const convertedEntity = this.fromSchema(schema);

      // 验证关键字段一致性
      if (entity.contextId !== convertedEntity.contextId) {
        errors.push('Context ID mapping inconsistency');
      }
      if (entity.name !== convertedEntity.name) {
        errors.push('Name mapping inconsistency');
      }
      if (entity.status !== convertedEntity.status) {
        errors.push('Status mapping inconsistency');
      }
      if (entity.lifecycleStage !== convertedEntity.lifecycleStage) {
        errors.push('Lifecycle stage mapping inconsistency');
      }

      // 验证Schema字段一致性
      if (schema.context_id !== convertedSchema.context_id) {
        errors.push('Schema context_id mapping inconsistency');
      }
      if (schema.name !== convertedSchema.name) {
        errors.push('Schema name mapping inconsistency');
      }

      return {
        isConsistent: errors.length === 0,
        errors
      };
    } catch (error) {
      errors.push(`Mapping validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isConsistent: false,
        errors
      };
    }
  }
}
