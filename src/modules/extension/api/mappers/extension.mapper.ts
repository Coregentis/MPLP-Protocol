/**
 * Extension模块API层映射器
 * 
 * 严格遵循MPLP模块标准化规则和双重命名约定
 * - Schema层使用snake_case命名
 * - TypeScript层使用camelCase命名
 * - 提供完整的双向映射功能
 * 
 * @version 1.0.0
 * @created 2025-08-10
 * @compliance 模块标准化规则 - API层Mapper (MANDATORY)
 * @compliance 双重命名约定 - Schema↔TypeScript映射 (MANDATORY)
 */

import { UUID, Timestamp, Version } from '../../../../public/shared/types';
import {
  CreateExtensionRequestDto,
  UpdateExtensionRequestDto,
  ExtensionQueryRequestDto,
  ExtensionResponseDto,
  ExtensionOperationResultDto,
  ExtensionListResultDto,
  ExtensionTypeDto,
  ExtensionStatusDto,
  ExtensionCompatibilityDto,
  ExtensionConfigurationDto,
  ExtensionPointDto,
  ApiExtensionDto,
  EventSubscriptionDto,
  ExtensionLifecycleDto,
  ExtensionSecurityDto,
  ExtensionMetadataDto,
  RequiredModuleDto,
  ExtensionDependencyDto,
  ExtensionConflictDto,
  ValidationRuleDto,
  ResourceLimitsDto,
  PermissionDto,
  CodeSignatureDto,
  LifecycleHooksDto,
  RateLimitDto
} from '../dto/extension.dto';

// ===== Schema层接口定义 (snake_case) =====

/**
 * Extension协议Schema接口 (Schema层 - snake_case)
 */
