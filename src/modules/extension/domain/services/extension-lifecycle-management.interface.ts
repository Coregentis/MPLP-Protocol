/**
 * Extension企业级生命周期管理服务接口
 *
 * 🎯 符合MPLP核心规则：
 * - 双重命名约定：基于mplp-extension.json Schema (snake_case)
 * - 零技术债务：严格类型安全，禁止any类型
 * - 模块标准化：DDD分层架构，依赖注入
 *
 * @version 1.0.0
 * @created 2025-08-10T17:00:00+08:00
 * @compliance 100% Schema合规性 - 完全基于mplp-extension.json Schema定义
 */

import { Extension } from '../entities/extension.entity';
import { ExtensionDependency as _ExtensionDependency } from '../../types';
import {
  ExtensionProtocolSchema,
  ExtensionDependencySchema,
} from '../../api/mappers/extension.mapper';

/**
 * 🔧 企业级扩展安装结果 (基于Schema snake_case)
 */
export interface ExtensionInstallationResultSchema {
  success: boolean;
  extension_id: string;
  installed_version: string;
  installation_path: string;
  dependencies_installed: string[];
  installation_time_ms: number;
  security_validation_passed: boolean;
  rollback_plan?: ExtensionRollbackPlanSchema;
  warnings?: string[];
  errors?: string[];
}

/**
 * 🔧 企业级扩展激活上下文 (基于Schema snake_case)
 */
export interface ExtensionActivationContextSchema {
  context_id: string;
  activation_mode: 'immediate' | 'deferred' | 'conditional';
  configuration_overrides?: Record<string, unknown>;
  environment_variables?: Record<string, string>;
  resource_limits?: ExtensionResourceLimitsSchema;
}

/**
 * 🔧 企业级扩展激活结果 (基于Schema snake_case)
 */
export interface ExtensionActivationResultSchema {
  success: boolean;
  activation_time_ms: number;
  activated_features: string[];
  loaded_configuration: Record<string, unknown>;
  allocated_resources: ExtensionResourceAllocationSchema;
  health_check_result: ExtensionHealthCheckSchema;
  performance_metrics: ExtensionPerformanceMetricsSchema;
  errors?: string[];
}

/**
 * 🔧 企业级扩展停用上下文 (基于Schema snake_case)
 */
export interface ExtensionDeactivationContextSchema {
  context_id: string;
  deactivation_mode: 'graceful' | 'forced' | 'emergency';
  cleanup_options: ExtensionCleanupOptionsSchema;
  data_backup_required: boolean;
}

/**
 * 🔧 企业级扩展停用结果 (基于Schema snake_case)
 */
export interface ExtensionDeactivationResultSchema {
  success: boolean;
  deactivation_time_ms: number;
  cleaned_resources: string[];
  backed_up_data: ExtensionDataBackupSchema[];
  final_state_snapshot: ExtensionStateSnapshotSchema;
  errors?: string[];
}

/**
 * 🔧 企业级扩展卸载选项 (基于Schema snake_case)
 */
export interface ExtensionUninstallOptionsSchema {
  remove_configuration: boolean;
  remove_data: boolean;
  backup_before_removal: boolean;
  force_removal: boolean;
  cleanup_dependencies: boolean;
}

/**
 * 🔧 企业级扩展卸载结果 (基于Schema snake_case)
 */
export interface ExtensionUninstallResultSchema {
  success: boolean;
  uninstall_time_ms: number;
  removed_files: string[];
  backed_up_data: ExtensionDataBackupSchema[];
  updated_dependencies: string[];
  system_state_changes: SystemStateChangeSchema[];
  errors?: string[];
}

/**
 * 🔧 企业级扩展更新结果 (基于Schema snake_case)
 */
export interface ExtensionUpdateResultSchema {
  success: boolean;
  update_time_ms: number;
  previous_version: string;
  new_version: string;
  migrated_configuration: boolean;
  migrated_data: boolean;
  performance_impact: PerformanceImpactAnalysisSchema;
  rollback_plan: ExtensionRollbackPlanSchema;
  errors?: string[];
}

/**
 * 🔧 企业级依赖解析结果 (基于Schema snake_case)
 */
export interface DependencyResolutionResultSchema {
  success: boolean;
  resolved_dependencies: ResolvedDependencySchema[];
  dependency_graph: DependencyGraphSchema;
  circular_dependencies: CircularDependencySchema[];
  missing_dependencies: MissingDependencySchema[];
  version_conflicts: VersionConflictSchema[];
  resolution_time_ms: number;
}

/**
 * 🔧 企业级兼容性检查结果 (基于Schema snake_case)
 */
export interface CompatibilityCheckResultSchema {
  compatible: boolean;
  compatibility_score: number;
  compatibility_issues: CompatibilityIssueSchema[];
  supported_features: string[];
  unsupported_features: string[];
  performance_warnings: PerformanceWarningSchema[];
  security_concerns: SecurityConcernSchema[];
}

