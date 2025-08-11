/**
 * ⚙️ Extension Configuration Service Interface
 *
 * 企业级扩展配置管理接口定义
 * 严格遵循Schema驱动开发和双重命名约定
 *
 * @created 2025-08-10T19:45:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配mplp-extension.json Schema定义
 * @rules 双重命名约定 + 零技术债务 + DDD架构
 */

import { Extension as _Extension } from '../../domain/entities/extension.entity';
import { ExtensionProtocolSchema } from '../../api/mappers/extension.mapper';

/**
 * ⚙️ 配置验证结果 (Schema格式 - snake_case)
 */
export interface ConfigurationValidationResultSchema {
  extension_id?: string; // 扩展ID (测试兼容)
  valid: boolean;
  passed?: boolean; // 兼容旧测试
  validation_timestamp: string; // ISO 8601
  errors?: ValidationErrorSchema[]; // 直接错误列表(测试兼容)
  warnings?: ValidationWarningSchema[]; // 直接警告列表(测试兼容)
  schema_validation: {
    schema_valid: boolean;
    schema_errors: string[];
  };
  value_validation: {
    values_valid: boolean;
    value_errors: ValidationErrorSchema[];
    warnings: ValidationWarningSchema[];
  };
  rule_validation: {
    rules_applied: string[];
    rule_violations: RuleViolationSchema[];
  };
  recommendations: string[];
}

/**
 * ⚙️ 配置验证错误 (Schema格式 - snake_case)
 */
export interface ValidationErrorSchema {
  field_path: string;
  error_message: string;
  expected_type: string;
  actual_value: unknown;
  severity: 'error' | 'warning' | 'info';
  code?: string; // 错误代码 (兼容)
  message?: string; // 错误消息 (兼容)
}

/**
 * ⚙️ 配置验证警告 (Schema格式 - snake_case)
 */
export interface ValidationWarningSchema {
  field_path: string;
  warning_message: string;
  suggested_value?: unknown;
  impact_level: 'low' | 'medium' | 'high';
  // 兼容旧版本属性
  code?: string; // 警告代码 (兼容)
  message?: string; // 警告消息 (兼容)
  details?: string; // 警告详情 (兼容)
  path?: string; // 路径 (兼容)
}

/**
 * ⚙️ 规则违规记录 (Schema格式 - snake_case)
 */
export interface RuleViolationSchema {
  rule_name: string;
  violation_message: string;
  field_path: string;
  severity: 'error' | 'warning' | 'info';
  fix_suggestion?: string;
}

/**
 * ⚙️ 配置更新请求 (Schema格式 - snake_case)
 */
export interface ConfigurationUpdateRequestSchema {
  extension_id: string;
  configuration_updates: Record<string, unknown>;
  update_mode: 'merge' | 'replace' | 'partial';
  validate_before_update: boolean;
  backup_current_config: boolean;
  update_reason?: string;
}

/**
 * ⚙️ 配置更新结果 (Schema格式 - snake_case)
 */
export interface ConfigurationUpdateResultSchema {
  success: boolean;
  extension_id: string;
  message?: string; // 操作消息
  updated_configuration?: Record<string, unknown>;
  previous_configuration?: Record<string, unknown>;
  validation_result?: ConfigurationValidationResultSchema;
  update_timestamp: string; // ISO 8601
  backup_id?: string;
  rollback_available?: boolean;
}

/**
 * ⚙️ 配置备份记录 (Schema格式 - snake_case)
 */
export interface ConfigurationBackupSchema {
  backup_id: string;
  extension_id: string;
  backup_timestamp: string; // ISO 8601
  configuration_snapshot: Record<string, unknown>;
  backup_reason: string;
  retention_until: string; // ISO 8601
  metadata?: Record<string, unknown>; // 备份元数据
}

/**
 * ⚙️ 配置回滚请求 (Schema格式 - snake_case)
 */
export interface ConfigurationRollbackRequestSchema {
  extension_id: string;
  target_backup_id?: string;
  rollback_to_timestamp?: string; // ISO 8601
  rollback_reason: string;
  validate_after_rollback: boolean;
}

/**
 * ⚙️ 配置回滚结果 (Schema格式 - snake_case)
 */
export interface ConfigurationRollbackResultSchema {
  success: boolean;
  extension_id: string;
  message?: string; // 回滚消息
  restored_configuration?: Record<string, unknown>;
  rolled_back_to_config?: Record<string, unknown>; // 兼容性
  rollback_timestamp: string; // ISO 8601
  validation_result?: ConfigurationValidationResultSchema;
  backup_id_used?: string;
}

/**
 * ⚙️ 配置模板请求 (Schema格式 - snake_case)
 */
export interface ConfigurationTemplateRequestSchema {
  extension_type: string;
  template_name: string;
  use_case_category: 'basic' | 'advanced' | 'enterprise' | 'custom';
  include_examples: boolean;
  include_validation_rules: boolean;
}

/**
 * ⚙️ 配置模板结果 (Schema格式 - snake_case)
 */
export interface ConfigurationTemplateResultSchema {
  template_id?: string; // 模板ID (兼容)
  template_name: string;
  template_version?: string;
  extension_type?: string; // 扩展类型 (兼容)
  use_case_category?: string; // 使用场景 (兼容)
  generated_timestamp?: string; // 生成时间戳 (兼容)
  configuration_schema: Record<string, unknown>;
  default_configuration: Record<string, unknown>;
  default_values?: Record<string, unknown>; // 默认值 (兼容)
  validation_rules: ValidationRuleSchema[];
  usage_examples?: ConfigurationExampleSchema[];
  usage_instructions?: string[]; // 使用指南 (兼容)
  best_practices?: string[];
}