export interface ExtensionProtocolSchema {
  protocol_version: Version;
  timestamp: Timestamp;
  extension_id: UUID;
  context_id: UUID;
  name: string;
  display_name?: string;
  description?: string;
  version: Version;
  extension_type: ExtensionTypeDto;
  status: ExtensionStatusDto;
  compatibility?: ExtensionCompatibilitySchema;
  configuration?: ExtensionConfigurationSchema;
  extension_points?: ExtensionPointSchema[];
  api_extensions?: ApiExtensionSchema[];
  event_subscriptions?: EventSubscriptionSchema[];
  lifecycle?: ExtensionLifecycleSchema;
  security?: ExtensionSecuritySchema;
  metadata?: ExtensionMetadataSchema;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

/**
 * 扩展兼容性Schema (Schema层 - snake_case)
 */
export interface ExtensionCompatibilitySchema {
  mplp_version: string;
  required_modules?: RequiredModuleSchema[];
  dependencies?: ExtensionDependencySchema[];
  conflicts?: ExtensionConflictSchema[];
}

/**
 * 必需模块Schema (Schema层 - snake_case)
 */
export interface RequiredModuleSchema {
  module: string;
  min_version?: Version;
  max_version?: Version;
}

/**
 * 扩展依赖Schema (Schema层 - snake_case)
 */
export interface ExtensionDependencySchema {
  extension_id: UUID;
  name: string;
  version_range: string;
  optional?: boolean;
}

/**
 * 扩展冲突Schema (Schema层 - snake_case)
 */
export interface ExtensionConflictSchema {
  extension_id: UUID;
  name: string;
  reason: string;
}

/**
 * 扩展配置Schema (Schema层 - snake_case)
 */
export interface ExtensionConfigurationSchema {
  schema: Record<string, unknown>;
  current_config: Record<string, unknown>;
  default_config?: Record<string, unknown>;
  validation_rules?: ValidationRuleSchema[];
}

/**
 * 验证规则Schema (Schema层 - snake_case)
 */
export interface ValidationRuleSchema {
  rule: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}

/**
 * 扩展点Schema (Schema层 - snake_case)
 */
export interface ExtensionPointSchema {
  point_id: UUID;
  name: string;
  type: 'hook' | 'filter' | 'action' | 'listener';
  target_module: string;
  event_name?: string;
  execution_order: number;
  enabled: boolean;
  parameters?: Record<string, unknown>;
}

/**
 * API扩展Schema (Schema层 - snake_case)
 */
export interface ApiExtensionSchema {
  endpoint_id: UUID;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  handler: string;
  middleware?: string[];
  authentication_required: boolean;
  rate_limit?: RateLimitSchema;
}

/**
 * 速率限制Schema (Schema层 - snake_case)
 */
export interface RateLimitSchema {
  requests_per_minute: number;
  burst_limit: number;
}

/**
 * 事件订阅Schema (Schema层 - snake_case)
 */
export interface EventSubscriptionSchema {
  subscription_id: UUID;
  event_pattern: string;
  source_module: string;
  handler: string;
  filter_conditions?: Record<string, unknown>;
  delivery_guarantees: 'at_most_once' | 'at_least_once' | 'exactly_once';
  dead_letter_queue?: boolean;
}

/**
 * 扩展生命周期Schema (Schema层 - snake_case)
 */
export interface ExtensionLifecycleSchema {
  install_date: Timestamp;
  last_update?: Timestamp;
  activation_count: number;
  error_count: number;
  last_error?: string;
  auto_start: boolean;
  load_priority: number;
  hooks?: LifecycleHooksSchema;
}

/**
 * 生命周期钩子Schema (Schema层 - snake_case)
 */
export interface LifecycleHooksSchema {
  on_install?: string;
  on_activate?: string;
  on_deactivate?: string;
  on_uninstall?: string;
  on_update?: string;
}

/**
 * 扩展安全Schema (Schema层 - snake_case)
 */
export interface ExtensionSecuritySchema {
  sandbox_enabled: boolean;
  resource_limits: ResourceLimitsSchema;
  permissions: PermissionSchema[];
  code_signature?: CodeSignatureSchema;
}

/**
 * 资源限制Schema (Schema层 - snake_case)
 */
export interface ResourceLimitsSchema {
  max_memory_mb?: number;
  max_cpu_percent?: number;
  max_file_size_mb?: number;
  max_network_connections?: number;
}

/**
 * 权限Schema (Schema层 - snake_case)
 */
export interface PermissionSchema {
  name: string;
  description: string;
  required: boolean;
}

/**
 * 代码签名Schema (Schema层 - snake_case)
 */
export interface CodeSignatureSchema {
  algorithm: string;
  signature: string;
  certificate: string;
  timestamp: Timestamp;
}

/**
 * 扩展元数据Schema (Schema层 - snake_case)
 */
export interface ExtensionMetadataSchema {
  author?: string;
  organization?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  keywords?: string[];
  category?: string;
}

// ===== Extension映射器类 =====

/**
 * Extension模块映射器
 * 实现Schema层(snake_case)和TypeScript层(camelCase)之间的双向映射
 */
export class ExtensionMapper {
  /**
   * TypeScript实体 → Schema格式 (camelCase → snake_case)
   */
  static toSchema(dto: ExtensionResponseDto): ExtensionProtocolSchema {
    return {
      protocol_version: dto.protocolVersion,
      timestamp: dto.timestamp,
      extension_id: dto.extensionId,
      context_id: dto.contextId,
      name: dto.name,
      display_name: dto.displayName,
      description: dto.description,
      version: dto.version,
      extension_type: dto.extensionType,
      status: dto.status,
      compatibility: dto.compatibility ? this.mapCompatibilityToSchema(dto.compatibility) : undefined,
      configuration: dto.configuration ? this.mapConfigurationToSchema(dto.configuration) : undefined,
      extension_points: dto.extensionPoints ? dto.extensionPoints.map(ep => this.mapExtensionPointToSchema(ep)) : undefined,
      api_extensions: dto.apiExtensions ? dto.apiExtensions.map(ae => this.mapApiExtensionToSchema(ae)) : undefined,
      event_subscriptions: dto.eventSubscriptions ? dto.eventSubscriptions.map(es => this.mapEventSubscriptionToSchema(es)) : undefined,
      lifecycle: dto.lifecycle ? this.mapLifecycleToSchema(dto.lifecycle) : undefined,
      security: dto.security ? this.mapSecurityToSchema(dto.security) : undefined,
      metadata: dto.metadata ? this.mapMetadataToSchema(dto.metadata) : undefined,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt
    };
  }

