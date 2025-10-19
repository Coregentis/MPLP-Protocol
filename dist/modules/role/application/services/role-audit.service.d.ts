/**
 * Role审计服务
 *
 * @description 安全审计和合规检查服务，实现审计日志、合规检查、安全报告
 * @version 1.0.0
 * @layer 应用层 - 审计服务
 */
export interface AuditScope {
    modules?: string[];
    timeRange?: TimeRange;
    userIds?: string[];
    resources?: string[];
}
export interface TimeRange {
    startTime: Date;
    endTime: Date;
}
export interface SecurityAuditResult {
    auditId: string;
    scope: AuditScope;
    startTime: Date;
    endTime: Date;
    securityFindings: SecurityFinding[];
    complianceFindings: ComplianceFinding[];
    overallScore: number;
    recommendations: string[];
}
export interface SecurityFinding {
    id: string;
    type: 'weak_password' | 'expired_permission' | 'unusual_access' | 'privilege_escalation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedUsers: string[];
    recommendation: string;
    timestamp: Date;
}
export interface ComplianceFinding {
    id: string;
    standard: ComplianceStandard;
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'partial';
    description: string;
    remediation: string;
    timestamp: Date;
}
export interface ComplianceStandard {
    name: 'GDPR' | 'SOX' | 'ISO27001' | 'HIPAA';
    version: string;
}
export interface ComplianceResult {
    standard: ComplianceStandard;
    overallCompliance: number;
    findings: ComplianceFinding[];
    recommendations: string[];
}
export interface SecurityReport {
    reportId: string;
    type: SecurityReportType;
    generatedAt: Date;
    timeRange: TimeRange;
    summary: SecurityReportSummary;
    details: SecurityReportDetails;
}
export interface SecurityReportType {
    name: 'access_report' | 'compliance_report' | 'security_incidents' | 'user_activity';
    format: 'json' | 'pdf' | 'csv';
}
export interface SecurityReportSummary {
    totalEvents: number;
    securityIncidents: number;
    complianceViolations: number;
    topRisks: string[];
}
export interface SecurityReportDetails {
    events: AuditLogEntry[];
    metrics: SecurityMetrics;
    trends: SecurityTrend[];
}
export interface AuditLogEntry {
    eventId: string;
    eventType: string;
    userId: string;
    resource: string;
    action: string;
    granted: boolean;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}
export interface AuditLogQuery {
    startTime?: Date;
    endTime?: Date;
    userId?: string;
    eventType?: string;
    resource?: string;
    granted?: boolean;
    limit?: number;
    offset?: number;
}
export interface SecurityMetrics {
    totalAccesses: number;
    successfulAccesses: number;
    failedAccesses: number;
    uniqueUsers: number;
    topResources: Array<{
        resource: string;
        count: number;
    }>;
    securityEvents: number;
}
export interface SecurityTrend {
    date: string;
    accessCount: number;
    failureRate: number;
    securityIncidents: number;
}
export interface AuditData {
    users: unknown[];
    roles: unknown[];
    permissions: unknown[];
    accessLogs: AuditLogEntry[];
    securityEvents: unknown[];
}
export interface AuditRepository {
    saveAuditResult(result: SecurityAuditResult): Promise<void>;
    queryLogs(query: AuditLogQuery): Promise<AuditLogEntry[]>;
}
export interface ComplianceChecker {
    checkCompliance(standard: ComplianceStandard): Promise<ComplianceResult>;
}
export interface ReportGenerator {
    generateReport(type: SecurityReportType, data: unknown): Promise<SecurityReport>;
}
/**
 * 安全审计和合规检查服务
 * 职责：审计日志、合规检查、安全报告
 */
export declare class RoleAuditService {
    private readonly auditRepository;
    private readonly complianceChecker;
    private readonly reportGenerator;
    constructor(auditRepository: AuditRepository, complianceChecker: ComplianceChecker, reportGenerator: ReportGenerator);
    /**
     * 执行安全审计
     * @param auditScope 审计范围
     * @returns 安全审计结果
     */
    performSecurityAudit(auditScope: AuditScope): Promise<SecurityAuditResult>;
    /**
     * 执行合规检查
     * @param standard 合规标准
     * @returns 合规检查结果
     */
    performComplianceCheck(standard: ComplianceStandard): Promise<ComplianceResult>;
    /**
     * 生成安全报告
     * @param reportType 报告类型
     * @param timeRange 时间范围
     * @returns 安全报告
     */
    generateSecurityReport(reportType: SecurityReportType, timeRange: TimeRange): Promise<SecurityReport>;
    /**
     * 查询审计日志
     * @param query 查询条件
     * @returns 审计日志条目列表
     */
    queryAuditLogs(query: AuditLogQuery): Promise<AuditLogEntry[]>;
    /**
     * 获取安全指标
     * @param timeRange 时间范围
     * @returns 安全指标
     */
    getSecurityMetrics(timeRange: TimeRange): Promise<SecurityMetrics>;
    private collectAuditData;
    private performSecurityChecks;
    private performComplianceChecks;
    private calculateOverallScore;
    private generateRecommendations;
    private collectReportData;
    private getTopResources;
    private generateAuditId;
}
//# sourceMappingURL=role-audit.service.d.ts.map