/**
 * 🔧 企业级安全验证结果 (基于Schema snake_case)
 */
export interface SecurityValidationResultSchema {
  passed: boolean;
  security_score: number;
  vulnerabilities: SecurityVulnerabilitySchema[];
  signature_valid: boolean;
  permission_analysis: PermissionAnalysisSchema;
  sandbox_requirements: SandboxRequirementSchema[];
  threat_assessment: ThreatAssessmentSchema;
  recommendations: SecurityRecommendationSchema[];
}

/**
 * 🔧 企业级扩展回滚结果 (基于Schema snake_case)
 */
export interface ExtensionRollbackResultSchema {
  success: boolean;
  rollback_time_ms: number;
  restored_version: string;
  restored_configuration: Record<string, unknown>;
  restored_data: ExtensionDataBackupSchema[];
  system_integrity_check: SystemIntegrityCheckSchema;
  errors?: string[];
}

/**
 * 🔧 辅助Schema类型定义 (基于Schema snake_case)
 */
export interface ExtensionResourceLimitsSchema {
  max_memory_mb: number;
  max_cpu_percent: number;
  max_disk_mb: number;
  max_network_connections: number;
  execution_timeout_ms: number;
}

export interface ExtensionResourceAllocationSchema {
  allocated_memory_mb: number;
  allocated_cpu_percent: number;
  allocated_disk_mb: number;
  allocated_network_connections: number;
  allocated_ports: number[];
}

export interface ExtensionHealthCheckSchema {
  healthy: boolean;
  health_score: number;
  health_indicators: HealthIndicatorSchema[];
  last_check_time: string;
  next_check_time: string;
}

export interface ExtensionPerformanceMetricsSchema {
  startup_time_ms: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  request_latency_ms: number;
  throughput_rps: number;
  error_rate_percent: number;
}

export interface ExtensionCleanupOptionsSchema {
  cleanup_temporary_files: boolean;
  cleanup_cache: boolean;
  cleanup_logs: boolean;
  cleanup_user_data: boolean;
  cleanup_configuration: boolean;
}

export interface ExtensionDataBackupSchema {
  backup_id: string;
  backup_type: 'configuration' | 'user_data' | 'cache' | 'logs';
  backup_path: string;
  backup_size_bytes: number;
  backup_timestamp: string;
  restore_instructions: string;
}

export interface ExtensionStateSnapshotSchema {
  snapshot_id: string;
  extension_version: string;
  configuration_state: Record<string, unknown>;
  runtime_state: Record<string, unknown>;
  resource_state: ExtensionResourceAllocationSchema;
  timestamp: string;
}

export interface SystemStateChangeSchema {
  change_type:
    | 'file_system'
    | 'registry'
    | 'environment'
    | 'network'
    | 'permissions';
  change_description: string;
  affected_resources: string[];
  reversible: boolean;
  reverse_operation?: string;
}

export interface ExtensionRollbackPlanSchema {
  rollback_version: string;
  rollback_steps: RollbackStepSchema[];
  data_restoration: DataRestorationPlanSchema;
  configuration_restoration: ConfigurationRestorationPlanSchema;
  estimated_rollback_time_ms: number;
}

export interface ResolvedDependencySchema {
  dependency_name: string;
  resolved_version: string;
  installation_source: string;
  installation_time_ms: number;
}

export interface DependencyGraphSchema {
  nodes: DependencyNodeSchema[];
  edges: DependencyEdgeSchema[];
  depth: number;
  cycles: DependencyCycleSchema[];
}

export interface CircularDependencySchema {
  cycle_path: string[];
  cycle_length: number;
  resolution_strategy: string;
}

export interface MissingDependencySchema {
  dependency_name: string;
  required_version: string;
  required_by: string[];
  available_alternatives: string[];
}

export interface VersionConflictSchema {
  dependency_name: string;
  conflicting_versions: string[];
  required_by: string[];
  resolution_strategy: string;
}

export interface CompatibilityIssueSchema {
  issue_type: 'version_mismatch' | 'missing_dependency' | 'resource_conflict';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  resolution_suggestion: string;
}

export interface PerformanceWarningSchema {
  warning_type: 'high_memory_usage' | 'slow_startup' | 'high_cpu_usage';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  impact_assessment: string;
}

export interface SecurityConcernSchema {
  concern_type: 'permission_escalation' | 'data_exposure' | 'code_injection';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  mitigation_strategy: string;
}

export interface SecurityVulnerabilitySchema {
  vulnerability_id: string;
  vulnerability_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affected_components: string[];
  remediation: string;
}

export interface PermissionAnalysisSchema {
  requested_permissions: string[];
  granted_permissions: string[];
  excessive_permissions: string[];
  missing_permissions: string[];
  risk_assessment: string;
}

export interface SandboxRequirementSchema {
  requirement_type: 'isolation' | 'resource_limit' | 'network_restriction';
  description: string;
  enforcement_level: 'mandatory' | 'recommended' | 'optional';
}