  /**
   * Schema格式 → TypeScript数据 (snake_case → camelCase)
   */
  static fromSchema(schema: ExtensionProtocolSchema): ExtensionResponseDto {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      extensionId: schema.extension_id,
      contextId: schema.context_id,
      name: schema.name,
      displayName: schema.display_name,
      description: schema.description,
      version: schema.version,
      extensionType: schema.extension_type,
      status: schema.status,
      compatibility: schema.compatibility ? this.mapCompatibilityFromSchema(schema.compatibility) : undefined,
      configuration: schema.configuration ? this.mapConfigurationFromSchema(schema.configuration) : undefined,
      extensionPoints: schema.extension_points ? schema.extension_points.map(ep => this.mapExtensionPointFromSchema(ep)) : undefined,
      apiExtensions: schema.api_extensions ? schema.api_extensions.map(ae => this.mapApiExtensionFromSchema(ae)) : undefined,
      eventSubscriptions: schema.event_subscriptions ? schema.event_subscriptions.map(es => this.mapEventSubscriptionFromSchema(es)) : undefined,
      lifecycle: schema.lifecycle ? this.mapLifecycleFromSchema(schema.lifecycle) : undefined,
      security: schema.security ? this.mapSecurityFromSchema(schema.security) : undefined,
      metadata: schema.metadata ? this.mapMetadataFromSchema(schema.metadata) : undefined,
      createdAt: schema.created_at || schema.timestamp,
      updatedAt: schema.updated_at || schema.timestamp
    };
  }

  /**
   * 验证Schema数据
   */
  static validateSchema(data: unknown): data is ExtensionProtocolSchema {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const schema = data as Record<string, unknown>;
    
    // 验证必需字段
    const requiredFields = [
      'protocol_version',
      'timestamp', 
      'extension_id',
      'context_id',
      'name',
      'version',
      'extension_type',
      'status'
    ];

    return requiredFields.every(field => 
      field in schema && schema[field] !== undefined && schema[field] !== null
    );
  }

  /**
   * 批量转换方法 (TypeScript → Schema)
   */
  static toSchemaArray(dtos: ExtensionResponseDto[]): ExtensionProtocolSchema[] {
    return dtos.map(dto => this.toSchema(dto));
  }

