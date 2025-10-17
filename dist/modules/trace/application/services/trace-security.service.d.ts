import { TraceSecurityAudit, ComplianceResult, ComplianceStandard, DataRetentionPolicy, DataRetentionResult, TimeRange } from '../../types';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
export interface SecurityManager {
    validatePermission(userId: string, resource: string, action: string): Promise<boolean>;
}
export interface IAuditLogger {
    logAccessDenied(event: AccessEvent): Promise<void>;
    logAccessGranted(event: AccessEvent): Promise<void>;
    logError(event: ErrorEvent): Promise<void>;
    logDataProtection(event: DataProtectionEvent): Promise<void>;
    logDataRetention(event: DataRetentionEvent): Promise<void>;
}
export interface IDataProtector {
    encrypt(data: string): Promise<string>;
    decrypt(encryptedData: string): Promise<string>;
}
export interface AccessEvent {
    userId: string;
    resource: string;
    action: string;
    reason?: string;
    timestamp: Date;
}
export interface ErrorEvent {
    userId: string;
    resource: string;
    action: string;
    error: string;
    timestamp: Date;
}
export interface DataProtectionEvent {
    traceId: string;
    action: string;
    fieldsCount: number;
    timestamp: Date;
}
export interface DataRetentionEvent {
    policy: string;
    result: DataRetentionResult;
    timestamp: Date;
}
export declare class TraceSecurityService {
    private readonly traceRepository;
    private readonly securityManager?;
    private readonly auditLogger?;
    private readonly dataProtector?;
    constructor(traceRepository: ITraceRepository, securityManager?: SecurityManager | undefined, auditLogger?: IAuditLogger | undefined, dataProtector?: IDataProtector | undefined);
    validateTraceAccess(userId: string, traceId: string, action: string): Promise<boolean>;
    protectSensitiveData(traceId: string): Promise<void>;
    performComplianceCheck(traceId: string, standard: ComplianceStandard): Promise<ComplianceResult>;
    manageDataRetention(retentionPolicy: DataRetentionPolicy): Promise<DataRetentionResult>;
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