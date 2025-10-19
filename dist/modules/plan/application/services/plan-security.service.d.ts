/**
 * Plan安全服务 - 企业级安全管理
 *
 * @description 基于SCTM+GLFB+ITCM方法论设计的安全管理服务
 * 负责权限验证、访问控制、安全审计、数据保护和合规检查
 * @version 2.0.0
 * @layer 应用层 - 安全服务
 * @refactor 新增企业级服务，符合3服务架构标准
 */
import { UUID } from '../../../../shared/types';
export interface SecurityContext {
    userId: UUID;
    roles: string[];
    permissions: string[];
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}
export interface AccessRequest {
    userId: UUID;
    resource: 'plan' | 'task' | 'agent' | 'coordination';
    resourceId: UUID;
    action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'optimize';
    context?: Record<string, unknown>;
}
export interface AccessResult {
    granted: boolean;
    reason?: string;
    conditions?: string[];
    auditId: string;
}
export interface SecurityAuditEvent {
    eventId: string;
    timestamp: Date;
    userId: UUID;
    action: string;
    resource: string;
    resourceId: UUID;
    result: 'success' | 'failure' | 'denied';
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
}
export interface SecurityPolicy {
    policyId: string;
    name: string;
    type: 'access_control' | 'data_protection' | 'audit' | 'compliance';
    rules: Array<{
        condition: string;
        action: 'allow' | 'deny' | 'require_approval';
        priority: number;
    }>;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ComplianceCheck {
    standard: 'GDPR' | 'SOX' | 'HIPAA' | 'PCI_DSS' | 'ISO27001';
    requirements: Array<{
        requirement: string;
        status: 'compliant' | 'non_compliant' | 'partial';
        evidence?: string[];
        recommendations?: string[];
    }>;
    overallStatus: 'compliant' | 'non_compliant' | 'partial';
    lastChecked: Date;
}
export interface DataProtectionConfig {
    encryptionEnabled: boolean;
    encryptionAlgorithm: string;
    keyRotationInterval: number;
    dataRetentionPeriod: number;
    anonymizationRules: Array<{
        field: string;
        method: 'hash' | 'mask' | 'remove';
    }>;
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
/**
 * Plan安全服务
 *
 * @description 实现企业级安全管理，确保Plan模块的安全性和合规性
 * 职责：权限验证、访问控制、安全审计、数据保护、合规检查
 */
export declare class PlanSecurityService {
    private readonly logger;
    private readonly dataProtectionConfig;
    private readonly securityPolicies;
    private readonly auditEvents;
    private readonly activeSessions;
    constructor(logger: ILogger, dataProtectionConfig?: DataProtectionConfig);
    /**
     * 验证访问权限
     * 基于角色和权限的访问控制
     */
    validateAccess(request: AccessRequest, securityContext: SecurityContext): Promise<AccessResult>;
    /**
     * 创建安全会话
     */
    createSecuritySession(userId: UUID, roles: string[], permissions: string[]): Promise<SecurityContext>;
    /**
     * 验证会话有效性
     */
    validateSession(securityContext: SecurityContext): boolean;
    /**
     * 销毁安全会话
     */
    destroySession(sessionId: string): Promise<void>;
    /**
     * 添加安全策略
     */
    addSecurityPolicy(policy: SecurityPolicy): Promise<void>;
    /**
     * 应用安全策略
     */
    private applySecurityPolicies;
    /**
     * 执行合规检查
     */
    performComplianceCheck(standard: ComplianceCheck['standard']): Promise<ComplianceCheck>;
    /**
     * 加密敏感数据
     */
    encryptSensitiveData(data: Record<string, unknown>): Promise<string>;
    /**
     * 解密敏感数据
     */
    decryptSensitiveData(encryptedData: string): Promise<Record<string, unknown>>;
    /**
     * 记录审计事件
     */
    logAuditEvent(event: SecurityAuditEvent): Promise<void>;
    /**
     * 获取审计日志
     */
    getAuditEvents(userId?: UUID, startDate?: Date, endDate?: Date, limit?: number): Promise<SecurityAuditEvent[]>;
    /**
     * 初始化默认安全策略
     */
    private initializeDefaultPolicies;
    /**
     * 检查基本权限
     */
    private checkBasicPermission;
    /**
     * 检查资源访问权限
     */
    private checkResourceAccess;
    /**
     * 评估策略条件
     */
    private evaluateCondition;
    /**
     * 创建访问结果
     */
    private createAccessResult;
    /**
     * 获取合规要求
     */
    private getComplianceRequirements;
    /**
     * 检查单个合规要求
     */
    private checkRequirement;
}
//# sourceMappingURL=plan-security.service.d.ts.map