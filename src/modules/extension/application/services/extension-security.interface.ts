/**
 * 🔐 Extension Security Service Interface
 *
 * 企业级扩展安全管理接口定义
 * 严格遵循Schema驱动开发和双重命名约定
 *
 * @created 2025-08-10T18:45:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配mplp-extension.json Schema定义
 * @rules 双重命名约定 + 零技术债务 + DDD架构
 */

import { Extension as _Extension } from '../../domain/entities/extension.entity';
import { ExtensionProtocolSchema } from '../../../../../tests/test-utils/extension-test-factory';

/**
 * 🔐 安全验证结果 (Schema格式 - snake_case)
 */
export interface SecurityValidationResultSchema {
  passed: boolean;
  security_score: number; // 0-100
  validation_timestamp: string; // ISO 8601
  sandbox_validation: {
    enabled: boolean;
    isolation_level: 'high' | 'medium' | 'low';
    restrictions_applied: string[];
  };
  resource_limits_validation: {
    memory_check_passed: boolean;
    cpu_check_passed: boolean;
    file_size_check_passed: boolean;
    network_access_validated: boolean;
    filesystem_access_validated: boolean;
  };
  code_signing_validation: {
    signature_valid: boolean;
    certificate_valid: boolean;
    timestamp_valid: boolean;
    chain_of_trust_verified: boolean;
  };
  permissions_validation: {
    all_permissions_approved: boolean;
    unauthorized_permissions: string[];
    high_risk_permissions: string[];
  };
  vulnerabilities: SecurityVulnerabilitySchema[];
  recommendations: string[];
}

/**
 * 🛡️ 安全漏洞信息 (Schema格式)
 */
export interface SecurityVulnerabilitySchema {
  vulnerability_id: string;
  cve_id?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affected_components: string[];
  fix_available: boolean;
  fix_version?: string;
  mitigation_steps: string[];
}

/**
 * 🔧 资源限制验证请求 (Schema格式)
 */
export interface ResourceLimitsValidationRequestSchema {
  extension_id: string;
  max_memory_mb: number;
  max_cpu_percent: number;
  max_file_size_mb: number;
  network_access: boolean;
  file_system_access: 'none' | 'read_only' | 'sandbox' | 'full';
  execution_timeout_ms: number;
}

/**
 * 📋 权限验证请求 (Schema格式)
 */
export interface PermissionsValidationRequestSchema {
  extension_id: string;
  requested_permissions: ExtensionPermissionRequestSchema[];
  context_id: string;
  approval_required: boolean;
}

/**
 * 🔑 权限请求信息 (Schema格式)
 */
export interface ExtensionPermissionRequestSchema {
  permission: string;
  justification: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  auto_approved: boolean;
}

/**
 * 🔒 代码签名验证请求 (Schema格式)
 */
export interface CodeSigningValidationRequestSchema {
  extension_id: string;
  signature: string;
  certificate: string;
  timestamp: string;
  algorithm: string;
}

/**
 * 🛡️ 运行时安全监控请求 (Schema格式)
 */
export interface RuntimeSecurityMonitoringRequestSchema {
  extension_id: string;
  monitoring_duration_ms: number;
  resource_monitoring_enabled: boolean;
  permission_monitoring_enabled: boolean;
  network_monitoring_enabled: boolean;
}

/**
 * 📊 运行时安全监控结果 (Schema格式)
 */
export interface RuntimeSecurityMonitoringResultSchema {
  extension_id: string;
  monitoring_start_time: string;
  monitoring_end_time: string;
  security_violations: SecurityViolationSchema[];
  resource_usage: {
    peak_memory_mb: number;
    average_cpu_percent: number;
    file_operations_count: number;
    network_requests_count: number;
  };
  permission_usage: {
    permissions_used: string[];
    unauthorized_attempts: string[];
  };
  overall_security_status: 'secure' | 'warning' | 'violation' | 'critical';
}

/**
 * ⚠️ 安全违规信息 (Schema格式)
 */
export interface SecurityViolationSchema {
  violation_id: string;
  violation_type:
    | 'resource_limit'
    | 'permission_abuse'
    | 'network_violation'
    | 'sandbox_escape';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  detected_activity: string;
  mitigation_action: string;
}

/**
 * 🔐 Extension Security Service Interface
 *
 * 企业级安全管理核心接口
 * - 严格使用Schema格式 (snake_case) 作为输入输出
 * - 零技术债务要求 (禁止any类型)
 * - DDD架构 + 依赖注入模式
 */
export interface IExtensionSecurityService {
  /**
   * 🔍 综合安全验证
   *
   * 对扩展进行全面的安全检查，包括：
   * - 沙箱隔离验证
   * - 资源限制检查
   * - 权限验证
   * - 代码签名验证
   * - 漏洞扫描
   *
   * @param extensionData 扩展协议数据 (Schema格式)
   * @returns 综合安全验证结果
   */
  validateExtensionSecurity(
    extensionData: ExtensionProtocolSchema
  ): Promise<SecurityValidationResultSchema>;

  /**
   * 🛡️ 资源限制验证
   *
   * 验证扩展的资源使用限制配置是否安全合规
   *
   * @param resourceLimits 资源限制配置 (Schema格式)
   * @returns 资源限制验证结果
   */
  validateResourceLimits(
    resourceLimits: ResourceLimitsValidationRequestSchema
  ): Promise<SecurityValidationResultSchema>;

  /**
   * 🔑 权限验证
   *
   * 验证扩展请求的权限是否合理且已获得必要审批
   *
   * @param permissionsRequest 权限验证请求 (Schema格式)
   * @returns 权限验证结果
   */
  validatePermissions(
    permissionsRequest: PermissionsValidationRequestSchema
  ): Promise<SecurityValidationResultSchema>;

  /**
   * 🔒 代码签名验证
   *
   * 验证扩展的数字签名是否有效和可信
   *
   * @param codeSigningRequest 代码签名验证请求 (Schema格式)
   * @returns 代码签名验证结果
   */
  validateCodeSigning(
    codeSigningRequest: CodeSigningValidationRequestSchema
  ): Promise<SecurityValidationResultSchema>;

  /**
   * 🔍 漏洞扫描
   *
   * 对扩展进行安全漏洞扫描和分析
   *
   * @param extensionData 扩展协议数据 (Schema格式)
   * @returns 漏洞扫描结果
   */
  scanForVulnerabilities(
    extensionData: ExtensionProtocolSchema
  ): Promise<SecurityValidationResultSchema>;

  /**
   * 🛡️ 运行时安全监控
   *
   * 监控扩展运行时的安全行为和资源使用
   *
   * @param monitoringRequest 运行时监控请求 (Schema格式)
   * @returns 运行时安全监控结果
   */
  monitorRuntimeSecurity(
    monitoringRequest: RuntimeSecurityMonitoringRequestSchema
  ): Promise<RuntimeSecurityMonitoringResultSchema>;

  /**
   * 🚨 安全策略执行
   *
   * 根据安全验证结果执行相应的安全策略
   *
   * @param extensionId 扩展ID
   * @param validationResult 安全验证结果
   * @returns 策略执行结果
   */
  enforceSecurityPolicy(
    extensionId: string,
    validationResult: SecurityValidationResultSchema
  ): Promise<SecurityValidationResultSchema>;
}
