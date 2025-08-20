/**
 * Context响应DTO - 完整的14个功能域
 *
 * 基于mplp-context.json Schema的完整响应结构
 *
 * @version 2.0.0
 * @updated 2025-08-14
 */

import { UUID } from '../../../../../public/shared/types';

/**
 * Context响应DTO - 完整Schema映射
 */
export class ContextResponse {
  // ===== 基础协议字段 =====

  /**
   * 协议版本
   * @example "1.0.0"
   */
  protocol_version!: string;

  /**
   * 时间戳
   * @example "2025-08-14T10:00:00.000Z"
   */
  timestamp!: string;

  /**
   * Context ID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  context_id!: UUID;

  /**
   * Context名称
   * @example "项目上下文"
   */
  name!: string;

  /**
   * Context描述
   * @example "这是一个项目上下文描述"
   */
  description?: string;

  /**
   * 状态
   * @example "active"
   */
  status!: 'active' | 'inactive' | 'suspended' | 'deleted';

  /**
   * 生命周期阶段
   * @example "planning"
   */
  lifecycle_stage!: 'planning' | 'executing' | 'monitoring' | 'completed';

  // ===== 14个功能域 =====

  /**
   * 1. 共享状态管理
   */
  shared_state!: {
    variables: Record<string, unknown>;
    resources: {
      allocated: Record<string, {
        type: string;
        amount: number;
        unit: string;
        status: string;
      }>;
      requirements: Record<string, {
        minimum: number;
        optimal?: number;
        maximum?: number;
        unit: string;
      }>;
    };
    dependencies: Array<{
      id: string;
      type: string;
      name: string;
      version?: string;
      status: string;
    }>;
    goals: Array<{
      id: string;
      name: string;
      description?: string;
      priority: string;
      status: string;
      success_criteria?: Array<{
        metric: string;
        operator: string;
        value: string | number | boolean;
        unit?: string;
      }>;
    }>;
  };

  /**
   * 2. 访问控制管理
   */
  access_control!: {
    owner: {
      user_id: string;
      role: string;
    };
    permissions: Array<{
      principal: string;
      principal_type: string;
      resource: string;
      actions: string[];
      conditions?: Record<string, unknown>;
    }>;
    policies?: Array<{
      id: string;
      name: string;
      type: string;
      rules: unknown[];
      enforcement: string;
    }>;
  };

  /**
   * 3. 配置管理
   */
  configuration!: {
    timeout_settings: {
      default_timeout: number;
      max_timeout: number;
      cleanup_timeout?: number;
    };
    notification_settings?: {
      enabled: boolean;
      channels?: string[];
      events?: string[];
    };
    persistence: {
      enabled: boolean;
      storage_backend: string;
      retention_policy?: {
        duration?: string;
        max_versions?: number;
      };
    };
  };

  /**
   * 4. 审计跟踪
   */
  audit_trail!: {
    enabled: boolean;
    retention_days: number;
    audit_events: unknown[];
    compliance_settings?: Record<string, unknown>;
  };

  /**
   * 5. 监控集成
   */
  monitoring_integration!: {
    enabled: boolean;
    supported_providers: string[];
    integration_endpoints?: Record<string, unknown>;
    context_metrics?: Record<string, unknown>;
    export_formats: string[];
  };

  /**
   * 6. 性能指标
   */
  performance_metrics!: {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: Record<string, unknown>;
    health_status?: Record<string, unknown>;
    alerting?: Record<string, unknown>;
  };

  /**
   * 7. 版本历史
   */
  version_history!: {
    enabled: boolean;
    max_versions: number;
    versions: unknown[];
    auto_versioning?: Record<string, unknown>;
  };

  /**
   * 8. 搜索元数据
   */
  search_metadata!: {
    enabled: boolean;
    indexing_strategy: string;
    searchable_fields: string[];
    search_indexes: unknown[];
    context_indexing?: Record<string, unknown>;
    auto_indexing?: Record<string, unknown>;
  };

  /**
   * 9. 缓存策略
   */
  caching_policy!: {
    enabled: boolean;
    cache_strategy: string;
    cache_levels: unknown[];
    cache_warming?: Record<string, unknown>;
  };

  /**
   * 10. 同步配置
   */
  sync_configuration!: {
    enabled: boolean;
    sync_strategy: string;
    sync_targets: unknown[];
    replication?: Record<string, unknown>;
  };

  /**
   * 11. 错误处理
   */
  error_handling!: {
    enabled: boolean;
    error_policies: unknown[];
    circuit_breaker?: Record<string, unknown>;
    recovery_strategy?: Record<string, unknown>;
  };

  /**
   * 12. 集成端点
   */
  integration_endpoints!: {
    enabled: boolean;
    webhooks: unknown[];
    api_endpoints: unknown[];
  };

  /**
   * 13. 事件集成
   */
  event_integration!: {
    enabled: boolean;
    event_bus_connection?: Record<string, unknown>;
    published_events: string[];
    subscribed_events: string[];
    event_routing?: Record<string, unknown>;
  };
}