/**
 * ⚙️ 验证规则定义 (Schema格式 - snake_case)
 */
export interface ValidationRuleSchema {
  rule_id: string;
  rule_name: string;
  rule_expression: string;
  error_message: string;
  severity: 'error' | 'warning' | 'info';
  applicable_fields: string[];
  // 兼容旧版本属性
  name?: string;
  type?: string;
  expression?: unknown;
  rule?: unknown;
  message?: string;
}

/**
 * ⚙️ 配置示例 (Schema格式 - snake_case)
 */
export interface ConfigurationExampleSchema {
  example_name: string;
  description: string;
  use_case: string;
  configuration_values: Record<string, unknown>;
  expected_behavior: string;
}

/**
 * ⚙️ 配置导出请求 (Schema格式 - snake_case)
 */
export interface ConfigurationExportRequestSchema {
  extension_ids: string[];
  export_format: 'json' | 'yaml' | 'toml' | 'env';
  include_schema: boolean;
  include_comments: boolean;
  include_metadata: boolean;
}

/**
 * ⚙️ 配置导出结果 (Schema格式 - snake_case)
 */
export interface ConfigurationExportResultSchema {
  export_id: string;
  export_timestamp: string; // ISO 8601
  export_format: string;
  exported_configurations: ConfigurationExportItemSchema[];
  export_metadata: {
    total_extensions: number;
    total_configuration_keys: number;
    export_size_bytes: number;
  };
}

/**
 * ⚙️ 配置导出项 (Schema格式 - snake_case)
 */
export interface ConfigurationExportItemSchema {
  extension_id: string;
  extension_name: string;
  configuration_data: string; // Serialized in requested format
  schema_data?: string; // Optional schema export
}

/**
 * ⚙️ 配置历史条目 (内部使用 - camelCase)
 */
export interface ConfigurationHistoryEntry {
  timestamp: string;
  operation: string;
  action?: string; // 操作动作
  configuration: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  reason?: string; // 操作原因 (兼容)
  backup_id?: string; // 备份ID (兼容)
}

/**
 * ⚙️ Extension Configuration Service Interface
 *
 * 企业级扩展配置管理服务接口
 * 严格使用Schema格式进行输入输出 (snake_case)
 */
export interface IExtensionConfigurationService {
  /**
   * 🔍 验证扩展配置
   *
   * 对扩展的配置进行全面验证，包括Schema验证、值验证、规则验证
   */
  validateConfiguration(
    extensionData: ExtensionProtocolSchema
  ): Promise<ConfigurationValidationResultSchema>;

  /**
   * ⚙️ 更新扩展配置
   *
   * 安全地更新扩展配置，支持备份、验证、回滚机制
   */
  updateConfiguration(
    updateRequest: ConfigurationUpdateRequestSchema
  ): Promise<ConfigurationUpdateResultSchema>;

  /**
   * 📦 备份扩展配置
   *
   * 创建配置备份，支持版本管理和定期清理
   */
  backupConfiguration(
    extensionId: string,
    backupReason: string
  ): Promise<ConfigurationBackupSchema>;

  /**
   * ↩️ 回滚扩展配置
   *
   * 将配置回滚到指定的备份点或时间戳
   */
  rollbackConfiguration(
    rollbackRequest: ConfigurationRollbackRequestSchema
  ): Promise<ConfigurationRollbackResultSchema>;

  /**
   * 📝 生成配置模板
   *
   * 基于扩展类型和用例生成配置模板和验证规则
   */
  generateConfigurationTemplate(
    templateRequest: ConfigurationTemplateRequestSchema
  ): Promise<ConfigurationTemplateResultSchema>;

  /**
   * 🔄 克隆扩展配置
   *
   * 复制一个扩展的配置到另一个扩展，支持配置转换
   */
  cloneConfiguration(
    sourceExtensionId: string,
    targetExtensionId: string,
    transformRules?: Record<string, string>
  ): Promise<ConfigurationUpdateResultSchema>;

  /**
   * 📊 比较配置差异
   *
   * 比较两个配置版本的差异，生成变更报告
   */
  compareConfigurations(
    extensionId: string,
    baseBackupId?: string,
    targetBackupId?: string
  ): Promise<ConfigurationValidationResultSchema>;

  /**
   * 📤 导出配置
   *
   * 导出一个或多个扩展的配置，支持多种格式
   */
  exportConfigurations(
    exportRequest: ConfigurationExportRequestSchema
  ): Promise<ConfigurationExportResultSchema>;

  /**
   * 📥 导入配置
   *
   * 从外部格式导入配置，支持验证和转换
   */
  importConfigurations(
    configurationData: string,
    format: string,
    extensionIds: string[]
  ): Promise<ConfigurationUpdateResultSchema[]>;

  /**
   * 🧹 清理配置备份
   *
   * 根据保留策略清理过期的配置备份
   */
  cleanupConfigurationBackups(
    extensionId: string,
    retentionDays: number
  ): Promise<{ deleted_backups: number; remaining_backups: number }>;
}