export interface ThreatAssessmentSchema {
  threat_level: 'critical' | 'high' | 'medium' | 'low';
  identified_threats: string[];
  risk_factors: string[];
  recommended_actions: string[];
}

export interface SecurityRecommendationSchema {
  recommendation_type: 'configuration' | 'permission' | 'monitoring';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  implementation_steps: string[];
}

export interface SystemIntegrityCheckSchema {
  integrity_score: number;
  checked_components: string[];
  integrity_issues: IntegrityIssueSchema[];
  verification_timestamp: string;
}

export interface IntegrityIssueSchema {
  component_name: string;
  issue_type: 'checksum_mismatch' | 'missing_file' | 'permission_change';
  severity: 'critical' | 'major' | 'minor';
  description: string;
}

export interface HealthIndicatorSchema {
  indicator_name: string;
  current_value: number;
  threshold_value: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface RollbackStepSchema {
  step_name: string;
  step_type: 'file_restore' | 'config_restore' | 'database_restore';
  execution_order: number;
  rollback_command: string;
  verification_command?: string;
}

export interface DataRestorationPlanSchema {
  backup_sources: string[];
  restoration_steps: RollbackStepSchema[];
  estimated_time_ms: number;
}

export interface ConfigurationRestorationPlanSchema {
  config_backup_path: string;
  restoration_steps: RollbackStepSchema[];
  validation_checks: string[];
}

export interface DependencyNodeSchema {
  extension_id: string;
  version: string;
  dependencies: string[];
}

export interface DependencyEdgeSchema {
  from_extension: string;
  to_extension: string;
  dependency_type: 'required' | 'optional' | 'peer';
}

export interface DependencyCycleSchema {
  cycle_extensions: string[];
  cycle_type: 'direct' | 'indirect';
}

export interface PerformanceImpactAnalysisSchema {
  startup_time_change_ms: number;
  memory_usage_change_mb: number;
  cpu_usage_change_percent: number;
  disk_usage_change_mb: number;
  network_usage_change_kbps: number;
}

/**
 * 🎯 企业级扩展生命周期管理服务接口
 * 严格遵循双重命名约定：所有参数和返回值使用Schema格式 (snake_case)
 */
export interface IExtensionLifecycleManagementService {
  /**
   * 企业级扩展安装流程
   * @param extensionPackage 扩展包Schema数据
   * @returns 安装结果Schema
   */
  installExtension(
    extensionPackage: ExtensionProtocolSchema
  ): Promise<ExtensionInstallationResultSchema>;

  /**
   * 企业级扩展激活
   * @param extensionId 扩展ID
   * @param context 激活上下文Schema
   * @returns 激活结果Schema
   */
  activateExtension(
    extensionId: string,
    context: ExtensionActivationContextSchema
  ): Promise<ExtensionActivationResultSchema>;

  /**
   * 企业级扩展停用
   * @param extensionId 扩展ID
   * @param context 停用上下文Schema
   * @returns 停用结果Schema
   */
  deactivateExtension(
    extensionId: string,
    context: ExtensionDeactivationContextSchema
  ): Promise<ExtensionDeactivationResultSchema>;

  /**
   * 企业级扩展卸载
   * @param extensionId 扩展ID
   * @param options 卸载选项Schema
   * @returns 卸载结果Schema
   */
  uninstallExtension(
    extensionId: string,
    options: ExtensionUninstallOptionsSchema
  ): Promise<ExtensionUninstallResultSchema>;

  /**
   * 企业级扩展更新
   * @param extensionId 扩展ID
   * @param newVersion 新版本
   * @param updateData 更新数据Schema
   * @returns 更新结果Schema
   */
  updateExtension(
    extensionId: string,
    newVersion: string,
    updateData: Record<string, unknown>
  ): Promise<ExtensionUpdateResultSchema>;

  /**
   * 企业级依赖解析
   * @param dependencies 依赖列表Schema
   * @returns 依赖解析结果Schema
   */
  resolveDependencies(
    dependencies: ExtensionDependencySchema[]
  ): Promise<DependencyResolutionResultSchema>;

  /**
   * 企业级兼容性验证
   * @param extension 扩展实体
   * @param targetEnvironment 目标环境Schema
   * @returns 兼容性检查结果Schema
   */
  validateCompatibility(
    extension: Extension,
    targetEnvironment: Record<string, unknown>
  ): Promise<CompatibilityCheckResultSchema>;

  /**
   * 企业级安全验证
   * @param extensionPackage 扩展包Schema数据
   * @returns 安全验证结果Schema
   */
  performSecurityValidation(
    extensionPackage: ExtensionProtocolSchema
  ): Promise<SecurityValidationResultSchema>;

  /**
   * 企业级回滚机制
   * @param extensionId 扩展ID
   * @param targetVersion 目标版本
   * @returns 回滚结果Schema
   */
  rollbackExtension(
    extensionId: string,
    targetVersion: string
  ): Promise<ExtensionRollbackResultSchema>;
}
