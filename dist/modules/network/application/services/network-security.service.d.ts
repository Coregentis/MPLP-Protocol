import { INetworkRepository } from '../../domain/repositories/network-repository.interface';
export interface SecurityPolicy {
    id: string;
    networkId: string;
    name: string;
    type: 'access_control' | 'encryption' | 'authentication' | 'audit';
    rules: SecurityRule[];
    enabled: boolean;
    priority: number;
    createdAt: string;
    updatedAt: string;
}
export interface SecurityRule {
    id: string;
    action: 'allow' | 'deny' | 'monitor';
    conditions: SecurityCondition[];
    description: string;
    enabled: boolean;
}
export interface SecurityCondition {
    field: string;
    operator: 'equals' | 'contains' | 'matches' | 'in' | 'not_in';
    value: string | string[];
}
export interface ThreatDetection {
    id: string;
    networkId: string;
    threatType: 'intrusion' | 'ddos' | 'malware' | 'data_breach' | 'unauthorized_access';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'investigating' | 'mitigated' | 'resolved';
    detectedAt: string;
    source: string;
    target: string;
    description: string;
    evidence: ThreatEvidence[];
    mitigation: MitigationAction[];
}
export interface ThreatEvidence {
    type: 'log' | 'network_traffic' | 'system_behavior' | 'user_activity';
    timestamp: string;
    data: Record<string, unknown>;
    confidence: number;
}
export interface MitigationAction {
    id: string;
    type: 'block_ip' | 'isolate_node' | 'rate_limit' | 'alert_admin' | 'log_activity';
    status: 'pending' | 'executed' | 'failed';
    executedAt?: string;
    result?: string;
}
export interface SecurityAudit {
    id: string;
    networkId: string;
    auditType: 'compliance' | 'vulnerability' | 'access_review' | 'policy_review';
    status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
    startedAt: string;
    completedAt?: string;
    findings: AuditFinding[];
    recommendations: string[];
    complianceScore: number;
}
export interface AuditFinding {
    id: string;
    category: 'vulnerability' | 'policy_violation' | 'access_issue' | 'configuration_error';
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    affectedComponents: string[];
    remediation: string;
    riskScore: number;
}
export interface AccessControl {
    networkId: string;
    permissions: NetworkPermission[];
    roles: SecurityRole[];
    sessions: ActiveSession[];
}
export interface NetworkPermission {
    id: string;
    resource: string;
    actions: string[];
    conditions: SecurityCondition[];
    grantedTo: string[];
}
export interface SecurityRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    members: string[];
}
export interface ActiveSession {
    id: string;
    userId: string;
    nodeId: string;
    startedAt: string;
    lastActivity: string;
    ipAddress: string;
    userAgent: string;
    authenticated: boolean;
    permissions: string[];
}
export declare class NetworkSecurityService {
    private readonly networkRepository;
    private securityPolicies;
    private threatDetections;
    private auditHistory;
    private accessControls;
    constructor(networkRepository: INetworkRepository);
    createSecurityPolicy(policy: Omit<SecurityPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityPolicy>;
    performThreatDetection(networkId: string): Promise<ThreatDetection[]>;
    performSecurityAudit(networkId: string, auditType: SecurityAudit['auditType']): Promise<SecurityAudit>;
    configureAccessControl(networkId: string, config: Partial<AccessControl>): Promise<AccessControl>;
    validateAccess(networkId: string, userId: string, resource: string, action: string): Promise<boolean>;
    getSecurityDashboard(networkId: string): Promise<{
        overview: {
            securityScore: number;
            threatLevel: 'low' | 'medium' | 'high' | 'critical';
            activePolicies: number;
            activeThreats: number;
            lastAudit: string;
        };
        threats: ThreatDetection[];
        policies: SecurityPolicy[];
        recentAudits: SecurityAudit[];
    }>;
    private detectUnauthorizedAccess;
    private detectAnomalousTraffic;
    private detectConfigurationVulnerabilities;
    private performComplianceAudit;
    private performVulnerabilityAudit;
    private performAccessReview;
    private performPolicyReview;
    private generateSecurityRecommendations;
    private calculateComplianceScore;
    private calculateThreatLevel;
    private calculateSecurityScore;
}
//# sourceMappingURL=network-security.service.d.ts.map