  /**
   * 批量转换方法 (Schema → TypeScript)
   */
  static fromSchemaArray(schemas: ExtensionProtocolSchema[]): ExtensionResponseDto[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  // ===== 私有映射方法 =====

  private static mapCompatibilityToSchema(dto: ExtensionCompatibilityDto): ExtensionCompatibilitySchema {
    return {
      mplp_version: dto.mplpVersion,
      required_modules: dto.requiredModules?.map(rm => ({
        module: rm.module,
        min_version: rm.minVersion,
        max_version: rm.maxVersion
      })),
      dependencies: dto.dependencies?.map(dep => ({
        extension_id: dep.extensionId,
        name: dep.name,
        version_range: dep.versionRange,
        optional: dep.optional
      })),
      conflicts: dto.conflicts?.map(conf => ({
        extension_id: conf.extensionId,
        name: conf.name,
        reason: conf.reason
      }))
    };
  }

  private static mapCompatibilityFromSchema(schema: ExtensionCompatibilitySchema): ExtensionCompatibilityDto {
    return {
      mplpVersion: schema.mplp_version,
      requiredModules: schema.required_modules?.map(rm => ({
        module: rm.module as any,
        minVersion: rm.min_version,
        maxVersion: rm.max_version
      })),
      dependencies: schema.dependencies?.map(dep => ({
        extensionId: dep.extension_id,
        name: dep.name,
        versionRange: dep.version_range,
        optional: dep.optional
      })),
      conflicts: schema.conflicts?.map(conf => ({
        extensionId: conf.extension_id,
        name: conf.name,
        reason: conf.reason
      }))
    };
  }

  private static mapConfigurationToSchema(dto: ExtensionConfigurationDto): ExtensionConfigurationSchema {
    return {
      schema: dto.schema,
      current_config: dto.currentConfig,
      default_config: dto.defaultConfig,
      validation_rules: dto.validationRules?.map(rule => ({
        rule: rule.rule,
        level: rule.level,
        message: rule.message
      }))
    };
  }

  private static mapConfigurationFromSchema(schema: ExtensionConfigurationSchema): ExtensionConfigurationDto {
    return {
      schema: schema.schema,
      currentConfig: schema.current_config,
      defaultConfig: schema.default_config,
      validationRules: schema.validation_rules?.map(rule => ({
        rule: rule.rule,
        level: rule.level,
        message: rule.message
      }))
    };
  }

  private static mapExtensionPointToSchema(dto: ExtensionPointDto): ExtensionPointSchema {
    return {
      point_id: dto.pointId,
      name: dto.name,
      type: dto.type,
      target_module: dto.targetModule,
      event_name: dto.eventName,
      execution_order: dto.executionOrder,
      enabled: dto.enabled,
      parameters: dto.parameters
    };
  }

  private static mapExtensionPointFromSchema(schema: ExtensionPointSchema): ExtensionPointDto {
    return {
      pointId: schema.point_id,
      name: schema.name,
      type: schema.type,
      targetModule: schema.target_module as any,
      eventName: schema.event_name,
      executionOrder: schema.execution_order,
      enabled: schema.enabled,
      parameters: schema.parameters
    };
  }

  private static mapApiExtensionToSchema(dto: ApiExtensionDto): ApiExtensionSchema {
    return {
      endpoint_id: dto.endpointId,
      path: dto.path,
      method: dto.method,
      description: dto.description,
      handler: dto.handler,
      middleware: dto.middleware,
      authentication_required: dto.authenticationRequired,
      rate_limit: dto.rateLimit ? {
        requests_per_minute: dto.rateLimit.requestsPerMinute,
        burst_limit: dto.rateLimit.burstLimit
      } : undefined
    };
  }

  private static mapApiExtensionFromSchema(schema: ApiExtensionSchema): ApiExtensionDto {
    return {
      endpointId: schema.endpoint_id,
      path: schema.path,
      method: schema.method,
      description: schema.description,
      handler: schema.handler,
      middleware: schema.middleware,
      authenticationRequired: schema.authentication_required,
      rateLimit: schema.rate_limit ? {
        requestsPerMinute: schema.rate_limit.requests_per_minute,
        burstLimit: schema.rate_limit.burst_limit
      } : undefined
    };
  }

  private static mapEventSubscriptionToSchema(dto: EventSubscriptionDto): EventSubscriptionSchema {
    return {
      subscription_id: dto.subscriptionId,
      event_pattern: dto.eventPattern,
      source_module: dto.sourceModule,
      handler: dto.handler,
      filter_conditions: dto.filterConditions,
      delivery_guarantees: dto.deliveryGuarantees,
      dead_letter_queue: dto.deadLetterQueue
    };
  }

  private static mapEventSubscriptionFromSchema(schema: EventSubscriptionSchema): EventSubscriptionDto {
    return {
      subscriptionId: schema.subscription_id,
      eventPattern: schema.event_pattern,
      sourceModule: schema.source_module as any,
      handler: schema.handler,
      filterConditions: schema.filter_conditions,
      deliveryGuarantees: schema.delivery_guarantees,
      deadLetterQueue: schema.dead_letter_queue
    };
  }

  private static mapLifecycleToSchema(dto: ExtensionLifecycleDto): ExtensionLifecycleSchema {
    return {
      install_date: dto.installDate,
      last_update: dto.lastUpdate,
      activation_count: dto.activationCount,
      error_count: dto.errorCount,
      last_error: dto.lastError,
      auto_start: dto.autoStart,
      load_priority: dto.loadPriority,
      hooks: dto.hooks ? {
        on_install: dto.hooks.onInstall,
        on_activate: dto.hooks.onActivate,
        on_deactivate: dto.hooks.onDeactivate,
        on_uninstall: dto.hooks.onUninstall,
        on_update: dto.hooks.onUpdate
      } : undefined
    };
  }

  private static mapLifecycleFromSchema(schema: ExtensionLifecycleSchema): ExtensionLifecycleDto {
    return {
      installDate: schema.install_date,
      lastUpdate: schema.last_update,
      activationCount: schema.activation_count,
      errorCount: schema.error_count,
      lastError: schema.last_error,
      autoStart: schema.auto_start,
      loadPriority: schema.load_priority,
      hooks: schema.hooks ? {
        onInstall: schema.hooks.on_install,
        onActivate: schema.hooks.on_activate,
        onDeactivate: schema.hooks.on_deactivate,
        onUninstall: schema.hooks.on_uninstall,
        onUpdate: schema.hooks.on_update
      } : undefined
    };
  }

  private static mapSecurityToSchema(dto: ExtensionSecurityDto): ExtensionSecuritySchema {
    return {
      sandbox_enabled: dto.sandboxEnabled,
      resource_limits: {
        max_memory_mb: dto.resourceLimits.maxMemoryMb,
        max_cpu_percent: dto.resourceLimits.maxCpuPercent,
        max_file_size_mb: dto.resourceLimits.maxFileSizeMb,
        max_network_connections: dto.resourceLimits.maxNetworkConnections
      },
      permissions: dto.permissions.map(perm => ({
        name: perm.name,
        description: perm.description,
        required: perm.required
      })),
      code_signature: dto.codeSignature ? {
        algorithm: dto.codeSignature.algorithm,
        signature: dto.codeSignature.signature,
        certificate: dto.codeSignature.certificate,
        timestamp: dto.codeSignature.timestamp
      } : undefined
    };
  }

  private static mapSecurityFromSchema(schema: ExtensionSecuritySchema): ExtensionSecurityDto {
    return {
      sandboxEnabled: schema.sandbox_enabled,
      resourceLimits: {
        maxMemoryMb: schema.resource_limits.max_memory_mb,
        maxCpuPercent: schema.resource_limits.max_cpu_percent,
        maxFileSizeMb: schema.resource_limits.max_file_size_mb,
        maxNetworkConnections: schema.resource_limits.max_network_connections
      },
      permissions: schema.permissions.map(perm => ({
        name: perm.name,
        description: perm.description,
        required: perm.required
      })),
      codeSignature: schema.code_signature ? {
        algorithm: schema.code_signature.algorithm,
        signature: schema.code_signature.signature,
        certificate: schema.code_signature.certificate,
        timestamp: schema.code_signature.timestamp
      } : undefined
    };
  }

  private static mapMetadataToSchema(dto: ExtensionMetadataDto): ExtensionMetadataSchema {
    return {
      author: dto.author,
      organization: dto.organization,
      license: dto.license,
      homepage: dto.homepage,
      repository: dto.repository,
      documentation: dto.documentation,
      keywords: dto.keywords,
      category: dto.category
    };
  }

  private static mapMetadataFromSchema(schema: ExtensionMetadataSchema): ExtensionMetadataDto {
    return {
      author: schema.author,
      organization: schema.organization,
      license: schema.license,
      homepage: schema.homepage,
      repository: schema.repository,
      documentation: schema.documentation,
      keywords: schema.keywords,
      category: schema.category
    };
  }
}
