/**
 * 追踪安全服务
 *
 * @description 提供追踪安全和合规功能，包括访问控制、数据保护、审计合规
 * @version 1.0.0
 * @layer 应用层 - 服务
 * @pattern 基于统一架构标准的企业级服务实现
 */
import { TraceSecurityAudit, ComplianceResult, ComplianceStandard, DataRetentionPolicy, DataRetentionResult, TimeRange } from '../../types';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
/**
 * 安全管理器接口
 */
export interface SecurityManager {
    validatePermission(userId: string, resource: string, action: string): Promise<boolean>;
}
/**
 * 审计日志记录器接口
 */
export interface IAuditLogger {
    logAccessDenied(event: AccessEvent): Promise<void>;
    logAccessGranted(event: AccessEvent): Promise<void>;
    logError(event: ErrorEvent): Promise<void>;
    logDataProtection(event: DataProtectionEvent): Promise<void>;
    logDataRetention(event: DataRetentionEvent): Promise<void>;
}
/**
 * 数据保护器接口
 */
export interface IDataProtector {
    encrypt(data: string): Promise<string>;
    decrypt(encryptedData: string): Promise<string>;
}
/**
 * 访问事件接口
 */
export interface AccessEvent {
    userId: string;
    resource: string;
    action: string;
    reason?: string;
    timestamp: Date;
}
/**
 * 错误事件接口
 */
export interface ErrorEvent {
    userId: string;
    resource: string;
    action: string;
    error: string;
    timestamp: Date;
}
/**
 * 数据保护事件接口
 */
export interface DataProtectionEvent {
    traceId: string;
    action: string;
    fieldsCount: number;
    timestamp: Date;
}
/**
 * 数据保留事件接口
 */
export interface DataRetentionEvent {
    policy: string;
    result: DataRetentionResult;
    timestamp: Date;
}
/**
 * 追踪安全服务
 *
 * @description 追踪安全和合规服务，职责：访问控制、数据保护、审计合规
 */
export declare class TraceSecurityService {
    private readonly traceRepository;
    private readonly securityManager?;
    private readonly auditLogger?;
    private readonly dataProtector?;
    constructor(traceRepository: ITraceRepository, securityManager?: SecurityManager | undefined, auditLogger?: IAuditLogger | undefined, dataProtector?: IDataProtector | undefined);
    /**
     * 验证追踪访问权限
     */
    validateTraceAccess(userId: string, traceId: string, action: string): Promise<boolean>;
    /**
     * 保护敏感数据
     */
    protectSensitiveData(traceId: string): Promise<void>;
    /**
     * 执行合规检查
     */
    performComplianceCheck(traceId: string, standard: ComplianceStandard): Promise<ComplianceResult>;
    /**
     * 数据保留管理
     */
    manageDataRetention(retentionPolicy: DataRetentionPolicy): Promise<DataRetentionResult>;
    /**
     * 安全审计
     */
    performSecurityAudit(timeRange: TimeRange): Promise<TraceSecurityAudit>;
    private identifySensitiveFields;
    private archiveTrace;
    private checkGDPRCompliance;
    private checkHIPAACompliance;
    private checkSOXCompliance;
    private collectSecurityAuditData;
    private performSecurityChecks;
    private performComplianceChecks;
    private calculateSecurityScore;
    private generateSecurityRecommendations;
    private generateAuditId;
}
//# sourceMappingURL=trace-security.service.d.ts.map